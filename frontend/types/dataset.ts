/**
 * Dataset type definitions for CSV-based dynamic tables
 */

export interface DatasetColumn {
    id: number
    columnName: string
    displayName: string
    dataType: 'text' | 'integer' | 'numeric' | 'boolean' | 'timestamp'
    columnOrder: number
    nullable: boolean
}

export interface Dataset {
    id: string
    userId: number
    tableName: string
    displayName: string
    description: string
    rowCount: number
    fileSizeBytes: number
    columns: DatasetColumn[]
    createdAt: string
    updatedAt: string
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
    rowsImported: number
}

export interface JoinCondition {
    leftColumn: string
    operator: '=' | '!=' | '<' | '>' | '<=' | '>='
    rightColumn: string
}

// Configuration for a single join table
export interface JoinTableConfig {
    datasetId: string
    joinType: 'inner' | 'left' | 'right' | 'full' | 'cross'
    conditions: JoinCondition[]
}

// Multi-table join query request (supports up to 5 tables)
export interface JoinQueryRequest {
    baseDatasetId: string
    joinTables: JoinTableConfig[]
    selectColumns: string[]
    page?: number
    limit?: number
}

export interface JoinQueryResponse {
    columns: DatasetColumn[]
    rows: Record<string, any>[]
    total: number
    page: number
    limit: number
    queryTimeMs: number
}

// State for the join builder wizard
export interface JoinBuilderState {
    baseDatasetId: string | null
    joinTables: JoinTableConfig[]
    selectedColumns: string[]
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
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    filters?: FilterCondition[]
}
