package handler

import (
    "starter-kit-backend/internal/service"

    "gorm.io/gorm"
)

type Handler struct {
    Auth   *AuthHandler
    Admin  *AdminHandler
    Health *HealthHandler
}

func NewHandler(service *service.Service, db *gorm.DB) *Handler {
    return &Handler{
        Auth:   NewAuthHandler(service.Auth),
        Admin:  NewAdminHandler(service.Admin),
        Health: NewHealthHandler(db),
    }
}
