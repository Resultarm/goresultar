package api

import (
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"gerenciador/pkg/util"
	"math"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"
	"gopkg.in/macaron.v1"
)

// func (hs *HTTPServer) CreateClient(ctx *m.AdminReqContext, cmd m.Client) Response {

// 	cmd.OrganizationID = ctx.OrganizationID[0]
// 	err := hs.ClientsRepo.Save(cmd)
// 	if err != nil {
// 		return Error(http.StatusInternalServerError, "could not save client", err)
// 	}

// 	return Success("client created")
// }

func New(db *mongo.Database) *HTTPServer {
	return &HTTPServer{DB: db}
}

func (hs *HTTPServer) GetClients(ctx *m.AdminReqContext) Response {

	query := m.FindClientQuery{
		Pagination: m.NewPaginationFromParams(ctx.Req.URL.Query()),
	}
	query.OrganizationID = ctx.OrganizationID

	clients, err := hs.ClientsRepo.Find(query)
	if err != nil {
		if err != util.ErrNotFound {
			hs.log.Error(err.Error())
			return Error(http.StatusInternalServerError, "", err)
		}
		clients = []*m.Client{}
	}

	count, err := hs.ClientsRepo.Count(query)
	if err != nil && err != util.ErrNotFound {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}
	pageResp := m.PageResponse{
		Data:  clients,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}

	return JSON(http.StatusOK, pageResp)
}

func (hs *HTTPServer) GetClient(ctx *macaron.Context) Response {
	logger := hs.log.New("GetClient")

	clientId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	client, err := hs.ClientsRepo.FindOne(m.FindByIdQuery{clientId})
	if err != nil {
		logger.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, client)

}

func (hs *HTTPServer) UpdateClient(ctx *macaron.Context, form m.ClientPayload) Response {
	logger := hs.log.New("UpdateClient")
	clientId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	client, err := hs.ClientsRepo.Update(m.FindByIdQuery{clientId}, form)
	if err != nil {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, client)
}

func (hs *HTTPServer) DeleteClient(ctx *macaron.Context) Response {
	logger := hs.log.New("DeleteClient")
	clientId, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		logger.Error(err.Error())
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	err = hs.ClientsRepo.Remove(m.FindByIdQuery{clientId})
	if err != nil && err != util.ErrNotFound {
		hs.log.Error(err.Error())
		return InternalServerError(err)
	}
	return Success("client deleted")
}
