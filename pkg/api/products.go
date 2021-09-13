package api

import (
	"encoding/json"
	"fmt"
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"math"
	"net/http"

	"github.com/globalsign/mgo/bson"
	"gopkg.in/macaron.v1"
)

func (hs *HTTPServer) CreateProduct(ctx *m.AdminReqContext, form m.ProductRequest) Response {

	logger := hs.log.New("CreateProduct")

	if len(ctx.OrganizationID) == 0 {
		return Error(http.StatusBadRequest, "organization not present", nil)
	}
	form.OrganizationID = &ctx.OrganizationID[0]
	form.Status = m.ProductActive

	if err := hs.ProductsRepo.Save(form); err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "could not save product", err)
	}

	//todo generate QR code product url page url and it name, price and status
	return Success("product saved")
}

func (hs *HTTPServer) GetProducts(ctx *m.AdminReqContext) Response {

	//todo add filter/sort  methods
	//todo add default paging of twenty products
	// query := m.FindProductQuery{Pagination: m.NewPaginationFromParams(ctx.Req.URL.Query())}
	// query.OrganizationID = ctx.OrganizationID
	query := m.RangeOrgsUserQueryFromCtx(ctx)

	products, err := hs.ProductsRepo.Find(query, false)
	if err != nil {
		if err == m.ErrProductNotFound {
			return JSON(http.StatusOK, m.NewEmptyPageResponse())
		}
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	count, err := hs.ProductsRepo.Count(query)
	if err != nil {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	pageResp := m.PageResponse{
		Data:  products,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.Pagination.PerPage))),
	}

	return JSON(http.StatusOK, pageResp)
}

func (hs *HTTPServer) GetProductsStats(ctx *m.AdminReqContext) Response {
	logger := hs.log.New("GetProductsStats")

	matchQ := m.RangeOrgUserQuery{
		TimeRange:  m.NewTimeRangeFromTimestampStrings(ctx.Query("from"), ctx.Query("to")),
		UseIDQuery: true,
	}
	matchQ.OrganizationID = ctx.OrganizationID

	stats, err := hs.ProductsRepo.Statistics(matchQ)
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusBadRequest, "", err)
	}
	if len(stats) == 0 {
		return JSON(http.StatusOK, []interface{}{})
	}

	return JSON(http.StatusOK, stats)
}
func (hs *HTTPServer) GetProduct(ctx *macaron.Context) Response {
	logger := hs.log.New("GetProduct")

	prodId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	product, err := hs.ProductsRepo.FindOne(m.FindByIdQuery{prodId}, false)
	if err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}

	dto := m.ProductDto{
		ID:               prodId,
		Title:            product.Title,
		Description:      product.Description,
		ISBN:             product.ISBN,
		ImageURLs:        product.ImageURLs,
		Status:           product.Status,
		Cost:             product.Cost,
		Price:            product.Price,
		TotalUnits:       product.TotalUnits,
		ProductUnit:      product.ProductUnit,
		Comment:          product.Comment,
		MeasurementType:  product.MeasurementType,
		MeasurementValue: product.MeasurementValue,

		CreatedAt: product.CreatedAt,
		SellBy:    product.SellBy,
	}

	if product.CategoryId != nil && product.CategoryId.Valid() {
		//todo remove these lookups
		cat, err := hs.CategoryRepository.FindOne(m.FindByIdQuery{*product.CategoryId})
		if err != nil {
			return InternalServerError(fmt.Errorf("failed to get category <- %s", err))
		}
		dto.Category = cat
	}

	if product.ModelId != nil && product.ModelId.Valid() {
		mod, err := hs.ProductModelsRepository.FindOne(m.FindByIdQuery{*product.ModelId})
		if err != nil && err != m.ErrProductModelNotFound { // services dont have models
			logger.Error(err.Error())
			return InternalServerError(fmt.Errorf("failed to get category <- %s", err))
		}
		dto.Model = mod
	}

	fmt.Printf("product.SubcategoryId %#v", product.SubcategoryId)

	if product.SubcategoryId != nil && product.SubcategoryId.Valid() {
		subcat, err := hs.SubCategoryRepository.FindOne(m.FindByIdQuery{*product.SubcategoryId})
		if err != nil {
			logger.Error(err.Error())
			return InternalServerError(fmt.Errorf("failed to get sub category <- %s", err))
		}
		dto.SubCategory = subcat
	}

	if product.BrandId != nil && product.BrandId.Valid() {
		brand, err := hs.BrandRepository.FindOne(m.FindByIdQuery{*product.BrandId})
		if err != nil && err != m.ErrBrandNotFound {
			logger.Error(err.Error())
			return InternalServerError(fmt.Errorf("failed to get brand <- %s", err))
		}
		dto.Brand = brand
	}

	dep, err := hs.DepartmentRepository.FindOne(m.FindByIdQuery{product.DepartmentId})
	if err != nil {
		logger.Error(err.Error())
		return InternalServerError(fmt.Errorf("failed to get department <- %s", err))
	}
	dto.Department = dep

	if product.ProviderId.Valid() {
		provider, err := hs.AdminRepo.FindOne(m.FindByIdQuery{*product.ProviderId})
		if err != nil {
			logger.Error(err.Error())
			return InternalServerError(fmt.Errorf("failed to get provider <- %s", err))
		}
		dto.Provider = provider
	}

	//items.productId
	stats, err := hs.OrdersRepo.Statistics(m.NewQuery(bson.M{
		"items.productId": prodId,
	}), prodId)
	if err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}
	dto.Statistics = m.ProductStatistics{
		TotalUnitsSold: 0,
		OpenOrders:     stats.Open,
		Closed:         stats.Closed,
		Quotations:     stats.Quotations,
		Partial:        stats.Partial,
	}

	return JSON(http.StatusOK, dto)

}

func (hs *HTTPServer) UpdateProduct(ctx *macaron.Context) Response {
	logger := hs.log.New("UpdateProduct")

	prodId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	var form m.UpdateProductForm
	dec := json.NewDecoder(ctx.Req.Body().ReadCloser())
	if err := dec.Decode(&form); err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}

	product, err := hs.ProductsRepo.Update(m.FindByIdQuery{prodId}, form)
	if err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, product)
}

func (hs *HTTPServer) DeleteProduct(ctx *macaron.Context) Response {
	logger := hs.log.New("DeleteProduct")
	prodId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	err = hs.ProductsRepo.Remove(m.FindByIdQuery{Id: prodId})
	if err != nil && err != m.ErrProductNotFound {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return Success("product deleted")
}
