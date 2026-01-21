package dto

import (
    "time"

    "github.com/google/uuid"
)

type SessionResponse struct {
    ID        uuid.UUID `json:"id"`
    UserAgent string    `json:"userAgent"`
    IPAddress string    `json:"ipAddress"`
    ExpiresAt time.Time `json:"expiresAt"`
    CreatedAt time.Time `json:"createdAt"`
    IsCurrent bool      `json:"isCurrent"`
}

type SessionListResponse struct {
    Sessions []*SessionResponse `json:"sessions"`
}

type RevokeSessionRequest struct {
    SessionID string `json:"sessionId" binding:"required,uuid"`
}
