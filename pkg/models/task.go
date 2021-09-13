package models

import (
	"gerenciador/pkg/id"
	"gerenciador/pkg/timestamp"
)

type BaseTask struct {
	Title             string              `json:"title" bson:"title"`
	Description       string              `json:"description" bson:"description"`
	Obs               string              `json:"obs" bson:"obs"`
	Lunch             string              `json:"lunch" bson:"lunch"`
	Host              string              `json:"host" bson:"host"`
	Rute              string              `json:"rute" bson:"rute"`
	WorkAddress       string              `json:"workAddress" bson:"workAdress"`
	StartDate         timestamp.Timestamp `json:"startDate" bson:"startDate"`
	EstConclusionDate timestamp.Timestamp `json:"estConclusionDate" bson:"estConclusionDate"`
	//VehicleID         id.ID               `json:"vehicleId" bson:"vehicleId"`
	Vehicle   string  `json:"vehicle" bson:"vehicle"`
	LeaderID  id.ID   `json:"leaderId" bson:"leaderId"`
	HelperIDs []id.ID `json:"helperIds" bson:"helperIds"`
	DriverIDs []id.ID `json:"driverIds" bson:"driverIds"`
	OrderID   *id.ID  `json:"orderId" bson:"orderId"`
	ClientID  *id.ID  `json:"clientId" bson:"clientId"`
}

type Task struct {
	BaseTask `json:",inline" bson:",inline"`

	ID             id.ID `json:"_id" bson:"_id"`
	AssigneeID     id.ID `json:"assigneeId" bson:"assigneeId"`
	OrganizationID id.ID `json:"organizationId" bson:"organizationId"`

	Assignee *Admin `json:"assignee" bson:"assignee"`
	//Vehicle      *Vehicle      `json:"vehicle" bson:"vehicle"`
	Leader       *Admin        `json:"leader" bson:"leader"`
	Helpers      []*Admin      `json:"helpers" bson:"helpers"`
	Drivers      []*Admin      `json:"drivers" bson:"drivers"`
	Order        *Order        `json:"order,omitempty" bson:"order"`
	Client       *Client       `json:"client,omitempty" bson:"client"`
	Organization *Organization `json:"organization,omitempty" bson:"organization,omitempty"`
}

type TaskRequest struct {
	BaseTask `json:",inline" bson:",inline"`

	AssigneeID     *id.ID `json:"-" bson:"assigneeId,omitempty"`
	OrganizationID *id.ID `json:"-" bson:"organizationId,omitempty"` //while updating organizationId not required
}
