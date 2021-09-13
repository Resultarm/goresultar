package service

import (
	"context"
	"errors"
	"gerenciador/ecommerce/util"
	"gerenciador/pkg/department/repo"
	"gerenciador/pkg/models"
	"gerenciador/pkg/resource"

	"github.com/casbin/casbin/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var name = "department"

var ErrNotAllowed = errors.New("not allowed")

type Service struct {
	repo     repo.Repository
	enforcer *casbin.Enforcer
}

func New(r resource.Resource) Service {
	return Service{repo: repo.New(r), enforcer: r.Enforcer}
}

func (svc Service) Add(ctx context.Context, payload *models.DepartmentRequest) (*primitive.ObjectID, error) {
	_, err := util.UserFromCtx(ctx)
	if err != nil {
		return nil, err
	}

	// allowed, err := svc.enforcer.Enforce(user.Role.Name, name, "write")
	// if err != nil {
	// 	return nil, err
	// }
	// if !allowed {
	// 	return nil, ErrNotAllowed
	// }
	return svc.repo.Add(ctx, payload)
}

func (svc Service) Update(ctx context.Context, id primitive.ObjectID, payload *models.DepartmentRequest) error {
	return svc.repo.Update(ctx, id, payload)
}
