import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Type, Sticker } from 'lucide-react';
import { MediaItem, AspectRatio } from '../types/golf';

interface NewProjectStep3ScreenProps {
  aspectRatio: AspectRatio;
  selectedMedia: MediaItem[];
  onComplete: () => void;
}

export const NewProjectStep3Screen: React.FC<NewProjectStep3ScreenProps> = ({
  aspectRatio,
  selectedMedia,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<
    'analyzing' | 'generating' | 'subtitles' | 'stickers' | 'complete'
  >('analyzing');

  useEffect(() => {
    // 단계별 로딩 시뮬레이션
    const steps = [
      { step: 'analyzing', duration: 1000, progress: 20 },
      { step: 'generating', duration: 1500, progress: 50 },
      { step: 'subtitles', duration: 1200, progress: 75 },
      { step: 'stickers', duration: 1000, progress: 95 },
      { step: 'complete', duration: 500, progress: 100 },
    ];

    let currentStepIndex = 0;

    const runStep = () => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        setCurrentStep(step.step as any);
        setProgress(step.progress);

        setTimeout(() => {
          currentStepIndex++;
          if (currentStepIndex < steps.length) {
            runStep();
          } else {
            setTimeout(() => {
              onComplete();
            }, 800);
          }
        }, step.duration);
      }
    };

    runStep();
  }, [onComplete]);

  const getStepMessage = () => {
    switch (currentStep) {
      case 'analyzing':
        return '미디어 분석 중...';
      case 'generating':
        return '타임라인 생성 중...';
      case 'subtitles':
        return '자동 자막 생성 중...';
      case 'stickers':
        return '추천 스티커 배치 중...';
      case 'complete':
        return '완료!';
      default:
        return '처리 중...';
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'subtitles':
        return <Type className="w-12 h-12 text-golf-green" />;
      case 'stickers':
        return <Sticker className="w-12 h-12 text-golf-green" />;
      case 'complete':
        return <Sparkles className="w-12 h-12 text-golf-green" />;
      default:
        return <Loader2 className="w-12 h-12 text-golf-green animate-spin" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white px-6">
      {/* Icon */}
      <motion.div
        key={currentStep}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        {getStepIcon()}
      </motion.div>

      {/* Message */}
      <motion.h2
        key={currentStep + '-text'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-gray-900 mb-2"
      >
        {getStepMessage()}
      </motion.h2>

      {/* Details */}
      <p className="text-sm text-gray-600 text-center mb-8">
        {selectedMedia.length}개의 미디어로 {aspectRatio} 프로젝트를 생성하고 있습니다
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-golf-green"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">진행률</span>
          <span className="text-xs font-semibold text-golf-green">{progress}%</span>
        </div>
      </div>

      {/* Feature List */}
      <div className="mt-12 space-y-3 w-full max-w-xs">
        {[
          { label: '미디어 분석', done: progress >= 20 },
          { label: '타임라인 생성', done: progress >= 50 },
          { label: '자동 자막 생성', done: progress >= 75 },
          { label: '추천 스티커 배치', done: progress >= 95 },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                item.done ? 'bg-golf-green' : 'bg-gray-200'
              }`}
            >
              {item.done && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </div>
            <span
              className={`text-sm transition-colors ${
                item.done ? 'text-gray-900 font-medium' : 'text-gray-400'
              }`}
            >
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
