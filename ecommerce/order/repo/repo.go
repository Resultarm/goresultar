package repo

import (
	"context"
	"errors"
	"gerenciador/ecommerce/order/model"
	usermodel "gerenciador/ecommerce/user/model"
	"gerenciador/ecommerce/util"
	"gerenciador/pkg/resource"

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

func (repo Repository) GetAll(ctx context.Context) (*[]model.Order, error) {
	coll := repo.db.Collection(util.OrderCollection)

	user, ok := usermodel.FromCtx(ctx)
	if !ok {
		return nil, errors.New("no user present in ctx")
	}

	cur, err := coll.Find(ctx, bson.D{{"clientId", user.ID}})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	orders := []model.Order{}
	for cur.Next(ctx) {
		var o model.Order
		if err := cur.Decode(&o); err != nil {
			return nil, err
		}
		o.CreatedAt = o.ID.Timestamp()
		o.UpdateWithTotal()
		orders = append(orders, o)
	}

	return &orders, nil
}
