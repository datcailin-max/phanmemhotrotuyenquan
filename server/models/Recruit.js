
import mongoose from 'mongoose';

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
    personalComposition: String
  },
  family: {
    father: {
      fullName: String,
      job: String,
      phoneNumber: String
    },
    mother: {
      fullName: String,
      job: String,
      phoneNumber: String
    },
    wife: {
      fullName: String,
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
  enlistmentType: String, // 'OFFICIAL' or 'RESERVE'
  recruitmentYear: { type: Number, required: true },
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadDate: String
  }]
}, { timestamps: true });

const Recruit = mongoose.model('Recruit', recruitSchema);

export default Recruit;
