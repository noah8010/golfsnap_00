import { useState } from "react";

/**
 * SECTIONS와 MockScreen이 동일한 퍼센트 높이를 사용하여
 * 오버레이 박스가 와이어프레임 영역과 정확히 일치합니다.
 *
 * 높이 배분:
 *   A(헤더)=7, B(안내)=6, C(비율카드)=75, D(다음버튼)=12  = 100%
 */

const SECTIONS = [
  {
    id: "P2-A",
    label: "A. 헤더",
    color: "#ef4444",
    top: 0, left: 0, width: 100, height: 7,
    desc: [
      { key: "페이지 제목", value: '"화면 비율 선택" 고정 텍스트, 중앙 정렬' },
      { key: "좌측 빈 공간", value: "24px 너비 — 레이아웃 대칭 유지용" },
      { key: "✕ 닫기", value: "대시보드(P1)로 복귀, 선택 상태 초기화" },
      { key: "닫기 애니메이션", value: "whileTap: scale 0.9" },
    ],
  },
  {
    id: "P2-B",
    label: "B. 안내 텍스트",
    color: "#f59e0b",
    top: 7, left: 0, width: 100, height: 6,
    desc: [
      { key: "내용", value: '"프로젝트에 사용할 화면 비율을 선택하세요"' },
      { key: "크기/색상", value: "14px, gray-600 (#4B5563)" },
      { key: "정렬", value: "좌측 정렬" },
    ],
  },
  {
    id: "P2-C",
    label: "C. 비율 카드",
    color: "#22c55e",
    top: 13, left: 0, width: 100, height: 75,
    desc: [
      { key: "16:9 카드", value: "가로형 미리보기(80×48px), '유튜브 등 가로 영상'" },
      { key: "9:16 카드", value: "세로형 미리보기(48×80px), '쇼츠, 릴스 등 세로 영상'" },
      { key: "1:1 카드", value: "정사각 미리보기(64×64px), '인스타그램 피드'" },
      { key: "선택 방식", value: "라디오(단일 선택), 탭하여 선택, whileTap: scale 0.98" },
      { key: "비선택 카드", value: "테두리 #E5E7EB, 배경 white, 아이콘 gray-400, 우측 빈 원형" },
      { key: "선택된 카드", value: "테두리 #3B82F6, 배경 blue-50, 아이콘 blue-500, 우측 파란 원형+체크" },
      { key: "체크 애니메이션", value: "scale 0→1 (Framer Motion)" },
      { key: "카드 간격", value: "16px (space-y-4)" },
    ],
  },
  {
    id: "P2-D",
    label: "D. 다음 버튼",
    color: "#8b5cf6",
    top: 88, left: 0, width: 100, height: 12,
    desc: [
      { key: "텍스트", value: '"다음", 16px, semibold, 흰색' },
      { key: "배경색", value: "#2D5A3D (golf-green), 라운드 12px" },
      { key: "활성 조건", value: "비율이 선택되었을 때만 활성" },
      { key: "비활성 스타일", value: "opacity 40%, cursor-not-allowed, 탭 불가" },
      { key: "탭 동작", value: "onNext(selectedRatio) → P3(미디어 선택) 이동" },
      { key: "애니메이션", value: "whileTap: scale 0.98" },
    ],
  },
];

/** CSS wireframe — 각 섹션이 SECTIONS와 동일한 퍼센트 높이를 사용 */
function MockScreen() {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "#111",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      {/* A. Header — 7% */}
      <div style={{
        height: "7%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        background: "#1a1a1a", borderBottom: "1px solid #2a2a2a",
      }}>
        <div style={{ width: 24 }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>
          화면 비율 선택
        </div>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "#333", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: "#999", fontWeight: 700,
        }}>✕</div>
      </div>

      {/* B. Guide text — 6% */}
      <div style={{
        height: "6%", flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 20px",
        fontSize: 13, color: "#888",
      }}>
        프로젝트에 사용할 화면 비율을 선택하세요
      </div>

      {/* C. Ratio cards — 75% */}
      <div style={{
        flex: 1,
        padding: "4px 20px",
        display: "flex", flexDirection: "column",
        gap: 12,
        overflow: "hidden", minHeight: 0,
      }}>
        {/* 16:9 Card - unselected */}
        <div style={{
          flex: 1,
          border: "1.5px solid #3a3a3a",
          borderRadius: 14,
          padding: "0 18px",
          background: "#1a1a1a",
          display: "flex", alignItems: "center", gap: 16,
          minHeight: 0,
        }}>
          <div style={{
            width: 60, height: 34, borderRadius: 6,
            background: "#2a2a2a", border: "1px solid #444",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "#666", fontWeight: 600, flexShrink: 0,
          }}>16:9</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd", marginBottom: 3 }}>16:9</div>
            <div style={{ fontSize: 11, color: "#777" }}>유튜브 등 가로 영상</div>
          </div>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            border: "2px solid #444", flexShrink: 0,
          }} />
        </div>

        {/* 9:16 Card - selected (blue) */}
        <div style={{
          flex: 1,
          border: "2px solid #3b82f6",
          borderRadius: 14,
          padding: "0 18px",
          background: "rgba(59,130,246,0.08)",
          display: "flex", alignItems: "center", gap: 16,
          boxShadow: "0 0 20px rgba(59,130,246,0.1)",
          minHeight: 0,
        }}>
          <div style={{
            width: 34, height: 56, borderRadius: 6,
            background: "rgba(59,130,246,0.15)", border: "1px solid #3b82f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "#3b82f6", fontWeight: 600, flexShrink: 0,
          }}>9:16</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>9:16</div>
            <div style={{ fontSize: 11, color: "#93b4f5" }}>쇼츠, 릴스 세로 영상</div>
          </div>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: "#3b82f6", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#fff", fontWeight: 700,
          }}>✓</div>
        </div>

        {/* 1:1 Card - unselected */}
        <div style={{
          flex: 1,
          border: "1.5px solid #3a3a3a",
          borderRadius: 14,
          padding: "0 18px",
          background: "#1a1a1a",
          display: "flex", alignItems: "center", gap: 16,
          minHeight: 0,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 6,
            background: "#2a2a2a", border: "1px solid #444",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "#666", fontWeight: 600, flexShrink: 0,
          }}>1:1</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd", marginBottom: 3 }}>1:1</div>
            <div style={{ fontSize: 11, color: "#777" }}>인스타그램 피드</div>
          </div>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            border: "2px solid #444", flexShrink: 0,
          }} />
        </div>
      </div>

      {/* D. 다음 Button — 12% */}
      <div style={{
        height: "12%", flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 20px",
      }}>
        <div style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 12,
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          textAlign: "center",
          fontSize: 15, fontWeight: 700, color: "#fff",
          letterSpacing: 0.5,
          boxShadow: "0 4px 16px rgba(34,197,94,0.25)",
        }}>다음</div>
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
            P2. 비율 선택
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

        {/* ── Left: Section List ── */}
        <div style={{
          width: 220, borderRight: "1px solid #1a1a1a",
          overflowY: "auto", padding: "16px 0", flexShrink: 0,
        }}>
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

          {/* Notes section */}
          <div style={{ padding: "16px", borderTop: "1px solid #1a1a1a", marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: 1, marginBottom: 10 }}>
              NOTES
            </div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginBottom: 10 }}>
              <span style={{ color: "#ec4899", fontWeight: 700 }}>TEMPLATE</span> 템플릿 사전선택<br/>
              <span style={{ fontSize: 11, color: "#555" }}>
                템플릿에서 진입 시<br/>
                해당 비율이 자동 선택됨
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginBottom: 10 }}>
              <span style={{ color: "#64748b", fontWeight: 700 }}>CONSTRAINT</span> 비율 제약<br/>
              <span style={{ fontSize: 11, color: "#555" }}>
                생성 후 비율 변경 불가
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
              <span style={{ color: "#06b6d4", fontWeight: 700 }}>SHARE</span> 공유 모드<br/>
              <span style={{ fontSize: 11, color: "#555" }}>
                공유 모드 시 P2 건너뜀<br/>
                기본 비율 9:16 자동 적용
              </span>
            </div>
          </div>
        </div>

        {/* ── Center: Wireframe + Annotations ── */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          background: "#0a0a0a", position: "relative", overflow: "hidden",
          minWidth: 0,
        }}>
          <div style={{
            position: "absolute", inset: 0, opacity: 0.03,
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          <div style={{ position: "relative", height: "92%", maxHeight: 780 }}>
            <div style={{
              position: "relative",
              border: "2px solid #2a2a2a",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 0 80px rgba(0,0,0,0.5), 0 0 0 1px #1a1a1a",
              height: "100%",
              aspectRatio: "393 / 852",
            }}>
              <MockScreen />

              {/* Annotation overlays — SECTIONS와 동일 퍼센트 */}
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

                <div style={{
                  marginTop: 24, padding: "12px 14px",
                  background: "#0d1a0d", borderRadius: 8,
                  border: "1px solid #1a2e1a",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4CAF50", marginBottom: 4 }}>
                    SOURCE
                  </div>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    p2-ratio.md → <span style={{ color: "#888" }}>&lt;!-- SECTION: {active.id} --&gt;</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", padding: 40, textAlign: "center",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "#151515", display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16, fontSize: 24,
              }}>
                👈
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
