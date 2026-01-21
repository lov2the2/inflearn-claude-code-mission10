import apiClient from './client'
import { ApiResponse } from '@/types/api'
import {
    Dataset,
    DatasetListResponse,
    DatasetDataResponse,
    CreateDatasetResponse,
    JoinQueryRequest,
    JoinQueryResponse,
    DatasetDataParams,
} from '@/types/dataset'

export const datasetsApi = {
    /**
     * List all datasets with pagination
     */
    listDatasets: async (page: number = 1, limit: number = 10): Promise<DatasetListResponse> => {
        const response = await apiClient.get<ApiResponse<DatasetListResponse>>(
            '/api/v1/datasets',
            { params: { page, limit } }
        )
        return response.data.data
    },

    /**
     * Get dataset details by ID
     */
    getDataset: async (id: string): Promise<Dataset> => {
        const response = await apiClient.get<ApiResponse<Dataset>>(
            `/api/v1/datasets/${id}`
        )
        return response.data.data
    },

    /**
     * Get dataset data with pagination, filtering, and sorting
     */
    getDatasetData: async (
        id: string,
        params: DatasetDataParams = {}
    ): Promise<DatasetDataResponse> => {
        const { page = 1, limit = 50, sortBy, sortOrder, filters } = params

        const queryParams: Record<string, any> = { page, limit }
        if (sortBy) queryParams.sort_by = sortBy
        if (sortOrder) queryParams.sort_order = sortOrder
        if (filters && filters.length > 0) {
            queryParams.filters = JSON.stringify(filters)
        }

        const response = await apiClient.get<ApiResponse<DatasetDataResponse>>(
            `/api/v1/datasets/${id}/data`,
            { params: queryParams }
        )
        return response.data.data
    },

    /**
     * Upload CSV file to create new dataset
     */
    uploadDataset: async (
        file: File,
        displayName: string,
        description: string
    ): Promise<CreateDatasetResponse> => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('display_name', displayName)
        formData.append('description', description)

        const response = await apiClient.post<ApiResponse<CreateDatasetResponse>>(
            '/api/v1/datasets/upload',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        return response.data.data
    },

    /**
     * Delete dataset by ID
     */
    deleteDataset: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/v1/datasets/${id}`)
    },

    /**
     * Execute join query between two datasets
     */
    executeJoinQuery: async (request: JoinQueryRequest): Promise<JoinQueryResponse> => {
        const response = await apiClient.post<ApiResponse<JoinQueryResponse>>(
            '/api/v1/datasets/query',
            request
        )
        return response.data.data
    },

    /**
     * Export join query result as CSV
     */
    exportJoinQuery: async (request: JoinQueryRequest): Promise<Blob> => {
        const response = await apiClient.post(
            '/api/v1/datasets/query/export',
            request,
            { responseType: 'blob' }
        )
        return response.data
    },

    /**
     * Export dataset as CSV file
     */
    exportDataset: async (id: string): Promise<Blob> => {
        const response = await apiClient.get(
            `/api/v1/datasets/${id}/export`,
            { responseType: 'blob' }
        )
        return response.data
    },
}
