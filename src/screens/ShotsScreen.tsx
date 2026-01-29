import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, Calendar } from 'lucide-react';
import { ShotData, ClubType } from '../types/golf';
import { useTouchScroll } from '../hooks/useTouchScroll';

export const ShotsScreen: React.FC = () => {
  const [selectedClub, setSelectedClub] = useState<ClubType | 'all'>('all');
  const scrollRef = useTouchScroll<HTMLDivElement>();

  // 샘플 데이터
  const shots: ShotData[] = [
    {
      id: '1',
      timestamp: Date.now(),
      ballSpeed: 165,
      clubSpeed: 112,
      launchAngle: 12.5,
      backSpin: 2650,
      sideSpin: 150,
      distance: 287,
      accuracy: 92,
      club: 'Driver',
      thumbnail: '',
    },
    {
      id: '2',
      timestamp: Date.now() - 1000000,
      ballSpeed: 142,
      clubSpeed: 98,
      launchAngle: 18.2,
      backSpin: 5200,
      sideSpin: -80,
      distance: 165,
      accuracy: 88,
      club: '7Iron',
      thumbnail: '',
    },
    {
      id: '3',
      timestamp: Date.now() - 2000000,
      ballSpeed: 155,
      clubSpeed: 105,
      launchAngle: 14.8,
      backSpin: 3100,
      sideSpin: 220,
      distance: 245,
      accuracy: 85,
      club: '3Wood',
      thumbnail: '',
    },
  ];

  const clubs: (ClubType | 'all')[] = ['all', 'Driver', '3Wood', '7Iron', 'PW'];

  return (
    <div className="h-full bg-gray-50 safe-area-top pb-20">
      {/* 헤더 */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">내 샷 기록</h1>

        {/* 검색 바 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="샷 검색..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-golf-green"
          />
        </div>

        {/* 필터 칩 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap">
            <Calendar className="w-4 h-4" />
            오늘
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 whitespace-nowrap">
            <Filter className="w-4 h-4" />
            필터
          </button>
          {clubs.map((club) => (
            <button
              key={club}
              onClick={() => setSelectedClub(club)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedClub === club
                  ? 'bg-golf-green text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {club === 'all' ? '전체' : club}
            </button>
          ))}
        </div>
      </div>

      {/* 샷 리스트 */}
      <div ref={scrollRef} className="p-6 space-y-4 overflow-y-auto scrollbar-hide touch-scroll">
        <AnimatePresence>
          {shots.map((shot, index) => (
            <motion.div
              key={shot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              {/* 썸네일 & 클럽 정보 */}
              <div className="relative h-40 bg-gradient-to-br from-golf-green to-golf-fairway">
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className="text-sm font-bold text-gray-900">{shot.club}</span>
                </div>
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className="text-sm font-medium text-white">
                    {shot.distance}y
                  </span>
                </div>
              </div>

              {/* 샷 데이터 */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">볼 스피드</div>
                    <div className="text-lg font-bold text-gray-900">
                      {shot.ballSpeed}
                      <span className="text-xs text-gray-500 ml-1">mph</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">발사각</div>
                    <div className="text-lg font-bold text-gray-900">
                      {shot.launchAngle}°
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">백스핀</div>
                    <div className="text-lg font-bold text-gray-900">
                      {shot.backSpin.toLocaleString()}
                      <span className="text-xs text-gray-500 ml-1">rpm</span>
                    </div>
                  </div>
                </div>

                {/* 정확도 바 */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>정확도</span>
                    <span className="font-semibold text-golf-green">
                      {shot.accuracy}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${shot.accuracy}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-golf-green to-green-400 rounded-full"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  {new Date(shot.timestamp).toLocaleString('ko-KR')}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
