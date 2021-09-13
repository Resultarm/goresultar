package time

import (
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/bsontype"
)

// Time defines a timestamp encoded as epoch seconds in JSON
type Time time.Time

// MarshalJSON is used to convert the timestamp to JSON
func (t Time) MarshalJSON() ([]byte, error) {
	return []byte(strconv.FormatInt(time.Time(t).Unix(), 10)), nil
}

// UnmarshalJSON is used to convert the timestamp from JSON
func (t *Time) UnmarshalJSON(s []byte) (err error) {
	r := string(s)
	q, err := strconv.ParseInt(r, 10, 64)
	if err != nil {
		return err
	}
	*(*time.Time)(t) = time.Unix(q, 0)
	return nil
}

// Unix returns t as a Unix time, the number of seconds elapsed
// since January 1, 1970 UTC. The result does not depend on the
// location associated with t.
func (t Time) Unix() int64 {
	return time.Time(t).Unix()
}

// Time returns the JSON time as a time.Time instance in UTC
func (t Time) Time() time.Time {
	return time.Time(t).UTC()
}

// String returns t as a formatted string
func (t Time) String() string {
	return t.Time().String()
}

func (t *Time) UnmarshalBSON(data []byte) error {
	var temp time.Time
	if err := bson.Unmarshal(data, &temp); err != nil {
		if strings.Contains(err.Error(), "invalid") {
			return nil
		}
		return err
	}

	*(*time.Time)(t) = temp
	return nil
}

func (t Time) MarshalBSONValue() (bsontype.Type, []byte, error) {
	return bson.MarshalValue(t.Time())
}

// https://www.yellowduck.be/posts/handling-unix-timestamps-in-json/
