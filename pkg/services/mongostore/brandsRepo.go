package mongostore

import (
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "BrandsRepo",
		Priority: registry.Medium,
		Instance: &BrandsRepo{},
	})
}

type BrandsRepo struct {
	Store *MongoStore `inject:""`

	log  log.Logger
	coll string
}

func (repo *BrandsRepo) Init() error {
	repo.coll = brandsCollection
	if err := repo.ensureIndexes(); err != nil {
		return err
	}
	// if settings.Environment == settings.Dev {
	// 	if err := repo.initTestBrands(); err != nil {
	// 		return err
	// 	}

	// }
	return nil
}

func (repo *BrandsRepo) Find(spec m.Specification) ([]*m.Brand, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	pipe := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage("departments", "departmentIds", "_id", "departments"),
		// NewUnwindStage("$department"),
	}

	var brands = []*m.Brand{}
	if err := c.Pipe(pipe).All(&brands); err != nil {
		if err == mgo.ErrNotFound {
			return brands, m.ErrBrandNotFound
		}
	}
	if len(brands) == 0 {
		return nil, m.ErrBrandNotFound
	}

	return brands, nil
}

func (repo *BrandsRepo) FindOne(spec m.Specification) (*m.Brand, error) {
	brands, err := repo.Find(spec)
	if err != nil {
		return &m.Brand{}, err
	}

	return brands[0], nil
}

func (repo *BrandsRepo) Save(brand m.BrandRequest) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Insert(brand); err != nil {
		return err
	}
	return nil
}

func (repo *BrandsRepo) Update(spec m.Specification, upd interface{}) (*m.Brand, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": upd,
	}); err != nil {
		return &m.Brand{}, err
	}
	return repo.FindOne(spec)
}

func (repo *BrandsRepo) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}

func (repo *BrandsRepo) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(spec.Query())
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}

func (repo *BrandsRepo) ensureIndexes() error {
	//todo complete ensure indexes
	return nil
}
