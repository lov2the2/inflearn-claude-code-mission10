package handler

import (
    "fmt"
    "net/http"
    "path/filepath"
    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/service"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
)

type CSVHandler struct {
    csvService service.CSVService
}

func NewCSVHandler(csvService service.CSVService) *CSVHandler {
    return &CSVHandler{
        csvService: csvService,
    }
}

// ExportUsersCSV godoc
// @Summary Export users to CSV (admin only)
// @Description Download all users as CSV file
// @Tags admin
// @Produce text/csv
// @Security BearerAuth
// @Success 200 {file} file "CSV file"
// @Failure 403 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/admin/users/export [get]
func (h *CSVHandler) ExportUsersCSV(c *gin.Context) {
    // Call service to generate CSV
    csvData, err := h.csvService.ExportUsersToCSV()
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("failed to export users: "+err.Error()))
        return
    }

    // Generate filename with timestamp
    filename := fmt.Sprintf("users_export_%s.csv", time.Now().Format("2006-01-02_15-04-05"))

    // Set headers for file download
    c.Header("Content-Type", "text/csv; charset=utf-8")
    c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
    c.Header("Content-Length", fmt.Sprintf("%d", len(csvData)))

    // Write CSV data
    c.Data(http.StatusOK, "text/csv", csvData)
}

// ImportUsersCSV godoc
// @Summary Import users from CSV (admin only)
// @Description Bulk create or update users from CSV file
// @Tags admin
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "CSV file"
// @Security BearerAuth
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 413 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/admin/users/import [post]
func (h *CSVHandler) ImportUsersCSV(c *gin.Context) {
    // Parse multipart form
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("no file uploaded"))
        return
    }

    // Validate file size (max 10MB)
    const maxFileSize = 10 << 20 // 10 MB
    if file.Size > maxFileSize {
        c.JSON(http.StatusRequestEntityTooLarge, dto.NewErrorResponse("file size exceeds 10MB"))
        return
    }

    // Validate file extension
    ext := strings.ToLower(filepath.Ext(file.Filename))
    if ext != ".csv" {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("file must be CSV (.csv extension)"))
        return
    }

    // Read file content
    fileReader, err := file.Open()
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("failed to read file"))
        return
    }
    defer fileReader.Close()

    // Read file bytes
    csvData := make([]byte, file.Size)
    _, err = fileReader.Read(csvData)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse("failed to read file content"))
        return
    }

    // Call service to import users
    response, err := h.csvService.ImportUsersFromCSV(csvData)
    if err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("failed to import CSV: "+err.Error()))
        return
    }

    // Build message
    message := fmt.Sprintf("CSV import completed: %d successes, %d failures", response.SuccessCount, response.FailureCount)

    c.JSON(http.StatusOK, dto.NewSuccessResponse(response, message))
}
