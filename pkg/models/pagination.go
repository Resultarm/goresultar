package models

import (
	"net/url"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

const DefaultPerPage = 1000

type SpecificationWithPagination interface {
	Offset() int
	Limit() int
}
type Pagination struct {
	Page    int
	PerPage int
	ShowAll bool
}

type FromTo struct {
	From *time.Time
	To   *time.Time
}

func NewFromTo(params url.Values) FromTo {
	fromStr, toStr := params.Get("from"), params.Get("to")
	var from *time.Time
	var to *time.Time
	if fromStr != "" {
		t, err := time.Parse("30/01/2006", fromStr)
		if err == nil {
			from = &t
		}
	}
	if toStr != "" {
		t, err := time.Parse("30/01/2006", toStr)
		if err == nil {
			to = &t
		}
	}
	return FromTo{From: from, To: to}
}

func NewPaginationFromParams(params url.Values) Pagination {
	page, _ := strconv.Atoi(params.Get("page"))
	perPage, _ := strconv.Atoi(params.Get("perPage"))
	if perPage == 0 {
		perPage = DefaultPerPage
	}
	showAll, _ := strconv.ParseBool(params.Get("showAll"))

	return Pagination{
		Page:    page,
		PerPage: perPage,
		ShowAll: showAll,
	}
}

func PaginationFromCtx(ctx *AdminReqContext) *Pagination {
	p := NewPaginationFromParams(ctx.Req.URL.Query())
	if p.Page == 0 && p.PerPage == 0 && !p.ShowAll {
		return nil
	}
	return &p
}

func PaginationFromGin(ctx *gin.Context) *Pagination {
	p := NewPaginationFromParams(ctx.Request.URL.Query())
	if p.Page == 0 && p.PerPage == 0 && !p.ShowAll {
		return nil
	}
	return &p
}

func (p Pagination) Offset() int {
	return p.PerPage * p.Page
}

func (p Pagination) Limit() int {
	if p.ShowAll {
		return 0
	}
	return p.PerPage
}

type PageResponse struct {
	Data  interface{} `json:"data"`
	Count int         `json:"total"`
	Pages int         `json:"pageCount"`
}

func NewEmptyPageResponse() PageResponse {
	return PageResponse{
		Data:  []interface{}{},
		Count: 0,
		Pages: 0,
	}
}
