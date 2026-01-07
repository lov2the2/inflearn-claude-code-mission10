package service

import (
    "errors"
    "strings"
    "time"

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
        return nil, errors.New("user not found")
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
        return nil, errors.New("user not found")
    }

    // Generate mock activity data
    mockActivities := s.generateMockActivities(userID, params.Limit)

    return &dto.UserActivityResponse{
        Data:  mockActivities,
        Total: int64(len(mockActivities)),
        Page:  params.Page,
        Limit: params.Limit,
    }, nil
}

func (s *userService) GetStats(userID uint) (*dto.UserStatsResponse, error) {
    user, err := s.repo.User.FindByID(userID)
    if err != nil {
        return nil, errors.New("user not found")
    }

    // Calculate account age in days
    accountAge := int(time.Since(user.CreatedAt).Hours() / 24)

    return &dto.UserStatsResponse{
        TotalLogins:      42,
        LastLoginAt:      time.Now().Add(-2 * time.Hour),
        AccountAgeInDays: accountAge,
        TotalActions:     128,
    }, nil
}

// generateMockActivities creates mock activity data for testing
func (s *userService) generateMockActivities(userID uint, limit int) []dto.UserActivityItem {
    activities := []dto.UserActivityItem{
        {
            ID:          1,
            Action:      "login",
            Description: "User logged in successfully",
            Timestamp:   time.Now().Add(-2 * time.Hour),
            IPAddress:   "192.168.1.1",
        },
        {
            ID:          2,
            Action:      "profile_update",
            Description: "Updated profile information",
            Timestamp:   time.Now().Add(-24 * time.Hour),
            IPAddress:   "192.168.1.1",
        },
        {
            ID:          3,
            Action:      "password_change",
            Description: "Password changed successfully",
            Timestamp:   time.Now().Add(-72 * time.Hour),
            IPAddress:   "192.168.1.2",
        },
        {
            ID:          4,
            Action:      "login",
            Description: "User logged in successfully",
            Timestamp:   time.Now().Add(-96 * time.Hour),
            IPAddress:   "192.168.1.1",
        },
        {
            ID:          5,
            Action:      "logout",
            Description: "User logged out",
            Timestamp:   time.Now().Add(-120 * time.Hour),
            IPAddress:   "192.168.1.1",
        },
    }

    if limit > len(activities) {
        limit = len(activities)
    }
    return activities[:limit]
}

func (s *userService) UpdateProfile(userID uint, req *dto.UpdateProfileRequest) (*dto.UserProfileResponse, error) {
    // Verify user exists
    _, err := s.repo.User.FindByID(userID)
    if err != nil {
        return nil, errors.New("user not found")
    }

    // Validate name (additional business rules)
    if len(strings.TrimSpace(req.Name)) < 2 {
        return nil, errors.New("name must be at least 2 characters")
    }

    // Update name
    if err := s.repo.User.UpdateName(userID, req.Name); err != nil {
        return nil, errors.New("failed to update profile")
    }

    // Return updated profile
    return s.GetProfile(userID)
}

func (s *userService) UpdatePassword(userID uint, req *dto.UpdatePasswordRequest) error {
    // Verify user exists
    user, err := s.repo.User.FindByID(userID)
    if err != nil {
        return errors.New("user not found")
    }

    // Verify current password
    if !util.CheckPassword(req.CurrentPassword, user.PasswordHash) {
        return errors.New("current password is incorrect")
    }

    // Ensure new password is different
    if util.CheckPassword(req.NewPassword, user.PasswordHash) {
        return errors.New("new password must be different from current password")
    }

    // Hash new password
    newPasswordHash, err := util.HashPassword(req.NewPassword)
    if err != nil {
        return errors.New("failed to hash password")
    }

    // Update password
    if err := s.repo.User.UpdatePassword(userID, newPasswordHash); err != nil {
        return errors.New("failed to update password")
    }

    return nil
}
