/**
 * @file EditorWorkspaceScreen.tsx
 * @description 영상 편집기 메인 화면 컴포넌트
 *
 * GolfSnap 앱의 핵심 기능인 영상 편집을 담당하는 화면입니다.
 * 모바일 환경에 최적화된 터치 기반 인터페이스를 제공합니다.
 *
 * ## 화면 구성
 * - 상단 바: 프로젝트명, Undo/Redo, 저장 상태, 내보내기
 * - 미리보기: PreviewPlayer 컴포넌트
 * - 타임라인: TimelineTrack 컴포넌트 × 5
 * - 하단 툴바: EditorToolbar 컴포넌트
 *
 * @see PreviewPlayer - 미리보기 플레이어
 * @see TimelineTrack - 타임라인 트랙
 * @see EditorToolbar - 하단 툴바
 */

import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Check,
  Loader2,
  Circle,
  Undo2,
  Redo2,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useToastStore } from '../store/useToastStore';
import { TimelineItem, TransitionType } from '../types/golf';
import { SpeedPanel } from '../components/SpeedPanel';
import { FilterPanel, FilterSettings } from '../components/FilterPanel';
import { AudioPanel, AudioSettings } from '../components/AudioPanel';
import { TextPanel, TextSettings } from '../components/TextPanel';
import { StickerPanel, StickerSettings } from '../components/StickerPanel';
import { ExportPanel } from '../components/ExportPanel';
import { AssistantPanel } from '../components/AssistantPanel';
import { ClipVolumePanel } from '../components/ClipVolumePanel';
import { TransitionPanel } from '../components/TransitionPanel';
import { PreviewPlayer } from '../components/PreviewPlayer';
import { EditorToolbar } from '../components/EditorToolbar';
import { TimelineTrack } from '../components/TimelineTrack';
import { useTimeline } from '../hooks/useTimeline';
import { usePinchZoom } from '../hooks/usePinchZoom';
import { usePlaybackSimulation } from '../hooks/usePlaybackSimulation';
import { TIMELINE_CONFIG, INITIAL_TIMELINE_CLIPS } from '../constants/editor';

/** 좌측 트랙 레이블 너비 (px) */
const LABEL_WIDTH = 64;

/**
 * 에디터 워크스페이스 화면 컴포넌트
 */
export const EditorWorkspaceScreen: React.FC = () => {
  const {
    currentProject,
    setCurrentScreen,
    updateProject,
    setCurrentProject,
    saveStatus,
    setSaveStatus,
    setLastSavedAt,
  } = useAppStore();

  // 히스토리 스토어 (Undo/Redo)
  const {
    initialize: initializeHistory,
    pushState: pushHistoryState,
    undo: historyUndo,
    redo: historyRedo,
    canUndo,
    canRedo,
  } = useHistoryStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // ============================================
  // Timeline 상태 관리
  // ============================================
  const initialClips = useMemo(
    () => (currentProject?.timeline?.length ? currentProject.timeline : INITIAL_TIMELINE_CLIPS),
    [currentProject]
  );
  const {
    timelineClips,
    setTimelineClips,
    selectedClipId,
    selectedClip,
    selectedClipIds,
    isMultiSelectMode,
    toggleMultiSelectMode,
    deleteSelectedClips,
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
    setClipTransition,
  } = useTimeline(initialClips);

  // ============================================
  // UI 상태
  // ============================================
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
  const [showVolumePanel, setShowVolumePanel] = useState(false);
  const [editingTextClip, setEditingTextClip] = useState<TimelineItem | null>(null);
  const [editingAudioClip, setEditingAudioClip] = useState<TimelineItem | null>(null);
  const [editingFilterClip, setEditingFilterClip] = useState<TimelineItem | null>(null);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [editingStickerClip, setEditingStickerClip] = useState<TimelineItem | null>(null);
  const [showAssistantPanel, setShowAssistantPanel] = useState(false);
  const [showTransitionPanel, setShowTransitionPanel] = useState(false);
  const [editingTransitionClipId, setEditingTransitionClipId] = useState<string | null>(null);
  const [editingTransitionType, setEditingTransitionType] = useState<TransitionType>('none');

  // 스냅 가이드라인 상태
  const [snapGuide, setSnapGuide] = useState<{ visible: boolean; position: number }>({
    visible: false,
    position: 0,
  });

  /**
   * 스냅 상태 변경 핸들러
   */
  const handleSnapChange = useCallback((snapped: boolean, snapPoint?: number) => {
    if (snapped && snapPoint !== undefined) {
      setSnapGuide({ visible: true, position: snapPoint });
    } else {
      setSnapGuide({ visible: false, position: 0 });
    }
  }, []);

  // ============================================
  // 자동 저장
  // ============================================
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 자동 저장 트리거 */
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    setSaveStatus('unsaved');
    autoSaveTimerRef.current = setTimeout(() => {
      setSaveStatus('saving');
      setTimeout(() => {
        setSaveStatus('saved');
        setLastSavedAt(Date.now());
      }, 500);
    }, 2000);
  }, [setSaveStatus, setLastSavedAt]);

  useEffect(() => {
    if (timelineClips.length > 0) {
      triggerAutoSave();
    }
  }, [timelineClips]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // ============================================
  // 히스토리 (Undo/Redo)
  // ============================================
  const isHistoryInitialized = useRef(false);
  useEffect(() => {
    if (!isHistoryInitialized.current && timelineClips.length > 0) {
      initializeHistory(timelineClips);
      isHistoryInitialized.current = true;
    }
  }, [timelineClips, initializeHistory]);

  const prevTimelineClipsRef = useRef<TimelineItem[]>(timelineClips);

  useEffect(() => {
    if (!isHistoryInitialized.current) return;
    const prevClips = prevTimelineClipsRef.current;
    if (JSON.stringify(prevClips) !== JSON.stringify(timelineClips)) {
      pushHistoryState(timelineClips);
      prevTimelineClipsRef.current = timelineClips;
    }
  }, [timelineClips, pushHistoryState]);

  /** Undo 핸들러 */
  const handleUndo = useCallback(() => {
    const previousState = historyUndo();
    if (previousState) {
      prevTimelineClipsRef.current = previousState;
      setTimelineClips(previousState);
      setSelectedClipId(null);
    }
  }, [historyUndo, setTimelineClips, setSelectedClipId]);

  /** Redo 핸들러 */
  const handleRedo = useCallback(() => {
    const nextState = historyRedo();
    if (nextState) {
      prevTimelineClipsRef.current = nextState;
      setTimelineClips(nextState);
      setSelectedClipId(null);
    }
  }, [historyRedo, setTimelineClips, setSelectedClipId]);

  // 키보드 단축키 (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // ============================================
  // 핀치 줌
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

  // ============================================
  // 타임라인 계산
  // ============================================
  const totalDuration = useMemo(() => {
    if (timelineClips.length === 0) return 60;
    const maxEndTime = Math.max(
      ...timelineClips.map((clip) => clip.position + clip.duration)
    );
    return Math.max(maxEndTime, 10);
  }, [timelineClips]);

  const MOBILE_TIMELINE_WIDTH = 393 - LABEL_WIDTH;

  const { scrollableWidth, leftPadding } = useMemo(() => {
    const containerWidth = MOBILE_TIMELINE_WIDTH;
    const paddingSeconds = (containerWidth / 2) / (TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom);
    const duration = paddingSeconds + totalDuration + paddingSeconds;
    const width = duration * TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom;
    const padding = paddingSeconds * TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom;
    return { scrollableWidth: width, leftPadding: padding };
  }, [totalDuration, timelineZoom]);

  // ============================================
  // 재생 시뮬레이션
  // ============================================
  const {
    isPlaying,
    currentTime,
    togglePlayPause,
    setCurrentTime: playbackSetCurrentTime,
    isUserScrolling,
  } = usePlaybackSimulation({
    timelineRef,
    totalDuration,
    zoom: timelineZoom,
    leftPadding,
    labelWidth: LABEL_WIDTH,
    pixelsPerSecond: TIMELINE_CONFIG.PIXELS_PER_SECOND,
    onScrollOffsetChange: setScrollOffset,
  });

  // 오버랩 감지
  const overlappingClipIds = useMemo(() => {
    const overlapping = new Set<string>();
    const trackGroups = timelineClips.reduce((acc, clip) => {
      if (!acc[clip.track]) acc[clip.track] = [];
      acc[clip.track].push(clip);
      return acc;
    }, {} as Record<string, TimelineItem[]>);

    Object.values(trackGroups).forEach((clips) => {
      for (let i = 0; i < clips.length; i++) {
        for (let j = i + 1; j < clips.length; j++) {
          const a = clips[i];
          const b = clips[j];
          const aEnd = a.position + a.duration;
          const bEnd = b.position + b.duration;
          if (a.position < bEnd && aEnd > b.position) {
            overlapping.add(a.id);
            overlapping.add(b.id);
          }
        }
      }
    });
    return overlapping;
  }, [timelineClips]);

  /** 프로젝트에 샷 메타데이터가 있는지 확인 */
  const shotMetadata = useMemo(() => {
    const clipsWithData = currentProject?.clips?.filter((c) => c.shotData) || [];
    return clipsWithData.length > 0 ? clipsWithData[0].shotData : null;
  }, [currentProject]);

  // 트랙별 클립 필터링
  const videoClips = useMemo(() => timelineClips.filter((c) => c.track === 'video'), [timelineClips]);
  const textClips = useMemo(() => timelineClips.filter((c) => c.track === 'text'), [timelineClips]);
  const audioClips = useMemo(() => timelineClips.filter((c) => c.track === 'audio'), [timelineClips]);
  const filterClips = useMemo(() => timelineClips.filter((c) => c.track === 'filter'), [timelineClips]);
  const stickerClips = useMemo(() => timelineClips.filter((c) => c.track === 'sticker'), [timelineClips]);

  // ============================================
  // 프로젝트 저장
  // ============================================
  const saveProject = useCallback(() => {
    if (!currentProject) return;
    const totalDur = timelineClips.length > 0
      ? Math.max(...timelineClips.map((clip) => clip.position + clip.duration))
      : 0;
    updateProject(currentProject.id, {
      name: projectTitle,
      timeline: timelineClips,
      duration: totalDur,
    });
    setCurrentProject({
      ...currentProject,
      name: projectTitle,
      timeline: timelineClips,
      duration: totalDur,
      updatedAt: Date.now(),
    });
  }, [currentProject, projectTitle, timelineClips, updateProject, setCurrentProject]);

  /** 프로젝트명 편집 완료 */
  const handleTitleEditComplete = useCallback(() => {
    setIsEditingTitle(false);
    if (currentProject && projectTitle !== currentProject.name) {
      updateProject(currentProject.id, { name: projectTitle });
      setCurrentProject({
        ...currentProject,
        name: projectTitle,
        updatedAt: Date.now(),
      });
    }
  }, [currentProject, projectTitle, updateProject, setCurrentProject]);

  // ============================================
  // 핸들러
  // ============================================
  const handlePlayPause = togglePlayPause;

  const handleBack = useCallback(() => {
    saveProject();
    setCurrentScreen('create');
  }, [saveProject, setCurrentScreen]);

  const handleExport = () => setShowExportPanel(true);

  /** 오버레이 위치 변경 */
  const handleOverlayPositionChange = useCallback((clipId: string, x: number, y: number) => {
    const clip = timelineClips.find((c) => c.id === clipId);
    if (!clip) return;
    if (clip.track === 'text') {
      updateClip(clipId, { textPosition: { x, y } });
    } else if (clip.track === 'sticker') {
      updateClip(clipId, { stickerPosition: { x, y } });
    }
  }, [timelineClips, updateClip]);

  // ============================================
  // 클립 조작 핸들러
  // ============================================
  const handleSplitClip = () => {
    if (!selectedClipId) return;
    const clip = timelineClips.find((c) => c.id === selectedClipId);
    if (!clip) return;
    if (clip.track === 'text' || clip.track === 'sticker') {
      useToastStore.getState().show('텍스트/스티커 클립은 분할할 수 없습니다', 'warning');
      return;
    }
    if (!timelineRef.current) return;
    const containerWidth = timelineRef.current.clientWidth;
    const centerOffset = containerWidth / 2;
    let currentScrollLeft = timelineRef.current.scrollLeft;
    if (currentScrollLeft === 0 && leftPadding > 0) {
      currentScrollLeft = leftPadding + LABEL_WIDTH;
      timelineRef.current.scrollLeft = currentScrollLeft;
      setScrollOffset(currentScrollLeft);
    }
    const playheadPixelPosition = currentScrollLeft + centerOffset;
    const actualTimelinePosition = playheadPixelPosition - leftPadding - LABEL_WIDTH;
    const playheadTime = actualTimelinePosition / (TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom);
    const clipStart = clip.position;
    const clipEnd = clip.position + clip.duration;
    if (playheadTime < clipStart || playheadTime > clipEnd) {
      useToastStore.getState().show('중앙 플레이헤드가 클립 위에 있지 않습니다', 'warning');
      return;
    }
    const splitPoint = playheadTime - clip.position;
    const success = splitClip(selectedClipId, splitPoint);
    if (!success) {
      useToastStore.getState().show('분할할 수 없습니다. 최소 길이를 확인하세요.', 'warning');
    }
  };

  const handleDuplicateClip = () => {
    if (selectedClipId) duplicateClip(selectedClipId);
  };

  const handleDeleteClip = () => {
    if (selectedClipId) {
      deleteClip(selectedClipId);
      setShowDeleteConfirm(false);
    }
  };

  const handleApplySpeed = (speed: number) => {
    if (selectedClipId) updateClipSpeed(selectedClipId, speed);
  };

  const handleApplyVolume = (volume: number, muted: boolean) => {
    if (selectedClipId) {
      updateClip(selectedClipId, { volume: muted ? 0 : volume, audioMuted: muted });
      setShowVolumePanel(false);
    }
  };

  const handleMultiSelect = () => {
    toggleMultiSelectMode();
  };

  /** 전환 아이콘 클릭 핸들러 */
  const handleTransitionClick = useCallback((clipId: string, currentTransition: TransitionType) => {
    setEditingTransitionClipId(clipId);
    setEditingTransitionType(currentTransition);
    setShowTransitionPanel(true);
  }, []);

  /** 전환 효과 적용 핸들러 */
  const handleApplyTransition = useCallback((transition: TransitionType) => {
    if (editingTransitionClipId) {
      setClipTransition(editingTransitionClipId, 'out', transition);
    }
    setShowTransitionPanel(false);
    setEditingTransitionClipId(null);
  }, [editingTransitionClipId, setClipTransition]);

  /** 선택된 클립 수정 핸들러 */
  const handleEditClip = useCallback(() => {
    if (!selectedClip) return;
    switch (selectedClip.track) {
      case 'text':
        setEditingTextClip(selectedClip);
        setShowTextPanel(true);
        break;
      case 'audio':
        setEditingAudioClip(selectedClip);
        setShowAudioPanel(true);
        break;
      case 'filter':
        setEditingFilterClip(selectedClip);
        setShowFilterPanel(true);
        break;
      case 'sticker':
        setEditingStickerClip(selectedClip);
        setShowStickerPanel(true);
        break;
      default:
        break;
    }
  }, [selectedClip]);

  // ============================================
  // 플레이헤드 시간 계산
  // ============================================
  const getPlayheadTime = useCallback(() => {
    if (!timelineRef.current) return 0;
    const containerWidth = timelineRef.current.clientWidth;
    const centerOffset = containerWidth / 2;
    let currentScrollLeft = timelineRef.current.scrollLeft;
    if (currentScrollLeft === 0 && leftPadding > 0) {
      currentScrollLeft = leftPadding + LABEL_WIDTH;
      timelineRef.current.scrollLeft = currentScrollLeft;
      setScrollOffset(currentScrollLeft);
    }
    const playheadPixelPosition = currentScrollLeft + centerOffset;
    const actualTimelinePosition = playheadPixelPosition - leftPadding - LABEL_WIDTH;
    const playheadTime = actualTimelinePosition / (TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom);
    return Math.max(0, playheadTime);
  }, [leftPadding, timelineZoom, setScrollOffset]);

  // 초기 스크롤 위치 설정
  React.useLayoutEffect(() => {
    if (timelineRef.current && leftPadding > 0) {
      const initialScroll = leftPadding + LABEL_WIDTH;
      timelineRef.current.scrollLeft = initialScroll;
      setScrollOffset(initialScroll);
    }
  }, [leftPadding, timelineZoom]);

  // ============================================
  // 패널 핸들러
  // ============================================
  const handleApplyFilter = (filters: FilterSettings) => {
    if (editingFilterClip) {
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
      const playheadTime = getPlayheadTime();
      const vClips = timelineClips.filter((c) => c.track === 'video');
      if (vClips.length === 0) {
        useToastStore.getState().show('먼저 비디오 클립을 추가해주세요', 'info');
        setShowFilterPanel(false);
        setEditingFilterClip(null);
        return;
      }
      const videoEnd = Math.max(...vClips.map((c) => c.position + c.duration));
      const duration = 5;
      const finalDuration = Math.min(duration, videoEnd);
      const clampedPosition = Math.max(0, Math.min(playheadTime, videoEnd - finalDuration));
      const newFilterClip: TimelineItem = {
        id: `filter-${Date.now()}`,
        clipId: `filter-clip-${Date.now()}`,
        position: clampedPosition,
        duration: finalDuration,
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
      updateClip(editingAudioClip.id, {
        audioVolume: audio.volume,
        audioMuted: audio.muted,
        audioBgm: audio.bgm,
      });
      setShowAudioPanel(false);
      setEditingAudioClip(null);
    } else {
      const playheadTime = getPlayheadTime();
      const vClips = timelineClips.filter((c) => c.track === 'video');
      if (vClips.length === 0) {
        useToastStore.getState().show('먼저 비디오 클립을 추가해주세요', 'info');
        setShowAudioPanel(false);
        return;
      }
      const videoEnd = Math.max(...vClips.map((c) => c.position + c.duration));
      const duration = audio.bgm ? 30 : 5;
      const finalDuration = Math.min(duration, videoEnd);
      const clampedPosition = Math.max(0, Math.min(playheadTime, videoEnd - finalDuration));
      const newAudioClip: TimelineItem = {
        id: `audio-${Date.now()}`,
        clipId: `audio-clip-${Date.now()}`,
        position: clampedPosition,
        duration: finalDuration,
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
      const playheadTime = getPlayheadTime();
      const vClips = timelineClips.filter((c) => c.track === 'video');
      if (vClips.length === 0) {
        useToastStore.getState().show('먼저 비디오 클립을 추가해주세요', 'info');
        setShowTextPanel(false);
        return;
      }
      const videoEnd = Math.max(...vClips.map((c) => c.position + c.duration));
      const duration = text.duration || 5;
      const finalDuration = Math.min(duration, videoEnd);
      const clampedPosition = Math.max(0, Math.min(playheadTime, videoEnd - finalDuration));
      const newTextClip: TimelineItem = {
        id: `text-${Date.now()}`,
        clipId: `text-clip-${Date.now()}`,
        position: clampedPosition,
        duration: finalDuration,
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
      addClip(newTextClip);
    }
    setShowTextPanel(false);
  };

  const handleAddSticker = (sticker: StickerSettings) => {
    if (editingStickerClip) {
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
      const playheadTime = getPlayheadTime();
      const vClips = timelineClips.filter((c) => c.track === 'video');
      if (vClips.length === 0) {
        useToastStore.getState().show('먼저 비디오 클립을 추가해주세요', 'info');
        setShowStickerPanel(false);
        return;
      }
      const videoEnd = Math.max(...vClips.map((c) => c.position + c.duration));
      const duration = sticker.duration || 3;
      const finalDuration = Math.min(duration, videoEnd);
      const clampedPosition = Math.max(0, Math.min(playheadTime, videoEnd - finalDuration));
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

  /** AI 어시스턴트 아이템 추가 */
  const handleAddAssistantItems = (items: TimelineItem[]) => {
    items.forEach((item) => addClip(item));
    setShowAssistantPanel(false);
  };

  // ============================================
  // 렌더링
  // ============================================
  return (
    <div className="relative flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Status Bar Spacer */}
      <div className="flex-shrink-0 h-11 bg-white dark:bg-gray-800" />

      {/* Top Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center -ml-2"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-gray-100" />
            </motion.button>
            {isEditingTitle ? (
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                onBlur={handleTitleEditComplete}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleEditComplete()}
                className="flex-1 min-w-0 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-900 text-base font-bold focus:outline-none focus:ring-2 focus:ring-golf-green"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-lg font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-golf-green transition-colors truncate"
              >
                {projectTitle}
              </h1>
            )}
            {/* 자동 저장 상태 */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">저장됨</span>
                </>
              )}
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-golf-green animate-spin" />
                  <span className="text-xs text-golf-green">저장 중...</span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <Circle className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <span className="text-xs text-orange-500">저장되지 않음</span>
                </>
              )}
            </div>
          </div>
          {/* Undo/Redo 버튼 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleUndo}
              disabled={!canUndo}
              className={`w-9 h-9 flex items-center justify-center rounded-lg ${
                canUndo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
              }`}
              title="실행 취소 (Ctrl+Z)"
            >
              <Undo2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleRedo}
              disabled={!canRedo}
              className={`w-9 h-9 flex items-center justify-center rounded-lg ${
                canRedo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
              }`}
              title="다시 실행 (Ctrl+Y)"
            >
              <Redo2 className="w-5 h-5" />
            </motion.button>
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
      <PreviewPlayer
        currentProject={currentProject}
        isPlaying={isPlaying}
        currentTime={currentTime}
        totalDuration={totalDuration}
        timelineClips={timelineClips}
        selectedClipId={selectedClipId}
        previewRef={previewRef}
        onPlayPause={handlePlayPause}
        onOverlayPositionChange={handleOverlayPositionChange}
        onSelectClip={setSelectedClipId}
      />

      {/* Timeline Container */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 overflow-hidden relative">
        {/* 줌 컨트롤 */}
        <div className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-medium">타임라인</span>
              <motion.button
                whileTap={shotMetadata ? { scale: 0.95 } : undefined}
                onClick={() => shotMetadata && setShowAssistantPanel(true)}
                disabled={!shotMetadata}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                  shotMetadata
                    ? 'bg-golf-green/10 text-golf-green hover:bg-golf-green/20'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
                title={shotMetadata ? 'AI 어시스턴트' : '메타데이터가 없는 미디어입니다'}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">AI</span>
              </motion.button>
            </div>
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

        {/* 타임라인 스크롤 영역 */}
        <div
          ref={timelineRef}
          className="flex-1 overflow-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          onScroll={(e) => {
            const target = e.target as HTMLElement;
            setScrollOffset(target.scrollLeft);
            // 재생 중이 아닐 때만 스크롤 위치에서 시간 갱신 (재생 중엔 훅이 관리)
            if (!isPlaying) {
              const containerWidth = target.clientWidth;
              const centerOffset = containerWidth / 2;
              const playheadPixelPosition = target.scrollLeft + centerOffset;
              const actualTimelinePosition = playheadPixelPosition - leftPadding - LABEL_WIDTH;
              const time = actualTimelinePosition / (TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom);
              playbackSetCurrentTime(Math.max(0, time));
            }
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.timeline-background')) {
              setSelectedClipId(null);
            }
          }}
          onMouseDown={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('.timeline-clip') || target.closest('.trim-handle') || target.closest('.track-label')) return;
            // 재생 중 수동 스크롤 시 일시정지
            if (isPlaying) {
              isUserScrolling.current = true;
              togglePlayPause();
            }
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
          onTouchStart={() => {
            // 모바일 터치 스크롤 시 재생 일시정지
            if (isPlaying) {
              isUserScrolling.current = true;
              togglePlayPause();
            }
          }}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            touchAction: 'pan-x pan-y',
          }}
        >
          <style>{`.timeline-scrollable::-webkit-scrollbar { display: none; }`}</style>
          <div
            className="relative timeline-background"
            style={{ width: `${scrollableWidth + LABEL_WIDTH}px`, minHeight: '100%' }}
          >
            {/* Time Ruler */}
            <div className="sticky top-0 z-20 h-6 bg-gray-100 border-b border-gray-200 flex">
              <div className="sticky left-0 z-30 w-16 flex-shrink-0 bg-gray-100 border-r border-gray-200" />
              <div style={{ width: `${leftPadding}px`, flexShrink: 0 }} />
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

            {/* 5개 트랙 */}
            <TimelineTrack
              trackType="video"
              label="영상"
              heightClass="h-16"
              clips={videoClips}
              allClips={timelineClips}
              selectedClipIds={selectedClipIds}
              isMultiSelectMode={isMultiSelectMode}
              zoom={timelineZoom}
              leftPadding={leftPadding}
              overlappingClipIds={overlappingClipIds}
              onSelect={setSelectedClipId}
              onMove={moveClip}
              onTrimStart={trimClipStart}
              onTrimEnd={trimClipEnd}
              onSnapChange={handleSnapChange}
              onTransitionClick={handleTransitionClick}
            />

            <TimelineTrack
              trackType="text"
              label="텍스트"
              heightClass="h-12"
              clips={textClips}
              allClips={timelineClips}
              selectedClipIds={selectedClipIds}
              isMultiSelectMode={isMultiSelectMode}
              zoom={timelineZoom}
              leftPadding={leftPadding}
              overlappingClipIds={overlappingClipIds}
              onSelect={setSelectedClipId}
              onMove={moveClip}
              onTrimStart={trimClipStart}
              onTrimEnd={trimClipEnd}
              onSnapChange={handleSnapChange}
              onLabelClick={() => setShowTextPanel(true)}
              onDoubleClick={(clip) => { setEditingTextClip(clip); setShowTextPanel(true); }}
            />

            <TimelineTrack
              trackType="audio"
              label="오디오"
              heightClass="h-12"
              clips={audioClips}
              allClips={timelineClips}
              selectedClipIds={selectedClipIds}
              isMultiSelectMode={isMultiSelectMode}
              zoom={timelineZoom}
              leftPadding={leftPadding}
              overlappingClipIds={overlappingClipIds}
              onSelect={setSelectedClipId}
              onMove={moveClip}
              onTrimStart={trimClipStart}
              onTrimEnd={trimClipEnd}
              onSnapChange={handleSnapChange}
              onLabelClick={() => setShowAudioPanel(true)}
              onDoubleClick={(clip) => { setEditingAudioClip(clip); setShowAudioPanel(true); }}
            />

            <TimelineTrack
              trackType="filter"
              label="필터"
              heightClass="h-12"
              clips={filterClips}
              allClips={timelineClips}
              selectedClipIds={selectedClipIds}
              isMultiSelectMode={isMultiSelectMode}
              zoom={timelineZoom}
              leftPadding={leftPadding}
              overlappingClipIds={overlappingClipIds}
              onSelect={setSelectedClipId}
              onMove={moveClip}
              onTrimStart={trimClipStart}
              onTrimEnd={trimClipEnd}
              onSnapChange={handleSnapChange}
              onLabelClick={() => setShowFilterPanel(true)}
              onDoubleClick={(clip) => { setEditingFilterClip(clip); setShowFilterPanel(true); }}
            />

            {/* 스냅 가이드라인 */}
            {snapGuide.visible && (
              <div
                className="absolute top-6 bottom-0 w-0.5 bg-green-500 z-40 pointer-events-none"
                style={{
                  left: `${snapGuide.position * TIMELINE_CONFIG.PIXELS_PER_SECOND * timelineZoom + leftPadding + LABEL_WIDTH}px`,
                }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full" />
              </div>
            )}

            <TimelineTrack
              trackType="sticker"
              label="스티커"
              heightClass="h-12"
              clips={stickerClips}
              allClips={timelineClips}
              selectedClipIds={selectedClipIds}
              isMultiSelectMode={isMultiSelectMode}
              zoom={timelineZoom}
              leftPadding={leftPadding}
              overlappingClipIds={overlappingClipIds}
              onSelect={setSelectedClipId}
              onMove={moveClip}
              onTrimStart={trimClipStart}
              onTrimEnd={trimClipEnd}
              onSnapChange={handleSnapChange}
              onLabelClick={() => setShowStickerPanel(true)}
              onDoubleClick={(clip) => { setEditingStickerClip(clip); setShowStickerPanel(true); }}
            />
          </div>
        </div>

        {/* Centered Playhead */}
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

      {/* Bottom Toolbar */}
      <EditorToolbar
        selectedClipId={selectedClipId}
        selectedClip={selectedClip}
        selectedCount={selectedClipIds.size}
        isMultiSelectMode={isMultiSelectMode}
        onMultiSelect={handleMultiSelect}
        onDeleteSelected={deleteSelectedClips}
        onSplitClip={handleSplitClip}
        onShowSpeedPanel={() => setShowSpeedPanel(true)}
        onShowVolumePanel={() => setShowVolumePanel(true)}
        onEditClip={handleEditClip}
        onDuplicateClip={handleDuplicateClip}
        onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
      />

      {/* Panels */}
      <AnimatePresence>
        {showSpeedPanel && selectedClip && (
          <SpeedPanel currentSpeed={selectedClip.speed || 1} onApply={handleApplySpeed} onClose={() => setShowSpeedPanel(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVolumePanel && selectedClip && selectedClip.track === 'video' && (
          <ClipVolumePanel
            currentVolume={selectedClip.volume ?? 1}
            isMuted={selectedClip.audioMuted ?? false}
            onApply={handleApplyVolume}
            onClose={() => setShowVolumePanel(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilterPanel && (
          <FilterPanel
            onApply={handleApplyFilter}
            onClose={() => { setShowFilterPanel(false); setEditingFilterClip(null); }}
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

      <AnimatePresence>
        {showAudioPanel && (
          <AudioPanel
            onApply={handleApplyAudio}
            onClose={() => { setShowAudioPanel(false); setEditingAudioClip(null); }}
            currentAudio={editingAudioClip ? {
              volume: editingAudioClip.audioVolume || 100,
              muted: editingAudioClip.audioMuted || false,
              bgm: editingAudioClip.audioBgm,
            } : undefined}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTextPanel && (
          <TextPanel
            onAdd={handleAddText}
            onClose={() => { setShowTextPanel(false); setEditingTextClip(null); }}
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

      <AnimatePresence>
        {showStickerPanel && (
          <StickerPanel
            onAdd={handleAddSticker}
            onClose={() => { setShowStickerPanel(false); setEditingStickerClip(null); }}
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

      <AnimatePresence>
        {showAssistantPanel && shotMetadata && (
          <AssistantPanel
            onAdd={handleAddAssistantItems}
            onClose={() => setShowAssistantPanel(false)}
            currentTime={getPlayheadTime()}
            shotMetadata={shotMetadata}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTransitionPanel && (
          <TransitionPanel
            currentTransition={editingTransitionType}
            onApply={handleApplyTransition}
            onClose={() => { setShowTransitionPanel(false); setEditingTransitionClipId(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExportPanel && (
          <ExportPanel
            projectName={projectTitle}
            onClose={() => setShowExportPanel(false)}
            onComplete={(mode) => {
              saveProject();
              setShowExportPanel(false);
              if (mode === 'dashboard') {
                setCurrentScreen('create');
              }
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
