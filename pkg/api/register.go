package api

// RegisterGET displays the register page
// func RegisterGET(w http.ResponseWriter, r *http.Request) {
// 	// Get session
// 	sess := session.Instance(r)

// 	// Display the view
// 	v := view.New(r)
// 	v.Name = "register/register"
// 	v.Vars["token"] = csrfbanana.Token(w, r, sess)
// 	// Refill any form fields
// 	view.Repopulate([]string{"username", "password", "email", "status", "role"}, r.Form, v.Vars)
// 	v.Render(w)
// }

// RegisterPOST handles the registration form submission
// func RegisterPOST(w http.ResponseWriter, r *http.Request) {
// 	// Get session
// 	sess := session.Instance(r)

// 	// Prevent brute force login attempts by not hitting MySQL and pretending like it was invalid :-)
// 	if sess.Values["register_attempt"] != nil && sess.Values["register_attempt"].(int) >= 5 {
// 		log.Println("Brute force register prevented")
// 		http.Redirect(w, r, "/register", http.StatusFound)
// 		return
// 	}

// 	// Validate with required fields
// 	if validate, missingField := view.Validate(r, []string{"username", "password", "email", "status", "role"}); !validate {
// 		sess.AddFlash(view.Flash{"Field missing: " + missingField, view.FlashError})
// 		sess.Save(r, w)
// 		RegisterGET(w, r)
// 		return
// 	}

// 	// Validate with Google reCAPTCHA
// 	if !recaptcha.Verified(r) {
// 		sess.AddFlash(view.Flash{"reCAPTCHA invalid!", view.FlashError})
// 		sess.Save(r, w)
// 		RegisterGET(w, r)
// 		return
// 	}

// 	// Get form values
// 	Username := r.FormValue("username")
// 	Password, errp := passhash.HashString(r.FormValue("password"))
// 	Email := r.FormValue("email")
// 	Status := r.FormValue("status")
// 	Role := r.FormValue("role")

// 	// If password hashing failed
// 	if errp != nil {
// 		log.Println(errp)
// 		sess.AddFlash(view.Flash{"An error occurred on the server. Please try again later.", view.FlashError})
// 		sess.Save(r, w)
// 		http.Redirect(w, r, "/register", http.StatusFound)
// 		return
// 	}

// 	// Get database result
// 	_, err := m.UserByEmail(Email)

// 	if err == m.ErrNoResult { // If success (no user exists with that email)
// 		ex := m.UserCreate(Username, Password, Status, Role)
// 		// Will only error if there is a problem with the query
// 		if ex != nil {
// 			log.Println(ex)
// 			sess.AddFlash(view.Flash{"An error occurred on the server. Please try again later.", view.FlashError})
// 			sess.Save(r, w)
// 		} else {
// 			sess.AddFlash(view.Flash{"Conta criada com sucesso para: " + Email, view.FlashSuccess})
// 			sess.Save(r, w)
// 			http.Redirect(w, r, "/login", http.StatusFound)
// 			return
// 		}
// 	} else if err != nil { // Catch all other errors
// 		log.Println(err)
// 		sess.AddFlash(view.Flash{"An error occurred on the server. Please try again later.", view.FlashError})
// 		sess.Save(r, w)
// 	} else { // Else the user already exists
// 		sess.AddFlash(view.Flash{"Uma conta foi encontrada com esse email: " + Email, view.FlashError})
// 		sess.Save(r, w)
// 	}

// 	// Display the page
// 	RegisterGET(w, r)
// }
