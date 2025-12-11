import { Recruit } from './types';

// Logic chọn đường dẫn API:
// 1. Nếu đang ở môi trường phát triển (Localhost): Dùng http://IP_MAY:5000/api
// 2. Nếu đã đưa lên mạng (Production): Dùng đường dẫn tương đối /api (Trình duyệt tự hiểu domain)
const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');

const API_URL = isLocal ? `http://${hostname}:5000/api` : '/api';

export const api = {
  // Lấy toàn bộ danh sách
  // Trả về null nếu lỗi kết nối để App biết đường hiển thị Offline
  getRecruits: async (): Promise<Recruit[] | null> => {
    try {
      const response = await fetch(`${API_URL}/recruits`);
      if (!response.ok) throw new Error('Failed to fetch recruits');
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return null;
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
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return null;
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
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  },

  // Xóa
  deleteRecruit: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/recruits/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error("API Error:", error);
      return false;
    }
  }
};