import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle2, MoreVertical, Plus, Copy, Edit2, Trash2, Clock, ChevronLeft, Camera, Upload } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Project } from '../types/golf';
import { useTouchScroll } from '../hooks/useTouchScroll';

export const CreateDashboardScreen: React.FC = () => {
  const { projects, updateProject, deleteProject, duplicateProject, setCurrentScreen, setCurrentProject, setShareMode } = useAppStore();
  const [searchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [showCameraAlert, setShowCameraAlert] = useState(false);
  const scrollRef = useTouchScroll<HTMLDivElement>();

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours < 1) return '방금 전';
      return `${diffInHours}시간 전`;
    } else if (diffInHours < 48) {
      return '어제';
    } else {
      return `${Math.floor(diffInHours / 24)}일 전`;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleMoreClick = (project: Project) => {
    setSelectedProject(project);
    setShowBottomSheet(true);
  };

  const handleDuplicate = () => {
    if (selectedProject) {
      duplicateProject(selectedProject.id);
      setShowBottomSheet(false);
      setSelectedProject(null);
    }
  };

  const handleRename = () => {
    setShowBottomSheet(false);
    setRenameValue(selectedProject?.name || '');
    setShowRenameDialog(true);
  };

  const handleRenameConfirm = () => {
    if (selectedProject && renameValue.trim()) {
      updateProject(selectedProject.id, { name: renameValue.trim() });
      setShowRenameDialog(false);
      setSelectedProject(null);
      setRenameValue('');
    }
  };

  const handleDelete = () => {
    if (selectedProject) {
      deleteProject(selectedProject.id);
      setShowBottomSheet(false);
      setSelectedProject(null);
    }
  };

  const handleNewProject = () => {
    setShareMode(false);
    setCurrentScreen('newProject');
  };

  const handleDuplicateRecent = () => {
    if (projects.length > 0) {
      const recentProject = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      duplicateProject(recentProject.id);
    }
  };

  const handleProjectClick = (project: Project) => {
    setCurrentProject(project);
    setCurrentScreen('editor');
  };

  const handleCameraClick = () => {
    setShowCameraAlert(true);
  };

  const handleVideoUploadClick = () => {
    setShareMode(true);
    setCurrentScreen('newProject');
  };

  return (
    <div className="relative flex flex-col h-full bg-gray-50">
      {/* Status Bar Spacer - 모바일 상단 UI 영역 */}
      <div className="flex-shrink-0 h-11 bg-white" />

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4">
        <div className="flex items-center gap-2 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentScreen('home')}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900">만들기</h1>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide touch-scroll pb-28">
        {/* Profile Section */}
        <div className="px-4 py-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <UserCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Noah.nam</h3>
              <p className="text-sm text-gray-500">100클이 골퍼</p>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="px-4 py-6 bg-white">
          <h2 className="text-lg font-bold text-gray-900 mb-4">공유하기</h2>
          <div className="space-y-3">
            {/* 촬영하기 버튼 */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCameraClick}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-golf-green to-green-600 rounded-2xl shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-white">촬영하기</h3>
                <p className="text-sm text-white/80 mt-0.5">실시간으로 스윙 영상을 촬영해 보세요</p>
              </div>
            </motion.button>

            {/* 영상 업로드 버튼 */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleVideoUploadClick}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:border-golf-green transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-gray-700" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">영상 업로드</h3>
                <p className="text-sm text-gray-500 mt-0.5">갤러리에서 영상을 업로드할 영상을 선택 하세요</p>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Quick Start */}
        <div className="px-4 py-6 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 mb-4">빠른 시작</h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNewProject}
              className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-golf-green transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-golf-green/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-golf-green" />
              </div>
              <span className="text-sm font-semibold text-gray-900">새 프로젝트 시작</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDuplicateRecent}
              disabled={projects.length === 0}
              className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-golf-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Copy className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">최근 프로젝트 복제</span>
            </motion.button>
          </div>
        </div>

        {/* Projects List */}
        <div className="px-4 py-6 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 mb-4">내 프로젝트</h2>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">프로젝트가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  {/* Thumbnail */}
                  <button
                    onClick={() => handleProjectClick(project)}
                    className="relative aspect-video bg-gray-200 w-full text-left"
                  >
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {project.duration > 0 && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white">
                        {formatDuration(project.duration)}
                      </div>
                    )}
                  </button>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{formatDate(project.updatedAt)}</span>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleMoreClick(project)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {showBottomSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowBottomSheet(false);
                setSelectedProject(null);
              }}
              className="absolute inset-0 bg-black/30 z-40"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="px-4 py-6">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
                <div className="space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDuplicate}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50"
                  >
                    <Copy className="w-5 h-5 text-gray-700" />
                    <span className="text-base font-medium text-gray-900">복제</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRename}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50"
                  >
                    <Edit2 className="w-5 h-5 text-gray-700" />
                    <span className="text-base font-medium text-gray-900">이름 변경</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <span className="text-base font-medium text-red-600">삭제</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Rename Dialog */}
      <AnimatePresence>
        {showRenameDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowRenameDialog(false);
                setSelectedProject(null);
                setRenameValue('');
              }}
            >
              {/* Dialog */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-sm"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">프로젝트 이름 변경</h3>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="새 이름을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-golf-green mb-4"
                  autoFocus
                />
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowRenameDialog(false);
                      setSelectedProject(null);
                      setRenameValue('');
                    }}
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
                  >
                    취소
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRenameConfirm}
                    disabled={!renameValue.trim()}
                    className="flex-1 py-3 rounded-xl bg-golf-green text-white font-medium disabled:opacity-50"
                  >
                    확인
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Camera Alert Dialog */}
      <AnimatePresence>
        {showCameraAlert && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCameraAlert(false)}
            >
              {/* Dialog */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-sm"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-golf-green/10 flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8 text-golf-green" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">카메라 연동 개발 예정</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    실시간 촬영 기능은 현재 개발 중입니다.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCameraAlert(false)}
                    className="w-full py-3 rounded-xl bg-golf-green text-white font-medium"
                  >
                    확인
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
