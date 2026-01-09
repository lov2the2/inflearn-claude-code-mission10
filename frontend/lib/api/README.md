# API Error Handling Framework

This document explains how to use the standardized error handling utilities in the frontend application.

## Overview

The error handling framework provides:
- Type-safe error checking with TypeScript
- User-friendly Korean error messages
- Structured error response handling
- Utility functions for common error scenarios

## Files

- `types/api.ts` - Error type definitions (`APIError`, `ErrorCode`)
- `lib/api/errors.ts` - Error handling utilities
- `lib/api/client.ts` - Axios client with interceptors
- `lib/api/index.ts` - Centralized exports

## Basic Usage

### 1. Import Error Handlers

```typescript
import { handleAPIError, isValidationError, getErrorCode } from '@/lib/api/errors'
```

### 2. Handle Errors in Try-Catch

```typescript
try {
    await apiClient.post('/api/v1/users', userData)
    toast.success('사용자가 생성되었습니다.')
} catch (error: unknown) {
    // Convert error to user-friendly message
    const errorMessage = handleAPIError(error)
    toast.error(errorMessage)
}
```

## Available Functions

### `handleAPIError(error: unknown): string`
Converts any error to a user-friendly Korean message.

**Example**:
```typescript
catch (error) {
    const message = handleAPIError(error)
    // Returns: "세션이 만료되었습니다. 다시 로그인해주세요."
}
```

### `getErrorCode(error: unknown): ErrorCode | null`
Extracts the error code from the API response.

**Example**:
```typescript
catch (error) {
    const code = getErrorCode(error)
    if (code === 'CONFLICT') {
        console.log('Duplicate entry detected')
    }
}
```

### `isErrorCode(error: unknown, code: ErrorCode): boolean`
Checks if error matches a specific error code.

**Example**:
```typescript
catch (error) {
    if (isErrorCode(error, 'FORBIDDEN')) {
        router.push('/unauthorized')
    }
}
```

### `isValidationError(error: unknown): boolean`
Checks if error is a validation error (400 or VALIDATION_ERROR).

**Example**:
```typescript
catch (error) {
    if (isValidationError(error)) {
        const fields = extractValidationErrors(error)
        // Display field-specific errors
    }
}
```

### `extractValidationErrors(error: unknown): Record<string, string> | null`
Extracts field-level validation errors.

**Example**:
```typescript
catch (error) {
    const validationErrors = extractValidationErrors(error)
    if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, message]) => {
            setError(field, { message })
        })
    }
}
```

### `isAuthError(error: unknown): boolean`
Checks if error is an authentication error (401).

**Example**:
```typescript
catch (error) {
    if (isAuthError(error)) {
        clearSession()
        router.push('/login')
    }
}
```

### `isForbiddenError(error: unknown): boolean`
Checks if error is an authorization error (403).

**Example**:
```typescript
catch (error) {
    if (isForbiddenError(error)) {
        toast.error('접근 권한이 없습니다.')
    }
}
```

### `isNetworkError(error: unknown): boolean`
Checks if error is a network connectivity error.

**Example**:
```typescript
catch (error) {
    if (isNetworkError(error)) {
        toast.error('인터넷 연결을 확인해주세요.')
    }
}
```

## Error Code Mapping

| Error Code | HTTP Status | Korean Message |
|-----------|-------------|----------------|
| `UNAUTHORIZED` | 401 | 세션이 만료되었습니다. 다시 로그인해주세요. |
| `FORBIDDEN` | 403 | 접근 권한이 없습니다. |
| `NOT_FOUND` | 404 | 요청한 리소스를 찾을 수 없습니다. |
| `VALIDATION_ERROR` | 400 | 입력값을 확인해주세요. |
| `CONFLICT` | 409 | 이미 존재하는 데이터입니다. |
| `BAD_REQUEST` | 400 | 잘못된 요청입니다. |
| `INTERNAL_ERROR` | 500 | 서버 오류가 발생했습니다. |
| `NETWORK_ERROR` | - | 네트워크 오류가 발생했습니다. |
| `TIMEOUT_ERROR` | - | 요청 시간이 초과되었습니다. |

## Complete Example: Form Submission with Error Handling

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import apiClient from '@/lib/api/client'
import {
    handleAPIError,
    isValidationError,
    extractValidationErrors,
    isAuthError
} from '@/lib/api/errors'

export default function CreateUserForm() {
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit, setError, formState: { errors } } = useForm()

    const onSubmit = async (data: any) => {
        try {
            setIsLoading(true)

            await apiClient.post('/api/v1/users', data)
            toast.success('사용자가 생성되었습니다.')

        } catch (error: unknown) {
            // 1. Get user-friendly message
            const errorMessage = handleAPIError(error)
            toast.error(errorMessage)

            // 2. Handle validation errors (set field-level errors)
            if (isValidationError(error)) {
                const validationErrors = extractValidationErrors(error)
                if (validationErrors) {
                    Object.entries(validationErrors).forEach(([field, message]) => {
                        setError(field, { message })
                    })
                }
            }

            // 3. Handle auth errors (redirect to login)
            if (isAuthError(error)) {
                router.push('/login')
            }

        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('email')} />
            {errors.email && <span>{errors.email.message}</span>}

            <button type="submit" disabled={isLoading}>
                {isLoading ? '처리 중...' : '생성'}
            </button>
        </form>
    )
}
```

## Advanced Usage: Custom Error Handling

```typescript
import { getErrorCode, getStatusCode } from '@/lib/api/errors'

try {
    await apiClient.delete(`/api/v1/users/${userId}`)
} catch (error: unknown) {
    const code = getErrorCode(error)
    const status = getStatusCode(error)

    // Custom handling based on error code
    switch (code) {
        case 'CONFLICT':
            toast.error('이 사용자는 활성 세션이 있어 삭제할 수 없습니다.')
            break
        case 'NOT_FOUND':
            toast.error('사용자를 찾을 수 없습니다.')
            router.push('/users')
            break
        default:
            toast.error(handleAPIError(error))
    }
}
```

## Best Practices

1. **Always use `unknown` type for catch blocks**
   ```typescript
   catch (error: unknown) { // ✅ Good
   catch (error: any) {     // ❌ Avoid
   ```

2. **Use `handleAPIError()` for user-facing messages**
   ```typescript
   const message = handleAPIError(error)
   toast.error(message)
   ```

3. **Check specific error types before custom handling**
   ```typescript
   if (isValidationError(error)) {
       // Handle validation
   } else if (isAuthError(error)) {
       // Handle auth
   } else {
       // Fallback
   }
   ```

4. **Extract validation errors for form fields**
   ```typescript
   const validationErrors = extractValidationErrors(error)
   if (validationErrors) {
       // Set form field errors
   }
   ```

5. **Log errors in development**
   ```typescript
   if (process.env.NODE_ENV === 'development') {
       console.error('API Error:', error)
   }
   ```

## Integration with React Query

```typescript
import { useMutation } from '@tanstack/react-query'
import { handleAPIError } from '@/lib/api/errors'

const createUser = useMutation({
    mutationFn: (data) => apiClient.post('/api/v1/users', data),
    onError: (error: unknown) => {
        toast.error(handleAPIError(error))
    },
    onSuccess: () => {
        toast.success('사용자가 생성되었습니다.')
    }
})
```

## Type Definitions

```typescript
// Error response structure
interface APIError {
    code: string
    message: string
}

// Available error codes
type ErrorCode =
    | 'UNAUTHORIZED'
    | 'NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'INTERNAL_ERROR'
    | 'CONFLICT'
    | 'FORBIDDEN'
    | 'BAD_REQUEST'
    | 'NETWORK_ERROR'
    | 'TIMEOUT_ERROR'
```

---

**Last Updated**: 2026-01-06
