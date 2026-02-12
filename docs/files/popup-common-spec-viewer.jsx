import { useState } from "react";

/**
 * 공통 팝업 Spec Viewer
 * - 토스트 알림
 * - 공유 다이얼로그 (입력 단계 / 완료 단계)
 * - 클립 삭제 확인 다이얼로그
 *
 * v1.0 (2026-02-11)
 */

const POPUPS = [
  {
    id: "toast",
    name: "토스트 알림",
    trigger: "useToastStore().show(message, type) 호출",
    sections: [
      {
        id: "TO-A", label: "A. 토스트 바", color: "#ef4444",
        top: 83, left: 3, width: 94, height: 6,
        desc: [
          { key: "위치", value: "absolute bottom-24 left-4 right-4 (하단 네비 위)" },
          { key: "Z-index", value: "z-[60] (최상단)" },
          { key: "pointer-events", value: "none (터치 통과)" },
          { key: "레이아웃", value: "flex items-center gap-3, rounded-xl, px-4 py-3" },
          { key: "그림자", value: "shadow-lg" },
          { key: "진입", value: "opacity 0→1, y: 30→0, scale: 0.95→1" },
          { key: "퇴장", value: "opacity 1→0, y: 0→20, scale: 1→0.95" },
          { key: "spring", value: "damping 25, stiffness 350" },
          { key: "자동 사라짐", value: "2.5초 후 자동 숨김" },
        ],
      },
    ],
    notes: [
      {
        id: "TO-TYPE", label: "타입별 스타일",
        items: [
          { key: "info", value: "bg-gray-800, Info 아이콘" },
          { key: "warning", value: "bg-amber-600, AlertTriangle 아이콘" },
          { key: "error", value: "bg-red-600, XCircle 아이콘" },
          { key: "success", value: "bg-emerald-600, CheckCircle 아이콘" },
          { key: "공통 텍스트", value: "white, text-sm, font-medium" },
          { key: "아이콘 크기", value: "w-5 h-5, flex-shrink-0" },
        ],
      },
      {
        id: "TO-USE", label: "사용 예시",
        items: [
          { key: "프로젝트 복제", value: "'프로젝트가 복제되었습니다' (success)" },
          { key: "프로젝트 삭제", value: "'프로젝트가 삭제되었습니다' (success)" },
          { key: "렌더링 실패", value: "'렌더링에 실패했습니다' (error)" },
          { key: "서버 업로드 실패", value: "'서버 업로드에 실패했습니다' (warning)" },
          { key: "공유 완료", value: "'공유가 완료되었습니다' (success)" },
          { key: "링크 복사", value: "'링크가 복사되었습니다' (success)" },
          { key: "다운로드 완료", value: "'다운로드가 완료되었습니다' (success)" },
        ],
      },
      {
        id: "TO-STORE", label: "상태 관리",
        items: [
          { key: "스토어", value: "useToastStore (Zustand)" },
          { key: "message", value: "string — 표시할 메시지" },
          { key: "type", value: "'info' | 'warning' | 'error' | 'success'" },
          { key: "visible", value: "boolean — 표시 여부" },
          { key: "show()", value: "메시지 표시 → 2.5초 후 자동 hide()" },
          { key: "렌더링 위치", value: "MobileFrame 내부 (전역)" },
        ],
      },
    ],
  },
  {
    id: "share-input",
    name: "공유 (입력)",
    trigger: "내보내기 완료 → '공유' 버튼 탭",
    sections: [
      {
        id: "SI-A", label: "A. 헤더", color: "#ef4444",
        top: 28, left: 6, width: 88, height: 6,
        desc: [
          { key: "제목", value: '"공유하기" (text-lg, font-bold, gray-900)' },
          { key: "✕ 닫기", value: "w-8 h-8, rounded-full, bg-gray-100" },
          { key: "아이콘", value: "X (20px, gray-600)" },
          { key: "닫기 동작", value: "title/content 초기화, step='input' 리셋, onClose()" },
          { key: "탭 애니메이션", value: "whileTap: scale 0.9" },
        ],
      },
      {
        id: "SI-B", label: "B. 제목 입력", color: "#f59e0b",
        top: 34, left: 6, width: 88, height: 10,
        desc: [
          { key: "라벨", value: '"제목" (text-sm, font-medium, gray-700, mb-2)' },
          { key: "타입", value: "<input type='text'>" },
          { key: "placeholder", value: '"제목을 입력하세요"' },
          { key: "maxLength", value: "100자" },
          { key: "스타일", value: "w-full, px-4 py-3, border border-gray-300, rounded-xl" },
          { key: "포커스", value: "ring-2 ring-golf-green" },
        ],
      },
      {
        id: "SI-C", label: "C. 내용 입력", color: "#22c55e",
        top: 44, left: 6, width: 88, height: 16,
        desc: [
          { key: "라벨", value: '"내용" (text-sm, font-medium, gray-700, mb-2)' },
          { key: "타입", value: "<textarea>, rows=4, resize-none" },
          { key: "placeholder", value: '"내용을 입력하세요"' },
          { key: "maxLength", value: "500자" },
          { key: "글자 수", value: "{content.length}/500 (text-xs, gray-400, text-right)" },
        ],
      },
      {
        id: "SI-D", label: "D. 버튼", color: "#8b5cf6",
        top: 60, left: 6, width: 88, height: 6,
        desc: [
          { key: "레이아웃", value: "flex gap-2" },
          { key: "취소", value: "flex-1, py-3, rounded-xl, bg-gray-100, gray-700, font-medium" },
          { key: "공유하기", value: "flex-1, py-3, rounded-xl, bg-golf-green, white, font-medium + Share2 아이콘" },
          { key: "비활성 조건", value: "제목과 내용 모두 비어있을 때 disabled:opacity-50" },
          { key: "활성 조건", value: "title.trim() || content.trim() (하나라도 입력)" },
        ],
      },
    ],
    notes: [
      {
        id: "SI-STYLE", label: "다이얼로그 스타일",
        items: [
          { key: "Z-index", value: "z-[100] (내보내기 모달 위)" },
          { key: "배경 딤", value: "fixed inset-0, bg-black/50" },
          { key: "딤 탭", value: "input 단계에서만 닫기 동작" },
          { key: "카드", value: "bg-white, rounded-2xl, p-6, w-full, max-w-sm" },
          { key: "진입", value: "scale 0.9→1, opacity 0→1" },
          { key: "퇴장", value: "scale 1→0.9, opacity 1→0" },
          { key: "key 전환", value: "step 변경 시 카드 리렌더 (key={step})" },
        ],
      },
    ],
  },
  {
    id: "share-success",
    name: "공유 (완료)",
    trigger: "공유 다이얼로그 → '공유하기' 버튼 탭 성공 시",
    sections: [
      {
        id: "SS-A", label: "A. 완료 아이콘", color: "#ef4444",
        top: 34, left: 6, width: 88, height: 10,
        desc: [
          { key: "외곽 원", value: "w-16 h-16 (64px), rounded-full, bg-golf-green/10" },
          { key: "아이콘", value: "Check (32px, golf-green)" },
          { key: "정렬", value: "mx-auto, mb-4" },
        ],
      },
      {
        id: "SS-B", label: "B. 완료 텍스트", color: "#f59e0b",
        top: 44, left: 6, width: 88, height: 8,
        desc: [
          { key: "제목", value: '"공유가 완료되었습니다" (text-lg, font-bold, gray-900, mb-2)' },
          { key: "설명", value: '"콘텐츠가 성공적으로 공유되었습니다." (text-sm, gray-500)' },
          { key: "하단 여백", value: "mb-6 (24px)" },
          { key: "정렬", value: "text-center" },
        ],
      },
      {
        id: "SS-C", label: "C. 확인 버튼", color: "#22c55e",
        top: 52, left: 6, width: 88, height: 6,
        desc: [
          { key: "텍스트", value: '"확인" (white, font-medium)' },
          { key: "배경", value: "bg-golf-green, rounded-xl" },
          { key: "크기", value: "w-full, py-3" },
          { key: "탭 동작", value: "onShare(title, content) → 상태 초기화 → onClose()" },
          { key: "탭 애니메이션", value: "whileTap: scale 0.98" },
        ],
      },
    ],
    notes: [
      {
        id: "SS-FLOW", label: "완료 후 동선",
        items: [
          { key: "확인 탭", value: "onShare 콜백 → 다이얼로그 닫기" },
          { key: "상태 초기화", value: "title='', content='', step='input'" },
          { key: "부모 동작", value: "onComplete('dashboard') → 대시보드(P1)로 이동" },
        ],
      },
    ],
  },
  {
    id: "delete-confirm",
    name: "클립 삭제 확인",
    trigger: "에디터 툴바 '삭제' 버튼 탭 (클립 선택 상태)",
    sections: [
      {
        id: "DC-A", label: "A. 제목", color: "#ef4444",
        top: 38, left: 6, width: 88, height: 5,
        desc: [
          { key: "텍스트", value: '"클립 삭제" (text-lg, font-bold, gray-900)' },
          { key: "하단 여백", value: "mb-2 (8px)" },
        ],
      },
      {
        id: "DC-B", label: "B. 메시지", color: "#f59e0b",
        top: 43, left: 6, width: 88, height: 5,
        desc: [
          { key: "텍스트", value: '"선택한 클립을 삭제하시겠습니까?" (text-sm, gray-600)' },
          { key: "하단 여백", value: "mb-6 (24px)" },
        ],
      },
      {
        id: "DC-C", label: "C. 버튼", color: "#22c55e",
        top: 48, left: 6, width: 88, height: 6,
        desc: [
          { key: "레이아웃", value: "flex gap-3" },
          { key: "취소", value: "flex-1, py-3, rounded-xl, bg-gray-100, gray-700, font-medium" },
          { key: "취소 호버", value: "hover:bg-gray-200" },
          { key: "삭제", value: "flex-1, py-3, rounded-xl, bg-red-600, white, font-medium" },
          { key: "삭제 호버", value: "hover:bg-red-700" },
          { key: "탭 애니메이션", value: "whileTap: scale 0.98" },
        ],
      },
    ],
    notes: [
      {
        id: "DC-STYLE", label: "다이얼로그 스타일",
        items: [
          { key: "배경 딤", value: "bg-black/50, z-50, flex items-center justify-center, p-4" },
          { key: "카드", value: "bg-white, rounded-2xl, p-6, w-full, max-w-sm" },
          { key: "진입", value: "scale 0.9→1, opacity 0→1" },
          { key: "퇴장", value: "scale 1→0.9, opacity 1→0" },
        ],
      },
      {
        id: "DC-ACTION", label: "동작",
        items: [
          { key: "취소 탭", value: "showDeleteConfirm = false (다이얼로그 닫기)" },
          { key: "삭제 탭", value: "handleDeleteClip() → 클립 삭제 → 다이얼로그 닫기" },
          { key: "삭제 대상", value: "현재 선택된 클립 (selectedClipId 기준)" },
        ],
      },
    ],
  },
];

/* ───── MockScreen ───── */

function MockToast() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#f9fafb", position: "relative", fontFamily: "'Pretendard', sans-serif", overflow: "hidden" }}>
      {/* 배경: 대시보드 */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f9fafb 0%, #e5e7eb 100%)" }} />
      {/* 하단 네비게이션 힌트 */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "8%", background: "#fff", borderTop: "1px solid #e5e7eb" }} />
      {/* 토스트 4종 */}
      <div style={{ position: "absolute", bottom: "11%", left: 16, right: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { color: "#10b981", icon: "✓", msg: "프로젝트가 복제되었습니다", label: "success" },
          { color: "#1f2937", icon: "ℹ", msg: "자동 저장되었습니다", label: "info" },
          { color: "#d97706", icon: "⚠", msg: "서버 업로드에 실패했습니다", label: "warning" },
          { color: "#dc2626", icon: "✕", msg: "렌더링에 실패했습니다", label: "error" },
        ].map((t, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px", borderRadius: 12,
            background: t.color, color: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            opacity: i === 0 ? 1 : 0.5,
            fontSize: 13,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
            <span style={{ fontWeight: 500 }}>{t.msg}</span>
            <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.7 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockShareInput() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1a1a", position: "relative", fontFamily: "'Pretendard', sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "85%", background: "#fff", borderRadius: 16, padding: 24 }}>
        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>공유하기</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#6b7280", fontSize: 14 }}>✕</span>
          </div>
        </div>
        {/* 제목 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>제목</div>
          <div style={{ width: "100%", padding: "12px 16px", border: "1px solid #D1D5DB", borderRadius: 12, color: "#9CA3AF", fontSize: 14, boxSizing: "border-box" }}>
            제목을 입력하세요
          </div>
        </div>
        {/* 내용 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>내용</div>
          <div style={{ width: "100%", height: 96, padding: "12px 16px", border: "1px solid #D1D5DB", borderRadius: 12, color: "#9CA3AF", fontSize: 14, boxSizing: "border-box" }}>
            내용을 입력하세요
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>0/500</div>
        </div>
        {/* 버튼 */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#F3F4F6", textAlign: "center", fontSize: 14, fontWeight: 500, color: "#374151" }}>취소</div>
          <div style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#2D5A3D", textAlign: "center", fontSize: 14, fontWeight: 500, color: "#fff", opacity: 0.5 }}>🔗 공유하기</div>
        </div>
      </div>
    </div>
  );
}

function MockShareSuccess() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1a1a", position: "relative", fontFamily: "'Pretendard', sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "85%", background: "#fff", borderRadius: 16, padding: 24, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(45,90,61,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <span style={{ fontSize: 28, color: "#2D5A3D" }}>✓</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>공유가 완료되었습니다</div>
        <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>콘텐츠가 성공적으로 공유되었습니다.</div>
        <div style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "#2D5A3D", textAlign: "center", fontSize: 14, fontWeight: 500, color: "#fff" }}>확인</div>
      </div>
    </div>
  );
}

function MockDeleteConfirm() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1a1a", position: "relative", fontFamily: "'Pretendard', sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "#111827", opacity: 0.4 }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "85%", background: "#fff", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>클립 삭제</div>
        <div style={{ fontSize: 14, color: "#4B5563", marginBottom: 24 }}>선택한 클립을 삭제하시겠습니까?</div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#F3F4F6", textAlign: "center", fontSize: 14, fontWeight: 500, color: "#374151" }}>취소</div>
          <div style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#DC2626", textAlign: "center", fontSize: 14, fontWeight: 500, color: "#fff" }}>삭제</div>
        </div>
      </div>
    </div>
  );
}

const MOCK_SCREENS = {
  "toast": MockToast,
  "share-input": MockShareInput,
  "share-success": MockShareSuccess,
  "delete-confirm": MockDeleteConfirm,
};

/* ───── 메인 뷰어 ───── */

export default function PopupCommonSpecViewer() {
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
        <div style={{ padding: "16px 12px 8px", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>공통 팝업</div>

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
