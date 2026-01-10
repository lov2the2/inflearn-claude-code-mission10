import apiClient from './client'
import { ApiResponse } from '@/types/api'
import {
    Dataset,
    DatasetListResponse,
    DatasetDataResponse,
    CreateDatasetResponse,
    JoinQueryRequest,
    JoinQueryResponse,
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
     * Get dataset data with pagination
     */
    getDatasetData: async (
        id: string,
        page: number = 1,
        limit: number = 50
    ): Promise<DatasetDataResponse> => {
        const response = await apiClient.get<ApiResponse<DatasetDataResponse>>(
            `/api/v1/datasets/${id}/data`,
            { params: { page, limit } }
        )
        return response.data.data
    },

    /**
     * Upload CSV file to create new dataset
     */
    uploadDataset: async (
        file: File,
        display_name: string,
        description: string
    ): Promise<CreateDatasetResponse> => {
        const form_data = new FormData()
        form_data.append('file', file)
        form_data.append('display_name', display_name)
        form_data.append('description', description)

        const response = await apiClient.post<ApiResponse<CreateDatasetResponse>>(
            '/api/v1/datasets/upload',
            form_data,
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
            '/api/v1/datasets/join',
            request
        )
        return response.data.data
    },

    /**
     * Export join query result as CSV
     */
    exportJoinQuery: async (request: JoinQueryRequest): Promise<Blob> => {
        const response = await apiClient.post(
            '/api/v1/datasets/join/export',
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
