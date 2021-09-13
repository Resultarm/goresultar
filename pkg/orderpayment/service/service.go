package service

import (
	"context"
	"errors"

	"gerenciador/ecommerce/util"
	"gerenciador/pkg/orderpayment/model"
	"gerenciador/pkg/orderpayment/repo"
	"gerenciador/pkg/resource"

	"github.com/casbin/casbin/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var ErrNotAllowed = errors.New("not allowed")

type Service struct {
	repo     repo.Repository
	enforcer *casbin.Enforcer
}

func New(r resource.Resource) Service {
	return Service{repo: repo.New(r), enforcer: r.Enforcer}
}

func (svc Service) Add(ctx context.Context, payload *model.OrderPaymentRequest) (*primitive.ObjectID, error) {

	organizationID, err := util.GetOrganizationIDv2FromCtx(ctx)
	if err != nil {
		return nil, err
	}

	payload.OrganizationID = *organizationID

	return svc.repo.Add(ctx, payload)
}
