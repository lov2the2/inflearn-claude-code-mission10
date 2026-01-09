package config

import (
    "log"
    "os"

    "github.com/joho/godotenv"
)

type Config struct {
    Server   ServerConfig
    Database DatabaseConfig
    JWT      JWTConfig
    CORS     CORSConfig
    Cookie   CookieConfig
}

type ServerConfig struct {
    Port    string
    GinMode string
}

type DatabaseConfig struct {
    Host     string
    Port     string
    User     string
    Password string
    DBName   string
    SSLMode  string
}

type JWTConfig struct {
    Secret       string
    AccessExpiry string
    RefreshExpiry string
}

type CORSConfig struct {
    AllowedOrigins string
}

type CookieConfig struct {
    Secure bool
    Domain string
}

func Load() *Config {
    // Load .env file if it exists
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found, using environment variables")
    }

    return &Config{
        Server: ServerConfig{
            Port:    getEnv("PORT", "8080"),
            GinMode: getEnv("GIN_MODE", "debug"),
        },
        Database: DatabaseConfig{
            Host:     getEnv("DB_HOST", "localhost"),
            Port:     getEnv("DB_PORT", "5432"),
            User:     getEnv("DB_USER", "postgres"),
            Password: getEnv("DB_PASSWORD", "postgres"),
            DBName:   getEnv("DB_NAME", "starter_kit"),
            SSLMode:  getEnv("DB_SSLMODE", "disable"),
        },
        JWT: JWTConfig{
            Secret:        getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
            AccessExpiry:  getEnv("JWT_ACCESS_EXPIRY", "15m"),
            RefreshExpiry: getEnv("JWT_REFRESH_EXPIRY", "168h"),
        },
        CORS: CORSConfig{
            AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:3000"),
        },
        Cookie: CookieConfig{
            Secure: getEnv("COOKIE_SECURE", "false") == "true",
            Domain: getEnv("COOKIE_DOMAIN", "localhost"),
        },
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
