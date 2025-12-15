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

// Helper: Logic đồng bộ offline sang năm sau
const syncOfflineData = (currentData: Recruit[], recruit: Recruit) => {
    const NO_SYNC_STATUS = ['NHAP_NGU', 'LOAI_KHOI_NGUON']; 
    if (NO_SYNC_STATUS.includes(recruit.status)) return currentData;

    const nextYear = recruit.recruitmentYear + 1;
    
    // Check if exists in next year
    const existingIndex = currentData.findIndex(r => 
        r.citizenId === recruit.citizenId && r.recruitmentYear === nextYear
    );

    const recruitData = { ...recruit };
    recruitData.recruitmentYear = nextYear;
    // Remove original ID to avoid conflict, new ID will be generated if creating
    
    if (existingIndex !== -1) {
        // Update existing record for next year
        // Keep the ID of the existing record
        const existingId = currentData[existingIndex].id;
        currentData[existingIndex] = { ...recruitData, id: existingId };
    } else {
        // Create new record for next year
        recruitData.id = Date.now().toString(36) + Math.random().toString(36).substring(2) + "_auto";
        currentData.push(recruitData);
    }
    return currentData;
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
      let current = getLocalData();
      current.push(savedRecruit);
      
      // Đồng bộ offline giả lập (để khi refresh có ngay)
      // Lưu ý: Server đã làm rồi, nhưng cập nhật local giúp UI mượt nếu dùng local data
      current = syncOfflineData(current, savedRecruit);
      
      setLocalData(current);

      return savedRecruit;
    } catch (error) {
      console.warn("API Error (Offline mode): Saving locally", error);
      // Fallback: Lưu vào local
      let current = getLocalData();
      // Đảm bảo không trùng ID (dù form đã tạo ID)
      const newRecruit = { ...recruit };
      current.push(newRecruit);
      
      // Kích hoạt đồng bộ năm sau cho chế độ offline
      current = syncOfflineData(current, newRecruit);
      
      setLocalData(current);
      return newRecruit;
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
      let current = getLocalData();
      const index = current.findIndex(r => r.id === recruit.id);
      if (index !== -1) {
          current[index] = savedRecruit;
          // Đồng bộ sang năm sau
          current = syncOfflineData(current, savedRecruit);
          setLocalData(current);
      }

      return savedRecruit;
    } catch (error) {
      console.warn("API Error (Offline mode): Updating locally", error);
      // Fallback: Update local
      let current = getLocalData();
      const index = current.findIndex(r => r.id === recruit.id);
      if (index !== -1) {
          current[index] = recruit;
          // Kích hoạt đồng bộ năm sau cho chế độ offline
          current = syncOfflineData(current, recruit);
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