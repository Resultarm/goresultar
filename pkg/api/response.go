package api

import (
	"encoding/json"
	"errors"
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
	validator "github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"gopkg.in/macaron.v1"
)

var (
	NotFound = func() Response {
		return Error(404, "Not found", nil)
	}
	ServerError = func(err error) Response {
		return Error(500, "Server error", err)
	}
)

type Response interface {
	WriteTo(ctx *m.ReqContext)
}
type NormalResponse struct {
	status     int
	body       []byte
	header     http.Header
	errMessage string
	err        error
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
	return primitive.ObjectIDFromHex(idStr.(string))
}

func GetOrganizationIDs(c *gin.Context) ([]id.ID, error) {
	idI, exists := c.Get("organizationIDs")
	if !exists {
		return []id.ID{}, errors.New("org ids not exists in ctx")
	}

	return idI.([]id.ID), nil
}

func GetUser(c *gin.Context) (*m.Admin, error) {
	user, exists := c.Get("user")
	if !exists {
		return nil, errors.New("admin not exists in ctx")
	}

	if user == nil {
		return nil, errors.New("admin not exists in ctx")
	}

	return user.(*m.Admin), nil
}

func Wrap(action interface{}) macaron.Handler {
	return func(c *m.ReqContext) {
		var res Response
		val, err := c.Invoke(action)

		if err == nil && val != nil && len(val) > 0 {
			res = val[0].Interface().(Response)
		} else {
			res = ServerError(err)
		}

		res.WriteTo(c)
	}
}
func (r *NormalResponse) WriteTo(ctx *m.ReqContext) {
	if r.err != nil && r.errMessage != "" {
		ctx.Logger.Error(r.errMessage)
	}
	header := ctx.Resp.Header()
	for k, v := range r.header {
		header[k] = v
	}
	ctx.Resp.WriteHeader(r.status)
	ctx.Resp.Write(r.body)
}
func (r *NormalResponse) Cache(ttl string) *NormalResponse {
	return r.Header("Cache-Control", "public,max-age="+ttl)
}
func (r *NormalResponse) Header(key, value string) *NormalResponse {
	r.header.Set(key, value)
	return r
}

// Empty create an empty response
func Empty(status int) *NormalResponse {
	return Respond(status, nil)
}

// JSON create a JSON response
func JSON(status int, body interface{}) *NormalResponse {
	return Respond(status, body).Header("Content-Type", "application/json")
}

// Success create a successful response
func Success(message string) *NormalResponse {
	resp := make(map[string]interface{})
	resp["message"] = message
	return JSON(200, resp)
}

//  InternalServerError creates an Internal Server Error response
func InternalServerError(err error) *NormalResponse {
	return Error(http.StatusInternalServerError, "", err)
}

func APIError(err error) map[string]interface{} {
	return APIErrorMessage(err.Error())
}

func APIErrorMessage(message string) map[string]interface{} {
	return map[string]interface{}{"error": message}
}

var OrgNotFoundAPIError map[string]interface{} = APIErrorMessage("organization not present")

// Error create a erroneous response
func Error(status int, message string, err error) *NormalResponse {
	data := make(map[string]interface{})
	switch status {
	case 400:
		data["message"] = "Bad Request"
	case 404:
		data["message"] = "Not Found"
	case 422:
		data["message"] = "Unprocessable Entity"
	case 500:
		data["message"] = "Internal Server Error"
	case 501:
		data["message"] = "Not Implemented"
	}
	if message != "" {
		data["message"] = message
	}
	if err != nil {
		//if setting.Env != setting.PROD {
		//if m.IsValidationErrorsList(err) {
		data["error"] = err
		//} else {
		data["error"] = err.Error()
		//}
		//}
	}
	resp := JSON(status, data)
	if err != nil {
		resp.errMessage = message
		resp.err = err
	}
	return resp
}

// Respond create a response
func Respond(status int, body interface{}) *NormalResponse {
	var b []byte
	var err error
	switch t := body.(type) {
	case []byte:
		b = t
	case string:
		b = []byte(t)
	default:
		if b, err = json.Marshal(body); err != nil {
			return Error(500, "body json marshal", err)
		}
	}

	return &NormalResponse{
		body:   b,
		status: status,
		header: make(http.Header),
	}
}

var MongoIDValidator validator.Func = func(fl validator.FieldLevel) bool {
	id, ok := fl.Field().Interface().(id.ID)
	if !ok {
		return false
	}

	if !id.Valid() {
		return false
	}

	return true
}
