/**
 * @file useDragClip.ts
 * @description 클립 드래그 제스처 처리 커스텀 훅
 *
 * 타임라인에서 클립을 드래그하여 이동시키는 로직을 담당합니다.
 *
 * ## 주요 기능
 * 1. 롱프레스 감지 (500ms)
 * 2. 드래그 모드 활성화
 * 3. 모바일 터치 이벤트 처리
 * 4. 데스크톱 마우스 이벤트 처리
 * 5. 드래그 진행률 표시
 * 6. 햅틱 피드백 (모바일)
 *
 * ## 동작 흐름
 * ```
 * 터치/클릭 시작
 *   ↓
 * 롱프레스 타이머 시작 (500ms)
 *   ↓
 * [15px 이상 이동] → 롱프레스 취소
 *   ↓
 * [500ms 경과] → 드래그 모드 활성화
 *   ↓
 * 드래그 중 → onMove 콜백 호출
 *   ↓
 * 터치/클릭 종료 → 드래그 완료
 * ```
 *
 * ## 트림 핸들러 예외
 * .trim-handle 클래스가 있는 요소에서 시작된 터치/클릭은
 * 드래그로 처리하지 않습니다 (트리밍 동작 우선).
 *
 * @example
 * const { handleTouchStart, handleMouseDown, isDraggable, longPressProgress } = useDragClip({
 *   clipId: 'clip-1',
 *   initialPosition: 10,
 *   zoom: 1,
 *   pixelsPerSecond: 10,
 *   onMove: (id, pos) => console.log(`${id} moved to ${pos}`),
 *   onSelect: (id) => console.log(`${id} selected`),
 * });
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { TimelineItem } from '../types/golf';
import { TIMELINE_CONFIG } from '../constants/editor';

// ============================================================================
// Props 인터페이스
// ============================================================================

/**
 * 스냅 결과 인터페이스
 */
interface SnapResult {
  /** 스냅된 위치 (초) */
  position: number;
  /** 스냅 여부 */
  snapped: boolean;
  /** 스냅 포인트 시간 (초) */
  snapPoint?: number;
}

/**
 * useDragClip 훅의 Props
 */
interface UseDragClipProps {
  /** 드래그할 클립의 ID */
  clipId: string;

  /** 클립의 현재 위치 (초 단위) */
  initialPosition: number;

  /** 클립의 길이 (초 단위) - 스냅 계산용 */
  clipDuration?: number;

  /** 현재 타임라인 줌 레벨 */
  zoom: number;

  /** 초당 픽셀 수 (기본 10px/sec) */
  pixelsPerSecond: number;

  /** 클립 이동 시 호출되는 콜백 */
  onMove: (clipId: string, newPosition: number) => void;

  /** 클립 선택 시 호출되는 콜백 */
  onSelect: (clipId: string) => void;

  /** 롱프레스 지연 시간 (ms, 기본 500ms) */
  longPressDelay?: number;

  /** 모든 타임라인 클립 (스냅 계산용) */
  allClips?: TimelineItem[];

  /** 스냅 상태 변경 콜백 */
  onSnapChange?: (snapped: boolean, snapPoint?: number) => void;
}

// ============================================================================
// 커스텀 훅
// ============================================================================

/**
 * 클립 드래그 로직을 처리하는 커스텀 훅
 *
 * ## 특징
 * - 롱프레스 후 드래그: 실수로 클립을 이동하는 것을 방지
 * - 모바일 터치 최적화: passive: false로 스크롤 방지
 * - ref를 사용한 즉시 상태 반영: useState 비동기 문제 해결
 *
 * @param props - 드래그 설정 옵션
 * @returns 이벤트 핸들러 및 드래그 상태
 */
/**
 * 스냅 포인트 계산 함수
 *
 * 주어진 위치가 다른 클립의 경계에 가까우면 스냅된 위치를 반환합니다.
 *
 * @param position - 현재 위치 (초)
 * @param clipDuration - 클립 길이 (초)
 * @param clips - 모든 타임라인 클립
 * @param excludeId - 제외할 클립 ID (자기 자신)
 * @returns 스냅 결과
 */
const getSnapPosition = (
  position: number,
  clipDuration: number,
  clips: TimelineItem[],
  excludeId: string
): SnapResult => {
  const threshold = TIMELINE_CONFIG.SNAP_THRESHOLD;

  // 다른 클립들의 시작점과 끝점을 스냅 포인트로 수집
  const snapPoints = clips
    .filter((c) => c.id !== excludeId)
    .flatMap((c) => [c.position, c.position + c.duration]);

  // 클립 시작점 기준 스냅 체크
  for (const point of snapPoints) {
    if (Math.abs(position - point) < threshold) {
      return { position: point, snapped: true, snapPoint: point };
    }
  }

  // 클립 끝점 기준 스냅 체크 (다른 클립 시작점에 끝점 맞추기)
  const clipEnd = position + clipDuration;
  for (const point of snapPoints) {
    if (Math.abs(clipEnd - point) < threshold) {
      return { position: point - clipDuration, snapped: true, snapPoint: point };
    }
  }

  return { position, snapped: false };
};

export const useDragClip = ({
  clipId,
  initialPosition,
  clipDuration = 0,
  zoom,
  pixelsPerSecond,
  onMove,
  onSelect,
  longPressDelay = 500, // 기본 0.5초
  allClips = [],
  onSnapChange,
}: UseDragClipProps) => {
  // ========================================
  // 상태 정의
  // ========================================

  /** 드래그 가능 상태 (UI 표시용) */
  const [isDraggable, setIsDraggable] = useState(false);

  /** 롱프레스 진행률 (0~100) */
  const [longPressProgress, setLongPressProgress] = useState(0);

  // ========================================
  // Refs (즉시 반영이 필요한 값들)
  // ========================================

  /** 롱프레스 타이머 */
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 진행률 업데이트 인터벌 */
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** 드래그 시작 위치 */
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  /** 현재 드래그 중 여부 (ref로 즉시 반영) */
  const isDraggingRef = useRef(false);

  /** 드래그 가능 여부 (ref로 즉시 반영 - state 비동기 문제 해결) */
  const isDraggableRef = useRef(false);

  /** 터치된 DOM 요소 */
  const elementRef = useRef<HTMLElement | null>(null);

  // ========================================
  // 터치 이벤트 핸들러 (모바일)
  // ========================================

  /**
   * 터치 시작 이벤트 처리
   *
   * 1. 트림 핸들러 체크 (제외)
   * 2. 클립 선택
   * 3. 롱프레스 타이머 시작
   * 4. 진행률 표시 시작
   * 5. 터치 이동/종료 리스너 등록
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 트림 핸들러에서 시작된 터치는 드래그로 처리하지 않음
    const target = e.target as HTMLElement;
    if (target.closest('.trim-handle')) {
      console.log('[DragClip] 트림 핸들러 감지, 드래그 취소');
      return;
    }

    console.log('[DragClip] 터치 시작, 롱프레스 타이머 시작');
    console.log('[DragClip] 시작 시 클립 position:', initialPosition);

    elementRef.current = target;
    onSelect(clipId);

    // 시작 위치 저장 (드래그 시작 시점 고정)
    const touch = e.touches[0];
    const startPosition = initialPosition;
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    isDraggingRef.current = false;

    // ========================================
    // 진행률 표시 시작
    // ========================================
    setLongPressProgress(0);
    const startTime = Date.now();

    // 50ms마다 진행률 업데이트
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / longPressDelay) * 100, 100);
      setLongPressProgress(progress);
    }, 50);

    // ========================================
    // 롱프레스 타이머 시작
    // ========================================
    longPressTimerRef.current = setTimeout(() => {
      console.log('[DragClip] ✅ 롱프레스 완료! 드래그 모드 활성화');

      // ref와 state 모두 업데이트
      isDraggableRef.current = true;
      setIsDraggable(true);
      setLongPressProgress(100);

      // 진행률 인터벌 정리
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // 모바일 햅틱 피드백
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    }, longPressDelay);

    // ========================================
    // 터치 이동 핸들러 (non-passive)
    // ========================================
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!startPosRef.current) return;

      const touch = moveEvent.touches[0];
      const deltaX = touch.clientX - startPosRef.current.x;
      const deltaY = touch.clientY - startPosRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 15px 이상 이동 시 롱프레스 취소 (드래그 모드 전에만)
      if (distance > 15 && !isDraggingRef.current && !isDraggableRef.current) {
        console.log(`[DragClip] ❌ 롱프레스 취소 (이동 거리: ${distance.toFixed(1)}px)`);

        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        isDraggableRef.current = false;
        setIsDraggable(false);
        setLongPressProgress(0);
        return;
      }

      // 드래그 가능 상태면 클립 이동
      if (isDraggableRef.current || isDraggingRef.current) {
        if (!isDraggingRef.current) {
          console.log('[DragClip] 🎯 드래그 시작!');
          console.log('[DragClip] isDraggable:', isDraggable);
          console.log('[DragClip] 드래그 시작 위치:', { deltaX, deltaY, distance });
        }

        // 스크롤 방지 (non-passive에서만 가능)
        moveEvent.preventDefault();
        moveEvent.stopPropagation();
        isDraggingRef.current = true;

        // 픽셀 이동량을 시간(초)으로 변환
        const deltaTime = deltaX / (pixelsPerSecond * zoom);
        let newPosition = startPosition + deltaTime;

        // 스냅 로직 적용
        if (allClips.length > 0 && clipDuration > 0) {
          const snapResult = getSnapPosition(newPosition, clipDuration, allClips, clipId);
          newPosition = snapResult.position;

          // 스냅 상태 콜백
          if (onSnapChange) {
            onSnapChange(snapResult.snapped, snapResult.snapPoint);
          }

          // 스냅 시 햅틱 피드백
          if (snapResult.snapped && 'vibrate' in navigator) {
            navigator.vibrate(10);
          }
        }

        console.log('[DragClip] 이동 중:', {
          startPosition: startPosition.toFixed(2),
          deltaTime: deltaTime.toFixed(2),
          newPosition: newPosition.toFixed(2)
        });

        onMove(clipId, newPosition);
      }
    };

    // ========================================
    // 터치 종료 핸들러
    // ========================================
    const handleTouchEnd = () => {
      console.log('[DragClip] 터치 종료');
      console.log('[DragClip] 종료 시 상태 - isDraggable:', isDraggable, 'isDragging:', isDraggingRef.current);

      // 타이머 정리
      if (longPressTimerRef.current) {
        console.log('[DragClip] 타이머 정리 (롱프레스 미완료)');
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (isDraggingRef.current) {
        console.log('[DragClip] ✅ 드래그 완료');
      } else if (isDraggable) {
        console.log('[DragClip] ⚠️ 드래그 모드였지만 드래그하지 않음');
      }

      // 스냅 상태 해제
      if (onSnapChange) {
        onSnapChange(false, undefined);
      }

      // 상태 초기화
      setIsDraggable(false);
      setLongPressProgress(0);
      isDraggingRef.current = false;
      isDraggableRef.current = false;
      startPosRef.current = null;

      // 이벤트 리스너 제거
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };

    // non-passive 리스너 등록 (preventDefault 가능)
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  }, [clipId, initialPosition, zoom, pixelsPerSecond, onMove, onSelect, isDraggable, longPressDelay]);

  // ========================================
  // 마우스 이벤트 핸들러 (데스크톱)
  // ========================================

  /**
   * 마우스 다운 이벤트 처리
   *
   * 터치 이벤트와 동일한 로직을 마우스 이벤트에 적용합니다.
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 트림 핸들러에서 시작된 클릭은 드래그로 처리하지 않음
    const target = e.target as HTMLElement;
    if (target.closest('.trim-handle')) {
      console.log('[DragClip] 트림 핸들러 감지, 드래그 취소');
      return;
    }

    console.log('[DragClip] 마우스 다운, 롱프레스 타이머 시작');
    console.log('[DragClip] 시작 시 클립 position:', initialPosition);

    e.stopPropagation();
    onSelect(clipId);

    // 시작 위치 저장
    const startPosition = initialPosition;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;

    // ========================================
    // 진행률 표시 시작
    // ========================================
    setLongPressProgress(0);
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / longPressDelay) * 100, 100);
      setLongPressProgress(progress);
    }, 50);

    // ========================================
    // 롱프레스 타이머 시작
    // ========================================
    longPressTimerRef.current = setTimeout(() => {
      console.log('[DragClip] ✅ 롱프레스 완료! 드래그 모드 활성화');

      isDraggableRef.current = true;
      setIsDraggable(true);
      setLongPressProgress(100);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, longPressDelay);

    // ========================================
    // 마우스 이동 핸들러
    // ========================================
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!startPosRef.current) return;

      const deltaX = moveEvent.clientX - startPosRef.current.x;
      const deltaY = moveEvent.clientY - startPosRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 15px 이상 이동 시 롱프레스 취소
      if (distance > 15 && !isDraggingRef.current && !isDraggableRef.current) {
        console.log(`[DragClip] ❌ 롱프레스 취소 (이동 거리: ${distance.toFixed(1)}px)`);

        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        isDraggableRef.current = false;
        setIsDraggable(false);
        setLongPressProgress(0);
        return;
      }

      // 드래그 가능 상태면 클립 이동
      if (isDraggableRef.current || isDraggingRef.current) {
        if (!isDraggingRef.current) {
          console.log('[DragClip] 🎯 드래그 시작! (마우스)');
          console.log('[DragClip] isDraggable:', isDraggable);
        }

        moveEvent.preventDefault();
        isDraggingRef.current = true;

        const deltaTime = deltaX / (pixelsPerSecond * zoom);
        let newPosition = startPosition + deltaTime;

        // 스냅 로직 적용
        if (allClips.length > 0 && clipDuration > 0) {
          const snapResult = getSnapPosition(newPosition, clipDuration, allClips, clipId);
          newPosition = snapResult.position;

          // 스냅 상태 콜백
          if (onSnapChange) {
            onSnapChange(snapResult.snapped, snapResult.snapPoint);
          }
        }

        console.log('[DragClip] 이동 중:', {
          startPosition: startPosition.toFixed(2),
          deltaTime: deltaTime.toFixed(2),
          newPosition: newPosition.toFixed(2)
        });

        onMove(clipId, newPosition);
      }
    };

    // ========================================
    // 마우스 업 핸들러
    // ========================================
    const handleMouseUp = () => {
      console.log('[DragClip] 마우스 업');
      console.log('[DragClip] 종료 시 상태 - isDraggable:', isDraggable, 'isDragging:', isDraggingRef.current);

      // 타이머 정리
      if (longPressTimerRef.current) {
        console.log('[DragClip] 타이머 정리 (롱프레스 미완료)');
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (isDraggingRef.current) {
        console.log('[DragClip] ✅ 드래그 완료');
      } else if (isDraggable) {
        console.log('[DragClip] ⚠️ 드래그 모드였지만 드래그하지 않음');
      }

      // 스냅 상태 해제
      if (onSnapChange) {
        onSnapChange(false, undefined);
      }

      // 상태 초기화
      setIsDraggable(false);
      setLongPressProgress(0);
      isDraggingRef.current = false;
      isDraggableRef.current = false;
      startPosRef.current = null;

      // 이벤트 리스너 제거
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [clipId, initialPosition, zoom, pixelsPerSecond, onMove, onSelect, isDraggable, longPressDelay]);

  // ========================================
  // 클린업
  // ========================================

  /**
   * 컴포넌트 언마운트 시 타이머 정리
   */
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // ========================================
  // 반환값
  // ========================================

  return {
    /** 마우스 다운 이벤트 핸들러 (데스크톱) */
    handleMouseDown,

    /** 터치 시작 이벤트 핸들러 (모바일) */
    handleTouchStart,

    /** 드래그 가능 상태 (UI 표시용) */
    isDraggable,

    /** 롱프레스 진행률 (0~100, 프로그레스바 표시용) */
    longPressProgress,
  };
};
