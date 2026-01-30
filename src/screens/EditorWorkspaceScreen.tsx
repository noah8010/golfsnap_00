import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Play,
  Pause,
  Maximize2,
  Scissors,
  Trash2,
  Copy as CopyIcon,
  Gauge,
  CheckSquare,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TimelineItem } from '../types/golf';
import { SpeedPanel } from '../components/SpeedPanel';
import { FilterPanel, FilterSettings } from '../components/FilterPanel';
import { AudioPanel, AudioSettings } from '../components/AudioPanel';
import { TextPanel, TextSettings } from '../components/TextPanel';
import { StickerPanel, StickerSettings } from '../components/StickerPanel';
import { ExportPanel } from '../components/ExportPanel';
import { TimelineClip } from '../components/TimelineClip';
import { useTimeline } from '../hooks/useTimeline';
import { usePinchZoom } from '../hooks/usePinchZoom';
import { TIMELINE_CONFIG, INITIAL_TIMELINE_CLIPS } from '../constants/editor';

/**
 * 에디터 워크스페이스 화면
 *
 * 구성:
 * - 상단 바: 뒤로가기, 제목 편집, 내보내기
 * - 미리보기: 비디오 + 텍스트/스티커 오버레이
 * - 타임라인: 5개 트랙 (영상/텍스트/오디오/필터/스티커)
 * - 하단 툴바: 조작 버튼 (다중선택/분할/속도/복제/삭제)
 * - 패널: Speed, Filter, Audio, Text, Sticker, Export
 */
export const EditorWorkspaceScreen: React.FC = () => {
  const { currentProject, setCurrentScreen } = useAppStore();
  const timelineRef = useRef<HTMLDivElement>(null);

  // ============================================
  // Timeline 상태 관리
  // ============================================
  const initialClips = useMemo(
    () => (currentProject?.timeline?.length ? currentProject.timeline : INITIAL_TIMELINE_CLIPS),
    [currentProject]
  );
  const {
    timelineClips,
    selectedClipId,
    selectedClip,
    setSelectedClipId,
    setScrollOffset,
    splitClip,
    duplicateClip,
    deleteClip,
    updateClipSpeed,
    trimClipStart,
    trimClipEnd,
    addClip,
    updateClip,
    moveClip,
  } = useTimeline(initialClips);

  // ============================================
  // UI 상태
  // ============================================
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [projectTitle, setProjectTitle] = useState(currentProject?.name || '새 프로젝트');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1);

  // ============================================
  // 패널 표시 상태
  // ============================================
  const [showSpeedPanel, setShowSpeedPanel] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTextClip, setEditingTextClip] = useState<TimelineItem | null>(null);
  const [editingAudioClip, setEditingAudioClip] = useState<TimelineItem | null>(null);
  const [editingFilterClip, setEditingFilterClip] = useState<TimelineItem | null>(null);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [editingStickerClip, setEditingStickerClip] = useState<TimelineItem | null>(null);

  // ============================================
  // 모바일 제스처 (핀치 줌)
  // ============================================
  usePinchZoom({
    ref: timelineRef,
    currentZoom: timelineZoom,
    minZoom: TIMELINE_CONFIG.ZOOM_MIN,
    maxZoom: TIMELINE_CONFIG.ZOOM_MAX,
    onZoomChange: setTimelineZoom,
  });

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500">프로젝트를 선택해주세요</p>
      </div>
    );
  }

  // 전체 타임라인 길이를 클립들의 끝 지점 중 가장 긴 것으로 계산
  const totalDuration = useMemo(() => {
    if (timelineClips.length === 0) return 60;
    
    const maxEndTime = Math.max(
      ...timelineClips.map((clip) => clip.position + clip.duration)
    );
    
    return Math.max(maxEndTime, 10); // 최소 10초
  }, [timelineClips]);

  // 타임라인 컨테이너 너비 (모바일 기준 고정값 사용)
  const MOBILE_TIMELINE_WIDTH = 393 - 64; // 모바일 너비 - 좌측 레이블(64px)
  
  // 스크롤 가능한 타임라인 너비 계산
  const { scrollableWidth, leftPadding } = useMemo(() => {
    // 중앙 플레이헤드가 0초부터 마지막까지 모두 도달하려면
    // 좌우 양쪽에 화면 너비의 절반만큼 여백 필요
    const containerWidth = MOBILE_TIMELINE_WIDTH;
    const paddingSeconds = (containerWidth / 2) / (TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom);
    const duration = paddingSeconds + totalDuration + paddingSeconds; // 좌측 + 실제 + 우측
    const width = duration * TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom;
    const padding = paddingSeconds * TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom;
    
    return {
      scrollableWidth: width,
      leftPadding: padding
    };
  }, [totalDuration, timelineZoom]);

  // ============================================
  // 기본 핸들러
  // ============================================
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleBack = () => setCurrentScreen('create');
  const handleExport = () => setShowExportPanel(true);

  // ============================================
  // 클립 조작 핸들러
  // ============================================
  const handleSplitClip = () => {
    if (!selectedClipId) return;
    
    const clip = timelineClips.find((c) => c.id === selectedClipId);
    if (!clip) return;

    // 텍스트/스티커 트랙은 분할 불가
    if (clip.track === 'text' || clip.track === 'sticker') {
      alert('텍스트/스티커 클립은 분할할 수 없습니다');
      return;
    }
    
      // 타임라인 컨테이너의 중앙 위치 계산
      if (!timelineRef.current) return;
      const containerWidth = timelineRef.current.clientWidth;
      const centerOffset = containerWidth / 2;
      
      // scrollLeft를 직접 읽어서 최신 값 사용
      let currentScrollLeft = timelineRef.current.scrollLeft;
      
      // scrollLeft가 0이면 아직 초기화 안된 것 → leftPadding 사용
      if (currentScrollLeft === 0 && leftPadding > 0) {
        currentScrollLeft = leftPadding;
        timelineRef.current.scrollLeft = leftPadding;
        setScrollOffset(leftPadding);
      }
      
      const playheadPixelPosition = currentScrollLeft + centerOffset;
      
      // 좌측 여백을 고려하여 실제 타임라인 시간으로 변환
      const actualTimelinePosition = playheadPixelPosition - leftPadding;
      const playheadTime = actualTimelinePosition / (TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom);
    
    // 플레이헤드가 클립 범위 내에 있는지 확인
    const clipStart = clip.position;
    const clipEnd = clip.position + clip.duration;
    
    if (playheadTime < clipStart || playheadTime > clipEnd) {
      alert('중앙 플레이헤드가 클립 위에 있지 않습니다');
      return;
    }

    const splitPoint = playheadTime - clip.position;
    
    const success = splitClip(selectedClipId, splitPoint);

    if (!success) {
      alert('분할할 수 없습니다. 최소 길이를 확인하세요.');
    }
  };

  const handleDuplicateClip = () => {
    if (selectedClipId) {
      duplicateClip(selectedClipId);
    }
  };

  const handleDeleteClip = () => {
    if (selectedClipId) {
      deleteClip(selectedClipId);
      setShowDeleteConfirm(false);
    }
  };

  const handleApplySpeed = (speed: number) => {
    if (selectedClipId) {
      updateClipSpeed(selectedClipId, speed);
    }
  };

  const handleMultiSelect = () => {
    // TODO: 다중선택 기능 구현 (docs/TIMELINE_IMPROVEMENTS.md 참고)
    alert('다중선택 기능은 추후 구현 예정입니다');
  };

  // ============================================
  // 패널 핸들러
  // ============================================
  const handleApplyFilter = (filters: FilterSettings) => {
    if (editingFilterClip) {
      // 수정 모드
      updateClip(editingFilterClip.id, {
        filterBrightness: filters.brightness,
        filterContrast: filters.contrast,
        filterSaturation: filters.saturation,
        filterTemperature: filters.temperature,
        filterPreset: filters.preset,
      });
      setShowFilterPanel(false);
      setEditingFilterClip(null);
    } else {
      // 새로 추가
      // 현재 플레이헤드 위치 계산
      const playheadTime = getPlayheadTime();

      // 비디오 범위 계산
      const videoClips = timelineClips.filter((c) => c.track === 'video');
      
      if (videoClips.length === 0) {
        alert('먼저 비디오 클립을 추가해주세요');
        setShowFilterPanel(false);
        setEditingFilterClip(null);
        return;
      }
      
      const videoEnd = Math.max(...videoClips.map((c) => c.position + c.duration));
      const duration = 5;
      
      // 길이가 비디오보다 길면 비디오 길이로 제한
      const finalDuration = Math.min(duration, videoEnd);
      
      // 위치를 비디오 범위 내로 제한 (중앙 플레이헤드 기준)
      const clampedPosition = Math.max(0, Math.min(playheadTime, videoEnd - finalDuration));

      // 새 필터 클립 생성 (중앙 플레이헤드 위치, 비디오 범위 내)
      const newFilterClip: TimelineItem = {
        id: `filter-${Date.now()}`,
        clipId: `filter-clip-${Date.now()}`,
        position: clampedPosition, // 중앙 플레이헤드 위치
        duration: finalDuration, // 비디오 길이 내로 제한
        track: 'filter',
        startTime: 0,
        endTime: finalDuration,
        filterBrightness: filters.brightness,
        filterContrast: filters.contrast,
        filterSaturation: filters.saturation,
        filterTemperature: filters.temperature,
        filterPreset: filters.preset,
      };

      addClip(newFilterClip);
      setShowFilterPanel(false);
    }
  };

  const handleApplyAudio = (audio: AudioSettings) => {
    if (editingAudioClip) {
      // 수정 모드
      updateClip(editingAudioClip.id, {
        audioVolume: audio.volume,
        audioMuted: audio.muted,
        audioBgm: audio.bgm,
      });
      setShowAudioPanel(false);
      setEditingAudioClip(null);
    } else {
      // 새로 추가
      // 현재 플레이헤드 위치 계산
      const playheadTime = getPlayheadTime();

      // 비디오 범위 계산
      const videoClips = timelineClips.filter((c) => c.track === 'video');
      
      if (videoClips.length === 0) {
        alert('먼저 비디오 클립을 추가해주세요');
        setShowAudioPanel(false);
        return;
      }
      
      const videoEnd = Math.max(...videoClips.map((c) => c.position + c.duration));
      const duration = audio.bgm ? 30 : 5;
      
      // 길이가 비디오보다 길면 비디오 길이로 제한
      const finalDuration = Math.min(duration, videoEnd);
      
      // 위치를 비디오 범위 내로 제한 (중앙 플레이헤드 기준)
      const clampedPosition = Math.max(0, Math.min(playheadTime, videoEnd - finalDuration));

      // 새 오디오 클립 생성 (중앙 플레이헤드 위치, 비디오 범위 내)
      const newAudioClip: TimelineItem = {
        id: `audio-${Date.now()}`,
        clipId: `audio-clip-${Date.now()}`,
        position: clampedPosition, // 중앙 플레이헤드 위치
        duration: finalDuration, // 비디오 길이 내로 제한
        track: 'audio',
        startTime: 0,
        endTime: finalDuration,
        audioVolume: audio.volume,
        audioMuted: audio.muted,
        audioBgm: audio.bgm,
      };

      addClip(newAudioClip);
      setShowAudioPanel(false);
    }
  };

  const handleAddText = (text: TextSettings) => {
    if (editingTextClip) {
      // 수정 모드
      updateClip(editingTextClip.id, {
        textContent: text.content,
        textFont: text.font,
        textFontSize: text.fontSize,
        textColor: text.color,
        textAlign: text.align,
        textBold: text.style.bold,
        textItalic: text.style.italic,
        textUnderline: text.style.underline,
        textAnimation: text.animation,
        textPosition: text.position,
      });
      setEditingTextClip(null);
    } else {
      // 새로 추가
      // 현재 플레이헤드 위치 계산
      const playheadTime = getPlayheadTime();

      // 비디오 범위 계산
      const videoClips = timelineClips.filter((c) => c.track === 'video');
      
      if (videoClips.length === 0) {
        alert('먼저 비디오 클립을 추가해주세요');
        setShowTextPanel(false);
        return;
      }

      const videoEnd = Math.max(...videoClips.map((c) => c.position + c.duration));
      const duration = text.duration || 5;

      // 길이가 비디오보다 길면 비디오 길이로 제한
      const finalDuration = Math.min(duration, videoEnd);

      // 위치를 비디오 범위 내로 제한 (중앙 플레이헤드 기준)
      const clampedPosition = Math.max(0, Math.min(playheadTime, videoEnd - finalDuration));

      console.log('[TextClip] 생성:', {
        playheadTime,
        videoEnd,
        requestedDuration: duration,
        finalDuration,
        clampedPosition,
        range: `${clampedPosition}~${clampedPosition + finalDuration}초`
      });

      // 새 텍스트 클립 생성 (중앙 플레이헤드 위치, 비디오 범위 내)
      const newTextClip: TimelineItem = {
        id: `text-${Date.now()}`,
        clipId: `text-clip-${Date.now()}`,
        position: clampedPosition, // 중앙 플레이헤드 위치
        duration: finalDuration, // 비디오 길이 내로 제한
        track: 'text',
        startTime: 0,
        endTime: finalDuration,
        textContent: text.content,
        textFont: text.font,
        textFontSize: text.fontSize,
        textColor: text.color,
        textAlign: text.align,
        textBold: text.style.bold,
        textItalic: text.style.italic,
        textUnderline: text.style.underline,
        textAnimation: text.animation,
        textPosition: text.position,
      };

      // 타임라인에 추가
      addClip(newTextClip);
    }
    
    setShowTextPanel(false);
  };

  const handleAddSticker = (sticker: StickerSettings) => {
    if (editingStickerClip) {
      // 수정 모드
      updateClip(editingStickerClip.id, {
        stickerId: sticker.stickerId,
        stickerName: sticker.name,
        stickerEmoji: sticker.emoji,
        stickerAnimation: sticker.animation,
        stickerScale: sticker.scale,
        stickerPosition: sticker.position,
        duration: sticker.duration || editingStickerClip.duration,
      });
      setEditingStickerClip(null);
    } else {
      // 새로 추가
      const playheadTime = getPlayheadTime();

      // 비디오 범위 계산
      const videoClips = timelineClips.filter((c) => c.track === 'video');

      if (videoClips.length === 0) {
        alert('먼저 비디오 클립을 추가해주세요');
        setShowStickerPanel(false);
        return;
      }

      const videoEnd = Math.max(...videoClips.map((c) => c.position + c.duration));
      const duration = sticker.duration || 3;

      // 길이가 비디오보다 길면 비디오 길이로 제한
      const finalDuration = Math.min(duration, videoEnd);

      // 위치를 비디오 범위 내로 제한
      const clampedPosition = Math.max(0, Math.min(playheadTime, videoEnd - finalDuration));

      // 새 스티커 클립 생성
      const newStickerClip: TimelineItem = {
        id: `sticker-${Date.now()}`,
        clipId: `sticker-clip-${Date.now()}`,
        position: clampedPosition,
        duration: finalDuration,
        track: 'sticker',
        startTime: 0,
        endTime: finalDuration,
        stickerId: sticker.stickerId,
        stickerName: sticker.name,
        stickerEmoji: sticker.emoji,
        stickerAnimation: sticker.animation,
        stickerScale: sticker.scale,
        stickerPosition: sticker.position,
      };

      addClip(newStickerClip);
    }

    setShowStickerPanel(false);
  };

  // 플레이헤드 시간 계산 함수 (공통)
  const getPlayheadTime = React.useCallback(() => {
    if (!timelineRef.current) return 0;

    const containerWidth = timelineRef.current.clientWidth;
    const centerOffset = containerWidth / 2;

    // scrollLeft를 직접 읽어서 최신 값 사용
    let currentScrollLeft = timelineRef.current.scrollLeft;

    // scrollLeft가 0이면 아직 초기화 안된 것 → leftPadding 사용
    if (currentScrollLeft === 0 && leftPadding > 0) {
      currentScrollLeft = leftPadding;
      timelineRef.current.scrollLeft = leftPadding;
      setScrollOffset(leftPadding);
    }

    const playheadPixelPosition = currentScrollLeft + centerOffset;
    const actualTimelinePosition = playheadPixelPosition - leftPadding;
    const playheadTime = actualTimelinePosition / (TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom);

    return Math.max(0, playheadTime);
  }, [leftPadding, timelineZoom]);

  // 초기 스크롤 위치 설정 (0초가 중앙에 오도록)
  React.useLayoutEffect(() => {
    if (timelineRef.current && leftPadding > 0) {
      // 좌측 여백으로 스크롤하여 0초를 중앙에 배치
      timelineRef.current.scrollLeft = leftPadding;
      // scrollOffset state도 직접 업데이트 (onScroll 이벤트 없이)
      setScrollOffset(leftPadding);
      console.log('[Timeline] 초기 스크롤 위치 설정:', leftPadding);
    }
  }, [leftPadding, timelineZoom]); // zoom 변경 시에도 재조정

  // 유틸리티 함수
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col h-full bg-gray-50">
      {/* Status Bar Spacer - 모바일 상단 UI 영역 */}
      <div className="flex-shrink-0 h-11 bg-white" />

      {/* Top Bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center -ml-2"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </motion.button>
            {isEditingTitle ? (
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="flex-1 min-w-0 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-900 text-base font-bold focus:outline-none focus:ring-2 focus:ring-golf-green"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-lg font-bold text-gray-900 cursor-pointer hover:text-golf-green transition-colors truncate"
              >
                {projectTitle}
              </h1>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="flex-shrink-0 ml-3 px-4 py-2 bg-golf-green rounded-lg hover:bg-golf-green/90 transition-colors"
          >
            <span className="text-sm font-semibold text-white">만들기</span>
          </motion.button>
        </div>
      </div>

      {/* Preview Player */}
      <div className="flex-shrink-0 bg-gray-900 relative" style={{ height: '45%' }}>
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div
            className="relative shadow-2xl overflow-hidden"
            style={{
              aspectRatio:
                currentProject.aspectRatio === '16:9' ? '16/9' : currentProject.aspectRatio === '9:16' ? '9/16' : '1/1',
              maxHeight: '100%',
              maxWidth: currentProject.aspectRatio === '9:16' ? '60%' : '95%',
            }}
          >
            {/* 썸네일 이미지 또는 기본 배경 */}
            {currentProject.thumbnail ? (
              <img
                src={currentProject.thumbnail}
                alt="미리보기"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <Play className="w-16 h-16 text-gray-600" />
              </div>
            )}

            {/* 재생 컨트롤 오버레이 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePlayPause}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" fill="currentColor" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                  )}
                </motion.button>
              </div>

              <div className="absolute bottom-3 left-3 text-white text-xs font-mono bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </div>

              <motion.button 
                whileTap={{ scale: 0.9 }} 
                className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            {/* 텍스트 오버레이 */}
            {timelineClips
              .filter((clip) => clip.track === 'text')
              .filter((clip) =>
                currentTime >= clip.position &&
                currentTime < clip.position + clip.duration
              )
              .map((clip) => (
                <motion.div
                  key={clip.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${clip.textPosition?.x}%`,
                    top: `${clip.textPosition?.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${(clip.textFontSize || 32) / 2}px`,
                    color: clip.textColor || '#FFFFFF',
                    fontWeight: clip.textBold ? 'bold' : 'normal',
                    fontStyle: clip.textItalic ? 'italic' : 'normal',
                    textDecoration: clip.textUnderline ? 'underline' : 'none',
                    textAlign: clip.textAlign || 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    maxWidth: '80%',
                    wordBreak: 'keep-all',
                  }}
                >
                  {clip.textContent}
                </motion.div>
              ))
            }

            {/* 스티커 오버레이 */}
            {timelineClips
              .filter((clip) => clip.track === 'sticker')
              .filter((clip) =>
                currentTime >= clip.position &&
                currentTime < clip.position + clip.duration
              )
              .map((clip) => (
                <motion.div
                  key={clip.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: clip.stickerScale || 1,
                    ...(clip.stickerAnimation === 'bounce' && {
                      y: [0, -10, 0],
                      transition: { repeat: Infinity, duration: 0.6 }
                    }),
                    ...(clip.stickerAnimation === 'pulse' && {
                      scale: [(clip.stickerScale || 1), (clip.stickerScale || 1) * 1.2, (clip.stickerScale || 1)],
                      transition: { repeat: Infinity, duration: 0.8 }
                    }),
                    ...(clip.stickerAnimation === 'shake' && {
                      x: [-2, 2, -2, 2, 0],
                      transition: { repeat: Infinity, duration: 0.4 }
                    }),
                    ...(clip.stickerAnimation === 'spin' && {
                      rotate: [0, 360],
                      transition: { repeat: Infinity, duration: 2, ease: 'linear' }
                    }),
                    ...(clip.stickerAnimation === 'float' && {
                      y: [0, -5, 0],
                      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                    }),
                    ...(clip.stickerAnimation === 'sparkle' && {
                      opacity: [1, 0.5, 1],
                      scale: [(clip.stickerScale || 1), (clip.stickerScale || 1) * 1.1, (clip.stickerScale || 1)],
                      transition: { repeat: Infinity, duration: 0.8 }
                    }),
                  }}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${clip.stickerPosition?.x || 50}%`,
                    top: `${clip.stickerPosition?.y || 50}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${32 * (clip.stickerScale || 1)}px`,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                  }}
                >
                  {clip.stickerEmoji}
                </motion.div>
              ))
            }

            {/* 화면 비율 표시 */}
            <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-xs text-white font-semibold">
              {currentProject.aspectRatio || '16:9'}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="flex-1 flex bg-white overflow-hidden relative">
        {/* 좌측 트랙 레이블 (고정 컬럼) */}
        <div className="flex-shrink-0 w-16 bg-gray-100 border-r border-gray-200 flex flex-col">
          {/* 줌 컨트롤 영역 */}
          <div className="h-[38px] border-b border-gray-200" />
          {/* Time Ruler 공간 */}
          <div className="h-6 border-b border-gray-200" />
          {/* 영상 트랙 레이블 */}
          <div className="h-16 border-b border-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-600 font-medium">영상</span>
          </div>
          {/* 텍스트 트랙 레이블 */}
          <button 
            className="h-12 border-b border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
            onClick={() => setShowTextPanel(true)}
          >
            <span className="text-xs text-gray-600 font-medium">텍스트</span>
          </button>
          {/* 오디오 트랙 레이블 */}
          <button 
            className="h-12 border-b border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
            onClick={() => setShowAudioPanel(true)}
          >
            <span className="text-xs text-gray-600 font-medium">오디오</span>
          </button>
          {/* 필터 트랙 레이블 */}
          <button
            className="h-12 border-b border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
            onClick={() => setShowFilterPanel(true)}
          >
            <span className="text-xs text-gray-600 font-medium">필터</span>
          </button>
          {/* 스티커 트랙 레이블 */}
          <button
            className="h-12 border-b border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
            onClick={() => setShowStickerPanel(true)}
          >
            <span className="text-xs text-gray-600 font-medium">스티커</span>
          </button>
        </div>

        {/* 우측 타임라인 영역 (스크롤) */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* 줌 컨트롤 */}
          <div className="flex-shrink-0 px-4 py-2 bg-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">타임라인</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTimelineZoom(Math.max(TIMELINE_CONFIG.ZOOM_MIN, timelineZoom - TIMELINE_CONFIG.ZOOM_STEP))}
                  className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                >
                  -
                </button>
                <span className="text-xs text-gray-600 w-8 text-center font-medium">{timelineZoom}x</span>
                <button
                  onClick={() => setTimelineZoom(Math.min(TIMELINE_CONFIG.ZOOM_MAX, timelineZoom + TIMELINE_CONFIG.ZOOM_STEP))}
                  className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div
            ref={timelineRef}
            className="flex-1 overflow-x-auto overflow-y-auto scrollbar-hide cursor-grab active:cursor-grabbing"
            onScroll={(e) => {
              const target = e.target as HTMLElement;
              setScrollOffset(target.scrollLeft);
              // 중앙 플레이헤드 위치 기준으로 실제 타임라인 시간 계산
              const containerWidth = target.clientWidth;
              const centerOffset = containerWidth / 2;
              const playheadPixelPosition = target.scrollLeft + centerOffset;
              const actualTimelinePosition = playheadPixelPosition - leftPadding;
              const time = actualTimelinePosition / (TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom);
              setCurrentTime(Math.max(0, time));
            }}
            onClick={(e) => {
              // 빈 공간 클릭 시 선택 취소
              if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.timeline-background')) {
                setSelectedClipId(null);
              }
            }}
            onMouseDown={(e) => {
              // 클립 또는 트림 핸들러 영역이면 스크롤 방지
              const target = e.target as HTMLElement;
              if (target.closest('.timeline-clip') || target.closest('.trim-handle')) return;
              
              const el = e.currentTarget;
              const startX = e.pageX - el.offsetLeft;
              const scrollLeft = el.scrollLeft;

              const onMouseMove = (e: MouseEvent) => {
                const x = e.pageX - el.offsetLeft;
                const walk = (x - startX) * 2;
                el.scrollLeft = scrollLeft - walk;
              };

              const onMouseUp = () => {
                el.classList.remove('cursor-grabbing');
                el.classList.add('cursor-grab');
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };

              el.classList.remove('cursor-grab');
              el.classList.add('cursor-grabbing');
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              touchAction: 'pan-x pan-y',
            }}
          >
            <style>{`
              .timeline-scrollable::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div
              className="relative timeline-background"
              style={{ width: `${scrollableWidth}px`, minHeight: '100%' }}
            >
              {/* Time Ruler */}
              <div className="sticky top-0 z-10 h-6 bg-gray-100 border-b border-gray-200 flex">
                {/* 좌측 여백 */}
                <div style={{ width: `${leftPadding}px`, flexShrink: 0 }} />
                {/* 실제 타임라인 눈금 */}
                {Array.from({ length: Math.ceil(totalDuration / 5) }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 border-r border-gray-200 text-xs text-gray-600 px-1"
                    style={{ width: `${5 * TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom}px` }}
                  >
                    {i * 5}s
                  </div>
                ))}
              </div>

              {/* Video Track */}
              <div className="h-16 bg-gray-50 border-b border-gray-200 relative timeline-background" style={{ paddingLeft: `${leftPadding}px` }}>
                {timelineClips
                  .filter((clip) => clip.track === 'video')
                  .map((clip) => (
                    <TimelineClip
                      key={clip.id}
                      clip={clip}
                      isSelected={selectedClipId === clip.id}
                      zoom={timelineZoom}
                      isDraggable={true}
                      leftPadding={leftPadding}
                      onSelect={setSelectedClipId}
                      onMove={moveClip}
                      onTrimStart={trimClipStart}
                      onTrimEnd={trimClipEnd}
                    />
                  ))}
              </div>

            {/* Text Track */}
            <div className="h-12 bg-gray-50 border-b border-gray-200 relative timeline-background" style={{ paddingLeft: `${leftPadding}px` }}>
                {timelineClips
                  .filter((clip) => clip.track === 'text')
                  .map((clip) => (
                    <TimelineClip
                      key={clip.id}
                      clip={clip}
                      isSelected={selectedClipId === clip.id}
                      zoom={timelineZoom}
                      isDraggable={true}
                      leftPadding={leftPadding}
                      onSelect={setSelectedClipId}
                      onDoubleClick={(clip) => {
                        setEditingTextClip(clip);
                        setShowTextPanel(true);
                      }}
                      onMove={moveClip}
                      onTrimStart={trimClipStart}
                      onTrimEnd={trimClipEnd}
                    />
                  ))
                }
              </div>

            {/* Audio Track */}
            <div className="h-12 bg-gray-50 border-b border-gray-200 relative timeline-background" style={{ paddingLeft: `${leftPadding}px` }}>
                {timelineClips
                  .filter((clip) => clip.track === 'audio')
                  .map((clip) => (
                    <TimelineClip
                      key={clip.id}
                      clip={clip}
                      isSelected={selectedClipId === clip.id}
                      zoom={timelineZoom}
                      isDraggable={true}
                      leftPadding={leftPadding}
                      onSelect={setSelectedClipId}
                      onDoubleClick={(clip) => {
                        setEditingAudioClip(clip);
                        setShowAudioPanel(true);
                      }}
                      onMove={moveClip}
                      onTrimStart={trimClipStart}
                      onTrimEnd={trimClipEnd}
                    />
                  ))
                }
              </div>

            {/* Filter Track */}
            <div className="h-12 bg-gray-50 border-b border-gray-200 relative timeline-background" style={{ paddingLeft: `${leftPadding}px` }}>
                {timelineClips
                  .filter((clip) => clip.track === 'filter')
                  .map((clip) => (
                    <TimelineClip
                      key={clip.id}
                      clip={clip}
                      isSelected={selectedClipId === clip.id}
                      zoom={timelineZoom}
                      isDraggable={true}
                      leftPadding={leftPadding}
                      onSelect={setSelectedClipId}
                      onDoubleClick={(clip) => {
                        setEditingFilterClip(clip);
                        setShowFilterPanel(true);
                      }}
                      onMove={moveClip}
                      onTrimStart={trimClipStart}
                      onTrimEnd={trimClipEnd}
                    />
                  ))
                }
              </div>

            {/* Sticker Track */}
            <div className="h-12 bg-gray-50 border-b border-gray-200 relative timeline-background" style={{ paddingLeft: `${leftPadding}px` }}>
                {timelineClips
                  .filter((clip) => clip.track === 'sticker')
                  .map((clip) => (
                    <TimelineClip
                      key={clip.id}
                      clip={clip}
                      isSelected={selectedClipId === clip.id}
                      zoom={timelineZoom}
                      isDraggable={true}
                      leftPadding={leftPadding}
                      onSelect={setSelectedClipId}
                      onDoubleClick={(clip) => {
                        setEditingStickerClip(clip);
                        setShowStickerPanel(true);
                      }}
                      onMove={moveClip}
                      onTrimStart={trimClipStart}
                      onTrimEnd={trimClipEnd}
                    />
                  ))
                }
              </div>
            </div>
          </div>

          {/* Centered Playhead - Fixed to right panel */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none">
            <div
              className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full"
              style={{ top: `${TIMELINE_CONFIG.PLAYHEAD_TOP_OFFSET}px` }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-red-500"
              style={{ top: `${TIMELINE_CONFIG.PLAYHEAD_TOP_POSITION}px` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Toolbar - 트랙별 조작 버튼 */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around py-3 px-2">
          {/* 다중선택 - 모든 트랙 */}
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={handleMultiSelect}
            disabled={!selectedClipId}
            className={`flex flex-col items-center gap-0.5 min-w-0 ${!selectedClipId ? 'opacity-40' : ''}`}
          >
            <CheckSquare className="w-5 h-5 text-gray-700" />
            <span className="text-xs text-gray-600">다중선택</span>
          </motion.button>

          {/* 분할 - 영상/오디오/필터만 (텍스트/스티커 제외) */}
          {selectedClip && selectedClip.track !== 'text' && selectedClip.track !== 'sticker' && (
            <motion.button 
              whileTap={{ scale: 0.95 }} 
              onClick={handleSplitClip}
              className="flex flex-col items-center gap-0.5 min-w-0"
            >
              <Scissors className="w-5 h-5 text-gray-700" />
              <span className="text-xs text-gray-600">분할</span>
            </motion.button>
          )}

          {/* 속도 - 영상만 */}
          {selectedClip && selectedClip.track === 'video' && (
            <motion.button 
              whileTap={{ scale: 0.95 }} 
              onClick={() => setShowSpeedPanel(true)}
              className="flex flex-col items-center gap-0.5 min-w-0"
            >
              <Gauge className="w-5 h-5 text-gray-700" />
              <span className="text-xs text-gray-600">속도</span>
            </motion.button>
          )}

          {/* 복제 - 모든 트랙 */}
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={handleDuplicateClip}
            disabled={!selectedClipId}
            className={`flex flex-col items-center gap-0.5 min-w-0 ${!selectedClipId ? 'opacity-40' : ''}`}
          >
            <CopyIcon className="w-5 h-5 text-gray-700" />
            <span className="text-xs text-gray-600">복제</span>
          </motion.button>

          {/* 삭제 - 모든 트랙 */}
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!selectedClipId}
            className={`flex flex-col items-center gap-0.5 min-w-0 ${!selectedClipId ? 'opacity-40' : ''}`}
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <span className="text-xs text-gray-600">삭제</span>
          </motion.button>
        </div>
      </div>

      {/* Speed Panel */}
      <AnimatePresence>
        {showSpeedPanel && selectedClip && (
          <SpeedPanel currentSpeed={selectedClip.speed || 1} onApply={handleApplySpeed} onClose={() => setShowSpeedPanel(false)} />
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && (
          <FilterPanel 
            onApply={handleApplyFilter} 
            onClose={() => {
              setShowFilterPanel(false);
              setEditingFilterClip(null);
            }}
            currentFilters={editingFilterClip ? {
              brightness: editingFilterClip.filterBrightness || 0,
              contrast: editingFilterClip.filterContrast || 0,
              saturation: editingFilterClip.filterSaturation || 0,
              temperature: editingFilterClip.filterTemperature || 0,
              preset: editingFilterClip.filterPreset,
            } : undefined}
          />
        )}
      </AnimatePresence>

      {/* Audio Panel */}
      <AnimatePresence>
        {showAudioPanel && (
          <AudioPanel 
            onApply={handleApplyAudio} 
            onClose={() => {
              setShowAudioPanel(false);
              setEditingAudioClip(null);
            }}
            currentAudio={editingAudioClip ? {
              volume: editingAudioClip.audioVolume || 100,
              muted: editingAudioClip.audioMuted || false,
              bgm: editingAudioClip.audioBgm,
            } : undefined}
          />
        )}
      </AnimatePresence>

      {/* Text Panel */}
      <AnimatePresence>
        {showTextPanel && (
          <TextPanel
            onAdd={handleAddText}
            onClose={() => {
              setShowTextPanel(false);
              setEditingTextClip(null);
            }}
            editingText={editingTextClip ? {
              id: editingTextClip.id,
              content: editingTextClip.textContent || '',
              font: editingTextClip.textFont || 'noto-sans',
              fontSize: editingTextClip.textFontSize || 32,
              color: editingTextClip.textColor || '#FFFFFF',
              align: editingTextClip.textAlign || 'center',
              style: {
                bold: editingTextClip.textBold || false,
                italic: editingTextClip.textItalic || false,
                underline: editingTextClip.textUnderline || false,
              },
              animation: editingTextClip.textAnimation || 'fade-in',
              position: editingTextClip.textPosition || { x: 50, y: 50 },
              duration: editingTextClip.duration,
              startTime: editingTextClip.startTime,
            } : undefined}
          />
        )}
      </AnimatePresence>

      {/* Sticker Panel */}
      <AnimatePresence>
        {showStickerPanel && (
          <StickerPanel
            onAdd={handleAddSticker}
            onClose={() => {
              setShowStickerPanel(false);
              setEditingStickerClip(null);
            }}
            editingSticker={editingStickerClip ? {
              id: editingStickerClip.id,
              stickerId: editingStickerClip.stickerId || '',
              name: editingStickerClip.stickerName || '',
              emoji: editingStickerClip.stickerEmoji || '',
              animation: editingStickerClip.stickerAnimation || 'bounce',
              scale: editingStickerClip.stickerScale || 1,
              position: editingStickerClip.stickerPosition || { x: 50, y: 50 },
              duration: editingStickerClip.duration,
            } : undefined}
          />
        )}
      </AnimatePresence>

      {/* Export Panel */}
      <AnimatePresence>
        {showExportPanel && (
          <ExportPanel
            projectName={projectTitle}
            onClose={() => setShowExportPanel(false)}
            onComplete={() => {
              setShowExportPanel(false);
              setCurrentScreen('create');
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">클립 삭제</h3>
              <p className="text-sm text-gray-600 mb-6">선택한 클립을 삭제하시겠습니까?</p>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">
                  취소
                </motion.button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleDeleteClip} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700">
                  삭제
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
