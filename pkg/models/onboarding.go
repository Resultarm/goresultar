package models

type OnboardingRequest struct {
	Name        string     `json:"name" bson:"name"`
	Email       string     `json:"email" bson:"email"`
	RoleNumber  RoleNumber `json:"roleNumber" bson:"roleNumber"`
	PhoneNumber string     `json:"phoneNumber" bson:"phoneNumber"`
	Password    string     `json:"password" bson:"password"`
}
