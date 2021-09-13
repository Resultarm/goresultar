package rest

import (
	"gerenciador/ecommerce/util"
	"gerenciador/pkg/resource"
	"gerenciador/pkg/role/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *service.Service
}

func New(r *resource.Resource) *Handler {
	return &Handler{svc: service.New(r)}
}

func (h *Handler) GetAll(ctx *gin.Context) {
	policies := h.svc.GetAll()
	ctx.JSON(http.StatusOK, policies)
}

func (h *Handler) GetPermissions(ctx *gin.Context) {
	permissions := h.svc.GetPermissions()
	ctx.JSON(http.StatusOK, util.APIResponse(permissions, nil))
}
