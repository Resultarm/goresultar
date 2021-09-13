package api

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"

	m "gerenciador/pkg/models"
	"gerenciador/pkg/services/session"
	"gerenciador/pkg/services/view"

	"github.com/josephspurrier/csrfbanana"
)

// func Cheque(w http.ResponseWriter, r *http.Request) {

// 	fmt.Println("coming .../cheque ...", r.Header)
// 	sess := session.Instance(r)
// 	res := m.Cheque()

// 	v := view.New(r)
// 	v.Name = "cheque/Cheque"
// 	v.Vars["token"] = csrfbanana.Token(w, r, sess)
// 	v.Vars["Cheque"] = res

// 	v.Render(w)

// }

func ChequeCreate(w http.ResponseWriter, r *http.Request) {

	sess := session.Instance(r)

	v := view.New(r)
	v.Name = "cheque/ChequeCreate"
	v.Vars["token"] = csrfbanana.Token(w, r, sess)

	v.Render(w)

}

func ChequeStore(w http.ResponseWriter, r *http.Request) {

	// Check the request form METHOD
	if r.Method == "POST" {

		c := m.Cheques{}

		file, handler, err := r.FormFile("copia")
		if err != nil {
			fmt.Println(err)
			return
		}
		defer file.Close()

		//fmt.Fprintf(w, "%v", handler.Header)
		f, err := os.OpenFile("./cheques/"+handler.Filename, os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			fmt.Println(err)
			return
		}
		defer f.Close()

		io.Copy(f, file)
		// Get the values from Form
		c.Numero, _ = strconv.Atoi(r.FormValue("numero"))
		c.Data = r.FormValue("data")
		c.Valor, _ = strconv.Atoi(r.FormValue("valor")) // = r.FormValue("valor")
		c.Destino = r.FormValue("destino")
		c.Vencimento = r.FormValue("vencimento")
		c.Cliente = r.FormValue("cliente")
		c.Beneficiario = r.FormValue("beneficiario")
		c.Banco = r.FormValue("banco")
		c.Agencia, _ = strconv.Atoi(r.FormValue("agencia")) // = r.FormValue("agencia")
		c.Conta, _ = strconv.Atoi(r.FormValue("conta"))     // = r.FormValue("conta")
		c.Copia = "./cheques/" + handler.Filename
		c.Obs = r.FormValue("obs")

		m.ChequeStore(c)

	}
	//sess := session.Instance(r)

	// v := view.New(r)
	// v.Name = "cheque/Cheque"
	// v.Vars["token"] = csrfbanana.Token(w, r, sess)

	// w.Header().Set("Content-Type", "text/html")
	// v.Render(w)

	// Redirect to Cheque
	//w.Header().Set("Content-Type", "text/html")

	http.Redirect(w, r, "/cheque", http.StatusPermanentRedirect)
}
