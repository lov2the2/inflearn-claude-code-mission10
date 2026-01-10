package service

import (
    "time"

    "start-kit-backend/internal/repository"
)

type Service struct {
    Auth    AuthService
    Admin   AdminService
    CSV     CSVService
    User    UserService
    Dataset DatasetService
}

func NewService(repo *repository.Repository, jwtSecret string, jwtExpiry, refreshTokenExpiry time.Duration) *Service {
    return &Service{
        Auth:    NewAuthService(repo, jwtSecret, jwtExpiry, refreshTokenExpiry),
        Admin:   NewAdminService(repo),
        CSV:     NewCSVService(repo),
        User:    NewUserService(repo),
        Dataset: NewDatasetService(repo),
    }
}
