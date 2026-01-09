package dto

import (
    "time"

    "github.com/google/uuid"
)

type SessionResponse struct {
    ID        uuid.UUID `json:"id"`
    UserAgent string    `json:"user_agent"`
    IPAddress string    `json:"ip_address"`
    ExpiresAt time.Time `json:"expires_at"`
    CreatedAt time.Time `json:"created_at"`
    IsCurrent bool      `json:"is_current"`
}

type SessionListResponse struct {
    Sessions []*SessionResponse `json:"sessions"`
}

type RevokeSessionRequest struct {
    SessionID string `json:"session_id" binding:"required,uuid"`
}
