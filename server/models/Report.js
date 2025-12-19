
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  senderUsername: { type: String, required: true },
  senderUnitName: String,
  targetProvince: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true }, // Base64 PDF
  year: { type: Number, required: true },
  timestamp: { type: Number, default: Date.now }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;
