package api

import (
	"encoding/json"
	"fmt"
	"gerenciador/pkg/id"
	"gerenciador/pkg/log"
	m "gerenciador/pkg/models"

	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
	"gopkg.in/macaron.v1"
)

func (hs *HTTPServer) CreateOrder(ctx *m.AdminReqContext, form m.OrderRequest) Response {

	logger := hs.log.New("CreateOrder")

	if len(ctx.OrganizationID) == 0 {
		return Error(http.StatusBadRequest, "organizationId not present", nil)
	}

	form.Id = id.New()
	if form.IsQuotation {
		form.Status = m.QuotationOrder
	} else {
		form.Status = m.OpenOrder
		form.ProcessStatus = m.StatusNew
	}
	form.OrganizationID = ctx.OrganizationID[0]
	form.UserID = ctx.Admin.ID

	productItems := map[id.ID]float64{}
	productIds := []id.ID{}

	for _, item := range form.Items {
		productItems[item.ProductId] = productItems[item.ProductId] + item.Amount
		productIds = append(productIds, item.ProductId)

	}
	products, err := hs.ProductsRepo.Find(m.NewQuery(bson.M{
		"_id": bson.M{
			"$in": productIds,
		}}), true)

	if err != nil {
		logger.Error(err.Error())
		if err == m.ErrProductNotFound {
			return Error(http.StatusBadRequest, "order product not found", err)
		}
		return Error(http.StatusInternalServerError, "could not save order", err)
	}

	var productsMap = map[id.ID]*m.Product{}
	for _, prod := range products {
		if !prod.IsService && !form.IsQuotation && prod.TotalUnits < productItems[prod.ID] {
			return Error(http.StatusBadRequest, "not enough in stock", err)
		}
		productsMap[prod.ID] = prod
	}

	for key, item := range form.Items {
		form.Items[key].Cost = productsMap[item.ProductId].Cost
		form.Items[key].Price = productsMap[item.ProductId].Price
	}

	if form.PaidAmount > 0 {
		if form.PaymentMethod < 0 {
			return Error(http.StatusBadRequest, "payment method required", nil)
		}

		if form.PaidAmount < form.TotalPrice() {
			form.IsQuotation = true
			form.Status = m.PartialOrder
		} else if form.PaidAmount == form.TotalPrice() {
			form.Status = m.ClosedOrder
		} else {
			return Error(http.StatusBadRequest, "paid amount can't be greater than order total", nil)
		}
	}

	order, err := hs.OrdersRepo.Save(form)
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "could not save order", err)
	}

	if form.PaidAmount > 0 {

		t := m.CreateTransactionCmd{
			GenericTransactionForm: m.GenericTransactionForm{
				OrderId:  order.Id,
				Amount:   form.PaidAmount,
				FileLink: form.ProofOfPayment,
				Method:   form.PaymentMethod,
			},
		}
		transaction, err := hs.TransactionsRepo.Save(t)
		if err != nil {
			logger.Error(err.Error())
			return Error(http.StatusInternalServerError, "order saved, but failed to save transaction", err)
		}
		order.Transactions = m.Transactions{transaction}
	}

	if !form.IsQuotation {
		for productId, quantity := range productItems {
			err := hs.ProductsRepo.DecQuantity(m.FindByIdQuery{Id: productId}, quantity)
			if err != nil {
				return Error(http.StatusInternalServerError, "could not decrease product quantity", err)
			}
		}
	}

	return JSON(http.StatusOK, order)
}
func (hs *HTTPServer) GetOrders(ctx *m.AdminReqContext) Response {

	logger := hs.log.New("GetOrders")
	params := ctx.Req.URL.Query()

	orderID, _ := id.FromString(params.Get("_id"))
	status, _ := strconv.Atoi(params.Get("status"))
	processStatus, _ := strconv.Atoi(params.Get("processStatus"))
	totalPaid, _ := strconv.ParseFloat(params.Get("totalPaid"), 10)
	totalCost, _ := strconv.ParseFloat(params.Get("totalCost"), 10)
	totalUnits, _ := strconv.Atoi(params.Get("totalUnits"))

	query := m.FindOrderQuery{
		Pagination:    m.NewPaginationFromParams(params),
		Id:            orderID,
		Comment:       params.Get("comment"),
		TotalCost:     totalCost,
		TotalUnits:    totalUnits,
		Status:        m.OrderStatus(status),
		ProcessStatus: m.OrderProcessStatus(processStatus),
		TotalPaid:     totalPaid,

		TimeRange: m.NewTimeRangeFromTimestampStrings(
			params.Get("from"),
			params.Get("to")),
	}

	query.OrganizationID = ctx.OrganizationID

	if ctx.Admin.RoleNumber == 8 {
		query.UserID = ctx.Admin.ID
	}

	orders, err := hs.OrdersRepo.Find(query)
	if err != nil {
		if err == m.ErrOrderNotFound {
			return JSON(http.StatusOK, m.NewEmptyPageResponse())
		}
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	count, err := hs.OrdersRepo.Count(query)
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	var dtos []m.OrderDto
	for _, order := range orders {
		dtos = append(dtos, m.OrderDto{
			Id:                order.Id,
			Items:             order.Items,
			Comment:           order.Comment,
			Status:            order.Status,
			CreatedAt:         order.CreatedAt,
			TotalCost:         order.TotalPrice(),
			TotalUnits:        order.TotalUnits(),
			TotalPaid:         order.TotalPaid(),
			ClientID:          order.ClientId,
			Client:            order.Client,
			OrderID:           order.OrderID,
			Transactions:      order.Transactions,
			ProcessStatus:     order.ProcessStatus,
			EstConclusionDate: order.EstConclusionDate,
			Documents:         order.Documents,
			OrganizationID:    order.OrganizationID,
			Organization:      order.Organization,
			Discount:          order.Discount,
		})
	}
	pageResp := m.PageResponse{
		Data:  dtos,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}

	return JSON(http.StatusOK, pageResp)
}

func (hs *HTTPServer) GetCountByProcessStatus(ctx *m.AdminReqContext) Response {

	query := m.RangeOrgUserQuery{TimeRange: m.NewTimeRangeFromTimestampStrings(
		ctx.Query("from"),
		ctx.Query("to")),
		UseIDQuery: true,
	}
	query.OrganizationID = ctx.OrganizationID

	result, err := hs.OrdersRepo.GetCountByProcessStatus(query)
	if err != nil {
		log.Info("Failed to get counts by process status : %v", err)
		return Error(http.StatusInternalServerError, err.Error(), err)
	}

	return JSON(http.StatusOK, result)
}

func (hs *HTTPServer) GetOrderStats(ctx *m.AdminReqContext) Response {
	logger := hs.log.New("GetOrderStats")

	query := m.FindOrderQuery{TimeRange: m.NewTimeRangeFromTimestampStrings(
		ctx.Query("from"),
		ctx.Query("to"))}

	query.OrganizationID = ctx.OrganizationID

	stats, err := hs.OrdersRepo.Statistics(query, id.ID{})
	if err != nil {
		if err == m.ErrOrderNotFound {
			return JSON(http.StatusOK, m.NewEmptyPageResponse())
		}
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	return JSON(http.StatusOK, stats)
}

func (hs *HTTPServer) FindOrder(ctx *macaron.Context) Response {
	logger := hs.log.New("FindOrder")

	orderId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	order, err := hs.OrdersRepo.FindOne(m.FindByIdQuery{orderId})
	if err != nil {
		return InternalServerError(fmt.Errorf("failed to get order <- %s", err))
	}
	return JSON(http.StatusOK, m.OrderDto{
		Id:                order.Id,
		Items:             order.Items,
		Comment:           order.Comment,
		Status:            order.Status,
		ProcessStatus:     order.ProcessStatus,
		CreatedAt:         order.CreatedAt,
		TotalCost:         order.TotalPrice(),
		TotalUnits:        order.TotalUnits(),
		TotalPaid:         order.TotalPaid(),
		Client:            order.Client,
		OrderID:           order.OrderID,
		User:              order.User,
		EstConclusionDate: order.EstConclusionDate,
		Documents:         order.Documents,
		Organization:      order.Organization,
		Discount:          order.Discount,
	})

}

func (hs *HTTPServer) UpdateOrder(ctx *m.AdminReqContext, form m.OrderRequest) Response {
	logger := hs.log.New("UpdateOrder")
	logger.Info("Updating order")

	orderId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	form.Id = orderId
	if form.IsQuotation {
		form.Status = m.QuotationOrder
	} else {
		form.Status = m.OpenOrder
	}

	form.UserID = ctx.Admin.ID

	productItems := map[id.ID]float64{}
	newProductIDs := []id.ID{}

	existingOrder, err := hs.OrdersRepo.FindOne(m.FindByIdQuery{orderId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to get existing order <- %s", err))
		return InternalServerError(err)
	}

	for _, item := range form.Items {
		for _, existingProduct := range existingOrder.Items {
			if existingProduct.ProductId == item.ProductId {
				if existingProduct.Amount != item.Amount {
					return Error(http.StatusBadRequest, "changing order quantity not allowed", nil)
				}
			} else {
				productItems[item.ProductId] = productItems[item.ProductId] + item.Amount
				newProductIDs = append(newProductIDs, item.ProductId)
			}
		}
	}

	if len(newProductIDs) > 0 {
		products, err := hs.ProductsRepo.Find(m.NewQuery(bson.M{
			"_id": bson.M{
				"$in": newProductIDs,
			}}), true)

		if err != nil {
			logger.Error(fmt.Sprintf("failed to get products: %v <-", err.Error()))
			if err == m.ErrProductNotFound {
				return Error(http.StatusBadRequest, "order product not found", err)
			}
			return Error(http.StatusInternalServerError, "could not save order", err)

		}
		var productsMap = map[id.ID]*m.Product{}
		for _, prod := range products {
			if !prod.IsService && prod.TotalUnits < productItems[prod.ID] {
				return Error(http.StatusBadRequest, "not enough in stock", err)
			}
			productsMap[prod.ID] = prod
		}

		for key, item := range form.Items {
			if productsMap[item.ProductId] != nil {
				form.Items[key].Cost = productsMap[item.ProductId].Cost
				form.Items[key].Price = productsMap[item.ProductId].Price
			}
		}
	}

	order, err := hs.OrdersRepo.Update(m.FindByIdQuery{orderId}, form)
	if err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, order)
}

func (hs *HTTPServer) UpdateOrderStatus(ctx *macaron.Context) Response {
	logger := hs.log.New("UpdateOrderStatus")
	orderId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	reader := ctx.Req.Body().ReadCloser()
	dec := json.NewDecoder(reader)
	var payload map[string]int
	if err := dec.Decode(&payload); err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}

	order, err := hs.OrdersRepo.UpdateProcessStatus(m.FindByIdQuery{orderId}, payload)

	if err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, order)
}

func (hs *HTTPServer) UpdateOrderProcessStatus(ctx *macaron.Context) Response {
	logger := hs.log.New("UpdateOrderProcessStatus")
	orderId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	reader := ctx.Req.Body().ReadCloser()
	dec := json.NewDecoder(reader)
	var payload map[string]interface{}
	if err := dec.Decode(&payload); err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}
	log.Info("%v", payload)
	order, err := hs.OrdersRepo.UpdateProcessStatus(m.FindByIdQuery{orderId}, payload)
	log.Info("%v", order)
	if err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, order)
}

func (hs *HTTPServer) GetAllOrderStatuses(ctx *macaron.Context) Response {
	r, _ := hs.OrdersRepo.GetAllOrderStatuses()
	return JSON(http.StatusOK, r)
}

func (hs *HTTPServer) DeleteOrder(ctx *m.AdminReqContext, form m.DeleteOrderForm) Response {
	logger := hs.log.New("DeleteOrder")
	orderId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	if form.DeleteTrxs {
		query := m.FindTransactionQuery{
			OrderId: orderId,
		}
		_, err := hs.TransactionsRepo.Update(query, bson.M{"deletedAt": time.Now()})
		if err != nil {
			if err != mgo.ErrNotFound && err != m.ErrTransactionNotFound {
				hs.log.Error("deleting transactions faled", "err", err.Error())
				hs.log.Error(err.Error())
				return InternalServerError(err)
			}
		}
	}

	o, err := hs.OrdersRepo.Update(m.FindByIdQuery{orderId}, bson.M{"deletedAt": time.Now()})
	if err != nil && err != m.ErrOrderNotFound {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, o)
}
