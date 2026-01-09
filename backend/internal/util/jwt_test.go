package util

import (
    "testing"
    "time"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestGenerateAccessToken(t *testing.T) {
    // Setup
    secret := "test_secret_key_for_testing"
    userID := uint(1)
    email := "test@example.com"
    role := "user"
    expiry := 15 * time.Minute

    // Execute
    token, err := GenerateAccessToken(userID, email, role, secret, expiry)

    // Assert
    require.NoError(t, err)
    assert.NotEmpty(t, token)

    // Verify token can be validated
    claims, err := ValidateToken(token, secret)
    assert.NoError(t, err)
    assert.Equal(t, userID, claims.UserID)
    assert.Equal(t, email, claims.Email)
    assert.Equal(t, role, claims.Role)
}

func TestGenerateRefreshToken(t *testing.T) {
    // Execute
    token, err := GenerateRefreshToken()

    // Assert
    require.NoError(t, err)
    assert.NotEmpty(t, token)
    assert.Greater(t, len(token), 40) // Base64 encoded 32 bytes should be longer than 40 chars
}

func TestGenerateRefreshToken_Uniqueness(t *testing.T) {
    // Generate two tokens
    token1, err1 := GenerateRefreshToken()
    token2, err2 := GenerateRefreshToken()

    // Assert
    require.NoError(t, err1)
    require.NoError(t, err2)
    assert.NotEqual(t, token1, token2) // Should be unique due to random generation
}

func TestValidateToken_ValidToken(t *testing.T) {
    // Setup
    secret := "test_secret_key_for_testing"
    userID := uint(123)
    email := "user@example.com"
    role := "admin"
    expiry := 15 * time.Minute

    token, err := GenerateAccessToken(userID, email, role, secret, expiry)
    require.NoError(t, err)

    // Execute
    claims, err := ValidateToken(token, secret)

    // Assert
    assert.NoError(t, err)
    assert.Equal(t, userID, claims.UserID)
    assert.Equal(t, email, claims.Email)
    assert.Equal(t, role, claims.Role)
}

func TestValidateToken_InvalidToken(t *testing.T) {
    // Setup
    secret := "test_secret_key_for_testing"
    invalidToken := "invalid.token.string"

    // Execute
    claims, err := ValidateToken(invalidToken, secret)

    // Assert
    assert.Error(t, err)
    assert.Nil(t, claims)
}

func TestValidateToken_WrongSecret(t *testing.T) {
    // Setup
    userID := uint(1)
    email := "test@example.com"
    role := "user"
    expiry := 15 * time.Minute

    // Generate with secret 1
    secret1 := "secret_key_1"
    token, err := GenerateAccessToken(userID, email, role, secret1, expiry)
    require.NoError(t, err)

    // Try to validate with secret 2
    secret2 := "secret_key_2"
    claims, err := ValidateToken(token, secret2)

    // Assert
    assert.Error(t, err) // Should fail with different secret
    assert.Nil(t, claims)
}

func TestValidateToken_ExpiredToken(t *testing.T) {
    // Setup
    secret := "test_secret_key_for_testing"
    userID := uint(1)
    email := "test@example.com"
    role := "user"
    expiry := -1 * time.Second // Negative expiry = immediately expired

    // Generate expired token
    token, err := GenerateAccessToken(userID, email, role, secret, expiry)
    require.NoError(t, err)

    // Execute
    claims, err := ValidateToken(token, secret)

    // Assert
    assert.Error(t, err)
    // JWT library returns different error format, just check it's an error
    assert.Nil(t, claims)
}

func TestTokenGeneration_Uniqueness(t *testing.T) {
    // Setup
    secret := "test_secret_key_for_testing"
    userID := uint(1)
    email := "test@example.com"
    role := "user"
    expiry := 15 * time.Minute

    // Generate two tokens for same user
    token1, err1 := GenerateAccessToken(userID, email, role, secret, expiry)
    time.Sleep(1 * time.Second) // Ensure different timestamps (1 second for IssuedAt precision)
    token2, err2 := GenerateAccessToken(userID, email, role, secret, expiry)

    // Assert
    require.NoError(t, err1)
    require.NoError(t, err2)
    assert.NotEqual(t, token1, token2) // Tokens should be different due to different IssuedAt
}

func TestJWTClaims_ExpiryValidation(t *testing.T) {
    // Setup
    secret := "test_secret_key_for_testing"
    userID := uint(1)
    email := "test@example.com"
    role := "user"
    expiry := 1 * time.Hour

    // Generate token
    token, err := GenerateAccessToken(userID, email, role, secret, expiry)
    require.NoError(t, err)

    // Validate immediately (should pass)
    claims, err := ValidateToken(token, secret)
    assert.NoError(t, err)
    assert.NotNil(t, claims)
    assert.True(t, claims.ExpiresAt.After(time.Now()))
}
