# CSV 템플릿 Export 프로젝트 MVP PRD

## 🎯 핵심 정보

**목적**: CSV 파일을 업로드하여 여러 테이블을 Join하고 원하는 형태로 재구성하여 Export할 수 있는 데이터 가공 도구
**사용자**: 데이터 분석가, 백오피스 담당자, 반복적인 CSV 가공 작업이 필요한 실무자

## 🚶 사용자 여정

```
1. 로그인 페이지
   ↓ [로그인 성공]
2. 대시보드 (Dataset 목록)
   ↓ [Upload Dataset 버튼 클릭]
3. CSV 업로드 다이얼로그
   ↓ [파일 선택 및 업로드]
4. Dataset 목록 (새 Dataset 추가됨)
   ↓ [사용자 선택]

   [경로 A: 개별 Dataset 조회]
   → Dataset 상세 페이지 → 데이터 확인 → (옵션) 삭제

   [경로 B: Join Query 생성]
   → Join Query Builder 페이지
   ↓ [5단계 마법사]
5. Step 1: 테이블 선택 (Base + Join 테이블들)
   ↓
6. Step 2: JOIN 타입 선택 (INNER/LEFT/RIGHT/FULL)
   ↓
7. Step 3: JOIN 조건 설정 (컬럼 매칭)
   ↓
8. Step 4: 컬럼 선택 (Export할 컬럼 선택)
   ↓
9. Step 5: 실행 및 미리보기
   ↓ [Export CSV 버튼 클릭]
10. CSV 파일 다운로드 → [완료] → Dataset 목록으로 돌아가기
```

## ⚡ 기능 명세

### 1. MVP 핵심 기능 (✅ 구현 완료)

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|-------------|------------|
| **F001** | CSV 업로드 및 동적 테이블 생성 | CSV 파일을 업로드하면 자동으로 PostgreSQL 테이블 생성 (최대 52MB, 100,000행, 자동 타입 추론) | 데이터 입력의 핵심 기능 | Dataset 목록 페이지 |
| **F002** | Dataset 메타데이터 관리 | 업로드된 Dataset의 이름, 컬럼 정보, 행 수 등 메타데이터 저장 및 조회 | 업로드된 데이터 식별 및 관리 | Dataset 목록 페이지, Dataset 상세 페이지 |
| **F003** | Dataset 데이터 조회 | 업로드된 Dataset의 실제 데이터를 페이지네이션으로 확인 | 업로드 결과 검증 및 데이터 확인 | Dataset 상세 페이지 |
| **F004** | Join Query Builder (5단계 마법사) | 여러 테이블을 선택하고 JOIN 조건을 설정하여 원하는 형태로 데이터 재구성 | 프로젝트 핵심 가치 - 복잡한 SQL 없이 직관적인 Join | Join Query Builder 페이지 |
| **F005** | Join 결과 CSV Export | Join Query 실행 결과를 CSV 파일로 다운로드 | 가공된 데이터 재사용 가능 | Join Query Builder 페이지 |
| **F006** | Dataset 삭제 | 불필요한 Dataset과 해당 테이블 삭제 | 데이터 정리 및 관리 | Dataset 목록 페이지, Dataset 상세 페이지 |

### 2. MVP 필수 지원 기능 (✅ 구현 완료)

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|-------------|------------|
| **F010** | 기본 인증 | JWT 기반 로그인/로그아웃 (access 15분, refresh 7일) | 서비스 접근 제어 | 로그인 페이지 |
| **F011** | 사용자 프로필 조회 | 현재 로그인한 사용자 정보 조회 | 인증 상태 확인 | 프로필 페이지 |
| **F012** | 페이지네이션 | Dataset 목록, Dataset 데이터, Join 결과에 페이지네이션 적용 | 대용량 데이터 처리 성능 | Dataset 목록 페이지, Dataset 상세 페이지, Join Query Builder 페이지 |

### 3. MVP 이후 기능 (제외)

- 개별 Dataset CSV Export (단일 테이블 내보내기)
- 템플릿 저장/재사용 (Join 조건을 템플릿으로 저장하여 반복 사용)
- 고급 Join (3개 이상 테이블 Join, CROSS JOIN, SELF JOIN)
- 프로필 상세 관리 (프로필 수정, 비밀번호 변경)
- 데이터 필터링 및 정렬 (WHERE 조건, ORDER BY)
- 데이터 변환 함수 (날짜 포맷 변경, 문자열 가공)
- Admin 기능 (사용자 관리, CSV Import/Export)
- 실시간 알림 시스템

## 📱 메뉴 구조

```
📱 CSV 템플릿 Export 내비게이션

├── 🏠 홈 (대시보드)
│   └── 기능: F002 (Dataset 목록 조회)
├── ➕ Upload Dataset
│   └── 기능: F001 (CSV 업로드 및 동적 테이블 생성)
├── 🔗 Join Query Builder
│   └── 기능: F004, F005 (Join Query 생성 및 Export)
└── 👤 인증 (비로그인 시)
    └── 로그인 - F010

👤 사용자 메뉴 (로그인 후)
├── 👤 프로필
│   └── 기능: F011 (사용자 정보 조회)
└── 🚪 로그아웃
    └── 기능: F010 (로그아웃)
```

---

## 📄 페이지별 상세 기능

### 로그인 페이지

> **구현 기능:** `F010` | **메뉴 위치:** 비로그인 시 자동 리디렉션

| 항목 | 내용 |
|------|------|
| **역할** | 인증 게이트웨이 - 사용자 인증 및 토큰 발급 |
| **진입 경로** | 앱 최초 접속 시 자동 리디렉션, 로그아웃 시 자동 이동 |
| **사용자 행동** | 이메일과 비밀번호를 입력하여 로그인 |
| **주요 기능** | • 이메일/비밀번호 유효성 검사 (Zod)<br>• JWT 토큰 발급 (access 15분, refresh 7일)<br>• 로그인 실패 시 에러 메시지 표시<br>• **로그인** 버튼 |
| **다음 이동** | 성공 → Dataset 목록 페이지, 실패 → 에러 메시지 표시 |

---

### Dataset 목록 페이지 (대시보드)

> **구현 기능:** `F001`, `F002`, `F006`, `F012` | **인증:** 필수 (로그인)

| 항목 | 내용 |
|------|------|
| **역할** | 랜딩 페이지 - 업로드된 모든 Dataset을 한눈에 확인하고 관리 |
| **진입 경로** | 로그인 직후 자동 이동, 헤더의 홈 버튼 클릭 |
| **사용자 행동** | Dataset 목록 확인, 새 Dataset 업로드, 개별 Dataset 조회/삭제 |
| **주요 기능** | • Dataset 목록 테이블 (이름, 행 수, 컬럼 수, 생성일시)<br>• **Upload Dataset** 다이얼로그 열기 버튼<br>• CSV 파일 선택 및 업로드 (최대 52MB, 100,000행)<br>• 페이지네이션 (10개씩)<br>• **상세보기** 버튼 (각 행)<br>• **삭제** 버튼 (각 행, 확인 다이얼로그) |
| **다음 이동** | 상세보기 → Dataset 상세 페이지, Upload → 업로드 완료 후 목록 갱신 |

---

### Dataset 상세 페이지

> **구현 기능:** `F002`, `F003`, `F006`, `F012` | **인증:** 필수 (로그인)

| 항목 | 내용 |
|------|------|
| **역할** | Dataset 데이터 뷰어 - 업로드된 데이터의 실제 내용 확인 및 검증 |
| **진입 경로** | Dataset 목록에서 **상세보기** 버튼 클릭 |
| **사용자 행동** | Dataset의 메타데이터와 실제 데이터 확인, 필요시 삭제 |
| **주요 기능** | • Dataset 메타데이터 표시 (이름, 행 수, 컬럼 수, 생성일시)<br>• 컬럼 정보 테이블 (컬럼명, 타입)<br>• 데이터 테이블 (TanStack Table, 정렬 가능)<br>• 페이지네이션 (20개씩)<br>• **목록으로** 버튼<br>• **삭제** 버튼 (확인 다이얼로그) |
| **다음 이동** | 목록으로 → Dataset 목록 페이지, 삭제 → 확인 후 목록 페이지 |

---

### Join Query Builder 페이지

> **구현 기능:** `F004`, `F005`, `F012` | **인증:** 필수 (로그인)

| 항목 | 내용 |
|------|------|
| **역할** | 핵심 작업 수행 - 복잡한 SQL 없이 직관적인 UI로 여러 테이블 Join 및 Export |
| **진입 경로** | 헤더의 **Join Query Builder** 메뉴 클릭 |
| **사용자 행동** | 5단계 마법사를 통해 Join 조건 설정 → 실행 → CSV Export |
| **주요 기능** | • **Step 1**: Base 테이블 선택 (드롭다운)<br>• **Step 2**: Join 테이블 추가 (Multiple Select)<br>• **Step 3**: JOIN 타입 선택 (INNER/LEFT/RIGHT/FULL)<br>• **Step 4**: JOIN 조건 설정 (컬럼 매칭, 다중 조건 지원)<br>• **Step 5**: Export할 컬럼 선택 (체크박스)<br>• **실행** 버튼 - Join 결과 미리보기 (페이지네이션 10개씩)<br>• **Export CSV** 버튼 - join_query_results_{timestamp}.csv 다운로드<br>• **리셋** 버튼 - 모든 설정 초기화 |
| **다음 이동** | Export 완료 → CSV 다운로드, 리셋 → Step 1부터 재시작 |

---

### 프로필 페이지

> **구현 기능:** `F011` | **인증:** 필수 (로그인)

| 항목 | 내용 |
|------|------|
| **역할** | 사용자 정보 확인 - 로그인한 사용자의 기본 정보 표시 |
| **진입 경로** | 헤더의 사용자 메뉴 → **프로필** 클릭 |
| **사용자 행동** | 자신의 이메일, 역할 등 정보 확인 |
| **주요 기능** | • 사용자 정보 표시 (이메일, 역할, 가입일시)<br>• **대시보드로** 버튼 |
| **다음 이동** | 대시보드로 → Dataset 목록 페이지 |

---

## 🗄️ 데이터 모델

### users (사용자 정보)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| id | 고유 식별자 | UUID |
| email | 이메일 (로그인 ID) | string (unique) |
| password_hash | 암호화된 비밀번호 | string |
| role | 사용자 역할 | enum (admin, user) |
| created_at | 생성일시 | timestamp |
| updated_at | 수정일시 | timestamp |

### refresh_tokens (리프레시 토큰)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| id | 고유 식별자 | UUID |
| user_id | 사용자 ID | → users.id |
| token | 리프레시 토큰 값 | string |
| expires_at | 만료일시 | timestamp |
| created_at | 생성일시 | timestamp |

### datasets (Dataset 메타데이터)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| id | 고유 식별자 | UUID |
| name | Dataset 이름 (원본 파일명) | string |
| table_name | 동적 생성된 테이블명 | string (unique) |
| row_count | 총 행 수 | integer |
| column_count | 총 컬럼 수 | integer |
| columns | 컬럼 정보 (이름, 타입) | JSONB |
| created_at | 생성일시 | timestamp |
| updated_at | 수정일시 | timestamp |

### dataset_[uuid] (동적 생성 테이블)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| id | 고유 식별자 | serial (auto-increment) |
| [컬럼명] | CSV의 각 컬럼 | text/integer/numeric/boolean/timestamp |

**설계 원칙**:
- `datasets` 테이블은 메타데이터만 저장
- 실제 CSV 데이터는 `dataset_[uuid]` 형식의 동적 테이블에 저장
- 컬럼 타입은 자동 추론 (text, integer, numeric, boolean, timestamp)
- 컬럼명은 SQL Injection 방지를 위해 sanitization 처리

---

## 🛠️ 기술 스택 (최신 버전)

### 🎨 프론트엔드 프레임워크

- **Next.js 16** (App Router) - React 풀스택 프레임워크
- **TypeScript 5.x** - 타입 안전성 보장
- **React 19** - UI 라이브러리 (최신 동시성 기능)

### 🎨 스타일링 & UI

- **TailwindCSS v4** (설정파일 없는 새로운 엔진) - 유틸리티 CSS 프레임워크
- **shadcn/ui** - 고품질 React 컴포넌트 라이브러리
- **Lucide React** - 아이콘 라이브러리
- **TanStack React Table** - 데이터 테이블 (정렬, 페이지네이션)

### 📝 폼 & 검증

- **React Hook Form 7.x** - 폼 상태 관리
- **Zod** - 스키마 검증 라이브러리

### 🔄 상태 관리

- **TanStack Query (React Query) 5.x** - 서버 상태 관리 (캐싱, 리패칭)
- **Axios 1.x** - HTTP 클라이언트 (자동 토큰 갱신 인터셉터)

### 🗄️ 백엔드 & 데이터베이스

- **Go 1.21+** - 백엔드 런타임
- **Gin** - HTTP 웹 프레임워크
- **GORM** - ORM (객체-관계 매핑)
- **PostgreSQL 16** - 관계형 데이터베이스
- **golang-jwt v5** - JWT 인증 라이브러리

### 🐳 인프라 & 도구

- **Docker Compose** - PostgreSQL 컨테이너 오케스트레이션
- **Air** - Go 핫 리로드 (개발 환경)
- **Swagger (swaggo)** - API 문서 자동 생성

### 🚀 배포 & 호스팅

- **Vercel** (권장) - Next.js 16 최적화 배포 플랫폼
- **Docker** - 백엔드 컨테이너화 (프로덕션)

### 📦 패키지 관리

- **Go Modules** - Go 의존성 관리
- **npm** - Node.js 의존성 관리

---

## 📌 MVP 범위 요약

### ✅ 포함된 기능
- CSV 업로드 및 동적 테이블 생성 (타입 추론, 대용량 처리)
- Dataset 메타데이터 관리 (CRUD)
- Dataset 데이터 조회 (페이지네이션)
- Join Query Builder (5단계 마법사, INNER/LEFT/RIGHT/FULL)
- Join 결과 CSV Export
- JWT 인증 (로그인/로그아웃)

### ❌ 제외된 기능 (MVP 이후)
- 개별 Dataset CSV Export
- 템플릿 저장/재사용
- 고급 Join (3개 이상 테이블, CROSS JOIN)
- 프로필 수정 기능
- 데이터 필터링/정렬
- Admin 기능 (사용자 관리)
- 실시간 알림

---

**Version**: 1.0.0
**Created**: 2026-01-11
**Maintained by**: Claude Code
