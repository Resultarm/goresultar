package auth

import (
	"fmt"
	"gerenciador/pkg/log"
	"gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/settings"
	"gerenciador/pkg/util"
	"math/rand"

	"golang.org/x/crypto/bcrypt"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "AuthService",
		Instance: &Service{},
		Priority: registry.Low,
	})
}

type Service struct {
	Userrepo models.AdminsRepository `inject:""`
	Cfg      *settings.Config        `inject:""`
	log      log.Logger
	jwtKey   []byte
}

func (srv *Service) Init() error {
	srv.jwtKey = []byte(srv.Cfg.JwtKey)
	srv.log = log.New("AuthService")

	return nil
}

func (srv Service) Authenticate(email, password string) (string, error) {

	user, err := srv.Userrepo.GetByEmail(email)
	fmt.Printf("%#v", user)
	if err != nil {
		if err == util.ErrNotFound {
			return "", util.ErrUnauthorized
		}
		return "", err
	}

	fmt.Println("password", password)
	if !validate(user.Password, password) {
		fmt.Println("validation failed")
		return "", util.ErrUnauthorized
	}

	token, err := srv.NewJwtString(user)
	return token, err
}

const symbols = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

func Encode(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 8)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func validate(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func Generate(l int) string {
	b := make([]byte, l)
	for i := range b {
		b[i] = symbols[rand.Int63()%int64(len(symbols))]
	}
	return string(b)
}
