import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { StickerItem, StickerAnimationType } from '../types/golf';

interface StickerPanelProps {
  onAdd: (sticker: StickerSettings) => void;
  onClose: () => void;
  editingSticker?: StickerSettings;
}

export interface StickerSettings {
  id?: string;
  stickerId: string;
  name: string;
  emoji: string;
  animation: StickerAnimationType;
  scale: number;
  position: { x: number; y: number };
  duration?: number;
  startTime?: number;
}

// 골프 테마 스티커 라이브러리
const STICKER_LIBRARY: StickerItem[] = [
  // 골프 카테고리
  { id: 'good-shot', name: '굿샷', emoji: '🏌️', animation: 'bounce', category: 'golf' },
  { id: 'nice-shot', name: '나이스샷', emoji: '👍', animation: 'pulse', category: 'golf' },
  { id: 'hole-in-one', name: '홀인원', emoji: '🕳️', animation: 'explode', category: 'golf' },
  { id: 'birdie', name: '버디', emoji: '🐦', animation: 'float', category: 'golf' },
  { id: 'eagle', name: '이글', emoji: '🦅', animation: 'zoom-in', category: 'golf' },
  { id: 'golf-ball', name: '골프공', emoji: '⛳', animation: 'spin', category: 'golf' },

  // 축하 카테고리
  { id: 'fireworks', name: '폭죽', emoji: '🎆', animation: 'explode', category: 'celebration' },
  { id: 'party', name: '파티', emoji: '🎉', animation: 'bounce', category: 'celebration' },
  { id: 'trophy', name: '트로피', emoji: '🏆', animation: 'sparkle', category: 'celebration' },
  { id: 'confetti', name: '색종이', emoji: '🎊', animation: 'explode', category: 'celebration' },
  { id: 'clap', name: '박수', emoji: '👏', animation: 'shake', category: 'celebration' },
  { id: 'star', name: '스타', emoji: '⭐', animation: 'sparkle', category: 'celebration' },

  // 감정 카테고리
  { id: 'heart', name: '하트', emoji: '❤️', animation: 'pulse', category: 'emotion' },
  { id: 'fire', name: '불꽃', emoji: '🔥', animation: 'shake', category: 'emotion' },
  { id: 'thumbs-up', name: '최고', emoji: '👍', animation: 'bounce', category: 'emotion' },
  { id: 'wow', name: '와우', emoji: '😮', animation: 'zoom-in', category: 'emotion' },
  { id: 'cool', name: '쿨', emoji: '😎', animation: 'float', category: 'emotion' },
  { id: 'strong', name: '힘', emoji: '💪', animation: 'pulse', category: 'emotion' },

  // 효과 카테고리
  { id: 'bomb', name: '폭탄', emoji: '💣', animation: 'explode', category: 'effect' },
  { id: 'lightning', name: '번개', emoji: '⚡', animation: 'shake', category: 'effect' },
  { id: 'sparkles', name: '반짝', emoji: '✨', animation: 'sparkle', category: 'effect' },
  { id: 'boom', name: '붐', emoji: '💥', animation: 'explode', category: 'effect' },
  { id: 'arrow', name: '화살', emoji: '🎯', animation: 'zoom-in', category: 'effect' },
  { id: 'crown', name: '왕관', emoji: '👑', animation: 'float', category: 'effect' },
];

const CATEGORIES = [
  { id: 'golf', name: '골프' },
  { id: 'celebration', name: '축하' },
  { id: 'emotion', name: '감정' },
  { id: 'effect', name: '효과' },
];

// 애니메이션 프리뷰 variants
const getAnimationVariants = (animation: StickerAnimationType) => {
  switch (animation) {
    case 'bounce':
      return {
        animate: {
          y: [0, -10, 0],
          transition: { repeat: Infinity, duration: 0.6 }
        }
      };
    case 'pulse':
      return {
        animate: {
          scale: [1, 1.2, 1],
          transition: { repeat: Infinity, duration: 0.8 }
        }
      };
    case 'shake':
      return {
        animate: {
          x: [-2, 2, -2, 2, 0],
          transition: { repeat: Infinity, duration: 0.4 }
        }
      };
    case 'spin':
      return {
        animate: {
          rotate: [0, 360],
          transition: { repeat: Infinity, duration: 2, ease: 'linear' }
        }
      };
    case 'explode':
      return {
        animate: {
          scale: [1, 1.3, 1],
          opacity: [1, 0.8, 1],
          transition: { repeat: Infinity, duration: 0.5 }
        }
      };
    case 'float':
      return {
        animate: {
          y: [0, -5, 0],
          transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
        }
      };
    case 'zoom-in':
      return {
        animate: {
          scale: [0.8, 1.1, 1],
          transition: { repeat: Infinity, duration: 1 }
        }
      };
    case 'sparkle':
      return {
        animate: {
          opacity: [1, 0.5, 1],
          scale: [1, 1.1, 1],
          transition: { repeat: Infinity, duration: 0.8 }
        }
      };
    default:
      return {};
  }
};

export const StickerPanel: React.FC<StickerPanelProps> = ({ onAdd, onClose, editingSticker }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('golf');
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(
    editingSticker
      ? STICKER_LIBRARY.find(s => s.id === editingSticker.stickerId) || null
      : null
  );
  const [scale, setScale] = useState(editingSticker?.scale || 1);
  const [position, setPosition] = useState(editingSticker?.position || { x: 50, y: 50 });
  const [duration, setDuration] = useState(editingSticker?.duration || 3);

  // ESC 키로 패널 닫기
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredStickers = STICKER_LIBRARY.filter(s => s.category === selectedCategory);

  const handleAdd = () => {
    if (selectedSticker) {
      onAdd({
        id: editingSticker?.id,
        stickerId: selectedSticker.id,
        name: selectedSticker.name,
        emoji: selectedSticker.emoji,
        animation: selectedSticker.animation,
        scale,
        position,
        duration,
      });
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-900/95 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full bg-[#2c3441] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">스티커 추가</h3>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-6 py-6 space-y-6">
            {/* Selected Sticker Preview with Position */}
            {selectedSticker && (
              <div className="relative bg-[#3d4554] rounded-2xl overflow-hidden" style={{ height: '160px' }}>
                {/* Position indicator grid */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-400" />
                </div>
                {/* Sticker preview at position */}
                <motion.div
                  {...getAnimationVariants(selectedSticker.animation)}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${48 * scale}px`,
                  }}
                >
                  {selectedSticker.emoji}
                </motion.div>
                {/* Info overlay */}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <p className="text-white font-medium text-sm">{selectedSticker.name}</p>
                  <p className="text-gray-400 text-xs">
                    {selectedSticker.animation} | {duration}초
                  </p>
                </div>
              </div>
            )}

            {/* Category Tabs */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">카테고리</h4>
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-pink-500 text-white'
                        : 'bg-[#3d4554] text-gray-300 hover:bg-[#4a5262]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sticker Grid */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">스티커 선택</h4>
              <div className="grid grid-cols-4 gap-3">
                {filteredStickers.map((sticker) => (
                  <motion.button
                    key={sticker.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSticker(sticker)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                      selectedSticker?.id === sticker.id
                        ? 'bg-pink-500 ring-2 ring-pink-400'
                        : 'bg-[#3d4554] hover:bg-[#4a5262]'
                    }`}
                  >
                    <motion.span
                      className="text-3xl mb-1"
                      {...(selectedSticker?.id === sticker.id ? getAnimationVariants(sticker.animation) : {})}
                    >
                      {sticker.emoji}
                    </motion.span>
                    <span className="text-xs text-gray-300 truncate w-full px-1 text-center">
                      {sticker.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Scale Slider */}
            {selectedSticker && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-400">크기</h4>
                  <span className="text-base text-pink-500 font-semibold">{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#3d4554] rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50%</span>
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>
            )}

            {/* Position Controls */}
            {selectedSticker && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3">위치</h4>
                <div className="space-y-4">
                  {/* X Position */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">가로 (X)</span>
                      <span className="text-sm text-pink-500 font-semibold">{position.x}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={position.x}
                      onChange={(e) => setPosition({ ...position, x: parseInt(e.target.value) })}
                      className="w-full h-2 bg-[#3d4554] rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>왼쪽</span>
                      <span>중앙</span>
                      <span>오른쪽</span>
                    </div>
                  </div>
                  {/* Y Position */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">세로 (Y)</span>
                      <span className="text-sm text-pink-500 font-semibold">{position.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={position.y}
                      onChange={(e) => setPosition({ ...position, y: parseInt(e.target.value) })}
                      className="w-full h-2 bg-[#3d4554] rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>위</span>
                      <span>중앙</span>
                      <span>아래</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Duration Slider */}
            {selectedSticker && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-400">표시 시간</h4>
                  <span className="text-base text-pink-500 font-semibold">{duration}초</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#3d4554] rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5초</span>
                  <span>5초</span>
                  <span>10초</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-700 bg-[#2c3441]">
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-4 rounded-xl bg-[#3d4554] text-white font-semibold hover:bg-[#4a5262]"
            >
              취소
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              disabled={!selectedSticker}
              className="flex-1 py-4 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingSticker ? '수정' : '추가'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
