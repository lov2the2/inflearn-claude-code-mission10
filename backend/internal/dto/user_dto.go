package dto

import "time"

// ====================
// Profile DTOs
// ====================

// UserProfileResponse represents user profile information
type UserProfileResponse struct {
    ID        uint      `json:"id"`
    Email     string    `json:"email"`
    Name      string    `json:"name"`
    Role      string    `json:"role"`
    CreatedAt time.Time `json:"created_at"`
}
