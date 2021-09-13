package rest

import (
	"gerenciador/ecommerce/auth/service"
	"gerenciador/pkg/api"
	"gerenciador/pkg/resource"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc service.Service
}

func New(r resource.Resource, sugar []byte) Handler {
	return Handler{svc: service.New(r, sugar)}
}

type requestBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type responseBody struct {
	Token string `json:"token"`
}

func (h Handler) Login(ctx *gin.Context) {

	var r requestBody
	if err := ctx.ShouldBindJSON(&r); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, api.APIError(err))
		return
	}

	token, err := h.svc.Login(r.Username, r.Password)
	if err != nil {
		if err == service.ErrInvalidPassword {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, api.APIError(err))
			return
		}
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, api.APIError(err))
		return
	}

	ctx.JSON(http.StatusOK, responseBody{Token: token})
	return
}
