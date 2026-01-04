package repository

import (
    "time"

    "starter-kit-backend/internal/model"

    "gorm.io/gorm"
)

type TokenRepository interface {
    Create(token *model.RefreshToken) error
    FindByToken(token string) (*model.RefreshToken, error)
    RevokeByToken(token string) error
    RevokeAllByUserID(userID uint) error
    DeleteExpired() error
}

type tokenRepository struct {
    db *gorm.DB
}

func NewTokenRepository(db *gorm.DB) TokenRepository {
    return &tokenRepository{db: db}
}

func (r *tokenRepository) Create(token *model.RefreshToken) error {
    return r.db.Create(token).Error
}

func (r *tokenRepository) FindByToken(token string) (*model.RefreshToken, error) {
    var refreshToken model.RefreshToken
    err := r.db.Where("token = ? AND revoked = ? AND expires_at > ?", token, false, time.Now()).
        First(&refreshToken).Error
    if err != nil {
        return nil, err
    }
    return &refreshToken, nil
}

func (r *tokenRepository) RevokeByToken(token string) error {
    return r.db.Model(&model.RefreshToken{}).
        Where("token = ?", token).
        Update("revoked", true).Error
}

func (r *tokenRepository) RevokeAllByUserID(userID uint) error {
    return r.db.Model(&model.RefreshToken{}).
        Where("user_id = ?", userID).
        Update("revoked", true).Error
}

func (r *tokenRepository) DeleteExpired() error {
    return r.db.Where("expires_at < ?", time.Now()).
        Delete(&model.RefreshToken{}).Error
}
