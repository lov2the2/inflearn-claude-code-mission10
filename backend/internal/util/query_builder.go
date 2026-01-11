package util

import (
    "fmt"
    "strings"

    "start-kit-backend/internal/apperror"
    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/model"

    "github.com/lib/pq"
)

// ====================
// Multi-Table Query Builder
// ====================

// TableInfo holds information about a table and its columns
type TableInfo struct {
    TableName string
    Alias     string
    Columns   map[string]model.DatasetColumn
}

// MultiTableQueryBuilder builds SQL queries for multi-table joins with SQL injection protection
type MultiTableQueryBuilder struct {
    tables            []TableInfo
    allowed_operators map[string]bool
    allowed_joins     map[string]bool
}

// NewMultiTableQueryBuilder creates a new query builder for multiple tables
func NewMultiTableQueryBuilder() *MultiTableQueryBuilder {
    return &MultiTableQueryBuilder{
        tables: make([]TableInfo, 0),
        allowed_operators: map[string]bool{
            "=":  true,
            "!=": true,
            "<":  true,
            ">":  true,
            "<=": true,
            ">=": true,
        },
        allowed_joins: map[string]bool{
            "INNER": true,
            "LEFT":  true,
            "RIGHT": true,
            "FULL":  true,
            "CROSS": true,
        },
    }
}

// AddTable adds a table to the query builder
func (b *MultiTableQueryBuilder) AddTable(table_name string, columns []model.DatasetColumn) {
    alias := fmt.Sprintf("t%d", len(b.tables))

    column_map := make(map[string]model.DatasetColumn)
    for _, col := range columns {
        column_map[col.ColumnName] = col
    }

    b.tables = append(b.tables, TableInfo{
        TableName: table_name,
        Alias:     alias,
        Columns:   column_map,
    })
}

// ValidateOperator checks if the operator is allowed
func (b *MultiTableQueryBuilder) ValidateOperator(operator string) error {
    if !b.allowed_operators[operator] {
        return apperror.Validation(fmt.Sprintf("operator '%s' is not allowed", operator))
    }
    return nil
}

// ValidateJoinType checks if the join type is allowed
func (b *MultiTableQueryBuilder) ValidateJoinType(join_type string) error {
    if !b.allowed_joins[strings.ToUpper(join_type)] {
        return apperror.Validation(fmt.Sprintf("join type '%s' is not allowed", join_type))
    }
    return nil
}

// FindColumnTable finds which table a column belongs to and returns the qualified name
func (b *MultiTableQueryBuilder) FindColumnTable(column_name string) (string, int, error) {
    for i, table := range b.tables {
        if _, exists := table.Columns[column_name]; exists {
            qualified := fmt.Sprintf("%s.%s",
                table.Alias,
                pq.QuoteIdentifier(column_name),
            )
            return qualified, i, nil
        }
    }
    return "", -1, apperror.Validation(fmt.Sprintf("column '%s' not found in any table", column_name))
}

// ValidateColumnInTable validates that a column exists in a specific table
func (b *MultiTableQueryBuilder) ValidateColumnInTable(column_name string, table_index int) (string, error) {
    if table_index < 0 || table_index >= len(b.tables) {
        return "", apperror.Validation(fmt.Sprintf("invalid table index: %d", table_index))
    }

    table := b.tables[table_index]
    if _, exists := table.Columns[column_name]; exists {
        return fmt.Sprintf("%s.%s",
            table.Alias,
            pq.QuoteIdentifier(column_name),
        ), nil
    }
    return "", apperror.Validation(fmt.Sprintf("column '%s' not found in table %s", column_name, table.TableName))
}

// JoinConfig represents a single join configuration
type JoinConfig struct {
    JoinType   string
    Conditions []dto.JoinCondition
}

// BuildMultiJoinQuery builds a multi-table JOIN query
func (b *MultiTableQueryBuilder) BuildMultiJoinQuery(
    join_configs []JoinConfig,
    select_columns []string,
    page int,
    limit int,
) (string, error) {
    if len(b.tables) < 2 {
        return "", apperror.Validation("at least 2 tables required for join")
    }

    if len(join_configs) != len(b.tables)-1 {
        return "", apperror.Validation("number of join configs must equal number of join tables")
    }

    // Build SELECT clause
    select_parts := make([]string, 0, len(select_columns))
    for _, col_name := range select_columns {
        qualified_col, _, err := b.FindColumnTable(col_name)
        if err != nil {
            return "", err
        }
        select_parts = append(select_parts, fmt.Sprintf("%s AS %s",
            qualified_col,
            pq.QuoteIdentifier(col_name),
        ))
    }

    // Build FROM clause with base table
    base_table := b.tables[0]
    from_clause := fmt.Sprintf("%s AS %s",
        pq.QuoteIdentifier(base_table.TableName),
        base_table.Alias,
    )

    // Build JOIN clauses
    join_clauses := make([]string, 0, len(join_configs))
    for i, config := range join_configs {
        join_table := b.tables[i+1]
        join_type := strings.ToUpper(config.JoinType)

        if err := b.ValidateJoinType(join_type); err != nil {
            return "", err
        }

        // Build ON clause
        if join_type == "CROSS" {
            // CROSS JOIN has no ON clause
            join_clauses = append(join_clauses, fmt.Sprintf(
                "CROSS JOIN %s AS %s",
                pq.QuoteIdentifier(join_table.TableName),
                join_table.Alias,
            ))
        } else {
            if len(config.Conditions) == 0 {
                return "", apperror.Validation(fmt.Sprintf("join conditions required for %s JOIN", join_type))
            }

            on_conditions := make([]string, 0, len(config.Conditions))
            for _, cond := range config.Conditions {
                if err := b.ValidateOperator(cond.Operator); err != nil {
                    return "", err
                }

                // Left column must be from previous tables (0 to i)
                left_qualified, left_idx, err := b.FindColumnTable(cond.LeftColumn)
                if err != nil {
                    return "", fmt.Errorf("left column validation failed: %w", err)
                }
                if left_idx > i {
                    return "", apperror.Validation(fmt.Sprintf("left column '%s' must be from base or previously joined tables", cond.LeftColumn))
                }

                // Right column must be from the joining table (i+1)
                right_qualified, err := b.ValidateColumnInTable(cond.RightColumn, i+1)
                if err != nil {
                    return "", fmt.Errorf("right column validation failed: %w", err)
                }

                on_conditions = append(on_conditions,
                    fmt.Sprintf("%s %s %s", left_qualified, cond.Operator, right_qualified),
                )
            }

            join_clauses = append(join_clauses, fmt.Sprintf(
                "%s JOIN %s AS %s ON %s",
                join_type,
                pq.QuoteIdentifier(join_table.TableName),
                join_table.Alias,
                strings.Join(on_conditions, " AND "),
            ))
        }
    }

    // Calculate pagination
    offset := (page - 1) * limit

    // Build final query
    query := fmt.Sprintf(
        "SELECT %s FROM %s %s ORDER BY %s._row_id LIMIT %d OFFSET %d",
        strings.Join(select_parts, ", "),
        from_clause,
        strings.Join(join_clauses, " "),
        base_table.Alias,
        limit,
        offset,
    )

    return query, nil
}

// BuildMultiJoinCountQuery builds a COUNT query for multi-table joins
func (b *MultiTableQueryBuilder) BuildMultiJoinCountQuery(join_configs []JoinConfig) (string, error) {
    if len(b.tables) < 2 {
        return "", apperror.Validation("at least 2 tables required for join")
    }

    if len(join_configs) != len(b.tables)-1 {
        return "", apperror.Validation("number of join configs must equal number of join tables")
    }

    // Build FROM clause with base table
    base_table := b.tables[0]
    from_clause := fmt.Sprintf("%s AS %s",
        pq.QuoteIdentifier(base_table.TableName),
        base_table.Alias,
    )

    // Build JOIN clauses
    join_clauses := make([]string, 0, len(join_configs))
    for i, config := range join_configs {
        join_table := b.tables[i+1]
        join_type := strings.ToUpper(config.JoinType)

        if err := b.ValidateJoinType(join_type); err != nil {
            return "", err
        }

        if join_type == "CROSS" {
            join_clauses = append(join_clauses, fmt.Sprintf(
                "CROSS JOIN %s AS %s",
                pq.QuoteIdentifier(join_table.TableName),
                join_table.Alias,
            ))
        } else {
            if len(config.Conditions) == 0 {
                return "", apperror.Validation(fmt.Sprintf("join conditions required for %s JOIN", join_type))
            }

            on_conditions := make([]string, 0, len(config.Conditions))
            for _, cond := range config.Conditions {
                if err := b.ValidateOperator(cond.Operator); err != nil {
                    return "", err
                }

                left_qualified, left_idx, err := b.FindColumnTable(cond.LeftColumn)
                if err != nil {
                    return "", fmt.Errorf("left column validation failed: %w", err)
                }
                if left_idx > i {
                    return "", apperror.Validation(fmt.Sprintf("left column '%s' must be from base or previously joined tables", cond.LeftColumn))
                }

                right_qualified, err := b.ValidateColumnInTable(cond.RightColumn, i+1)
                if err != nil {
                    return "", fmt.Errorf("right column validation failed: %w", err)
                }

                on_conditions = append(on_conditions,
                    fmt.Sprintf("%s %s %s", left_qualified, cond.Operator, right_qualified),
                )
            }

            join_clauses = append(join_clauses, fmt.Sprintf(
                "%s JOIN %s AS %s ON %s",
                join_type,
                pq.QuoteIdentifier(join_table.TableName),
                join_table.Alias,
                strings.Join(on_conditions, " AND "),
            ))
        }
    }

    // Build COUNT query
    query := fmt.Sprintf(
        "SELECT COUNT(*) FROM %s %s",
        from_clause,
        strings.Join(join_clauses, " "),
    )

    return query, nil
}

// ====================
// Filter Query Builder
// ====================

// FilterQueryBuilder builds WHERE clauses with SQL injection protection
type FilterQueryBuilder struct {
    table_name        string
    columns           map[string]model.DatasetColumn
    allowed_operators map[string]bool
}

// NewFilterQueryBuilder creates a new filter query builder
func NewFilterQueryBuilder(table_name string, columns []model.DatasetColumn) *FilterQueryBuilder {
    column_map := make(map[string]model.DatasetColumn)
    for _, col := range columns {
        column_map[col.ColumnName] = col
    }

    return &FilterQueryBuilder{
        table_name: table_name,
        columns:    column_map,
        allowed_operators: map[string]bool{
            "=":    true,
            "!=":   true,
            "<":    true,
            ">":    true,
            "<=":   true,
            ">=":   true,
            "like": true,
        },
    }
}

// ValidateColumn checks if a column exists and returns the quoted name
func (b *FilterQueryBuilder) ValidateColumn(column_name string) (string, error) {
    if _, exists := b.columns[column_name]; exists {
        return pq.QuoteIdentifier(column_name), nil
    }
    return "", apperror.Validation(fmt.Sprintf("column '%s' not found in dataset", column_name))
}

// ValidateOperator checks if the operator is allowed for filtering
func (b *FilterQueryBuilder) ValidateOperator(operator string) error {
    if !b.allowed_operators[strings.ToLower(operator)] {
        return apperror.Validation(fmt.Sprintf("filter operator '%s' is not allowed", operator))
    }
    return nil
}

// BuildFilterClause builds a WHERE clause from filter conditions
// Returns the WHERE clause (without "WHERE" keyword) and parameter values
func (b *FilterQueryBuilder) BuildFilterClause(filters []dto.FilterCondition) (string, []interface{}, error) {
    if len(filters) == 0 {
        return "", nil, nil
    }

    conditions := make([]string, 0, len(filters))
    params := make([]interface{}, 0, len(filters))

    for i, filter := range filters {
        // Validate column
        quoted_col, err := b.ValidateColumn(filter.Column)
        if err != nil {
            return "", nil, err
        }

        // Validate operator
        operator := strings.ToLower(filter.Operator)
        if err := b.ValidateOperator(operator); err != nil {
            return "", nil, err
        }

        // Build condition with parameterized query
        param_index := i + 1
        if operator == "like" {
            conditions = append(conditions, fmt.Sprintf("%s ILIKE $%d", quoted_col, param_index))
            params = append(params, "%"+filter.Value+"%")
        } else {
            conditions = append(conditions, fmt.Sprintf("%s %s $%d", quoted_col, operator, param_index))
            params = append(params, filter.Value)
        }
    }

    return strings.Join(conditions, " AND "), params, nil
}

// BuildSortClause builds an ORDER BY clause
func (b *FilterQueryBuilder) BuildSortClause(sort_by string, sort_order string) (string, error) {
    if sort_by == "" {
        return "_row_id ASC", nil
    }

    // Validate column
    quoted_col, err := b.ValidateColumn(sort_by)
    if err != nil {
        return "", err
    }

    // Validate sort order
    order := "ASC"
    if strings.ToLower(sort_order) == "desc" {
        order = "DESC"
    }

    return fmt.Sprintf("%s %s", quoted_col, order), nil
}

// BuildDataQuery builds a complete data query with filters, sorting, and pagination
func (b *FilterQueryBuilder) BuildDataQuery(
    columns []model.DatasetColumn,
    filters []dto.FilterCondition,
    sort_by string,
    sort_order string,
    page int,
    limit int,
) (string, []interface{}, error) {
    // Build SELECT clause
    column_names := make([]string, len(columns))
    for i, col := range columns {
        column_names[i] = pq.QuoteIdentifier(col.ColumnName)
    }

    // Build WHERE clause
    where_clause, params, err := b.BuildFilterClause(filters)
    if err != nil {
        return "", nil, err
    }

    // Build ORDER BY clause
    order_clause, err := b.BuildSortClause(sort_by, sort_order)
    if err != nil {
        return "", nil, err
    }

    // Calculate pagination
    offset := (page - 1) * limit

    // Build query
    query := fmt.Sprintf(
        "SELECT %s FROM %s",
        strings.Join(column_names, ", "),
        pq.QuoteIdentifier(b.table_name),
    )

    if where_clause != "" {
        query += " WHERE " + where_clause
    }

    query += fmt.Sprintf(" ORDER BY %s LIMIT %d OFFSET %d", order_clause, limit, offset)

    return query, params, nil
}

// BuildCountQuery builds a COUNT query with filters
func (b *FilterQueryBuilder) BuildCountQuery(filters []dto.FilterCondition) (string, []interface{}, error) {
    where_clause, params, err := b.BuildFilterClause(filters)
    if err != nil {
        return "", nil, err
    }

    query := fmt.Sprintf("SELECT COUNT(*) FROM %s", pq.QuoteIdentifier(b.table_name))

    if where_clause != "" {
        query += " WHERE " + where_clause
    }

    return query, params, nil
}

// ====================
// Legacy SafeQueryBuilder (for backward compatibility)
// ====================

// SafeQueryBuilder builds SQL queries with SQL injection protection (2-table version)
type SafeQueryBuilder struct {
    left_table        string
    right_table       string
    left_columns      map[string]model.DatasetColumn
    right_columns     map[string]model.DatasetColumn
    allowed_operators map[string]bool
}

// NewSafeQueryBuilder creates a new query builder with validated table and column information
func NewSafeQueryBuilder(
    left_table string,
    right_table string,
    left_columns []model.DatasetColumn,
    right_columns []model.DatasetColumn,
) *SafeQueryBuilder {
    left_map := make(map[string]model.DatasetColumn)
    for _, col := range left_columns {
        left_map[col.ColumnName] = col
    }

    right_map := make(map[string]model.DatasetColumn)
    for _, col := range right_columns {
        right_map[col.ColumnName] = col
    }

    allowed_ops := map[string]bool{
        "=":  true,
        "!=": true,
        "<":  true,
        ">":  true,
        "<=": true,
        ">=": true,
    }

    return &SafeQueryBuilder{
        left_table:        left_table,
        right_table:       right_table,
        left_columns:      left_map,
        right_columns:     right_map,
        allowed_operators: allowed_ops,
    }
}

// ValidateColumn checks if a column exists in either table and returns the qualified name
func (b *SafeQueryBuilder) ValidateColumn(column_name string) (string, error) {
    if _, exists := b.left_columns[column_name]; exists {
        return fmt.Sprintf("%s.%s",
            pq.QuoteIdentifier(b.left_table),
            pq.QuoteIdentifier(column_name),
        ), nil
    }

    if _, exists := b.right_columns[column_name]; exists {
        return fmt.Sprintf("%s.%s",
            pq.QuoteIdentifier(b.right_table),
            pq.QuoteIdentifier(column_name),
        ), nil
    }

    return "", apperror.Validation(fmt.Sprintf("column '%s' not found in either dataset", column_name))
}

// ValidateLeftColumn checks if a column exists in the left table
func (b *SafeQueryBuilder) ValidateLeftColumn(column_name string) (string, error) {
    if _, exists := b.left_columns[column_name]; exists {
        return fmt.Sprintf("%s.%s",
            pq.QuoteIdentifier(b.left_table),
            pq.QuoteIdentifier(column_name),
        ), nil
    }
    return "", apperror.Validation(fmt.Sprintf("column '%s' not found in left dataset", column_name))
}

// ValidateRightColumn checks if a column exists in the right table
func (b *SafeQueryBuilder) ValidateRightColumn(column_name string) (string, error) {
    if _, exists := b.right_columns[column_name]; exists {
        return fmt.Sprintf("%s.%s",
            pq.QuoteIdentifier(b.right_table),
            pq.QuoteIdentifier(column_name),
        ), nil
    }
    return "", apperror.Validation(fmt.Sprintf("column '%s' not found in right dataset", column_name))
}

// ValidateOperator checks if the operator is allowed
func (b *SafeQueryBuilder) ValidateOperator(operator string) error {
    if !b.allowed_operators[operator] {
        return apperror.Validation(fmt.Sprintf("operator '%s' is not allowed", operator))
    }
    return nil
}

// BuildJoinQuery constructs a safe JOIN query with whitelist validation
func (b *SafeQueryBuilder) BuildJoinQuery(
    join_type string,
    conditions []struct {
        LeftColumn  string
        Operator    string
        RightColumn string
    },
    select_columns []string,
    page int,
    limit int,
) (string, error) {
    join_type = strings.ToUpper(join_type)
    allowed_joins := map[string]bool{
        "INNER": true,
        "LEFT":  true,
        "RIGHT": true,
        "FULL":  true,
    }
    if !allowed_joins[join_type] {
        return "", apperror.Validation(fmt.Sprintf("invalid join type: %s", join_type))
    }

    select_parts := make([]string, 0, len(select_columns))
    for _, col_name := range select_columns {
        qualified_col, err := b.ValidateColumn(col_name)
        if err != nil {
            return "", err
        }
        select_parts = append(select_parts, fmt.Sprintf("%s AS %s",
            qualified_col,
            pq.QuoteIdentifier(col_name),
        ))
    }

    join_conditions := make([]string, 0, len(conditions))
    for _, cond := range conditions {
        if err := b.ValidateOperator(cond.Operator); err != nil {
            return "", err
        }

        left_qualified, err := b.ValidateLeftColumn(cond.LeftColumn)
        if err != nil {
            return "", fmt.Errorf("left column validation failed: %w", err)
        }

        right_qualified, err := b.ValidateRightColumn(cond.RightColumn)
        if err != nil {
            return "", fmt.Errorf("right column validation failed: %w", err)
        }

        join_conditions = append(join_conditions,
            fmt.Sprintf("%s %s %s", left_qualified, cond.Operator, right_qualified),
        )
    }

    offset := (page - 1) * limit

    query := fmt.Sprintf(
        "SELECT %s FROM %s %s JOIN %s ON %s ORDER BY %s._row_id LIMIT %d OFFSET %d",
        strings.Join(select_parts, ", "),
        pq.QuoteIdentifier(b.left_table),
        join_type,
        pq.QuoteIdentifier(b.right_table),
        strings.Join(join_conditions, " AND "),
        pq.QuoteIdentifier(b.left_table),
        limit,
        offset,
    )

    return query, nil
}

// BuildCountQuery constructs a COUNT query for the join
func (b *SafeQueryBuilder) BuildCountQuery(
    join_type string,
    conditions []struct {
        LeftColumn  string
        Operator    string
        RightColumn string
    },
) (string, error) {
    join_type = strings.ToUpper(join_type)
    allowed_joins := map[string]bool{
        "INNER": true,
        "LEFT":  true,
        "RIGHT": true,
        "FULL":  true,
    }
    if !allowed_joins[join_type] {
        return "", apperror.Validation(fmt.Sprintf("invalid join type: %s", join_type))
    }

    join_conditions := make([]string, 0, len(conditions))
    for _, cond := range conditions {
        if err := b.ValidateOperator(cond.Operator); err != nil {
            return "", err
        }

        left_qualified, err := b.ValidateLeftColumn(cond.LeftColumn)
        if err != nil {
            return "", fmt.Errorf("left column validation failed: %w", err)
        }

        right_qualified, err := b.ValidateRightColumn(cond.RightColumn)
        if err != nil {
            return "", fmt.Errorf("right column validation failed: %w", err)
        }

        join_conditions = append(join_conditions,
            fmt.Sprintf("%s %s %s", left_qualified, cond.Operator, right_qualified),
        )
    }

    query := fmt.Sprintf(
        "SELECT COUNT(*) FROM %s %s JOIN %s ON %s",
        pq.QuoteIdentifier(b.left_table),
        join_type,
        pq.QuoteIdentifier(b.right_table),
        strings.Join(join_conditions, " AND "),
    )

    return query, nil
}
