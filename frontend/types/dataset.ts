/**
 * Dataset type definitions for CSV-based dynamic tables
 */

export interface DatasetColumn {
    id: number
    column_name: string
    display_name: string
    data_type: 'text' | 'integer' | 'numeric' | 'boolean' | 'timestamp'
    column_order: number
    nullable: boolean
}

export interface Dataset {
    id: string
    display_name: string
    description: string
    dynamic_table_name: string
    row_count: number
    file_size_bytes: number
    columns: DatasetColumn[]
    created_at: string
    updated_at: string
}

export interface DatasetListResponse {
    datasets: Dataset[]
    total: number
    page: number
    limit: number
}

export interface DatasetDataResponse {
    columns: DatasetColumn[]
    rows: Record<string, any>[]
    total: number
    page: number
    limit: number
}

export interface CreateDatasetResponse {
    dataset: Dataset
    rows_imported: number
}

export interface JoinCondition {
    left_column: string
    operator: '=' | '!=' | '<' | '>' | '<=' | '>='
    right_column: string
}

// Configuration for a single join table
export interface JoinTableConfig {
    dataset_id: string
    join_type: 'inner' | 'left' | 'right' | 'full' | 'cross'
    conditions: JoinCondition[]
}

// Multi-table join query request (supports up to 5 tables)
export interface JoinQueryRequest {
    base_dataset_id: string
    join_tables: JoinTableConfig[]
    select_columns: string[]
    page?: number
    limit?: number
}

export interface JoinQueryResponse {
    columns: DatasetColumn[]
    rows: Record<string, any>[]
    total: number
    page: number
    limit: number
    query_time_ms: number
}

// State for the join builder wizard
export interface JoinBuilderState {
    base_dataset_id: string | null
    join_tables: JoinTableConfig[]
    selected_columns: string[]
}

// Filter condition for data queries
export interface FilterCondition {
    column: string
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'like'
    value: string
}

// Parameters for fetching dataset data with filtering/sorting
export interface DatasetDataParams {
    page?: number
    limit?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    filters?: FilterCondition[]
}
