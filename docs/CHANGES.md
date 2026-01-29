# 변경 이력

---

## 2026-01-29

### 문서 정리
- 불필요한 문서 archive로 이동 (6개)
- 핵심 문서 3개로 통합 (PROJECT_STATUS, TODO, CHANGES)
- 실제 코드 기반으로 문서 업데이트

---

## 2026-01-13 (오후)

### 버그 수정
- **scrollLeft 초기화 문제 해결**
  - useEffect → useLayoutEffect 변경
  - getPlayheadTime() 공통 함수 생성
  - scrollLeft=0 케이스 자동 처리

- **비디오 범위 제한 로직 검증 완료**
  - 생성/이동/트림 시 범위 체크
  - useEffect로 실시간 감시

### 수정 파일
- src/screens/EditorWorkspaceScreen.tsx

---

## 2026-01-13 (오전)

### 모바일 프레임 수정
- fixed → absolute 변경 (팝업이 프레임 안에서만 동작)
- CreateDashboardScreen, EditorWorkspaceScreen 적용

### 4개 트랙 완성
- 오디오 타임라인 기능 추가
- 필터 타임라인 기능 추가
- TimelineItem 타입 확장 (오디오/필터 속성)

### 리팩토링
- TrimHandle 컴포넌트 분리
- TimelineClip 컴포넌트 분리
- useDragClip 훅 분리
- 0.5초 롱프레스 드래그 구현

### 수정 파일
- src/components/MobileFrame.tsx
- src/screens/EditorWorkspaceScreen.tsx
- src/components/TimelineClip.tsx (신규)
- src/components/TrimHandle.tsx (신규)
- src/hooks/useDragClip.ts (신규)
- src/types/golf.ts

---

## 2026-01-12 (오후)

### 에디터 화면 리디자인
- 다크 → 라이트 테마 전환
- 헤더 심플화 (뒤로가기 + 제목 + 내보내기)
- 미리보기 화면에 프로젝트 썸네일 표시
- 하단 툴바 재구성 (다중선택/분할/속도/복제/삭제)
- 타임라인 트랙 라벨 버튼화

### 타임라인 편집 기능
- 트림 핸들러 구현 (좌우 드래그)
- 리플 편집 구현 (뒤 클립 자동 이동)
- 분할 기능 개선 (중앙 플레이헤드 기준)

### 텍스트 기능 구현
- TextPanel UI 개편
- 타임라인 통합 (추가/편집/삭제)
- 미리보기 텍스트 표시
- 드래그 이동, 트림 핸들러 지원

### useTimeline 훅 확장
- addClip, updateClip, moveClip 함수 추가
- trimClipStart/End 비디오/텍스트 구분

### 수정 파일
- src/screens/EditorWorkspaceScreen.tsx
- src/hooks/useTimeline.ts
- src/types/golf.ts
- src/components/TextPanel.tsx
- src/constants/editor.ts

---

## 2026-01-12 (오전)

### 버그 수정
- useTouchScroll 버튼 클릭 방해 문제 수정
- MobileFrame 뷰포트 375px → 393px
- 타임라인 데이터 흐름 개선 (프로젝트 데이터 우선)

### 기능 개선
- 최소 클립 길이 검증 (0.1초)
- 속도 범위 클램프 (0.1x ~ 8x)
- 속도 변경 시 후속 클립 자동 재정렬

### 수정 파일
- src/hooks/useTimeline.ts
- src/hooks/useTouchScroll.ts
- src/components/MobileFrame.tsx
- src/components/BottomNavigation.tsx
- src/constants/editor.ts

---

**마지막 업데이트**: 2026-01-29
