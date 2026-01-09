# Cookie-Based Authentication Migration (Phase 2.1)

## Overview

This document describes the frontend changes for migrating from localStorage-based token management to HttpOnly cookie-based authentication.

## What Changed

### 1. HTTP Client Configuration (`lib/api/client.ts`)

**Before**:
- Manually injected `Authorization: Bearer <token>` header from localStorage
- Complex token refresh logic with request queuing
- Stored and managed tokens in localStorage

**After**:
- Added `withCredentials: true` to axios instance
- Browser automatically sends cookies with every request
- Simplified error handling - just redirect to login on 401
- Backend handles token refresh automatically via cookies

**Key Changes**:
```typescript
// Added to axios config
withCredentials: true,

// Removed manual Authorization header injection
// Removed token refresh logic and request queue
// Simplified 401 error handling
```

### 2. Session Management (`lib/auth/session.ts`)

**Before**:
- Stored `access_token`, `refresh_token`, and `user` in localStorage
- Functions: `getAccessToken()`, `getRefreshToken()`, `setSession()`, `clearSession()`

**After**:
- Only stores `user` information in localStorage (non-sensitive data)
- Removed `getAccessToken()` and `getRefreshToken()` functions
- Updated `setSession()` to only store user info
- Updated `isAuthenticated()` to check for user data instead of token

**Key Changes**:
```typescript
// setSession - only stores user info now
localStorage.setItem('user', JSON.stringify(authResponse.user))
// No longer stores access_token or refresh_token

// Removed functions
// - getAccessToken()
// - getRefreshToken()
```

### 3. Authentication API (`lib/api/auth.ts`)

**Before**:
- `logout()` required refresh token as parameter
- `refresh()` function existed for manual token refresh

**After**:
- `logout()` takes no parameters (backend reads cookie)
- Removed `refresh()` function (backend handles automatically)

**Key Changes**:
```typescript
// Before
logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout', {
        refresh_token: refreshToken
    })
}

// After
logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout')
}
```

### 4. Logout Functionality (`components/layout/navbar.tsx`)

**Before**:
- Retrieved refresh token from localStorage
- Passed token to logout API

**After**:
- No token retrieval needed
- Backend reads token from HttpOnly cookie

**Key Changes**:
```typescript
// Before
const refreshToken = getRefreshToken()
if (refreshToken) {
    await authApi.logout(refreshToken)
}

// After
await authApi.logout()  // No token parameter needed
```

## What Stayed the Same

### Login/Register Forms
- No changes needed
- Still call `setSession(response)` after successful auth
- `setSession()` now only stores user info (tokens are in cookies)

### Type Definitions
- `AuthResponse` still includes `access_token` and `refresh_token`
- Backend still returns these in JSON (but we don't store them)
- Cookies are set automatically via `Set-Cookie` headers

## Security Improvements

1. **HttpOnly Cookies**: Tokens not accessible to JavaScript (XSS protection)
2. **No localStorage Tokens**: Prevents token theft via XSS
3. **Secure Flag**: Cookies only sent over HTTPS in production
4. **SameSite**: Protection against CSRF attacks

## Testing Checklist

- [ ] Login successfully sets user data in localStorage (not tokens)
- [ ] Authenticated requests include cookies automatically
- [ ] 401 errors redirect to login page
- [ ] Logout clears cookies on backend and user data on frontend
- [ ] Register flow works with cookies
- [ ] Protected routes still work
- [ ] No localStorage entries for `access_token` or `refresh_token`

## Migration Steps for Developers

1. Clear browser localStorage: `localStorage.clear()`
2. Clear browser cookies for the app domain
3. Test login flow - verify cookies are set in DevTools
4. Test authenticated requests - verify cookies sent automatically
5. Test logout - verify cookies are cleared

## Notes

- Backend must set cookies with proper `SameSite`, `Secure`, and `HttpOnly` flags
- Frontend development (localhost) may need special CORS configuration
- Browser DevTools > Application > Cookies to inspect cookie values
- Network tab shows `Cookie` header in requests and `Set-Cookie` in responses
