import React from 'react';
import { Home, Compass, Plus, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export const BottomNavigation: React.FC = () => {
  const { currentScreen } = useAppStore();

  // 현재는 "+ 만들기" 페이지만 활성화되며, 나머지 메뉴는 비활성 상태로 유지
  const navItems = [
    { id: 'home' as const, icon: Home, label: '홈', disabled: true },
    { id: 'explore' as const, icon: Compass, label: '탐색', disabled: true },
    { id: 'create' as const, icon: Plus, label: '만들기', isFAB: true, disabled: true },
    { id: 'booking' as const, icon: Calendar, label: '예약', disabled: true },
    { id: 'profile' as const, icon: User, label: '나', disabled: true },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom pointer-events-none select-none">
      <div className="flex items-center justify-around h-20 pb-6 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          // FAB 스타일 (+만들기 버튼)
          if (item.isFAB) {
            return (
              <motion.button
                key={item.id}
                aria-pressed={isActive}
                disabled
                className="absolute left-1/2 -translate-x-1/2 -top-6 pointer-events-none"
              >
                <div className="relative">
                  {/* FAB Shadow */}
                  <div className="absolute inset-0 bg-golf-green rounded-full blur-lg opacity-40 pointer-events-none" />
                  {/* FAB Button */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.08 : 1,
                      rotate: 0, // 항상 + 모양 유지
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative w-14 h-14 rounded-full flex items-center justify-center bg-golf-green shadow-lg ring-2 ring-offset-2 ring-offset-white ring-golf-green/70"
                  >
                    <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </motion.div>
                </div>
              </motion.button>
            );
          }

          // 일반 탭 버튼
          return (
            <motion.button
              key={item.id}
              disabled
              className={`flex flex-col items-center justify-center gap-1 min-w-[60px] ${
                item.disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'pointer-events-none'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-golf-green' : 'text-gray-400'
                  }`}
                />
                {isActive && !item.disabled && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-golf-green rounded-full"
                  />
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-golf-green' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
