import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sun, Contrast, Droplets, Thermometer } from 'lucide-react';

interface FilterPanelProps {
  onApply: (filters: FilterSettings) => void;
  onClose: () => void;
  currentFilters?: FilterSettings;
}

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  preset?: string;
}

const FILTER_PRESETS = [
  { id: 'none', name: '없음', filters: { brightness: 0, contrast: 0, saturation: 0, temperature: 0 } },
  { id: 'vivid', name: '선명', filters: { brightness: 10, contrast: 20, saturation: 30, temperature: 0 } },
  { id: 'soft', name: '부드러움', filters: { brightness: 5, contrast: -10, saturation: -15, temperature: 5 } },
  { id: 'cool', name: '쿨톤', filters: { brightness: 0, contrast: 10, saturation: 10, temperature: -20 } },
  { id: 'warm', name: '웜톤', filters: { brightness: 5, contrast: 5, saturation: 15, temperature: 25 } },
  { id: 'pro', name: '프로', filters: { brightness: 8, contrast: 15, saturation: 20, temperature: 10 } },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onApply,
  onClose,
  currentFilters = { brightness: 0, contrast: 0, saturation: 0, temperature: 0 },
}) => {
  const [filters, setFilters] = useState<FilterSettings>(currentFilters);
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(currentFilters.preset);

  // ESC 키로 패널 닫기
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePresetClick = (preset: typeof FILTER_PRESETS[0]) => {
    setFilters({ ...preset.filters, preset: preset.id });
    setSelectedPreset(preset.id);
  };

  const handleSliderChange = (key: keyof Omit<FilterSettings, 'preset'>, value: number) => {
    setFilters({ ...filters, [key]: value, preset: undefined });
    setSelectedPreset(undefined);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({ brightness: 0, contrast: 0, saturation: 0, temperature: 0 });
    setSelectedPreset(undefined);
  };

  return (
    <div className="absolute inset-0 bg-gray-900/95 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full bg-[#2c3441] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">필터</h3>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-[#3d4554] text-white text-sm font-medium hover:bg-[#4a5262]"
            >
              초기화
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-6 py-6 space-y-6">
            {/* Preset Filters */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">프리셋</h4>
              <div className="grid grid-cols-3 gap-3">
                {FILTER_PRESETS.map((preset) => (
                  <motion.button
                    key={preset.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePresetClick(preset)}
                    className={`relative aspect-square rounded-xl overflow-hidden ${
                      selectedPreset === preset.id
                        ? 'ring-2 ring-golf-green'
                        : 'ring-1 ring-gray-600'
                    }`}
                  >
                    {/* Simulated filter preview */}
                    <div
                      className="w-full h-full bg-gradient-to-br from-green-600 to-green-800"
                      style={{
                        filter: `brightness(${1 + preset.filters.brightness / 100}) contrast(${1 + preset.filters.contrast / 100}) saturate(${1 + preset.filters.saturation / 100})`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-xs font-medium text-white">{preset.name}</span>
                    </div>
                    {selectedPreset === preset.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-golf-green flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Manual Adjustments */}
            <div className="space-y-6">
              <h4 className="text-sm font-semibold text-gray-400">세부 조정</h4>

              {/* Brightness */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">밝기</span>
                  </div>
                  <span className="text-sm text-golf-green font-medium">{filters.brightness > 0 ? '+' : ''}{filters.brightness}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={filters.brightness}
                  onChange={(e) => handleSliderChange('brightness', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#3d4554] rounded-lg appearance-none cursor-pointer accent-golf-green"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Contrast className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">대비</span>
                  </div>
                  <span className="text-sm text-golf-green font-medium">{filters.contrast > 0 ? '+' : ''}{filters.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={filters.contrast}
                  onChange={(e) => handleSliderChange('contrast', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#3d4554] rounded-lg appearance-none cursor-pointer accent-golf-green"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">채도</span>
                  </div>
                  <span className="text-sm text-golf-green font-medium">{filters.saturation > 0 ? '+' : ''}{filters.saturation}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={filters.saturation}
                  onChange={(e) => handleSliderChange('saturation', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#3d4554] rounded-lg appearance-none cursor-pointer accent-golf-green"
                />
              </div>

              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">색온도</span>
                  </div>
                  <span className="text-sm text-golf-green font-medium">{filters.temperature > 0 ? '+' : ''}{filters.temperature}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={filters.temperature}
                  onChange={(e) => handleSliderChange('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#3d4554] rounded-lg appearance-none cursor-pointer accent-golf-green"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-700 bg-[#2c3441]">
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-4 rounded-xl bg-[#3d4554] text-white font-semibold hover:bg-[#4a5262]"
            >
              취소
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleApply}
              className="flex-1 py-4 rounded-xl bg-golf-green text-white font-semibold hover:bg-golf-green/90"
            >
              적용
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
