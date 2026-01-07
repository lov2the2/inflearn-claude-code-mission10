package handler

import (
    "net/http"
    "strconv"

    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/middleware"
    "start-kit-backend/internal/model"
    "start-kit-backend/internal/service"

    "github.com/gin-gonic/gin"
)

type AdminHandler struct {
    adminService service.AdminService
}

func NewAdminHandler(adminService service.AdminService) *AdminHandler {
    return &AdminHandler{
        adminService: adminService,
    }
}

// ListUsers godoc
// @Summary List all users (admin only)
// @Description Get paginated list of all users
// @Tags admin
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Security BearerAuth
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Router /api/v1/admin/users [get]
func (h *AdminHandler) ListUsers(c *gin.Context) {
    var params dto.ListUsersRequest
    if err := c.ShouldBindQuery(&params); err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err.Error()))
        return
    }

    // Set defaults if not provided
    if params.Page == 0 {
        params.Page = 1
    }
    if params.Limit == 0 {
        params.Limit = 10
    }

    response, err := h.adminService.ListUsers(&params)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(response, "Users retrieved successfully"))
}

// GetUser godoc
// @Summary Get user details (admin only)
// @Description Get detailed information about a specific user
// @Tags admin
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Security BearerAuth
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /api/v1/admin/users/{id} [get]
func (h *AdminHandler) GetUser(c *gin.Context) {
    userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("invalid user ID"))
        return
    }

    user, err := h.adminService.GetUser(uint(userID))
    if err != nil {
        c.JSON(http.StatusNotFound, dto.NewErrorResponse("user not found"))
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(user, "User retrieved successfully"))
}

// UpdateUserRole godoc
// @Summary Update user role (admin only)
// @Description Change the role of a specific user
// @Tags admin
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param request body dto.UpdateUserRoleRequest true "Role update request"
// @Security BearerAuth
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 409 {object} dto.ErrorResponse
// @Router /api/v1/admin/users/{id}/role [patch]
func (h *AdminHandler) UpdateUserRole(c *gin.Context) {
    userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("invalid user ID"))
        return
    }

    var req dto.UpdateUserRoleRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err.Error()))
        return
    }

    // Get current admin's ID from context
    adminID := middleware.GetUserID(c)

    // Update role
    err = h.adminService.UpdateUserRole(uint(userID), model.UserRole(req.Role), adminID)
    if err != nil {
        if err.Error() == "cannot modify your own role" {
            c.JSON(http.StatusConflict, dto.NewErrorResponse(err.Error()))
            return
        }
        c.JSON(http.StatusNotFound, dto.NewErrorResponse("user not found"))
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(nil, "User role updated successfully"))
}

// CreateUser godoc
// @Summary Create new user (admin only)
// @Description Create a new user with optional password generation
// @Tags admin
// @Accept json
// @Produce json
// @Param request body dto.CreateUserRequest true "User creation request"
// @Security BearerAuth
// @Success 201 {object} dto.SuccessResponse{data=dto.CreateUserResponse}
// @Failure 400 {object} dto.ErrorResponse
// @Failure 409 {object} dto.ErrorResponse
// @Router /api/v1/admin/users [post]
func (h *AdminHandler) CreateUser(c *gin.Context) {
    var req dto.CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse(err.Error()))
        return
    }

    response, err := h.adminService.CreateUser(&req)
    if err != nil {
        if err.Error() == "user with this email already exists" {
            c.JSON(http.StatusConflict, dto.NewErrorResponse(err.Error()))
            return
        }
        c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error()))
        return
    }

    c.JSON(http.StatusCreated, dto.NewSuccessResponse(response, "User created successfully"))
}

// DeleteUser godoc
// @Summary Delete user (admin only)
// @Description Soft delete a specific user
// @Tags admin
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Security BearerAuth
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 409 {object} dto.ErrorResponse
// @Router /api/v1/admin/users/{id} [delete]
func (h *AdminHandler) DeleteUser(c *gin.Context) {
    userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, dto.NewErrorResponse("invalid user ID"))
        return
    }

    // Get current admin's ID from context
    adminID := middleware.GetUserID(c)

    // Delete user
    err = h.adminService.DeleteUser(uint(userID), adminID)
    if err != nil {
        if err.Error() == "cannot delete your own account" {
            c.JSON(http.StatusConflict, dto.NewErrorResponse(err.Error()))
            return
        }
        c.JSON(http.StatusNotFound, dto.NewErrorResponse("user not found"))
        return
    }

    c.JSON(http.StatusOK, dto.NewSuccessResponse(nil, "User deleted successfully"))
}
