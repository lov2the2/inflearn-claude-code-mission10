package repository

import (
    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/model"
    "time"

    "gorm.io/gorm"
)

type ActivityRepository interface {
    Create(activity *model.Activity) error
    FindByUserID(userID uint, page, limit int) ([]model.Activity, int64, error)
    GetLoginCount(userID uint) (int, error)
    GetLastLogin(userID uint) (time.Time, error)
    GetTotalActions(userID uint) (int, error)
    GetLoginTrend(userID uint, days int) ([]dto.LoginTrendDataPoint, error)
    GetDistribution(userID uint) ([]dto.ActivityDistributionData, error)
    GetMonthlyStats(userID uint, months int) ([]dto.MonthlyStatData, error)
}

type activityRepository struct {
    db *gorm.DB
}

func NewActivityRepository(db *gorm.DB) ActivityRepository {
    return &activityRepository{db: db}
}

func (r *activityRepository) Create(activity *model.Activity) error {
    return r.db.Create(activity).Error
}

func (r *activityRepository) FindByUserID(userID uint, page, limit int) ([]model.Activity, int64, error) {
    var activities []model.Activity
    var total int64

    offset := (page - 1) * limit

    err := r.db.Model(&model.Activity{}).
        Where("user_id = ?", userID).
        Count(&total).Error
    if err != nil {
        return nil, 0, err
    }

    err = r.db.Where("user_id = ?", userID).
        Order("created_at DESC").
        Limit(limit).
        Offset(offset).
        Find(&activities).Error

    return activities, total, err
}

func (r *activityRepository) GetLoginCount(userID uint) (int, error) {
    var count int64
    err := r.db.Model(&model.Activity{}).
        Where("user_id = ? AND action IN (?)", userID, []string{"login", "token_refresh"}).
        Count(&count).Error
    return int(count), err
}

func (r *activityRepository) GetLastLogin(userID uint) (time.Time, error) {
    var activity model.Activity
    err := r.db.Where("user_id = ? AND action = ?", userID, "login").
        Order("created_at DESC").
        First(&activity).Error
    if err != nil {
        return time.Time{}, err
    }
    return activity.CreatedAt, nil
}

func (r *activityRepository) GetTotalActions(userID uint) (int, error) {
    var count int64
    err := r.db.Model(&model.Activity{}).
        Where("user_id = ?", userID).
        Count(&count).Error
    return int(count), err
}

func (r *activityRepository) GetLoginTrend(userID uint, days int) ([]dto.LoginTrendDataPoint, error) {
    var results []dto.LoginTrendDataPoint

    query := `
        SELECT
            DATE(created_at) as date,
            COUNT(*) as logins
        FROM activities
        WHERE user_id = $1
            AND action IN ('login', 'token_refresh')
            AND created_at >= NOW() - INTERVAL '1 day' * $2
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    `

    err := r.db.Raw(query, userID, days).Scan(&results).Error
    return results, err
}

func (r *activityRepository) GetDistribution(userID uint) ([]dto.ActivityDistributionData, error) {
    var results []dto.ActivityDistributionData

    query := `
        SELECT
            action,
            COUNT(*) as count
        FROM activities
        WHERE user_id = $1
        GROUP BY action
        ORDER BY count DESC
    `

    err := r.db.Raw(query, userID).Scan(&results).Error
    return results, err
}

func (r *activityRepository) GetMonthlyStats(userID uint, months int) ([]dto.MonthlyStatData, error) {
    var results []dto.MonthlyStatData

    query := `
        SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
            COUNT(CASE WHEN action IN ('login', 'token_refresh') THEN 1 END) as logins,
            COUNT(*) as actions
        FROM activities
        WHERE user_id = $1
            AND created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' * $2
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
    `

    err := r.db.Raw(query, userID, months-1).Scan(&results).Error
    return results, err
}
