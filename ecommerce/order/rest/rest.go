package rest

import (
	"gerenciador/ecommerce/order/service"
	"gerenciador/ecommerce/util"
	"gerenciador/pkg/api"
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

func (h Handler) GetAll(ctx *gin.Context) {

	orders, err := h.svc.GetAll(util.CtxFromGin(ctx))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, api.APIError(err))
		return
	}

	ctx.JSON(http.StatusOK, orders)
	return
}
