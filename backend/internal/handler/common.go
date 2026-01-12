package handler

import (
    "net/http"

    "start-kit-backend/internal/apperror"
    "start-kit-backend/internal/dto"

    "github.com/gin-gonic/gin"
)

// BaseHandler provides common utilities for all handlers
type BaseHandler struct{}

// SendErrorResponse sends appropriate error response based on error type
// If err is *apperror.AppError, sends structured app error response
// Otherwise, sends generic internal server error response
func (h *BaseHandler) SendErrorResponse(c *gin.Context, err error) {
    if appErr, ok := err.(*apperror.AppError); ok {
        c.JSON(appErr.StatusCode, dto.NewAppErrorResponse(appErr))
    } else {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
    }
}

// SendSuccessResponse sends success response with data and optional message
func (h *BaseHandler) SendSuccessResponse(c *gin.Context, statusCode int, data interface{}, message string) {
    c.JSON(statusCode, dto.NewSuccessResponse(data, message))
}
