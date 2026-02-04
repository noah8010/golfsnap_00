# GolfSnap - 스타일 가이드

> **코딩 규칙 + 디자인 시스템 통합 문서**
> 모든 코드 작성 및 UI 작업 시 이 규칙을 준수해야 합니다.

---

## 1. 파일 구조

### 1.1 디렉토리 구조 (변경 금지)
```
src/
├── main.tsx              # 앱 진입점 (수정 금지)
├── App.tsx               # 라우팅 (신중히 수정)
├── index.css             # 전역 스타일
│
├── types/                # 타입 정의
│   └── golf.ts           # 모든 타입은 이 파일에
│
├── store/                # 상태 관리
│   ├── useAppStore.ts    # Zustand 전역 상태
│   └── useHistoryStore.ts # Undo/Redo 히스토리
│
├── constants/            # 상수
│   ├── editor.ts         # 에디터 관련 상수
│   └── assistantRules.ts # AI 어시스턴트 규칙
│
├── hooks/                # 커스텀 훅
│   ├── useTimeline.ts    # 타임라인 로직
│   ├── useDragClip.ts    # 드래그 제스처
│   ├── usePinchZoom.ts   # 핀치 줌
│   ├── useLongPress.ts   # 롱프레스
│   ├── useTouchScroll.ts # 터치 스크롤
│   └── useSmartAssistant.ts # AI 어시스턴트
│
├── screens/              # 화면 컴포넌트 (페이지)
│   └── *Screen.tsx       # 접미사 Screen 필수
│
└── components/           # 재사용 컴포넌트
    └── *.tsx             # PascalCase 네이밍
```

### 1.2 파일 네이밍
```
컴포넌트:     PascalCase.tsx     (예: TimelineClip.tsx)
훅:          useCamelCase.ts    (예: useTimeline.ts)
타입:        camelCase.ts       (예: golf.ts)
상수:        camelCase.ts       (예: editor.ts)
화면:        PascalCaseScreen.tsx (예: EditorWorkspaceScreen.tsx)
```

---

## 2. 컴포넌트 규칙

### 2.1 구조 템플릿
```tsx
/**
 * @file ComponentName.tsx
 * @description 컴포넌트 설명 (한 줄)
 */

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// 타입 정의
// ============================================================================

interface ComponentNameProps {
  /** prop 설명 */
  propName: string;
}

// ============================================================================
// 컴포넌트
// ============================================================================

/**
 * 컴포넌트 설명
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  propName,
}) => {
  // ========================================
  // 상태 정의
  // ========================================

  // ========================================
  // 핸들러
  // ========================================

  // ========================================
  // 렌더링
  // ========================================

  return (
    <div>{/* 컴포넌트 내용 */}</div>
  );
};
```

### 2.2 필수 규칙
```
1. 함수형 컴포넌트만 사용 (클래스 컴포넌트 금지)
2. React.FC<Props> 타입 명시
3. export const 사용 (default export 금지)
4. 300줄 초과 시 분리 고려
5. props는 구조분해할당으로 받기
```

---

## 3. TypeScript 규칙

### 3.1 타입 정의 위치
```
- 공용 타입: src/types/golf.ts
- 컴포넌트 전용 Props: 컴포넌트 파일 상단
- 훅 내부 타입: 훅 파일 상단
```

### 3.2 타입 네이밍
```tsx
interface TimelineItem { ... }      // Good (I 접두사 사용 안 함)
interface ComponentNameProps { ... } // 컴포넌트명 + Props
type TrackType = 'video' | 'text' | 'audio' | 'filter' | 'sticker';
```

### 3.3 금지 사항
```tsx
// any 사용 금지
const data: any = {};     // Bad
const data: unknown = {}; // Good

// as 단언 최소화
const el = document.getElementById('id') as HTMLDivElement;  // 피할 것
if (el instanceof HTMLDivElement) { ... }                    // Good
```

---

## 4. 스타일링 규칙

### 4.1 Tailwind CSS 전용
```tsx
// Good: Tailwind 클래스
<div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">

// Bad: 인라인 스타일
<div style={{ display: 'flex', gap: '8px' }}>

// 예외: 동적 계산이 필요한 경우만 인라인 허용
<div style={{
  width: `${duration * PIXELS_PER_SECOND * zoom}px`,
  left: `${position * PIXELS_PER_SECOND * zoom}px`,
}}>
```

### 4.2 클래스 순서
```tsx
// 레이아웃 → 박스모델 → 타이포그래피 → 비주얼 → 상태
className="
  flex items-center justify-between
  w-full h-12 px-4 py-2
  text-sm font-medium
  bg-white border border-gray-200 rounded-lg shadow-sm
  hover:bg-gray-50 transition-colors
"
```

---

## 5. 색상 시스템

### 5.1 브랜드 색상 (변경 금지)
```css
--golf-green: #2D5A3D;    /* 메인 브랜드 */
--golf-fairway: #4A7C59;  /* 보조 그린 */
--golf-sand: #E8D4A2;     /* 샌드 베이지 */
--golf-sky: #87CEEB;      /* 스카이 블루 */
```

### 5.2 트랙별 색상 (변경 금지)
```css
--track-video: #3b82f6;    /* 파란색 - 영상 */
--track-text: #f59e0b;     /* 주황색 - 텍스트 */
--track-audio: #10b981;    /* 초록색 - 오디오 */
--track-filter: #a855f7;   /* 보라색 - 필터 */
--track-sticker: #ec4899;  /* 핑크색 - 스티커 */
```

### 5.3 Tailwind 매핑
```tsx
// 브랜드
className="bg-golf-green text-white"

// 트랙
className="bg-blue-500"      // video
className="bg-amber-500"     // text
className="bg-emerald-500"   // audio
className="bg-purple-500"    // filter
className="bg-pink-500"      // sticker
```

### 5.4 시스템 색상
```css
/* Primary (Green 계열) */
--primary-500: #22c55e;
--primary-600: #16a34a;
--primary-700: #15803d;

/* Gray 계열 */
--gray-50: #f9fafb;   --gray-100: #f3f4f6;
--gray-200: #e5e7eb;  --gray-500: #6b7280;
--gray-700: #374151;  --gray-900: #111827;
```

---

## 6. 타이포그래피

### 6.1 폰트
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 6.2 크기 및 두께
```tsx
// 제목
className="text-2xl font-bold"   // 24px
className="text-xl font-bold"    // 20px
className="text-lg font-bold"    // 18px

// 본문
className="text-base"            // 16px
className="text-sm"              // 14px
className="text-xs"              // 12px - 캡션, 라벨
```

---

## 7. 간격 시스템

```
기본 단위: 4px (Tailwind 기본)
```

```tsx
// Padding
className="p-2"  // 8px   className="p-3"  // 12px
className="p-4"  // 16px  className="p-6"  // 24px

// Gap
className="gap-1" // 4px   className="gap-2" // 8px
className="gap-3" // 12px  className="gap-4" // 16px

// 화면 기본 패딩
className="px-4"  // 좌우 16px
```

---

## 8. 컴포넌트 스타일 레퍼런스

### 8.1 버튼
```tsx
// Primary
<motion.button whileTap={{ scale: 0.95 }}
  className="px-4 py-2 bg-golf-green text-white font-semibold rounded-lg
             hover:bg-golf-green/90 transition-colors">

// Secondary
<motion.button whileTap={{ scale: 0.95 }}
  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg
             hover:bg-gray-200 transition-colors">

// Icon
<motion.button whileTap={{ scale: 0.9 }}
  className="w-10 h-10 flex items-center justify-center rounded-full
             bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
```

### 8.2 카드 / Input / 패널
```tsx
// 카드
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">

// Input
<input className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-golf-green">

// 패널 (Bottom Sheet)
<motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
  className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl">
```

---

## 9. 아이콘

```
Lucide React 전용 (다른 아이콘 라이브러리 금지)
```

```tsx
// 크기
className="w-4 h-4"  // 16px (작은)
className="w-5 h-5"  // 20px (기본)
className="w-6 h-6"  // 24px (큰)
className="w-8 h-8"  // 32px (강조)
```

---

## 10. 애니메이션

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// 버튼 탭
<motion.button whileTap={{ scale: 0.95 }}>

// 페이드 인/아웃
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
  exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

// 슬라이드 업 (패널)
<motion.div initial={{ y: '100%' }} animate={{ y: 0 }}
  exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>

// AnimatePresence
<AnimatePresence mode="wait">
  {showPanel && <motion.div key="panel" ...>패널</motion.div>}
</AnimatePresence>
```

---

## 11. 터치 인터랙션

```tsx
// 최소 터치 영역: 44px (Apple HIG)
className="min-w-[44px] min-h-[44px]"

// 터치 피드백
<motion.button whileTap={{ scale: 0.95 }}>
className="active:bg-gray-200"

// 터치 최적화 (index.css)
.timeline-clip {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

---

## 12. 레이아웃 패턴

### 12.1 화면 기본 구조
```tsx
<div className="relative flex flex-col h-full bg-gray-50">
  <div className="flex-shrink-0 h-11 bg-white" />           {/* Status Bar */}
  <div className="flex-shrink-0 bg-white border-b ...">     {/* Header */}
  <div className="flex-1 overflow-auto">                     {/* Content */}
  <div className="flex-shrink-0 bg-white border-t ... safe-area-bottom"> {/* Footer */}
</div>
```

### 12.2 Z-Index
```
z-0:   기본 콘텐츠
z-10:  고정 헤더/푸터
z-20:  플로팅 버튼
z-30:  플레이헤드
z-40:  드롭다운/팝오버
z-50:  모달/패널
```

### 12.3 반응형
```
모바일 전용 - 반응형 불필요
MobileFrame 컴포넌트로 393x852px 고정
```

---

## 13. 상태 관리

### 13.1 Zustand 스토어
```tsx
// 선택적 구독 (성능 최적화)
const currentScreen = useAppStore((state) => state.currentScreen);  // Good
const store = useAppStore();  // Bad (전체 구독)
```

### 13.2 로컬 vs 전역
```
전역 (Zustand): 화면 네비게이션, 프로젝트 관리, 재생 상태
로컬 (useState): UI 표시 상태, 폼 입력값, 임시 데이터
```

---

## 14. 코드 작성 규칙

### 14.1 훅
```tsx
/**
 * @description 훅 설명
 */
export const useHookName = (params: Params) => {
  const [state, setState] = useState();
  useEffect(() => { ... }, [deps]);
  const handleAction = useCallback(() => { ... }, [deps]);
  return { state, handleAction };
};
```

### 14.2 Import 순서
```tsx
// 1. React
import React, { useState, useEffect } from 'react';
// 2. 외부 라이브러리
import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';
// 3. 내부 상대경로 (먼 것부터)
import { useAppStore } from '../store/useAppStore';
// 4. 같은 디렉토리
import { SubComponent } from './SubComponent';
```

### 14.3 주석
```tsx
// JSDoc 필수
/**
 * 함수 설명
 * @param paramName - 파라미터 설명
 * @returns 반환값 설명
 */

// 섹션 구분
// ============================================================================
// 섹션 제목
// ============================================================================
```

### 14.4 에러 처리
```tsx
// Early Return 패턴
const handleAction = () => {
  if (!selectedClipId) return;
  if (!clip) return;
  processClip(clip);
};
```

### 14.5 성능 최적화
```tsx
const expensiveValue = useMemo(() => heavyCalculation(data), [data]);
const handleClick = useCallback(() => doSomething(id), [id]);
```

---

## 15. Git 커밋

```
<type>: <description>

feat:     새 기능 추가
fix:      버그 수정
refactor: 리팩토링
style:    코드 스타일 변경
docs:     문서 변경
chore:    빌드, 설정 변경
```

---

> **이 가이드를 준수하면 일관성 있고 유지보수 가능한 코드를 작성할 수 있습니다.**
