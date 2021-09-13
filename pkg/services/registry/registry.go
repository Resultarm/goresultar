package registry

import (
	"context"
	"reflect"
	"sort"
)

type Service interface {
	Init() error
}
type Descriptor struct {
	Name     string
	Instance Service
	Priority Priority
}

type Priority int

const (
	Low    Priority = 0
	Medium          = 50
	High            = 100
)

type BackgroundService interface {
	Service
	Run(ctx context.Context) error
}

var services Services

type Services []*Descriptor

func (srv Services) Len() int {
	return len(srv)
}

func (srv Services) Less(i, j int) bool {
	return srv[i].Priority > srv[j].Priority
}

func (srv Services) Swap(i, j int) {
	srv[i], srv[j] = srv[j], srv[i]
}
func RegisterService(instance Service) {
	services = append(services, &Descriptor{
		Name:     reflect.TypeOf(instance).Elem().Name(),
		Instance: instance,
		Priority: Low,
	})
}
func Register(srv *Descriptor) {
	services = append(services, srv)
}

func GetServices() []*Descriptor {
	sort.Sort(services)
	return services
}
func IsDisabled(srv Service) bool {
	canBeDisabled, ok := srv.(CanBeDisabled)
	return ok && canBeDisabled.IsDisabled()
}

type CanBeDisabled interface {
	IsDisabled() bool
}
