package mongostore

import (
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/util"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "CategoriesRepo",
		Priority: registry.Low,
		Instance: &CategoriesRepo{},
	})
}

type CategoriesRepo struct {
	Store           *MongoStore            `inject:""`
	DepartmentsRepo m.DepartmentRepository `inject:""`

	log  log.Logger
	coll string
}

func (repo *CategoriesRepo) Init() error {
	repo.coll = categoriesCollection
	if err := repo.ensureIndexes(); err != nil {
		return err
	}
	// if settings.Environment == settings.Dev {
	// 	if err := repo.initTestCategories(); err != nil {
	// 		return err
	// 	}

	// }
	return nil
}

func (repo *CategoriesRepo) Find(spec m.Specification) ([]*m.Category, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	pipe := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage(departmentsCollection, "departmentId", "_id", "department"),
		NewUnwindStage("$department"),
	}

	if withPagination, ok := spec.(m.SpecificationWithPagination); ok {
		if skip := withPagination.Offset(); skip != 0 {
			pipe = append(pipe, bson.M{"$skip": skip})
		}
		if limit := withPagination.Limit(); limit != 0 {
			pipe = append(pipe, bson.M{"$limit": limit})
		}
	}
	var categories = []*m.Category{}
	if err := c.Pipe(pipe).All(&categories); err != nil {
		if err == mgo.ErrNotFound {
			return categories, util.ErrNotFound
		}
	}
	if len(categories) == 0 {
		return nil, util.ErrNotFound
	}

	return categories, nil
}

func (repo *CategoriesRepo) FindOne(spec m.Specification) (*m.Category, error) {
	categories, err := repo.Find(spec)
	if err != nil {
		return &m.Category{}, err
	}

	return categories[0], nil
}

func (repo *CategoriesRepo) Save(cat m.Category) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Insert(cat); err != nil {
		return err
	}
	return nil
}

func (repo *CategoriesRepo) Update(spec m.Specification, upd interface{}) (*m.Category, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": upd,
	}); err != nil {
		return &m.Category{}, err
	}
	return repo.FindOne(spec)
}

func (repo *CategoriesRepo) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}

func (repo *CategoriesRepo) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(spec.Query())
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}

func (repo *CategoriesRepo) ensureIndexes() error {
	//todo complete ensure indexes
	return nil
}

// func (repo *CategoriesRepo) initTestCategories() error {

// 	deps, _ := repo.DepartmentsRepo.Find(m.NewQuery(bson.M{}))
// 	for i := 0; i < 10; i++ {
// 		_ = repo.Save(m.Category{
// 			Id:           id.New(),
// 			Title:        fmt.Sprintf("category %v", i),
// 			DepartmentId: deps[rand.Intn(len(deps)-1)].Id,
// 			Description:  "Some description",
// 		})

// 	}

// 	return nil
// }
