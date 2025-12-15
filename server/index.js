import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Recruit from './models/Recruit.js';

// Cấu hình đường dẫn cho ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Port sẽ lấy từ biến môi trường (khi lên Cloud) hoặc mặc định 5000
const PORT = process.env.PORT || 5000;

// --- 1. ROUTE HEALTH CHECK (QUAN TRỌNG CHO RENDER) ---
// Render sẽ gọi vào đây để biết server còn sống hay không
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy and running!');
});

// Middleware
app.use(cors());
app.use(express.json());
// Phục vụ file tĩnh từ thư mục build của React (frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuyenquan_db';

// Cấu hình Mongoose để không bị treo nếu lỗi mạng
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Hủy kết nối sau 5s nếu không kết nối được (thay vì treo 30s+)
  socketTimeoutMS: 45000,
};

// LOG DEBUG
try {
  const maskedURI = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
  console.log(`🌐 Đang kết nối Database: ${maskedURI}`);
} catch (e) {
  console.log('🌐 Đang kết nối Database...');
}

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => console.log(`✅ Đã kết nối cơ sở dữ liệu: ${process.env.MONGODB_URI ? 'MongoDB Cloud' : 'Localhost'}`))
  .catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    if (err.name === 'MongooseServerSelectionError') {
        console.error('🚨 LỖI IP WHITELIST: Server Render không thể kết nối tới MongoDB.');
        console.error('👉 KHẮC PHỤC: Vào MongoDB Atlas -> Network Access -> Add IP Address -> Chọn "Allow Access from Anywhere" (0.0.0.0/0).');
    }
    // Không exit process để Server vẫn chạy và trả về giao diện (dù không có data)
  });

// --- HELPER FUNCTION: AUTO SYNC TO NEXT YEAR ---
const syncToNextYear = async (recruit) => {
  try {
      // 1. Xác định các trạng thái KHÔNG được sao chép (Nhập ngũ, Loại khỏi nguồn)
      // Các trạng thái còn lại (DS 1, 2, 3, 13...) đều được sao chép/đồng bộ.
      const NO_SYNC_STATUS = ['NHAP_NGU', 'LOAI_KHOI_NGUON']; 
      
      // Nếu hồ sơ rơi vào trạng thái không đồng bộ, ta dừng lại (hoặc có thể xem xét xóa ở năm sau nếu cần, nhưng an toàn là giữ nguyên)
      if (NO_SYNC_STATUS.includes(recruit.status)) return;

      const nextYear = recruit.recruitmentYear + 1;
      
      // 2. Tìm bản ghi của năm sau dựa trên CCCD
      const existingNextYear = await Recruit.findOne({
          citizenId: recruit.citizenId,
          recruitmentYear: nextYear
      });

      // 3. Chuẩn bị dữ liệu để sao chép
      const recruitData = recruit.toObject();
      delete recruitData._id;
      delete recruitData.id; // Xóa ID cũ để tạo ID mới hoặc giữ nguyên logic update
      delete recruitData.createdAt;
      delete recruitData.updatedAt;
      delete recruitData.__v;
      
      recruitData.recruitmentYear = nextYear;

      if (existingNextYear) {
          // UPDATE: Nếu năm sau đã có hồ sơ, cập nhật thông tin mới nhất từ năm nay
          // Giữ nguyên ID của bản ghi năm sau
          await Recruit.findByIdAndUpdate(existingNextYear._id, recruitData);
          console.log(`[AUTO-SYNC] Đã cập nhật hồ sơ ${recruit.fullName} cho năm ${nextYear}`);
      } else {
          // CREATE: Nếu năm sau chưa có, tạo mới
          recruitData.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
          const newRecruit = new Recruit(recruitData);
          await newRecruit.save();
          console.log(`[AUTO-SYNC] Đã sao chép hồ sơ ${recruit.fullName} sang năm ${nextYear}`);
      }
  } catch (err) {
      console.error("[AUTO-SYNC ERROR]", err.message);
  }
};

// --- API ROUTES ---

// 1. Lấy danh sách công dân
app.get('/api/recruits', async (req, res) => {
  try {
    const recruits = await Recruit.find();
    res.json(recruits);
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ message: "Lỗi Server hoặc kết nối Database" });
  }
});

// 2. Thêm mới công dân
app.post('/api/recruits', async (req, res) => {
  try {
    const newRecruit = new Recruit(req.body);
    const savedRecruit = await newRecruit.save();
    
    // Kích hoạt đồng bộ sang năm sau
    await syncToNextYear(savedRecruit);

    res.status(201).json(savedRecruit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3. Cập nhật thông tin
app.put('/api/recruits/:id', async (req, res) => {
  try {
    const updatedRecruit = await Recruit.findOneAndUpdate(
      { id: req.params.id }, 
      req.body, 
      { new: true }
    );
    if (!updatedRecruit) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    
    // Kích hoạt đồng bộ sang năm sau
    await syncToNextYear(updatedRecruit);

    res.json(updatedRecruit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. Xóa hồ sơ
app.delete('/api/recruits/:id', async (req, res) => {
  try {
    const deletedRecruit = await Recruit.findOneAndDelete({ id: req.params.id });
    if (!deletedRecruit) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    res.json({ message: 'Đã xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- CẤU HÌNH CHO PRODUCTION ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Lắng nghe trên 0.0.0.0 để Render nhận diện được port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
});