package repository

import (
    "time"

    "start-kit-backend/internal/model"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type SessionRepository interface {
    CreateSession(session *model.Session) error
    GetSessionByToken(token string) (*model.Session, error)
    GetUserSessions(userID uint) ([]*model.Session, error)
    RevokeSession(sessionID uuid.UUID) error
    RevokeAllUserSessions(userID uint) error
    DeleteExpiredSessions() error
}

type sessionRepository struct {
    db *gorm.DB
}

func NewSessionRepository(db *gorm.DB) SessionRepository {
    return &sessionRepository{db: db}
}

func (r *sessionRepository) CreateSession(session *model.Session) error {
    return r.db.Create(session).Error
}

func (r *sessionRepository) GetSessionByToken(token string) (*model.Session, error) {
    var session model.Session
    err := r.db.Where("refresh_token = ? AND revoked_at IS NULL AND expires_at > ?", token, time.Now()).
        First(&session).Error
    if err != nil {
        return nil, err
    }
    return &session, nil
}

func (r *sessionRepository) GetUserSessions(userID uint) ([]*model.Session, error) {
    var sessions []*model.Session
    err := r.db.Where("user_id = ? AND revoked_at IS NULL", userID).
        Order("created_at DESC").
        Find(&sessions).Error
    if err != nil {
        return nil, err
    }
    return sessions, nil
}

func (r *sessionRepository) RevokeSession(sessionID uuid.UUID) error {
    now := time.Now()
    return r.db.Model(&model.Session{}).
        Where("id = ? AND revoked_at IS NULL", sessionID).
        Update("revoked_at", now).Error
}

func (r *sessionRepository) RevokeAllUserSessions(userID uint) error {
    now := time.Now()
    return r.db.Model(&model.Session{}).
        Where("user_id = ? AND revoked_at IS NULL", userID).
        Update("revoked_at", now).Error
}

func (r *sessionRepository) DeleteExpiredSessions() error {
    return r.db.Where("expires_at < ?", time.Now()).
        Delete(&model.Session{}).Error
}
