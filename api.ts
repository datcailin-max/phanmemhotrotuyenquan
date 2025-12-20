import { Recruit, User, ResearchDocument, Feedback, UnitReport, ProvincialDispatch } from './types';

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
      return res.ok ? data : data.message || 'Lỗi đăng nhập';
    } catch { return 'Lỗi kết nối máy chủ'; }
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
    try { 
      const res = await fetch(`${API_URL}/recruits`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      if (!res.ok) {
          if (res.status === 413) throw new Error('Dữ liệu hồ sơ quá lớn (vượt giới hạn 16MB bao gồm ảnh/file).');
          const errorData = await res.json();
          throw new Error(errorData.message || 'Lỗi server');
      }
      return await res.json();
    } catch (e: any) { alert("Lỗi khi lưu hồ sơ: " + e.message); return null; }
  },
  updateRecruit: async (d: any) => {
    try { 
      const res = await fetch(`${API_URL}/recruits/${d.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      if (!res.ok) {
          if (res.status === 413) throw new Error('Hồ sơ hoặc tệp đính kèm quá lớn.');
          const errorData = await res.json();
          throw new Error(errorData.message || 'Lỗi server');
      }
      return await res.json();
    } catch (e: any) { alert("Lỗi khi cập nhật hồ sơ: " + e.message); return null; }
  },
  deleteRecruit: async (id: string) => {
    try { const res = await fetch(`${API_URL}/recruits/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; }
  },

  // --- DOCUMENTS ---
  getDocuments: async (): Promise<ResearchDocument[]> => {
    try { const res = await fetch(`${API_URL}/documents`); return await res.json(); } catch { return []; }
  },
  createDocument: async (d: any) => {
    try { 
      const res = await fetch(`${API_URL}/documents`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(d) 
      }); 
      if (!res.ok) {
        if (res.status === 413) throw new Error('Tệp PDF vượt giới hạn kích thước cho phép.');
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi Server');
      }
      return await res.json();
    } catch (e: any) { 
      alert("KHÔNG THỂ TẢI FILE: " + e.message);
      return null; 
    }
  },
  deleteDocument: async (id: string) => {
    try { const res = await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; }
  },

  // --- FEEDBACK / QA ---
  getFeedbacks: async (): Promise<Feedback[]> => {
    try { const res = await fetch(`${API_URL}/feedbacks`); return await res.json(); } catch { return []; }
  },
  createFeedback: async (d: any) => {
    try { 
      const res = await fetch(`${API_URL}/feedbacks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  updateFeedback: async (id: string, d: any) => {
    try { 
      const res = await fetch(`${API_URL}/feedbacks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  deleteFeedback: async (id: string) => {
    try { await fetch(`${API_URL}/feedbacks/${id}`, { method: 'DELETE' }); return true; } catch { return false; }
  },

  // --- REPORTS ---
  getReports: async (params: { province?: string, username?: string, year?: number }): Promise<UnitReport[]> => {
    const query = new URLSearchParams(params as any).toString();
    try { const res = await fetch(`${API_URL}/reports?${query}`); return await res.json(); } catch { return []; }
  },
  sendReport: async (d: any) => {
    try { 
      const res = await fetch(`${API_URL}/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      if (!res.ok) {
          if (res.status === 413) throw new Error('File báo cáo quá lớn.');
          const errorData = await res.json();
          throw new Error(errorData.message || 'Lỗi Server');
      }
      return await res.json();
    } catch (e: any) { alert("LỖI GỬI BÁO CÁO: " + e.message); return null; }
  },
  deleteReport: async (id: string) => {
    try { const res = await fetch(`${API_URL}/reports/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; }
  },

  // --- DISPATCHES ---
  getDispatches: async (params: { province?: string, username?: string, year?: number }): Promise<ProvincialDispatch[]> => {
    const query = new URLSearchParams(params as any).toString();
    try { const res = await fetch(`${API_URL}/dispatches?${query}`); return await res.json(); } catch { return []; }
  },
  sendDispatch: async (d: any) => {
    try { 
      const res = await fetch(`${API_URL}/dispatches`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      if (!res.ok) {
          if (res.status === 413) throw new Error('File văn bản chỉ đạo quá lớn.');
          const errorData = await res.json();
          throw new Error(errorData.message || 'Lỗi Server');
      }
      return await res.json();
    } catch (e: any) { alert("LỖI BAN HÀNH VĂN BẢN: " + e.message); return null; }
  },
  deleteDispatch: async (id: string) => {
    try { const res = await fetch(`${API_URL}/dispatches/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; }
  }
};