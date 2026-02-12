import { useState } from "react";

/**
 * SECTIONS와 MockScreen이 동일한 퍼센트 높이를 사용하여
 * 오버레이 박스가 와이어프레임 영역과 정확히 일치합니다.
 *
 * 높이 배분:
 *   A(헤더)=5, B(프로필)=8, C-1(촬영)=9, C-2(업로드)=9,
 *   D(빠른시작)=15, E(템플릿)=14, F(프로젝트)=33, NAV=7  = 100%
 */

const SECTIONS = [
  {
    id: "P1-A",
    label: "A. 헤더",
    color: "#ef4444",
    top: 0, left: 0, width: 100, height: 5,
    desc: [
      { key: "← 뒤로가기", value: "홈 탭으로 전환 (항상 활성)" },
      { key: "페이지 제목", value: '"만들기" 고정 텍스트' },
      { key: "🌙/☀️ 다크모드 토글", value: "테마 전환 (항상 활성)" },
    ],
  },
  {
    id: "P1-B",
    label: "B. 프로필 영역",
    color: "#f59e0b",
    top: 5, left: 0, width: 100, height: 8,
    desc: [
      { key: "프로필 이미지", value: "사용자 프로필 사진 (없으면 기본 아바타 아이콘)" },
      { key: "사용자명", value: "user.displayName" },
      { key: "한줄 소개", value: 'user.bio (예: "100클이 골퍼")' },
    ],
  },
  {
    id: "P1-C-1",
    label: "C-1. 촬영하기 버튼",
    color: "#22c55e",
    top: 13, left: 0, width: 100, height: 9,
    desc: [
      { key: "디자인", value: "녹색 그라데이션 배경, 좌측 원형 카메라 아이콘" },
      { key: "탭 동작", value: "기기 카메라 앱 연동 [TBD: 네이티브 카메라 API or WebRTC]" },
      { key: "결과물", value: "촬영 완료 → 영상 파일을 미디어 선택 화면으로 전달" },
      { key: "미지원 시", value: '"카메라를 사용할 수 없습니다" 토스트 (error)' },
    ],
  },
  {
    id: "P1-C-2",
    label: "C-2. 영상 업로드 버튼",
    color: "#06b6d4",
    top: 22, left: 0, width: 100, height: 9,
    desc: [
      { key: "디자인", value: "흰색 배경, 회색 보더, 좌측 원형 업로드 아이콘" },
      { key: "탭 동작", value: "공유 모드로 미디어 선택 화면(P3) 이동" },
      { key: "공유 모드 특징", value: "비율 선택(P2) 건너뜀, 기본 비율 9:16" },
    ],
  },
  {
    id: "P1-D",
    label: "D. 빠른 시작",
    color: "#8b5cf6",
    top: 31, left: 0, width: 100, height: 15,
    desc: [
      { key: "D-1. 새 프로젝트 시작", value: "녹색 원형 배경 + Plus 아이콘 → 비율 선택 화면(P2)으로 이동" },
      { key: "D-2. 최근 프로젝트 복제", value: "파란색 원형 + Copy 아이콘 → 가장 최근 updatedAt 프로젝트를 딥카피" },
      { key: "D-2 비활성 조건", value: "프로젝트 0개 → 50% 투명도, 탭 불가" },
      { key: "복제 로직", value: '이름에 " (복사)" 접미사, 새 ID 생성, 즉시 낙관적 업데이트' },
    ],
  },
  {
    id: "P1-E",
    label: "E. 추천 템플릿",
    color: "#ec4899",
    top: 46, left: 0, width: 100, height: 14,
    desc: [
      { key: "레이아웃", value: "가로 스크롤 가능한 카드 목록" },
      { key: "하이라이트 릴", value: '9:16 / 30초 / 인기 태그 / 텍스트("My Best Shots") + BGM(Energetic Beat)' },
      { key: "연습 기록", value: "16:9 / 60초 / 추천 태그 / 텍스트(날짜) + 필터(Soft)" },
      { key: "SNS 쇼츠", value: "9:16 / 15초 / 트렌드 태그 / BGM(Trendy Pop) + 스티커(불꽃)" },
      { key: "탭 동작", value: "템플릿 저장 → P2 이동 → 해당 비율 사전 선택 상태 → 자동 생성 클립 추가" },
    ],
  },
  {
    id: "P1-F",
    label: "F. 프로젝트 목록",
    color: "#f97316",
    top: 60, left: 0, width: 100, height: 33,
    desc: [
      { key: "레이아웃", value: "2열 그리드, updatedAt 내림차순 정렬" },
      { key: "썸네일", value: "aspect-ratio 16:9, 없으면 회색 배경 + Plus 아이콘" },
      { key: "영상 길이 뱃지", value: '"M:SS" 형식, 우측 하단, 반투명 검정 배경 (duration > 0)' },
      { key: "프로젝트명", value: "최대 1줄, 말줄임(...)" },
      { key: "수정 시각", value: '1시간 미만="방금 전", 1~23시간="N시간 전", 24~47시간="어제", 48시간+="N일 전"' },
      { key: "⋮ 더보기", value: "바텀시트(P1-G) 열기" },
      { key: "카드 탭", value: "해당 프로젝트 에디터(P5) 진입 → 로딩 중 스피너 오버레이" },
      { key: "빈 상태", value: 'Film 아이콘 + "아직 프로젝트가 없습니다" + "위의 새 프로젝트 시작을 눌러 시작하세요"' },
    ],
  },
  {
    id: "CM-NAV",
    label: "하단 네비게이션",
    color: "#64748b",
    top: 93, left: 0, width: 100, height: 7,
    desc: [
      { key: "구성", value: "홈 / 탐색 / (+)만들기 / 예약 / 나 — 5개 탭" },
      { key: "만들기 탭", value: "중앙 녹색 원형 플로팅 버튼 (현재 활성 상태)" },
      { key: "활성 표시", value: "녹색 컬러 + 볼드" },
      { key: "참조", value: "공통 컴포넌트 _common.md / CM-NAV 섹션" },
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
      {/* A. Header — 5% */}
      <div style={{
        height: "5%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        background: "#1a1a1a", borderBottom: "1px solid #2a2a2a",
      }}>
        <div style={{ fontSize: 14, color: "#888", fontWeight: 600 }}>←</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>만들기</div>
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "#333", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, color: "#999",
        }}>🌙</div>
      </div>

      {/* B. Profile — 8% */}
      <div style={{
        height: "8%", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 16px",
        borderBottom: "1px solid #1f1f1f",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#2a2a2a", border: "2px solid #3a3a3a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "#666", flexShrink: 0,
        }}>👤</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#eee" }}>골프러버</div>
          <div style={{ fontSize: 10, color: "#777" }}>100클이 골퍼</div>
        </div>
      </div>

      {/* C-1. 촬영하기 — 9% */}
      <div style={{
        height: "9%", flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 16px",
      }}>
        <div style={{
          width: "100%",
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          boxShadow: "0 4px 16px rgba(34,197,94,0.2)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, flexShrink: 0,
          }}>📷</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>촬영하기</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>카메라로 스윙 영상 촬영</div>
          </div>
        </div>
      </div>

      {/* C-2. 영상 업로드 — 9% */}
      <div style={{
        height: "9%", flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 16px",
      }}>
        <div style={{
          width: "100%",
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px",
          borderRadius: 12,
          background: "#1a1a1a", border: "1.5px solid #3a3a3a",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#2a2a2a",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, flexShrink: 0, color: "#888",
          }}>↑</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd" }}>영상 업로드</div>
            <div style={{ fontSize: 10, color: "#777" }}>갤러리에서 영상 선택</div>
          </div>
        </div>
      </div>

      {/* D. 빠른 시작 — 15% */}
      <div style={{
        height: "15%", flexShrink: 0,
        padding: "6px 16px",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc", marginBottom: 6, flexShrink: 0 }}>빠른 시작</div>
        <div style={{ display: "flex", gap: 10, flex: 1, minHeight: 0 }}>
          {/* D-1. 새 프로젝트 */}
          <div style={{
            flex: 1,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 6,
            background: "#1a1a1a", borderRadius: 12,
            border: "1px solid #2a2a2a",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(34,197,94,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "#22c55e",
            }}>+</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", textAlign: "center" }}>
              새 프로젝트 시작
            </div>
          </div>
          {/* D-2. 최근 복제 */}
          <div style={{
            flex: 1,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 6,
            background: "#1a1a1a", borderRadius: 12,
            border: "1px solid #2a2a2a",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(59,130,246,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "#3b82f6",
            }}>⧉</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", textAlign: "center" }}>
              최근 프로젝트 복제
            </div>
          </div>
        </div>
      </div>

      {/* E. 추천 템플릿 — 14% */}
      <div style={{
        height: "14%", flexShrink: 0,
        padding: "6px 16px",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc", marginBottom: 6, flexShrink: 0 }}>추천 템플릿</div>
        <div style={{ display: "flex", gap: 8, flex: 1, overflow: "hidden", minHeight: 0 }}>
          {[
            { name: "하이라이트 릴", ratio: "9:16", dur: "30초", tag: "인기", color: "#ef4444" },
            { name: "연습 기록", ratio: "16:9", dur: "60초", tag: "추천", color: "#3b82f6" },
            { name: "SNS 쇼츠", ratio: "9:16", dur: "15초", tag: "트렌드", color: "#ec4899" },
            { name: "분석 영상", ratio: "16:9", dur: "90초", tag: "새로움", color: "#f59e0b" },
          ].map((t, i) => (
            <div key={i} style={{
              minWidth: 85, maxWidth: 85,
              background: "#1a1a1a", borderRadius: 8,
              overflow: "hidden", border: "1px solid #2a2a2a", flexShrink: 0,
              display: "flex", flexDirection: "column",
            }}>
              <div style={{
                flex: 1,
                background: `linear-gradient(135deg, ${t.color}22, ${t.color}44)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", minHeight: 0,
              }}>
                <div style={{ fontSize: 9, color: t.color, fontWeight: 700 }}>{t.ratio}</div>
                <div style={{
                  position: "absolute", top: 3, right: 3,
                  fontSize: 7, background: t.color, color: "#fff",
                  padding: "1px 4px", borderRadius: 3, fontWeight: 700,
                }}>{t.tag}</div>
              </div>
              <div style={{ padding: "4px 6px", flexShrink: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#ddd" }}>{t.name}</div>
                <div style={{ fontSize: 7, color: "#666" }}>{t.dur}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* F. 프로젝트 목록 — 33% (flex:1 = 남은 공간) */}
      <div style={{
        flex: 1,
        padding: "6px 16px",
        display: "flex", flexDirection: "column",
        overflow: "hidden", minHeight: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 6, flexShrink: 0,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>내 프로젝트</div>
          <div style={{ fontSize: 9, color: "#666" }}>최근순</div>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 8, flex: 1, overflow: "hidden", minHeight: 0,
        }}>
          {[
            { name: "라운드 하이라이트", time: "3시간 전", dur: "0:32" },
            { name: "스윙 분석 #1", time: "어제", dur: "1:15" },
            { name: "베스트 드라이버", time: "2일 전", dur: "0:45" },
            { name: "퍼팅 연습", time: "3일 전", dur: "0:28" },
          ].map((p, i) => (
            <div key={i} style={{
              background: "#1a1a1a", borderRadius: 8,
              overflow: "hidden", border: "1px solid #2a2a2a",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{
                flex: 1,
                background: `linear-gradient(135deg, #${(20 + i * 5).toString(16)}${(20 + i * 3).toString(16)}${(25 + i * 4).toString(16)}, #1a1a1a)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", minHeight: 0,
              }}>
                <div style={{ fontSize: 16, color: "#444" }}>▶</div>
                <div style={{
                  position: "absolute", bottom: 2, right: 3,
                  fontSize: 7, background: "rgba(0,0,0,0.7)", color: "#ccc",
                  padding: "1px 4px", borderRadius: 3,
                }}>{p.dur}</div>
              </div>
              <div style={{ padding: "4px 6px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{
                    fontSize: 9, fontWeight: 600, color: "#ddd",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                  }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: "#555", flexShrink: 0, marginLeft: 4 }}>⋮</div>
                </div>
                <div style={{ fontSize: 7, color: "#666", marginTop: 1 }}>{p.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CM-NAV. 하단 네비게이션 — 7% */}
      <div style={{
        height: "7%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-around",
        background: "#1a1a1a", borderTop: "1px solid #2a2a2a",
      }}>
        {[
          { icon: "🏠", label: "홈", active: false },
          { icon: "🔍", label: "탐색", active: false },
          { icon: "+", label: "만들기", active: true, special: true },
          { icon: "📅", label: "예약", active: false },
          { icon: "👤", label: "나", active: false },
        ].map((tab, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          }}>
            {tab.special ? (
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: "#fff", fontWeight: 700,
                marginTop: -8,
                boxShadow: "0 2px 8px rgba(34,197,94,0.3)",
              }}>{tab.icon}</div>
            ) : (
              <div style={{ fontSize: 13 }}>{tab.icon}</div>
            )}
            <div style={{
              fontSize: 7,
              fontWeight: tab.active ? 700 : 500,
              color: tab.active ? "#22c55e" : "#666",
            }}>{tab.label}</div>
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
            P1. 대시보드 (만들기)
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

          {/* Overlay section - Bottom Sheet */}
          <div style={{ padding: "16px", borderTop: "1px solid #1a1a1a", marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: 1, marginBottom: 10 }}>
              OVERLAY
            </div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
              <span style={{ color: "#a855f7", fontWeight: 700 }}>P1-G</span> 바텀시트<br/>
              <span style={{ fontSize: 11, color: "#555" }}>
                프로젝트 ⋮ 메뉴에서 트리거<br/>
                복제 / 이름 변경 / 삭제
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
          {/* Subtle grid bg */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.03,
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          <div style={{ position: "relative", height: "92%", maxHeight: 780 }}>
            {/* Phone frame */}
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

              {/* Description items */}
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
                    p1-dashboard.md → <span style={{ color: "#888" }}>&lt;!-- SECTION: {active.id} --&gt;</span>
                  </div>
                </div>
              </div>
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
