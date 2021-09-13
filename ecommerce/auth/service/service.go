package service

import (
	"fmt"
	"time"

	"gerenciador/ecommerce/user/model"
	"gerenciador/ecommerce/user/repo"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/util"

	"github.com/dgrijalva/jwt-go"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

var ErrInvalidPassword = errors.New("invalid password")

type Service struct {
	repo  repo.Repository
	sugar []byte
}

func New(r resource.Resource, sugar []byte) Service {
	return Service{repo: repo.New(r), sugar: sugar}
}

func generateUserToken(u *model.User, sugar []byte) (string, error) {
	claims := jwt.MapClaims{}
	claims["_id"] = u.ID
	claims["email"] = u.Email
	claims["firstName"] = u.FirstName
	claims["lastName"] = u.LastName

	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(sugar)
}

func AuthCheck(sugar []byte, tokenStr string) (*model.User, error) {
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			msg := fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
			return nil, msg
		}
		return sugar, nil
	})

	if err != nil {
		return nil, errors.Wrap(err, "error parsing token")
	}

	if token == nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	userID, err := primitive.ObjectIDFromHex(claims["_id"].(string))
	if err != nil {
		return nil, errors.Wrap(err, "failed to parse user id")
	}
	user := model.User{
		ID:        userID,
		FirstName: claims["firstName"].(string),
		LastName:  claims["lastName"].(string),
	}
	return &user, nil
}

func (svc Service) Login(username string, password string) (string, error) {
	user, err := svc.repo.GetByEmail(username)
	fmt.Printf("%#v\n", user)
	if err != nil {
		if err == util.ErrNotFound {
			return "", ErrInvalidPassword
		}
		return "", err
	}
	valid := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) == nil

	if !valid {
		return "", ErrInvalidPassword
	}

	return generateUserToken(user, svc.sugar)
}
