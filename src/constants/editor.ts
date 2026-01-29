export const TIMELINE_CONFIG = {
  ZOOM_MIN: 0.5,
  ZOOM_MAX: 3,
  ZOOM_STEP: 0.25,
  PIXELS_PER_SECOND: 10,
  MIN_CLIP_DURATION: 0.1,
  SPEED_MIN: 0.1,
  SPEED_MAX: 8,
  PLAYHEAD_TOP_OFFSET: 52,
  PLAYHEAD_TOP_POSITION: 50,
} as const;

export const INITIAL_TIMELINE_CLIPS = [
  {
    id: 'clip-1',
    clipId: 'media-1',
    position: 0,
    duration: 15,
    track: 'video' as const,
    startTime: 0,
    endTime: 15,
    speed: 1,
  },
  {
    id: 'clip-2',
    clipId: 'media-2',
    position: 15,
    duration: 22,
    track: 'video' as const,
    startTime: 0,
    endTime: 22,
    speed: 1,
  },
  {
    id: 'clip-3',
    clipId: 'media-3',
    position: 37,
    duration: 18,
    track: 'video' as const,
    startTime: 0,
    endTime: 18,
    speed: 1,
  },
];

export const EDITOR_TABS = [
  { id: 'edit' as const, label: '편집' },
  { id: 'audio' as const, label: '오디오' },
  { id: 'text' as const, label: '텍스트' },
  { id: 'filter' as const, label: '필터' },
] as const;
