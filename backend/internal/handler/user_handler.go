package handler

import (
    "net/http"

    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/middleware"
    "start-kit-backend/internal/service"
    "start-kit-backend/pkg/logger"

    "github.com/gin-gonic/gin"
)

type UserHandler struct {
    BaseHandler
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
    requestID := middleware.GetRequestID(c)
    userID := middleware.GetUserID(c)
    log := logger.WithContext(requestID, userID)

    log.Info().
        Str("action", "get_profile").
        Msg("Fetching user profile")

    profile, err := h.userService.GetProfile(userID)
    if err != nil {
        log.Error().
            Err(err).
            Str("action", "get_profile").
            Msg("Failed to fetch user profile")
        h.SendErrorResponse(c, err)
        return
    }

    log.Info().
        Str("action", "get_profile").
        Msg("User profile fetched successfully")

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
        h.SendErrorResponse(c, err)
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
        h.SendErrorResponse(c, err)
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
        h.SendErrorResponse(c, err)
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
        h.SendErrorResponse(c, err)
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(nil, "Password updated successfully"))
}

// GetLoginTrend godoc
// @Summary Get login trend
// @Description Get last 7 days login trend
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.SuccessResponse{data=[]dto.LoginTrendDataPoint}
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/v1/users/activity/login-trend [get]
func (h *UserHandler) GetLoginTrend(c *gin.Context) {
    userID := middleware.GetUserID(c)

    data, err := h.userService.GetLoginTrend(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("failed to get login trend"))
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(data, ""))
}

// GetDistribution godoc
// @Summary Get activity distribution
// @Description Get activity breakdown by action type
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.SuccessResponse{data=[]dto.ActivityDistributionData}
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/v1/users/activity/distribution [get]
func (h *UserHandler) GetDistribution(c *gin.Context) {
    userID := middleware.GetUserID(c)

    data, err := h.userService.GetDistribution(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("failed to get activity distribution"))
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(data, ""))
}

// GetMonthlyStats godoc
// @Summary Get monthly statistics
// @Description Get last 6 months activity statistics
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.SuccessResponse{data=[]dto.MonthlyStatData}
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/v1/users/activity/monthly-stats [get]
func (h *UserHandler) GetMonthlyStats(c *gin.Context) {
    userID := middleware.GetUserID(c)

    data, err := h.userService.GetMonthlyStats(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("failed to get monthly stats"))
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(data, ""))
}
