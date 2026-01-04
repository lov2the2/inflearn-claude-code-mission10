package util

import (
    "errors"
    "time"

    "github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
    UserID uint   `json:"user_id"`
    Email  string `json:"email"`
    Role   string `json:"role"`
    jwt.RegisteredClaims
}

var (
    ErrInvalidToken = errors.New("invalid token")
    ErrExpiredToken = errors.New("token has expired")
)

// GenerateAccessToken creates a new JWT access token
func GenerateAccessToken(userID uint, email, role, secret string, expiry time.Duration) (string, error) {
    claims := JWTClaims{
        UserID: userID,
        Email:  email,
        Role:   role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}

// ValidateToken validates and parses a JWT token
func ValidateToken(tokenString, secret string) (*JWTClaims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, ErrInvalidToken
        }
        return []byte(secret), nil
    })

    if err != nil {
        return nil, err
    }

    claims, ok := token.Claims.(*JWTClaims)
    if !ok || !token.Valid {
        return nil, ErrInvalidToken
    }

    if claims.ExpiresAt != nil && claims.ExpiresAt.Before(time.Now()) {
        return nil, ErrExpiredToken
    }

    return claims, nil
}
