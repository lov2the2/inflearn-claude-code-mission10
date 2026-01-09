package handler

import (
    "net/http"
    "time"

    "start-kit-backend/internal/config"
    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/service"

    "github.com/gin-gonic/gin"
)

type AuthHandler struct {
    authService   service.AuthService
    cookieSecure  bool
    cookieDomain  string
    accessExpiry  time.Duration
    refreshExpiry time.Duration
}

func NewAuthHandler(
    authService service.AuthService,
    cookieConfig config.CookieConfig,
    accessExpiry time.Duration,
    refreshExpiry time.Duration,
) *AuthHandler {
    return &AuthHandler{
        authService:   authService,
        cookieSecure:  cookieConfig.Secure,
        cookieDomain:  cookieConfig.Domain,
        accessExpiry:  accessExpiry,
        refreshExpiry: refreshExpiry,
    }
}

// Register godoc
// @Summary Register a new user
// @Description Create a new user account (sets HttpOnly cookies for tokens)
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.RegisterRequest true "Register request"
// @Success 201 {object} dto.SuccessResponse{data=dto.UserResponse}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
    var req dto.RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err.Error()))
        return
    }

    authResp, err := h.authService.Register(&req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        return
    }

    // Set access token cookie
    c.SetCookie(
        "access_token",
        authResp.AccessToken,
        int(h.accessExpiry.Seconds()),
        "/",
        h.cookieDomain,
        h.cookieSecure,
        true, // HttpOnly
    )

    // Set refresh token cookie
    c.SetCookie(
        "refresh_token",
        authResp.RefreshToken,
        int(h.refreshExpiry.Seconds()),
        "/api/v1/auth",
        h.cookieDomain,
        h.cookieSecure,
        true, // HttpOnly
    )

    // Return only user info, not tokens
    c.JSON(http.StatusCreated, dto.NewSuccessResponse(authResp.User, "User registered successfully"))
}

// Login godoc
// @Summary Login user
// @Description Authenticate user and set HttpOnly cookies for tokens
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login request"
// @Success 200 {object} dto.SuccessResponse{data=dto.UserResponse}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
    var req dto.LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err.Error()))
        return
    }

    authResp, err := h.authService.Login(&req)
    if err != nil {
        c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(err.Error()))
        return
    }

    // Set access token cookie
    c.SetCookie(
        "access_token",
        authResp.AccessToken,
        int(h.accessExpiry.Seconds()),
        "/",
        h.cookieDomain,
        h.cookieSecure,
        true, // HttpOnly
    )

    // Set refresh token cookie
    c.SetCookie(
        "refresh_token",
        authResp.RefreshToken,
        int(h.refreshExpiry.Seconds()),
        "/api/v1/auth",
        h.cookieDomain,
        h.cookieSecure,
        true, // HttpOnly
    )

    // Return only user info, not tokens
    c.JSON(http.StatusOK, dto.NewSuccessResponse(authResp.User, "Login successful"))
}

// Refresh godoc
// @Summary Refresh access token
// @Description Generate new access token using refresh token from cookie or body
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.RefreshTokenRequest false "Refresh token request (optional if cookie present)"
// @Success 200 {object} dto.SuccessResponse{data=dto.UserResponse}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/v1/auth/refresh [post]
func (h *AuthHandler) Refresh(c *gin.Context) {
    // Try to get refresh token from cookie first
    refreshToken, err := c.Cookie("refresh_token")

    // If cookie not found, try to get from request body (backward compatibility)
    if err != nil {
        var req dto.RefreshTokenRequest
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, dto.NewErrorResponse("refresh token required"))
            return
        }
        refreshToken = req.RefreshToken
    }

    if refreshToken == "" {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("refresh token required"))
        return
    }

    authResp, err := h.authService.Refresh(refreshToken)
    if err != nil {
        c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(err.Error()))
        return
    }

    // Set new access token cookie
    c.SetCookie(
        "access_token",
        authResp.AccessToken,
        int(h.accessExpiry.Seconds()),
        "/",
        h.cookieDomain,
        h.cookieSecure,
        true, // HttpOnly
    )

    // Set new refresh token cookie (if provided in response)
    if authResp.RefreshToken != "" {
        c.SetCookie(
            "refresh_token",
            authResp.RefreshToken,
            int(h.refreshExpiry.Seconds()),
            "/api/v1/auth",
            h.cookieDomain,
            h.cookieSecure,
            true, // HttpOnly
        )
    }

    // Return only user info, not tokens
    c.JSON(http.StatusOK, dto.NewSuccessResponse(authResp.User, "Token refreshed successfully"))
}

// Logout godoc
// @Summary Logout user
// @Description Revoke refresh token and clear cookies
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.RefreshTokenRequest false "Refresh token request (optional if cookie present)"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
    // Try to get refresh token from cookie first
    refreshToken, err := c.Cookie("refresh_token")

    // If cookie not found, try to get from request body (backward compatibility)
    if err != nil {
        var req dto.RefreshTokenRequest
        if err := c.ShouldBindJSON(&req); err != nil {
            // If no token provided, just clear cookies and return success
            h.clearAuthCookies(c)
            c.JSON(http.StatusOK, dto.NewSuccessResponse(nil, "Logout successful"))
            return
        }
        refreshToken = req.RefreshToken
    }

    // Revoke refresh token if provided
    if refreshToken != "" {
        if err := h.authService.Logout(refreshToken); err != nil {
            c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
            return
        }
    }

    // Clear cookies
    h.clearAuthCookies(c)

    c.JSON(http.StatusOK, dto.NewSuccessResponse(nil, "Logout successful"))
}

// clearAuthCookies clears both access and refresh token cookies
func (h *AuthHandler) clearAuthCookies(c *gin.Context) {
    // Clear access token cookie
    c.SetCookie(
        "access_token",
        "",
        -1, // MaxAge -1 deletes the cookie
        "/",
        h.cookieDomain,
        h.cookieSecure,
        true, // HttpOnly
    )

    // Clear refresh token cookie
    c.SetCookie(
        "refresh_token",
        "",
        -1, // MaxAge -1 deletes the cookie
        "/api/v1/auth",
        h.cookieDomain,
        h.cookieSecure,
        true, // HttpOnly
    )
}
