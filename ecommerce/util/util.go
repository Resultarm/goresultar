package util

import (
	"context"
	"errors"
	"fmt"
	"gerenciador/pkg/id"
	"gerenciador/pkg/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var ClientCollection = "clients"
var OrderCollection = "orders"

type CtxKey string

const UserKey CtxKey = "user"
const OrganizationIDKey CtxKey = "organizationId"

func CtxFromGin(ctx *gin.Context) context.Context {
	c := ctx.Request.Context()
	if u, exists := ctx.Get("user"); exists {
		c = context.WithValue(c, UserKey, u)
	}

	organizationID, _ := ctx.Get("organizationID")
	c = context.WithValue(c, OrganizationIDKey, organizationID)
	return c
}

func UserFromCtx(ctx context.Context) (*models.Admin, error) {
	v := ctx.Value(UserKey)
	if v == nil {
		return nil, errors.New("no user in context")
	}
	return v.(*models.Admin), nil
}

func APIError(err error) gin.H {
	return APIResponse(nil, err)
}

func APIErrorMessage(message string) map[string]interface{} {
	return map[string]interface{}{"error": message}
}

func APIResponse(data interface{}, err error) gin.H {
	r := gin.H{"data": data, "error": nil}
	if err != nil {
		r["error"] = err.Error()
	}
	return r
}

func GetOrganizationID(c *gin.Context) (id.ID, error) {
	idI, exists := c.Get("organizationID")
	if !exists {
		return id.ID{}, errors.New("org id not exists in ctx")
	}
	return idI.(id.ID), nil
}

func GetOrganizationIDv2(c *gin.Context) (primitive.ObjectID, error) {
	idStr, exists := c.Get("organizationID")
	if !exists {
		return primitive.ObjectID{}, errors.New("org id not exists in ctx")
	}
	return primitive.ObjectIDFromHex(idStr.(id.ID).Hex())
}

func GetIDFromPath(c *gin.Context) (primitive.ObjectID, error) {
	idStr := c.Param("id")

	return primitive.ObjectIDFromHex(idStr)
}

func GetOrganizationIDs(c *gin.Context) ([]id.ID, error) {
	idI, exists := c.Get("organizationIDs")
	if !exists {
		return []id.ID{}, errors.New("org ids not exists in ctx")
	}

	return idI.([]id.ID), nil
}

func GetOrganizationIDv2s(c *gin.Context) ([]*primitive.ObjectID, error) {
	IDs, err := GetOrganizationIDs(c)
	if err != nil {
		return nil, err
	}

	var IDv2s []*primitive.ObjectID
	for _, i := range IDs {
		IDv2s = append(IDv2s, IDv1ToIDv2(i))
	}

	return IDv2s, nil
}

func IDv1ToIDv2(i id.ID) *primitive.ObjectID {
	organizationIDv2, _ := primitive.ObjectIDFromHex(i.Hex())
	return &organizationIDv2
}

func GetOrganizationIDv2FromCtx(ctx context.Context) (*primitive.ObjectID, error) {
	organizationID := ctx.Value(OrganizationIDKey)
	if organizationID == nil {
		return nil, fmt.Errorf("organizationId not present in ctx")
	}

	IDv1 := (organizationID).(id.ID)
	IDv2, err := primitive.ObjectIDFromHex(IDv1.Hex())
	if err != nil {
		return nil, fmt.Errorf("organizationId parsing failed <- %s", err)
	}
	return &IDv2, nil
}

func GetUserIDFromCtx(ctx context.Context) (*primitive.ObjectID, error) {
	userID := ctx.Value(UserKey)
	if userID == nil {
		return nil, fmt.Errorf("userId not present in ctx")
	}

	user := (userID).(*models.Admin)
	IDv2, err := primitive.ObjectIDFromHex(user.ID.Hex())
	if err != nil {
		return nil, fmt.Errorf("userId parsing failed <- %s", err)
	}
	return &IDv2, nil
}
