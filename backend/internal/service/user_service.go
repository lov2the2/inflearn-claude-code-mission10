package service

import (
    "errors"

    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/repository"
)

type UserService interface {
    GetProfile(userID uint) (*dto.UserProfileResponse, error)
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
