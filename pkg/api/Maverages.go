package api

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/session"
	"gerenciador/pkg/services/view"
	"github.com/josephspurrier/csrfbanana"
)

func Maverage(w http.ResponseWriter, r *http.Request) {
	res := m.Maverage()

	sess := session.Instance(r)

	//fmt.Printf("MIME Header: %+v\n", result)
	v := view.New(r)
	v.Name = "maverage/Maverage"
	v.Vars["token"] = csrfbanana.Token(w, r, sess)
	v.Vars["Maverage"] = res

	v.Render(w)

}

func MaverageShow(w http.ResponseWriter, r *http.Request) {
	sess := session.Instance(r)
	nId := r.URL.Query().Get("id")
	res := m.MaverageShow(nId)

	v := view.New(r)
	v.Name = "maverage/MaverageShow"
	v.Vars["token"] = csrfbanana.Token(w, r, sess)
	v.Vars["MaverageShow"] = res

	v.Render(w)

}

func MaverageCreate(w http.ResponseWriter, r *http.Request) {

	sess := session.Instance(r)
	v := view.New(r)
	v.Name = "maverage/MaverageCreate"
	v.Vars["token"] = csrfbanana.Token(w, r, sess)

	v.Render(w)

	//tmpl.ExecuteTemplate(w, "MaverageCreate", nil)
}

func MaverageEdit(w http.ResponseWriter, r *http.Request) {
	nId := r.URL.Query().Get("id")

	res := m.MaverageEdit(nId)

	sess := session.Instance(r)
	v := view.New(r)
	v.Name = "maverage/MaverageEdit"
	v.Vars["token"] = csrfbanana.Token(w, r, sess)
	v.Vars["MaverageEdit"] = res

	v.Render(w)
}

func MaverageUpdate(w http.ResponseWriter, r *http.Request) {

	if r.Method == "POST" {
		n := m.Maverages{}

		fmt.Println("r.FormValue(dtentrega) ", r.FormValue("dtentrega"))
		fmt.Println(time.Parse("2006-01-02", r.FormValue("dtentrega")))
		// Get the values from form
		n.Provider = r.FormValue("provider")
		n.Status = r.FormValue("status")
		n.Af1, _ = strconv.ParseFloat(r.FormValue("af1"), 64)
		n.Af2, _ = strconv.ParseFloat(r.FormValue("af2"), 64)
		n.Am1, _ = strconv.ParseFloat(r.FormValue("am1"), 64)
		n.Am2, _ = strconv.ParseFloat(r.FormValue("am2"), 64)
		n.At1, _ = strconv.ParseFloat(r.FormValue("at1"), 64)
		n.At2, _ = strconv.ParseFloat(r.FormValue("at2"), 64)
		n.Media, _ = strconv.ParseFloat(r.FormValue("media"), 64)
		n.Comprimento, _ = strconv.ParseFloat(r.FormValue("comprimento"), 64)
		n.Largura, _ = strconv.ParseFloat(r.FormValue("largura"), 64)         //= r.FormValue("largura")
		n.Totalmedida, _ = strconv.ParseFloat(r.FormValue("totalmedida"), 64) // = r.FormValue("totalmedida")
		n.Pmc, _ = strconv.ParseFloat(r.FormValue("pmc"), 64)                 //= r.FormValue("pmc")
		n.Totalprice, _ = strconv.ParseFloat(r.FormValue("totalprice"), 64)   // = r.FormValue("totalprice")
		n.Dtcompra, _ = time.Parse("2006-01-02", r.FormValue("dtcompra"))     //2017-11-30           //r.FormValue("dtcompra")
		n.Dtentrega, _ = time.Parse("2006-01-02", r.FormValue("dtentrega"))   // = r.FormValue("dtentrega")
		n.Obs = r.FormValue("obs")
		n.ID, _ = strconv.Atoi(r.FormValue("uid")) // This line is a hidden field on form (View the file: `tmpl/MaverageEdit`)

		fmt.Println("n", n)

		m.MaverageUpdate(n)
		// Prepare the SQL Update
	}

	// Redirect to maverage
	http.Redirect(w, r, "/maverage", 301)
}

func MaverageStore(w http.ResponseWriter, r *http.Request) {

	// Check the request form METHOD
	if r.Method == "POST" {
		n := m.Maverages{}
		// Get the values from Form

		n.Provider = r.FormValue("provider")
		n.Status = r.FormValue("status")
		n.Af1, _ = strconv.ParseFloat(r.FormValue("af1"), 64)
		n.Af2, _ = strconv.ParseFloat(r.FormValue("af2"), 64)
		n.Am1, _ = strconv.ParseFloat(r.FormValue("am1"), 64)
		n.Am2, _ = strconv.ParseFloat(r.FormValue("am2"), 64)
		n.At1, _ = strconv.ParseFloat(r.FormValue("at1"), 64)
		n.At2, _ = strconv.ParseFloat(r.FormValue("at2"), 64)
		n.Media, _ = strconv.ParseFloat(r.FormValue("media"), 64)
		n.Comprimento, _ = strconv.ParseFloat(r.FormValue("comprimento"), 64)
		n.Largura, _ = strconv.ParseFloat(r.FormValue("largura"), 64)         //= r.FormValue("largura")
		n.Totalmedida, _ = strconv.ParseFloat(r.FormValue("totalmedida"), 64) // = r.FormValue("totalmedida")
		n.Pmc, _ = strconv.ParseFloat(r.FormValue("pmc"), 64)                 //= r.FormValue("pmc")
		n.Totalprice, _ = strconv.ParseFloat(r.FormValue("totalprice"), 64)   // = r.FormValue("totalprice")
		n.Dtcompra, _ = time.Parse("2006-01-02", r.FormValue("dtcompra"))     //2017-11-30           //r.FormValue("dtcompra")
		n.Dtentrega, _ = time.Parse("2006-01-02", r.FormValue("dtentrega"))   // = r.FormValue("dtentrega")
		n.Obs = r.FormValue("obs")
		n.ID, _ = strconv.Atoi(r.FormValue("uid")) // This line is a hidden field on form (View the file: `tmpl/MaverageEdit`)
		m.MaverageStore(n)
	}

	http.Redirect(w, r, "/maverage", 307)
}

func MaverageDelete(w http.ResponseWriter, r *http.Request) {

	nPedido := r.URL.Query().Get("mid")
	m.MaverageDelete(nPedido)

	// Redirect a HOME
	http.Redirect(w, r, "/maverage", 301)
}
