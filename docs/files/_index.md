# GolfSnap - 웹 서비스 개발 명세서

> **문서 버전**: v1.0  
> **작성일**: 2026-02-09  
> **프로토타입**: https://noah8010.github.io/golfsnap_00/  
> **대상 독자**: 프론트엔드/백엔드 개발자  
> **표기 규칙**: `[TBD]` = 기획 확정 필요, `[스크린샷]` = 첨부 예정

---

## 파일 구조

### 기능 명세 (MD)

| 파일 | 내용 |
|------|------|
| `_index.md` | 서비스 개요, 기술 요구사항, 파일 구조 (현재 파일) |
| `_common.md` | 공통 컴포넌트 (인증, 네비게이션, 토스트, 다크모드, 데이터 영속성, 로딩) |
| `p1-dashboard.md` | P1. 대시보드 |
| `p2-ratio.md` | P2. 비율 선택 |
| `p3-media.md` | P3. 미디어 선택 |
| `p4-ai-process.md` | P4. AI 처리 |
| `p5-editor.md` | P5. 영상 에디터 |
| `p6-export.md` | P6. 내보내기 |
| `_flow.md` | 화면 전환 흐름도 |
| `_data-model.md` | 데이터 모델 |
| `_api.md` | API 명세 |
| `_error.md` | 에러 처리 |
| `_changelog.md` | 변경 이력 |

### Spec Viewer (JSX) - 페이지

3패널 인터랙티브 뷰어: 좌측 섹션 목록 / 중앙 와이어프레임 + 어노테이션 / 우측 디스크립션

| 파일 | 내용 |
|------|------|
| `p1-dashboard-spec-viewer.jsx` | P1. 대시보드 (CSS 와이어프레임) |
| `p2-ratio-spec-viewer.jsx` | P2. 비율 선택 (CSS 와이어프레임) |
| `p3-media-spec-viewer.jsx` | P3. 미디어 선택 (CSS 와이어프레임) |
| `p4-ai-process-spec-viewer.jsx` | P4. AI 처리 (CSS 와이어프레임) |
| `p5-editor-spec-viewer.jsx` | P5. 영상 에디터 (CSS 와이어프레임) |
| `p6-export-spec-viewer.jsx` | P6. 내보내기 (CSS 와이어프레임) |

### Spec Viewer (JSX) - 팝업/패널

탭 기반 팝업 선택기를 포함한 와이어프레임 뷰어

| 파일 | 내용 |
|------|------|
| `popup-dashboard-spec-viewer.jsx` | P1 대시보드 팝업 (프로젝트 메뉴, 이름변경, 카메라 알림) |
| `popup-editor-panels-spec-viewer.jsx` | P5 에디터 풀스크린 패널 (텍스트, 필터, 오디오, 스티커, AI 어시스턴트) |
| `popup-editor-sheets-spec-viewer.jsx` | P5 에디터 바텀시트 (속도, 볼륨, 전환효과) |
| `popup-common-spec-viewer.jsx` | 공통 팝업 (토스트, 공유, 삭제 확인) |

### 기능 명세 (MD) - 팝업

| 파일 | 내용 |
|------|------|
| `popup-specs.md` | 전체 팝업/패널/시트 기능 명세 |

**접속**: `npm run dev` → http://localhost:3000/golfsnap_00/spec-viewer.html

---

<!-- SECTION: IDX-OVERVIEW -->
## 1. 서비스 개요

### 1.1 서비스 정의

GolfSnap은 스크린골프 이용자를 위한 **모바일 영상 편집 웹앱**입니다.
스크린골프 시뮬레이터에서 기록된 스윙 영상과 샷 분석 데이터를 활용하여, 사용자가 하이라이트 영상을 쉽게 편집하고 공유할 수 있도록 합니다.

### 1.2 타겟 환경

| 항목 | 스펙 |
|------|------|
| 플랫폼 | 모바일 웹 (추후 앱 래핑 가능) |
| 기준 해상도 | 393 x 852px (iPhone 14 Pro) |
| 최소 지원 | iOS Safari 15+, Chrome Android 90+ |
| 화면 방향 | 세로(Portrait) 고정 |
| 터치 지원 | 필수 (마우스 폴백 지원) |
| 오프라인 | 미지원 (항상 네트워크 필요) |

### 1.3 사용자 플로우 요약

```
[로그인] → [대시보드] → [새 프로젝트: 비율 선택 → 미디어 선택 → AI 처리] → [에디터] → [내보내기]
                │                                                              ↑
                └──────────── 기존 프로젝트 선택 ──────────────────────────────┘
```

---

<!-- SECTION: IDX-TECH -->
## 2. 기술 요구사항

### 2.1 프론트엔드

| 항목 | 요구사항 |
|------|---------|
| 프레임워크 | React 18+ (SPA) |
| 언어 | TypeScript strict 모드 |
| 상태 관리 | Zustand (또는 동등 경량 라이브러리) |
| 스타일 | Tailwind CSS (다크 모드: class 전략) |
| 애니메이션 | Framer Motion |
| 영상 재생 | HTML5 `<video>` + Media Source Extensions `[TBD: HLS.js 필요 여부]` |
| 영상 처리 | `[TBD: 클라이언트 WebCodecs vs 서버사이드 FFmpeg]` |

### 2.2 백엔드 (필요 API)

| 항목 | 요구사항 |
|------|---------|
| 인증 | `[TBD: OAuth 소셜 로그인 or 자체 회원가입]` |
| 파일 스토리지 | S3 호환 오브젝트 스토리지 (영상/이미지/썸네일) |
| 영상 렌더링 | `[TBD: 서버사이드 FFmpeg 파이프라인 or 클라이언트 처리]` |
| 데이터베이스 | 사용자, 프로젝트, 미디어 메타데이터 저장 |
| CDN | 미디어 파일 서빙 |

<!-- SECTION: IDX-MEDIA-CONSTRAINTS -->
### 2.3 미디어 제약 조건

| 항목 | 제한값 | 비고 |
|------|--------|------|
| 업로드 가능 포맷 | MP4, MOV, WEBM, JPG, PNG, HEIC | `[TBD: 추가 포맷]` |
| 단일 파일 최대 크기 | `[TBD: 예상 500MB]` | 서버 설정에 따라 |
| 영상 최대 길이 | `[TBD: 예상 10분]` | |
| 영상 최대 해상도 | 3840x2160 (4K) | |
| 프로젝트당 최대 미디어 수 | `[TBD: 예상 20개]` | |
| 프로젝트 최대 타임라인 길이 | `[TBD: 예상 5분]` | |
| 트랙별 최대 클립 수 | `[TBD: 예상 무제한]` | 성능에 따라 제한 가능 |
| 사용자당 최대 프로젝트 수 | `[TBD]` | |
| 총 스토리지 용량 | `[TBD]` | 요금제별 차등 가능 |
