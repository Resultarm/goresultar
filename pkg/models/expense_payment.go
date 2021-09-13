package models

import (
	"gerenciador/pkg/id"
	ts "gerenciador/pkg/timestamp"

	"github.com/globalsign/mgo/bson"
)

type ExpensePayment struct {
	ID             id.ID        `json:"_id" bson:"_id,omitempty"`
	OrganizationID id.ID        `json:"organizationId" bson:"organizationId,omitempty"`
	CreatedAt      ts.Timestamp `json:"createdAt,omitempty"`

	ExpenseID id.ID            `json:"expenseId" bson:"expenseId"`
	Method    string           `json:"method" bson:"method"`
	Amount    float64          `json:"amount" bson:"amount"`
	ChequeIDs []id.ID          `json:"chequeIds" bson:"chequeIds"`
	Invoices  []ExpenseInvoice `json:"invoices" bson:"invoices"`
	Receipts  []ExpenseReceipt `json:"receipts" bson:"receipts"`

	Cheques []*Cheque `json:"cheques,omitempty" bson:"cheques,omitempty"`
}

type ExpensePaymentQuery struct {
	OrganizationID []id.ID
	ExpenseID      id.ID
}

func (q ExpensePaymentQuery) Query() bson.M {
	query := bson.M{}

	if len(q.OrganizationID) > 0 {
		var validIDs []id.ID
		for _, id := range q.OrganizationID {
			validIDs = append(validIDs, id)
		}
		query["organizationId"] = bson.M{"$in": validIDs}
	}

	if q.ExpenseID.Valid() {
		query["expenseId"] = q.ExpenseID
	}

	return query
}
