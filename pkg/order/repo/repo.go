package repo

import (
	"context"
	"errors"
	"fmt"

	"gerenciador/pkg/models"
	"gerenciador/pkg/order/model"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/util"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository struct {
	db *mongo.Database
}

func New(r resource.Resource) Repository {
	return Repository{db: r.DB}
}

func (repo *Repository) Get(ctx context.Context, id primitive.ObjectID) (*model.Order, error) {
	coll := repo.db.Collection(util.OrderCollName)

	var o model.Order
	if err := coll.FindOne(ctx, bson.M{"_id": id}).Decode(&o); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, util.ErrNotFound
		}
		return nil, err
	}

	return &o, nil
}

func (repo *Repository) Update(ctx context.Context, id primitive.ObjectID, payload *model.OrderRequest) error {
	coll := repo.db.Collection(util.OrderCollName)

	result, err := coll.UpdateByID(ctx, id, bson.M{"$set": payload})
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return util.ErrNotFound
	}

	return nil
}

func (repo *Repository) ToOrder(ctx context.Context, id primitive.ObjectID) error {
	coll := repo.db.Collection(util.OrderCollName)

	result, err := coll.UpdateByID(ctx, id, bson.M{"$set": bson.M{"status": models.OpenOrder, "processStatus": models.StatusNew}})
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return util.ErrNotFound
	}

	return nil
}

func (repo *Repository) Create(ctx context.Context, payload *model.OrderRequest) (*primitive.ObjectID, error) {
	coll := repo.db.Collection(util.OrderCollName)

	options := options.FindOne()
	options.SetSort(bson.D{{"_id", -1}})

	findresult := coll.FindOne(ctx, bson.D{}, options)
	if findresult.Err() != nil {
		return nil, findresult.Err()
	}

	type Order struct {
		OrderID int `bson:"orderId"`
	}
	var o Order
	if err := findresult.Decode(&o); err != nil {
		return nil, fmt.Errorf("order decode failed <- %s", err)
	}

	if o.OrderID == 0 {
		return nil, errors.New("orderId can't be zero")
	}

	payload.OrderID = o.OrderID + 1

	result, err := coll.InsertOne(ctx, payload)
	if err != nil {
		return nil, err
	}

	id := result.InsertedID.(primitive.ObjectID)
	return &id, nil
}
