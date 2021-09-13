package api

import (
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	ts "gerenciador/pkg/timestamp"
	"math"
	"net/http"

	"github.com/globalsign/mgo/bson"
)

func (hs *HTTPServer) CreateOrderPayment(ctx *m.AdminReqContext, form m.CreateTransactionCmd) Response {

	logger := hs.log.New("CreateOrderPayment")

	orderId, err := id.FromString(ctx.Params(":orderId"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}
	order, err := hs.OrdersRepo.FindOne(m.FindByIdQuery{orderId})
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "could not find associated order", err)
	}

	if order.TotalPaid() == 0 {
		order, err = hs.OrdersRepo.Update(m.FindByIdQuery{orderId},
			bson.M{
				"status": m.PartialOrder,
			})
		if err != nil {
			logger.Error(err.Error())
			return Error(http.StatusInternalServerError, "could not update order", err)
		}
	}
	if order.TotalPaid()+form.Amount >= order.TotalPrice() {
		order, err = hs.OrdersRepo.Update(m.FindByIdQuery{orderId},
			bson.M{
				"status": m.ClosedOrder,
			})
		if err != nil {
			logger.Error(err.Error())
			return Error(http.StatusInternalServerError, "could not find associated order", err)
		}
	}

	form.CreatedAt = ts.Now()
	form.Id = id.New()
	form.OrderId = orderId
	trx, err := hs.TransactionsRepo.Save(form)
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "could not save payment", err)
	}

	if form.ChequeID.Valid() {

		_, err := hs.Cheque.ChangeStatus(m.FindByIdQuery{Id: *form.ChequeID}, m.ChequeStatusCompensated, "")
		if err != nil {
			return Error(http.StatusInternalServerError, "could not update cheque status", err)
		}
	}

	return JSON(http.StatusOK, trx)
}

func (hs *HTTPServer) UpdateOrderPayment(ctx *m.AdminReqContext, form m.CreateTransactionCmd) Response {

	logger := hs.log.New("CreateOrderPayment")

	orderId, err := id.FromString(ctx.Params(":orderId"))
	if err != nil {
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}
	order, err := hs.OrdersRepo.FindOne(m.FindByIdQuery{orderId})
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "could not find associated order", err)
	}

	transactionId, err := id.FromString(ctx.Params(":transactionId"))
	transaction, err := hs.TransactionsRepo.FindOne(m.FindByIdQuery{Id: transactionId})
	if err != nil {
		return Error(http.StatusInternalServerError, "could not find associated order", err)
	}

	if order.TotalPaid()-transaction.Amount+form.Amount >= order.TotalPrice() {
		order, err = hs.OrdersRepo.Update(m.FindByIdQuery{orderId},
			bson.M{
				"status": m.ClosedOrder,
			})
		if err != nil {
			return Error(http.StatusInternalServerError, "could not update order", err)
		}
	} else {
		order, err = hs.OrdersRepo.Update(m.FindByIdQuery{orderId},
			bson.M{
				"status": m.PartialOrder,
			})
		if err != nil {
			return Error(http.StatusInternalServerError, "could not update order", err)
		}
	}
	form.OrderId = orderId
	updatedTransaction, err := hs.TransactionsRepo.Update(m.FindByIdQuery{Id: transactionId}, form)
	if err != nil {
		return Error(http.StatusInternalServerError, "could not update order", err)
	}

	if form.ChequeID.Valid() {
		_, err := hs.Cheque.ChangeStatus(m.FindByIdQuery{Id: *form.ChequeID}, m.ChequeStatusCompensated, "")
		if err != nil {
			return Error(http.StatusInternalServerError, "could not update cheque status", err)
		}
	}

	return JSON(http.StatusOK, updatedTransaction)
}

func (hs *HTTPServer) DeleteOrderPayment(ctx *m.AdminReqContext) Response {
	orderId, err := id.FromString(ctx.Params(":orderId"))
	if err != nil {
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	transactionId, err := id.FromString(ctx.Params(":transactionId"))
	if err != nil {
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}
	if err := hs.TransactionsRepo.Delete(m.FindByIdQuery{Id: transactionId}); err != nil {
		return Error(http.StatusInternalServerError, "could not find associated order", err)
	}

	order, err := hs.OrdersRepo.FindOne(m.FindByIdQuery{orderId})
	if err != nil {
		return Error(http.StatusInternalServerError, "could not find associated order", err)
	}

	if order.TotalPaid() == 0 {
		order, err = hs.OrdersRepo.Update(m.FindByIdQuery{orderId},
			bson.M{
				"status": m.OpenOrder,
			})
		if err != nil {
			return Error(http.StatusInternalServerError, "could not update order", err)
		}
	} else {
		order, err = hs.OrdersRepo.Update(m.FindByIdQuery{orderId},
			bson.M{
				"status": m.PartialOrder,
			})
		if err != nil {
			return Error(http.StatusInternalServerError, "could not update order", err)
		}
	}

	return JSON(http.StatusOK, map[string]string{"message": "transaction deleted successfully!"})
}

func (hs *HTTPServer) GetOrderPayments(ctx *m.AdminReqContext) Response {
	logger := hs.log.New("GetOrders")
	//todo add filter/sort  methods
	//todo add default paging of twenty products

	orderId, err := id.FromString(ctx.Params(":orderId"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	query := m.FindTransactionQuery{
		Pagination: m.NewPaginationFromParams(ctx.Req.URL.Query()),
		OrderId:    orderId,
	}

	trxs, err := hs.TransactionsRepo.Find(query)
	if err != nil {
		if err == m.ErrTransactionNotFound {
			return JSON(http.StatusOK, m.NewEmptyPageResponse())
		}
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	count, err := hs.TransactionsRepo.Count(query)
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	for _, t := range trxs {
		t.CreatedAt = ts.Timestamp{Time: t.Id.Time()}
	}

	pageResp := m.PageResponse{
		Data:  trxs,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}

	return JSON(http.StatusOK, pageResp)
}
