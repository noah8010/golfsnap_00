/**
 * @file usePlaybackSimulation.ts
 * @description 미리보기 재생 시뮬레이션 훅
 *
 * Play 버튼 클릭 시 타임라인의 scrollLeft를 자동으로 이동하여
 * 플레이헤드가 진행하는 효과를 시뮬레이션합니다.
 *
 * ## 동작
 * - Play → requestAnimationFrame 루프 시작
 * - 매 프레임: currentTime += deltaTime, scrollLeft 자동 이동
 * - totalDuration 도달 → 자동 정지
 * - 수동 스크롤 감지 시 → 일시정지
 */

import { useState, useRef, useCallback, useEffect } from 'react';

/** usePlaybackSimulation 훅 Props */
interface UsePlaybackSimulationProps {
  /** 타임라인 스크롤 컨테이너 ref */
  timelineRef: React.RefObject<HTMLDivElement>;
  /** 전체 타임라인 길이 (초) */
  totalDuration: number;
  /** 현재 줌 레벨 */
  zoom: number;
  /** 좌측 여백 (px) */
  leftPadding: number;
  /** 좌측 레이블 너비 (px) */
  labelWidth: number;
  /** 초당 픽셀 수 */
  pixelsPerSecond: number;
  /** 스크롤 오프셋 설정 함수 */
  onScrollOffsetChange: (offset: number) => void;
}

/** usePlaybackSimulation 훅 반환값 */
interface UsePlaybackSimulationReturn {
  /** 재생 중 여부 */
  isPlaying: boolean;
  /** 현재 시간 (초) */
  currentTime: number;
  /** 재생/정지 토글 */
  togglePlayPause: () => void;
  /** 시간 직접 설정 (스크롤 시) */
  setCurrentTime: (time: number) => void;
  /** 재생 중 수동 스크롤 감지 플래그 */
  isUserScrolling: React.MutableRefObject<boolean>;
}

/**
 * 미리보기 재생 시뮬레이션 훅
 *
 * requestAnimationFrame 기반으로 타임라인 자동 스크롤을 구현합니다.
 */
export const usePlaybackSimulation = ({
  timelineRef,
  totalDuration,
  zoom,
  leftPadding,
  labelWidth,
  pixelsPerSecond,
  onScrollOffsetChange,
}: UsePlaybackSimulationProps): UsePlaybackSimulationReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  /** 애니메이션 프레임 ID */
  const animationFrameRef = useRef<number | null>(null);
  /** 이전 프레임 타임스탬프 */
  const lastTimestampRef = useRef<number | null>(null);
  /** 사용자 수동 스크롤 여부 (외부에서 감지용) */
  const isUserScrolling = useRef(false);

  /**
   * 시간에 해당하는 scrollLeft 값 계산
   */
  const timeToScrollLeft = useCallback((time: number): number => {
    const el = timelineRef.current;
    if (!el) return 0;
    const containerWidth = el.clientWidth;
    const centerOffset = containerWidth / 2;
    // 플레이헤드가 중앙에 위치하도록 scrollLeft 계산
    return time * pixelsPerSecond * zoom + leftPadding + labelWidth - centerOffset;
  }, [timelineRef, pixelsPerSecond, zoom, leftPadding, labelWidth]);

  /**
   * 애니메이션 루프
   */
  const animate = useCallback((timestamp: number) => {
    if (lastTimestampRef.current === null) {
      lastTimestampRef.current = timestamp;
    }

    const deltaMs = timestamp - lastTimestampRef.current;
    lastTimestampRef.current = timestamp;

    // 초 단위 시간 진행
    const deltaSec = deltaMs / 1000;

    setCurrentTime((prev) => {
      const next = prev + deltaSec;
      if (next >= totalDuration) {
        // 끝에 도달하면 정지
        setIsPlaying(false);
        return totalDuration;
      }

      // 타임라인 스크롤 이동
      const el = timelineRef.current;
      if (el && !isUserScrolling.current) {
        const targetScrollLeft = timeToScrollLeft(next);
        el.scrollLeft = targetScrollLeft;
        onScrollOffsetChange(targetScrollLeft);
      }

      return next;
    });

    // 계속 재생 중이면 다음 프레임 요청
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [totalDuration, timelineRef, timeToScrollLeft, onScrollOffsetChange]);

  /**
   * 재생 시작/정지
   */
  useEffect(() => {
    if (isPlaying) {
      lastTimestampRef.current = null;
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimestampRef.current = null;
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, animate]);

  /**
   * 재생/정지 토글
   */
  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev) {
        // 끝에서 다시 재생 시 처음으로
        setCurrentTime((t) => (t >= totalDuration ? 0 : t));
      }
      return !prev;
    });
  }, [totalDuration]);

  return {
    isPlaying,
    currentTime,
    togglePlayPause,
    setCurrentTime,
    isUserScrolling,
  };
};
