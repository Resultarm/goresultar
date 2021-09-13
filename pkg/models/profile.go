package models

type Profile struct {
	FirstName      string `json:"firstName" bson:"firstName"`
	LastName       string `json:"lastName" bson:"lastName"`
	Email          string `json:"email" bson:"email"`
	MobileNumber   string `json:"mobileNumber" bson:"mobileNumber"`
	LandlineNumber string `json:"landlineNumber" bson:"landlineNumber"`
	Address        string `json:"address" bson:"address"`
	ZipCode        string `json:"zipCode" bson:"zipCode"`
	PhotoURL       string `json:"photoUrl" bson:"photoUrl"`
}
