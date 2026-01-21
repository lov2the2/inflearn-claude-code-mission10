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
    DisplayName string `json:"displayName" binding:"required,min=2,max=100"`
    Description string `json:"description" binding:"omitempty,max=500"`
}

// DatasetColumnInfo represents column metadata
type DatasetColumnInfo struct {
    ColumnName  string `json:"columnName"`
    DisplayName string `json:"displayName"`
    DataType    string `json:"dataType"`
    ColumnOrder int    `json:"columnOrder"`
    Nullable    bool   `json:"nullable"`
}

// DatasetResponse represents dataset metadata
type DatasetResponse struct {
    ID            uuid.UUID           `json:"id"`
    UserID        uint                `json:"userId"`
    TableName     string              `json:"tableName"`
    DisplayName   string              `json:"displayName"`
    Description   string              `json:"description"`
    RowCount      int                 `json:"rowCount"`
    FileSizeBytes int64               `json:"fileSizeBytes"`
    Columns       []DatasetColumnInfo `json:"columns"`
    CreatedAt     time.Time           `json:"createdAt"`
    UpdatedAt     time.Time           `json:"updatedAt"`
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
    DisplayName   string    `json:"displayName"`
    Description   string    `json:"description"`
    RowCount      int       `json:"rowCount"`
    FileSizeBytes int64     `json:"fileSizeBytes"`
    ColumnCount   int       `json:"columnCount"`
    CreatedAt     time.Time `json:"createdAt"`
}

// DatasetListResponse represents paginated datasets
type DatasetListResponse = PaginatedResponse[[]DatasetListItem]

// ====================
// Data Query DTOs
// ====================

// FilterCondition represents a filter condition for data queries
type FilterCondition struct {
    Column   string `json:"column"`
    Operator string `json:"operator"` // =, !=, >, <, >=, <=, like
    Value    string `json:"value"`
}

// DatasetDataRequest represents query parameters for dataset data
type DatasetDataRequest struct {
    Page      int    `form:"page,default=1" binding:"omitempty,min=1"`
    Limit     int    `form:"limit,default=50" binding:"omitempty,min=1,max=1000"`
    SortBy    string `form:"sortBy" binding:"omitempty"`
    SortOrder string `form:"sortOrder" binding:"omitempty,oneof=asc desc"`
    Filters   string `form:"filters" binding:"omitempty"` // JSON encoded []FilterCondition
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
    LeftColumn  string `json:"leftColumn" binding:"required"`
    Operator    string `json:"operator" binding:"required,oneof== != < > <= >="`
    RightColumn string `json:"rightColumn" binding:"required"`
}

// JoinTableConfig represents configuration for joining a single table
type JoinTableConfig struct {
    DatasetID  string          `json:"datasetId" binding:"required,uuid"`
    JoinType   string          `json:"joinType" binding:"required,oneof=inner left right full cross"`
    Conditions []JoinCondition `json:"conditions" binding:"dive"` // Empty for CROSS JOIN
}

// JoinQueryRequest represents a request to execute a multi-table join query
// Supports up to 5 tables (1 base + 4 join tables)
type JoinQueryRequest struct {
    BaseDatasetID string            `json:"baseDatasetId" binding:"required,uuid"`
    JoinTables    []JoinTableConfig `json:"joinTables" binding:"required,min=1,max=4,dive"`
    SelectColumns []string          `json:"selectColumns" binding:"required,min=1"`
    Page          int               `json:"page" binding:"omitempty,min=1"`
    Limit         int               `json:"limit" binding:"omitempty,min=1,max=100"`
}

// JoinQueryResponse represents the result of a join query
type JoinQueryResponse struct {
    Columns     []DatasetColumnInfo      `json:"columns"`
    Rows        []map[string]interface{} `json:"rows"`
    Total       int64                    `json:"total"`
    Page        int                      `json:"page"`
    Limit       int                      `json:"limit"`
    QueryTimeMs int64                    `json:"queryTimeMs"`
}
