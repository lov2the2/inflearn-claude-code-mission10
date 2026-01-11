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

export interface JoinQueryRequest {
    left_dataset_id: string
    right_dataset_id: string
    join_type: 'inner' | 'left' | 'right' | 'full'
    conditions: JoinCondition[]
    select_columns: string[]
    page?: number
    limit?: number
}

export interface JoinQueryResponse {
    columns: DatasetColumn[]
    rows: Record<string, any>[]
    total: number
}

export interface JoinBuilderState {
    left_dataset_id: string | null
    right_dataset_id: string | null
    join_type: 'inner' | 'left' | 'right' | 'full'
    conditions: JoinCondition[]
    selected_columns: string[]
}
