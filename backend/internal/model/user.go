package model

import (
    "time"

    "gorm.io/gorm"
)

type UserRole string

const (
    RoleAdmin UserRole = "admin"
    RoleUser  UserRole = "user"
)

type User struct {
    ID           uint           `gorm:"primaryKey" json:"id"`
    Email        string         `gorm:"uniqueIndex;not null;size:255" json:"email"`
    PasswordHash string         `gorm:"not null;size:255" json:"-"`
    Name         string         `gorm:"not null;size:255" json:"name"`
    Role         UserRole       `gorm:"not null;size:50;default:'user'" json:"role"`
    CreatedAt    time.Time      `json:"created_at"`
    UpdatedAt    time.Time      `json:"updated_at"`
    DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (User) TableName() string {
    return "users"
}
