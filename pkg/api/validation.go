package api

import (
	"gerenciador/pkg/models"
	"net/http"
)

func Validate(c *models.ReqContext, form models.Validator) {
	if errs := form.Validate(); !errs.Empty() {
		data := make(map[string]interface{})
		data["message"] = "Bad Request"
		data["error"] = errs
		c.JSON(http.StatusBadRequest, data)
		return
	}
}
