# 데이터 모델

> **파일**: `_data-model.md`  
> **최종 수정**: v1.0 (2026-02-09)

---

<!-- SECTION: DM-USER -->
## User (사용자)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | O | 고유 ID |
| email | string | O | 이메일 |
| displayName | string | O | 표시 이름 |
| bio | string | X | 한줄 소개 |
| profileImage | string (URL) | X | 프로필 이미지 |
| createdAt | datetime | O | 가입일 |
| theme | 'light' \| 'dark' \| 'system' | O | 테마 설정 |

---

<!-- SECTION: DM-PROJECT -->
## Project (프로젝트)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | O | 고유 ID |
| userId | string (UUID) | O | 소유자 ID |
| name | string | O | 프로젝트명 (최대 50자) |
| aspectRatio | '16:9' \| '9:16' \| '1:1' | O | 화면 비율 |
| duration | number | O | 총 길이 (초) |
| thumbnail | string (URL) | X | 대표 썸네일 |
| clips | VideoClip[] | O | 영상 클립 목록 |
| timeline | TimelineItem[] | O | 타임라인 아이템 목록 |
| templateId | string | X | 사용된 템플릿 ID |
| createdAt | datetime | O | 생성일 |
| updatedAt | datetime | O | 수정일 |

---

<!-- SECTION: DM-VIDEOCLIP -->
## VideoClip (영상 클립)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | O | 고유 ID |
| mediaId | string | O | 연결된 미디어 ID |
| duration | number | O | 길이 (초) |
| thumbnail | string (URL) | X | 클립 썸네일 |
| shotData | ShotData | X | 스윙 분석 데이터 |

---

<!-- SECTION: DM-SHOTDATA -->
## ShotData (샷 분석 데이터)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| distance | number | O | 비거리 (yards) |
| ballSpeed | number | O | 볼 스피드 (mph) |
| clubSpeed | number | X | 클럽 스피드 (mph) |
| launchAngle | number | X | 발사각 (degrees) |
| backSpin | number | X | 백스핀 (rpm) |
| sideSpin | number | X | 사이드스핀 (rpm) |
| accuracy | number | O | 정확도 (0~100%) |
| club | ClubType | O | 클럽 종류 |
| holeResult | HoleResult | X | 홀 결과 |

**ClubType:** `'Driver' | '3Wood' | '5Wood' | '3Iron' | ... | 'PW' | 'SW' | 'Putter'`
**HoleResult:** `'hole-in-one' | 'eagle' | 'birdie' | 'par' | 'bogey' | 'double-bogey'`

---

<!-- SECTION: DM-MEDIA -->
## MediaItem (미디어)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | O | 고유 ID |
| userId | string (UUID) | O | 소유자 ID |
| type | 'video' \| 'image' | O | 미디어 타입 |
| uri | string (URL) | O | 원본 파일 URL |
| thumbnail | string (URL) | O | 썸네일 URL |
| duration | number | X | 영상 길이 (type=video) |
| width | number | O | 가로 해상도 |
| height | number | O | 세로 해상도 |
| fileSize | number | O | 파일 크기 (bytes) |
| mimeType | string | O | MIME 타입 |
| hasMetadata | boolean | O | 샷 분석 데이터 보유 여부 |
| metadata | object | X | 메타데이터 (클럽, 스윙스피드 등) |
| createdAt | datetime | O | 촬영/업로드 일시 |

---

<!-- SECTION: DM-TIMELINE -->
## TimelineItem (타임라인 클립)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | O | 고유 ID |
| clipId | string | O | 연결된 클립/미디어 ID |
| track | TrackType | O | 트랙 타입 |
| position | number | O | 시작 위치 (초) |
| duration | number | O | 길이 (초) |
| startTime | number | X | 원본 시작 시간 (트림용) |
| endTime | number | X | 원본 끝 시간 (트림용) |
| speed | number | X | 재생 속도 (0.1~8, video 전용) |
| volume | number | X | 원본 오디오 볼륨 (0~1, video 전용) |
| audioMuted | boolean | X | 음소거 (video 전용) |
| transitions | {in: TransitionType, out: TransitionType} | X | 전환 효과 (video 전용) |
| textContent | string | X | 텍스트 내용 |
| textFont | string | X | 폰트 |
| textFontSize | number | X | 폰트 크기 (px) |
| textColor | string | X | 텍스트 색상 (hex) |
| textAlign | 'left' \| 'center' \| 'right' | X | 정렬 |
| textBold | boolean | X | 굵게 |
| textItalic | boolean | X | 기울임 |
| textUnderline | boolean | X | 밑줄 |
| textAnimation | TextAnimationType | X | 텍스트 애니메이션 |
| textPosition | {x: number, y: number} | X | 위치 (0~100%) |
| audioVolume | number | X | 오디오 볼륨 (0~100) |
| audioMuted | boolean | X | 오디오 음소거 |
| audioBgm | {id, name, volume} | X | BGM 정보 |
| filterPreset | string | X | 필터 프리셋명 |
| filterBrightness | number | X | 밝기 (-100~100) |
| filterContrast | number | X | 대비 (-100~100) |
| filterSaturation | number | X | 채도 (-100~100) |
| filterTemperature | number | X | 색온도 (-100~100) |
| stickerEmoji | string | X | 스티커 이모지 |
| stickerAnimation | StickerAnimationType | X | 스티커 애니메이션 |
| stickerScale | number | X | 스티커 크기 (0.5~3) |
| stickerPosition | {x: number, y: number} | X | 위치 (0~100%) |

---

<!-- SECTION: DM-ENUMS -->
## 열거형 (Enum) 정의

**TrackType:** `'video' | 'text' | 'audio' | 'filter' | 'sticker'`

**TransitionType:** `'none' | 'fade' | 'slide' | 'zoom'`

**TextAnimationType:** `'none' | 'fade-in' | 'fade-out' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom-in' | 'bounce' | 'typewriter' | 'glow'`

**StickerAnimationType:** `'none' | 'bounce' | 'spin' | 'pulse' | 'shake'`
