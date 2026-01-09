package dto

import "start-kit-backend/internal/apperror"

type SuccessResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Message string      `json:"message,omitempty"`
}

type ErrorResponse struct {
    Success bool              `json:"success"`
    Code    apperror.Code     `json:"code,omitempty"`
    Error   string            `json:"error"`
}

func NewSuccessResponse(data interface{}, message string) SuccessResponse {
    return SuccessResponse{
        Success: true,
        Data:    data,
        Message: message,
    }
}

func NewErrorResponse(error string) ErrorResponse {
    return ErrorResponse{
        Success: false,
        Error:   error,
    }
}

// NewAppErrorResponse creates an error response from AppError
func NewAppErrorResponse(err *apperror.AppError) ErrorResponse {
    return ErrorResponse{
        Success: false,
        Code:    err.Code,
        Error:   err.Message,
    }
}
