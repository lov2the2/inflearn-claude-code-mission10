package model

import (
    "time"

    "gorm.io/gorm"
)

type RefreshToken struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    UserID    uint           `gorm:"not null;index" json:"user_id"`
    Token     string         `gorm:"uniqueIndex;not null;size:500" json:"token"`
    ExpiresAt time.Time      `gorm:"not null;index" json:"expires_at"`
    Revoked   bool           `gorm:"default:false" json:"revoked"`
    CreatedAt time.Time      `json:"created_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

    User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

func (RefreshToken) TableName() string {
    return "refresh_tokens"
}
