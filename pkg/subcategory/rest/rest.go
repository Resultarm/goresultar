package rest

import (
	"gerenciador/ecommerce/util"
	"gerenciador/pkg/models"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/subcategory/service"
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
	organizationID, err := util.GetOrganizationID(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}

	var payload models.SubCategoryv2
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	organizationIDv2, _ := primitive.ObjectIDFromHex(organizationID.Hex())
	payload.OrganizationID = organizationIDv2

	_id, err := h.svc.Add(util.CtxFromGin(ctx), &payload)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"_id": _id})

}
