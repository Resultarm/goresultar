package mongostore

import (
	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/registry"

	"golang.org/x/crypto/bcrypt"
)

type OnboardingRepository interface {
	Onboard(r *m.OnboardingRequest) error
	CheckOnboarded() (bool, error)
}

func init() {
	registry.Register(&registry.Descriptor{
		Name:     "Onboarding",
		Priority: registry.Medium,
		Instance: &Onboarding{},
	})
}

type Onboarding struct {
	Store *MongoStore `inject:""`
	coll  string
}

func (repo *Onboarding) Init() error {
	repo.coll = adminsCollection
	return nil
}

func (repo *Onboarding) Onboard(r *m.OnboardingRequest) error {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	hash, err := bcrypt.GenerateFromPassword([]byte(r.Password), 8)
	if err != nil {
	}
	r.Password = string(hash)

	if err := c.Insert(r); err != nil {
		return err
	}
	return nil
}

func (repo *Onboarding) CheckOnboarded() (bool, error) {
	sess := repo.Store.Session()
	c := sess.DB(repo.Store.Config.DatabaseName).C(repo.coll)

	var count int
	var err error

	if count, err = c.Count(); err != nil {
		return false, err
	}
	return count > 0, nil
}
