package mongostore

import (
	"encoding/json"
	"fmt"
	"gerenciador/pkg/id"
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/timestamp"
	"gerenciador/pkg/util"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "OrdersRepo",
		Priority: registry.Medium,
		Instance: &OrdersRepo{},
	})
}

type OrdersRepo struct {
	Store *MongoStore `inject:""`

	log  log.Logger
	coll string
}

func (repo *OrdersRepo) Init() error {
	repo.coll = ordersCollection
	if err := repo.ensureIndexes(); err != nil {
		return err
	}
	// if settings.Environment == settings.Dev {
	// 	//if err := repo.initTestOrders(); err != nil {
	// 	//	return err
	// 	//}

	// }
	return nil
}

func (repo *OrdersRepo) Find(spec m.Specification) ([]*m.Order, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	pipe := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage(clientsCollection, "clientId", "_id", "client"),
		NewLookupStage(organizationsCollection, "organizationId", "_id", "organization"),
		NewUnwindStage("$client"),
		NewUnwindStage("$organization"),
		NewLookupStage(transactionsCollection, "_id", "orderId", "transactions"),
		{"$sort": bson.M{"_id": -1}},
	}

	if withPagination, ok := spec.(m.SpecificationWithPagination); ok {
		if skip := withPagination.Offset(); skip != 0 {
			pipe = append(pipe, bson.M{"$skip": skip})
		}
		if limit := withPagination.Limit(); limit != 0 {
			pipe = append(pipe, bson.M{"$limit": limit})
		}
	}
	var orders = []*m.Order{}
	if err := c.Pipe(pipe).All(&orders); err != nil {
		if err == mgo.ErrNotFound {
			return orders, util.ErrNotFound
		}
	}

	if len(orders) == 0 {
		return nil, util.ErrNotFound
	}

	prepo := ProductsRepo{
		Store: repo.Store,
		coll:  "products",
	}

	for _, order := range orders {
		order.CreatedAt = timestamp.Timestamp{Time: order.Id.Time()}
		for i, product := range order.Items {
			p, err := prepo.FindOne(m.FindByIdQuery{Id: product.ProductId}, true)
			if err != nil {
				fmt.Println("err", err)
				if err != util.ErrNotFound {

					return nil, err
				}
			} else {
				if order.Status == m.QuotationOrder {
					product.Price = p.Price
					product.Cost = p.Cost
				}
				product.Title = p.Title
				order.Items[i] = product
			}
		}

		for _, transaction := range order.Transactions {
			transaction.CreatedAt = timestamp.Timestamp{transaction.Id.Time()}
		}
	}

	return orders, nil
}

func (repo *OrdersRepo) FindOne(spec m.Specification) (*m.Order, error) {
	orders, err := repo.Find(spec)
	order := orders[0]
	if err != nil {
		return &m.Order{}, err
	}

	// prepo := ProductsRepo{
	// 	Store: repo.Store,
	// 	coll:  "products",
	// }

	// if order.Status == m.QuotationOrder {
	// 	for i, product := range order.Items {
	// 		p, err := prepo.FindOne(m.FindByIdQuery{Id: product.ProductId})
	// 		if err != nil {
	// 			if err == m.ErrProductNotFound {

	// 			} else {
	// 				return nil, err
	// 			}
	// 		}
	// 		product.Price = p.Price
	// 		product.Cost = p.Cost
	// 		order.Items[i] = product
	// 	}
	// }

	urepo := AdminRepo{
		Store: repo.Store,
		coll:  "admins",
	}

	u, err := urepo.FindOne(m.FindByIdQuery{Id: order.UserID})

	if err != nil {
		return nil, err
	}
	order.User = u

	return order, nil
}

func (repo *OrdersRepo) Save(cmd m.OrderRequest) (*m.Order, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	totalDoc, err := c.Find(bson.M{}).Count()
	if err != nil {
		return nil, err
	}

	cmd.OrderID = totalDoc + 1
	if err := c.Insert(cmd); err != nil {
		return nil, err
	}
	return repo.FindOne(m.FindByIdQuery{cmd.Id})
}

func (repo *OrdersRepo) Update(spec m.Specification, upd interface{}) (*m.Order, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": upd,
	}); err != nil {
		return &m.Order{}, err
	}
	return repo.FindOne(spec)
}

func (repo *OrdersRepo) UpdateStatus(spec m.Specification, upd interface{}) (*m.Order, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": upd,
	}); err != nil {
		return nil, err
	}
	return repo.FindOne(spec)
}

func (repo *OrdersRepo) UpdateProcessStatus(spec m.Specification, upd interface{}) (*m.Order, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": upd,
	}); err != nil {
		return nil, err
	}
	return repo.FindOne(spec)
}

func (repo *OrdersRepo) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}

func (repo *OrdersRepo) GetCountByProcessStatus(spec m.Specification) ([]m.CountByProcessStatus, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	q := spec.Query()
	q["status"] = bson.M{"$in": []m.OrderStatus{m.OpenOrder, m.ClosedOrder, m.PartialOrder}}

	matchQ := WrapSafeDeleteQuery(q)
	groupQ := bson.M{"_id": "$processStatus", "count": bson.M{"$sum": 1}}

	// groupQ := bson.M{"_id": "$processStatus"}
	// for _, s := range []m.OrderProcessStatus{m.StatusNew, m.StatusPreparation, m.StatusProduction, m.StatusProduction, m.StatusReady, m.StatusComplete} {
	// 	groupQ[s.String()] = bson.M{
	// 		"$sum": bson.M{
	// 			"$cond": []interface{}{bson.M{"$eq": []interface{}{"$processStatus", s}}, 1, 0}},
	// 	}
	// }

	aggrQ := []bson.M{{"$match": matchQ}, {"$group": groupQ}}

	b, _ := json.Marshal(aggrQ)
	log.Info("aggregation query: %s", b)

	var temp []m.CountByProcessStatus
	if err := c.Pipe(aggrQ).All(&temp); err != nil {
		return nil, err
	}

	tempMap := map[m.OrderProcessStatus]uint{}
	for _, t := range temp {
		tempMap[t.Status] = t.Count
	}

	var result []m.CountByProcessStatus
	for _, s := range []m.OrderProcessStatus{m.StatusNew, m.StatusPreparation, m.StatusProduction, m.StatusQuality, m.StatusReady, m.StatusComplete, m.StatusPickedUpOrDelivered, m.StatusConcluded} {
		result = append(result, m.CountByProcessStatus{ID: s, Status: s, Count: tempMap[s]})
	}

	return result, nil
}

func (repo *OrdersRepo) GetAllOrderStatuses() (map[m.OrderProcessStatus]string, error) {
	return m.AllOrderProcessStatuses, nil
}

var measurementQuantitySpec = bson.M{"$reduce": bson.M{
	"input":        bson.M{"$ifNull": []interface{}{"$$item.measurementValue", []bson.M{}}},
	"initialValue": 1,
	"in":           bson.M{"$multiply": []string{"$$this", "$$value"}},
}}

func (repo *OrdersRepo) Statistics(spec m.Specification, productId id.ID) (*m.OrderStats, error) {

	fmt.Println("spec", spec.Query())

	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	var totalCostFunc = func(name string) bson.M {
		return bson.M{
			"$sum": bson.M{
				"$map": bson.M{
					"input": name,
					"as":    "order",
					"in": bson.M{
						"$sum": bson.M{
							"$map": bson.M{
								"input": "$$order.items",
								"as":    "item",
								"in": bson.M{"$multiply": []interface{}{
									bson.M{"$ifNull": []interface{}{"$$item.cost", 0}},
									bson.M{"$ifNull": []interface{}{"$$item.amount", 0}},
									measurementQuantitySpec,
								}},
							},
						},
					}},
			},
		}
	}

	var totalPriceFunc = func(name string) bson.M {
		return bson.M{
			"$sum": bson.M{
				"$map": bson.M{
					"input": name,
					"as":    "order",
					"in": bson.M{
						"$sum": bson.M{
							"$map": bson.M{
								"input": "$$order.items",
								"as":    "item",
								"in": bson.M{"$multiply": []interface{}{
									bson.M{"$ifNull": []interface{}{"$$item.price", 0}},
									bson.M{"$ifNull": []interface{}{"$$item.amount", 0}},
									measurementQuantitySpec,
								}},
							},
						},
					}},
			},
		}
	}
	var totalUnitsSoldFunc = func(name string) bson.M {
		return bson.M{
			"$sum": bson.M{
				"$map": bson.M{
					"input": name,
					"as":    "order",
					"in": bson.M{
						"$sum": bson.M{
							"$map": bson.M{
								"input": "$$order.items",
								"as":    "item",
								"in": bson.M{
									"$sum": []interface{}{
										bson.M{"$cond": bson.M{
											"if": bson.M{
												"$eq": []interface{}{
													"$$item.productId",
													productId,
												},
											},
											"then": "$$item.amount",
											"else": 0,
										}}}}}}}}}}
	}

	var projectStage = bson.M{
		"open.orders":        bson.M{"$size": "$openOrders"},
		"open.revenue":       totalPriceFunc("$openOrders"),
		"open.cost":          totalCostFunc("$openOrders"),
		"closed.orders":      bson.M{"$size": "$closedOrders"},
		"closed.revenue":     totalPriceFunc("$closedOrders"),
		"closed.cost":        totalCostFunc("$closedOrders"),
		"partial.orders":     bson.M{"$size": "$partialOrders"},
		"partial.revenue":    totalPriceFunc("$partialOrders"),
		"partial.cost":       totalCostFunc("$partialOrders"),
		"quotations.orders":  bson.M{"$size": "$quotationsOrders"},
		"quotations.revenue": totalPriceFunc("$quotationsOrders"),
		"quotations.cost":    totalCostFunc("$quotationsOrders"),
		"canceled.orders":    bson.M{"$size": "$canceledOrders"},
		"canceled.revenue":   totalPriceFunc("$canceledOrders"),
		"canceled.cost":      totalCostFunc("$canceledOrders"),
	}

	if productId.Valid() {
		projectStage["open.units"] = totalUnitsSoldFunc("$openOrders")
		projectStage["closed.units"] = totalUnitsSoldFunc("$closedOrders")
		projectStage["partial.units"] = totalUnitsSoldFunc("$partialOrders")
		projectStage["quotations.units"] = totalUnitsSoldFunc("$quotationsOrders")
		projectStage["canceled.units"] = totalUnitsSoldFunc("$canceledOrders")

	}

	pipe := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		{"$facet": bson.M{
			"openOrders": []interface{}{
				bson.M{
					"$match": bson.M{"status": bson.M{"$eq": 1}}}},
			"quotationsOrders": []interface{}{
				bson.M{
					"$match": bson.M{"status": bson.M{"$eq": 4}}}},

			"closedOrders": []interface{}{
				bson.M{
					"$match": bson.M{"status": bson.M{"$eq": 3}}}},
			"partialOrders": []interface{}{
				bson.M{
					"$match": bson.M{"status": bson.M{"$eq": 2}}}},
			"canceledOrders": []interface{}{
				bson.M{
					"$match": bson.M{"processStatus": bson.M{"$eq": m.StatusCanceled}}}},
		}},
		{"$project": projectStage},
	}

	var stats m.OrderStats
	if err := c.Pipe(pipe).One(&stats); err != nil {
		if err == mgo.ErrNotFound {
			return &stats, m.ErrOrderNotFound
		}
	}

	specForCollected := spec
	partialOrdersQuery := WrapSafeDeleteQuery(specForCollected.Query())
	partialOrdersQuery["status"] = m.PartialOrder

	var partialOrders []m.Order
	if err := c.Find(partialOrdersQuery).Select(bson.M{"_id": 1}).All(&partialOrders); err != nil {
		if err == mgo.ErrNotFound {
			return &stats, m.ErrOrderNotFound
		}
	}
	var partialOrderIDs []id.ID
	for _, o := range partialOrders {
		partialOrderIDs = append(partialOrderIDs, o.Id)
	}

	partialTxQ := WrapSafeDeleteQuery(bson.M{})
	partialTxQ["orderId"] = bson.M{"$in": partialOrderIDs}
	var partialTransactions []m.Transaction
	transcationscoll := sess.DB(repo.Store.Config.DatabaseName).C("transactions")
	if err := transcationscoll.Find(partialTxQ).All(&partialTransactions); err != nil {
		return nil, err
	}

	for _, t := range partialTransactions {
		stats.Partial.Collected += t.Amount
	}

	return &stats, nil
}

func (repo *OrdersRepo) ensureIndexes() error {
	//todo complete ensure indexes
	return nil
}

func (repo *OrdersRepo) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(WrapSafeDeleteQuery(spec.Query()))
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}
