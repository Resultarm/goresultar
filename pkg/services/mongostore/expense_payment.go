package mongostore

import (
	log "gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"

	ts "gerenciador/pkg/timestamp"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

type ExpensePaymentRepository interface {
	Find(spec m.Specification) ([]*m.ExpensePayment, error)
	FindOne(spec m.Specification) (*m.ExpensePayment, error)
	Save(expense *m.ExpensePayment) error
	Update(spec m.Specification, expense *m.ExpensePayment) (*m.ExpensePayment, error)
	Delete(spec m.Specification) error
	Remove(spec m.Specification) error
	Count(spec m.Specification) (int, error)
}

var _ ExpensePaymentRepository = ExpensePayment{}

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "Expense Payment",
		Priority: registry.Medium,
		Instance: &ExpensePayment{coll: "expensePayments"},
	})
}

type ExpensePayment struct {
	Store *MongoStore `inject:""`
	coll  string
}

func (repo ExpensePayment) Init() error {
	return nil
}

func (repo ExpensePayment) Find(spec m.Specification) ([]*m.ExpensePayment, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	query := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage("cheques", "chequeIds", "_id", "cheques"),
	}

	payments := []*m.ExpensePayment{}
	if err := c.Pipe(query).All(&payments); err != nil {
		if err != mgo.ErrNotFound {
			return payments, err
		}
	}
	for _, p := range payments {
		p.CreatedAt = ts.Timestamp{Time: p.ID.Time()}
	}

	return payments, nil
}

func (repo ExpensePayment) FindOne(spec m.Specification) (*m.ExpensePayment, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var expense m.ExpensePayment
	if err := c.Find(WrapSafeDeleteQuery(spec.Query())).One(&expense); err != nil {
		if err != mgo.ErrNotFound {
			return nil, err
		}
	}
	expense.CreatedAt = ts.Timestamp{Time: expense.ID.Time()}

	return &expense, nil
}

func (repo ExpensePayment) Save(expense *m.ExpensePayment) error {
	sess := repo.Store.Session()

	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	if err := c.Insert(expense); err != nil {
		return err
	}
	return nil
}

func (repo ExpensePayment) Update(spec m.Specification, expense *m.ExpensePayment) (*m.ExpensePayment, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": expense,
	}); err != nil {
		return nil, err
	}
	return repo.FindOne(spec)
}

func (repo ExpensePayment) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}

func (repo ExpensePayment) Delete(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Remove(WrapSafeDeleteQuery(spec.Query())); err != nil {
		return err
	}
	return nil
}

// Remove removes all
func (repo ExpensePayment) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	i, err := c.RemoveAll(WrapSafeDeleteQuery(spec.Query()))
	log.Info("delete result: %d, %d", i.Matched, i.Removed)
	return err
}
