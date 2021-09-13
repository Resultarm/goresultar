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

var ErrTaskNotFound = errors.New("service not found")

type TaskRepository interface {
	Find(spec models.Specification) ([]*models.Task, error)
	FindOne(spec models.Specification) (*models.Task, error)
	Save(t *models.TaskRequest) error
	Update(spec models.Specification, t *models.TaskRequest) (*models.Task, error)
	Remove(spec m.Specification) error
}

type Task struct {
	Store *MongoStore `inject:""`

	log  log.Logger
	coll string
}

var _ TaskRepository = &Task{}

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "TaskRepository",
		Priority: registry.Medium,
		Instance: &Task{},
	})
}

func (repo *Task) Init() error {
	repo.coll = "task"

	return nil
}

func (repo *Task) Find(spec models.Specification) ([]*models.Task, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	query := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage(adminsCollection, "assigneeId", "_id", "assignee"),
		NewLookupStage(adminsCollection, "leaderId", "_id", "leader"),
		NewLookupStage(adminsCollection, "helperIds", "_id", "helpers"),
		NewLookupStage(organizationsCollection, "organizationId", "_id", "organization"),
		NewLookupStage(ordersCollection, "orderId", "_id", "order"),
		NewLookupStage(clientsCollection, "clientId", "_id", "client"),
		//NewLookupStage(clientsCollection, "vehicleId", "_id", "vehicle"),
		NewLookupStage(clientsCollection, "driverIds", "_id", "drivers"),
		NewUnwindStage("$assignee"),
		NewUnwindStage("$leader"),
		NewUnwindStage("$organization"),
		NewUnwindStage("$order"),
		NewUnwindStage("$client"),
		//NewUnwindStage("$vehicle"),
		NewUnwindStage("$drivers"),
	}

	tasks := []*models.Task{}
	if err := c.Pipe(query).All(&tasks); err != nil {
		if err == mgo.ErrNotFound {
			return tasks, ErrTaskNotFound
		}
	}

	return tasks, nil
}

func (repo *Task) FindOne(spec models.Specification) (*models.Task, error) {
	tasks, err := repo.Find(spec)
	if err != nil {
		return nil, err
	}
	return tasks[0], nil
}

func (repo *Task) Save(t *models.TaskRequest) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if t.OrderID != nil {
		orderColl := sess.DB(repo.Store.Config.DatabaseName).C(ordersCollection)
		result := orderColl.FindId(t.OrderID)
		var o models.Order
		if err := result.One(&o); err != nil {
			return err
		}
		t.ClientID = &o.ClientId
	}

	if err := c.Insert(t); err != nil {
		return err
	}
	return nil
}

func (repo *Task) Update(spec models.Specification, t *models.TaskRequest) (*models.Task, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": t,
	}); err != nil {
		return nil, err
	}
	return repo.FindOne(spec)
}

func (repo *Task) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(WrapSafeDeleteQuery(spec.Query()))
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}
