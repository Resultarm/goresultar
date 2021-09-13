package api

import (
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"math"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/globalsign/mgo/bson"
	"gopkg.in/macaron.v1"
)

func (hs *HTTPServer) CreateBrand(c *gin.Context) {

	organizationID, err := GetOrganizationID(c)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
		return
	}
	var payload m.BrandRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, APIError(err))
		return
	}

	payload.OrganizationID = organizationID

	err = hs.BrandRepository.Save(payload)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
		return
	}

	c.JSON(http.StatusOK, nil)
	return
}

func (hs *HTTPServer) GetBrands(ctx *m.AdminReqContext) Response {
	query := m.RangeOrgUserQuery{
		Pagination: m.NewPaginationFromParams(ctx.Req.URL.Query()),
	}
	query.OrganizationID = ctx.OrganizationID

	brands, err := hs.BrandRepository.Find(query)
	if err != nil {
		if err == m.ErrBrandNotFound {
			return JSON(http.StatusOK, m.NewEmptyPageResponse())
		}
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	count, err := hs.BrandRepository.Count(query)
	if err != nil {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}
	pageResp := m.PageResponse{
		Data:  brands,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}

	return JSON(http.StatusOK, pageResp)
}

func (hs *HTTPServer) GetBrand(ctx *macaron.Context) Response {
	logger := hs.log.New("GetBrand")

	brandId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	brand, err := hs.BrandRepository.FindOne(m.FindByIdQuery{brandId})
	if err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, brand)

}

func (hs *HTTPServer) UpdateBrand(ctx *macaron.Context, form m.Brand) Response {
	logger := hs.log.New("UpdateBrand")
	brandId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	brand, err := hs.BrandRepository.Update(m.FindByIdQuery{brandId},
		bson.M{
			"title":        form.Title,
			"description":  form.Description,
			"departmentId": form.DepartmentID,
		})
	if err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, brand)
}

func (hs *HTTPServer) DeleteBrand(ctx *macaron.Context) Response {
	logger := hs.log.New("DeleteBrand")
	brandId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	_, err = hs.ProductModelsRepository.FindOne(
		m.FindProductModelQuery{BrandId: brandId})
	if err != nil && err != m.ErrProductModelNotFound {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}

	if err == nil {
		return Error(http.StatusBadRequest, "cannot delete brand, it has associated model", err)
	}

	_, err = hs.BrandRepository.Update(m.FindByIdQuery{brandId},
		bson.M{"deletedAt": time.Now()})
	if err != nil && err != m.ErrBrandNotFound {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return Success("brand deleted")
}
