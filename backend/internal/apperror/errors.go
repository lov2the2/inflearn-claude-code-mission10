package apperror

import "net/http"

// Code represents standard application error codes
type Code string

const (
    CodeUnauthorized Code = "UNAUTHORIZED"
    CodeNotFound     Code = "NOT_FOUND"
    CodeValidation   Code = "VALIDATION_ERROR"
    CodeInternal     Code = "INTERNAL_ERROR"
    CodeConflict     Code = "CONFLICT"
    CodeForbidden    Code = "FORBIDDEN"
)

// AppError represents a structured application error
type AppError struct {
    Code       Code   `json:"code"`
    Message    string `json:"message"`
    StatusCode int    `json:"-"`
}

// Error implements the error interface
func (e *AppError) Error() string {
    return e.Message
}

// Unauthorized creates a 401 error
func Unauthorized(message string) *AppError {
    return &AppError{
        Code:       CodeUnauthorized,
        Message:    message,
        StatusCode: http.StatusUnauthorized,
    }
}

// NotFound creates a 404 error
func NotFound(message string) *AppError {
    return &AppError{
        Code:       CodeNotFound,
        Message:    message,
        StatusCode: http.StatusNotFound,
    }
}

// Validation creates a 400 error
func Validation(message string) *AppError {
    return &AppError{
        Code:       CodeValidation,
        Message:    message,
        StatusCode: http.StatusBadRequest,
    }
}

// Internal creates a 500 error
func Internal(message string) *AppError {
    return &AppError{
        Code:       CodeInternal,
        Message:    message,
        StatusCode: http.StatusInternalServerError,
    }
}

// Conflict creates a 409 error
func Conflict(message string) *AppError {
    return &AppError{
        Code:       CodeConflict,
        Message:    message,
        StatusCode: http.StatusConflict,
    }
}

// Forbidden creates a 403 error
func Forbidden(message string) *AppError {
    return &AppError{
        Code:       CodeForbidden,
        Message:    message,
        StatusCode: http.StatusForbidden,
    }
}
