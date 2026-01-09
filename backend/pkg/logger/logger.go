package logger

import (
    "os"
    "time"

    "github.com/rs/zerolog"
    "github.com/rs/zerolog/log"
)

// Init initializes the global logger based on environment
func Init(environment string) {
    // Set global time format to RFC3339 for consistency
    zerolog.TimeFieldFormat = time.RFC3339

    if environment == "development" || environment == "debug" {
        // Use pretty console output for development
        log.Logger = log.Output(zerolog.ConsoleWriter{
            Out:        os.Stderr,
            TimeFormat: time.RFC3339,
        })
    } else {
        // Use JSON output for production
        log.Logger = zerolog.New(os.Stderr).With().Timestamp().Logger()
    }

    // Set log level based on environment
    if environment == "debug" {
        zerolog.SetGlobalLevel(zerolog.DebugLevel)
    } else if environment == "production" || environment == "release" {
        zerolog.SetGlobalLevel(zerolog.InfoLevel)
    } else {
        zerolog.SetGlobalLevel(zerolog.DebugLevel)
    }
}

// WithRequestID creates a logger with request ID context
func WithRequestID(requestID string) zerolog.Logger {
    return log.With().Str("request_id", requestID).Logger()
}

// WithUserID creates a logger with user ID context
func WithUserID(userID uint) zerolog.Logger {
    return log.With().Uint("user_id", userID).Logger()
}

// WithContext creates a logger with both request ID and user ID
func WithContext(requestID string, userID uint) zerolog.Logger {
    return log.With().
        Str("request_id", requestID).
        Uint("user_id", userID).
        Logger()
}

// WithAction creates a logger with action context
func WithAction(action string) zerolog.Logger {
    return log.With().Str("action", action).Logger()
}

// WithFields creates a logger with multiple fields
func WithFields(fields map[string]interface{}) zerolog.Logger {
    ctx := log.With()
    for key, value := range fields {
        ctx = ctx.Interface(key, value)
    }
    return ctx.Logger()
}

// GetLogger returns the global logger instance
func GetLogger() *zerolog.Logger {
    return &log.Logger
}
