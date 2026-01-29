import { useEffect, useRef } from 'react';

/**
 * Custom hook to enable touch/pointer scrolling with custom implementation
 * Implements both touch scroll and mouse drag scroll using Pointer Events
 * @returns ref to attach to the scrollable element
 */
export const useTouchScroll = <T extends HTMLElement>() => {
  const scrollRef = useRef<T>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const velocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // Prevent wheel scrolling
    const preventWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    // [시작] Pointer Down
    const handlePointerDown = (e: PointerEvent) => {
      // 버튼, 링크, 입력 요소 클릭은 스크롤 동작 무시
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select')
      ) {
        return;
      }

      isDragging.current = true;
      startY.current = e.clientY;
      lastY.current = e.clientY;
      startScrollTop.current = scrollElement.scrollTop;
      velocity.current = 0;
      lastTime.current = Date.now();
      scrollElement.setPointerCapture(e.pointerId);
    };

    // [이동] Pointer Move
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      const currentY = e.clientY;
      const currentTime = Date.now();

      // [계산] Delta 산출
      const delta = startY.current - currentY;

      // [반영] 스크롤 업데이트
      scrollElement.scrollTop = startScrollTop.current + delta;

      // 속도 계산 (관성 스크롤용)
      const timeDelta = currentTime - lastTime.current;
      if (timeDelta > 0) {
        velocity.current = (currentY - lastY.current) / timeDelta;
      }

      lastY.current = currentY;
      lastTime.current = currentTime;
    };

    // [종료] Pointer Up
    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging.current) return;

      isDragging.current = false;
      scrollElement.releasePointerCapture(e.pointerId);

      // [관성 스크롤] Inertia Scroll
      const inertiaScroll = () => {
        if (Math.abs(velocity.current) < 0.1) return;

        scrollElement.scrollTop -= velocity.current * 16; // ~60fps
        velocity.current *= 0.95; // 감속

        requestAnimationFrame(inertiaScroll);
      };

      if (Math.abs(velocity.current) > 0.5) {
        requestAnimationFrame(inertiaScroll);
      }
    };

    scrollElement.addEventListener('wheel', preventWheel, { passive: false });
    scrollElement.addEventListener('pointerdown', handlePointerDown);
    scrollElement.addEventListener('pointermove', handlePointerMove);
    scrollElement.addEventListener('pointerup', handlePointerUp);
    scrollElement.addEventListener('pointercancel', handlePointerUp);

    return () => {
      scrollElement.removeEventListener('wheel', preventWheel);
      scrollElement.removeEventListener('pointerdown', handlePointerDown);
      scrollElement.removeEventListener('pointermove', handlePointerMove);
      scrollElement.removeEventListener('pointerup', handlePointerUp);
      scrollElement.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  return scrollRef;
};
