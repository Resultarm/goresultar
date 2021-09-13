package mongostore

import (
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"

	"github.com/globalsign/mgo"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "RolesRepo",
		Priority: registry.Medium,
		Instance: &RolesRepo{},
	})
}

type RolesRepo struct {
	Store *MongoStore `inject:""`

	log  log.Logger
	coll string
}

func (repo *RolesRepo) Init() error {
	repo.coll = rolesCollection
	repo.log = log.New("RolesRepo")
	if err := repo.ensureIndexes(); err != nil {
		return err
	}
	return repo.ensureRoles()
}

//func (repo *RolesRepo) Find(spec m.Specification) (m.Admins, error) {
//	sess := repo.Store.Session()
//	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
//
//	pipe := []bson.M{
//	}
//
//	var admins = m.Admins{}
//	if err := c.Pipe(pipe).All(&admins); err != nil {
//		if err == mgo.ErrNotFound {
//			return admins, m.ErrAdminNotFound
//		}
//		return nil, err
//	}
//	if len(admins) == 0 {
//		return nil, m.ErrAdminNotFound
//	}
//
//	return admins, nil
//}
//func (repo *RolesRepo) FindOne(spec m.Specification) (*m.Admin, error) {
//	admins, err := repo.Find(spec)
//	if err != nil {
//		return nil, err
//	}
//
//	return admins[0], nil
//}

func (repo *RolesRepo) Save(user *m.Role) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Insert(user); err != nil {
		return err
	}
	return nil
}
func (repo *RolesRepo) ensureIndexes() error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	indexes := []mgo.Index{
		//todo proper indexes
		{
			Key:      []string{"roleNumber", "name"},
			Unique:   true,
			DropDups: false,
		},
	}
	for _, index := range indexes {
		err := c.EnsureIndex(index)
		if err != nil {
			repo.log.Error(err.Error())
			return err
		}
	}

	return nil
}

func (repo *RolesRepo) ensureRoles() error {

	for _, role := range m.RolesList {

		_ = repo.Save(&role)
	}
	return nil
}
