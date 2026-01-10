package model

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

// Dataset represents metadata for a user-uploaded CSV file
type Dataset struct {
    ID              uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    UserID          uint           `gorm:"not null;index" json:"user_id"`
    DynamicTableName string        `gorm:"column:table_name;uniqueIndex;not null;size:255" json:"table_name"`
    DisplayName     string         `gorm:"not null;size:255" json:"display_name"`
    Description     string         `gorm:"type:text" json:"description"`
    RowCount        int            `gorm:"not null;default:0" json:"row_count"`
    FileSizeBytes   int64          `gorm:"not null;default:0" json:"file_size_bytes"`
    CreatedAt       time.Time      `json:"created_at"`
    UpdatedAt       time.Time      `json:"updated_at"`
    DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

    // Associations
    User    User            `gorm:"foreignKey:UserID" json:"-"`
    Columns []DatasetColumn `gorm:"foreignKey:DatasetID" json:"columns,omitempty"`
}

func (Dataset) TableName() string {
    return "datasets"
}

// DatasetColumn represents metadata for a column in a dataset
type DatasetColumn struct {
    ID          uint      `gorm:"primaryKey" json:"id"`
    DatasetID   uuid.UUID `gorm:"type:uuid;not null;index" json:"dataset_id"`
    ColumnName  string    `gorm:"not null;size:255" json:"column_name"`
    DisplayName string    `gorm:"not null;size:255" json:"display_name"`
    DataType    string    `gorm:"not null;size:50" json:"data_type"`
    ColumnOrder int       `gorm:"not null" json:"column_order"`
    Nullable    bool      `gorm:"not null;default:true" json:"nullable"`
    CreatedAt   time.Time `json:"created_at"`

    // Associations
    Dataset Dataset `gorm:"foreignKey:DatasetID" json:"-"`
}

func (DatasetColumn) TableName() string {
    return "dataset_columns"
}

// ColumnDataType represents PostgreSQL data types for columns
type ColumnDataType string

const (
    DataTypeText      ColumnDataType = "text"
    DataTypeInteger   ColumnDataType = "integer"
    DataTypeNumeric   ColumnDataType = "numeric"
    DataTypeBoolean   ColumnDataType = "boolean"
    DataTypeTimestamp ColumnDataType = "timestamp"
)
