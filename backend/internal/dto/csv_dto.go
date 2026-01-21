package dto

type CSVImportUserRecord struct {
    Email string `csv:"email"`
    Name  string `csv:"name"`
    Role  string `csv:"role"`
}

type CSVImportResponse struct {
    SuccessCount    int              `json:"successCount"`
    FailureCount    int              `json:"failureCount"`
    CreatedCount    int              `json:"createdCount"`
    UpdatedCount    int              `json:"updatedCount"`
    TotalRows       int              `json:"totalRows"`
    DefaultPassword string           `json:"defaultPassword,omitempty"`
    Errors          []CSVImportError `json:"errors,omitempty"`
}

type CSVImportError struct {
    Row     int    `json:"row"`
    Email   string `json:"email,omitempty"`
    Field   string `json:"field,omitempty"`
    Message string `json:"message"`
}
