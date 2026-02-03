import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TextAnimationType } from '../types/golf';

interface TextPanelProps {
  onAdd: (text: TextSettings) => void;
  onClose: () => void;
  editingText?: TextSettings;
}

export interface TextSettings {
  id?: string;
  content: string;
  font: string;
  fontSize: number;
  color: string;
  align: 'left' | 'center' | 'right';
  style: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
  animation: TextAnimationType;
  position: { x: number; y: number };
  duration?: number;
  startTime?: number;
}

const FONTS = [
  { id: 'noto-sans', name: 'Noto Sans', preview: 'Aa' },
  { id: 'nanum-gothic', name: '나눔고딕', preview: '가나' },
  { id: 'nanum-myeongjo', name: '나눔명조', preview: '가나' },
  { id: 'roboto', name: 'Roboto', preview: 'Aa' },
  { id: 'montserrat', name: 'Montserrat', preview: 'Aa' },
  { id: 'playfair', name: 'Playfair', preview: 'Aa' },
];

const COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
];

const ANIMATIONS: { id: TextAnimationType; name: string; icon: string }[] = [
  { id: 'none', name: '없음', icon: '−' },
  { id: 'fade-in', name: '페이드 인', icon: '◐' },
  { id: 'fade-out', name: '페이드 아웃', icon: '◑' },
  { id: 'slide-up', name: '아래→위', icon: '↑' },
  { id: 'slide-down', name: '위→아래', icon: '↓' },
  { id: 'slide-left', name: '오른→왼', icon: '←' },
  { id: 'slide-right', name: '왼→오른', icon: '→' },
  { id: 'zoom-in', name: '확대', icon: '⊕' },
  { id: 'bounce', name: '바운스', icon: '⌁' },
  { id: 'typewriter', name: '타자기', icon: '⌨' },
  { id: 'glow', name: '글로우', icon: '✦' },
];

export const TextPanel: React.FC<TextPanelProps> = ({ onAdd, onClose, editingText }) => {
  const [text, setText] = useState<TextSettings>(
    editingText || {
      content: '',
      font: 'noto-sans',
      fontSize: 32,
      color: '#FFFFFF',
      align: 'center',
      style: { bold: false, italic: false, underline: false },
      animation: 'fade-in',
      position: { x: 50, y: 50 },
    }
  );

  const [activeTab, setActiveTab] = useState<'style' | 'animation'>('style');

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

  const handleAdd = () => {
    if (text.content.trim()) {
      onAdd(text);
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
          <h3 className="text-lg font-bold text-white">텍스트 추가</h3>
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
            {/* Text Input - 항상 상단에 표시 */}
            <div>
              <textarea
                value={text.content}
                onChange={(e) => setText({ ...text, content: e.target.value })}
                placeholder="텍스트를 입력하세요"
                className="w-full h-28 px-4 py-3 bg-[#3d4554] border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-golf-green resize-none text-base"
                autoFocus
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-3 rounded-xl text-base font-semibold transition-colors ${
                  activeTab === 'style' 
                    ? 'bg-white/10 text-white border-2 border-white/20' 
                    : 'bg-transparent text-gray-400 border-2 border-transparent'
                }`}
              >
                스타일
              </button>
              <button
                onClick={() => setActiveTab('animation')}
                className={`flex-1 py-3 rounded-xl text-base font-semibold transition-colors ${
                  activeTab === 'animation' 
                    ? 'bg-white/10 text-white border-2 border-white/20' 
                    : 'bg-transparent text-gray-400 border-2 border-transparent'
                }`}
              >
                애니메이션
              </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'style' ? (
                <motion.div
                  key="style"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Font Selection */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">폰트</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {FONTS.map((font) => (
                        <motion.button
                          key={font.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setText({ ...text, font: font.id })}
                          className={`p-2 rounded-xl text-center transition-colors ${
                            text.font === font.id
                              ? 'bg-golf-green text-white'
                              : 'bg-[#3d4554] text-gray-300 hover:bg-[#4a5262]'
                          }`}
                        >
                          <div className="text-lg mb-0.5">{font.preview}</div>
                          <div className="text-xs truncate">{font.name}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-400">크기</h4>
                      <span className="text-base text-golf-green font-semibold">{text.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="72"
                      step="2"
                      value={text.fontSize}
                      onChange={(e) => setText({ ...text, fontSize: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-[#3d4554] rounded-lg appearance-none cursor-pointer accent-golf-green"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">색상</h4>
                    <div className="grid grid-cols-5 gap-3">
                      {COLORS.map((color) => (
                        <motion.button
                          key={color}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setText({ ...text, color })}
                          className={`aspect-square rounded-xl border-2 transition-all ${
                            text.color === color ? 'border-white scale-110' : 'border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {text.color === color && (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={color === '#FFFFFF' ? '#000000' : '#FFFFFF'}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="animation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Animation Selection */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">등장 효과</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {ANIMATIONS.map((animation) => (
                        <motion.button
                          key={animation.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setText({ ...text, animation: animation.id })}
                          className={`py-3 px-2 rounded-xl transition-colors ${
                            text.animation === animation.id
                              ? 'bg-golf-green text-white'
                              : 'bg-[#3d4554] text-gray-300 hover:bg-[#4a5262]'
                          }`}
                        >
                          <div className="text-lg mb-0.5">{animation.icon}</div>
                          <div className="text-xs font-medium truncate">{animation.name}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              disabled={!text.content.trim()}
              className="flex-1 py-4 rounded-xl bg-golf-green text-white font-semibold hover:bg-golf-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingText ? '수정' : '추가'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
