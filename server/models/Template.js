
import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  fileData: { type: String, required: true }, // Base64 của file Excel .xlsx
  startRow: { type: Number, default: 10 },
  mapping: { type: Map, of: String }, // Map từ Cột số (1, 2, 3...) sang Field Key (STT, FULL_NAME...)
}, { timestamps: true });

const Template = mongoose.model('Template', templateSchema);
export default Template;
