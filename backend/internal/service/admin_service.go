package service

import (
    "crypto/rand"
    "errors"
    "math/big"

    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/model"
    "start-kit-backend/internal/repository"
    "start-kit-backend/internal/util"
)

type AdminService interface {
    ListUsers(params *dto.ListUsersRequest) (*dto.ListUsersResponse, error)
    GetUser(userID uint) (*dto.UserDetailResponse, error)
    CreateUser(req *dto.CreateUserRequest) (*dto.CreateUserResponse, error)
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

    // Get users from repository with search and role filter
    users, total, err := s.repo.Admin.ListUsers(offset, params.Limit, params.Search, params.Role)
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

func (s *adminService) CreateUser(req *dto.CreateUserRequest) (*dto.CreateUserResponse, error) {
    // Check if user already exists
    existingUser, _ := s.repo.User.FindByEmail(req.Email)
    if existingUser != nil {
        return nil, errors.New("user with this email already exists")
    }

    var passwordHash string
    var generatedPassword string

    // Generate password if not provided
    if req.Password == "" {
        password, err := generate_random_password(12)
        if err != nil {
            return nil, err
        }
        generatedPassword = password
        hash, err := util.HashPassword(password)
        if err != nil {
            return nil, err
        }
        passwordHash = hash
    } else {
        hash, err := util.HashPassword(req.Password)
        if err != nil {
            return nil, err
        }
        passwordHash = hash
    }

    // Create user model
    user := &model.User{
        Email:        req.Email,
        Name:         req.Name,
        PasswordHash: passwordHash,
        Role:         model.UserRole(req.Role),
    }

    // Create user in database
    if err := s.repo.User.Create(user); err != nil {
        return nil, err
    }

    // Prepare response
    response := &dto.CreateUserResponse{
        User: dto.UserResponse{
            ID:    user.ID,
            Email: user.Email,
            Name:  user.Name,
            Role:  string(user.Role),
        },
    }

    if generatedPassword != "" {
        response.GeneratedPassword = generatedPassword
    }

    return response, nil
}

func generate_random_password(length int) (string, error) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    password := make([]byte, length)

    for i := range password {
        num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
        if err != nil {
            return "", err
        }
        password[i] = charset[num.Int64()]
    }

    return string(password), nil
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
