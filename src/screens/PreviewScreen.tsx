import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Share2, Trophy, TrendingUp } from 'lucide-react';
import { useTouchScroll } from '../hooks/useTouchScroll';

export const PreviewScreen: React.FC = () => {
  const scrollRef = useTouchScroll<HTMLDivElement>();
  const achievements = [
    { id: 1, icon: Trophy, title: '드라이버 마스터', desc: '300y 돌파', color: 'bg-yellow-500' },
    { id: 2, icon: TrendingUp, title: '향상 중', desc: '10일 연속 연습', color: 'bg-blue-500' },
  ];

  const stats = [
    { label: '총 샷', value: '1,234' },
    { label: '평균 거리', value: '245y' },
    { label: '정확도', value: '78%' },
    { label: '베스트', value: '287y' },
  ];

  return (
    <div ref={scrollRef} className="h-full bg-gray-50 safe-area-top pb-20 overflow-y-auto scrollbar-hide touch-scroll">
      {/* 프로필 헤더 */}
      <div className="bg-gradient-to-br from-golf-green to-golf-fairway px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl">⛳</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">골퍼님</h2>
              <p className="text-green-100 text-sm">핸디캡 18</p>
            </div>
          </div>
          <button className="text-white">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* 통계 그리드 */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center"
            >
              <div className="text-lg font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-green-100">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 업적 */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">업적</h3>
          <button className="text-sm text-golf-green font-medium">전체보기</button>
        </div>

        <div className="space-y-3">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
              >
                <div className={`w-12 h-12 ${achievement.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-0.5">
                    {achievement.title}
                  </div>
                  <div className="text-sm text-gray-500">{achievement.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 공유 버튼 */}
      <div className="px-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full bg-golf-green hover:bg-golf-green/90 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
        >
          <Share2 className="w-5 h-5" />
          프로필 공유하기
        </motion.button>
      </div>
    </div>
  );
};
