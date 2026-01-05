package handler

import (
    "start-kit-backend/internal/service"

    "gorm.io/gorm"
)

type Handler struct {
    Auth   *AuthHandler
    Admin  *AdminHandler
    CSV    *CSVHandler
    Health *HealthHandler
    User   *UserHandler
}

func NewHandler(service *service.Service, db *gorm.DB) *Handler {
    return &Handler{
        Auth:   NewAuthHandler(service.Auth),
        Admin:  NewAdminHandler(service.Admin),
        CSV:    NewCSVHandler(service.CSV),
        Health: NewHealthHandler(db),
        User:   NewUserHandler(service.User),
    }
}
