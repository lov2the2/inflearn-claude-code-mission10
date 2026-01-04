package service

import (
    "errors"

    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/model"
    "start-kit-backend/internal/repository"
)

type AdminService interface {
    ListUsers(params *dto.ListUsersRequest) (*dto.ListUsersResponse, error)
    GetUser(userID uint) (*dto.UserDetailResponse, error)
    UpdateUserRole(userID uint, newRole model.UserRole, adminID uint) error
    DeleteUser(userID uint, adminID uint) error
}

type adminService struct {
    repo *repository.Repository
}

func NewAdminService(repo *repository.Repository) AdminService {
    return &adminService{repo: repo}
}

func (s *adminService) ListUsers(params *dto.ListUsersRequest) (*dto.ListUsersResponse, error) {
    // Calculate offset for pagination
    offset := (params.Page - 1) * params.Limit

    // Get users from repository
    users, total, err := s.repo.Admin.ListUsers(offset, params.Limit)
    if err != nil {
        return nil, err
    }

    // Convert to response DTOs
    userResponses := make([]dto.UserResponse, len(users))
    for i, user := range users {
        userResponses[i] = dto.UserResponse{
            ID:    user.ID,
            Email: user.Email,
            Name:  user.Name,
            Role:  string(user.Role),
        }
    }

    return &dto.ListUsersResponse{
        Users: userResponses,
        Total: total,
        Page:  params.Page,
        Limit: params.Limit,
    }, nil
}

func (s *adminService) GetUser(userID uint) (*dto.UserDetailResponse, error) {
    user, err := s.repo.User.FindByID(userID)
    if err != nil {
        return nil, err
    }

    return &dto.UserDetailResponse{
        ID:        user.ID,
        Email:     user.Email,
        Name:      user.Name,
        Role:      string(user.Role),
        CreatedAt: user.CreatedAt,
        UpdatedAt: user.UpdatedAt,
    }, nil
}

func (s *adminService) UpdateUserRole(userID uint, newRole model.UserRole, adminID uint) error {
    // Prevent admin from changing their own role
    if userID == adminID {
        return errors.New("cannot modify your own role")
    }

    // Check if user exists
    _, err := s.repo.User.FindByID(userID)
    if err != nil {
        return err
    }

    // Update role
    return s.repo.Admin.UpdateRole(userID, newRole)
}

func (s *adminService) DeleteUser(userID uint, adminID uint) error {
    // Prevent admin from deleting themselves
    if userID == adminID {
        return errors.New("cannot delete your own account")
    }

    // Check if user exists
    _, err := s.repo.User.FindByID(userID)
    if err != nil {
        return err
    }

    // Delete user (soft delete via GORM)
    return s.repo.Admin.Delete(userID)
}
