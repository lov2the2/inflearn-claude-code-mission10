package handler

import (
    "time"

    "start-kit-backend/internal/config"
    "start-kit-backend/internal/service"

    "gorm.io/gorm"
)

type Handler struct {
    Auth    *AuthHandler
    Admin   *AdminHandler
    CSV     *CSVHandler
    Health  *HealthHandler
    User    *UserHandler
    Dataset *DatasetHandler
}

type HandlerConfig struct {
    Service       *service.Service
    DB            *gorm.DB
    CookieConfig  config.CookieConfig
    AccessExpiry  time.Duration
    RefreshExpiry time.Duration
}

func NewHandler(cfg HandlerConfig) *Handler {
    return &Handler{
        Auth:    NewAuthHandler(cfg.Service.Auth, cfg.CookieConfig, cfg.AccessExpiry, cfg.RefreshExpiry),
        Admin:   NewAdminHandler(cfg.Service.Admin),
        CSV:     NewCSVHandler(cfg.Service.CSV),
        Health:  NewHealthHandler(cfg.DB),
        User:    NewUserHandler(cfg.Service.User),
        Dataset: NewDatasetHandler(cfg.Service.Dataset),
    }
}
