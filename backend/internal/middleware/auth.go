package middleware

import (
    "net/http"
    "strings"

    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/util"

    "github.com/gin-gonic/gin"
)

func AuthRequired(jwtSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        var tokenString string

        // Try to get token from cookie first (preferred method)
        tokenString, err := c.Cookie("access_token")

        // If cookie not found, try Authorization header (fallback for API testing/Swagger)
        if err != nil {
            authHeader := c.GetHeader("Authorization")
            if authHeader == "" {
                c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("missing authentication token"))
                c.Abort()
                return
            }

            // Check Bearer prefix
            parts := strings.Split(authHeader, " ")
            if len(parts) != 2 || parts[0] != "Bearer" {
                c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("invalid authorization header format"))
                c.Abort()
                return
            }

            tokenString = parts[1]
        }

        if tokenString == "" {
            c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("missing authentication token"))
            c.Abort()
            return
        }

        // Validate token
        claims, err := util.ValidateToken(tokenString, jwtSecret)
        if err != nil {
            c.JSON(http.StatusUnauthorized, dto.NewErrorResponse("invalid or expired token"))
            c.Abort()
            return
        }

        // Set user context
        c.Set("user_id", claims.UserID)
        c.Set("user_email", claims.Email)
        c.Set("user_role", claims.Role)

        c.Next()
    }
}

// GetUserID retrieves user ID from context
func GetUserID(c *gin.Context) uint {
    userID, exists := c.Get("user_id")
    if !exists {
        return 0
    }
    return userID.(uint)
}

// GetUserRole retrieves user role from context
func GetUserRole(c *gin.Context) string {
    role, exists := c.Get("user_role")
    if !exists {
        return ""
    }
    return role.(string)
}
