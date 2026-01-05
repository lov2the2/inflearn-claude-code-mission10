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

// ====================
// Activity DTOs
// ====================

// UserActivityItem represents a single user activity log entry
type UserActivityItem struct {
    ID          uint      `json:"id"`
    Action      string    `json:"action"`
    Description string    `json:"description"`
    Timestamp   time.Time `json:"timestamp"`
    IPAddress   string    `json:"ip_address"`
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
    TotalLogins      int       `json:"total_logins"`
    LastLoginAt      time.Time `json:"last_login_at"`
    AccountAgeInDays int       `json:"account_age_in_days"`
    TotalActions     int       `json:"total_actions"`
}
