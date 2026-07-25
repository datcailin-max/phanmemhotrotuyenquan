
import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  fileData: { type: String, required: true }, // Base64 của file Excel .xlsx
  startRow: { type: Number, default: 10 },
  // Sử dụng Schema.Types.Mixed để cho phép lưu trữ Record<string, string[]> 
  mapping: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  sourceTabs: [String], // Danh sách các ID Tab cần lấy dữ liệu
  onlyAge17: { type: Boolean, default: false }, // Có lọc tuổi 17 hay không
  filterAges: [Number], // Mới: Lọc độ tuổi (18-27)
  filterEthnicities: [String], // Mới: Lọc dân tộc
  filterReligions: [String], // Mới: Lọc tôn giáo
  filterHealthGrades: [Number] // Mới: Lọc loại sức khỏe
}, { 
  timestamps: true,
  minimize: false
});

const Template = mongoose.model('Template', templateSchema);
export default Template;
