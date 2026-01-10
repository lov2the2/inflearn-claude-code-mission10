package dto

import (
    "time"

    "github.com/google/uuid"
)

// ====================
// Upload DTOs
// ====================

// CreateDatasetRequest represents CSV upload metadata
type CreateDatasetRequest struct {
    DisplayName string `json:"display_name" binding:"required,min=2,max=100"`
    Description string `json:"description" binding:"omitempty,max=500"`
}

// DatasetColumnInfo represents column metadata
type DatasetColumnInfo struct {
    ColumnName  string `json:"column_name"`
    DisplayName string `json:"display_name"`
    DataType    string `json:"data_type"`
    ColumnOrder int    `json:"column_order"`
    Nullable    bool   `json:"nullable"`
}

// DatasetResponse represents dataset metadata
type DatasetResponse struct {
    ID            uuid.UUID           `json:"id"`
    UserID        uint                `json:"user_id"`
    TableName     string              `json:"table_name"`
    DisplayName   string              `json:"display_name"`
    Description   string              `json:"description"`
    RowCount      int                 `json:"row_count"`
    FileSizeBytes int64               `json:"file_size_bytes"`
    Columns       []DatasetColumnInfo `json:"columns"`
    CreatedAt     time.Time           `json:"created_at"`
    UpdatedAt     time.Time           `json:"updated_at"`
}

// ====================
// List DTOs
// ====================

// DatasetListRequest represents query parameters for listing datasets
type DatasetListRequest struct {
    Page  int `form:"page,default=1" binding:"omitempty,min=1"`
    Limit int `form:"limit,default=10" binding:"omitempty,min=1,max=100"`
}

// DatasetListItem represents a dataset in list view
type DatasetListItem struct {
    ID            uuid.UUID `json:"id"`
    DisplayName   string    `json:"display_name"`
    Description   string    `json:"description"`
    RowCount      int       `json:"row_count"`
    FileSizeBytes int64     `json:"file_size_bytes"`
    ColumnCount   int       `json:"column_count"`
    CreatedAt     time.Time `json:"created_at"`
}

// DatasetListResponse represents paginated datasets
type DatasetListResponse struct {
    Data  []DatasetListItem `json:"data"`
    Total int64             `json:"total"`
    Page  int               `json:"page"`
    Limit int               `json:"limit"`
}

// ====================
// Data Query DTOs
// ====================

// DatasetDataRequest represents query parameters for dataset data
type DatasetDataRequest struct {
    Page  int `form:"page,default=1" binding:"omitempty,min=1"`
    Limit int `form:"limit,default=50" binding:"omitempty,min=1,max=1000"`
}

// DatasetDataResponse represents paginated dataset data
type DatasetDataResponse struct {
    Columns []DatasetColumnInfo      `json:"columns"`
    Rows    []map[string]interface{} `json:"rows"`
    Total   int64                    `json:"total"`
    Page    int                      `json:"page"`
    Limit   int                      `json:"limit"`
}

// ====================
// Join Query DTOs
// ====================

// JoinCondition represents a join condition between two columns
type JoinCondition struct {
    LeftColumn  string `json:"left_column" binding:"required"`
    Operator    string `json:"operator" binding:"required,oneof== != < > <= >="`
    RightColumn string `json:"right_column" binding:"required"`
}

// JoinQueryRequest represents a request to execute a join query
type JoinQueryRequest struct {
    LeftDatasetID  string          `json:"left_dataset_id" binding:"required,uuid"`
    RightDatasetID string          `json:"right_dataset_id" binding:"required,uuid"`
    JoinType       string          `json:"join_type" binding:"required,oneof=inner left right full"`
    Conditions     []JoinCondition `json:"conditions" binding:"required,min=1,dive"`
    SelectColumns  []string        `json:"select_columns" binding:"required,min=1"`
    Page           int             `json:"page" binding:"omitempty,min=1"`
    Limit          int             `json:"limit" binding:"omitempty,min=1,max=100"`
}

// JoinQueryResponse represents the result of a join query
type JoinQueryResponse struct {
    Columns     []DatasetColumnInfo      `json:"columns"`
    Rows        []map[string]interface{} `json:"rows"`
    Total       int64                    `json:"total"`
    Page        int                      `json:"page"`
    Limit       int                      `json:"limit"`
    QueryTimeMs int64                    `json:"query_time_ms"`
}
