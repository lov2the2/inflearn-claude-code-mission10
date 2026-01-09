# Wire Dependency Injection

This directory contains Wire configuration for automated dependency injection.

## Overview

Wire is a compile-time dependency injection tool that generates code for you. It provides a cleaner, more maintainable way to wire up dependencies compared to manual initialization.

## Files

- `wire.go`: Wire configuration and provider functions (used during code generation)
- `wire_gen.go`: Auto-generated dependency injection code (do not edit manually)

## How It Works

### 1. Provider Functions

Wire uses "provider" functions to create instances:

```go
// ProvideService creates Service with injected dependencies
func ProvideService(
    repo *repository.Repository,
    cfg *config.Config,
    jwtExpiry JWTExpiry,
    refreshExpiry RefreshExpiry,
) *service.Service {
    return service.NewService(repo, cfg.JWT.Secret, time.Duration(jwtExpiry), time.Duration(refreshExpiry))
}
```

### 2. Injector Function

`InitializeHandler` declares what you want to create and what dependencies are available:

```go
func InitializeHandler(
    db *gorm.DB,
    cfg *config.Config,
    jwtExpiry JWTExpiry,
    refreshExpiry RefreshExpiry,
) *handler.Handler {
    wire.Build(
        repository.NewRepository,
        ProvideService,
        ProvideHandler,
    )
    return nil  // Wire replaces this with generated code
}
```

### 3. Code Generation

Wire analyzes the dependencies and generates the wiring code:

```go
func InitializeHandler(db *gorm.DB, cfg *config.Config, jwtExpiry JWTExpiry, refreshExpiry RefreshExpiry) *handler.Handler {
    repositoryRepository := repository.NewRepository(db)
    service := ProvideService(repositoryRepository, cfg, jwtExpiry, refreshExpiry)
    handlerHandler := ProvideHandler(service, db, cfg, jwtExpiry, refreshExpiry)
    return handlerHandler
}
```

## Usage

### Manual Injection (Current)

```go
repo := repository.NewRepository(db)
svc := service.NewService(repo, cfg.JWT.Secret, jwtExpiry, refreshTokenExpiry)
h := handler.NewHandler(handler.HandlerConfig{
    Service:       svc,
    DB:            db,
    CookieConfig:  cfg.Cookie,
    AccessExpiry:  jwtExpiry,
    RefreshExpiry: refreshTokenExpiry,
})
```

### Wire Injection (Alternative)

```go
import wireDI "start-kit-backend/internal/wire"

h := wireDI.InitializeHandler(
    db,
    cfg,
    wireDI.JWTExpiry(jwtExpiry),
    wireDI.RefreshExpiry(refreshTokenExpiry),
)
```

## Regenerating Wire Code

When you modify `wire.go`, regenerate the code:

```bash
# From backend root directory
go run github.com/google/wire/cmd/wire ./internal/wire

# Or use wire directly if installed
cd internal/wire && wire
```

## Named Types

Wire cannot distinguish between multiple parameters of the same type. We use named types to differentiate:

```go
type JWTExpiry time.Duration     // Access token expiry
type RefreshExpiry time.Duration // Refresh token expiry
```

This allows Wire to correctly inject the right duration to the right parameter.

## Benefits

1. **Type Safety**: Compile-time dependency checking
2. **Maintainability**: Centralized dependency configuration
3. **Refactoring**: Easy to add/remove dependencies
4. **Documentation**: Provider functions serve as documentation
5. **No Reflection**: All code is generated at build time

## When to Use

- **Wire**: Complex projects with many layers and dependencies
- **Manual**: Simple projects or when you need fine-grained control

## Learn More

- [Wire Documentation](https://github.com/google/wire)
- [Wire User Guide](https://github.com/google/wire/blob/main/docs/guide.md)
