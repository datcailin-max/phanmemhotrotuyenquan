import mongoose from 'mongoose';

const masterExcelTemplateSchema = new mongoose.Schema({
  type: { type: String, required: true }, // '17' | 'SOURCE'
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadDate: { type: String, required: true },
  updatedBy: String
}, { timestamps: true });

const MasterExcelTemplate = mongoose.model('MasterExcelTemplate', masterExcelTemplateSchema);
export default MasterExcelTemplate;
