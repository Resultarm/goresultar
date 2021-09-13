package dbutil

import "go.mongodb.org/mongo-driver/bson"

type D interface{}

func Unwind(s string) bson.M {
	return bson.M{"$unwind": s}
}

func Reduce(input D, in D, initialValue D) D {
	return bson.M{"$reduce": bson.M{"input": input, "initialValue": initialValue, "in": in}}
}

func Field(f string, v D) D {
	return bson.M{f: v}
}

func Sum(v D) D {
	return bson.M{"$sum": v}
}

func Multiply(vs ...D) D {
	return bson.M{"$multiply": vs}
}

func Subtract(v1 D, v2 D) D {
	return bson.M{"$subtract": []D{v1, v2}}
}

func IfNull(v D, defaultValue D) D {
	return bson.M{"$ifNull": []D{v, defaultValue}}
}

func Group(v D) D {
	return bson.M{"$group": v}
}

func Lookup(from, localField, foreignField, as string) D {
	return bson.M{
		"$lookup": bson.M{
			"from":         from,
			"localField":   localField,
			"foreignField": foreignField,
			"as":           as,
		},
	}
}

func AddField(v D) D {
	return bson.M{"$addFields": v}
}

func UnwindPreserveEmpty(s string) D {
	return bson.M{"$unwind": bson.M{
		"path":                       s,
		"preserveNullAndEmptyArrays": true,
	},
	}
}

func InExpr(value, input D) D {
	return bson.M{"$in": []D{value, input}}
}

func EqExpr(value, input D) D {
	return bson.M{"$eq": []D{value, input}}
}

// db.orders.aggregate([
//   { $match: { status: 3 } },
//   { $unwind: "$items" },
//   {
//     $group: {
//       _id: "$items.productId",
//       profit: {
//         $sum: {
//           $multiply: [
//             {
//               $reduce: {
//                 input: { $ifNull: ["$items.measurementValue", []] },
//                 initialValue: 1,
//                 in: { $multiply: ["$$value", "$$this"] },
//               },
//             },
//             "$items.amount",
//             { $subtract: ["$items.price", "$items.cost"] },
//           ],
//         },
//       },
//     },
//   },
//   {
//     $lookup: {
//       from: "products",
//       localField: "_id",
//       foreignField: "_id",
//       as: "product",
//     },
//   },
//   { $addFields: { departmentId: "$product.departmentId" } },
//   { $project: { profit: 1, departmentId: 1 } },
//   { $group: { _id: "$departmentId", profit: { $sum: "$profit" } } },
// ]);
