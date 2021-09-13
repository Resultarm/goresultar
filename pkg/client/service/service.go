package service

import (
	"context"
	"gerenciador/pkg/client/repo"
	"gerenciador/pkg/models"
	"gerenciador/pkg/resource"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Service struct {
	repo repo.Repository
}

func New(r resource.Resource) Service {
	return Service{repo: repo.New(r)}
}

func (svc Service) Add(ctx context.Context, payload *models.ClientPayload) (*primitive.ObjectID, error) {
	return svc.repo.Add(ctx, payload)
}
