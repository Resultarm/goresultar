package model

import (
	"gerenciador/pkg/models"
	"gerenciador/time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderItem struct {
	ID               primitive.ObjectID `json:"productId" bson:"productId"`
	Title            string             `json:"title" bson:"title"`
	Cost             float64            `json:"cost" bson:"cost"`
	Price            float64            `json:"price" bson:"price"`
	Quantity         float64            `json:"amount" bson:"amount"`
	MeasurementValue []float64          `json:"measurementValue" bson:"measurementValue"`
	Comment          string             `json:"comment" bson:"comment"`
}

type OrderItems []OrderItem

func (items *OrderItems) GetQuantities() map[primitive.ObjectID]float64 {
	q := map[primitive.ObjectID]float64{}
	for _, i := range *items {
		measurementQuantity := 1.0
		for _, selectedMeasurementValue := range i.MeasurementValue {
			measurementQuantity *= selectedMeasurementValue
		}
		q[i.ID] += (measurementQuantity * i.Quantity)
	}

	return q
}

func (items *OrderItems) GetIDs() []primitive.ObjectID {
	var ids []primitive.ObjectID
	for _, i := range *items {
		ids = append(ids, i.ID)
	}

	return ids
}

type OrderRequest struct {
	ClientID          primitive.ObjectID        `json:"clientId" bson:"clientId"`
	IsQuotation       bool                      `json:"isQuotation" bson:"-"`
	Items             OrderItems                `json:"items" bson:"items"`
	Comment           string                    `json:"comment" bson:"comment"`
	Status            models.OrderStatus        `json:"status" bson:"status"`
	ProcessStatus     models.OrderProcessStatus `json:"-" bson:"processStatus"`
	OrganizationID    primitive.ObjectID        `json:"organizationId" bson:"organizationId"`
	CreatedBy         primitive.ObjectID        `json:"-" bson:"userId,omitempty"`  // not required for update
	OrderID           int                       `json:"-" bson:"orderId,omitempty"` // not required for update
	EstConclusionDate *time.Time                `json:"estConclusionDate,omitempty" bson:"estConclusionDate"`
	Discount          float64                   `json:"discount" bson:"discount"`

	PaidAmount     float64 `json:"paid" bson:"-"`
	PaymentMethod  uint    `json:"paymentMethod" bson:"-"`
	ProofOfPayment string  `json:"proofOfPayment" bson:"-"`
}

func (o *OrderRequest) GetItemQuantities() map[primitive.ObjectID]float64 {
	return o.Items.GetQuantities()
}

func (o *OrderRequest) GetItemIDs() []primitive.ObjectID {
	return o.Items.GetIDs()
}

type Order struct {
	ID                primitive.ObjectID        `json:"_id" bson:"_id"`
	ClientID          primitive.ObjectID        `json:"clientId" bson:"clientId"`
	IsQuotation       bool                      `json:"isQuotation" bson:"-"`
	Items             OrderItems                `json:"items" bson:"items"`
	Comment           string                    `json:"comment" bson:"comment"`
	Status            models.OrderStatus        `json:"status" bson:"status"`
	ProcessStatus     models.OrderProcessStatus `json:"processStatus" bson:"processStatus"`
	OrganizationID    primitive.ObjectID        `json:"organizationId" bson:"organizationId"`
	CreatedBy         primitive.ObjectID        `json:"userId" bson:"userId"`
	OrderID           int                       `json:"-" bson:"orderId"`
	EstConclusionDate time.Time                 `json:"estConclusionDate" bson:"estConclusionDate"`
	Discount          float64                   `json:"discount" bson:"discount"`

	PaidAmount     float64 `json:"paid" bson:"-"`
	PaymentMethod  uint    `json:"paymentMethod" bson:"-"`
	ProofOfPayment string  `json:"proofOfPayment" bson:"-"`
}

func (o *Order) GetItemQuantities() map[primitive.ObjectID]float64 {
	return o.Items.GetQuantities()
}
