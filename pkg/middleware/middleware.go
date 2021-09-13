package middleware

import (
	"fmt"
	"gerenciador/pkg/models"
	"net/http"

	"gopkg.in/macaron.v1"
)

func Auth(operation models.Operation) macaron.Handler {
	return func(c *models.AdminReqContext) {
		if !c.IsSignedIn {
			c.JSON(http.StatusUnauthorized, map[string]interface{}{"message": "not authorized"})
			return
		}

		if perm, ok := c.Role.Operations[operation]; !ok {
			c.JSON(http.StatusForbidden, map[string]interface{}{"message": "Permission denied"})
			return
		} else {
			if c.Req.Method != http.MethodGet && !perm.CanWrite() {
				c.JSON(http.StatusForbidden, map[string]interface{}{"message": "Permission denied"})
				return
			}
		}
		c.Next()
	}
}

func RequireAuth() macaron.Handler {
	return func(c *models.AdminReqContext) {
		if !c.IsSignedIn {
			fmt.Println("c.IsSignedIn", c.IsSignedIn)
			c.JSON(http.StatusForbidden, map[string]interface{}{"message": "not authorized"})
			return
		}

		c.Next()
	}
}
