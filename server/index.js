
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import Recruit from './models/Recruit.js';
import User from './models/User.js';
import Document from './models/Document.js';
import Feedback from './models/Feedback.js';
import Report from './models/Report.js';
import Dispatch from './models/Dispatch.js';
import Template from './models/Template.js';
import MasterWordTemplate from './models/MasterWordTemplate.js';
import MasterExcelTemplate from './models/MasterExcelTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../dist')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuyenquan_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));

// --- CLOUDINARY UPLOAD API ---
app.get('/api/cloudinary-signature', (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ 
      message: 'Cloudinary chưa được cấu hình. Vui lòng thiết lập các biến môi trường CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET trong cài đặt.' 
    });
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = req.query.folder || 'tuyenquan';
  
  // Parameters to sign must be sorted alphabetically
  const paramsToSign = {
    folder: folder,
    timestamp: timestamp
  };

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    res.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/upload', async (req, res) => {
  const { file, folder } = req.body;
  if (!file) {
    return res.status(400).json({ message: 'Không tìm thấy dữ liệu tệp tải lên' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    // Nếu chưa cấu hình Cloudinary, trả về trực tiếp chuỗi Base64
    if (typeof file === 'string') {
      return res.json({ url: file });
    }
    return res.status(500).json({ 
      message: 'Cloudinary chưa được cấu hình. Vui lòng thiết lập biến môi trường CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.' 
    });
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    let result;
    if (typeof file === 'string' && file.length > 5 * 1024 * 1024) {
      result = await cloudinary.uploader.upload_large(file, {
        resource_type: 'auto',
        folder: folder || 'tuyenquan',
        chunk_size: 6000000
      });
    } else {
      result = await cloudinary.uploader.upload(file, {
        resource_type: 'auto',
        folder: folder || 'tuyenquan'
      });
    }

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error);
    res.status(500).json({ message: `Lỗi tải lên Cloudinary: ${error.message}` });
  }
});

// --- USER API ---
app.get('/api/users', async (req, res) => { try { res.json(await User.find()); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    if (user.isLocked && user.username !== 'ADMIN') return res.status(403).json({ message: 'Tài khoản chưa được Master Admin mở khóa.' });
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/users/sync', async (req, res) => {
  try {
    let user = await User.findOne({ username: req.body.username });
    if (!user) { user = new User(req.body); await user.save(); }
    res.json(user);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
app.put('/api/users/:username', async (req, res) => { try { const updateData = { ...req.body }; delete updateData._id; res.json(await User.findOneAndUpdate({ username: req.params.username }, updateData, { new: true })); } catch (e) { res.status(400).json({ message: e.message }); } });
app.delete('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    if (username === 'ADMIN') {
      return res.status(400).json({ message: 'Không thể xóa tài khoản Master Admin cấp cao nhất.' });
    }
    const deleted = await User.findOneAndDelete({ username });
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản cần xóa.' });
    }
    res.json({ success: true, message: 'Đã xóa tài khoản đơn vị thành công.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// --- RECRUIT API ---
app.get('/api/recruits', async (req, res) => { try { res.json(await Recruit.find()); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/recruits/bulk', async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ, phải là một mảng' });
    }
    
    // Tránh trùng lặp công dân khi kết chuyển
    const targetYears = [...new Set(req.body.map(r => r.recruitmentYear))];
    const existingRecruits = await Recruit.find({ recruitmentYear: { $in: targetYears } });
    
    const recruitsToInsert = req.body.filter(r => {
      const isDup = existingRecruits.some(e => {
        const rCitizenId = r.citizenId ? r.citizenId.trim() : '';
        const eCitizenId = e.citizenId ? e.citizenId.trim() : '';
        if (rCitizenId && eCitizenId && rCitizenId === eCitizenId) {
          return true;
        }
        return r.fullName && e.fullName && r.fullName.trim().toLowerCase() === e.fullName.trim().toLowerCase() && r.dob === e.dob;
      });
      return !isDup;
    });

    if (recruitsToInsert.length === 0) {
      return res.status(201).json([]);
    }

    const inserted = await Recruit.insertMany(recruitsToInsert);
    res.status(201).json(inserted);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
app.post('/api/recruits', async (req, res) => { try { res.status(201).json(await new Recruit(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); } });
app.put('/api/recruits/:id', async (req, res) => { try { const updateData = { ...req.body }; delete updateData._id; res.json(await Recruit.findOneAndUpdate({ id: req.params.id }, updateData, { new: true })); } catch (e) { res.status(400).json({ message: e.message }); } });
app.delete('/api/recruits/year/:year', async (req, res) => {
  try {
    const year = Number(req.params.year);
    if (isNaN(year)) return res.status(400).json({ message: 'Năm không hợp lệ' });
    await Recruit.deleteMany({ recruitmentYear: year });
    res.json({ message: 'OK' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
app.delete('/api/recruits/:id', async (req, res) => { try { await Recruit.findOneAndDelete({ id: req.params.id }); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); } });

// --- TEMPLATE API ---
app.get('/api/templates', async (req, res) => { try { res.json(await Template.find()); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/templates', async (req, res) => { try { res.status(201).json(await new Template(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); } });

// --- MASTER WORD TEMPLATE API ---
app.get('/api/settings/master-word-template', async (req, res) => {
  try {
    const template = await MasterWordTemplate.findOne().sort({ createdAt: -1 });
    res.json(template || null);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.post('/api/settings/master-word-template', async (req, res) => {
  try {
    // Delete existing ones to keep only the latest master template
    await MasterWordTemplate.deleteMany({});
    const newDoc = new MasterWordTemplate({
      name: req.body.name,
      url: req.body.url,
      uploadDate: req.body.uploadDate || new Date().toLocaleDateString('vi-VN'),
      updatedBy: req.body.updatedBy || 'ADMIN',
      fileType: 'WORD'
    });
    const saved = await newDoc.save();
    res.status(201).json(saved);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// --- MASTER EXCEL TEMPLATES API ---
app.get('/api/settings/master-excel-template/:type', async (req, res) => {
  try {
    const template = await MasterExcelTemplate.findOne({ type: req.params.type }).sort({ createdAt: -1 });
    res.json(template || null);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.post('/api/settings/master-excel-template/:type', async (req, res) => {
  try {
    await MasterExcelTemplate.deleteMany({ type: req.params.type });
    const newDoc = new MasterExcelTemplate({
      type: req.params.type,
      name: req.body.name,
      url: req.body.url,
      uploadDate: req.body.uploadDate || new Date().toLocaleDateString('vi-VN'),
      updatedBy: req.body.updatedBy || 'ADMIN'
    });
    const saved = await newDoc.save();
    res.status(201).json(saved);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.delete('/api/settings/master-excel-template/:type', async (req, res) => {
  try {
    await MasterExcelTemplate.deleteMany({ type: req.params.type });
    res.json({ message: 'OK' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
app.put('/api/templates/:id', async (req, res) => { 
  try { 
    const updateData = { ...req.body };
    delete updateData._id; // Tránh lỗi Mongoose: Cannot update immutable field _id
    delete updateData.id;
    
    const updated = await Template.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated); 
  } catch (e) { 
    res.status(400).json({ message: e.message }); 
  } 
});
app.delete('/api/templates/:id', async (req, res) => { try { await Template.findByIdAndDelete(req.params.id); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); } });

// --- CÁC API KHÁC GIỮ NGUYÊN ---
app.get('/api/documents', async (req, res) => { try { res.json(await Document.find().select('-url').sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); } });
app.get('/api/documents/:id', async (req, res) => { try { const doc = await Document.findById(req.params.id); if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' }); res.json(doc); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/documents', async (req, res) => { try { const doc = new Document(req.body); res.status(201).json(await doc.save()); } catch (e) { res.status(400).json({ message: e.message }); } });
app.put('/api/documents/:id', async (req, res) => { try { const updated = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updated); } catch (e) { res.status(400).json({ message: e.message }); } });
app.delete('/api/documents/:id', async (req, res) => { try { await Document.findByIdAndDelete(req.params.id); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); } });
app.get('/api/feedbacks', async (req, res) => { try { res.json(await Feedback.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/feedbacks', async (req, res) => { try { res.status(201).json(await new Feedback(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); } });
app.get('/api/reports', async (req, res) => { try { res.json(await Report.find(req.query).sort({ timestamp: -1 })); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/reports', async (req, res) => { try { res.status(201).json(await new Report(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); } });
app.get('/api/dispatches', async (req, res) => { try { res.json(await Dispatch.find(req.query).sort({ timestamp: -1 })); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/dispatches', async (req, res) => { try { res.status(201).json(await new Dispatch(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); } });

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
