package rest

import (
	"gerenciador/ecommerce/util"
	catservice "gerenciador/pkg/category/service"
	"gerenciador/pkg/department/service"
	"gerenciador/pkg/models"
	"gerenciador/pkg/resource"
	subcatservice "gerenciador/pkg/subcategory/service"
	utils "gerenciador/pkg/util"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc       service.Service
	catsvc    catservice.Service
	subcatsvc subcatservice.Service
}

func New(r resource.Resource) Handler {
	return Handler{svc: service.New(r), catsvc: catservice.New(r), subcatsvc: subcatservice.New(r)}
}

func (h Handler) Add(ctx *gin.Context) {
	organizationID, err := util.GetOrganizationIDv2(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}

	var payload models.DepartmentRequest
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

	if payload.Categories != nil {
		categories := *payload.Categories
		for _, category := range categories {
			category.DepartmentID = *_id
			category.OrganizationID = organizationID
			categoryID, err := h.catsvc.Add(util.CtxFromGin(ctx), &category)
			if err != nil {
				ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
				return
			}

			if category.SubCategories != nil {
				subcategories := *category.SubCategories
				for _, subcategory := range subcategories {
					subcategory.CategoryID = *categoryID
					subcategory.OrganizationID = organizationID
					_, err := h.subcatsvc.Add(ctx, &subcategory)
					if err != nil {
						ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
						return
					}
				}
			}
		}
	}

	ctx.JSON(http.StatusOK, gin.H{"_id": _id})

}

func (h Handler) Update(ctx *gin.Context) {
	id, err := util.GetIDFromPath(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	var payload models.DepartmentRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, util.APIError(err))
		return
	}

	err = h.svc.Update(util.CtxFromGin(ctx), id, &payload)
	if err != nil {
		if err == utils.ErrNotFound {
			ctx.AbortWithStatusJSON(http.StatusNotFound, util.APIError(err))
			return
		}
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, util.APIError(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{})
}
