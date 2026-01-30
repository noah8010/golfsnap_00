import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Sparkles,
  Layers,
  Download,
  Undo,
  Redo,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const EditorScreen: React.FC = () => {
  const { isPlaying, setIsPlaying, currentTime } = useAppStore();
  const [selectedTool, setSelectedTool] = useState<'cut' | 'effect' | 'layer' | null>(
    null
  );

  const timeline = [
    { id: 1, start: 0, duration: 3, color: 'bg-blue-500' },
    { id: 2, start: 3, duration: 2.5, color: 'bg-green-500' },
    { id: 3, start: 5.5, duration: 4, color: 'bg-purple-500' },
  ];

  const totalDuration = 9.5;

  const tools = [
    { id: 'cut' as const, icon: Scissors, label: '자르기' },
    { id: 'effect' as const, icon: Sparkles, label: '효과' },
    { id: 'layer' as const, icon: Layers, label: '레이어' },
  ];

  const effects = [
    { id: 1, name: '슬로우 모션', icon: '🎬' },
    { id: 2, name: '궤적 추적', icon: '📍' },
    { id: 3, name: '데이터 오버레이', icon: '📊' },
    { id: 4, name: '하이라이트', icon: '✨' },
  ];

  return (
    <div className="h-full bg-gray-900 safe-area-top pb-20 flex flex-col">
      {/* 헤더 */}
      <div className="px-4 py-3 bg-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-white">
            <Undo className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white">
            <Redo className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm font-medium text-white">드라이버 하이라이트</div>
        <button className="flex items-center gap-2 bg-golf-green hover:bg-golf-green/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Download className="w-4 h-4" />
          내보내기
        </button>
      </div>

      {/* 프리뷰 영역 */}
      <div className="relative flex-1 bg-black flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <div className="w-20 h-20 bg-golf-green/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Play className="w-10 h-10 text-golf-green" />
            </div>
            <p className="text-gray-400 text-sm">프리뷰 영역</p>
          </div>
        </div>

        {/* 데이터 오버레이 샘플 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 text-white"
        >
          <div className="text-xs text-gray-400 mb-2">샷 데이터</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-300">거리</span>
              <span className="font-bold">287y</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-300">볼 스피드</span>
              <span className="font-bold">165mph</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 타임라인 */}
      <div className="bg-gray-800 px-4 py-4">
        {/* 재생 시간 */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>

        {/* 타임라인 트랙 */}
        <div className="relative h-16 bg-gray-900 rounded-lg overflow-hidden mb-4">
          {timeline.map((clip) => (
            <motion.div
              key={clip.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                left: `${(clip.start / totalDuration) * 100}%`,
                width: `${(clip.duration / totalDuration) * 100}%`,
              }}
              className={`absolute top-2 h-12 ${clip.color} rounded-lg border-2 border-white/20 cursor-pointer hover:border-white/40 transition-colors`}
            >
              <div className="h-full flex items-center justify-center text-white text-xs font-medium">
                {clip.duration}s
              </div>
            </motion.div>
          ))}

          {/* 재생 헤드 */}
          <motion.div
            animate={{ left: `${(currentTime / totalDuration) * 100}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-golf-green z-10"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-golf-green rounded-full" />
          </motion.div>
        </div>

        {/* 재생 컨트롤 */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button className="text-gray-400 hover:text-white">
            <SkipBack className="w-6 h-6" />
          </button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 bg-golf-green hover:bg-golf-green/90 rounded-full flex items-center justify-center text-white"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </motion.button>
          <button className="text-gray-400 hover:text-white">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* 편집 도구 */}
        <div className="flex items-center gap-2 mb-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = selectedTool === tool.id;
            return (
              <motion.button
                key={tool.id}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedTool(isActive ? null : tool.id)
                }
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-golf-green text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tool.label}
              </motion.button>
            );
          })}
        </div>

        {/* 효과 패널 */}
        <AnimatePresence>
          {selectedTool === 'effect' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 pt-2">
                {effects.map((effect) => (
                  <motion.button
                    key={effect.id}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-left transition-colors"
                  >
                    <div className="text-2xl mb-1">{effect.icon}</div>
                    <div className="text-sm text-white font-medium">
                      {effect.name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
