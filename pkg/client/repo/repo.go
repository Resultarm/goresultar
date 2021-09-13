package repo

import (
	"context"

	"gerenciador/pkg/models"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/services/auth"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	db   *mongo.Database
	name string
}

const collName = "clients"

func New(r resource.Resource) Repository {
	return Repository{db: r.DB}
}

func (repo Repository) Add(ctx context.Context, payload *models.ClientPayload) (*primitive.ObjectID, error) {
	coll := repo.db.Collection(collName)

	if payload.Password != "" {
		var err error
		payload.Password, err = auth.Encode(payload.Password)
		if err != nil {
			return nil, err
		}
	}

	result, err := coll.InsertOne(ctx, payload)
	if err != nil {
		return nil, err
	}

	id := result.InsertedID.(primitive.ObjectID)
	return &id, nil
}
