package models

import (
	"gerenciador/pkg/id"

	"github.com/globalsign/mgo/bson"
	validation "github.com/go-ozzo/ozzo-validation"
	"github.com/pkg/errors"
)

var ErrBrandNotFound = errors.New("brand not found")

type BrandRepository interface {
	Find(spec Specification) ([]*Brand, error)
	FindOne(spec Specification) (*Brand, error)
	Save(brand BrandRequest) error
	Update(spec Specification, upd interface{}) (*Brand, error)
	Count(spec Specification) (int, error)
	Remove(spec Specification) error
}
type Brand struct {
	Id             id.ID   `json:"_id" bson:"_id"`
	Title          string  `json:"title" bson:"title"`
	Description    string  `json:"description" bson:"description"`
	DepartmentID   []id.ID `json:"departmentIds" bson:"departmentIds"`
	OrganizationID id.ID   `json:"organizationId" bson:"organizationId"`

	Departments *[]Department `json:"departments,omitempty" bson:"departments,omitempty"`
}

type BrandRequest struct {
	Title          string  `json:"title" bson:"title"`
	Description    string  `json:"description" bson:"description"`
	DepartmentID   []id.ID `json:"departmentIds" bson:"departmentIds"`
	OrganizationID id.ID   `json:"organizationId" bson:"organizationId"`
}

func (br Brand) Validate() ValidationErrors {
	return OzzoValidation(
		validation.ValidateStruct(&br,
			validation.Field(&br.Title, validation.Length(3, 0)),
			validation.Field(&br.Description, validation.Length(3, 0)),
		))
}

type FindBrandQuery struct {
	Title       string
	Description string

	Pagination
}

func (q FindBrandQuery) Query() bson.M {
	query := bson.M{}

	if q.Title != "" {
		query["title"] = makeRegexBson(q.Title)
	}
	if q.Description != "" {
		query["description"] = makeRegexBson(q.Description)
	}

	return query
}
