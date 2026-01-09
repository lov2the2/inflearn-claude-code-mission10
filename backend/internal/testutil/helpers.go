package testutil

import (
    "testing"
    "time"

    "github.com/DATA-DOG/go-sqlmock"
    "github.com/stretchr/testify/require"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"

    "start-kit-backend/internal/model"
)

// SetupMockDB creates a mock database connection for testing
func SetupMockDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock, func()) {
    db, mock, err := sqlmock.New()
    require.NoError(t, err)

    dialector := postgres.New(postgres.Config{
        Conn:       db,
        DriverName: "postgres",
    })

    gormDB, err := gorm.Open(dialector, &gorm.Config{
        Logger: logger.Default.LogMode(logger.Silent),
    })
    require.NoError(t, err)

    cleanup := func() {
        sqlDB, _ := gormDB.DB()
        if sqlDB != nil {
            sqlDB.Close()
        }
    }

    return gormDB, mock, cleanup
}

// CreateTestUser creates a test user model
func CreateTestUser(email, passwordHash string, role model.UserRole) *model.User {
    return &model.User{
        ID:           1,
        Email:        email,
        PasswordHash: passwordHash,
        Name:         "Test User",
        Role:         role,
        CreatedAt:    time.Now(),
        UpdatedAt:    time.Now(),
    }
}

// CreateTestRefreshToken creates a test refresh token model
func CreateTestRefreshToken(userID uint, token string) *model.RefreshToken {
    return &model.RefreshToken{
        ID:        1,
        UserID:    userID,
        Token:     token,
        ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
        CreatedAt: time.Now(),
    }
}
