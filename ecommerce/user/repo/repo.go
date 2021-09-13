package repo

import (
	"context"
	"gerenciador/ecommerce/user/model"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/util"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	db   *mongo.Database
	name string
}

func New(r resource.Resource) Repository {
	return Repository{db: r.DB}
}

func (repo Repository) GetByEmail(email string) (*model.User, error) {
	coll := repo.db.Collection(util.ClientCollName)

	var u model.User
	if err := coll.FindOne(context.TODO(), bson.D{{"email", email}}).Decode(&u); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, util.ErrNotFound
		}
		return nil, err
	}

	return &u, nil
}
