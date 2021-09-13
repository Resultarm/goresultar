package models

import (
	"gerenciador/pkg/id"
)

type ServiceStatus string

const (
	ServiceStatusActive   ServiceStatus = "active"
	ServiceStatusInactive ServiceStatus = "inactive"
	ServiceStatusOnHold   ServiceStatus = "onhold"
)

var ServiceStatuses = []ServiceStatus{ServiceStatusActive, ServiceStatusInactive, ServiceStatusOnHold}

type Service struct {
	ID          id.ID         `json:"_id" bson:"_id"`
	Title       string        `json:"title" bson:"title"`
	Description string        `json:"description" bson:"description"`
	Status      ServiceStatus `json:"status" bson:"status"`
	Cost        float64       `json:"cost" bson:"cost"`
	Price       float64       `json:"price" bson:"price"`

	DepartmentID  id.ID `json:"departmentId" bson:"departmentId"`
	CategoryID    id.ID `json:"categoryId" bson:"categoryId"`
	SubcategoryID id.ID `json:"subcategoryId" bson:"subcategoryId"`

	Department  *Department  `json:"department,omitempty" bson:"department,omitempty"`
	Category    *Category    `json:"category,omitempty" bson:"category,omitempty"`
	Subcategory *SubCategory `json:"subcategory,omitempty" bson:"subcategory,omitempty"`

	OrganizationID id.ID `json:"organizationId" bson:"organizationId"`
}

type ServiceRequest struct {
	Title       string        `json:"title" bson:"title" binding:"required"`
	Description string        `json:"description" bson:"description"`
	Price       float64       `json:"price" bson:"price" binding:"required"`
	Status      ServiceStatus `json:"status" bson:"status"`

	DepartmentID  id.ID `json:"departmentId" bson:"departmentId" binding:"required,MongoID"`
	CategoryID    id.ID `json:"categoryId" bson:"categoryId" binding:"required,MongoID"`
	SubcategoryID id.ID `json:"subcategoryId" bson:"subcategoryId" binding:"required,MongoID"`

	OrganizationID id.ID `json:"organizationId" bson:"organizationId" binding:"required,MongoID"`
}
