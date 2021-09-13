package models

import (
	"fmt"

	"gerenciador/pkg/services/database"
)

type Registrations struct {
	ID         int
	Username   string
	Password   string
	Email      string
	CellNumber string
	Status     string
	Role       string
	Obs        string
}

func Registration() []Registrations {

	res := []Registrations{}
	err := database.SQL.Select(&res, "SELECT * FROM registration ORDER BY id DESC")
	if err != nil {
		panic(err.Error())
	}
	return res
}

func RegistrationStore(reg Registrations) {

	_, err := database.SQL.Exec("INSERT INTO registration(id, username, password, email, status, role, obs) VALUES(?,?,?,?,?,?,?)",
		12, reg.Username, reg.Password, reg.Email, reg.Status, reg.Role, reg.Obs)
	if err != nil {
		fmt.Println(err)
		panic(err.Error())
	}

}

func UserByEmail(email string) (Registrations, error) {

	result := Registrations{}

	err := database.SQL.Get(&result, "SELECT id, password, status, username FROM registration  WHERE email = ? LIMIT 1", email)
	if err != nil {
		fmt.Println(err)
		panic(err.Error())
	}
	return result, standardizeError(err)
}
