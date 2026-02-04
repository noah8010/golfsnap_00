/**
 * @file useTheme.ts
 * @description 다크/라이트 모드 테마 관리 훅
 *
 * 테마 상태를 관리하고 HTML 루트 요소에 'dark' 클래스를 토글합니다.
 * localStorage를 통해 사용자 선택을 유지합니다.
 *
 * ## 동작
 * - 초기값: localStorage 저장값 → 시스템 설정 → 'light'
 * - 토글 시: HTML 클래스 변경 + localStorage 저장
 * - Tailwind CSS의 darkMode: 'class' 방식과 연동
 */

import { useState, useEffect, useCallback } from 'react';

/** 테마 타입 */
export type Theme = 'light' | 'dark';

/** useTheme 훅 반환값 */
interface UseThemeReturn {
  /** 현재 테마 */
  theme: Theme;
  /** 다크 모드 여부 */
  isDark: boolean;
  /** 테마 토글 */
  toggleTheme: () => void;
  /** 테마 직접 설정 */
  setTheme: (theme: Theme) => void;
}

/** localStorage 키 */
const THEME_STORAGE_KEY = 'golfsnap-theme';

/**
 * 초기 테마 결정
 *
 * 우선순위: localStorage > 시스템 설정 > light
 */
const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

/**
 * 다크/라이트 모드 테마 관리 훅
 *
 * @returns 테마 상태 및 조작 함수
 */
export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  /**
   * HTML 루트 요소에 dark 클래스 적용
   */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  /** 테마 설정 */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  /** 테마 토글 */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };
};
