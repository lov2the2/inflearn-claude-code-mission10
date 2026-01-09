package repository

import "gorm.io/gorm"

type Repository struct {
    User     UserRepository
    Admin    AdminRepository
    Token    TokenRepository
    Activity ActivityRepository
}

func NewRepository(db *gorm.DB) *Repository {
    return &Repository{
        User:     NewUserRepository(db),
        Admin:    NewAdminRepository(db),
        Token:    NewTokenRepository(db),
        Activity: NewActivityRepository(db),
    }
}
