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

func (hs *HTTPServer) CreateCategory(ctx *m.AdminReqContext, cmd m.Category) Response {

	logger := hs.log.New("CreateCategory")

	cmd.Id = id.New()
	cmd.OrganizationID = ctx.OrganizationID[0]
	err := hs.CategoryRepository.Save(cmd)
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "could not save category", err)
	}

	return Success("category created")
}

func (hs *HTTPServer) GetCategories(ctx *m.AdminReqContext) Response {

	//todo add filter/sort  methods
	//todo add default paging of twenty categories
	query := m.FindCategoryQuery{
		Pagination: m.NewPaginationFromParams(ctx.Req.URL.Query())}

	query.OrganizationID = ctx.OrganizationID

	categories, err := hs.CategoryRepository.Find(query)
	if err != nil {
		if err == m.ErrCategoryNotFound {
			return JSON(http.StatusOK, m.NewEmptyPageResponse())
		}
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	count, err := hs.CategoryRepository.Count(query)
	if err != nil {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}
	pageResp := m.PageResponse{
		Data:  categories,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}

	return JSON(http.StatusOK, pageResp)
}

func (hs *HTTPServer) GetCategory(ctx *macaron.Context) Response {
	logger := hs.log.New("GetCategory")

	catId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	category, err := hs.CategoryRepository.FindOne(m.FindByIdQuery{catId})
	if err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, category)

}

func (hs *HTTPServer) UpdateCategory(ctx *macaron.Context, form m.Category) Response {
	logger := hs.log.New("UpdateCategory")
	catId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	category, err := hs.CategoryRepository.Update(m.FindByIdQuery{catId},
		bson.M{
			"departmentId": form.DepartmentId,
			"title":        form.Title,
			"description":  form.Description,
		})
	if err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, category)
}

func (hs *HTTPServer) DeleteCategory(ctx *macaron.Context) Response {
	logger := hs.log.New("DeleteCategory")
	catId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	_, err = hs.SubCategoryRepository.FindOne(m.FindSubcategoryQuery{CategoryId: catId})
	if err != nil && err != util.ErrNotFound {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}

	if err == nil {
		return Error(http.StatusBadRequest, "cannot delete category, it has associated subcategory", err)
	}
	_, err = hs.CategoryRepository.Update(m.FindByIdQuery{catId},
		bson.M{"deletedAt": time.Now()})
	if err != nil && err != m.ErrCategoryNotFound {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return Success("category deleted")
}
