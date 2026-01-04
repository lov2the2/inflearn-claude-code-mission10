package service

import (
    "time"

    "start-kit-backend/internal/repository"
)

type Service struct {
    Auth  AuthService
    Admin AdminService
    CSV   CSVService
}

func NewService(repo *repository.Repository, jwtSecret string, jwtExpiry, refreshTokenExpiry time.Duration) *Service {
    return &Service{
        Auth:  NewAuthService(repo, jwtSecret, jwtExpiry, refreshTokenExpiry),
        Admin: NewAdminService(repo),
        CSV:   NewCSVService(repo),
    }
}
