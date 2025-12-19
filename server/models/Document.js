
import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  url: { type: String, required: true }, // Lưu trữ Base64 hoặc Link
  uploadDate: { type: String, required: true },
  fileType: { type: String, enum: ['WORD', 'PDF', 'EXCEL', 'OTHER'], default: 'PDF' },
  category: { type: String, enum: ['LUAT', 'NGHI_DINH', 'THONG_TU', 'HUONG_DAN', 'QUYET_DINH', 'KHAC'], default: 'KHAC' }
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);
export default Document;
