/**
 * @file useSmartAssistant.ts
 * @description 지능형 어시스턴트 커스텀 훅
 *
 * 골프 샷 메타데이터를 기반으로 스티커와 텍스트를 자동 생성하는 기능을 제공합니다.
 */

import { useState, useCallback, useMemo } from 'react';
import { ShotData, TimelineItem, TextAnimationType, StickerAnimationType } from '../types/golf';
import {
  AssistantSuggestion,
  generateSuggestions,
  filterSuggestionsByType,
} from '../constants/assistantRules';

/**
 * 어시스턴트 상태 인터페이스
 */
interface AssistantState {
  /** 현재 샷 데이터 */
  shotData: Partial<ShotData> | null;
  /** 생성된 제안 목록 */
  suggestions: AssistantSuggestion[];
  /** 선택된 제안 ID 목록 */
  selectedIds: string[];
  /** 로딩 상태 */
  isLoading: boolean;
}

/**
 * 어시스턴트 반환 타입
 */
interface UseSmartAssistantReturn {
  /** 현재 상태 */
  state: AssistantState;
  /** 샷 데이터 설정 및 제안 생성 */
  analyzeShotData: (data: Partial<ShotData>) => void;
  /** 제안 선택/해제 토글 */
  toggleSuggestion: (id: string) => void;
  /** 모든 제안 선택 */
  selectAll: () => void;
  /** 모든 선택 해제 */
  deselectAll: () => void;
  /** 선택된 제안을 타임라인 아이템으로 변환 */
  getSelectedAsTimelineItems: (startPosition: number) => TimelineItem[];
  /** 스티커 제안만 필터링 */
  stickerSuggestions: AssistantSuggestion[];
  /** 텍스트 제안만 필터링 */
  textSuggestions: AssistantSuggestion[];
  /** 선택된 제안 수 */
  selectedCount: number;
  /** 초기화 */
  reset: () => void;
}

/**
 * 지능형 어시스턴트 훅
 *
 * @example
 * const {
 *   state,
 *   analyzeShotData,
 *   toggleSuggestion,
 *   getSelectedAsTimelineItems,
 * } = useSmartAssistant();
 *
 * // 샷 데이터 분석
 * analyzeShotData({ distance: 280, ballSpeed: 165, holeResult: 'birdie' });
 *
 * // 제안 선택
 * toggleSuggestion('birdie-sticker');
 *
 * // 타임라인에 추가할 아이템 생성
 * const items = getSelectedAsTimelineItems(currentTime);
 */
export const useSmartAssistant = (): UseSmartAssistantReturn => {
  const [state, setState] = useState<AssistantState>({
    shotData: null,
    suggestions: [],
    selectedIds: [],
    isLoading: false,
  });

  /**
   * 샷 데이터 분석 및 제안 생성
   */
  const analyzeShotData = useCallback((data: Partial<ShotData>) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // 시뮬레이션을 위한 약간의 지연
    setTimeout(() => {
      const suggestions = generateSuggestions(data, 8);

      setState({
        shotData: data,
        suggestions,
        selectedIds: [], // 초기에는 선택 없음
        isLoading: false,
      });
    }, 300);
  }, []);

  /**
   * 제안 선택/해제 토글
   */
  const toggleSuggestion = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedIds: prev.selectedIds.includes(id)
        ? prev.selectedIds.filter((i) => i !== id)
        : [...prev.selectedIds, id],
    }));
  }, []);

  /**
   * 모든 제안 선택
   */
  const selectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedIds: prev.suggestions.map((s) => s.id),
    }));
  }, []);

  /**
   * 모든 선택 해제
   */
  const deselectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedIds: [],
    }));
  }, []);

  /**
   * 선택된 제안을 타임라인 아이템으로 변환
   */
  const getSelectedAsTimelineItems = useCallback(
    (startPosition: number): TimelineItem[] => {
      const selectedSuggestions = state.suggestions.filter((s) =>
        state.selectedIds.includes(s.id)
      );

      return selectedSuggestions.map((suggestion, index) => {
        const timestamp = Date.now() + index;
        const duration = suggestion.duration || 3;

        if (suggestion.type === 'sticker' && suggestion.sticker) {
          return {
            id: `sticker-${timestamp}`,
            clipId: `sticker-clip-${timestamp}`,
            position: startPosition,
            duration,
            track: 'sticker' as const,
            startTime: 0,
            endTime: duration,
            stickerId: suggestion.id,
            stickerName: suggestion.sticker.name,
            stickerEmoji: suggestion.sticker.emoji,
            stickerAnimation: suggestion.sticker.animation as StickerAnimationType,
            stickerScale: suggestion.sticker.scale || 1,
            stickerPosition: suggestion.sticker.position || { x: 50, y: 50 },
          };
        } else if (suggestion.type === 'text' && suggestion.text) {
          return {
            id: `text-${timestamp}`,
            clipId: `text-clip-${timestamp}`,
            position: startPosition,
            duration,
            track: 'text' as const,
            startTime: 0,
            endTime: duration,
            textContent: suggestion.text.content,
            textFont: 'noto-sans',
            textFontSize: suggestion.text.fontSize || 32,
            textColor: suggestion.text.color || '#FFFFFF',
            textAlign: 'center' as const,
            textBold: false,
            textItalic: false,
            textUnderline: false,
            textAnimation: (suggestion.text.animation || 'fade-in') as TextAnimationType,
            textPosition: suggestion.text.position || { x: 50, y: 50 },
          };
        }

        // 기본값 반환 (타입 안전성을 위해)
        return {
          id: `item-${timestamp}`,
          clipId: `clip-${timestamp}`,
          position: startPosition,
          duration,
          track: 'text' as const,
          startTime: 0,
          endTime: duration,
        };
      });
    },
    [state.suggestions, state.selectedIds]
  );

  /**
   * 스티커 제안만 필터링
   */
  const stickerSuggestions = useMemo(
    () => filterSuggestionsByType(state.suggestions, 'sticker'),
    [state.suggestions]
  );

  /**
   * 텍스트 제안만 필터링
   */
  const textSuggestions = useMemo(
    () => filterSuggestionsByType(state.suggestions, 'text'),
    [state.suggestions]
  );

  /**
   * 선택된 제안 수
   */
  const selectedCount = state.selectedIds.length;

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setState({
      shotData: null,
      suggestions: [],
      selectedIds: [],
      isLoading: false,
    });
  }, []);

  return {
    state,
    analyzeShotData,
    toggleSuggestion,
    selectAll,
    deselectAll,
    getSelectedAsTimelineItems,
    stickerSuggestions,
    textSuggestions,
    selectedCount,
    reset,
  };
};
