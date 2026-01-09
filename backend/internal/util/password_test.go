package util

import (
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestHashPassword(t *testing.T) {
    // Test password hashing
    password := "password123"

    hash, err := HashPassword(password)

    assert.NoError(t, err)
    assert.NotEmpty(t, hash)
    assert.NotEqual(t, password, hash) // Hash should be different from plain password
    assert.Greater(t, len(hash), 50)   // bcrypt hash should be reasonably long
}

func TestHashPassword_EmptyPassword(t *testing.T) {
    // Test with empty password
    hash, err := HashPassword("")

    assert.NoError(t, err) // bcrypt allows empty passwords
    assert.NotEmpty(t, hash)
}

func TestCheckPassword_Success(t *testing.T) {
    // Test password verification with correct password
    password := "password123"
    hash, err := HashPassword(password)
    require.NoError(t, err)

    result := CheckPassword(password, hash)

    assert.True(t, result)
}

func TestCheckPassword_WrongPassword(t *testing.T) {
    // Test password verification with wrong password
    password := "password123"
    wrongPassword := "wrong_password"

    hash, err := HashPassword(password)
    require.NoError(t, err)

    result := CheckPassword(wrongPassword, hash)

    assert.False(t, result)
}

func TestCheckPassword_InvalidHash(t *testing.T) {
    // Test password verification with invalid hash
    password := "password123"
    invalidHash := "invalid_hash"

    result := CheckPassword(password, invalidHash)

    assert.False(t, result)
}

func TestHashPassword_Consistency(t *testing.T) {
    // Test that same password generates different hashes (salt randomness)
    password := "password123"

    hash1, err1 := HashPassword(password)
    hash2, err2 := HashPassword(password)

    assert.NoError(t, err1)
    assert.NoError(t, err2)
    assert.NotEqual(t, hash1, hash2) // Different salts should produce different hashes

    // Both hashes should verify the password
    assert.True(t, CheckPassword(password, hash1))
    assert.True(t, CheckPassword(password, hash2))
}
