package models

import (
	"gerenciador/pkg/id"
	ts "gerenciador/pkg/timestamp"

	"github.com/globalsign/mgo/bson"
)

type Salary struct {
	Salary     float64        `json:"salary" bson:"salary"`
	Bonus      bool           `json:"13th" bson:"13th"`
	BonusDates []ts.Timestamp `json:"13thDates" bson:"13thDates"`
	Frequency  string         `json:"frequency" bson:"frequency"`
}

type UserDocument struct {
	Name string `json:"name" bson:"name"`
	URL  string `json:"url" bson:"url"`
}

type Admin struct {
	ID       id.ID  `json:"_id" bson:"_id"`
	Password string `json:"-" bson:"password"`

	Profile `json:",inline" bson:",inline"`

	IsRep           bool                 `json:"isRep" bson:"isRep"`
	BranchIDs       []id.ID              `json:"branchIds" bson:"branchIds"`
	DepartmentIDs   []id.ID              `json:"departmentIds" bson:"departmentIds"`
	RoleNumber      RoleNumber           `json:"roleNumber" bson:"roleNumber"`
	Commission      float64              `json:"commission" bson:"commission"`
	MaxOrders       int                  `json:"maxOrders" bson:"maxOrders"`
	AllowedStatuses []OrderProcessStatus `json:"allowedStatuses" bson:"allowedStatuses"`
	Salary          Salary               `json:"salary" bson:"salary"`
	Documents       []UserDocument       `json:"documents" bson:"documents"`
	OrganizationIDs []id.ID              `json:"organizationIds" bson:"organizationIds"`

	Role          *Role           `json:"role" bson:"role"`
	Organizations []*Organization `json:"organizations" bson:"organizations"`
}

type UserPayload struct {
	Password string `json:"password" bson:"password,omitempty"` // while updating user password not required
	Profile  `json:",inline" bson:",inline"`

	IsRep           bool                 `json:"isRep" bson:"isRep"`
	BranchIDs       []id.ID              `json:"branchIds" bson:"branchIds"`
	DepartmentIDs   []id.ID              `json:"departmentIds" bson:"departmentIds"`
	RoleNumber      RoleNumber           `json:"roleNumber" bson:"roleNumber"`
	Commission      float64              `json:"commission" bson:"commission"`
	MaxOrders       int                  `json:"maxOrders" bson:"maxOrders"`
	AllowedStatuses []OrderProcessStatus `json:"allowedStatuses" bson:"allowedStatuses"`
	Salary          Salary               `json:"salary" bson:"salary"`
	Documents       []UserDocument       `json:"documents" bson:"documents"`
	OrganizationIDs []id.ID              `json:"organizationIds" bson:"organizationIds"`
}
type AdminsRepository interface {
	Find(spec Specification) (Admins, error)
	FindOne(spec Specification) (*Admin, error)
	GetByEmail(email string) (*Admin, error)
	Save(product *UserPayload) error
	Update(spec Specification, upd *UserPayload) (*Admin, error)
	Remove(spec Specification) error
	Count(spec Specification) (int, error)
}

type Admins []*Admin

type FindAdminQuery struct {
	Email          string
	Username       string
	Roles          []RoleNumber
	PhoneNumber    string
	OrganizationID []id.ID

	Pagination
}

func (q FindAdminQuery) Query() bson.M {
	query := bson.M{}

	//if q.Title != "" {
	//	query["title"] = makeRegexBson(q.Title)
	//}
	if len(q.Roles) > 0 {
		query["roleNumber"] = bson.M{
			"$in": q.Roles,
		}
	}

	if len(q.OrganizationID) > 0 {
		var validIDs []id.ID
		for _, id := range q.OrganizationID {
			validIDs = append(validIDs, id)
		}
		query["organizationIds"] = bson.M{"$in": validIDs}
	}

	return query
}
