package models

import (
	"errors"
	"gerenciador/pkg/id"

	"github.com/globalsign/mgo/bson"
	validation "github.com/go-ozzo/ozzo-validation"
)

var ErrCategoryNotFound = errors.New("category not found")

type CategoryRepository interface {
	Find(spec Specification) ([]*Category, error)
	FindOne(spec Specification) (*Category, error)
	Save(subCat Category) error
	Update(spec Specification, upd interface{}) (*Category, error)
	Count(spec Specification) (int, error)
	Remove(spec Specification) error
}
type Category struct {
	Id           id.ID  `json:"_id" bson:"_id"`
	Title        string `json:"title" bson:"title"`
	DepartmentId id.ID  `json:"departmentId" bson:"departmentId"`
	Description  string `json:"description" bson:"description"`

	Department     *Department `json:"department" bson:"department"`
	OrganizationID id.ID       `json:"organizationId" bson:"organizationId"`
}

func (c Category) Validate() ValidationErrors {
	return OzzoValidation(
		validation.ValidateStruct(&c,
			validation.Field(&c.Title, validation.Length(3, 0)),
			validation.Field(&c.Description, validation.Length(3, 0)),
		))
}

type FindCategoryQuery struct {
	Title          string
	Description    string
	DepartmentId   id.ID
	OrganizationID []id.ID

	Pagination
}

func (q FindCategoryQuery) Query() bson.M {
	query := bson.M{}

	if q.Title != "" {
		query["title"] = makeRegexBson(q.Title)
	}
	if q.Description != "" {
		query["description"] = makeRegexBson(q.Description)
	}
	if q.DepartmentId.Valid() {
		query["departmentId"] = q.DepartmentId
	}

	if len(q.OrganizationID) > 0 {
		var validIDs []id.ID
		for _, id := range q.OrganizationID {
			validIDs = append(validIDs, id)
		}
		query["organizationId"] = bson.M{"$in": validIDs}
	}

	return query
}
