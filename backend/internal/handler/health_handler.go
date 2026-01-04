package handler

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

type HealthHandler struct {
    db *gorm.DB
}

func NewHealthHandler(db *gorm.DB) *HealthHandler {
    return &HealthHandler{
        db: db,
    }
}

// Health godoc
// @Summary Health check
// @Description Check if the service is running
// @Tags health
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /health [get]
func (h *HealthHandler) Health(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "status":  "ok",
        "message": "Backend is running",
    })
}

// Ready godoc
// @Summary Readiness check
// @Description Check if the service is ready (database connection)
// @Tags health
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 503 {object} map[string]interface{}
// @Router /ready [get]
func (h *HealthHandler) Ready(c *gin.Context) {
    // Check database connection
    sqlDB, err := h.db.DB()
    if err != nil {
        c.JSON(http.StatusServiceUnavailable, gin.H{
            "status":  "error",
            "message": "Database connection error",
        })
        return
    }

    if err := sqlDB.Ping(); err != nil {
        c.JSON(http.StatusServiceUnavailable, gin.H{
            "status":  "error",
            "message": "Database ping failed",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "status":   "ok",
        "message":  "Service is ready",
        "database": "connected",
    })
}
