import React from 'react';
import { Toast } from './Toast';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* 스마트폰 프레임 */}
      <div className="relative">
        {/* 디바이스 외곽 프레임 */}
        <div className="relative bg-gray-900 rounded-[1.25rem] p-3 shadow-2xl">
          {/* 노치 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-2xl z-10" />

          {/* 스크린 - iPhone 14 Pro 해상도 (393×852) */}
          <div className="relative w-[393px] h-[852px] bg-white dark:bg-gray-900 rounded-[1rem] overflow-hidden shadow-inner">
            {/* 상태바 */}
            <div className="absolute top-0 left-0 right-0 h-11 bg-transparent z-20 px-6 flex items-center justify-between text-xs font-medium">
              <span className="text-gray-900 dark:text-gray-100">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 border border-gray-900 dark:border-gray-100 rounded-sm relative">
                  <div className="absolute inset-0.5 bg-gray-900 dark:bg-gray-100 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* 앱 콘텐츠 */}
            <div className="relative h-full overflow-hidden">
              {children}
              <Toast />
            </div>
          </div>

          {/* 홈 인디케이터 */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full" />
        </div>

        {/* 사이드 버튼들 (볼륨, 전원) */}
        <div className="absolute -left-2 top-24 w-1 h-8 bg-gray-800 rounded-l-lg" />
        <div className="absolute -left-2 top-40 w-1 h-12 bg-gray-800 rounded-l-lg" />
        <div className="absolute -left-2 top-56 w-1 h-12 bg-gray-800 rounded-l-lg" />
        <div className="absolute -right-2 top-40 w-1 h-16 bg-gray-800 rounded-r-lg" />
      </div>
    </div>
  );
};
