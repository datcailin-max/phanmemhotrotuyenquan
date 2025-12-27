
import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  fileData: { type: String, required: true }, // Base64 của file Excel .xlsx
  startRow: { type: Number, default: 10 },
  // Sử dụng Schema.Types.Mixed để cho phép lưu trữ Record<string, string[]> 
  // (Ví dụ: { "1": ["STT"], "2": ["FULL_NAME", "DOB"] })
  mapping: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
}, { 
  timestamps: true,
  minimize: false // QUAN TRỌNG: Không tự động xóa các object rỗng trong mapping
});

const Template = mongoose.model('Template', templateSchema);
export default Template;
