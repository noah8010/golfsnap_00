# GolfSnap - 코딩 규칙

> **이 문서는 프로젝트 전체에서 일관성을 유지하기 위한 필수 규칙입니다.**
> 모든 코드 작성 시 이 규칙을 준수해야 합니다.

---

## 1. 파일 구조 규칙

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
│   └── useAppStore.ts    # Zustand 스토어 (단일 파일)
│
├── constants/            # 상수
│   └── editor.ts         # 에디터 관련 상수
│
├── hooks/                # 커스텀 훅
│   ├── useTimeline.ts    # 타임라인 로직
│   ├── useDragClip.ts    # 드래그 제스처
│   ├── usePinchZoom.ts   # 핀치 줌
│   ├── useLongPress.ts   # 롱프레스
│   └── useTouchScroll.ts # 터치 스크롤
│
├── screens/              # 화면 컴포넌트 (페이지)
│   └── *Screen.tsx       # 접미사 Screen 필수
│
└── components/           # 재사용 컴포넌트
    └── *.tsx             # PascalCase 네이밍
```

### 1.2 파일 네이밍 규칙
```
컴포넌트:     PascalCase.tsx     (예: TimelineClip.tsx)
훅:          useCamelCase.ts    (예: useTimeline.ts)
타입:        camelCase.ts       (예: golf.ts)
상수:        camelCase.ts       (예: editor.ts)
화면:        PascalCaseScreen.tsx (예: EditorWorkspaceScreen.tsx)
```

---

## 2. 컴포넌트 규칙

### 2.1 컴포넌트 구조 템플릿
```tsx
/**
 * @file ComponentName.tsx
 * @description 컴포넌트 설명 (한 줄)
 *
 * 상세 설명이 필요한 경우 여기에 작성
 */

import React from 'react';
import { motion } from 'framer-motion';
// lucide-react 아이콘
// 내부 imports (상대경로)

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
 *
 * @param props - 컴포넌트 props
 * @returns React 컴포넌트
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
    <div>
      {/* 컴포넌트 내용 */}
    </div>
  );
};
```

### 2.2 컴포넌트 규칙
```
1. 함수형 컴포넌트만 사용 (클래스 컴포넌트 금지)
2. React.FC<Props> 타입 명시
3. export const 사용 (default export 금지)
4. 300줄 초과 시 분리 고려
5. props는 구조분해할당으로 받기
```

---

## 3. 타입스크립트 규칙

### 3.1 타입 정의 위치
```
- 공용 타입: src/types/golf.ts
- 컴포넌트 전용 Props: 컴포넌트 파일 상단
- 훅 내부 타입: 훅 파일 상단
```

### 3.2 타입 네이밍
```tsx
// 인터페이스: I 접두사 사용 안 함
interface TimelineItem { ... }      // Good
interface ITimelineItem { ... }     // Bad

// Props 타입
interface ComponentNameProps { ... } // 컴포넌트명 + Props

// 유니온 타입
type TrackType = 'video' | 'text' | 'audio' | 'filter' | 'sticker';
```

### 3.3 금지 사항
```tsx
// any 사용 금지
const data: any = {};  // Bad
const data: unknown = {};  // Good (타입 가드 필요)

// as 단언 최소화
const el = document.getElementById('id') as HTMLDivElement;  // 피할 것
const el = document.getElementById('id');
if (el instanceof HTMLDivElement) { ... }  // Good
```

---

## 4. 스타일링 규칙

### 4.1 Tailwind CSS 사용
```tsx
// Good: Tailwind 클래스
<div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">

// Bad: 인라인 스타일 (예외적으로만 허용)
<div style={{ display: 'flex', gap: '8px' }}>
```

### 4.2 인라인 스타일 허용 케이스
```tsx
// 동적 계산이 필요한 경우만 허용
<div style={{
  width: `${duration * PIXELS_PER_SECOND * zoom}px`,
  left: `${position * PIXELS_PER_SECOND * zoom}px`,
}}>
```

### 4.3 클래스 순서
```tsx
// 순서: 레이아웃 → 박스모델 → 타이포그래피 → 비주얼 → 기타
<div className="
  flex items-center justify-between    // 레이아웃
  w-full h-12 px-4 py-2                // 박스모델
  text-sm font-medium                  // 타이포그래피
  bg-white border border-gray-200      // 비주얼
  rounded-lg shadow-sm                 // 기타
  hover:bg-gray-50 transition-colors   // 상태
">
```

---

## 5. 상태 관리 규칙

### 5.1 Zustand 스토어 규칙
```tsx
// 스토어 사용
const { currentScreen, setCurrentScreen } = useAppStore();  // Good
const store = useAppStore();  // Bad (전체 구독)

// 선택적 구독 (성능 최적화)
const currentScreen = useAppStore((state) => state.currentScreen);
```

### 5.2 로컬 상태 vs 전역 상태
```
전역 상태 (Zustand):
- 화면 네비게이션 (currentScreen)
- 현재 프로젝트 (currentProject)
- 프로젝트 목록 (projects)
- 재생 상태 (isPlaying, currentTime)

로컬 상태 (useState):
- UI 표시 상태 (showPanel, isEditing)
- 폼 입력값
- 임시 데이터
```

---

## 6. 훅 규칙

### 6.1 커스텀 훅 네이밍
```
use + 명사/동사구
예: useTimeline, useDragClip, usePinchZoom
```

### 6.2 훅 구조
```tsx
/**
 * @description 훅 설명
 */
export const useHookName = (params: Params) => {
  // 상태 정의
  const [state, setState] = useState();

  // useEffect
  useEffect(() => {
    // ...
  }, [deps]);

  // 핸들러/유틸리티 함수
  const handleAction = useCallback(() => {
    // ...
  }, [deps]);

  // 반환
  return {
    state,
    handleAction,
  };
};
```

---

## 7. 주석 규칙

### 7.1 JSDoc 필수 항목
```tsx
/**
 * 함수/컴포넌트 설명
 *
 * @param paramName - 파라미터 설명
 * @returns 반환값 설명
 *
 * @example
 * const result = functionName(param);
 */
```

### 7.2 섹션 구분 주석
```tsx
// ============================================================================
// 섹션 제목 (큰 구분)
// ============================================================================

// ========================================
// 서브섹션 제목 (작은 구분)
// ========================================
```

### 7.3 인라인 주석
```tsx
// 한 줄 설명은 // 사용
const value = calculate(); // 간단한 설명

/*
 * 여러 줄 설명이 필요한 경우
 * 이렇게 작성
 */
```

---

## 8. Import 규칙

### 8.1 Import 순서
```tsx
// 1. React
import React, { useState, useEffect } from 'react';

// 2. 외부 라이브러리
import { motion, AnimatePresence } from 'framer-motion';
import { Icon1, Icon2 } from 'lucide-react';

// 3. 내부 절대경로 (있는 경우)

// 4. 내부 상대경로 - 먼 것부터
import { useAppStore } from '../store/useAppStore';
import { TimelineItem } from '../types/golf';

// 5. 같은 디렉토리
import { SubComponent } from './SubComponent';
```

### 8.2 Import 규칙
```tsx
// Named export 사용
import { ComponentName } from './ComponentName';  // Good
import ComponentName from './ComponentName';      // Bad

// 아이콘은 as로 리네이밍 가능
import { Copy as CopyIcon } from 'lucide-react';
```

---

## 9. 에러 처리 규칙

### 9.1 Early Return 패턴
```tsx
const handleAction = () => {
  // 조건 불충족 시 빠른 반환
  if (!selectedClipId) return;
  if (!clip) return;

  // 메인 로직
  processClip(clip);
};
```

### 9.2 사용자 알림
```tsx
// 프로토타입이므로 간단히 alert 사용 허용
if (!isValid) {
  alert('유효하지 않은 작업입니다');
  return;
}
```

---

## 10. Git 커밋 규칙

### 10.1 커밋 메시지 형식
```
<type>: <description>

[optional body]

[optional footer]
```

### 10.2 Type 종류
```
feat:     새 기능 추가
fix:      버그 수정
refactor: 리팩토링 (기능 변화 없음)
style:    코드 스타일 변경 (포매팅 등)
docs:     문서 변경
chore:    빌드, 설정 변경
```

### 10.3 예시
```
feat: 클립 볼륨 조절 기능 추가

- ClipVolumePanel 컴포넌트 생성
- useTimeline에 updateClipVolume 함수 추가
- 영상 트랙 클립에 볼륨 버튼 표시
```

---

## 11. 성능 최적화 규칙

### 11.1 메모이제이션
```tsx
// 비용이 큰 계산
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// 콜백 함수
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### 11.2 리렌더링 방지
```tsx
// Zustand 선택적 구독
const value = useAppStore((state) => state.specificValue);

// 불필요한 객체/배열 리터럴 피하기
<Component style={{ margin: 0 }} />  // Bad: 매번 새 객체
const style = useMemo(() => ({ margin: 0 }), []);
<Component style={style} />  // Good
```

---

> **이 규칙을 준수하면 일관성 있고 유지보수 가능한 코드를 작성할 수 있습니다.**
