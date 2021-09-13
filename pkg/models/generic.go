package models

import (
	"gerenciador/pkg/id"
	ts "gerenciador/pkg/timestamp"
	"strconv"
	"strings"
	"time"

	"database/sql"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/globalsign/mgo/bson"

	"github.com/globalsign/mgo"
)

type Specification interface {
	Query() bson.M
}

type specification struct {
	query bson.M
}

//NewQuery returns a handler that implements the handler interface
func NewQuery(m bson.M) Specification {
	return &specification{
		query: m,
	}
}

func (s specification) Query() bson.M {
	return s.query
}

func (s specification) IDQuery() bson.M {
	return s.query
}

type TimeRange struct {
	From time.Time
	To   time.Time
}

type TimeRangeID struct {
	From time.Time
	To   time.Time
}

func NewTimeRangeFromTimestampStrings(from, to string) TimeRange {
	tr := TimeRange{}
	f, err := ts.TimestampFromString(from)
	if err == nil {
		tr.From = f.Time
	}
	t, err := ts.TimestampFromString(to)
	if err == nil {
		tr.To = t.Time
	}
	return tr
}

func NewTimeRangeFromTimestampStringsID(from, to string) TimeRangeID {
	tr := TimeRangeID{}
	f, err := ts.TimestampFromString(from)
	if err == nil {
		tr.From = f.Time
	}
	t, err := ts.TimestampFromString(to)
	if err == nil {
		tr.To = t.Time
	}
	return tr
}

func TimeRangeFromCtx(ctx *AdminReqContext) *TimeRange {
	tr := NewTimeRangeFromTimestampStrings(ctx.Query("from"), ctx.Query("to"))
	if tr.From.IsZero() && tr.To.IsZero() {
		return nil
	}
	return &tr
}

func TimeRangeFromGin(ctx *gin.Context) *TimeRange {
	tr := NewTimeRangeFromTimestampStrings(ctx.Query("from"), ctx.Query("to"))
	if tr.From.IsZero() && tr.To.IsZero() {
		return nil
	}
	return &tr
}

func (tr TimeRange) Query() bson.M {
	q := bson.M{}
	if !tr.From.IsZero() {
		q["$gte"] = tr.From
	}
	if !tr.To.IsZero() {
		q["$lte"] = tr.To
	}
	return q
}

func (tr TimeRangeID) Query() bson.M {
	q := bson.M{}
	if tr.From.IsZero() && tr.To.IsZero() {
		return nil
	}

	if !tr.From.IsZero() {
		q["$gte"] = id.FromTime(tr.From)
	}
	if !tr.To.IsZero() {
		q["$lt"] = id.FromTime(tr.To)
	}
	return q
}

func (tr TimeRange) IDQuery() bson.M {
	q := bson.M{}
	if !tr.From.IsZero() {
		q["$gte"] = id.FromTime(tr.From)
	}
	if !tr.To.IsZero() {
		q["$lte"] = id.FromTime(tr.To)
	}
	return q
}

type Sortable interface {
	Sort() bson.M
}

type Sorter map[string]SortOrder

//sort=key1:asc,key2,key3
func NewSorterFromStrings(sorts []string) Sorter {
	sorter := map[string]SortOrder{}
	for _, s := range sorts {
		keys := strings.Split(s, ",")
		for _, key := range keys {
			values := strings.Split(key, ":")
			if len(values) == 2 {
				order, _ := strconv.Atoi(values[1])
				sorter[values[0]] = SortOrder(order)
			}
		}
	}

	return sorter
}

type SortOrder int

const (
	SortAsc  = 1
	SortDesc = -1
)

func (s Sorter) Sort() bson.M {
	if len(s) == 0 {
		return nil
	}
	return bson.M{"$sort": s}
}

type FindByIdQuery struct {
	Id id.ID
}

func (q FindByIdQuery) Query() bson.M {
	return bson.M{
		"_id": q.Id,
	}
}

type FindIDsQuery struct {
	IDs []id.ID
}

func (q FindIDsQuery) Query() bson.M {
	return bson.M{
		"_id": bson.M{"$in": q.IDs},
	}
}

type FindByPhoneQuery struct {
	Phone string
}

func (q FindByPhoneQuery) Query() bson.M {
	return bson.M{
		"mobile": q.Phone,
	}
}

type FindByOrgID struct {
	OrganizationID id.ID
}

func (q FindByOrgID) Query() bson.M {
	return bson.M{
		"organizationId": q.OrganizationID,
	}
}

type FindByEmailQuery struct {
	Email string
}

func (q FindByEmailQuery) Query() bson.M {
	return bson.M{
		"email": q.Email,
	}
}

type FindByAccessTokenQuery struct {
	AccessToken string
}

func (q FindByAccessTokenQuery) Query() bson.M {
	return bson.M{
		"_id": bson.ObjectIdHex(q.AccessToken),
	}
}

type Token struct {
	AccessToken string `json:"token"`
}

type StatsUnit struct {
	TotalEntries int     `json:"orders" bson:"orders"`
	TotalUnits   int     `json:"units" bson:"units"`
	Revenue      float64 `json:"revenue" bson:"revenue"`
	Cost         float64 `json:"cost" bson:"cost"`
	Collected    float64 `json:"collected"`
}

var (
	// ErrCode is a config or an internal error
	ErrCode = errors.New("Case statement in code is not correct.")
	// ErrNoResult is a not results error
	ErrNoResult = errors.New("Result not found.")
	// ErrUnavailable is a database not available error
	ErrUnavailable = errors.New("Database is unavailable.")
)

// standardizeErrors returns the same error regardless of the database used
func standardizeError(err error) error {
	if err == sql.ErrNoRows || err == mgo.ErrNotFound {
		return ErrNoResult
	}

	return err
}

type RangeOrgUserQuery struct {
	TimeRange TimeRange
	Pagination

	ID             id.ID // specifically needed for org queries
	OrganizationID []id.ID
	UserID         id.ID
	UseIDQuery     bool
}

func (q RangeOrgUserQuery) Query() bson.M {
	query := bson.M{}

	if (q.TimeRange != TimeRange{}) {
		if q.UseIDQuery {
			query["_id"] = q.TimeRange.IDQuery()
		} else {
			query["createdAt"] = q.TimeRange.Query()
		}
	}

	if len(q.OrganizationID) > 0 {
		var validIDs []id.ID
		for _, id := range q.OrganizationID {
			validIDs = append(validIDs, id)
		}
		query["organizationId"] = bson.M{"$in": validIDs}
	}
	if q.UserID.Valid() {
		query["userId"] = q.UserID
	}

	if q.ID.Valid() {
		query["_id"] = q.ID
	}

	return query
}

type RangeOrgsUserQuery struct {
	TimeRange  *TimeRange
	Pagination *Pagination

	IDs             []id.ID // specifically needed for org queries. only orgIDs
	OrganizationIDs []id.ID
	UserID          id.ID
}

func (q RangeOrgsUserQuery) Query() bson.M {
	query := bson.M{}

	if q.TimeRange != nil {
		// query["createdAt"] = q.TimeRange.Query()
		query["_id"] = q.TimeRange.IDQuery()
	}

	if len(q.OrganizationIDs) > 0 {
		var validIDs []id.ID
		for _, id := range q.OrganizationIDs {
			validIDs = append(validIDs, id)
		}
		query["organizationId"] = bson.M{"$in": validIDs}
	}

	if q.UserID.Valid() {
		query["userId"] = q.UserID
	}

	if len(q.IDs) > 0 {
		var validIDs []id.ID
		for _, id := range q.IDs {
			validIDs = append(validIDs, id)
		}
		if len(validIDs) > 0 {
			query["_id"] = bson.M{"$in": validIDs}
		}
	}

	return query
}

func RangeOrgsUserQueryFromCtx(ctx *AdminReqContext) RangeOrgsUserQuery {
	q := RangeOrgsUserQuery{}
	q.TimeRange = TimeRangeFromCtx(ctx)
	q.Pagination = PaginationFromCtx(ctx)
	q.OrganizationIDs = ctx.OrganizationID

	if ctx.Admin.RoleNumber == 8 {
		q.UserID = ctx.Admin.ID
	}
	return q
}

func RangeOrgsUserQueryFromGin(ctx *gin.Context) RangeOrgsUserQuery {
	q := RangeOrgsUserQuery{}
	q.TimeRange = TimeRangeFromGin(ctx)
	q.Pagination = PaginationFromGin(ctx)
	organizationIDs, _ := GetOrganizationIDs(ctx)
	q.OrganizationIDs = organizationIDs

	// TODO: implement this
	// if ctx.Admin.RoleNumber == 8 {
	// 	q.UserID = ctx.Admin.ID
	// }
	return q
}

func GetOrganizationIDs(c *gin.Context) ([]id.ID, error) {
	idI, exists := c.Get("organizationIDs")
	if !exists {
		return []id.ID{}, errors.New("org ids not exists in ctx")
	}
	return idI.([]id.ID), nil
}
