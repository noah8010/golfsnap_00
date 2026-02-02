/**
 * @file ExportPanel.tsx
 * @description 내보내기 패널 컴포넌트
 *
 * 영상 내보내기 설정, 렌더링 진행, 완료 후 공유/다운로드 기능을 제공합니다.
 *
 * ## 단계 흐름
 * 1. settings: 화질, 포맷 선택
 * 2. rendering: 렌더링 진행 (취소 가능)
 * 3. complete: 공유/다운로드/대시보드/계속편집 선택
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, Check, Home, Edit3 } from 'lucide-react';
import { ShareDialog } from './ShareDialog';

interface ExportPanelProps {
  /** 프로젝트 이름 */
  projectName: string;
  /** 패널 닫기 콜백 */
  onClose: () => void;
  /** 완료 후 콜백 (mode: 'dashboard' | 'continue') */
  onComplete: (mode?: 'dashboard' | 'continue') => void;
}

type ExportStep = 'settings' | 'rendering' | 'complete';

const QUALITY_OPTIONS = [
  { id: '720p', label: 'HD 720p', resolution: '1280x720', size: '작음' },
  { id: '1080p', label: 'Full HD 1080p', resolution: '1920x1080', size: '중간' },
  { id: '4k', label: '4K UHD', resolution: '3840x2160', size: '큼' },
];

const FORMAT_OPTIONS = [
  { id: 'mp4', label: 'MP4', description: '호환성이 가장 좋음' },
  { id: 'mov', label: 'MOV', description: '고품질 편집용' },
];

export const ExportPanel: React.FC<ExportPanelProps> = ({ projectName, onClose, onComplete }) => {
  const [step, setStep] = useState<ExportStep>('settings');
  const [quality, setQuality] = useState('1080p');
  const [format, setFormat] = useState('mp4');
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);

  /** 렌더링 취소 플래그 */
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (step === 'rendering') {
      cancelledRef.current = false;

      const tasks = [
        { name: '프레임 처리 중', duration: 2000 },
        { name: '오디오 믹싱 중', duration: 1500 },
        { name: '효과 렌더링 중', duration: 2000 },
        { name: '최종 인코딩 중', duration: 1500 },
      ];

      let currentProgress = 0;

      const runTasks = async () => {
        for (const task of tasks) {
          if (cancelledRef.current) return; // 취소 확인

          setCurrentTask(task.name);
          const increment = 25;
          const steps = 50;
          const stepDuration = task.duration / steps;

          for (let i = 0; i < steps; i++) {
            if (cancelledRef.current) return; // 취소 확인

            await new Promise((resolve) => setTimeout(resolve, stepDuration));
            currentProgress += increment / steps;
            setProgress(Math.min(currentProgress, 100));
          }
        }

        if (!cancelledRef.current) {
          setStep('complete');
        }
      };

      runTasks();
    }
  }, [step]);

  /**
   * 렌더링 취소 핸들러
   */
  const handleCancelRendering = () => {
    cancelledRef.current = true;
    setStep('settings');
    setProgress(0);
    setCurrentTask('');
  };

  const handleStartExport = () => {
    setStep('rendering');
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleShareSubmit = (title: string, content: string) => {
    // 실제로는 공유 API 호출
    console.log('공유하기:', { title, content, projectName, quality, format });
    setShowShareDialog(false);
    // 공유 완료 후 메인화면으로 이동
    onComplete();
  };

  const handleDownload = () => {
    // 실제로는 다운로드 기능 구현
    // 다운로드 완료 후 메인화면으로 이동
    onComplete();
  };

  return (
    <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      {/* Share Dialog */}
      <ShareDialog
        show={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        onShare={handleShareSubmit}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">만들기 설정</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Project Info */}
              <div className="mb-6 p-4 bg-gray-700 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">프로젝트</p>
                <p className="text-white font-medium">{projectName}</p>
              </div>

              {/* Quality Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">화질</h4>
                <div className="space-y-2">
                  {QUALITY_OPTIONS.map((option) => (
                    <motion.button
                      key={option.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setQuality(option.id)}
                      className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors ${
                        quality === option.id
                          ? 'bg-golf-green/20 ring-2 ring-golf-green'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-white font-medium">{option.label}</div>
                        <div className="text-xs text-gray-400">{option.resolution}</div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-gray-600 text-gray-300">
                        {option.size}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">포맷</h4>
                <div className="flex gap-2">
                  {FORMAT_OPTIONS.map((option) => (
                    <motion.button
                      key={option.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormat(option.id)}
                      className={`flex-1 p-4 rounded-xl transition-colors ${
                        format === option.id
                          ? 'bg-golf-green text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-semibold mb-1">{option.label}</div>
                      <div className="text-xs opacity-80">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleStartExport}
                className="w-full py-4 rounded-xl bg-golf-green text-white font-semibold flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                만들기 시작
              </motion.button>
            </motion.div>
          )}

          {step === 'rendering' && (
            <motion.div
              key="rendering"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-lg font-bold text-white mb-2">만드는 중...</h3>
                <p className="text-sm text-gray-400">잠시만 기다려 주세요</p>
              </div>

              {/* Progress Circle */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                      className="text-golf-green transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>

              {/* Current Task */}
              <div className="text-center">
                <motion.p
                  key={currentTask}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-gray-400"
                >
                  {currentTask}
                </motion.p>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-golf-green"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* 취소 버튼 */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCancelRendering}
                className="w-full mt-6 py-3 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-gray-600 transition-colors"
              >
                취소
              </motion.button>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-golf-green/20 flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-10 h-10 text-golf-green" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">만들기 완료!</h3>
                <p className="text-sm text-gray-400">영상이 성공적으로 저장되었습니다</p>
              </div>

              {/* File Info */}
              <div className="mb-6 p-4 bg-gray-700 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">파일명</span>
                  <span className="text-sm text-white font-medium">{projectName}.{format}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">화질</span>
                  <span className="text-sm text-white font-medium">
                    {QUALITY_OPTIONS.find((q) => q.id === quality)?.label}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* 공유/다운로드 버튼 */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    className="flex-1 py-4 rounded-xl bg-golf-green text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    공유
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="flex-1 py-4 rounded-xl bg-gray-700 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    다운로드
                  </motion.button>
                </div>

                {/* 구분선 */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gray-600" />
                  <span className="text-xs text-gray-500">다음 작업</span>
                  <div className="flex-1 h-px bg-gray-600" />
                </div>

                {/* 다음 작업 버튼 */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onComplete('dashboard')}
                    className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    대시보드
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onComplete('continue')}
                    className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    계속 편집
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
