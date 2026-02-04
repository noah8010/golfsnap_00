/**
 * @file ThemeToggle.tsx
 * @description 다크/라이트 모드 토글 버튼 컴포넌트
 *
 * 아이콘 버튼으로 다크/라이트 모드를 전환합니다.
 * - 라이트 모드: 달 아이콘 (Moon)
 * - 다크 모드: 태양 아이콘 (Sun)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

/** ThemeToggle 컴포넌트 Props */
interface ThemeToggleProps {
  /** 다크 모드 여부 */
  isDark: boolean;
  /** 토글 핸들러 */
  onToggle: () => void;
}

/**
 * 다크/라이트 모드 토글 버튼
 *
 * 현재 테마에 맞는 아이콘을 표시하고 클릭 시 테마를 전환합니다.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <motion.div
        key={isDark ? 'sun' : 'moon'}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
};
