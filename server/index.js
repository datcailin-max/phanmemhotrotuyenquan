
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
import Template from './models/Template.js';

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
app.put('/api/users/:username', async (req, res) => { try { res.json(await User.findOneAndUpdate({ username: req.params.username }, req.body, { new: true })); } catch (e) { res.status(400).json({ message: e.message }); } });

// --- RECRUIT API ---
app.get('/api/recruits', async (req, res) => { try { res.json(await Recruit.find()); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/recruits', async (req, res) => { try { res.status(201).json(await new Recruit(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); } });
app.put('/api/recruits/:id', async (req, res) => { try { res.json(await Recruit.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })); } catch (e) { res.status(400).json({ message: e.message }); } });
app.delete('/api/recruits/:id', async (req, res) => { try { await Recruit.findOneAndDelete({ id: req.params.id }); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); } });

// --- TEMPLATE API ---
app.get('/api/templates', async (req, res) => { try { res.json(await Template.find()); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/templates', async (req, res) => { try { res.status(201).json(await new Template(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); } });
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
app.get('/api/documents', async (req, res) => { try { res.json(await Document.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/documents', async (req, res) => { try { const doc = new Document(req.body); res.status(201).json(await doc.save()); } catch (e) { res.status(400).json({ message: e.message }); } });
app.get('/api/feedbacks', async (req, res) => { try { res.json(await Feedback.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/feedbacks', async (req, res) => { try { res.status(201).json(await new Feedback(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); } });
app.get('/api/reports', async (req, res) => { try { res.json(await Report.find(req.query).sort({ timestamp: -1 })); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/reports', async (req, res) => { try { res.status(201).json(await new Report(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); } });
app.get('/api/dispatches', async (req, res) => { try { res.json(await Dispatch.find(req.query).sort({ timestamp: -1 })); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/dispatches', async (req, res) => { try { res.status(201).json(await new Dispatch(req.body).save()); } catch (e) { res.status(400).json({ message: e.message }); } });

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
