/**
 * @file useTouchScroll.ts
 * @description 터치/포인터 기반 커스텀 스크롤 훅
 *
 * 기본 브라우저 스크롤을 비활성화하고 커스텀 스크롤 로직을 구현합니다.
 *
 * ## 주요 기능
 * 1. 터치 드래그로 스크롤
 * 2. 마우스 드래그로 스크롤
 * 3. 관성 스크롤 (손가락을 떼면 천천히 감속)
 * 4. 버튼/링크/입력 요소 클릭 시 스크롤 방지
 *
 * ## 사용 예시
 * ```tsx
 * const scrollRef = useTouchScroll<HTMLDivElement>();
 *
 * return (
 *   <div ref={scrollRef} style={{ overflow: 'auto' }}>
 *     {content}
 *   </div>
 * );
 * ```
 *
 * ## Pointer Events 활용
 * 터치와 마우스 이벤트를 통합하는 Pointer Events API를 사용합니다.
 * - pointerdown: 터치 시작 또는 마우스 클릭
 * - pointermove: 드래그 중
 * - pointerup: 드래그 종료
 */

import { useEffect, useRef } from 'react';

/**
 * 터치/포인터 스크롤 커스텀 훅
 *
 * @template T - 스크롤 가능한 HTML 요소 타입
 * @returns 스크롤 요소에 연결할 ref
 *
 * @example
 * const scrollRef = useTouchScroll<HTMLDivElement>();
 * return <div ref={scrollRef}>{children}</div>;
 */
export const useTouchScroll = <T extends HTMLElement>() => {
  // ========================================
  // Refs
  // ========================================

  /** 스크롤 대상 요소 ref */
  const scrollRef = useRef<T>(null);

  /** 현재 드래그 중 여부 */
  const isDragging = useRef(false);

  /** 드래그 시작 Y 좌표 */
  const startY = useRef(0);

  /** 드래그 시작 시 scrollTop 값 */
  const startScrollTop = useRef(0);

  /** 관성 스크롤용 속도 (px/ms) */
  const velocity = useRef(0);

  /** 이전 프레임 Y 좌표 (속도 계산용) */
  const lastY = useRef(0);

  /** 이전 프레임 타임스탬프 (속도 계산용) */
  const lastTime = useRef(0);

  // ========================================
  // Effect: 이벤트 리스너 등록
  // ========================================

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // ========================================
    // 휠 스크롤 방지
    // ========================================

    /**
     * 마우스 휠 스크롤 비활성화
     * 커스텀 스크롤만 사용하기 위해 기본 동작 차단
     */
    const preventWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    // ========================================
    // 포인터 다운 (드래그 시작)
    // ========================================

    /**
     * 포인터 다운 이벤트 핸들러
     *
     * 버튼, 링크, 입력 요소 클릭 시에는 스크롤을 시작하지 않습니다.
     * 이는 해당 요소들의 기본 동작(클릭, 입력)을 보존하기 위함입니다.
     */
    const handlePointerDown = (e: PointerEvent) => {
      // 인터랙티브 요소는 스크롤 동작 제외
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

      // 드래그 시작 상태 설정
      isDragging.current = true;
      startY.current = e.clientY;
      lastY.current = e.clientY;
      startScrollTop.current = scrollElement.scrollTop;
      velocity.current = 0;
      lastTime.current = Date.now();

      // 포인터 캡처: 요소 밖으로 드래그해도 이벤트 수신
      scrollElement.setPointerCapture(e.pointerId);
    };

    // ========================================
    // 포인터 이동 (드래그 중)
    // ========================================

    /**
     * 포인터 이동 이벤트 핸들러
     *
     * 1. 드래그 거리(delta) 계산
     * 2. scrollTop 업데이트
     * 3. 속도 계산 (관성 스크롤용)
     */
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      const currentY = e.clientY;
      const currentTime = Date.now();

      // 드래그 거리 계산 (위로 드래그 = 아래로 스크롤)
      const delta = startY.current - currentY;

      // 스크롤 위치 업데이트
      scrollElement.scrollTop = startScrollTop.current + delta;

      // 속도 계산 (관성 스크롤용)
      const timeDelta = currentTime - lastTime.current;
      if (timeDelta > 0) {
        velocity.current = (currentY - lastY.current) / timeDelta;
      }

      // 다음 프레임을 위해 현재 값 저장
      lastY.current = currentY;
      lastTime.current = currentTime;
    };

    // ========================================
    // 포인터 업 (드래그 종료)
    // ========================================

    /**
     * 포인터 업 이벤트 핸들러
     *
     * 드래그 종료 후 관성 스크롤을 시작합니다.
     * 속도가 충분히 빠르면 (0.5 px/ms 이상) 관성 스크롤이 적용됩니다.
     */
    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging.current) return;

      isDragging.current = false;
      scrollElement.releasePointerCapture(e.pointerId);

      // ========================================
      // 관성 스크롤 (Inertia Scroll)
      // ========================================

      /**
       * 관성 스크롤 애니메이션
       *
       * - 속도가 0.1 미만이 되면 정지
       * - 매 프레임마다 속도의 95%로 감속 (마찰 계수)
       * - ~60fps로 동작 (16ms 간격)
       */
      const inertiaScroll = () => {
        // 충분히 느려지면 정지
        if (Math.abs(velocity.current) < 0.1) return;

        // 스크롤 적용 (16ms ≈ 1프레임)
        scrollElement.scrollTop -= velocity.current * 16;

        // 감속 (마찰)
        velocity.current *= 0.95;

        // 다음 프레임 예약
        requestAnimationFrame(inertiaScroll);
      };

      // 속도가 충분히 빠르면 관성 스크롤 시작
      if (Math.abs(velocity.current) > 0.5) {
        requestAnimationFrame(inertiaScroll);
      }
    };

    // ========================================
    // 이벤트 리스너 등록
    // ========================================

    // 휠 스크롤 방지 (passive: false로 preventDefault 가능)
    scrollElement.addEventListener('wheel', preventWheel, { passive: false });

    // 포인터 이벤트
    scrollElement.addEventListener('pointerdown', handlePointerDown);
    scrollElement.addEventListener('pointermove', handlePointerMove);
    scrollElement.addEventListener('pointerup', handlePointerUp);
    scrollElement.addEventListener('pointercancel', handlePointerUp);

    // ========================================
    // 클린업
    // ========================================

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
