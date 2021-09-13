package api

import (
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/util"
	"math"
	"net/http"

	"gopkg.in/macaron.v1"
)

func (hs *HTTPServer) GetDepartments(ctx *m.AdminReqContext) Response {

	query := m.RangeOrgUserQuery{
		Pagination: m.NewPaginationFromParams(ctx.Req.URL.Query()),
	}
	query.OrganizationID = ctx.OrganizationID

	departments, err := hs.DepartmentRepository.Find(query)
	if err != nil {
		if err != m.ErrDepartmentNotFound {
			hs.log.Error(err.Error())
			return Error(http.StatusInternalServerError, "", err)
		}
		departments = []*m.Department{}
	}

	count, err := hs.DepartmentRepository.Count(query)
	if err != nil && err != m.ErrDepartmentNotFound {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}
	pageResp := m.PageResponse{
		Data:  departments,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}

	return JSON(http.StatusOK, pageResp)
}

func (hs *HTTPServer) GetDepartmentsWithProfits(ctx *m.AdminReqContext) Response {

	query := m.RangeOrgUserQuery{}

	query.OrganizationID = ctx.OrganizationID

	departments, err := hs.DepartmentRepository.DepartmentsWithProfits(query)
	if err != nil {
		if err != m.ErrDepartmentNotFound {
			hs.log.Error(err.Error())
			return Error(http.StatusInternalServerError, "", err)
		}
	}

	return JSON(http.StatusOK, departments)
}

func (hs *HTTPServer) GetDepartment(ctx *macaron.Context) Response {
	logger := hs.log.New("GetDepartment")

	depId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	dep, err := hs.DepartmentRepository.FindOne(m.FindByIdQuery{depId})
	if err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, dep)

}

// func (hs *HTTPServer) UpdateDepartment(ctx *gin.Context) {

// 	id, err := id.FromString(ctx.Param("id"))
// 	if err != nil {
// 		ctx.AbortWithStatusJSON(http.StatusBadGateway, APIError(err))
// 		return
// 	}

// 	dep, err := hs.DepartmentRepository.FindOne(m.FindByIdQuery{id})
// 	if err != nil {
// 		ctx.AbortWithStatusJSON(http.StatusNotFound, APIError(err))
// 		return
// 	}

// 	var payload m.DepartmentRequest
// 	if err := ctx.ShouldBind(&payload); err != nil {
// 		ctx.AbortWithStatusJSON(http.StatusBadGateway, APIError(err))
// 		return
// 	}
// 	payload.OrganizationID, _ = primitive.ObjectIDFromHex(dep.OrganizationID.Hex())

// 	updated, err := hs.DepartmentRepository.Update(m.FindByIdQuery{id}, &payload)
// 	if err != nil {
// 		ctx.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
// 		return
// 	}

// 	ctx.JSON(http.StatusOK, updated)
// }

func (hs *HTTPServer) DeleteDepartment(ctx *macaron.Context) Response {
	logger := hs.log.New("DeleteDepartment")
	depId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}
	_, err = hs.CategoryRepository.FindOne(m.FindCategoryQuery{DepartmentId: depId})
	if err != nil && err != util.ErrNotFound {
		return InternalServerError(err)
	}

	if err == nil {
		return Error(http.StatusBadRequest, "cannot delete department, it has associated category", err)
	}

	err = hs.DepartmentRepository.Remove(m.FindByIdQuery{depId})
	if err != nil && err != util.ErrNotFound {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return Success("department deleted")
}
