import mongoose from 'mongoose';

const masterWordTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadDate: { type: String, required: true },
  updatedBy: String,
  fileType: { type: String, default: 'WORD' }
}, { timestamps: true });

const MasterWordTemplate = mongoose.model('MasterWordTemplate', masterWordTemplateSchema);
export default MasterWordTemplate;
