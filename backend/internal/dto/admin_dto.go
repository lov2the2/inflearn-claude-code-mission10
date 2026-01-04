package dto

import "time"

// ListUsersRequest represents query parameters for listing users
type ListUsersRequest struct {
    Page  int `form:"page,default=1" binding:"omitempty,min=1"`
    Limit int `form:"limit,default=10" binding:"omitempty,min=1,max=100"`
}

// ListUsersResponse represents the response for listing users
type ListUsersResponse struct {
    Users []UserResponse `json:"users"`
    Total int64          `json:"total"`
    Page  int            `json:"page"`
    Limit int            `json:"limit"`
}

// UserDetailResponse represents detailed user information including timestamps
type UserDetailResponse struct {
    ID        uint      `json:"id"`
    Email     string    `json:"email"`
    Name      string    `json:"name"`
    Role      string    `json:"role"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

// UpdateUserRoleRequest represents the request body for updating user role
type UpdateUserRoleRequest struct {
    Role string `json:"role" binding:"required,oneof=admin user"`
}
