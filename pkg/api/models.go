package api

import (
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"math"
	"net/http"
	"time"

	"github.com/globalsign/mgo/bson"
	"gopkg.in/macaron.v1"
)

func (hs *HTTPServer) CreateModel(ctx *m.AdminReqContext, cmd m.ProductModel) Response {

	logger := hs.log.New("CreateModel")

	cmd.Id = id.New()
	cmd.OrganizationID = ctx.OrganizationID[0]
	err := hs.ProductModelsRepository.Save(cmd)
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "could not save model", err)
	}

	return Success("model created")
}

func (hs *HTTPServer) GetModels(ctx *m.AdminReqContext) Response {

	query := m.RangeOrgUserQuery{
		Pagination: m.NewPaginationFromParams(ctx.Req.URL.Query()),
	}
	query.OrganizationID = ctx.OrganizationID

	models, err := hs.ProductModelsRepository.Find(query)
	if err != nil {
		if err != m.ErrProductModelNotFound {
			hs.log.Error(err.Error())
			return Error(http.StatusInternalServerError, "", err)
		}
		models = []*m.ProductModel{}
	}

	count, err := hs.ProductModelsRepository.Count(query)
	if err != nil && err != m.ErrProductModelNotFound {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}
	pageResp := m.PageResponse{
		Data:  models,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}
	return JSON(http.StatusOK, pageResp)
}

func (hs *HTTPServer) GetModel(ctx *macaron.Context) Response {
	logger := hs.log.New("GetModel")

	modelId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	model, err := hs.ProductModelsRepository.FindOne(m.FindByIdQuery{modelId})
	if err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, model)

}

func (hs *HTTPServer) UpdateModel(ctx *macaron.Context, form m.ProductModel) Response {
	logger := hs.log.New("UpdateModel")
	modelId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	model, err := hs.ProductModelsRepository.Update(m.FindByIdQuery{modelId},
		bson.M{
			"brandId":     form.BrandId,
			"title":       form.Title,
			"description": form.Description,
		})
	if err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, model)
}

func (hs *HTTPServer) DeleteModel(ctx *macaron.Context) Response {
	logger := hs.log.New("DeleteModel")
	modelId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	products, err := hs.ProductsRepo.Find(m.FindProductQuery{
		ModelId: modelId,
		Status:  m.ProductActive,
	}, false)
	if err != nil {
		if err != m.ErrProductNotFound {
			return InternalServerError(err)
		}
	}
	if len(products) != 0 {
		return Error(http.StatusBadRequest, "model has associated active products", nil)
	}

	_, err = hs.ProductModelsRepository.Update(m.FindByIdQuery{modelId},
		bson.M{"deletedAt": time.Now()})
	if err != nil && err != m.ErrProductModelNotFound {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return Success("model deleted")
}
