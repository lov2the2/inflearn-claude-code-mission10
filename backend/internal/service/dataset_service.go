package service

import (
    "encoding/csv"
    "encoding/json"
    "fmt"
    "io"
    "mime/multipart"
    "regexp"
    "strconv"
    "strings"
    "time"

    "start-kit-backend/internal/apperror"
    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/model"
    "start-kit-backend/internal/repository"
    "start-kit-backend/internal/util"

    "github.com/google/uuid"
)

type DatasetService interface {
    UploadCSV(userID uint, file *multipart.FileHeader, req *dto.CreateDatasetRequest) (*dto.DatasetResponse, error)
    ListDatasets(userID uint, params *dto.DatasetListRequest) (*dto.DatasetListResponse, error)
    GetDataset(userID uint, id uuid.UUID) (*dto.DatasetResponse, error)
    GetDatasetData(userID uint, id uuid.UUID, params *dto.DatasetDataRequest) (*dto.DatasetDataResponse, error)
    DeleteDataset(userID uint, id uuid.UUID) error
    ExecuteJoinQuery(userID uint, req *dto.JoinQueryRequest) (*dto.JoinQueryResponse, error)
}

type datasetService struct {
    repo *repository.Repository
}

func NewDatasetService(repo *repository.Repository) DatasetService {
    return &datasetService{repo: repo}
}

const (
    max_file_size_mb = 50
    max_file_size    = max_file_size_mb * 1024 * 1024 // 50MB
    max_row_count    = 100000
    batch_size       = 500
)

// UploadCSV processes CSV file and creates dataset
func (s *datasetService) UploadCSV(userID uint, fileHeader *multipart.FileHeader, req *dto.CreateDatasetRequest) (*dto.DatasetResponse, error) {
    // Validate file size
    if fileHeader.Size > max_file_size {
        return nil, apperror.Validation(fmt.Sprintf("file size exceeds %dMB limit", max_file_size_mb))
    }

    // Open file
    file, err := fileHeader.Open()
    if err != nil {
        return nil, apperror.Internal("failed to open file")
    }
    defer file.Close()

    // Parse CSV
    reader := csv.NewReader(file)
    reader.TrimLeadingSpace = true

    // Read header
    headers, err := reader.Read()
    if err != nil {
        return nil, apperror.Validation("invalid CSV format: missing header")
    }

    if len(headers) == 0 {
        return nil, apperror.Validation("CSV must have at least one column")
    }

    // Sanitize and validate column names
    sanitizedHeaders := make([]string, len(headers))
    for i, header := range headers {
        sanitized := sanitize_column_name(header)
        if sanitized == "" {
            return nil, apperror.Validation(fmt.Sprintf("invalid column name at position %d: '%s'", i+1, header))
        }
        sanitizedHeaders[i] = sanitized
    }

    // Check for duplicate column names
    if has_duplicates(sanitizedHeaders) {
        return nil, apperror.Validation("duplicate column names detected after sanitization")
    }

    // Read all rows
    var rows [][]string
    for {
        record, err := reader.Read()
        if err == io.EOF {
            break
        }
        if err != nil {
            return nil, apperror.Validation("invalid CSV format")
        }

        if len(record) != len(headers) {
            return nil, apperror.Validation("inconsistent column count in CSV rows")
        }

        rows = append(rows, record)

        if len(rows) > max_row_count {
            return nil, apperror.Validation(fmt.Sprintf("file exceeds maximum row count of %d", max_row_count))
        }
    }

    if len(rows) == 0 {
        return nil, apperror.Validation("CSV must contain at least one data row")
    }

    // Infer column types
    columns := make([]model.DatasetColumn, len(sanitizedHeaders))
    for i, header := range sanitizedHeaders {
        dataType := infer_data_type(rows, i)
        columns[i] = model.DatasetColumn{
            ColumnName:  header,
            DisplayName: headers[i], // Keep original display name
            DataType:    string(dataType),
            ColumnOrder: i,
            Nullable:    true,
        }
    }

    // Generate unique table name
    baseTableName := sanitize_table_name(req.DisplayName)
    datasetID := uuid.New()
    tableName := fmt.Sprintf("ds_%s_%s", baseTableName, strings.ReplaceAll(datasetID.String(), "-", "")[:8])

    // Create dataset metadata
    dataset := &model.Dataset{
        ID:               datasetID,
        UserID:           userID,
        DynamicTableName: tableName,
        DisplayName:      req.DisplayName,
        Description:      req.Description,
        RowCount:         len(rows),
        FileSizeBytes:    fileHeader.Size,
    }

    // Set dataset_id for all columns
    for i := range columns {
        columns[i].DatasetID = dataset.ID
    }

    // Execute in transaction
    err = s.repo.WithTransaction(func(txRepo *repository.Repository) error {
        // Create dataset metadata
        if err := txRepo.Dataset.Create(dataset); err != nil {
            return apperror.Internal("failed to create dataset metadata")
        }

        // Create column metadata
        if err := txRepo.Dataset.CreateColumns(columns); err != nil {
            return apperror.Internal("failed to create column metadata")
        }

        // Create dynamic table
        if err := txRepo.Dataset.CreateDynamicTable(tableName, columns); err != nil {
            return apperror.Internal("failed to create dataset table")
        }

        // Insert data in batches
        for i := 0; i < len(rows); i += batch_size {
            end := i + batch_size
            if end > len(rows) {
                end = len(rows)
            }

            batch := rows[i:end]
            batchData := make([][]interface{}, len(batch))

            for j, row := range batch {
                rowData := make([]interface{}, len(columns))
                for k, col := range columns {
                    rowData[k] = convert_value(row[k], model.ColumnDataType(col.DataType))
                }
                batchData[j] = rowData
            }

            if err := txRepo.Dataset.InsertBatchData(tableName, columns, batchData); err != nil {
                return apperror.Internal("failed to insert data")
            }
        }

        return nil
    })

    if err != nil {
        return nil, err
    }

    // Fetch created dataset with columns
    createdDataset, err := s.repo.Dataset.FindByID(dataset.ID)
    if err != nil {
        return nil, apperror.Internal("failed to fetch created dataset")
    }

    return convert_to_dataset_response(createdDataset), nil
}

// ListDatasets returns paginated datasets for a user
func (s *datasetService) ListDatasets(userID uint, params *dto.DatasetListRequest) (*dto.DatasetListResponse, error) {
    datasets, total, err := s.repo.Dataset.FindByUserID(userID, params.Page, params.Limit)
    if err != nil {
        return nil, apperror.Internal("failed to fetch datasets")
    }

    items := make([]dto.DatasetListItem, len(datasets))
    for i, ds := range datasets {
        items[i] = dto.DatasetListItem{
            ID:            ds.ID,
            DisplayName:   ds.DisplayName,
            Description:   ds.Description,
            RowCount:      ds.RowCount,
            FileSizeBytes: ds.FileSizeBytes,
            ColumnCount:   len(ds.Columns),
            CreatedAt:     ds.CreatedAt,
        }
    }

    response := dto.NewPaginatedResponse(items, total, params.Page, params.Limit)
    return &response, nil
}

// GetDataset returns dataset metadata
func (s *datasetService) GetDataset(userID uint, id uuid.UUID) (*dto.DatasetResponse, error) {
    dataset, err := s.repo.Dataset.FindByID(id)
    if err != nil {
        return nil, apperror.NotFound("dataset not found")
    }

    if dataset.UserID != userID {
        return nil, apperror.Forbidden("access denied")
    }

    return convert_to_dataset_response(dataset), nil
}

// GetDatasetData returns paginated dataset data with optional filtering and sorting
func (s *datasetService) GetDatasetData(userID uint, id uuid.UUID, params *dto.DatasetDataRequest) (*dto.DatasetDataResponse, error) {
    dataset, err := s.repo.Dataset.FindByID(id)
    if err != nil {
        return nil, apperror.NotFound("dataset not found")
    }

    if dataset.UserID != userID {
        return nil, apperror.Forbidden("access denied")
    }

    // Parse filters from JSON string
    var filters []dto.FilterCondition
    if params.Filters != "" {
        if err := json.Unmarshal([]byte(params.Filters), &filters); err != nil {
            return nil, apperror.Validation("invalid filters format")
        }
    }

    // Use FilterQueryBuilder for advanced queries
    if len(filters) > 0 || params.SortBy != "" {
        filter_builder := util.NewFilterQueryBuilder(dataset.DynamicTableName, dataset.Columns)

        // Build and execute query
        query, query_params, err := filter_builder.BuildDataQuery(
            dataset.Columns,
            filters,
            params.SortBy,
            params.SortOrder,
            params.Page,
            params.Limit,
        )
        if err != nil {
            return nil, err
        }

        // Build and execute count query
        count_query, count_params, err := filter_builder.BuildCountQuery(filters)
        if err != nil {
            return nil, err
        }

        rows, total, err := s.repo.Dataset.GetTableDataWithQuery(query, count_query, query_params, count_params, dataset.Columns)
        if err != nil {
            return nil, apperror.Internal("failed to fetch dataset data")
        }

        columns := make([]dto.DatasetColumnInfo, len(dataset.Columns))
        for i, col := range dataset.Columns {
            columns[i] = dto.DatasetColumnInfo{
                ColumnName:  col.ColumnName,
                DisplayName: col.DisplayName,
                DataType:    col.DataType,
                ColumnOrder: col.ColumnOrder,
                Nullable:    col.Nullable,
            }
        }

        return &dto.DatasetDataResponse{
            Columns: columns,
            Rows:    rows,
            Total:   total,
            Page:    params.Page,
            Limit:   params.Limit,
        }, nil
    }

    // Fall back to simple query without filters
    rows, total, err := s.repo.Dataset.GetTableData(dataset.DynamicTableName, dataset.Columns, params.Page, params.Limit)
    if err != nil {
        return nil, apperror.Internal("failed to fetch dataset data")
    }

    columns := make([]dto.DatasetColumnInfo, len(dataset.Columns))
    for i, col := range dataset.Columns {
        columns[i] = dto.DatasetColumnInfo{
            ColumnName:  col.ColumnName,
            DisplayName: col.DisplayName,
            DataType:    col.DataType,
            ColumnOrder: col.ColumnOrder,
            Nullable:    col.Nullable,
        }
    }

    return &dto.DatasetDataResponse{
        Columns: columns,
        Rows:    rows,
        Total:   total,
        Page:    params.Page,
        Limit:   params.Limit,
    }, nil
}

// DeleteDataset removes dataset and its table
func (s *datasetService) DeleteDataset(userID uint, id uuid.UUID) error {
    dataset, err := s.repo.Dataset.FindByID(id)
    if err != nil {
        return apperror.NotFound("dataset not found")
    }

    if dataset.UserID != userID {
        return apperror.Forbidden("access denied")
    }

    // Delete in transaction
    err = s.repo.WithTransaction(func(txRepo *repository.Repository) error {
        // Drop dynamic table
        if err := txRepo.Dataset.DropDynamicTable(dataset.DynamicTableName); err != nil {
            return apperror.Internal("failed to drop dataset table")
        }

        // Delete metadata (cascade deletes columns)
        if err := txRepo.Dataset.Delete(id); err != nil {
            return apperror.Internal("failed to delete dataset metadata")
        }

        return nil
    })

    return err
}

// Helper functions

func sanitize_column_name(name string) string {
    // Remove whitespace and convert to lowercase
    name = strings.TrimSpace(name)
    name = strings.ToLower(name)

    // Replace spaces and special chars with underscore
    reg := regexp.MustCompile(`[^a-z0-9_]+`)
    name = reg.ReplaceAllString(name, "_")

    // Remove leading/trailing underscores
    name = strings.Trim(name, "_")

    // Ensure starts with letter
    if len(name) > 0 && name[0] >= '0' && name[0] <= '9' {
        name = "col_" + name
    }

    return name
}

func sanitize_table_name(name string) string {
    // Similar to column sanitization
    name = strings.TrimSpace(name)
    name = strings.ToLower(name)
    reg := regexp.MustCompile(`[^a-z0-9_]+`)
    name = reg.ReplaceAllString(name, "_")
    name = strings.Trim(name, "_")

    if len(name) == 0 {
        name = "dataset"
    }

    // Limit length
    if len(name) > 20 {
        name = name[:20]
    }

    return name
}

func has_duplicates(arr []string) bool {
    seen := make(map[string]bool)
    for _, val := range arr {
        if seen[val] {
            return true
        }
        seen[val] = true
    }
    return false
}

func infer_data_type(rows [][]string, colIndex int) model.ColumnDataType {
    // Sample first 100 rows for type inference
    sampleSize := 100
    if len(rows) < sampleSize {
        sampleSize = len(rows)
    }

    isInteger := true
    isNumeric := true
    isBoolean := true
    isTimestamp := true

    for i := 0; i < sampleSize; i++ {
        val := strings.TrimSpace(rows[i][colIndex])
        if val == "" {
            continue // Skip empty values
        }

        // Check integer
        if _, err := strconv.ParseInt(val, 10, 64); err != nil {
            isInteger = false
        }

        // Check numeric
        if _, err := strconv.ParseFloat(val, 64); err != nil {
            isNumeric = false
        }

        // Check boolean
        lower := strings.ToLower(val)
        if lower != "true" && lower != "false" && lower != "t" && lower != "f" && lower != "1" && lower != "0" {
            isBoolean = false
        }

        // Check timestamp
        if !try_parse_timestamp(val) {
            isTimestamp = false
        }
    }

    // Priority: boolean > integer > numeric > timestamp > text
    if isBoolean {
        return model.DataTypeBoolean
    }
    if isInteger {
        return model.DataTypeInteger
    }
    if isNumeric {
        return model.DataTypeNumeric
    }
    if isTimestamp {
        return model.DataTypeTimestamp
    }

    return model.DataTypeText
}

func try_parse_timestamp(val string) bool {
    formats := []string{
        time.RFC3339,
        "2006-01-02 15:04:05",
        "2006-01-02",
        "01/02/2006",
        "02-01-2006",
    }

    for _, format := range formats {
        if _, err := time.Parse(format, val); err == nil {
            return true
        }
    }
    return false
}

func convert_value(val string, dataType model.ColumnDataType) interface{} {
    val = strings.TrimSpace(val)
    if val == "" {
        return nil
    }

    switch dataType {
    case model.DataTypeInteger:
        if v, err := strconv.ParseInt(val, 10, 64); err == nil {
            return v
        }
    case model.DataTypeNumeric:
        if v, err := strconv.ParseFloat(val, 64); err == nil {
            return v
        }
    case model.DataTypeBoolean:
        lower := strings.ToLower(val)
        return lower == "true" || lower == "t" || lower == "1"
    case model.DataTypeTimestamp:
        formats := []string{
            time.RFC3339,
            "2006-01-02 15:04:05",
            "2006-01-02",
            "01/02/2006",
            "02-01-2006",
        }
        for _, format := range formats {
            if t, err := time.Parse(format, val); err == nil {
                return t
            }
        }
    }

    return val
}

func convert_to_dataset_response(dataset *model.Dataset) *dto.DatasetResponse {
    columns := make([]dto.DatasetColumnInfo, len(dataset.Columns))
    for i, col := range dataset.Columns {
        columns[i] = dto.DatasetColumnInfo{
            ColumnName:  col.ColumnName,
            DisplayName: col.DisplayName,
            DataType:    col.DataType,
            ColumnOrder: col.ColumnOrder,
            Nullable:    col.Nullable,
        }
    }

    return &dto.DatasetResponse{
        ID:            dataset.ID,
        UserID:        dataset.UserID,
        TableName:     dataset.DynamicTableName,
        DisplayName:   dataset.DisplayName,
        Description:   dataset.Description,
        RowCount:      dataset.RowCount,
        FileSizeBytes: dataset.FileSizeBytes,
        Columns:       columns,
        CreatedAt:     dataset.CreatedAt,
        UpdatedAt:     dataset.UpdatedAt,
    }
}

// ExecuteJoinQuery executes a multi-table join query
func (s *datasetService) ExecuteJoinQuery(userID uint, req *dto.JoinQueryRequest) (*dto.JoinQueryResponse, error) {
    start_time := time.Now()

    // Set default pagination
    if req.Page == 0 {
        req.Page = 1
    }
    if req.Limit == 0 {
        req.Limit = 50
    }

    // Parse base dataset ID
    base_id, err := uuid.Parse(req.BaseDatasetID)
    if err != nil {
        return nil, apperror.Validation("invalid base_dataset_id")
    }

    // Fetch base dataset
    base_dataset, err := s.repo.Dataset.FindByID(base_id)
    if err != nil {
        return nil, apperror.NotFound("base dataset not found")
    }

    // Verify ownership
    if base_dataset.UserID != userID {
        return nil, apperror.Forbidden("access denied to base dataset")
    }

    // Collect all datasets (base + join tables)
    all_datasets := []*model.Dataset{base_dataset}
    all_column_maps := make([]map[string]model.DatasetColumn, 0, len(req.JoinTables)+1)

    // Build base column map
    base_column_map := make(map[string]model.DatasetColumn)
    for _, col := range base_dataset.Columns {
        base_column_map[col.ColumnName] = col
    }
    all_column_maps = append(all_column_maps, base_column_map)

    // Fetch and validate all join datasets
    for i, join_table := range req.JoinTables {
        join_id, err := uuid.Parse(join_table.DatasetID)
        if err != nil {
            return nil, apperror.Validation(fmt.Sprintf("invalid dataset_id for join table %d", i+1))
        }

        join_dataset, err := s.repo.Dataset.FindByID(join_id)
        if err != nil {
            return nil, apperror.NotFound(fmt.Sprintf("join dataset %d not found", i+1))
        }

        if join_dataset.UserID != userID {
            return nil, apperror.Forbidden(fmt.Sprintf("access denied to join dataset %d", i+1))
        }

        all_datasets = append(all_datasets, join_dataset)

        // Build column map for this dataset
        join_column_map := make(map[string]model.DatasetColumn)
        for _, col := range join_dataset.Columns {
            join_column_map[col.ColumnName] = col
        }
        all_column_maps = append(all_column_maps, join_column_map)
    }

    // Build result column metadata by checking all datasets
    result_columns := make([]model.DatasetColumn, 0, len(req.SelectColumns))
    for _, col_name := range req.SelectColumns {
        found := false
        for _, col_map := range all_column_maps {
            if col, exists := col_map[col_name]; exists {
                result_columns = append(result_columns, col)
                found = true
                break
            }
        }
        if !found {
            return nil, apperror.Validation(fmt.Sprintf("column '%s' not found in any dataset", col_name))
        }
    }

    // Create MultiTableQueryBuilder
    builder := util.NewMultiTableQueryBuilder()
    for _, ds := range all_datasets {
        builder.AddTable(ds.DynamicTableName, ds.Columns)
    }

    // Convert DTO join configs to builder format
    join_configs := make([]util.JoinConfig, len(req.JoinTables))
    for i, jt := range req.JoinTables {
        join_configs[i] = util.JoinConfig{
            JoinType:   jt.JoinType,
            Conditions: jt.Conditions,
        }
    }

    // Build join query
    join_query, err := builder.BuildMultiJoinQuery(
        join_configs,
        req.SelectColumns,
        req.Page,
        req.Limit,
    )
    if err != nil {
        return nil, err
    }

    // Build count query
    count_query, err := builder.BuildMultiJoinCountQuery(join_configs)
    if err != nil {
        return nil, err
    }

    // Execute count query
    total, err := s.repo.Dataset.CountJoinQuery(count_query)
    if err != nil {
        return nil, apperror.Internal("failed to count join results")
    }

    // Execute join query
    rows, err := s.repo.Dataset.ExecuteJoinQuery(join_query, result_columns)
    if err != nil {
        return nil, apperror.Internal("failed to execute join query")
    }

    // Build response columns
    response_columns := make([]dto.DatasetColumnInfo, len(result_columns))
    for i, col := range result_columns {
        response_columns[i] = dto.DatasetColumnInfo{
            ColumnName:  col.ColumnName,
            DisplayName: col.DisplayName,
            DataType:    col.DataType,
            ColumnOrder: col.ColumnOrder,
            Nullable:    col.Nullable,
        }
    }

    // Calculate query time
    query_time_ms := time.Since(start_time).Milliseconds()

    return &dto.JoinQueryResponse{
        Columns:     response_columns,
        Rows:        rows,
        Total:       total,
        Page:        req.Page,
        Limit:       req.Limit,
        QueryTimeMs: query_time_ms,
    }, nil
}
