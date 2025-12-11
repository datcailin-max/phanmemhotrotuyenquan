
export enum RecruitmentStatus {
  SOURCE = 'NGUON', // Nguồn công dân (Mới nhập)
  PRE_CHECK_PASSED = 'SO_KHAM_DAT', // Đạt sơ khám
  PRE_CHECK_FAILED = 'SO_KHAM_KHONG_DAT', // Không đạt sơ khám
  MED_EXAM_PASSED = 'KHAM_TUYEN_DAT', // Đạt khám tuyển
  MED_EXAM_FAILED = 'KHAM_TUYEN_KHONG_DAT', // Không đạt khám tuyển
  FINALIZED = 'CHOT_NHAP_NGU', // Chốt nhập ngũ
  DEFERRED = 'TAM_HOAN', // Tạm hoãn
  EXEMPTED = 'MIEN_KHAM' // Miễn làm NVQS
}

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface User {
  username: string;
  fullName: string;
  password?: string; // Optional because we might sanitize it out
  role: UserRole; // Role determines permissions
  unit: {
    province: string;
    commune: string;
  };
}

export interface FamilyMember {
  fullName: string;
  job: string; // CNVC, Công nhân, Buôn bán, Đã mất...
  phoneNumber: string;
}

export interface Recruit {
  id: string;
  citizenId: string; // Số CCCD
  fullName: string;
  dob: string;
  phoneNumber: string; // Số điện thoại thanh niên
  avatarUrl?: string;
  address: {
    province: string; // Tỉnh/Thành phố
    commune: string; // Xã/Phường
    village: string; // Thôn/Ấp
    street?: string; // Số nhà, đường (tùy chọn)
  };
  hometown: {
    province: string; // Tỉnh/Thành phố
    commune: string; // Xã/Phường
    village: string; // Thôn/Ấp
  };
  physical: {
    height: number; // cm
    weight: number; // kg
    bmi: number;
    healthGrade?: number; // 1, 2, 3, 4 (Phân loại sức khỏe)
  };
  details: {
    education: string; // Trình độ học vấn
    ethnicity: string; // Dân tộc
    religion: string; // Tôn giáo
    maritalStatus: string; // Tình trạng hôn nhân
    job: string; // Công việc
    politicalStatus: 'None' | 'Doan_Vien' | 'Dang_Vien'; // Đổi Quan_Chung thành None
    partyEntryDate?: string; // Ngày vào đảng (nếu là đảng viên)
  };
  family: {
    father: FamilyMember;
    mother: FamilyMember;
    wife?: FamilyMember;
    children?: string; // Thông tin về con
  };
  status: RecruitmentStatus;
  defermentReason?: string; // Lý do tạm hoãn hoặc miễn
  enlistmentUnit?: string; // Đơn vị nhập ngũ (khi đã chốt)
  recruitmentYear: number;
}

export interface FilterState {
  search: string;
  commune: string;
  village: string;
  education: string;
  year: number;
  ethnicity: string;
  religion: string;
  maritalStatus: string;
  age: string;
}