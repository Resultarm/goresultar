package models

import (
	"encoding/json"
	"gerenciador/pkg/id"
	ts "gerenciador/pkg/timestamp"
	"math"

	"github.com/globalsign/mgo/bson"
	"github.com/pkg/errors"
	"golang.org/x/text/language"
	"golang.org/x/text/message"
)

var ErrOrderNotFound = errors.New("order not found")

type OrdersRepository interface {
	Find(spec Specification) ([]*Order, error)
	FindOne(spec Specification) (*Order, error)
	Save(order OrderRequest) (*Order, error)
	Update(spec Specification, upd interface{}) (*Order, error)
	UpdateStatus(spec Specification, upd interface{}) (*Order, error)
	UpdateProcessStatus(spec Specification, upd interface{}) (*Order, error)
	Count(spec Specification) (int, error)
	Statistics(spec Specification, productId id.ID) (*OrderStats, error)
	GetCountByProcessStatus(spec Specification) ([]CountByProcessStatus, error)
	GetAllOrderStatuses() (map[OrderProcessStatus]string, error)
	Remove(spec Specification) error
}

type Count struct {
	Label OrderProcessStatus `json:"label" bson:"_id"`
	Count uint               `json:"count"`
}

type CountByProcessStatus struct {
	ID     OrderProcessStatus `json:"id"`
	Status OrderProcessStatus `json:"status" bson:"_id"`
	Count  uint               `json:"count"`
}

func (c CountByProcessStatus) MarshalJSON() ([]byte, error) {
	t := map[string]interface{}{"status": c.Status.String(), "count": c.Count, "id": c.Status}
	return json.Marshal(t)
}

type Order struct {
	Id                id.ID              `json:"_id" bson:"_id"`
	ClientId          id.ID              `json:"clientId" bson:"clientId"`
	Items             []OrderItem        `json:"items" bson:"items"`
	Services          []OrderItem        `json:"services" bson:"services"`
	Comment           string             `json:"comment" bson:"comment"`
	Status            OrderStatus        `json:"status" bson:"status"`
	ProcessStatus     OrderProcessStatus `json:"processStatus" bson:"processStatus"`
	CreatedAt         ts.Timestamp       `json:"createdAt" bson:"createdAt"`
	OrderID           int                `json:"orderId" bson:"orderId"`
	UserID            id.ID              `json:"userId" bson:"userId"`
	User              *Admin             `json:"user" bson:"-"`
	EstConclusionDate ts.Timestamp       `json:"estConclusionDate" bson:"estConclusionDate"`
	Discount          float64            `json:"discount" bson:"discount"`
	Documents         []string           `json:"documents" bson:"documents"`
	OrganizationID    id.ID              `json:"organizationId" bson:"organizationId"`
	Organization      *Organization      `json:"organization" bson:"organization"`

	Client       *Client      `json:"-" bson:"client"`
	Transactions Transactions `json:"transactions" bson:"transactions"`
}

type OrderRequest struct {
	Id                id.ID              `json:"_id" bson:"_id"`
	ClientId          id.ID              `json:"clientId" bson:"clientId"`
	IsQuotation       bool               `json:"isQuotation" bson:"-"`
	Items             []OrderItem        `json:"items" bson:"items"`
	Comment           string             `json:"comment" bson:"comment"`
	Status            OrderStatus        `json:"status" bson:"status"`
	ProcessStatus     OrderProcessStatus `json:"processStatus" bson:"processStatus"`
	OrganizationID    id.ID              `json:"organizationId" bson:"organizationId"`
	UserID            id.ID              `json:"userId" bson:"userId"`
	OrderID           int                `json:"orderId" bson:"orderId"`
	EstConclusionDate ts.Timestamp       `json:"estConclusionDate" bson:"estConclusionDate"`
	Discount          float64            `json:"discount" bson:"discount"`

	PaidAmount     float64 `json:"paid" bson:"-"`
	PaymentMethod  uint    `json:"paymentMethod" bson:"-"`
	ProofOfPayment string  `json:"proofOfPayment" bson:"-"`
}

func (o OrderRequest) TotalPrice() float64 {
	var total float64
	for _, item := range o.Items {
		total += item.Amount * item.Price
	}
	if o.Discount > 0 {
		discountMoney := (total * o.Discount / 100)
		total = total - math.Floor(discountMoney*100)/100 // round to 2 decimal
	}
	total = math.Floor(total*100) / 100
	return total
}

type Orders []*Order

type MeasurementValue []float64

func (t MeasurementValue) MarshalJSON() ([]byte, error) {

	if t == nil {
		return json.Marshal([]float64{})
	}

	type Temp MeasurementValue
	return json.Marshal((Temp(t)))
}

type OrderItem struct {
	ProductId        id.ID            `json:"productId" bson:"productId"`
	Title            string           `json:"title" bson:"title"`
	Cost             float64          `json:"cost" bson:"cost"`
	Price            float64          `json:"price" bson:"price"`
	Amount           float64          `json:"amount" bson:"amount"`
	MeasurementValue MeasurementValue `json:"measurementValue" bson:"measurementValue"`
	Comment          string           `json:"comment" bson:"comment"`
}

type OrderService struct {
	ID     id.ID   `json:"_id" bson:"_id"`
	Title  string  `json:"title" bson:"title"`
	Price  float64 `json:"price" bson:"price"`
	Amount float64 `json:"amount" bson:"amount"`
}

type DeleteOrderForm struct {
	DeleteTrxs bool `json:"deleteTrxs"`
}
type OrderStatus int
type OrderProcessStatus int

const (
	//todo figure out whether should stick to one language
	OpenOrder OrderStatus = iota + 1
	PartialOrder
	ClosedOrder
	QuotationOrder
	CanceledOrder
)

var AllOrderProcessStatuses = map[OrderProcessStatus]string{StatusNew: StatusNew.String(),
	StatusPreparation:         StatusPreparation.String(),
	StatusProduction:          StatusProduction.String(),
	StatusQuality:             StatusQuality.String(),
	StatusReady:               StatusReady.String(),
	StatusComplete:            StatusComplete.String(),
	StatusPickedUpOrDelivered: StatusPickedUpOrDelivered.String(),
	StatusConcluded:           StatusConcluded.String(),
	StatusCanceled:            StatusCanceled.String(),
}

const (
	StatusNew OrderProcessStatus = iota + 1
	StatusPreparation
	StatusProduction
	StatusQuality
	StatusReady
	StatusComplete
	StatusPickedUpOrDelivered
	StatusConcluded
	StatusCanceled
)

func (stat OrderProcessStatus) String() string {

	switch stat {
	case StatusNew:
		return "Novo"
	case StatusPreparation:
		return "Prep."
	case StatusProduction:
		return "Prod."
	case StatusQuality:
		return "Qualidade"
	case StatusReady:
		return "Acabamento"
	case StatusComplete:
		return "Completa"
	case StatusPickedUpOrDelivered:
		return "Retirada | Entregue"
	case StatusConcluded:
		return "Concluida"
	case StatusCanceled:
		return "Cancelada"
	default:
		return ""
	}
}

func (stat OrderStatus) String() string {

	switch stat {
	case OpenOrder:
		return "Alberto"
	case PartialOrder:
		return "Parcial"
	case ClosedOrder:
		return "Liquidado"
	case QuotationOrder:
		return "Quotation"
	case CanceledOrder:
		return "Canceled"
	default:
		return "unknown status"
	}
}

func (o Order) FormatCurrencyFloat(valor float64) string {
	p := message.NewPrinter(language.BrazilianPortuguese)
	return p.Sprintf("R$ %.2f", valor)
}

func (o Order) FormatCurrencyInt(valor int) string {
	p := message.NewPrinter(language.BrazilianPortuguese)
	return p.Sprintf("R$ %.2f", float64(valor/100))
}

type FindOrderQuery struct {
	Id            id.ID              `json:"_id" bson:"_id"`
	Comment       string             `json:"comment" bson:"comment"`
	Status        OrderStatus        `json:"status" bson:"status"`
	ProcessStatus OrderProcessStatus `json:"processStatus" bson:"processStatus"`
	TimeRange     TimeRange
	TimeRangeID   *TimeRangeID

	TotalCost      float64 `json:"totalCost"`
	TotalUnits     int     `json:"totalUnits"`
	TotalPaid      float64 `json:"totalPaid"`
	OrganizationID []id.ID

	Pagination
	UserID id.ID `json:"userId"`
}

func (q FindOrderQuery) Query() bson.M {
	query := bson.M{}

	if q.Id.Valid() {
		query["_id"] = q.Id
	}
	if q.Status != 0 {
		query["status"] = q.Status
	}
	if q.Comment != "" {
		query["comment"] = makeRegexBson(q.Comment)
	}
	if q.TotalUnits != 0 {
		query["items"] = bson.M{"$size": q.TotalUnits}
	}

	if (q.TimeRange != TimeRange{}) {
		query["_id"] = q.TimeRange.IDQuery()
	}

	// if q.TimeRangeID != nil {
	// 	query["_id"] = q.TimeRange.Query()
	// }

	if len(q.OrganizationID) > 0 {
		var validIDs []id.ID
		for _, id := range q.OrganizationID {
			validIDs = append(validIDs, id)
		}
		query["organizationId"] = bson.M{"$in": validIDs}
	}

	if q.UserID.Valid() {
		query["userId"] = q.UserID
	}

	if q.ProcessStatus > 0 {
		query["processStatus"] = q.ProcessStatus
	}

	// if q.ClientFirstName != "" {
	// 	query["client.firstName"] = q.ClientFirstName
	// }

	// if q.ClientLastName != "" {
	// 	query["client.lastName"] = q.ClientLastName
	// }

	//if q.Title != "" {
	//	query["title"] = makeRegexBson(q.Title)
	//}
	//if q.Description != "" {
	//	query["description"] = makeRegexBson(q.Description)
	//}
	//if q.DepartmentId.Valid() {
	//	query["departmentId"] = q.DepartmentId
	//}

	return query
}

type OrderDto struct {
	Id            id.ID              `json:"_id" bson:"_id"`
	Items         []OrderItem        `json:"items" bson:"items"`
	Services      []OrderService     `json:"services" bson:"services"`
	Comment       string             `json:"comment" bson:"comment"`
	Status        OrderStatus        `json:"status" bson:"status"`
	ProcessStatus OrderProcessStatus `json:"processStatus" bson:"processStatus"`
	CreatedAt     ts.Timestamp       `json:"createdAt" bson:"createdAt"`
	ClientID      id.ID              `json:"clientId" bson:"clientId"`
	Client        *Client            `json:"client" bson:"-"`
	User          *Admin             `json:"user"`

	TotalCost         float64       `json:"totalCost"`
	TotalUnits        int           `json:"totalUnits"`
	TotalPaid         float64       `json:"totalPaid"`
	OrderID           int           `json:"orderId" bson:"orderId"`
	OrganizationID    id.ID         `json:"organizationId" bson:"organizationId"`
	Organization      *Organization `json:"organization" bson:"organization"`
	Transactions      Transactions  `json:"transactions"`
	EstConclusionDate ts.Timestamp  `json:"estConclusionDate" bson:"estConclusionDate"`
	Discount          float64       `json:"discount" bson:"discount"`
	Documents         []string      `json:"documents" bson:"documents"`
}

func (o Order) TotalCost() float64 {
	var total float64
	for _, item := range o.Items {
		measurementQuantity := 1.0
		for _, v := range item.MeasurementValue {
			measurementQuantity *= (v)
		}

		total += (measurementQuantity * item.Amount) * item.Cost
	}

	return total
}

func (o Order) TotalPrice() float64 {
	var total float64
	for _, item := range o.Items {
		measurementQuantity := 1.0
		for _, v := range item.MeasurementValue {
			measurementQuantity *= (v)
		}

		total += (measurementQuantity * item.Amount) * item.Price
	}
	discountMoney := (total * o.Discount / 100)
	total = total - math.Floor(discountMoney*100)/100 // round to 2 decimal
	return total
}
func (o Order) TotalPaid() float64 {
	var total float64
	for _, trx := range o.Transactions {
		total += trx.Amount
	}
	return total
}

func (o Order) TotalUnits() int {
	return len(o.Items)
}
