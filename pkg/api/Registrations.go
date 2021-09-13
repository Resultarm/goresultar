package api

import (
	"fmt"
	"net/http"
	//"strconv"

	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/session"
	"gerenciador/pkg/services/view"
	"github.com/josephspurrier/csrfbanana"
)

func Registration(w http.ResponseWriter, r *http.Request) {

	sess := session.Instance(r)
	res := m.Registration()
	v := view.New(r)
	v.Name = "registration/Registration"
	v.Vars["token"] = csrfbanana.Token(w, r, sess)
	v.Vars["Registration"] = res

	v.Render(w)

}

func RegistrationCreate(w http.ResponseWriter, r *http.Request) {

	sess := session.Instance(r)

	v := view.New(r)
	v.Name = "registration/RegistrationCreate"
	v.Vars["token"] = csrfbanana.Token(w, r, sess)

	v.Render(w)

}

func RegistrationStore(w http.ResponseWriter, r *http.Request) {
	fmt.Println("in RegistrationStore 1")
	// Open database connection
	reg := m.Registrations{}

	// Check the request form METHOD
	if r.Method == "POST" {
		fmt.Println("in RegistrationStore 2")
		// Get the values from Form
		reg.Username = r.FormValue("username")
		reg.Password = r.FormValue("password")
		reg.Email = r.FormValue("email")
		reg.Status = r.FormValue("status")
		reg.Role = r.FormValue("role")
		fmt.Println("in RegistrationStore 3")
		m.RegistrationStore(reg)
		fmt.Println("in RegistrationStore 4")
	}
	fmt.Println("in RegistrationStore 5")
	// Redirect to Registration
	//http.Redirect(w, r, "/registration", 301)
	// sess := session.Instance(r)

	// v := view.New(r)
	// v.Name = "registration/Registration"
	// v.Vars["token"] = csrfbanana.Token(w, r, sess)

	// v.Render(w)
	http.Redirect(w, r, "/registration", http.StatusPermanentRedirect)
}
