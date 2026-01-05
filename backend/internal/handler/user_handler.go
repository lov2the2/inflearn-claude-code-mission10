package handler

import (
    "net/http"

    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/middleware"
    "start-kit-backend/internal/service"

    "github.com/gin-gonic/gin"
)

type UserHandler struct {
    userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
    return &UserHandler{
        userService: userService,
    }
}

// GetProfile godoc
// @Summary Get user profile
// @Description Get current authenticated user's profile
// @Tags users
// @Produce json
// @Success 200 {object} dto.SuccessResponse{data=dto.UserProfileResponse}
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /api/v1/users/profile [get]
func (h *UserHandler) GetProfile(c *gin.Context) {
    userID := middleware.GetUserID(c)

    profile, err := h.userService.GetProfile(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(profile, ""))
}
