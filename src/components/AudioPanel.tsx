import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';

interface AudioPanelProps {
  onApply: (audio: AudioSettings) => void;
  onClose: () => void;
  currentAudio?: AudioSettings;
}

export interface AudioSettings {
  volume: number;
  muted: boolean;
  bgm?: {
    id: string;
    name: string;
    volume: number;
  };
}

const BGM_LIBRARY = [
  { id: 'bgm-1', name: '경쾌한 골프', duration: 180, genre: '활기찬' },
  { id: 'bgm-2', name: '여유로운 라운딩', duration: 240, genre: '여유로운' },
  { id: 'bgm-3', name: '승리의 순간', duration: 150, genre: '감동적인' },
  { id: 'bgm-4', name: '완벽한 샷', duration: 200, genre: '서정적인' },
  { id: 'bgm-5', name: '골프 마스터', duration: 190, genre: '활기찬' },
  { id: 'bgm-6', name: '그린 위의 평화', duration: 220, genre: '여유로운' },
];

export const AudioPanel: React.FC<AudioPanelProps> = ({
  onApply,
  onClose,
  currentAudio = { volume: 100, muted: false },
}) => {
  const [volume, setVolume] = useState(currentAudio.volume);
  const [muted, setMuted] = useState(currentAudio.muted);
  const [selectedBgm, setSelectedBgm] = useState<string | undefined>(currentAudio.bgm?.id);
  const [bgmVolume, setBgmVolume] = useState(currentAudio.bgm?.volume || 50);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

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

  const handleApply = () => {
    const audioSettings: AudioSettings = {
      volume,
      muted,
      bgm: selectedBgm
        ? {
            id: selectedBgm,
            name: BGM_LIBRARY.find((b) => b.id === selectedBgm)?.name || '',
            volume: bgmVolume,
          }
        : undefined,
    };
    onApply(audioSettings);
    onClose();
  };

  const handlePreviewToggle = (bgmId: string) => {
    if (playingPreview === bgmId) {
      setPlayingPreview(null);
    } else {
      setPlayingPreview(bgmId);
      // 실제로는 여기서 오디오 재생
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <h3 className="text-lg font-bold text-white">오디오</h3>
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
            {/* Original Audio Volume */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">원본 오디오</h4>
              <div className="bg-[#3d4554] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {muted ? (
                      <VolumeX className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                    <span className="text-sm text-white">볼륨</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-golf-green font-medium">{volume}%</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setMuted(!muted)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        muted ? 'bg-gray-600 text-gray-400' : 'bg-golf-green text-white'
                      }`}
                    >
                      {muted ? '음소거' : '켜짐'}
                    </motion.button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  disabled={muted}
                  className="w-full h-2 bg-[#2c3441] rounded-lg appearance-none cursor-pointer accent-golf-green disabled:opacity-50"
                />
              </div>
            </div>

            {/* BGM Library */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">배경음악 라이브러리</h4>
              <div className="space-y-2">
                {BGM_LIBRARY.map((bgm) => (
                  <motion.div
                    key={bgm.id}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                      selectedBgm === bgm.id
                        ? 'bg-golf-green/20 ring-2 ring-golf-green'
                        : 'bg-[#3d4554] hover:bg-[#4a5262]'
                    }`}
                    onClick={() => setSelectedBgm(selectedBgm === bgm.id ? undefined : bgm.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-[#2c3441] flex items-center justify-center">
                        <Music className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{bgm.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#2c3441] text-gray-300">{bgm.genre}</span>
                        </div>
                        <span className="text-xs text-gray-400">{formatDuration(bgm.duration)}</span>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewToggle(bgm.id);
                      }}
                      className="w-8 h-8 rounded-full bg-[#2c3441] flex items-center justify-center hover:bg-gray-600"
                    >
                      {playingPreview === bgm.id ? (
                        <Pause className="w-4 h-4 text-white" fill="currentColor" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* BGM Volume */}
            {selectedBgm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="bg-[#3d4554] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white">BGM 볼륨</span>
                    <span className="text-sm text-golf-green font-medium">{bgmVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={bgmVolume}
                    onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-[#2c3441] rounded-lg appearance-none cursor-pointer accent-golf-green"
                  />
                </div>
              </motion.div>
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
              onClick={handleApply}
              className="flex-1 py-4 rounded-xl bg-golf-green text-white font-semibold hover:bg-golf-green/90"
            >
              적용
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
