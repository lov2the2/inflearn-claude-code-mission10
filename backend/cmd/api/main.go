package main

import (
    "time"

    "start-kit-backend/internal/config"
    "start-kit-backend/internal/handler"
    "start-kit-backend/internal/middleware"
    "start-kit-backend/internal/model"
    "start-kit-backend/internal/repository"
    "start-kit-backend/internal/service"
    "start-kit-backend/pkg/database"
    "start-kit-backend/pkg/logger"

    "github.com/gin-gonic/gin"
    "github.com/rs/zerolog/log"

    swaggerFiles "github.com/swaggo/files"
    ginSwagger "github.com/swaggo/gin-swagger"
    _ "start-kit-backend/docs"  // Import generated docs
)

// @title Go + Next.js Starter Kit API
// @version 1.0
// @description API documentation for Go + Next.js Full-stack Starter Kit
// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
func main() {
    // Load configuration
    cfg := config.Load()

    // Initialize logger
    logger.Init(cfg.Server.Environment)
    log.Info().
        Str("environment", cfg.Server.Environment).
        Str("gin_mode", cfg.Server.GinMode).
        Msg("Starting application")

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
        log.Fatal().Err(err).Msg("Failed to connect to database")
    }

    log.Info().
        Str("host", cfg.Database.Host).
        Str("port", cfg.Database.Port).
        Str("database", cfg.Database.DBName).
        Msg("Database connection established")

    // Auto-migrate models
    if err := db.AutoMigrate(
        &model.User{},
        &model.RefreshToken{},
        &model.Activity{},
        &model.Session{},
        &model.Dataset{},
        &model.DatasetColumn{},
    ); err != nil {
        log.Fatal().Err(err).Msg("Failed to migrate database")
    }

    log.Info().Msg("Database migration completed")

    // Parse JWT expiry durations
    jwtExpiry, err := time.ParseDuration(cfg.JWT.AccessExpiry)
    if err != nil {
        log.Fatal().Err(err).Msg("Invalid JWT access expiry duration")
    }

    refreshTokenExpiry, err := time.ParseDuration(cfg.JWT.RefreshExpiry)
    if err != nil {
        log.Fatal().Err(err).Msg("Invalid JWT refresh expiry duration")
    }

    log.Info().
        Str("access_expiry", cfg.JWT.AccessExpiry).
        Str("refresh_expiry", cfg.JWT.RefreshExpiry).
        Msg("JWT configuration loaded")

    // Initialize layers
    // Option 1: Manual dependency injection (current approach)
    repo := repository.NewRepository(db)
    svc := service.NewService(repo, cfg.JWT.Secret, jwtExpiry, refreshTokenExpiry)
    h := handler.NewHandler(handler.HandlerConfig{
        Service:       svc,
        DB:            db,
        CookieConfig:  cfg.Cookie,
        AccessExpiry:  jwtExpiry,
        RefreshExpiry: refreshTokenExpiry,
    })

    // Option 2: Wire dependency injection (uncomment to use)
    // import wireDI "start-kit-backend/internal/wire"
    // h := wireDI.InitializeHandler(
    //     db,
    //     cfg,
    //     wireDI.JWTExpiry(jwtExpiry),
    //     wireDI.RefreshExpiry(refreshTokenExpiry),
    // )

    // Initialize Gin router
    router := gin.Default()

    // Apply Request ID middleware (should be early in the chain)
    router.Use(middleware.RequestID())

    // Apply CORS middleware
    router.Use(middleware.CORS(cfg.CORS.AllowedOrigins))

    // Health check routes
    router.GET("/health", h.Health.Health)
    router.GET("/ready", h.Health.Ready)

    // Swagger documentation route
    router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

    // API v1 routes
    v1 := router.Group("/api/v1")
    {
        // Auth routes (public)
        auth := v1.Group("/auth")
        {
            auth.POST("/register", h.Auth.Register)
            auth.POST("/login", h.Auth.Login)
            auth.POST("/refresh", h.Auth.Refresh)
            auth.POST("/logout", h.Auth.Logout)

            // Session management routes (protected)
            authProtected := auth.Group("")
            authProtected.Use(middleware.AuthRequired(cfg.JWT.Secret))
            {
                authProtected.GET("/sessions", h.Auth.GetSessions)
                authProtected.POST("/sessions/revoke", h.Auth.RevokeSession)
                authProtected.POST("/logout-all", h.Auth.LogoutAll)
            }
        }

        // User routes (protected)
        users := v1.Group("/users")
        users.Use(middleware.AuthRequired(cfg.JWT.Secret))
        users.Use(middleware.ActivityLogger(repo))
        {
            users.GET("/profile", h.User.GetProfile)
            users.GET("/activity", h.User.GetActivity)
            users.GET("/activity/login-trend", h.User.GetLoginTrend)
            users.GET("/activity/distribution", h.User.GetDistribution)
            users.GET("/activity/monthly-stats", h.User.GetMonthlyStats)
            users.GET("/stats", h.User.GetStats)
            users.PATCH("/profile", h.User.UpdateProfile)
            users.PATCH("/password", h.User.UpdatePassword)
         }

        // Admin routes (protected)
        admin := v1.Group("/admin")
        admin.Use(middleware.AuthRequired(cfg.JWT.Secret))
        admin.Use(middleware.RequireAdmin())
        admin.Use(middleware.ActivityLogger(repo))
        {
            admin.GET("/users", h.Admin.ListUsers)
            admin.POST("/users", h.Admin.CreateUser)
            admin.GET("/users/:id", h.Admin.GetUser)
            admin.PATCH("/users/:id/role", h.Admin.UpdateUserRole)
            admin.DELETE("/users/:id", h.Admin.DeleteUser)

            // CSV import/export routes
            admin.GET("/users/export", h.CSV.ExportUsersCSV)
            admin.POST("/users/import", h.CSV.ImportUsersCSV)
        }

        // Dataset routes (protected)
        datasets := v1.Group("/datasets")
        datasets.Use(middleware.AuthRequired(cfg.JWT.Secret))
        datasets.Use(middleware.ActivityLogger(repo))
        {
            // Admin only: Upload
            datasets.POST("/upload", middleware.RequireAdmin(), h.Dataset.UploadCSV)

            // User accessible
            datasets.GET("", h.Dataset.ListDatasets)
            datasets.GET("/:id", h.Dataset.GetDataset)
            datasets.GET("/:id/data", h.Dataset.GetDatasetData)

            // Admin only: Delete
            datasets.DELETE("/:id", middleware.RequireAdmin(), h.Dataset.DeleteDataset)
        }
    }

    // Start server
    port := ":" + cfg.Server.Port
    log.Info().
        Str("port", cfg.Server.Port).
        Str("environment", cfg.Server.Environment).
        Msg("Server starting")

    if err := router.Run(port); err != nil {
        log.Fatal().Err(err).Msg("Failed to start server")
    }
}
