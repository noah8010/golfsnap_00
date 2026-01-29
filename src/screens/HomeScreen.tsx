import React from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Award, Target } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useTouchScroll } from '../hooks/useTouchScroll';

export const HomeScreen: React.FC = () => {
  const { setCurrentScreen } = useAppStore();
  const scrollRef = useTouchScroll<HTMLDivElement>();

  const stats = [
    { icon: Target, label: '평균 거리', value: '245y', color: 'text-blue-600' },
    { icon: TrendingUp, label: '정확도', value: '78%', color: 'text-green-600' },
    { icon: Award, label: '베스트 샷', value: '287y', color: 'text-purple-600' },
  ];

  const recentProjects = [
    { id: 1, name: '주말 라운드', clips: 12, date: '2024.01.07' },
    { id: 2, name: '드라이버 연습', clips: 8, date: '2024.01.05' },
    { id: 3, name: '아이언 스윙', clips: 15, date: '2024.01.03' },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-golf-green to-golf-fairway safe-area-top pb-20">
      {/* 헤더 */}
      <div className="px-6 py-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-2"
        >
          GolfSnap
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-green-100"
        >
          스윙을 기록하고 분석하세요
        </motion.p>
      </div>

      {/* 통계 카드 */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-lg"
              >
                <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="px-6 mb-6">
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setCurrentScreen('editor')}
          className="w-full bg-white rounded-2xl p-6 shadow-lg flex items-center justify-between group hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-golf-green to-golf-fairway rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 text-lg">새 프로젝트</div>
              <div className="text-sm text-gray-500">샷 영상 편집 시작</div>
            </div>
          </div>
          <div className="text-golf-green transform group-hover:translate-x-1 transition-transform">
            →
          </div>
        </motion.button>
      </div>

      {/* 최근 프로젝트 */}
      <div ref={scrollRef} className="flex-1 bg-white rounded-t-3xl px-6 py-6 overflow-y-auto scrollbar-hide touch-scroll">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">최근 프로젝트</h2>
          <button className="text-sm text-golf-green font-medium">전체보기</button>
        </div>

        <div className="space-y-3">
          {recentProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">
                    {project.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {project.clips}개 클립 • {project.date}
                  </div>
                </div>
              </div>
              <div className="text-gray-400">›</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
