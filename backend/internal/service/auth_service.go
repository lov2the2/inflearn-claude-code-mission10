package service

import (
    "errors"
    "time"

    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/model"
    "start-kit-backend/internal/repository"
    "start-kit-backend/internal/util"

    "gorm.io/gorm"
)

type AuthService interface {
    Register(req *dto.RegisterRequest) (*dto.AuthResponse, error)
    Login(req *dto.LoginRequest) (*dto.AuthResponse, error)
    Refresh(refreshToken string) (*dto.AuthResponse, error)
    Logout(refreshToken string) error
}

type authService struct {
    repo               *repository.Repository
    jwtSecret          string
    jwtExpiry          time.Duration
    refreshTokenExpiry time.Duration
}

func NewAuthService(repo *repository.Repository, jwtSecret string, jwtExpiry, refreshTokenExpiry time.Duration) AuthService {
    return &authService{
        repo:               repo,
        jwtSecret:          jwtSecret,
        jwtExpiry:          jwtExpiry,
        refreshTokenExpiry: refreshTokenExpiry,
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

    // Generate tokens
    return s.generateTokens(user)
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

    // Generate tokens
    return s.generateTokens(user)
}

func (s *authService) Refresh(refreshToken string) (*dto.AuthResponse, error) {
    // Find and validate refresh token
    token, err := s.repo.Token.FindByToken(refreshToken)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("invalid refresh token")
        }
        return nil, err
    }

    // Get user
    user, err := s.repo.User.FindByID(token.UserID)
    if err != nil {
        return nil, errors.New("user not found")
    }

    // Revoke old token
    if err := s.repo.Token.RevokeByToken(refreshToken); err != nil {
        return nil, err
    }

    // Generate new tokens
    return s.generateTokens(user)
}

func (s *authService) Logout(refreshToken string) error {
    // Revoke refresh token
    return s.repo.Token.RevokeByToken(refreshToken)
}

// Helper function to generate access and refresh tokens
func (s *authService) generateTokens(user *model.User) (*dto.AuthResponse, error) {
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

    // Generate refresh token
    refreshTokenStr, err := util.GenerateRefreshToken()
    if err != nil {
        return nil, err
    }

    // Save refresh token to database
    refreshToken := &model.RefreshToken{
        UserID:    user.ID,
        Token:     refreshTokenStr,
        ExpiresAt: time.Now().Add(s.refreshTokenExpiry),
    }

    if err := s.repo.Token.Create(refreshToken); err != nil {
        return nil, err
    }

    return &dto.AuthResponse{
        AccessToken:  accessToken,
        RefreshToken: refreshTokenStr,
        User: dto.UserResponse{
            ID:    user.ID,
            Email: user.Email,
            Name:  user.Name,
            Role:  string(user.Role),
        },
    }, nil
}
