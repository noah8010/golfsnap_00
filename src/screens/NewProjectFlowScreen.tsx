import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NewProjectStep1Screen } from './NewProjectStep1Screen';
import { NewProjectStep2Screen } from './NewProjectStep2Screen';
import { NewProjectStep3Screen } from './NewProjectStep3Screen';
import { ShareDialog } from '../components/ShareDialog';
import { AspectRatio, MediaItem } from '../types/golf';

interface NewProjectFlowScreenProps {
  onComplete: (aspectRatio: AspectRatio, selectedMedia: MediaItem[]) => void;
  onClose: () => void;
  isShareMode?: boolean;
}

type Step = 1 | 2 | 3;

export const NewProjectFlowScreen: React.FC<NewProjectFlowScreenProps> = ({
  onComplete,
  onClose,
  isShareMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleStep1Next = (ratio: AspectRatio) => {
    setAspectRatio(ratio);
    setCurrentStep(2);
  };

  const handleStep2Next = (media: MediaItem[], switchToEditMode?: boolean) => {
    setSelectedMedia(media);
    if (switchToEditMode) {
      // 편집 모드로 전환 - Step3로 이동
      setCurrentStep(3);
    } else if (isShareMode) {
      // 공유 모드: ShareDialog 표시
      setShowShareDialog(true);
    } else {
      // 편집 모드: Step3로 이동
      setCurrentStep(3);
    }
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleStep3Complete = () => {
    if (aspectRatio && selectedMedia.length > 0) {
      onComplete(aspectRatio, selectedMedia);
    }
  };

  const handleShareSubmit = (title: string, content: string) => {
    // 공유 모드에서 제목/내용 입력 완료
    console.log('공유하기:', { title, content, aspectRatio, selectedMedia });
    alert(`제목: ${title}\n내용: ${content}\n\n공유 기능은 곧 구현됩니다`);
    setShowShareDialog(false);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-white z-50">
      {/* Share Dialog for Share Mode */}
      <ShareDialog
        show={showShareDialog}
        onClose={() => {
          setShowShareDialog(false);
          onClose();
        }}
        onShare={handleShareSubmit}
      />

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <NewProjectStep1Screen onNext={handleStep1Next} onClose={onClose} />
          </motion.div>
        )}

        {currentStep === 2 && aspectRatio && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <NewProjectStep2Screen
              aspectRatio={aspectRatio}
              onNext={handleStep2Next}
              onBack={handleStep2Back}
              onClose={onClose}
              isShareMode={isShareMode}
            />
          </motion.div>
        )}

        {currentStep === 3 && aspectRatio && selectedMedia.length > 0 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <NewProjectStep3Screen
              aspectRatio={aspectRatio}
              selectedMedia={selectedMedia}
              onComplete={handleStep3Complete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
