package service

import (
    "errors"
    "time"

    "starter-kit-backend/internal/dto"
    "starter-kit-backend/internal/model"
    "starter-kit-backend/internal/repository"
    "starter-kit-backend/internal/util"

    "gorm.io/gorm"
)

type AuthService interface {
    Register(req *dto.RegisterRequest) (*dto.AuthResponse, error)
    Login(req *dto.LoginRequest) (*dto.AuthResponse, error)
}

type authService struct {
    repo      *repository.Repository
    jwtSecret string
    jwtExpiry time.Duration
}

func NewAuthService(repo *repository.Repository, jwtSecret string, jwtExpiry time.Duration) AuthService {
    return &authService{
        repo:      repo,
        jwtSecret: jwtSecret,
        jwtExpiry: jwtExpiry,
    }
}

func (s *authService) Register(req *dto.RegisterRequest) (*dto.AuthResponse, error) {
    // Check if user already exists
    existingUser, err := s.repo.User.FindByEmail(req.Email)
    if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, err
    }
    if existingUser != nil {
        return nil, errors.New("user with this email already exists")
    }

    // Hash password
    passwordHash, err := util.HashPassword(req.Password)
    if err != nil {
        return nil, err
    }

    // Create user
    user := &model.User{
        Email:        req.Email,
        PasswordHash: passwordHash,
        Name:         req.Name,
        Role:         model.RoleUser, // Default role
    }

    if err := s.repo.User.Create(user); err != nil {
        return nil, err
    }

    // Generate access token
    accessToken, err := util.GenerateAccessToken(
        user.ID,
        user.Email,
        string(user.Role),
        s.jwtSecret,
        s.jwtExpiry,
    )
    if err != nil {
        return nil, err
    }

    return &dto.AuthResponse{
        AccessToken: accessToken,
        User: dto.UserResponse{
            ID:    user.ID,
            Email: user.Email,
            Name:  user.Name,
            Role:  string(user.Role),
        },
    }, nil
}

func (s *authService) Login(req *dto.LoginRequest) (*dto.AuthResponse, error) {
    // Find user by email
    user, err := s.repo.User.FindByEmail(req.Email)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("invalid credentials")
        }
        return nil, err
    }

    // Check password
    if !util.CheckPassword(req.Password, user.PasswordHash) {
        return nil, errors.New("invalid credentials")
    }

    // Generate access token
    accessToken, err := util.GenerateAccessToken(
        user.ID,
        user.Email,
        string(user.Role),
        s.jwtSecret,
        s.jwtExpiry,
    )
    if err != nil {
        return nil, err
    }

    return &dto.AuthResponse{
        AccessToken: accessToken,
        User: dto.UserResponse{
            ID:    user.ID,
            Email: user.Email,
            Name:  user.Name,
            Role:  string(user.Role),
        },
    }, nil
}
