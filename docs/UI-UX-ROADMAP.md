# UI/UX 개선 및 사용자 워크플로우 로드맵

---

## 🚨 COMMIT CONVENTION (이 프로젝트 전용)

**이 프로젝트는 `/git:commit` 명령어를 사용하되, 다음 규칙을 반드시 따라야 합니다:**

### 필수 형식

```
<type>(<scope>): <subject> - Phase X.X (docs/UI-UX-ROADMAP.md)
```

**필수 포함 항목**:
- **Scope**: `frontend`, `backend`, `fullstack` 중 하나
- **Phase 번호**: 현재 작업 중인 Phase (예: Phase 1.2)
- **로드맵 참조**: `(docs/UI-UX-ROADMAP.md)` 포함

### 예시

**Frontend만 변경**:
```
feat(frontend): Implement toast notification system - Phase 1.2 (docs/UI-UX-ROADMAP.md)
```

**Backend만 변경**:
```
feat(backend): Add user profile update endpoints - Phase 2.2 (docs/UI-UX-ROADMAP.md)
```

**Fullstack 변경**:
```
feat(fullstack): Implement profile edit feature - Phase 2.2 (docs/UI-UX-ROADMAP.md)
```

### Monorepo Git 워크플로우

**중요**: 이 프로젝트는 Monorepo 구조로 루트 디렉토리에서만 Git을 관리합니다.

- ✅ 모든 Git 명령은 프로젝트 루트에서 실행
- ❌ `frontend/.git` 또는 `backend/.git` 존재하면 안 됨
- 루트 경로: `/Users/junseokh-air/Projects/Study/inflearn/claude-code-mastery/starter-kit-mission`

**작업 전 확인**:
```bash
pwd  # 현재 위치 확인
git remote -v  # origin이 올바른지 확인
```

---

## 프로젝트 컨텍스트

**프로젝트**: Go + Next.js Full-stack Starter Kit
**현재 완성도**: 88%
**목표**: 로그인 전/후 사용자 경험 개선 및 프론트엔드 고도화

### 현재 상태

**✅ 완성된 기능:**
- 인증 시스템 (JWT, 자동 토큰 갱신)
- 사용자 대시보드 (프로필, 통계, 활동 로그)
- 관리자 패널 (사용자 관리, CSV import/export)
- Clean Architecture 백엔드
- shadcn/ui 기반 컴포넌트

**⚠️ 개선 필요:**
- 홈페이지: 기본 Next.js 템플릿 (자동 리다이렉트 없음)
- 성공 피드백: 토스트 알림 부재
- 모바일 UX: 햄버거 메뉴 없음
- React Query: 설치되어 있지만 미사용
- 프로필 수정: 기능 없음
- 관리자: 사용자 생성 UI, 검색 기능 없음

**📊 기술 스택:**
- Backend: Go, Gin, PostgreSQL, GORM, JWT
- Frontend: Next.js 15, TypeScript, Tailwind, shadcn/ui, React Query
- Auth: JWT (15min access + 7day refresh), RBAC

---

## 사용자 플로우 설계

### 로그인 전 (Guest User)

```
방문자 → / (홈페이지)
├─ 인증 상태 확인
│  ├─ 로그인 O → /dashboard 자동 리다이렉트
│  └─ 로그인 X → 랜딩 페이지 표시
│     ├─ Hero Section (가치 제안)
│     ├─ Features (주요 기능 3개)
│     ├─ CTA 버튼 (Sign Up, Login)
│     └─ Footer
│
└─ Navbar (Public)
   ├─ Logo
   └─ Login / Sign Up 버튼
```

### 로그인 후 (Authenticated User)

```
로그인 성공 → /dashboard
├─ 일반 사용자
│  ├─ 통계 카드 4개 (로그인, 계정 나이, 활동, 마지막 로그인)
│  ├─ 프로필 정보
│  ├─ 최근 활동 로그
│  └─ Navbar: Dashboard, Profile, Logout
│
└─ 관리자 (Admin)
   ├─ 일반 사용자와 동일한 대시보드
   ├─ Navbar에 "Admin" 링크 추가
   └─ /admin/users
      ├─ 사용자 목록 (페이지네이션)
      ├─ 검색 (이름/이메일)
      ├─ 역할 변경
      ├─ 사용자 삭제
      ├─ CSV Import/Export
      └─ 사용자 생성 (신규)
```

---

## UI/UX 개선 로드맵

### Phase 1 - 즉시 개선 (1주, 프론트엔드만)

**목표**: 핵심 UX 개선으로 사용자 만족도 200% 향상

#### 1.1 홈페이지 개선 (2-3일)

**작업:**
- [ ] 자동 리다이렉트 로직 추가
- [ ] 랜딩 페이지 디자인 (Hero + Features + CTA)
- [ ] Guest Navbar 구현

**예상 결과**: 방문자가 3초 내에 회원가입/로그인 경로 이해

#### 1.2 토스트 알림 시스템 (1일)

**작업:**
- [ ] shadcn toast 설치: `npx shadcn@latest add toast`
- [ ] Toaster를 layout.tsx에 추가
- [ ] 모든 주요 액션에 토스트 통합
  - 로그인/회원가입 성공
  - 역할 변경/사용자 삭제 성공
  - CSV Import 완료

**예상 결과**: 모든 액션에 명확한 피드백 제공

#### 1.3 모바일 네비게이션 (1-2일)

**작업:**
- [ ] shadcn sheet 설치 (사이드 메뉴)
- [ ] 햄버거 메뉴 아이콘
- [ ] 모바일 메뉴 레이아웃
- [ ] 반응형 브레이크포인트 (768px)

**예상 결과**: 모바일 완벽 지원

#### 1.4 로딩 상태 개선 (1일)

**작업:**
- [ ] 일관된 스켈레톤 UI
- [ ] 버튼 로딩 스피너
- [ ] 페이지 전환 로딩 인디케이터

**예상 결과**: 모든 비동기 작업에 시각적 피드백

---

### Phase 2 - 단기 개선 (2-3주, Full-stack)

**목표**: 핵심 기능 추가 및 기술 부채 해결

#### 2.1 React Query 마이그레이션 (3-4일)

**작업:**
- [ ] QueryClientProvider 설정
- [ ] API 호출을 커스텀 훅으로 변환
  - `useUserProfile()`, `useUserStats()`, `useUserActivity()`
  - `useUserList()`, `useUpdateRole()`, `useDeleteUser()`
- [ ] 자동 refetch 및 캐싱 설정

**예상 결과**: 중복 API 요청 제거, 네트워크 요청 50% 감소

#### 2.2 프로필 수정 기능 (3-4일)

**백엔드 API:**
- `PATCH /api/v1/users/profile` - 이름 수정
- `PATCH /api/v1/users/password` - 비밀번호 변경

**프론트엔드:**
- [ ] `/dashboard/profile` 페이지 생성
- [ ] 프로필 편집 폼 (react-hook-form + zod)
- [ ] 비밀번호 변경 폼 (현재/새 비밀번호 검증)

**예상 결과**: 사용자가 이름/비밀번호 변경 가능

#### 2.3 관리자 기능 강화 (2-3일) ✅ 완료

**작업:**
- [x] 사용자 검색 (이름/이메일)
- [x] 역할 필터
- [x] 사용자 생성 UI (다이얼로그)
- [x] 사용자 상세 페이지 (`/admin/users/[id]`)

**예상 결과**: 관리자 생산성 향상

**구현 내용:**
- 백엔드: 검색/필터 파라미터 추가, CreateUser API 구현
- 프론트엔드: 검색/필터 UI, 사용자 생성 다이얼로그, 사용자 상세 페이지
- 자동 비밀번호 생성 기능 (비밀번호 미입력 시)

---

### Phase 3 - 중기 개선 (1-2개월)

**목표**: 고급 기능 및 시각화

#### 3.1 대시보드 시각화 (1주)

**작업:**
- [ ] 차트 라이브러리 추가 (recharts)
- [ ] 로그인 트렌드 그래프
- [ ] 활동 분포 차트
- [ ] 월별 통계

#### 3.2 다크 모드 (3-4일)

**작업:**
- [ ] next-themes 설정
- [ ] 다크 모드 토글 버튼
- [ ] Tailwind dark: variants
- [ ] 사용자 선호도 저장

#### 3.3 Activity 실제 구현 (1주)

**백엔드:**
- [ ] Activity 테이블 생성 (마이그레이션)
- [ ] Activity 자동 기록 Middleware
- [ ] 실제 로그인/액션 추적

**프론트엔드:**
- API 연결 (이미 준비됨)

---

## 단계별 실행 방법

### 📁 계획 파일 저장 위치

이 로드맵은 다음 위치에 저장됩니다:
- **프로젝트 내**: `docs/UI-UX-ROADMAP.md`
- **Claude Plans**: `~/.claude/plans/velvet-yawning-hickey.md`

### 🚀 단계별 실행 요청 방법

각 Phase를 실행하려면 다음과 같이 요청하세요:

#### Phase 1.1 실행
```
Phase 1.1 실행: 홈페이지 개선 + 토스트 시스템
```

#### Phase 1.2 실행
```
Phase 1.2 실행: 모바일 네비게이션
```

#### Phase 1.3 실행
```
Phase 1.3 실행: 로딩 상태 개선
```

#### 전체 Phase 1 실행
```
Phase 1 전체 실행
```

#### 특정 기능만 실행
```
토스트 알림 시스템만 구현해줘
```

또는

```
랜딩 페이지만 먼저 만들어줘
```

### 📝 계획 파일 참조 방법

실행 중에 계획을 참조하려면:
```
docs/UI-UX-ROADMAP.md 참고해서 Phase 1.1 실행
```

### 💡 토큰 절약 팁

1. **단계별 실행**: 한 번에 하나의 Phase만 요청
2. **간단한 요청**: "Phase 1.1 실행" (상세 설명 불필요)
3. **컨텍스트 유지**: 같은 세션에서 순차 진행

---

## 실행 우선순위 매트릭스

| 작업 | 사용자 영향 | 난이도 | 백엔드 필요 | 점수 | 순위 |
|------|------------|--------|-----------|------|------|
| 홈페이지 리다이렉트 | 높음 | 낮음 | X | 9 | 1 |
| 토스트 시스템 | 높음 | 낮음 | X | 9 | 1 |
| 랜딩 페이지 | 높음 | 중간 | X | 7 | 3 |
| 모바일 네비 | 높음 | 중간 | X | 7 | 3 |
| React Query | 중간 | 중간 | X | 5 | 5 |
| 프로필 수정 | 높음 | 중간 | O | 6 | 4 |
| 관리자 검색 | 중간 | 낮음 | X | 6 | 4 |
| 대시보드 차트 | 중간 | 중간 | X | 5 | 5 |
| 다크 모드 | 낮음 | 낮음 | X | 4 | 7 |
| Activity 구현 | 중간 | 높음 | O | 3 | 8 |

---

## 예상 타임라인

### 1주차: Phase 1 (프론트엔드만)
- **Day 1-2**: 홈페이지 + 토스트
- **Day 3-4**: 랜딩 페이지 디자인
- **Day 5**: 모바일 네비 + 로딩 개선

**완료 시 효과**: 사용자 경험 200% 향상

### 2주차: Phase 2 시작 (Full-stack)
- **Day 1-2**: 관리자 검색/생성 UI
- **Day 3-4**: 프로필 수정 (백엔드 + 프론트)
- **Day 5**: React Query 마이그레이션 시작

**완료 시 효과**: 핵심 기능 완성, 관리자 생산성 향상

### 3주차: Phase 2 완료
- **Day 1-3**: React Query 완료
- **Day 4-5**: 대시보드 차트

**완료 시 효과**: 네트워크 요청 50% 감소, 데이터 시각화

### 4주차+: Phase 3
- Activity 실제 구현
- 다크 모드
- 고급 기능

---

## 성공 지표

### Phase 1 완료 시:
- ✅ 방문자 온보딩 시간 < 5초
- ✅ 모든 액션에 피드백 제공
- ✅ 모바일 사용자 경험 확보

### Phase 2 완료 시:
- ✅ 관리자 작업 효율 50% 증가
- ✅ 사용자 자율성 확보 (프로필 수정)
- ✅ 코드 품질 개선 (React Query)

### Phase 3 완료 시:
- ✅ 데이터 인사이트 제공 (차트)
- ✅ 다크 모드 지원
- ✅ 실시간 활동 추적

---

## 다음 액션

**즉시 시작 가능:**
1. Phase 1.1 실행 요청: `Phase 1.1 실행`
2. 완료 후 Phase 1.2-1.4 순차 진행
3. 1주 후 Phase 2 검토 및 시작

**사용자 확인 필요:**
- Phase 우선순위 조정 필요 여부
- 특정 기능 우선 구현 요청
- 디자인 방향성 피드백
