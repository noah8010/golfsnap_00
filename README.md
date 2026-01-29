# GolfSnap Mobile - 골프 영상 편집 앱 프로토타입

> **완성도**: 90% | **최종 업데이트**: 2026-01-13 (오후)

모바일 환경에 최적화된 골프 영상 편집 애플리케이션 UX/UI 프로토타입입니다.

---

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 자동으로 http://localhost:3002 접속
```

---

## 📚 문서

**모든 프로젝트 문서는 [`docs/`](./docs) 폴더에 있습니다.**

### Claude Agent (새 세션 시작)
```
1. docs/PROJECT_STATUS.md  ⭐⭐⭐ 필수!
   → 현재 프로젝트 상태 및 구조

2. docs/TODO.md  ⭐⭐
   → 다음 작업 목록
```

### 개발자 (온보딩)
```
1. docs/PROJECT_STATUS.md     # 프로젝트 전체 파악
2. docs/DEVELOPMENT_GUIDE.md  # 개발 환경 설정
3. docs/TODO.md                # 할 일 목록
```

**상세 문서 가이드**: [docs/README.md](./docs/README.md)

---

## 🎯 주요 기능

### 1. 만들기 대시보드 ✅
- 프로젝트 관리 (생성, 복제, 삭제, 이름 변경)
- 프로젝트 검색 및 2열 그리드
- 빠른 시작 액션

### 2. 새 프로젝트 3단계 플로우 ✅
- Step 1: 화면 비율 선택 (16:9, 9:16, 1:1)
- Step 2: 미디어 선택 (갤러리)
- Step 3: AI 처리 로딩

### 3. 에디터 워크스페이스 ⭐ 85%

#### 타임라인 4개 트랙 (완전 구현) ✅
```
🔵 영상 트랙
  - 분할, 복제, 속도 조절 (0.1x~8x)
  - 트림 (좌우 핸들러)
  - 리플 편집 (자동 정렬)

🟠 텍스트 트랙
  - 추가, 편집, 드래그 이동
  - 트림 (자유 길이 조절)
  - 미리보기 오버레이

🟢 오디오 트랙
  - BGM 선택 (6개)
  - 볼륨 조절 (0~100%)
  - 드래그, 트림

🟣 필터 트랙
  - 프리셋 6개
  - 세부 조정 (밝기/대비/채도/색온도)
  - 드래그, 트림
```

#### 핵심 UX 패턴
- **중앙 고정 플레이헤드**: 플레이헤드 중앙 고정, 타임라인 스크롤
- **리플 편집**: 트림/속도 조절 시 뒤 클립 자동 이동 (영상만)
- **0.5초 롱프레스 드래그**: 텍스트/오디오/필터 이동
- **비디오 범위 제한**: 텍스트/오디오/필터는 비디오 범위 내

---

## 🛠 기술 스택

```
React 18.2 + TypeScript 5.2
├── Vite 5.0 (빌드 도구)
├── Zustand 4.4 (상태 관리)
├── Framer Motion 10.16 (애니메이션)
├── Tailwind CSS 3.3 (스타일링)
└── Lucide React 0.294 (아이콘)
```

---

## 📂 프로젝트 구조

```
src/
├── App.tsx                        # 라우팅
├── store/useAppStore.ts          # 전역 상태 (Zustand)
├── types/golf.ts                 # 타입 정의
├── constants/editor.ts           # 타임라인 상수
│
├── screens/                       # 화면 컴포넌트
│   ├── CreateDashboardScreen.tsx # 대시보드
│   ├── NewProjectFlowScreen.tsx  # 3단계 플로우
│   └── EditorWorkspaceScreen.tsx # ⭐ 에디터 (핵심)
│
├── components/                    # UI 컴포넌트
│   ├── MobileFrame.tsx           # 393px 고정 프레임
│   ├── TimelineClip.tsx          # 타임라인 클립
│   ├── TrimHandle.tsx            # 트림 핸들러
│   └── [5개 패널]                 # Speed/Filter/Audio/Text/Export
│
└── hooks/                         # 커스텀 훅
    ├── useTimeline.ts            # ⭐ 타임라인 로직 (597줄)
    ├── useDragClip.ts            # 드래그 시스템
    └── ... (기타 모바일 제스처)
```

---

## 🎨 디자인 시스템

### 색상
```typescript
Primary: #10b981 (Golf Green)
Background: #f9fafb (Light), #111827 (Dark)

트랙 색상:
  영상: #3b82f6 (Blue)
  텍스트: #f59e0b (Amber)
  오디오: #10b981 (Emerald)
  필터: #a855f7 (Purple)
```

### 애니메이션
```typescript
바텀 시트: Spring (damping: 30, stiffness: 300)
탭 스케일: 0.98
전환: 0.2s
```

---

## 🔧 개발 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3002)
npm run build    # 빌드
npm run preview  # 프리뷰
```

---

## 📊 완성도

```
✅ 완료 (100%)
  - 프로젝트 관리 대시보드
  - 3단계 프로젝트 생성
  - 타임라인 4개 트랙
  - 클립 조작 (분할/복제/삭제/속도/트림)
  - 중앙 고정 플레이헤드
  - 리플 편집
  - 드래그 & 드롭

⚠️ 부분 완료 (50-80%)
  - 비디오 재생 (UI만)
  - 내보내기 (시뮬레이션)

❌ 미구현 (0%)
  - 실행 취소/다시 실행
  - 다중 클립 선택
  - 전환 효과
  - 실제 비디오 처리 엔진
```

---

## 🐛 알려진 이슈

~~모든 긴급 버그가 해결되었습니다~~ ✅

**상세**: [docs/TODO.md](./docs/TODO.md)

---

## 🔮 다음 작업

### 🟠 높음 (다음 우선순위)
1. 실행 취소/다시 실행
2. 다중 클립 선택 (롱프레스)

**전체 목록**: [docs/TODO.md](./docs/TODO.md)

---

## 🆕 최신 업데이트 (2026-01-13 오후)

### 🐛 긴급 버그 수정
- ✅ scrollLeft 초기화 문제 해결
- ✅ 비디오 범위 제한 작동 검증
- ✅ 텍스트/오디오/필터 생성 로직 리팩토링

### ✨ 새로운 기능 (오전)
- ✅ 오디오 타임라인 완전 구현
- ✅ 필터 타임라인 완전 구현
- ✅ 4개 트랙 완성

### 🔧 버그 수정 (오전)
- ✅ 모바일 프레임 내 팝업 동작

### 📦 리팩토링 (오전)
- ✅ TrimHandle, TimelineClip, useDragClip 분리

### 📊 완성도
**75% → 90%** (+15%)

---

## 📝 라이선스

프로토타입 프로젝트 - 학습/데모 목적

---

**버전**: 1.0.0 (프로토타입)
**마지막 업데이트**: 2026-01-13
**개발 환경**: React 18 + TypeScript + Vite

**📖 전체 문서**: [`docs/`](./docs) 폴더 참고
