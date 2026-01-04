package handler

import (
    "net/http"

    "starter-kit-backend/internal/dto"
    "starter-kit-backend/internal/service"

    "github.com/gin-gonic/gin"
)

type AuthHandler struct {
    authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
    return &AuthHandler{
        authService: authService,
    }
}

// Register godoc
// @Summary Register a new user
// @Description Create a new user account
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.RegisterRequest true "Register request"
// @Success 201 {object} dto.SuccessResponse
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

    c.JSON(http.StatusCreated, dto.NewSuccessResponse(authResp, "User registered successfully"))
}

// Login godoc
// @Summary Login user
// @Description Authenticate user and return access token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login request"
// @Success 200 {object} dto.SuccessResponse
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

    c.JSON(http.StatusOK, dto.NewSuccessResponse(authResp, "Login successful"))
}
