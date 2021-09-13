package models

import (
	"errors"
	"gerenciador/pkg/id"

	"github.com/globalsign/mgo/bson"
	validation "github.com/go-ozzo/ozzo-validation"
	_ "github.com/go-sql-driver/mysql"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var ErrDepartmentNotFound = errors.New("department not found")

type Department struct {
	ID             id.ID         `json:"_id" bson:"_id"`
	Title          string        `json:"title" bson:"title"`
	Description    string        `json:"description" bson:"description"`
	Categories     *[]Categoryv2 `json:"categories"`
	OrganizationID id.ID         `json:"organizationId" bson:"organizationId"`
}

type Categoryv2 struct {
	Title          string             `json:"title" bson:"title"`
	Description    string             `json:"description" bson:"description"`
	DepartmentID   primitive.ObjectID `json:"departmentId" bson:"departmentId"`
	SubCategories  *[]SubCategoryv2   `json:"subcategories" bson:"-"`
	OrganizationID primitive.ObjectID `json:"-" bson:"organizationId"`
}

type SubCategoryv2 struct {
	Title          string             `json:"title" bson:"title"`
	Description    string             `json:"description" bson:"description"`
	CategoryID     primitive.ObjectID `json:"categoryId" bson:"categoryId"`
	OrganizationID primitive.ObjectID `json:"-" bson:"organizationId"`
}

type DepartmentRequest struct {
	Title          string              `json:"title" bson:"title"`
	Description    string              `json:"description" bson:"description"`
	Categories     *[]Categoryv2       `json:"categories" bson:"-"`
	OrganizationID *primitive.ObjectID `json:"-" bson:"organizationId,omitempty"` // for update organizationId not required
}

type DepartmentMoney struct {
	ID             id.ID   `json:"_id" bson:"_id"`
	Title          string  `json:"title" bson:"title"`
	Paid           float64 `json:"paid" bson:"paid"`
	Cost           float64 `json:"cost" bson:"cost"`
	Profit         float64 `json:"profit" bson:"profit"`
	OrganizationID id.ID   `json:"organizationId" bson:"organizationId"`
}
type DepartmentRepository interface {
	Find(spec Specification) ([]*Department, error)
	FindOne(spec Specification) (*Department, error)
	// Save(department DepartmentRequest) error
	// Update(spec Specification, upd *DepartmentRequest) (*Department, error)
	Count(spec Specification) (int, error)
	DepartmentsWithProfits(spec Specification) ([]*DepartmentMoney, error)
	Remove(spec Specification) error
}

func (dep Department) Validate() (errs ValidationErrors) {
	return OzzoValidation(
		validation.ValidateStruct(&dep,
			validation.Field(&dep.Title, validation.Length(3, 0)),
			validation.Field(&dep.Description, validation.Length(3, 0)),
		))
}

type FindDepartmentQuery struct {
	Title          string
	Description    string
	OrganizationID *id.ID

	Pagination
}

func (q FindDepartmentQuery) Query() bson.M {
	query := bson.M{}

	if q.Title != "" {
		query["title"] = makeRegexBson(q.Title)
	}
	if q.Description != "" {
		query["description"] = makeRegexBson(q.Description)
	}

	if q.OrganizationID != nil {
		query["organizationId"] = q.OrganizationID
	}

	return query
}
