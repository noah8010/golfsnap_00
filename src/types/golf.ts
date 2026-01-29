// 골프 샷 데이터 타입 정의
export interface ShotData {
  id: string;
  timestamp: number;
  ballSpeed: number; // mph
  clubSpeed: number; // mph
  launchAngle: number; // degrees
  backSpin: number; // rpm
  sideSpin: number; // rpm
  distance: number; // yards
  accuracy: number; // percentage
  club: ClubType;
  videoUrl?: string;
  thumbnail?: string;
}

export type ClubType =
  | 'Driver'
  | '3Wood'
  | '5Wood'
  | '3Iron'
  | '4Iron'
  | '5Iron'
  | '6Iron'
  | '7Iron'
  | '8Iron'
  | '9Iron'
  | 'PW'
  | 'SW'
  | 'Putter';

export interface VideoClip {
  id: string;
  shotId: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnail: string;
  videoUrl: string;
  shotData: ShotData;
}

export interface TimelineItem {
  id: string;
  clipId: string;
  position: number;
  duration: number;
  startTime?: number;
  endTime?: number;
  track: 'video' | 'text' | 'audio' | 'filter' | 'sticker';
  transitions?: {
    in?: TransitionType;
    out?: TransitionType;
  };
  effects?: Effect[];
  speed?: number;
  volume?: number;
  // 텍스트 전용 속성
  textContent?: string;
  textFont?: string;
  textFontSize?: number;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  textBold?: boolean;
  textItalic?: boolean;
  textUnderline?: boolean;
  textAnimation?: string;
  textPosition?: { x: number; y: number };
  // 오디오 전용 속성
  audioVolume?: number;
  audioMuted?: boolean;
  audioBgm?: {
    id: string;
    name: string;
    volume: number;
  };
  // 필터 전용 속성
  filterBrightness?: number;
  filterContrast?: number;
  filterSaturation?: number;
  filterTemperature?: number;
  filterPreset?: string;
  // 스티커 전용 속성
  stickerId?: string;
  stickerName?: string;
  stickerEmoji?: string;
  stickerAnimation?: StickerAnimationType;
  stickerScale?: number;
  stickerPosition?: { x: number; y: number };
}

// 스티커 애니메이션 타입
export type StickerAnimationType =
  | 'bounce'
  | 'pulse'
  | 'shake'
  | 'spin'
  | 'explode'
  | 'float'
  | 'zoom-in'
  | 'sparkle';

// 스티커 아이템 정의
export interface StickerItem {
  id: string;
  name: string;
  emoji: string;
  animation: StickerAnimationType;
  category: 'golf' | 'celebration' | 'emotion' | 'effect';
}

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'none';

export interface Effect {
  id: string;
  type: 'slowmotion' | 'highlight' | 'tracer' | 'data-overlay';
  params: Record<string, any>;
}

export type AspectRatio = '16:9' | '9:16' | '1:1';

export interface MediaItem {
  id: string;
  type: 'video' | 'image';
  uri: string;
  thumbnail: string;
  duration?: number;
  width: number;
  height: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  clips: VideoClip[];
  timeline: TimelineItem[];
  duration: number;
  thumbnail?: string;
  aspectRatio?: AspectRatio;
}
