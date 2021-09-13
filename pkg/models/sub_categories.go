package models

import (
	"gerenciador/pkg/id"

	"github.com/globalsign/mgo/bson"
	validation "github.com/go-ozzo/ozzo-validation"
)

type SubCategoryRepository interface {
	Find(spec Specification) ([]*SubCategory, error)
	FindOne(spec Specification) (*SubCategory, error)
	Save(subCat SubCategory) error
	Update(spec Specification, upd interface{}) (*SubCategory, error)
	Count(spec Specification) (int, error)
	Remove(spec Specification) error
}
type SubCategory struct {
	Id             id.ID  `json:"_id" bson:"_id"`
	CategoryId     id.ID  `json:"categoryId" bson:"categoryId"`
	Title          string `json:"title" bson:"title"`
	Description    string `json:"description" bson:"description"`
	OrganizationID id.ID  `json:"organizationId" bson:"organizationId"`

	Category *Category `json:"category" bson:"category"`
}

func (c SubCategory) Validate() ValidationErrors {
	return OzzoValidation(
		validation.ValidateStruct(&c,
			validation.Field(&c.Title, validation.Length(3, 0)),
			validation.Field(&c.Description, validation.Length(3, 0)),
		))
}

type FindSubcategoryQuery struct {
	Title       string
	Description string
	CategoryId  id.ID

	Pagination
}

func (q FindSubcategoryQuery) Query() bson.M {
	query := bson.M{}

	if q.Title != "" {
		query["title"] = makeRegexBson(q.Title)
	}
	if q.Description != "" {
		query["description"] = makeRegexBson(q.Description)
	}
	if q.CategoryId.Valid() {
		query["categoryId"] = q.CategoryId
	}

	return query
}
