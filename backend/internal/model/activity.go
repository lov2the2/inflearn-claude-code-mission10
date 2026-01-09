package model

import (
    "time"
)

type Activity struct {
    ID          uint           `gorm:"primaryKey" json:"id"`
    UserID      uint           `gorm:"not null;index" json:"user_id"`
    Action      string         `gorm:"not null;size:50" json:"action"`
    Description string         `gorm:"not null;size:500" json:"description"`
    IPAddress   string         `gorm:"size:45" json:"ip_address"`
    UserAgent   string         `gorm:"type:text" json:"user_agent,omitempty"`
    CreatedAt   time.Time      `json:"created_at"`

    User        User           `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Activity) TableName() string {
    return "activities"
}
