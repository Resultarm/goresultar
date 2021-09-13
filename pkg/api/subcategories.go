package api

import (
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/util"
	"math"
	"net/http"
	"time"

	"github.com/globalsign/mgo/bson"
	"gopkg.in/macaron.v1"
)

func (hs *HTTPServer) CreateSubcategory(ctx *m.AdminReqContext, cmd m.SubCategory) Response {

	logger := hs.log.New("CreateSubCategory")

	cmd.Id = id.New()
	cmd.OrganizationID = ctx.OrganizationID[0]
	err := hs.SubCategoryRepository.Save(cmd)
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "could not save subcategory", err)
	}

	return Success("subcategory created")
}

func (hs *HTTPServer) GetSubCategories(ctx *m.AdminReqContext) Response {

	query := m.RangeOrgUserQuery{
		Pagination: m.NewPaginationFromParams(ctx.Req.URL.Query()),
	}
	query.OrganizationID = ctx.OrganizationID

	subcategories, err := hs.SubCategoryRepository.Find(query)
	if err != nil {
		if err == util.ErrNotFound {
			return JSON(http.StatusOK, m.NewEmptyPageResponse())
		}
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	count, err := hs.SubCategoryRepository.Count(query)
	if err != nil {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}
	pageResp := m.PageResponse{
		Data:  subcategories,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}

	return JSON(http.StatusOK, pageResp)
}

func (hs *HTTPServer) GetSubCategory(ctx *macaron.Context) Response {
	logger := hs.log.New("GetSubCategory")

	catId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	subcategory, err := hs.SubCategoryRepository.FindOne(m.FindByIdQuery{catId})
	if err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, subcategory)

}

func (hs *HTTPServer) UpdateSubCategory(ctx *macaron.Context, form m.SubCategory) Response {
	logger := hs.log.New("UpdateSubCategory")
	catId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	subcategory, err := hs.SubCategoryRepository.Update(m.FindByIdQuery{catId},
		bson.M{
			"categoryId":  form.CategoryId,
			"title":       form.Title,
			"description": form.Description,
		})
	if err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, subcategory)
}

func (hs *HTTPServer) DeleteSubCategory(ctx *macaron.Context) Response {
	logger := hs.log.New("DeleteSubCategory")
	catId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	_, err = hs.SubCategoryRepository.Update(m.FindByIdQuery{catId},
		bson.M{"deletedAt": time.Now()})
	if err != nil && err != util.ErrNotFound {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return Success("subcategory deleted")
}
