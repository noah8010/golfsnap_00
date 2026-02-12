import { useState } from "react";

/* ──────────────────────────────────────────────
 *  P6. 내보내기 — Spec Viewer  (v1.2 · 2026-02-11)
 *
 *  P6은 에디터 위에 표시되는 모달 오버레이입니다.
 *  와이어프레임은 "설정 단계"를 보여줍니다.
 *  모달 내부 구성:
 *    A. 모달 헤더  (내보내기 + ✕ 닫기)
 *    B. 화질 선택  (720p / 1080p / 4K 카드)
 *    C. 포맷 선택  (MP4 / MOV 카드)
 *    D. 시작 버튼  (만들기 시작)
 *
 *  렌더링/완료/공유는 다른 단계(상태)이므로 NOTES로 분리.
 * ────────────────────────────────────────────── */

const SECTIONS = [
  {
    id: "P6-A",
    label: "A. 모달 헤더",
    color: "#ef4444",
    top: 19, left: 8, width: 84, height: 7,
    desc: [
      { key: "제목", value: '"내보내기" 중앙 정렬, 15px bold white' },
      { key: "좌측 빈 공간", value: "24px (레이아웃 대칭용)" },
      { key: "✕ 닫기 버튼", value: "24×24px 원형, #333 배경, 탭 시 에디터(P5) 복귀" },
      { key: "하단 구분선", value: "1px solid #2a2a2a" },
    ],
  },
  {
    id: "P6-B",
    label: "B. 화질 선택",
    color: "#f59e0b",
    top: 26, left: 8, width: 84, height: 18,
    desc: [
      { key: "라벨", value: '"화질" (11px, bold, #888, 상단 여백 16px)' },
      { key: "HD 720p", value: "비선택: border #333, bg #222, 텍스트 #999" },
      { key: "Full HD 1080p", value: "기본 선택: border 2px #3b82f6, bg blue-50, 텍스트 white, glow shadow" },
      { key: "4K UHD", value: "비선택: border #333, bg #222, 텍스트 #999" },
      { key: "카드 레이아웃", value: "3열 flex, gap 8px, rounded-10, 탭 시 단일 선택" },
      { key: "해상도 매핑", value: "720p: 1280×720 / 1080p: 1920×1080 / 4K: 3840×2160 (비율별 조정)" },
    ],
  },
  {
    id: "P6-C",
    label: "C. 포맷 선택",
    color: "#22c55e",
    top: 44, left: 8, width: 84, height: 14,
    desc: [
      { key: "라벨", value: '"포맷" (11px, bold, #888)' },
      { key: "MP4", value: '기본 선택, 설명: "호환성 최고" (H.264+AAC)' },
      { key: "MOV", value: '비선택, 설명: "고품질 편집용" (H.264+AAC)' },
      { key: "카드 레이아웃", value: "2열 flex, gap 8px, rounded-10, 탭 시 단일 선택" },
    ],
  },
  {
    id: "P6-D",
    label: "D. 만들기 시작",
    color: "#8b5cf6",
    top: 58, left: 8, width: 84, height: 8,
    desc: [
      { key: "버튼 텍스트", value: '"만들기 시작" (14px, bold, white)' },
      { key: "배경", value: "gradient(135deg, #22c55e → #16a34a), glow shadow" },
      { key: "라운드", value: "12px (rounded-xl)" },
      { key: "탭 동작", value: "렌더링 단계로 전환 (step = 'rendering')" },
      { key: "탭 피드백", value: "whileTap: scale 0.98" },
    ],
  },
];

/* ── 사이드바 노트 (비시각적 단계/상태) ── */
const NOTES = [
  {
    id: "RENDER",
    label: "렌더링 단계",
    color: "#f59e0b",
    items: [
      "원형 프로그레스: SVG, 중앙 퍼센트 표시",
      "바 프로그레스: 하단 보조",
      '1단계: "프레임 처리 중" (디코딩/크롭/리사이즈)',
      '2단계: "오디오 믹싱 중" (원본+BGM)',
      '3단계: "효과 렌더링 중" (필터/전환/텍스트/스티커)',
      '4단계: "최종 인코딩 중" (화질/포맷 인코딩)',
      "취소: 확인 다이얼로그 → 설정 단계 복귀",
      "백그라운드 이탈 시 렌더링 중단",
    ],
  },
  {
    id: "COMPLETE",
    label: "완료 단계",
    color: "#22c55e",
    items: [
      "녹색 체크 아이콘 (spring 애니메이션)",
      "파일 정보: 파일명(프로젝트명.포맷), 화질",
      "결과 파일 서버 업로드 (POST /api/exports)",
      "업로드 실패 시: 다운로드 가능, 공유 불가",
    ],
  },
  {
    id: "ACTIONS",
    label: "완료 후 동선",
    color: "#8b5cf6",
    items: [
      "🔗 공유: 공유 다이얼로그 → 완료 후 P1",
      "📥 다운로드: 파일 다운로드 → P1",
      "✏️ 계속 편집: 모달 닫기 → P5 유지",
      "파일명: {프로젝트명}.{포맷}",
      "서버 downloadUrl 우선, 실패 시 Blob URL",
    ],
  },
  {
    id: "SHARE",
    label: "공유 다이얼로그",
    color: "#ec4899",
    items: [
      "제목: 필수, 최대 100자, 기본값=프로젝트명",
      "설명: 선택, 최대 500자",
      "공개: 전체 공개 / 링크 아는 사람만",
      "방식: 링크 복사, 카카오톡, 인스타그램, 더보기",
      "POST /api/shares → shareUrl 생성",
      "성공: success 토스트 → P1 이동",
    ],
  },
  {
    id: "COMPOSITION",
    label: "렌더링 합성 요소",
    color: "#06b6d4",
    items: [
      "영상 클립: 순서, 트림, 속도 반영",
      "전환 효과: fade/slide/zoom/none",
      "텍스트: 위치, 폰트, 크기, 색상, 애니메이션",
      "스티커: 위치, 크기, 애니메이션",
      "필터: 밝기/대비/채도/색온도",
      "오디오: 원본 볼륨 + BGM 믹싱",
      "출력: 선택한 해상도/포맷으로 인코딩",
    ],
  },
  {
    id: "ERROR",
    label: "에러 처리",
    color: "#64748b",
    items: [
      "렌더링 실패: error 토스트 → 설정 복귀",
      "메모리 부족: error 토스트 → 설정 복귀",
      "업로드 실패: warning 토스트 (DL 가능, 공유 불가)",
      "공유 실패: error 토스트 → 다이얼로그 유지",
      "백그라운드 중단: 재시작 안내",
    ],
  },
];

/** MockScreen: P6 Export wireframe (설정 단계) */
function MockScreen() {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "#111",
      display: "flex", flexDirection: "column",
      fontFamily: "'Pretendard', sans-serif",
      overflow: "hidden", position: "relative",
    }}>
      {/* Simulated editor behind the modal */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
      }}>
        {/* Editor top bar */}
        <div style={{
          padding: "10px 14px", background: "#1a1a1a",
          borderBottom: "1px solid #2a2a2a",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 10, color: "#555", fontWeight: 600 }}>GolfSnap</div>
          <div style={{ fontSize: 10, color: "#555", fontWeight: 600 }}>Editor</div>
          <div style={{
            fontSize: 9, color: "#888", background: "#2a2a2a",
            padding: "3px 8px", borderRadius: 4, fontWeight: 600,
          }}>만들기</div>
        </div>

        {/* Editor preview */}
        <div style={{
          flex: 1, background: "#0d0d0d",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: "70%", aspectRatio: "9 / 16", maxHeight: "50%",
            background: "#1a1a1a", borderRadius: 6, border: "1px solid #2a2a2a",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: 10, color: "#333", fontWeight: 600 }}>Preview</div>
          </div>
        </div>

        {/* Editor timeline hint */}
        <div style={{
          height: 60, background: "#151515", borderTop: "1px solid #2a2a2a",
          display: "flex", alignItems: "center", padding: "0 12px", gap: 4, flexShrink: 0,
        }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              flex: 1, height: 8, borderRadius: 3,
              background: i === 1 ? "#3b82f630" : i === 2 ? "#f59e0b20" : "#1a1a1a",
            }} />
          ))}
        </div>

        {/* Editor toolbar hint */}
        <div style={{
          height: 40, background: "#1a1a1a", borderTop: "1px solid #2a2a2a",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexShrink: 0,
        }}>
          {["T", "M", "F", "S"].map(c => (
            <div key={c} style={{
              width: 20, height: 20, borderRadius: 4,
              background: "#222", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 8, color: "#444", fontWeight: 700,
            }}>{c}</div>
          ))}
        </div>
      </div>

      {/* Semi-transparent modal overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10,
      }}>
        {/* Modal card */}
        <div style={{
          width: "85%",
          background: "#1c1c1e",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
        }}>
          {/* ── A. Modal header ── */}
          <div style={{
            padding: "18px 20px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid #2a2a2a",
          }}>
            <div style={{ width: 24 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>
              내보내기
            </div>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "#333", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "#999", fontWeight: 700,
            }}>✕</div>
          </div>

          {/* ── B. Quality section ── */}
          <div style={{ padding: "16px 20px 10px" }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#888",
              letterSpacing: 0.5, marginBottom: 10,
            }}>화질</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                flex: 1, padding: "10px 0", borderRadius: 10,
                border: "1.5px solid #333", background: "#222", textAlign: "center",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#999" }}>720p</div>
                <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>HD</div>
              </div>
              <div style={{
                flex: 1, padding: "10px 0", borderRadius: 10,
                border: "2px solid #3b82f6", background: "rgba(59,130,246,0.12)",
                textAlign: "center", boxShadow: "0 0 16px rgba(59,130,246,0.15)",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>1080p</div>
                <div style={{ fontSize: 9, color: "#7baaf5", marginTop: 2 }}>Full HD</div>
              </div>
              <div style={{
                flex: 1, padding: "10px 0", borderRadius: 10,
                border: "1.5px solid #333", background: "#222", textAlign: "center",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#999" }}>4K</div>
                <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>UHD</div>
              </div>
            </div>
          </div>

          {/* ── C. Format section ── */}
          <div style={{ padding: "10px 20px 16px" }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#888",
              letterSpacing: 0.5, marginBottom: 10,
            }}>포맷</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                flex: 1, padding: "10px 0", borderRadius: 10,
                border: "2px solid #3b82f6", background: "rgba(59,130,246,0.12)",
                textAlign: "center", boxShadow: "0 0 16px rgba(59,130,246,0.15)",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>MP4</div>
                <div style={{ fontSize: 9, color: "#7baaf5", marginTop: 2 }}>호환성 최고</div>
              </div>
              <div style={{
                flex: 1, padding: "10px 0", borderRadius: 10,
                border: "1.5px solid #333", background: "#222", textAlign: "center",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#999" }}>MOV</div>
                <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>고품질 편집용</div>
              </div>
            </div>
          </div>

          {/* ── D. Start button ── */}
          <div style={{ padding: "4px 20px 20px" }}>
            <div style={{
              width: "100%", padding: "13px 0", borderRadius: 12,
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              textAlign: "center", fontSize: 14, fontWeight: 700, color: "#fff",
              letterSpacing: 0.5, boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
            }}>만들기 시작</div>
          </div>
        </div>
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
            P6. 내보내기
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
            Sections (설정 단계)
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
            Notes (다른 단계/상태)
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

          {/* Flow summary */}
          <div style={{ padding: "16px", borderTop: "1px solid #1a1a1a", marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: 1, marginBottom: 10 }}>
              FLOW
            </div>
            <div style={{ fontSize: 11, color: "#555", lineHeight: 2, fontFamily: "monospace" }}>
              <div>1. 설정 <span style={{ color: "#ef4444" }}>← 현재</span></div>
              <div>2. 렌더링 (프로그레스)</div>
              <div>3. 완료 (공유/다운로드)</div>
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
                      borderRadius: 4,
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
                      p6-export.md → <span style={{ color: "#888" }}>&lt;!-- SECTION: P6-SETTINGS --&gt;</span>
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
                      p6-export.md → <span style={{ color: "#888" }}>관련 SECTION 참조</span>
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
