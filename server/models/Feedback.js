
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  username: { type: String, required: true },
  unitName: { type: String, required: true },
  category: { type: String, enum: ['HỎI ĐÁP', 'GÓP Ý', 'MẬT KHẨU', 'KHÁC'], default: 'HỎI ĐÁP' },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  reply: String,
  replyTimestamp: Number,
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
