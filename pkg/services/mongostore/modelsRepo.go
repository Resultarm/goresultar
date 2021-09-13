package mongostore

import (
	"encoding/json"
	"fmt"
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "ModelsRepo",
		Priority: registry.Medium,
		Instance: &ModelsRepo{},
	})
}

type ModelsRepo struct {
	Store *MongoStore `inject:""`

	log  log.Logger
	coll string
}

func (repo *ModelsRepo) Init() error {
	repo.coll = modelsCollection
	if err := repo.ensureIndexes(); err != nil {
		return err
	}
	// if settings.Environment == settings.Dev {
	// 	if err := repo.initTestModels(); err != nil {
	// 		return err
	// 	}

	// }
	return nil
}

func (repo *ModelsRepo) Find(spec m.Specification) ([]*m.ProductModel, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	pipe := []bson.M{
		NewLookupStage(brandsCollection, "brandId", "_id", "brand"),
		NewUnwindStage("$brand"),
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
	b, _ := json.Marshal(pipe)
	fmt.Println(string(b))

	var models = []*m.ProductModel{}
	if err := c.Pipe(pipe).All(&models); err != nil {
		if err == mgo.ErrNotFound {
			return models, m.ErrProductModelNotFound
		}
	}
	if len(models) == 0 {
		return nil, m.ErrProductModelNotFound
	}

	return models, nil
}

func (repo *ModelsRepo) FindOne(spec m.Specification) (*m.ProductModel, error) {
	models, err := repo.Find(spec)
	if err != nil {
		return &m.ProductModel{}, err
	}

	return models[0], nil
}

func (repo *ModelsRepo) Save(order m.ProductModel) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Insert(order); err != nil {
		return err
	}
	return nil
}

func (repo *ModelsRepo) Update(spec m.Specification, upd interface{}) (*m.ProductModel, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": upd,
	}); err != nil {
		return &m.ProductModel{}, err
	}
	return repo.FindOne(spec)
}

func (repo *ModelsRepo) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}
func (repo *ModelsRepo) ensureIndexes() error {
	//todo complete ensure indexes
	return nil
}

func (repo *ModelsRepo) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(WrapSafeDeleteQuery(spec.Query()))
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}
