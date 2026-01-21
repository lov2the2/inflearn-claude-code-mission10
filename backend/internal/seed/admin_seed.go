package seed

import (
    "start-kit-backend/internal/model"
    "start-kit-backend/internal/util"

    "github.com/rs/zerolog/log"
    "gorm.io/gorm"
)

// AdminSeedConfig holds the configuration for admin seed
type AdminSeedConfig struct {
    Email    string
    Password string
    Name     string
}

// SeedAdmin creates the initial admin user if not exists
// This is idempotent - it will skip if admin already exists or config is empty
func SeedAdmin(db *gorm.DB, cfg AdminSeedConfig) error {
    // Skip if any required config is missing
    if cfg.Email == "" || cfg.Password == "" || cfg.Name == "" {
        log.Info().Msg("Admin seed skipped: missing configuration (ADMIN_EMAIL, ADMIN_PASSWORD, or ADMIN_NAME)")
        return nil
    }

    // Check if user with this email already exists
    var existingUser model.User
    result := db.Where("email = ?", cfg.Email).First(&existingUser)
    if result.Error == nil {
        // User exists
        log.Info().
            Str("email", cfg.Email).
            Str("role", string(existingUser.Role)).
            Msg("Admin user already exists, skipping seed")
        return nil
    }

    // If error is not "record not found", return the error
    if result.Error != gorm.ErrRecordNotFound {
        log.Error().Err(result.Error).Msg("Failed to check existing admin user")
        return result.Error
    }

    // Hash password
    hashedPassword, err := util.HashPassword(cfg.Password)
    if err != nil {
        log.Error().Err(err).Msg("Failed to hash admin password")
        return err
    }

    // Create admin user
    adminUser := &model.User{
        Email:        cfg.Email,
        PasswordHash: hashedPassword,
        Name:         cfg.Name,
        Role:         model.RoleAdmin,
    }

    if err := db.Create(adminUser).Error; err != nil {
        log.Error().Err(err).Msg("Failed to create admin user")
        return err
    }

    log.Info().
        Str("email", cfg.Email).
        Str("name", cfg.Name).
        Msg("Initial admin user created successfully")

    return nil
}
