package service

import (
    "bytes"
    "crypto/rand"
    "encoding/csv"
    "fmt"
    "io"
    "regexp"
    "start-kit-backend/internal/dto"
    "start-kit-backend/internal/model"
    "start-kit-backend/internal/repository"
    "start-kit-backend/internal/util"
    "strconv"
    "strings"
    "time"
)

type CSVService interface {
    ExportUsersToCSV() ([]byte, error)
    ImportUsersFromCSV(csvData []byte) (*dto.CSVImportResponse, error)
}

type csvService struct {
    repo *repository.Repository
}

func NewCSVService(repo *repository.Repository) CSVService {
    return &csvService{repo: repo}
}

func (s *csvService) ExportUsersToCSV() ([]byte, error) {
    // Fetch all users
    users, err := s.repo.Admin.GetAllUsers()
    if err != nil {
        return nil, err
    }

    // Create CSV buffer
    var buf bytes.Buffer
    writer := csv.NewWriter(&buf)

    // Write header
    header := []string{"id", "email", "name", "role", "created_at", "updated_at"}
    if err := writer.Write(header); err != nil {
        return nil, err
    }

    // Write data rows
    for _, user := range users {
        record := []string{
            strconv.FormatUint(uint64(user.ID), 10),
            user.Email,
            user.Name,
            string(user.Role),
            user.CreatedAt.Format(time.RFC3339),
            user.UpdatedAt.Format(time.RFC3339),
        }
        if err := writer.Write(record); err != nil {
            return nil, err
        }
    }

    writer.Flush()
    return buf.Bytes(), writer.Error()
}

func (s *csvService) ImportUsersFromCSV(csvData []byte) (*dto.CSVImportResponse, error) {
    reader := csv.NewReader(bytes.NewReader(csvData))

    // Read header
    header, err := reader.Read()
    if err != nil {
        return nil, fmt.Errorf("failed to read CSV header: %w", err)
    }

    // Validate header
    expectedHeader := []string{"email", "name", "role"}
    if !slicesEqual(header, expectedHeader) {
        return nil, fmt.Errorf("invalid CSV header, expected: %v, got: %v", expectedHeader, header)
    }

    // Parse records
    records := []dto.CSVImportUserRecord{}
    rowNum := 1
    for {
        row, err := reader.Read()
        if err == io.EOF {
            break
        }
        if err != nil {
            return nil, fmt.Errorf("failed to read row %d: %w", rowNum, err)
        }

        if len(row) != 3 {
            return nil, fmt.Errorf("invalid row %d: expected 3 columns, got %d", rowNum, len(row))
        }

        records = append(records, dto.CSVImportUserRecord{
            Email: strings.TrimSpace(row[0]),
            Name:  strings.TrimSpace(row[1]),
            Role:  strings.TrimSpace(row[2]),
        })
        rowNum++
    }

    // Process records
    response := &dto.CSVImportResponse{
        TotalRows: len(records),
        Errors:    []dto.CSVImportError{},
    }

    // Generate default password for new users
    defaultPassword, err := generateRandomPassword(16)
    if err != nil {
        return nil, fmt.Errorf("failed to generate password: %w", err)
    }

    hashedPassword, err := util.HashPassword(defaultPassword)
    if err != nil {
        return nil, fmt.Errorf("failed to hash password: %w", err)
    }

    for i, record := range records {
        rowNum := i + 2 // Account for header row

        // Validate
        if validationErr := s.validateImportRecord(&record, rowNum); validationErr != nil {
            response.Errors = append(response.Errors, *validationErr)
            response.FailureCount++
            continue
        }

        // Upsert user
        user := model.User{
            Email:        record.Email,
            Name:         record.Name,
            Role:         model.UserRole(record.Role),
            PasswordHash: hashedPassword,
        }

        created, err := s.repo.Admin.UpsertUser(&user)
        if err != nil {
            response.Errors = append(response.Errors, dto.CSVImportError{
                Row:     rowNum,
                Email:   record.Email,
                Message: err.Error(),
            })
            response.FailureCount++
            continue
        }

        if created {
            response.CreatedCount++
        } else {
            response.UpdatedCount++
        }
        response.SuccessCount++
    }

    // Include default password if new users were created
    if response.CreatedCount > 0 {
        response.DefaultPassword = defaultPassword
    }

    return response, nil
}

func (s *csvService) validateImportRecord(record *dto.CSVImportUserRecord, rowNum int) *dto.CSVImportError {
    // Email validation
    if record.Email == "" {
        return &dto.CSVImportError{
            Row:     rowNum,
            Field:   "email",
            Message: "email is required",
        }
    }
    if !isValidEmail(record.Email) {
        return &dto.CSVImportError{
            Row:     rowNum,
            Email:   record.Email,
            Field:   "email",
            Message: "invalid email format",
        }
    }

    // Name validation
    if record.Name == "" {
        return &dto.CSVImportError{
            Row:     rowNum,
            Email:   record.Email,
            Field:   "name",
            Message: "name is required",
        }
    }
    if len(record.Name) > 255 {
        return &dto.CSVImportError{
            Row:     rowNum,
            Email:   record.Email,
            Field:   "name",
            Message: "name exceeds 255 characters",
        }
    }

    // Role validation
    if record.Role != "admin" && record.Role != "user" {
        return &dto.CSVImportError{
            Row:     rowNum,
            Email:   record.Email,
            Field:   "role",
            Message: "role must be 'admin' or 'user'",
        }
    }

    return nil
}

func isValidEmail(email string) bool {
    re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
    return re.MatchString(email)
}

func generateRandomPassword(length int) (string, error) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    password := make([]byte, length)
    randomBytes := make([]byte, length)

    _, err := rand.Read(randomBytes)
    if err != nil {
        return "", err
    }

    for i := range password {
        password[i] = charset[int(randomBytes[i])%len(charset)]
    }

    return string(password), nil
}

func slicesEqual(a, b []string) bool {
    if len(a) != len(b) {
        return false
    }
    for i := range a {
        if a[i] != b[i] {
            return false
        }
    }
    return true
}
