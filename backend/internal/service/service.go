package service

import (
    "time"

    "starter-kit-backend/internal/repository"
)

type Service struct {
    Auth  AuthService
    Admin AdminService
}

func NewService(repo *repository.Repository, jwtSecret string, jwtExpiry, refreshTokenExpiry time.Duration) *Service {
    return &Service{
        Auth:  NewAuthService(repo, jwtSecret, jwtExpiry, refreshTokenExpiry),
        Admin: NewAdminService(repo),
    }
}
