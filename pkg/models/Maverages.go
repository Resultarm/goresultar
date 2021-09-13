package models

import (
	"time"

	"gerenciador/pkg/services/database"
)

type Maverages struct {
	ID          int
	Provider    string
	Af1         float64
	Af2         float64
	Am1         float64
	Am2         float64
	At1         float64
	At2         float64
	Media       float64
	Largura     float64
	Comprimento float64
	Pmc         float64
	Totalmedida float64
	Totalprice  float64
	Dtcompra    time.Time //string // date
	Dtentrega   time.Time // date
	Status      string
	Obs         string
	Data_criado time.Time
}

func Maverage() []Maverages {
	res := []Maverages{}
	err := database.SQL.Select(&res, "SELECT * from maverage")
	if err != nil {
		panic(err.Error())
	}
	return res
}

func MaverageShow(id string) Maverages {
	n := Maverages{}
	err := database.SQL.Get(&n, "SELECT * FROM maverage WHERE id=?", id)
	if err != nil {
		panic(err.Error())
	}
	return n

}

func MaverageEdit(id string) Maverages {

	n := Maverages{}
	err := database.SQL.Get(&n, "SELECT * FROM maverage WHERE id=?", id)
	if err != nil {
		panic(err.Error())
	}
	return n
}

func MaverageUpdate(m Maverages) {

	/*
		_, err := database.SQL.Exec("UPDATE maverage SET provider=?, status=?, af1=?, af2=?, am1=?, am2=?, at1=?, at2=?, media=?, largura=?, comprimento=?, pmc=?, totalmedida=?, totalprice=?, dtcompra=?, dtentrega=?, status=?, obs=?, data_criado=?  WHERE id=?",

			m.Provider, m.Status, m.Af1, m.Af2, m.Am1, m.Am2, m.At1, m.At2, m.Media, m.Largura, m.Comprimento, m.Pmc, m.Totalmedida, m.Totalprice, m.Dtcompra, m.Dtentrega, m.Status, m.Obs, m.Data_criado, m.ID)
	*/
	_, err := database.SQL.Exec("UPDATE maverage SET provider=?, status=?, af1=?, af2=?, am1=?, am2=?, at1=?, at2=?, media=?, largura=?, comprimento=?, pmc=?, totalmedida=?, totalprice=?,  dtentrega=?, status=?, obs=?  WHERE id=?",

		m.Provider, m.Status, m.Af1, m.Af2, m.Am1, m.Am2, m.At1, m.At2, m.Media, m.Largura, m.Comprimento, m.Pmc, m.Totalmedida, m.Totalprice, m.Dtentrega, m.Status, m.Obs, m.ID)
	if err != nil {
		panic(err.Error())
	}

}

func MaverageStore(m Maverages) {
	_, err := database.SQL.Exec("INSERT INTO maverage(provider, status, af1, af2, am1, am2, at1, at2, media, comprimento, largura, totalmedida, pmc, totalprice, dtcompra, dtentrega, obs) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",

		m.Provider, m.Status, m.Af1, m.Af2, m.Am1, m.Am2, m.At1, m.At2, m.Media, m.Comprimento, m.Largura, m.Totalmedida, m.Pmc, m.Totalprice, m.Dtcompra, m.Dtentrega, m.Obs)
	if err != nil {
		panic(err.Error())
	}
}

func MaverageDelete(id string) {

	_, err := database.SQL.Exec("DELETE FROM maverage WHERE id=?", id)
	if err != nil {
		panic(err.Error())
	}

}
