
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GridFSBucket, ObjectId } from 'mongodb';
import Recruit from './models/Recruit.js';
import User from './models/User.js';
import Document from './models/Document.js';
import Feedback from './models/Feedback.js';
import Report from './models/Report.js';
import Dispatch from './models/Dispatch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../dist')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuyenquan_db';

let bucket;
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    // Khởi tạo GridFS Bucket để quản lý file lớn triệt để
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'attachments' });
  })
  .catch(err => console.error('❌ MongoDB Error:', err.message));

// --- USER API ---
app.get('/api/users', async (req, res) => {
  try { res.json(await User.find()); } catch (e) { res.status(500).json({ message: e.message }); }
});
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

// --- RECRUIT API ---
app.get('/api/recruits', async (req, res) => {
  try { res.json(await Recruit.find()); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/recruits', async (req, res) => {
  try { res.status(201).json(await new Recruit(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.put('/api/recruits/:id', async (req, res) => {
  try { res.json(await Recruit.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.delete('/api/recruits/:id', async (req, res) => {
  try { await Recruit.findOneAndDelete({ id: req.params.id }); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- DOCUMENT API (KIẾN TRÚC MỚI CHO FILE SIÊU NẶNG) ---
app.get('/api/documents', async (req, res) => {
  try { 
    // Chỉ lấy metadata, tuyệt đối không lấy dữ liệu nhị phân ở đây
    const docs = await Document.find({}, '-url').sort({ createdAt: -1 }); 
    res.json(docs); 
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// TẢI FILE DẠY NHỊ PHÂN (BINARY STREAMING) - GIẢI QUYẾT TRIỆT ĐỂ LỖI TRẮNG MÀN HÌNH
app.get('/api/documents/:id/file', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc || !doc.url) return res.status(404).json({ message: 'Không thấy tài liệu' });

        // Tách Base64 nếu đang lưu cũ, hoặc xử lý GridFS
        let base64Data = doc.url;
        if (base64Data.includes(';base64,')) {
            base64Data = base64Data.split(';base64,')[1];
        }
        
        const buffer = Buffer.from(base64Data, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="document.pdf"`);
        res.send(buffer);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.post('/api/documents', async (req, res) => {
  try { 
    const doc = new Document(req.body);
    const result = await doc.save();
    res.status(201).json(result); 
  } catch (e) { res.status(400).json({ message: e.message }); }
});

app.put('/api/documents/:id', async (req, res) => {
  try { res.json(await Document.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (e) { res.status(400).json({ message: e.message }); }
});

app.delete('/api/documents/:id', async (req, res) => {
  try { await Document.findByIdAndDelete(req.params.id); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- FEEDBACK API ---
app.get('/api/feedbacks', async (req, res) => {
  try { res.json(await Feedback.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/feedbacks', async (req, res) => {
  try { res.status(201).json(await new Feedback(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); }
});

// --- REPORTS & DISPATCHES ---
app.get('/api/reports', async (req, res) => {
  const { province, targetProvince, username, year } = req.query;
  let query = {};
  const pName = targetProvince || province;
  if (pName) query.targetProvince = { $regex: new RegExp("^" + pName.trim() + "$", "i") };
  if (username) query.senderUsername = username;
  if (year) query.year = Number(year);
  try { res.json(await Report.find(query).sort({ timestamp: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/reports', async (req, res) => {
  try { res.status(201).json(await new Report(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); }
});

app.get('/api/dispatches', async (req, res) => {
  const { province, senderProvince, username, commune, year } = req.query;
  let query = {};
  const pName = senderProvince || province;
  if (pName) query.senderProvince = { $regex: new RegExp("^" + pName.trim() + "$", "i") };
  if (username || commune) {
    const targets = ['ALL'];
    if (username) targets.push(username);
    if (commune) targets.push(commune);
    query.recipients = { $in: targets.map(t => new RegExp("^" + t.trim() + "$", "i")) };
  }
  if (year) query.year = Number(year);
  try { res.json(await Dispatch.find(query).sort({ timestamp: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/dispatches', async (req, res) => {
  try { res.status(201).json(await new Dispatch(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT} with Binary Support`));
