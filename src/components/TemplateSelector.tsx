/**
 * @file TemplateSelector.tsx
 * @description 프로젝트 템플릿 선택 컴포넌트
 *
 * 대시보드에서 프리셋 템플릿을 가로 스크롤로 보여줍니다.
 * 템플릿을 선택하면 해당 설정으로 새 프로젝트가 생성됩니다.
 *
 * ## 표시 정보
 * - 아이콘 이모지
 * - 템플릿 이름
 * - 설명
 * - 태그 (인기, 추천, SNS, 분석)
 * - 화면비 / 예상 길이
 */

import React from 'react';
import { motion } from 'framer-motion';
import { PROJECT_TEMPLATES, ProjectTemplate } from '../constants/templates';

/** TemplateSelector 컴포넌트 Props */
interface TemplateSelectorProps {
  /** 템플릿 선택 시 콜백 */
  onSelect: (template: ProjectTemplate) => void;
}

/**
 * 프로젝트 템플릿 선택 컴포넌트
 *
 * 가로 스크롤 카드 레이아웃으로 4가지 템플릿을 표시합니다.
 */
export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3">템플릿으로 시작</h2>
      <div
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {PROJECT_TEMPLATES.map((template) => (
          <motion.button
            key={template.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(template)}
            className="flex-shrink-0 w-36 bg-white rounded-xl border border-gray-200 p-3 text-left hover:border-golf-green transition-colors"
          >
            {/* 아이콘 + 태그 */}
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{template.icon}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${template.tagColor}`}>
                {template.tag}
              </span>
            </div>

            {/* 이름 */}
            <h3 className="text-sm font-bold text-gray-900 mb-0.5">
              {template.name}
            </h3>

            {/* 설명 */}
            <p className="text-xs text-gray-500 mb-2">
              {template.description}
            </p>

            {/* 메타 정보 */}
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span>{template.aspectRatio}</span>
              <span>·</span>
              <span>{template.duration}초</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
