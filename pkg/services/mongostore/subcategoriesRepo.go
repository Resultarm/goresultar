package mongostore

import (
	"fmt"
	"gerenciador/pkg/id"
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/util"
	"math/rand"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "SubcategoriesRepo",
		Priority: registry.Low,
		Instance: &SubcategoriesRepo{},
	})
}

type SubcategoriesRepo struct {
	Store        *MongoStore          `inject:""`
	CategoryRepo m.CategoryRepository `inject:""`

	log  log.Logger
	coll string
}

func (repo *SubcategoriesRepo) Init() error {
	repo.coll = subcategoriesCollection
	if err := repo.ensureIndexes(); err != nil {
		return err
	}
	//if settings.Environment == settings.Dev {
	//	if err := repo.initTestSubCategories(); err != nil {
	//		return err
	//	}
	//}
	return nil
}

func (repo *SubcategoriesRepo) Find(spec m.Specification) ([]*m.SubCategory, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	pipe := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage(categoriesCollection, "categoryId", "_id", "category"),
		NewUnwindStage("$category"),
	}

	if withPagination, ok := spec.(m.SpecificationWithPagination); ok {
		if skip := withPagination.Offset(); skip != 0 {
			pipe = append(pipe, bson.M{"$skip": skip})
		}
		if limit := withPagination.Limit(); limit != 0 {
			pipe = append(pipe, bson.M{"$limit": limit})
		}
	}
	var subCat = []*m.SubCategory{}
	if err := c.Pipe(pipe).All(&subCat); err != nil {
		if err == mgo.ErrNotFound {
			return subCat, util.ErrNotFound
		}
	}
	if len(subCat) == 0 {
		return nil, util.ErrNotFound
	}

	return subCat, nil
}

func (repo *SubcategoriesRepo) FindOne(spec m.Specification) (*m.SubCategory, error) {
	subCat, err := repo.Find(spec)
	if err != nil {
		return &m.SubCategory{}, err
	}

	return subCat[0], nil
}

func (repo *SubcategoriesRepo) Save(subCat m.SubCategory) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Insert(subCat); err != nil {
		return err
	}
	return nil
}

func (repo *SubcategoriesRepo) Update(spec m.Specification, upd interface{}) (*m.SubCategory, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": upd,
	}); err != nil {
		return &m.SubCategory{}, err
	}
	return repo.FindOne(spec)
}

func (repo *SubcategoriesRepo) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}
func (repo *SubcategoriesRepo) ensureIndexes() error {
	//todo complete ensure indexes
	return nil
}

func (repo *SubcategoriesRepo) initTestSubCategories() error {

	subcats, _ := repo.Find(m.NewQuery(bson.M{}))
	if len(subcats) != 0 {
		return nil
	}
	cats, _ := repo.CategoryRepo.Find(m.NewQuery(bson.M{}))

	for i := 0; i < 10; i++ {
		_ = repo.Save(m.SubCategory{
			Id:          id.New(),
			Title:       fmt.Sprintf("subcategory %v", i),
			CategoryId:  cats[rand.Intn(len(cats)-1)].Id,
			Description: "Some description",
		})
	}

	return nil
}

func (repo *SubcategoriesRepo) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(WrapSafeDeleteQuery(spec.Query()))
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}
