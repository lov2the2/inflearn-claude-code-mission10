//go:build wireinject
// +build wireinject

package wire

import (
    "time"

    "start-kit-backend/internal/config"
    "start-kit-backend/internal/handler"
    "start-kit-backend/internal/repository"
    "start-kit-backend/internal/service"

    "github.com/google/wire"
    "gorm.io/gorm"
)

// JWTExpiry represents access token expiry duration
type JWTExpiry time.Duration

// RefreshExpiry represents refresh token expiry duration
type RefreshExpiry time.Duration

// InitializeHandler initializes all layers with dependency injection
func InitializeHandler(
    db *gorm.DB,
    cfg *config.Config,
    jwtExpiry JWTExpiry,
    refreshExpiry RefreshExpiry,
) *handler.Handler {
    wire.Build(
        // Repository layer
        repository.NewRepository,

        // Service layer
        ProvideService,

        // Handler layer
        ProvideHandler,
    )
    return nil
}

// ProvideService creates Service with injected dependencies
func ProvideService(
    repo *repository.Repository,
    cfg *config.Config,
    jwtExpiry JWTExpiry,
    refreshExpiry RefreshExpiry,
) *service.Service {
    return service.NewService(repo, cfg.JWT.Secret, time.Duration(jwtExpiry), time.Duration(refreshExpiry))
}

// ProvideHandler creates Handler with injected dependencies
func ProvideHandler(
    svc *service.Service,
    db *gorm.DB,
    cfg *config.Config,
    jwtExpiry JWTExpiry,
    refreshExpiry RefreshExpiry,
) *handler.Handler {
    return handler.NewHandler(handler.HandlerConfig{
        Service:       svc,
        DB:            db,
        CookieConfig:  cfg.Cookie,
        AccessExpiry:  time.Duration(jwtExpiry),
        RefreshExpiry: time.Duration(refreshExpiry),
    })
}
