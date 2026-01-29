# 리팩토링 가이드 - 2026-01-13

> **목적**: EditorWorkspaceScreen의 중복 코드 제거 및 성능 개선  
> **우선순위**: 높음  
> **예상 시간**: 2-3시간

---

## 🎯 리팩토링 목표

### 현재 문제점
1. **중복 코드**: 트림 핸들러 로직이 4개 트랙에 반복됨 (~400줄)
2. **큰 파일 크기**: EditorWorkspaceScreen.tsx (~1200줄)
3. **성능**: 드래그 중 많은 리렌더링

### 해결 방안
1. ✅ `TrimHandle` 컴포넌트 분리 (완료)
2. ✅ `useDragClip` 훅 분리 (완료)
3. ✅ `TimelineClip` 컴포넌트 분리 (완료)
4. ⏳ EditorWorkspaceScreen에 적용 (진행 필요)
5. ⏳ 성능 최적화 (진행 필요)

---

## 📦 생성된 새 파일들

### 1. src/components/TrimHandle.tsx ✅
**목적**: 트림 핸들러 UI와 드래그 로직 분리

**사용법**:
```typescript
<TrimHandle
  side="left"              // 'left' | 'right'
  clipId={clip.id}
  zoom={timelineZoom}
  pixelsPerSecond={TIMELINE_CONFIG.PIXELS_PER_SECOND}
  onTrim={trimClipStart}   // 또는 trimClipEnd
/>
```

**장점**:
- 중복 코드 제거 (~100줄 → 10줄)
- 일관된 동작
- 테스트 용이

---

### 2. src/hooks/useDragClip.ts ✅
**목적**: 클립 드래그 이동 로직 분리

**사용법**:
```typescript
const { handleMouseDown } = useDragClip({
  clipId: clip.id,
  initialPosition: clip.position,
  zoom: timelineZoom,
  pixelsPerSecond: TIMELINE_CONFIG.PIXELS_PER_SECOND,
  onMove: moveClip,
  onSelect: setSelectedClipId,
});

<div onMouseDown={handleMouseDown}>
  {/* 클립 내용 */}
</div>
```

**장점**:
- 중복 코드 제거 (~60줄 → 5줄)
- 이벤트 클린업 자동 관리
- 재사용 가능

---

### 3. src/components/TimelineClip.tsx ✅
**목적**: 모든 트랙 타입의 클립을 렌더링하는 공통 컴포넌트

**사용법**:
```typescript
<TimelineClip
  clip={clip}
  isSelected={selectedClipId === clip.id}
  zoom={timelineZoom}
  isDraggable={clip.track !== 'video'}  // 비디오는 드래그 불가
  onSelect={setSelectedClipId}
  onDoubleClick={(clip) => {
    if (clip.track === 'text') setEditingTextClip(clip);
    if (clip.track === 'audio') setEditingAudioClip(clip);
    if (clip.track === 'filter') setEditingFilterClip(clip);
  }}
  onMove={moveClip}
  onTrimStart={trimClipStart}
  onTrimEnd={trimClipEnd}
/>
```

**장점**:
- 4개 트랙의 렌더링 로직 통합 (~800줄 → 200줄)
- 트랙별 색상/스타일 자동 관리
- 유지보수 용이

---

## 🔧 적용 방법

### Step 1: 비디오 트랙 리팩토링

**Before** (현재 코드, ~90줄):
```typescript
{timelineClips
  .filter((clip) => clip.track === 'video')
  .map((clip) => (
    <motion.div
      key={clip.id}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedClipId(clip.id);
      }}
      className={`absolute top-1 bottom-1 rounded cursor-pointer overflow-visible ${
        selectedClipId === clip.id ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-600'
      }`}
      style={{
        left: `${clip.position * TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom}px`,
        width: `${clip.duration * TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom}px`,
        backgroundColor: '#3b82f6',
      }}
    >
      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-500 p-2 flex items-center justify-between relative">
        <span className="text-xs text-white font-medium truncate">클립 {clip.id.split('-')[1]}</span>
        {clip.speed !== 1 && <span className="text-xs text-white font-bold">{clip.speed}x</span>}
        
        {/* 트림 핸들러 - 선택된 클립만 표시 */}
        {selectedClipId === clip.id && (
          <>
            {/* 왼쪽 트림 핸들러 (30줄) */}
            {/* 오른쪽 트림 핸들러 (30줄) */}
          </>
        )}
      </div>
    </motion.div>
  ))}
```

**After** (리팩토링 후, ~5줄):
```typescript
{timelineClips
  .filter((clip) => clip.track === 'video')
  .map((clip) => (
    <TimelineClip
      key={clip.id}
      clip={clip}
      isSelected={selectedClipId === clip.id}
      zoom={timelineZoom}
      isDraggable={false}
      onSelect={setSelectedClipId}
      onTrimStart={trimClipStart}
      onTrimEnd={trimClipEnd}
    />
  ))}
```

**절감**: ~85줄 → ~5줄 (95% 감소)

---

### Step 2: 텍스트 트랙 리팩토링

**Before** (~120줄):
```typescript
{timelineClips
  .filter((clip) => clip.track === 'text')
  .map((clip) => (
    <motion.div
      onDoubleClick={() => { setEditingTextClip(clip); setShowTextPanel(true); }}
      onMouseDown={(e) => {
        // 드래그 로직 (~60줄)
      }}
      // 트림 핸들러 (~60줄)
    >
      {clip.textContent}
    </motion.div>
  ))}
```

**After** (~8줄):
```typescript
{timelineClips
  .filter((clip) => clip.track === 'text')
  .map((clip) => (
    <TimelineClip
      key={clip.id}
      clip={clip}
      isSelected={selectedClipId === clip.id}
      zoom={timelineZoom}
      isDraggable={true}
      onSelect={setSelectedClipId}
      onDoubleClick={(clip) => {
        setEditingTextClip(clip);
        setShowTextPanel(true);
      }}
      onMove={moveClip}
      onTrimStart={trimClipStart}
      onTrimEnd={trimClipEnd}
    />
  ))}
```

**절감**: ~120줄 → ~8줄 (93% 감소)

---

### Step 3: 오디오/필터 트랙 리팩토링

**동일한 패턴 적용** (~240줄 → ~16줄)

---

## 📊 리팩토링 효과 예상

### 코드 라인 수
```
Before:
- EditorWorkspaceScreen.tsx: ~1200줄
- 중복 코드: ~400줄

After:
- EditorWorkspaceScreen.tsx: ~800줄 (-400줄, 33% 감소)
- TrimHandle.tsx: ~50줄 (신규)
- TimelineClip.tsx: ~180줄 (신규)
- useDragClip.ts: ~50줄 (신규)
- 총 코드량: ~1080줄 (120줄 감소)
```

### 유지보수성
```
변경이 필요한 곳:
Before: 4곳 (각 트랙마다)
After: 1곳 (TimelineClip 컴포넌트만)

개선율: 75% 감소
```

### 가독성
```
EditorWorkspaceScreen.tsx:
Before: 복잡도 높음 (1200줄, 중첩된 로직)
After: 복잡도 낮음 (800줄, 명확한 구조)

향상도: 매우 높음
```

---

## ⚠️ 주의사항

### 1. 비디오 트랙 특수 처리
```typescript
// 비디오는 trimStart/trimEnd 파라미터가 다름
onTrimStart={(id, delta) => {
  const currentStart = clip.startTime ?? 0;
  trimClipStart(id, currentStart + delta);  // 절대값
}}

// 텍스트/오디오/필터는 직접 전달
onTrimStart={trimClipStart}  // 상대값 (deltaTime)
```

### 2. 더블클릭 핸들러
```typescript
onDoubleClick={(clip) => {
  // 트랙별로 다른 패널 열기
  if (clip.track === 'text') {
    setEditingTextClip(clip);
    setShowTextPanel(true);
  }
  // ... 다른 트랙들
}}
```

### 3. 드래그 가능 여부
```typescript
isDraggable={clip.track !== 'video'}  // 비디오만 드래그 불가
```

---

## 🚀 적용 순서

### 1단계: 컴포넌트 테스트 (15분)
```typescript
// 비디오 트랙 1개만 TimelineClip으로 변경
// 동작 확인
```

### 2단계: 전체 트랙 적용 (30분)
```typescript
// 4개 트랙 모두 TimelineClip으로 변경
// 동작 확인
```

### 3단계: 불필요한 코드 제거 (15분)
```typescript
// 이전 트림 핸들러 로직 삭제
// import 정리
```

### 4단계: 성능 최적화 (30분)
```typescript
// React.memo 적용
export const TimelineClip = React.memo(...);

// throttle 적용 (드래그 중)
const throttledMove = throttle(moveClip, 16); // 60fps
```

### 5단계: 테스트 (20분)
```
- 모든 트랙에서 추가/편집/삭제
- 드래그 동작
- 트림 핸들러
- 성능 확인
```

### 6단계: 문서 업데이트 (10분)
```
- docs/CHANGES.md
- docs/개발현황_정리.md
- docs/REFACTORING_NOTES.md
```

**총 예상 시간**: 2시간

---

## 📝 체크리스트

### 리팩토링 전
- [ ] 현재 코드 백업 (Git commit)
- [ ] 기능 테스트 (모든 트랙 동작 확인)
- [ ] 새 컴포넌트 검토 (TrimHandle, TimelineClip, useDragClip)

### 리팩토링 중
- [ ] 비디오 트랙 교체
- [ ] 텍스트 트랙 교체
- [ ] 오디오 트랙 교체
- [ ] 필터 트랙 교체
- [ ] 이전 코드 제거
- [ ] Import 정리

### 리팩토링 후
- [ ] 전체 기능 테스트
- [ ] 성능 테스트
- [ ] 타입 에러 확인
- [ ] 린트 에러 확인
- [ ] 문서 업데이트

---

## 💡 추가 개선 사항

### 1. TimelineTrack 컴포넌트 분리
```typescript
// 트랙 자체도 컴포넌트로 분리 가능
<TimelineTrack
  track="video"
  clips={timelineClips.filter(c => c.track === 'video')}
  selectedClipId={selectedClipId}
  zoom={timelineZoom}
  onPanelOpen={() => setShowVideoPanel(true)}
  // ...
/>
```

### 2. 성능 최적화
```typescript
// React.memo로 메모이제이션
export const TimelineClip = React.memo<TimelineClipProps>((props) => {
  // ...
}, (prev, next) => {
  // 커스텀 비교 함수
  return prev.clip.id === next.clip.id &&
         prev.isSelected === next.isSelected &&
         prev.zoom === next.zoom;
});
```

### 3. throttle 적용
```typescript
// 드래그 중 성능 개선
import { throttle } from 'lodash-es'; // 또는 직접 구현

const throttledMove = throttle((clipId, position) => {
  moveClip(clipId, position);
}, 16); // 60fps
```

---

## 🔍 코드 비교

### 트림 핸들러 중복 제거

#### Before (중복 코드)
```
비디오 트랙: 트림 핸들러 로직 ~60줄
텍스트 트랙: 트림 핸들러 로직 ~60줄
오디오 트랙: 트림 핸들러 로직 ~60줄
필터 트랙: 트림 핸들러 로직 ~60줄
총: ~240줄 (중복)
```

#### After (컴포넌트 사용)
```
TrimHandle 컴포넌트: ~50줄 (1번만)
각 트랙: <TrimHandle /> 호출 ~5줄
총: ~70줄 (70% 감소)
```

---

## 🎓 학습 포인트

### 1. 컴포넌트 분리의 이점
```
장점:
✅ 코드 재사용
✅ 유지보수 용이
✅ 테스트 용이
✅ 가독성 향상

언제 분리할까?:
- 중복 코드가 3번 이상 반복
- 독립적인 기능
- 재사용 가능성
```

### 2. 커스텀 훅의 활용
```
언제 만들까?:
- 복잡한 로직
- 재사용 가능한 로직
- 이벤트 관리가 복잡할 때

장점:
✅ 로직과 UI 분리
✅ 테스트 용이
✅ 여러 컴포넌트에서 재사용
```

### 3. 성능 최적화 패턴
```typescript
// 1. React.memo - 불필요한 리렌더링 방지
export const MyComponent = React.memo(...);

// 2. useMemo - 계산 결과 캐싱
const total = useMemo(() => clips.reduce(...), [clips]);

// 3. useCallback - 함수 참조 유지
const handleClick = useCallback(() => {...}, [deps]);

// 4. throttle - 이벤트 빈도 제한
const throttled = throttle(handler, 16);
```

---

## 📚 참고 문서

- **docs/REFACTORING_NOTES.md** - 이전 리팩토링 기록
- **docs/DEVELOPMENT_GUIDE.md** - 개발 가이드
- **docs/CLAUDE.md** - 코딩 컨벤션

---

## ✅ 완료 조건

1. EditorWorkspaceScreen.tsx가 800줄 이하
2. 중복 코드 0개
3. 모든 기능 정상 동작
4. 타입/린트 에러 0개
5. 성능 개선 확인 (React DevTools Profiler)

---

**작성**: 2026-01-13  
**담당**: 다음 세션  
**예상 시간**: 2-3시간
