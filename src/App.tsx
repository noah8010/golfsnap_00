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

const App: React.FC = () => {
  const { currentScreen, setCurrentScreen, createNewProject, isShareMode } = useAppStore();

  const handleNewProjectComplete = (aspectRatio: any, selectedMedia: any[]) => {
    createNewProject(aspectRatio, selectedMedia);
    // createNewProject가 이미 currentScreen을 'editor'로 변경함
  };

  const handleNewProjectClose = () => {
    setCurrentScreen('create');
  };

  // NewProjectFlowScreen을 별도로 렌더링
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

  // EditorWorkspaceScreen은 BottomNavigation 없이 렌더링
  if (currentScreen === 'editor') {
    return (
      <MobileFrame>
        <EditorWorkspaceScreen />
      </MobileFrame>
    );
  }

  // 프로토타입 범위: create (만들기) 탭만 개발
  // 나머지 탭(home, explore, booking, profile)은 향후 개발 예정
  const screens = {
    home: HomeScreen,           // TODO: 향후 개발
    explore: ShotsScreen,       // TODO: 향후 개발
    create: CreateDashboardScreen,  // ✅ 주요 화면
    booking: EditorScreen,      // TODO: 향후 개발
    profile: PreviewScreen,     // TODO: 향후 개발
  };

  const CurrentScreenComponent = screens[currentScreen] || CreateDashboardScreen;

  return (
    <MobileFrame>
      <div className="relative h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <CurrentScreenComponent />
          </motion.div>
        </AnimatePresence>

        <BottomNavigation />
      </div>
    </MobileFrame>
  );
};

export default App;
