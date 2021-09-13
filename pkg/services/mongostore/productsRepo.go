package mongostore

import (
	"gerenciador/pkg/log"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/timestamp"
	"gerenciador/pkg/util"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"

	m "gerenciador/pkg/models"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "ProductsRepo",
		Priority: registry.Medium,
		Instance: &ProductsRepo{},
	})
}

type ProductsRepo struct {
	Store *MongoStore `inject:""`

	log  log.Logger
	coll string
}

func (repo *ProductsRepo) Init() error {
	repo.coll = productsCollection
	if err := repo.ensureIndexes(); err != nil {
		return err
	}

	// _ = repo.initTestProducts()
	return nil
}

func (repo *ProductsRepo) Find(spec m.Specification, includeDeleted bool) ([]*m.Product, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	pipe := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		//todo if high-load - might be problematic
		// NewLookupStage(ordersCollection, "_id", "items.productId", "orders"),
		NewLookupStage(departmentsCollection, "departmentId", "_id", "department"),
		NewUnwindStage("$department"),
		NewLookupStage(brandsCollection, "brandId", "_id", "brand"),
		NewUnwindStage("$brand"),
		NewLookupStage(categoriesCollection, "categoryId", "_id", "category"),
		NewUnwindStage("$category"),
		NewLookupStage(subcategoriesCollection, "subcategoryId", "_id", "subcategory"),
		NewUnwindStage("$subcategory"),
	}

	if !includeDeleted {
		pipe = append(pipe, RemoveEmpty("department"))
	}

	if withPagination, ok := spec.(m.SpecificationWithPagination); ok {
		if skip := withPagination.Offset(); skip != 0 {
			pipe = append(pipe, bson.M{"$skip": skip})
		}
		if limit := withPagination.Limit(); limit != 0 {
			pipe = append(pipe, bson.M{"$limit": limit})
		}
	}

	var products = []*m.Product{}
	if err := c.Pipe(pipe).All(&products); err != nil {
		if err == mgo.ErrNotFound {
			return products, util.ErrNotFound
		}
	}

	if len(products) == 0 {
		return nil, util.ErrNotFound
	}

	for _, p := range products {
		p.CreatedAt = timestamp.Timestamp{p.ID.Time()}
	}

	return products, nil
}

func (repo *ProductsRepo) FindOne(spec m.Specification, includeDeleted bool) (*m.Product, error) {
	products, err := repo.Find(spec, includeDeleted)
	if err != nil {
		return &m.Product{}, err
	}

	return products[0], nil
}

func (repo *ProductsRepo) Save(cmd m.ProductRequest) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Insert(cmd); err != nil {
		return err
	}
	return nil
}

func (repo *ProductsRepo) Update(spec m.Specification, upd interface{}) (*m.Product, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": upd,
	}); err != nil {
		return &m.Product{}, err
	}
	return repo.FindOne(spec, false)
}

func (repo *ProductsRepo) DecQuantity(spec m.Specification, by float64) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$inc": bson.M{"totalUnits": by * -1},
	}); err != nil {
		return err
	}
	return nil
}

func (repo *ProductsRepo) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	pipe := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage("departments", "departmentId", "_id", "department"),
		RemoveEmpty("department"),
		{
			"$count": "count",
		},
	}

	var err error
	var r map[string]int

	if err = c.Pipe(pipe).One(&r); err != nil {
		return 0, err
	}
	return r["count"], nil
}
func (repo *ProductsRepo) Statistics(spec m.Specification) ([]m.AllProductStatistics, error) {
	//todo complete ensure indexes
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	pipe := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		{"$project": bson.M{
			"worthPrice": bson.M{
				"$sum": bson.M{
					"$multiply": []interface{}{"$price", "$totalUnits"}}},
			"worthCost": bson.M{
				"$sum": bson.M{
					"$multiply": []interface{}{"$cost", "$totalUnits"}}},
			"departmentId": "$departmentId",
		}},
		{"$group": bson.M{
			"_id":          "$departmentId",
			"departmentId": bson.M{"$first": "$departmentId"},
			"worthPrice":   bson.M{"$sum": "$worthPrice"},
			"worthCost":    bson.M{"$sum": "$worthCost"},
			"totalCount":   bson.M{"$sum": 1},
		}},
		NewLookupStage("departments", "departmentId", "_id", "department"),
		RemoveEmpty("department"),
		NewUnwindStage("$department"),
	}

	var stats []m.AllProductStatistics
	var err error
	if err = c.Pipe(pipe).All(&stats); err != nil {
		return stats, err
	}

	return stats, nil
}
func (repo *ProductsRepo) ensureIndexes() error {
	//todo complete ensure indexes
	return nil
}

func (repo *ProductsRepo) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	err := c.Remove(spec.Query())
	return err
}
