/**
 * @file Toast.tsx
 * @description 인앱 토스트 메시지 컴포넌트
 *
 * 화면 하단에서 잠시 나타났다 사라지는 알림 메시지입니다.
 * MobileFrame 내부에 렌더링되어 모든 화면에서 사용 가능합니다.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';

/** 타입별 아이콘 */
const ICONS = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
};

/** 타입별 배경색 */
const COLORS = {
  info: 'bg-gray-800 text-white',
  warning: 'bg-amber-600 text-white',
  error: 'bg-red-600 text-white',
  success: 'bg-emerald-600 text-white',
};

/**
 * 토스트 메시지 컴포넌트
 */
export const Toast: React.FC = () => {
  const { message, type, visible } = useToastStore();
  const Icon = ICONS[type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="absolute bottom-24 left-4 right-4 z-[60] pointer-events-none"
        >
          <div className={`${COLORS[type]} rounded-xl px-4 py-3 shadow-lg flex items-center gap-3`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
