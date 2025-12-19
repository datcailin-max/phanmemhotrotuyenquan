
import { Recruit, User, ResearchDocument, Feedback } from './types';

const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
const API_URL = isLocal && window.location.port !== '5000' ? `http://${hostname}:5000/api` : '/api';

export const api = {
  // --- USER ---
  getUsers: async () => {
    try { const res = await fetch(`${API_URL}/users`); return await res.json(); } catch { return []; }
  },
  login: async (u: string, p: string) => {
    try {
      const res = await fetch(`${API_URL}/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) });
      const data = await res.json();
      return res.ok ? data : data.message || 'Lỗi';
    } catch { return 'Lỗi kết nối'; }
  },
  updateUser: async (u: string, d: any) => {
    try { const res = await fetch(`${API_URL}/users/${u}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok; } catch { return false; }
  },
  syncAccount: async (d: any) => {
    try { await fetch(`${API_URL}/users/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); } catch {}
  },

  // --- RECRUITS ---
  getRecruits: async () => {
    try { const res = await fetch(`${API_URL}/recruits`); return await res.json(); } catch { return null; }
  },
  createRecruit: async (d: any) => {
    try { const res = await fetch(`${API_URL}/recruits`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; }
  },
  updateRecruit: async (d: any) => {
    try { const res = await fetch(`${API_URL}/recruits/${d.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; }
  },
  deleteRecruit: async (id: string) => {
    try { const res = await fetch(`${API_URL}/recruits/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; }
  },

  // --- DOCUMENTS ---
  getDocuments: async (): Promise<ResearchDocument[]> => {
    try { const res = await fetch(`${API_URL}/documents`); return await res.json(); } catch { return []; }
  },
  createDocument: async (d: any) => {
    try { const res = await fetch(`${API_URL}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; }
  },
  deleteDocument: async (id: string) => {
    try { const res = await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; }
  },

  // --- FEEDBACK / QA ---
  getFeedbacks: async (): Promise<Feedback[]> => {
    try { const res = await fetch(`${API_URL}/feedbacks`); return await res.json(); } catch { return []; }
  },
  createFeedback: async (d: any) => {
    try { const res = await fetch(`${API_URL}/feedbacks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; }
  },
  updateFeedback: async (id: string, d: any) => {
    try { const res = await fetch(`${API_URL}/feedbacks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return await res.json(); } catch { return null; }
  },
  deleteFeedback: async (id: string) => {
    try { await fetch(`${API_URL}/feedbacks/${id}`, { method: 'DELETE' }); return true; } catch { return false; }
  }
};
