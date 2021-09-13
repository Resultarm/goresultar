package service

import (
	"context"
	"gerenciador/ecommerce/order/model"
	"gerenciador/ecommerce/order/repo"
	"gerenciador/pkg/resource"
)

type Service struct {
	repo repo.Repository
}

func New(r resource.Resource) Service {
	return Service{repo: repo.New(r)}
}

func (svc Service) GetAll(ctx context.Context) (*[]model.Order, error) {
	return svc.repo.GetAll(ctx)
}
