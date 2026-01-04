package main

import (
    "log"
    "time"

    "starter-kit-backend/internal/config"
    "starter-kit-backend/internal/handler"
    "starter-kit-backend/internal/middleware"
    "starter-kit-backend/internal/model"
    "starter-kit-backend/internal/repository"
    "starter-kit-backend/internal/service"
    "starter-kit-backend/pkg/database"

    "github.com/gin-gonic/gin"
)

// @title Go + Next.js Starter Kit API
// @version 1.0
// @description API documentation for Go + Next.js Full-stack Starter Kit
// @host localhost:8080
// @BasePath /
func main() {
    // Load configuration
    cfg := config.Load()

    // Set Gin mode
    gin.SetMode(cfg.Server.GinMode)

    // Initialize database
    db, err := database.NewPostgresDB(database.Config{
        Host:     cfg.Database.Host,
        Port:     cfg.Database.Port,
        User:     cfg.Database.User,
        Password: cfg.Database.Password,
        DBName:   cfg.Database.DBName,
        SSLMode:  cfg.Database.SSLMode,
    })
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }

    // Auto-migrate models
    if err := db.AutoMigrate(&model.User{}); err != nil {
        log.Fatalf("Failed to migrate database: %v", err)
    }

    // Parse JWT expiry duration
    jwtExpiry, err := time.ParseDuration(cfg.JWT.AccessExpiry)
    if err != nil {
        log.Fatalf("Invalid JWT expiry duration: %v", err)
    }

    // Initialize layers
    repo := repository.NewRepository(db)
    svc := service.NewService(repo, cfg.JWT.Secret, jwtExpiry)
    h := handler.NewHandler(svc, db)

    // Initialize Gin router
    router := gin.Default()

    // Apply CORS middleware
    router.Use(middleware.CORS(cfg.CORS.AllowedOrigins))

    // Health check routes
    router.GET("/health", h.Health.Health)
    router.GET("/ready", h.Health.Ready)

    // API v1 routes
    v1 := router.Group("/api/v1")
    {
        // Auth routes (public)
        auth := v1.Group("/auth")
        {
            auth.POST("/register", h.Auth.Register)
            auth.POST("/login", h.Auth.Login)
        }
    }

    // Start server
    port := ":" + cfg.Server.Port
    log.Printf("Server starting on port %s", port)
    if err := router.Run(port); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}
