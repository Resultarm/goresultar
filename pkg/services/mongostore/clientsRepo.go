package mongostore

import (
	"context"
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/auth"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/util"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "ClientsRepo",
		Priority: registry.Medium,
		Instance: &ClientsRepo{},
	})
}

type ClientsRepo struct {
	Store *MongoStore `inject:""`
	DB    *mongo.Database

	log  log.Logger
	coll string
}

func New(db *mongo.Database) *ClientsRepo {
	return &ClientsRepo{DB: db, coll: "clients"}
}

var _ m.ClientsRepository = &ClientsRepo{}

func (repo *ClientsRepo) Init() error {
	repo.coll = clientsCollection
	if err := repo.ensureIndexes(); err != nil {
		return err
	}

	// if settings.Environment == settings.Dev {
	// 	repo.initTestClients()
	// }
	return nil
}

func (repo *ClientsRepo) Find(spec m.Specification) ([]*m.Client, error) {
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

	var clients = []*m.Client{}
	if err := c.Pipe(pipe).All(&clients); err != nil {
		if err == mgo.ErrNotFound {
			return clients, util.ErrNotFound
		}
	}
	if len(clients) == 0 {
		return nil, util.ErrNotFound
	}

	return clients, nil
}

func (repo *ClientsRepo) FindOne(spec m.Specification) (*m.Client, error) {
	clients, err := repo.Find(spec)
	if err != nil {
		return &m.Client{}, err
	}

	return clients[0], nil
}

func (repo *ClientsRepo) GetByEmail(email string) (*m.Client, error) {
	clients, err := repo.Find(m.FindByEmailQuery{email})
	if err != nil {
		return nil, err
	}

	return clients[0], nil
}

func (repo *ClientsRepo) Save(client *m.ClientPayload) (*primitive.ObjectID, error) {

	c := repo.DB.Collection(repo.coll)

	if client.Password != "" {
		var err error
		client.Password, err = auth.Encode(client.Password)
		if err != nil {
			return nil, err
		}
	}

	result, err := c.InsertOne(context.TODO(), client)
	if err != nil {
		return nil, err
	}

	id := result.InsertedID.(primitive.ObjectID)
	return &id, nil
}

func (repo *ClientsRepo) Update(spec m.Specification, client m.ClientPayload) (*m.Client, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if client.Password != "" {
		var err error
		client.Password, err = auth.Encode(client.Password)
		if err != nil {
			return nil, err
		}
	}

	if err := c.Update(spec.Query(), bson.M{
		"$set": client,
	}); err != nil {
		return nil, err
	}
	return repo.FindOne(spec)
}

func (repo *ClientsRepo) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Remove(spec.Query()); err != nil {
		return err
	}
	return nil
}

func (repo *ClientsRepo) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}

func (repo *ClientsRepo) ensureIndexes() error {
	//todo complete ensure indexes
	return nil
}

// func (repo *ClientsRepo) initTestClients() error {

// 	clients, _ := repo.Find(m.NewQuery(bson.M{}))
// 	if len(clients) > 0 {
// 		return nil
// 	}

// 	names := []string{"Mike", "Jay", "Max", "Siri", "Alice"}
// 	lastNames := []string{"Doe", "McCall", "Black", "Winter"}
// 	for i := 0; i < 10; i++ {
// 		_ = repo.Save(m.Client{
// 			Id:         id.New(),
// 			FirstName:  names[rand.Intn(len(names))],
// 			LastName:   lastNames[rand.Intn(len(lastNames))],
// 			CellNumber: util.RandomString(10),
// 			Address:    "",
// 			Status:     "",
// 			Comment:    "",
// 		})

// 	}

// 	return nil
// }
