import { useState } from "react";

/**
 * P5 에디터 풀스크린 패널 Spec Viewer
 * - 텍스트 추가 패널
 * - 필터 패널
 * - 오디오 패널
 * - 스티커 추가 패널
 * - AI 어시스턴트 패널
 *
 * 모든 패널은 동일한 레이아웃 구조:
 *   [헤더] → [스크롤 콘텐츠] → [하단 액션 버튼]
 *
 * v1.0 (2026-02-11)
 */

const panelBg = "#2c3441";
const itemBg = "#3d4554";

/* ───── 팝업별 정의 ───── */

const POPUPS = [
  {
    id: "text-panel",
    name: "텍스트 추가",
    trigger: "에디터 툴바 '텍스트' 버튼 탭",
    sections: [
      {
        id: "TX-A", label: "A. 헤더", color: "#ef4444",
        top: 0, left: 0, width: 100, height: 7,
        desc: [
          { key: "제목", value: '"텍스트 추가" (text-lg, font-bold, white)' },
          { key: "✕ 닫기", value: "w-9 h-9, rounded-full, bg-gray-700/50" },
          { key: "하단 구분선", value: "border-b border-gray-700" },
          { key: "ESC 키", value: "패널 닫기 지원" },
        ],
      },
      {
        id: "TX-B", label: "B. 텍스트 입력", color: "#f59e0b",
        top: 7, left: 0, width: 100, height: 15,
        desc: [
          { key: "요소", value: "<textarea>, h-28, autoFocus" },
          { key: "placeholder", value: '"텍스트를 입력하세요"' },
          { key: "배경", value: "bg-[#3d4554], border border-gray-600, rounded-xl" },
          { key: "포커스", value: "ring-2 ring-golf-green" },
          { key: "색상", value: "white 텍스트, gray-500 placeholder" },
        ],
      },
      {
        id: "TX-C", label: "C. 탭 (스타일/애니메이션)", color: "#22c55e",
        top: 22, left: 0, width: 100, height: 7,
        desc: [
          { key: "탭 구성", value: '"스타일" | "애니메이션" (flex gap-2)' },
          { key: "활성 탭", value: "bg-white/10, text-white, border-2 border-white/20" },
          { key: "비활성 탭", value: "transparent, text-gray-400, border-transparent" },
          { key: "탭 전환", value: "AnimatePresence mode='wait', opacity 페이드" },
        ],
      },
      {
        id: "TX-D", label: "D. 탭 콘텐츠 (스크롤)", color: "#3b82f6",
        top: 29, left: 0, width: 100, height: 58,
        desc: [
          { key: "스타일 탭 - 폰트", value: "6종 (3열 그리드): Noto Sans, 나눔고딕, 나눔명조, Roboto, Montserrat, Playfair" },
          { key: "스타일 탭 - 크기", value: "range 슬라이더 16~72px (step 2), 우측에 현재 값 표시" },
          { key: "스타일 탭 - 색상", value: "10색 그리드 (5열): 흰/검/빨/초/파/노/자/청/주/보라" },
          { key: "색상 선택 표시", value: "선택 시 border-white scale-110 + 체크 아이콘" },
          { key: "애니메이션 탭", value: '11종 (3열): 없음, 페이드 인/아웃, 아래→위, 위→아래, 오른→왼, 왼→오른, 확대, 바운스, 타자기, 글로우' },
          { key: "섹션 라벨", value: "text-sm, font-semibold, gray-400, mb-3" },
          { key: "선택 스타일", value: "bg-golf-green text-white (비선택: bg-[#3d4554] text-gray-300)" },
        ],
      },
      {
        id: "TX-E", label: "E. 하단 버튼", color: "#8b5cf6",
        top: 87, left: 0, width: 100, height: 13,
        desc: [
          { key: "레이아웃", value: "flex gap-3, px-6 py-4, border-t border-gray-700" },
          { key: "취소 버튼", value: "flex-1, py-4, rounded-xl, bg-[#3d4554], white, font-semibold" },
          { key: "추가/수정 버튼", value: "flex-1, py-4, rounded-xl, bg-golf-green, white, font-semibold" },
          { key: "비활성 조건", value: "텍스트 비어있을 때 disabled:opacity-50" },
          { key: "수정 모드", value: 'editingText 있으면 "수정", 없으면 "추가"' },
        ],
      },
    ],
    notes: [
      {
        id: "TX-DATA", label: "데이터 구조",
        items: [
          { key: "content", value: "string — 텍스트 내용" },
          { key: "font", value: "string — 폰트 ID (6종)" },
          { key: "fontSize", value: "number — 16~72px" },
          { key: "color", value: "string — HEX 색상 (10종)" },
          { key: "animation", value: "TextAnimationType — 11종" },
          { key: "position", value: "{ x: number, y: number } — 0~100%" },
        ],
      },
    ],
  },
  {
    id: "filter-panel",
    name: "필터",
    trigger: "에디터 툴바 '필터' 버튼 탭",
    sections: [
      {
        id: "FI-A", label: "A. 헤더", color: "#ef4444",
        top: 0, left: 0, width: 100, height: 7,
        desc: [
          { key: "제목", value: '"필터" (text-lg, font-bold, white)' },
          { key: "초기화 버튼", value: '"초기화" (px-3 py-1.5, rounded-lg, bg-[#3d4554], white, text-sm)' },
          { key: "✕ 닫기", value: "w-9 h-9, rounded-full, bg-gray-700/50" },
          { key: "ESC 키", value: "패널 닫기 지원" },
        ],
      },
      {
        id: "FI-B", label: "B. 프리셋 (6종)", color: "#f59e0b",
        top: 7, left: 0, width: 100, height: 30,
        desc: [
          { key: "그리드", value: "3열 (grid-cols-3), gap-3" },
          { key: "프리셋 목록", value: "없음, 선명, 부드러움, 쿨톤, 웜톤, 프로" },
          { key: "카드 형태", value: "aspect-square, rounded-xl, 그라데이션 미리보기" },
          { key: "선택 표시", value: "ring-2 ring-golf-green + 우상단 체크 배지" },
          { key: "비선택", value: "ring-1 ring-gray-600" },
          { key: "하단 라벨", value: "bg-gradient-to-t from-black/60, text-xs, white" },
          { key: "필터 미리보기", value: "CSS filter (brightness/contrast/saturate) 실시간 적용" },
        ],
      },
      {
        id: "FI-C", label: "C. 세부 조정 슬라이더", color: "#22c55e",
        top: 37, left: 0, width: 100, height: 50,
        desc: [
          { key: "밝기", value: "Sun 아이콘, range -50~+50, step 1" },
          { key: "대비", value: "Contrast 아이콘, range -50~+50, step 1" },
          { key: "채도", value: "Droplets 아이콘, range -50~+50, step 1" },
          { key: "색온도", value: "Thermometer 아이콘, range -50~+50, step 1" },
          { key: "슬라이더 스타일", value: "h-2, bg-[#3d4554], rounded-lg, accent-golf-green" },
          { key: "값 표시", value: "우측에 +/- 포맷, text-sm, golf-green" },
          { key: "프리셋 연동", value: "수동 조정 시 프리셋 선택 해제" },
        ],
      },
      {
        id: "FI-D", label: "D. 하단 버튼", color: "#8b5cf6",
        top: 87, left: 0, width: 100, height: 13,
        desc: [
          { key: "취소", value: "flex-1, py-4, bg-[#3d4554], white" },
          { key: "적용", value: "flex-1, py-4, bg-golf-green, white" },
        ],
      },
    ],
    notes: [
      {
        id: "FI-PRESET", label: "프리셋 값",
        items: [
          { key: "없음", value: "밝기 0, 대비 0, 채도 0, 색온도 0" },
          { key: "선명", value: "밝기 +10, 대비 +20, 채도 +30, 색온도 0" },
          { key: "부드러움", value: "밝기 +5, 대비 -10, 채도 -15, 색온도 +5" },
          { key: "쿨톤", value: "밝기 0, 대비 +10, 채도 +10, 색온도 -20" },
          { key: "웜톤", value: "밝기 +5, 대비 +5, 채도 +15, 색온도 +25" },
          { key: "프로", value: "밝기 +8, 대비 +15, 채도 +20, 색온도 +10" },
        ],
      },
    ],
  },
  {
    id: "audio-panel",
    name: "오디오",
    trigger: "에디터 툴바 '오디오' 버튼 탭",
    sections: [
      {
        id: "AU-A", label: "A. 헤더", color: "#ef4444",
        top: 0, left: 0, width: 100, height: 7,
        desc: [
          { key: "제목", value: '"오디오" (text-lg, font-bold, white)' },
          { key: "✕ 닫기", value: "w-9 h-9, rounded-full, bg-gray-700/50" },
        ],
      },
      {
        id: "AU-B", label: "B. 원본 오디오", color: "#f59e0b",
        top: 7, left: 0, width: 100, height: 15,
        desc: [
          { key: "섹션 라벨", value: '"원본 오디오" (text-sm, font-semibold, gray-400)' },
          { key: "볼륨 아이콘", value: "Volume2 (켜짐) / VolumeX (음소거) — 20px" },
          { key: "볼륨 값", value: "{volume}% (text-sm, golf-green)" },
          { key: "음소거 토글", value: '켜짐(bg-golf-green) / 음소거(bg-gray-600), text "켜짐"/"음소거"' },
          { key: "슬라이더", value: "range 0~100, step 1, 음소거 시 disabled" },
          { key: "카드 배경", value: "bg-[#3d4554], rounded-xl, p-4" },
        ],
      },
      {
        id: "AU-C", label: "C. BGM 라이브러리", color: "#22c55e",
        top: 22, left: 0, width: 100, height: 52,
        desc: [
          { key: "섹션 라벨", value: '"배경음악 라이브러리" (text-sm, font-semibold, gray-400)' },
          { key: "BGM 수", value: "6곡: 경쾌한 골프, 여유로운 라운딩, 승리의 순간, 완벽한 샷, 골프 마스터, 그린 위의 평화" },
          { key: "항목 레이아웃", value: "Music 아이콘(40×40 bg-[#2c3441]) + 이름/장르/시간 + 재생 버튼" },
          { key: "장르 배지", value: "text-xs, px-2 py-0.5, rounded, bg-[#2c3441], gray-300" },
          { key: "재생 버튼", value: "Play/Pause (w-8 h-8, rounded-full, bg-[#2c3441])" },
          { key: "선택 표시", value: "bg-golf-green/20, ring-2 ring-golf-green" },
          { key: "비선택", value: "bg-[#3d4554], hover:bg-[#4a5262]" },
          { key: "항목 간격", value: "space-y-2 (8px)" },
        ],
      },
      {
        id: "AU-D", label: "D. BGM 볼륨 (조건부)", color: "#3b82f6",
        top: 74, left: 0, width: 100, height: 13,
        desc: [
          { key: "표시 조건", value: "BGM 선택 시에만 표시" },
          { key: "라벨", value: '"BGM 볼륨" (text-sm, white)' },
          { key: "값", value: "{bgmVolume}% (text-sm, golf-green)" },
          { key: "슬라이더", value: "range 0~100, accent-golf-green" },
          { key: "진입 애니메이션", value: "opacity 0→1, height 0→auto" },
        ],
      },
      {
        id: "AU-E", label: "E. 하단 버튼", color: "#8b5cf6",
        top: 87, left: 0, width: 100, height: 13,
        desc: [
          { key: "취소", value: "flex-1, py-4, bg-[#3d4554], white" },
          { key: "적용", value: "flex-1, py-4, bg-golf-green, white" },
        ],
      },
    ],
    notes: [
      {
        id: "AU-BGM", label: "BGM 라이브러리",
        items: [
          { key: "경쾌한 골프", value: "3:00, 활기찬" },
          { key: "여유로운 라운딩", value: "4:00, 여유로운" },
          { key: "승리의 순간", value: "2:30, 감동적인" },
          { key: "완벽한 샷", value: "3:20, 서정적인" },
          { key: "골프 마스터", value: "3:10, 활기찬" },
          { key: "그린 위의 평화", value: "3:40, 여유로운" },
        ],
      },
    ],
  },
  {
    id: "sticker-panel",
    name: "스티커 추가",
    trigger: "에디터 툴바 '스티커' 버튼 탭",
    sections: [
      {
        id: "ST-A", label: "A. 헤더", color: "#ef4444",
        top: 0, left: 0, width: 100, height: 7,
        desc: [
          { key: "제목", value: '"스티커 추가" (text-lg, font-bold, white)' },
          { key: "✕ 닫기", value: "w-9 h-9, rounded-full, bg-gray-700/50" },
        ],
      },
      {
        id: "ST-B", label: "B. 미리보기 (조건부)", color: "#f59e0b",
        top: 7, left: 0, width: 100, height: 15,
        desc: [
          { key: "표시 조건", value: "스티커 선택 시에만 표시" },
          { key: "크기", value: "height 160px, bg-[#3d4554], rounded-2xl" },
          { key: "가이드라인", value: "중앙 십자 그리드 (opacity 20%)" },
          { key: "스티커 위치", value: "position (x%, y%)에 따라 absolute 배치" },
          { key: "애니메이션", value: "선택된 스티커의 animation 실시간 재생 (bounce/pulse/shake 등)" },
          { key: "하단 정보", value: "스티커명 + animation | duration (text-xs)" },
        ],
      },
      {
        id: "ST-C", label: "C. 카테고리 + 그리드", color: "#22c55e",
        top: 22, left: 0, width: 100, height: 30,
        desc: [
          { key: "카테고리 탭", value: "4종: 골프, 축하, 감정, 효과 (flex gap-2)" },
          { key: "활성 탭", value: "bg-pink-500, text-white" },
          { key: "비활성 탭", value: "bg-[#3d4554], text-gray-300" },
          { key: "스티커 그리드", value: "4열 (grid-cols-4), gap-3, 카테고리당 6개" },
          { key: "스티커 카드", value: "aspect-square, rounded-xl, 이모지 + 이름" },
          { key: "선택 표시", value: "bg-pink-500, ring-2 ring-pink-400 + 애니메이션 재생" },
          { key: "총 스티커 수", value: "24종 (4카테고리 × 6종)" },
        ],
      },
      {
        id: "ST-D", label: "D. 조절 슬라이더 (조건부)", color: "#3b82f6",
        top: 52, left: 0, width: 100, height: 35,
        desc: [
          { key: "표시 조건", value: "스티커 선택 시에만 표시" },
          { key: "크기 (scale)", value: "range 0.5~2.0, step 0.1, accent-pink-500 (50%~200%)" },
          { key: "가로 위치 (X)", value: "range 0~100, step 1, 왼쪽↔오른쪽" },
          { key: "세로 위치 (Y)", value: "range 0~100, step 1, 위↔아래" },
          { key: "표시 시간", value: "range 0.5~10초, step 0.5" },
          { key: "값 표시", value: "우측에 현재 값, text-pink-500, font-semibold" },
        ],
      },
      {
        id: "ST-E", label: "E. 하단 버튼", color: "#8b5cf6",
        top: 87, left: 0, width: 100, height: 13,
        desc: [
          { key: "취소", value: "flex-1, py-4, bg-[#3d4554], white" },
          { key: "추가/수정", value: "flex-1, py-4, bg-pink-500, white (비선택 시 disabled)" },
          { key: "수정 모드", value: 'editingSticker 있으면 "수정", 없으면 "추가"' },
        ],
      },
    ],
    notes: [
      {
        id: "ST-ANIM", label: "스티커 애니메이션",
        items: [
          { key: "bounce", value: "y: [0,-10,0], 0.6s 반복" },
          { key: "pulse", value: "scale: [1,1.2,1], 0.8s 반복" },
          { key: "shake", value: "x: [-2,2,-2,2,0], 0.4s 반복" },
          { key: "spin", value: "rotate: [0,360], 2s linear 반복" },
          { key: "explode", value: "scale: [1,1.3,1]+opacity, 0.5s 반복" },
          { key: "float", value: "y: [0,-5,0], 2s easeInOut 반복" },
          { key: "zoom-in", value: "scale: [0.8,1.1,1], 1s 반복" },
          { key: "sparkle", value: "opacity: [1,0.5,1]+scale, 0.8s 반복" },
        ],
      },
    ],
  },
  {
    id: "assistant-panel",
    name: "AI 어시스턴트",
    trigger: "에디터 툴바 'AI' 버튼 탭",
    sections: [
      {
        id: "AI-A", label: "A. 헤더", color: "#ef4444",
        top: 0, left: 0, width: 100, height: 7,
        desc: [
          { key: "아이콘", value: "Sparkles (20px, golf-green)" },
          { key: "제목", value: '"AI 어시스턴트" (text-lg, font-bold, white)' },
          { key: "✕ 닫기", value: "w-9 h-9, rounded-full, bg-gray-700/50" },
        ],
      },
      {
        id: "AI-B", label: "B. 감지된 샷 데이터", color: "#f59e0b",
        top: 7, left: 0, width: 100, height: 10,
        desc: [
          { key: "섹션 라벨", value: '"감지된 샷 데이터" + "다시 분석" 링크 (golf-green)' },
          { key: "다시 분석", value: "RefreshCw 아이콘 + 텍스트, 클릭 시 재분석" },
          { key: "메타데이터 배지", value: "distance(yd), ballSpeed(mph), club, holeResult" },
          { key: "배지 스타일", value: "px-2 py-1, bg-[#3d4554], rounded-lg, text-xs, white" },
        ],
      },
      {
        id: "AI-C", label: "C. AI 추천 목록", color: "#22c55e",
        top: 17, left: 0, width: 100, height: 57,
        desc: [
          { key: "상단 컨트롤", value: '"AI 추천 ({n}개)" + "전체 선택 | 전체 해제" 링크' },
          { key: "로딩 상태", value: "Loader2 스피너(32px, animate-spin) + 'AI가 분석 중입니다...'" },
          { key: "스티커 제안", value: "2열 그리드 (grid-cols-2), 이모지+이름+설명+체크" },
          { key: "텍스트 제안", value: "전체 너비 리스트, 텍스트 미리보기+설명+체크" },
          { key: "선택 표시", value: "bg-golf-green/20, border-2 border-golf-green, Check 아이콘" },
          { key: "비선택", value: "bg-[#3d4554], border-transparent" },
          { key: "빈 상태", value: "Sparkles 아이콘(48px) + '메타데이터를 분석할 수 없습니다'" },
        ],
      },
      {
        id: "AI-D", label: "D. 하단 버튼", color: "#8b5cf6",
        top: 87, left: 0, width: 100, height: 13,
        desc: [
          { key: "취소", value: "flex-1, py-4, bg-[#3d4554], white" },
          { key: "추가 버튼", value: '"추가 ({n}개)" + Check 아이콘, bg-golf-green' },
          { key: "비활성 조건", value: "selectedCount === 0 일 때 disabled" },
        ],
      },
    ],
    notes: [
      {
        id: "AI-META", label: "메타데이터 항목",
        items: [
          { key: "distance", value: "비거리 (yd)" },
          { key: "ballSpeed", value: "볼스피드 (mph)" },
          { key: "club", value: "사용 클럽" },
          { key: "holeResult", value: "결과 (홀인원/이글/버디/파/보기/더블보기)" },
        ],
      },
      {
        id: "AI-RULE", label: "추천 로직",
        items: [
          { key: "자동 분석", value: "패널 열릴 때 shotMetadata로 자동 분석 시작" },
          { key: "제안 생성", value: "메타데이터 기반 스티커+텍스트 자동 제안" },
          { key: "위치 배치", value: "각 아이템 약간씩 다른 위치에 배치 (겹침 방지)" },
          { key: "고유 ID", value: "track-timestamp-index-random 형식" },
        ],
      },
    ],
  },
];

/* ───── 공통 풀스크린 패널 MockScreen 빌더 ───── */

function makePanelMock({ title, headerRight, content }) {
  return () => (
    <div style={{ width: "100%", height: "100%", background: panelBg, display: "flex", flexDirection: "column", fontFamily: "'Pretendard', sans-serif", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #4b5563" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {title.icon && <span style={{ fontSize: 16 }}>{title.icon}</span>}
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{title.text}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {headerRight}
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(75,85,99,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 16 }}>✕</span>
          </div>
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", padding: "24px" }}>{content}</div>
      {/* Footer */}
      <div style={{ flexShrink: 0, display: "flex", gap: 12, padding: "16px 24px", borderTop: "1px solid #4b5563" }}>
        <div style={{ flex: 1, padding: "16px 0", borderRadius: 12, background: itemBg, textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 14 }}>취소</div>
        <div style={{ flex: 1, padding: "16px 0", borderRadius: 12, background: "#2D5A3D", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 14 }}>적용</div>
      </div>
    </div>
  );
}

const MockTextPanel = makePanelMock({
  title: { text: "텍스트 추가" },
  content: (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ height: 80, background: itemBg, borderRadius: 12, border: "1px solid #4b5563", padding: 12, color: "#6b7280", fontSize: 14 }}>텍스트를 입력하세요</div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "rgba(255,255,255,0.1)", textAlign: "center", color: "#fff", fontSize: 14, fontWeight: 600 }}>스타일</div>
        <div style={{ flex: 1, padding: "12px 0", borderRadius: 12, textAlign: "center", color: "#9CA3AF", fontSize: 14, fontWeight: 600 }}>애니메이션</div>
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, marginBottom: -8 }}>폰트</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {["Noto Sans", "나눔고딕", "나눔명조", "Roboto", "Montserrat", "Playfair"].map((f, i) => (
          <div key={i} style={{ padding: 8, borderRadius: 12, background: i === 0 ? "#2D5A3D" : itemBg, textAlign: "center", color: "#fff", fontSize: 11 }}>{f}</div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>크기</div>
      <div style={{ height: 8, background: itemBg, borderRadius: 99 }}>
        <div style={{ width: "50%", height: "100%", background: "#2D5A3D", borderRadius: 99 }} />
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>색상</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
        {["#FFF", "#000", "#F00", "#0F0", "#00F", "#FF0", "#F0F", "#0FF", "#FFA500", "#800080"].map((c, i) => (
          <div key={i} style={{ aspectRatio: "1", borderRadius: 12, background: c, border: i === 0 ? "2px solid #fff" : "2px solid #4b5563" }} />
        ))}
      </div>
    </div>
  ),
});

const MockFilterPanel = makePanelMock({
  title: { text: "필터" },
  headerRight: <div style={{ padding: "6px 12px", borderRadius: 8, background: itemBg, color: "#fff", fontSize: 12, fontWeight: 500 }}>초기화</div>,
  content: (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>프리셋</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {["없음", "선명", "부드러움", "쿨톤", "웜톤", "프로"].map((name, i) => (
          <div key={i} style={{ aspectRatio: "1", borderRadius: 12, background: `hsl(${140 + i * 20},40%,${30 + i * 5}%)`, position: "relative", border: i === 1 ? "2px solid #2D5A3D" : "1px solid #4b5563" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 6, background: "linear-gradient(transparent, rgba(0,0,0,0.6))", borderRadius: "0 0 12px 12px" }}>
              <span style={{ fontSize: 10, color: "#fff" }}>{name}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>세부 조정</div>
      {["☀ 밝기", "◐ 대비", "💧 채도", "🌡 색온도"].map((label, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#fff", marginBottom: 4 }}>
            <span>{label}</span><span style={{ color: "#2D5A3D" }}>0</span>
          </div>
          <div style={{ height: 8, background: itemBg, borderRadius: 99 }}>
            <div style={{ width: "50%", height: "100%", background: "#2D5A3D", borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  ),
});

const MockAudioPanel = makePanelMock({
  title: { text: "오디오" },
  content: (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>원본 오디오</div>
      <div style={{ background: itemBg, borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: "#fff" }}>🔊 볼륨</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#2D5A3D" }}>100%</span>
            <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 8, background: "#2D5A3D", color: "#fff" }}>켜짐</span>
          </div>
        </div>
        <div style={{ height: 8, background: "#2c3441", borderRadius: 99 }}>
          <div style={{ width: "100%", height: "100%", background: "#2D5A3D", borderRadius: 99 }} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>배경음악 라이브러리</div>
      {["경쾌한 골프", "여유로운 라운딩", "승리의 순간"].map((name, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, background: i === 0 ? "rgba(45,90,61,0.2)" : itemBg, border: i === 0 ? "2px solid #2D5A3D" : "2px solid transparent" }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "#2c3441", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎵</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>3:00</div>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2c3441", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>▶</div>
        </div>
      ))}
    </div>
  ),
});

const MockStickerPanel = makePanelMock({
  title: { text: "스티커 추가" },
  content: (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ height: 100, background: itemBg, borderRadius: 16, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 36 }}>🏌️</span>
        <div style={{ position: "absolute", bottom: 8, fontSize: 10, color: "#fff" }}>굿샷 · bounce | 3초</div>
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>카테고리</div>
      <div style={{ display: "flex", gap: 8 }}>
        {["골프", "축하", "감정", "효과"].map((cat, i) => (
          <div key={i} style={{ flex: 1, padding: "10px 0", borderRadius: 12, background: i === 0 ? "#ec4899" : itemBg, textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 600 }}>{cat}</div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>스티커 선택</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {["🏌️", "👍", "🕳️", "🐦", "🦅", "⛳"].map((e, i) => (
          <div key={i} style={{ aspectRatio: "1", borderRadius: 12, background: i === 0 ? "#ec4899" : itemBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: i === 0 ? "2px solid #f472b6" : "none" }}>{e}</div>
        ))}
      </div>
    </div>
  ),
});

const MockAssistantPanel = makePanelMock({
  title: { icon: "✨", text: "AI 어시스턴트" },
  content: (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>감지된 샷 데이터</span>
        <span style={{ fontSize: 11, color: "#2D5A3D" }}>🔄 다시 분석</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["250yd", "165mph", "드라이버", "버디"].map((tag, i) => (
          <span key={i} style={{ padding: "4px 8px", borderRadius: 8, background: itemBg, fontSize: 11, color: "#fff" }}>{tag}</span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>AI 추천 (4개)</span>
        <span style={{ fontSize: 11, color: "#2D5A3D" }}>전체 선택 | <span style={{ color: "#9CA3AF" }}>전체 해제</span></span>
      </div>
      <div style={{ fontSize: 11, color: "#6b7280" }}>스티커</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[{ e: "🏌️", n: "굿샷" }, { e: "🐦", n: "버디" }].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, background: i === 0 ? "rgba(45,90,61,0.2)" : itemBg, border: i === 0 ? "2px solid #2D5A3D" : "2px solid transparent" }}>
            <span style={{ fontSize: 20 }}>{s.e}</span>
            <span style={{ fontSize: 12, color: "#fff" }}>{s.n}</span>
            {i === 0 && <span style={{ fontSize: 12, color: "#2D5A3D", marginLeft: "auto" }}>✓</span>}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#6b7280" }}>텍스트</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {["버디! 🐦", "250yd 대포!"].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, background: itemBg, border: "2px solid transparent" }}>
            <span style={{ padding: "4px 8px", borderRadius: 4, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 12, fontWeight: 700 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  ),
});

const MOCK_SCREENS = {
  "text-panel": MockTextPanel,
  "filter-panel": MockFilterPanel,
  "audio-panel": MockAudioPanel,
  "sticker-panel": MockStickerPanel,
  "assistant-panel": MockAssistantPanel,
};

/* ───── 메인 뷰어 ───── */

export default function PopupEditorPanelsSpecViewer() {
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
        <div style={{ padding: "16px 12px 8px", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>P5 에디터 패널</div>

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

        {popup && (
          <div style={{ padding: "8px 12px", margin: "0 8px 8px", background: "#f0fdf4", borderRadius: 8, fontSize: 11, color: "#166534" }}>
            트리거: {popup.trigger}
          </div>
        )}

        {/* 공통 레이아웃 설명 */}
        <div style={{ padding: "8px 12px", margin: "0 8px 8px", background: "#eff6ff", borderRadius: 8, fontSize: 11, color: "#1e40af" }}>
          레이아웃: [헤더 7%] → [스크롤 콘텐츠] → [하단 버튼 13%]
        </div>

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
