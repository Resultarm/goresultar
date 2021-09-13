package util

import (
	"fmt"
	"gerenciador/pkg/id"
	"strconv"
	"strings"
	"time"

	"errors"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
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

// type TimeRange struct {
// 	From time.Time
// 	To   time.Time
// }

type TimeRangeID struct {
	From *time.Time
	To   *time.Time
}

// func NewTimeRangeFromTimestampStrings(from, to string) TimeRange {
// 	tr := TimeRange{}
// 	fromInt, err := strconv.ParseInt(from, 10, 64)
// 	if err != nil {
// 		return tr
// 	}
// 	tr.From = time.Unix(fromInt, 0)

// 	toInt, err := strconv.ParseInt(from, 10, 64)
// 	if err != nil {
// 		return tr
// 	}
// 	tr.To = time.Unix(toInt, 0)

// 	return tr
// }

func NewTimeRangeFromTimestampStringsID(from, to string) TimeRangeID {
	fmt.Println("from, to", from, to)
	tr := TimeRangeID{}
	fromInt, err := strconv.ParseInt(from, 10, 64)
	if err != nil {
		return tr
	}
	fromTime := time.Unix(fromInt, 0)
	fmt.Println("fromTime", fromTime)
	tr.From = &fromTime

	toInt, err := strconv.ParseInt(to, 10, 64)
	if err != nil {
		return tr
	}
	toTime := time.Unix(toInt, 0)
	fmt.Println("toTime", toTime)
	tr.To = &toTime
	return tr
}

func TimeRangeFromGin(ctx *gin.Context) *TimeRangeID {
	tr := NewTimeRangeFromTimestampStringsID(ctx.Query("from"), ctx.Query("to"))
	if tr.From == nil && tr.To == nil {
		return nil
	}
	return &tr
}

// func (tr TimeRange) Query() bson.M {
// 	q := bson.M{}
// 	if !tr.From.IsZero() {
// 		q["$gte"] = tr.From
// 	}
// 	if !tr.To.IsZero() {
// 		q["$lte"] = tr.To
// 	}
// 	return q
// }

func (tr TimeRangeID) Query() bson.M {
	q := bson.M{}
	if tr.From.IsZero() && tr.To.IsZero() {
		return nil
	}

	if tr.From != nil {
		q["$gte"] = primitive.NewObjectIDFromTimestamp(*tr.From)
	}
	if tr.To != nil {
		q["$lt"] = primitive.NewObjectIDFromTimestamp(*tr.To)
	}
	return q
}

// func (tr TimeRange) IDQuery() bson.M {
// 	q := bson.M{}
// 	if !tr.From.IsZero() {
// 		q["$gte"] = primitive.NewObjectIDFromTimestamp(tr.From)
// 	}
// 	if !tr.To.IsZero() {
// 		q["$lte"] = primitive.NewObjectIDFromTimestamp(tr.To)
// 	}
// 	return q
// }

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
	ID primitive.ObjectID
}

func (q FindByIdQuery) Query() bson.M {
	return bson.M{
		"_id": q.ID,
	}
}

type FindIDsQuery struct {
	IDs []primitive.ObjectID
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
	OrganizationID primitive.ObjectID
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

type Token struct {
	AccessToken string `json:"token"`
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
	if err == mongo.ErrNoDocuments {
		return ErrNoResult
	}

	return err
}

// type RangeOrgUserQuery struct {
// 	TimeRange TimeRange

// 	ID             primitive.ObjectID // specifically needed for org queries
// 	OrganizationID []primitive.ObjectID
// 	// UserID         primitive.ObjectID
// 	// UseIDQuery     bool
// }

// func (q RangeOrgUserQuery) Query() bson.M {
// 	query := bson.M{}

// 	if (q.TimeRange != TimeRange{}) {
// 		query["_id"] = q.TimeRange.IDQuery()

// 	}

// 	if len(q.OrganizationID) > 0 {
// 		var validIDs []primitive.ObjectID
// 		for _, id := range q.OrganizationID {
// 			validIDs = append(validIDs, id)
// 		}
// 		query["organizationId"] = bson.M{"$in": validIDs}
// 	}
// 	// if q.UserID.IsZero() {
// 	// 	query["userId"] = q.UserID
// 	// }

// 	if q.ID.IsZero() {
// 		query["_id"] = q.ID
// 	}

// 	return query
// }

type RangeOrgsUserQuery struct {
	TimeRange *TimeRangeID

	IDs             []primitive.ObjectID // specifically needed for org queries. only orgIDs
	OrganizationIDs []*primitive.ObjectID
	// UserID          primitive.ObjectID
}

func (q RangeOrgsUserQuery) Query() bson.M {
	query := bson.M{}

	if q.TimeRange != nil {
		// query["createdAt"] = q.TimeRange.Query()
		query["_id"] = q.TimeRange.Query()
	}

	if len(q.OrganizationIDs) > 0 {
		var validIDs []*primitive.ObjectID
		for _, id := range q.OrganizationIDs {
			validIDs = append(validIDs, id)
		}
		query["organizationId"] = bson.M{"$in": validIDs}
	}

	// if q.UserID.IsZero() {
	// 	query["userId"] = q.UserID
	// }

	if len(q.IDs) > 0 {
		// var validIDs []primitive.ObjectID
		// for _, id := range q.IDs {
		// 	validIDs = append(validIDs, id)
		// }
		// if len(validIDs) > 0 {
		// }
		query["_id"] = bson.M{"$in": q.IDs}
	}

	return query
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

func RangeOrgsUserQueryFromGin(ctx *gin.Context) RangeOrgsUserQuery {
	q := RangeOrgsUserQuery{}
	tr := TimeRangeFromGin(ctx)

	if tr != nil {
		q.TimeRange = tr
	}

	organizationIDs, _ := GetOrganizationIDv2s(ctx)
	q.OrganizationIDs = organizationIDs

	// TODO: implement this
	// if ctx.Admin.RoleNumber == 8 {
	// 	q.UserID = ctx.Admin.ID
	// }
	return q
}
