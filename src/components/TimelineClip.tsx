/**
 * @file TimelineClip.tsx
 * @description 타임라인 클립 렌더링 컴포넌트
 *
 * 모든 트랙 타입(영상, 텍스트, 오디오, 필터, 스티커)의 클립을 렌더링합니다.
 * 각 트랙별로 다른 색상과 스타일이 적용됩니다.
 *
 * ## 트랙별 색상
 * - 영상(video): 파란색 (#3b82f6)
 * - 텍스트(text): 주황색 (#f59e0b)
 * - 오디오(audio): 초록색 (#10b981)
 * - 필터(filter): 보라색 (#a855f7)
 * - 스티커(sticker): 핑크색 (#ec4899)
 *
 * ## 주요 기능
 * 1. 클립 시각화: 트랙별 색상, 라벨, 속도 표시
 * 2. 선택 상태: 링 하이라이트
 * 3. 드래그 이동: 롱프레스 후 드래그 (useDragClip 훅)
 * 4. 트리밍: 좌우 핸들러 드래그 (TrimHandle 컴포넌트)
 * 5. 더블클릭: 편집 패널 열기
 *
 * ## Props
 * - clip: 클립 데이터 (TimelineItem)
 * - isSelected: 선택 여부
 * - zoom: 줌 레벨
 * - isDraggable: 드래그 가능 여부
 * - onSelect: 선택 콜백
 * - onDoubleClick: 더블클릭 콜백
 * - onMove: 이동 콜백
 * - onTrimStart: 시작점 트림 콜백
 * - onTrimEnd: 끝점 트림 콜백
 *
 * @example
 * <TimelineClip
 *   clip={clip}
 *   isSelected={selectedClipId === clip.id}
 *   zoom={1}
 *   isDraggable={true}
 *   onSelect={setSelectedClipId}
 *   onMove={moveClip}
 *   onTrimStart={trimClipStart}
 *   onTrimEnd={trimClipEnd}
 * />
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Square } from 'lucide-react';
import { TimelineItem } from '../types/golf';
import { TrimHandle } from './TrimHandle';
import { useDragClip } from '../hooks/useDragClip';
import { useLongPress } from '../hooks/useLongPress';
import { AudioWaveform } from './AudioWaveform';
import { TIMELINE_CONFIG } from '../constants/editor';

// ============================================================================
// Props 인터페이스
// ============================================================================

/**
 * TimelineClip 컴포넌트 Props
 */
interface TimelineClipProps {
  /** 클립 데이터 */
  clip: TimelineItem;

  /** 현재 선택 여부 */
  isSelected: boolean;

  /** 다중 선택 모드 여부 */
  isMultiSelectMode?: boolean;

  /** 현재 줌 레벨 */
  zoom: number;

  /** 드래그 가능 여부 (롱프레스 후 드래그) */
  isDraggable: boolean;

  /** 좌측 패딩 (중앙 플레이헤드용, px) */
  leftPadding?: number;

  /** 다른 클립과 오버랩 여부 (시각적 표시용) */
  isOverlapping?: boolean;

  /** 모든 타임라인 클립 (스냅 계산용) */
  allClips?: TimelineItem[];

  /** 클립 선택 시 콜백 */
  onSelect: (clipId: string) => void;

  /** 더블클릭 시 콜백 (편집 패널 열기) */
  onDoubleClick?: (clip: TimelineItem) => void;

  /** 클립 이동 시 콜백 */
  onMove?: (clipId: string, newPosition: number) => void;

  /** 시작점 트림 콜백 */
  onTrimStart: (clipId: string, deltaTime: number) => void;

  /** 끝점 트림 콜백 */
  onTrimEnd: (clipId: string, deltaTime: number) => void;

  /** 롱프레스 콜백 (툴팁 표시용) */
  onLongPress?: (clip: TimelineItem) => void;

  /** 스냅 상태 변경 콜백 */
  onSnapChange?: (snapped: boolean, snapPoint?: number) => void;
}

// ============================================================================
// 컴포넌트
// ============================================================================

/**
 * 타임라인 클립 컴포넌트
 *
 * 모든 트랙 타입(영상/텍스트/오디오/필터/스티커)을 렌더링하는 공통 컴포넌트
 */
export const TimelineClip: React.FC<TimelineClipProps> = ({
  clip,
  isSelected,
  isMultiSelectMode = false,
  zoom,
  isDraggable,
  leftPadding = 0,
  isOverlapping = false,
  allClips = [],
  onSelect,
  onDoubleClick,
  onMove,
  onTrimStart,
  onTrimEnd,
  onLongPress,
  onSnapChange,
}) => {
  // ========================================
  // 상태
  // ========================================

  /** 툴팁 표시 여부 */
  const [showTooltip, setShowTooltip] = useState(false);

  // ========================================
  // 롱프레스 훅 (툴팁용)
  // ========================================

  /**
   * 드래그 불가능한 클립에서 롱프레스 시 툴팁 표시
   */
  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (onLongPress && !isDraggable) {
        setShowTooltip(true);
        onLongPress(clip);
        // 햅틱 피드백
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    },
    delay: 500, // 0.5초
  });

  // ========================================
  // 트랙별 스타일
  // ========================================

  /**
   * 트랙 타입에 따른 색상 및 스타일 반환
   */
  const getTrackStyle = () => {
    switch (clip.track) {
      case 'video':
        return {
          backgroundColor: '#3b82f6',           // 파란색
          gradient: 'from-blue-600 to-blue-500',
          ringColor: 'ring-blue-500',
        };
      case 'text':
        return {
          backgroundColor: '#f59e0b',           // 주황색
          gradient: 'from-amber-600 to-amber-500',
          ringColor: 'ring-amber-500',
        };
      case 'audio':
        return {
          backgroundColor: '#10b981',           // 초록색
          gradient: 'from-emerald-600 to-emerald-500',
          ringColor: 'ring-green-500',
        };
      case 'filter':
        return {
          backgroundColor: '#a855f7',           // 보라색
          gradient: 'from-purple-600 to-purple-500',
          ringColor: 'ring-purple-500',
        };
      case 'sticker':
        return {
          backgroundColor: '#ec4899',           // 핑크색
          gradient: 'from-pink-600 to-pink-500',
          ringColor: 'ring-pink-500',
        };
      default:
        return {
          backgroundColor: '#6b7280',           // 회색
          gradient: 'from-gray-600 to-gray-500',
          ringColor: 'ring-gray-500',
        };
    }
  };

  // ========================================
  // 클립 라벨 생성
  // ========================================

  /**
   * 트랙 타입에 따른 클립 라벨 생성
   */
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

  // ========================================
  // 드래그 훅
  // ========================================

  /**
   * 클립 드래그 이동 로직
   * 롱프레스(0.5초) 후 드래그 가능
   * 스냅 기능 포함
   */
  const dragHook = useDragClip({
    clipId: clip.id,
    initialPosition: clip.position,
    clipDuration: clip.duration,
    zoom,
    pixelsPerSecond: TIMELINE_CONFIG.PIXELS_PER_SECOND,
    onMove: onMove || (() => {}),
    onSelect,
    longPressDelay: 500, // 0.5초 롱프레스
    allClips,
    onSnapChange,
  });

  // 드래그 가능 상태 (시각적 피드백용)
  const isDraggableActive = dragHook.isDraggable;

  // ========================================
  // 렌더링
  // ========================================

  return (
    <motion.div
      // 탭 시 살짝 축소 애니메이션
      whileTap={{ scale: 0.98 }}

      // 드래그 모드 시 확대 + z-index 상승
      animate={isDraggableActive ? { scale: 1.05, zIndex: 100 } : {}}

      // framer-motion 기본 드래그 비활성화 (커스텀 드래그 사용)
      drag={false}
      dragListener={false}

      // 이벤트 핸들러
      onDoubleClick={() => onDoubleClick?.(clip)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(clip.id);
        setShowTooltip(false);
      }}

      // 데이터 속성 (디버깅용)
      data-draggable={isDraggableActive}

      // 클래스 (선택/호버/드래그/오버랩 상태에 따라)
      className={`timeline-clip absolute top-1 bottom-1 rounded overflow-visible transition-shadow ${
        isDraggable ? 'cursor-move' : 'cursor-pointer'
      } ${
        isSelected ? `ring-2 ${trackStyle.ringColor}` : 'hover:ring-1 hover:ring-gray-400'
      } ${showTooltip ? 'z-50' : ''} ${
        isDraggableActive ? 'shadow-2xl ring-4 ring-white/50' : ''
      } ${
        isOverlapping ? 'opacity-80 border-2 border-dashed border-white/50' : ''
      }`}

      // 스타일: 위치, 너비, 배경색
      style={{
        // 위치: position(초) × 초당픽셀 × 줌 + 좌측패딩
        left: `${clip.position * TIMELINE_CONFIG.PIXELS_PER_SECOND * zoom + leftPadding}px`,
        // 너비: duration(초) × 초당픽셀 × 줌 (최소 30px)
        width: `${Math.max(clip.duration * TIMELINE_CONFIG.PIXELS_PER_SECOND * zoom, 30)}px`,
        backgroundColor: trackStyle.backgroundColor,
      }}

      // 마우스/터치 이벤트 (드래그 가능 여부에 따라 분기)
      onMouseDown={isDraggable ? dragHook.handleMouseDown : longPressHandlers.onMouseDown}
      onTouchStart={isDraggable ? dragHook.handleTouchStart : longPressHandlers.onTouchStart}
      onMouseMove={!isDraggable ? longPressHandlers.onMouseMove : undefined}
      onMouseUp={!isDraggable ? longPressHandlers.onMouseUp : undefined}
      onMouseLeave={!isDraggable ? longPressHandlers.onMouseLeave : undefined}
      onTouchMove={!isDraggable ? longPressHandlers.onTouchMove : undefined}
      onTouchEnd={!isDraggable ? longPressHandlers.onTouchEnd : undefined}
    >
      {/* 다중 선택 모드 체크박스 */}
      {isMultiSelectMode && (
        <div className="absolute top-0.5 right-0.5 z-10 pointer-events-none">
          {isSelected ? (
            <CheckSquare className="w-3.5 h-3.5 text-white drop-shadow" />
          ) : (
            <Square className="w-3.5 h-3.5 text-white/60 drop-shadow" />
          )}
        </div>
      )}

      {/* ========================================
          비디오 트랙 렌더링
          ======================================== */}
      {clip.track === 'video' ? (
        <div className={`h-full bg-gradient-to-r ${trackStyle.gradient} p-2 flex items-center justify-between relative`}>
          {/* 클립 라벨 */}
          <span className="text-xs text-white font-medium truncate">{label}</span>

          {/* 속도 표시 (1x가 아닌 경우만) */}
          {clip.speed !== 1 && <span className="text-xs text-white font-bold">{clip.speed}x</span>}

          {/* 트림 핸들러 (선택 시에만 표시) */}
          {isSelected && (
            <>
              {/* 왼쪽 트림 핸들러 (시작점 조정) */}
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
              {/* 오른쪽 트림 핸들러 (끝점 조정) */}
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
        /* ========================================
           텍스트/오디오/필터/스티커 트랙 렌더링
           ======================================== */
        <>
          {/* 오디오 파형 (오디오 트랙 전용) */}
          {clip.track === 'audio' && (
            <AudioWaveform
              clipId={clip.id}
              width={Math.max(clip.duration * TIMELINE_CONFIG.PIXELS_PER_SECOND * zoom, 30)}
              height={40}
            />
          )}

          {/* 클립 라벨 */}
          <span className="text-xs text-white font-medium truncate pointer-events-none px-2 py-1 block relative z-10">
            {label}
          </span>

          {/* 트림 핸들러 (선택 시에만 표시) */}
          {isSelected && (
            <>
              {/* 왼쪽 트림 핸들러 (위치 조정) */}
              <TrimHandle
                side="left"
                clipId={clip.id}
                zoom={zoom}
                pixelsPerSecond={TIMELINE_CONFIG.PIXELS_PER_SECOND}
                onTrim={onTrimStart}
              />
              {/* 오른쪽 트림 핸들러 (길이 조정) */}
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
