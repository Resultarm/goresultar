package models

import (
	"errors"
	"gerenciador/pkg/id"
	ts "gerenciador/pkg/timestamp"

	"github.com/globalsign/mgo/bson"
	validation "github.com/go-ozzo/ozzo-validation"
)

var ErrOrganizationNotFound = errors.New("organization not found")

type OrganizationsRepository interface {
	Find(spec Specification) ([]*Organization, error)
	FindOne(spec Specification) (*Organization, error)
	Save(org Organization) error
	Update(spec Specification, upd interface{}) (*Organization, error)
	// Statistics(spec Specification) (*Organization, error)
	Count(spec Specification) (int, error)
	Remove(spec Specification) error
}
type Organization struct {
	Id          id.ID        `json:"_id" bson:"_id"`
	OrgID       int          `json:"organizationId" bson:"organizationId"`
	CreatedAt   ts.Timestamp `json:"createdAt" bson:"createdAt"`
	Title       string       `json:"title" bson:"title"`
	Description string       `json:"description" bson:"description"`
	Branches    []Branch     `json:"branches" bson:"branches,omitempty"`
	LogoURL     string       `json:"logoUrl" bson:"logoUrl"`
}

func (org Organization) Validate() ValidationErrors {
	return OzzoValidation(
		validation.ValidateStruct(&org,
			validation.Field(&org.Title, validation.Length(3, 0)),
			validation.Field(&org.Description, validation.Length(3, 0)),
		))
}

type Branch struct {
	Id          id.ID  `json:"_id" bson:"_id"`
	Title       string `json:"title" bson:"title"`
	Description string `json:"description" bson:"description"`
	PhoneNumber uint   `json:"phoneNumber" bson:"phoneNumber"`
}

type FindOrganizationQuery struct {
	ID          []id.ID
	Title       string
	Description string

	Pagination
}

func (q FindOrganizationQuery) Query() bson.M {
	query := bson.M{}

	if q.Title != "" {
		query["title"] = makeRegexBson(q.Title)
	}
	if q.Description != "" {
		query["description"] = makeRegexBson(q.Description)
	}
	if len(q.ID) > 0 {
		var validIDs []id.ID
		for _, id := range q.ID {
			validIDs = append(validIDs, id)
		}
		query["_id"] = bson.M{"$in": validIDs}
	}

	return query
}
