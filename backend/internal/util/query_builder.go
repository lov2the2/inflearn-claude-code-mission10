package util

import (
    "fmt"
    "strings"

    "start-kit-backend/internal/apperror"
    "start-kit-backend/internal/model"

    "github.com/lib/pq"
)

// SafeQueryBuilder builds SQL queries with SQL injection protection
type SafeQueryBuilder struct {
    left_table       string
    right_table      string
    left_columns     map[string]model.DatasetColumn
    right_columns    map[string]model.DatasetColumn
    allowed_operators map[string]bool
}

// NewSafeQueryBuilder creates a new query builder with validated table and column information
func NewSafeQueryBuilder(
    left_table string,
    right_table string,
    left_columns []model.DatasetColumn,
    right_columns []model.DatasetColumn,
) *SafeQueryBuilder {
    // Build column maps for O(1) lookup
    left_map := make(map[string]model.DatasetColumn)
    for _, col := range left_columns {
        left_map[col.ColumnName] = col
    }

    right_map := make(map[string]model.DatasetColumn)
    for _, col := range right_columns {
        right_map[col.ColumnName] = col
    }

    // Define allowed operators
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
    // Check left table
    if _, exists := b.left_columns[column_name]; exists {
        return fmt.Sprintf("%s.%s",
            pq.QuoteIdentifier(b.left_table),
            pq.QuoteIdentifier(column_name),
        ), nil
    }

    // Check right table
    if _, exists := b.right_columns[column_name]; exists {
        return fmt.Sprintf("%s.%s",
            pq.QuoteIdentifier(b.right_table),
            pq.QuoteIdentifier(column_name),
        ), nil
    }

    return "", apperror.Validation(fmt.Sprintf("column '%s' not found in either dataset", column_name))
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
    // Validate join type
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

    // Build SELECT clause with validated columns
    select_parts := make([]string, 0, len(select_columns))
    for _, col_name := range select_columns {
        qualified_col, err := b.ValidateColumn(col_name)
        if err != nil {
            return "", err
        }
        // Add alias to avoid duplicate column names
        select_parts = append(select_parts, fmt.Sprintf("%s AS %s",
            qualified_col,
            pq.QuoteIdentifier(col_name),
        ))
    }

    // Build JOIN conditions with validation
    join_conditions := make([]string, 0, len(conditions))
    for _, cond := range conditions {
        // Validate operator
        if err := b.ValidateOperator(cond.Operator); err != nil {
            return "", err
        }

        // Validate left column
        left_qualified, err := b.ValidateColumn(cond.LeftColumn)
        if err != nil {
            return "", fmt.Errorf("left column validation failed: %w", err)
        }

        // Validate right column
        right_qualified, err := b.ValidateColumn(cond.RightColumn)
        if err != nil {
            return "", fmt.Errorf("right column validation failed: %w", err)
        }

        join_conditions = append(join_conditions,
            fmt.Sprintf("%s %s %s", left_qualified, cond.Operator, right_qualified),
        )
    }

    // Calculate pagination
    offset := (page - 1) * limit

    // Build final query
    query := fmt.Sprintf(
        "SELECT %s FROM %s %s JOIN %s ON %s ORDER BY %s.id LIMIT %d OFFSET %d",
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
    // Validate join type
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

    // Build JOIN conditions with validation
    join_conditions := make([]string, 0, len(conditions))
    for _, cond := range conditions {
        // Validate operator
        if err := b.ValidateOperator(cond.Operator); err != nil {
            return "", err
        }

        // Validate left column
        left_qualified, err := b.ValidateColumn(cond.LeftColumn)
        if err != nil {
            return "", fmt.Errorf("left column validation failed: %w", err)
        }

        // Validate right column
        right_qualified, err := b.ValidateColumn(cond.RightColumn)
        if err != nil {
            return "", fmt.Errorf("right column validation failed: %w", err)
        }

        join_conditions = append(join_conditions,
            fmt.Sprintf("%s %s %s", left_qualified, cond.Operator, right_qualified),
        )
    }

    // Build COUNT query
    query := fmt.Sprintf(
        "SELECT COUNT(*) FROM %s %s JOIN %s ON %s",
        pq.QuoteIdentifier(b.left_table),
        join_type,
        pq.QuoteIdentifier(b.right_table),
        strings.Join(join_conditions, " AND "),
    )

    return query, nil
}
