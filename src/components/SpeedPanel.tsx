import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SpeedPanelProps {
  currentSpeed: number;
  onApply: (speed: number, reverse: boolean) => void;
  onClose: () => void;
}

export const SpeedPanel: React.FC<SpeedPanelProps> = ({
  currentSpeed = 1,
  onApply,
  onClose,
}) => {
  const [speed, setSpeed] = useState(currentSpeed);
  const [isReverse, setIsReverse] = useState(false);

  const presets = [0.5, 1, 2, 4];

  const handleApply = () => {
    onApply(speed, isReverse);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-end">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full bg-gray-800 rounded-t-3xl safe-area-bottom"
      >
        <div className="px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">속도 조절</h3>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Speed Display */}
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-golf-green">{speed.toFixed(1)}x</span>
          </div>

          {/* Slider */}
          <div className="mb-6">
            <input
              type="range"
              min="0.1"
              max="8"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-golf-green"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>0.1x</span>
              <span>8.0x</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {presets.map((preset) => (
              <motion.button
                key={preset}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSpeed(preset)}
                className={`py-3 rounded-xl font-semibold transition-colors ${
                  speed === preset
                    ? 'bg-golf-green text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {preset}x
              </motion.button>
            ))}
          </div>

          {/* Reverse Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-xl mb-6">
            <span className="text-white font-medium">역재생</span>
            <button
              onClick={() => setIsReverse(!isReverse)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                isReverse ? 'bg-golf-green' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: isReverse ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-4 rounded-xl bg-gray-700 text-white font-semibold"
            >
              취소
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleApply}
              className="flex-1 py-4 rounded-xl bg-golf-green text-white font-semibold"
            >
              적용
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
