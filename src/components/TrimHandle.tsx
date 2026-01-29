import React from 'react';

interface TrimHandleProps {
  side: 'left' | 'right';
  clipId: string;
  zoom: number;
  pixelsPerSecond: number;
  onTrim: (clipId: string, deltaTime: number) => void;
}

/**
 * 트림 핸들러 컴포넌트
 * 
 * 클립의 좌우에 표시되는 드래그 핸들러
 * 드래그하여 클립의 시작점 또는 끝점을 조절할 수 있음
 */
export const TrimHandle: React.FC<TrimHandleProps> = ({
  side,
  clipId,
  zoom,
  pixelsPerSecond,
  onTrim,
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / (pixelsPerSecond * zoom);
      onTrim(clipId, deltaTime);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    // preventDefault는 여기서 호출하지 않음 (passive 경고 방지)
    const startX = e.touches[0].clientX;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault(); // 스크롤 방지
      moveEvent.stopPropagation();
      const deltaX = moveEvent.touches[0].clientX - startX;
      const deltaTime = deltaX / (pixelsPerSecond * zoom);
      onTrim(clipId, deltaTime);
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  };

  return (
    <div
      className={`trim-handle absolute ${side}-0 top-0 bottom-0 w-8 hover:bg-white/20 cursor-ew-resize flex items-center justify-center z-10`}
      style={{
        [side]: '-12px', // 밖으로 확장하여 터치 영역 확대
        touchAction: 'none', // 모든 터치 제스처 차단
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="w-1 h-8 bg-white rounded-full shadow-lg" />
    </div>
  );
};
