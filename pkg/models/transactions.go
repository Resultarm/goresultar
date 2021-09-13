package models

import (
	"gerenciador/pkg/id"
	ts "gerenciador/pkg/timestamp"

	"github.com/globalsign/mgo/bson"
	"github.com/pkg/errors"
)

var ErrTransactionNotFound = errors.New("transaction not found")

type TransactionsRepository interface {
	Find(spec Specification) ([]*Transaction, error)
	FindOne(spec Specification) (*Transaction, error)
	Save(order CreateTransactionCmd) (*Transaction, error)
	Update(spec Specification, upd interface{}) (*Transaction, error)
	Delete(spec Specification) error
	Count(spec Specification) (int, error)
	Remove(spec Specification) error
}
type Transaction struct {
	Id        id.ID        `json:"_id" bson:"_id"`
	OrderId   id.ID        `json:"orderId" bson:"orderId"`
	Method    uint         `json:"method" bson:"method"`
	Amount    float64      `json:"amount" bson:"amount"`
	FileLink  string       `json:"fileLink" bson:"fileLink"`
	Comment   string       `json:"comment" bson:"comment"`
	CreatedAt ts.Timestamp `json:"createdAt" bson:"createdAt"`
	ChequeID  id.ID        `json:"chequeId" bson:"chequeId,omitempty"`

	Cheque     *Cheque `json:"cheque,omitempty" bson:"cheque,omitempty"`
	ClientInfo *Client `json:"-" bson:"client"`
	Order      *Order  `json:"-" bson:"order"`
}
type Transactions []*Transaction

type CreateTransactionCmd struct {
	GenericTransactionForm `json:",inline" bson:",inline"`
	CreatedAt              ts.Timestamp `json:"createdAt" bson:"createdAt"`
}

func (cmd CreateTransactionCmd) Validate() ValidationErrors {
	return nil
}

type GenericTransactionForm struct {
	Id       id.ID   `json:"_id" bson:"_id,omitempty"`
	OrderId  id.ID   `bson:"orderId,omitempty"`
	Amount   float64 `json:"amount" bson:"amount"`
	FileLink string  `json:"fileLink" bson:"fileLink"`
	Comment  string  `json:"comment" bson:"comment,omitempty"`
	Method   uint    `json:"method" bson:"method"`
	ChequeID *id.ID  `json:"chequeId,omitempty" bson:"chequeId,omitempty"`
}

type FindTransactionQuery struct {
	OrderId id.ID

	Pagination
}

func (q FindTransactionQuery) Query() bson.M {
	query := bson.M{}

	//if q.Title != "" {
	//	query["title"] = makeRegexBson(q.Title)
	//}
	//if q.Description != "" {
	//	query["description"] = makeRegexBson(q.Description)
	//}
	if q.OrderId.Valid() {
		query["orderId"] = q.OrderId
	}

	return query
}
