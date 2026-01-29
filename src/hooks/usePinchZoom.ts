import { useEffect, RefObject } from 'react';

interface UsePinchZoomProps {
  ref: RefObject<HTMLElement>;
  currentZoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomChange: (newZoom: number) => void;
}

/**
 * 핀치 줌 제스처를 처리하는 훅
 *
 * 터치스크린에서 두 손가락으로 핀치 줌을 수행할 수 있습니다.
 */
export const usePinchZoom = ({
  ref,
  currentZoom,
  minZoom,
  maxZoom,
  onZoomChange,
}: UsePinchZoomProps) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let initialDistance = 0;
    let initialZoom = currentZoom;

    const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
        initialZoom = currentZoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();

        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;

        // 줌 레벨 계산 (초기 줌 * 스케일 비율)
        let newZoom = initialZoom * scale;

        // 최소/최대 줌 제한
        newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));

        // 0.25 단위로 스냅
        newZoom = Math.round(newZoom / 0.25) * 0.25;

        if (newZoom !== currentZoom) {
          onZoomChange(newZoom);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDistance = 0;
      }
    };

    // 핀치 줌을 위해 passive: false 설정 (기본 동작 방지)
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, currentZoom, minZoom, maxZoom, onZoomChange]);
};
