/**
 * @file TransitionPanel.tsx
 * @description 전환 효과 선택 패널 컴포넌트
 *
 * 두 클립 사이의 전환 효과를 선택할 수 있는 바텀시트 패널입니다.
 *
 * ## 지원 전환 효과
 * - None (없음): 바로 전환
 * - Fade (페이드): 페이드 인/아웃
 * - Slide (슬라이드): 슬라이드 효과
 * - Zoom (줌): 확대/축소 효과
 */

import React from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Layers, ArrowRightLeft, ZoomIn } from 'lucide-react';
import { TransitionType } from '../types/golf';

/** TransitionPanel 컴포넌트 Props */
interface TransitionPanelProps {
  /** 현재 적용된 전환 타입 */
  currentTransition: TransitionType;
  /** 전환 효과 적용 콜백 */
  onApply: (transition: TransitionType) => void;
  /** 패널 닫기 콜백 */
  onClose: () => void;
}

/** 전환 효과 옵션 정의 */
interface TransitionOption {
  /** 전환 타입 */
  type: TransitionType;
  /** 표시 라벨 */
  label: string;
  /** 설명 */
  description: string;
  /** 아이콘 컴포넌트 */
  icon: React.ReactNode;
}

/** 전환 효과 목록 */
const TRANSITION_OPTIONS: TransitionOption[] = [
  {
    type: 'none',
    label: '없음',
    description: '바로 전환',
    icon: <Minus className="w-6 h-6" />,
  },
  {
    type: 'fade',
    label: '페이드',
    description: '페이드 인/아웃',
    icon: <Layers className="w-6 h-6" />,
  },
  {
    type: 'slide',
    label: '슬라이드',
    description: '좌우 슬라이드',
    icon: <ArrowRightLeft className="w-6 h-6" />,
  },
  {
    type: 'zoom',
    label: '줌',
    description: '확대/축소 전환',
    icon: <ZoomIn className="w-6 h-6" />,
  },
];

/**
 * 전환 효과 선택 패널
 *
 * 바텀시트 형태로 표시되며, 4가지 전환 효과 중 선택할 수 있습니다.
 */
export const TransitionPanel: React.FC<TransitionPanelProps> = ({
  currentTransition,
  onApply,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">전환 효과</h3>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-500" />
        </motion.button>
      </div>

      {/* 전환 효과 그리드 */}
      <div className="p-4 grid grid-cols-4 gap-3">
        {TRANSITION_OPTIONS.map((option) => {
          const isSelected = currentTransition === option.type;
          return (
            <motion.button
              key={option.type}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onApply(option.type);
                onClose();
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                isSelected
                  ? 'bg-golf-green/10 ring-2 ring-golf-green'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div
                className={`${
                  isSelected ? 'text-golf-green' : 'text-gray-500'
                }`}
              >
                {option.icon}
              </div>
              <span
                className={`text-xs font-medium ${
                  isSelected ? 'text-golf-green' : 'text-gray-700'
                }`}
              >
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* 하단 안전 영역 */}
      <div className="h-6" />
    </motion.div>
  );
};
