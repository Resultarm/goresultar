package service

import (
	"context"
	"gerenciador/pkg/analytics/model"
	"gerenciador/pkg/analytics/repo"
	"gerenciador/pkg/resource"
)

type Service struct {
	repo repo.Repository
}

func New(r resource.Resource) Service {
	return Service{repo: repo.New(r)}
}

func (svc Service) GetDepartmentWiseProfit(ctx context.Context) ([]model.DepartmentProfit, error) {
	return svc.repo.GetDepartmentWiseProfit(ctx)
}

func (svc Service) GetProductWiseProfit(ctx context.Context) ([]model.DepartmentProfit, error) {
	return svc.repo.GetProductWiseProfit(ctx)
}
