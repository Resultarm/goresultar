package models

import (
	"gerenciador/pkg/id"
	ts "gerenciador/pkg/timestamp"

	"github.com/globalsign/mgo/bson"
)

type Mode string
type AccountType string
type ChequeStatus string

var CashMode Mode = "cash"
var DepositMode Mode = "deposit"

var PersonalAccount AccountType = "personal"
var BusinessAccount AccountType = "business"

var ChequeStatusNew ChequeStatus = "new"
var ChequeStatusGood ChequeStatus = "good"
var ChequeStatusCompensated ChequeStatus = "compensated"
var ChequeStatusCancelled ChequeStatus = "canceled"
var ChequeStatusReturned ChequeStatus = "returned"
var ChequeStatusOther ChequeStatus = "other"

type Cheque struct {
	ID        id.ID        `json:"_id" bson:"_id,omitempty"`
	CreatedAt ts.Timestamp `json:"createdAt,omitempty"`

	No              string       `json:"no" bson:"no"`
	Date            ts.Timestamp `json:"date" bson:"date"`
	AgencyNo        string       `json:"agencyNo" bson:"agencyNo"`
	AccountNo       string       `json:"accountNo" bson:"accountNo"`
	Amount          float64      `json:"amount" bson:"amount"`
	Holder          string       `json:"holder" bson:"holder"`
	To              string       `json:"to" bson:"to"`
	DestinationBank string       `json:"destinationBank" bson:"destinationBank"`
	DestinationName string       `json:"destinationName" bson:"destinationName"`
	DestinationDate ts.Timestamp `json:"destinationDate" bson:"destinationDate"`
	DepositMode     Mode         `json:"depositMode" bson:"depositMode"`
	AccountType     AccountType  `json:"accountType" bson:"accountType"`
	FrontImageURL   string       `json:"frontImageUrl" bson:"frontImageUrl"`
	BackImageURL    string       `json:"backImageUrl" bson:"backImageUrl"`
	Status          ChequeStatus `json:"status" bson:"status"`
	Comment         string       `json:"comment" bson:"comment"`

	OrganizationID id.ID `json:"organizationId" bson:"organizationId,omitempty"`
}

// https://stackoverflow.com/a/42343810
func (c *Cheque) SetBSON(raw bson.Raw) error {
	type my Cheque
	if err := raw.Unmarshal((*my)(c)); err != nil {
		return nil
	}
	c.CreatedAt.Time = c.ID.Time()
	return nil
}

func (c *Cheque) GetBSON() (interface{}, error) {
	if c.Status == "" {
		c.Status = ChequeStatusNew
	}

	type my Cheque
	return (*my)(c), nil
}
