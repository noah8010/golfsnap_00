/**
 * @file useLongPress.ts
 * @description 롱프레스 제스처 감지 훅
 *
 * 터치 또는 마우스 클릭을 일정 시간 이상 유지했을 때
 * 롱프레스로 인식하고 콜백을 실행합니다.
 *
 * ## 주요 기능
 * 1. 터치/마우스 다운 시 타이머 시작
 * 2. 지정 시간(기본 500ms) 경과 시 롱프레스 콜백 실행
 * 3. 이동 감지: 10px 이상 이동 시 롱프레스 취소 (드래그로 간주)
 * 4. 터치/마우스 업 시 타이머 클리어
 *
 * ## 사용 예시
 * ```tsx
 * const longPressHandlers = useLongPress({
 *   onLongPress: () => console.log('Long pressed!'),
 *   delay: 500,
 * });
 *
 * return (
 *   <button {...longPressHandlers}>
 *     Long press me
 *   </button>
 * );
 * ```
 *
 * ## 드래그와의 구분
 * - 10px 이상 이동: 드래그로 간주, 롱프레스 취소
 * - 이동 없이 시간 경과: 롱프레스로 인식
 */

import { useCallback, useRef } from 'react';

// ============================================================================
// Props 인터페이스
// ============================================================================

/**
 * useLongPress 훅의 Props
 */
interface UseLongPressProps {
  /** 롱프레스 완료 시 실행할 콜백 */
  onLongPress: () => void;

  /** 롱프레스 인식 시간 (ms, 기본 500ms) */
  delay?: number;
}

// ============================================================================
// 커스텀 훅
// ============================================================================

/**
 * 롱프레스 제스처를 처리하는 훅
 *
 * @param onLongPress - 롱프레스 시 실행할 콜백
 * @param delay - 롱프레스로 인식하는 지연 시간 (기본: 500ms)
 * @returns 엘리먼트에 바인딩할 이벤트 핸들러들
 *
 * @example
 * const handlers = useLongPress({
 *   onLongPress: () => alert('Long press!'),
 *   delay: 800,
 * });
 *
 * return <div {...handlers}>Press and hold</div>;
 */
export const useLongPress = ({
  onLongPress,
  delay = 500,
}: UseLongPressProps) => {
  // ========================================
  // Refs
  // ========================================

  /** 롱프레스 타이머 */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 롱프레스 완료 여부 */
  const isLongPressRef = useRef(false);

  /** 시작 위치 (이동 거리 계산용) */
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  /** 드래그로 간주하는 이동 임계값 (px) */
  const moveThreshold = 10;

  // ========================================
  // 시작 핸들러
  // ========================================

  /**
   * 터치/마우스 다운 핸들러
   *
   * 1. 롱프레스 상태 초기화
   * 2. 시작 위치 저장
   * 3. 롱프레스 타이머 시작
   */
  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      isLongPressRef.current = false;

      // 시작 위치 저장 (터치 이벤트와 마우스 이벤트 구분)
      if ('touches' in e) {
        startPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      } else {
        startPosRef.current = {
          x: e.clientX,
          y: e.clientY
        };
      }

      // 롱프레스 타이머 시작
      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
      }, delay);
    },
    [onLongPress, delay]
  );

  // ========================================
  // 이동 핸들러
  // ========================================

  /**
   * 터치/마우스 이동 핸들러
   *
   * 이동 거리가 임계값(10px)을 초과하면 롱프레스를 취소합니다.
   * 이는 의도한 드래그 동작과 롱프레스를 구분하기 위함입니다.
   */
  const move = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!startPosRef.current) return;

      // 현재 위치 가져오기 (터치/마우스 구분)
      let currentX: number;
      let currentY: number;

      if ('touches' in e) {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
      } else {
        currentX = e.clientX;
        currentY = e.clientY;
      }

      // 이동 거리 계산
      const deltaX = Math.abs(currentX - startPosRef.current.x);
      const deltaY = Math.abs(currentY - startPosRef.current.y);

      // 임계값 초과 시 롱프레스 취소 (드래그로 간주)
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    },
    []
  );

  // ========================================
  // 종료 핸들러
  // ========================================

  /**
   * 터치/마우스 업 또는 이탈 핸들러
   *
   * 타이머를 클리어하고 상태를 초기화합니다.
   */
  const clear = useCallback(
    () => {
      // 타이머 클리어
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      startPosRef.current = null;
    },
    []
  );

  // ========================================
  // 롱프레스 상태 확인
  // ========================================

  /**
   * 현재 롱프레스가 완료되었는지 확인
   *
   * @returns 롱프레스 완료 여부
   */
  const isLongPress = useCallback(() => {
    return isLongPressRef.current;
  }, []);

  // ========================================
  // 반환: 이벤트 핸들러 바인딩
  // ========================================

  return {
    /** 마우스 다운 핸들러 */
    onMouseDown: start,

    /** 마우스 이동 핸들러 */
    onMouseMove: move,

    /** 마우스 업 핸들러 */
    onMouseUp: clear,

    /** 마우스 이탈 핸들러 */
    onMouseLeave: clear,

    /** 터치 시작 핸들러 */
    onTouchStart: start,

    /** 터치 이동 핸들러 */
    onTouchMove: move,

    /** 터치 종료 핸들러 */
    onTouchEnd: clear,

    /** 롱프레스 완료 여부 확인 함수 */
    isLongPress,
  };
};
