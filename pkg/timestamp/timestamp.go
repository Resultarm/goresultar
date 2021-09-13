package timestamp

import (
	"encoding/json"
	"strconv"
	"time"

	"github.com/globalsign/mgo/bson"
)

type Timestamp struct {
	time.Time
}

func (t Timestamp) MarshalJSON() ([]byte, error) {
	var ts int64
	if !t.IsZero() {
		ts = t.Unix()
	}
	return json.Marshal(ts)
}
func (t *Timestamp) UnmarshalJSON(v []byte) error {
	i, err := strconv.ParseInt(string(v), 10, 64)
	if err != nil {
		return err
	}
	t.Time = time.Unix(i, 0)
	return nil

}
func (t Timestamp) GetBSON() (interface{}, error) {
	return t.Time, nil
}
func (t *Timestamp) SetBSON(raw bson.Raw) error {
	var decoded time.Time

	bsonErr := raw.Unmarshal(&decoded)

	if bsonErr == nil {
		t.Time = decoded
		return nil
	} else {
		return bsonErr
	}
}

func TimestampFromString(s string) (Timestamp, error) {
	i, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return Timestamp{}, err
	}
	return Timestamp{time.Unix(i, 0)}, nil
}

func Now() Timestamp {
	return Timestamp{time.Now()}
}
