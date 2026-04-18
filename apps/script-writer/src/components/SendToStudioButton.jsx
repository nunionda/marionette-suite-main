import React, { useState } from 'react';

const STUDIO_API = import.meta.env.VITE_STUDIO_API_URL || (process.env.INTERNAL_CONTENTS_STUDIO_API_URL ?? "http://localhost:3005");

/**
 * script-writer에서 완성된 스크립트를 마리오네트 스튜디오로 내보내는 버튼.
 * 스튜디오 프로젝트 목록을 불러와 사용자가 연결할 프로젝트를 선택하면
 * PUT /api/projects/{id}/script 를 호출해 direction_plan_json 을 업데이트한다.
 * 마지막으로 선택한 스튜디오 프로젝트 ID는 localStorage에 저장해 재사용한다.
 *
 * @param {string} scriptWriterProjectId  - script-writer 내부 프로젝트 ID (localStorage 키로 사용)
 * @param {object} scriptData             - direction_plan_json 에 저장할 페이로드
 */
export default function SendToStudioButton({ scriptWriterProjectId, scriptData }) {
  const [showModal, setShowModal] = useState(false);
  const [studioProjects, setStudioProjects] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'sending' | 'ok' | 'error'

  const STORAGE_KEY = `studio_link_${scriptWriterProjectId}`;

  const openModal = async () => {
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`${STUDIO_API}/api/projects`);
      const data = await res.json();
      setStudioProjects(Array.isArray(data) ? data : (data.projects || []));
      setSelectedId(localStorage.getItem(STORAGE_KEY) || '');
    } catch {
      setStudioProjects([]);
    }
    setLoading(false);
    setShowModal(true);
  };

  const send = async () => {
    if (!selectedId) return;
    setStatus('sending');
    try {
      const res = await fetch(`${STUDIO_API}/api/projects/${selectedId}/script`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction_plan_json: scriptData }),
      });
      if (res.ok) {
        localStorage.setItem(STORAGE_KEY, selectedId);
        setStatus('ok');
        setTimeout(() => setShowModal(false), 1200);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        style={{
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.4)',
          color: '#a5b4fc',
          borderRadius: '6px',
          padding: '6px 14px',
          fontSize: '0.8rem',
          cursor: 'pointer',
          letterSpacing: '0.5px',
        }}
      >
        📤 Studio로 내보내기
      </button>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#18181b', border: '1px solid #3f3f46',
            borderRadius: '12px', padding: '28px', minWidth: '340px', color: '#e4e4e7',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600 }}>
              🎬 Studio 프로젝트로 내보내기
            </h3>

            {loading ? (
              <p style={{ color: '#71717a', fontSize: '0.85rem' }}>프로젝트 목록 불러오는 중...</p>
            ) : studioProjects.length === 0 ? (
              <p style={{ color: '#f87171', fontSize: '0.85rem' }}>
                Studio 프로젝트를 불러올 수 없습니다.<br />
                Production Pipeline(:3005)이 실행 중인지 확인하세요.
              </p>
            ) : (
              <>
                <p style={{ color: '#71717a', fontSize: '0.8rem', marginBottom: '10px' }}>
                  연결할 Studio 프로젝트를 선택하세요:
                </p>
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  style={{
                    width: '100%', background: '#27272a', color: '#e4e4e7',
                    border: '1px solid #3f3f46', borderRadius: '6px',
                    padding: '8px', fontSize: '0.85rem', marginBottom: '16px',
                  }}
                >
                  <option value="">-- 프로젝트 선택 --</option>
                  {studioProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </>
            )}

            {status === 'ok' && (
              <p style={{ color: 'var(--status-ok)', fontSize: '0.85rem', marginBottom: '12px' }}>
                ✅ Studio로 내보내기 완료!
              </p>
            )}
            {status === 'error' && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '12px' }}>
                ❌ 내보내기 실패. 다시 시도해주세요.
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent', border: '1px solid #3f3f46',
                  color: '#71717a', borderRadius: '6px', padding: '6px 14px',
                  fontSize: '0.8rem', cursor: 'pointer',
                }}
              >
                취소
              </button>
              <button
                onClick={send}
                disabled={!selectedId || status === 'sending'}
                style={{
                  background: selectedId ? 'rgba(99,102,241,0.8)' : '#27272a',
                  border: 'none', color: selectedId ? '#fff' : '#52525b',
                  borderRadius: '6px', padding: '6px 16px',
                  fontSize: '0.8rem', cursor: selectedId ? 'pointer' : 'not-allowed',
                }}
              >
                {status === 'sending' ? '내보내는 중...' : '내보내기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
