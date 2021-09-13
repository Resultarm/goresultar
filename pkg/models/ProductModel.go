package models

import (
	"errors"
	"gerenciador/pkg/id"

	"github.com/globalsign/mgo/bson"
	validation "github.com/go-ozzo/ozzo-validation"
)

var ErrProductModelNotFound = errors.New("model not found")

type ProductModelsRepository interface {
	Find(spec Specification) ([]*ProductModel, error)
	FindOne(spec Specification) (*ProductModel, error)
	Save(subCat ProductModel) error
	Update(spec Specification, upd interface{}) (*ProductModel, error)
	Count(spec Specification) (int, error)
	Remove(spec Specification) error
}
type ProductModel struct {
	Id             id.ID  `json:"_id" bson:"_id"`
	BrandId        id.ID  `json:"brandId" bson:"brandId"`
	Title          string `json:"title" bson:"title"`
	Description    string `json:"description" bson:"description"`
	OrganizationID id.ID  `json:"organizationId" bson:"organizationId"`

	Brand *Brand `json:"brand" bson:"brand"`
}

func (model ProductModel) Validate() ValidationErrors {
	return OzzoValidation(
		validation.ValidateStruct(&model,
			validation.Field(&model.Title, validation.Length(3, 0)),
			validation.Field(&model.Description, validation.Length(3, 0)),
		))
}

type FindProductModelQuery struct {
	Title          string
	Description    string
	BrandId        id.ID
	OrganizationID id.ID

	Pagination
}

func (q FindProductModelQuery) Query() bson.M {
	query := bson.M{}

	if q.Title != "" {
		query["title"] = makeRegexBson(q.Title)
	}
	if q.Description != "" {
		query["description"] = makeRegexBson(q.Description)
	}
	if q.BrandId.Valid() {
		query["brandId"] = q.BrandId
	}

	if q.OrganizationID.Valid() {
		query["organizationId"] = q.OrganizationID
	}

	return query
}
