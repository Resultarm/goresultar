package rest

import (
	"gerenciador/ecommerce/util"
	"gerenciador/pkg/product/model"
	"gerenciador/pkg/product/service"
	"gerenciador/pkg/resource"
	util2 "gerenciador/pkg/util"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Handler struct {
	svc service.Service
}

func New(r resource.Resource) Handler {
	return Handler{svc: service.New(r)}
}

func (h Handler) Add(ctx *gin.Context) {

	organizationID, err := util.GetOrganizationIDv2(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}

	var payload model.ProductRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	payload.OrganizationID = &organizationID

	_id, err := h.svc.Add(util.CtxFromGin(ctx), &payload)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}

	ctx.JSON(http.StatusOK, util.APIResponse(_id, nil))
	return
}

func (h Handler) Get(ctx *gin.Context) {

	idStr := ctx.Param("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	p, err := h.svc.Get(util.CtxFromGin(ctx), &id)
	if err != nil {
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
			return
		}
	}
	ctx.JSON(http.StatusOK, util.APIResponse(p, nil))
}

func (h Handler) Update(ctx *gin.Context) {

	idStr := ctx.Param("id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	var payload model.ProductRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	err = h.svc.Update(util.CtxFromGin(ctx), &id, &payload)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}

	ctx.JSON(http.StatusOK, util.APIResponse(nil, nil))
	return
}

func (h Handler) GetAll(ctx *gin.Context) {
	rangeQuery := util2.RangeOrgsUserQueryFromGin(ctx)

	_id, err := h.svc.GetAll(util.CtxFromGin(ctx), rangeQuery)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}

	ctx.JSON(http.StatusOK, util.APIResponse(_id, nil))
	return
}
