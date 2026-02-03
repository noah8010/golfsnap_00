/**
 * @file useHistoryStore.ts
 * @description 타임라인 편집 히스토리 관리 스토어 (Undo/Redo)
 *
 * 커맨드 패턴 기반으로 타임라인 상태의 히스토리를 관리합니다.
 * 최대 30단계까지 되돌리기/다시 실행을 지원합니다.
 */

import { create } from 'zustand';
import { TimelineItem } from '../types/golf';

/** 최대 히스토리 저장 개수 */
const MAX_HISTORY_SIZE = 30;

/**
 * 히스토리 스토어 인터페이스
 */
interface HistoryState {
  /** 이전 상태 스택 (Undo용) */
  past: TimelineItem[][];

  /** 현재 상태 */
  present: TimelineItem[];

  /** 다음 상태 스택 (Redo용) */
  future: TimelineItem[][];

  /** Undo 가능 여부 */
  canUndo: boolean;

  /** Redo 가능 여부 */
  canRedo: boolean;

  /**
   * 현재 상태 초기화
   * @param state - 초기 타임라인 상태
   */
  initialize: (state: TimelineItem[]) => void;

  /**
   * 새 상태 푸시 (편집 발생 시 호출)
   * @param state - 새로운 타임라인 상태
   */
  pushState: (state: TimelineItem[]) => void;

  /**
   * 실행 취소 (Undo)
   * @returns 이전 상태 또는 null
   */
  undo: () => TimelineItem[] | null;

  /**
   * 다시 실행 (Redo)
   * @returns 다음 상태 또는 null
   */
  redo: () => TimelineItem[] | null;

  /**
   * 히스토리 초기화
   */
  clear: () => void;
}

/**
 * 타임라인 히스토리 관리 스토어
 *
 * @example
 * // 컴포넌트에서 사용
 * const { pushState, undo, redo, canUndo, canRedo } = useHistoryStore();
 *
 * // 편집 시 상태 저장
 * pushState(newTimelineClips);
 *
 * // Undo
 * if (canUndo) {
 *   const prevState = undo();
 *   setTimelineClips(prevState);
 * }
 */
export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  present: [],
  future: [],
  canUndo: false,
  canRedo: false,

  initialize: (state) => {
    set({
      past: [],
      present: JSON.parse(JSON.stringify(state)), // 딥 카피
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },

  pushState: (state) => {
    const { present, past } = get();

    // 현재 상태와 동일하면 저장하지 않음 (중복 방지)
    if (JSON.stringify(present) === JSON.stringify(state)) {
      return;
    }

    // 과거 스택에 현재 상태 추가 (최대 개수 제한)
    const newPast = [...past, JSON.parse(JSON.stringify(present))];
    if (newPast.length > MAX_HISTORY_SIZE) {
      newPast.shift(); // 가장 오래된 항목 제거
    }

    set({
      past: newPast,
      present: JSON.parse(JSON.stringify(state)), // 딥 카피
      future: [], // 새 상태 추가 시 future 초기화
      canUndo: true,
      canRedo: false,
    });
  },

  undo: () => {
    const { past, present, future } = get();

    if (past.length === 0) {
      return null;
    }

    // 과거에서 마지막 상태 가져오기
    const newPast = [...past];
    const previousState = newPast.pop()!;

    // 현재 상태를 미래로 이동
    const newFuture = [JSON.parse(JSON.stringify(present)), ...future];

    set({
      past: newPast,
      present: previousState,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true,
    });

    return previousState;
  },

  redo: () => {
    const { past, present, future } = get();

    if (future.length === 0) {
      return null;
    }

    // 미래에서 첫 번째 상태 가져오기
    const newFuture = [...future];
    const nextState = newFuture.shift()!;

    // 현재 상태를 과거로 이동
    const newPast = [...past, JSON.parse(JSON.stringify(present))];

    set({
      past: newPast,
      present: nextState,
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });

    return nextState;
  },

  clear: () => {
    set({
      past: [],
      present: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },
}));
