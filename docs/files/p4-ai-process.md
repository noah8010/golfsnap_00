# P4. AI 처리

> **파일**: `p4-ai-process.md`
> **최종 수정**: v1.3 (2026-02-11)

---

<!-- SECTION: P4-META -->
## 개요

| 항목 | 내용 |
|------|------|
| 목적 | 선택한 미디어를 분석하고 초기 타임라인을 자동 생성 |
| 진입 경로 | 미디어 선택(P3) → "타임라인 생성" 또는 "다음" |
| 하단 네비게이션 | 숨김 |
| 사용자 개입 | **불가** (자동 진행, 취소/뒤로가기 없음) |
| 흐름 위치 | 프로젝트 생성 3단계 중 **Step 3** |

### 진입 파라미터

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `aspectRatio` | `AspectRatio` | 프로젝트 비율 (`'16:9'` / `'9:16'` / `'1:1'`) |
| `selectedMedia` | `MediaItem[]` | 선택한 미디어 목록 (순서대로) |
| `onComplete` | `() => void` | 처리 완료 시 콜백 |

---

<!-- SECTION: P4-A -->
## A. 중앙 아이콘

| 항목 | 규칙 |
|------|------|
| 크기 | 48×48px (w-12 h-12) |
| 색상 | #2D5A3D (golf-green) |
| 위치 | 화면 중앙 상단, mb-8 (32px) |
| 전환 애니메이션 | scale 0.8→1, opacity 0→1, duration 300ms |

### 단계별 아이콘

| 단계 | 아이콘 | 회전 |
|------|--------|------|
| analyzing (미디어 분석) | Loader2 | animate-spin (1.5초 회전) |
| generating (타임라인 생성) | Loader2 | animate-spin (1.5초 회전) |
| subtitles (자막 생성) | Type | 정적 (회전 없음) |
| stickers (스티커 배치) | Sticker | 정적 (회전 없음) |
| complete (완료) | Sparkles | 정적 (회전 없음) |

---

<!-- SECTION: P4-B -->
## B. 진행 메시지

### 단계별 메시지

| 단계 | 메시지 |
|------|--------|
| analyzing | "미디어 분석 중..." |
| generating | "타임라인 생성 중..." |
| subtitles | "자동 자막 생성 중..." |
| stickers | "추천 스티커 배치 중..." |
| complete | "완료!" |

### 메시지 스타일

| 속성 | 값 |
|------|-----|
| 크기 | 20px (text-xl) |
| 굵기 | bold (700) |
| 색상 | #111827 (gray-900) |
| 전환 | y: 10px → 0, opacity 0 → 1 (Framer Motion) |

### 상세 텍스트

| 항목 | 규칙 |
|------|------|
| 내용 | "{N}개의 미디어로 {비율} 프로젝트를 생성하고 있습니다" |
| 예시 | "3개의 미디어로 9:16 프로젝트를 생성하고 있습니다" |
| 크기 | 14px (text-sm), gray-600 |

---

<!-- SECTION: P4-C -->
## C. 프로그레스 바

```
┌──────────────────────────────┐
│ ████████████░░░░░░░░░░░░░░░░ │
└──────────────────────────────┘
  진행률                      65%
```

### 프로그레스 바 스타일

| 항목 | 규칙 |
|------|------|
| 최대 너비 | 384px (max-w-xs) |
| 바 높이 | 8px (h-2) |
| 배경 | #E5E7EB (gray-200) |
| 진행 색상 | #2D5A3D (golf-green) |
| 라운드 | rounded-full |
| 애니메이션 | width transition, duration 500ms, ease-out |

### 진행률 라벨

| 항목 | 규칙 |
|------|------|
| 좌측 | "진행률" (12px, gray-500) |
| 우측 | "{progress}%" (12px, semibold, golf-green) |

---

<!-- SECTION: P4-D -->
## D. 체크리스트

4개 항목으로 구성되며 각 단계 완료 시 녹색 체크로 변경됩니다.

### 체크리스트 항목

| 항목 | 완료 조건 (progress 기준) |
|------|-------------------------|
| 미디어 분석 | progress >= 20% |
| 타임라인 생성 | progress >= 50% |
| 자동 자막 생성 | progress >= 75% |
| 추천 스티커 배치 | progress >= 95% |

### 항목 스타일

| 상태 | 원형 아이콘 | 라벨 텍스트 |
|------|-----------|-----------|
| 미완료 | #E5E7EB (gray-200), 빈 원형 | #9CA3AF (gray-400), normal |
| 완료 | #2D5A3D (golf-green), 흰색 체크 | #111827 (gray-900), medium |

### 항목 애니메이션

| 애니메이션 | 상세 |
|----------|------|
| 항목 등장 | x: -20 → 0, opacity 0 → 1 (stagger: index × 100ms) |
| 체크 아이콘 | scale 0 → 1 |
| 색상 전환 | transition-colors |

---

<!-- SECTION: P4-STEPS -->
## 진행 단계 타이밍

### 프로토타입 시뮬레이션

| 단계 | step 값 | 소요 시간 | 누적 시간 | progress |
|------|---------|----------|----------|----------|
| 1 | analyzing | 1,000ms | 1.0초 | 0% → 20% |
| 2 | generating | 1,500ms | 2.5초 | 20% → 50% |
| 3 | subtitles | 1,200ms | 3.7초 | 50% → 75% |
| 4 | stickers | 1,000ms | 4.7초 | 75% → 95% |
| 5 | complete | 500ms | 5.2초 | 95% → 100% |
| 대기 | - | 800ms | 6.0초 | - |
| 전환 | onComplete() | 즉시 | 6.0초 | → P5 진입 |

### 실 서비스 진행률 표시

| 항목 | 규칙 |
|------|------|
| 방식 1 | 서버 WebSocket/SSE로 실제 진행률 전송 시 해당 값 사용 |
| 방식 2 | 단일 API 호출 시 위 단계별 프로그레스를 시간 기반 시뮬레이션 |
| API 응답 수신 시 | 남은 단계를 빠르게 완료 → 100% |
| API 타임아웃 | 30초 경과 시 에러 처리 |

---

<!-- SECTION: P4-API -->
## 프로젝트 생성 API 호출

이 화면에서 실제로 수행되는 작업은 **프로젝트 생성 API 1건 호출**입니다.

### API 요청

```
POST /api/projects

Request:
{
  "aspectRatio": "9:16",
  "mediaIds": ["uuid1", "uuid2", "uuid3"],
  "templateId": "highlight-reel"    // 또는 null
}
```

### API 응답

```
Response 201:
{
  "id": "project-uuid",
  "name": "새 프로젝트",
  "aspectRatio": "9:16",
  "duration": 45.5,
  "thumbnail": "https://cdn.../thumb/uuid1.jpg",
  "clips": [...],          // VideoClip 배열
  "timeline": [...],       // TimelineItem 배열
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

<!-- SECTION: P4-SERVER -->
## 서버 프로젝트 생성 로직

### 비디오 클립 생성

| 항목 | 규칙 |
|------|------|
| 배치 순서 | 선택한 미디어 순서대로 비디오 트랙에 배치 |
| 첫 번째 클립 | position = 0 |
| 이후 클립 | position = 이전 클립의 position + duration |
| 초기값 | startTime=0, endTime=원본 duration, speed=1, volume=1 |

### shotData 매핑

| 조건 | 처리 |
|------|------|
| hasMetadata = true | 해당 MediaItem의 metadata → VideoClip의 shotData로 변환 |
| hasMetadata = false | shotData = null |

### 기타

| 항목 | 규칙 |
|------|------|
| 프로젝트 썸네일 | 첫 번째 미디어의 썸네일 사용 |
| 총 길이 | 마지막 클립의 position + 마지막 클립의 duration |

### 템플릿 클립 자동 생성

templateId가 존재하면, 템플릿 정의에 따라 추가 클립을 자동 생성합니다.

| 템플릿 ID | 자동 생성 클립 |
|----------|--------------|
| highlight-reel | 텍스트 "My Best Shots" (0~5초) + BGM "Energetic Beat" (0~30초) |
| practice-log | 텍스트 "오늘 날짜" (0~5초) + 필터 "Soft" (0~전체) |
| sns-shorts | BGM "Trendy Pop" (0~15초) + 스티커 🔥 (0~3초) |
| analysis | 텍스트 "데이터" (0~5초) + 필터 "Pro" (0~전체) |

---

<!-- SECTION: P4-E -->
## 완료 시 동작

| 순서 | 동작 |
|------|------|
| 1 | 프로그레스 100% 도달 |
| 2 | "완료!" 메시지 + Sparkles 아이콘 표시 |
| 3 | 0.8초 대기 |
| 4 | `onComplete()` 콜백 호출 |
| 5 | 부모 컴포넌트에서 `createNewProject()` 실행 |
| 6 | 에디터(P5)로 자동 전환 |

### 상태 저장 (onComplete 후)

| 저장 항목 | 값 |
|----------|-----|
| `currentScreen` | `'editor'` |
| `currentProject` | 서버에서 생성된 프로젝트 데이터 |
| `selectedTemplate` | `null` (사용 후 초기화) |

---

<!-- SECTION: P4-G -->
## 에러 처리

| 에러 | UI 처리 | 이후 동선 |
|------|---------|----------|
| 미디어 분석 실패 (400) | "미디어를 분석할 수 없습니다" (error 토스트) | P3(미디어 선택)으로 복귀 |
| 네트워크 오류 | "네트워크 연결을 확인해주세요" (error 토스트) + 재시도 버튼 | 재시도 또는 P3 복귀 |
| 서버 타임아웃 (30초) | "처리 시간이 초과되었습니다" (error 토스트) + 재시도 버튼 | 재시도 또는 P3 복귀 |
| 서버 에러 (5xx) | "서버 오류가 발생했습니다" (error 토스트) | P3(미디어 선택)으로 복귀 |

### 재시도

| 항목 | 규칙 |
|------|------|
| 재시도 버튼 탭 | 동일한 파라미터로 `POST /api/projects` 재호출 |
| UI 리셋 | 프로그레스 바 0%, 체크리스트 초기화, 단계 처음부터 재시작 |

---

<!-- SECTION: P4-STATE -->
## 상태 관리

### 컴포넌트 로컬 상태

| 상태 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| `progress` | `number` | `0` | 진행률 (0~100) |
| `currentStep` | `'analyzing' \| 'generating' \| 'subtitles' \| 'stickers' \| 'complete'` | `'analyzing'` | 현재 진행 단계 |

### 타입 정의

```typescript
type CurrentStep = 'analyzing' | 'generating' | 'subtitles' | 'stickers' | 'complete';
```
