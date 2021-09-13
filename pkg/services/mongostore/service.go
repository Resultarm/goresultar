package mongostore

import (
	"errors"
	"gerenciador/pkg/log"
	"gerenciador/pkg/services/registry"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"

	m "gerenciador/pkg/models"
)

var ErrServiceNotFound = errors.New("service not found")

type ServiceRepository interface {
	UpdateStatus(spec m.Specification, status m.ProductStatus) error
}

type Service struct {
	Store *MongoStore `inject:""`

	log  log.Logger
	coll string
}

var _ ServiceRepository = &Service{}

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "ServiceRepository",
		Priority: registry.Medium,
		Instance: &Service{},
	})
}

func (repo *Service) Init() error {
	repo.coll = "products"

	return nil
}

func (repo *Service) Find(spec m.Specification) ([]*m.Service, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	query := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage(departmentsCollection, "departmentId", "_id", "department"),
		NewLookupStage(categoriesCollection, "categoryId", "_id", "category"),
		NewLookupStage(subcategoriesCollection, "subcategoryId", "_id", "subcategory"),
		NewUnwindStage("$department"),
		NewUnwindStage("$category"),
		NewUnwindStage("$subcategory"),
	}

	services := []*m.Service{}
	if err := c.Pipe(query).All(&services); err != nil {
		if err == mgo.ErrNotFound {
			return services, m.ErrProductNotFound
		}
	}

	return services, nil
}

func (repo *Service) UpdateStatus(spec m.Specification, status m.ProductStatus) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{"$set": bson.M{"status": status}}); err != nil {
		return err
	}
	return nil
}
