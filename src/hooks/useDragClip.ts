import { useCallback, useRef, useState, useEffect } from 'react';

interface UseDragClipProps {
  clipId: string;
  initialPosition: number;
  zoom: number;
  pixelsPerSecond: number;
  onMove: (clipId: string, newPosition: number) => void;
  onSelect: (clipId: string) => void;
  longPressDelay?: number; // 롱프레스 지연 시간 (ms)
}

/**
 * 클립 드래그 로직을 처리하는 커스텀 훅
 * 
 * 롱프레스(3초) 후 드래그로 클립 이동
 * 모바일 터치 이벤트 우선 처리 + 스크롤 방지
 */
export const useDragClip = ({
  clipId,
  initialPosition,
  zoom,
  pixelsPerSecond,
  onMove,
  onSelect,
  longPressDelay = 500, // 기본 0.5초로 단축
}: UseDragClipProps) => {
  const [isDraggable, setIsDraggable] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const isDraggableRef = useRef(false); // ✅ ref 추가 (즉시 반영)
  const elementRef = useRef<HTMLElement | null>(null);

  // 터치 이벤트 핸들러 (모바일 우선)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 트림 핸들러는 제외
    const target = e.target as HTMLElement;
    if (target.closest('.trim-handle')) {
      console.log('[DragClip] 트림 핸들러 감지, 드래그 취소');
      return;
    }
    
    console.log('[DragClip] 터치 시작, 롱프레스 타이머 시작');
    console.log('[DragClip] 시작 시 클립 position:', initialPosition);
    elementRef.current = target;
    onSelect(clipId);
    
    // 시작 위치와 초기 position 저장
    const touch = e.touches[0];
    const startPosition = initialPosition; // 드래그 시작 시점의 position 고정
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    isDraggingRef.current = false;

    // 진행률 표시 시작
    setLongPressProgress(0);
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / longPressDelay) * 100, 100);
      setLongPressProgress(progress);
    }, 50); // 50ms마다 업데이트

    // 롱프레스 타이머 시작
    longPressTimerRef.current = setTimeout(() => {
      console.log('[DragClip] ✅ 롱프레스 완료! 드래그 모드 활성화');
      isDraggableRef.current = true; // ✅ ref 즉시 업데이트
      setIsDraggable(true); // state 업데이트 (UI용)
      setLongPressProgress(100);
      // 진행률 인터벌 정리
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      // 햅틱 피드백
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    }, longPressDelay);

    // Non-passive 터치 무브 리스너
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!startPosRef.current) return;

      const touch = moveEvent.touches[0];
      const deltaX = touch.clientX - startPosRef.current.x;
      const deltaY = touch.clientY - startPosRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 15px 이상 이동 시 롱프레스 취소 (단, 이미 드래그 모드가 아닐 때만)
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

      // 드래그 가능 상태이면 이동 (✅ ref 체크로 즉시 반영)
      if (isDraggableRef.current || isDraggingRef.current) {
        if (!isDraggingRef.current) {
          console.log('[DragClip] 🎯 드래그 시작!');
          console.log('[DragClip] isDraggable:', isDraggable);
          console.log('[DragClip] 드래그 시작 위치:', { deltaX, deltaY, distance });
        }
        moveEvent.preventDefault(); // 스크롤 방지 (non-passive)
        moveEvent.stopPropagation();
        isDraggingRef.current = true;
        
        const deltaTime = deltaX / (pixelsPerSecond * zoom);
        const newPosition = startPosition + deltaTime; // ✅ 고정된 시작 위치 사용
        console.log('[DragClip] 이동 중:', { 
          startPosition: startPosition.toFixed(2),
          deltaTime: deltaTime.toFixed(2), 
          newPosition: newPosition.toFixed(2) 
        });
        onMove(clipId, newPosition);
      }
    };

    const handleTouchEnd = () => {
      console.log('[DragClip] 터치 종료');
      console.log('[DragClip] 종료 시 상태 - isDraggable:', isDraggable, 'isDragging:', isDraggingRef.current);
      
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
      
      setIsDraggable(false);
      setLongPressProgress(0);
      isDraggingRef.current = false;
      startPosRef.current = null;
      
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };

    // Non-passive 리스너로 등록 (preventDefault 가능하도록)
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  }, [clipId, initialPosition, zoom, pixelsPerSecond, onMove, onSelect, isDraggable, longPressDelay]);

  // 마우스 이벤트 핸들러 (데스크톱)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 트림 핸들러는 제외
    const target = e.target as HTMLElement;
    if (target.closest('.trim-handle')) {
      console.log('[DragClip] 트림 핸들러 감지, 드래그 취소');
      return;
    }
    
    console.log('[DragClip] 마우스 다운, 롱프레스 타이머 시작');
    console.log('[DragClip] 시작 시 클립 position:', initialPosition);
    e.stopPropagation();
    onSelect(clipId);
    
    // 시작 위치와 초기 position 저장
    const startPosition = initialPosition; // 드래그 시작 시점의 position 고정
    startPosRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;

    // 진행률 표시 시작
    setLongPressProgress(0);
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / longPressDelay) * 100, 100);
      setLongPressProgress(progress);
    }, 50);

    // 롱프레스 타이머 시작
    longPressTimerRef.current = setTimeout(() => {
      console.log('[DragClip] ✅ 롱프레스 완료! 드래그 모드 활성화');
      isDraggableRef.current = true; // ✅ ref 즉시 업데이트
      setIsDraggable(true); // state 업데이트 (UI용)
      setLongPressProgress(100);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, longPressDelay);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!startPosRef.current) return;

      const deltaX = moveEvent.clientX - startPosRef.current.x;
      const deltaY = moveEvent.clientY - startPosRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 15px 이상 이동 시 롱프레스 취소 (단, 이미 드래그 모드가 아닐 때만)
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

      // 드래그 가능 상태이면 이동 (✅ ref 체크로 즉시 반영)
      if (isDraggableRef.current || isDraggingRef.current) {
        if (!isDraggingRef.current) {
          console.log('[DragClip] 🎯 드래그 시작! (마우스)');
          console.log('[DragClip] isDraggable:', isDraggable);
        }
        moveEvent.preventDefault();
        isDraggingRef.current = true;
        const deltaTime = deltaX / (pixelsPerSecond * zoom);
        const newPosition = startPosition + deltaTime; // ✅ 고정된 시작 위치 사용
        console.log('[DragClip] 이동 중:', { 
          startPosition: startPosition.toFixed(2),
          deltaTime: deltaTime.toFixed(2), 
          newPosition: newPosition.toFixed(2) 
        });
        onMove(clipId, newPosition);
      }
    };

    const handleMouseUp = () => {
      console.log('[DragClip] 마우스 업');
      console.log('[DragClip] 종료 시 상태 - isDraggable:', isDraggable, 'isDragging:', isDraggingRef.current);
      
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
      
      setIsDraggable(false);
      setLongPressProgress(0);
      isDraggingRef.current = false;
      startPosRef.current = null;
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [clipId, initialPosition, zoom, pixelsPerSecond, onMove, onSelect, isDraggable, longPressDelay]);

  // 컴포넌트 언마운트 시 타이머 정리
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

  return { 
    handleMouseDown,
    handleTouchStart,
    isDraggable,
    longPressProgress, // 진행률 추가
  };
};
