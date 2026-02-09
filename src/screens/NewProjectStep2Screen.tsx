import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Play, ChevronLeft, Info } from 'lucide-react';
import { MediaItem, AspectRatio } from '../types/golf';
import { useTouchScroll } from '../hooks/useTouchScroll';

interface NewProjectStep2ScreenProps {
  aspectRatio: AspectRatio;
  onNext: (selectedMedia: MediaItem[], switchToEditMode?: boolean) => void;
  onBack: () => void;
  onClose: () => void;
  isShareMode?: boolean;
}

// 확장된 미디어 아이템 타입 (날짜 포함)
// hasMetadata, metadata는 MediaItem 베이스 타입에 정의됨
interface ExtendedMediaItem extends MediaItem {
  createdAt: Date;
}

// Mock 미디어 데이터 (날짜, 메타데이터 포함)
const mockMediaItems: ExtendedMediaItem[] = [
  {
    id: 'media-1',
    type: 'video',
    uri: 'video-1.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=400&fit=crop',
    duration: 15,
    width: 1920,
    height: 1080,
    createdAt: new Date('2026-01-30T14:30:00'),
    hasMetadata: true,
    metadata: {
      clubType: '드라이버',
      swingSpeed: 105,
      location: '남서울CC',
    },
  },
  {
    id: 'media-2',
    type: 'image',
    uri: 'image-1.jpg',
    thumbnail: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=400&fit=crop',
    width: 1920,
    height: 1080,
    createdAt: new Date('2026-01-30T10:15:00'),
    hasMetadata: false,
  },
  {
    id: 'media-3',
    type: 'video',
    uri: 'video-2.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=400&h=400&fit=crop',
    duration: 22,
    width: 1920,
    height: 1080,
    createdAt: new Date('2026-01-29T16:45:00'),
    hasMetadata: true,
    metadata: {
      clubType: '7번 아이언',
      swingSpeed: 85,
      location: '용인CC',
    },
  },
  {
    id: 'media-4',
    type: 'image',
    uri: 'image-2.jpg',
    thumbnail: 'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=400&h=400&fit=crop',
    width: 1920,
    height: 1080,
    createdAt: new Date('2026-01-29T14:20:00'),
    hasMetadata: true,
    metadata: {
      clubType: '퍼터',
      location: '용인CC',
    },
  },
  {
    id: 'media-5',
    type: 'video',
    uri: 'video-3.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1530028828-25e8270e98fb?w=400&h=400&fit=crop',
    duration: 18,
    width: 1920,
    height: 1080,
    createdAt: new Date('2026-01-28T09:30:00'),
    hasMetadata: false,
  },
  {
    id: 'media-6',
    type: 'image',
    uri: 'image-3.jpg',
    thumbnail: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=400&fit=crop',
    width: 1920,
    height: 1080,
    createdAt: new Date('2026-01-27T11:00:00'),
    hasMetadata: false,
  },
  {
    id: 'media-7',
    type: 'video',
    uri: 'video-4.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=400&fit=crop',
    duration: 12,
    width: 1920,
    height: 1080,
    createdAt: new Date('2026-01-25T15:45:00'),
    hasMetadata: true,
    metadata: {
      clubType: '드라이버',
      swingSpeed: 110,
      location: '파주CC',
    },
  },
  {
    id: 'media-8',
    type: 'image',
    uri: 'image-4.jpg',
    thumbnail: 'https://images.unsplash.com/photo-1593111774240-d529f12399b8?w=400&h=400&fit=crop',
    width: 1920,
    height: 1080,
    createdAt: new Date('2026-01-20T08:30:00'),
    hasMetadata: false,
  },
  {
    id: 'media-9',
    type: 'video',
    uri: 'video-5.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=400&fit=crop',
    duration: 25,
    width: 1920,
    height: 1080,
    createdAt: new Date('2026-01-15T17:20:00'),
    hasMetadata: true,
    metadata: {
      clubType: '5번 우드',
      swingSpeed: 95,
      location: '안양CC',
    },
  },
];

// 날짜 포맷팅 함수
const formatDateHeader = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return '오늘';
  if (isYesterday) return '어제';

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];

  return `${month}월 ${day}일 (${weekday})`;
};

// 날짜별로 그룹화하는 함수
const groupByDate = (items: ExtendedMediaItem[]): Map<string, ExtendedMediaItem[]> => {
  const groups = new Map<string, ExtendedMediaItem[]>();

  // 날짜 기준 내림차순 정렬 (최신순)
  const sorted = [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  sorted.forEach((item) => {
    const dateKey = item.createdAt.toDateString();
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(item);
  });

  return groups;
};

export const NewProjectStep2Screen: React.FC<NewProjectStep2ScreenProps> = ({
  aspectRatio,
  onNext,
  onBack,
  onClose,
  isShareMode = false,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'video' | 'image'>('all');
  const [selectedMedia, setSelectedMedia] = useState<ExtendedMediaItem[]>([]);
  const [showEditModeDialog, setShowEditModeDialog] = useState(false);
  const scrollRef = useTouchScroll<HTMLDivElement>();

  // 필터링 및 그룹화된 미디어
  const groupedMedia = useMemo(() => {
    const filtered = mockMediaItems.filter((item) => {
      if (selectedTab === 'all') return true;
      return item.type === selectedTab;
    });
    return groupByDate(filtered);
  }, [selectedTab]);

  const toggleMediaSelection = (media: ExtendedMediaItem) => {
    const index = selectedMedia.findIndex((m) => m.id === media.id);
    if (index >= 0) {
      setSelectedMedia(selectedMedia.filter((m) => m.id !== media.id));
    } else {
      setSelectedMedia([...selectedMedia, media]);
    }
  };

  const getSelectionOrder = (mediaId: string) => {
    const index = selectedMedia.findIndex((m) => m.id === mediaId);
    return index >= 0 ? index + 1 : null;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextClick = () => {
    // 공유 모드이고 2개 이상 선택된 경우 편집 모드 선택 다이얼로그 표시
    if (isShareMode && selectedMedia.length >= 2) {
      setShowEditModeDialog(true);
    } else {
      onNext(selectedMedia);
    }
  };

  const handleEditModeChoice = (useEditMode: boolean) => {
    setShowEditModeDialog(false);
    if (useEditMode) {
      // 편집 모드로 전환
      onNext(selectedMedia, true);
    }
    // 취소하면 다이얼로그만 닫고 미디어 선택 화면 유지
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Status Bar Spacer - 모바일 상단 UI 영역 */}
      <div className="flex-shrink-0 h-11 bg-white" />

      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 -ml-2"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </motion.button>
            <h1 className="text-lg font-bold text-gray-900">미디어 선택</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-600" />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pb-3">
          {[
            { id: 'all' as const, label: '전체' },
            { id: 'video' as const, label: '영상' },
            { id: 'image' as const, label: '이미지' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-golf-green text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Media Grid - 날짜별 그룹화 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide touch-scroll">
        {Array.from(groupedMedia.entries()).map(([dateKey, items]) => (
          <div key={dateKey} className="mb-2">
            {/* 날짜 헤더 */}
            <div className="sticky top-0 bg-gray-50 px-4 py-2 z-10">
              <span className="text-sm font-semibold text-gray-700">
                {formatDateHeader(items[0].createdAt)}
              </span>
              <span className="text-xs text-gray-400 ml-2">
                {items.length}개
              </span>
            </div>

            {/* 미디어 그리드 */}
            <div className="grid grid-cols-3 gap-0.5 px-0.5">
              {items.map((media) => {
                const selectionOrder = getSelectionOrder(media.id);
                const isSelected = selectionOrder !== null;

                return (
                  <motion.button
                    key={media.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleMediaSelection(media)}
                    className="relative aspect-square overflow-hidden bg-gray-200"
                  >
                    {/* Thumbnail */}
                    <img
                      src={media.thumbnail}
                      alt=""
                      className={`w-full h-full object-cover transition-opacity ${
                        isSelected ? 'opacity-60' : 'opacity-100'
                      }`}
                    />

                    {/* 메타데이터 마크 (좌측 하단) */}
                    {media.hasMetadata && (
                      <div className="absolute bottom-1.5 left-1.5 w-5 h-5 rounded-full bg-golf-green flex items-center justify-center shadow-lg">
                        <Info className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Video Duration (우측 하단) */}
                    {media.type === 'video' && media.duration && (
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                        <Play className="w-2.5 h-2.5" fill="currentColor" />
                        {formatDuration(media.duration)}
                      </div>
                    )}

                    {/* Selection Overlay */}
                    <AnimatePresence>
                      {isSelected && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-blue-500/30 border-2 border-blue-500"
                          />
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-lg"
                          >
                            {selectionOrder}
                          </motion.div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1.5 left-1.5"
                          >
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 메타데이터 범례 */}
      <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-golf-green flex items-center justify-center">
              <Info className="w-2.5 h-2.5 text-white" />
            </div>
            <span>스윙 분석 데이터 포함</span>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">
            {selectedMedia.length > 0 ? `${selectedMedia.length}개 선택됨` : '미디어를 선택하세요'}
          </span>
          <span className="text-xs text-gray-400">화면 비율: {aspectRatio}</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNextClick}
          disabled={selectedMedia.length === 0}
          className="w-full py-4 rounded-xl bg-golf-green text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isShareMode ? '다음' : '타임라인 생성'}
        </motion.button>
      </div>

      {/* Edit Mode Selection Dialog */}
      <AnimatePresence>
        {showEditModeDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowEditModeDialog(false)}
            >
              {/* Dialog */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-sm"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">편집 모드로 전환</h3>
                <p className="text-sm text-gray-500 mb-6 text-center">
                  여러 개의 미디어를 선택하셨습니다.
                  <br />
                  편집 모드로 전환하시겠습니까?
                </p>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowEditModeDialog(false)}
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
                  >
                    취소
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEditModeChoice(true)}
                    className="flex-1 py-3 rounded-xl bg-golf-green text-white font-medium"
                  >
                    편집하기
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
