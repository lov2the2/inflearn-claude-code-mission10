package util

import (
    "golang.org/x/crypto/bcrypt"
)

const bcryptCost = bcrypt.DefaultCost

// HashPassword generates a bcrypt hash from a plain password
func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
    if err != nil {
        return "", err
    }
    return string(bytes), nil
}

// CheckPassword compares a plain password with a hashed password
func CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
