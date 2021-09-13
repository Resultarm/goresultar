package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type ID primitive.ObjectID

func (i ID) MarshalText() ([]byte, error) {
	return primitive.ObjectID(i).MarshalJSON()
}

type IDAndFloat map[ID]float64

type DepartmentProfit struct {
	ID     primitive.ObjectID `json:"_id" bson:"_id"`
	Profit float64            `json:"profit" bson:"profit"`
}
