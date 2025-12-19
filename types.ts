
export enum RecruitmentStatus {
  NOT_ALLOWED_REGISTRATION = 'KHONG_DUOC_DANG_KY', // 1. Không được đăng ký NVQS
  EXEMPT_REGISTRATION = 'MIEN_DANG_KY', // 2. Miễn đăng ký NVQS
  FIRST_TIME_REGISTRATION = 'DANG_KY_LAN_DAU', // 3. Đăng ký NVQS lần đầu
  SOURCE = 'NGUON', // 4. Tổng Nguồn công dân (Sẵn sàng nhập ngũ)
  NOT_SELECTED_TT50 = 'KHONG_TUYEN_CHON_TT50', // Không tuyển chọn, chưa gọi nhập ngũ (TT50)
  PRE_CHECK_PASSED = 'SO_KHAM_DAT', // Đạt sơ khám
  PRE_CHECK_FAILED = 'SO_KHAM_KHONG_DAT', // Không đạt sơ khám
  MED_EXAM_PASSED = 'KHAM_TUYEN_DAT', // Đạt khám tuyển
  MED_EXAM_FAILED = 'KHAM_TUYEN_KHONG_DAT', // Không đạt khám tuyển
  FINALIZED = 'BINH_CU_CONG_KHAI', // Danh sách bình cử công khai / Chốt hồ sơ
  ENLISTED = 'NHAP_NGU', // Đã chốt và phát lệnh nhập ngũ
  DEFERRED = 'TAM_HOAN', // Tạm hoãn
  EXEMPTED = 'MIEN_KHAM', // Miễn làm NVQS (Khác với miễn đăng ký)
  REMOVED_FROM_SOURCE = 'LOAI_KHOI_NGUON', // Đã loại khỏi nguồn (Soft delete)
  DELETED = 'DA_XOA' // 15. Đã xóa (Thùng rác)
}

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER' | 'PROVINCE_ADMIN';

export interface User {
  username: string;
  fullName: string; // Tên đơn vị (VD: Ban CHQS Xã Mỹ Hòa Hưng)
  personalName?: string; // Họ và tên cán bộ
  rank?: string; // Cấp bậc
  position?: string; // Chức vụ
  email?: string; // Email
  phoneNumber?: string; // Số điện thoại cán bộ
  password?: string;
  role: UserRole;
  unit: {
    province: string;
    commune: string;
  };
  isLocked?: boolean; // Mặc định true cho tài khoản mới
  isApproved?: boolean;
}

export interface Feedback {
    id: string;
    username: string;
    unitName: string;
    content: string;
    timestamp: number;
    isRead: boolean;
    reply?: string;
    replyTimestamp?: number;
}

export interface FamilyMember {
  fullName: string;
  birthYear?: string;
  job: string;
  phoneNumber: string;
}

export interface RecruitAttachment {
  name: string;
  url: string;
  type: string;
  uploadDate: string;
}

export interface Recruit {
  id: string;
  citizenId: string;
  fullName: string;
  dob: string;
  phoneNumber: string;
  avatarUrl?: string;
  address: {
    province: string;
    commune: string;
    village: string;
    street?: string;
  };
  hometown: {
    province: string;
    commune: string;
    village: string;
  };
  physical: {
    height: number;
    weight: number;
    bmi: number;
    healthGrade?: number;
  };
  details: {
    education: string;
    educationPeriod?: string;
    ethnicity: string;
    religion: string;
    maritalStatus: string;
    job: string;
    politicalStatus: 'None' | 'Doan_Vien' | 'Dang_Vien';
    partyEntryDate?: string;
    gifted?: string;
  };
  family: {
    father: FamilyMember;
    mother: FamilyMember;
    wife?: FamilyMember;
    children?: string;
  };
  status: RecruitmentStatus;
  previousStatus?: RecruitmentStatus;
  previousDefermentReason?: string;
  defermentReason?: string;
  defermentProof?: string;
  enlistmentUnit?: string;
  enlistmentDate?: string;
  enlistmentType?: 'OFFICIAL' | 'RESERVE';
  recruitmentYear: number;
  attachments?: RecruitAttachment[];
  createdAt?: string;
  updatedAt?: string;
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

export interface ResearchDocument {
  id: string;
  title: string;
  description?: string;
  url: string;
  uploadDate: string;
  fileType: 'WORD' | 'PDF' | 'EXCEL' | 'OTHER';
  category?: 'LUAT' | 'NGHI_DINH' | 'THONG_TU' | 'HUONG_DAN' | 'QUYET_DINH' | 'KHAC';
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}
