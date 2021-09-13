package api

import (
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// func (hs *HTTPServer) AddService(c *gin.Context) {
// 	organizationID, err := GetOrganizationID(c)
// 	if err != nil {
// 		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
// 		return
// 	}
// 	var payload m.ServiceRequest
// 	if err := c.ShouldBindJSON(&payload); err != nil {
// 		c.AbortWithStatusJSON(http.StatusBadRequest, APIError(err))
// 		return
// 	}

// 	payload.OrganizationID = organizationID
// 	payload.Status = m.ServiceStatusActive
// 	log.Printf("%#v", payload)
// 	s, err := hs.Service.Save(payload)
// 	if err != nil {
// 		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
// 		return
// 	}

// 	c.JSON(http.StatusOK, s)
// 	return
// }

// func (hs *HTTPServer) GetServices(c *gin.Context) {
// 	organizationIDs, _ := GetOrganizationIDs(c)
// 	query := m.RangeOrgUserQuery{
// 		Pagination: m.NewPaginationFromParams(c.Request.URL.Query()),
// 	}
// 	query.OrganizationID = organizationIDs

// 	services, err := hs.Service.Find(query)
// 	if err != nil {
// 		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
// 		return
// 	}

// 	resp := m.PageResponse{
// 		Data: services,
// 	}

// 	c.JSON(http.StatusOK, resp)
// 	return
// }

func (hs *HTTPServer) GetProductStatuses(c *gin.Context) {
	c.JSON(http.StatusOK, m.ProductStatuses)
	return
}

// func (hs *HTTPServer) UpdateService(c *gin.Context) {
// 	id, err := id.FromString(c.Param("id"))
// 	if err != nil {
// 		c.AbortWithStatusJSON(http.StatusBadGateway, APIError(err))
// 		return
// 	}

// 	var payload m.ServiceRequest
// 	if err := c.ShouldBind(&payload); err != nil {
// 		c.AbortWithStatusJSON(http.StatusBadGateway, APIError(err))
// 		return
// 	}

// 	updated, err := hs.Service.Update(m.FindByIdQuery{id}, payload)
// 	if err != nil {
// 		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
// 		return
// 	}

// 	c.JSON(http.StatusOK, updated)
// 	return
// }

func (hs *HTTPServer) UpdateServiceStatus(c *gin.Context) {
	id, err := id.FromString(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadGateway, APIError(err))
		return
	}

	var payload struct{ Status m.ProductStatus }
	if err := c.ShouldBind(&payload); err != nil {
		c.AbortWithStatusJSON(http.StatusBadGateway, APIError(err))
		return
	}

	err = hs.Service.UpdateStatus(m.FindByIdQuery{id}, payload.Status)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
		return
	}

	c.JSON(http.StatusOK, nil)
	return
}
