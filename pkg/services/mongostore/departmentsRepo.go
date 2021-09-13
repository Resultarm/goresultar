package mongostore

import (
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/util"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "DepartmentsRepo",
		Priority: registry.Medium,
		Instance: &DepartmentsRepo{},
	})
}

type DepartmentsRepo struct {
	Store *MongoStore `inject:""`
	DB    *mongo.Database

	coll string
}

var _ m.DepartmentRepository = &DepartmentsRepo{}

func NewDepartmentRepo(db *mongo.Database) *DepartmentsRepo {
	return &DepartmentsRepo{DB: db, coll: departmentsCollection}
}

func (repo *DepartmentsRepo) Init() error {
	repo.coll = departmentsCollection
	if err := repo.ensureIndexes(); err != nil {
		return err
	}

	return nil
}

func (repo *DepartmentsRepo) Find(spec m.Specification) ([]*m.Department, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	pipe := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
	}

	if withPagination, ok := spec.(m.SpecificationWithPagination); ok {
		if skip := withPagination.Offset(); skip != 0 {
			pipe = append(pipe, bson.M{"$skip": skip})
		}
		if limit := withPagination.Limit(); limit != 0 {
			pipe = append(pipe, bson.M{"$limit": limit})
		}
	}

	var departments = []*m.Department{}
	if err := c.Pipe(pipe).All(&departments); err != nil {
		if err == mgo.ErrNotFound {
			return departments, m.ErrDepartmentNotFound
		}
	}
	if len(departments) == 0 {
		return nil, m.ErrDepartmentNotFound
	}

	return departments, nil
}

func (repo *DepartmentsRepo) FindOne(spec m.Specification) (*m.Department, error) {
	departments, err := repo.Find(spec)
	if err != nil {
		return &m.Department{}, err
	}

	return departments[0], nil
}

// func (repo *DepartmentsRepo) Save(dep m.DepartmentRequest) (*primitive.ObjectID, error) {

// 	c := repo.DB.Collection(repo.coll)

// 	result, err := c.InsertOne(context.TODO(), dep)
// 	if err != nil {
// 		return nil, err
// 	}

// 	id := result.InsertedID.(primitive.ObjectID)
// 	return &id, nil
// }

// func (repo *DepartmentsRepo) Update(spec m.Specification, upd *m.DepartmentRequest) (*m.Department, error) {
// 	sess := repo.Store.Session()
// 	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

// 	upd.

// 	if err := c.Update(spec.Query(), bson.M{"$set": upd}); err != nil {
// 		return nil, err
// 	}
// 	return repo.FindOne(spec)
// }

func (repo *DepartmentsRepo) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}

func (repo *DepartmentsRepo) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(WrapSafeDeleteQuery(spec.Query()))
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}

func (repo *DepartmentsRepo) ensureIndexes() error {
	//todo complete ensure indexes
	return nil
}

func (repo *DepartmentsRepo) DepartmentsWithProfits(spec m.Specification) ([]*m.DepartmentMoney, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C("orders")

	query := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage("transactions", "_id", "orderId", "transactions"),
		NewLookupStage("products", "items.productId", "_id", "items"),
		NewLookupStage("departments", "items.departmentId", "_id", "departments"),
		NewUnwindStage("$departments"),
		{"$match": bson.M{"departments.deletedAt": nil}},
		{"$group": bson.M{
			"_id":            "$departments._id",
			"title":          bson.M{"$first": "$departments.title"},
			"organizationId": bson.M{"$first": "$departments.organizationId"},
			"paid":           NewArraySum("$transactions.amount"), "cost": NewArraySum("$items.cost"),
			"profit": bson.M{"$sum": bson.M{"$subtract": [2]bson.M{{"$sum": "$transactions.amount"}, {"$sum": "$items.cost"}}}},
		},
		},
	}

	departments := []*m.DepartmentMoney{}
	if err := c.Pipe(query).All(&departments); err != nil {
		if err == mgo.ErrNotFound {
			return departments, util.ErrNotFound
		}
	}

	return departments, nil
}
