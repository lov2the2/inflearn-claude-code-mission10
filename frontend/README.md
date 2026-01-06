# Frontend - Next.js + TypeScript

Modern React frontend built with Next.js 16, TypeScript, and Tailwind CSS.

## Architecture

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Public routes (login, register)
│   └── (dashboard)/        # Protected routes
│       ├── dashboard/      # User dashboard
│       └── admin/          # Admin panel
├── components/             # React components
│   ├── ui/                 # shadcn/ui + custom components
│   ├── layout/             # Layout components (navbar, etc.)
│   ├── admin/              # Admin-specific components
│   └── dashboard/          # Dashboard-specific components
├── lib/                    # Utilities and libraries
│   ├── config/             # Configuration (API endpoints)
│   ├── api/                # API client
│   │   ├── client.ts       # Axios instance with interceptors
│   │   ├── auth.ts         # Auth API
│   │   ├── admin.ts        # Admin API
│   │   └── user.ts         # User API
│   ├── auth/               # Auth utilities
│   │   ├── session.ts      # Safe session management
│   │   └── role.ts         # Role utilities
│   └── hooks/              # Custom React hooks
└── types/                  # TypeScript types
```

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Data Table**: TanStack Table 8.x
- **Date Formatting**: date-fns
- **State**: React hooks

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running on port 8080

### Installation

```bash
# Install dependencies
cd frontend
npm install

# Set up environment
cp .env.local.example .env.local
# Edit with your configuration

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:3000`

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080    # Backend API URL
API_URL=http://localhost:8080                # Server-side API URL
```

## Features

### Authentication

**Login/Register:**
- Forms with validation (react-hook-form + zod)
- JWT token storage (localStorage)
- Automatic redirect after login
- Error handling with user feedback

**Auto-Refresh:**
- Axios response interceptor detects 401 errors
- Automatically refreshes access token using refresh token
- Retries original request with new token
- Queue mechanism prevents multiple simultaneous refresh calls

**Session Management:**
- Access token and refresh token stored in localStorage
- User info cached in localStorage
- Session cleared on logout
- Auto-redirect to login when token refresh fails

### Protected Routes

Routes wrapped with authentication check:
- `/dashboard` - User dashboard
- `/admin/users` - Admin panel (admin role required)

### Admin Panel

**Location**: `/admin/users`

**Features:**
- User list table with pagination
- Role update dialog (change user ↔ admin)
- Delete user dialog with confirmation
- CSV import with validation and error reporting
- CSV export with auto-download
- Self-protection (can't modify own account)

**Components:**
- `UserListTable` - User list with actions
- `RoleUpdateDialog` - Role change modal
- `DeleteUserDialog` - Delete confirmation
- `CSVImportDialog` - CSV upload with results

### User Dashboard

**Location**: `/dashboard`

**Features:**
- Personal stats cards (Total Logins, Account Age, Total Actions, Last Login)
- Profile information display
- Activity log table with sorting and filtering
- Real-time data from backend APIs
- Loading skeletons for better UX

**Components:**
- `StatsCard` - Displays KPI metrics with icons
- `ActivityTable` - Sortable/filterable activity log using TanStack Table
- `DataTable` - Reusable table component with sorting/filtering/pagination

**API Integration:**
- ✅ `GET /api/v1/users/profile` - User profile data (name, email, role, created_at)
- ✅ `GET /api/v1/users/activity?page=1&limit=10` - Activity logs with pagination
- ✅ `GET /api/v1/users/stats` - User statistics (logins, actions, account age)

**Example Usage:**
```typescript
import { getUserProfile, getUserActivity, getUserStats } from '@/lib/api/user'

// Get profile
const profile = await getUserProfile()

// Get activity with pagination
const activity = await getUserActivity(1, 10)

// Get statistics
const stats = await getUserStats()
```

**Architecture Improvements:**
- Centralized API configuration (`lib/config/api.ts`) - eliminates hardcoded URLs
- Safe localStorage handling (`lib/auth/session.ts`) - prevents crash from corrupted data
- Unified axios client (`lib/api/client.ts`) - removed fetch/axios mixing
- Type-safe API responses with TypeScript interfaces

### API Client

**Structure:**
```typescript
// Centralized API configuration
import { API_CONFIG } from '@/lib/config/api'

// Axios instance with interceptors
import apiClient from '@/lib/api/client'

// Auth endpoints
import { authApi } from '@/lib/api/auth'
authApi.login(credentials)
authApi.register(data)
authApi.refresh(refreshToken)
authApi.logout(refreshToken)

// User endpoints
import { getUserProfile, getUserActivity, getUserStats } from '@/lib/api/user'
getUserProfile()
getUserActivity(page, limit)
getUserStats()

// Admin endpoints
import { adminApi } from '@/lib/api/admin'
adminApi.listUsers({ page, limit })
adminApi.getUser(id)
adminApi.updateUserRole(id, role)
adminApi.deleteUser(id)
adminApi.exportCSV()
adminApi.importCSV(file)
```

**Auto-Refresh Implementation:**
```typescript
// Response interceptor handles 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token and retry
      const newToken = await refreshAccessToken()
      error.config.headers.Authorization = `Bearer ${newToken}`
      return apiClient(error.config)
    }
    return Promise.reject(error)
  }
)
```

## Routes

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page (redirects to /login or /dashboard) |
| `/login` | Login form |
| `/register` | Registration form |

### Protected Routes

| Route | Description | Role Required |
|-------|-------------|---------------|
| `/dashboard` | User dashboard | Any authenticated user |
| `/admin/users` | User management panel | Admin |

## Components

### UI Components (shadcn/ui + Custom)

**Base shadcn/ui components:**
- `button` - Button component
- `input` - Input field
- `card` - Card container
- `dialog` - Modal dialog
- `select` - Select dropdown

**Custom reusable components:**
- `badge` - Badge component for status/tags
- `skeleton` - Loading skeleton placeholder
- `table` - Base table components (Table, TableHeader, TableBody, etc.)
- `table-skeleton` - Loading skeleton specifically for tables
- `confirmation-dialog` - Reusable confirmation modal
- `form-error` - Standardized form error display with icon
- `data-table` - Generic data table with TanStack Table
  - Sorting support
  - Filtering support
  - Pagination support
  - Search functionality

Add more shadcn components:
```bash
npx shadcn@latest add <component-name>
```

### Layout Components

**Navbar** (`/components/layout/navbar.tsx`):
- User info display
- Admin link (conditional)
- Logout button

### Admin Components

**UserListTable** (`/components/admin/user-list-table.tsx`):
- Displays user list with ID, email, name, role
- Action buttons: Change Role, Delete
- Role badges (color-coded)
- Integrates with dialogs

**RoleUpdateDialog** (`/components/admin/role-update-dialog.tsx`):
- Select dropdown for role (admin/user)
- Confirmation buttons
- Updates user role via API

**DeleteUserDialog** (`/components/admin/delete-user-dialog.tsx`):
- Confirmation message
- Cannot delete own account
- Calls delete API

**CSVImportDialog** (`/components/admin/csv-import-dialog.tsx`):
- File upload input
- Format example display
- Import results with success/failure counts
- Row-by-row error reporting
- Default password display for new users

### Dashboard Components

**StatsCard** (`/components/dashboard/stats-card.tsx`):
- Displays KPI metrics with icon
- Shows title, value, and description
- Optional trend indicator (percentage change)
- Accepts Lucide icons

**ActivityTable** (`/components/dashboard/activity-table.tsx`):
- User activity log table
- Uses DataTable component with custom columns
- Sortable by timestamp
- Searchable by description
- Badge display for action types
- Relative time formatting (e.g., "2 hours ago")
- IP address display in monospace font

**Usage Example:**
```typescript
import { StatsCard } from '@/components/dashboard/stats-card'
import { LogIn } from 'lucide-react'

<StatsCard
  title="Total Logins"
  value={stats.totalLogins}
  icon={LogIn}
  description="All-time logins"
/>
```

## Development

### Adding a New Page

1. Create file in `app/` directory:
   ```typescript
   // app/example/page.tsx
   export default function ExamplePage() {
     return <div>Example</div>
   }
   ```

2. For protected route, add layout with auth check:
   ```typescript
   // app/example/layout.tsx
   'use client'
   import { useEffect } from 'react'
   import { useRouter } from 'next/navigation'
   import { getUser } from '@/lib/auth/session'

   export default function ExampleLayout({ children }) {
     const router = useRouter()

     useEffect(() => {
       if (!getUser()) {
         router.push('/login')
       }
     }, [router])

     return children
   }
   ```

### Adding a New API Endpoint

```typescript
// lib/api/example.ts
import apiClient from './client'
import { ApiResponse } from '@/types/api'

export const exampleApi = {
  getData: async (): Promise<DataType> => {
    const response = await apiClient.get<ApiResponse<DataType>>('/api/v1/example')
    return response.data.data
  }
}
```

## Build

### Development Build

```bash
npm run dev       # Start dev server with hot reload
```

### Production Build

```bash
npm run build     # Create optimized production build
npm run start     # Start production server
```

### Linting

```bash
npm run lint      # Run ESLint
```

## Troubleshooting

**API connection failed:**
- Check backend is running: `curl http://localhost:8080/health`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in backend

**401 Unauthorized errors:**
- Check if access token is stored: `localStorage.getItem('access_token')`
- Try logging in again
- Check token expiry time

**Page not found (404):**
- Verify route exists in `app/` directory
- Check file naming (must be `page.tsx` for routes)
- Restart dev server

**Styles not applying:**
- Check Tailwind configuration
- Verify className syntax
- Clear .next cache: `rm -rf .next`

**Build errors:**
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
