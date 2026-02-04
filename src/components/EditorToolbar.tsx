/**
 * @file EditorToolbar.tsx
 * @description 에디터 하단 툴바 컴포넌트
 *
 * 선택된 클립의 트랙 타입에 따라 사용 가능한 조작 버튼을 표시합니다.
 * - 다중선택: 모든 트랙
 * - 분할: 영상/오디오/필터
 * - 속도/볼륨: 영상만
 * - 수정: 텍스트/오디오/필터/스티커
 * - 복제/삭제: 모든 트랙
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Scissors,
  Gauge,
  Volume2,
  Pencil,
  Copy as CopyIcon,
  Trash2,
} from 'lucide-react';
import { TimelineItem } from '../types/golf';

/** EditorToolbar 컴포넌트 Props */
interface EditorToolbarProps {
  /** 선택된 클립 ID (단일) */
  selectedClipId: string | null;
  /** 선택된 클립 객체 (단일) */
  selectedClip: TimelineItem | undefined;
  /** 다중 선택된 클립 수 */
  selectedCount: number;
  /** 다중 선택 모드 여부 */
  isMultiSelectMode: boolean;
  /** 다중선택 토글 핸들러 */
  onMultiSelect: () => void;
  /** 선택된 클립 일괄 삭제 */
  onDeleteSelected: () => void;
  /** 분할 핸들러 */
  onSplitClip: () => void;
  /** 속도 패널 열기 */
  onShowSpeedPanel: () => void;
  /** 볼륨 패널 열기 */
  onShowVolumePanel: () => void;
  /** 클립 수정 핸들러 */
  onEditClip: () => void;
  /** 복제 핸들러 */
  onDuplicateClip: () => void;
  /** 삭제 확인 핸들러 */
  onShowDeleteConfirm: () => void;
}

/**
 * 에디터 하단 툴바 컴포넌트
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  selectedClipId,
  selectedClip,
  selectedCount,
  isMultiSelectMode,
  onMultiSelect,
  onDeleteSelected,
  onSplitClip,
  onShowSpeedPanel,
  onShowVolumePanel,
  onEditClip,
  onDuplicateClip,
  onShowDeleteConfirm,
}) => {
  // 다중 선택 모드에서는 일괄 조작 UI 표시
  if (isMultiSelectMode) {
    return (
      <div className="flex-shrink-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around py-3 px-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onMultiSelect}
            className="flex flex-col items-center gap-0.5 min-w-0"
          >
            <CheckSquare className="w-5 h-5 text-golf-green" />
            <span className="text-xs text-golf-green font-medium">선택 해제</span>
          </motion.button>

          <div className="flex items-center px-3">
            <span className="text-sm text-gray-700 font-medium">{selectedCount}개 선택됨</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onDeleteSelected}
            disabled={selectedCount === 0}
            className={`flex flex-col items-center gap-0.5 min-w-0 ${selectedCount === 0 ? 'opacity-40' : ''}`}
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <span className="text-xs text-gray-600">일괄 삭제</span>
          </motion.button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around py-3 px-2">
        {/* 다중선택 - 모든 트랙 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onMultiSelect}
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
            onClick={onSplitClip}
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
            onClick={onShowSpeedPanel}
            className="flex flex-col items-center gap-0.5 min-w-0"
          >
            <Gauge className="w-5 h-5 text-gray-700" />
            <span className="text-xs text-gray-600">속도</span>
          </motion.button>
        )}

        {/* 볼륨 - 영상만 */}
        {selectedClip && selectedClip.track === 'video' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onShowVolumePanel}
            className="flex flex-col items-center gap-0.5 min-w-0"
          >
            <Volume2 className="w-5 h-5 text-gray-700" />
            <span className="text-xs text-gray-600">볼륨</span>
          </motion.button>
        )}

        {/* 수정 - 텍스트/오디오/필터/스티커 트랙만 */}
        {selectedClip && (selectedClip.track === 'text' || selectedClip.track === 'audio' || selectedClip.track === 'filter' || selectedClip.track === 'sticker') && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onEditClip}
            className="flex flex-col items-center gap-0.5 min-w-0"
          >
            <Pencil className="w-5 h-5 text-gray-700" />
            <span className="text-xs text-gray-600">수정</span>
          </motion.button>
        )}

        {/* 복제 - 모든 트랙 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onDuplicateClip}
          disabled={!selectedClipId}
          className={`flex flex-col items-center gap-0.5 min-w-0 ${!selectedClipId ? 'opacity-40' : ''}`}
        >
          <CopyIcon className="w-5 h-5 text-gray-700" />
          <span className="text-xs text-gray-600">복제</span>
        </motion.button>

        {/* 삭제 - 모든 트랙 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onShowDeleteConfirm}
          disabled={!selectedClipId}
          className={`flex flex-col items-center gap-0.5 min-w-0 ${!selectedClipId ? 'opacity-40' : ''}`}
        >
          <Trash2 className="w-5 h-5 text-red-600" />
          <span className="text-xs text-gray-600">삭제</span>
        </motion.button>
      </div>
    </div>
  );
};
