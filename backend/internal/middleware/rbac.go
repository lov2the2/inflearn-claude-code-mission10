package middleware

import (
    "net/http"

    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/model"

    "github.com/gin-gonic/gin"
)

// RequireRole returns a middleware that checks if the authenticated user has the specified role
func RequireRole(role model.UserRole) gin.HandlerFunc {
    return func(c *gin.Context) {
        userRole := GetUserRole(c)
        if userRole == "" {
            c.JSON(http.StatusForbidden, dto.NewErrorResponse("authentication required"))
            c.Abort()
            return
        }

        if model.UserRole(userRole) != role {
            c.JSON(http.StatusForbidden, dto.NewErrorResponse("insufficient permissions"))
            c.Abort()
            return
        }

        c.Next()
    }
}

// RequireAdmin is a convenience middleware that checks if the user has admin role
func RequireAdmin() gin.HandlerFunc {
    return RequireRole(model.RoleAdmin)
}
