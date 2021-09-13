package models

type ProductUnit struct {
	Type   UnitDescriptionForm `json:"type" bson:"type"`
	Size   UnitDescriptionForm `json:"size" bson:"size"`
	Weight UnitDescriptionForm `json:"weight" bson:"weight"`
	Height UnitDescriptionForm `json:"height" bson:"height"`
	Width  UnitDescriptionForm `json:"width" bson:"width"`
	Length UnitDescriptionForm `json:"length" bson:"length"`
	Unit   UnitDescriptionForm `json:"unit" bson:"unit"`
}

type UnitDescriptionForm struct {
	Unit  int     `json:"unit"`
	Value float64 `json:"value"`
}

type UnitType int

const (
	Liter UnitType = iota + 1
	Milliliter
	Ounce
	Gallon
	Barrel
)

type UnitSize int

const (
	Millimeter UnitSize = iota + 1
	Centimeter
	Meter
	SquareMeter
	CubicMeter
	Inch
	Foot
)

type UnitWeight int

const (
	Milligram UnitWeight = iota + 1
	Gram
	Kilogram
	Tonne
)

type ProductStatus string

const (
	ProductActive   ProductStatus = "Available"
	ProductInactive ProductStatus = "Not Available"
	ProductOnHold   ProductStatus = "On Hold"
)

var ProductStatuses = []ProductStatus{ProductActive, ProductInactive, ProductOnHold}
