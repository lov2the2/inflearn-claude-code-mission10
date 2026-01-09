package service

import (
    "strings"
    "time"

    "start-kit-backend/internal/apperror"
    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/repository"
    "start-kit-backend/internal/util"
)

type UserService interface {
    GetProfile(userID uint) (*dto.UserProfileResponse, error)
    GetActivity(userID uint, params *dto.UserActivityRequest) (*dto.UserActivityResponse, error)
    GetStats(userID uint) (*dto.UserStatsResponse, error)
    UpdateProfile(userID uint, req *dto.UpdateProfileRequest) (*dto.UserProfileResponse, error)
    UpdatePassword(userID uint, req *dto.UpdatePasswordRequest) error
    GetLoginTrend(userID uint) ([]dto.LoginTrendDataPoint, error)
    GetDistribution(userID uint) ([]dto.ActivityDistributionData, error)
    GetMonthlyStats(userID uint) ([]dto.MonthlyStatData, error)
}

type userService struct {
    repo *repository.Repository
}

func NewUserService(repo *repository.Repository) UserService {
    return &userService{repo: repo}
}

func (s *userService) GetProfile(userID uint) (*dto.UserProfileResponse, error) {
    user, err := s.repo.User.FindByID(userID)
    if err != nil {
        return nil, apperror.NotFound("user not found")
    }

    return &dto.UserProfileResponse{
        ID:        user.ID,
        Email:     user.Email,
        Name:      user.Name,
        Role:      string(user.Role),
        CreatedAt: user.CreatedAt,
    }, nil
}

func (s *userService) GetActivity(userID uint, params *dto.UserActivityRequest) (*dto.UserActivityResponse, error) {
    // Verify user exists
    _, err := s.repo.User.FindByID(userID)
    if err != nil {
        return nil, apperror.NotFound("user not found")
    }

    // Fetch real activities from database
    activities, total, err := s.repo.Activity.FindByUserID(userID, params.Page, params.Limit)
    if err != nil {
        return nil, apperror.Internal("failed to fetch activities")
    }

    // Convert to DTOs
    activityItems := make([]dto.UserActivityItem, len(activities))
    for i, activity := range activities {
        activityItems[i] = dto.UserActivityItem{
            ID:          activity.ID,
            Action:      activity.Action,
            Description: activity.Description,
            Timestamp:   activity.CreatedAt,
            IPAddress:   activity.IPAddress,
        }
    }

    return &dto.UserActivityResponse{
        Data:  activityItems,
        Total: total,
        Page:  params.Page,
        Limit: params.Limit,
    }, nil
}

func (s *userService) GetStats(userID uint) (*dto.UserStatsResponse, error) {
    user, err := s.repo.User.FindByID(userID)
    if err != nil {
        return nil, apperror.NotFound("user not found")
    }

    // Get real stats from activities
    loginCount, _ := s.repo.Activity.GetLoginCount(userID)
    lastLogin, _ := s.repo.Activity.GetLastLogin(userID)
    if lastLogin.IsZero() {
        lastLogin = time.Now()
    }
    totalActions, _ := s.repo.Activity.GetTotalActions(userID)

    accountAge := int(time.Since(user.CreatedAt).Hours() / 24)

    return &dto.UserStatsResponse{
        TotalLogins:      loginCount,
        LastLoginAt:      lastLogin,
        AccountAgeInDays: accountAge,
        TotalActions:     totalActions,
    }, nil
}

func (s *userService) UpdateProfile(userID uint, req *dto.UpdateProfileRequest) (*dto.UserProfileResponse, error) {
    // Verify user exists
    _, err := s.repo.User.FindByID(userID)
    if err != nil {
        return nil, apperror.NotFound("user not found")
    }

    // Validate name (additional business rules)
    if len(strings.TrimSpace(req.Name)) < 2 {
        return nil, apperror.Validation("name must be at least 2 characters")
    }

    // Update name
    if err := s.repo.User.UpdateName(userID, req.Name); err != nil {
        return nil, apperror.Internal("failed to update profile")
    }

    // Return updated profile
    return s.GetProfile(userID)
}

func (s *userService) UpdatePassword(userID uint, req *dto.UpdatePasswordRequest) error {
    // Verify user exists
    user, err := s.repo.User.FindByID(userID)
    if err != nil {
        return apperror.NotFound("user not found")
    }

    // Verify current password
    if !util.CheckPassword(req.CurrentPassword, user.PasswordHash) {
        return apperror.Unauthorized("current password is incorrect")
    }

    // Ensure new password is different
    if util.CheckPassword(req.NewPassword, user.PasswordHash) {
        return apperror.Validation("new password must be different from current password")
    }

    // Hash new password
    newPasswordHash, err := util.HashPassword(req.NewPassword)
    if err != nil {
        return apperror.Internal("failed to hash password")
    }

    // Update password
    if err := s.repo.User.UpdatePassword(userID, newPasswordHash); err != nil {
        return apperror.Internal("failed to update password")
    }

    return nil
}

func (s *userService) GetLoginTrend(userID uint) ([]dto.LoginTrendDataPoint, error) {
    return s.repo.Activity.GetLoginTrend(userID, 7)
}

func (s *userService) GetDistribution(userID uint) ([]dto.ActivityDistributionData, error) {
    return s.repo.Activity.GetDistribution(userID)
}

func (s *userService) GetMonthlyStats(userID uint) ([]dto.MonthlyStatData, error) {
    return s.repo.Activity.GetMonthlyStats(userID, 6)
}
