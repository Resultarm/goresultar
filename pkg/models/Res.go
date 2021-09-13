package models

type OrderStats struct {
	Open       StatsUnit `json:"open" bson:"open"`
	Closed     StatsUnit `json:"closed" bson:"closed"`
	Quotations StatsUnit `json:"quotations" bson:"quotations"`
	Partial    StatsUnit `json:"partial" bson:"partial"`
	Canceled   StatsUnit `json:"canceled" bson:"canceled"`
	//Orden      []Ordenas
	//Valortotal float64
	////Statuspaid        string
	////Statusopen        string
	////Statusparcial     string
	//TotalOrden        int
	//TotalQuotes       int
	//TotalClient       int
	//TotalProduct      int
	//TotalExpense      int
	//TotalSaledpaid    int
	//TotalSaledopen    int
	//TotalSaledparcial int
	//TotalSaled        float64
	//TotalSellsPartial float64
	//TotalSellsQuotes  float64
	//TotalSellsOpen    float64
}

//Order
//Valortotal
//TotalOrden
//TotalClient
//TotalProduct
//TotalQuotes
//TotalExpense
//TotalSaled
//TotalSaledpaid
//TotalSaledopen
//TotalSaledparcial
//TotalSellsPartial
//TotalSellsOpen
//TotalSellsQuotes
