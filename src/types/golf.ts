/**
 * @file golf.ts
 * @description GolfSnap 앱의 핵심 타입 정의 파일
 *
 * 이 파일은 앱 전체에서 사용되는 모든 TypeScript 인터페이스와 타입을 정의합니다.
 * 주요 구성요소:
 * 1. 골프 샷 데이터 (ShotData) - 스크린골프 측정 데이터
 * 2. 영상 클립 (VideoClip) - 개별 영상 클립 정보
 * 3. 타임라인 아이템 (TimelineItem) - 멀티트랙 편집 요소
 * 4. 스티커 (StickerItem) - 골프 관련 이모지 스티커
 * 5. 프로젝트 (Project) - 편집 프로젝트 전체 구조
 */

// ============================================================================
// 골프 샷 관련 타입
// ============================================================================

/**
 * 골프 클럽 종류 타입
 *
 * 스크린골프에서 사용되는 모든 클럽 유형을 정의합니다.
 * - Driver: 드라이버 (티샷용)
 * - Wood: 우드 클럽 (3번, 5번)
 * - Iron: 아이언 클럽 (3~9번)
 * - Wedge: 웨지 클럽 (PW: 피칭웨지, SW: 샌드웨지)
 * - Putter: 퍼터 (그린 위 퍼팅용)
 */
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
  | 'PW'    // Pitching Wedge (피칭웨지)
  | 'SW'    // Sand Wedge (샌드웨지)
  | 'Putter';

/**
 * 골프 샷 데이터 인터페이스
 *
 * 스크린골프 시뮬레이터에서 측정된 샷 데이터를 저장합니다.
 * AI 분석 및 영상 편집 시 오버레이 표시에 활용됩니다.
 *
 * @example
 * const shot: ShotData = {
 *   id: 'shot-001',
 *   timestamp: 1704067200000,
 *   ballSpeed: 165,      // 볼 스피드 165mph
 *   clubSpeed: 105,      // 클럽 스피드 105mph
 *   launchAngle: 12.5,   // 발사각 12.5도
 *   backSpin: 2800,      // 백스핀 2800rpm
 *   sideSpin: -200,      // 사이드스핀 -200rpm (좌측 스핀)
 *   distance: 280,       // 비거리 280야드
 *   accuracy: 95,        // 정확도 95%
 *   club: 'Driver'
 * };
 */
export interface ShotData {
  /** 샷 고유 식별자 */
  id: string;

  /** 샷 기록 시간 (Unix timestamp, milliseconds) */
  timestamp: number;

  /** 볼 스피드 (mph - miles per hour) */
  ballSpeed: number;

  /** 클럽 헤드 스피드 (mph - miles per hour) */
  clubSpeed: number;

  /** 발사각 (degrees - 도) */
  launchAngle: number;

  /** 백스핀 (rpm - revolutions per minute) */
  backSpin: number;

  /** 사이드스핀 (rpm - 양수: 우측, 음수: 좌측) */
  sideSpin: number;

  /** 비거리 (yards - 야드) */
  distance: number;

  /** 정확도 (percentage - 0~100%) */
  accuracy: number;

  /** 사용 클럽 종류 */
  club: ClubType;

  /** 샷 영상 URL (선택적) */
  videoUrl?: string;

  /** 썸네일 이미지 URL (선택적) */
  thumbnail?: string;
}

// ============================================================================
// 영상 클립 관련 타입
// ============================================================================

/**
 * 영상 클립 인터페이스
 *
 * 타임라인에 추가할 개별 영상 클립의 정보를 정의합니다.
 * 각 클립은 골프 샷 데이터와 연결되어 있습니다.
 */
export interface VideoClip {
  /** 클립 고유 식별자 */
  id: string;

  /** 연결된 골프 샷 ID */
  shotId: string;

  /** 원본 영상에서 클립 시작 시간 (초) */
  startTime: number;

  /** 원본 영상에서 클립 종료 시간 (초) */
  endTime: number;

  /** 클립 재생 시간 (초) */
  duration: number;

  /** 썸네일 이미지 URL */
  thumbnail: string;

  /** 원본 영상 URL */
  videoUrl: string;

  /** 연결된 골프 샷 데이터 */
  shotData: ShotData;
}

// ============================================================================
// 타임라인 관련 타입
// ============================================================================

/**
 * 전환 효과 타입
 *
 * 클립 간 전환 시 적용할 수 있는 효과 종류
 * - fade: 페이드 인/아웃
 * - slide: 슬라이드 효과
 * - zoom: 확대/축소 효과
 * - none: 효과 없음 (바로 전환)
 */
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'none';

/**
 * 비디오 이펙트 인터페이스
 *
 * 클립에 적용할 수 있는 특수 효과 정의
 */
export interface Effect {
  /** 이펙트 고유 식별자 */
  id: string;

  /**
   * 이펙트 타입
   * - slowmotion: 슬로우모션 효과
   * - highlight: 하이라이트 강조
   * - tracer: 볼 궤적 트레이서
   * - data-overlay: 샷 데이터 오버레이
   */
  type: 'slowmotion' | 'highlight' | 'tracer' | 'data-overlay';

  /** 이펙트 파라미터 (타입별로 다름) */
  params: Record<string, any>;
}

/**
 * 스티커 애니메이션 타입
 *
 * 스티커에 적용할 수 있는 애니메이션 효과
 * - bounce: 위아래 튕기기
 * - pulse: 확대/축소 반복
 * - shake: 좌우 흔들기
 * - spin: 360도 회전
 * - explode: 폭발 효과
 * - float: 부유 효과
 * - zoom-in: 확대 등장
 * - sparkle: 반짝임 효과
 */
export type StickerAnimationType =
  | 'bounce'
  | 'pulse'
  | 'shake'
  | 'spin'
  | 'explode'
  | 'float'
  | 'zoom-in'
  | 'sparkle';

/**
 * 스티커 아이템 인터페이스
 *
 * 영상에 추가할 수 있는 이모지 스티커 정의
 * 골프 관련, 축하, 감정, 효과 카테고리로 분류됩니다.
 *
 * @example
 * const sticker: StickerItem = {
 *   id: 'sticker-golf-ball',
 *   name: '골프공',
 *   emoji: '⛳',
 *   animation: 'bounce',
 *   category: 'golf'
 * };
 */
export interface StickerItem {
  /** 스티커 고유 식별자 */
  id: string;

  /** 스티커 이름 (한글) */
  name: string;

  /** 이모지 문자 */
  emoji: string;

  /** 기본 애니메이션 효과 */
  animation: StickerAnimationType;

  /**
   * 카테고리
   * - golf: 골프 관련 (골프공, 클럽, 홀인원 등)
   * - celebration: 축하 (불꽃, 박수, 트로피 등)
   * - emotion: 감정 표현 (웃음, 놀람 등)
   * - effect: 시각 효과 (별, 하트 등)
   */
  category: 'golf' | 'celebration' | 'emotion' | 'effect';
}

/**
 * 타임라인 아이템 인터페이스
 *
 * 멀티트랙 타임라인의 개별 요소를 정의합니다.
 * 5개 트랙 유형을 지원합니다:
 * - video: 영상 클립
 * - text: 텍스트 오버레이
 * - audio: 오디오/BGM
 * - filter: 색상 필터
 * - sticker: 이모지 스티커
 *
 * 각 트랙 타입별로 전용 속성이 있습니다.
 */
export interface TimelineItem {
  /** 타임라인 아이템 고유 식별자 */
  id: string;

  /** 연결된 클립/미디어 ID */
  clipId: string;

  /** 타임라인 상의 시작 위치 (초) */
  position: number;

  /** 아이템 재생 시간 (초) */
  duration: number;

  /** 원본 클립에서의 시작 시간 (트리밍용, 초) */
  startTime?: number;

  /** 원본 클립에서의 종료 시간 (트리밍용, 초) */
  endTime?: number;

  /**
   * 트랙 유형
   * - video: 영상 트랙 (메인)
   * - text: 텍스트 오버레이 트랙
   * - audio: 오디오/BGM 트랙
   * - filter: 색상 필터 트랙
   * - sticker: 스티커 트랙
   */
  track: 'video' | 'text' | 'audio' | 'filter' | 'sticker';

  /** 전환 효과 설정 */
  transitions?: {
    in?: TransitionType;   // 시작 전환
    out?: TransitionType;  // 종료 전환
  };

  /** 적용된 이펙트 목록 */
  effects?: Effect[];

  /** 재생 속도 (0.1x ~ 8x, 기본값 1) */
  speed?: number;

  /** 볼륨 레벨 (0~1, 기본값 1) */
  volume?: number;

  // ========================================
  // 텍스트 트랙 전용 속성
  // ========================================

  /** 텍스트 내용 */
  textContent?: string;

  /** 폰트 패밀리명 */
  textFont?: string;

  /** 폰트 크기 (px) */
  textFontSize?: number;

  /** 텍스트 색상 (hex) */
  textColor?: string;

  /** 텍스트 정렬 */
  textAlign?: 'left' | 'center' | 'right';

  /** 굵게 여부 */
  textBold?: boolean;

  /** 기울임 여부 */
  textItalic?: boolean;

  /** 밑줄 여부 */
  textUnderline?: boolean;

  /** 텍스트 등장 애니메이션 */
  textAnimation?: string;

  /** 화면 상의 텍스트 위치 (0~1 비율) */
  textPosition?: { x: number; y: number };

  // ========================================
  // 오디오 트랙 전용 속성
  // ========================================

  /** 오디오 볼륨 (0~1) */
  audioVolume?: number;

  /** 음소거 여부 */
  audioMuted?: boolean;

  /** 배경 음악(BGM) 정보 */
  audioBgm?: {
    id: string;      // BGM 고유 ID
    name: string;    // BGM 이름
    volume: number;  // BGM 볼륨 (0~1)
  };

  // ========================================
  // 필터 트랙 전용 속성
  // ========================================

  /** 밝기 조정값 (-100 ~ 100) */
  filterBrightness?: number;

  /** 대비 조정값 (-100 ~ 100) */
  filterContrast?: number;

  /** 채도 조정값 (-100 ~ 100) */
  filterSaturation?: number;

  /** 색온도 조정값 (-100 ~ 100, 음수: 차가움, 양수: 따뜻함) */
  filterTemperature?: number;

  /** 필터 프리셋 이름 (예: 'vivid', 'warm', 'cool') */
  filterPreset?: string;

  // ========================================
  // 스티커 트랙 전용 속성
  // ========================================

  /** 스티커 ID */
  stickerId?: string;

  /** 스티커 이름 */
  stickerName?: string;

  /** 스티커 이모지 문자 */
  stickerEmoji?: string;

  /** 스티커 애니메이션 타입 */
  stickerAnimation?: StickerAnimationType;

  /** 스티커 크기 배율 (기본값 1) */
  stickerScale?: number;

  /** 화면 상의 스티커 위치 (0~1 비율) */
  stickerPosition?: { x: number; y: number };

}

// ============================================================================
// 프로젝트 및 미디어 관련 타입
// ============================================================================

/**
 * 화면 비율 타입
 *
 * 새 프로젝트 생성 시 선택할 수 있는 화면 비율
 * - 16:9: 가로형 (YouTube, TV 표준)
 * - 9:16: 세로형 (Instagram Reels, TikTok, YouTube Shorts)
 * - 1:1: 정사각형 (Instagram 피드)
 */
export type AspectRatio = '16:9' | '9:16' | '1:1';

/**
 * 미디어 아이템 인터페이스
 *
 * 갤러리에서 선택한 미디어 파일 정보
 */
export interface MediaItem {
  /** 미디어 고유 식별자 */
  id: string;

  /** 미디어 타입 (영상 또는 이미지) */
  type: 'video' | 'image';

  /** 미디어 파일 URI */
  uri: string;

  /** 썸네일 이미지 URI */
  thumbnail: string;

  /** 영상 길이 (초, 영상인 경우만) */
  duration?: number;

  /** 가로 해상도 (px) */
  width: number;

  /** 세로 해상도 (px) */
  height: number;
}

/**
 * 프로젝트 인터페이스
 *
 * 편집 프로젝트의 전체 구조를 정의합니다.
 * 프로젝트는 여러 클립과 타임라인 아이템을 포함합니다.
 *
 * @example
 * const project: Project = {
 *   id: 'project-001',
 *   name: '드라이버 샷 모음',
 *   createdAt: 1704067200000,
 *   updatedAt: 1704153600000,
 *   clips: [...],
 *   timeline: [...],
 *   duration: 45,
 *   aspectRatio: '9:16'
 * };
 */
export interface Project {
  /** 프로젝트 고유 식별자 */
  id: string;

  /** 프로젝트 이름 */
  name: string;

  /** 생성 시간 (Unix timestamp, milliseconds) */
  createdAt: number;

  /** 마지막 수정 시간 (Unix timestamp, milliseconds) */
  updatedAt: number;

  /** 프로젝트에 포함된 영상 클립 목록 */
  clips: VideoClip[];

  /** 타임라인 아이템 목록 (모든 트랙 포함) */
  timeline: TimelineItem[];

  /** 프로젝트 총 길이 (초) */
  duration: number;

  /** 프로젝트 썸네일 이미지 URL */
  thumbnail?: string;

  /** 화면 비율 설정 */
  aspectRatio?: AspectRatio;
}
