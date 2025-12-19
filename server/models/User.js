
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  personalName: String,
  rank: String,
  position: String,
  email: String,
  phoneNumber: String,
  role: { type: String, required: true },
  unit: {
    province: String,
    commune: String
  },
  isLocked: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
