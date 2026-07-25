
import mongoose from 'mongoose';

const dispatchSchema = new mongoose.Schema({
  senderUsername: { type: String, required: true },
  senderProvince: String,
  title: { type: String, required: true },
  url: { type: String, required: true }, // Base64 PDF
  recipients: [String], // Danh sách username các xã nhận
  year: { type: Number, required: true },
  timestamp: { type: Number, default: Date.now }
}, { timestamps: true });

const Dispatch = mongoose.model('Dispatch', dispatchSchema);
export default Dispatch;
