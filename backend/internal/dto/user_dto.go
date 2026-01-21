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
    CreatedAt time.Time `json:"createdAt"`
}

// ====================
// Activity DTOs
// ====================

// UserActivityItem represents a single user activity log entry
type UserActivityItem struct {
    ID          uint      `json:"id"`
    Action      string    `json:"action"`
    Description string    `json:"description"`
    Timestamp   time.Time `json:"timestamp"`
    IPAddress   string    `json:"ipAddress"`
}

// UserActivityRequest represents query parameters for activity logs
type UserActivityRequest struct {
    Page  int `form:"page,default=1" binding:"omitempty,min=1"`
    Limit int `form:"limit,default=10" binding:"omitempty,min=1,max=100"`
}

// UserActivityResponse represents paginated activity logs
type UserActivityResponse struct {
    Data  []UserActivityItem `json:"data"`
    Total int64              `json:"total"`
    Page  int                `json:"page"`
    Limit int                `json:"limit"`
}

// ====================
// Stats DTOs
// ====================

// UserStatsResponse represents user statistics
type UserStatsResponse struct {
    TotalLogins      int       `json:"totalLogins"`
    LastLoginAt      time.Time `json:"lastLoginAt"`
    AccountAgeInDays int       `json:"accountAgeInDays"`
    TotalActions     int       `json:"totalActions"`
}

// ====================
// Profile Update DTOs
// ====================

// UpdateProfileRequest represents profile update payload
type UpdateProfileRequest struct {
    Name string `json:"name" binding:"required,min=2,max=100"`
}

// UpdatePasswordRequest represents password change payload
type UpdatePasswordRequest struct {
    CurrentPassword string `json:"currentPassword" binding:"required,min=1"`
    NewPassword     string `json:"newPassword" binding:"required,min=8,max=128"`
    ConfirmPassword string `json:"confirmPassword" binding:"required,eqfield=NewPassword"`
}

// UpdateProfileResponse represents successful profile update
type UpdateProfileResponse struct {
    Message string              `json:"message"`
    Profile UserProfileResponse `json:"profile"`
}
