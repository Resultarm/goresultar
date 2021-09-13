package mongostore

import (
	"errors"
	log "gerenciador/pkg/log"
	"gerenciador/pkg/models"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

var ErrVehicleNotFound = errors.New("service not found")

type VehicleRepository interface {
	Find(spec models.Specification) ([]*models.Vehicle, error)
	FindOne(spec models.Specification) (*models.Vehicle, error)
	Save(t *models.VehicleRequest) error
	Update(spec models.Specification, t *models.VehicleRequest) (*models.Vehicle, error)
	Remove(spec m.Specification) error
}

type Vehicle struct {
	Store *MongoStore `inject:""`

	log  log.Logger
	coll string
}

var _ VehicleRepository = &Vehicle{}

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "VehicleRepository",
		Priority: registry.Medium,
		Instance: &Vehicle{},
	})
}

func (repo *Vehicle) Init() error {
	repo.coll = "vehicle"

	return nil
}

func (repo *Vehicle) Find(spec models.Specification) ([]*models.Vehicle, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	query := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage(adminsCollection, "assigneeId", "_id", "assignee"),
		NewLookupStage(adminsCollection, "driverId", "_id", "driver"),
		//NewLookupStage(tasksCollection, "taskId", "_id", "task"),
		NewLookupStage(organizationsCollection, "organizationId", "_id", "organization"),
		//NewLookupStage(ordersCollection, "orderId", "_id", "order"),
		//NewLookupStage(adminCollection, "adminId", "_id", "admin"),
		NewUnwindStage("$assignee"),
		NewUnwindStage("$driver"),
		NewUnwindStage("$organization"),
		//NewUnwindStage("$task"),
		//NewUnwindStage("$client"),
	}

	vehicles := []*models.Vehicle{}
	if err := c.Pipe(query).All(&vehicles); err != nil {
		if err == mgo.ErrNotFound {
			return vehicles, ErrVehicleNotFound
		}
	}

	return vehicles, nil
}

func (repo *Vehicle) FindOne(spec models.Specification) (*models.Vehicle, error) {
	vehicles, err := repo.Find(spec)
	if err != nil {
		return nil, err
	}
	return vehicles[0], nil
}

func (repo *Vehicle) Save(t *models.VehicleRequest) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	/*
		if t.driverId != nil {
			adminsColl := sess.DB(repo.Store.Config.DatabaseName).C(adminsCollection)
			result := adminsColl.FindId(t.driverId)
			var o models.Admin
			if err := result.One(&o); err != nil {
				return err
			}
			t.DriverID = &o.DriverID
		}
	*/
	if err := c.Insert(t); err != nil {
		return err
	}
	return nil
}

func (repo *Vehicle) Update(spec models.Specification, t *models.VehicleRequest) (*models.Vehicle, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": t,
	}); err != nil {
		return nil, err
	}
	return repo.FindOne(spec)
}

func (repo *Vehicle) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(WrapSafeDeleteQuery(spec.Query()))
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}
