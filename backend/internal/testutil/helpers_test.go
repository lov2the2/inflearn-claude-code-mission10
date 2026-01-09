package testutil

import (
    "testing"

    "github.com/stretchr/testify/assert"

    "start-kit-backend/internal/model"
)

func TestSetupMockDB(t *testing.T) {
    // Execute
    db, mock, cleanup := SetupMockDB(t)
    defer cleanup()

    // Assert
    assert.NotNil(t, db)
    assert.NotNil(t, mock)

    // Verify database connection
    sqlDB, err := db.DB()
    assert.NoError(t, err)
    assert.NotNil(t, sqlDB)
}

func TestCreateTestUser(t *testing.T) {
    // Execute
    user := CreateTestUser("test@example.com", "hashed_password", model.RoleUser)

    // Assert
    assert.NotNil(t, user)
    assert.Equal(t, uint(1), user.ID)
    assert.Equal(t, "test@example.com", user.Email)
    assert.Equal(t, "hashed_password", user.PasswordHash)
    assert.Equal(t, "Test User", user.Name)
    assert.Equal(t, model.RoleUser, user.Role)
    assert.False(t, user.CreatedAt.IsZero())
    assert.False(t, user.UpdatedAt.IsZero())
}

func TestCreateTestUser_AdminRole(t *testing.T) {
    // Execute
    user := CreateTestUser("admin@example.com", "hashed_pass", model.RoleAdmin)

    // Assert
    assert.Equal(t, model.RoleAdmin, user.Role)
}

func TestCreateTestRefreshToken(t *testing.T) {
    // Execute
    token := CreateTestRefreshToken(1, "test_token_string")

    // Assert
    assert.NotNil(t, token)
    assert.Equal(t, uint(1), token.ID)
    assert.Equal(t, uint(1), token.UserID)
    assert.Equal(t, "test_token_string", token.Token)
    assert.False(t, token.ExpiresAt.IsZero())
    assert.False(t, token.CreatedAt.IsZero())
    assert.True(t, token.ExpiresAt.After(token.CreatedAt))
}
