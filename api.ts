
import { Recruit, User, ResearchDocument, Feedback, UnitReport, ProvincialDispatch, RecruitmentStatus } from './types';

const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
const API_URL = isLocal && window.location.port !== '5000' ? `http://${hostname}:5000/api` : '/api';

const isDemoMode = () => localStorage.getItem('isDemoAccount') === 'true';
const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const api = {
  // --- USER ---
  getUsers: async () => {
    if (isDemoMode()) return [];
    try { const res = await fetch(`${API_URL}/users`); return await res.json(); } catch { return []; }
  },
  login: async (u: string, p: string) => {
    if (u.trim().toUpperCase() === 'DEMO' && p === '1') {
        localStorage.setItem('isDemoAccount', 'true');
        return {
            username: 'DEMO',
            fullName: 'Đơn vị trải nghiệm (DEMO)',
            role: 'EDITOR',
            unit: { province: 'An Giang', commune: 'Mỹ Hòa Hưng' },
            isLocked: false,
            password: '1'
        };
    }
    localStorage.setItem('isDemoAccount', 'false');
    try {
      const res = await fetch(`${API_URL}/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) });
      const data = await res.json();
      return res.ok ? data : data.message || 'Lỗi đăng nhập';
    } catch { return 'Lỗi kết nối máy chủ'; }
  },
  updateUser: async (u: string, d: any) => {
    if (isDemoMode()) return true;
    try { const res = await fetch(`${API_URL}/users/${u}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok; } catch { return false; }
  },
  syncAccount: async (d: any) => {
    if (isDemoMode()) return;
    try { await fetch(`${API_URL}/users/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); } catch {}
  },

  // --- RECRUITS ---
  getRecruits: async () => {
    if (isDemoMode()) return getLocal('demo_recruits');
    try { const res = await fetch(`${API_URL}/recruits`); return await res.json(); } catch { return null; }
  },
  createRecruit: async (d: any) => {
    if (isDemoMode()) {
        const list = getLocal('demo_recruits');
        const newData = { ...d, createdAt: new Date().toISOString() };
        list.push(newData);
        setLocal('demo_recruits', list);
        return newData;
    }
    try { 
      const res = await fetch(`${API_URL}/recruits`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      if (!res.ok) throw new Error('Lỗi server');
      return await res.json();
    } catch (e: any) { alert("Lỗi khi lưu hồ sơ: " + e.message); return null; }
  },
  updateRecruit: async (d: any) => {
    if (isDemoMode()) {
        const list = getLocal('demo_recruits');
        const index = list.findIndex((r: any) => r.id === d.id);
        if (index > -1) {
            list[index] = { ...d, updatedAt: new Date().toISOString() };
            setLocal('demo_recruits', list);
            return list[index];
        }
        return null;
    }
    try { 
      const res = await fetch(`${API_URL}/recruits/${d.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      if (!res.ok) throw new Error('Lỗi server');
      return await res.json();
    } catch (e: any) { alert("Lỗi khi cập nhật: " + e.message); return null; }
  },
  deleteRecruit: async (id: string) => {
    if (isDemoMode()) {
        const list = getLocal('demo_recruits');
        setLocal('demo_recruits', list.filter((r: any) => r.id !== id));
        return true;
    }
    try { const res = await fetch(`${API_URL}/recruits/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; }
  },

  transferYearData: async (sourceRecruits: Recruit[], targetYear: number) => {
    if (isDemoMode()) {
        const list = getLocal('demo_recruits');
        const newRecruits = sourceRecruits.map(r => ({
            ...r,
            id: 'T' + Math.random().toString(36).substr(2, 9),
            recruitmentYear: targetYear,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
        setLocal('demo_recruits', [...list, ...newRecruits]);
        return true;
    }
    try {
        for (const r of sourceRecruits) {
            const payload = { ...r, id: 'T' + Date.now() + Math.random().toString(36).substr(2, 4), recruitmentYear: targetYear };
            delete (payload as any)._id;
            await fetch(`${API_URL}/recruits`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });
        }
        return true;
    } catch (e) {
        console.error("Lỗi kết chuyển:", e);
        return false;
    }
  },

  // --- DOCUMENTS ---
  getDocuments: async (): Promise<ResearchDocument[]> => {
    if (isDemoMode()) return getLocal('demo_documents');
    try { const res = await fetch(`${API_URL}/documents`); return await res.json(); } catch { return []; }
  },
  getDocumentContent: async (id: string): Promise<string | null> => {
    if (isDemoMode()) {
        const list = getLocal('demo_documents');
        const doc = list.find((d: any) => d.id === id || d._id === id);
        return doc ? doc.url : null;
    }
    try {
        const res = await fetch(`${API_URL}/documents/${id}/content`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.url;
    } catch { return null; }
  },
  createDocument: async (d: any) => {
    if (isDemoMode()) {
        const list = getLocal('demo_documents');
        const newDoc = { ...d, id: Date.now().toString(), createdAt: new Date().toISOString() };
        list.push(newDoc);
        setLocal('demo_documents', list);
        return newDoc;
    }
    try { 
      const res = await fetch(`${API_URL}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      return await res.json();
    } catch (e: any) { return null; }
  },
  updateDocument: async (id: string, d: any) => {
    if (isDemoMode()) {
        const list = getLocal('demo_documents');
        const index = list.findIndex((doc: any) => doc.id === id || doc._id === id);
        if (index > -1) {
            list[index] = { ...list[index], ...d };
            setLocal('demo_documents', list);
            return list[index];
        }
        return null;
    }
    try { 
      const res = await fetch(`${API_URL}/documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      return await res.json();
    } catch (e: any) { return null; }
  },
  deleteDocument: async (id: string) => {
    if (isDemoMode()) {
        const list = getLocal('demo_documents');
        setLocal('demo_documents', list.filter((d: any) => d.id !== id && (d as any)._id !== id));
        return true;
    }
    try { const res = await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; }
  },

  // --- FEEDBACK / QA ---
  getFeedbacks: async (): Promise<Feedback[]> => {
    if (isDemoMode()) return getLocal('demo_feedbacks');
    try { const res = await fetch(`${API_URL}/feedbacks`); return await res.json(); } catch { return []; }
  },
  createFeedback: async (d: any) => {
    if (isDemoMode()) {
        const list = getLocal('demo_feedbacks');
        const newItem = { ...d, id: Date.now().toString(), createdAt: new Date().toISOString() };
        list.push(newItem);
        setLocal('demo_feedbacks', list);
        return newItem;
    }
    try { 
      const res = await fetch(`${API_URL}/feedbacks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  updateFeedback: async (id: string, d: any) => {
    if (isDemoMode()) {
        const list = getLocal('demo_feedbacks');
        const index = list.findIndex((f: any) => f.id === id || f._id === id);
        if (index > -1) {
            list[index] = { ...list[index], ...d };
            setLocal('demo_feedbacks', list);
            return list[index];
        }
        return null;
    }
    try { 
      const res = await fetch(`${API_URL}/feedbacks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  deleteFeedback: async (id: string) => {
    if (isDemoMode()) {
        const list = getLocal('demo_feedbacks');
        setLocal('demo_feedbacks', list.filter((f: any) => f.id !== id && f._id !== id));
        return true;
    }
    try { await fetch(`${API_URL}/feedbacks/${id}`, { method: 'DELETE' }); return true; } catch { return false; }
  },

  // --- REPORTS ---
  getReports: async (params: { province?: string, username?: string, year?: number }): Promise<UnitReport[]> => {
    if (isDemoMode()) return getLocal('demo_reports');
    const query = new URLSearchParams(params as any).toString();
    try { const res = await fetch(`${API_URL}/reports?${query}`); return await res.json(); } catch { return []; }
  },
  sendReport: async (d: any) => {
    if (isDemoMode()) {
        const list = getLocal('demo_reports');
        const newItem = { ...d, id: Date.now().toString(), timestamp: Date.now() };
        list.push(newItem);
        setLocal('demo_reports', list);
        return newItem;
    }
    try { 
      const res = await fetch(`${API_URL}/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      return await res.json();
    } catch (e: any) { return null; }
  },
  deleteReport: async (id: string) => {
    if (isDemoMode()) {
        const list = getLocal('demo_reports');
        setLocal('demo_reports', list.filter((r: any) => (r.id || r._id) !== id));
        return true;
    }
    try { const res = await fetch(`${API_URL}/reports/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; }
  },

  // --- DISPATCHES ---
  getDispatches: async (params: { province?: string, username?: string, commune?: string, year?: number }): Promise<ProvincialDispatch[]> => {
    if (isDemoMode()) return getLocal('demo_dispatches');
    const query = new URLSearchParams(params as any).toString();
    try { const res = await fetch(`${API_URL}/dispatches?${query}`); return await res.json(); } catch { return []; }
  },
  sendDispatch: async (d: any) => {
    if (isDemoMode()) {
        const list = getLocal('demo_dispatches');
        const newItem = { ...d, id: Date.now().toString(), timestamp: Date.now() };
        list.push(newItem);
        setLocal('demo_dispatches', list);
        return newItem;
    }
    try { 
      const res = await fetch(`${API_URL}/dispatches`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      return await res.json();
    } catch (e: any) { return null; }
  },
  deleteDispatch: async (id: string) => {
    if (isDemoMode()) {
        const list = getLocal('demo_dispatches');
        setLocal('demo_dispatches', list.filter((d: any) => (d.id || d._id) !== id));
        return true;
    }
    try { const res = await fetch(`${API_URL}/dispatches/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; }
  }
};
