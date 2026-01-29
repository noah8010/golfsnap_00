import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Check } from 'lucide-react';

interface ShareDialogProps {
  show: boolean;
  onClose: () => void;
  onShare: (title: string, content: string) => void;
}

type DialogStep = 'input' | 'success';

export const ShareDialog: React.FC<ShareDialogProps> = ({ show, onClose, onShare }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [step, setStep] = useState<DialogStep>('input');

  const handleShare = () => {
    if (title.trim() || content.trim()) {
      // 성공 단계로 전환
      setStep('success');
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setStep('input');
    onClose();
  };

  const handleSuccessConfirm = () => {
    onShare(title.trim(), content.trim());
    setTitle('');
    setContent('');
    setStep('input');
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
            onClick={step === 'success' ? undefined : handleClose}
          >
            {/* Dialog */}
            <motion.div
              key={step}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              {step === 'input' ? (
                // Input Step
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">공유하기</h3>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>

                  {/* Title Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="제목을 입력하세요"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-golf-green"
                      maxLength={100}
                    />
                  </div>

                  {/* Content Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      내용
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="내용을 입력하세요"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-golf-green resize-none"
                      maxLength={500}
                    />
                    <div className="mt-1 text-right">
                      <span className="text-xs text-gray-400">{content.length}/500</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
                    >
                      취소
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleShare}
                      disabled={!title.trim() && !content.trim()}
                      className="flex-1 py-3 rounded-xl bg-golf-green text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      공유하기
                    </motion.button>
                  </div>
                </>
              ) : (
                // Success Step
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-golf-green/10 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-golf-green" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">공유가 완료되었습니다</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    콘텐츠가 성공적으로 공유되었습니다.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSuccessConfirm}
                    className="w-full py-3 rounded-xl bg-golf-green text-white font-medium"
                  >
                    확인
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
