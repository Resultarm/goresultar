package api

import (
	m "gerenciador/pkg/models"
	"log"
	"net/http"
)

func (hs *HTTPServer) CheckOnboarded(ctx *m.AdminReqContext) Response {

	onboarded, err := hs.Onboarding.CheckOnboarded()
	if err != nil {
		log.Println("err", err)
		return Error(http.StatusInternalServerError, "failed", err)
	}

	return JSON(http.StatusOK, map[string]bool{"onboarded": onboarded})
}

func (hs *HTTPServer) Onboard(ctx *m.AdminReqContext, r m.OnboardingRequest) Response {

	onboarded, _ := hs.Onboarding.CheckOnboarded()
	if onboarded {
		return JSON(http.StatusBadRequest, map[string]string{"error": "already onboarded"})
	}

	r.RoleNumber = m.SuperAdminRoleNumber
	err := hs.Onboarding.Onboard(&r)
	if err != nil {
		return Error(http.StatusInternalServerError, "", err)
	}

	return JSON(http.StatusOK, map[string]bool{"onboarded": true})
}
