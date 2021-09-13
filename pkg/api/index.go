package api

import (
	"fmt"
	"net/http"

	"gerenciador/pkg/services/session"
	"gerenciador/pkg/services/view"
)

// IndexGET displays the home page
func (hs *HTTPServer) IndexGET(w http.ResponseWriter, r *http.Request) {
	// Get session
	session := session.Instance(r)
	fmt.Println("coming .....")
	if session.Values["id"] != nil {
		// // Display the view
		// fmt.Println("coming .....1")
		// v := view.New(r)
		// v.Name = "index/auth"
		// //v.Vars["first_name"] = session.Values["first_name"]
		// v.Render(w)
		http.Redirect(w, r, "/home", 307)
	} else {
		fmt.Println("coming .....2")
		// Display the view
		v := view.New(r)
		v.Name = "index/anon"
		v.Render(w)
		//return
	}
}
