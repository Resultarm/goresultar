package service

import (
	"context"
	"errors"
	"fmt"
	"gerenciador/pkg/models"
	"gerenciador/pkg/product/model"
	"gerenciador/pkg/product/repo"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/util"
	util2 "gerenciador/pkg/util"
	"math"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Service struct {
	repo repo.Repository
}

func New(r resource.Resource) Service {
	return Service{repo: repo.New(r)}
}

var MEASUREMENT_VALUE_LENGTHS = map[model.MeasurementType]int{
	model.MEASUREMENT_TYPE_LINEAR_METER: 1,
	model.MEASUREMENT_TYPE_SQUARE_METER: 2,
	model.MEASUREMENT_TYPE_CUBIC_METER:  3,
}

func Validate(payload *model.ProductRequest) error {
	expectedSize := MEASUREMENT_VALUE_LENGTHS[payload.MeasurementType]

	if expectedSize != len(payload.MeasurementValue) {
		return fmt.Errorf("expected length for %s is %d, but got %d", payload.MeasurementType, expectedSize, len(payload.MeasurementValue))
	}

	return nil
}

func calculateKitQuantity(productRequest *model.ProductRequest, quantities *[]model.Quantity) (float64, error) {
	var quantity float64 = math.MaxFloat64
	for kid, kq := range productRequest.KitItems.GetQuantities() {
		for _, q := range *quantities {
			if q.ID == kid {
				quantity = math.Min(quantity, q.Quantity/kq)
			}
		}
	}

	if quantity == math.MaxFloat64 {
		return 0, errors.New("quantity equals to max number")
	}

	return util.RoundDown(quantity), nil
}

func (svc Service) Add(ctx context.Context, payload *model.ProductRequest) (*primitive.ObjectID, error) {

	payload.Status = models.ProductActive

	if payload.MeasurementType == "" {
		payload.MeasurementType = model.MEASUREMENT_TYPE_UNIT
	}

	if payload.MeasurementType == model.MEASUREMENT_TYPE_UNIT {
		payload.MeasurementValue = []float64{}
	}

	if len(payload.KitItems) > 0 {

		var kpIDs []primitive.ObjectID
		for _, kp := range payload.KitItems {
			kpIDs = append(kpIDs, kp.ID)
		}
		quantities, err := svc.repo.GetQuantityBulk(ctx, &kpIDs)
		if err != nil {
			return nil, err
		}

		if quantity, err := calculateKitQuantity(payload, quantities); err != nil {
			return nil, err
		} else {
			payload.TotalUnits = quantity
		}

	}

	return svc.repo.Add(ctx, payload)
}

func (svc Service) GetAll(ctx context.Context, spec util2.Specification) (*[]model.Product, error) {
	return svc.repo.GetAll(ctx, spec)
}

func (svc Service) Get(ctx context.Context, id *primitive.ObjectID) (*model.Product, error) {
	return svc.repo.Get(ctx, id)
}

func (svc Service) Update(ctx context.Context, id *primitive.ObjectID, payload *model.ProductRequest) error {
	if len(payload.KitItems) > 0 {

		var kpIDs []primitive.ObjectID
		for _, kp := range payload.KitItems {
			kpIDs = append(kpIDs, kp.ID)
		}
		quantities, err := svc.repo.GetQuantityBulk(ctx, &kpIDs)
		if err != nil {
			return err
		}

		if quantity, err := calculateKitQuantity(payload, quantities); err != nil {
			return err
		} else {
			payload.TotalUnits = quantity
		}

	}

	return svc.repo.Update(ctx, id, payload)
}

func (svc Service) Dec(ctx context.Context, by float64) error {
	return svc.repo.Dec(ctx, by)
}

func (svc Service) DecBulk(ctx context.Context, values map[primitive.ObjectID]float64) error {
	return svc.repo.DecBulk(ctx, values)
}

func (svc Service) GetKitsBulk(ctx context.Context, ids []primitive.ObjectID) ([]*model.Product, error) {
	return svc.repo.GetKitsBulk(ctx, ids)
}

func (svc Service) CheckEnoughStock(ctx context.Context, values map[primitive.ObjectID]float64) error {
	return svc.repo.CheckEnoughStock(ctx, values)
}
