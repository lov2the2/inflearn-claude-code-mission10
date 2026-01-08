package middleware

import (
    "start-kit-backend/internal/model"
    "start-kit-backend/internal/repository"
    "strings"

    "github.com/gin-gonic/gin"
)

func ActivityLogger(repo *repository.Repository) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 요청 처리
        c.Next()

        // 사용자 인증 확인
        userID := GetUserID(c)
        if userID == 0 {
            return // 인증되지 않은 요청은 로깅하지 않음
        }

        // 응답 상태 확인 (에러는 로깅하지 않음)
        if c.Writer.Status() >= 400 {
            return
        }

        // 액션 및 설명 결정
        action, description := determineAction(c.Request.URL.Path, c.Request.Method)
        if action == "" {
            return // 로깅할 액션이 아님
        }

        // Activity 생성 (비동기로 저장하여 응답 블록 방지)
        activity := &model.Activity{
            UserID:      userID,
            Action:      action,
            Description: description,
            IPAddress:   c.ClientIP(),
            UserAgent:   c.Request.UserAgent(),
        }

        go func() {
            _ = repo.Activity.Create(activity)
        }()
    }
}

func determineAction(path, method string) (string, string) {
    switch {
    case path == "/api/v1/auth/login" && method == "POST":
        return "login", "User logged in successfully"
    case path == "/api/v1/auth/logout" && method == "POST":
        return "logout", "User logged out"
    case path == "/api/v1/auth/refresh" && method == "POST":
        return "token_refresh", "Access token refreshed"
    case path == "/api/v1/users/profile" && method == "GET":
        return "profile_view", "Viewed profile"
    case path == "/api/v1/users/profile" && method == "PATCH":
        return "profile_update", "Updated profile information"
    case path == "/api/v1/users/password" && method == "PATCH":
        return "password_change", "Changed password successfully"
    case strings.HasPrefix(path, "/api/v1/admin/users") && method == "POST" && !strings.Contains(path, "import"):
        return "user_create", "Admin created new user"
    case strings.HasPrefix(path, "/api/v1/admin/users") && method == "DELETE":
        return "user_delete", "Admin deleted user"
    case strings.Contains(path, "/role") && method == "PATCH":
        return "user_role_update", "Admin updated user role"
    case strings.Contains(path, "/import") && method == "POST":
        return "csv_import", "Admin imported users from CSV"
    case strings.Contains(path, "/export") && method == "GET":
        return "csv_export", "Admin exported users to CSV"
    default:
        return "", ""
    }
}
