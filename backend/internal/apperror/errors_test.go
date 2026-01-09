package apperror

import (
    "net/http"
    "testing"
)

func TestUnauthorized(t *testing.T) {
    err := Unauthorized("test message")

    if err.Code != CodeUnauthorized {
        t.Errorf("Expected code %s, got %s", CodeUnauthorized, err.Code)
    }

    if err.StatusCode != http.StatusUnauthorized {
        t.Errorf("Expected status code %d, got %d", http.StatusUnauthorized, err.StatusCode)
    }

    if err.Message != "test message" {
        t.Errorf("Expected message 'test message', got '%s'", err.Message)
    }

    if err.Error() != "test message" {
        t.Errorf("Expected Error() to return 'test message', got '%s'", err.Error())
    }
}

func TestNotFound(t *testing.T) {
    err := NotFound("resource not found")

    if err.Code != CodeNotFound {
        t.Errorf("Expected code %s, got %s", CodeNotFound, err.Code)
    }

    if err.StatusCode != http.StatusNotFound {
        t.Errorf("Expected status code %d, got %d", http.StatusNotFound, err.StatusCode)
    }
}

func TestValidation(t *testing.T) {
    err := Validation("invalid input")

    if err.Code != CodeValidation {
        t.Errorf("Expected code %s, got %s", CodeValidation, err.Code)
    }

    if err.StatusCode != http.StatusBadRequest {
        t.Errorf("Expected status code %d, got %d", http.StatusBadRequest, err.StatusCode)
    }
}

func TestInternal(t *testing.T) {
    err := Internal("internal error")

    if err.Code != CodeInternal {
        t.Errorf("Expected code %s, got %s", CodeInternal, err.Code)
    }

    if err.StatusCode != http.StatusInternalServerError {
        t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, err.StatusCode)
    }
}

func TestConflict(t *testing.T) {
    err := Conflict("resource conflict")

    if err.Code != CodeConflict {
        t.Errorf("Expected code %s, got %s", CodeConflict, err.Code)
    }

    if err.StatusCode != http.StatusConflict {
        t.Errorf("Expected status code %d, got %d", http.StatusConflict, err.StatusCode)
    }
}

func TestForbidden(t *testing.T) {
    err := Forbidden("access denied")

    if err.Code != CodeForbidden {
        t.Errorf("Expected code %s, got %s", CodeForbidden, err.Code)
    }

    if err.StatusCode != http.StatusForbidden {
        t.Errorf("Expected status code %d, got %d", http.StatusForbidden, err.StatusCode)
    }
}
