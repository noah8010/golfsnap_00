/**
 * @file BookingScreen.tsx
 * @description 예약 화면 (프로토타입 플레이스홀더)
 *
 * 스크린골프장 예약 기능의 레이아웃 목업입니다.
 * 프로토타입 범위 외 화면으로, 디자인 확정 전 상태입니다.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Star, Construction } from 'lucide-react';
import { useTouchScroll } from '../hooks/useTouchScroll';

/** 샘플 예약 가능 매장 */
const SAMPLE_VENUES = [
  { id: 1, name: '강남 골프존', location: '강남구 역삼동', rating: 4.8, rooms: 12, distance: '1.2km' },
  { id: 2, name: '용인 스크린골프', location: '용인시 수지구', rating: 4.5, rooms: 8, distance: '5.4km' },
  { id: 3, name: '판교 골프파크', location: '성남시 분당구', rating: 4.7, rooms: 15, distance: '3.8km' },
];

/**
 * 예약 화면 컴포넌트
 */
export const BookingScreen: React.FC = () => {
  const scrollRef = useTouchScroll<HTMLDivElement>();

  return (
    <div ref={scrollRef} className="h-full bg-gray-50 safe-area-top pb-20 overflow-y-auto scrollbar-hide touch-scroll">
      {/* Status Bar Spacer */}
      <div className="flex-shrink-0 h-11 bg-white" />

      {/* 프로토타입 배너 */}
      <div className="mx-4 mt-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
        <Construction className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="text-xs text-amber-700">디자인 확정 전 · 레이아웃 목업</span>
      </div>

      {/* 헤더 */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">예약</h1>
        <p className="text-sm text-gray-500">근처 스크린골프장을 예약하세요</p>
      </div>

      {/* 날짜/시간 선택 */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">예약 정보</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-golf-green" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">날짜</div>
                <div className="text-xs text-gray-500">2026년 2월 10일 (화)</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-golf-green" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">시간</div>
                <div className="text-xs text-gray-500">오후 2:00 - 4:00</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 매장 리스트 */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">근처 매장</h3>
        <div className="space-y-3">
          {SAMPLE_VENUES.map((venue, index) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{venue.name}</h4>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{venue.location}</span>
                    <span className="mx-1">·</span>
                    <span>{venue.distance}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" />
                  <span className="text-xs font-semibold text-yellow-700">{venue.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">{venue.rooms}개 룸 이용 가능</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-golf-green text-white text-sm font-medium rounded-lg"
                >
                  예약하기
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
