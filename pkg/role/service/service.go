package service

import (
	"gerenciador/pkg/resource"
)

var ActionRead = "read"
var ActionWrite = "write"

var ObjectDepartment = "department"
var ObjectClient = "client"
var ObjectTask = "task"

var ObjectVehicle = "vehicle"
var ObjectExpense = "expense"
var ObjectOrder = "order"

var Objects = map[string][]string{
	ObjectDepartment: {ActionRead, ActionWrite},
	ObjectClient:     {ActionRead, ActionWrite},
	ObjectTask:       {ActionRead, ActionWrite},
	ObjectVehicle:    {ActionRead, ActionWrite},
	ObjectExpense:    {ActionRead, ActionWrite},
}

var ReadWriteActions = []string{ActionRead, ActionWrite}

type Permission struct {
	Object  string   `json:"object"`
	Actions []string `json:"actions"`
}

var permissions = []Permission{
	{ObjectClient, ReadWriteActions},
	{ObjectDepartment, ReadWriteActions},
	{ObjectExpense, ReadWriteActions},
	{ObjectOrder, ReadWriteActions},
	{ObjectTask, ReadWriteActions},
	{ObjectVehicle, ReadWriteActions},
}

type Service struct {
	resource *resource.Resource
}

func New(r *resource.Resource) *Service {
	return &Service{resource: r}
}

func (s *Service) GetPermissions() []Permission {
	return permissions
}

func (s *Service) GetAll() map[string]map[string]map[string]bool {

	policies := s.resource.Enforcer.GetPolicy()

	roles := map[string]map[string]map[string]bool{}

	for _, policy := range policies {
		sub, obj, action := policy[0], policy[1], policy[2]

		if roles[sub] == nil {
			roles[sub] = map[string]map[string]bool{obj: {action: true}}
			continue
		}

		if roles[sub][obj] == nil {
			roles[sub][obj] = map[string]bool{action: true}
			continue
		}
		roles[sub][obj][action] = true
	}

	return roles

}
