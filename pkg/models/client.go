package models

import (
	"gerenciador/pkg/id"

	"github.com/globalsign/mgo/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ClientsRepository interface {
	Find(spec Specification) ([]*Client, error)
	FindOne(spec Specification) (*Client, error)
	GetByEmail(email string) (*Client, error)
	Save(client *ClientPayload) (*primitive.ObjectID, error)
	Update(spec Specification, upd ClientPayload) (*Client, error)
	Remove(spec Specification) error
	Count(spec Specification) (int, error)
}

type IdentificationType string

var IdentificationTypePF IdentificationType = "pf"
var IdentificationTypePJ IdentificationType = "pj"

type ClientPayload struct {
	IdentificationType IdentificationType `json:"identificationType" bson:"identificationType"`

	// omitempty => DB has unique constraint, so can't store two empty strings
	IdentificationNumber string `json:"identificationNumber" bson:"identificationNumber,omitempty"`
	Password             string `json:"password" bson:"password,omitempty"`
	Profile              `json:",inline" bson:",inline"`
	OrganizationID       *primitive.ObjectID `bson:"organizationId,omitempty"`
}

type Client struct {
	ID                   id.ID              `json:"_id" bson:"_id"`
	Password             string             `json:"-" bson:"-"`
	IdentificationType   IdentificationType `json:"identificationType" bson:"identificationType"`
	IdentificationNumber string             `json:"identificationNumber" bson:"identificationNumber"`
	Profile              `json:",inline" bson:",inline"`
	OrganizationID       id.ID `json:"organizationId" bson:"organizationId"`
}

type FindClientQuery struct {
	Title          string
	Description    string
	OrganizationID []id.ID
	Pagination
}

func (q FindClientQuery) Query() bson.M {
	query := bson.M{}

	if len(q.OrganizationID) > 0 {
		var validIDs []id.ID
		for _, id := range q.OrganizationID {
			validIDs = append(validIDs, id)
		}
		query["organizationId"] = bson.M{"$in": validIDs}
	}

	return query
}
