# API 명세

> **파일**: `_api.md`  
> **최종 수정**: v1.0 (2026-02-09)

> `[TBD]` 표시된 항목은 백엔드 설계 시 확정 필요

---

<!-- SECTION: API-AUTH -->
## 인증

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/auth/login` | 로그인 `[TBD]` |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/me` | 현재 사용자 정보 |

---

<!-- SECTION: API-USER -->
## 사용자

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/users/{id}` | 사용자 정보 조회 |
| PATCH | `/api/users/{id}` | 사용자 정보 수정 (이름, 테마 등) |

---

<!-- SECTION: API-MEDIA -->
## 미디어

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/media` | 미디어 목록 조회 (쿼리: type, sort, page) |
| POST | `/api/media/upload` | 미디어 업로드 (multipart/form-data) |
| DELETE | `/api/media/{id}` | 미디어 삭제 |

---

<!-- SECTION: API-PROJECT -->
## 프로젝트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/projects` | 프로젝트 목록 조회 (sort=updatedAt:desc) |
| POST | `/api/projects` | 프로젝트 생성 (비율, 미디어 목록, 템플릿ID) |
| GET | `/api/projects/{id}` | 프로젝트 상세 조회 (타임라인 포함) |
| PATCH | `/api/projects/{id}` | 프로젝트 수정 (이름, 타임라인) |
| DELETE | `/api/projects/{id}` | 프로젝트 삭제 |
| POST | `/api/projects/{id}/duplicate` | 프로젝트 복제 |

---

<!-- SECTION: API-EXPORT -->
## 내보내기

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/exports` | 렌더링 시작 (projectId, quality, format) |
| GET | `/api/exports/{id}/status` | 렌더링 진행률 조회 |
| DELETE | `/api/exports/{id}` | 렌더링 취소 |
| GET | `/api/exports/{id}/download` | 렌더링 결과 다운로드 URL |

---

<!-- SECTION: API-AI -->
## AI 어시스턴트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/ai/analyze` | 샷 데이터 기반 추천 생성 (shotData 입력) |
