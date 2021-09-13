package mongostore

import (
	log "gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

type ChequeRepository interface {
	Find(spec m.Specification) ([]*m.Cheque, error)
	FindOne(spec m.Specification) (*m.Cheque, error)
	Save(cheque *m.Cheque) error
	Update(spec m.Specification, cheque *m.Cheque) (*m.Cheque, error)
	Remove(spec m.Specification) error
	Count(spec m.Specification) (int, error)
	ChangeStatus(spec m.Specification, status m.ChequeStatus, comment string) (*m.Cheque, error)
}

var _ ChequeRepository = Cheque{}

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "Cheque",
		Priority: registry.Medium,
		Instance: &Cheque{coll: "cheques"},
	})
}

type Cheque struct {
	Store *MongoStore `inject:""`
	coll  string
}

func (repo Cheque) Init() error {
	return nil
}

func (repo Cheque) Find(spec m.Specification) ([]*m.Cheque, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	query := spec.Query()
	cheques := []*m.Cheque{}
	if err := c.Find(query).All(&cheques); err != nil {
		if err != mgo.ErrNotFound {
			return cheques, err
		}
	}

	return cheques, nil
}

func (repo Cheque) FindOne(spec m.Specification) (*m.Cheque, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var cheque m.Cheque
	if err := c.Find(WrapSafeDeleteQuery(spec.Query())).One(&cheque); err != nil {
		if err != mgo.ErrNotFound {
			return nil, err
		}
	}

	return &cheque, nil
}

func (repo Cheque) Save(cheque *m.Cheque) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	if err := c.Insert(cheque); err != nil {
		return err
	}
	return nil
}

func (repo Cheque) Update(spec m.Specification, cheque *m.Cheque) (*m.Cheque, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": cheque,
	}); err != nil {
		return nil, err
	}
	return repo.FindOne(spec)
}

func (repo Cheque) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}

func (repo Cheque) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(WrapSafeDeleteQuery(spec.Query()))
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}

func (repo Cheque) ChangeStatus(spec m.Specification, status m.ChequeStatus, comment string) (*m.Cheque, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": bson.M{"status": status, "comment": comment},
	}); err != nil {
		return nil, err
	}
	return repo.FindOne(spec)
}
