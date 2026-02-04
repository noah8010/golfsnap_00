/**
 * @file TransitionIcon.tsx
 * @description 클립 사이 전환 효과 아이콘 컴포넌트
 *
 * 비디오 트랙에서 인접한 두 클립 사이에 다이아몬드 모양 아이콘을 표시합니다.
 * 아이콘을 클릭하면 전환 효과 선택 패널이 열립니다.
 *
 * ## 표시 조건
 * - 비디오 트랙의 연속된 두 클립 사이
 * - 두 클립이 인접하거나 겹칠 때 (gap <= 0.5초)
 *
 * ## 시각적 표현
 * - 전환 없음(none): 회색 다이아몬드
 * - 전환 있음: 골프 그린 색상 다이아몬드 + 효과명
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Diamond } from 'lucide-react';
import { TransitionType } from '../types/golf';

/** TransitionIcon 컴포넌트 Props */
interface TransitionIconProps {
  /** 현재 적용된 전환 타입 */
  transitionType: TransitionType;
  /** 아이콘의 수평 위치 (px) */
  positionX: number;
  /** 클릭 핸들러 (전환 패널 열기) */
  onClick: () => void;
}

/** 전환 타입별 라벨 */
const TRANSITION_LABELS: Record<TransitionType, string> = {
  none: '',
  fade: 'F',
  slide: 'S',
  zoom: 'Z',
};

/**
 * 클립 사이 전환 효과 아이콘
 *
 * 다이아몬드 모양으로 두 클립 사이에 표시되며, 클릭 시 전환 패널을 엽니다.
 */
export const TransitionIcon: React.FC<TransitionIconProps> = ({
  transitionType,
  positionX,
  onClick,
}) => {
  const hasTransition = transitionType !== 'none';

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 flex items-center justify-center w-6 h-6 rounded-sm rotate-45 transition-colors ${
        hasTransition
          ? 'bg-golf-green shadow-md'
          : 'bg-gray-300 hover:bg-gray-400'
      }`}
      style={{ left: `${positionX}px` }}
      title={hasTransition ? `전환: ${transitionType}` : '전환 효과 추가'}
    >
      {hasTransition ? (
        <span className="text-white text-[8px] font-bold -rotate-45">
          {TRANSITION_LABELS[transitionType]}
        </span>
      ) : (
        <Diamond className="w-3 h-3 text-white -rotate-45" />
      )}
    </motion.button>
  );
};
