db.expenses.aggregate([
  {
    $lookup: {
      from: "expensePayments",
      localField: "_id",
      foreignField: "expenseId",
      as: "payments",
    },
  },
  {
    $match: {
      frequency: "custom",
      $expr: {
        $and: [
          { $lt: [{ $size: "$payments" }, "$numTimes"] },
          { $gt: [{ $size: "$payments" }, 0] },
        ],
      },
    },
  },
]);

db.expenses.aggregate([
  {
    $lookup: {
      from: "expensePayments",
      localField: "_id",
      foreignField: "expenseId",
      as: "payments",
    },
  },
  {
    $match: {
      $expr: {
        $and: [{ fixed: false }, { $in: ["$frequency", ["monthly"]] }],
      },
    },
  },
]);

db.orders.aggregate([
  {
    $project: {
      measurementQuantity: {
        $reduce: {
          input: "$measurementValue",
          initialValue: 1,
          in: { $multiply: ["$$value", "$$this"] },
        },
      },
      totalQuantity: { $multiply: ["$totalUnits", "$measurementQuantity"] },
    },
  },
]);

db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productId",
      profit: {
        $sum: {
          $multiply: [
            "$items.amount",
            { $subtract: ["$items.price", "$items.cost"] },
            {
              $reduce: {
                input: "$items.measurementValue",
                initialValue: 1,
                in: { $multiply: ["$$value", "$$this"] },
              },
            },
          ],
        },
      },
    },
  },
]);
db.orders.aggregate([
  { $match: { status: 3 } },
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productId",
      profit: {
        $sum: {
          $multiply: [
            {
              $reduce: {
                input: { $ifNull: ["$items.measurementValue", []] },
                initialValue: 1,
                in: { $multiply: ["$$this", "$$value"] },
              },
            },
            "$items.amount",
            { $subtract: ["$items.price", "$items.cost"] },
          ],
        },
      },
    },
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product",
    },
  },
  { $unwind: "$product" },
  { $addFields: { departmentId: "$product.departmentId" } },
  { $project: { profit: 1, departmentId: 1 } },
  { $group: { _id: "$departmentId", profit: { $sum: "$profit" } } },
]);

db.products.aggregate([
  {
    $lookup: {
      from: "orders",
      let: { productId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$$productId", "$items.productId"] },
            status: 3,
          },
        },
        { $unwind: "$items" },
        {
          $match: { $expr: { $eq: ["$items.productId", "$$productId"] } },
        },
        {
          $project: {
            profit: {
              $sum: {
                $multiply: [
                  {
                    $reduce: {
                      input: { $ifNull: ["$items.measurementValue", []] },
                      initialValue: 1,
                      in: { $multiply: ["$$this", "$$value"] },
                    },
                  },
                  "$items.amount",
                  { $subtract: ["$items.price", "$items.cost"] },
                ],
              },
            },
          },
        },
      ],
      as: "orderItem",
    },
  },
  { $unwind: { path: "$orderItem", preserveNullAndEmptyArrays: true } },
  { $group: { _id: "$_id", profit: { $sum: "$orderItem.profit" } } },
]);

// https://stackoverflow.com/questions/18969916/mongodb-sum-query
// https://stackoverflow.com/questions/21509045/mongodb-group-by-array-inner-elements
// https://stackoverflow.com/questions/50562160/select-fields-to-return-from-lookup
