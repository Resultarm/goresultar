package repo

import (
	"context"

	"gerenciador/pkg/orderpayment/model"
	"gerenciador/pkg/resource"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	db   *mongo.Database
	name string
}

const collName = "transactions"

func New(r resource.Resource) Repository {
	return Repository{db: r.DB}
}

func (repo Repository) Add(ctx context.Context, payload *model.OrderPaymentRequest) (*primitive.ObjectID, error) {
	coll := repo.db.Collection(collName)

	result, err := coll.InsertOne(ctx, payload)
	if err != nil {
		return nil, err
	}

	id := result.InsertedID.(primitive.ObjectID)
	return &id, nil
}
