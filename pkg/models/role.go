package models

type Role struct {
	Name       string                   `json:"name" bson:"name"`
	Number     RoleNumber               `json:"roleNumber" bson:"roleNumber"`
	Operations map[Operation]Permission `json:"operations" bson:"operations"`
}
type RoleNumber int

var RolesList = []Role{RoleSuperAdmin, RoleAdmin, RoleStaff, RoleRepresentative, RoleProvider, RoleClient}
var PublicRolesList = []Role{RoleAdmin, RoleStaff, RoleRepresentative, RoleProvider, RoleClient}

var RoleNumbers = []RoleNumber{SuperAdminRoleNumber, AdminRoleNumber, StaffRoleNumber, RepresentativeRoleNumber, ProviderRoleNumber, ClientRoleNumber}
var PublicRoleNumbers = []RoleNumber{AdminRoleNumber, StaffRoleNumber, RepresentativeRoleNumber, ProviderRoleNumber, ClientRoleNumber}

const (
	SuperAdminRoleNumber RoleNumber = iota + 1
	AdminRoleNumber
	StaffRoleNumber
	EditorRoleNumber
	ProviderRoleNumber
	ClientRoleNumber
	AccounterRoleNumber
	RepresentativeRoleNumber
)

var (
	RoleSuperAdmin = Role{
		Name:   "Super Admin",
		Number: SuperAdminRoleNumber,
		Operations: map[Operation]Permission{
			OperationProducts:             PermissionWrite,
			OperationOrders:               PermissionWrite,
			OperationClients:              PermissionWrite,
			OperationAdmins:               PermissionWrite,
			OperationDepartmentProperties: PermissionWrite,
			OperationDashboard:            PermissionWrite,
			OperationOrganizations:        PermissionWrite,
		},
	}
	RoleAdmin = Role{
		Name:   "Admin",
		Number: AdminRoleNumber,
		Operations: map[Operation]Permission{
			OperationProducts:             PermissionWrite,
			OperationOrders:               PermissionWrite,
			OperationClients:              PermissionWrite,
			OperationDepartmentProperties: PermissionWrite,
			OperationDashboard:            PermissionWrite,
			OperationOrganizations:        PermissionWrite,
			OperationAdmins:               PermissionWrite,
		},
	}
	RoleStaff = Role{
		Name:   "Colaborador",
		Number: StaffRoleNumber,
		Operations: map[Operation]Permission{
			OperationProducts:             PermissionWrite,
			OperationOrders:               PermissionWrite,
			OperationClients:              PermissionWrite,
			OperationDepartmentProperties: PermissionWrite,
			OperationDashboard:            PermissionWrite,
			OperationAdmins:               PermissionRead,
		},
	}
	RoleRepresentative = Role{
		Name:   "Vendedor",
		Number: RepresentativeRoleNumber,
		Operations: map[Operation]Permission{
			OperationOrders:        PermissionWrite,
			OperationClients:       PermissionRead,
			OperationProducts:      PermissionRead,
			OperationDashboard:     PermissionRead,
			OperationOrganizations: PermissionWrite,
		},
	}
	RoleEditor = Role{
		Name:       "Editor",
		Number:     EditorRoleNumber,
		Operations: map[Operation]Permission{},
	}
	RoleProvider = Role{
		Name:   "Provider",
		Number: ProviderRoleNumber,
		Operations: map[Operation]Permission{
			OperationProducts:             PermissionWrite,
			OperationDepartmentProperties: PermissionWrite,
			OperationOrganizations:        PermissionWrite,
		},
	}
	RoleClient = Role{
		Name:       "Client",
		Number:     ClientRoleNumber,
		Operations: map[Operation]Permission{},
	}
	RoleAccounter = Role{
		Name:       "Contador",
		Number:     AccounterRoleNumber,
		Operations: map[Operation]Permission{},
	}
)

//type RolePermission int
//
//const (
//	CreatePermission   RolePermission = iota //POST
//	EditPermission                           //PUT
//	ViewPermission                           //GET
//	RemovePermission                         //DELETE
//	PrintPermission                          //POST with token
//	DownloadPermission                       //POST with token
//)

type Permission int

const (
	PermissionNone Permission = iota
	PermissionRead
	PermissionWrite
)

type Operation int

const (
	OperationProducts Operation = iota + 1
	OperationOrders
	OperationClients
	OperationAdmins
	OperationDepartmentProperties
	OperationDashboard
	OperationOrganizations
)

func (p Permission) CanWrite() bool {
	return p == PermissionWrite
}
