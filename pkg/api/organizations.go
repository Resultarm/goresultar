package api

import (
	"fmt"
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	ts "gerenciador/pkg/timestamp"
	"gerenciador/pkg/util"
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/globalsign/mgo/bson"
	"gopkg.in/macaron.v1"
)

func (hs *HTTPServer) CreateOrganization(ctx *m.AdminReqContext, cmd m.Organization) Response {

	logger := hs.log.New("CreateOrganization")

	cmd.Id = id.New()
	cmd.CreatedAt = ts.Now()
	for index := range cmd.Branches {
		cmd.Branches[index].Id = id.New()
	}
	err := hs.OrganizationsRepo.Save(cmd)
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "could not save org", err)
	}

	return Success("org created")
}

func (hs *HTTPServer) GetOrganizations(ctx *gin.Context) {
	organizationIDs, err := GetOrganizationIDs(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, APIError(err))
	}

	query := m.FindOrganizationQuery{
		ID: organizationIDs,
	}

	orgs, err := hs.OrganizationsRepo.Find(query)
	if err != nil {
		if err != m.ErrOrganizationNotFound {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
			return
		}
		orgs = []*m.Organization{}
	}

	count, err := hs.OrganizationsRepo.Count(query)
	if err != nil && err != m.ErrOrganizationNotFound {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
		return
	}

	pageResp := m.PageResponse{
		Data:  orgs,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}

	ctx.JSON(http.StatusOK, pageResp)
	return
}

func (hs *HTTPServer) GetOrganization(ctx *macaron.Context) Response {
	logger := hs.log.New("UpdateOrganization")

	orgId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	org, err := hs.OrganizationsRepo.FindOne(m.FindByIdQuery{orgId})
	if err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, org)

}

func (hs *HTTPServer) UpdateOrganization(ctx *macaron.Context, form m.Organization) Response {
	logger := hs.log.New("UpdateOrganization")
	orgId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}
	for index := range form.Branches {
		if form.Branches[index].Id.Valid() {
			continue
		}
		form.Branches[index].Id = id.New()
	}
	org, err := hs.OrganizationsRepo.Update(m.FindByIdQuery{orgId},
		bson.M{
			"title":       form.Title,
			"description": form.Description,
			"branches":    form.Branches,
			"logoUrl":     form.LogoURL,
		})
	if err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, org)
}

func (hs *HTTPServer) DeleteOrganization(ctx *macaron.Context) Response {
	logger := hs.log.New("DeleteOrganization")
	orgId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	//products, err := hs.ProductsRepo.Find(m.FindProductQuery{
	//	ModelId: orgId,
	//	Status:  m.ProductActive,
	//})
	//if err != nil {
	//	if err != m.ErrOrganizationNotFound {
	//		return InternalServerError(err)
	//	}
	//}
	//if len(products) != 0 {
	//	return Error(http.StatusBadRequest, "organization has associated active products", nil)
	//}

	err = hs.BrandRepository.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete brands <- %s", err))
		return InternalServerError(err)
	}

	err = hs.CategoryRepository.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete categories <- %s", err))
		return InternalServerError(err)
	}

	err = hs.SubCategoryRepository.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete sub categories <- %s", err))
		return InternalServerError(err)
	}

	err = hs.DepartmentRepository.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete departments <- %s", err))
		return InternalServerError(err)
	}
	err = hs.ProductModelsRepository.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete models <- %s", err))
		return InternalServerError(err)
	}

	err = hs.ProductsRepo.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete products <- %s", err))
		return InternalServerError(err)
	}

	err = hs.Cheque.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete cheques <- %s", err))
		return InternalServerError(err)
	}

	err = hs.Expense.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete expenses <- %s", err))
		return InternalServerError(err)
	}

	err = hs.Task.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete tasks <- %s", err))
		return InternalServerError(err)
	}

	err = hs.Vehicle.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("Falha ao deletar veiculo <- %s", err))
		return InternalServerError(err)
	}

	err = hs.OrdersRepo.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete orders <- %s", err))
		return InternalServerError(err)
	}

	err = hs.TransactionsRepo.Remove(m.FindByOrgID{orgId})
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete transactions <- %s", err))
		return InternalServerError(err)
	}

	err = hs.AdminRepo.Remove(m.NewQuery(bson.M{"organizationIds": []id.ID{orgId}}))
	if err != nil {
		hs.log.Error(fmt.Sprintf("failed to delete users <- %s", err))
		return InternalServerError(err)
	}

	err = hs.OrganizationsRepo.Remove(m.FindByIdQuery{orgId})
	if err != nil && err != m.ErrOrganizationNotFound {
		hs.log.Error(fmt.Sprintf("failed to delete org <- %s", err))
		return InternalServerError(err)
	}
	return Success("org deleted")
}

func (hs *HTTPServer) UploadLogo(ctx *m.AdminReqContext) Response {

	logger := hs.log.New("UploadLogo")
	if err := ctx.Req.ParseForm(); err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}

	entity := ctx.Req.URL.Query().Get("entity")

	_, header, err := ctx.Req.FormFile("file")
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusBadRequest, "could not process file", err)
	}

	contentType := header.Header.Get("Content-Type")
	if !util.AllowedImageType(contentType) {
		return Error(http.StatusBadRequest,
			"unsupported image type: expected jpeg, png, jpg. got "+contentType, nil)
	}
	fileName, err := hs.FileSaver.SaveFile(entity, header)
	if entity != "" {
		fileName = "/assets/" + entity + "/" + fileName
	}
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not upload file", err)
	}

	return Success(fileName)
}
