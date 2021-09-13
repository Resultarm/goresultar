package models

import (
	"encoding/json"
	validation "github.com/go-ozzo/ozzo-validation"
)

type Validator interface {
	Validate() ValidationErrors
}
type (
	ValidationErrors []ValidationError

	ValidationError struct {
		FieldNames []string `json:"fieldNames,omitempty"`
		Message    string   `json:"message,omitempty"`
	}
)

func OzzoValidation(err error) ValidationErrors {
	errs := ValidationErrors{}
	errsMap, ok := err.(validation.Errors)
	if ok {
		for k, v := range errsMap {
			errs = append(errs, ValidationError{
				FieldNames: []string{k},
				Message:    v.Error(),
			})

		}
	}
	return errs
}

func (errs ValidationErrors) MarshalJSON() ([]byte, error) {
	//if e, ok := err.(Error); ok{
	//	for key, value := range e.FieldNames {
	errorMap := map[string]interface{}{}
	for _, value := range errs {
		errorMap[value.FieldNames[0]] = value.Message
	}
	return json.Marshal(errorMap)
}

func (errs ValidationErrors) Add(fieldName, msg string) {
	errs = append(errs, ValidationError{
		FieldNames: []string{fieldName},
		Message:    msg,
	})

}

func (errs ValidationErrors) Empty() bool {
	return len(errs) == 0
}
