# GolfSnap Mobile - 프로젝트 현황

> **최종 업데이트**: 2026-01-29
> **프로젝트 완성도**: 90%

---

## 프로젝트 개요

**프로젝트명**: GolfSnap Mobile
**타입**: 웹 기반 모바일 앱 프로토타입
**목적**: 골프 영상 편집 UX/UI 시연
**해상도**: 393x852 (iPhone 14 Pro 기준)
**개발 서버**: http://localhost:3000

### 기술 스택

| 카테고리 | 기술 | 버전 |
|---------|------|------|
| UI | React | 18.2 |
| 언어 | TypeScript | 5.2 |
| 빌드 | Vite | 5.0 |
| 상태관리 | Zustand | 4.4 |
| 애니메이션 | Framer Motion | 10.16 |
| 스타일링 | Tailwind CSS | 3.3 |
| 아이콘 | Lucide React | 0.294 |

---

## 폴더 구조

```
src/
├── App.tsx                    # 라우팅 & 화면 전환
├── main.tsx                   # 앱 진입점
│
├── screens/                   # 화면 컴포넌트 (10개)
│   ├── EditorWorkspaceScreen.tsx   # 핵심 에디터 (1,008줄)
│   ├── CreateDashboardScreen.tsx   # 대시보드 (431줄)
│   ├── NewProjectFlowScreen.tsx    # 3단계 플로우 래퍼
│   ├── NewProjectStep1Screen.tsx   # 화면 비율 선택
│   ├── NewProjectStep2Screen.tsx   # 미디어 선택
│   └── NewProjectStep3Screen.tsx   # AI 처리 로딩
│
├── components/                # 재사용 컴포넌트 (11개)
│   ├── MobileFrame.tsx             # 393px 고정 프레임
│   ├── TimelineClip.tsx            # 타임라인 클립
│   ├── TrimHandle.tsx              # 트림 핸들러
│   ├── SpeedPanel.tsx              # 속도 조절 패널
│   ├── FilterPanel.tsx             # 필터 패널
│   ├── AudioPanel.tsx              # 오디오 패널
│   ├── TextPanel.tsx               # 텍스트 패널
│   ├── StickerPanel.tsx            # 스티커 패널 (NEW)
│   └── ExportPanel.tsx             # 내보내기 패널
│
├── hooks/                     # 커스텀 훅 (5개)
│   ├── useTimeline.ts              # 타임라인 로직 (596줄)
│   ├── useDragClip.ts              # 클립 드래그 (303줄)
│   ├── useTouchScroll.ts           # 터치 스크롤
│   ├── useLongPress.ts             # 롱프레스 감지
│   └── usePinchZoom.ts             # 핀치 줌
│
├── store/
│   └── useAppStore.ts              # Zustand 전역 상태 (199줄)
│
├── constants/
│   └── editor.ts                   # 타임라인 상수 (51줄)
│
└── types/
    └── golf.ts                     # 타입 정의 (115줄)
```

---

## 주요 기능 현황

### 1. 대시보드 - 100%
- 프로젝트 2열 그리드 레이아웃
- 검색 (실시간 필터링)
- 프로젝트 옵션 (복제/이름변경/삭제)
- 빠른 시작 섹션

### 2. 새 프로젝트 3단계 플로우 - 100%
- Step 1: 화면 비율 선택 (16:9, 9:16, 1:1)
- Step 2: 미디어 선택 (갤러리, 다중선택)
- Step 3: AI 처리 로딩 애니메이션

### 3. 에디터 워크스페이스 - 90%

#### 타임라인 5개 트랙 (완전 구현)

| 트랙 | 색상 | 분할 | 복제 | 속도 | 트림 | 드래그 | 리플편집 |
|------|------|------|------|------|------|--------|---------|
| 영상 | 파랑 | O | O | O | O | X | O |
| 텍스트 | 주황 | X | O | X | O | O | X |
| 오디오 | 초록 | X | O | X | O | O | X |
| 필터 | 보라 | X | O | X | O | O | X |
| 스티커 | 핑크 | X | O | X | O | O | X |

#### 중앙 고정 플레이헤드
- 플레이헤드는 화면 중앙에 고정
- 타임라인이 좌우로 스크롤
- 모든 편집 작업은 플레이헤드 기준

#### 편집 패널 (100%)
- SpeedPanel: 0.1x~8x 속도 조절, 역재생
- FilterPanel: 프리셋 6개 + 세부 조정
- AudioPanel: BGM 라이브러리 + 볼륨
- TextPanel: 폰트/색상/애니메이션
- StickerPanel: 24개 스티커, 8개 애니메이션, 크기 조절
- ExportPanel: 화질 선택, 렌더링 진행률

---

## 핵심 훅 API

### useTimeline

```typescript
const {
  timelineClips,        // 타임라인 클립 배열
  selectedClipId,       // 선택된 클립 ID
  selectedClip,         // 선택된 클립 객체
  splitClip,            // 클립 분할
  duplicateClip,        // 클립 복제
  deleteClip,           // 클립 삭제
  updateClipSpeed,      // 속도 변경
  trimClipStart,        // 시작점 트림
  trimClipEnd,          // 끝점 트림
  addClip,              // 클립 추가
  updateClip,           // 클립 수정
  moveClip,             // 클립 이동
} = useTimeline(initialClips);
```

### useAppStore (Zustand)

```typescript
const {
  currentScreen,        // 현재 화면
  setCurrentScreen,     // 화면 전환
  projects,             // 프로젝트 목록
  currentProject,       // 현재 프로젝트
  createNewProject,     // 새 프로젝트 생성
  updateProject,        // 프로젝트 수정
  deleteProject,        // 프로젝트 삭제
} = useAppStore();
```

---

## 핵심 상수 (constants/editor.ts)

```typescript
TIMELINE_CONFIG = {
  ZOOM_MIN: 0.5,
  ZOOM_MAX: 3,
  ZOOM_STEP: 0.25,
  PIXELS_PER_SECOND: 10,
  MIN_CLIP_DURATION: 0.1,
  SPEED_MIN: 0.1,
  SPEED_MAX: 8,
}
```

---

## 완성도 분석

### 완료 (100%)
- [x] 프로젝트 관리 대시보드
- [x] 3단계 프로젝트 생성 플로우
- [x] 타임라인 5개 트랙 시스템 (영상/텍스트/오디오/필터/스티커)
- [x] 클립 조작 (분할/복제/삭제/속도/트림)
- [x] 패널 시스템 (6개: Speed/Filter/Audio/Text/Sticker/Export)
- [x] 중앙 고정 플레이헤드
- [x] 리플 편집
- [x] 드래그 & 드롭 (0.5초 롱프레스)
- [x] 모바일 제스처 (핀치 줌, 터치 스크롤)
- [x] 스티커/이펙트 기능 (24개 스티커, 8개 애니메이션)

### 부분 완료 (50-80%)
- [ ] 비디오 재생 (UI만, 실제 재생 X)
- [ ] 내보내기 (시뮬레이션, 실제 렌더링 X)

### 미구현 (0%)
- [ ] 실행 취소/다시 실행
- [ ] 다중 클립 선택
- [ ] 전환 효과 (Transitions)
- [ ] 실제 비디오 처리 엔진

---

## 디자인 시스템

### 색상

```
Primary: #10b981 (golf-green)
Background: #f9fafb (light) / #111827 (dark)

트랙 색상:
- 영상: #3b82f6 (blue)
- 텍스트: #f59e0b (amber)
- 오디오: #10b981 (emerald)
- 필터: #a855f7 (purple)
- 스티커: #ec4899 (pink)
```

### 애니메이션

```typescript
// 바텀 시트
transition: { type: 'spring', damping: 30, stiffness: 300 }

// 탭 스케일
whileTap={{ scale: 0.98 }}
```

---

## 개발 명령어

```bash
npm install     # 의존성 설치
npm run dev     # 개발 서버 (localhost:3000)
npm run build   # 프로덕션 빌드
npm run preview # 빌드 미리보기
npm run lint    # 린트 검사
```

---

## 핵심 원칙

### 1. 모든 화면은 MobileFrame 내부
```typescript
<MobileFrame>
  <YourScreen />
</MobileFrame>
```

### 2. 중앙 고정 플레이헤드
```typescript
// 플레이헤드는 화면 중앙 고정
// 타임라인이 좌우로 스크롤
// 모든 편집 작업은 플레이헤드 기준
```

### 3. 리플 편집 (비디오만)
```typescript
// 트림/속도 조절 시 뒤 클립들 자동 이동
// 텍스트/오디오/필터는 독립적
```

### 4. 비디오 범위 제한
```typescript
// 텍스트/오디오/필터/스티커는 비디오 범위 내에서만 존재
```

---

## 다음 작업 우선순위

### 높음
1. 실행 취소/다시 실행 구현
2. 다중 클립 선택 (롱프레스)

### 중간
3. 성능 최적화 (가상화)
4. 전환 효과 (Transitions)

---

**마지막 업데이트**: 2026-01-29
