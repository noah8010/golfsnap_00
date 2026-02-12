import { useState } from "react";

/**
 * SECTIONS와 MockScreen이 동일한 퍼센트 높이를 사용하여
 * 오버레이 박스가 와이어프레임 영역과 정확히 일치합니다.
 *
 * 높이 배분:
 *   A(헤더+필터)=12, B(날짜헤더)=5, C(미디어그리드)=58, D(하단)=25  = 100%
 */

const SECTIONS = [
  {
    id: "P3-A",
    label: "A. 헤더 + 필터",
    color: "#ef4444",
    top: 0, left: 0, width: 100, height: 12,
    desc: [
      { key: "← 뒤로가기", value: "편집 모드: P2(비율 선택)으로 / 공유 모드: 대시보드(P1)로" },
      { key: "페이지 제목", value: '"미디어 선택" 고정 텍스트, 18px bold, 중앙 정렬' },
      { key: "✕ 닫기", value: "대시보드(P1)로 복귀, 선택 상태 초기화" },
      { key: "필터 탭", value: "[전체] [영상] [이미지] — 활성: golf-green, 비활성: gray-100" },
      { key: "탭 전환 시", value: "목록 재로딩, 선택 상태 유지됨" },
    ],
  },
  {
    id: "P3-B",
    label: "B. 날짜 그룹 헤더",
    color: "#f59e0b",
    top: 12, left: 0, width: 100, height: 5,
    desc: [
      { key: "그룹화", value: "createdAt 기준 날짜별 내림차순" },
      { key: "표시 형식", value: '"오늘", "어제", 또는 "M월 D일 (요일)"' },
      { key: "미디어 수", value: "우측에 해당 날짜 미디어 수 표시 (예: '4개')" },
      { key: "sticky", value: "스크롤 시 상단 고정 (z-index: 10)" },
    ],
  },
  {
    id: "P3-C",
    label: "C. 미디어 그리드",
    color: "#22c55e",
    top: 17, left: 0, width: 100, height: 58,
    desc: [
      { key: "레이아웃", value: "3열 그리드, 정사각형 썸네일 (1:1), 간격 0.5px" },
      { key: "메타데이터 마크", value: "좌측 하단 녹색(golf-green) 원형 + Info 아이콘 (hasMetadata=true)" },
      { key: "영상 길이", value: '우측 하단 반투명 검정 배경 + Play 아이콘 + "M:SS"' },
      { key: "선택 순서 번호", value: "우측 상단 파란색(#3B82F6) 원형 + 흰색 번호" },
      { key: "선택 체크마크", value: "좌측 상단 파란색 원형 + Check 아이콘" },
      { key: "선택 오버레이", value: "파란색 30% 반투명 + 파란 테두리 2px" },
      { key: "선택 방식", value: "탭 토글, 다중 선택, 순서 유지, 최대 20개" },
    ],
  },
  {
    id: "P3-D",
    label: "D. 하단 영역",
    color: "#06b6d4",
    top: 75, left: 0, width: 100, height: 25,
    desc: [
      { key: "범례", value: '녹색 원 + "스윙 분석 데이터 포함"' },
      { key: "선택 카운트", value: '"N개 선택됨" (0이면 "미디어를 선택하세요")' },
      { key: "비율 표시", value: '"화면 비율: {aspectRatio}"' },
      { key: "편집 모드 버튼", value: '"타임라인 생성" → P4(AI 처리)로 이동' },
      { key: "공유 모드 버튼", value: '"다음" → 1개: 공유 다이얼로그 / 2개+: 편집 모드 전환 확인' },
      { key: "비활성", value: "선택 0개 → opacity 40%, 탭 불가" },
    ],
  },
];

/** CSS wireframe — 각 섹션이 SECTIONS와 동일한 퍼센트 높이를 사용 */
function MockScreen() {
  const thumbnails = [
    { selected: 1, meta: false, video: null },
    { selected: null, meta: true, video: "1:23" },
    { selected: null, meta: false, video: null },
    { selected: 2, meta: true, video: "0:45" },
    { selected: null, meta: false, video: "2:10" },
    { selected: null, meta: true, video: null },
    { selected: 3, meta: false, video: null },
    { selected: null, meta: false, video: "1:07" },
    { selected: null, meta: true, video: null },
    { selected: null, meta: false, video: null },
    { selected: null, meta: true, video: "0:32" },
    { selected: null, meta: false, video: null },
  ];

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "#111", display: "flex", flexDirection: "column",
      fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      {/* A. Header + Filter — 12% */}
      <div style={{
        height: "12%", flexShrink: 0,
        padding: "0 14px",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        {/* Title row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 15, color: "#aaa", cursor: "pointer" }}>←</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>미디어 선택</div>
          <div style={{ fontSize: 14, color: "#aaa", cursor: "pointer" }}>✕</div>
        </div>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {["전체", "영상", "이미지"].map((tab, i) => (
            <div key={tab} style={{
              flex: 1, textAlign: "center",
              padding: "5px 0", borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: i === 0 ? "#2D5A3D" : "#1a1a1a",
              color: i === 0 ? "#fff" : "#888",
            }}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* B. Date group header — 5% */}
      <div style={{
        height: "5%", flexShrink: 0,
        padding: "0 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#161616",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>2월 9일 (일)</div>
        <div style={{ fontSize: 11, color: "#666" }}>4개</div>
      </div>

      {/* C. Media grid — 58% */}
      <div style={{
        flex: 1, overflow: "hidden", padding: "0.5px",
        minHeight: 0,
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5px",
          height: "100%",
        }}>
          {thumbnails.map((item, i) => (
            <div key={i} style={{
              position: "relative",
              background: item.selected
                ? "rgba(59,130,246,0.25)"
                : `hsl(${200 + i * 8}, 5%, ${22 + (i % 3) * 3}%)`,
              border: item.selected ? "2px solid #3b82f6" : "none",
              overflow: "hidden",
            }}>
              {/* Selection number */}
              {item.selected && (
                <div style={{
                  position: "absolute", top: 3, right: 3, zIndex: 2,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#3b82f6", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: "#fff",
                }}>
                  {item.selected}
                </div>
              )}
              {/* Metadata dot */}
              {item.meta && (
                <div style={{
                  position: "absolute", bottom: 3, left: 3, zIndex: 2,
                  width: 12, height: 12, borderRadius: "50%",
                  background: "#2D5A3D", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 6, color: "#fff", fontWeight: 700,
                }}>
                  i
                </div>
              )}
              {/* Video duration */}
              {item.video && (
                <div style={{
                  position: "absolute", bottom: 3, right: 3, zIndex: 2,
                  background: "rgba(0,0,0,0.65)", borderRadius: 3,
                  padding: "1px 4px", display: "flex", alignItems: "center", gap: 2,
                  fontSize: 8, color: "#fff",
                }}>
                  <span style={{ fontSize: 6 }}>▶</span>
                  {item.video}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* D. Bottom area — 25% */}
      <div style={{
        height: "25%", flexShrink: 0,
        padding: "8px 14px 12px",
        background: "#111", borderTop: "1px solid #222",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        {/* Legend */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%", background: "#2D5A3D",
          }} />
          <span style={{ fontSize: 10, color: "#888" }}>스윙 분석 데이터 포함</span>
        </div>
        {/* Count + ratio */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>3개 선택됨</span>
          <span style={{ fontSize: 11, color: "#888" }}>화면 비율: 9:16</span>
        </div>
        {/* Action button */}
        <div style={{
          width: "100%", padding: "12px 0", borderRadius: 12,
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          textAlign: "center", fontSize: 14, fontWeight: 700, color: "#fff",
        }}>
          타임라인 생성
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
            P3. 미디어 선택
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
              <span style={{ color: "#ec4899", fontWeight: 700 }}>MODE</span> 진입 모드<br/>
              <span style={{ fontSize: 11, color: "#555" }}>
                편집: P1 → P2 → P3<br/>
                공유: P1 → P3 (9:16)
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginBottom: 10 }}>
              <span style={{ color: "#a855f7", fontWeight: 700 }}>DIALOG</span> 편집 모드 전환<br/>
              <span style={{ fontSize: 11, color: "#555" }}>
                공유 모드에서 2개+ 선택 시<br/>
                편집 모드 전환 확인 다이얼로그
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
              <span style={{ color: "#64748b", fontWeight: 700 }}>LIMIT</span> 선택 제한<br/>
              <span style={{ fontSize: 11, color: "#555" }}>
                최소 1개, 최대 20개
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
                    p3-media.md → <span style={{ color: "#888" }}>&lt;!-- SECTION: {active.id} --&gt;</span>
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
