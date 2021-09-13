package resource

import (
	"github.com/casbin/casbin/v2"
	"go.mongodb.org/mongo-driver/mongo"
)

type Resource struct {
	DB       *mongo.Database
	Enforcer *casbin.Enforcer
}

func New(DB *mongo.Database, enforcer *casbin.Enforcer) Resource {
	return Resource{DB: DB, Enforcer: enforcer}
}
