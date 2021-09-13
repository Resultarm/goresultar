package repo

import (
	"context"
	"fmt"
	"strings"

	"gerenciador/pkg/product/model"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/util"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	db *mongo.Database
}

const collName = "products"

func New(r resource.Resource) Repository {
	return Repository{db: r.DB}
}

func (repo Repository) Add(ctx context.Context, payload *model.ProductRequest) (*primitive.ObjectID, error) {
	coll := repo.db.Collection(collName)

	result, err := coll.InsertOne(ctx, payload)
	if err != nil {
		return nil, err
	}

	id := result.InsertedID.(primitive.ObjectID)
	return &id, nil
}

func (repo Repository) Update(ctx context.Context, id *primitive.ObjectID, payload *model.ProductRequest) error {
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

func (repo Repository) GetAll(ctx context.Context, filter util.Specification) (*[]model.Product, error) {
	coll := repo.db.Collection(collName)

	match := filter.Query()

	// i, _ := primitive.ObjectIDFromHex("60560500f3f3ff21c444deaf")
	// match := bson.M{
	// 	"_id":            bson.M{"$gte": primitive.NewObjectIDFromTimestamp(time.Now().AddDate(0, 0, -1))},
	// 	"organizationId": i,
	// }

	pipeline := []bson.M{
		{"$match": match},
		util.NewLookupStage(util.DepartmentsCollName, "departmentId", "_id", "department"),
		util.NewUnwindStage("$department"),
		util.NewLookupStage(util.BrandsCollName, "brandId", "_id", "brand"),
		util.NewUnwindStage("$brand"),
		util.NewLookupStage(util.ModelsCollName, "modelId", "_id", "model"),
		util.NewUnwindStage("$model"),
		util.NewLookupStage(util.CategoriesCollName, "categoryId", "_id", "category"),
		util.NewUnwindStage("$category"),
		util.NewLookupStage(util.SubcategoriesCollName, "subcategoryId", "_id", "subcategory"),
		util.NewUnwindStage("$subcategory"),
	}

	cur, err := coll.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}

	products := []model.Product{}
	for cur.Next(ctx) {
		var q model.Product
		if err := cur.Decode(&q); err != nil {
			return nil, err
		}
		products = append(products, q)
	}

	return &products, nil

}

func (repo Repository) Get(ctx context.Context, id *primitive.ObjectID) (*model.Product, error) {
	products, err := repo.GetAll(ctx, util.NewQuery(bson.M{"_id": id}))
	if err != nil {
		return nil, err
	}

	if len(*products) == 0 {
		return nil, util.ErrNotFound
	}

	return &(*products)[0], nil
}

func (repo Repository) GetQuantityBulk(ctx context.Context, ids *[]primitive.ObjectID) (*[]model.Quantity, error) {
	coll := repo.db.Collection(collName)

	// services are not applicable since they dont have quantity
	cur, err := coll.Find(ctx, bson.M{"_id": bson.M{"$in": ids}, "isService": false})
	if err != nil {
		return nil, err
	}

	var quantities []model.Quantity
	for cur.Next(ctx) {
		var q model.Quantity
		if err := cur.Decode(&q); err != nil {
			return nil, err
		}
		quantities = append(quantities, q)
	}

	return &quantities, nil
}

func (repo Repository) Dec(ctx context.Context, by float64) error {
	// err := repo.db.Client().UseSession(ctx, func(ctx mongo.SessionContext) error {
	// 	_, err := ctx.WithTransaction(ctx, func(ctx mongo.SessionContext) (interface{}, error) {

	// 		result, err := coll.InsertOne(ctx, payload)
	// 		if err != nil {
	// 			return nil, err
	// 		}

	// 		var quantityDecUpdates []mongo.UpdateOneModel
	// 		for _, p := range payload.KitItems {

	// 		}

	// 		coll.BulkWrite(ctx)

	// 		id := result.InsertedID.(primitive.ObjectID)
	// 		return &id, nil

	// 	})

	// 	return err
	// })
	return nil
}

func (repo Repository) DecBulk(ctx context.Context, quantityDecUpdates map[primitive.ObjectID]float64) error {
	coll := repo.db.Collection(collName)

	var updateModels []mongo.WriteModel
	for id, value := range quantityDecUpdates {
		updateModel := mongo.NewUpdateOneModel().SetFilter(bson.M{"_id": id}).SetUpdate(bson.M{"$inc": bson.M{"totalUnits": -value}})
		updateModels = append(updateModels, updateModel)
	}

	_, err := coll.BulkWrite(ctx, updateModels)
	if err != nil {
		return err
	}

	// if int(result.MatchedCount) != len(quantityDecUpdates) {
	// 	return fmt.Errorf("expected matched count %d, actual matched count %d", len(quantityDecUpdates), result.MatchedCount)
	// }

	return nil
}

func (repo Repository) GetKitsBulk(ctx context.Context, ids []primitive.ObjectID) ([]*model.Product, error) {
	coll := repo.db.Collection(collName)

	cur, err := coll.Find(ctx, bson.M{"_id": bson.M{"$in": ids}, "kitProducts.1": bson.M{"$exists": true}})
	if err != nil {
		return nil, err
	}

	var kits []*model.Product
	for cur.Next(ctx) {
		var p model.Product
		if err := cur.Decode(&p); err != nil {
			return nil, err
		}
		kits = append(kits, &p)
	}

	return kits, nil
}

func (repo Repository) CheckEnoughStock(ctx context.Context, quantities map[primitive.ObjectID]float64) error {
	coll := repo.db.Collection(collName)

	var query []bson.M
	for id, q := range quantities {
		query = append(query, bson.M{"_id": id, "totalUnits": bson.M{"$lt": q}})
	}

	cur, err := coll.Find(ctx, bson.M{"$or": query, "isService": false})
	if err != nil {
		return err
	}

	var errStrs []string
	for cur.Next(ctx) {
		var p struct {
			Title    string  `bson:"title"`
			Quantity float64 `bson:"totalUnits"`
		}
		if err := cur.Decode(&p); err != nil {
			return err
		}
		errStrs = append(errStrs, fmt.Sprintf("%s (%f)", p.Title, p.Quantity))
	}

	if len(errStrs) > 0 {
		return util.NotEnoughStockError{
			Err: strings.Join(errStrs, ", "),
		}
	}

	return nil
}
