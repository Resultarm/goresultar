package api

import (
	"errors"
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"math"
	"net/http"

	"gopkg.in/macaron.v1"
)

func (hs *HTTPServer) AddExpense(ctx *m.AdminReqContext, expense m.Expense) Response {
	expense.OrganizationID = ctx.OrganizationID[0]
	err := hs.Expense.Save(&expense)
	if err != nil {
		return Error(http.StatusInternalServerError, "could not add expense", err)
	}

	return Success("Despesas Adicionada")
}

func (hs *HTTPServer) AddExpensePayment(ctx *m.AdminReqContext, r m.ExpensePayment) Response {
	r.OrganizationID = ctx.OrganizationID[0]
	err := hs.ExpensePayment.Save(&r)
	if err != nil {
		return Error(http.StatusInternalServerError, "could not add expense payment", err)
	}

	if len(r.ChequeIDs) > 0 {
		valid := true
		for _, id := range r.ChequeIDs {
			if !id.Valid() {
				valid = false
				break
			}
		}
		if !valid {
			return Error(http.StatusUnprocessableEntity, "ID invalido", errors.New("invalid cheque ids"))
		}
		_, err := hs.Cheque.ChangeStatus(m.FindIDsQuery{IDs: r.ChequeIDs}, m.ChequeStatusCompensated, "")
		if err != nil {
			return Error(http.StatusInternalServerError, "não foi possivel atualizar despesa", err)
		}

	}

	return Success("Pagamento de despesa adicionado")
}

func (hs *HTTPServer) GetExpenses(ctx *m.AdminReqContext) Response {

	query := m.RangeOrgsUserQueryFromCtx(ctx)

	expenses, err := hs.Expense.Find(query)
	if err != nil {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	count, err := hs.Expense.Count(query)
	if err != nil {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}
	resp := m.PageResponse{
		Data:  expenses,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.Pagination.PerPage))),
	}

	return JSON(http.StatusOK, resp)
}

func (hs *HTTPServer) GetExpense(ctx *m.AdminReqContext) Response {
	id, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}
	expense, err := hs.Expense.FindOne(m.FindByIdQuery{Id: id})
	if err != nil {
		return Error(http.StatusInternalServerError, "", err)
	}

	return JSON(http.StatusOK, expense)
}

func (hs *HTTPServer) GetExpensePayments(ctx *m.AdminReqContext) Response {
	id, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}
	query := m.ExpensePaymentQuery{
		OrganizationID: ctx.OrganizationID,
		ExpenseID:      id,
	}

	expenses, err := hs.ExpensePayment.Find(query)
	if err != nil {
		return Error(http.StatusInternalServerError, "", err)
	}

	count, err := hs.ExpensePayment.Count(query)
	if err != nil {
		return Error(http.StatusInternalServerError, "", err)
	}
	resp := m.PageResponse{
		Data:  expenses,
		Count: count,
		// Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}

	return JSON(http.StatusOK, resp)

}

func (hs *HTTPServer) UpdateExpense(ctx *macaron.Context, expense m.Expense) Response {

	id, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	updated, err := hs.Expense.Update(m.FindByIdQuery{id}, &expense)
	if err != nil {
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, updated)
}

func (hs *HTTPServer) DeleteExpense(ctx *macaron.Context) Response {
	id, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	if err = hs.Expense.Delete(m.FindByIdQuery{id}); err != nil {
		return InternalServerError(err)
	}

	return Success("deleted")
}

type ExpenseStats struct {
	Total            uint         `json:"total"`
	Partial          []*m.Expense `json:"partial"`
	Paid             []*m.Expense `json:"paid"`
	NotPaid          []*m.Expense `json:"notpaid"`
	NextMonthExpense []*m.Expense `json:"nextMonthExpense"`
	Dues             []*m.Expense `json:"dues"`
}

func (hs *HTTPServer) GetStats(ctx *m.AdminReqContext) Response {
	query := m.RangeOrgUserQuery{
		TimeRange: m.NewTimeRangeFromTimestampStrings(
			ctx.Query("from"),
			ctx.Query("to")),
		OrganizationID: ctx.OrganizationID,
		UseIDQuery:     true,
	}

	stats := ExpenseStats{}

	total, err := hs.Expense.Count(query)
	if err != nil {
		return InternalServerError(err)
	}
	stats.Total = uint(total)

	partial, err := hs.Expense.FindPartialPaid(query)
	if err != nil {
		return InternalServerError(err)
	}
	stats.Partial = partial

	paid, err := hs.Expense.FindPaid(query)
	if err != nil {
		return InternalServerError(err)
	}
	stats.Paid = paid

	notpaid, err := hs.Expense.FindNotPaid(query)
	if err != nil {
		return InternalServerError(err)
	}
	stats.NotPaid = notpaid

	nextMonthExpense, err := hs.Expense.FindNextMonthExpenses(query)
	if err != nil {
		return InternalServerError(err)
	}
	stats.NextMonthExpense = nextMonthExpense

	dues, err := hs.Expense.FindDues(query)
	if err != nil {
		return InternalServerError(err)
	}
	stats.Dues = dues

	return JSON(http.StatusOK, stats)
}

// 	return JSON(stats)
// }

// type StatusRequest struct {
// 	Status  m.ExpenseStatus `json:"status"`
// 	Comment string          `json:"comment"`
// }

// func (hs *HTTPServer) ChangeExpenseStatus(ctx *macaron.Context, payload StatusRequest) Response {
// 	id, err := id.FromString(ctx.Params(":id"))
// 	if err != nil {
// 		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
// 	}

// 	updated, err := hs.Expense.ChangeStatus(m.FindByIdQuery{id}, payload.Status, payload.Comment)
// 	if err != nil {
// 		return InternalServerError(err)
// 	}
// 	return JSON(http.StatusOK, updated)
// }
