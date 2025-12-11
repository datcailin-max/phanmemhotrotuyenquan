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
// Port sẽ lấy từ biến môi trường (khi lên Cloud) hoặc mặc định 5000 (khi chạy local)
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Phục vụ file tĩnh từ thư mục build của React (frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// MongoDB Connection
// Ưu tiên lấy từ biến môi trường MONGODB_URI (Cloud), nếu không có thì dùng local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuyenquan_db';

// LOG DEBUG: In ra chuỗi kết nối (đã che mật khẩu) để kiểm tra lỗi cú pháp
try {
  const maskedURI = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
  console.log(`🌐 Đang nỗ lực kết nối tới Database: ${maskedURI}`);
} catch (e) {
  console.log('🌐 Đang nỗ lực kết nối tới Database (Không thể parse URI)');
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log(`✅ Đã kết nối cơ sở dữ liệu: ${process.env.MONGODB_URI ? 'MongoDB Cloud' : 'Localhost'}`))
  .catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    
    // Kiểm tra lỗi IP Whitelist
    if (err.name === 'MongooseServerSelectionError') {
        console.error('🚨 QUAN TRỌNG: Server Render bị MongoDB chặn IP!');
        console.error('👉 KHẮC PHỤC NGAY:');
        console.error('   1. Vào trang quản trị MongoDB Atlas (cloud.mongodb.com)');
        console.error('   2. Chọn mục "Network Access" ở cột bên trái');
        console.error('   3. Bấm nút xanh "Add IP Address"');
        console.error('   4. Chọn "Allow Access from Anywhere" (0.0.0.0/0)');
        console.error('   5. Bấm "Confirm" và đợi 1-2 phút rồi Restart lại Render.');
    } else {
        console.error('⚠️ GỢI Ý: Kiểm tra lại User/Password trong biến môi trường MONGODB_URI.');
    }
  });

// --- API ROUTES ---

// 1. Lấy danh sách công dân
app.get('/api/recruits', async (req, res) => {
  try {
    const recruits = await Recruit.find();
    res.json(recruits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Thêm mới công dân
app.post('/api/recruits', async (req, res) => {
  try {
    const newRecruit = new Recruit(req.body);
    const savedRecruit = await newRecruit.save();
    res.status(201).json(savedRecruit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3. Cập nhật thông tin
app.put('/api/recruits/:id', async (req, res) => {
  try {
    // Tìm theo field 'id' của chúng ta chứ không phải _id của Mongo
    const updatedRecruit = await Recruit.findOneAndUpdate(
      { id: req.params.id }, 
      req.body, 
      { new: true }
    );
    if (!updatedRecruit) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
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

// --- CẤU HÌNH CHO PRODUCTION (KHI ĐƯA LÊN MẠNG) ---
// Bất kỳ route nào không phải API sẽ trả về file index.html của React
// Để React Router xử lý việc điều hướng
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
});