
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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

// CẤU HÌNH GIỚI HẠN PAYLOAD - Nâng lên 100MB để hỗ trợ file đính kèm nặng
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../dist')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuyenquan_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
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
app.put('/api/users/:username', async (req, res) => {
  try { res.json(await User.findOneAndUpdate({ username: req.params.username }, req.body, { new: true })); } catch (e) { res.status(400).json({ message: e.message }); }
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

// --- DOCUMENT API ---
app.get('/api/documents', async (req, res) => {
  try { 
    res.json(await Document.find().sort({ createdAt: -1 })); 
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});
app.post('/api/documents', async (req, res) => {
  try { 
    const doc = new Document(req.body);
    const result = await doc.save();
    res.status(201).json(result); 
  } catch (e) { 
    res.status(400).json({ message: e.message }); 
  }
});
app.put('/api/documents/:id', async (req, res) => {
  try { res.json(await Document.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.delete('/api/documents/:id', async (req, res) => {
  try { await Document.findByIdAndDelete(req.params.id); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- FEEDBACK / QA API ---
app.get('/api/feedbacks', async (req, res) => {
  try { res.json(await Feedback.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/feedbacks', async (req, res) => {
  try { res.status(201).json(await new Feedback(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.put('/api/feedbacks/:id', async (req, res) => {
  try { res.json(await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.delete('/api/feedbacks/:id', async (req, res) => {
  try { await Feedback.findByIdAndDelete(req.params.id); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- REPORT API ---
app.get('/api/reports', async (req, res) => {
  const { province, targetProvince, username, year } = req.query;
  let query = {};
  const pName = targetProvince || province;
  if (pName) {
    query.targetProvince = { $regex: new RegExp("^" + pName.trim() + "$", "i") };
  }
  if (username) query.senderUsername = username;
  if (year) query.year = Number(year);
  try { 
    const results = await Report.find(query).sort({ timestamp: -1 });
    res.json(results); 
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});
app.post('/api/reports', async (req, res) => {
  try { 
    res.status(201).json(await new Report(req.body).save()); 
  } catch (e) { 
    res.status(400).json({ message: e.message }); 
  }
});
app.delete('/api/reports/:id', async (req, res) => {
    try { await Report.findByIdAndDelete(req.params.id); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- DISPATCH API ---
app.get('/api/dispatches', async (req, res) => {
  const { province, senderProvince, username, commune, year } = req.query;
  let query = {};
  const pName = senderProvince || province;
  if (pName) {
    query.senderProvince = { $regex: new RegExp("^" + pName.trim() + "$", "i") };
  }
  if (username || commune) {
    const targets = ['ALL'];
    if (username) targets.push(username);
    if (commune) targets.push(commune);
    query.recipients = { 
      $in: targets.map(t => new RegExp("^" + t.trim() + "$", "i")) 
    };
  }
  if (year) query.year = Number(year);
  try { 
    const results = await Dispatch.find(query).sort({ timestamp: -1 });
    res.json(results); 
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});
app.post('/api/dispatches', async (req, res) => {
  try { 
    res.status(201).json(await new Dispatch(req.body).save()); 
  } catch (e) { 
    res.status(400).json({ message: e.message }); 
  }
});
app.delete('/api/dispatches/:id', async (req, res) => {
    try { await Dispatch.findByIdAndDelete(req.params.id); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT} with 100MB limit` ));
