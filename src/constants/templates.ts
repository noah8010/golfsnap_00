/**
 * @file templates.ts
 * @description 프로젝트 템플릿 상수 정의
 *
 * 4가지 프리셋 템플릿을 제공합니다.
 * 각 템플릿은 미리 구성된 타임라인 클립과 설정을 포함합니다.
 *
 * ## 템플릿 종류
 * 1. 하이라이트 릴 - 베스트 샷 모음 (9:16 세로)
 * 2. 연습 기록 - 연습 일지 기록 (16:9 가로)
 * 3. SNS 쇼츠 - 짧은 SNS 클립 (9:16 세로)
 * 4. 분석 영상 - 스윙 분석 비교 (16:9 가로)
 */

import { TimelineItem, AspectRatio } from '../types/golf';

/** 프로젝트 템플릿 정의 */
export interface ProjectTemplate {
  /** 템플릿 고유 ID */
  id: string;
  /** 템플릿 이름 */
  name: string;
  /** 템플릿 설명 */
  description: string;
  /** 아이콘 이모지 */
  icon: string;
  /** 기본 화면비 */
  aspectRatio: AspectRatio;
  /** 예상 영상 길이 (초) */
  duration: number;
  /** 미리 구성된 타임라인 클립 */
  timeline: TimelineItem[];
  /** 태그 색상 (Tailwind 클래스) */
  tagColor: string;
  /** 태그 텍스트 */
  tag: string;
}

/** 프로젝트 템플릿 목록 */
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'highlight-reel',
    name: '하이라이트 릴',
    description: '베스트 샷 모음 영상',
    icon: '🏆',
    aspectRatio: '9:16',
    duration: 30,
    tagColor: 'bg-amber-100 text-amber-700',
    tag: '인기',
    timeline: [
      {
        id: 'tpl-v1',
        clipId: 'tpl-clip-v1',
        position: 0,
        duration: 5,
        track: 'video',
        startTime: 0,
        endTime: 5,
        speed: 1,
      },
      {
        id: 'tpl-v2',
        clipId: 'tpl-clip-v2',
        position: 5,
        duration: 5,
        track: 'video',
        startTime: 0,
        endTime: 5,
        speed: 0.5,
        transitions: { in: 'fade' },
      },
      {
        id: 'tpl-v3',
        clipId: 'tpl-clip-v3',
        position: 10,
        duration: 5,
        track: 'video',
        startTime: 0,
        endTime: 5,
        speed: 1,
        transitions: { in: 'zoom' },
      },
      {
        id: 'tpl-t1',
        clipId: 'tpl-clip-t1',
        position: 0,
        duration: 3,
        track: 'text',
        startTime: 0,
        endTime: 3,
        textContent: 'BEST SHOTS',
        textFont: 'noto-sans',
        textFontSize: 48,
        textColor: '#FFFFFF',
        textAlign: 'center',
        textBold: true,
        textAnimation: 'fade-in',
        textPosition: { x: 50, y: 20 },
      },
      {
        id: 'tpl-a1',
        clipId: 'tpl-clip-a1',
        position: 0,
        duration: 15,
        track: 'audio',
        startTime: 0,
        endTime: 15,
        audioBgm: { id: 'upbeat-1', name: 'Upbeat Energy', volume: 0.8 },
        audioVolume: 80,
      },
    ],
  },
  {
    id: 'practice-log',
    name: '연습 기록',
    description: '스윙 연습 일지',
    icon: '📝',
    aspectRatio: '16:9',
    duration: 60,
    tagColor: 'bg-blue-100 text-blue-700',
    tag: '추천',
    timeline: [
      {
        id: 'tpl-v1',
        clipId: 'tpl-clip-v1',
        position: 0,
        duration: 10,
        track: 'video',
        startTime: 0,
        endTime: 10,
        speed: 1,
      },
      {
        id: 'tpl-v2',
        clipId: 'tpl-clip-v2',
        position: 10,
        duration: 8,
        track: 'video',
        startTime: 0,
        endTime: 8,
        speed: 0.5,
        transitions: { in: 'slide' },
      },
      {
        id: 'tpl-t1',
        clipId: 'tpl-clip-t1',
        position: 0,
        duration: 5,
        track: 'text',
        startTime: 0,
        endTime: 5,
        textContent: '오늘의 연습',
        textFont: 'noto-sans',
        textFontSize: 36,
        textColor: '#FFFFFF',
        textAlign: 'center',
        textBold: true,
        textAnimation: 'slide-up',
        textPosition: { x: 50, y: 15 },
      },
      {
        id: 'tpl-t2',
        clipId: 'tpl-clip-t2',
        position: 10,
        duration: 4,
        track: 'text',
        startTime: 0,
        endTime: 4,
        textContent: '슬로우 모션 분석',
        textFont: 'noto-sans',
        textFontSize: 24,
        textColor: '#FFD700',
        textAlign: 'center',
        textAnimation: 'fade-in',
        textPosition: { x: 50, y: 85 },
      },
    ],
  },
  {
    id: 'sns-shorts',
    name: 'SNS 쇼츠',
    description: '짧은 하이라이트 클립',
    icon: '📱',
    aspectRatio: '9:16',
    duration: 15,
    tagColor: 'bg-pink-100 text-pink-700',
    tag: 'SNS',
    timeline: [
      {
        id: 'tpl-v1',
        clipId: 'tpl-clip-v1',
        position: 0,
        duration: 3,
        track: 'video',
        startTime: 0,
        endTime: 3,
        speed: 1,
      },
      {
        id: 'tpl-v2',
        clipId: 'tpl-clip-v2',
        position: 3,
        duration: 4,
        track: 'video',
        startTime: 0,
        endTime: 4,
        speed: 0.3,
        transitions: { in: 'zoom' },
      },
      {
        id: 'tpl-v3',
        clipId: 'tpl-clip-v3',
        position: 7,
        duration: 3,
        track: 'video',
        startTime: 0,
        endTime: 3,
        speed: 1,
        transitions: { in: 'fade' },
      },
      {
        id: 'tpl-s1',
        clipId: 'tpl-clip-s1',
        position: 3,
        duration: 4,
        track: 'sticker',
        startTime: 0,
        endTime: 4,
        stickerEmoji: '🔥',
        stickerName: 'Fire',
        stickerAnimation: 'bounce',
        stickerScale: 1.5,
        stickerPosition: { x: 80, y: 20 },
      },
      {
        id: 'tpl-a1',
        clipId: 'tpl-clip-a1',
        position: 0,
        duration: 10,
        track: 'audio',
        startTime: 0,
        endTime: 10,
        audioBgm: { id: 'hiphop-1', name: 'Hip Hop Beat', volume: 0.7 },
        audioVolume: 70,
      },
    ],
  },
  {
    id: 'analysis-video',
    name: '분석 영상',
    description: '스윙 비교 분석',
    icon: '📊',
    aspectRatio: '16:9',
    duration: 45,
    tagColor: 'bg-green-100 text-green-700',
    tag: '분석',
    timeline: [
      {
        id: 'tpl-v1',
        clipId: 'tpl-clip-v1',
        position: 0,
        duration: 8,
        track: 'video',
        startTime: 0,
        endTime: 8,
        speed: 1,
      },
      {
        id: 'tpl-v2',
        clipId: 'tpl-clip-v2',
        position: 8,
        duration: 8,
        track: 'video',
        startTime: 0,
        endTime: 8,
        speed: 0.25,
        transitions: { in: 'slide' },
      },
      {
        id: 'tpl-t1',
        clipId: 'tpl-clip-t1',
        position: 0,
        duration: 4,
        track: 'text',
        startTime: 0,
        endTime: 4,
        textContent: '스윙 분석',
        textFont: 'noto-sans',
        textFontSize: 40,
        textColor: '#FFFFFF',
        textAlign: 'center',
        textBold: true,
        textAnimation: 'fade-in',
        textPosition: { x: 50, y: 10 },
      },
      {
        id: 'tpl-t2',
        clipId: 'tpl-clip-t2',
        position: 8,
        duration: 8,
        track: 'text',
        startTime: 0,
        endTime: 8,
        textContent: '0.25x 슬로우 모션',
        textFont: 'noto-sans',
        textFontSize: 20,
        textColor: '#FF6B6B',
        textAlign: 'center',
        textAnimation: 'fade-in',
        textPosition: { x: 50, y: 90 },
      },
      {
        id: 'tpl-f1',
        clipId: 'tpl-clip-f1',
        position: 8,
        duration: 8,
        track: 'filter',
        startTime: 0,
        endTime: 8,
        filterPreset: 'vivid',
        filterBrightness: 10,
        filterContrast: 15,
        filterSaturation: 20,
      },
    ],
  },
];
