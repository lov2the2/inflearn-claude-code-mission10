package repository

import "gorm.io/gorm"

type Repository struct {
    User  UserRepository
    Token TokenRepository
}

func NewRepository(db *gorm.DB) *Repository {
    return &Repository{
        User:  NewUserRepository(db),
        Token: NewTokenRepository(db),
    }
}
