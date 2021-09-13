package model

import (
	"context"
	"gerenciador/ecommerce/util"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID       primitive.ObjectID `json:"_id" bson:"_id"`
	Email    string             `json:"email" bson:"email"`
	Password string             `json:"-" bson:"password"`

	FirstName    string `json:"firstName" bson:"firstName"`
	LastName     string `json:"lastName" bson:"lastName"`
	MobileNumber string `json:"mobileNumber" bson:"mobileNumber"`
}

func FromCtx(ctx context.Context) (*User, bool) {
	u, ok := ctx.Value(util.UserKey).(*User)
	return u, ok
}
