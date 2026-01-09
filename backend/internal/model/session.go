package model

import (
    "time"

    "github.com/google/uuid"
)

type Session struct {
    ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    UserID       uint       `gorm:"not null;index" json:"user_id"`
    RefreshToken string     `gorm:"uniqueIndex;not null;size:500" json:"-"`
    UserAgent    string     `gorm:"size:500" json:"user_agent"`
    IPAddress    string     `gorm:"size:45" json:"ip_address"`
    ExpiresAt    time.Time  `gorm:"not null;index" json:"expires_at"`
    CreatedAt    time.Time  `json:"created_at"`
    RevokedAt    *time.Time `json:"revoked_at,omitempty"`

    User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Session) TableName() string {
    return "sessions"
}
