package mongostore

import (
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"
	"time"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

type ExpenseRepository interface {
	Find(spec m.Specification) ([]m.Expense, error)
	FindOne(spec m.Specification) (*m.Expense, error)
	Save(expense *m.Expense) error
	Update(spec m.Specification, expense *m.Expense) (*m.Expense, error)
	Delete(spec m.Specification) error
	Remove(spec m.Specification) error
	Count(spec m.Specification) (int, error)

	FindPartialPaid(spec m.Specification) ([]*m.Expense, error)
	FindPaid(spec m.Specification) ([]*m.Expense, error)
	FindNotPaid(spec m.Specification) ([]*m.Expense, error)
	FindNextMonthExpenses(spec m.Specification) ([]*m.Expense, error)
	FindDues(spec m.Specification) ([]*m.Expense, error)
}

var _ ExpenseRepository = Expense{}

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "Expense",
		Priority: registry.Medium,
		Instance: &Expense{coll: "expenses"},
	})
}

type Expense struct {
	Store *MongoStore `inject:""`
	coll  string
}

func (repo Expense) Init() error {
	return nil
}

func (repo Expense) Find(spec m.Specification) ([]m.Expense, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	query := []bson.M{
		{"$match": WrapSafeDeleteQuery(spec.Query())},
		NewLookupStage("departments", "moneySourceId", "_id", "moneySource"),
		NewLookupStage("cheques", "chequeIds", "_id", "cheques"),
		{"$addFields": bson.M{"moneySource": bson.M{"$arrayElemAt": []interface{}{"$moneySource", 0}}}},
	}
	expenses := []m.Expense{}
	if err := c.Pipe(query).All(&expenses); err != nil {
		if err != mgo.ErrNotFound {
			return expenses, err
		}
	}

	return expenses, nil
}

func (repo Expense) FindOne(spec m.Specification) (*m.Expense, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var expense m.Expense
	if err := c.Find(WrapSafeDeleteQuery(spec.Query())).One(&expense); err != nil {
		if err != mgo.ErrNotFound {
			return nil, err
		}
	}

	return &expense, nil
}

func (repo Expense) Save(expense *m.Expense) error {
	sess := repo.Store.Session()

	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	if err := c.Insert(expense); err != nil {
		return err
	}
	return nil
}

func (repo Expense) Update(spec m.Specification, expense *m.Expense) (*m.Expense, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Update(spec.Query(), bson.M{
		"$set": expense,
	}); err != nil {
		return nil, err
	}
	return repo.FindOne(spec)
}

func (repo Expense) Count(spec m.Specification) (int, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error
	if count, err = c.Find(WrapSafeDeleteQuery(spec.Query())).Count(); err != nil {
		return 0, err
	}
	return count, nil
}

func (repo Expense) Delete(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	if err := c.Remove(WrapSafeDeleteQuery(spec.Query())); err != nil {
		return err
	}
	return nil
}

func (repo Expense) FindPaid(spec m.Specification) ([]*m.Expense, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	repeatedQ := bson.M{"$in": []interface{}{"$frequency", []m.FrequencyType{m.ExpenseFrequencyDaily, m.ExpenseFrequencyMonthly, m.ExpenseFrequencyWeekly}}}
	repeatedVariableQ := NewAnd(bson.M{"$eq": []interface{}{"$fixed", false}}, repeatedQ)
	customQ := bson.M{"frequency": "custom"}
	oneTimePaid := NewAnd(customQ, bson.M{"$eq": []interface{}{"$numTimes", 1}}, bson.M{"$eq": []interface{}{NewSize("$payments"), 1}})
	paidQ := NewOR(repeatedVariableQ, oneTimePaid)
	query := []bson.M{
		{"$match": spec.Query()},
		NewLookupStage("expensePayments", "_id", "expenseId", "payments"),
		{"$match": bson.M{"$expr": paidQ}},
	}
	expenses := []*m.Expense{}
	if err := c.Pipe(query).All(&expenses); err != nil {
		return expenses, err
	}

	return expenses, nil
}

func (repo Expense) FindPartialPaid(spec m.Specification) ([]*m.Expense, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	repeatedQ := bson.M{"$in": []interface{}{"$frequency", []m.FrequencyType{m.ExpenseFrequencyDaily, m.ExpenseFrequencyMonthly, m.ExpenseFrequencyWeekly}}}
	repeatedAndFixedQ := NewAnd(bson.M{"$eq": []interface{}{"$fixed", true}}, repeatedQ)
	customQ := bson.M{"frequency": "custom"}
	partialNumQ := NewAnd(NewLT(NewSize("$payments"), "$numTimes"), NewGT("$payments", 0), customQ)
	customAndPartialQ := NewOR(partialNumQ, repeatedAndFixedQ)
	query := []bson.M{
		{"$match": spec.Query()},
		NewLookupStage("expensePayments", "_id", "expenseId", "payments"),
		{"$match": bson.M{"$expr": customAndPartialQ}},
	}

	b, _ := bson.MarshalJSON(query)
	log.Info(string(b))

	expenses := []*m.Expense{}
	if err := c.Pipe(query).All(&expenses); err != nil {
		return expenses, err
	}

	return expenses, nil
}

func (repo Expense) FindNotPaid(spec m.Specification) ([]*m.Expense, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	query := []bson.M{
		{"$match": spec.Query()},
		NewLookupStage("expensePayments", "_id", "expenseId", "payments"),
		{"$match": bson.M{"$expr": bson.M{"$eq": []interface{}{NewSize("$payments"), 0}}}},
	}
	expenses := []*m.Expense{}
	if err := c.Pipe(query).All(&expenses); err != nil {
		return expenses, err
	}

	return expenses, nil
}

func (repo Expense) FindNextMonthExpenses(spec m.Specification) ([]*m.Expense, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	repeatedQ := bson.M{"$in": []interface{}{"$frequency", []m.FrequencyType{m.ExpenseFrequencyDaily, m.ExpenseFrequencyMonthly, m.ExpenseFrequencyWeekly}}}
	repeatedAndFixedQ := NewAnd(bson.M{"$eq": []interface{}{"$fixed", true}}, repeatedQ)

	query := []bson.M{
		{"$match": spec.Query()},
		NewLookupStage("expensePayments", "_id", "expenseId", "payments"),
		{"$match": bson.M{"$expr": repeatedAndFixedQ}},
	}
	expenses := []*m.Expense{}
	if err := c.Pipe(query).All(&expenses); err != nil {
		return expenses, err
	}

	return expenses, nil
}

func (repo Expense) FindDues(spec m.Specification) ([]*m.Expense, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	expenses := []*m.Expense{}
	if err := c.Find(spec.Query()).All(&expenses); err != nil {
		return expenses, err
	}

	dues := []*m.Expense{}
	todayDay := time.Now().Day()
	for _, e := range expenses {
		if !e.DueDate.Time.IsZero() {
			if e.DueDate.Time.Day() < todayDay {
				dues = append(dues, e)
			}
		}
	}

	return dues, nil
}

func (repo Expense) Remove(spec m.Specification) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)
	_, err := c.RemoveAll(WrapSafeDeleteQuery(spec.Query()))
	return err
}
