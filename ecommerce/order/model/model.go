package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Product struct {
	Title    string  `json:"title" bson:"title"`
	Price    float64 `json:"price" bson:"price"`
	Quantity float64 `json:"quantity" bson:"amount"`
}

type Order struct {
	ID            primitive.ObjectID `json:"_id" bson:"_id"`
	CreatedAt     time.Time          `json:"createdAt" bson:"-"`
	Products      *[]Product         `json:"items" bson:"items"`
	Amount        float64            `json:"total" bson:"total"`
	Status        int                `json:"status" bson:"processStatus"`
	PaymentStatus int                `json:"paymentStatus" bson:"status"`
}

func (o *Order) UpdateWithTotal() float64 {
	var total float64
	for _, p := range *o.Products {
		total += p.Price * float64(p.Quantity)
	}
	o.Amount = total
	return total
}
