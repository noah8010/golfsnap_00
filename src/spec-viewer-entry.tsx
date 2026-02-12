import React, { Suspense, useState } from 'react';
import ReactDOM from 'react-dom/client';

/** 페이지별 spec-viewer를 lazy로 로드 */
const viewers: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  P1: React.lazy(() => import('../docs/files/p1-dashboard-spec-viewer.jsx')),
  P2: React.lazy(() => import('../docs/files/p2-ratio-spec-viewer.jsx')),
  P3: React.lazy(() => import('../docs/files/p3-media-spec-viewer.jsx')),
  P4: React.lazy(() => import('../docs/files/p4-ai-process-spec-viewer.jsx')),
  P5: React.lazy(() => import('../docs/files/p5-editor-spec-viewer.jsx')),
  P6: React.lazy(() => import('../docs/files/p6-export-spec-viewer.jsx')),
  PP1: React.lazy(() => import('../docs/files/popup-dashboard-spec-viewer.jsx')),
  PP2: React.lazy(() => import('../docs/files/popup-editor-panels-spec-viewer.jsx')),
  PP3: React.lazy(() => import('../docs/files/popup-editor-sheets-spec-viewer.jsx')),
  PP4: React.lazy(() => import('../docs/files/popup-common-spec-viewer.jsx')),
};

/** 페이지 그룹 정의 (구분선 표시용) */
const PAGE_GROUPS = [
  { label: 'PAGE', keys: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] },
  { label: 'POPUP', keys: ['PP1', 'PP2', 'PP3', 'PP4'] },
];

const PAGE_LABELS: Record<string, string> = {
  P1: '대시보드',
  P2: '비율 선택',
  P3: '미디어 선택',
  P4: 'AI 처리',
  P5: '영상 에디터',
  P6: '내보내기',
  PP1: '대시보드 팝업',
  PP2: '에디터 패널',
  PP3: '에디터 시트',
  PP4: '공통 팝업',
};

/** URL hash에서 초기 페이지 읽기 */
function getInitialPage(): string {
  const hash = window.location.hash.replace('#', '').toUpperCase();
  if (hash && viewers[hash]) return hash;
  return 'P1';
}

function SpecViewerApp() {
  const [activePage, setActivePage] = useState(getInitialPage);

  const handlePageChange = (page: string) => {
    setActivePage(page);
    window.location.hash = page;
  };

  const ActiveViewer = viewers[activePage];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      {/* Page navigation tabs */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '6px 12px',
        background: 'rgba(15,15,15,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#4CAF50',
          letterSpacing: 1,
          marginRight: 8,
          fontFamily: "'Pretendard', sans-serif",
        }}>
          SPEC
        </span>
        {PAGE_GROUPS.map((group, gi) => (
          <React.Fragment key={group.label}>
            {gi > 0 && (
              <>
                <span style={{
                  width: 1,
                  height: 18,
                  background: '#333',
                  margin: '0 6px',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#666',
                  letterSpacing: 1,
                  marginRight: 4,
                  fontFamily: "'Pretendard', sans-serif",
                }}>
                  {group.label}
                </span>
              </>
            )}
            {group.keys.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  padding: '5px 10px',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Pretendard', sans-serif",
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  background: activePage === page ? '#1a2e1a' : 'transparent',
                  color: activePage === page ? '#4CAF50' : '#666',
                }}
              >
                {PAGE_LABELS[page]}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Viewer content (offset by nav height) */}
      <div style={{ paddingTop: 40 }}>
        <Suspense
          fallback={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100vh - 40px)',
              color: '#555',
              fontSize: 14,
              fontFamily: "'Pretendard', sans-serif",
            }}>
              로딩 중...
            </div>
          }
        >
          <ActiveViewer />
        </Suspense>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('spec-root')!).render(
  <React.StrictMode>
    <SpecViewerApp />
  </React.StrictMode>
);
