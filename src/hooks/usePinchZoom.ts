/**
 * @file usePinchZoom.ts
 * @description 핀치 줌 제스처 처리 훅
 *
 * 터치스크린에서 두 손가락을 사용한 핀치 줌 제스처를 감지하고
 * 줌 레벨을 조절합니다.
 *
 * ## 주요 기능
 * 1. 두 손가락 터치 감지
 * 2. 핀치 인/아웃으로 줌 레벨 조절
 * 3. 최소/최대 줌 레벨 제한
 * 4. 0.25 단위로 줌 스냅
 *
 * ## 동작 원리
 * ```
 * 초기 두 손가락 거리: 100px
 * 핀치 아웃 후 거리: 150px
 * 스케일 = 150 / 100 = 1.5
 * 새 줌 레벨 = 초기 줌 * 1.5
 * ```
 *
 * ## 사용 예시
 * ```tsx
 * const timelineRef = useRef<HTMLDivElement>(null);
 * const [zoom, setZoom] = useState(1);
 *
 * usePinchZoom({
 *   ref: timelineRef,
 *   currentZoom: zoom,
 *   minZoom: 0.5,
 *   maxZoom: 3,
 *   onZoomChange: setZoom,
 * });
 * ```
 */

import { useEffect, RefObject } from 'react';

// ============================================================================
// Props 인터페이스
// ============================================================================

/**
 * usePinchZoom 훅의 Props
 */
interface UsePinchZoomProps {
  /** 핀치 줌을 적용할 요소의 ref */
  ref: RefObject<HTMLElement>;

  /** 현재 줌 레벨 */
  currentZoom: number;

  /** 최소 줌 레벨 (기본 0.5) */
  minZoom: number;

  /** 최대 줌 레벨 (기본 3) */
  maxZoom: number;

  /** 줌 레벨 변경 콜백 */
  onZoomChange: (newZoom: number) => void;
}

// ============================================================================
// 커스텀 훅
// ============================================================================

/**
 * 핀치 줌 제스처를 처리하는 훅
 *
 * 터치스크린에서 두 손가락으로 핀치 인/아웃하여 줌을 조절합니다.
 *
 * @param props - 핀치 줌 설정 옵션
 *
 * @example
 * usePinchZoom({
 *   ref: containerRef,
 *   currentZoom: 1,
 *   minZoom: 0.5,
 *   maxZoom: 3,
 *   onZoomChange: (zoom) => setZoom(zoom),
 * });
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

    // ========================================
    // 상태 변수
    // ========================================

    /** 핀치 시작 시 두 손가락 사이 거리 */
    let initialDistance = 0;

    /** 핀치 시작 시 줌 레벨 */
    let initialZoom = currentZoom;

    // ========================================
    // 유틸리티 함수
    // ========================================

    /**
     * 두 터치 포인트 사이의 거리 계산
     *
     * 피타고라스 정리를 사용하여 두 점 사이의 유클리드 거리를 계산합니다.
     *
     * @param touch1 - 첫 번째 터치 포인트
     * @param touch2 - 두 번째 터치 포인트
     * @returns 두 점 사이의 거리 (px)
     */
    const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // ========================================
    // 터치 시작 핸들러
    // ========================================

    /**
     * 터치 시작 이벤트 처리
     *
     * 두 손가락이 동시에 터치되면 핀치 줌 시작
     */
    const handleTouchStart = (e: TouchEvent) => {
      // 두 손가락 터치인 경우에만 처리
      if (e.touches.length === 2) {
        // 기본 동작 방지 (페이지 확대/축소 방지)
        e.preventDefault();

        // 초기 거리 및 줌 저장
        initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
        initialZoom = currentZoom;
      }
    };

    // ========================================
    // 터치 이동 핸들러
    // ========================================

    /**
     * 터치 이동 이벤트 처리
     *
     * 1. 현재 두 손가락 거리 측정
     * 2. 초기 거리와의 비율(scale) 계산
     * 3. 새 줌 레벨 계산 및 적용
     */
    const handleTouchMove = (e: TouchEvent) => {
      // 두 손가락 터치인 경우에만 처리
      if (e.touches.length === 2) {
        e.preventDefault();

        // 현재 두 손가락 사이 거리
        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);

        // 스케일 비율 계산 (1보다 크면 핀치 아웃, 작으면 핀치 인)
        const scale = currentDistance / initialDistance;

        // 새 줌 레벨 계산
        let newZoom = initialZoom * scale;

        // 최소/최대 줌 제한
        newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));

        // 0.25 단위로 스냅 (부드러운 단계별 줌)
        newZoom = Math.round(newZoom / 0.25) * 0.25;

        // 줌 레벨이 변경된 경우에만 콜백 호출
        if (newZoom !== currentZoom) {
          onZoomChange(newZoom);
        }
      }
    };

    // ========================================
    // 터치 종료 핸들러
    // ========================================

    /**
     * 터치 종료 이벤트 처리
     *
     * 손가락이 2개 미만이 되면 핀치 줌 종료
     */
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        // 핀치 상태 초기화
        initialDistance = 0;
      }
    };

    // ========================================
    // 이벤트 리스너 등록
    // ========================================

    // passive: false로 설정하여 preventDefault 가능하게 함
    // (기본 페이지 확대/축소 동작 방지)
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    // ========================================
    // 클린업
    // ========================================

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, currentZoom, minZoom, maxZoom, onZoomChange]);
};
