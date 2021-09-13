package models

// type Expenses struct {
// 	ID          int
// 	Types       string
// 	Status      string
// 	OrderId     id.ID
// 	Bill_url    string
// 	Recepit     string
// 	Payment     float64
// 	Client_id   int
// 	Fname       string
// 	Lname       string
// 	Datedue     string
// 	Datepaid    string
// 	Expensename string
// 	Name        string
// }

// type ExpenseRes struct {
// 	Expense      []Expenses
// 	TotalExpense int
// 	TotalPaid    int
// 	TotalPassdue int
// 	//	TotalPending int
// 	TotalOpen  int
// 	TotalOther int
// }

// func Expense() ExpenseRes {

// 	expenses := []Expenses{}

// 	//err := database.SQL.Select(&expenses, "SELECT expenses.*,  clientes.fname, clientes.lname FROM expenses INNER JOIN clientes ON expenses.client_id = clientes.id")

// 	err := database.SQL.Select(&expenses, "SELECT expenses.*, concat(clientes.fname, clientes.lname) as expensename  FROM expenses INNER JOIN clientes ON expenses.client_id = clientes.id")

// 	if err != nil {
// 		panic(err.Error())
// 	}

// 	expensres := ExpenseRes{}
// 	expensres.Expense = expenses
// 	expensres.TotalExpense, expensres.TotalPaid, expensres.TotalPassdue, expensres.TotalOpen, expensres.TotalOther = getExpenseAmount()

// 	return expensres

// }

// func ExpenseCreate() []Client {

// 	res := []Client{}
// 	err := database.SQL.Select(&res, "SELECT * FROM clientes")
// 	if err != nil {
// 		panic(err.Error())
// 	}
// 	return res

// }

// func ExpenseStore(e Expenses) {

// 	_, err := database.SQL.Exec("INSERT INTO expenses(types,status, bill_url, recepit, payment, client_id, datedue, datepaid, name) VALUES(?,?,?,?,?,?,?,?,?)",
// 		e.Types, e.Status, e.Bill_url, e.Recepit, e.Payment, e.Client_id, e.Datedue, e.Datepaid, e.Name)

// 	if err != nil {
// 		panic(err.Error())
// 	}
// }

// func getExpenseAmount() (TotalExpense int, TotalPaid int, TotalPassdue int, TotalOpen int, TotalOther int) {

// 	err := database.SQL.Get(&TotalExpense, "SELECT COUNT(id) FROM expenses")
// 	if err != nil {
// 		panic(err.Error())
// 	}

// 	err = database.SQL.Get(&TotalPaid, "SELECT COUNT(id) FROM expenses where status = 'Pagas'")
// 	if err != nil {
// 		panic(err.Error())
// 	}

// 	err = database.SQL.Get(&TotalPassdue, "SELECT COUNT(id) FROM expenses where status = 'Vencida'")
// 	if err != nil {
// 		panic(err.Error())
// 	}

// 	err = database.SQL.Get(&TotalOpen, "SELECT COUNT(id) FROM expenses where status = 'em aberto'")
// 	if err != nil {
// 		panic(err.Error())
// 	}

// 	err = database.SQL.Get(&TotalOther, "SELECT COUNT(id) FROM expenses where status = 'Outros'")
// 	if err != nil {
// 		panic(err.Error())
// 	}

// 	return
// }
