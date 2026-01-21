# Frontend - Next.js + TypeScript

Next.js 16, TypeScript, Tailwind CSS로 구축된 모던 React 프론트엔드입니다.

## 아키텍처

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 공개 라우트 (로그인, 회원가입)
│   └── (dashboard)/        # 보호된 라우트
│       ├── dashboard/      # 사용자 대시보드
│       └── admin/          # 관리자 패널
├── components/             # React 컴포넌트
│   ├── ui/                 # shadcn/ui + 커스텀 컴포넌트
│   ├── layout/             # 레이아웃 컴포넌트 (navbar 등)
│   ├── admin/              # 관리자 전용 컴포넌트
│   └── dashboard/          # 대시보드 전용 컴포넌트
├── lib/                    # 유틸리티 및 라이브러리
│   ├── config/             # 설정 (API 엔드포인트)
│   ├── api/                # API 클라이언트
│   │   ├── client.ts       # 인터셉터가 포함된 Axios 인스턴스
│   │   ├── auth.ts         # 인증 API
│   │   ├── admin.ts        # 관리자 API
│   │   └── user.ts         # 사용자 API
│   ├── auth/               # 인증 유틸리티
│   │   ├── session.ts      # 안전한 세션 관리
│   │   └── role.ts         # 역할 유틸리티
│   └── hooks/              # 커스텀 React 훅
└── types/                  # TypeScript 타입
```

## 기술 스택

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Data Table**: TanStack Table 8.x
- **Date Formatting**: date-fns
- **State**: React hooks + TanStack Query
- **Theme**: next-themes (dark mode)
- **Charts**: recharts (data visualization)
- **Toast**: sonner (notifications)
- **Loading**: nextjs-toploader (page transitions)
- **Testing**: Vitest + Testing Library

## 빠른 시작

### 사전 요구사항

- Node.js 18+
- npm 또는 yarn
- 실행 중인 백엔드 서버 (기본 포트: 8080, `.env`에서 변경 가능)

### 설치

```bash
# 의존성 설치
cd frontend
npm install

# 환경변수 설정
cp .env.local.example .env.local
# 설정에 맞게 편집

# 개발 서버 시작
npm run dev
```

프론트엔드는 기본적으로 `http://localhost:3000`에서 실행됩니다 (`.env.local`의 포트 변경 가능).

## 환경 변수

```env
NEXT_PUBLIC_API_URL=http://localhost:8080    # 클라이언트 사이드 API URL (백엔드 포트와 일치)
API_URL=http://localhost:8080                # 서버 사이드 API URL (백엔드 포트와 일치)
```

**환경변수 용도:**
- `NEXT_PUBLIC_*`: 클라이언트 사이드(브라우저)에서 접근 가능한 변수. React 컴포넌트에서 사용.
- `API_URL`: 서버 사이드(Server Components, API Routes)에서만 접근 가능. 보안이 필요한 경우 사용.

**참고**: 둘 다 같은 값이어도 됩니다. 단, `NEXT_PUBLIC_` 접두사가 없는 변수는 클라이언트에 노출되지 않습니다.

## 기능

### 인증 (Authentication)

**로그인/회원가입:**
- 유효성 검사가 포함된 폼 (react-hook-form + zod)
- 사용자 정보 저장 (localStorage, 토큰은 쿠키에 저장)
- 로그인 후 자동 리다이렉트
- 사용자 피드백과 함께 에러 처리

**자동 쿠키 처리 (HttpOnly Cookie 기반):**
- 백엔드가 HttpOnly 쿠키로 토큰 저장 및 관리
- `withCredentials: true` 설정으로 자동 쿠키 전송
- 토큰 갱신은 백엔드에서 자동 처리 (프론트엔드 개입 불필요)
- JavaScript에서 토큰 접근 불가 (XSS 공격 방지)

**세션 관리:**
- localStorage에 사용자 정보만 저장 (토큰 제외)
- 로그아웃 시 백엔드가 쿠키 삭제 및 프론트엔드 세션 정리
- 401 에러 시 자동으로 로그인 페이지로 리다이렉트

### 보호된 라우트

인증 확인이 적용된 라우트:
- `/dashboard` - 사용자 대시보드
- `/admin/users` - 관리자 패널 (관리자 역할 필요)

### 관리자 패널

**위치**: `/admin/users`

**기능:**
- 페이지네이션이 포함된 사용자 목록 테이블
- 역할 변경 다이얼로그 (user ↔ admin 변경)
- 확인 절차가 포함된 사용자 삭제 다이얼로그
- 유효성 검사 및 에러 보고가 포함된 CSV 가져오기
- 자동 다운로드 기능이 있는 CSV 내보내기
- 자기 보호 (자신의 계정은 수정 불가)

**컴포넌트:**
- `UserListTable` - 액션이 포함된 사용자 목록
- `RoleUpdateDialog` - 역할 변경 모달
- `DeleteUserDialog` - 삭제 확인
- `CSVImportDialog` - 결과가 포함된 CSV 업로드

### 사용자 대시보드

**위치**: `/dashboard`

**기능:**
- 개인 통계 카드 (총 로그인 수, 계정 기간, 총 활동 수, 마지막 로그인)
- 프로필 정보 표시
- 정렬 및 필터링이 가능한 활동 로그 테이블
- 백엔드 API의 실시간 데이터
- 향상된 UX를 위한 로딩 스켈레톤

**컴포넌트:**
- `StatsCard` - 아이콘과 함께 KPI 메트릭 표시
- `ActivityTable` - TanStack Table을 사용한 정렬/필터링 가능한 활동 로그
- `DataTable` - 정렬/필터링/페이지네이션이 가능한 재사용 가능한 테이블 컴포넌트

**API 통합:**
- ✅ `GET /api/v1/users/profile` - 사용자 프로필 데이터 (이름, 이메일, 역할, 생성일)
- ✅ `GET /api/v1/users/activity?page=1&limit=10` - 페이지네이션이 포함된 활동 로그
- ✅ `GET /api/v1/users/stats` - 사용자 통계 (로그인, 활동, 계정 기간)

**사용 예시:**
```typescript
import { getUserProfile, getUserActivity, getUserStats } from '@/lib/api/user'

// 프로필 가져오기
const profile = await getUserProfile()

// 페이지네이션과 함께 활동 가져오기
const activity = await getUserActivity(1, 10)

// 통계 가져오기
const stats = await getUserStats()
```

**아키텍처 개선:**
- 중앙화된 API 설정 (`lib/config/api.ts`) - 하드코딩된 URL 제거
- 안전한 localStorage 처리 (`lib/auth/session.ts`) - 손상된 데이터로 인한 충돌 방지
- 통합된 axios 클라이언트 (`lib/api/client.ts`) - fetch/axios 혼용 제거
- TypeScript 인터페이스를 사용한 타입 안전 API 응답

### API 클라이언트

**구조:**
```typescript
// 중앙화된 API 설정
import { API_CONFIG } from '@/lib/config/api'

// 인터셉터가 포함된 Axios 인스턴스
import apiClient from '@/lib/api/client'

// 인증 엔드포인트
import { authApi } from '@/lib/api/auth'
authApi.login(credentials)
authApi.register(data)
authApi.refresh(refreshToken)
authApi.logout(refreshToken)

// 사용자 엔드포인트
import { getUserProfile, getUserActivity, getUserStats } from '@/lib/api/user'
getUserProfile()
getUserActivity(page, limit)
getUserStats()

// 관리자 엔드포인트
import { adminApi } from '@/lib/api/admin'
adminApi.listUsers({ page, limit })
adminApi.getUser(id)
adminApi.updateUserRole(id, role)
adminApi.deleteUser(id)
adminApi.exportCSV()
adminApi.importCSV(file)
```

**자동 갱신 구현:**
```typescript
// 응답 인터셉터가 401 처리
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // 토큰 갱신 및 재시도
      const newToken = await refreshAccessToken()
      error.config.headers.Authorization = `Bearer ${newToken}`
      return apiClient(error.config)
    }
    return Promise.reject(error)
  }
)
```

## 라우트

### 공개 라우트

| 라우트 | 설명 |
|-------|------|
| `/` | 랜딩 페이지 (/login 또는 /dashboard로 리다이렉트) |
| `/login` | 로그인 폼 |
| `/register` | 회원가입 폼 |

### 보호된 라우트

| 라우트 | 설명 | 필요한 역할 |
|-------|------|------------|
| `/dashboard` | 사용자 대시보드 | 인증된 모든 사용자 |
| `/admin/users` | 사용자 관리 패널 | Admin |

## 컴포넌트

### UI 컴포넌트 (shadcn/ui + 커스텀)

**기본 shadcn/ui 컴포넌트:**
- `button` - 버튼 컴포넌트
- `input` - 입력 필드
- `card` - 카드 컨테이너
- `dialog` - 모달 다이얼로그
- `select` - 선택 드롭다운

**커스텀 재사용 가능 컴포넌트:**
- `badge` - 상태/태그용 배지 컴포넌트
- `skeleton` - 로딩 스켈레톤 플레이스홀더
- `table` - 기본 테이블 컴포넌트 (Table, TableHeader, TableBody 등)
- `table-skeleton` - 테이블 전용 로딩 스켈레톤
- `confirmation-dialog` - 재사용 가능한 확인 모달
- `form-error` - 아이콘이 포함된 표준화된 폼 에러 표시
- `data-table` - TanStack Table을 사용한 범용 데이터 테이블
  - 정렬 지원
  - 필터링 지원
  - 페이지네이션 지원
  - 검색 기능

shadcn 컴포넌트 추가:
```bash
npx shadcn@latest add <component-name>
```

### 레이아웃 컴포넌트

**Navbar** (`/components/layout/navbar.tsx`):
- 사용자 정보 표시
- 관리자 링크 (조건부)
- 로그아웃 버튼

### 관리자 컴포넌트

**UserListTable** (`/components/admin/user-list-table.tsx`):
- ID, 이메일, 이름, 역할이 포함된 사용자 목록 표시
- 액션 버튼: 역할 변경, 삭제
- 역할 배지 (색상 코드 포함)
- 다이얼로그와 통합

**RoleUpdateDialog** (`/components/admin/role-update-dialog.tsx`):
- 역할 선택 드롭다운 (admin/user)
- 확인 버튼
- API를 통한 사용자 역할 업데이트

**DeleteUserDialog** (`/components/admin/delete-user-dialog.tsx`):
- 확인 메시지
- 자신의 계정 삭제 불가
- 삭제 API 호출

**CSVImportDialog** (`/components/admin/csv-import-dialog.tsx`):
- 파일 업로드 입력
- 형식 예시 표시
- 성공/실패 횟수가 포함된 가져오기 결과
- 행별 에러 보고
- 신규 사용자를 위한 기본 비밀번호 표시

### 대시보드 컴포넌트

**StatsCard** (`/components/dashboard/stats-card.tsx`):
- 아이콘과 함께 KPI 메트릭 표시
- 제목, 값, 설명 표시
- 선택적 트렌드 표시기 (백분율 변화)
- Lucide 아이콘 사용

**ActivityTable** (`/components/dashboard/activity-table.tsx`):
- 사용자 활동 로그 테이블
- 커스텀 컬럼이 포함된 DataTable 컴포넌트 사용
- 타임스탬프별 정렬 가능
- 설명으로 검색 가능
- 활동 유형별 배지 표시
- 상대 시간 포맷팅 (예: "2시간 전")
- 고정폭 글꼴로 IP 주소 표시

**사용 예시:**
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

## 개발

### 새 페이지 추가

1. `app/` 디렉토리에 파일 생성:
   ```typescript
   // app/example/page.tsx
   export default function ExamplePage() {
     return <div>Example</div>
   }
   ```

2. 보호된 라우트의 경우, 인증 확인이 포함된 레이아웃 추가:
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

### 새 API 엔드포인트 추가

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

## 빌드

### 개발 빌드

```bash
npm run dev       # 핫 리로드가 포함된 개발 서버 시작
```

### 프로덕션 빌드

```bash
npm run build     # 최적화된 프로덕션 빌드 생성
npm run start     # 프로덕션 서버 시작
```

### 린팅

```bash
npm run lint      # ESLint 실행
```

## 테스트

프로젝트는 **Vitest**와 **Testing Library**를 사용하여 테스트를 실행합니다.

### 테스트 명령어

```bash
npm run test           # 감시 모드로 테스트 실행
npm run test:run       # 한 번만 테스트 실행
npm run test:coverage  # 커버리지 리포트 생성
```

### 테스트 파일 위치

테스트 파일은 소스 파일과 동일한 디렉토리에 `*.test.tsx` 또는 `*.test.ts` 형식으로 배치합니다:

```
components/
├── ui/
│   ├── button.tsx
│   └── button.test.tsx    # 컴포넌트 테스트
lib/
├── api/
│   ├── client.ts
│   └── client.test.ts     # 유틸리티 테스트
```

### 테스트 작성 예시

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
```

## 문제 해결

**API 연결 실패:**
- 백엔드가 실행 중인지 확인: `curl http://localhost:8080/health`
- `.env.local`에서 `NEXT_PUBLIC_API_URL` 확인
- 백엔드의 CORS 설정 확인

**401 Unauthorized 에러:**
- 브라우저 개발자 도구 > Application > Cookies에서 쿠키 확인
- 쿠키가 없으면 다시 로그인 시도
- 백엔드 로그 확인 (토큰 유효성 검증 실패 원인)

**페이지를 찾을 수 없음 (404):**
- `app/` 디렉토리에 라우트가 존재하는지 확인
- 파일 이름 확인 (라우트는 반드시 `page.tsx`여야 함)
- 개발 서버 재시작

**스타일 적용 안 됨:**
- Tailwind 설정 확인
- className 구문 확인
- .next 캐시 삭제: `rm -rf .next`

**빌드 에러:**
- node_modules 삭제: `rm -rf node_modules package-lock.json && npm install`
- TypeScript 에러 확인: `npx tsc --noEmit`
