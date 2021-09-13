package rest

import (
	"gerenciador/ecommerce/util"
	"gerenciador/pkg/orderpayment/model"
	"gerenciador/pkg/orderpayment/service"
	"gerenciador/pkg/resource"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc service.Service
}

func New(r resource.Resource) Handler {
	return Handler{svc: service.New(r)}
}

func (h Handler) Add(ctx *gin.Context) {
	var payload model.OrderPaymentRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	_id, err := h.svc.Add(util.CtxFromGin(ctx), &payload)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"_id": _id})

}
