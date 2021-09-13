package api

import (
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/globalsign/mgo/bson"
)

func (hs *HTTPServer) GetTasks(c *gin.Context) {
	query := m.RangeOrgsUserQueryFromGin(c).Query()

	userInterface, exists := c.Get("user")
	if !exists {
		c.AbortWithStatusJSON(http.StatusInternalServerError, APIErrorMessage("user not present in context"))
		return
	}
	user := userInterface.(*m.Admin)

	if (user.RoleNumber != m.SuperAdminRoleNumber) && (user.RoleNumber != m.AdminRoleNumber) && (user.RoleNumber != m.RepresentativeRoleNumber) {
		query["$or"] = []bson.M{{"assigneeId": user.ID}, {"leaderId": user.ID}, {"helperIds": user.ID}}
	}

	tasks, err := hs.Task.Find(m.NewQuery(query))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
		return
	}

	resp := m.PageResponse{
		Data: tasks,
	}

	c.JSON(http.StatusOK, resp)
	return
}

func (hs *HTTPServer) GetTask(c *gin.Context) {
	idStr := c.Param("id")

	id, err := id.FromString(idStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, APIError(err))
	}

	tasks, err := hs.Task.Find(m.NewQuery(bson.M{"_id": id}))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
		return
	}

	if len(tasks) == 0 {
		c.AbortWithStatusJSON(http.StatusNotFound, APIErrorMessage(""))
		return
	}

	resp := m.PageResponse{
		Data: tasks[0],
	}

	c.JSON(http.StatusOK, resp)
	return
}

func (hs *HTTPServer) CreateTask(c *gin.Context) {
	organizationID, err := GetOrganizationID(c)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
		return
	}

	user, err := GetUser(c)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
		return
	}

	var payload m.TaskRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, APIError(err))
		return
	}

	payload.OrganizationID = &organizationID
	payload.AssigneeID = &user.ID
	err = hs.Task.Save(&payload)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
		return
	}

	c.JSON(http.StatusOK, nil)
	return

}

func (hs *HTTPServer) UpdateTask(c *gin.Context) {
	id, err := id.FromString(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadGateway, APIError(err))
		return
	}

	var payload m.TaskRequest
	if err := c.ShouldBind(&payload); err != nil {
		c.AbortWithStatusJSON(http.StatusBadGateway, APIError(err))
		return
	}

	updated, err := hs.Task.Update(m.FindByIdQuery{id}, &payload)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, APIError(err))
		return
	}

	c.JSON(http.StatusOK, updated)
	return
}
