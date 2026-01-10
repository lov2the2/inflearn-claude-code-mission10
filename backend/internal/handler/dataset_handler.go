package handler

import (
    "net/http"

    "start-kit-backend/internal/apperror"
    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/middleware"
    "start-kit-backend/internal/service"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

type DatasetHandler struct {
    service service.DatasetService
}

func NewDatasetHandler(service service.DatasetService) *DatasetHandler {
    return &DatasetHandler{
        service: service,
    }
}

// UploadCSV godoc
// @Summary Upload CSV file
// @Description Upload CSV file and create dataset with dynamic table
// @Tags datasets
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "CSV file to upload"
// @Param display_name formData string true "Dataset display name"
// @Param description formData string false "Dataset description"
// @Success 201 {object} dto.SuccessResponse{data=dto.DatasetResponse}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /api/v1/datasets/upload [post]
func (h *DatasetHandler) UploadCSV(c *gin.Context) {
    userID := middleware.GetUserID(c)

    // Parse multipart form
    if err := c.Request.ParseMultipartForm(52 << 20); err != nil { // 52MB max
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("file too large"))
        return
    }

    // Get file
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("file is required"))
        return
    }

    // Get metadata
    displayName := c.PostForm("display_name")
    if displayName == "" {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("display_name is required"))
        return
    }

    description := c.PostForm("description")

    req := &dto.CreateDatasetRequest{
        DisplayName: displayName,
        Description: description,
    }

    // Validate request
    if err := c.ShouldBind(req); err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err.Error()))
        return
    }

    // Process upload
    dataset, err := h.service.UploadCSV(userID, file, req)
    if err != nil {
        if appErr, ok := err.(*apperror.AppError); ok {
            c.JSON(appErr.StatusCode, dto.NewAppErrorResponse(appErr))
        } else {
            c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        }
        return
    }

    c.JSON(http.StatusCreated, dto.NewSuccessResponse(dataset, "Dataset uploaded successfully"))
}

// ListDatasets godoc
// @Summary List datasets
// @Description Get paginated list of user's datasets
// @Tags datasets
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} dto.SuccessResponse{data=dto.DatasetListResponse}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /api/v1/datasets [get]
func (h *DatasetHandler) ListDatasets(c *gin.Context) {
    userID := middleware.GetUserID(c)

    var params dto.DatasetListRequest
    if err := c.ShouldBindQuery(&params); err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err.Error()))
        return
    }

    datasets, err := h.service.ListDatasets(userID, &params)
    if err != nil {
        if appErr, ok := err.(*apperror.AppError); ok {
            c.JSON(appErr.StatusCode, dto.NewAppErrorResponse(appErr))
        } else {
            c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        }
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(datasets, ""))
}

// GetDataset godoc
// @Summary Get dataset details
// @Description Get dataset metadata and column information
// @Tags datasets
// @Produce json
// @Param id path string true "Dataset ID (UUID)"
// @Success 200 {object} dto.SuccessResponse{data=dto.DatasetResponse}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /api/v1/datasets/{id} [get]
func (h *DatasetHandler) GetDataset(c *gin.Context) {
    userID := middleware.GetUserID(c)

    idStr := c.Param("id")
    id, err := uuid.Parse(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("invalid dataset ID"))
        return
    }

    dataset, err := h.service.GetDataset(userID, id)
    if err != nil {
        if appErr, ok := err.(*apperror.AppError); ok {
            c.JSON(appErr.StatusCode, dto.NewAppErrorResponse(appErr))
        } else {
            c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        }
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(dataset, ""))
}

// GetDatasetData godoc
// @Summary Get dataset data
// @Description Get paginated data rows from dataset
// @Tags datasets
// @Produce json
// @Param id path string true "Dataset ID (UUID)"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(50)
// @Success 200 {object} dto.SuccessResponse{data=dto.DatasetDataResponse}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /api/v1/datasets/{id}/data [get]
func (h *DatasetHandler) GetDatasetData(c *gin.Context) {
    userID := middleware.GetUserID(c)

    idStr := c.Param("id")
    id, err := uuid.Parse(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("invalid dataset ID"))
        return
    }

    var params dto.DatasetDataRequest
    if err := c.ShouldBindQuery(&params); err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err.Error()))
        return
    }

    data, err := h.service.GetDatasetData(userID, id, &params)
    if err != nil {
        if appErr, ok := err.(*apperror.AppError); ok {
            c.JSON(appErr.StatusCode, dto.NewAppErrorResponse(appErr))
        } else {
            c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        }
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(data, ""))
}

// DeleteDataset godoc
// @Summary Delete dataset
// @Description Delete dataset and its associated table
// @Tags datasets
// @Produce json
// @Param id path string true "Dataset ID (UUID)"
// @Success 200 {object} dto.SuccessResponse{data=nil}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security BearerAuth
// @Router /api/v1/datasets/{id} [delete]
func (h *DatasetHandler) DeleteDataset(c *gin.Context) {
    userID := middleware.GetUserID(c)

    idStr := c.Param("id")
    id, err := uuid.Parse(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("invalid dataset ID"))
        return
    }

    if err := h.service.DeleteDataset(userID, id); err != nil {
        if appErr, ok := err.(*apperror.AppError); ok {
            c.JSON(appErr.StatusCode, dto.NewAppErrorResponse(appErr))
        } else {
            c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        }
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(nil, "Dataset deleted successfully"))
}
