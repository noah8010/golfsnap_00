/**
 * @file AssistantPanel.tsx
 * @description 지능형 어시스턴트 패널 컴포넌트
 *
 * 영상의 메타데이터를 기반으로 AI가 자동으로 스티커와 텍스트를 제안합니다.
 * 시나리오 선택 없이 자동 분석됩니다.
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Check, Loader2, RefreshCw } from 'lucide-react';
import { ShotData, TimelineItem } from '../types/golf';
import { useSmartAssistant } from '../hooks/useSmartAssistant';

interface AssistantPanelProps {
  /** 선택된 제안 추가 콜백 */
  onAdd: (items: TimelineItem[]) => void;
  /** 패널 닫기 콜백 */
  onClose: () => void;
  /** 현재 타임라인 시간 (새 아이템 위치) */
  currentTime: number;
  /** 영상의 샷 메타데이터 */
  shotMetadata: Partial<ShotData>;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  onAdd,
  onClose,
  currentTime,
  shotMetadata,
}) => {
  const {
    state,
    analyzeShotData,
    toggleSuggestion,
    selectAll,
    deselectAll,
    getSelectedAsTimelineItems,
    stickerSuggestions,
    textSuggestions,
    selectedCount,
  } = useSmartAssistant();

  // 패널 열릴 때 전달받은 메타데이터로 자동 분석
  useEffect(() => {
    analyzeShotData(shotMetadata);
  }, [shotMetadata, analyzeShotData]);

  // ESC 키로 패널 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  /**
   * 현재 메타데이터로 다시 분석
   */
  const handleRefreshAnalysis = () => {
    analyzeShotData(shotMetadata);
  };

  /**
   * 선택된 제안 추가 핸들러
   * 각 아이템을 약간씩 다른 위치에 배치
   */
  const handleAddSelected = () => {
    if (selectedCount === 0) return;

    const items = getSelectedAsTimelineItems(currentTime);

    // 각 아이템의 위치를 트랙별로 분리하여 겹치지 않게 배치
    const adjustedItems = items.map((item, index) => ({
      ...item,
      // 고유 ID 보장
      id: `${item.track}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      clipId: `${item.track}-clip-${Date.now()}-${index}`,
    }));

    onAdd(adjustedItems);
    onClose();
  };

  /**
   * 메타데이터 요약 표시
   */
  const renderMetadataSummary = () => {
    if (!shotMetadata) return null;

    const items = [];
    if (shotMetadata.distance) items.push(`${shotMetadata.distance}yd`);
    if (shotMetadata.ballSpeed) items.push(`${shotMetadata.ballSpeed}mph`);
    if (shotMetadata.club) items.push(shotMetadata.club);
    if (shotMetadata.holeResult) {
      const resultNames: Record<string, string> = {
        'hole-in-one': '홀인원',
        'eagle': '이글',
        'birdie': '버디',
        'par': '파',
        'bogey': '보기',
        'double-bogey': '더블보기',
      };
      items.push(resultNames[shotMetadata.holeResult] || shotMetadata.holeResult);
    }

    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-[#3d4554] rounded-lg text-xs text-white"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-gray-900/95 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full bg-[#2c3441] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-golf-green" />
            <h3 className="text-lg font-bold text-white">AI 어시스턴트</h3>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-6 py-6 space-y-6">
            {/* 감지된 메타데이터 표시 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-400">감지된 샷 데이터</h4>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefreshAnalysis}
                  className="flex items-center gap-1 text-xs text-golf-green hover:text-golf-green/80"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  다시 분석
                </motion.button>
              </div>
              {renderMetadataSummary()}
            </div>

            {/* 로딩 상태 */}
            {state.isLoading && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-golf-green animate-spin mb-3" />
                <p className="text-sm text-gray-400">AI가 분석 중입니다...</p>
              </div>
            )}

            {/* 제안 목록 */}
            {!state.isLoading && state.suggestions.length > 0 && (
              <div className="space-y-4">
                {/* 전체 선택/해제 */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-400">
                    AI 추천 ({state.suggestions.length}개)
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="text-xs text-golf-green hover:underline"
                    >
                      전체 선택
                    </button>
                    <span className="text-gray-600">|</span>
                    <button
                      onClick={deselectAll}
                      className="text-xs text-gray-400 hover:underline"
                    >
                      전체 해제
                    </button>
                  </div>
                </div>

                {/* 스티커 제안 */}
                {stickerSuggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">스티커</p>
                    <div className="grid grid-cols-2 gap-2">
                      {stickerSuggestions.map((suggestion) => (
                        <motion.button
                          key={suggestion.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleSuggestion(suggestion.id)}
                          className={`relative p-3 rounded-xl transition-colors flex items-center gap-3 ${
                            state.selectedIds.includes(suggestion.id)
                              ? 'bg-golf-green/20 border-2 border-golf-green'
                              : 'bg-[#3d4554] border-2 border-transparent'
                          }`}
                        >
                          <span className="text-2xl">{suggestion.sticker?.emoji}</span>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {suggestion.sticker?.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {suggestion.description}
                            </p>
                          </div>
                          {state.selectedIds.includes(suggestion.id) && (
                            <Check className="w-4 h-4 text-golf-green flex-shrink-0" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 텍스트 제안 */}
                {textSuggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">텍스트</p>
                    <div className="space-y-2">
                      {textSuggestions.map((suggestion) => (
                        <motion.button
                          key={suggestion.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleSuggestion(suggestion.id)}
                          className={`relative w-full p-3 rounded-xl transition-colors flex items-center gap-3 ${
                            state.selectedIds.includes(suggestion.id)
                              ? 'bg-golf-green/20 border-2 border-golf-green'
                              : 'bg-[#3d4554] border-2 border-transparent'
                          }`}
                        >
                          <div
                            className="px-2 py-1 rounded text-sm font-bold"
                            style={{
                              color: suggestion.text?.color || '#FFFFFF',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                            }}
                          >
                            {suggestion.text?.content?.slice(0, 20)}
                            {(suggestion.text?.content?.length || 0) > 20 ? '...' : ''}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-xs text-gray-400 truncate">
                              {suggestion.description}
                            </p>
                          </div>
                          {state.selectedIds.includes(suggestion.id) && (
                            <Check className="w-4 h-4 text-golf-green flex-shrink-0" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 제안 없음 메시지 */}
            {!state.isLoading && state.suggestions.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  메타데이터를 분석할 수 없습니다.
                  <br />
                  다시 분석을 시도해주세요.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-700 bg-[#2c3441]">
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-4 rounded-xl bg-[#3d4554] text-white font-semibold hover:bg-[#4a5262]"
            >
              취소
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAddSelected}
              disabled={selectedCount === 0}
              className="flex-1 py-4 rounded-xl bg-golf-green text-white font-semibold hover:bg-golf-green/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              추가 ({selectedCount}개)
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
