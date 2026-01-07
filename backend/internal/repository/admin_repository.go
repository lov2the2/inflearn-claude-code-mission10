package repository

import (
    "start-kit-backend/internal/model"

    "gorm.io/gorm"
)

type AdminRepository interface {
    ListUsers(offset, limit int, search, role string) ([]model.User, int64, error)
    GetAllUsers() ([]model.User, error)
    UpdateRole(userID uint, role model.UserRole) error
    UpsertUser(user *model.User) (created bool, err error)
    Delete(userID uint) error
}

type adminRepository struct {
    db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) AdminRepository {
    return &adminRepository{db: db}
}

func (r *adminRepository) ListUsers(offset, limit int, search, role string) ([]model.User, int64, error) {
    var users []model.User
    var total int64

    // Build query with filters
    query := r.db.Model(&model.User{})

    // Apply search filter (name or email)
    if search != "" {
        query = query.Where("name ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
    }

    // Apply role filter
    if role != "" {
        query = query.Where("role = ?", role)
    }

    // Count total users with filters
    if err := query.Count(&total).Error; err != nil {
        return nil, 0, err
    }

    // Get paginated users with filters
    if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
        return nil, 0, err
    }

    return users, total, nil
}

func (r *adminRepository) GetAllUsers() ([]model.User, error) {
    var users []model.User
    if err := r.db.Find(&users).Error; err != nil {
        return nil, err
    }
    return users, nil
}

func (r *adminRepository) UpdateRole(userID uint, role model.UserRole) error {
    return r.db.Model(&model.User{}).
        Where("id = ?", userID).
        Update("role", role).Error
}

func (r *adminRepository) UpsertUser(user *model.User) (created bool, err error) {
    // Check if user exists by email
    var existing model.User
    result := r.db.Where("email = ?", user.Email).First(&existing)

    if result.Error == gorm.ErrRecordNotFound {
        // User doesn't exist, create new
        if err := r.db.Create(user).Error; err != nil {
            return false, err
        }
        return true, nil
    } else if result.Error != nil {
        // Other error occurred
        return false, result.Error
    }

    // User exists, update name and role
    if err := r.db.Model(&existing).Updates(map[string]interface{}{
        "name": user.Name,
        "role": user.Role,
    }).Error; err != nil {
        return false, err
    }

    return false, nil
}

func (r *adminRepository) Delete(userID uint) error {
    return r.db.Delete(&model.User{}, userID).Error
}
