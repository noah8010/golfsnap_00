/**
 * @file ClipVolumePanel.tsx
 * @description 비디오 클립 볼륨 조절 패널
 *
 * 개별 비디오 클립의 원본 오디오 볼륨을 조절하는 패널입니다.
 * 0% ~ 100% 범위로 볼륨을 조절할 수 있고, 음소거 토글도 지원합니다.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX } from 'lucide-react';

interface ClipVolumePanelProps {
  /** 현재 볼륨 값 (0~1) */
  currentVolume: number;
  /** 음소거 상태 */
  isMuted?: boolean;
  /** 볼륨 적용 콜백 */
  onApply: (volume: number, muted: boolean) => void;
  /** 패널 닫기 콜백 */
  onClose: () => void;
}

export const ClipVolumePanel: React.FC<ClipVolumePanelProps> = ({
  currentVolume,
  isMuted = false,
  onApply,
  onClose,
}) => {
  // 0~1 범위를 0~100으로 변환하여 표시
  const [volume, setVolume] = useState(Math.round(currentVolume * 100));
  const [muted, setMuted] = useState(isMuted);

  const handleApply = () => {
    // 100을 나눠서 0~1 범위로 저장
    onApply(volume / 100, muted);
    onClose();
  };

  /** 프리셋 볼륨 버튼 */
  const volumePresets = [
    { label: '0%', value: 0 },
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: '75%', value: 75 },
    { label: '100%', value: 100 },
  ];

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
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">클립 볼륨</h3>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* 볼륨 조절 영역 */}
          <div className="bg-gray-700 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {muted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
                <span className="text-sm text-white">원본 오디오</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-golf-green font-medium w-12 text-right">
                  {muted ? '0' : volume}%
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMuted(!muted)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    muted ? 'bg-gray-600 text-gray-400' : 'bg-golf-green text-white'
                  }`}
                >
                  {muted ? '음소거' : '켜짐'}
                </motion.button>
              </div>
            </div>

            {/* 볼륨 슬라이더 */}
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              disabled={muted}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-golf-green disabled:opacity-50"
            />

            {/* 프리셋 버튼 */}
            <div className="flex justify-between mt-4 gap-2">
              {volumePresets.map((preset) => (
                <motion.button
                  key={preset.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setVolume(preset.value);
                    if (preset.value === 0) setMuted(true);
                    else if (muted) setMuted(false);
                  }}
                  disabled={muted && preset.value !== 0}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    volume === preset.value && !muted
                      ? 'bg-golf-green text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500 disabled:opacity-50'
                  }`}
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 안내 문구 */}
          <p className="text-xs text-gray-400 text-center mb-6">
            비디오 클립의 원본 오디오 볼륨을 조절합니다.
            <br />
            BGM과 별도로 조절됩니다.
          </p>

          {/* 액션 버튼 */}
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
