import { useCallback, useRef } from 'react';

interface UseLongPressProps {
  onLongPress: () => void;
  delay?: number; // 롱프레스 인식 시간 (ms)
}

/**
 * 롱프레스 제스처를 처리하는 훅
 *
 * @param onLongPress - 롱프레스 시 실행할 콜백
 * @param delay - 롱프레스로 인식하는 지연 시간 (기본: 500ms)
 * @returns 엘리먼트에 바인딩할 이벤트 핸들러들
 */
export const useLongPress = ({
  onLongPress,
  delay = 500,
}: UseLongPressProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const moveThreshold = 10; // 10px 이상 이동 시 드래그로 간주

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      isLongPressRef.current = false;

      // 시작 위치 저장
      if ('touches' in e) {
        startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else {
        startPosRef.current = { x: e.clientX, y: e.clientY };
      }

      // 타이머 시작
      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
      }, delay);
    },
    [onLongPress, delay]
  );

  const move = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!startPosRef.current) return;

      // 이동 거리 계산
      let currentX, currentY;
      if ('touches' in e) {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
      } else {
        currentX = e.clientX;
        currentY = e.clientY;
      }

      const deltaX = Math.abs(currentX - startPosRef.current.x);
      const deltaY = Math.abs(currentY - startPosRef.current.y);

      // 임계값 이상 이동 시 롱프레스 취소 (드래그로 간주)
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    },
    []
  );

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

  const isLongPress = useCallback(() => {
    return isLongPressRef.current;
  }, []);

  return {
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: clear,
    isLongPress,
  };
};
