import { useState } from "react";

/**
 * P5 에디터 바텀시트 Spec Viewer
 * - 속도 조절 패널
 * - 클립 볼륨 패널
 * - 전환 효과 패널
 *
 * 모든 패널은 화면 하단에서 슬라이드 업되는 바텀시트 형태
 *
 * v1.0 (2026-02-11)
 */

const POPUPS = [
  {
    id: "speed-panel",
    name: "속도 조절",
    trigger: "에디터 툴바 '속도' 버튼 탭 (비디오 클립 선택 시)",
    sheetHeight: 60, // 화면 대비 시트 높이 %
    sections: [
      {
        id: "SP-A", label: "A. 헤더", color: "#ef4444",
        top: 40, left: 0, width: 100, height: 7,
        desc: [
          { key: "제목", value: '"속도 조절" (text-lg, font-bold, white)' },
          { key: "✕ 닫기", value: "w-8 h-8, rounded-full, bg-gray-700" },
          { key: "하단 여백", value: "mb-6 (24px)" },
        ],
      },
      {
        id: "SP-B", label: "B. 속도 표시", color: "#f59e0b",
        top: 47, left: 0, width: 100, height: 8,
        desc: [
          { key: "값 표시", value: "{speed.toFixed(1)}x (text-4xl, font-bold, golf-green)" },
          { key: "정렬", value: "text-center" },
          { key: "하단 여백", value: "mb-6" },
        ],
      },
      {
        id: "SP-C", label: "C. 슬라이더 + 프리셋", color: "#22c55e",
        top: 55, left: 0, width: 100, height: 20,
        desc: [
          { key: "범위 슬라이더", value: "range 0.1~8.0x, step 0.1, accent-golf-green" },
          { key: "범위 라벨", value: "좌 0.1x / 우 8.0x (text-xs, gray-400)" },
          { key: "프리셋 버튼", value: "4개: 0.5x, 1x, 2x, 4x (grid-cols-4, gap-2)" },
          { key: "활성 프리셋", value: "bg-golf-green, text-white, font-semibold" },
          { key: "비활성 프리셋", value: "bg-gray-700, text-gray-300" },
          { key: "프리셋 탭", value: "whileTap: scale 0.95" },
        ],
      },
      {
        id: "SP-D", label: "D. 역재생 토글", color: "#3b82f6",
        top: 75, left: 0, width: 100, height: 8,
        desc: [
          { key: "라벨", value: '"역재생" (white, font-medium)' },
          { key: "카드 배경", value: "bg-gray-700, rounded-xl, p-4" },
          { key: "토글 스위치", value: "w-14 h-8, rounded-full" },
          { key: "ON 상태", value: "bg-golf-green, 노브 x:24" },
          { key: "OFF 상태", value: "bg-gray-600, 노브 x:2" },
          { key: "노브", value: "w-6 h-6, bg-white, rounded-full, shadow-lg" },
          { key: "노브 애니메이션", value: "spring: stiffness 500, damping 30" },
        ],
      },
      {
        id: "SP-E", label: "E. 하단 버튼", color: "#8b5cf6",
        top: 83, left: 0, width: 100, height: 10,
        desc: [
          { key: "레이아웃", value: "flex gap-3" },
          { key: "취소", value: "flex-1, py-4, rounded-xl, bg-gray-700, white, font-semibold" },
          { key: "적용", value: "flex-1, py-4, rounded-xl, bg-golf-green, white, font-semibold" },
          { key: "탭 애니메이션", value: "whileTap: scale 0.98" },
        ],
      },
    ],
    notes: [
      {
        id: "SP-STYLE", label: "바텀시트 스타일",
        items: [
          { key: "배경 딤", value: "bg-black/50, z-50, flex items-end" },
          { key: "시트 배경", value: "bg-gray-800, rounded-t-3xl" },
          { key: "패딩", value: "px-4 py-6" },
          { key: "진입", value: "y: 100% → 0 (spring: damping 30, stiffness 300)" },
          { key: "퇴장", value: "y: 0 → 100%" },
          { key: "safe-area", value: "safe-area-bottom 적용" },
        ],
      },
    ],
  },
  {
    id: "volume-panel",
    name: "클립 볼륨",
    trigger: "에디터 툴바 '볼륨' 버튼 탭 (비디오 클립 선택 시)",
    sheetHeight: 55,
    sections: [
      {
        id: "VL-A", label: "A. 헤더", color: "#ef4444",
        top: 45, left: 0, width: 100, height: 7,
        desc: [
          { key: "제목", value: '"클립 볼륨" (text-lg, font-bold, white)' },
          { key: "✕ 닫기", value: "w-8 h-8, rounded-full, bg-gray-700" },
        ],
      },
      {
        id: "VL-B", label: "B. 볼륨 조절 카드", color: "#f59e0b",
        top: 52, left: 0, width: 100, height: 22,
        desc: [
          { key: "카드 배경", value: "bg-gray-700, rounded-xl, p-4" },
          { key: "아이콘", value: "Volume2 (켜짐) / VolumeX (음소거 또는 0%)" },
          { key: "라벨", value: '"원본 오디오" (text-sm, white)' },
          { key: "볼륨 값", value: "{volume}% (text-sm, golf-green, w-12 text-right)" },
          { key: "음소거 토글", value: "켜짐(bg-golf-green)/음소거(bg-gray-600), text-xs" },
          { key: "슬라이더", value: "range 0~100, step 1, disabled 시 opacity-50" },
          { key: "프리셋 버튼", value: "5개: 0%, 25%, 50%, 75%, 100% (flex justify-between)" },
          { key: "활성 프리셋", value: "bg-golf-green, text-white" },
          { key: "0% 선택 시", value: "자동으로 muted = true" },
        ],
      },
      {
        id: "VL-C", label: "C. 안내 문구", color: "#22c55e",
        top: 74, left: 0, width: 100, height: 6,
        desc: [
          { key: "텍스트", value: '"비디오 클립의 원본 오디오 볼륨을 조절합니다. BGM과 별도로 조절됩니다."' },
          { key: "스타일", value: "text-xs, gray-400, text-center" },
        ],
      },
      {
        id: "VL-D", label: "D. 하단 버튼", color: "#8b5cf6",
        top: 80, left: 0, width: 100, height: 10,
        desc: [
          { key: "취소", value: "flex-1, py-4, bg-gray-700, white" },
          { key: "적용", value: "flex-1, py-4, bg-golf-green, white" },
          { key: "적용 시", value: "onApply(volume/100, muted) — 0~1 범위로 변환" },
        ],
      },
    ],
    notes: [
      {
        id: "VL-DATA", label: "데이터 변환",
        items: [
          { key: "입력", value: "currentVolume: 0~1 범위" },
          { key: "표시", value: "0~100% 로 변환하여 UI 표시" },
          { key: "출력", value: "100으로 나누어 0~1 범위로 저장" },
        ],
      },
    ],
  },
  {
    id: "transition-panel",
    name: "전환 효과",
    trigger: "타임라인 클립 사이 전환 아이콘 탭",
    sheetHeight: 30,
    sections: [
      {
        id: "TR-A", label: "A. 헤더", color: "#ef4444",
        top: 70, left: 0, width: 100, height: 6,
        desc: [
          { key: "제목", value: '"전환 효과" (text-base, font-bold, gray-900)' },
          { key: "✕ 닫기", value: "w-8 h-8, rounded-full, hover:bg-gray-100" },
          { key: "구분선", value: "border-b border-gray-100" },
          { key: "배경", value: "bg-white (밝은 테마)" },
        ],
      },
      {
        id: "TR-B", label: "B. 전환 효과 그리드", color: "#f59e0b",
        top: 76, left: 0, width: 100, height: 18,
        desc: [
          { key: "레이아웃", value: "4열 그리드 (grid-cols-4, gap-3), p-4" },
          { key: "없음", value: "Minus 아이콘, '바로 전환'" },
          { key: "페이드", value: "Layers 아이콘, '페이드 인/아웃'" },
          { key: "슬라이드", value: "ArrowRightLeft 아이콘, '좌우 슬라이드'" },
          { key: "줌", value: "ZoomIn 아이콘, '확대/축소 전환'" },
          { key: "선택 표시", value: "bg-golf-green/10, ring-2 ring-golf-green, text-golf-green" },
          { key: "비선택", value: "bg-gray-50, hover:bg-gray-100, text-gray-500" },
          { key: "즉시 적용", value: "탭 시 onApply → onClose (별도 확인 버튼 없음)" },
        ],
      },
    ],
    notes: [
      {
        id: "TR-STYLE", label: "패널 스타일",
        items: [
          { key: "배경", value: "bg-white (다른 바텀시트와 다름 — 밝은 테마)" },
          { key: "라운드", value: "rounded-t-2xl" },
          { key: "그림자", value: "shadow-2xl" },
          { key: "위치", value: "absolute bottom-0, z-50" },
          { key: "진입", value: "y: 100% → 0 (spring: damping 25, stiffness 300)" },
          { key: "퇴장", value: "y: 0 → 100%" },
          { key: "하단 여백", value: "h-6 (safe area 대용)" },
          { key: "별도 딤 없음", value: "배경 딤 오버레이 미사용" },
        ],
      },
      {
        id: "TR-TYPE", label: "TransitionType",
        items: [
          { key: "none", value: "전환 없이 바로 컷" },
          { key: "fade", value: "페이드 인/아웃 전환" },
          { key: "slide", value: "좌우 슬라이드 전환" },
          { key: "zoom", value: "확대/축소 전환" },
        ],
      },
    ],
  },
];

/* ───── MockScreen ───── */

function MockSpeedPanel() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1a1a", position: "relative", fontFamily: "'Pretendard', sans-serif", overflow: "hidden" }}>
      {/* 에디터 배경 (희미하게) */}
      <div style={{ position: "absolute", inset: 0, background: "#111827", opacity: 0.4 }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      {/* 바텀시트 */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "#1f2937", borderRadius: "24px 24px 0 0", padding: "24px 16px" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>속도 조절</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14 }}>✕</span>
          </div>
        </div>
        {/* 속도 값 */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#2D5A3D" }}>1.0x</span>
        </div>
        {/* 슬라이더 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 8, background: "#374151", borderRadius: 99, marginBottom: 8 }}>
            <div style={{ width: "12%", height: "100%", background: "#2D5A3D", borderRadius: 99 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9CA3AF" }}>
            <span>0.1x</span><span>8.0x</span>
          </div>
        </div>
        {/* 프리셋 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 24 }}>
          {["0.5x", "1x", "2x", "4x"].map((p, i) => (
            <div key={i} style={{ padding: "12px 0", borderRadius: 12, textAlign: "center", background: i === 1 ? "#2D5A3D" : "#374151", color: "#fff", fontSize: 13, fontWeight: 600 }}>{p}</div>
          ))}
        </div>
        {/* 역재생 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "#374151", borderRadius: 12, marginBottom: 24 }}>
          <span style={{ color: "#fff", fontWeight: 500, fontSize: 14 }}>역재생</span>
          <div style={{ width: 56, height: 32, borderRadius: 16, background: "#4b5563", position: "relative" }}>
            <div style={{ position: "absolute", top: 4, left: 2, width: 24, height: 24, borderRadius: "50%", background: "#fff" }} />
          </div>
        </div>
        {/* 버튼 */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, padding: "16px 0", borderRadius: 12, background: "#374151", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 14 }}>취소</div>
          <div style={{ flex: 1, padding: "16px 0", borderRadius: 12, background: "#2D5A3D", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 14 }}>적용</div>
        </div>
      </div>
    </div>
  );
}

function MockVolumePanel() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1a1a", position: "relative", fontFamily: "'Pretendard', sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "#111827", opacity: 0.4 }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "#1f2937", borderRadius: "24px 24px 0 0", padding: "24px 16px" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>클립 볼륨</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14 }}>✕</span>
          </div>
        </div>
        {/* 볼륨 카드 */}
        <div style={{ background: "#374151", borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔊</span>
              <span style={{ fontSize: 14, color: "#fff" }}>원본 오디오</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#2D5A3D" }}>100%</span>
              <span style={{ fontSize: 10, padding: "4px 12px", borderRadius: 8, background: "#2D5A3D", color: "#fff" }}>켜짐</span>
            </div>
          </div>
          <div style={{ height: 8, background: "#4b5563", borderRadius: 99, marginBottom: 16 }}>
            <div style={{ width: "100%", height: "100%", background: "#2D5A3D", borderRadius: 99 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            {["0%", "25%", "50%", "75%", "100%"].map((v, i) => (
              <div key={i} style={{ flex: 1, padding: "8px 0", borderRadius: 8, textAlign: "center", background: i === 4 ? "#2D5A3D" : "#4b5563", color: i === 4 ? "#fff" : "#D1D5DB", fontSize: 10, fontWeight: 500 }}>{v}</div>
            ))}
          </div>
        </div>
        {/* 안내 */}
        <div style={{ textAlign: "center", fontSize: 11, color: "#9CA3AF", marginBottom: 24, lineHeight: 1.5 }}>
          비디오 클립의 원본 오디오 볼륨을 조절합니다.<br />BGM과 별도로 조절됩니다.
        </div>
        {/* 버튼 */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, padding: "16px 0", borderRadius: 12, background: "#374151", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 14 }}>취소</div>
          <div style={{ flex: 1, padding: "16px 0", borderRadius: 12, background: "#2D5A3D", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 14 }}>적용</div>
        </div>
      </div>
    </div>
  );
}

function MockTransitionPanel() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1a1a", position: "relative", fontFamily: "'Pretendard', sans-serif", overflow: "hidden" }}>
      {/* 에디터 배경 (딤 없음) */}
      <div style={{ position: "absolute", inset: 0, background: "#111827", opacity: 0.6 }} />
      {/* 바텀시트 (흰색 테마) */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "#fff", borderRadius: "16px 16px 0 0", boxShadow: "0 -10px 30px rgba(0,0,0,0.3)" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>전환 효과</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#6b7280", fontSize: 14 }}>✕</span>
          </div>
        </div>
        {/* 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, padding: 16 }}>
          {[
            { icon: "−", label: "없음", active: false },
            { icon: "▤", label: "페이드", active: true },
            { icon: "↔", label: "슬라이드", active: false },
            { icon: "🔍", label: "줌", active: false },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              padding: 12, borderRadius: 12,
              background: item.active ? "rgba(45,90,61,0.1)" : "#f9fafb",
              border: item.active ? "2px solid #2D5A3D" : "none",
            }}>
              <span style={{ fontSize: 20, color: item.active ? "#2D5A3D" : "#6b7280" }}>{item.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: item.active ? "#2D5A3D" : "#374151" }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

const MOCK_SCREENS = {
  "speed-panel": MockSpeedPanel,
  "volume-panel": MockVolumePanel,
  "transition-panel": MockTransitionPanel,
};

/* ───── 메인 뷰어 ───── */

export default function PopupEditorSheetsSpecViewer() {
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
        <div style={{ padding: "16px 12px 8px", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>P5 에디터 바텀시트</div>

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
          <div style={{ width: "100%", height: "100%", borderRadius: 40, overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,.15)", border: "8px solid #1a1a1a", background: "#000", position: "relative" }}>
            <ActiveMock />
          </div>
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
                cursor: "pointer", zIndex: 10, transition: "all .15s",
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
