package dto

type SuccessResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Message string      `json:"message,omitempty"`
}

type ErrorResponse struct {
    Success bool   `json:"success"`
    Error   string `json:"error"`
}

func NewSuccessResponse(data interface{}, message string) SuccessResponse {
    return SuccessResponse{
        Success: true,
        Data:    data,
        Message: message,
    }
}

func NewErrorResponse(error string) ErrorResponse {
    return ErrorResponse{
        Success: false,
        Error:   error,
    }
}
