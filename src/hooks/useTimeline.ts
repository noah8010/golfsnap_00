/**
 * @file useTimeline.ts
 * @description 타임라인 편집 핵심 커스텀 훅
 *
 * 영상 편집기의 모든 타임라인 조작 로직을 담당합니다.
 *
 * ## 주요 기능
 * 1. 클립 관리 (추가, 삭제, 업데이트)
 * 2. 클립 분할 (Split) - 원본 영상 구간 보존
 * 3. 클립 복제 (Duplicate)
 * 4. 재생 속도 조절 (0.1x ~ 8x)
 * 5. 트리밍 (시작점/끝점 조정) - 리플 편집 적용
 * 6. 클립 이동 및 순서 변경
 * 7. 다중 트랙 지원 (video, text, audio, filter, sticker)
 * 8. 비디오 범위 제한 (텍스트/오디오/필터/스티커는 비디오 범위 내에서만)
 *
 * ## 리플 편집 (Ripple Edit)
 * 클립 길이 변경 시 뒤에 있는 모든 클립이 자동으로 이동하여
 * 빈 공간이 생기지 않도록 합니다.
 *
 * ## 트랙 종속성
 * - video 트랙: 독립적, 리플 편집 적용
 * - text/audio/filter/sticker 트랙: video 트랙 범위 내에서만 배치 가능
 *
 * @example
 * const {
 *   timelineClips,
 *   selectedClipId,
 *   splitClip,
 *   deleteClip,
 *   updateClipSpeed,
 * } = useTimeline(initialClips);
 */

import { useEffect, useState, useMemo } from 'react';
import { TimelineItem } from '../types/golf';
import { TIMELINE_CONFIG } from '../constants/editor';

/**
 * 타임라인 편집 커스텀 훅
 *
 * @param initialClips - 초기 타임라인 클립 배열
 * @returns 타임라인 상태 및 조작 함수들
 */
export const useTimeline = (initialClips: TimelineItem[] = []) => {
  // ========================================
  // 상태 정의
  // ========================================

  /** 현재 타임라인의 모든 클립 */
  const [timelineClips, setTimelineClips] = useState<TimelineItem[]>(initialClips);

  /** 현재 선택된 클립 ID (null이면 선택 없음) */
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  /** 타임라인 스크롤 오프셋 (초 단위) */
  const [scrollOffset, setScrollOffset] = useState(0);

  /** 현재 선택된 클립 객체 (편의 접근용) */
  const selectedClip = timelineClips.find((c) => c.id === selectedClipId);

  // ========================================
  // 초기화 및 동기화
  // ========================================

  /**
   * 프로젝트 변경 시 초기 타임라인 동기화
   *
   * 1. 비디오 클립들의 총 범위 계산
   * 2. 텍스트/오디오/필터/스티커 클립을 비디오 범위 내로 조정
   * 3. 선택 상태 초기화
   */
  useEffect(() => {
    // 비디오 트랙의 끝 위치 계산
    const videoClips = initialClips.filter((c) => c.track === 'video');
    const videoEnd = videoClips.length > 0
      ? Math.max(...videoClips.map((c) => c.position + c.duration))
      : 60; // 비디오 없으면 기본 60초

    // 비디오 외 트랙 클립들을 비디오 범위 내로 조정
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

  // ========================================
  // 비디오 범위 계산 (메모이제이션)
  // ========================================

  /**
   * 현재 비디오 트랙의 총 길이 (초)
   *
   * 가장 마지막 비디오 클립의 끝 위치를 반환합니다.
   * 비디오가 없으면 0을 반환합니다.
   */
  const videoTotalDuration = useMemo(() => {
    const videoClips = timelineClips.filter((c) => c.track === 'video');
    return videoClips.length > 0
      ? Math.max(...videoClips.map((c) => c.position + c.duration))
      : 0;
  }, [timelineClips]);

  /**
   * 비디오 길이 변경 시 자동 범위 조정
   *
   * 비디오 트랙 길이가 줄어들면, 텍스트/오디오/필터/스티커 트랙의
   * 클립들이 비디오 범위를 벗어날 수 있습니다.
   * 이 경우 자동으로 위치와 길이를 조정합니다.
   */
  useEffect(() => {
    if (videoTotalDuration === 0) return; // 비디오 없으면 스킵

    console.log('[useTimeline] 비디오 총 길이:', videoTotalDuration);

    // 범위를 벗어난 클립 찾기
    const outOfBoundsClips = timelineClips.filter((clip) => {
      if (clip.track === 'text' || clip.track === 'audio' || clip.track === 'filter' || clip.track === 'sticker') {
        const isOutOfBounds = clip.position < 0 || clip.position + clip.duration > videoTotalDuration;
        if (isOutOfBounds) {
          console.log('[useTimeline] 범위 벗어남:', clip.id,
            'position:', clip.position,
            'end:', clip.position + clip.duration,
            'videoEnd:', videoTotalDuration
          );
        }
        return isOutOfBounds;
      }
      return false;
    });

    // 범위 벗어난 클립이 있으면 조정
    if (outOfBoundsClips.length > 0) {
      console.log('[useTimeline] 범위 조정 필요:', outOfBoundsClips.length, '개');

      setTimelineClips(prevClips => prevClips.map((clip) => {
        if (clip.track === 'text' || clip.track === 'audio' || clip.track === 'filter' || clip.track === 'sticker') {
          // 위치 조정: 0 이상, 비디오 끝 - 클립 길이 이하
          let adjustedPosition = Math.max(0, clip.position);
          const maxPosition = Math.max(0, videoTotalDuration - clip.duration);
          adjustedPosition = Math.min(adjustedPosition, maxPosition);

          // 길이 조정: 비디오 길이 초과 방지
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
            console.log('[useTimeline] 조정됨:', clip.id,
              'from', clip.position, '~', clip.position + clip.duration,
              'to', adjusted.position, '~', adjusted.position + adjusted.duration
            );
          }

          return adjusted;
        }
        return clip;
      }));
    }
  }, [videoTotalDuration]); // timelineClips 제거하여 무한 루프 방지

  // ========================================
  // 유틸리티 함수
  // ========================================

  /**
   * 재생 속도를 허용 범위로 클램프
   *
   * @param speed - 입력 속도값
   * @returns 0.1 ~ 8 사이로 제한된 속도
   */
  const clampSpeed = (speed: number) =>
    Math.min(TIMELINE_CONFIG.SPEED_MAX, Math.max(TIMELINE_CONFIG.SPEED_MIN, speed));

  // ========================================
  // 클립 분할 (Split)
  // ========================================

  /**
   * 클립을 특정 지점에서 두 개로 분할
   *
   * 원본 영상의 구간 정보(startTime, endTime)를 보존하여
   * 분할된 각 클립이 원본의 해당 구간만 재생하도록 합니다.
   *
   * ## 분할 로직
   * ```
   * 원본 클립: [---A---] (0초 ~ 15초)
   * 분할 후:   [--A1--][--A2--] (0초 ~ 8초, 8초 ~ 15초)
   * ```
   *
   * ## 트림 제한
   * 분할 후 각 클립은 자신의 startTime/endTime 범위를 벗어날 수 없습니다.
   * - A1: startTime(0초)보다 앞으로 트림 불가
   * - A2: endTime(15초)보다 뒤로 트림 불가
   *
   * @param clipId - 분할할 클립 ID
   * @param splitPoint - 분할 지점 (클립 내 상대 위치, 초)
   * @returns 분할 성공 여부
   */
  const splitClip = (clipId: string, splitPoint: number) => {
    const clipIndex = timelineClips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) return false;

    const clip = timelineClips[clipIndex];
    const currentSpeed = clip.speed ?? 1;

    // 분할 지점 유효성 검사 (최소 길이 보장)
    const min = TIMELINE_CONFIG.MIN_CLIP_DURATION;
    if (splitPoint <= min || splitPoint >= clip.duration - min) {
      return false;
    }

    // ============================================
    // 원본 영상 구간 계산
    // ============================================
    const sourceStart = clip.startTime ?? 0;
    const sourceEnd = clip.endTime ?? (sourceStart + clip.duration * currentSpeed);
    const sourceLength = sourceEnd - sourceStart;

    // splitPoint를 원본 시간으로 변환
    const ratio = splitPoint / clip.duration;
    const sourceMidPoint = sourceStart + (sourceLength * ratio);

    // ============================================
    // 분할된 클립 생성
    // ============================================

    // 클립1: 앞부분 (원본 시작 ~ 분할점)
    const clip1: TimelineItem = {
      ...clip,
      id: `${clip.id}-a`, // 고유 ID 생성
      position: clip.position,
      duration: splitPoint,
      startTime: sourceStart,     // 원본 시작 시간
      endTime: sourceMidPoint,    // 분할점 (트림 제한용)
      speed: currentSpeed,
    };

    // 클립2: 뒷부분 (분할점 ~ 원본 끝)
    const clip2: TimelineItem = {
      ...clip,
      id: `${clip.id}-b`, // 고유 ID 생성
      position: clip.position + splitPoint,
      duration: clip.duration - splitPoint,
      startTime: sourceMidPoint,  // 분할점 (트림 제한용)
      endTime: sourceEnd,         // 원본 끝 시간
      speed: currentSpeed,
    };

    // 원본 클립을 두 클립으로 교체
    const newClips = [...timelineClips];
    newClips.splice(clipIndex, 1, clip1, clip2);
    setTimelineClips(newClips);
    setSelectedClipId(null);
    return true;
  };

  // ========================================
  // 클립 복제 (Duplicate)
  // ========================================

  /**
   * 클립을 복제하여 바로 뒤에 추가
   *
   * ## 동작
   * 1. 선택된 클립의 복사본 생성
   * 2. 원본 클립 바로 뒤 위치에 배치
   * 3. 기존 뒤 클립들은 리플 편집으로 밀림
   *
   * @param clipId - 복제할 클립 ID
   */
  const duplicateClip = (clipId: string) => {
    const clip = timelineClips.find((c) => c.id === clipId);
    if (!clip) return;

    // 복제 클립 생성
    const newClip: TimelineItem = {
      ...clip,
      id: `clip-${Date.now()}`, // 고유 ID 생성
      position: clip.position + clip.duration, // 원본 바로 뒤
    };

    // 복제 위치 이후의 클립들을 밀어냄 (리플 편집)
    const updatedClips = timelineClips.map((c) =>
      c.position >= newClip.position ? { ...c, position: c.position + newClip.duration } : c
    );

    setTimelineClips([...updatedClips, newClip]);
  };

  // ========================================
  // 클립 삭제 (Delete)
  // ========================================

  /**
   * 클립 삭제 및 리플 편집
   *
   * ## 동작
   * 1. 해당 클립 제거
   * 2. 같은 트랙의 뒤 클립들을 삭제된 길이만큼 앞으로 이동
   * 3. 비디오 삭제 시 다른 트랙 클립들의 범위 재조정
   *
   * @param clipId - 삭제할 클립 ID
   */
  const deleteClip = (clipId: string) => {
    const clip = timelineClips.find((c) => c.id === clipId);
    if (!clip) return;

    // 클립 제거 및 리플 편집
    let updatedClips = timelineClips
      .filter((c) => c.id !== clipId)
      .map((c) => {
        // 같은 트랙의 뒤 클립들을 앞으로 이동
        if (c.track === clip.track && c.position > clip.position) {
          return { ...c, position: c.position - clip.duration };
        }
        return c;
      });

    // 비디오 삭제 시 다른 트랙 범위 재조정
    if (clip.track === 'video') {
      const videoClips = updatedClips.filter((c) => c.track === 'video');
      const videoEnd = videoClips.length > 0
        ? Math.max(...videoClips.map((c) => c.position + c.duration))
        : 0;

      updatedClips = updatedClips.map((c) => {
        if (c.track === 'text' || c.track === 'audio' || c.track === 'filter' || c.track === 'sticker') {
          // 비디오 범위 초과 시 위치 조정
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

  // ========================================
  // 재생 속도 조절
  // ========================================

  /**
   * 클립 재생 속도 변경
   *
   * ## 속도와 길이의 관계
   * - 속도 2x: 원본 10초 → 재생 5초 (빠르게)
   * - 속도 0.5x: 원본 10초 → 재생 20초 (슬로우모션)
   *
   * ## 계산식
   * ```
   * 재생 길이(duration) = 원본 구간 길이(sourceLength) / 속도(speed)
   * ```
   *
   * ## 리플 편집
   * 길이 변화에 따라 뒤 클립들의 위치가 자동 조정됩니다.
   *
   * @param clipId - 대상 클립 ID
   * @param speed - 새 재생 속도 (0.1 ~ 8)
   */
  const updateClipSpeed = (clipId: string, speed: number) => {
    const nextSpeed = clampSpeed(speed);
    const clipIndex = timelineClips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) return;

    const clip = timelineClips[clipIndex];

    // 원본 구간 길이 계산
    const currentStart = clip.startTime ?? 0;
    const currentEnd = clip.endTime ?? (currentStart + clip.duration);
    const sourceLength = currentEnd - currentStart;

    // 새 재생 길이 계산 (최소 길이 보장)
    const newDuration = Math.max(sourceLength / nextSpeed, TIMELINE_CONFIG.MIN_CLIP_DURATION);
    const durationDelta = newDuration - clip.duration;

    // 클립 업데이트 및 리플 편집
    let updated = timelineClips.map((c, idx) => {
      if (idx === clipIndex) {
        return {
          ...c,
          speed: nextSpeed,
          duration: newDuration,
          // endTime은 유지 (원본 구간 불변)
        };
      }

      // 같은 트랙의 뒤 클립들 이동
      if (c.track === clip.track && c.position > clip.position && durationDelta !== 0) {
        return { ...c, position: c.position + durationDelta };
      }

      return c;
    });

    // 비디오 범위 재계산 및 다른 트랙 조정
    const videoClips = updated.filter((c) => c.track === 'video');
    const videoEnd = videoClips.length > 0
      ? Math.max(...videoClips.map((c) => c.position + c.duration))
      : 0;

    updated = updated.map((c) => {
      if (c.track === 'text' || c.track === 'audio' || c.track === 'filter' || c.track === 'sticker') {
        if (c.position + c.duration > videoEnd) {
          const maxPosition = Math.max(0, videoEnd - c.duration);
          return { ...c, position: Math.min(c.position, maxPosition) };
        }
      }
      return c;
    });

    setTimelineClips(updated);
  };

  // ========================================
  // 트리밍: 시작점 조정
  // ========================================

  /**
   * 클립 시작점 트리밍 (왼쪽 핸들 드래그)
   *
   * ## 비디오 트랙
   * - 원본 영상의 시작 구간을 조정
   * - startTime 이전으로는 트림 불가 (분할된 클립 제한)
   * - 리플 편집 적용
   *
   * ## 텍스트/오디오/필터/스티커 트랙
   * - 단순히 위치와 길이만 조정
   * - 비디오 범위 내에서만 가능
   *
   * @param clipId - 대상 클립 ID
   * @param newStartTime - 새 시작 시간 (원본 기준)
   */
  const trimClipStart = (clipId: string, newStartTime: number) => {
    const clipIndex = timelineClips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) return;

    const clip = timelineClips[clipIndex];

    // ============================================
    // 텍스트/오디오/필터/스티커: 단순 위치 조정
    // ============================================
    if (clip.track === 'text' || clip.track === 'audio' || clip.track === 'filter' || clip.track === 'sticker') {
      const deltaPosition = newStartTime;
      const newPosition = Math.max(0, clip.position + deltaPosition);
      const actualDelta = newPosition - clip.position;
      const newDuration = Math.max(TIMELINE_CONFIG.MIN_CLIP_DURATION, clip.duration - actualDelta);

      // 비디오 범위 제한
      const videoClips = timelineClips.filter((c) => c.track === 'video');
      const videoEnd = videoClips.length > 0
        ? Math.max(...videoClips.map((c) => c.position + c.duration))
        : 60;

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
    // 비디오 클립: 원본 구간 트리밍 + 리플 편집
    // ============================================
    const currentStart = clip.startTime ?? 0;
    const currentEnd = clip.endTime ?? (currentStart + clip.duration);
    const originalDuration = clip.duration;
    const currentSpeed = clip.speed ?? 1;

    // 트림 제한 검증
    // - 분할된 클립은 원본 startTime 이전으로 갈 수 없음
    // - 최소 길이 보장
    if (newStartTime < currentStart || newStartTime >= currentEnd - TIMELINE_CONFIG.MIN_CLIP_DURATION) {
      return;
    }

    // 새 길이 계산 (속도 고려)
    const sourceLength = currentEnd - newStartTime;
    const newDuration = sourceLength / currentSpeed;
    const durationDelta = newDuration - originalDuration;

    // 가장 앞 클립인지 확인 (position 0 고정 여부)
    const sameTrackClips = timelineClips.filter(c => c.track === clip.track);
    const isFirstClip = sameTrackClips.every(c => c.position >= clip.position);

    // 리플 편집 적용
    let updated = timelineClips.map((c, idx) => {
      if (idx === clipIndex) {
        return {
          ...c,
          startTime: newStartTime,
          duration: newDuration,
          position: isFirstClip ? 0 : c.position, // 첫 클립은 0 고정
        };
      }

      // 같은 트랙의 뒤 클립들 이동
      if (c.track === clip.track && c.position > clip.position) {
        return { ...c, position: c.position + durationDelta };
      }

      return c;
    });

    // 다른 트랙 범위 재조정
    const videoClips = updated.filter((c) => c.track === 'video');
    const videoEnd = videoClips.length > 0
      ? Math.max(...videoClips.map((c) => c.position + c.duration))
      : 0;

    updated = updated.map((c) => {
      if (c.track === 'text' || c.track === 'audio' || c.track === 'filter' || c.track === 'sticker') {
        if (c.position + c.duration > videoEnd) {
          const maxPosition = Math.max(0, videoEnd - c.duration);
          return { ...c, position: Math.min(c.position, maxPosition) };
        }
      }
      return c;
    });

    setTimelineClips(updated);
  };

  // ========================================
  // 트리밍: 끝점 조정
  // ========================================

  /**
   * 클립 끝점 트리밍 (오른쪽 핸들 드래그)
   *
   * ## 비디오 트랙
   * - 원본 영상의 끝 구간을 조정
   * - endTime을 넘어서 늘릴 수 없음 (분할된 클립 제한)
   * - 리플 편집 적용
   *
   * ## 텍스트/오디오/필터/스티커 트랙
   * - 단순히 길이만 조정
   * - 비디오 범위 내에서만 가능
   *
   * @param clipId - 대상 클립 ID
   * @param newEndTime - 새 끝 시간 (원본 기준)
   */
  const trimClipEnd = (clipId: string, newEndTime: number) => {
    const clipIndex = timelineClips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) return;

    const clip = timelineClips[clipIndex];

    // ============================================
    // 텍스트/오디오/필터/스티커: 단순 길이 조정
    // ============================================
    if (clip.track === 'text' || clip.track === 'audio' || clip.track === 'filter' || clip.track === 'sticker') {
      const deltaDuration = newEndTime;
      let newDuration = Math.max(TIMELINE_CONFIG.MIN_CLIP_DURATION, clip.duration + deltaDuration);

      // 비디오 범위 제한
      const videoClips = timelineClips.filter((c) => c.track === 'video');
      const videoEnd = videoClips.length > 0
        ? Math.max(...videoClips.map((c) => c.position + c.duration))
        : 60;

      // 최대 길이 제한
      const maxDuration = videoEnd;
      newDuration = Math.min(newDuration, maxDuration);

      // 끝 위치가 비디오 범위 초과 방지
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
    // 비디오 클립: 원본 구간 트리밍 + 리플 편집
    // ============================================
    const currentStart = clip.startTime ?? 0;
    const currentEnd = clip.endTime ?? (currentStart + clip.duration);
    const originalDuration = clip.duration;
    const currentSpeed = clip.speed ?? 1;

    // 트림 제한 검증
    // - 최소 길이 보장
    // - 분할된 클립은 원본 endTime을 넘어서 늘릴 수 없음
    if (
      newEndTime <= currentStart + TIMELINE_CONFIG.MIN_CLIP_DURATION ||
      newEndTime > currentEnd
    ) {
      return;
    }

    // 새 길이 계산 (속도 고려)
    const sourceLength = newEndTime - currentStart;
    const newDuration = sourceLength / currentSpeed;
    const durationDelta = newDuration - originalDuration;

    // 리플 편집 적용
    let updated = timelineClips.map((c, idx) => {
      if (idx === clipIndex) {
        return {
          ...c,
          endTime: newEndTime,
          duration: newDuration,
        };
      }

      // 같은 트랙의 뒤 클립들 이동
      if (c.track === clip.track && c.position > clip.position) {
        return { ...c, position: c.position + durationDelta };
      }

      return c;
    });

    // 다른 트랙 범위 재조정
    const videoClips = updated.filter((c) => c.track === 'video');
    const videoEnd = videoClips.length > 0
      ? Math.max(...videoClips.map((c) => c.position + c.duration))
      : 0;

    updated = updated.map((c) => {
      if (c.track === 'text' || c.track === 'audio' || c.track === 'filter' || c.track === 'sticker') {
        if (c.position + c.duration > videoEnd) {
          const maxPosition = Math.max(0, videoEnd - c.duration);
          return { ...c, position: Math.min(c.position, maxPosition) };
        }
      }
      return c;
    });

    setTimelineClips(updated);
  };

  // ========================================
  // 클립 추가/업데이트
  // ========================================

  /**
   * 새 클립을 타임라인에 추가
   *
   * @param clip - 추가할 클립 객체
   */
  const addClip = (clip: TimelineItem) => {
    setTimelineClips([...timelineClips, clip]);
  };

  /**
   * 클립 속성 업데이트 (부분 업데이트)
   *
   * @param clipId - 대상 클립 ID
   * @param updates - 업데이트할 속성들
   */
  const updateClip = (clipId: string, updates: Partial<TimelineItem>) => {
    setTimelineClips(timelineClips.map((c) =>
      c.id === clipId ? { ...c, ...updates } : c
    ));
  };

  // ========================================
  // 클립 이동 (드래그 앤 드롭)
  // ========================================

  /**
   * 클립을 새 위치로 이동
   *
   * ## 비디오 트랙
   * - 순서 교환 방식: 드래그 위치에 따라 클립 순서가 바뀜
   * - 모든 클립은 항상 붙어있음 (빈 공간 없음)
   *
   * ## 텍스트/오디오/필터/스티커 트랙
   * - 자유 이동: 비디오 범위 내 어디든 배치 가능
   * - 비디오 범위를 벗어날 수 없음
   *
   * @param clipId - 이동할 클립 ID
   * @param newPosition - 새 위치 (초)
   */
  const moveClip = (clipId: string, newPosition: number) => {
    const clip = timelineClips.find((c) => c.id === clipId);
    if (!clip) return;

    // ============================================
    // 비디오 트랙: 순서 교환 시스템
    // ============================================
    if (clip.track === 'video') {
      // 현재 비디오 클립들을 위치순 정렬
      const videoClips = timelineClips
        .filter((c) => c.track === 'video')
        .sort((a, b) => a.position - b.position);

      const currentIndex = videoClips.findIndex((c) => c.id === clipId);
      if (currentIndex === -1) return;

      // 드래그 위치에 해당하는 타겟 인덱스 계산
      // 각 클립의 중간점을 기준으로 판단
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

      // 순서 변경이 필요한 경우만 처리
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
    // 텍스트/오디오/필터/스티커: 비디오 범위 내 자유 이동
    // ============================================
    if (clip.track === 'text' || clip.track === 'audio' || clip.track === 'filter' || clip.track === 'sticker') {
      const videoClips = timelineClips.filter((c) => c.track === 'video');

      console.log('[moveClip] 클립 이동:', clipId, '새 위치:', newPosition);
      console.log('[moveClip] 비디오 클립 개수:', videoClips.length);

      if (videoClips.length === 0) {
        console.log('[moveClip] 비디오 없음, 이동 취소');
        return;
      }

      // 비디오 범위 계산
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

  // ========================================
  // 반환값
  // ========================================

  return {
    /** 현재 타임라인의 모든 클립 */
    timelineClips,

    /** 선택된 클립 ID */
    selectedClipId,

    /** 선택된 클립 객체 */
    selectedClip,

    /** 타임라인 스크롤 오프셋 */
    scrollOffset,

    /** 클립 선택 설정 */
    setSelectedClipId,

    /** 스크롤 오프셋 설정 */
    setScrollOffset,

    /** 클립 분할 */
    splitClip,

    /** 클립 복제 */
    duplicateClip,

    /** 클립 삭제 */
    deleteClip,

    /** 재생 속도 변경 */
    updateClipSpeed,

    /** 시작점 트리밍 */
    trimClipStart,

    /** 끝점 트리밍 */
    trimClipEnd,

    /** 클립 추가 */
    addClip,

    /** 클립 업데이트 */
    updateClip,

    /** 클립 이동 */
    moveClip,
  };
};
