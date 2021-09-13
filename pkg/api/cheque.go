package api

import (
	"gerenciador/pkg/id"
	m "gerenciador/pkg/models"
	"math"
	"net/http"

	"gopkg.in/macaron.v1"
)

func (hs *HTTPServer) AddCheque(ctx *m.AdminReqContext, c m.Cheque) Response {
	c.OrganizationID = ctx.OrganizationID[0]
	err := hs.Cheque.Save(&c)
	if err != nil {
		return Error(http.StatusInternalServerError, "could not save cheque", err)
	}

	return Success("admin created")
}

func (hs *HTTPServer) GetCheques(ctx *m.AdminReqContext) Response {

	query := m.RangeOrgUserQuery{
		Pagination: m.NewPaginationFromParams(ctx.Req.URL.Query()),
	}
	query.OrganizationID = ctx.OrganizationID

	cheques, err := hs.Cheque.Find(query)
	if err != nil {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}

	count, err := hs.Cheque.Count(query)
	if err != nil {
		hs.log.Error(err.Error())
		return Error(http.StatusInternalServerError, "", err)
	}
	resp := m.PageResponse{
		Data:  cheques,
		Count: count,
		Pages: int(math.Ceil(float64(count) / float64(query.PerPage))),
	}

	return JSON(http.StatusOK, resp)
}

func (hs *HTTPServer) UpdateCheque(ctx *macaron.Context, cheque m.Cheque) Response {
	id, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	updated, err := hs.Cheque.Update(m.FindByIdQuery{id}, &cheque)
	if err != nil {
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, updated)
}

func (hs *HTTPServer) DeleteCheque(ctx *macaron.Context) Response {
	id, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	if err = hs.Cheque.Remove(m.FindByIdQuery{id}); err != nil {
		return InternalServerError(err)
	}

	return Success("deleted")
}

type StatusRequest struct {
	Status  m.ChequeStatus `json:"status"`
	Comment string         `json:"comment"`
}

func (hs *HTTPServer) ChangeChequeStatus(ctx *macaron.Context, payload StatusRequest) Response {
	id, err := id.FromString(ctx.Params(":id"))
	if err != nil {
		return Error(http.StatusUnprocessableEntity, "could not parse id", err)
	}

	updated, err := hs.Cheque.ChangeStatus(m.FindByIdQuery{id}, payload.Status, payload.Comment)
	if err != nil {
		return InternalServerError(err)
	}
	return JSON(http.StatusOK, updated)
}
