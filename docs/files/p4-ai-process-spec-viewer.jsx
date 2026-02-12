import { useState } from "react";

/* ──────────────────────────────────────────────
 *  P4. AI 처리 — Spec Viewer  (v1.2 · 2026-02-11)
 *
 *  Layout zones (centered vertically):
 *    Top space  = 22%   (centering padding)
 *    A. Icon    = 12%   (step icon + spacing)
 *    B. Message = 11%   (title + detail text)
 *    C. Bar     =  8%   (progress bar + labels)
 *    D. List    = 25%   (4-item checklist)
 *    Bottom     = 22%   (centering padding)
 *    Total      = 100%
 * ────────────────────────────────────────────── */

const SECTIONS = [
  {
    id: "P4-A",
    label: "A. 중앙 아이콘",
    color: "#ef4444",
    top: 22, left: 15, width: 70, height: 12,
    desc: [
      { key: "크기", value: "48×48px (w-12 h-12)" },
      { key: "색상", value: "#2D5A3D (golf-green)" },
      { key: "전환 애니메이션", value: "scale 0.8→1, opacity 0→1, duration 300ms" },
      { key: "analyzing / generating", value: "Loader2 아이콘, animate-spin (1초 회전)" },
      { key: "subtitles", value: "Type 아이콘 (정적)" },
      { key: "stickers", value: "Sticker 아이콘 (정적)" },
      { key: "complete", value: "Sparkles 아이콘 (정적)" },
    ],
  },
  {
    id: "P4-B",
    label: "B. 진행 메시지",
    color: "#f59e0b",
    top: 34, left: 10, width: 80, height: 11,
    desc: [
      { key: "메인 메시지", value: "단계별 변경 (text-xl, bold, gray-900)" },
      { key: "analyzing", value: '"미디어 분석 중..."' },
      { key: "generating", value: '"타임라인 생성 중..."' },
      { key: "subtitles", value: '"자동 자막 생성 중..."' },
      { key: "stickers", value: '"추천 스티커 배치 중..."' },
      { key: "complete", value: '"완료!"' },
      { key: "상세 텍스트", value: '"{N}개의 미디어로 {비율} 프로젝트를 생성하고 있습니다" (text-sm, gray-600)' },
      { key: "전환 애니메이션", value: "opacity 0→1, y: 10→0 (slide-up fade-in)" },
    ],
  },
  {
    id: "P4-C",
    label: "C. 프로그레스 바",
    color: "#22c55e",
    top: 45, left: 10, width: 80, height: 8,
    desc: [
      { key: "최대 너비", value: "320px (max-w-xs)" },
      { key: "바 높이", value: "8px (h-2), rounded-full" },
      { key: "배경", value: "#E5E7EB (gray-200)" },
      { key: "진행 색상", value: "#2D5A3D (golf-green)" },
      { key: "애니메이션", value: "width transition, duration 500ms, ease-out" },
      { key: "좌측 라벨", value: '"진행률" (text-xs, gray-500)' },
      { key: "우측 라벨", value: '"{progress}%" (text-xs, semibold, golf-green)' },
    ],
  },
  {
    id: "P4-D",
    label: "D. 체크리스트",
    color: "#8b5cf6",
    top: 53, left: 10, width: 80, height: 25,
    desc: [
      { key: "최대 너비", value: "320px (max-w-xs)" },
      { key: "상단 여백", value: "48px (mt-12)" },
      { key: "항목 간격", value: "12px (space-y-3)" },
      { key: "미디어 분석", value: "progress >= 20% 에서 완료" },
      { key: "타임라인 생성", value: "progress >= 50% 에서 완료" },
      { key: "자동 자막 생성", value: "progress >= 75% 에서 완료" },
      { key: "추천 스티커 배치", value: "progress >= 95% 에서 완료" },
      { key: "미완료 원형", value: "20px, #E5E7EB (gray-200), 라벨 gray-400" },
      { key: "완료 원형", value: "20px, #2D5A3D (golf-green), 흰색 체크, 라벨 gray-900 medium" },
      { key: "체크 애니메이션", value: "scale 0→1" },
      { key: "항목 등장", value: "x: -20→0, opacity 0→1, stagger: index × 100ms" },
    ],
  },
];

/* ── 사이드바 노트 (비시각적 섹션) ── */
const NOTES = [
  {
    id: "STEPS",
    label: "진행 단계 타이밍",
    color: "#06b6d4",
    items: [
      "analyzing: 1,000ms (0%→20%)",
      "generating: 1,500ms (20%→50%)",
      "subtitles: 1,200ms (50%→75%)",
      "stickers: 1,000ms (75%→95%)",
      "complete: 500ms (95%→100%)",
      "대기 800ms → onComplete()",
      "총 소요: 약 6.0초",
    ],
  },
  {
    id: "COMPLETE",
    label: "완료 시 동작",
    color: "#f59e0b",
    items: [
      "100% → '완료!' + Sparkles 아이콘",
      "0.8초 대기 후 onComplete() 호출",
      "currentScreen → 'editor'",
      "selectedTemplate → null (초기화)",
    ],
  },
  {
    id: "SERVER",
    label: "서버 처리",
    color: "#ec4899",
    items: [
      "POST /api/projects 호출",
      "클립: 선택 미디어 순서대로 배치",
      "shotData: metadata → VideoClip 변환",
      "썸네일: 첫 번째 미디어 사용",
      "템플릿: 텍스트/오디오/필터/스티커 자동생성",
    ],
  },
  {
    id: "ERROR",
    label: "에러 처리",
    color: "#64748b",
    items: [
      "분석 실패(400): P3 복귀",
      "네트워크 오류: 재시도 버튼",
      "타임아웃(30초): 재시도 버튼",
      "서버 에러(5xx): P3 복귀",
    ],
  },
];

/** MockScreen: P4 AI 처리 wireframe */
function MockScreen() {
  const checklist = [
    { label: "미디어 분석", done: true },
    { label: "타임라인 생성", done: true },
    { label: "자동 자막 생성", done: false },
    { label: "추천 스티커 배치", done: false },
  ];

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "#fff", color: "#111",
      display: "flex", flexDirection: "column",
      fontFamily: "'Pretendard', sans-serif",
      position: "relative",
    }}>
      {/* ── Top centering space: 22% ── */}
      <div style={{ height: "22%", flexShrink: 0 }} />

      {/* ── A. 중앙 아이콘: 12% ── */}
      <div style={{
        height: "12%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2D5A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: "spin 1.5s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>

      {/* ── B. 진행 메시지: 11% ── */}
      <div style={{
        height: "11%", flexShrink: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 24px",
      }}>
        <div style={{
          fontSize: 18, fontWeight: 700, color: "#111827",
          marginBottom: 6, textAlign: "center",
        }}>
          타임라인 생성 중...
        </div>
        <div style={{
          fontSize: 13, color: "#6b7280", textAlign: "center",
          lineHeight: 1.4,
        }}>
          3개의 미디어로 9:16 프로젝트를 생성하고 있습니다
        </div>
      </div>

      {/* ── C. 프로그레스 바: 8% ── */}
      <div style={{
        height: "8%", flexShrink: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 40px",
      }}>
        <div style={{
          width: "100%", maxWidth: 280,
        }}>
          <div style={{
            width: "100%", height: 6, background: "#e5e7eb",
            borderRadius: 999, overflow: "hidden",
          }}>
            <div style={{
              width: "65%", height: "100%",
              background: "#2D5A3D",
              borderRadius: 999,
            }} />
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: 6,
          }}>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>진행률</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#2D5A3D" }}>65%</span>
          </div>
        </div>
      </div>

      {/* ── D. 체크리스트: 25% ── */}
      <div style={{
        height: "25%", flexShrink: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center",
        paddingTop: 24,
      }}>
        <div style={{
          width: "100%", maxWidth: 280,
          display: "flex", flexDirection: "column", gap: 10,
          padding: "0 40px",
        }}>
          {checklist.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
            }}>
              {item.done ? (
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#2D5A3D",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="5 13 10 17 19 7" />
                  </svg>
                </div>
              ) : (
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#e5e7eb",
                  flexShrink: 0,
                }} />
              )}
              <span style={{
                fontSize: 13, fontWeight: item.done ? 500 : 400,
                color: item.done ? "#111827" : "#9ca3af",
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom centering space: 22% ── */}
      <div style={{ height: "22%", flexShrink: 0 }} />
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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
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
            P4. AI 처리
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
                      p4-ai-process.md → <span style={{ color: "#888" }}>&lt;!-- SECTION: {active.id} --&gt;</span>
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
                      p4-ai-process.md → <span style={{ color: "#888" }}>&lt;!-- SECTION: P4-{active.id} --&gt;</span>
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
