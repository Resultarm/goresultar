package rest

import (
	"gerenciador/ecommerce/util"
	"gerenciador/pkg/analytics/service"
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

func (handler Handler) GetDepartmentWiseProfit(ctx *gin.Context) {
	departments, err := handler.svc.GetDepartmentWiseProfit(util.CtxFromGin(ctx))
	if err != nil {
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
			return
		}
	}
	ctx.JSON(http.StatusOK, util.APIResponse(departments, nil))
}

func (handler Handler) GetProductWiseProfit(ctx *gin.Context) {
	products, err := handler.svc.GetProductWiseProfit(util.CtxFromGin(ctx))
	if err != nil {
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
			return
		}
	}
	ctx.JSON(http.StatusOK, util.APIResponse(products, nil))
}
