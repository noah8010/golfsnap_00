import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { AspectRatio } from '../types/golf';
import { useTouchScroll } from '../hooks/useTouchScroll';

interface NewProjectStep1ScreenProps {
  onNext: (aspectRatio: AspectRatio) => void;
  onClose: () => void;
}

export const NewProjectStep1Screen: React.FC<NewProjectStep1ScreenProps> = ({ onNext, onClose }) => {
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio | null>(null);
  const scrollRef = useTouchScroll<HTMLDivElement>();

  const aspectRatios: Array<{
    ratio: AspectRatio;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      ratio: '16:9',
      label: '16:9',
      description: '유튜브 등 가로 영상',
      icon: (
        <div className="w-20 h-12 border-4 border-current rounded-lg" />
      ),
    },
    {
      ratio: '9:16',
      label: '9:16',
      description: '쇼츠, 릴스 등 세로 영상',
      icon: (
        <div className="w-12 h-20 border-4 border-current rounded-lg" />
      ),
    },
    {
      ratio: '1:1',
      label: '1:1',
      description: '인스타그램 피드',
      icon: (
        <div className="w-16 h-16 border-4 border-current rounded-lg" />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 safe-area-top">
        <h1 className="text-xl font-bold text-gray-900">화면 비율 선택</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <X className="w-6 h-6 text-gray-600" />
        </motion.button>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide touch-scroll px-4 py-8">
        <p className="text-sm text-gray-600 mb-8">
          프로젝트에 사용할 화면 비율을 선택하세요
        </p>

        <div className="space-y-4">
          {aspectRatios.map((item) => {
            const isSelected = selectedRatio === item.ratio;

            return (
              <motion.button
                key={item.ratio}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRatio(item.ratio)}
                className={`w-full p-6 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center transition-colors ${
                      isSelected ? 'text-blue-500' : 'text-gray-400'
                    }`}
                  >
                    {item.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-gray-900">{item.label}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>

                  {/* Check Icon */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="px-4 py-6 border-t border-gray-200 safe-area-bottom">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => selectedRatio && onNext(selectedRatio)}
          disabled={!selectedRatio}
          className="w-full py-4 rounded-xl bg-golf-green text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          다음
        </motion.button>
      </div>
    </div>
  );
};
