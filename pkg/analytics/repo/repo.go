package repo

import (
	"context"
	"encoding/json"
	"fmt"
	"gerenciador/pkg/analytics/model"
	"gerenciador/pkg/models"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/services/dbutil"
	"gerenciador/pkg/util"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	db *mongo.Database
}

func New(r resource.Resource) Repository {
	return Repository{db: r.DB}
}

var measurementQuantitySpec = dbutil.Reduce(dbutil.IfNull("$items.measurementValue", []bson.M{}), dbutil.Multiply("$$this", "$$value"), 1)
var orderItemprofitSpec = dbutil.Subtract("$items.price", "$items.cost")

func (repo *Repository) GetDepartmentWiseProfit(ctx context.Context) ([]model.DepartmentProfit, error) {
	query := []dbutil.D{
		bson.M{"$match": dbutil.Field("status", models.ClosedOrder)},
		dbutil.Unwind("$items"),
		dbutil.Group(bson.M{
			"_id":    "$items.productId",
			"profit": dbutil.Sum(dbutil.Multiply(measurementQuantitySpec, "$items.amount", orderItemprofitSpec)),
		}),
		dbutil.Lookup(util.ProductsCollName, "_id", "_id", "product"),
		dbutil.Unwind("$product"),
		dbutil.AddField(dbutil.Field("departmentId", "$product.departmentId")),
		bson.M{"$project": bson.M{"profit": 1, "departmentId": 1}},
		dbutil.Group(
			bson.M{"_id": "$departmentId", "profit": dbutil.Sum("$profit")},
		),
	}

	b, err := json.Marshal(bson.M{"q": query})
	fmt.Println("ab ", string(b), err)

	coll := repo.db.Collection(util.OrderCollName)
	cursor, err := coll.Aggregate(ctx, query)
	if err != nil {
		return nil, err
	}

	var departments []model.DepartmentProfit
	if err := cursor.All(ctx, &departments); err != nil {
		return nil, err
	}

	return departments, nil
}

//         {
//           $project: {
//             profit: {
//               $sum: {
//                 $multiply: [
//                   {
//                     $reduce: {
//                       input: { $ifNull: ["$items.measurementValue", []] },
//                       initialValue: 1,
//                       in: { $multiply: ["$$this", "$$value"] },
//                     },
//                   },
//                   "$items.amount",
//                   { $subtract: ["$items.price", "$items.cost"] },
//                 ],
//               },
//             },
//           },
//         },
//       ],
//       as: "orderItem",
//     },
//   },
//   { $unwind: { path: "$orderItem", preserveNullAndEmptyArrays: true } },
//   { $group: { _id: "$_id", profit: { $sum: "$orderItem.profit" } } },
// ]);
func (repo *Repository) GetProductWiseProfit(ctx context.Context) ([]model.DepartmentProfit, error) {
	query := []dbutil.D{
		bson.M{
			"$lookup": bson.M{
				"from": util.OrderCollName,
				"let":  dbutil.Field("productId", "$_id"),
				"as":   "orderItem",
				"pipeline": []dbutil.D{
					bson.M{
						"$match": bson.M{
							"$expr":  dbutil.InExpr("$$productId", "$items.productId"),
							"status": models.ClosedOrder,
						},
					},
					dbutil.Unwind("$items"),
					bson.M{
						"$match": bson.M{
							"$expr": dbutil.EqExpr("$items.productId", "$$productId"),
						},
					},
					bson.M{
						"$project": bson.M{
							"profit": dbutil.Multiply(measurementQuantitySpec, "$items.amount", orderItemprofitSpec),
						},
					},
				},
			},
		},
		dbutil.UnwindPreserveEmpty("$orderItem"),
		dbutil.Group(bson.M{"_id": "$_id", "profit": dbutil.Sum("$orderItem.profit")}),
	}

	b, err := json.Marshal(bson.M{"q": query})
	fmt.Println("ab ", string(b), err)

	coll := repo.db.Collection(util.ProductsCollName)
	cursor, err := coll.Aggregate(ctx, query)
	if err != nil {
		return nil, err
	}

	var departments []model.DepartmentProfit
	if err := cursor.All(ctx, &departments); err != nil {
		return nil, err
	}

	return departments, nil
}
