/**
 * @file PreviewPlayer.tsx
 * @description 영상 미리보기 플레이어 컴포넌트
 *
 * 에디터 상단의 미리보기 영역을 담당합니다.
 * 화면 비율별 표시, 텍스트/스티커 오버레이, 재생 컨트롤을 포함합니다.
 * 필터 클립 적용 시 CSS filter로 시각적 피드백을 제공합니다.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Maximize2 } from 'lucide-react';
import { TimelineItem, Project } from '../types/golf';
import { DraggableOverlay } from './DraggableOverlay';

/** PreviewPlayer 컴포넌트 Props */
interface PreviewPlayerProps {
  /** 현재 프로젝트 */
  currentProject: Project;
  /** 재생 중 여부 */
  isPlaying: boolean;
  /** 현재 재생 시간 (초) */
  currentTime: number;
  /** 전체 길이 (초) */
  totalDuration: number;
  /** 모든 타임라인 클립 */
  timelineClips: TimelineItem[];
  /** 선택된 클립 ID */
  selectedClipId: string | null;
  /** 미리보기 영역 ref */
  previewRef: React.RefObject<HTMLDivElement>;
  /** 재생/일시정지 토글 */
  onPlayPause: () => void;
  /** 오버레이 위치 변경 */
  onOverlayPositionChange: (clipId: string, x: number, y: number) => void;
  /** 클립 선택 */
  onSelectClip: (clipId: string) => void;
}

/** 필터 프리셋별 CSS 매핑 */
const PRESET_FILTERS: Record<string, string> = {
  vivid: 'brightness(1.1) contrast(1.2) saturate(1.4)',
  soft: 'brightness(1.05) contrast(0.9) saturate(0.85)',
  cool: 'hue-rotate(-15deg) saturate(1.1) brightness(0.95)',
  warm: 'sepia(0.15) saturate(1.3) brightness(1.05)',
  pro: 'contrast(1.15) saturate(1.1)',
};

/**
 * 시간을 MM:SS 형식으로 포맷팅
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 영상 미리보기 플레이어 컴포넌트
 */
export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({
  currentProject,
  isPlaying,
  currentTime,
  totalDuration,
  timelineClips,
  selectedClipId,
  previewRef,
  onPlayPause,
  onOverlayPositionChange,
  onSelectClip,
}) => {
  /** 현재 시간에 활성화된 필터 클립의 CSS filter 계산 */
  const activeFilterStyle = useMemo(() => {
    const filterClip = timelineClips
      .filter((clip) => clip.track === 'filter')
      .find(
        (clip) =>
          currentTime >= clip.position &&
          currentTime < clip.position + clip.duration
      );

    if (!filterClip) return '';

    const b = filterClip.filterBrightness || 0;
    const c = filterClip.filterContrast || 0;
    const s = filterClip.filterSaturation || 0;
    const t = filterClip.filterTemperature || 0;

    // 개별 값이 모두 0이면 프리셋 사용
    if (b === 0 && c === 0 && s === 0 && t === 0) {
      return PRESET_FILTERS[filterClip.filterPreset || ''] || '';
    }

    // 개별 슬라이더 값을 CSS filter로 변환
    return `brightness(${1 + b / 100}) contrast(${1 + c / 100}) saturate(${1 + s / 100}) hue-rotate(${t * 0.5}deg)`;
  }, [timelineClips, currentTime]);

  /** 활성 필터 프리셋 이름 (라벨 표시용) */
  const activeFilterLabel = useMemo(() => {
    const filterClip = timelineClips
      .filter((clip) => clip.track === 'filter')
      .find(
        (clip) =>
          currentTime >= clip.position &&
          currentTime < clip.position + clip.duration
      );

    if (!filterClip) return null;

    if (filterClip.filterPreset && filterClip.filterPreset !== 'none') {
      const names: Record<string, string> = {
        vivid: 'Vivid',
        soft: 'Soft',
        cool: 'Cool',
        warm: 'Warm',
        pro: 'Pro',
      };
      return names[filterClip.filterPreset] || null;
    }

    const hasCustom =
      (filterClip.filterBrightness || 0) !== 0 ||
      (filterClip.filterContrast || 0) !== 0 ||
      (filterClip.filterSaturation || 0) !== 0 ||
      (filterClip.filterTemperature || 0) !== 0;

    return hasCustom ? '커스텀' : null;
  }, [timelineClips, currentTime]);

  return (
    <div className="flex-shrink-0 bg-gray-900 relative" style={{ height: '45%' }}>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div
          ref={previewRef}
          className="relative shadow-2xl overflow-hidden"
          style={{
            aspectRatio:
              currentProject.aspectRatio === '16:9' ? '16/9' : currentProject.aspectRatio === '9:16' ? '9/16' : '1/1',
            maxHeight: '100%',
            maxWidth: currentProject.aspectRatio === '9:16' ? '60%' : '95%',
          }}
        >
          {/* 썸네일 이미지 또는 기본 배경 (필터 CSS 적용) */}
          {currentProject.thumbnail ? (
            <img
              src={currentProject.thumbnail}
              alt="미리보기"
              className="w-full h-full object-cover transition-[filter] duration-300"
              style={activeFilterStyle ? { filter: activeFilterStyle } : undefined}
            />
          ) : (
            <div
              className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center transition-[filter] duration-300"
              style={activeFilterStyle ? { filter: activeFilterStyle } : undefined}
            >
              <Play className="w-16 h-16 text-gray-600" />
            </div>
          )}

          {/* 필터 활성 표시 라벨 */}
          {activeFilterLabel && (
            <div className="absolute top-3 left-3 px-2 py-0.5 bg-purple-500/80 backdrop-blur-sm rounded text-xs text-white font-medium flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              {activeFilterLabel}
            </div>
          )}

          {/* 재생 컨트롤 오버레이 */}
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onPlayPause}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" fill="currentColor" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                )}
              </motion.button>
            </div>

            <div className="absolute bottom-3 left-3 text-white text-xs font-mono bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </motion.button>
          </div>

          {/* 텍스트 오버레이 (드래그 가능) */}
          {timelineClips
            .filter((clip) => clip.track === 'text')
            .filter((clip) =>
              currentTime >= clip.position &&
              currentTime < clip.position + clip.duration
            )
            .map((clip) => (
              <DraggableOverlay
                key={clip.id}
                clip={clip}
                type="text"
                containerRef={previewRef}
                onPositionChange={onOverlayPositionChange}
                isSelected={selectedClipId === clip.id}
                onSelect={onSelectClip}
              />
            ))
          }

          {/* 스티커 오버레이 (드래그 가능) */}
          {timelineClips
            .filter((clip) => clip.track === 'sticker')
            .filter((clip) =>
              currentTime >= clip.position &&
              currentTime < clip.position + clip.duration
            )
            .map((clip) => (
              <DraggableOverlay
                key={clip.id}
                clip={clip}
                type="sticker"
                containerRef={previewRef}
                onPositionChange={onOverlayPositionChange}
                isSelected={selectedClipId === clip.id}
                onSelect={onSelectClip}
              />
            ))
          }

          {/* 화면 비율 표시 */}
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-xs text-white font-semibold">
            {currentProject.aspectRatio || '16:9'}
          </div>
        </div>
      </div>
    </div>
  );
};
