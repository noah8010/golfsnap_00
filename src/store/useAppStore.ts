/**
 * @file useAppStore.ts
 * @description 전역 상태 관리 스토어 (Zustand 기반)
 *
 * GolfSnap 앱의 모든 전역 상태를 관리하는 Zustand 스토어입니다.
 * 주요 기능:
 * 1. 화면 네비게이션 상태 관리
 * 2. 골프 샷 데이터 저장
 * 3. 프로젝트 CRUD (생성, 읽기, 수정, 삭제)
 * 4. 타임라인 편집 상태
 * 5. 재생 컨트롤 상태
 *
 * @see https://github.com/pmndrs/zustand - Zustand 공식 문서
 */

import { create } from 'zustand';
import { ShotData, VideoClip, Project, TimelineItem, MediaItem, AspectRatio, ClubType } from '../types/golf';
import { ProjectTemplate } from '../constants/templates';

// ============================================================================
// 스토어 인터페이스 정의
// ============================================================================

/**
 * 앱 전역 상태 인터페이스
 *
 * 앱 전체에서 공유되는 모든 상태와 액션을 정의합니다.
 */
interface AppState {
  // ========================================
  // 화면 네비게이션
  // ========================================

  /**
   * 현재 활성화된 화면
   * - home: 홈 화면 (미구현)
   * - explore: 샷 탐색 화면 (미구현)
   * - create: 프로젝트 대시보드 (구현완료)
   * - booking: 예약 화면 (미구현)
   * - profile: 프로필 화면 (미구현)
   * - newProject: 새 프로젝트 생성 플로우
   * - editor: 영상 편집기 화면 (구현완료)
   */
  currentScreen: 'home' | 'explore' | 'create' | 'booking' | 'profile' | 'newProject' | 'editor';

  /** 현재 화면 변경 함수 */
  setCurrentScreen: (screen: AppState['currentScreen']) => void;

  // ========================================
  // 공유 모드
  // ========================================

  /** 공유 다이얼로그 표시 여부 */
  isShareMode: boolean;

  /** 공유 모드 설정 함수 */
  setShareMode: (isShareMode: boolean) => void;

  // ========================================
  // 템플릿 선택
  // ========================================

  /** 선택된 프로젝트 템플릿 (새 프로젝트 플로우에서 사용) */
  selectedTemplate: ProjectTemplate | null;

  /** 템플릿 선택/해제 함수 */
  setSelectedTemplate: (template: ProjectTemplate | null) => void;

  // ========================================
  // 골프 샷 데이터
  // ========================================

  /** 저장된 골프 샷 데이터 목록 */
  shots: ShotData[];

  /** 새 샷 데이터 추가 함수 */
  addShot: (shot: ShotData) => void;

  // ========================================
  // 프로젝트 관리
  // ========================================

  /** 모든 프로젝트 목록 */
  projects: Project[];

  /** 새 프로젝트 추가 */
  addProject: (project: Project) => void;

  /** 기존 프로젝트 수정 (부분 업데이트) */
  updateProject: (projectId: string, updates: Partial<Project>) => void;

  /** 프로젝트 삭제 */
  deleteProject: (projectId: string) => void;

  /** 프로젝트 복제 (복사본 생성) */
  duplicateProject: (projectId: string) => void;

  /** 새 프로젝트 생성 (화면 비율 및 미디어 선택 후) */
  createNewProject: (aspectRatio: AspectRatio, selectedMedia: MediaItem[]) => void;

  // ========================================
  // 현재 편집 중인 프로젝트
  // ========================================

  /** 현재 편집기에서 열린 프로젝트 */
  currentProject: Project | null;

  /** 현재 프로젝트 설정 함수 */
  setCurrentProject: (project: Project | null) => void;

  // ========================================
  // 타임라인 편집
  // ========================================

  /** 현재 선택된 클립 */
  selectedClip: VideoClip | null;

  /** 선택 클립 설정 함수 */
  setSelectedClip: (clip: VideoClip | null) => void;

  /** 타임라인에 클립 추가 */
  addClipToTimeline: (clip: VideoClip) => void;

  /** 타임라인에서 클립 제거 */
  removeClipFromTimeline: (clipId: string) => void;

  /** 타임라인 아이템 속성 업데이트 */
  updateTimelineItem: (itemId: string, updates: Partial<TimelineItem>) => void;

  // ========================================
  // 재생 상태
  // ========================================

  /** 현재 재생 중 여부 */
  isPlaying: boolean;

  /** 현재 재생 위치 (초) */
  currentTime: number;

  /** 재생 상태 설정 함수 */
  setIsPlaying: (playing: boolean) => void;

  /** 재생 위치 설정 함수 */
  setCurrentTime: (time: number) => void;

  // ========================================
  // 자동 저장 상태
  // ========================================

  /** 저장 상태 ('saved' | 'saving' | 'unsaved') */
  saveStatus: 'saved' | 'saving' | 'unsaved';

  /** 마지막 저장 시간 */
  lastSavedAt: number | null;

  /** 저장 상태 설정 함수 */
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;

  /** 마지막 저장 시간 설정 함수 */
  setLastSavedAt: (time: number | null) => void;
}

// ============================================================================
// Zustand 스토어 생성
// ============================================================================

/**
 * GolfSnap 앱 전역 스토어
 *
 * @example
 * // 컴포넌트에서 사용
 * const currentScreen = useAppStore((state) => state.currentScreen);
 * const setCurrentScreen = useAppStore((state) => state.setCurrentScreen);
 *
 * // 또는 여러 상태를 한번에
 * const { projects, addProject } = useAppStore();
 */
export const useAppStore = create<AppState>((set) => ({
  // ========================================
  // 초기 상태: 화면 네비게이션
  // ========================================

  /** 앱 시작 시 프로젝트 대시보드(create) 화면을 보여줌 */
  currentScreen: 'create',

  setCurrentScreen: (screen) => set({ currentScreen: screen }),

  // ========================================
  // 초기 상태: 공유 모드
  // ========================================

  isShareMode: false,
  setShareMode: (isShareMode) => set({ isShareMode }),

  // 초기 상태: 템플릿
  selectedTemplate: null,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  // ========================================
  // 초기 상태: 골프 샷 데이터
  // ========================================

  shots: [],

  /**
   * 새 골프 샷 데이터를 목록에 추가
   * @param shot - 추가할 샷 데이터
   */
  addShot: (shot) => set((state) => ({ shots: [...state.shots, shot] })),

  // ========================================
  // 초기 상태: 프로젝트 목록 (샘플 데이터 포함)
  // ========================================

  /**
   * 초기 샘플 프로젝트 3개
   * 실제 앱에서는 로컬 스토리지 또는 서버에서 로드
   */
  projects: [
    {
      id: 'project-1',
      name: '드라이버 샷 모음',
      createdAt: Date.now() - 86400000 * 2, // 2일 전
      updatedAt: Date.now() - 86400000 * 2,
      clips: [
        {
          id: 'clip-p1-1',
          shotId: 'shot-p1-1',
          startTime: 0,
          endTime: 15,
          duration: 15,
          thumbnail: '',
          videoUrl: '',
          shotData: {
            id: 'shot-p1-1',
            timestamp: Date.now() - 86400000 * 2,
            ballSpeed: 168,
            clubSpeed: 112,
            launchAngle: 13,
            backSpin: 2600,
            sideSpin: -120,
            distance: 285,
            accuracy: 92,
            club: 'Driver',
            spinRate: 2600,
            holeResult: 'birdie',
            remainingDistance: 8,
          },
        },
      ],
      timeline: [],
      duration: 45, // 45초
      thumbnail: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
    },
    {
      id: 'project-2',
      name: '아이언 연습 영상',
      createdAt: Date.now() - 86400000, // 1일 전
      updatedAt: Date.now() - 86400000,
      clips: [
        {
          id: 'clip-p2-1',
          shotId: 'shot-p2-1',
          startTime: 0,
          endTime: 10,
          duration: 10,
          thumbnail: '',
          videoUrl: '',
          shotData: {
            id: 'shot-p2-1',
            timestamp: Date.now() - 86400000,
            ballSpeed: 132,
            clubSpeed: 88,
            launchAngle: 24,
            backSpin: 4500,
            sideSpin: 50,
            distance: 142,
            accuracy: 98,
            club: '9Iron',
            spinRate: 4500,
            remainingDistance: 4,
            holeResult: 'par',
          },
        },
      ],
      timeline: [],
      duration: 32, // 32초
      thumbnail: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop',
    },
    {
      id: 'project-3',
      name: '라운딩 하이라이트',
      createdAt: Date.now() - 3600000, // 1시간 전
      updatedAt: Date.now() - 3600000,
      clips: [],
      timeline: [],
      duration: 120, // 2분
      thumbnail: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=400&h=300&fit=crop',
    },
  ],

  /**
   * 새 프로젝트를 목록에 추가
   * @param project - 추가할 프로젝트 객체
   */
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),

  /**
   * 기존 프로젝트의 일부 속성 업데이트
   * updatedAt 타임스탬프는 자동으로 갱신됨
   *
   * @param projectId - 업데이트할 프로젝트 ID
   * @param updates - 업데이트할 속성들
   */
  updateProject: (projectId, updates) => set((state) => ({
    projects: state.projects.map((p) =>
      p.id === projectId ? { ...p, ...updates, updatedAt: Date.now() } : p
    ),
  })),

  /**
   * 프로젝트 삭제
   * @param projectId - 삭제할 프로젝트 ID
   */
  deleteProject: (projectId) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== projectId),
  })),

  /**
   * 프로젝트 복제 (복사본 생성)
   * 새 ID와 "(복사본)" 접미사가 붙은 이름으로 생성됨
   *
   * @param projectId - 복제할 원본 프로젝트 ID
   */
  duplicateProject: (projectId) => set((state) => {
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return state;

    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`, // 고유 ID 생성
      name: `${project.name} (복사본)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return { projects: [...state.projects, newProject] };
  }),

  /**
   * 새 프로젝트 생성 (3단계 플로우 완료 후 호출)
   *
   * 1. 선택된 미디어로 타임라인 클립 생성
   * 2. 새 프로젝트 객체 생성
   * 3. 프로젝트 목록에 추가
   * 4. 현재 프로젝트로 설정
   * 5. 에디터 화면으로 자동 이동
   *
   * @param aspectRatio - 선택된 화면 비율 ('16:9', '9:16', '1:1')
   * @param selectedMedia - 선택된 미디어 파일 목록
   */
  createNewProject: (aspectRatio, selectedMedia) => set((state) => {
    const projectId = `project-${Date.now()}`;
    const now = Date.now();

    /**
     * 미디어 메타데이터에서 클럽 한글명을 ClubType으로 변환
     */
    const mapClubType = (clubType?: string): ClubType => {
      if (!clubType) return 'Driver';
      const clubMap: Record<string, ClubType> = {
        '드라이버': 'Driver',
        '3번 우드': '3Wood',
        '5번 우드': '5Wood',
        '3번 아이언': '3Iron',
        '4번 아이언': '4Iron',
        '5번 아이언': '5Iron',
        '6번 아이언': '6Iron',
        '7번 아이언': '7Iron',
        '8번 아이언': '8Iron',
        '9번 아이언': '9Iron',
        '피칭웨지': 'PW',
        '샌드웨지': 'SW',
        '퍼터': 'Putter',
      };
      return clubMap[clubType] || 'Driver';
    };

    /**
     * 클럽 타입에 따른 시뮬레이션 ShotData 생성
     */
    const generateShotData = (media: MediaItem, index: number): ShotData => {
      const club = mapClubType(media.metadata?.clubType);
      const clubSpeed = media.metadata?.swingSpeed || 100;
      // 클럽에 따른 합리적인 기본값 생성
      const distanceMap: Record<string, number> = {
        'Driver': 260, '3Wood': 230, '5Wood': 210,
        '3Iron': 200, '4Iron': 190, '5Iron': 175, '6Iron': 165,
        '7Iron': 155, '8Iron': 145, '9Iron': 135,
        'PW': 120, 'SW': 90, 'Putter': 5,
      };
      return {
        id: `shot-${projectId}-${index}`,
        timestamp: now,
        ballSpeed: Math.round(clubSpeed * 1.5),
        clubSpeed,
        launchAngle: club === 'Driver' ? 12 : club === 'Putter' ? 2 : 20,
        backSpin: club === 'Putter' ? 500 : 3000,
        sideSpin: 0,
        distance: distanceMap[club] || 200,
        accuracy: 90,
        club,
        spinRate: club === 'Putter' ? 500 : 3000,
      };
    };

    // 메타데이터 있는 미디어에서 VideoClip 생성
    const videoClips: VideoClip[] = selectedMedia
      .filter((media) => media.hasMetadata && media.metadata)
      .map((media, index) => ({
        id: `clip-${projectId}-vc-${index}`,
        shotId: `shot-${projectId}-${index}`,
        startTime: 0,
        endTime: media.duration || 5,
        duration: media.duration || 5,
        thumbnail: media.thumbnail,
        videoUrl: media.uri,
        shotData: generateShotData(media, index),
      }));

    // 선택된 미디어로 비디오 타임라인 클립 생성
    let currentPosition = 0;
    const videoTimeline: TimelineItem[] = selectedMedia.map((media, index) => {
      const duration = media.duration || 5; // 이미지는 기본 5초
      const clip: TimelineItem = {
        id: `clip-${projectId}-${index}`,
        clipId: media.id,
        position: currentPosition,
        duration: duration,
        startTime: 0,
        endTime: duration,
        track: 'video',
        speed: 1,
        volume: 1,
      };
      currentPosition += duration;
      return clip;
    });

    // 총 비디오 길이 계산
    const totalDuration = selectedMedia.reduce((acc, m) => acc + (m.duration || 5), 0);

    // 템플릿이 선택된 경우 비-비디오 트랙 클립 병합
    let templateClips: TimelineItem[] = [];
    const template = state.selectedTemplate;
    if (template) {
      templateClips = template.timeline
        .filter((c) => c.track !== 'video')
        .map((c) => ({
          ...c,
          id: `${c.id}-${now}`,
          clipId: `${c.clipId}-${now}`,
          // 비디오 범위를 초과하지 않도록 조정
          position: Math.min(c.position, Math.max(0, totalDuration - c.duration)),
          duration: Math.min(c.duration, totalDuration),
        }));
    }

    const newProject: Project = {
      id: projectId,
      name: template
        ? `${template.name} - ${new Date().toLocaleDateString('ko-KR')}`
        : `새 프로젝트 ${state.projects.length + 1}`,
      createdAt: now,
      updatedAt: now,
      clips: videoClips,
      timeline: [...videoTimeline, ...templateClips],
      duration: totalDuration,
      aspectRatio,
      thumbnail: selectedMedia[0]?.thumbnail,
    };

    return {
      projects: [...state.projects, newProject],
      currentProject: newProject,
      currentScreen: 'editor',
      selectedTemplate: null, // 사용 후 초기화
    };
  }),

  // ========================================
  // 초기 상태: 현재 편집 프로젝트
  // ========================================

  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),

  // ========================================
  // 초기 상태: 선택된 클립
  // ========================================

  selectedClip: null,
  setSelectedClip: (clip) => set({ selectedClip: clip }),

  // ========================================
  // 타임라인 편집 액션
  // ========================================

  /**
   * 현재 프로젝트의 타임라인에 클립 추가
   *
   * 1. 새 타임라인 아이템 생성
   * 2. 클립 목록에 추가
   * 3. 타임라인에 추가
   * 4. 프로젝트 총 길이 갱신
   *
   * @param clip - 추가할 영상 클립
   */
  addClipToTimeline: (clip) => set((state) => {
    if (!state.currentProject) return state;

    const newTimelineItem: TimelineItem = {
      id: `timeline-${Date.now()}`,
      clipId: clip.id,
      position: state.currentProject.timeline.length,
      duration: clip.duration,
      track: 'video', // 기본 트랙은 video
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

  /**
   * 타임라인에서 클립 제거
   *
   * 1. 타임라인에서 해당 아이템 필터링
   * 2. 클립 목록에서도 제거
   * 3. 총 길이 재계산
   *
   * @param clipId - 제거할 클립 ID
   */
  removeClipFromTimeline: (clipId) => set((state) => {
    if (!state.currentProject) return state;

    const updatedTimeline = state.currentProject.timeline.filter(
      (item) => item.clipId !== clipId
    );
    const updatedClips = state.currentProject.clips.filter(
      (clip) => clip.id !== clipId
    );
    // 남은 아이템들의 duration 합계로 총 길이 재계산
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

  /**
   * 타임라인 아이템 속성 업데이트
   *
   * @param itemId - 업데이트할 아이템 ID
   * @param updates - 업데이트할 속성들 (Partial<TimelineItem>)
   */
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

  // ========================================
  // 초기 상태: 재생 컨트롤
  // ========================================

  /** 초기 상태: 정지 */
  isPlaying: false,

  /** 초기 재생 위치: 0초 */
  currentTime: 0,

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),

  // ========================================
  // 초기 상태: 자동 저장
  // ========================================

  /** 초기 상태: 저장됨 */
  saveStatus: 'saved',

  /** 초기 저장 시간: null */
  lastSavedAt: null,

  setSaveStatus: (status) => set({ saveStatus: status }),
  setLastSavedAt: (time) => set({ lastSavedAt: time }),
}));
