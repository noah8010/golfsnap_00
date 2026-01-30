import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TimelineItem } from '../types/golf';
import { TrimHandle } from './TrimHandle';
import { useDragClip } from '../hooks/useDragClip';
import { useLongPress } from '../hooks/useLongPress';
import { TIMELINE_CONFIG } from '../constants/editor';

interface TimelineClipProps {
  clip: TimelineItem;
  isSelected: boolean;
  zoom: number;
  isDraggable: boolean;
  leftPadding?: number; // 좌측 여백 (px)
  onSelect: (clipId: string) => void;
  onDoubleClick?: (clip: TimelineItem) => void;
  onMove?: (clipId: string, newPosition: number) => void;
  onTrimStart: (clipId: string, deltaTime: number) => void;
  onTrimEnd: (clipId: string, deltaTime: number) => void;
  onLongPress?: (clip: TimelineItem) => void;
}

/**
 * 타임라인 클립 컴포넌트
 *
 * 모든 트랙 타입(영상/텍스트/오디오/필터/스티커)을 렌더링하는 공통 컴포넌트
 */
export const TimelineClip: React.FC<TimelineClipProps> = ({
  clip,
  isSelected,
  zoom,
  isDraggable,
  leftPadding = 0,
  onSelect,
  onDoubleClick,
  onMove,
  onTrimStart,
  onTrimEnd,
  onLongPress,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // 롱프레스 훅 (툴팁용 - 항상 호출하되 조건부 실행)
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      // 드래그 불가능한 클립만 툴팁 표시
      if (onLongPress && !isDraggable) {
        setShowTooltip(true);
        onLongPress(clip);
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    },
    delay: 500,
  });

  // 트랙별 색상 및 스타일
  const getTrackStyle = () => {
    switch (clip.track) {
      case 'video':
        return {
          backgroundColor: '#3b82f6',
          gradient: 'from-blue-600 to-blue-500',
          ringColor: 'ring-blue-500',
        };
      case 'text':
        return {
          backgroundColor: '#f59e0b',
          gradient: 'from-amber-600 to-amber-500',
          ringColor: 'ring-amber-500',
        };
      case 'audio':
        return {
          backgroundColor: '#10b981',
          gradient: 'from-emerald-600 to-emerald-500',
          ringColor: 'ring-green-500',
        };
      case 'filter':
        return {
          backgroundColor: '#a855f7',
          gradient: 'from-purple-600 to-purple-500',
          ringColor: 'ring-purple-500',
        };
      case 'sticker':
        return {
          backgroundColor: '#ec4899',
          gradient: 'from-pink-600 to-pink-500',
          ringColor: 'ring-pink-500',
        };
      default:
        return {
          backgroundColor: '#6b7280',
          gradient: 'from-gray-600 to-gray-500',
          ringColor: 'ring-gray-500',
        };
    }
  };

  // 클립 라벨 생성
  const getClipLabel = () => {
    switch (clip.track) {
      case 'video':
        return `클립 ${clip.id.split('-')[1]}`;
      case 'text':
        return clip.textContent || '텍스트';
      case 'audio':
        return clip.audioBgm ? clip.audioBgm.name : '오디오';
      case 'filter':
        return clip.filterPreset ? `필터: ${clip.filterPreset}` : '필터';
      case 'sticker':
        return clip.stickerEmoji ? `${clip.stickerEmoji} ${clip.stickerName || ''}` : '스티커';
      default:
        return clip.id;
    }
  };

  const trackStyle = getTrackStyle();
  const label = getClipLabel();

  // 드래그 훅 (항상 생성, 조건부 사용)
  const dragHook = useDragClip({
    clipId: clip.id,
    initialPosition: clip.position,
    zoom,
    pixelsPerSecond: TIMELINE_CONFIG.PIXELS_PER_SECOND,
    onMove: onMove || (() => {}),
    onSelect,
    longPressDelay: 500, // 0.5초 롱프레스
  });

  // 드래그 가능 상태 (시각적 피드백)
  const isDraggableActive = dragHook.isDraggable;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      animate={isDraggableActive ? { scale: 1.05, zIndex: 100 } : {}}
      drag={false}
      dragListener={false}
      onDoubleClick={() => onDoubleClick?.(clip)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(clip.id);
        setShowTooltip(false);
      }}
      data-draggable={isDraggableActive}
      className={`timeline-clip absolute top-1 bottom-1 rounded overflow-visible transition-shadow ${
        isDraggable ? 'cursor-move' : 'cursor-pointer'
      } ${
        isSelected ? `ring-2 ${trackStyle.ringColor}` : 'hover:ring-1 hover:ring-gray-400'
      } ${showTooltip ? 'z-50' : ''} ${
        isDraggableActive ? 'shadow-2xl ring-4 ring-white/50' : ''
      }`}
      style={{
        left: `${clip.position * TIMELINE_CONFIG.PIXELS_PER_SECOND * zoom + leftPadding}px`,
        width: `${Math.max(clip.duration * TIMELINE_CONFIG.PIXELS_PER_SECOND * zoom, 30)}px`, // 최소 30px
        backgroundColor: trackStyle.backgroundColor,
      }}
      onMouseDown={isDraggable ? dragHook.handleMouseDown : longPressHandlers.onMouseDown}
      onTouchStart={isDraggable ? dragHook.handleTouchStart : longPressHandlers.onTouchStart}
      onMouseMove={!isDraggable ? longPressHandlers.onMouseMove : undefined}
      onMouseUp={!isDraggable ? longPressHandlers.onMouseUp : undefined}
      onMouseLeave={!isDraggable ? longPressHandlers.onMouseLeave : undefined}
      onTouchMove={!isDraggable ? longPressHandlers.onTouchMove : undefined}
      onTouchEnd={!isDraggable ? longPressHandlers.onTouchEnd : undefined}
    >
      {clip.track === 'video' ? (
        <div className={`h-full bg-gradient-to-r ${trackStyle.gradient} p-2 flex items-center justify-between relative`}>
          <span className="text-xs text-white font-medium truncate">{label}</span>
          {clip.speed !== 1 && <span className="text-xs text-white font-bold">{clip.speed}x</span>}
          
          
          {/* 비디오 트림 핸들러 */}
          {isSelected && (
            <>
              <TrimHandle
                side="left"
                clipId={clip.id}
                zoom={zoom}
                pixelsPerSecond={TIMELINE_CONFIG.PIXELS_PER_SECOND}
                onTrim={(id, delta) => {
                  const currentStart = clip.startTime ?? 0;
                  onTrimStart(id, currentStart + delta);
                }}
              />
              <TrimHandle
                side="right"
                clipId={clip.id}
                zoom={zoom}
                pixelsPerSecond={TIMELINE_CONFIG.PIXELS_PER_SECOND}
                onTrim={(id, delta) => {
                  const currentEnd = clip.endTime ?? clip.duration;
                  onTrimEnd(id, currentEnd + delta);
                }}
              />
            </>
          )}
        </div>
      ) : (
        <>
          <span className="text-xs text-white font-medium truncate pointer-events-none px-2 py-1 block">
            {label}
          </span>
          
          
          
          {/* 텍스트/오디오/필터 트림 핸들러 */}
          {isSelected && (
            <>
              <TrimHandle
                side="left"
                clipId={clip.id}
                zoom={zoom}
                pixelsPerSecond={TIMELINE_CONFIG.PIXELS_PER_SECOND}
                onTrim={onTrimStart}
              />
              <TrimHandle
                side="right"
                clipId={clip.id}
                zoom={zoom}
                pixelsPerSecond={TIMELINE_CONFIG.PIXELS_PER_SECOND}
                onTrim={onTrimEnd}
              />
            </>
          )}
        </>
      )}
    </motion.div>
  );
};
