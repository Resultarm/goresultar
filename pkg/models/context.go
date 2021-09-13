package models

import (
	"gerenciador/pkg/id"
	"gerenciador/pkg/log"
	"strings"

	"github.com/gin-gonic/gin"
	"gopkg.in/macaron.v1"
)

type AdminReqContext struct {
	ReqContext
	AdminId        id.ID
	Role           *Role
	Admin          *Admin
	OrganizationID []id.ID
}

type GinContext struct {
	*gin.Context
	Admin           *Admin
	OrganizationIDs []id.ID
}

//type GenericReqContext struct {
//	*macaron.Context
//	IsSignedIn bool
//	Logger     log.Logger
//}

//type ReqContext interface {
//
//}

type ReqContext struct {
	*macaron.Context

	IsSignedIn     bool
	IsRenderCall   bool
	AllowAnonymous bool
	SkipCache      bool
	Logger         log.Logger
}

//func (ctx GenericReqContext) GetLogger() log.Logger {
//	return ctx.Logger
//}
//func (ctx GenericReqContext) Response() macaron.ResponseWriter {
//	return ctx.Resp
//}

func (ctx *ReqContext) IsApiRequest() bool {
	return strings.HasPrefix(ctx.Req.URL.Path, "/api")
}
