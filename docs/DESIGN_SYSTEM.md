# GolfSnap - 디자인 시스템

> **이 문서는 프로젝트의 시각적 일관성을 위한 디자인 가이드입니다.**
> 모든 UI 작업 시 이 규칙을 준수해야 합니다.

---

## 1. 기본 원칙

### 1.1 디자인 철학
```
1. 모바일 퍼스트 - 터치 친화적 UI
2. 심플함 - 불필요한 장식 최소화
3. 직관성 - 학습 없이 사용 가능
4. 일관성 - 동일한 동작은 동일한 UI
```

### 1.2 대상 디바이스
```
기준 해상도: 393 x 852px (iPhone 14 Pro)
최소 터치 영역: 44 x 44px (Apple HIG)
```

---

## 2. 색상 시스템

### 2.1 브랜드 색상 (변경 금지)
```css
/* Golf 테마 */
--golf-green: #2D5A3D;    /* 메인 브랜드 색상 */
--golf-fairway: #4A7C59;  /* 보조 그린 */
--golf-sand: #E8D4A2;     /* 샌드 베이지 */
--golf-sky: #87CEEB;      /* 스카이 블루 */
```

### 2.2 시스템 색상
```css
/* Primary (Green 계열) */
--primary-50: #f0fdf4;
--primary-100: #dcfce7;
--primary-500: #22c55e;
--primary-600: #16a34a;
--primary-700: #15803d;

/* Gray 계열 (Tailwind 기본) */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;
```

### 2.3 트랙별 색상 (변경 금지)
```css
/* 타임라인 트랙 */
--track-video: #3b82f6;         /* 파란색 - 영상 */
--track-text: #f59e0b;          /* 주황색 - 텍스트 */
--track-audio: #10b981;         /* 초록색 - 오디오 */
--track-filter: #a855f7;        /* 보라색 - 필터 */
--track-sticker: #ec4899;       /* 핑크색 - 스티커 */
```

### 2.4 Tailwind 클래스 매핑
```tsx
// 브랜드
className="bg-golf-green text-white"
className="bg-golf-fairway"

// 트랙 (배경)
className="bg-blue-500"      // video
className="bg-amber-500"     // text
className="bg-emerald-500"   // audio
className="bg-purple-500"    // filter
className="bg-pink-500"      // sticker

// 상태
className="bg-gray-50"       // 비활성 배경
className="bg-white"         // 기본 배경
className="text-gray-600"    // 보조 텍스트
className="text-gray-900"    // 기본 텍스트
```

---

## 3. 타이포그래피

### 3.1 폰트 패밀리
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
```

### 3.2 폰트 크기
```tsx
// 제목
className="text-2xl font-bold"  // 24px - 메인 제목
className="text-xl font-bold"   // 20px - 섹션 제목
className="text-lg font-bold"   // 18px - 카드 제목

// 본문
className="text-base"           // 16px - 기본 텍스트
className="text-sm"             // 14px - 보조 텍스트
className="text-xs"             // 12px - 캡션, 라벨
```

### 3.3 폰트 두께
```tsx
className="font-bold"     // 700 - 제목
className="font-semibold" // 600 - 강조
className="font-medium"   // 500 - 버튼
className="font-normal"   // 400 - 본문
```

---

## 4. 간격 시스템

### 4.1 기본 단위
```
4px 단위 사용 (Tailwind 기본)
0.5 = 2px, 1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px ...
```

### 4.2 일반적인 간격
```tsx
// 내부 여백 (Padding)
className="p-2"   // 8px - 작은 요소
className="p-3"   // 12px - 버튼
className="p-4"   // 16px - 카드
className="p-6"   // 24px - 섹션

// 외부 여백 (Gap)
className="gap-1"  // 4px - 아이콘과 텍스트
className="gap-2"  // 8px - 버튼 그룹
className="gap-3"  // 12px - 리스트 아이템
className="gap-4"  // 16px - 섹션 간
```

### 4.3 화면 레이아웃
```tsx
// 화면 기본 패딩
className="px-4"  // 좌우 16px

// Safe Area (노치 대응)
className="safe-area-top"     // 상단 노치
className="safe-area-bottom"  // 하단 홈바
```

---

## 5. 컴포넌트 스타일

### 5.1 버튼

#### Primary 버튼
```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
  className="px-4 py-2 bg-golf-green text-white font-semibold rounded-lg
             hover:bg-golf-green/90 transition-colors"
>
  버튼 텍스트
</motion.button>
```

#### Secondary 버튼
```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg
             hover:bg-gray-200 transition-colors"
>
  버튼 텍스트
</motion.button>
```

#### Icon 버튼
```tsx
<motion.button
  whileTap={{ scale: 0.9 }}
  className="w-10 h-10 flex items-center justify-center rounded-full
             bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
>
  <Icon className="w-5 h-5 text-white" />
</motion.button>
```

#### 툴바 버튼
```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
  className="flex flex-col items-center gap-0.5"
>
  <Icon className="w-5 h-5 text-gray-700" />
  <span className="text-xs text-gray-600">라벨</span>
</motion.button>
```

### 5.2 카드
```tsx
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
  {/* 카드 내용 */}
</div>
```

### 5.3 Input
```tsx
<input
  type="text"
  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl
             text-gray-900 placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-golf-green focus:border-transparent"
  placeholder="입력..."
/>
```

### 5.4 패널/모달
```tsx
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl"
>
  {/* 핸들 */}
  <div className="flex justify-center pt-3 pb-2">
    <div className="w-10 h-1 bg-gray-300 rounded-full" />
  </div>
  {/* 내용 */}
  <div className="px-6 pb-6">
    ...
  </div>
</motion.div>
```

---

## 6. 아이콘 시스템

### 6.1 아이콘 라이브러리
```
Lucide React 사용 (다른 아이콘 라이브러리 금지)
https://lucide.dev/icons
```

### 6.2 아이콘 크기
```tsx
className="w-4 h-4"   // 16px - 작은 아이콘
className="w-5 h-5"   // 20px - 기본 아이콘
className="w-6 h-6"   // 24px - 큰 아이콘
className="w-8 h-8"   // 32px - 강조 아이콘
```

### 6.3 주요 아이콘 매핑
```tsx
import {
  // 네비게이션
  ChevronLeft,    // 뒤로가기
  ChevronRight,   // 앞으로
  X,              // 닫기

  // 재생 컨트롤
  Play,           // 재생
  Pause,          // 일시정지

  // 편집
  Scissors,       // 분할
  Trash2,         // 삭제
  Copy,           // 복제
  Gauge,          // 속도
  Volume2,        // 볼륨

  // 기타
  Plus,           // 추가
  Check,          // 확인
  Search,         // 검색
} from 'lucide-react';
```

---

## 7. 애니메이션

### 7.1 Framer Motion 사용
```tsx
import { motion, AnimatePresence } from 'framer-motion';
```

### 7.2 기본 트랜지션
```tsx
// 버튼 탭
<motion.button whileTap={{ scale: 0.95 }}>

// 페이드 인/아웃
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
>

// 슬라이드 업
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
>
```

### 7.3 AnimatePresence
```tsx
<AnimatePresence mode="wait">
  {showPanel && (
    <motion.div key="panel" ...>
      패널 내용
    </motion.div>
  )}
</AnimatePresence>
```

---

## 8. 터치 인터랙션

### 8.1 터치 영역
```tsx
// 최소 44px 확보
className="min-w-[44px] min-h-[44px]"
className="w-11 h-11"  // 44px
```

### 8.2 터치 피드백
```tsx
// 시각적 피드백
<motion.button whileTap={{ scale: 0.95 }}>
<motion.div whileTap={{ scale: 0.98 }}>

// CSS 피드백
className="active:bg-gray-200"
className="active:scale-95"
```

### 8.3 터치 최적화 CSS
```css
/* 터치 관련 클래스 (index.css에 정의됨) */
.timeline-clip {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

---

## 9. 레이아웃 패턴

### 9.1 화면 기본 구조
```tsx
<div className="relative flex flex-col h-full bg-gray-50">
  {/* Status Bar Spacer */}
  <div className="flex-shrink-0 h-11 bg-white" />

  {/* Header */}
  <div className="flex-shrink-0 bg-white border-b border-gray-200">
    ...
  </div>

  {/* Content (스크롤 가능) */}
  <div className="flex-1 overflow-auto">
    ...
  </div>

  {/* Footer (고정) */}
  <div className="flex-shrink-0 bg-white border-t border-gray-200 safe-area-bottom">
    ...
  </div>
</div>
```

### 9.2 Flex 레이아웃
```tsx
// 가로 정렬
className="flex items-center gap-2"
className="flex items-center justify-between"
className="flex items-center justify-center"

// 세로 정렬
className="flex flex-col gap-4"
```

### 9.3 Grid 레이아웃
```tsx
// 2열 그리드
className="grid grid-cols-2 gap-3"

// 3열 그리드
className="grid grid-cols-3 gap-2"

// 4열 그리드 (아이콘 그리드)
className="grid grid-cols-4 gap-2"
```

---

## 10. 반응형 고려사항

### 10.1 고정 해상도
```
이 프로젝트는 모바일 전용이므로 반응형 불필요
MobileFrame 컴포넌트로 393x852px 고정
```

### 10.2 MobileFrame 래퍼
```tsx
<MobileFrame>
  {/* 모든 화면 컴포넌트 */}
</MobileFrame>
```

---

## 11. 다크 모드

### 11.1 현재 상태
```
다크 모드 미구현 (TODO 항목)
라이트 모드 전용으로 개발
```

### 11.2 향후 대응 준비
```tsx
// 시맨틱 클래스 사용 권장
className="bg-white"      // 배경
className="text-gray-900" // 기본 텍스트
className="text-gray-600" // 보조 텍스트
className="border-gray-200" // 테두리
```

---

## 12. Z-Index 가이드

```tsx
z-0:   기본 콘텐츠
z-10:  고정 헤더/푸터
z-20:  플로팅 버튼
z-30:  플레이헤드
z-40:  드롭다운/팝오버
z-50:  모달/패널
```

---

> **일관된 디자인 시스템을 따르면 사용자에게 통일감 있는 경험을 제공할 수 있습니다.**
