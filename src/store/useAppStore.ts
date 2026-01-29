import { create } from 'zustand';
import { ShotData, VideoClip, Project, TimelineItem, MediaItem, AspectRatio } from '../types/golf';

interface AppState {
  // 현재 활성 화면
  currentScreen: 'home' | 'explore' | 'create' | 'booking' | 'profile' | 'newProject' | 'editor';
  setCurrentScreen: (screen: AppState['currentScreen']) => void;

  // 공유 모드 플래그
  isShareMode: boolean;
  setShareMode: (isShareMode: boolean) => void;

  // 골프 샷 데이터
  shots: ShotData[];
  addShot: (shot: ShotData) => void;

  // 프로젝트 관리
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => void;
  createNewProject: (aspectRatio: AspectRatio, selectedMedia: MediaItem[]) => void;

  // 현재 편집 중인 프로젝트
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;

  // 타임라인 편집
  selectedClip: VideoClip | null;
  setSelectedClip: (clip: VideoClip | null) => void;

  addClipToTimeline: (clip: VideoClip) => void;
  removeClipFromTimeline: (clipId: string) => void;
  updateTimelineItem: (itemId: string, updates: Partial<TimelineItem>) => void;

  // 재생 상태
  isPlaying: boolean;
  currentTime: number;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentScreen: 'create',
  setCurrentScreen: (screen) => set({ currentScreen: screen }),

  isShareMode: false,
  setShareMode: (isShareMode) => set({ isShareMode }),

  shots: [],
  addShot: (shot) => set((state) => ({ shots: [...state.shots, shot] })),

  projects: [
    {
      id: 'project-1',
      name: '드라이버 샷 모음',
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000 * 2,
      clips: [],
      timeline: [],
      duration: 45,
      thumbnail: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
    },
    {
      id: 'project-2',
      name: '아이언 연습 영상',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
      clips: [],
      timeline: [],
      duration: 32,
      thumbnail: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop',
    },
    {
      id: 'project-3',
      name: '라운딩 하이라이트',
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 3600000,
      clips: [],
      timeline: [],
      duration: 120,
      thumbnail: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=400&h=300&fit=crop',
    },
  ],
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (projectId, updates) => set((state) => ({
    projects: state.projects.map((p) =>
      p.id === projectId ? { ...p, ...updates, updatedAt: Date.now() } : p
    ),
  })),
  deleteProject: (projectId) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== projectId),
  })),
  duplicateProject: (projectId) => set((state) => {
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return state;

    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      name: `${project.name} (복사본)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return { projects: [...state.projects, newProject] };
  }),
  createNewProject: (aspectRatio, selectedMedia) => set((state) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: `새 프로젝트 ${state.projects.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      clips: [],
      timeline: [],
      duration: selectedMedia.reduce((acc, m) => acc + (m.duration || 3), 0),
      aspectRatio,
      thumbnail: selectedMedia[0]?.thumbnail,
    };

    return {
      projects: [...state.projects, newProject],
      currentProject: newProject,
      currentScreen: 'editor',
    };
  }),

  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),

  selectedClip: null,
  setSelectedClip: (clip) => set({ selectedClip: clip }),

  addClipToTimeline: (clip) => set((state) => {
    if (!state.currentProject) return state;

    const newTimelineItem: TimelineItem = {
      id: `timeline-${Date.now()}`,
      clipId: clip.id,
      position: state.currentProject.timeline.length,
      duration: clip.duration,
      track: 'video',
    };

    return {
      currentProject: {
        ...state.currentProject,
        clips: [...state.currentProject.clips, clip],
        timeline: [...state.currentProject.timeline, newTimelineItem],
        duration: state.currentProject.duration + clip.duration,
      },
    };
  }),

  removeClipFromTimeline: (clipId) => set((state) => {
    if (!state.currentProject) return state;

    const updatedTimeline = state.currentProject.timeline.filter(
      (item) => item.clipId !== clipId
    );
    const updatedClips = state.currentProject.clips.filter(
      (clip) => clip.id !== clipId
    );
    const newDuration = updatedTimeline.reduce(
      (acc, item) => acc + item.duration,
      0
    );

    return {
      currentProject: {
        ...state.currentProject,
        clips: updatedClips,
        timeline: updatedTimeline,
        duration: newDuration,
      },
    };
  }),

  updateTimelineItem: (itemId, updates) => set((state) => {
    if (!state.currentProject) return state;

    const updatedTimeline = state.currentProject.timeline.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    return {
      currentProject: {
        ...state.currentProject,
        timeline: updatedTimeline,
      },
    };
  }),

  isPlaying: false,
  currentTime: 0,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
}));
