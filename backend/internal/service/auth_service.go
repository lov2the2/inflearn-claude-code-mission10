package service

import (
    "errors"
    "time"

    "start-kit-backend/internal/apperror"
    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/model"
    "start-kit-backend/internal/repository"
    "start-kit-backend/internal/util"

    "gorm.io/gorm"
)

type AuthService interface {
    Register(req *dto.RegisterRequest, userAgent, ipAddress string) (*dto.AuthResponse, error)
    Login(req *dto.LoginRequest, userAgent, ipAddress string) (*dto.AuthResponse, error)
    Refresh(refreshToken, userAgent, ipAddress string) (*dto.AuthResponse, error)
    Logout(refreshToken string) error
    GetUserSessions(userID uint, currentToken string) (*dto.SessionListResponse, error)
    RevokeSession(userID uint, sessionID string) error
    LogoutAll(userID uint) error
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

func (s *authService) Register(req *dto.RegisterRequest, userAgent, ipAddress string) (*dto.AuthResponse, error) {
    // Check if user already exists
    existingUser, err := s.repo.User.FindByEmail(req.Email)
    if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, apperror.Internal("failed to check existing user")
    }
    if existingUser != nil {
        return nil, apperror.Conflict("user with this email already exists")
    }

    // Hash password
    passwordHash, err := util.HashPassword(req.Password)
    if err != nil {
        return nil, apperror.Internal("failed to hash password")
    }

    // Create user and generate tokens within a transaction
    var authResponse *dto.AuthResponse
    err = s.repo.WithTransaction(func(txRepo *repository.Repository) error {
        // Create user
        user := &model.User{
            Email:        req.Email,
            PasswordHash: passwordHash,
            Name:         req.Name,
            Role:         model.RoleUser, // Default role
        }

        if err := txRepo.User.Create(user); err != nil {
            return apperror.Internal("failed to create user")
        }

        // Generate tokens and session (using transactional repository)
        response, err := s.generateTokensAndSessionWithRepo(txRepo, user, userAgent, ipAddress)
        if err != nil {
            return err
        }

        authResponse = response
        return nil
    })

    if err != nil {
        return nil, err
    }

    return authResponse, nil
}

func (s *authService) Login(req *dto.LoginRequest, userAgent, ipAddress string) (*dto.AuthResponse, error) {
    // Find user by email
    user, err := s.repo.User.FindByEmail(req.Email)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, apperror.Unauthorized("invalid credentials")
        }
        return nil, apperror.Internal("failed to find user")
    }

    // Check password
    if !util.CheckPassword(req.Password, user.PasswordHash) {
        return nil, apperror.Unauthorized("invalid credentials")
    }

    // Generate tokens and session
    return s.generateTokensAndSession(user, userAgent, ipAddress)
}

func (s *authService) Refresh(refreshToken, userAgent, ipAddress string) (*dto.AuthResponse, error) {
    // Find and validate session by refresh token
    session, err := s.repo.Session.GetSessionByToken(refreshToken)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, apperror.Unauthorized("invalid refresh token")
        }
        return nil, apperror.Internal("failed to validate refresh token")
    }

    // Get user
    user, err := s.repo.User.FindByID(session.UserID)
    if err != nil {
        return nil, apperror.NotFound("user not found")
    }

    // Revoke old session and generate new tokens within a transaction
    var authResponse *dto.AuthResponse
    err = s.repo.WithTransaction(func(txRepo *repository.Repository) error {
        // Revoke old session
        if err := txRepo.Session.RevokeSession(session.ID); err != nil {
            return apperror.Internal("failed to revoke old session")
        }

        // Generate new tokens and session
        response, err := s.generateTokensAndSessionWithRepo(txRepo, user, userAgent, ipAddress)
        if err != nil {
            return err
        }

        authResponse = response
        return nil
    })

    if err != nil {
        return nil, err
    }

    return authResponse, nil
}

func (s *authService) Logout(refreshToken string) error {
    // Find session by refresh token
    session, err := s.repo.Session.GetSessionByToken(refreshToken)
    if err != nil {
        return err
    }

    // Revoke session
    return s.repo.Session.RevokeSession(session.ID)
}

func (s *authService) GetUserSessions(userID uint, currentToken string) (*dto.SessionListResponse, error) {
    // Get all active sessions for user
    sessions, err := s.repo.Session.GetUserSessions(userID)
    if err != nil {
        return nil, apperror.Internal("failed to get user sessions")
    }

    // Convert to response format
    sessionResponses := make([]*dto.SessionResponse, 0, len(sessions))
    for _, session := range sessions {
        sessionResponses = append(sessionResponses, &dto.SessionResponse{
            ID:        session.ID,
            UserAgent: session.UserAgent,
            IPAddress: session.IPAddress,
            ExpiresAt: session.ExpiresAt,
            CreatedAt: session.CreatedAt,
            IsCurrent: session.RefreshToken == currentToken,
        })
    }

    return &dto.SessionListResponse{
        Sessions: sessionResponses,
    }, nil
}

func (s *authService) RevokeSession(userID uint, sessionID string) error {
    // Parse UUID
    sessionUUID, err := util.ParseUUID(sessionID)
    if err != nil {
        return apperror.Validation("invalid session ID")
    }

    // Get session to verify ownership
    session, err := s.repo.Session.GetSessionByToken("")
    if err == nil && session.UserID != userID {
        return apperror.Forbidden("cannot revoke session of another user")
    }

    // Revoke session
    return s.repo.Session.RevokeSession(sessionUUID)
}

func (s *authService) LogoutAll(userID uint) error {
    // Revoke all user sessions
    return s.repo.Session.RevokeAllUserSessions(userID)
}

// Helper function to generate access and refresh tokens with session using default repository
func (s *authService) generateTokensAndSession(user *model.User, userAgent, ipAddress string) (*dto.AuthResponse, error) {
    return s.generateTokensAndSessionWithRepo(s.repo, user, userAgent, ipAddress)
}

// Helper function to generate access and refresh tokens with session using custom repository (for transactions)
func (s *authService) generateTokensAndSessionWithRepo(repo *repository.Repository, user *model.User, userAgent, ipAddress string) (*dto.AuthResponse, error) {
    // Generate access token
    accessToken, err := util.GenerateAccessToken(
        user.ID,
        user.Email,
        string(user.Role),
        s.jwtSecret,
        s.jwtExpiry,
    )
    if err != nil {
        return nil, apperror.Internal("failed to generate access token")
    }

    // Generate refresh token
    refreshTokenStr, err := util.GenerateRefreshToken()
    if err != nil {
        return nil, apperror.Internal("failed to generate refresh token")
    }

    // Create session with refresh token
    session := &model.Session{
        UserID:       user.ID,
        RefreshToken: refreshTokenStr,
        UserAgent:    userAgent,
        IPAddress:    ipAddress,
        ExpiresAt:    time.Now().Add(s.refreshTokenExpiry),
    }

    if err := repo.Session.CreateSession(session); err != nil {
        return nil, apperror.Internal("failed to create session")
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
