package dto

// PaginatedResponse represents a generic paginated response structure
// Used for standardizing pagination across all API endpoints
type PaginatedResponse[T any] struct {
    Data  T     `json:"data"`
    Total int64 `json:"total"`
    Page  int   `json:"page"`
    Limit int   `json:"limit"`
}

// NewPaginatedResponse creates a new paginated response
func NewPaginatedResponse[T any](data T, total int64, page int, limit int) PaginatedResponse[T] {
    return PaginatedResponse[T]{
        Data:  data,
        Total: total,
        Page:  page,
        Limit: limit,
    }
}
