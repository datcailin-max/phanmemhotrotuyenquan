import { Recruit, User, Feedback, UnitReport, ProvincialDispatch, RecruitmentStatus, ResearchDocument, ExcelTemplate } from './types';

const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
const API_URL = isLocal && window.location.port !== '5000' ? `http://${hostname}:5000/api` : '/api';

const isDemoMode = () => localStorage.getItem('isDemoAccount') === 'true';
const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const api = {
  // --- USER, RECRUITS, ETC ---
  getUsers: async () => { if (isDemoMode()) return []; try { const res = await fetch(`${API_URL}/users`); const data = await res.json(); return Array.isArray(data) ? data : []; } catch { return []; } },
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

  getRecruits: async () => { if (isDemoMode()) return getLocal('demo_recruits'); try { const res = await fetch(`${API_URL}/recruits`); const data = await res.json(); return Array.isArray(data) ? data : []; } catch { return []; } },
  createRecruit: async (d: any) => { if (isDemoMode()) { const list = getLocal('demo_recruits'); const newData = { ...d, createdAt: new Date().toISOString() }; list.push(newData); setLocal('demo_recruits', list); return newData; }
    try { const res = await fetch(`${API_URL}/recruits`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok ? await res.json() : null; } catch { return null; } },
  updateRecruit: async (d: any) => { if (isDemoMode()) { const list = getLocal('demo_recruits'); const index = list.findIndex((r: any) => r.id === d.id); if (index > -1) { list[index] = { ...d, updatedAt: new Date().toISOString() }; setLocal('demo_recruits', list); return list[index]; } return null; }
    try { const res = await fetch(`${API_URL}/recruits/${d.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok ? await res.json() : null; } catch { return null; } },
  deleteRecruit: async (id: string) => { if (isDemoMode()) { const list = getLocal('demo_recruits'); setLocal('demo_recruits', list.filter((r: any) => r.id !== id)); return true; } try { const res = await fetch(`${API_URL}/recruits/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; } },
  deleteYearData: async (year: number) => { if (isDemoMode()) { const list = getLocal('demo_recruits'); setLocal('demo_recruits', list.filter((r: any) => r.recruitmentYear !== year)); return true; } try { const res = await fetch(`${API_URL}/recruits/year/${year}`, { method: 'DELETE' }); return res.ok; } catch { return false; } },

  // --- YEAR TRANSFER ---
  // Fix: Implemented transferYearData using bulk endpoint to allow fast, atomic migration of citizen data across recruitment cycles with deduplication
  transferYearData: async (list: Recruit[], targetYear: number) => {
    let existingRecruits: Recruit[] = [];
    if (isDemoMode()) {
      existingRecruits = getLocal('demo_recruits');
    } else {
      try {
        const res = await fetch(`${API_URL}/recruits`);
        if (res.ok) {
          existingRecruits = await res.json();
        }
      } catch (e) {
        console.error("Lỗi khi lấy danh sách hiện tại:", e);
      }
    }

    const existingInTargetYear = (existingRecruits || []).filter(r => r.recruitmentYear === targetYear);

    // Lọc bỏ trùng lặp
    const nonDuplicates = list.filter(r => {
      const isDup = existingInTargetYear.some(e => {
        const rCitizenId = r.citizenId ? r.citizenId.trim() : '';
        const eCitizenId = e.citizenId ? e.citizenId.trim() : '';
        if (rCitizenId && eCitizenId && rCitizenId === eCitizenId) {
          return true;
        }
        return r.fullName && e.fullName && r.fullName.trim().toLowerCase() === e.fullName.trim().toLowerCase() && r.dob === e.dob;
      });
      return !isDup;
    });

    if (nonDuplicates.length === 0) {
      // Đã được kết chuyển toàn bộ trước đó
      return true;
    }

    if (isDemoMode()) {
      const demoList = getLocal('demo_recruits');
      const newItems = nonDuplicates.map((r, index) => {
        const { id, _id, createdAt, updatedAt, ...baseData } = r as any;
        return {
          ...baseData,
          id: Date.now().toString(36) + Math.random().toString(36).substring(2) + index,
          recruitmentYear: targetYear,
          createdAt: new Date().toISOString()
        };
      });
      setLocal('demo_recruits', [...demoList, ...newItems]);
      return true;
    }
    try {
      const newList = nonDuplicates.map((r, index) => {
        const { id, _id, createdAt, updatedAt, ...baseData } = r as any;
        return {
          ...baseData,
          id: Date.now().toString(36) + Math.random().toString(36).substring(2) + index,
          recruitmentYear: targetYear,
        };
      });
      const res = await fetch(`${API_URL}/recruits/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // --- TEMPLATES ---
  getTemplates: async (): Promise<ExcelTemplate[]> => { if (isDemoMode()) return getLocal('demo_templates'); try { const res = await fetch(`${API_URL}/templates`); const data = await res.json(); return Array.isArray(data) ? data : []; } catch { return []; } },
  createTemplate: async (d: any) => { if (isDemoMode()) { const list = getLocal('demo_templates'); const newItem = { ...d, id: Date.now().toString() }; list.push(newItem); setLocal('demo_templates', list); return newItem; }
    try { const res = await fetch(`${API_URL}/templates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok ? await res.json() : null; } catch { return null; } },
  updateTemplate: async (id: string, d: any) => { if (isDemoMode()) { const list = getLocal('demo_templates'); const index = list.findIndex((t: any) => (t.id || t._id) === id); if (index > -1) { list[index] = { ...list[index], ...d }; setLocal('demo_templates', list); return list[index]; } return null; }
    try { const res = await fetch(`${API_URL}/templates/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok ? await res.json() : null; } catch { return null; } },
  deleteTemplate: async (id: string) => { if (isDemoMode()) { const list = getLocal('demo_templates'); setLocal('demo_templates', list.filter((t: any) => (t.id || t._id) !== id)); return true; } try { const res = await fetch(`${API_URL}/templates/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; } },

  // --- CÁC PHƯƠNG THỨC KHÁC GIỮ NGUYÊN ---
  getFeedbacks: async () => { try { const res = await fetch(`${API_URL}/feedbacks`); const data = await res.json(); return Array.isArray(data) ? data : []; } catch { return []; } },
  createFeedback: async (d: any) => { try { const res = await fetch(`${API_URL}/feedbacks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok ? await res.json() : null; } catch { return null; } },
  updateFeedback: async (id: string, d: any) => { try { const res = await fetch(`${API_URL}/feedbacks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok ? await res.json() : null; } catch { return null; } },
  deleteFeedback: async (id: string) => { try { await fetch(`${API_URL}/feedbacks/${id}`, { method: 'DELETE' }); return true; } catch { return false; } },
  getReports: async (params: any) => { try { const res = await fetch(`${API_URL}/reports?${new URLSearchParams(params)}`); const data = await res.json(); return Array.isArray(data) ? data : []; } catch { return []; } },
  sendReport: async (d: any) => { try { const res = await fetch(`${API_URL}/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok ? await res.json() : null; } catch { return null; } },
  deleteReport: async (id: string) => { try { await fetch(`${API_URL}/reports/${id}`, { method: 'DELETE' }); return true; } catch { return false; } },
  getDispatches: async (params: any) => { try { const res = await fetch(`${API_URL}/dispatches?${new URLSearchParams(params)}`); const data = await res.json(); return Array.isArray(data) ? data : []; } catch { return []; } },
  sendDispatch: async (d: any) => { try { const res = await fetch(`${API_URL}/dispatches`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok ? await res.json() : null; } catch { return null; } },
  deleteDispatch: async (id: string) => { try { await fetch(`${API_URL}/dispatches/${id}`, { method: 'DELETE' }); return true; } catch { return false; } },
  getDocuments: async () => { if (isDemoMode()) return getLocal('demo_documents'); try { const res = await fetch(`${API_URL}/documents`); const data = await res.json(); return Array.isArray(data) ? data : []; } catch { return []; } },
  getDocumentById: async (id: string) => { if (isDemoMode()) { const list = getLocal('demo_documents'); return list.find((d: any) => (d.id || d._id) === id) || null; } try { const res = await fetch(`${API_URL}/documents/${id}`); return res.ok ? await res.json() : null; } catch { return null; } },
  createDocument: async (d: any) => { if (isDemoMode()) { const list = getLocal('demo_documents'); const newItem = { ...d, id: Date.now().toString() }; list.push(newItem); setLocal('demo_documents', list); return newItem; }
    try { const res = await fetch(`${API_URL}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok ? await res.json() : null; } catch { return null; } },
  updateDocument: async (id: string, d: any) => { if (isDemoMode()) { const list = getLocal('demo_documents'); const index = list.findIndex((t: any) => (t.id || t._id) === id); if (index > -1) { list[index] = { ...list[index], ...d }; setLocal('demo_documents', list); return list[index]; } return null; }
    try { const res = await fetch(`${API_URL}/documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return res.ok ? await res.json() : null; } catch { return null; } },
  deleteDocument: async (id: string) => { if (isDemoMode()) { const list = getLocal('demo_documents'); setLocal('demo_documents', list.filter((t: any) => (t.id || t._id) !== id)); return true; } try { const res = await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE' }); return res.ok; } catch { return false; } },
  
  // --- CLOUDINARY UPLOAD HELPER ---
  uploadFile: async (
    file: File | string, 
    folder?: string, 
    onProgress?: (percent: number) => void
  ): Promise<string> => {
    // If it is a base64 string, upload via the standard /api/upload
    if (typeof file === 'string') {
      try {
        const xhr = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
          xhr.open('POST', `${API_URL}/upload`);
          xhr.setRequestHeader('Content-Type', 'application/json');
          
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data.url);
              } catch (e) {
                resolve(file); // Fallback to base64 if parsing fails
              }
            } else {
              try {
                const data = JSON.parse(xhr.responseText);
                reject(new Error(data.message || 'Lỗi tải lên file'));
              } catch {
                reject(new Error('Lỗi máy chủ khi tải lên file'));
              }
            }
          };

          xhr.onerror = () => reject(new Error('Lỗi kết nối mạng'));
          xhr.send(JSON.stringify({ file, folder }));
        });
      } catch (e: any) {
        console.error(e);
        throw e;
      }
    }

    // If it is a native File object, use direct client-to-Cloudinary upload for huge files!
    try {
      // 1. Get Cloudinary Signature from our Server
      const sigRes = await fetch(`${API_URL}/cloudinary-signature?folder=${folder || 'tuyenquan'}`);
      if (!sigRes.ok) {
        const errData = await sigRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Không thể lấy chữ ký Cloudinary từ máy chủ');
      }
      
      const sigData = await sigRes.json();
      const { signature, timestamp, apiKey, cloudName, folder: resolvedFolder } = sigData;

      // 2. Perform direct upload to Cloudinary via XMLHttpRequest to track exact progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
        
        xhr.open('POST', uploadUrl, true);

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.secure_url || response.url);
            } catch (e) {
              reject(new Error('Không thể phân tích phản hồi từ Cloudinary'));
            }
          } else {
            try {
              const response = JSON.parse(xhr.responseText);
              reject(new Error(response.error?.message || `Lỗi Cloudinary: HTTP ${xhr.status}`));
            } catch {
              reject(new Error(`Lỗi tải lên Cloudinary: HTTP ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error('Lỗi kết nối đến Cloudinary'));
        };

        // Construct FormData payload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', resolvedFolder);

        xhr.send(formData);
      });
    } catch (err: any) {
      console.warn('Direct upload to Cloudinary failed, falling back to server upload...', err);
      // Fallback: Read file as base64 and upload via our server
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (ev) => {
          const fileBase64 = ev.target?.result as string;
          try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_URL}/upload`);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable && onProgress) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  resolve(data.url);
                } catch (e) {
                  resolve(fileBase64); // Fallback to base64 string
                }
              } else {
                try {
                  const data = JSON.parse(xhr.responseText);
                  reject(new Error(data.message || 'Lỗi tải lên file'));
                } catch {
                  reject(new Error('Lỗi máy chủ khi tải lên file'));
                }
              }
            };

            xhr.onerror = () => reject(new Error('Lỗi kết nối mạng'));
            xhr.send(JSON.stringify({ file: fileBase64, folder }));
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = () => reject(new Error('Lỗi đọc file tại trình duyệt'));
      });
    }
  }
};