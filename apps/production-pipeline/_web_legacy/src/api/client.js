/**
 * 마리오네트 스튜디오 — API 클라이언트
 * FastAPI 백엔드와 통신하는 유틸리티
 */

const API_BASE = '/api';

class MarionetteAPI {
  // ─── Projects ───

  async listProjects() {
    const res = await fetch(`${API_BASE}/projects/`);
    if (!res.ok) throw new Error('프로젝트 목록 조회 실패');
    return res.json();
  }

  async getProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('프로젝트 조회 실패');
    return res.json();
  }

  async createProject({ title, genre = '', logline = '', idea = '' }) {
    const res = await fetch(`${API_BASE}/projects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, genre, logline, idea }),
    });
    if (!res.ok) throw new Error('프로젝트 생성 실패');
    return res.json();
  }

  async updateProject(id, updates) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('프로젝트 업데이트 실패');
    return res.json();
  }

  async deleteProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('프로젝트 삭제 실패');
  }

  // ─── Pipeline ───

  async startPipeline(projectId, { steps = ['script_writer'], idea = '' } = {}) {
    const res = await fetch(`${API_BASE}/pipeline/${projectId}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps, idea }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || '파이프라인 시작 실패');
    }
    return res.json();
  }

  async listPipelineRuns(projectId) {
    const res = await fetch(`${API_BASE}/pipeline/${projectId}/runs`);
    if (!res.ok) throw new Error('파이프라인 실행 이력 조회 실패');
    return res.json();
  }

  async getPipelineRun(projectId, runId) {
    const res = await fetch(`${API_BASE}/pipeline/${projectId}/runs/${runId}`);
    if (!res.ok) throw new Error('파이프라인 실행 상태 조회 실패');
    return res.json();
  }

  async cancelPipelineRun(projectId, runId) {
    const res = await fetch(`${API_BASE}/pipeline/${projectId}/runs/${runId}/cancel`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('파이프라인 취소 실패');
    return res.json();
  }

  // ─── Config ───

  async getConfig() {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) throw new Error('설정 조회 실패');
    return res.json();
  }

  async healthCheck() {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  }
}


/**
 * WebSocket 파이프라인 모니터링
 */
class PipelineMonitor {
  constructor(onMessage) {
    this.onMessage = onMessage;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/pipeline`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('🔌 Pipeline WebSocket 연결됨');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'pong') {
          this.onMessage(data);
        }
      } catch (e) {
        console.error('WebSocket 메시지 파싱 오류:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('🔌 Pipeline WebSocket 연결 해제');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  ping() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }));
    }
  }
}


export const api = new MarionetteAPI();
export { PipelineMonitor };
export default api;
