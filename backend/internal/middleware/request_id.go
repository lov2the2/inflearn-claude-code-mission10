package middleware

import (
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

// RequestID is a middleware that adds a unique request ID to each request
// It checks for an existing X-Request-ID header from the client
// If not present, it generates a new UUID
// The request ID is stored in the context and returned in the response header
func RequestID() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Check if request ID is provided by client
        request_id := c.GetHeader("X-Request-ID")

        // Generate new UUID if not provided
        if request_id == "" {
            request_id = uuid.New().String()
        }

        // Store request ID in context for access in handlers
        c.Set("request_id", request_id)

        // Add request ID to response header
        c.Header("X-Request-ID", request_id)

        // Continue to next handler
        c.Next()
    }
}
