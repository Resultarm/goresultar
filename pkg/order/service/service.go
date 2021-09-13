package service

import (
	"context"
	"errors"
	"fmt"
	"gerenciador/ecommerce/util"
	"gerenciador/pkg/models"
	"gerenciador/pkg/order/model"
	"gerenciador/pkg/order/repo"
	orderpaymentmodel "gerenciador/pkg/orderpayment/model"
	orderpaymentservice "gerenciador/pkg/orderpayment/service"
	productmodel "gerenciador/pkg/product/model"
	productservice "gerenciador/pkg/product/service"
	"gerenciador/pkg/resource"
	util2 "gerenciador/pkg/util"
	"math"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Service struct {
	rsrc       *resource.Resource
	repo       repo.Repository
	productsvc productservice.Service
	paymentsvc orderpaymentservice.Service
}

func New(r *resource.Resource) Service {
	return Service{rsrc: r, repo: repo.New(*r), productsvc: productservice.New(*r), paymentsvc: orderpaymentservice.New(*r)}
}

func (svc Service) Get(ctx context.Context, id primitive.ObjectID) (*model.Order, error) {
	return svc.repo.Get(ctx, id)
}

func (svc Service) Place(ctx context.Context, payload *model.OrderRequest) (*primitive.ObjectID, error) {
	// u := ctx.Value(util.UserKey).(*models.Admin)
	// fmt.Println("u: ", u)
	// fmt.Println("u.Role.Name", u.Role.Name)
	// allowed, err := svc.rsrc.Enforcer.Enforce(u.Role.Name, "order", "write")
	// if err != nil {
	// 	return nil, err
	// }
	// if !allowed {
	// 	return nil, errors.New("not allowed")
	// }

	organizationID, err := util.GetOrganizationIDv2FromCtx(ctx)
	if err != nil {
		return nil, err
	}

	userID, err := util.GetUserIDFromCtx(ctx)
	if err != nil {
		return nil, err
	}

	if payload.IsQuotation {
		payload.Status = models.QuotationOrder
	} else {
		payload.Status = models.OpenOrder
		payload.ProcessStatus = models.StatusNew
	}

	products, err := svc.GetProducts(ctx, payload.GetItemIDs())
	if err != nil {
		return nil, fmt.Errorf("failed to get order products <- %s", err)
	}

	for _, p := range *products {
		for _, orderItem := range payload.Items {
			if p.ID == orderItem.ID && p.MeasurementType == productmodel.MEASUREMENT_TYPE_UNIT {
				orderItem.MeasurementValue = []float64{}
			}
		}
	}

	orderTotal := GetOrderTotal(products, payload)

	if payload.PaidAmount > 0 {
		if payload.PaymentMethod < 1 {
			return nil, errors.New("payment method required")
		}

		if payload.PaidAmount < orderTotal {
			payload.Status = models.PartialOrder
		} else if payload.PaidAmount == orderTotal {
			payload.Status = models.ClosedOrder
		} else {
			return nil, fmt.Errorf("paid amount: %g can't be greater than order total: %g", payload.PaidAmount, orderTotal)
		}
	}

	payload.CreatedBy = *userID
	payload.OrganizationID = *organizationID

	id, err := svc.repo.Create(ctx, payload)
	if err != nil {
		return nil, err
	}

	if payload.PaidAmount > 0 {
		orderPaymentRequest := orderpaymentmodel.OrderPaymentRequest{
			OrderID:  *id,
			Amount:   payload.PaidAmount,
			Method:   payload.PaymentMethod,
			ProofURL: payload.ProofOfPayment,
		}

		_, err := svc.paymentsvc.Add(ctx, &orderPaymentRequest)
		if err != nil {
			return nil, err
		}
	}

	if !payload.IsQuotation {
		productQuantities := payload.GetItemQuantities()
		if err := svc.hasEnoughStock(ctx, productQuantities); err != nil {
			return nil, err
		}

		err = svc.productsvc.DecBulk(ctx, productQuantities)
		if err != nil {
			return nil, err
		}
	}

	return id, nil
}

func (svc *Service) GetProducts(ctx context.Context, ids []primitive.ObjectID) (*[]productmodel.Product, error) {
	filter := util2.NewQuery(bson.M{"_id": bson.M{"$in": ids}})
	return svc.productsvc.GetAll(ctx, filter)
}

func GetOrderTotal(products *[]productmodel.Product, payload *model.OrderRequest) float64 {
	var total float64

	quantities := payload.GetItemQuantities()

	for _, p := range *products {
		for id, q := range quantities {
			if id == p.ID {
				total += (q * p.Price)
			}
		}
	}

	discountMoney := (total * payload.Discount / 100)
	total = total - math.Floor(discountMoney*100)/100 // round to 2 decimal
	return total
}

func (svc *Service) UnwrapQuantities(ctx context.Context, quantities map[primitive.ObjectID]float64) (map[primitive.ObjectID]float64, error) {
	var ids []primitive.ObjectID
	for id, _ := range quantities {
		ids = append(ids, id)
	}
	kits, err := svc.productsvc.GetKitsBulk(ctx, ids)
	if err != nil {
		return nil, err
	}

	for _, kit := range kits {
		for _, p := range kit.KitItems {
			measurementValue := 1.0
			for _, v := range p.MeasurementValue {
				measurementValue *= v
			}
			quantities[p.ID] += (quantities[kit.ID] * measurementValue * p.Quantity)
		}
	}

	return quantities, nil
}

func (svc *Service) hasEnoughStock(ctx context.Context, quantities map[primitive.ObjectID]float64) error {
	quantities, err := svc.UnwrapQuantities(ctx, quantities)
	if err != nil {
		return err
	}

	fmt.Printf("modifiedQuantites %#v\n", quantities)

	if err := svc.productsvc.CheckEnoughStock(ctx, quantities); err != nil {
		return err
	}

	return nil
}

func (svc Service) Update(ctx context.Context, id primitive.ObjectID, payload *model.OrderRequest) error {

	if !payload.IsQuotation {

		existingOrder, err := svc.Get(ctx, id)
		if err != nil {
			return err
		}

		quantityDiff := map[primitive.ObjectID]float64{}
		for id, q := range payload.GetItemQuantities() {
			quantityDiff[id] += q
		}
		for id, q := range existingOrder.GetItemQuantities() {
			quantityDiff[id] -= q
		}

		if err := svc.hasEnoughStock(ctx, quantityDiff); err != nil {
			return err
		}

		err = svc.productsvc.DecBulk(ctx, quantityDiff)
		if err != nil {
			return fmt.Errorf("failed to dec quantity <- %s", err)
		}

	}

	return svc.repo.Update(ctx, id, payload)
}

func (svc *Service) ToOrder(ctx context.Context, id primitive.ObjectID) error {
	o, err := svc.Get(ctx, id)
	if err != nil {
		return err
	}

	if o.Status != models.QuotationOrder {
		// no point of throwing error
		return nil
	}

	itemQuantities := o.GetItemQuantities()
	if err := svc.hasEnoughStock(ctx, itemQuantities); err != nil {
		return err
	}

	err = svc.productsvc.DecBulk(ctx, itemQuantities)
	if err != nil {
		return fmt.Errorf("failed to dec quantity <- %s", err)
	}

	err = svc.repo.ToOrder(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to convert to order <- %s", err)
	}

	return nil
}
