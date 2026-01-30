import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TimelineItem } from '../types/golf';

interface DraggableOverlayProps {
  clip: TimelineItem;
  type: 'text' | 'sticker';
  containerRef: React.RefObject<HTMLDivElement>;
  onPositionChange: (clipId: string, x: number, y: number) => void;
  isSelected: boolean;
  onSelect: (clipId: string) => void;
}

export const DraggableOverlay: React.FC<DraggableOverlayProps> = ({
  clip,
  type,
  containerRef,
  onPositionChange,
  isSelected,
  onSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // 현재 위치 (퍼센트)
  const currentX = type === 'text'
    ? (clip.textPosition?.x ?? 50)
    : (clip.stickerPosition?.x ?? 50);
  const currentY = type === 'text'
    ? (clip.textPosition?.y ?? 50)
    : (clip.stickerPosition?.y ?? 50);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onSelect(clip.id);

    const container = containerRef.current;
    if (!container) return;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: currentX,
      startY: currentY,
    };

    setIsDragging(true);

    // 요소에 포인터 캡처 설정
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [clip.id, containerRef, currentX, currentY, onSelect]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // 이동 거리를 퍼센트로 변환
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

    // 새 위치 계산 (0-100 범위로 제한)
    const newX = Math.max(5, Math.min(95, dragStartRef.current.startX + deltaX));
    const newY = Math.max(5, Math.min(95, dragStartRef.current.startY + deltaY));

    onPositionChange(clip.id, newX, newY);
  }, [isDragging, containerRef, clip.id, onPositionChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    dragStartRef.current = null;

    // 포인터 캡처 해제
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, [isDragging]);

  // 텍스트 스타일
  const textStyle: React.CSSProperties = type === 'text' ? {
    fontSize: `${(clip.textFontSize || 32) / 2}px`,
    color: clip.textColor || '#FFFFFF',
    fontWeight: clip.textBold ? 'bold' : 'normal',
    fontStyle: clip.textItalic ? 'italic' : 'normal',
    textDecoration: clip.textUnderline ? 'underline' : 'none',
    textAlign: clip.textAlign || 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
    maxWidth: '80%',
    wordBreak: 'keep-all',
  } : {};

  // 스티커 스타일
  const stickerStyle: React.CSSProperties = type === 'sticker' ? {
    fontSize: `${32 * (clip.stickerScale || 1)}px`,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
  } : {};

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: type === 'sticker' ? (clip.stickerScale || 1) : 1,
        // 스티커 애니메이션 (드래그 중이 아닐 때만)
        ...(type === 'sticker' && !isDragging && clip.stickerAnimation === 'bounce' && {
          y: [0, -10, 0],
          transition: { repeat: Infinity, duration: 0.6 }
        }),
        ...(type === 'sticker' && !isDragging && clip.stickerAnimation === 'pulse' && {
          scale: [(clip.stickerScale || 1), (clip.stickerScale || 1) * 1.2, (clip.stickerScale || 1)],
          transition: { repeat: Infinity, duration: 0.8 }
        }),
        ...(type === 'sticker' && !isDragging && clip.stickerAnimation === 'float' && {
          y: [0, -5, 0],
          transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
        }),
      }}
      className={`absolute cursor-move touch-none select-none ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${isDragging ? 'z-50' : 'z-10'}`}
      style={{
        left: `${currentX}%`,
        top: `${currentY}%`,
        transform: 'translate(-50%, -50%)',
        ...textStyle,
        ...stickerStyle,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 드래그 핸들 표시 (선택 시) */}
      {isSelected && (
        <div className="absolute -inset-2 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}

      {type === 'text' ? (
        <span>{clip.textContent}</span>
      ) : (
        <span>{clip.stickerEmoji}</span>
      )}
    </motion.div>
  );
};
