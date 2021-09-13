package mongostore

import (
	//"gerenciador/pkg/services/registry"
	//"gerenciador/pkg/settings"
	"fmt"
	"gerenciador/pkg/services/registry"
	"gerenciador/pkg/settings"
	"time"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "MongoStore",
		Priority: registry.High,
		Instance: &MongoStore{},
	})
}

type MongoStore struct {
	Config *settings.MongoConf `inject:""`

	dbName string
}

func (store *MongoStore) Init() error {
	store.dbName = store.Config.DatabaseName
	return store.createDbSession()
}

var session *mgo.Session

func (store MongoStore) Session() *mgo.Session {
	if session == nil {
		var err error
		url := fmt.Sprintf("mongodb://%v:%v", store.Config.Host, store.Config.Port)
		session, err = mgo.DialWithInfo(&mgo.DialInfo{
			Addrs: []string{url},
			//Username: AppConfig.DBUser,
			//Password: DBPwd,
			Timeout: time.Second,
		})
		if err != nil {

		}
	}

	return session
}

func (store MongoStore) createDbSession() error {
	var err error
	url := fmt.Sprintf("mongodb://%v:%v", store.Config.Host, store.Config.Port)
	//url = "mongodb://localhost:27017/gerenciador"
	//session, err = mgo.DialWithInfo(&mgo.DialInfo{
	//	Addrs: []string{url},
	//	//Password: AppConfig.DBPwd,
	//	Timeout:  time.Second,
	//})
	session, err = mgo.Dial(url)
	if err != nil {
		return err
	}

	// Create connect

	return err
}

//$lookup:
//    {
//      from: <collection to join>,
//      localField: <field from the input documents>,
//      foreignField: <field from the documents of the "from" collection>,
//      as: <output array field>
//    }
func NewLookupStage(from, localField, foreignField, as string) bson.M {
	return bson.M{
		"$lookup": bson.M{
			"from":         from,
			"localField":   localField,
			"foreignField": foreignField,
			"as":           as,
		},
	}
}

func NewAnd(op1 ...bson.M) bson.M {
	return bson.M{"$and": op1}
}

func NewEq(op1 ...bson.M) bson.M {
	return bson.M{"$eq": op1}
}

func NewOR(op1, op2 bson.M) bson.M {
	return bson.M{"$or": [2]bson.M{op1, op2}}
}

func NewSize(f string) bson.M {
	return bson.M{"$size": f}
}

func NewLT(op1, op2 interface{}) bson.M {
	return bson.M{"$lt": [2]interface{}{op1, op2}}
}

func NewGT(op1, op2 interface{}) bson.M {
	return bson.M{"$gt": [2]interface{}{op1, op2}}
}

func NewUnwindStage(name string) bson.M {
	return bson.M{
		"$unwind": bson.M{
			"path":                       name,
			"preserveNullAndEmptyArrays": true,
		},
	}
}

func NewArraySum(v string) bson.M {
	return bson.M{"$sum": bson.M{"$sum": v}}
}

func WrapSafeDeleteQuery(query bson.M) bson.M {
	query["deletedAt"] = nil
	return query
}

func RemoveEmpty(name string) bson.M {
	return bson.M{
		"$match": bson.M{name: bson.M{"$ne": []interface{}{}}, name + ".deletedAt": nil},
	}
}
