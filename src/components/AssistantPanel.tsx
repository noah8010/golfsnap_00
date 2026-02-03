/**
 * @file AssistantPanel.tsx
 * @description 지능형 어시스턴트 패널 컴포넌트
 *
 * 골프 샷 메타데이터를 입력하면 AI가 자동으로 스티커와 텍스트를 제안합니다.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Check, Loader2, Wand2 } from 'lucide-react';
import { ShotData, TimelineItem } from '../types/golf';
import { useSmartAssistant } from '../hooks/useSmartAssistant';

interface AssistantPanelProps {
  /** 선택된 제안 추가 콜백 */
  onAdd: (items: TimelineItem[]) => void;
  /** 패널 닫기 콜백 */
  onClose: () => void;
  /** 현재 타임라인 시간 (새 아이템 위치) */
  currentTime: number;
}

/**
 * 샘플 샷 데이터 프리셋
 */
const SAMPLE_PRESETS: { id: string; name: string; data: Partial<ShotData> }[] = [
  {
    id: 'hole-in-one',
    name: '홀인원',
    data: {
      distance: 165,
      ballSpeed: 145,
      launchAngle: 22,
      accuracy: 100,
      club: 'PW',
      holeResult: 'hole-in-one',
      remainingDistance: 0,
    },
  },
  {
    id: 'eagle',
    name: '이글',
    data: {
      distance: 180,
      ballSpeed: 155,
      launchAngle: 18,
      accuracy: 95,
      club: '7Iron',
      holeResult: 'eagle',
      remainingDistance: 3,
    },
  },
  {
    id: 'birdie',
    name: '버디',
    data: {
      distance: 150,
      ballSpeed: 135,
      launchAngle: 20,
      accuracy: 90,
      club: '8Iron',
      holeResult: 'birdie',
      remainingDistance: 5,
    },
  },
  {
    id: 'monster-drive',
    name: '몬스터 드라이브',
    data: {
      distance: 310,
      ballSpeed: 175,
      launchAngle: 12,
      accuracy: 85,
      club: 'Driver',
      spinRate: 2500,
    },
  },
  {
    id: 'pin-attack',
    name: '핀 어택',
    data: {
      distance: 145,
      ballSpeed: 130,
      launchAngle: 25,
      accuracy: 98,
      club: '9Iron',
      remainingDistance: 2,
      spinRate: 4000,
    },
  },
  {
    id: 'custom',
    name: '직접 입력',
    data: {},
  },
];

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  onAdd,
  onClose,
  currentTime,
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
    reset,
  } = useSmartAssistant();

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customData, setCustomData] = useState<Partial<ShotData>>({
    distance: 250,
    ballSpeed: 155,
    launchAngle: 14,
    accuracy: 85,
    spinRate: 2800,
    club: 'Driver',
  });

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
   * 프리셋 선택 핸들러
   */
  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (preset && presetId !== 'custom') {
      analyzeShotData(preset.data);
    } else if (presetId === 'custom') {
      reset();
    }
  };

  /**
   * 커스텀 데이터 분석 핸들러
   */
  const handleAnalyzeCustom = () => {
    analyzeShotData(customData);
  };

  /**
   * 선택된 제안 추가 핸들러
   */
  const handleAddSelected = () => {
    if (selectedCount === 0) return;
    const items = getSelectedAsTimelineItems(currentTime);
    onAdd(items);
    onClose();
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
            {/* 프리셋 선택 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">샷 시나리오 선택</h4>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PRESETS.map((preset) => (
                  <motion.button
                    key={preset.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`py-3 px-2 rounded-xl transition-colors text-center ${
                      selectedPreset === preset.id
                        ? 'bg-golf-green text-white'
                        : 'bg-[#3d4554] text-gray-300 hover:bg-[#4a5262]'
                    }`}
                  >
                    <div className="text-sm font-medium truncate">{preset.name}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 커스텀 입력 (직접 입력 선택 시) */}
            {selectedPreset === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <h4 className="text-sm font-semibold text-gray-400">샷 데이터 입력</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">비거리 (yd)</label>
                    <input
                      type="number"
                      value={customData.distance || ''}
                      onChange={(e) =>
                        setCustomData({ ...customData, distance: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#3d4554] border border-gray-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">볼 스피드 (mph)</label>
                    <input
                      type="number"
                      value={customData.ballSpeed || ''}
                      onChange={(e) =>
                        setCustomData({ ...customData, ballSpeed: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#3d4554] border border-gray-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">발사각 (°)</label>
                    <input
                      type="number"
                      value={customData.launchAngle || ''}
                      onChange={(e) =>
                        setCustomData({ ...customData, launchAngle: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#3d4554] border border-gray-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">정확도 (%)</label>
                    <input
                      type="number"
                      value={customData.accuracy || ''}
                      onChange={(e) =>
                        setCustomData({ ...customData, accuracy: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#3d4554] border border-gray-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">스핀량 (rpm)</label>
                    <input
                      type="number"
                      value={customData.spinRate || ''}
                      onChange={(e) =>
                        setCustomData({ ...customData, spinRate: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#3d4554] border border-gray-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">남은 거리 (yd)</label>
                    <input
                      type="number"
                      value={customData.remainingDistance || ''}
                      onChange={(e) =>
                        setCustomData({ ...customData, remainingDistance: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#3d4554] border border-gray-600 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyzeCustom}
                  className="w-full py-3 rounded-xl bg-golf-green/80 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  AI 분석하기
                </motion.button>
              </motion.div>
            )}

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
            {!state.isLoading && selectedPreset && selectedPreset !== 'custom' && state.suggestions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">제안을 생성할 수 없습니다.</p>
              </div>
            )}

            {/* 초기 안내 */}
            {!selectedPreset && (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  샷 시나리오를 선택하면
                  <br />
                  AI가 스티커와 텍스트를 추천해드립니다.
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
