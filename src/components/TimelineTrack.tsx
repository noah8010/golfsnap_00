/**
 * @file TimelineTrack.tsx
 * @description 타임라인 트랙 렌더링 컴포넌트
 *
 * 5개 트랙(영상, 텍스트, 오디오, 필터, 스티커)의 공통 레이아웃을 처리합니다.
 * 좌측 고정 레이블 + 우측 스크롤 가능 클립 영역으로 구성됩니다.
 *
 * ## 비디오 트랙 전환 효과
 * 비디오 트랙에서 인접한 두 클립 사이에 전환 아이콘(다이아몬드)을 렌더링합니다.
 */

import React, { useMemo } from 'react';
import { TimelineItem, TransitionType } from '../types/golf';
import { TimelineClip } from './TimelineClip';
import { TransitionIcon } from './TransitionIcon';
import { TIMELINE_CONFIG } from '../constants/editor';

/** 전환 아이콘을 표시할 최대 클립 간격 (초) */
const MAX_TRANSITION_GAP = 0.5;

/** TimelineTrack 컴포넌트 Props */
interface TimelineTrackProps {
  /** 트랙 타입 */
  trackType: 'video' | 'text' | 'audio' | 'filter' | 'sticker';
  /** 트랙 레이블 텍스트 */
  label: string;
  /** 트랙 높이 CSS 클래스 */
  heightClass: string;
  /** 해당 트랙의 클립 목록 */
  clips: TimelineItem[];
  /** 전체 클립 목록 (스냅 계산용) */
  allClips: TimelineItem[];
  /** 선택된 클립 ID Set */
  selectedClipIds: Set<string>;
  /** 줌 레벨 */
  zoom: number;
  /** 좌측 패딩 (px) */
  leftPadding: number;
  /** 오버랩 중인 클립 ID Set */
  overlappingClipIds: Set<string>;
  /** 클립 선택 핸들러 */
  onSelect: (clipId: string) => void;
  /** 클립 이동 핸들러 */
  onMove: (clipId: string, newPosition: number) => void;
  /** 시작점 트림 핸들러 */
  onTrimStart: (clipId: string, newStartTime: number) => void;
  /** 끝점 트림 핸들러 */
  onTrimEnd: (clipId: string, newEndTime: number) => void;
  /** 스냅 상태 변경 핸들러 */
  onSnapChange: (snapped: boolean, snapPoint?: number) => void;
  /** 레이블 클릭 핸들러 (패널 열기) */
  onLabelClick?: () => void;
  /** 클립 더블클릭 핸들러 (수정 패널 열기) */
  onDoubleClick?: (clip: TimelineItem) => void;
  /** 다중 선택 모드 여부 */
  isMultiSelectMode?: boolean;
  /** 전환 아이콘 클릭 핸들러 (비디오 트랙 전용) */
  onTransitionClick?: (clipId: string, currentTransition: TransitionType) => void;
}

/** 전환 포인트 정보 */
interface TransitionPoint {
  /** 첫 번째 클립 ID (아웃 전환 대상) */
  clipId: string;
  /** 현재 적용된 전환 타입 */
  transitionType: TransitionType;
  /** 아이콘 수평 위치 (px) */
  positionX: number;
}

/**
 * 타임라인 트랙 컴포넌트
 *
 * 좌측 고정 레이블과 우측 클립 영역으로 구성된 트랙 렌더링
 */
export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  trackType,
  label,
  heightClass,
  clips,
  allClips,
  selectedClipIds,
  zoom,
  leftPadding,
  overlappingClipIds,
  onSelect,
  onMove,
  onTrimStart,
  onTrimEnd,
  onSnapChange,
  onLabelClick,
  onDoubleClick,
  isMultiSelectMode = false,
  onTransitionClick,
}) => {
  /** 레이블 영역: 버튼(클릭 가능) 또는 일반 div */
  const LabelElement = onLabelClick ? 'button' : 'div';

  /**
   * 비디오 트랙에서 인접한 클립 사이의 전환 포인트 계산
   */
  const transitionPoints = useMemo((): TransitionPoint[] => {
    if (trackType !== 'video' || clips.length < 2) return [];

    const sorted = [...clips].sort((a, b) => a.position - b.position);
    const points: TransitionPoint[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      const currentEnd = current.position + current.duration;
      const gap = next.position - currentEnd;

      // 인접하거나 약간의 갭이 있는 경우에만 전환 아이콘 표시
      if (gap <= MAX_TRANSITION_GAP) {
        const midTime = (currentEnd + next.position) / 2;
        const positionX = midTime * TIMELINE_CONFIG.PIXELS_PER_SECOND * zoom + leftPadding;

        points.push({
          clipId: current.id,
          transitionType: current.transitions?.out || 'none',
          positionX,
        });
      }
    }

    return points;
  }, [trackType, clips, zoom, leftPadding]);

  return (
    <div className={`${heightClass} bg-gray-50 border-b border-gray-200 relative timeline-background flex`} data-track={trackType}>
      {/* 좌측 레이블 (sticky) */}
      <LabelElement
        className={`track-label sticky left-0 z-20 w-16 flex-shrink-0 bg-gray-100 border-r border-gray-200 flex items-center justify-center ${
          onLabelClick ? 'hover:bg-gray-200 transition-colors' : ''
        }`}
        onClick={onLabelClick}
      >
        <span className="text-xs text-gray-600 font-medium">{label}</span>
      </LabelElement>

      {/* 클립 영역 */}
      <div className="flex-1 relative" style={{ paddingLeft: `${leftPadding}px` }}>
        {clips.map((clip) => (
          <TimelineClip
            key={clip.id}
            clip={clip}
            isSelected={selectedClipIds.has(clip.id)}
            isMultiSelectMode={isMultiSelectMode}
            zoom={zoom}
            isDraggable={true}
            leftPadding={leftPadding}
            isOverlapping={overlappingClipIds.has(clip.id)}
            allClips={allClips}
            onSelect={onSelect}
            onDoubleClick={onDoubleClick}
            onMove={onMove}
            onTrimStart={onTrimStart}
            onTrimEnd={onTrimEnd}
            onSnapChange={onSnapChange}
          />
        ))}

        {/* 비디오 트랙 전환 아이콘 */}
        {transitionPoints.map((point) => (
          <TransitionIcon
            key={`transition-${point.clipId}`}
            transitionType={point.transitionType}
            positionX={point.positionX}
            onClick={() => onTransitionClick?.(point.clipId, point.transitionType)}
          />
        ))}
      </div>
    </div>
  );
};
