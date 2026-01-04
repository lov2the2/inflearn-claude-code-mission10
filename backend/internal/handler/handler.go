package handler

import (
    "starter-kit-backend/internal/service"

    "gorm.io/gorm"
)

type Handler struct {
    Auth   *AuthHandler
    Health *HealthHandler
}

func NewHandler(service *service.Service, db *gorm.DB) *Handler {
    return &Handler{
        Auth:   NewAuthHandler(service.Auth),
        Health: NewHealthHandler(db),
    }
}
