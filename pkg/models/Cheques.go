package models

import (
	"fmt"

	"gerenciador/pkg/services/database"
)

type Cheques struct {
	ID           int
	Numero       int
	Data         string
	Valor        int
	Destino      string
	Vencimento   string
	Cliente      string
	Beneficiario string
	Banco        string
	Agencia      int
	Conta        int
	Copia        string
	Obs          string
}

// func Cheque() []Cheques {

// 	res := []Cheques{}
// 	err := database.SQL.Select(&res, "SELECT * FROM cheques ORDER BY id DESC")
// 	if err != nil {
// 		panic(err.Error())
// 	}

// 	return res

// }

func ChequeStore(c Cheques) {

	_, err := database.SQL.Exec("INSERT INTO cheques(numero, data, valor, destino, vencimento, cliente, beneficiario, banco, agencia, conta, copia, obs) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
		c.Numero, c.Data, c.Valor, c.Destino, c.Vencimento, c.Cliente, c.Beneficiario, c.Banco, c.Agencia, c.Conta, c.Copia, c.Obs)
	if err != nil {
		fmt.Println(err)
		panic(err.Error())
		//return
	}
	return
}
