package models

import (
	"gerenciador/pkg/id"
	"gerenciador/pkg/timestamp"

	"github.com/globalsign/mgo/bson"
	"github.com/pkg/errors"
)

var ErrProductNotFound = errors.New("product not found")

type Product struct {
	ID                id.ID               `json:"_id" bson:"_id"`
	Title             string              `json:"title" bson:"title"`
	Description       string              `json:"description" bson:"description"`
	ISBN              string              `json:"ISBN" bson:"ISBN"`
	ImageURLs         []string            `json:"imageUrls" bson:"imageUrls"`
	Status            ProductStatus       `json:"status" bson:"status"`
	Cost              float64             `json:"cost" bson:"cost"`
	Price             float64             `json:"price" bson:"price"`
	TotalUnits        float64             `json:"totalUnits" bson:"totalUnits"`
	ProductUnit       ProductUnit         `json:"unit" bson:"unit"`
	Comment           string              `json:"comment" bson:"comment"`
	ProductIDs        []id.ID             `json:"productIds" bson:"productIds"`
	MinStockThreshold uint                `json:"minStockThreshold" bson:"minStockThreshold"`
	CostContribution  *[]CostContribution `json:"costContribution" bson:"costContribution"`
	MeasurementType   string              `json:"measurementType" bson:"measurementType"`
	MeasurementValue  []float64           `json:"measurementValue" bson:"measurementValue"`

	ProviderId    *id.ID `json:"providerId" bson:"providerId"` // optional
	DepartmentId  id.ID  `json:"departmentId" bson:"departmentId"`
	CategoryId    *id.ID `json:"categoryId" bson:"categoryId"`
	SubcategoryId *id.ID `json:"subcategoryId" bson:"subcategoryId"`
	BrandId       *id.ID `json:"brandId" bson:"brandId"` // optional for service
	ModelId       *id.ID `json:"modelId" bson:"modelId"` // optional for service

	Department  Department    `json:"department" bson:"department"`
	Category    *Category     `json:"category,omitempty" bson:"category"`
	SubCategory *SubCategory  `json:"subcategory,omitempty" bson:"subcategory"`
	Brand       Brand         `json:"brand" bson:"brand"`
	Model       *ProductModel `json:"model,omitempty" bson:"model"`

	CreatedAt timestamp.Timestamp `json:"createdAt" bson:"createdAt"`
	SellBy    timestamp.Timestamp `json:"sellBy" bson:"sellBy"`

	// Orders   Orders `json:"-" bson:"orders"`
	UnitType string `json:"unitType" bson:"unitType"`

	ChargeDuration string `json:"chargeDuration" bson:"chargeDuration"`
	IsService      bool   `json:"isService" bson:"isService"`

	OrganizationID id.ID `json:"organizationId" bson:"organizationId"`
}

type ProductsRepository interface {
	Find(spec Specification, includeDeleted bool) ([]*Product, error)
	FindOne(spec Specification, includeDeleted bool) (*Product, error)
	Save(product ProductRequest) error
	Update(spec Specification, upd interface{}) (*Product, error)
	DecQuantity(spec Specification, by float64) error
	Count(spec Specification) (int, error)
	Statistics(spec Specification) ([]AllProductStatistics, error)
	Remove(spec Specification) error
}

type ProductImage struct {
	Id      id.ID  `json:"_id" bson:"_id"`
	Link    string `json:"link"`
	Comment string `json:"comment"`
}

// func (p Product) AvailableInStock() float64 {
// 	var available = p.TotalUnits
// 	for _, order := range p.Orders {
// 		for _, item := range order.Items {
// 			if item.ProductId == p.ID {
// 				available -= item.Amount
// 			}
// 		}
// 	}
// 	return available
// }

type CreateProductRequest struct {
	ID             id.ID `bson:"_id"`
	ProductRequest `bson:",inline"`
	CreatedAt      timestamp.Timestamp `json:"createdAt"  bson:"createdAt"`
	OrganizationID id.ID               `json:"organizationId" bson:"organizationId"`
}

type UpdateProductForm struct {
	ProductRequest `bson:",inline"`

	SellBy timestamp.Timestamp `json:"updatedAt"`
}

type CostContribution struct {
	Name string  `json:"name" bson:"name"`
	Cost float64 `json:"value" bson:"value"`
}

type ProductRequest struct {
	Title             string              `json:"title" bson:"title"`
	Description       string              `json:"description" bson:"description"`
	ISBN              string              `json:"ISBN" bson:"ISBN"`
	Status            ProductStatus       `json:"status,omitempty" bson:"status,omitempty"` // status updated by sperate API
	Cost              float64             `json:"cost" bson:"cost"`
	Price             float64             `json:"price" bson:"price"`
	TotalUnits        float64             `json:"totalUnits" bson:"totalUnits"`
	ProductUnit       ProductUnit         `json:"unit" bson:"unit"`
	UnitType          string              `json:"unitType" bson:"unitType"`
	DepartmentId      id.ID               `json:"departmentId" bson:"departmentId"`
	CategoryId        *id.ID              `json:"categoryId,omitempty" bson:"categoryId"`
	SubcategoryId     *id.ID              `json:"subcategoryId,omitempty" bson:"subcategoryId"`
	BrandId           *id.ID              `json:"brandId,omitempty" bson:"brandId"` // optional for service
	ModelId           *id.ID              `json:"modelId,omitempty" bson:"modelId"` // optional for service
	ProviderID        *id.ID              `json:"providerId" bson:"providerId"`
	Comment           string              `json:"comment" bson:"comment"`
	IsService         bool                `json:"isService" bson:"isService"`
	ProductIDs        []id.ID             `json:"productIds" bson:"productIds"`
	MinStockThreshold uint                `json:"minStockThreshold" bson:"minStockThreshold"`
	OrganizationID    *id.ID              `json:"-" bson:"organizationId,omitempty"`
	ChargeDuration    string              `json:"chargeDuration" bson:"chargeDuration"`
	ImageURLs         []string            `json:"imageUrls" bson:"imageUrls"`
	CostContribution  *[]CostContribution `json:"costContribution" bson:"costContribution"`
}

func (form ProductRequest) Validate() (errs ValidationErrors) {
	//todo add product validation
	return nil

}

type FindProductQuery struct {
	Title          string
	Description    string
	ModelId        id.ID
	Status         ProductStatus
	OrganizationID []id.ID

	Pagination
}

func (q FindProductQuery) Query() bson.M {
	query := bson.M{}

	if q.Title != "" {
		query["title"] = makeRegexBson(q.Title)
	}
	if q.Description != "" {
		query["description"] = makeRegexBson(q.Description)
	}

	if q.ModelId.Valid() {
		query["modelId"] = q.ModelId
	}
	if q.Status != "" {
		query["status"] = q.Status
	}

	if len(q.OrganizationID) > 0 {
		var validIDs []id.ID
		for _, id := range q.OrganizationID {
			validIDs = append(validIDs, id)
		}
		query["organizationId"] = bson.M{"$in": validIDs}
	}

	return query
}

type ProductDto struct {
	ID               id.ID               `json:"_id" bson:"_id"`
	Title            string              `json:"title" bson:"title"`
	Description      string              `json:"description" bson:"description"`
	ISBN             string              `json:"ISBN" bson:"ISBN"`
	ImageURLs        []string            `json:"imageUrls" bson:"imageUrls"`
	Status           ProductStatus       `json:"status" bson:"status"`
	Cost             float64             `json:"cost" bson:"cost"`
	Price            float64             `json:"price" bson:"price"`
	TotalUnits       float64             `json:"totalUnits" bson:"totalUnits"`
	ProductUnit      ProductUnit         `json:"unit" bson:"unit"`
	UnitType         string              `json:"unitType" bson:"unitType"`
	Comment          string              `json:"comment" bson:"comment"`
	ProviderID       *id.ID              `json:"providerId" bson:"providerId"`
	CostContribution *[]CostContribution `json:"costContribution" bson:"costContribution"`
	MeasurementType  string              `json:"measurementType" bson:"measurementType"`
	MeasurementValue []float64           `json:"measurementValue" bson:"measurementValue"`
	ProductIDs       []id.ID             `json:"productIds" bson:"productIds"`

	Category    *Category     `json:"category"`
	SubCategory *SubCategory  `json:"subcategory"`
	Brand       *Brand        `json:"brand"`
	Department  *Department   `json:"department"`
	Model       *ProductModel `json:"model"`
	Provider    *Admin        `json:"provider"`

	Statistics ProductStatistics `json:"stats"`

	CreatedAt timestamp.Timestamp `json:"createdAt" bson:"createdAt"`
	SellBy    timestamp.Timestamp `json:"sellBy" bson:"sellBy"`

	IsService bool `json:"isService" bson:"isService"`
}

type ProductStatistics struct {
	TotalUnitsSold int       `json:"unitsSold"`
	OpenOrders     StatsUnit `json:"openOrders" bson:"open"`
	Closed         StatsUnit `json:"closed" bson:"closed"`
	Quotations     StatsUnit `json:"quotations" bson:"quotations"`
	Partial        StatsUnit `json:"partial" bson:"partial"`
}

type AllProductStatistics struct {
	TotalProducts int         `json:"total" bson:"totalCount"`
	TotalWorth    float64     `json:"worthPrice" bson:"worthPrice"`
	TotalCost     float64     `json:"worthCost" bson:"worthCost"`
	Department    *Department `json:"department" bson:"department"`
}
