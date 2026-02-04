/**
 * @file AudioWaveform.tsx
 * @description 오디오 파형 시각화 컴포넌트
 *
 * 오디오 트랙 클립 내부에 파형(waveform)을 렌더링합니다.
 * 실제 오디오 데이터가 아닌 clipId 기반 시드로 일관된 가짜 파형을 생성합니다.
 *
 * ## 동작
 * - clipId를 해시하여 시드 생성
 * - 시드 기반으로 일관된 파형 데이터 생성 (같은 클립은 항상 같은 파형)
 * - Canvas API로 파형 렌더링
 * - 줌/크기 변경 시 자동 리사이즈
 */

import React, { useRef, useEffect, useCallback } from 'react';

/** AudioWaveform 컴포넌트 Props */
interface AudioWaveformProps {
  /** 클립 ID (파형 시드 생성용) */
  clipId: string;
  /** 캔버스 너비 (px) */
  width: number;
  /** 캔버스 높이 (px) */
  height: number;
  /** 파형 색상 */
  color?: string;
}

/**
 * 문자열을 숫자 해시로 변환
 *
 * @param str - 입력 문자열
 * @returns 해시 숫자값
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  return Math.abs(hash);
};

/**
 * 시드 기반 의사 난수 생성기
 *
 * @param seed - 시드 값
 * @returns 0~1 사이의 의사 난수를 반환하는 함수
 */
const seededRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0xffffffff;
  };
};

/**
 * 시드 기반 파형 데이터 생성
 *
 * @param seed - 시드 값
 * @param count - 생성할 샘플 수
 * @returns 0~1 사이의 파형 진폭 배열
 */
const generateWaveformData = (seed: number, count: number): number[] => {
  const random = seededRandom(seed);
  const data: number[] = [];

  // 기본 파형 생성
  for (let i = 0; i < count; i++) {
    const base = 0.3 + random() * 0.5;
    // 약간의 연속성을 위해 이전 값과 보간
    const prev = data.length > 0 ? data[data.length - 1] : base;
    const smoothed = prev * 0.3 + base * 0.7;
    data.push(Math.min(1, Math.max(0.1, smoothed)));
  }

  return data;
};

/**
 * 오디오 파형 시각화 컴포넌트
 *
 * Canvas를 사용하여 clipId 기반의 일관된 가짜 파형을 렌더링합니다.
 */
export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  clipId,
  width,
  height,
  color = 'rgba(255, 255, 255, 0.6)',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * 캔버스에 파형 렌더링
   */
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);

    // 파형 데이터 생성
    const seed = hashString(clipId);
    const barWidth = 2;
    const gap = 1;
    const barCount = Math.floor(width / (barWidth + gap));
    const waveformData = generateWaveformData(seed, barCount);

    // 파형 그리기
    ctx.fillStyle = color;
    const centerY = height / 2;

    waveformData.forEach((amplitude, i) => {
      const x = i * (barWidth + gap);
      const barHeight = amplitude * (height - 4);
      const y = centerY - barHeight / 2;
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  }, [clipId, width, height, color]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};
