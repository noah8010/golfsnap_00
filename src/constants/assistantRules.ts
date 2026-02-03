/**
 * @file assistantRules.ts
 * @description 지능형 어시스턴트 룰셋 정의
 *
 * 골프 샷 메타데이터를 기반으로 스티커와 텍스트를 자동 생성하는 규칙을 정의합니다.
 * 각 규칙은 조건(condition)과 결과(result)로 구성됩니다.
 */

import { ShotData, TextAnimationType, StickerAnimationType } from '../types/golf';

// ============================================================================
// 타입 정의
// ============================================================================

/**
 * 어시스턴트 생성 결과 타입
 */
export interface AssistantSuggestion {
  /** 제안 ID */
  id: string;
  /** 제안 타입 */
  type: 'sticker' | 'text';
  /** 우선순위 (높을수록 중요) */
  priority: number;
  /** 스티커 정보 (type이 'sticker'인 경우) */
  sticker?: {
    emoji: string;
    name: string;
    animation: StickerAnimationType;
    scale?: number;
    position?: { x: number; y: number };
  };
  /** 텍스트 정보 (type이 'text'인 경우) */
  text?: {
    content: string;
    fontSize?: number;
    color?: string;
    animation?: TextAnimationType;
    position?: { x: number; y: number };
  };
  /** 표시할 시간 (초) */
  duration?: number;
  /** 규칙 설명 */
  description: string;
}

/**
 * 어시스턴트 규칙 타입
 */
export interface AssistantRule {
  /** 규칙 ID */
  id: string;
  /** 규칙 이름 */
  name: string;
  /** 규칙 설명 */
  description: string;
  /** 조건 체크 함수 */
  condition: (shot: Partial<ShotData>) => boolean;
  /** 제안 생성 함수 */
  generate: (shot: Partial<ShotData>) => AssistantSuggestion[];
}

// ============================================================================
// 어시스턴트 규칙 정의
// ============================================================================

export const ASSISTANT_RULES: AssistantRule[] = [
  // ========================================
  // 홀아웃 결과 기반 규칙
  // ========================================
  {
    id: 'hole-in-one',
    name: '홀인원',
    description: '홀인원 달성 시 축하 스티커와 텍스트 생성',
    condition: (shot) => shot.holeResult === 'hole-in-one',
    generate: () => [
      {
        id: 'hio-sticker-1',
        type: 'sticker',
        priority: 100,
        sticker: {
          emoji: '🏆',
          name: '트로피',
          animation: 'explode',
          scale: 1.5,
          position: { x: 50, y: 30 },
        },
        duration: 5,
        description: '홀인원 달성 축하 트로피',
      },
      {
        id: 'hio-sticker-2',
        type: 'sticker',
        priority: 99,
        sticker: {
          emoji: '🎉',
          name: '축하',
          animation: 'sparkle',
          scale: 1.2,
          position: { x: 30, y: 40 },
        },
        duration: 5,
        description: '홀인원 축하 파티',
      },
      {
        id: 'hio-text',
        type: 'text',
        priority: 98,
        text: {
          content: 'HOLE IN ONE!',
          fontSize: 48,
          color: '#FFD700',
          animation: 'zoom-in',
          position: { x: 50, y: 50 },
        },
        duration: 4,
        description: '홀인원 텍스트',
      },
    ],
  },
  {
    id: 'eagle',
    name: '이글',
    description: '이글 달성 시 축하 스티커와 텍스트 생성',
    condition: (shot) => shot.holeResult === 'eagle',
    generate: () => [
      {
        id: 'eagle-sticker',
        type: 'sticker',
        priority: 90,
        sticker: {
          emoji: '🦅',
          name: '독수리',
          animation: 'float',
          scale: 1.3,
          position: { x: 50, y: 30 },
        },
        duration: 4,
        description: '이글 달성 독수리',
      },
      {
        id: 'eagle-text',
        type: 'text',
        priority: 89,
        text: {
          content: 'EAGLE!',
          fontSize: 44,
          color: '#4CAF50',
          animation: 'bounce',
          position: { x: 50, y: 55 },
        },
        duration: 3,
        description: '이글 텍스트',
      },
    ],
  },
  {
    id: 'birdie',
    name: '버디',
    description: '버디 달성 시 축하 스티커와 텍스트 생성',
    condition: (shot) => shot.holeResult === 'birdie',
    generate: () => [
      {
        id: 'birdie-sticker',
        type: 'sticker',
        priority: 80,
        sticker: {
          emoji: '🐦',
          name: '새',
          animation: 'bounce',
          scale: 1.2,
          position: { x: 50, y: 35 },
        },
        duration: 3,
        description: '버디 달성 새',
      },
      {
        id: 'birdie-text',
        type: 'text',
        priority: 79,
        text: {
          content: 'BIRDIE!',
          fontSize: 40,
          color: '#2196F3',
          animation: 'slide-up',
          position: { x: 50, y: 55 },
        },
        duration: 3,
        description: '버디 텍스트',
      },
    ],
  },

  // ========================================
  // 비거리 기반 규칙
  // ========================================
  {
    id: 'monster-drive',
    name: '몬스터 드라이브',
    description: '300야드 이상 비거리 달성 시',
    condition: (shot) => (shot.distance ?? 0) >= 300,
    generate: (shot) => [
      {
        id: 'monster-sticker',
        type: 'sticker',
        priority: 85,
        sticker: {
          emoji: '💪',
          name: '근육',
          animation: 'pulse',
          scale: 1.3,
          position: { x: 70, y: 30 },
        },
        duration: 3,
        description: '몬스터 드라이브 파워',
      },
      {
        id: 'monster-text',
        type: 'text',
        priority: 84,
        text: {
          content: `${shot.distance}yd MONSTER DRIVE!`,
          fontSize: 36,
          color: '#FF5722',
          animation: 'zoom-in',
          position: { x: 50, y: 50 },
        },
        duration: 3,
        description: '몬스터 드라이브 비거리 표시',
      },
    ],
  },
  {
    id: 'great-drive',
    name: '그레이트 드라이브',
    description: '270야드 이상 비거리 달성 시',
    condition: (shot) => {
      const distance = shot.distance ?? 0;
      return distance >= 270 && distance < 300;
    },
    generate: (shot) => [
      {
        id: 'great-sticker',
        type: 'sticker',
        priority: 70,
        sticker: {
          emoji: '🔥',
          name: '불꽃',
          animation: 'pulse',
          scale: 1.2,
          position: { x: 70, y: 35 },
        },
        duration: 3,
        description: '그레이트 드라이브 불꽃',
      },
      {
        id: 'great-text',
        type: 'text',
        priority: 69,
        text: {
          content: `${shot.distance}yd GREAT SHOT!`,
          fontSize: 32,
          color: '#FF9800',
          animation: 'slide-up',
          position: { x: 50, y: 50 },
        },
        duration: 3,
        description: '그레이트 드라이브 표시',
      },
    ],
  },

  // ========================================
  // 볼 스피드 기반 규칙
  // ========================================
  {
    id: 'rocket-speed',
    name: '로켓 스피드',
    description: '볼 스피드 170mph 이상',
    condition: (shot) => (shot.ballSpeed ?? 0) >= 170,
    generate: (shot) => [
      {
        id: 'rocket-sticker',
        type: 'sticker',
        priority: 75,
        sticker: {
          emoji: '🚀',
          name: '로켓',
          animation: 'zoom-in',
          scale: 1.2,
          position: { x: 75, y: 25 },
        },
        duration: 3,
        description: '로켓 스피드 스티커',
      },
      {
        id: 'rocket-text',
        type: 'text',
        priority: 74,
        text: {
          content: `${shot.ballSpeed}mph ROCKET SPEED!`,
          fontSize: 28,
          color: '#9C27B0',
          animation: 'fade-in',
          position: { x: 50, y: 70 },
        },
        duration: 2.5,
        description: '볼 스피드 표시',
      },
    ],
  },

  // ========================================
  // 정확도 기반 규칙
  // ========================================
  {
    id: 'perfect-accuracy',
    name: '퍼펙트 정확도',
    description: '정확도 95% 이상',
    condition: (shot) => (shot.accuracy ?? 0) >= 95,
    generate: (shot) => [
      {
        id: 'perfect-sticker',
        type: 'sticker',
        priority: 72,
        sticker: {
          emoji: '🎯',
          name: '과녁',
          animation: 'bounce',
          scale: 1.2,
          position: { x: 25, y: 30 },
        },
        duration: 3,
        description: '정확도 과녁',
      },
      {
        id: 'perfect-text',
        type: 'text',
        priority: 71,
        text: {
          content: `ACCURACY ${shot.accuracy}%`,
          fontSize: 26,
          color: '#00BCD4',
          animation: 'fade-in',
          position: { x: 50, y: 75 },
        },
        duration: 2.5,
        description: '정확도 표시',
      },
    ],
  },

  // ========================================
  // 스핀량 기반 규칙
  // ========================================
  {
    id: 'high-spin',
    name: '하이 스핀',
    description: '스핀량 3500rpm 이상',
    condition: (shot) => (shot.spinRate ?? shot.backSpin ?? 0) >= 3500,
    generate: (shot) => [
      {
        id: 'spin-sticker',
        type: 'sticker',
        priority: 60,
        sticker: {
          emoji: '🌀',
          name: '회오리',
          animation: 'spin',
          scale: 1.1,
          position: { x: 75, y: 70 },
        },
        duration: 2.5,
        description: '하이 스핀 회오리',
      },
      {
        id: 'spin-text',
        type: 'text',
        priority: 59,
        text: {
          content: `SPIN ${shot.spinRate ?? shot.backSpin}rpm`,
          fontSize: 24,
          color: '#E91E63',
          animation: 'typewriter',
          position: { x: 50, y: 80 },
        },
        duration: 2,
        description: '스핀량 표시',
      },
    ],
  },

  // ========================================
  // 핀 근접 규칙
  // ========================================
  {
    id: 'close-to-pin',
    name: '핀 근접',
    description: '남은 거리 10야드 이내',
    condition: (shot) => (shot.remainingDistance ?? 999) <= 10,
    generate: (shot) => [
      {
        id: 'pin-sticker',
        type: 'sticker',
        priority: 65,
        sticker: {
          emoji: '⛳',
          name: '깃발',
          animation: 'bounce',
          scale: 1.3,
          position: { x: 50, y: 25 },
        },
        duration: 3,
        description: '핀 근접 깃발',
      },
      {
        id: 'pin-text',
        type: 'text',
        priority: 64,
        text: {
          content: `${shot.remainingDistance}yd TO PIN!`,
          fontSize: 30,
          color: '#4CAF50',
          animation: 'glow',
          position: { x: 50, y: 55 },
        },
        duration: 3,
        description: '핀 거리 표시',
      },
    ],
  },

  // ========================================
  // 발사각 기반 규칙
  // ========================================
  {
    id: 'high-launch',
    name: '하이 런치',
    description: '발사각 18도 이상 (높은 탄도)',
    condition: (shot) => (shot.launchAngle ?? 0) >= 18,
    generate: (shot) => [
      {
        id: 'high-sticker',
        type: 'sticker',
        priority: 50,
        sticker: {
          emoji: '🌙',
          name: '달',
          animation: 'float',
          scale: 1.0,
          position: { x: 80, y: 20 },
        },
        duration: 2.5,
        description: '높은 탄도 달',
      },
      {
        id: 'high-text',
        type: 'text',
        priority: 49,
        text: {
          content: `${shot.launchAngle}° HIGH LAUNCH`,
          fontSize: 22,
          color: '#3F51B5',
          animation: 'slide-up',
          position: { x: 50, y: 85 },
        },
        duration: 2,
        description: '발사각 표시',
      },
    ],
  },

  // ========================================
  // 기본 샷 데이터 표시 규칙
  // ========================================
  {
    id: 'shot-data-overlay',
    name: '샷 데이터 오버레이',
    description: '기본 샷 데이터 텍스트 표시',
    condition: (shot) => (shot.distance ?? 0) > 0,
    generate: (shot) => {
      const suggestions: AssistantSuggestion[] = [];

      // 비거리 텍스트
      if (shot.distance) {
        suggestions.push({
          id: 'data-distance',
          type: 'text',
          priority: 30,
          text: {
            content: `${shot.distance}yd`,
            fontSize: 36,
            color: '#FFFFFF',
            animation: 'fade-in',
            position: { x: 50, y: 50 },
          },
          duration: 3,
          description: '비거리 표시',
        });
      }

      // 볼 스피드 텍스트
      if (shot.ballSpeed) {
        suggestions.push({
          id: 'data-speed',
          type: 'text',
          priority: 25,
          text: {
            content: `Ball Speed: ${shot.ballSpeed}mph`,
            fontSize: 20,
            color: '#CCCCCC',
            animation: 'fade-in',
            position: { x: 50, y: 65 },
          },
          duration: 2.5,
          description: '볼 스피드 표시',
        });
      }

      // 클럽 스티커
      if (shot.club) {
        suggestions.push({
          id: 'data-club',
          type: 'sticker',
          priority: 20,
          sticker: {
            emoji: '🏌️',
            name: shot.club,
            animation: 'bounce',
            scale: 1.0,
            position: { x: 15, y: 85 },
          },
          duration: 3,
          description: `${shot.club} 사용`,
        });
      }

      return suggestions;
    },
  },
];

/**
 * 샷 데이터를 기반으로 제안 생성
 * @param shotData - 골프 샷 메타데이터
 * @param maxSuggestions - 최대 제안 수 (기본값: 6)
 * @returns 정렬된 제안 목록
 */
export const generateSuggestions = (
  shotData: Partial<ShotData>,
  maxSuggestions: number = 6
): AssistantSuggestion[] => {
  const allSuggestions: AssistantSuggestion[] = [];

  // 모든 규칙 체크 및 제안 수집
  for (const rule of ASSISTANT_RULES) {
    if (rule.condition(shotData)) {
      const suggestions = rule.generate(shotData);
      allSuggestions.push(...suggestions);
    }
  }

  // 우선순위 기준 정렬 후 제한
  return allSuggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxSuggestions);
};

/**
 * 제안 타입별 필터링
 */
export const filterSuggestionsByType = (
  suggestions: AssistantSuggestion[],
  type: 'sticker' | 'text'
): AssistantSuggestion[] => {
  return suggestions.filter((s) => s.type === type);
};
