package rest

import (
	"gerenciador/ecommerce/util"
	"gerenciador/pkg/order/model"
	"gerenciador/pkg/order/service"
	"gerenciador/pkg/resource"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Handler struct {
	svc service.Service
}

func New(r *resource.Resource) Handler {
	return Handler{svc: service.New(r)}
}

func (h Handler) Place(ctx *gin.Context) {
	var payload model.OrderRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	id, err := h.svc.Place(util.CtxFromGin(ctx), &payload)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}

	ctx.JSON(http.StatusOK, util.APIResponse(id, nil))

}

func (h Handler) Update(ctx *gin.Context) {

	idStr := ctx.Param("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	var payload model.OrderRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	err = h.svc.Update(util.CtxFromGin(ctx), id, &payload)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}

	ctx.JSON(http.StatusOK, util.APIResponse(nil, nil))
	return
}

func (h Handler) ToOrder(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	if err := h.svc.ToOrder(util.CtxFromGin(ctx), id); err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}
	ctx.JSON(http.StatusOK, util.APIResponse(nil, nil))
	return
}
