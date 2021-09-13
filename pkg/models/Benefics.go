package models

import (
	"fmt"
	"time"

	"gerenciador/pkg/services/database"
)

type Benefics struct {
	ID          int
	Compname    string
	Types       string
	Status      string
	Fname       string
	Lname       string
	Client_id   int
	Data_criado time.Time
}

func Benefic() []Benefics {

	res := []Benefics{}

	err := database.SQL.Select(&res, "SELECT benefics.*, clientes.fname, clientes.lname FROM benefics INNER JOIN clientes ON benefics.client_id = clientes.id")
	if err != nil {
		fmt.Println(err)
		panic(err.Error())
	}

	return res
}

func BeneficCreate() []Client {
	res := []Client{}
	//database.SQL.Select(&res, "SELECT * FROM clientes")
	database.SQL.Select(&res, "select clientes.* from clientes INNER JOIN benefics ON clientes.id=benefics.client_id")

	return res
}

func BeneficStore(b Benefics) {

	_, err := database.SQL.Exec("INSERT INTO benefics(compname, types, status, client_id) VALUES(?,?,?,?)",
		b.Compname, b.Types, b.Status, b.Client_id)
	if err != nil {
		panic(err.Error())
	}

}
