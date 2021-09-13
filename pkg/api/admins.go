package api

import (
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/util"
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
	"gopkg.in/macaron.v1"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (hs *HTTPServer) Login(c *gin.Context) {

	var payload LoginRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, APIError(err))
		return
	}

	token, err := hs.AuthService.Authenticate(payload.Email, payload.Password)
	if err != nil {
		if err == util.ErrUnauthorized {
			c.AbortWithStatusJSON(http.StatusUnauthorized, APIError(err))
			return
		}

		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{"token": token})
	return
}

// func (hs *HTTPServer) RefreshToken(c *m.AdminReqContext, token m.Token) Response {
// 	logger := hs.log.New("RefreshToken")

// 	tok, err := hs.AuthService.NewJwtString(c.Admin.ID.Hex())
// 	if err != nil {
// 		logger.Error(err.Error())
// 		return Error(http.StatusBadRequest, "", err)
// 	}
// 	return JSON(http.StatusOK, m.Token{tok})

// }

func (hs *HTTPServer) CreateAdmin(ctx *m.AdminReqContext, cmd m.UserPayload) Response {

	logger := hs.log.New("CreateAdmin")

	err := hs.AdminRepo.Save(&cmd)
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusInternalServerError, "could not save admin", err)
	}

	return Success("Adicionado Com Sucesso.")
}

func (hs *HTTPServer) GetAdmins(ctx *m.AdminReqContext) Response {

	query := m.FindAdminQuery{
		Pagination: m.NewPaginationFromParams(ctx.Req.URL.Query()),
	}
	query.OrganizationID = ctx.OrganizationID
	if ctx.Admin.RoleNumber == m.SuperAdminRoleNumber {
		query.Roles = m.RoleNumbers
	} else {
		query.Roles = m.PublicRoleNumbers
	}

	admins, err := hs.AdminRepo.Find(query)
	if err != nil {
		if err != util.ErrNotFound {
			hs.log.Error(err.Error())
			return Error(http.StatusInternalServerError, "", err)
		}
		admins = []*m.Admin{}
	}

	count, err := hs.AdminRepo.Count(query)
	if err != nil && err != util.ErrNotFound {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}
	pageResp := m.PageResponse{
		Data:  admins,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}

	return JSON(http.StatusOK, pageResp)
}

func (hs *HTTPServer) GetAdminRoles(ctx *m.AdminReqContext) Response {
	if ctx.Admin.RoleNumber == m.SuperAdminRoleNumber {
		return JSON(http.StatusOK, m.PageResponse{
			Data: m.RolesList,
		})
	}
	return JSON(http.StatusOK, m.PageResponse{
		Data: m.PublicRolesList,
	})
}

func (hs *HTTPServer) GetAdmin(ctx *macaron.Context) Response {
	logger := hs.log.New("GetAdmin")

	adminId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	admin, err := hs.AdminRepo.FindOne(m.FindByIdQuery{adminId})
	if err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, admin)

}

func (hs *HTTPServer) UpdateAdmin(ctx *macaron.Context, form m.UserPayload) Response {
	logger := hs.log.New("UpdateAdmin")
	adminId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	admin, err := hs.AdminRepo.Update(m.FindByIdQuery{adminId},
		&form)
	if err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, admin)
}

func (hs *HTTPServer) DeleteAdmin(ctx *macaron.Context) Response {
	logger := hs.log.New("DeleteAdmin")
	adminId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	err = hs.AdminRepo.Remove(m.FindByIdQuery{adminId})
	if err != nil && err != util.ErrNotFound {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return Success("admin deleted")
}
