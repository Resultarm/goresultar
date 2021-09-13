package repo

import (
	"context"

	"gerenciador/pkg/models"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/util"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	db   *mongo.Database
	name string
}

const collName = "departments"

func New(r resource.Resource) Repository {
	return Repository{db: r.DB}
}

func (repo Repository) Add(ctx context.Context, payload *models.DepartmentRequest) (*primitive.ObjectID, error) {
	coll := repo.db.Collection(collName)

	result, err := coll.InsertOne(ctx, payload)
	if err != nil {
		return nil, err
	}

	id := result.InsertedID.(primitive.ObjectID)
	return &id, nil
}

func (repo Repository) Update(ctx context.Context, id primitive.ObjectID, payload *models.DepartmentRequest) error {
	coll := repo.db.Collection(collName)

	result, err := coll.UpdateByID(ctx, id, bson.M{"$set": payload})
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return util.ErrNotFound
	}

	if result.ModifiedCount == 0 {
		return util.ErrNotModified
	}

	return nil
}
