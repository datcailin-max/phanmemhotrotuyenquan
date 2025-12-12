import { Recruit } from './types';

// Logic chọn đường dẫn API:
// Sử dụng đường dẫn tương đối /api nếu không phải localhost (để hỗ trợ proxy server)
// Hoặc fallback về localhost:5000 nếu đang chạy dev local
const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');

// Nếu đang ở môi trường Cloud (WebContainer, Codespace), port 5000 có thể không map trực tiếp
// Nên ưu tiên dùng /api nếu cấu hình proxy (vite.config.ts) hoặc dùng logic fallback
const API_URL = isLocal && window.location.port !== '5000' ? `http://${hostname}:5000/api` : '/api';

const STORAGE_KEY = 'tuyenquan_recruits_offline';

// Helper: Lấy dữ liệu từ LocalStorage (Fallback khi Offline)
const getLocalData = (): Recruit[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Helper: Lưu dữ liệu vào LocalStorage
const setLocalData = (data: Recruit[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Local Storage Error", e);
    }
};

export const api = {
  // Lấy toàn bộ danh sách
  getRecruits: async (): Promise<Recruit[] | null> => {
    try {
      const response = await fetch(`${API_URL}/recruits`);
      if (!response.ok) throw new Error('Failed to fetch recruits');
      const data = await response.json();
      
      // Quan trọng: Đồng bộ dữ liệu từ Server xuống Local ngay khi lấy thành công
      // Để lần sau nếu mất mạng thì vẫn có dữ liệu mới nhất để dùng
      setLocalData(data);
      
      return data;
    } catch (error) {
      console.warn("API Error (Offline mode activated):", error);
      // Fallback: Trả về dữ liệu local thay vì null
      return getLocalData();
    }
  },

  // Thêm mới
  createRecruit: async (recruit: Recruit): Promise<Recruit | null> => {
    try {
      const response = await fetch(`${API_URL}/recruits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recruit),
      });
      if (!response.ok) throw new Error('Failed to create recruit');
      
      const savedRecruit = await response.json();
      
      // UPDATE LOCAL STORAGE NGAY LẬP TỨC
      const current = getLocalData();
      setLocalData([...current, savedRecruit]);

      return savedRecruit;
    } catch (error) {
      console.warn("API Error (Offline mode): Saving locally", error);
      // Fallback: Lưu vào local
      const current = getLocalData();
      // Đảm bảo không trùng ID (dù form đã tạo ID)
      const updated = [...current, recruit];
      setLocalData(updated);
      return recruit;
    }
  },

  // Cập nhật
  updateRecruit: async (recruit: Recruit): Promise<Recruit | null> => {
    try {
      const response = await fetch(`${API_URL}/recruits/${recruit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recruit),
      });
      if (!response.ok) throw new Error('Failed to update recruit');
      
      const savedRecruit = await response.json();

      // UPDATE LOCAL STORAGE NGAY LẬP TỨC
      const current = getLocalData();
      const index = current.findIndex(r => r.id === recruit.id);
      if (index !== -1) {
          current[index] = savedRecruit;
          setLocalData(current);
      }

      return savedRecruit;
    } catch (error) {
      console.warn("API Error (Offline mode): Updating locally", error);
      // Fallback: Update local
      const current = getLocalData();
      const index = current.findIndex(r => r.id === recruit.id);
      if (index !== -1) {
          current[index] = recruit;
          setLocalData(current);
          return recruit;
      }
      return null;
    }
  },

  // Xóa
  deleteRecruit: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/recruits/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
           // UPDATE LOCAL STORAGE NGAY LẬP TỨC
           const current = getLocalData();
           const updated = current.filter(r => r.id !== id);
           setLocalData(updated);
      }

      return response.ok;
    } catch (error) {
      console.warn("API Error (Offline mode): Deleting locally", error);
      // Fallback: Delete local
      const current = getLocalData();
      const updated = current.filter(r => r.id !== id);
      setLocalData(updated);
      return true;
    }
  }
};