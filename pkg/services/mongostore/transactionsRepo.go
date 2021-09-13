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
		Name:     "TransactionsRepo",
		Priority: registry.Medium,
		Instance: &TransactionsRepo{},
	})
}

type TransactionsRepo struct {
	Store *MongoStore `inject:""`

	log  log.Logger
	coll string
}

func (repo *TransactionsRepo) Init() error {
	repo.coll = transactionsCollection
	if err := repo.ensureIndexes(); err != nil {
		return err
	}
	return nil
}

func (repo *TransactionsRepo) Find(spec m.Specification) ([]*m.Transaction, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	pipe := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage("cheques", "chequeId", "_id", "cheque"),
		NewUnwindStage("$cheque"),
	}

	if withPagination, ok := spec.(m.SpecificationWithPagination); ok {
		if skip := withPagination.Offset(); skip != 0 {
			pipe = append(pipe, bson.M{"$skip": skip})
		}
		if limit := withPagination.Limit(); limit != 0 {
			pipe = append(pipe, bson.M{"$limit": limit})
		}
	}
	var transactions = []*m.Transaction{}
	if err := c.Pipe(pipe).All(&transactions); err != nil {
		if err == mgo.ErrNotFound {
			return transactions, m.ErrOrderNotFound
		}
	}
	if len(transactions) == 0 {
		return nil, m.ErrTransactionNotFound
	}

	return transactions, nil
}

func (repo *TransactionsRepo) FindOne(spec m.Specification) (*m.Transaction, error) {
	transactions, err := repo.Find(spec)
	if err != nil {
		return &m.Transaction{}, err
	}

	return transactions[0], nil
}

func (repo *TransactionsRepo) Save(cmd m.CreateTransactionCmd) (*m.Transaction, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Insert(cmd); err != nil {
		return nil, err
	}
	return nil, nil
}

func (repo *TransactionsRepo) Update(spec m.Specification, upd interface{}) (*m.Transaction, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": upd,
	}); err != nil {
		return &m.Transaction{}, err
	}
	return repo.FindOne(spec)
}

func (repo *TransactionsRepo) Delete(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Remove(spec.Query()); err != nil {
		return err
	}
	return nil
}

func (repo *TransactionsRepo) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}

func (repo *TransactionsRepo) ensureIndexes() error {
	//todo complete ensure indexes
	return nil
}

func (repo *TransactionsRepo) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(WrapSafeDeleteQuery(spec.Query()))
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}
