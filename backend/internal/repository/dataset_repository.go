package repository

import (
    "fmt"
    "strings"

    "start-kit-backend/internal/model"

    "github.com/google/uuid"
    "github.com/lib/pq"
    "gorm.io/gorm"
)

type DatasetRepository interface {
    // Metadata operations
    Create(dataset *model.Dataset) error
    FindByID(id uuid.UUID) (*model.Dataset, error)
    FindByUserID(userID uint, page, limit int) ([]model.Dataset, int64, error)
    Delete(id uuid.UUID) error
    CountColumns(datasetID uuid.UUID) (int, error)

    // Column operations
    CreateColumns(columns []model.DatasetColumn) error
    FindColumnsByDatasetID(datasetID uuid.UUID) ([]model.DatasetColumn, error)

    // Dynamic table operations
    CreateDynamicTable(tableName string, columns []model.DatasetColumn) error
    InsertBatchData(tableName string, columns []model.DatasetColumn, rows [][]interface{}) error
    GetTableData(tableName string, columns []model.DatasetColumn, page, limit int) ([]map[string]interface{}, int64, error)
    DropDynamicTable(tableName string) error

    // Join query operations
    ExecuteJoinQuery(query string, columns []model.DatasetColumn) ([]map[string]interface{}, error)
    CountJoinQuery(countQuery string) (int64, error)
}

type datasetRepository struct {
    db *gorm.DB
}

func NewDatasetRepository(db *gorm.DB) DatasetRepository {
    return &datasetRepository{db: db}
}

// Create inserts a new dataset metadata
func (r *datasetRepository) Create(dataset *model.Dataset) error {
    return r.db.Create(dataset).Error
}

// FindByID retrieves a dataset with its columns
func (r *datasetRepository) FindByID(id uuid.UUID) (*model.Dataset, error) {
    var dataset model.Dataset
    err := r.db.Preload("Columns", func(db *gorm.DB) *gorm.DB {
        return db.Order("column_order ASC")
    }).Where("id = ?", id).First(&dataset).Error
    if err != nil {
        return nil, err
    }
    return &dataset, nil
}

// FindByUserID retrieves datasets for a user with pagination
func (r *datasetRepository) FindByUserID(userID uint, page, limit int) ([]model.Dataset, int64, error) {
    var datasets []model.Dataset
    var total int64

    offset := (page - 1) * limit

    // Count total
    if err := r.db.Model(&model.Dataset{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
        return nil, 0, err
    }

    // Fetch datasets with columns
    err := r.db.Preload("Columns", func(db *gorm.DB) *gorm.DB {
        return db.Order("column_order ASC")
    }).Where("user_id = ?", userID).
        Order("created_at DESC").
        Offset(offset).
        Limit(limit).
        Find(&datasets).Error

    if err != nil {
        return nil, 0, err
    }

    return datasets, total, nil
}

// Delete soft-deletes a dataset
func (r *datasetRepository) Delete(id uuid.UUID) error {
    return r.db.Delete(&model.Dataset{}, "id = ?", id).Error
}

// CountColumns returns the number of columns for a dataset
func (r *datasetRepository) CountColumns(datasetID uuid.UUID) (int, error) {
    var count int64
    err := r.db.Model(&model.DatasetColumn{}).Where("dataset_id = ?", datasetID).Count(&count).Error
    return int(count), err
}

// CreateColumns inserts multiple columns
func (r *datasetRepository) CreateColumns(columns []model.DatasetColumn) error {
    if len(columns) == 0 {
        return nil
    }
    return r.db.Create(&columns).Error
}

// FindColumnsByDatasetID retrieves all columns for a dataset
func (r *datasetRepository) FindColumnsByDatasetID(datasetID uuid.UUID) ([]model.DatasetColumn, error) {
    var columns []model.DatasetColumn
    err := r.db.Where("dataset_id = ?", datasetID).Order("column_order ASC").Find(&columns).Error
    return columns, err
}

// CreateDynamicTable creates a table for storing dataset rows
func (r *datasetRepository) CreateDynamicTable(tableName string, columns []model.DatasetColumn) error {
    // Build CREATE TABLE statement
    var columnDefs []string
    columnDefs = append(columnDefs, "id SERIAL PRIMARY KEY")

    for _, col := range columns {
        colDef := fmt.Sprintf("%s %s", pq.QuoteIdentifier(col.ColumnName), col.DataType)
        if !col.Nullable {
            colDef += " NOT NULL"
        }
        columnDefs = append(columnDefs, colDef)
    }

    createSQL := fmt.Sprintf(
        "CREATE TABLE IF NOT EXISTS %s (%s)",
        pq.QuoteIdentifier(tableName),
        strings.Join(columnDefs, ", "),
    )

    return r.db.Exec(createSQL).Error
}

// InsertBatchData inserts rows into the dynamic table
func (r *datasetRepository) InsertBatchData(tableName string, columns []model.DatasetColumn, rows [][]interface{}) error {
    if len(rows) == 0 {
        return nil
    }

    // Build INSERT statement
    columnNames := make([]string, len(columns))
    for i, col := range columns {
        columnNames[i] = pq.QuoteIdentifier(col.ColumnName)
    }

    // Create placeholders
    valueStrings := make([]string, 0, len(rows))
    valueArgs := make([]interface{}, 0, len(rows)*len(columns))

    for i, row := range rows {
        placeholders := make([]string, len(columns))
        for j := range columns {
            placeholders[j] = fmt.Sprintf("$%d", i*len(columns)+j+1)
        }
        valueStrings = append(valueStrings, fmt.Sprintf("(%s)", strings.Join(placeholders, ", ")))
        valueArgs = append(valueArgs, row...)
    }

    insertSQL := fmt.Sprintf(
        "INSERT INTO %s (%s) VALUES %s",
        pq.QuoteIdentifier(tableName),
        strings.Join(columnNames, ", "),
        strings.Join(valueStrings, ", "),
    )

    return r.db.Exec(insertSQL, valueArgs...).Error
}

// GetTableData retrieves paginated data from the dynamic table
func (r *datasetRepository) GetTableData(tableName string, columns []model.DatasetColumn, page, limit int) ([]map[string]interface{}, int64, error) {
    offset := (page - 1) * limit

    // Count total rows
    var total int64
    countSQL := fmt.Sprintf("SELECT COUNT(*) FROM %s", pq.QuoteIdentifier(tableName))
    if err := r.db.Raw(countSQL).Scan(&total).Error; err != nil {
        return nil, 0, err
    }

    // Build SELECT statement
    columnNames := make([]string, len(columns))
    for i, col := range columns {
        columnNames[i] = pq.QuoteIdentifier(col.ColumnName)
    }

    selectSQL := fmt.Sprintf(
        "SELECT %s FROM %s ORDER BY id LIMIT %d OFFSET %d",
        strings.Join(columnNames, ", "),
        pq.QuoteIdentifier(tableName),
        limit,
        offset,
    )

    // Execute query
    rows, err := r.db.Raw(selectSQL).Rows()
    if err != nil {
        return nil, 0, err
    }
    defer rows.Close()

    // Parse results
    var result []map[string]interface{}
    for rows.Next() {
        // Create slice of interface{} for scanning
        values := make([]interface{}, len(columns))
        valuePtrs := make([]interface{}, len(columns))
        for i := range values {
            valuePtrs[i] = &values[i]
        }

        if err := rows.Scan(valuePtrs...); err != nil {
            return nil, 0, err
        }

        // Build map
        row := make(map[string]interface{})
        for i, col := range columns {
            row[col.ColumnName] = values[i]
        }
        result = append(result, row)
    }

    return result, total, nil
}

// DropDynamicTable deletes the dataset table
func (r *datasetRepository) DropDynamicTable(tableName string) error {
    dropSQL := fmt.Sprintf("DROP TABLE IF EXISTS %s", pq.QuoteIdentifier(tableName))
    return r.db.Exec(dropSQL).Error
}

// ExecuteJoinQuery executes a pre-built join query and returns results
func (r *datasetRepository) ExecuteJoinQuery(query string, columns []model.DatasetColumn) ([]map[string]interface{}, error) {
    // Execute query
    rows, err := r.db.Raw(query).Rows()
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    // Parse results
    var result []map[string]interface{}
    for rows.Next() {
        // Create slice of interface{} for scanning
        values := make([]interface{}, len(columns))
        valuePtrs := make([]interface{}, len(columns))
        for i := range values {
            valuePtrs[i] = &values[i]
        }

        if err := rows.Scan(valuePtrs...); err != nil {
            return nil, err
        }

        // Build map
        row := make(map[string]interface{})
        for i, col := range columns {
            row[col.ColumnName] = values[i]
        }
        result = append(result, row)
    }

    return result, nil
}

// CountJoinQuery executes a COUNT query for join results
func (r *datasetRepository) CountJoinQuery(countQuery string) (int64, error) {
    var total int64
    if err := r.db.Raw(countQuery).Scan(&total).Error; err != nil {
        return 0, err
    }
    return total, nil
}
