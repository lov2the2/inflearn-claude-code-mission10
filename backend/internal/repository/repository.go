package repository

import "gorm.io/gorm"

type Repository struct {
    db       *gorm.DB
    User     UserRepository
    Admin    AdminRepository
    Token    TokenRepository
    Activity ActivityRepository
    Session  SessionRepository
}

func NewRepository(db *gorm.DB) *Repository {
    return &Repository{
        db:       db,
        User:     NewUserRepository(db),
        Admin:    NewAdminRepository(db),
        Token:    NewTokenRepository(db),
        Activity: NewActivityRepository(db),
        Session:  NewSessionRepository(db),
    }
}
