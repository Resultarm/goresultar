package service

import (
	"context"
	"gerenciador/pkg/models"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/subcategory/repo"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Service struct {
	repo repo.Repository
}

func New(r resource.Resource) Service {
	return Service{repo: repo.New(r)}
}

func (svc Service) Add(ctx context.Context, payload *models.SubCategoryv2) (*primitive.ObjectID, error) {
	return svc.repo.Add(ctx, payload)
}
