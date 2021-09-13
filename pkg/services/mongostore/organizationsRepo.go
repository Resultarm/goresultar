package mongostore

import (
	"fmt"
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "OrganizationsRepo",
		Priority: registry.Medium,
		Instance: &OrganizationsRepo{},
	})
}

type OrganizationsRepo struct {
	Store *MongoStore `inject:""`

	log  log.Logger
	coll string
}

func (repo *OrganizationsRepo) Init() error {
	repo.coll = organizationsCollection
	if err := repo.ensureIndexes(); err != nil {
		return err
	}
	return nil
}

func (repo *OrganizationsRepo) Find(spec m.Specification) ([]*m.Organization, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	fmt.Println("query ", spec.Query())
	pipe := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
	}
	fmt.Println("pipe", pipe)
	if withPagination, ok := spec.(m.SpecificationWithPagination); ok {
		if skip := withPagination.Offset(); skip != 0 {
			pipe = append(pipe, bson.M{"$skip": skip})
		}
		if limit := withPagination.Limit(); limit != 0 {
			pipe = append(pipe, bson.M{"$limit": limit})
		}
	}

	fmt.Println("pipe", pipe)

	var orgs = []*m.Organization{}
	if err := c.Pipe(pipe).All(&orgs); err != nil {
		if err == mgo.ErrNotFound {
			return orgs, m.ErrOrganizationNotFound
		}
	}
	if len(orgs) == 0 {
		return nil, m.ErrOrganizationNotFound
	}

	return orgs, nil
}

func (repo *OrganizationsRepo) FindOne(spec m.Specification) (*m.Organization, error) {
	orgs, err := repo.Find(spec)
	if err != nil {
		return &m.Organization{}, err
	}

	return orgs[0], nil
}

func (repo *OrganizationsRepo) Save(org m.Organization) error {

	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	totalDoc, err := c.Find(bson.M{}).Count()
	if err != nil {
		return err
	}

	org.OrgID = totalDoc + 1

	if err := c.Insert(org); err != nil {
		return err
	}
	return nil
}

// func (repo *OrganizationsRepo) Statistics(spec m.Specification) (*map[string]interface{}, error) {
// 	sess := repo.Store.Session()
// 	q := []map[string]interface{}{{
// 		"$match": spec.Query(),
// 		"$group": bson.M{"_id": nil, "count": bson.M{"$sum": 1}},
// 	}}

// 	o := map[string]interface{}{}
// 	c := sess.DB(repo.Store.Config.DatabaseName).C("brands")
// 	if err := c.Pipe(q).One(&o); err != nil {
// 		if err == mgo.ErrNotFound {
// 			return &o, m.ErrOrderNotFound
// 		}
// 	}

// 	repo.log.Info("brands ", o)

// 	return &o, nil
// }

func (repo *OrganizationsRepo) Update(spec m.Specification, upd interface{}) (*m.Organization, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": upd,
	}); err != nil {
		return &m.Organization{}, err
	}
	return repo.FindOne(spec)
}

func (repo *OrganizationsRepo) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}
func (repo *OrganizationsRepo) ensureIndexes() error {
	//todo complete ensure indexes
	return nil
}

func (repo *OrganizationsRepo) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(WrapSafeDeleteQuery(spec.Query()))
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}
