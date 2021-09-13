package models

import (
	"log"

	"github.com/globalsign/mgo/bson"
	validation "github.com/go-ozzo/ozzo-validation"
	"github.com/go-ozzo/ozzo-validation/is"
)

type LoginForm struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (form LoginForm) Validate() (errs ValidationErrors) {
	err := validation.ValidateStruct(&form,
		//todo uncomment
		validation.Field(&form.Email, validation.Required, is.Email),
		validation.Field(&form.Password, validation.Required, validation.Length(5, 0)),
	)
	if err != nil {
		log.Println("validation error", err)
	}
	errs = OzzoValidation(err)
	return errs
}

func makeRegexBson(s string) bson.M {
	return bson.M{"$regex": bson.RegEx{Pattern: s, Options: "i"}}
}
