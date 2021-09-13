package util

import (
	"errors"
	"math"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewLookupStage(from, localField, foreignField, as string) bson.M {
	return bson.M{
		"$lookup": bson.M{
			"from":         from,
			"localField":   localField,
			"foreignField": foreignField,
			"as":           as,
		},
	}
}

func NewUnwindStage(name string) bson.M {
	return bson.M{
		"$unwind": bson.M{
			"path":                       name,
			"preserveNullAndEmptyArrays": true,
		},
	}
}

var DepartmentsCollName = "departments"
var BrandsCollName = "brands"
var CategoriesCollName = "categories"
var SubcategoriesCollName = "subcategories"
var ProductsCollName = "products"
var ModelsCollName = "models"
var OrderCollName = "orders"
var ClientCollName = "clients"

var (
	ErrNotFound     = errors.New("resource not found")
	ErrNotModified  = errors.New("not modified")
	ErrUnauthorized = errors.New("invalid credentials")
)

func CheckModified(result *mongo.UpdateResult) error {
	if result.MatchedCount == 0 {
		return ErrNotFound
	}

	if result.ModifiedCount == 0 {
		return ErrNotModified
	}

	return nil
}

type NotEnoughStockError struct {
	Err string
}

func (e NotEnoughStockError) Error() string {
	return e.Err
}

func RoundDown(x float64) float64 {
	return math.Floor(x*100) / 100
}

func Round(x float64) float64 {
	return math.Round(x*100) / 100
}

func RoundUp(x float64) float64 {
	return math.Ceil(x*100) / 100
}
