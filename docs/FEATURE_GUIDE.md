# GolfSnap 기능별 상세 가이드

> 최종 업데이트: 2026-02-02

이 문서는 GolfSnap 모바일 영상 편집기의 모든 기능을 상세하게 설명합니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [화면 구조](#3-화면-구조)
4. [핵심 기능](#4-핵심-기능)
5. [파일 구조](#5-파일-구조)
6. [데이터 모델](#6-데이터-모델)
7. [훅(Hooks) 상세](#7-훅hooks-상세)
8. [컴포넌트 상세](#8-컴포넌트-상세)
9. [상태 관리](#9-상태-관리)
10. [제스처 및 터치 인터랙션](#10-제스처-및-터치-인터랙션)

---

## 1. 프로젝트 개요

GolfSnap은 스크린골프 영상 편집을 위한 모바일 웹 프로토타입입니다.

### 주요 특징
- **6개 트랙 타임라인**: 영상, 영상 오버레이(PiP), 텍스트, 오디오, 필터, 스티커
- **중앙 고정 플레이헤드**: 타임라인이 스크롤되고 플레이헤드는 화면 중앙에 고정
- **리플 편집**: 클립 길이 변경 시 뒤 클립들이 자동으로 이동
- **클립 볼륨 조절**: 비디오 클립별 원본 오디오 볼륨/음소거
- **클립 오버랩 표시**: 같은 트랙 내 겹침 시각화
- **모바일 최적화**: 터치 제스처 (핀치 줌, 롱프레스, 스와이프)

### 현재 완성도: 92%

| 기능 | 상태 |
|------|------|
| 프로젝트 대시보드 | ✅ 100% |
| 새 프로젝트 생성 | ✅ 100% |
| 타임라인 편집 | ✅ 100% |
| 클립 조작 | ✅ 100% |
| 클립 볼륨 조절 | ✅ 100% |
| 내보내기 플로우 | ✅ 100% |
| 미리보기 | ⚠️ 50% (UI만) |
| 내보내기 렌더링 | ⚠️ 50% (시뮬레이션) |

---

## 2. 기술 스택

```
┌─────────────────────────────────────────────────────┐
│                    프론트엔드                         │
├─────────────────────────────────────────────────────┤
│  React 18.2       │ UI 라이브러리                    │
│  TypeScript 5.2   │ 타입 안전성                      │
│  Vite 5.0         │ 빌드 도구                        │
│  Zustand 4.4      │ 상태 관리                        │
│  Framer Motion    │ 애니메이션                       │
│  Tailwind CSS     │ 스타일링                         │
│  Lucide React     │ 아이콘                           │
└─────────────────────────────────────────────────────┘
```

---

## 3. 화면 구조

### 3.1 화면 흐름

```
[대시보드] ──새 프로젝트──▶ [비율 선택] ──▶ [미디어 선택] ──▶ [AI 처리] ──▶ [에디터]
    │                                                                        │
    └────────────────────────── 기존 프로젝트 클릭 ──────────────────────────┘
```

### 3.2 화면 목록

| 화면 | 파일 | 설명 |
|------|------|------|
| 대시보드 | `CreateDashboardScreen.tsx` | 프로젝트 목록, 새 프로젝트 생성 |
| 비율 선택 | `NewProjectStep1Screen.tsx` | 16:9, 9:16, 1:1 선택 |
| 미디어 선택 | `NewProjectStep2Screen.tsx` | 갤러리에서 미디어 선택 |
| AI 처리 | `NewProjectStep3Screen.tsx` | 로딩 애니메이션 |
| 에디터 | `EditorWorkspaceScreen.tsx` | 영상 편집기 (핵심) |

---

## 4. 핵심 기능

### 4.1 타임라인 편집

#### 6개 트랙

| 트랙 | 색상 | 기능 |
|------|------|------|
| 영상 | 🔵 파란색 | 비디오 클립, 분할, 속도, 볼륨 조절 |
| 오버레이 | 🩵 하늘색 | PiP(Picture-in-Picture) 비디오 |
| 텍스트 | 🟠 주황색 | 텍스트 오버레이 추가 |
| 오디오 | 🟢 초록색 | BGM 및 오디오 설정 |
| 필터 | 🟣 보라색 | 색상 필터 적용 |
| 스티커 | 🩷 핑크색 | 이모지 스티커 추가 |

#### 클립 오버랩 표시

같은 트랙 내에서 클립이 겹치면 시각적으로 표시됩니다:
- 점선 테두리 + 반투명 효과
- 오버랩 감지 알고리즘으로 실시간 계산

#### 중앙 고정 플레이헤드

```
┌─────────────────────────────────────────────────────┐
│  [클립1] [클립2] [클립3]  ← 타임라인 스크롤          │
│              │                                      │
│              │← 플레이헤드 (화면 중앙 고정)          │
│              ▼                                      │
└─────────────────────────────────────────────────────┘
```

- 타임라인을 좌우로 스크롤하면 시간이 이동
- 플레이헤드는 항상 화면 중앙에 고정

#### 리플 편집

클립 길이 변경 시 뒤에 있는 모든 클립이 자동으로 이동:

```
변경 전: [클립1] [클립2] [클립3]
                    ↓ 클립1 길이 증가
변경 후: [  클립1  ] [클립2] [클립3]
                      ↑ 자동으로 밀림
```

### 4.2 클립 조작

| 기능 | 동작 | 지원 트랙 |
|------|------|---------|
| **선택** | 클릭 | 모든 트랙 |
| **분할** | 플레이헤드 위치에서 분할 | 영상, 오디오, 필터 |
| **복제** | 바로 뒤에 복사본 생성 | 모든 트랙 |
| **삭제** | 클립 제거 + 리플 편집 | 모든 트랙 |
| **속도** | 0.1x ~ 8x 조절 | 영상 |
| **볼륨** | 0~100% 조절, 음소거 | 영상 |
| **이동** | 롱프레스 후 드래그 | 모든 트랙 |
| **트리밍** | 좌우 핸들러 드래그 | 모든 트랙 |

### 4.3 속도 조절

```
속도 범위: 0.1x ~ 8x

예시:
- 원본 10초 영상
- 2x 속도 → 5초로 재생 (빠르게)
- 0.5x 속도 → 20초로 재생 (슬로우모션)

계산식: 재생 길이 = 원본 길이 / 속도
```

### 4.4 트리밍

#### 비디오 트랙
- **왼쪽 핸들러**: 시작점 조정 (원본 startTime 이전으로 불가)
- **오른쪽 핸들러**: 끝점 조정 (원본 endTime 이후로 불가)
- 분할된 클립은 자신의 구간만 트림 가능

#### 텍스트/오디오/필터/스티커 트랙
- **왼쪽 핸들러**: 위치 이동 + 길이 조정
- **오른쪽 핸들러**: 길이만 조정
- 비디오 범위를 벗어날 수 없음

### 4.5 드래그 이동

```
동작 흐름:
1. 클립 터치 (500ms 대기)
2. 롱프레스 완료 → 드래그 모드 활성화
3. 드래그하여 위치 이동
4. 손가락 떼면 완료

비디오 트랙: 순서 교환 방식 (항상 붙어있음)
기타 트랙: 자유 이동 (비디오 범위 내)
```

---

## 5. 파일 구조

```
src/
├── main.tsx                 # React 앱 진입점
├── App.tsx                  # 라우팅 및 화면 전환
├── index.css                # 전역 스타일
│
├── types/
│   └── golf.ts              # 타입 정의 (ShotData, TimelineItem, Project 등)
│
├── store/
│   └── useAppStore.ts       # Zustand 전역 상태 관리
│
├── constants/
│   └── editor.ts            # 에디터 상수 (줌, 속도, 픽셀 등)
│
├── hooks/
│   ├── useTimeline.ts       # 타임라인 편집 핵심 로직
│   ├── useDragClip.ts       # 클립 드래그 제스처
│   ├── usePinchZoom.ts      # 핀치 줌 제스처
│   ├── useLongPress.ts      # 롱프레스 감지
│   └── useTouchScroll.ts    # 터치 스크롤
│
├── screens/
│   ├── CreateDashboardScreen.tsx   # 프로젝트 대시보드
│   ├── NewProjectFlowScreen.tsx    # 새 프로젝트 래퍼
│   ├── NewProjectStep1Screen.tsx   # Step 1: 비율 선택
│   ├── NewProjectStep2Screen.tsx   # Step 2: 미디어 선택
│   ├── NewProjectStep3Screen.tsx   # Step 3: AI 처리
│   └── EditorWorkspaceScreen.tsx   # 영상 편집기 (핵심)
│
└── components/
    ├── MobileFrame.tsx       # 모바일 프레임 (393x852)
    ├── BottomNavigation.tsx  # 하단 탭 네비게이션
    ├── TimelineClip.tsx      # 타임라인 클립 렌더링
    ├── TrimHandle.tsx        # 트림 핸들러
    ├── SpeedPanel.tsx        # 속도 조절 패널
    ├── ClipVolumePanel.tsx   # 클립 볼륨 조절 패널
    ├── FilterPanel.tsx       # 필터 패널
    ├── AudioPanel.tsx        # 오디오 패널
    ├── TextPanel.tsx         # 텍스트 패널
    ├── StickerPanel.tsx      # 스티커 패널
    ├── ExportPanel.tsx       # 내보내기 패널
    ├── DraggableOverlay.tsx  # 드래그 가능한 오버레이
    └── ShareDialog.tsx       # 공유 다이얼로그
```

---

## 6. 데이터 모델

### 6.1 TimelineItem (타임라인 아이템)

```typescript
interface TimelineItem {
  id: string;              // 고유 ID
  clipId: string;          // 연결된 클립 ID
  position: number;        // 시작 위치 (초)
  duration: number;        // 길이 (초)
  track: 'video' | 'video-overlay' | 'text' | 'audio' | 'filter' | 'sticker';

  // 트리밍용
  startTime?: number;      // 원본 시작 시간
  endTime?: number;        // 원본 종료 시간

  // 비디오 전용
  speed?: number;          // 재생 속도 (0.1 ~ 8)
  volume?: number;         // 원본 오디오 볼륨 (0 ~ 1)
  audioMuted?: boolean;    // 음소거 여부

  // 비디오 오버레이(PiP) 전용
  overlayPositionX?: number;  // 오버레이 X 위치 (0~1)
  overlayPositionY?: number;  // 오버레이 Y 위치 (0~1)
  overlayScale?: number;      // 오버레이 크기 (0.1~1)

  // 텍스트 전용
  textContent?: string;
  textFont?: string;
  textFontSize?: number;
  textColor?: string;
  textPosition?: { x: number; y: number };

  // 오디오 전용
  audioVolume?: number;
  audioBgm?: { id: string; name: string; volume: number };

  // 필터 전용
  filterBrightness?: number;
  filterContrast?: number;
  filterSaturation?: number;
  filterPreset?: string;

  // 스티커 전용
  stickerEmoji?: string;
  stickerAnimation?: StickerAnimationType;
  stickerScale?: number;
  stickerPosition?: { x: number; y: number };
}
```

### 6.2 Project (프로젝트)

```typescript
interface Project {
  id: string;
  name: string;
  createdAt: number;       // Unix timestamp
  updatedAt: number;
  clips: VideoClip[];      // 영상 클립 목록
  timeline: TimelineItem[]; // 타임라인 아이템 목록
  duration: number;        // 총 길이 (초)
  aspectRatio?: '16:9' | '9:16' | '1:1';
  thumbnail?: string;
}
```

---

## 7. 훅(Hooks) 상세

### 7.1 useTimeline

**타임라인 편집의 핵심 로직**

```typescript
const {
  timelineClips,      // 모든 클립
  selectedClipId,     // 선택된 클립 ID
  splitClip,          // 클립 분할
  duplicateClip,      // 클립 복제
  deleteClip,         // 클립 삭제
  updateClipSpeed,    // 속도 변경
  trimClipStart,      // 시작점 트림
  trimClipEnd,        // 끝점 트림
  moveClip,           // 클립 이동
} = useTimeline(initialClips);
```

주요 특징:
- 리플 편집 자동 적용
- 비디오 범위 제한 (텍스트/오디오/필터/스티커)
- 트림 제한 (분할된 클립의 원본 구간 보존)

### 7.2 useDragClip

**롱프레스 후 드래그 제스처**

```typescript
const { handleTouchStart, handleMouseDown, isDraggable, longPressProgress } = useDragClip({
  clipId: 'clip-1',
  initialPosition: 10,
  zoom: 1,
  pixelsPerSecond: 10,
  onMove: (id, pos) => moveClip(id, pos),
  onSelect: (id) => setSelectedClipId(id),
  longPressDelay: 500,
});
```

동작:
1. 터치/클릭 시작 → 타이머 시작
2. 500ms 경과 → 드래그 모드 활성화
3. 드래그 중 → onMove 콜백 호출
4. 터치/클릭 종료 → 완료

### 7.3 usePinchZoom

**두 손가락 핀치 줌 제스처**

```typescript
usePinchZoom({
  ref: timelineRef,
  currentZoom: 1,
  minZoom: 0.5,
  maxZoom: 3,
  onZoomChange: setZoom,
});
```

---

## 8. 컴포넌트 상세

### 8.1 TimelineClip

**타임라인 클립 렌더링**

| Props | 타입 | 설명 |
|-------|------|------|
| clip | TimelineItem | 클립 데이터 |
| isSelected | boolean | 선택 여부 |
| zoom | number | 줌 레벨 |
| onSelect | function | 선택 콜백 |
| onMove | function | 이동 콜백 |
| onTrimStart | function | 시작점 트림 콜백 |
| onTrimEnd | function | 끝점 트림 콜백 |

트랙별 색상:
- 영상: 🔵 #3b82f6
- 오버레이: 🩵 #0ea5e9
- 텍스트: 🟠 #f59e0b
- 오디오: 🟢 #10b981
- 필터: 🟣 #a855f7
- 스티커: 🩷 #ec4899

### 8.2 TrimHandle

**클립 양쪽 트림 핸들러**

| Props | 타입 | 설명 |
|-------|------|------|
| side | 'left' \| 'right' | 핸들러 위치 |
| clipId | string | 클립 ID |
| zoom | number | 줌 레벨 |
| onTrim | function | 트림 콜백 |

---

## 9. 상태 관리

### Zustand 스토어 구조

```typescript
interface AppState {
  // 화면 네비게이션
  currentScreen: 'home' | 'create' | 'editor' | ...;

  // 프로젝트 관리
  projects: Project[];
  currentProject: Project | null;

  // 타임라인
  selectedClip: VideoClip | null;

  // 재생
  isPlaying: boolean;
  currentTime: number;

  // 액션들
  setCurrentScreen: (screen) => void;
  addProject: (project) => void;
  updateProject: (id, updates) => void;
  deleteProject: (id) => void;
  // ...
}
```

---

## 10. 제스처 및 터치 인터랙션

### 10.1 지원 제스처

| 제스처 | 동작 | 사용처 |
|--------|------|--------|
| 탭 | 선택 | 클립, 버튼 |
| 더블탭 | 편집 패널 열기 | 텍스트/오디오/필터/스티커 클립 |
| 롱프레스 (500ms) | 드래그 모드 | 클립 이동 |
| 스와이프 | 스크롤 | 타임라인, 목록 |
| 핀치 줌 | 확대/축소 | 타임라인 |
| 드래그 | 이동/트림 | 클립, 핸들러 |

### 10.2 모바일 최적화

- **터치 영역**: 최소 44px (Apple HIG 권장)
- **햅틱 피드백**: 롱프레스 완료 시 진동
- **스크롤 방지**: 드래그 중 페이지 스크롤 차단
- **passive: false**: preventDefault 활성화

---

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

---

## 관련 문서

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - 프로젝트 현황
- [TODO.md](./TODO.md) - 작업 목록
