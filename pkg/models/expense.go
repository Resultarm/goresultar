package models

import (
	"gerenciador/pkg/id"
	ts "gerenciador/pkg/timestamp"

	"github.com/globalsign/mgo/bson"
)

type FrequencyType string

const ExpenseFrequencyDaily FrequencyType = "daily"
const ExpenseFrequencyWeekly FrequencyType = "weekly"
const ExpenseFrequencyMonthly FrequencyType = "monthly"
const ExpenseFrequencyOnce FrequencyType = "once"
const ExpenseFrequencyCustom FrequencyType = "custom"

type ExpenseFrequency struct {
	Type  FrequencyType `json:"frequencyType" bson:"frequencyType"`
	Times uint          `json:"times" bson:"times"` //applicable when `Frequency` is `multiple`
}

type ExpensePaymentMethod string

const ExpensePaymentMethodDebitCard ExpensePaymentMethod = "debit card"
const ExpensePaymentMethodCreditCard ExpensePaymentMethod = "credit card"
const ExpensePaymentMethodCash ExpensePaymentMethod = "cash"
const ExpensePaymentMethodBoleto ExpensePaymentMethod = "boleto"
const ExpensePaymentMethodDeposit ExpensePaymentMethod = "deposit"

// type ExpensePaymentMethod struct {
// 	Type ExpensePaymentMethodType `json:"type" bson:"type"`
// }

type ExpenseInvoice struct {
	CreatedAt      ts.Timestamp `json:"createdAt,omitempty"`
	InvoiceFileURL string       `json:"url" bson:"url"`
}

func (c *ExpenseInvoice) GetBSON() (interface{}, error) {
	type my ExpenseInvoice
	if c.CreatedAt.IsZero() {
		c.CreatedAt = ts.Now()
	}
	return (*my)(c), nil
}

type ExpenseReceipt struct {
	CreatedAt      ts.Timestamp `json:"createdAt,omitempty" bson:"createdAt"`
	ReceiptFileURL string       `json:"url" bson:"url"`
}

func (c *ExpenseReceipt) GetBSON() (interface{}, error) {
	type my ExpenseReceipt
	if c.CreatedAt.IsZero() {
		c.CreatedAt = ts.Now()
	}
	return (*my)(c), nil
}

type Expense struct {
	ID        id.ID        `json:"_id" bson:"_id,omitempty"`
	CreatedAt ts.Timestamp `json:"createdAt,omitempty"`

	Name          string               `json:"name" bson:"name"`
	Description   string               `json:"description" bson:"description"`
	Type          string               `json:"type" bson:"type"`
	Fixed         bool                 `json:"fixed" bson:"fixed"`
	IssueDate     ts.Timestamp         `json:"issueDate" bson:"issueDate"`
	DueDate       ts.Timestamp         `json:"dueDate" bson:"dueDate"`
	Frequency     FrequencyType        `json:"frequency" bson:"frequency"`
	NumOfTimes    uint                 `json:"numTimes" bson:"numTimes"`
	Amount        float64              `json:"amount" bson:"amount"`
	LateFee       float64              `json:"lateFee" bson:"lateFee"`
	Invoices      []ExpenseInvoice     `json:"invoices" bson:"invoices"`
	Receipts      []ExpenseReceipt     `json:"receipts" bson:"receipts"`
	PaymentMethod ExpensePaymentMethod `json:"paymentMethod" bson:"paymentMethod"`
	ChequeIDs     []id.ID              `json:"chequeIds" bson:"chequeIds"`

	Cheques                   []Cheque          `json:"cheques" bson:"cheques"`
	DepartmentIDOfMoneySource *id.ID            `json:"moneySourceId" bson:"moneySourceId"`
	Payments                  []*ExpensePayment `json:"payments" bson:"payments,omitempty"`

	DepartmentOfMoneySource *Department `json:"moneySource" bson:"moneySource"`
	OrganizationID          id.ID       `json:"organizationId" bson:"organizationId,omitempty"`
}

// https://stackoverflow.com/a/42343810
func (c *Expense) SetBSON(raw bson.Raw) error {
	type my Expense
	if err := raw.Unmarshal((*my)(c)); err != nil {
		return nil
	}
	c.CreatedAt.Time = c.ID.Time()
	return nil
}

func (c *Expense) GetBSON() (interface{}, error) {

	type my Expense
	return (*my)(c), nil
}
