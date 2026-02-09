/**
 * @file BottomNavigation.tsx
 * @description 하단 탭 네비게이션 컴포넌트
 *
 * 5개의 메인 탭을 제공하는 하단 네비게이션 바입니다.
 *
 * ## 탭 구성
 * - 홈: 메인 화면
 * - 탐색: 샷 탐색
 * - 만들기: 프로젝트 대시보드 (핵심 프로토타입)
 * - 예약: 예약 기능
 * - 나: 프로필
 */

import React from 'react';
import { Home, Compass, Plus, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export const BottomNavigation: React.FC = () => {
  const { currentScreen, setCurrentScreen } = useAppStore();

  // 탭 아이템 정의 - 모든 탭 활성화
  const navItems = [
    { id: 'home' as const, icon: Home, label: '홈', disabled: false },
    { id: 'explore' as const, icon: Compass, label: '탐색', disabled: false },
    { id: 'create' as const, icon: Plus, label: '만들기', disabled: false },
    { id: 'booking' as const, icon: Calendar, label: '예약', disabled: false },
    { id: 'profile' as const, icon: User, label: '나', disabled: false },
  ];

  /**
   * 탭 클릭 핸들러
   */
  const handleTabClick = (id: typeof navItems[number]['id'], disabled: boolean) => {
    if (!disabled) {
      setCurrentScreen(id);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      {/* 균등 분배 레이아웃 */}
      <div className="flex items-end justify-evenly h-16 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          const isCreateTab = item.id === 'create';

          return (
            <motion.button
              key={item.id}
              whileTap={!item.disabled ? { scale: 0.9 } : undefined}
              onClick={() => handleTabClick(item.id, item.disabled)}
              disabled={item.disabled}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all ${
                item.disabled
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer active:bg-gray-100'
              } ${isActive && !item.disabled ? 'bg-golf-green/10' : ''}`}
            >
              {/* 아이콘 영역 */}
              <div className="relative">
                {isCreateTab ? (
                  // 만들기 버튼 - 강조 스타일
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-golf-green shadow-lg'
                        : 'bg-golf-green/80'
                    }`}
                  >
                    <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  // 일반 탭 아이콘
                  <>
                    <Icon
                      className={`w-6 h-6 transition-colors ${
                        isActive ? 'text-golf-green' : 'text-gray-400'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {/* 활성 탭 인디케이터 */}
                    {isActive && !item.disabled && (
                      <motion.div
                        layoutId="activeTabDot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-golf-green rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </div>

              {/* 라벨 */}
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-golf-green' : 'text-gray-400'
                } ${isCreateTab ? 'mt-0.5' : ''}`}
              >
                {item.disabled && !isCreateTab ? `${item.label}` : item.label}
              </span>

              {/* (삭제: 준비중 표시 불필요) */}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
