/**
 * @file useToastStore.ts
 * @description 인앱 토스트 메시지 상태 관리
 */

import { create } from 'zustand';

interface ToastState {
  /** 토스트 메시지 */
  message: string;
  /** 토스트 타입 */
  type: 'info' | 'warning' | 'error' | 'success';
  /** 표시 여부 */
  visible: boolean;
  /** 토스트 표시 */
  show: (message: string, type?: ToastState['type']) => void;
  /** 토스트 숨기기 */
  hide: () => void;
}

/** 타이머 ID (중복 방지) */
let timeoutId: ReturnType<typeof setTimeout> | null = null;

/**
 * 토스트 메시지 스토어
 *
 * @example
 * // 컴포넌트 내부
 * const show = useToastStore((s) => s.show);
 * show('저장되었습니다', 'success');
 *
 * // 컴포넌트 외부 (핸들러 등)
 * useToastStore.getState().show('오류 발생', 'error');
 */
export const useToastStore = create<ToastState>((set) => ({
  message: '',
  type: 'info',
  visible: false,

  show: (message, type = 'info') => {
    if (timeoutId) clearTimeout(timeoutId);
    set({ message, type, visible: true });
    timeoutId = setTimeout(() => {
      set({ visible: false });
      timeoutId = null;
    }, 2500);
  },

  hide: () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
    set({ visible: false });
  },
}));
