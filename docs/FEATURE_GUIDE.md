# GolfSnap - 기능 및 API 레퍼런스

> **최종 업데이트**: 2026-02-04
>
> 기능별 상세 동작과 데이터 모델/훅 API를 정리한 문서입니다.
> 프로젝트 개요, 기술 스택, 파일 구조는 [CLAUDE.md](../CLAUDE.md)와 [STYLE_GUIDE.md](./STYLE_GUIDE.md)를 참조하세요.

---

## 1. 핵심 기능

### 1.1 타임라인 편집

#### 5개 트랙

| 트랙 | 색상 | 기능 |
|------|------|------|
| 영상 | #3b82f6 파란색 | 비디오 클립, 분할, 속도, 볼륨 조절 |
| 텍스트 | #f59e0b 주황색 | 텍스트 오버레이 추가 |
| 오디오 | #10b981 초록색 | BGM 및 오디오 설정 |
| 필터 | #a855f7 보라색 | 색상 필터 적용 |
| 스티커 | #ec4899 핑크색 | 이모지 스티커 추가 |

#### 중앙 고정 플레이헤드

```
┌──────────────────────────────────────────────┐
│  [클립1] [클립2] [클립3]  ← 타임라인 스크롤    │
│              │                                │
│              │← 플레이헤드 (화면 중앙 고정)     │
└──────────────────────────────────────────────┘
```

#### 리플 편집

```
변경 전: [클립1] [클립2] [클립3]
                    ↓ 클립1 길이 증가
변경 후: [  클립1  ] [클립2] [클립3]
                      ↑ 자동으로 밀림
```

#### 클립 스냅

- 스냅 임계값: 0.3초
- 시각적 가이드라인 표시
- 햅틱 피드백 (모바일)

#### 클립 오버랩 표시

- 점선 테두리 + 반투명 효과
- 오버랩 감지 알고리즘으로 실시간 계산

### 1.2 클립 조작

| 기능 | 동작 | 지원 트랙 |
|------|------|---------|
| 선택 | 클릭 | 모든 트랙 |
| 분할 | 플레이헤드 위치에서 분할 | 영상, 오디오, 필터 |
| 복제 | 바로 뒤에 복사본 생성 | 모든 트랙 |
| 삭제 | 클립 제거 + 리플 편집 | 모든 트랙 |
| 속도 | 0.1x ~ 8x 조절 | 영상 |
| 볼륨 | 0~100% 조절, 음소거 | 영상 |
| 이동 | 롱프레스 후 드래그 | 모든 트랙 |
| 트리밍 | 좌우 핸들러 드래그 | 모든 트랙 |

### 1.3 트리밍 상세

**비디오 트랙**: 원본 startTime/endTime 범위 내에서만 트림 가능. 분할된 클립은 자신의 구간만 트림.

**텍스트/오디오/필터/스티커 트랙**: 왼쪽 핸들러는 위치+길이 조정, 오른쪽 핸들러는 길이만 조정. 비디오 범위를 벗어날 수 없음.

### 1.4 드래그 이동

```
1. 클립 터치 (500ms 대기)
2. 롱프레스 완료 → 드래그 모드 활성화
3. 드래그하여 위치 이동 (스냅 포인트 자동 적용)
4. 손가락 떼면 완료

비디오 트랙: 순서 교환 방식 (항상 붙어있음)
기타 트랙: 자유 이동 (비디오 범위 내)
```

### 1.5 실행 취소/다시 실행

- 히스토리 스택 (최대 30단계)
- 키보드 단축키: Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z
- 헤더에 Undo/Redo 버튼 표시

### 1.6 자동 저장 UI

- 저장됨 (녹색 체크) / 저장 중 (스피너) / 저장되지 않음 (주황색 점)

### 1.7 AI 어시스턴트

메타데이터 기반 스티커/텍스트 자동 추천:

```
샷 메타데이터 분석:
- 비거리: 285yd / 볼 스피드: 168mph / 클럽: Driver / 홀아웃: 버디

→ AI 추천: 버디 스티커, 로켓 스피드 스티커, "BIRDIE!" 텍스트 등
```

- 패널 열릴 때 자동 분석
- 다중 스티커/텍스트 선택 가능
- 전체 선택/해제, 다시 분석

### 1.8 텍스트 애니메이션

| 애니메이션 | 설명 |
|------------|------|
| none | 없음 |
| fade-in | 페이드 인 |
| fade-out | 페이드 아웃 |
| slide-up | 아래에서 위로 슬라이드 |
| slide-down | 위에서 아래로 슬라이드 |
| slide-left | 오른쪽에서 왼쪽으로 슬라이드 |
| slide-right | 왼쪽에서 오른쪽으로 슬라이드 |
| zoom-in | 확대되면서 등장 |
| bounce | 바운스 효과 |
| typewriter | 타자기 효과 |
| glow | 글로우 효과 |

### 1.9 제스처 및 터치

| 제스처 | 동작 | 사용처 |
|--------|------|--------|
| 탭 | 선택 | 클립, 버튼 |
| 더블탭 | 편집 패널 열기 | 텍스트/오디오/필터/스티커 클립 |
| 롱프레스 (500ms) | 드래그 모드 | 클립 이동 |
| 스와이프 | 스크롤 | 타임라인, 목록 |
| 핀치 줌 | 확대/축소 (0.5x~3x) | 타임라인 |
| 드래그 | 이동/트림 | 클립, 핸들러 |

---

## 2. 데이터 모델

### 2.1 TimelineItem

```typescript
interface TimelineItem {
  id: string;              // 고유 ID
  clipId: string;          // 연결된 클립 ID
  position: number;        // 시작 위치 (초)
  duration: number;        // 길이 (초)
  track: 'video' | 'text' | 'audio' | 'filter' | 'sticker';

  // 트리밍용
  startTime?: number;      // 원본 시작 시간
  endTime?: number;        // 원본 종료 시간

  // 비디오 전용
  speed?: number;          // 재생 속도 (0.1 ~ 8)
  volume?: number;         // 원본 오디오 볼륨 (0 ~ 1)
  audioMuted?: boolean;    // 음소거 여부

  // 텍스트 전용
  textContent?: string;
  textFont?: string;
  textFontSize?: number;
  textColor?: string;
  textPosition?: { x: number; y: number };
  textAnimation?: TextAnimationType;

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

### 2.2 Project

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

### 2.3 ShotData

```typescript
interface ShotData {
  distance: number;        // 비거리 (yards)
  ballSpeed: number;       // 볼 스피드 (mph)
  launchAngle: number;     // 발사각 (degrees)
  accuracy: number;        // 정확도 (%)
  club: ClubType;          // 클럽 종류
  spinRate?: number;       // 스핀량 (rpm)
  direction?: number;      // 방향각 (degrees)
  remainingDistance?: number; // 핀까지 남은 거리
  holeResult?: 'hole-in-one' | 'eagle' | 'birdie' | 'par' | 'bogey' | 'double-bogey';
}
```

---

## 3. 훅(Hooks) API

### 3.1 useTimeline

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

- 리플 편집 자동 적용
- 비디오 범위 제한 (텍스트/오디오/필터/스티커)
- 트림 제한 (분할된 클립의 원본 구간 보존)

### 3.2 useDragClip

```typescript
const { handleTouchStart, handleMouseDown, isDraggable, longPressProgress } = useDragClip({
  clipId: 'clip-1',
  initialPosition: 10,
  clipDuration: 5,
  zoom: 1,
  pixelsPerSecond: 10,
  onMove: (id, pos) => moveClip(id, pos),
  onSelect: (id) => setSelectedClipId(id),
  longPressDelay: 500,
  allClips: timelineClips,
  onSnapChange: (snapped, point) => setSnapGuide({ visible: snapped, position: point }),
});
```

### 3.3 useSmartAssistant

```typescript
const {
  state,                    // 현재 상태
  analyzeShotData,          // 샷 데이터 분석
  toggleSuggestion,         // 제안 선택/해제
  selectAll,                // 전체 선택
  deselectAll,              // 전체 해제
  getSelectedAsTimelineItems, // 선택된 제안을 타임라인 아이템으로 변환
  stickerSuggestions,       // 스티커 제안 목록
  textSuggestions,          // 텍스트 제안 목록
  selectedCount,            // 선택된 제안 수
} = useSmartAssistant();
```

### 3.4 usePinchZoom

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

## 4. 컴포넌트 Props

### 4.1 TimelineClip

| Props | 타입 | 설명 |
|-------|------|------|
| clip | TimelineItem | 클립 데이터 |
| isSelected | boolean | 선택 여부 |
| zoom | number | 줌 레벨 |
| allClips | TimelineItem[] | 모든 클립 (스냅용) |
| onSelect | function | 선택 콜백 |
| onMove | function | 이동 콜백 |
| onTrimStart | function | 시작점 트림 콜백 |
| onTrimEnd | function | 끝점 트림 콜백 |
| onSnapChange | function | 스냅 상태 변경 콜백 |

### 4.2 AssistantPanel

| Props | 타입 | 설명 |
|-------|------|------|
| onAdd | function | 선택된 제안 추가 콜백 |
| onClose | function | 패널 닫기 콜백 |
| currentTime | number | 현재 타임라인 시간 |
| shotMetadata | Partial\<ShotData\> | 샷 메타데이터 (선택적) |

---

## 5. 상태 관리

### 5.1 useAppStore

```typescript
interface AppState {
  currentScreen: 'home' | 'create' | 'editor' | ...;
  projects: Project[];
  currentProject: Project | null;
  selectedClip: VideoClip | null;
  isPlaying: boolean;
  currentTime: number;
  saveStatus: 'saved' | 'saving' | 'unsaved';

  setCurrentScreen: (screen) => void;
  addProject: (project) => void;
  updateProject: (id, updates) => void;
  deleteProject: (id) => void;
  setSaveStatus: (status) => void;
}
```

### 5.2 useHistoryStore

```typescript
interface HistoryState {
  past: TimelineItem[][];     // 이전 상태들
  present: TimelineItem[];    // 현재 상태
  future: TimelineItem[][];   // 다음 상태들 (Redo용)

  initialize: (clips) => void;
  pushState: (clips) => void;
  undo: () => TimelineItem[] | null;
  redo: () => TimelineItem[] | null;
  canUndo: boolean;
  canRedo: boolean;
}
```

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [../CLAUDE.md](../CLAUDE.md) | AI 세션 가이드 (필수) |
| [STYLE_GUIDE.md](./STYLE_GUIDE.md) | 코딩 규칙 + 디자인 시스템 |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | 프로젝트 현황 |
| [TODO.md](./TODO.md) | 작업 목록 |
