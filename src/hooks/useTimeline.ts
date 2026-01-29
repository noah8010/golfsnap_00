import { useEffect, useState, useMemo } from 'react';
import { TimelineItem } from '../types/golf';
import { TIMELINE_CONFIG } from '../constants/editor';

export const useTimeline = (initialClips: TimelineItem[] = []) => {
  const [timelineClips, setTimelineClips] = useState<TimelineItem[]>(initialClips);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const selectedClip = timelineClips.find((c) => c.id === selectedClipId);

  // 프로젝트 변경 시 초기 타임라인 동기화 및 범위 검증
  useEffect(() => {
    // 비디오 범위 계산
    const videoClips = initialClips.filter((c) => c.track === 'video');
    const videoEnd = videoClips.length > 0 
      ? Math.max(...videoClips.map((c) => c.position + c.duration))
      : 60;

    // 텍스트/오디오/필터/스티커 클립을 비디오 범위 내로 조정
    const adjustedClips = initialClips.map((clip) => {
      if (clip.track === 'text' || clip.track === 'audio' || clip.track === 'filter' || clip.track === 'sticker') {
        const minPosition = 0;
        const maxPosition = Math.max(0, videoEnd - clip.duration);
        const adjustedPosition = Math.max(minPosition, Math.min(maxPosition, clip.position));
        
        if (adjustedPosition !== clip.position) {
          return { ...clip, position: adjustedPosition };
        }
      }
      return clip;
    });

    setTimelineClips(adjustedClips);
    setSelectedClipId(null);
  }, [initialClips]);

  // 비디오 길이 계산 (의존성 분리)
  const videoTotalDuration = useMemo(() => {
    const videoClips = timelineClips.filter((c) => c.track === 'video');
    return videoClips.length > 0 
      ? Math.max(...videoClips.map((c) => c.position + c.duration))
      : 0;
  }, [timelineClips]);

  // 실시간 범위 검증 (비디오 길이가 변경될 때만)
  useEffect(() => {
    if (videoTotalDuration === 0) return; // 비디오 없으면 스킵

    console.log('[useTimeline] 비디오 총 길이:', videoTotalDuration);

    // 텍스트/오디오/필터/스티커가 범위를 벗어나면 자동 조정
    const outOfBoundsClips = timelineClips.filter((clip) => {
      if (clip.track === 'text' || clip.track === 'audio' || clip.track === 'filter' || clip.track === 'sticker') {
        const isOutOfBounds = clip.position < 0 || clip.position + clip.duration > videoTotalDuration;
        if (isOutOfBounds) {
          console.log('[useTimeline] 범위 벗어남:', clip.id, 'position:', clip.position, 'end:', clip.position + clip.duration, 'videoEnd:', videoTotalDuration);
        }
        return isOutOfBounds;
      }
      return false;
    });

    if (outOfBoundsClips.length > 0) {
      console.log('[useTimeline] 범위 조정 필요:', outOfBoundsClips.length, '개');
      
      setTimelineClips(prevClips => prevClips.map((clip) => {
        if (clip.track === 'text' || clip.track === 'audio' || clip.track === 'filter' || clip.track === 'sticker') {
          // 위치 조정
          let adjustedPosition = Math.max(0, clip.position);
          const maxPosition = Math.max(0, videoTotalDuration - clip.duration);
          adjustedPosition = Math.min(adjustedPosition, maxPosition);
          
          // 길이 조정 (비디오 길이 초과 시)
          let adjustedDuration = clip.duration;
          if (adjustedDuration > videoTotalDuration) {
            adjustedDuration = videoTotalDuration;
          }
          if (adjustedPosition + adjustedDuration > videoTotalDuration) {
            adjustedDuration = videoTotalDuration - adjustedPosition;
          }
          
          const adjusted = {
            ...clip,
            position: adjustedPosition,
            duration: Math.max(TIMELINE_CONFIG.MIN_CLIP_DURATION, adjustedDuration),
          };
          
          if (adjusted.position !== clip.position || adjusted.duration !== clip.duration) {
            console.log('[useTimeline] 조정됨:', clip.id, 'from', clip.position, '~', clip.position + clip.duration, 'to', adjusted.position, '~', adjusted.position + adjusted.duration);
          }
          
          return adjusted;
        }
        return clip;
      }));
    }
  }, [videoTotalDuration]); // timelineClips 제거하여 무한 루프 방지

  const clampSpeed = (speed: number) =>
    Math.min(TIMELINE_CONFIG.SPEED_MAX, Math.max(TIMELINE_CONFIG.SPEED_MIN, speed));

  const splitClip = (clipId: string, splitPoint: number) => {
    const clipIndex = timelineClips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) return false;

    const clip = timelineClips[clipIndex];
    const currentSpeed = clip.speed ?? 1;

    // 현재 레이어의 duration을 기준으로 분할
    const min = TIMELINE_CONFIG.MIN_CLIP_DURATION;
    if (
      splitPoint <= min ||
      splitPoint >= clip.duration - min
    ) {
      return false;
    }

    // ============================================
    // 원본 영상 구간 계산
    // ============================================
    const sourceStart = clip.startTime ?? 0;
    const sourceEnd = clip.endTime ?? (sourceStart + clip.duration * currentSpeed);
    const sourceLength = sourceEnd - sourceStart;
    
    // splitPoint를 원본 구간으로 변환
    const ratio = splitPoint / clip.duration;
    const sourceMidPoint = sourceStart + (sourceLength * ratio);

    // ============================================
    // 클립 분할
    // ============================================
    // 클립1: 앞부분 (startTime ~ sourceMidPoint)
    const clip1: TimelineItem = {
      ...clip,
      id: `${clip.id}-a`,
      position: clip.position,
      duration: splitPoint,
      startTime: sourceStart,
      endTime: sourceMidPoint, // ✅ 트림 제한용
      speed: currentSpeed,
    };

    // 클립2: 뒷부분 (sourceMidPoint ~ endTime)
    const clip2: TimelineItem = {
      ...clip,
      id: `${clip.id}-b`,
      position: clip.position + splitPoint,
      duration: clip.duration - splitPoint,
      startTime: sourceMidPoint, // ✅ 트림 제한용
      endTime: sourceEnd, // ✅ 트림 제한용
      speed: currentSpeed,
    };

    const newClips = [...timelineClips];
    newClips.splice(clipIndex, 1, clip1, clip2);
    setTimelineClips(newClips);
    setSelectedClipId(null);
    return true;
  };

  const duplicateClip = (clipId: string) => {
    const clip = timelineClips.find((c) => c.id === clipId);
    if (!clip) return;

    const newClip: TimelineItem = {
      ...clip,
      id: `clip-${Date.now()}`,
      position: clip.position + clip.duration,
    };

    const updatedClips = timelineClips.map((c) =>
      c.position >= newClip.position ? { ...c, position: c.position + newClip.duration } : c
    );

    setTimelineClips([...updatedClips, newClip]);
  };

  const deleteClip = (clipId: string) => {
    const clip = timelineClips.find((c) => c.id === clipId);
    if (!clip) return;

    let updatedClips = timelineClips
      .filter((c) => c.id !== clipId)
      .map((c) => {
        // 비디오 트랙: 리플 편집 (뒤 클립들 앞으로 이동)
        if (c.track === clip.track && c.position > clip.position) {
          return { ...c, position: c.position - clip.duration };
        }
        return c;
      });

    // 비디오 클립을 삭제한 경우, 텍스트/오디오/필터 범위 재조정
    if (clip.track === 'video') {
      const videoClips = updatedClips.filter((c) => c.track === 'video');
      const videoEnd = videoClips.length > 0 
        ? Math.max(...videoClips.map((c) => c.position + c.duration))
        : 0;

      updatedClips = updatedClips.map((c) => {
        if (c.track === 'text' || c.track === 'audio' || c.track === 'filter' || c.track === 'sticker') {
          // 위치가 비디오 끝을 넘으면 조정
          if (c.position + c.duration > videoEnd) {
            const maxPosition = Math.max(0, videoEnd - c.duration);
            return { ...c, position: Math.min(c.position, maxPosition) };
          }
        }
        return c;
      });
    }

    setTimelineClips(updatedClips);
    setSelectedClipId(null);
  };

  const updateClipSpeed = (clipId: string, speed: number) => {
    const nextSpeed = clampSpeed(speed);
    const clipIndex = timelineClips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) return;

    const clip = timelineClips[clipIndex];
    
    // 현재 클립의 원본 구간 길이
    const currentStart = clip.startTime ?? 0;
    const currentEnd = clip.endTime ?? (currentStart + clip.duration);
    const sourceLength = currentEnd - currentStart; // 원본 구간 길이
    
    // 속도에 따른 새 duration 계산
    const newDuration = Math.max(sourceLength / nextSpeed, TIMELINE_CONFIG.MIN_CLIP_DURATION);
    const durationDelta = newDuration - clip.duration;

    let updated = timelineClips.map((c, idx) => {
      if (idx === clipIndex) {
        return {
          ...c,
          speed: nextSpeed,
          duration: newDuration,
          // endTime은 그대로 유지 (원본 구간은 변하지 않음)
          // duration만 속도에 따라 변경
        };
      }

      // 같은 트랙의 뒤 클립들 이동 (리플 편집)
      if (c.track === clip.track && c.position > clip.position && durationDelta !== 0) {
        return { ...c, position: c.position + durationDelta };
      }

      return c;
    });

    // 비디오 범위 재계산 및 텍스트/오디오/필터 조정
    const videoClips = updated.filter((c) => c.track === 'video');
    const videoEnd = videoClips.length > 0 
      ? Math.max(...videoClips.map((c) => c.position + c.duration))
      : 0;

    updated = updated.map((c) => {
      if (c.track === 'text' || c.track === 'audio' || c.track === 'filter' || c.track === 'sticker') {
        // 위치 + 길이가 비디오 끝을 넘으면 조정
        if (c.position + c.duration > videoEnd) {
          const maxPosition = Math.max(0, videoEnd - c.duration);
          return { ...c, position: Math.min(c.position, maxPosition) };
        }
      }
      return c;
    });

    setTimelineClips(updated);
  };

  const trimClipStart = (clipId: string, newStartTime: number) => {
    const clipIndex = timelineClips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) return;

    const clip = timelineClips[clipIndex];
    
    // 텍스트/오디오/필터/스티커: 영상 범위 내에서만 위치 이동
    if (clip.track === 'text' || clip.track === 'audio' || clip.track === 'filter' || clip.track === 'sticker') {
      const deltaPosition = newStartTime;
      const newPosition = Math.max(0, clip.position + deltaPosition); // 0초 이하 불가
      const actualDelta = newPosition - clip.position;
      const newDuration = Math.max(TIMELINE_CONFIG.MIN_CLIP_DURATION, clip.duration - actualDelta);
      
      // 비디오 범위 계산
      const videoClips = timelineClips.filter((c) => c.track === 'video');
      const videoEnd = videoClips.length > 0 
        ? Math.max(...videoClips.map((c) => c.position + c.duration))
        : 60;
      
      // 위치 + 길이가 비디오 끝을 넘을 수 없음
      const maxPosition = Math.max(0, videoEnd - newDuration);
      const finalPosition = Math.min(newPosition, maxPosition);
      
      setTimelineClips(timelineClips.map((c, idx) => {
        if (idx === clipIndex) {
          return {
            ...c,
            position: finalPosition,
            duration: newDuration,
          };
        }
        return c;
      }));
      return;
    }
    
    // ============================================
    // 비디오 클립: 원본 영상 길이 제한 (리플 편집)
    // ============================================
    const currentStart = clip.startTime ?? 0;
    const currentEnd = clip.endTime ?? (currentStart + clip.duration);
    const originalDuration = clip.duration;
    const currentSpeed = clip.speed ?? 1;
    
    // ✅ 트림 제한: 분할된 클립은 원본 startTime 이전으로 갈 수 없음
    // 분할 전: startTime = 0 → 원본 처음부터 시작
    // 분할 후: startTime = 분할 지점 → 그 이전으로 갈 수 없음
    if (newStartTime < currentStart || newStartTime >= currentEnd - TIMELINE_CONFIG.MIN_CLIP_DURATION) {
      return;
    }

    // 새 duration 계산 (속도 고려)
    const sourceLength = currentEnd - newStartTime;
    const newDuration = sourceLength / currentSpeed;
    const durationDelta = newDuration - originalDuration; // 음수면 줄어듦

    // 같은 트랙에서 가장 앞에 있는 클립인지 확인
    const sameTrackClips = timelineClips.filter(c => c.track === clip.track);
    const isFirstClip = sameTrackClips.every(c => c.position >= clip.position);

    // 리플 편집
    let updated = timelineClips.map((c, idx) => {
      if (idx === clipIndex) {
        // 현재 클립 업데이트
        return {
          ...c,
          startTime: newStartTime,
          duration: newDuration,
          // 가장 앞 클립이면 position은 0에 고정, 중간 클립은 현재 position 유지
          position: isFirstClip ? 0 : c.position,
        };
      }
      
      // 같은 트랙의 뒤 클립들만 이동 (첫 번째든 중간이든 상관없이)
      if (c.track === clip.track && c.position > clip.position) {
        return {
          ...c,
          position: c.position + durationDelta,
        };
      }
      
      return c;
    });

    // 비디오 범위 재계산 및 텍스트/오디오/필터/스티커 조정
    const videoClips = updated.filter((c) => c.track === 'video');
    const videoEnd = videoClips.length > 0
      ? Math.max(...videoClips.map((c) => c.position + c.duration))
      : 0;

    updated = updated.map((c) => {
      if (c.track === 'text' || c.track === 'audio' || c.track === 'filter' || c.track === 'sticker') {
        // 위치 + 길이가 비디오 끝을 넘으면 조정
        if (c.position + c.duration > videoEnd) {
          const maxPosition = Math.max(0, videoEnd - c.duration);
          return { ...c, position: Math.min(c.position, maxPosition) };
        }
      }
      return c;
    });

    setTimelineClips(updated);
  };

  const trimClipEnd = (clipId: string, newEndTime: number) => {
    const clipIndex = timelineClips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) return;

    const clip = timelineClips[clipIndex];
    
    // 텍스트/오디오/필터/스티커: 영상 범위 내에서만 길이 조정
    if (clip.track === 'text' || clip.track === 'audio' || clip.track === 'filter' || clip.track === 'sticker') {
      const deltaDuration = newEndTime;
      let newDuration = Math.max(TIMELINE_CONFIG.MIN_CLIP_DURATION, clip.duration + deltaDuration);
      
      // 비디오 범위 계산
      const videoClips = timelineClips.filter((c) => c.track === 'video');
      const videoEnd = videoClips.length > 0 
        ? Math.max(...videoClips.map((c) => c.position + c.duration))
        : 60;
      
      // 길이 제한: 영상 전체 길이를 초과할 수 없음
      const maxDuration = videoEnd;
      newDuration = Math.min(newDuration, maxDuration);
      
      // 위치 + 길이가 비디오 끝을 넘을 수 없음
      const clipEnd = clip.position + newDuration;
      if (clipEnd > videoEnd) {
        newDuration = videoEnd - clip.position;
      }
      
      setTimelineClips(timelineClips.map((c, idx) => {
        if (idx === clipIndex) {
          return {
            ...c,
            duration: Math.max(TIMELINE_CONFIG.MIN_CLIP_DURATION, newDuration),
          };
        }
        return c;
      }));
      return;
    }
    
    // ============================================
    // 비디오 클립: 원본 영상 길이 제한 (리플 편집)
    // ============================================
    const currentStart = clip.startTime ?? 0;
    const currentEnd = clip.endTime ?? (currentStart + clip.duration);
    const originalDuration = clip.duration;
    const currentSpeed = clip.speed ?? 1;
    
    // ✅ 트림 제한: 분할된 클립은 원본 endTime을 넘을 수 없음
    // 분할 전: endTime = 원본 끝 → 늘릴 수 있음
    // 분할 후: endTime = 분할 지점 → 늘릴 수 없음 (줄이기만 가능)
    if (
      newEndTime <= currentStart + TIMELINE_CONFIG.MIN_CLIP_DURATION || 
      newEndTime > currentEnd // ✅ 핵심: currentEnd를 넘을 수 없음
    ) {
      return;
    }

    // 새 duration 계산 (속도 고려)
    const sourceLength = newEndTime - currentStart;
    const newDuration = sourceLength / currentSpeed;
    const durationDelta = newDuration - originalDuration; // 음수 (줄어듦)

    // 리플 편집: 같은 트랙의 뒤에 있는 모든 클립들의 position 조정
    let updated = timelineClips.map((c, idx) => {
      if (idx === clipIndex) {
        // 현재 클립 업데이트
        return {
          ...c,
          endTime: newEndTime,
          duration: newDuration,
        };
      }
      
      // 같은 트랙의 뒤에 있는 클립들 이동
      if (c.track === clip.track && c.position > clip.position) {
        return {
          ...c,
          position: c.position + durationDelta,
        };
      }
      
      return c;
    });

    // 비디오 범위 재계산 및 텍스트/오디오/필터/스티커 조정
    const videoClips = updated.filter((c) => c.track === 'video');
    const videoEnd = videoClips.length > 0
      ? Math.max(...videoClips.map((c) => c.position + c.duration))
      : 0;

    updated = updated.map((c) => {
      if (c.track === 'text' || c.track === 'audio' || c.track === 'filter' || c.track === 'sticker') {
        // 위치 + 길이가 비디오 끝을 넘으면 조정
        if (c.position + c.duration > videoEnd) {
          const maxPosition = Math.max(0, videoEnd - c.duration);
          return { ...c, position: Math.min(c.position, maxPosition) };
        }
      }
      return c;
    });

    setTimelineClips(updated);
  };

  const addClip = (clip: TimelineItem) => {
    setTimelineClips([...timelineClips, clip]);
  };

  const updateClip = (clipId: string, updates: Partial<TimelineItem>) => {
    setTimelineClips(timelineClips.map((c) => 
      c.id === clipId ? { ...c, ...updates } : c
    ));
  };

  const moveClip = (clipId: string, newPosition: number) => {
    const clip = timelineClips.find((c) => c.id === clipId);
    if (!clip) return;

    // 비디오 트랙: 순서 교환 시스템
    if (clip.track === 'video') {
      const videoClips = timelineClips
        .filter((c) => c.track === 'video')
        .sort((a, b) => a.position - b.position);
      
      const currentIndex = videoClips.findIndex((c) => c.id === clipId);
      if (currentIndex === -1) return;

      // 새로운 위치에 해당하는 인덱스 찾기
      let targetIndex = currentIndex;
      let cumulativePosition = 0;
      
      for (let i = 0; i < videoClips.length; i++) {
        const midPoint = cumulativePosition + videoClips[i].duration / 2;
        if (newPosition < midPoint) {
          targetIndex = i;
          break;
        }
        cumulativePosition += videoClips[i].duration;
        targetIndex = i + 1;
      }

      // 순서 변경이 필요한 경우
      if (targetIndex !== currentIndex) {
        // 클립 배열 재정렬
        const newVideoClips = [...videoClips];
        const [movedClip] = newVideoClips.splice(currentIndex, 1);
        newVideoClips.splice(targetIndex > currentIndex ? targetIndex - 1 : targetIndex, 0, movedClip);

        // position 재계산 (항상 붙어있도록)
        let position = 0;
        const updatedVideoClips = newVideoClips.map((c) => {
          const updated = { ...c, position };
          position += c.duration;
          return updated;
        });

        // 전체 타임라인에 반영
        setTimelineClips(timelineClips.map((c) => {
          if (c.track === 'video') {
            const updatedClip = updatedVideoClips.find((vc) => vc.id === c.id);
            return updatedClip || c;
          }
          return c;
        }));
      }
      return;
    }

    // ============================================
    // 텍스트/오디오/필터/스티커: 영상 범위 내에서만 이동
    // ============================================
    if (clip.track === 'text' || clip.track === 'audio' || clip.track === 'filter' || clip.track === 'sticker') {
      // 비디오 트랙의 범위 계산 (0초부터 마지막 비디오 클립 끝까지)
      const videoClips = timelineClips.filter((c) => c.track === 'video');
      
      console.log('[moveClip] 클립 이동:', clipId, '새 위치:', newPosition);
      console.log('[moveClip] 비디오 클립 개수:', videoClips.length);
      
      if (videoClips.length === 0) {
        console.log('[moveClip] 비디오 없음, 이동 취소');
        return;
      }

      // 비디오 범위: 0초부터 마지막 비디오 클립 끝까지
      const videoStart = 0;
      const videoEnd = Math.max(...videoClips.map((c) => c.position + c.duration));
      
      console.log('[moveClip] 비디오 범위:', videoStart, '~', videoEnd);
      console.log('[moveClip] 클립 길이:', clip.duration);
      
      // 위치 제한: 비디오 범위 내에서만
      const minPosition = videoStart;
      const maxPosition = Math.max(videoStart, videoEnd - clip.duration);
      const finalPosition = Math.max(minPosition, Math.min(maxPosition, newPosition));
      
      console.log('[moveClip] 계산된 범위:', minPosition, '~', maxPosition);
      console.log('[moveClip] 최종 위치:', finalPosition);

      setTimelineClips(timelineClips.map((c) =>
        c.id === clipId ? { ...c, position: finalPosition } : c
      ));
    }
  };

  return {
    timelineClips,
    selectedClipId,
    selectedClip,
    scrollOffset,
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
  };
};
