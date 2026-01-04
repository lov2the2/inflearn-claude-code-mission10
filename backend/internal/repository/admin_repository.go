package repository

import (
    "start-kit-backend/internal/model"

    "gorm.io/gorm"
)

type AdminRepository interface {
    ListUsers(offset, limit int) ([]model.User, int64, error)
    UpdateRole(userID uint, role model.UserRole) error
    Delete(userID uint) error
}

type adminRepository struct {
    db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) AdminRepository {
    return &adminRepository{db: db}
}

func (r *adminRepository) ListUsers(offset, limit int) ([]model.User, int64, error) {
    var users []model.User
    var total int64

    // Count total users
    if err := r.db.Model(&model.User{}).Count(&total).Error; err != nil {
        return nil, 0, err
    }

    // Get paginated users
    if err := r.db.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
        return nil, 0, err
    }

    return users, total, nil
}

func (r *adminRepository) UpdateRole(userID uint, role model.UserRole) error {
    return r.db.Model(&model.User{}).
        Where("id = ?", userID).
        Update("role", role).Error
}

func (r *adminRepository) Delete(userID uint) error {
    return r.db.Delete(&model.User{}, userID).Error
}
