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

// GetActivity godoc
// @Summary Get user activity log
// @Description Get paginated activity log for current user
// @Tags users
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} dto.SuccessResponse{data=dto.UserActivityResponse}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /api/v1/users/activity [get]
func (h *UserHandler) GetActivity(c *gin.Context) {
    userID := middleware.GetUserID(c)

    var params dto.UserActivityRequest
    if err := c.ShouldBindQuery(&params); err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err.Error()))
        return
    }

    activity, err := h.userService.GetActivity(userID, &params)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(activity, ""))
}

// GetStats godoc
// @Summary Get user statistics
// @Description Get statistics/KPIs for current user
// @Tags users
// @Produce json
// @Success 200 {object} dto.SuccessResponse{data=dto.UserStatsResponse}
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /api/v1/users/stats [get]
func (h *UserHandler) GetStats(c *gin.Context) {
    userID := middleware.GetUserID(c)

    stats, err := h.userService.GetStats(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(stats, ""))
}

// UpdateProfile godoc
// @Summary Update user profile
// @Description Update current user's profile information (name only)
// @Tags users
// @Accept json
// @Produce json
// @Param request body dto.UpdateProfileRequest true "Profile update payload"
// @Success 200 {object} dto.SuccessResponse{data=dto.UpdateProfileResponse}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /api/v1/users/profile [patch]
func (h *UserHandler) UpdateProfile(c *gin.Context) {
    userID := middleware.GetUserID(c)

    var req dto.UpdateProfileRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err.Error()))
        return
    }

    profile, err := h.userService.UpdateProfile(userID, &req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        return
    }

    response := dto.UpdateProfileResponse{
        Message: "Profile updated successfully",
        Profile: *profile,
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(response, "Profile updated successfully"))
}

// UpdatePassword godoc
// @Summary Change user password
// @Description Change current user's password with verification
// @Tags users
// @Accept json
// @Produce json
// @Param request body dto.UpdatePasswordRequest true "Password change payload"
// @Success 200 {object} dto.SuccessResponse{data=nil}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /api/v1/users/password [patch]
func (h *UserHandler) UpdatePassword(c *gin.Context) {
    userID := middleware.GetUserID(c)

    var req dto.UpdatePasswordRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err.Error()))
        return
    }

    if err := h.userService.UpdatePassword(userID, &req); err != nil {
        statusCode := http.StatusBadRequest
        if err.Error() == "current password is incorrect" {
            statusCode = http.StatusUnauthorized
        }
        c.JSON(statusCode, dto.NewErrorResponse(err.Error()))
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(nil, "Password updated successfully"))
}
