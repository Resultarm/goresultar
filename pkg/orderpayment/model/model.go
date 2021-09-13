package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderPaymentRequest struct {
	OrderID        primitive.ObjectID  `json:"orderId" bson:"orderId"`
	Method         uint                `json:"method" bson:"method"`
	Amount         float64             `json:"amount" bson:"amount"`
	ProofURL       string              `json:"fileLink" bson:"fileLink"`
	Comment        string              `json:"comment" bson:"comment"`
	ChequeID       *primitive.ObjectID `json:"chequeId" bson:"chequeId"`
	OrganizationID primitive.ObjectID  `json:"-" bson:"organizationId"`
}

type OrderPayment struct {
	ID             primitive.ObjectID  `json:"_id" bson:"_id"`
	OrderID        primitive.ObjectID  `json:"orderId" bson:"orderId"`
	Method         uint                `json:"method" bson:"method"`
	Amount         float64             `json:"amount" bson:"amount"`
	ProofURL       string              `json:"fileLink" bson:"fileLink"`
	Comment        string              `json:"comment" bson:"comment"`
	ChequeID       *primitive.ObjectID `json:"chequeId" bson:"chequeId"`
	OrganizationID primitive.ObjectID  `json:"-" bson:"organizationId"`
}
