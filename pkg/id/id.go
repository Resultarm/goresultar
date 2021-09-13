package id

import (
	"encoding/json"
	"strings"
	"time"

	"github.com/globalsign/mgo/bson"
	"github.com/pkg/errors"
)

type ID struct {
	bson.ObjectId
}

func New() ID {
	return ID{bson.NewObjectId()}
}

func FromTime(from time.Time) ID {
	return ID{bson.NewObjectIdWithTime(from)}
}

func FromString(s string) (ID, error) {
	if s == "" {
		return ID{}, errors.New("empty id field supplied")
	}
	if len(s) <= 12 {
		return ID{}, errors.New("id should be length of 12")
	}
	s = strings.Trim(s, `"`)
	id := bson.ObjectIdHex(s)
	if !id.Valid() {

		return ID{}, errors.New("invalid id")
	}
	return ID{id}, nil
}
func (i ID) String() string {
	return i.Hex()
}
func (i ID) GetBSON() (interface{}, error) {
	return i.ObjectId, nil
}

func (i *ID) SetBSON(raw bson.Raw) error {
	var decoded bson.ObjectId

	bsonErr := raw.Unmarshal(&decoded)

	if bsonErr == nil {
		i.ObjectId = decoded
		return nil
	} else {
		return bsonErr
	}
}

func (i ID) MarshalJSON() ([]byte, error) {
	return json.Marshal(i.String())
}
func (i *ID) UnmarshalJSON(v []byte) error {
	id, err := FromString(string(v))
	if err != nil {
		return err
	}
	i.ObjectId = id.ObjectId
	return nil

}
