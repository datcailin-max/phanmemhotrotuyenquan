import { Recruit, User, Feedback, UnitReport, ProvincialDispatch, RecruitmentStatus, ResearchDocument, ExcelTemplate } from './types';

const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
const API_URL = isLocal && window.location.port !== '5000' ? `http://${hostname}:5000/api` : '/api';

const isDemoMode = () => localStorage.getItem('isDemoAccount') === 'true';
const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const api = {
  // --- USER, RECRUITS, ETC ---
  getUsers: async () => { if (isDemoMode()) return []; try { const res = await fetch(`${API_URL}/users`); return await res.json(); } catch { return []; } },
  login: async (u: string, p: string) => {
    if (u.trim().toUpperCase() === 'DEMO' && p === '1') {
        localStorage.setItem('isDemoAccount', 'true');
        return { username: 'DEMO', fullName: 'Đơn vị trải nghiệm (DEMO)', role: 'EDITOR', unit: { province: 'An Giang', commune: 'Mỹ Hòa Hưng' }, isLocked: false, password: '1' };
    }
    localStorage.setItem('isDemoAccount', 'false');
    try {
      const res = await fetch(`${API_URL}/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) });
      const data = await res.json(); return res.ok ? data : data.message || 'Lỗi đăng nhập';
    } catch { return 'Lỗi kết nối máy chủ'; }
  },
  updateUser: async (u: string, d: any) => { if (isDemoMode()) return true; try { const res = await fetch(`${API_URL}/users/${u}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok; } catch { return false; } },
  syncAccount: async (d: any) => { if (isDemoMode()) return; try { await fetch(`${API_URL}/users/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); } catch {} },

  getRecruits: async () => { if (isDemoMode()) return getLocal('demo_recruits'); try { const res = await fetch(`${API_URL}/recruits`); return await res.json(); } catch { return null; } },
  createRecruit: async (d: any) => { if (isDemoMode()) { const list = getLocal('demo_recruits'); const newData = { ...d, createdAt: new Date().toISOString() }; list.push(newData); setLocal('demo_recruits', list); return newData; }
    try { const res = await fetch(`${API_URL}/recruits`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; } },
  updateRecruit: async (d: any) => { if (isDemoMode()) { const list = getLocal('demo_recruits'); const index = list.findIndex((r: any) => r.id === d.id); if (index > -1) { list[index] = { ...d, updatedAt: new Date().toISOString() }; setLocal('demo_recruits', list); return list[index]; } return null; }
    try { const res = await fetch(`${API_URL}/recruits/${d.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; } },
  deleteRecruit: async (id: string) => { if (isDemoMode()) { const list = getLocal('demo_recruits'); setLocal('demo_recruits', list.filter((r: any) => r.id !== id)); return true; } try { const res = await fetch(`${API_URL}/recruits/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; } },

  // --- YEAR TRANSFER ---
  // Fix: Implemented transferYearData to allow migration of citizen data across recruitment cycles
  transferYearData: async (list: Recruit[], targetYear: number) => {
    try {
      for (const r of list) {
        const { id, _id, createdAt, updatedAt, ...baseData } = r as any;
        const newData = {
          ...baseData,
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          recruitmentYear: targetYear,
        };
        await api.createRecruit(newData);
      }
      return true;
    } catch {
      return false;
    }
  },

  // --- TEMPLATES ---
  getTemplates: async (): Promise<ExcelTemplate[]> => { if (isDemoMode()) return getLocal('demo_templates'); try { const res = await fetch(`${API_URL}/templates`); return await res.json(); } catch { return []; } },
  createTemplate: async (d: any) => { if (isDemoMode()) { const list = getLocal('demo_templates'); const newItem = { ...d, id: Date.now().toString() }; list.push(newItem); setLocal('demo_templates', list); return newItem; }
    try { const res = await fetch(`${API_URL}/templates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; } },
  updateTemplate: async (id: string, d: any) => { if (isDemoMode()) { const list = getLocal('demo_templates'); const index = list.findIndex((t: any) => (t.id || t._id) === id); if (index > -1) { list[index] = { ...list[index], ...d }; setLocal('demo_templates', list); return list[index]; } return null; }
    try { const res = await fetch(`${API_URL}/templates/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; } },
  deleteTemplate: async (id: string) => { if (isDemoMode()) { const list = getLocal('demo_templates'); setLocal('demo_templates', list.filter((t: any) => (t.id || t._id) !== id)); return true; } try { const res = await fetch(`${API_URL}/templates/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; } },

  // --- CÁC PHƯƠNG THỨC KHÁC GIỮ NGUYÊN ---
  getFeedbacks: async () => { try { const res = await fetch(`${API_URL}/feedbacks`); return await res.json(); } catch { return []; } },
  createFeedback: async (d: any) => { try { const res = await fetch(`${API_URL}/feedbacks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; } },
  updateFeedback: async (id: string, d: any) => { try { const res = await fetch(`${API_URL}/feedbacks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; } },
  deleteFeedback: async (id: string) => { try { await fetch(`${API_URL}/feedbacks/${id}`, { method: 'DELETE' }); return true; } catch { return false; } },
  getReports: async (params: any) => { try { const res = await fetch(`${API_URL}/reports?${new URLSearchParams(params)}`); return await res.json(); } catch { return []; } },
  sendReport: async (d: any) => { try { const res = await fetch(`${API_URL}/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; } },
  deleteReport: async (id: string) => { try { await fetch(`${API_URL}/reports/${id}`, { method: 'DELETE' }); return true; } catch { return false; } },
  getDispatches: async (params: any) => { try { const res = await fetch(`${API_URL}/dispatches?${new URLSearchParams(params)}`); return await res.json(); } catch { return []; } },
  sendDispatch: async (d: any) => { try { const res = await fetch(`${API_URL}/dispatches`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; } },
  deleteDispatch: async (id: string) => { try { await fetch(`${API_URL}/dispatches/${id}`, { method: 'DELETE' }); return true; } catch { return false; } },
  getDocuments: async () => { try { const res = await fetch(`${API_URL}/documents`); return await res.json(); } catch { return []; } },
  createDocument: async (d: any) => { try { const res = await fetch(`${API_URL}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; } },
  updateDocument: async (id: string, d: any) => { try { const res = await fetch(`${API_URL}/documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; } },
  deleteDocument: async (id: string) => { try { await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE' }); return true; } catch { return false; } }
};