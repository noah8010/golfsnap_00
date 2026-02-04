/**
 * @file App.tsx
 * @description 앱 루트 컴포넌트
 *
 * GolfSnap 앱의 진입점으로, 화면 라우팅과 네비게이션을 담당합니다.
 *
 * ## 화면 구성
 * ```
 * currentScreen 상태에 따라 다른 화면 렌더링:
 *
 * - 'create'      → CreateDashboardScreen (프로젝트 대시보드)
 * - 'newProject'  → NewProjectFlowScreen (새 프로젝트 생성)
 * - 'editor'      → EditorWorkspaceScreen (영상 편집기)
 * - 'home'        → HomeScreen (TODO)
 * - 'explore'     → ShotsScreen (TODO)
 * - 'booking'     → EditorScreen (TODO)
 * - 'profile'     → PreviewScreen (TODO)
 * ```
 *
 * ## 레이아웃
 * - MobileFrame: 모바일 화면 크기 고정 (393x852px)
 * - BottomNavigation: 하단 탭 네비게이션 (일부 화면에서만)
 *
 * ## 화면 전환 애니메이션
 * - Framer Motion의 AnimatePresence 사용
 * - 페이드 + 슬라이드 효과
 *
 * @see MobileFrame - 모바일 프레임 래퍼
 * @see BottomNavigation - 하단 탭 네비게이션
 * @see useAppStore - 전역 상태 관리
 */

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MobileFrame } from './components/MobileFrame';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './screens/HomeScreen';
import { CreateDashboardScreen } from './screens/CreateDashboardScreen';
import { NewProjectFlowScreen } from './screens/NewProjectFlowScreen';
import { EditorWorkspaceScreen } from './screens/EditorWorkspaceScreen';
import { ShotsScreen } from './screens/ShotsScreen';
import { EditorScreen } from './screens/EditorScreen';
import { PreviewScreen } from './screens/PreviewScreen';
import { useAppStore } from './store/useAppStore';
import { useTheme } from './hooks/useTheme';

/**
 * 앱 루트 컴포넌트
 *
 * @returns React 컴포넌트
 */
const App: React.FC = () => {
  // ========================================
  // 전역 상태
  // ========================================

  const {
    currentScreen,     // 현재 화면
    setCurrentScreen,  // 화면 전환 함수
    createNewProject,  // 새 프로젝트 생성 함수
    isShareMode,       // 공유 모드 여부
  } = useAppStore();

  // 다크/라이트 모드
  useTheme();

  // ========================================
  // 새 프로젝트 플로우 핸들러
  // ========================================

  /**
   * 새 프로젝트 생성 완료 핸들러
   *
   * 3단계 플로우 완료 시 호출됩니다.
   * createNewProject가 내부적으로 에디터 화면으로 전환합니다.
   *
   * @param aspectRatio - 선택한 화면 비율
   * @param selectedMedia - 선택한 미디어 파일들
   */
  const handleNewProjectComplete = (aspectRatio: any, selectedMedia: any[]) => {
    createNewProject(aspectRatio, selectedMedia);
    // createNewProject가 이미 currentScreen을 'editor'로 변경함
  };

  /**
   * 새 프로젝트 플로우 취소 핸들러
   *
   * 뒤로가기 또는 취소 시 대시보드로 돌아갑니다.
   */
  const handleNewProjectClose = () => {
    setCurrentScreen('create');
  };

  // ========================================
  // 특수 화면 렌더링 (BottomNavigation 없음)
  // ========================================

  /**
   * 새 프로젝트 플로우 화면
   * - 3단계 위자드 (비율 선택 → 미디어 선택 → AI 처리)
   * - 하단 네비게이션 없음
   */
  if (currentScreen === 'newProject') {
    return (
      <MobileFrame>
        <NewProjectFlowScreen
          onComplete={handleNewProjectComplete}
          onClose={handleNewProjectClose}
          isShareMode={isShareMode}
        />
      </MobileFrame>
    );
  }

  /**
   * 영상 편집기 화면
   * - 타임라인, 미리보기, 편집 도구
   * - 하단 네비게이션 없음 (전용 툴바 있음)
   */
  if (currentScreen === 'editor') {
    return (
      <MobileFrame>
        <EditorWorkspaceScreen />
      </MobileFrame>
    );
  }

  // ========================================
  // 일반 화면 렌더링 (BottomNavigation 있음)
  // ========================================

  /**
   * 화면 매핑 테이블
   *
   * 프로토타입 범위: create(만들기) 탭만 완성
   * 나머지 탭(home, explore, booking, profile)은 향후 개발 예정
   */
  const screens = {
    home: HomeScreen,               // TODO: 홈 화면 개발
    explore: ShotsScreen,           // TODO: 샷 탐색 화면 개발
    create: CreateDashboardScreen,  // ✅ 프로젝트 대시보드 (완성)
    booking: EditorScreen,          // TODO: 예약 화면 개발
    profile: PreviewScreen,         // TODO: 프로필 화면 개발
  };

  // 현재 화면에 해당하는 컴포넌트 (기본값: CreateDashboardScreen)
  const CurrentScreenComponent = screens[currentScreen] || CreateDashboardScreen;

  return (
    <MobileFrame>
      <div className="relative h-full">
        {/* 화면 전환 애니메이션 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}    // 오른쪽에서 등장
            animate={{ opacity: 1, x: 0 }}     // 제자리
            exit={{ opacity: 0, x: -20 }}      // 왼쪽으로 퇴장
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <CurrentScreenComponent />
          </motion.div>
        </AnimatePresence>

        {/* 하단 탭 네비게이션 */}
        <BottomNavigation />
      </div>
    </MobileFrame>
  );
};

export default App;
