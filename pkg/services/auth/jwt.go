package auth

import (
	"gerenciador/pkg/id"
	"gerenciador/pkg/models"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/pkg/errors"
)

func (srv Service) NewJwtString(user *models.Admin) (string, error) {
	//todo extract from config
	expirationTime := time.Now().Add(time.Hour * 24 * 365)
	// Create the JWT claims, which includes the username and expiry time

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"_id":  user.ID,
		"user": user,
		"exp":  expirationTime,
		"iat":  time.Now().Unix(),
	})

	tokenString, err := token.SignedString(srv.jwtKey)
	if err != nil {
		// If there is an error in creating the JWT return an internal server error
		return "", err
	}
	return tokenString, nil
}

func (srv *Service) ValidateToken(tokenStr string) (*id.ID, error) {

	// Create the JWT claims, which includes the username and expiry time
	prefix := "Bearer "
	errMsg := "Invalid token. Maybe you forgot bearer prefix"
	if !strings.HasPrefix(tokenStr, prefix) {
		return nil, errors.New(errMsg)
	}
	tokenStr = strings.TrimPrefix(tokenStr, prefix)
	claims := jwt.MapClaims{}
	tkn, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return srv.jwtKey, nil
	})
	if err != nil {
		return nil, errors.Wrap(err, errMsg)
	}
	if !tkn.Valid {
		return nil, errors.New(errMsg)
	}

	idStr := claims["_id"].(string)
	id, err := id.FromString(idStr)
	if err != nil {
		return nil, err
	}

	return &id, nil
}
