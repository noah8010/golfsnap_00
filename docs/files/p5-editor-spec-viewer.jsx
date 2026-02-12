import { useState } from "react";

/* ──────────────────────────────────────────────
 *  P5. 영상 에디터 — Spec Viewer  (v1.2 · 2026-02-11)
 *
 *  Layout zones (top→bottom):
 *    A. 상단 바        =  6.5%
 *    B. 미리보기       = 42.0%
 *    C. 타임라인 컨트롤 =  4.5%
 *    D. 타임라인 (5트랙) = 40.0%  (flex:1)
 *    E. 편집 툴바      =  7.0%
 *    Total             = 100%
 * ────────────────────────────────────────────── */

const SECTIONS = [
  {
    id: "P5-A",
    label: "A. 상단 바",
    color: "#ef4444",
    top: 0, left: 0, width: 100, height: 6.5,
    desc: [
      { key: "← 뒤로가기", value: "프로젝트 저장 → 대시보드 복귀 (미저장 시 확인 다이얼로그)" },
      { key: "프로젝트명", value: "탭 → 인라인 편집 (input 변환, Enter/blur로 완료, 최대 50자)" },
      { key: "저장 상태", value: "저장됨(회색 체크) / 저장 중(녹색 스피너) / 미저장(주황 원)" },
      { key: "Undo/Redo", value: "최대 30단계, Ctrl+Z / Ctrl+Y 단축키" },
      { key: "[만들기]", value: "내보내기 패널(P6) 열기, #3b82f6 배경" },
    ],
  },
  {
    id: "P5-B",
    label: "B. 미리보기",
    color: "#f59e0b",
    top: 6.5, left: 0, width: 100, height: 42,
    desc: [
      { key: "비율 조정", value: "프로젝트 비율에 맞는 aspect-ratio 적용 (16:9/9:16/1:1)" },
      { key: "비율 뱃지", value: "우측 상단 현재 비율 텍스트 표시" },
      { key: "재생 컨트롤", value: "탭 시 반투명 오버레이 + Play/Pause 토글" },
      { key: "시간 표시", value: "좌측 하단 \"현재시간 / 총시간\" (MM:SS)" },
      { key: "필터 미리보기", value: "활성 필터 시 CSS filter 적용 + 보라색 뱃지" },
      { key: "텍스트/스티커", value: "현재 시간 활성 클립을 오버레이 렌더링, 드래그 위치 변경" },
      { key: "전체화면", value: "Fullscreen API (element.requestFullscreen())" },
    ],
  },
  {
    id: "P5-C",
    label: "C. 타임라인 컨트롤",
    color: "#22c55e",
    top: 48.5, left: 0, width: 100, height: 4.5,
    desc: [
      { key: "\"타임라인\" 라벨", value: "고정 텍스트" },
      { key: "AI 버튼 ✨", value: "shotData 보유 클립 1개 이상 → 녹색 활성, 없으면 회색 비활성" },
      { key: "줌 (−) 버튼", value: "zoom = max(0.5, zoom - 0.25)" },
      { key: "줌 레벨 표시", value: "\"Nx\" 형식 (예: \"1x\")" },
      { key: "줌 (+) 버튼", value: "zoom = min(3.0, zoom + 0.25)" },
      { key: "핀치 줌", value: "두 손가락 핀치로 0.5x ~ 3.0x 조절" },
    ],
  },
  {
    id: "P5-D",
    label: "D. 타임라인",
    color: "#3b82f6",
    top: 53, left: 0, width: 100, height: 40,
    desc: [
      { key: "레이블 영역", value: "좌측 64px 고정 (sticky), 트랙명 + 색상" },
      { key: "영상 트랙", value: "#3b82f6 파란색, 높이 64px, 파일명 표시" },
      { key: "텍스트 트랙", value: "#f59e0b 주황색, 높이 48px, 레이블 탭 → 추가 패널" },
      { key: "오디오 트랙", value: "#10b981 초록색, 높이 48px, 파형 표시" },
      { key: "필터 트랙", value: "#a855f7 보라색, 높이 48px, 프리셋명 표시" },
      { key: "스티커 트랙", value: "#ec4899 핑크색, 높이 48px, 이모지 표시" },
      { key: "플레이헤드", value: "빨간 세로선, 화면 정중앙 고정, 상단 원형 핸들 12px" },
      { key: "타임 눈금자", value: "5초 간격, 줌에 따라 조정" },
    ],
  },
  {
    id: "P5-E",
    label: "E. 편집 툴바",
    color: "#8b5cf6",
    top: 93, left: 0, width: 100, height: 7,
    desc: [
      { key: "다중선택", value: "CheckSquare — 멀티셀렉트 모드 진입 (모든 트랙)" },
      { key: "분할", value: "Scissors — 플레이헤드 위치에서 분할 (영상/오디오/필터만)" },
      { key: "속도", value: "Gauge — 0.1x~8x 속도 패널 (영상만)" },
      { key: "볼륨", value: "Volume2 — 0~100% 볼륨 패널 (영상만)" },
      { key: "수정", value: "Pencil — 해당 편집 패널 (텍스트/오디오/필터/스티커)" },
      { key: "복제", value: "Copy — 바로 뒤에 복사본 (모든 트랙)" },
      { key: "삭제", value: "Trash2 (빨강) — 삭제 확인 다이얼로그 (모든 트랙)" },
      { key: "비활성", value: "40% 투명도, 탭 불가" },
    ],
  },
];

/* ── 사이드바 노트 (비시각적 섹션) ── */
const NOTES = [
  {
    id: "PANELS",
    label: "편집 패널 (오버레이)",
    color: "#ec4899",
    items: [
      "전체화면 오버레이, 하단에서 슬라이드업",
      "텍스트: 내용, 폰트(6종), 크기(16~72), 색상(10색), 정렬, B/I/U, 애니메이션(11종)",
      "오디오: 원본 볼륨(0~100), 음소거, BGM 라이브러리(6곡), BGM 볼륨",
      "필터: 프리셋(6종), 밝기/대비/채도(-50~+50), 색온도(-100~+100), 실시간 미리보기",
      "스티커: 4카테고리(24종), 위치X/Y, 크기(0.5~2.0x), 지속시간(1~10초)",
      "속도: 0.1x~8.0x, 프리셋(0.5/1/2/4x), duration 반비례",
      "볼륨: 0~100%, 프리셋(0/25/50/75/100%), 음소거 토글",
    ],
  },
  {
    id: "AI",
    label: "AI 어시스턴트",
    color: "#06b6d4",
    items: [
      "활성 조건: shotData 보유 클립 1개+",
      "패널 열릴 때 자동 분석 (POST /api/ai/analyze)",
      "감지 뱃지: distance, ballSpeed, club, holeResult",
      "추천 목록: 스티커 + 텍스트 (체크박스 토글)",
      "전체 선택/해제, 다시 분석 버튼",
      "추가 시 해당 클립 position 기준 배치",
      "중복 방지: 동일 내용+위치 시 스킵",
    ],
  },
  {
    id: "CLIPS",
    label: "클립 조작",
    color: "#f59e0b",
    items: [
      "탭 → 선택, 더블탭 → 편집 패널",
      "롱프레스(500ms) → 드래그 이동",
      "영상: 순서 교환 방식 (리플 편집)",
      "비영상: 자유 위치 이동",
      "좌우 트림 핸들 (최소 0.1초)",
      "스냅: 0.3초 임계, 녹색 가이드라인",
      "전환 효과: 영상 인접 클립 간 ◇ 아이콘 (none/fade/slide/zoom)",
    ],
  },
  {
    id: "SAVE",
    label: "자동 저장",
    color: "#22c55e",
    items: [
      "변경 → 2초 디바운스 → PATCH /api/projects/{id}",
      "실패 시 5초 후 재시도 (최대 3회)",
      "3회 실패: error 토스트 + 수동 저장 버튼",
      "이탈 시 미저장 확인 다이얼로그",
    ],
  },
  {
    id: "CONSTRAINT",
    label: "제약 사항",
    color: "#64748b",
    items: [
      "최대 타임라인: 5분",
      "최소 클립: 0.1초",
      "줌: 0.5x~3.0x (0.25 단위)",
      "영상 속도: 0.1x~8.0x",
      "Undo: 30단계",
      "프로젝트명: 50자",
      "텍스트: 200자",
    ],
  },
];

/** MockScreen: Wireframe of the P5 Editor */
function MockScreen() {
  return (
    <div style={{
      width: "100%", height: "100%", background: "#111",
      display: "flex", flexDirection: "column", fontFamily: "inherit",
      fontSize: 10, color: "#ccc", overflow: "hidden",
    }}>
      {/* ── A. Top Bar: 6.5% ── */}
      <div style={{
        height: "6.5%", flexShrink: 0, background: "#1a1a1a",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 10px", borderBottom: "1px solid #333",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#888" }}>←</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>프로젝트명</span>
          <span style={{ fontSize: 8, color: "#666", marginLeft: 2 }}>✔ 저장됨</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#666" }}>↩</span>
          <span style={{ fontSize: 10, color: "#666" }}>↪</span>
          <span style={{
            fontSize: 8, fontWeight: 700, color: "#fff",
            background: "#3b82f6", borderRadius: 4, padding: "2px 8px",
          }}>만들기</span>
        </div>
      </div>

      {/* ── B. Preview Area: 42% ── */}
      <div style={{
        height: "42%", flexShrink: 0, background: "#0a0a0a",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        {/* 16:9 preview box */}
        <div style={{
          width: "75%", aspectRatio: "16/9", background: "#1a1a1a",
          borderRadius: 4, border: "1px solid #333",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          {/* Play button */}
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 0, height: 0,
              borderLeft: "10px solid #fff",
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              marginLeft: 2,
            }} />
          </div>
          {/* Time display */}
          <div style={{
            position: "absolute", bottom: 6, left: 8,
            fontSize: 8, color: "#999", fontFamily: "monospace",
          }}>
            0:15 / 1:23
          </div>
          {/* Ratio badge */}
          <div style={{
            position: "absolute", top: 6, right: 8,
            fontSize: 7, color: "#fff", background: "rgba(255,255,255,0.15)",
            borderRadius: 3, padding: "1px 5px", fontWeight: 700,
          }}>
            16:9
          </div>
          {/* Sample text overlay */}
          <div style={{
            position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
            fontSize: 9, color: "#f59e0b", fontWeight: 700, opacity: 0.7,
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          }}>
            285yd Driver
          </div>
          {/* Sample sticker overlay */}
          <div style={{
            position: "absolute", bottom: "25%", right: "20%",
            fontSize: 16, opacity: 0.6,
          }}>
            🏌️
          </div>
        </div>
      </div>

      {/* ── C. Timeline Control Bar: 4.5% ── */}
      <div style={{
        height: "4.5%", flexShrink: 0, background: "#1a1a1a",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 10px", borderTop: "1px solid #333", borderBottom: "1px solid #333",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#888" }}>타임라인</span>
          <span style={{
            fontSize: 8, background: "#14532d", color: "#22c55e",
            borderRadius: 3, padding: "1px 5px", fontWeight: 700,
          }}>✨ AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10, color: "#666", cursor: "pointer" }}>−</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: "#aaa", fontFamily: "monospace" }}>1x</span>
          <span style={{ fontSize: 10, color: "#666", cursor: "pointer" }}>+</span>
        </div>
      </div>

      {/* ── D. Timeline 5 Tracks: 40% (flex:1) ── */}
      <div style={{
        flex: 1, background: "#111", position: "relative",
        overflow: "hidden", minHeight: 0,
      }}>
        {/* Time ruler */}
        <div style={{
          height: 14, background: "#1a1a1a", display: "flex", alignItems: "center",
          paddingLeft: 40, borderBottom: "1px solid #222", fontSize: 7, color: "#555",
        }}>
          <span style={{ position: "absolute", left: 42 }}>0s</span>
          <span style={{ position: "absolute", left: "25%" }}>5s</span>
          <span style={{ position: "absolute", left: "45%" }}>10s</span>
          <span style={{ position: "absolute", left: "65%" }}>15s</span>
          <span style={{ position: "absolute", left: "85%" }}>20s</span>
        </div>

        {/* Track rows */}
        {[
          { name: "영상", color: "#3b82f6", h: "26%", clipW: "78%" },
          { name: "텍스트", color: "#f59e0b", h: "18%", clipW: "30%" },
          { name: "오디오", color: "#10b981", h: "18%", clipW: "65%" },
          { name: "필터", color: "#a855f7", h: "18%", clipW: "50%" },
          { name: "스티커", color: "#ec4899", h: "18%", clipW: "20%" },
        ].map((track, i) => (
          <div key={i} style={{
            height: track.h, display: "flex", alignItems: "center",
            borderBottom: "1px solid #1a1a1a",
          }}>
            {/* Label */}
            <div style={{
              width: 40, flexShrink: 0, textAlign: "center",
              fontSize: 7, fontWeight: 700, color: track.color, opacity: 0.8,
              borderRight: "1px solid #1a1a1a", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#0f0f0f",
            }}>
              {track.name}
            </div>
            {/* Clip block */}
            <div style={{ flex: 1, padding: "3px 4px", position: "relative" }}>
              <div style={{
                width: track.clipW, height: "80%",
                background: track.color + "33",
                border: `1px solid ${track.color}66`,
                borderRadius: 3,
                display: "flex", alignItems: "center", paddingLeft: 4,
              }}>
                {i === 0 && (
                  <span style={{ fontSize: 6, color: track.color, fontWeight: 600 }}>
                    golf_swing_01.mp4
                  </span>
                )}
                {i === 1 && (
                  <span style={{ fontSize: 6, color: track.color, fontWeight: 600 }}>
                    285yd Driver
                  </span>
                )}
                {i === 2 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 1, height: "60%" }}>
                    {Array.from({ length: 20 }).map((_, j) => (
                      <div key={j} style={{
                        width: 2, borderRadius: 1,
                        height: `${20 + Math.sin(j * 0.8) * 60 + 15}%`,
                        background: track.color + "88",
                      }} />
                    ))}
                  </div>
                )}
                {i === 3 && (
                  <span style={{ fontSize: 6, color: track.color, fontWeight: 600 }}>
                    Vivid
                  </span>
                )}
                {i === 4 && (
                  <span style={{ fontSize: 10 }}>🏌️</span>
                )}
              </div>
              {/* Second clip on text track */}
              {i === 1 && (
                <div style={{
                  position: "absolute", left: "42%", top: "10%",
                  width: "20%", height: "80%",
                  background: track.color + "33",
                  border: `1px solid ${track.color}66`,
                  borderRadius: 3,
                  display: "flex", alignItems: "center", paddingLeft: 4,
                }}>
                  <span style={{ fontSize: 6, color: track.color, fontWeight: 600 }}>
                    BIRDIE!
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Playhead - centered red line */}
        <div style={{
          position: "absolute", top: 0, bottom: 0,
          left: "50%", width: 2, background: "#ef4444",
          zIndex: 10, transform: "translateX(-50%)",
        }}>
          <div style={{
            position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
            width: 10, height: 10, borderRadius: "50%",
            background: "#ef4444", border: "2px solid #fff",
          }} />
        </div>
      </div>

      {/* ── E. Bottom Toolbar: 7% ── */}
      <div style={{
        height: "7%", flexShrink: 0, background: "#1a1a1a",
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "0 8px", borderTop: "1px solid #333",
      }}>
        {[
          { icon: "☑", label: "다중선택", color: "#aaa" },
          { icon: "✂", label: "분할", color: "#aaa" },
          { icon: "◔", label: "속도", color: "#aaa" },
          { icon: "✎", label: "수정", color: "#aaa" },
          { icon: "❐", label: "복제", color: "#aaa" },
          { icon: "✖", label: "삭제", color: "#ef4444" },
        ].map((btn, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
            opacity: i > 2 ? 0.4 : 1,
          }}>
            <span style={{ fontSize: 11, color: btn.color }}>{btn.icon}</span>
            <span style={{ fontSize: 6, color: "#666" }}>{btn.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SpecViewer() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const active = selected || hovered;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
      color: "#e0e0e0",
    }}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{
        padding: "20px 32px",
        borderBottom: "1px solid #1a1a1a",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#4CAF50", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
            GolfSnap · Page Specification
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            P5. 영상 에디터
          </h1>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 12, color: "#666" }}>
          <span>v1.2</span>
          <span style={{ color: "#333" }}>|</span>
          <span>2026-02-11</span>
          <span style={{ color: "#333" }}>|</span>
          <span style={{
            background: "#1a2e1a", color: "#4CAF50", padding: "3px 10px",
            borderRadius: 6, fontSize: 11, fontWeight: 600,
          }}>
            {SECTIONS.length} Sections
          </span>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{
        display: "flex", gap: 0, height: "calc(100vh - 73px)",
      }}>

        {/* ── Left: Section List + Notes ── */}
        <div style={{
          width: 240, borderRight: "1px solid #1a1a1a",
          overflowY: "auto", padding: "16px 0", flexShrink: 0,
        }}>
          {/* Sections */}
          <div style={{ padding: "0 16px 12px", fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: 1.5, textTransform: "uppercase" }}>
            Sections
          </div>
          {SECTIONS.map(s => (
            <button key={s.id}
              onClick={() => setSelected(selected?.id === s.id ? null : s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 16px", border: "none",
                background: selected?.id === s.id ? "#1a1a1a" : "transparent",
                cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                borderLeft: selected?.id === s.id ? `3px solid ${s.color}` : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: s.color,
                flexShrink: 0, opacity: selected?.id === s.id ? 1 : 0.5,
              }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: s.color, opacity: 0.7, marginBottom: 1 }}>
                  {s.id}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: selected?.id === s.id ? "#fff" : "#999" }}>
                  {s.label}
                </div>
              </div>
            </button>
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: "#1a1a1a", margin: "16px 16px 12px" }} />

          {/* Notes */}
          <div style={{ padding: "0 16px 12px", fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: 1.5, textTransform: "uppercase" }}>
            Notes
          </div>
          {NOTES.map(n => (
            <button key={n.id}
              onClick={() => setSelected(selected?.id === n.id ? null : n)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "8px 16px", border: "none",
                background: selected?.id === n.id ? "#1a1a1a" : "transparent",
                cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                borderLeft: selected?.id === n.id ? `3px solid ${n.color}` : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: 2, background: n.color,
                flexShrink: 0, opacity: selected?.id === n.id ? 1 : 0.4,
              }} />
              <div style={{
                fontSize: 12, fontWeight: 500,
                color: selected?.id === n.id ? "#ccc" : "#666",
              }}>
                {n.label}
              </div>
            </button>
          ))}

          {/* Layout summary */}
          <div style={{ padding: "16px", borderTop: "1px solid #1a1a1a", marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: 1, marginBottom: 10 }}>
              LAYOUT
            </div>
            <div style={{ fontSize: 11, color: "#555", lineHeight: 1.8, fontFamily: "monospace" }}>
              <div>A. 상단 바 <span style={{ color: "#444" }}>(6.5%)</span></div>
              <div>B. 미리보기 <span style={{ color: "#444" }}>(42%)</span></div>
              <div>C. 컨트롤 <span style={{ color: "#444" }}>(4.5%)</span></div>
              <div>D. 타임라인 <span style={{ color: "#444" }}>(40%)</span></div>
              <div>E. 툴바 <span style={{ color: "#444" }}>(7%)</span></div>
            </div>
          </div>
        </div>

        {/* ── Center: Wireframe + Annotations ── */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          background: "#0a0a0a", position: "relative", overflow: "hidden",
          minWidth: 0,
        }}>
          {/* Subtle grid bg */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.03,
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          <div style={{ position: "relative", height: "92%", maxHeight: 780, aspectRatio: "393 / 852" }}>
            {/* Phone frame */}
            <div style={{
              position: "relative",
              border: "2px solid #2a2a2a",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 0 80px rgba(0,0,0,0.5), 0 0 0 1px #1a1a1a",
              height: "100%",
              width: "100%",
            }}>
              {/* Wireframe content */}
              <MockScreen />

              {/* Annotation overlays */}
              {SECTIONS.map(s => {
                const isActive = active?.id === s.id;
                return (
                  <div key={s.id}
                    onClick={() => setSelected(selected?.id === s.id ? null : s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      position: "absolute",
                      top: s.top + "%",
                      left: s.left + "%",
                      width: s.width + "%",
                      height: s.height + "%",
                      background: isActive ? s.color + "18" : "transparent",
                      border: isActive ? `2px solid ${s.color}88` : "2px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      zIndex: isActive ? 10 : 1,
                    }}
                  >
                    {isActive && (
                      <div style={{
                        position: "absolute", top: 4, left: 4,
                        background: s.color, color: "#fff",
                        fontSize: 9, fontWeight: 800, padding: "2px 6px",
                        borderRadius: 4, letterSpacing: 0.5,
                        animation: "fadeIn 0.15s ease-out",
                        whiteSpace: "nowrap",
                      }}>
                        {s.id}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: Description Panel ── */}
        <div style={{
          width: 360, borderLeft: "1px solid #1a1a1a",
          overflowY: "auto", flexShrink: 0,
        }}>
          {active ? (
            <div style={{ animation: "fadeIn 0.2s ease-out" }}>
              {/* Section header */}
              <div style={{
                padding: "24px 24px 20px",
                borderBottom: "1px solid #1a1a1a",
                background: "#111",
              }}>
                <div style={{
                  display: "inline-block",
                  fontSize: 10, fontWeight: 800, color: active.color,
                  letterSpacing: 1.5, textTransform: "uppercase",
                  background: active.color + "15",
                  padding: "4px 10px", borderRadius: 6, marginBottom: 10,
                }}>
                  {active.id}
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>
                  {active.label}
                </h2>
              </div>

              {/* Description items (for SECTIONS) */}
              {active.desc && (
                <div style={{ padding: "20px 24px" }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: "#555",
                    letterSpacing: 1.5, marginBottom: 16,
                  }}>
                    DESCRIPTION
                  </div>

                  {active.desc.map((d, i) => (
                    <div key={i} style={{
                      marginBottom: 16, padding: "14px 16px",
                      background: "#151515", borderRadius: 10,
                      borderLeft: `3px solid ${active.color}44`,
                    }}>
                      <div style={{
                        fontSize: 12, fontWeight: 700, color: active.color,
                        marginBottom: 6, opacity: 0.85,
                      }}>
                        {d.key}
                      </div>
                      <div style={{
                        fontSize: 13, color: "#bbb", lineHeight: 1.6,
                      }}>
                        {d.value}
                      </div>
                    </div>
                  ))}

                  {/* Source reference */}
                  <div style={{
                    marginTop: 24, padding: "12px 14px",
                    background: "#0d1a0d", borderRadius: 8,
                    border: "1px solid #1a2e1a",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#4CAF50", marginBottom: 4 }}>
                      SOURCE
                    </div>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      p5-editor.md → <span style={{ color: "#888" }}>&lt;!-- SECTION: {active.id} --&gt;</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Note items (for NOTES) */}
              {active.items && (
                <div style={{ padding: "20px 24px" }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: "#555",
                    letterSpacing: 1.5, marginBottom: 16,
                  }}>
                    DETAILS
                  </div>

                  {active.items.map((item, i) => (
                    <div key={i} style={{
                      marginBottom: 8, padding: "10px 14px",
                      background: "#151515", borderRadius: 8,
                      borderLeft: `3px solid ${active.color}33`,
                      fontSize: 13, color: "#bbb", lineHeight: 1.5,
                    }}>
                      {item}
                    </div>
                  ))}

                  {/* Source reference */}
                  <div style={{
                    marginTop: 24, padding: "12px 14px",
                    background: "#0d1a0d", borderRadius: 8,
                    border: "1px solid #1a2e1a",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#4CAF50", marginBottom: 4 }}>
                      SOURCE
                    </div>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      p5-editor.md → <span style={{ color: "#888" }}>관련 SECTION 참조</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty state */
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", padding: 40, textAlign: "center",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "#151515", display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16, fontSize: 24,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#555", marginBottom: 6 }}>
                섹션을 선택하세요
              </div>
              <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
                좌측 목록 또는 와이어프레임의<br/>
                영역을 클릭하면 해당 섹션의<br/>
                상세 디스크립션을 확인할 수 있습니다
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
