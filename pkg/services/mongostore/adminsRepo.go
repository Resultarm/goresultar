package mongostore

import (
	log "gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/util"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
	"golang.org/x/crypto/bcrypt"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "AdminRepo",
		Priority: registry.Medium,
		Instance: &AdminRepo{},
	})
}

type AdminRepo struct {
	Store *MongoStore `inject:""`

	log  log.Logger
	coll string
}

var _ m.AdminsRepository = &AdminRepo{}

func (repo *AdminRepo) Init() error {
	repo.coll = adminsCollection
	repo.log = log.New("AdminRepo")
	if err := repo.ensureIndexes(); err != nil {
		return err
	}
	return nil
}

func (repo *AdminRepo) Find(spec m.Specification) (m.Admins, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	pipe := []bson.M{
		NewLookupStage(rolesCollection, "roleNumber", "roleNumber", "role"),
		NewUnwindStage("$role"),
		NewLookupStage(organizationsCollection, "organizationIds", "_id", "organizations"),
		{"$match": WrapSafeDeleteQuery(spec.Query())},
	}

	var admins = m.Admins{}
	if err := c.Pipe(pipe).All(&admins); err != nil {
		if err == mgo.ErrNotFound {
			return admins, util.ErrNotFound
		}
		return nil, err
	}
	if len(admins) == 0 {
		return nil, util.ErrNotFound
	}

	return admins, nil
}
func (repo *AdminRepo) GetByEmail(email string) (*m.Admin, error) {
	admins, err := repo.Find(m.FindByEmailQuery{email})
	if err != nil {
		return nil, err
	}

	return admins[0], nil
}

func (repo *AdminRepo) FindOne(spec m.Specification) (*m.Admin, error) {
	admins, err := repo.Find(spec)
	if err != nil {
		return nil, err
	}

	return admins[0], nil
}

func (repo *AdminRepo) Save(user *m.UserPayload) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), 8)
	if err != nil {
		repo.log.Error(err.Error())
	}
	user.Password = string(hash)

	if err := c.Insert(user); err != nil {
		return err
	}
	return nil
}
func (repo *AdminRepo) Update(spec m.Specification, upd *m.UserPayload) (*m.Admin, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if upd.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(upd.Password), 8)
		if err != nil {
			return nil, err
		}
		upd.Password = string(hash)
	}

	if err := c.Update(spec.Query(), bson.M{
		"$set": upd,
	}); err != nil {
		return &m.Admin{}, err
	}
	return nil, nil
}

func (repo *AdminRepo) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(spec.Query())
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}

func (repo *AdminRepo) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	q := WrapSafeDeleteQuery(spec.Query())
	log.Info("q", q)
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}

func (repo *AdminRepo) ensureIndexes() error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	indexes := []mgo.Index{
		{
			Key:      []string{"mobile", "email"},
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

func (repo *AdminRepo) ensureSuperAdmin() error {

	//_, err := repo.FindOne(m.NewQuery(bson.M{"roleNumber": m.SuperAdminRoleNumber}))
	//if err == nil {
	//	return nil
	//}
	////todo extract from config
	////hash, err := bcrypt.GenerateFromPassword([]byte("qwerty2020"), 8)
	////if err != nil {
	////	//logger.Warning(err.Error())
	////}
	//
	////todo save role to roleRepo
	//userId := id.New()
	//return repo.Save(&m.CreateAdminCmd{
	//	//Id:          userId,
	//	//Username:    "super_admin",
	//	Email:       "superadmin@gmail.com",
	//	//AccessToken: util.RandomString(10),
	//	//Password:    string(hash),
	//	RoleNumber:  m.SuperAdminRoleNumber,
	//	//Role: &m.Role{
	//	//	RoleNumber: m.SuperAdminRoleNumber,
	//	//	Operations: map[m.Operation]m.Permission{
	//	//		m.OperationProducts:  m.PermissionWrite,
	//	//		m.OperationOrders:    m.PermissionWrite,
	//	//		m.OperationDashboard: m.PermissionWrite,
	//	//	},
	//	//},
	//})
	return nil
}
