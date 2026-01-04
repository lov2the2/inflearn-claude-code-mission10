package dto

type CSVImportUserRecord struct {
    Email string `csv:"email"`
    Name  string `csv:"name"`
    Role  string `csv:"role"`
}

type CSVImportResponse struct {
    SuccessCount    int              `json:"success_count"`
    FailureCount    int              `json:"failure_count"`
    CreatedCount    int              `json:"created_count"`
    UpdatedCount    int              `json:"updated_count"`
    TotalRows       int              `json:"total_rows"`
    DefaultPassword string           `json:"default_password,omitempty"`
    Errors          []CSVImportError `json:"errors,omitempty"`
}

type CSVImportError struct {
    Row     int    `json:"row"`
    Email   string `json:"email,omitempty"`
    Field   string `json:"field,omitempty"`
    Message string `json:"message"`
}
