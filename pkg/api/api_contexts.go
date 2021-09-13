package api

import (
	"fmt"
	"gerenciador/pkg/id"
	"gerenciador/pkg/log"
	"gerenciador/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gopkg.in/macaron.v1"
)

func (hs *HTTPServer) InitAdminContext() macaron.Handler {
	return func(ctx *macaron.Context) {

		adminCtx := &models.AdminReqContext{
			ReqContext: models.ReqContext{
				Context:    ctx,
				IsSignedIn: false,
				Logger:     log.New("client_context"),
			},
		}

		tok := ctx.Req.Header.Get("Authorization")
		if tok == "" {
			tok = ctx.Req.URL.Query().Get("_token")
		}
		if tok != "" {
			uid, err := hs.AuthService.ValidateToken(tok)
			if err == nil {
				admin, err := hs.AdminRepo.FindOne(models.FindByIdQuery{Id: *uid})
				if err == nil {
					adminCtx.Admin = admin
					adminCtx.AdminId = admin.ID
					adminCtx.IsSignedIn = true
					adminCtx.Role = admin.Role

					if admin.RoleNumber == models.SuperAdminRoleNumber {
						// if superadmin, override org if passed via header
						if ctx.Req.Header.Get("OrganizationID") != "" {
							if i, _ := id.FromString(ctx.Req.Header.Get("OrganizationID")); i.Valid() {
								adminCtx.OrganizationID = []id.ID{i}
							}
						} else {
							adminCtx.OrganizationID = admin.OrganizationIDs
						}
					} else {
						adminCtx.OrganizationID = admin.OrganizationIDs
					}
				} else {
					fmt.Println("err: ", err)
				}
			}

		}
		ctx.Map(adminCtx)
		ctx.Map(models.UpdateProductForm{})
		ctx.Map(models.CreateProductRequest{})
		ctx.Map(models.OrderRequest{})
		//todo remove generic mapping
		ctx.Map(&adminCtx.ReqContext)
	}
}

func (hs *HTTPServer) GinContextUpdate(ctx *gin.Context) {
	if ctx.Request.URL.Path == "/api/v2/auth/login" {
		return
	}
	tok := ctx.GetHeader("Authorization")
	if tok == "" {
		tok, _ = ctx.GetQuery("_token")
	}
	if tok == "" {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "token is required"})
		return
	}

	uid, err := hs.AuthService.ValidateToken(tok)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "token validation failed"})
		return
	}

	user, err := hs.AdminRepo.FindOne(models.FindByIdQuery{Id: *uid})
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	ctx.Set("user", user)

	if user.RoleNumber == models.SuperAdminRoleNumber {
		// if superadmin, override org if passed via header
		if ctx.GetHeader("OrganizationID") != "" {
			if i, _ := id.FromString(ctx.GetHeader("OrganizationID")); i.Valid() {
				ctx.Set("organizationIDs", []id.ID{i})
				ctx.Set("organizationID", i)
			} else {
				ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "invalid org id"})
				return
			}
		} else {
			ctx.Set("organizationIDs", user.OrganizationIDs)
			if len(user.OrganizationIDs) > 0 {
				ctx.Set("organizationID", user.OrganizationIDs[0])
			}
		}
	} else {
		ctx.Set("organizationIDs", user.OrganizationIDs)
		if len(user.OrganizationIDs) > 0 {
			ctx.Set("organizationID", user.OrganizationIDs[0])
		}
	}

	ctx.Next()
}
