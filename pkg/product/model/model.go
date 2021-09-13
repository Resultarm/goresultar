package model

import (
	"encoding/json"
	"gerenciador/pkg/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MeasurementValue []float64

func (t MeasurementValue) MarshalJSON() ([]byte, error) {

	if t == nil {
		return json.Marshal([]float64{})
	}

	type Temp MeasurementValue
	return json.Marshal((Temp(t)))
}

func (v *MeasurementValue) UnmarshalJSON(data []byte) error {
	if v == nil {
		temp := make(MeasurementValue, 0)
		v = &temp
		return nil
	}

	// https://stackoverflow.com/questions/52433467
	type Temp MeasurementValue
	var temp Temp
	if err := json.Unmarshal(data, &temp); err != nil {
		return nil
	}

	*v = MeasurementValue(temp)
	return nil

}

type kitProductRequest struct {
	ID               primitive.ObjectID `json:"_id" bson:"_id"`
	Title            string             `json:"title" bson:"title"`
	Quantity         float64            `json:"quantity" bson:"quantity"`
	Price            float64            `json:"price" bson:"price"`
	Cost             float64            `json:"cost" bson:"cost"`
	MeasurementValue MeasurementValue   `json:"measurementValue" bson:"measurementValue"`
}

type kitProductsRequest []kitProductRequest

func (items *kitProductsRequest) GetQuantities() map[primitive.ObjectID]float64 {
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

func (k kitProductsRequest) MarshalJSON() ([]byte, error) {
	if k == nil {
		return json.Marshal(make(kitProductsRequest, 0))
	}

	type tempKPs kitProductsRequest
	return json.Marshal((tempKPs(k)))
}

func (k *kitProductsRequest) UnmarshalJSON(data []byte) error {
	if k == nil {
		temp := make(kitProductsRequest, 0)
		k = &temp
		return nil
	}

	// https://stackoverflow.com/questions/52433467
	type tempKPs kitProductsRequest
	var temp tempKPs
	if err := json.Unmarshal(data, &temp); err != nil {
		return nil
	}

	*k = kitProductsRequest(temp)
	return nil

}

type MeasurementType string

const MEASUREMENT_TYPE_UNIT MeasurementType = "unit"
const MEASUREMENT_TYPE_LINEAR_METER MeasurementType = "linearMeter"
const MEASUREMENT_TYPE_SQUARE_METER MeasurementType = "squareMeter"
const MEASUREMENT_TYPE_CUBIC_METER MeasurementType = "cubicMeter"

type ProductRequest struct {
	Title             string                     `json:"title" bson:"title"`
	Description       string                     `json:"description" bson:"description"`
	ISBN              string                     `json:"ISBN" bson:"ISBN"`
	Status            models.ProductStatus       `json:"-" bson:"status,omitempty"` // omitempty -> update case
	Cost              float64                    `json:"cost" bson:"cost"`
	Price             float64                    `json:"price" bson:"price"`
	MeasurementType   MeasurementType            `json:"measurementType" bson:"measurementType"`
	MeasurementValue  []float64                  `json:"measurementValue" bson:"measurementValue"`
	TotalUnits        float64                    `json:"totalUnits" bson:"totalUnits"`
	ProductUnit       models.ProductUnit         `json:"unit" bson:"unit"`
	UnitType          string                     `json:"unitType" bson:"unitType"`
	DepartmentID      primitive.ObjectID         `json:"departmentId" bson:"departmentId"`
	CategoryID        *primitive.ObjectID        `json:"categoryId,omitempty" bson:"categoryId"`
	SubcategoryID     *primitive.ObjectID        `json:"subcategoryId,omitempty" bson:"subcategoryId"`
	BrandID           *primitive.ObjectID        `json:"brandId,omitempty" bson:"brandId"` // optional for service
	ModelID           *primitive.ObjectID        `json:"modelId,omitempty" bson:"modelId"` // optional for service
	ProviderID        *primitive.ObjectID        `json:"providerId" bson:"providerId"`
	Comment           string                     `json:"comment" bson:"comment"`
	IsService         bool                       `json:"isService" bson:"isService"`
	KitItems          kitProductsRequest         `json:"kitProducts" bson:"kitProducts"`
	MinStockThreshold uint                       `json:"minStockThreshold" bson:"minStockThreshold"`
	OrganizationID    *primitive.ObjectID        `json:"-" bson:"organizationId,omitempty"` // omitempty -> update case
	ChargeDuration    string                     `json:"chargeDuration" bson:"chargeDuration"`
	ImageURLs         []string                   `json:"imageUrls" bson:"imageUrls"`
	CostContribution  *[]models.CostContribution `json:"costContribution" bson:"costContribution"`
}

type Product struct {
	ID                primitive.ObjectID         `json:"_id" bson:"_id"`
	Title             string                     `json:"title" bson:"title"`
	Description       string                     `json:"description" bson:"description"`
	ISBN              string                     `json:"ISBN" bson:"ISBN"`
	Status            models.ProductStatus       `json:"status" bson:"status"`
	Cost              float64                    `json:"cost" bson:"cost"`
	Price             float64                    `json:"price" bson:"price"`
	MeasurementType   MeasurementType            `json:"measurementType" bson:"measurementType"`
	MeasurementValue  MeasurementValue           `json:"measurementValue" bson:"measurementValue"`
	TotalUnits        float64                    `json:"totalUnits" bson:"totalUnits"`
	ProductUnit       models.ProductUnit         `json:"unit" bson:"unit"`
	UnitType          string                     `json:"unitType" bson:"unitType"`
	DepartmentID      primitive.ObjectID         `json:"departmentId" bson:"departmentId"`
	CategoryID        *primitive.ObjectID        `json:"categoryId" bson:"categoryId"`
	SubcategoryID     *primitive.ObjectID        `json:"subcategoryId" bson:"subcategoryId"`
	BrandID           *primitive.ObjectID        `json:"brandId" bson:"brandId"`
	ModelID           *primitive.ObjectID        `json:"modelId" bson:"modelId"`
	ProviderID        *primitive.ObjectID        `json:"providerId" bson:"providerId"`
	Comment           string                     `json:"comment" bson:"comment"`
	IsService         bool                       `json:"isService" bson:"isService"`
	KitItems          kitProductsRequest         `json:"kitProducts" bson:"kitProducts"`
	MinStockThreshold uint                       `json:"minStockThreshold" bson:"minStockThreshold"`
	OrganizationID    *primitive.ObjectID        `json:"organizationId" bson:"organizationId"`
	ChargeDuration    string                     `json:"chargeDuration" bson:"chargeDuration"`
	ImageURLs         []string                   `json:"imageUrls" bson:"imageUrls"`
	CostContribution  *[]models.CostContribution `json:"costContribution" bson:"costContribution"`

	Department  Department   `json:"department" bson:"department"`
	Category    *Category    `json:"category" bson:"category"`
	SubCategory *SubCategory `json:"subcategory" bson:"subcategory"`
	Brand       Brand        `json:"brand" bson:"brand"`
	Model       Model        `json:"model" bson:"model"`
}

type Quantity struct {
	ID       primitive.ObjectID `bson:"_id"`
	Quantity float64            `bson:"totalUnits"`
}

type Department struct {
	ID             primitive.ObjectID `json:"_id" bson:"_id"`
	Title          string             `json:"title" bson:"title"`
	Description    string             `json:"description" bson:"description"`
	OrganizationID primitive.ObjectID `json:"organizationId" bson:"organizationId"`
}

type Category struct {
	ID             primitive.ObjectID `json:"_id" bson:"_id"`
	Title          string             `json:"title" bson:"title"`
	Description    string             `json:"description" bson:"description"`
	DepartmentID   primitive.ObjectID `json:"departmentId" bson:"departmentId"`
	OrganizationID primitive.ObjectID `json:"organizationId" bson:"organizationId"`
}

type SubCategory struct {
	ID             primitive.ObjectID `json:"_id" bson:"_id"`
	Title          string             `json:"title" bson:"title"`
	Description    string             `json:"description" bson:"description"`
	CategoryID     primitive.ObjectID `json:"categoryId" bson:"categoryId"`
	OrganizationID primitive.ObjectID `json:"organizationId" bson:"organizationId"`
}

type Brand struct {
	ID             primitive.ObjectID `json:"_id" bson:"_id"`
	Title          string             `json:"title" bson:"title"`
	Description    string             `json:"description" bson:"description"`
	OrganizationID primitive.ObjectID `json:"organizationId" bson:"organizationId"`
}
type Model struct {
	ID             primitive.ObjectID `json:"_id" bson:"_id"`
	Title          string             `json:"title" bson:"title"`
	Description    string             `json:"description" bson:"description"`
	BrandID        primitive.ObjectID `json:"brandId" bson:"brandId"`
	OrganizationID primitive.ObjectID `json:"organizationId" bson:"organizationId"`
}
