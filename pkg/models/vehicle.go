package models

import (
	"gerenciador/pkg/id"
	"gerenciador/pkg/timestamp"
)

type BaseVehicle struct {
	Title              string              `json:"title" bson:"title"`
	Description        string              `json:"description" bson:"description"`
	Type               string              `json:"type" bson:"type"`
	PurchaseDate       timestamp.Timestamp `json:"purchaseDate" bson:"purchaseDate"`
	PurchasePrice      string              `json:"purchasePrice" bson:"purchasePrice"`
	RegistrationNumber string              `json:"registrationNumber" bson:"registrationNumber"`
	VinNumber          string              `json:"vinNumber" bson:"vinNumber"`
	KmNow              string              `json:"kmNow" bson:"kmNow"`
	PurchaseKm         string              `json:"purchaseKm" bson:"purchaseKm"`
	ActualPrice        string              `json:"actualPrice" bson:"actualPrice"`
	//TaskID             *id.ID              `json:"taskId" bson:"taskId"`
	DriverID       []id.ID             `json:"driverId" bson:"driverId"`
	Obs            string              `json:"obs" bson:"obs"`
	LastManutences timestamp.Timestamp `json:"lastManutences" bson:"lastManutences"`
}

type Vehicle struct {
	BaseVehicle `json:",inline" bson:",inline"`

	ID             id.ID `json:"_id" bson:"_id"`
	AssigneeID     id.ID `json:"assigneeId" bson:"assigneeId"`
	OrganizationID id.ID `json:"organizationId" bson:"organizationId"`

	Assignee *Admin   `json:"assignee" bson:"assignee"`
	Drivers  []*Admin `json:"drivers" bson:"drivers"`
	// Helpers      []*Admin      `json:"helpers" bson:"helpers"`
	//Task *Task `json:"task,omitempty" bson:"taskId`
	// Client       *Client       `json:"client,omitempty" bson:"client"`
	Organization *Organization `json:"organization,omitempty" bson:"organization,omitempty"`
}

type VehicleRequest struct {
	BaseVehicle `json:",inline" bson:",inline"`

	AssigneeID     *id.ID `json:"-" bson:"assigneeId,omitempty"`
	OrganizationID *id.ID `json:"-" bson:"organizationId,omitempty"` //while updating organizationId not required
	//TaskID         *id.ID `json:"-" bson:"taskId,omitempty"`
}
