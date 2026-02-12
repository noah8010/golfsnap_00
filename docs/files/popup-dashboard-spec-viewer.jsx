import { useState } from "react";

/**
 * P1 대시보드 팝업 Spec Viewer
 * - 프로젝트 메뉴 (바텀시트)
 * - 이름 변경 다이얼로그
 * - 카메라 알림 다이얼로그
 *
 * v1.0 (2026-02-11)
 */

/* ───── 팝업별 정의 ───── */

const POPUPS = [
  {
    id: "bottom-sheet",
    name: "프로젝트 메뉴",
    trigger: "프로젝트 카드 ⋮ 버튼 탭",
    sections: [
      {
        id: "BS-A", label: "A. 핸들 바", color: "#ef4444",
        top: 62, left: 0, width: 100, height: 5,
        desc: [
          { key: "핸들", value: "w-12 h-1, bg-gray-300, rounded-full, mx-auto" },
          { key: "역할", value: "바텀시트 드래그 힌트 (시각적)" },
        ],
      },
      {
        id: "BS-B", label: "B. 메뉴 항목", color: "#f59e0b",
        top: 67, left: 0, width: 100, height: 28,
        desc: [
          { key: "복제", value: "Copy 아이콘(20px, gray-700) + '복제' (16px, font-medium, gray-900)" },
          { key: "이름 변경", value: "Edit2 아이콘(20px, gray-700) + '이름 변경' (16px, font-medium, gray-900)" },
          { key: "삭제", value: "Trash2 아이콘(20px, red-600) + '삭제' (16px, font-medium, red-600)" },
          { key: "항목 스타일", value: "w-full, flex, gap-3, px-4 py-3.5, rounded-xl" },
          { key: "호버", value: "hover:bg-gray-50 (삭제는 hover:bg-red-50)" },
          { key: "탭 애니메이션", value: "whileTap: scale 0.98" },
          { key: "항목 간격", value: "space-y-2 (8px)" },
        ],
      },
    ],
    notes: [
      {
        id: "BS-STYLE", label: "바텀시트 스타일",
        items: [
          { key: "배경 딤", value: "bg-black/30, z-40" },
          { key: "딤 탭", value: "시트 닫기 + selectedProject null" },
          { key: "시트 배경", value: "bg-white, rounded-t-3xl, z-50" },
          { key: "패딩", value: "px-4 py-6" },
          { key: "진입 애니메이션", value: "y: 100% → 0 (spring: damping 30, stiffness 300)" },
          { key: "퇴장 애니메이션", value: "y: 0 → 100%" },
          { key: "safe-area", value: "safe-area-bottom 적용" },
        ],
      },
      {
        id: "BS-ACTION", label: "메뉴 동작",
        items: [
          { key: "복제 탭", value: "프로젝트 복제 → '프로젝트가 복제되었습니다' success 토스트" },
          { key: "이름 변경 탭", value: "바텀시트 닫기 → 이름 변경 다이얼로그 열기" },
          { key: "삭제 탭", value: "프로젝트 삭제 → '프로젝트가 삭제되었습니다' success 토스트" },
        ],
      },
    ],
  },
  {
    id: "rename-dialog",
    name: "이름 변경",
    trigger: "프로젝트 메뉴 → '이름 변경' 탭",
    sections: [
      {
        id: "RN-A", label: "A. 제목", color: "#ef4444",
        top: 33, left: 6, width: 88, height: 6,
        desc: [
          { key: "텍스트", value: '"프로젝트 이름 변경" (text-lg, font-bold, gray-900)' },
          { key: "하단 여백", value: "mb-4 (16px)" },
        ],
      },
      {
        id: "RN-B", label: "B. 입력 필드", color: "#f59e0b",
        top: 39, left: 6, width: 88, height: 8,
        desc: [
          { key: "타입", value: "<input type='text'>, autoFocus" },
          { key: "placeholder", value: '"새 이름을 입력하세요"' },
          { key: "스타일", value: "w-full, px-4 py-3, border border-gray-300, rounded-xl" },
          { key: "포커스", value: "ring-2 ring-golf-green" },
          { key: "하단 여백", value: "mb-4 (16px)" },
        ],
      },
      {
        id: "RN-C", label: "C. 버튼", color: "#22c55e",
        top: 47, left: 6, width: 88, height: 7,
        desc: [
          { key: "레이아웃", value: "flex gap-2" },
          { key: "취소 버튼", value: "flex-1, py-3, rounded-xl, bg-gray-100, text-gray-700, font-medium" },
          { key: "확인 버튼", value: "flex-1, py-3, rounded-xl, bg-golf-green, text-white, font-medium" },
          { key: "비활성 조건", value: "입력값 비어있을 때 disabled:opacity-50" },
          { key: "탭 애니메이션", value: "whileTap: scale 0.98" },
        ],
      },
    ],
    notes: [
      {
        id: "RN-STYLE", label: "다이얼로그 스타일",
        items: [
          { key: "배경 딤", value: "bg-black/50, z-50, flex items-center justify-center" },
          { key: "딤 탭", value: "다이얼로그 닫기 + 상태 초기화" },
          { key: "카드", value: "bg-white, rounded-2xl, p-6, w-full, max-w-sm" },
          { key: "진입", value: "scale 0.9→1, opacity 0→1" },
          { key: "퇴장", value: "scale 1→0.9, opacity 1→0" },
        ],
      },
      {
        id: "RN-ACTION", label: "동작",
        items: [
          { key: "취소", value: "다이얼로그 닫기, selectedProject/renameValue 초기화" },
          { key: "확인", value: "프로젝트 이름 변경 저장 → 다이얼로그 닫기" },
        ],
      },
    ],
  },
  {
    id: "camera-alert",
    name: "카메라 알림",
    trigger: "대시보드 '촬영하기' 버튼 탭",
    sections: [
      {
        id: "CA-A", label: "A. 아이콘", color: "#ef4444",
        top: 31, left: 6, width: 88, height: 10,
        desc: [
          { key: "외곽 원", value: "w-16 h-16 (64px), rounded-full, bg-golf-green/10" },
          { key: "아이콘", value: "Camera (32×32px), text-golf-green" },
          { key: "정렬", value: "mx-auto (중앙 정렬)" },
        ],
      },
      {
        id: "CA-B", label: "B. 텍스트", color: "#f59e0b",
        top: 41, left: 6, width: 88, height: 10,
        desc: [
          { key: "제목", value: '"카메라 연동 개발 예정" (text-lg, font-bold, gray-900, mb-2)' },
          { key: "설명", value: '"실시간 촬영 기능은 현재 개발 중입니다." (text-sm, gray-500)' },
          { key: "정렬", value: "text-center" },
          { key: "하단 여백", value: "mb-6 (24px)" },
        ],
      },
      {
        id: "CA-C", label: "C. 확인 버튼", color: "#22c55e",
        top: 51, left: 6, width: 88, height: 6,
        desc: [
          { key: "텍스트", value: '"확인" (white, font-medium)' },
          { key: "배경", value: "bg-golf-green, rounded-xl" },
          { key: "크기", value: "w-full, py-3" },
          { key: "탭 동작", value: "다이얼로그 닫기" },
          { key: "탭 애니메이션", value: "whileTap: scale 0.98" },
        ],
      },
    ],
    notes: [
      {
        id: "CA-STYLE", label: "다이얼로그 스타일",
        items: [
          { key: "배경 딤", value: "bg-black/50, z-50, flex items-center justify-center" },
          { key: "딤 탭", value: "다이얼로그 닫기" },
          { key: "카드", value: "bg-white, rounded-2xl, p-6, w-full, max-w-sm" },
          { key: "내부 정렬", value: "flex flex-col items-center text-center" },
          { key: "진입", value: "scale 0.9→1, opacity 0→1" },
          { key: "퇴장", value: "scale 1→0.9, opacity 1→0" },
        ],
      },
    ],
  },
];

/* ───── MockScreen 렌더러 ───── */

function MockBottomSheet() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1a1a", position: "relative", fontFamily: "'Pretendard', sans-serif", overflow: "hidden" }}>
      {/* 배경: 어두운 대시보드 */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)", opacity: 0.3 }} />
      {/* 딤 오버레이 */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
      {/* 바텀 시트 */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "38%", background: "#fff", borderRadius: "24px 24px 0 0" }}>
        <div style={{ padding: "24px 16px" }}>
          {/* 핸들 바 */}
          <div style={{ width: 48, height: 4, background: "#D1D5DB", borderRadius: 99, margin: "0 auto 24px" }} />
          {/* 메뉴 항목들 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "📋", label: "복제", color: "#111827" },
              { icon: "✏️", label: "이름 변경", color: "#111827" },
              { icon: "🗑️", label: "삭제", color: "#DC2626" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, color: item.color }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 16, fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockRenameDialog() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1a1a", position: "relative", fontFamily: "'Pretendard', sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)", opacity: 0.3 }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      {/* 중앙 다이얼로그 */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "85%", background: "#fff", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 16 }}>프로젝트 이름 변경</div>
        <div style={{ width: "100%", padding: "12px 16px", border: "1px solid #D1D5DB", borderRadius: 12, color: "#9CA3AF", fontSize: 14, marginBottom: 16, boxSizing: "border-box" }}>
          새 이름을 입력하세요
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#F3F4F6", textAlign: "center", fontSize: 14, fontWeight: 500, color: "#374151" }}>취소</div>
          <div style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#2D5A3D", textAlign: "center", fontSize: 14, fontWeight: 500, color: "#fff" }}>확인</div>
        </div>
      </div>
    </div>
  );
}

function MockCameraAlert() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1a1a", position: "relative", fontFamily: "'Pretendard', sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)", opacity: 0.3 }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      {/* 중앙 다이얼로그 */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "85%", background: "#fff", borderRadius: 16, padding: 24, textAlign: "center" }}>
        {/* 아이콘 */}
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(45,90,61,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <span style={{ fontSize: 28 }}>📷</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>카메라 연동 개발 예정</div>
        <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>실시간 촬영 기능은 현재 개발 중입니다.</div>
        <div style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "#2D5A3D", textAlign: "center", fontSize: 14, fontWeight: 500, color: "#fff" }}>확인</div>
      </div>
    </div>
  );
}

const MOCK_SCREENS = {
  "bottom-sheet": MockBottomSheet,
  "rename-dialog": MockRenameDialog,
  "camera-alert": MockCameraAlert,
};

/* ───── 메인 뷰어 ───── */

export default function PopupDashboardSpecViewer() {
  const [activePopup, setActivePopup] = useState(POPUPS[0].id);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const popup = POPUPS.find((p) => p.id === activePopup);
  const ActiveMock = MOCK_SCREENS[activePopup];
  const active = selected ?? hovered;
  const sec = popup?.sections.find((s) => s.id === active);
  const note = popup?.notes?.find((n) => n.id === active);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Pretendard','Noto Sans KR',-apple-system,sans-serif", background: "#f8f9fa" }}>
      {/* ── 좌측 사이드바 ── */}
      <aside style={{ width: 260, borderRight: "1px solid #e5e7eb", overflowY: "auto", background: "#fff", flexShrink: 0 }}>
        <div style={{ padding: "16px 12px 8px", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>P1 대시보드 팝업</div>

        {/* 팝업 탭 */}
        <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {POPUPS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setActivePopup(p.id); setSelected(null); setHovered(null); }}
              style={{
                padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left",
                background: activePopup === p.id ? "#2D5A3D" : "#f3f4f6",
                color: activePopup === p.id ? "#fff" : "#374151",
                fontSize: 13, fontWeight: 600,
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* 트리거 정보 */}
        {popup && (
          <div style={{ padding: "8px 12px", margin: "0 8px 8px", background: "#f0fdf4", borderRadius: 8, fontSize: 11, color: "#166534" }}>
            트리거: {popup.trigger}
          </div>
        )}

        <div style={{ padding: "8px 12px 4px", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>SECTIONS</div>
        {popup?.sections.map((s) => (
          <div
            key={s.id}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setSelected(selected === s.id ? null : s.id)}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", margin: "2px 8px",
              borderRadius: 6, cursor: "pointer",
              background: active === s.id ? `${s.color}18` : "transparent",
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: active === s.id ? s.color : "#374151" }}>{s.label}</span>
          </div>
        ))}

        {popup?.notes?.length > 0 && (
          <>
            <div style={{ padding: "12px 12px 4px", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>NOTES</div>
            {popup.notes.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelected(selected === n.id ? null : n.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", margin: "2px 8px",
                  borderRadius: 6, cursor: "pointer",
                  background: active === n.id ? "#f3f4f6" : "transparent",
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 3, background: "#94a3b8", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: active === n.id ? "#334155" : "#64748b" }}>{n.label}</span>
              </div>
            ))}
          </>
        )}
      </aside>

      {/* ── 중앙 와이어프레임 ── */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, background: "#f1f5f9" }}>
        <div style={{ position: "relative", height: "100%", aspectRatio: "393 / 852", maxWidth: 393 }}>
          {/* 폰 프레임 */}
          <div style={{ width: "100%", height: "100%", borderRadius: 40, overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,.15)", border: "8px solid #1a1a1a", background: "#000", position: "relative" }}>
            <ActiveMock />
          </div>

          {/* 섹션 오버레이 */}
          {popup?.sections.map((s) => (
            <div
              key={s.id}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(selected === s.id ? null : s.id)}
              style={{
                position: "absolute",
                top: `${s.top}%`, left: `${s.left}%`,
                width: `${s.width}%`, height: `${s.height}%`,
                border: `2px solid ${active === s.id ? s.color : s.color + "60"}`,
                borderRadius: 6,
                background: active === s.id ? `${s.color}20` : "transparent",
                cursor: "pointer", zIndex: 10,
                transition: "all .15s",
              }}
            >
              <span style={{
                position: "absolute", top: -18, left: 4,
                fontSize: 10, fontWeight: 700, color: s.color,
                background: "#fff", padding: "1px 6px", borderRadius: 4,
                whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(0,0,0,.1)",
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* ── 우측 디테일 ── */}
      <aside style={{ width: 320, borderLeft: "1px solid #e5e7eb", overflowY: "auto", background: "#fff", flexShrink: 0 }}>
        {sec ? (
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: sec.color }} />
              <span style={{ fontSize: 15, fontWeight: 700 }}>{sec.label}</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {sec.desc.map((d, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 8px 8px 0", fontWeight: 600, color: "#374151", whiteSpace: "nowrap", verticalAlign: "top", width: "30%" }}>{d.key}</td>
                    <td style={{ padding: "8px 0", color: "#6b7280" }}>{d.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : note ? (
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: "#94a3b8" }} />
              <span style={{ fontSize: 15, fontWeight: 700 }}>{note.label}</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {note.items.map((d, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 8px 8px 0", fontWeight: 600, color: "#374151", whiteSpace: "nowrap", verticalAlign: "top", width: "30%" }}>{d.key}</td>
                    <td style={{ padding: "8px 0", color: "#6b7280" }}>{d.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 32, color: "#9ca3af", textAlign: "center", fontSize: 14 }}>
            좌측 섹션을 선택하거나<br />와이어프레임 영역을 클릭하세요
          </div>
        )}
      </aside>
    </div>
  );
}
