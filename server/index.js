
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
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

app.use(express.json({ limit: '10mb' })); // Giảm limit JSON xuống để tránh treo RAM
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../dist')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuyenquan_db';

let bucket;
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'attachments' });
  })
  .catch(err => console.error('❌ MongoDB Error:', err.message));

// Cấu hình Multer để nhận file trực tiếp vào RAM tạm (buffer) trước khi đẩy vào GridFS
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // Hỗ trợ tới 100MB

// --- DOCUMENT API (HỆ THỐNG MỚI TRIỆT ĐỂ) ---

// Lấy danh sách tài liệu (Chỉ lấy metadata để load cực nhanh)
app.get('/api/documents', async (req, res) => {
  try { 
    const docs = await Document.find({}).sort({ createdAt: -1 }); 
    res.json(docs); 
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Upload tài liệu mới bằng Multipart Form (Chuẩn cho file lớn)
app.post('/api/documents', upload.single('file'), async (req, res) => {
  try {
    const { title, category, description, uploadDate } = req.body;
    let fileId = '';

    if (req.file) {
        const uploadStream = bucket.openUploadStream(req.file.originalname);
        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);
        
        await new Promise((resolve, reject) => {
            readableStream.pipe(uploadStream)
                .on('error', reject)
                .on('finish', () => {
                    fileId = uploadStream.id.toString();
                    resolve();
                });
        });
    }

    const doc = new Document({
        title,
        category,
        description,
        uploadDate,
        url: fileId, // Lưu ID của GridFS
        fileType: 'PDF'
    });

    const result = await doc.save();
    res.status(201).json(result);
  } catch (e) {
    console.error("Lỗi upload:", e);
    res.status(400).json({ message: e.message });
  }
});

// Tải file nhị phân (Binary Stream)
app.get('/api/documents/:id/file', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).send('Không tìm thấy tài liệu');

        res.setHeader('Content-Type', 'application/pdf');
        
        // Kiểm tra xem là GridFS ID hay Base64 cũ
        if (doc.url && doc.url.length === 24 && /^[0-9a-fA-F]+$/.test(doc.url)) {
            const downloadStream = bucket.openDownloadStream(new ObjectId(doc.url));
            downloadStream.pipe(res);
        } else if (doc.url) {
            // Tương thích ngược
            let b64 = doc.url.includes('base64,') ? doc.url.split('base64,')[1] : doc.url;
            res.send(Buffer.from(b64, 'base64'));
        } else {
            res.status(404).send('File không có nội dung');
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

app.delete('/api/documents/:id', async (req, res) => {
  try { 
    const doc = await Document.findById(req.params.id);
    if (doc && doc.url && doc.url.length === 24) {
        try { await bucket.delete(new ObjectId(doc.url)); } catch(err) {}
    }
    await Document.findByIdAndDelete(req.params.id); 
    res.json({ message: 'OK' }); 
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- CÁC API KHÁC GIỮ NGUYÊN ---
app.get('/api/users', async (req, res) => {
  try { res.json(await User.find()); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: 'Sai tài khoản' });
    if (user.isLocked && user.username !== 'ADMIN') return res.status(403).json({ message: 'Tài khoản khóa' });
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
app.get('/api/feedbacks', async (req, res) => {
  try { res.json(await Feedback.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/feedbacks', async (req, res) => {
  try { res.status(201).json(await new Feedback(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.get('/api/reports', async (req, res) => {
  const { username, year } = req.query;
  let q = {}; if(username) q.senderUsername = username; if(year) q.year = Number(year);
  try { res.json(await Report.find(q).sort({ timestamp: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/reports', async (req, res) => {
  try { res.status(201).json(await new Report(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.get('/api/dispatches', async (req, res) => {
  const { province, year } = req.query;
  let q = {}; if(province) q.senderProvince = province; if(year) q.year = Number(year);
  try { res.json(await Dispatch.find(q).sort({ timestamp: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/dispatches', async (req, res) => {
  try { res.status(201).json(await new Dispatch(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on ${PORT} with Stream Support`));
