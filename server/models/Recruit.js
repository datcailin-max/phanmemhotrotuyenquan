
import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: { type: String },
  uploadDate: String
}, { _id: false });

const recruitSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Keep existing ID logic for compatibility
  citizenId: String,
  fullName: { type: String, required: true },
  dob: String,
  phoneNumber: String,
  avatarUrl: String,
  address: {
    province: String,
    commune: String,
    village: String,
    street: String
  },
  hometown: {
    province: String,
    commune: String,
    village: String
  },
  physical: {
    height: Number,
    weight: Number,
    chest: Number, // Mới
    bmi: Number,
    healthGrade: Number,
    bloodPressure: String,
    note: String
  },
  details: {
    education: String,
    educationPeriod: String,
    sentencePeriod: String,
    major: String,
    school: String,
    ethnicity: String,
    religion: String,
    maritalStatus: String,
    job: String,
    workAddress: String,
    gradeGroup: String,
    salaryLevel: String,
    politicalStatus: String,
    partyEntryDate: String,
    gifted: String,
    familyComposition: String,
    personalComposition: String,
    registrationMethod: String, // Bổ sung trường này để lưu 'DIRECT' hoặc 'ONLINE'
    siblingCount: String,
    birthOrder: String,
    parentPolicyStatus: String,
    rewards: String,
    disciplines: String,
    proposedForSelection: { type: Boolean, default: false }
  },
  family: {
    father: {
      fullName: String,
      birthYear: String,
      job: String,
      phoneNumber: String
    },
    mother: {
      fullName: String,
      birthYear: String,
      job: String,
      phoneNumber: String
    },
    wife: {
      fullName: String,
      birthYear: String,
      job: String,
      phoneNumber: String
    },
    children: String
  },
  status: { type: String, required: true },
  previousStatus: String, // Trạng thái cũ để khôi phục
  previousDefermentReason: String, // Lý do cũ để khôi phục
  defermentReason: String,
  defermentProof: String, // Văn bản chứng minh (cho lý do chính sách)
  enlistmentUnit: String,
  enlistmentDate: String,
  enlistmentType: String, // 'OFFICIAL' or 'RESERVE'
  recruitmentYear: { type: Number, required: true },
  attachments: [attachmentSchema],
  wordDocument: {
    name: String,
    url: String,
    uploadDate: String,
    updatedBy: String,
    isCustom: Boolean
  },
  curriculumVitae: { type: Object, default: {} }
}, { timestamps: true });

const Recruit = mongoose.model('Recruit', recruitSchema);

export default Recruit;
