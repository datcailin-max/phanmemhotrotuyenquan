
export enum RecruitmentStatus {
  NOT_ALLOWED_REGISTRATION = 'KHONG_DUOC_DANG_KY', // 1. Không được đăng ký NVQS
  EXEMPT_REGISTRATION = 'MIEN_DANG_KY', // 2. Miễn đăng ký NVQS
  SOURCE = 'NGUON', // Nguồn công dân (Mới nhập) / Đăng ký lần đầu
  NOT_SELECTED_TT50 = 'KHONG_TUYEN_CHON_TT50', // Không tuyển chọn, chưa gọi nhập ngũ (TT50)
  PRE_CHECK_PASSED = 'SO_KHAM_DAT', // Đạt sơ khám
  PRE_CHECK_FAILED = 'SO_KHAM_KHONG_DAT', // Không đạt sơ khám
  MED_EXAM_PASSED = 'KHAM_TUYEN_DAT', // Đạt khám tuyển
  MED_EXAM_FAILED = 'KHAM_TUYEN_KHONG_DAT', // Không đạt khám tuyển
  FINALIZED = 'BINH_CU_CONG_KHAI', // Danh sách bình cử công khai / Chốt hồ sơ
  ENLISTED = 'NHAP_NGU', // Đã chốt và phát lệnh nhập ngũ
  DEFERRED = 'TAM_HOAN', // Tạm hoãn
  EXEMPTED = 'MIEN_KHAM', // Miễn làm NVQS (Khác với miễn đăng ký)
  REMOVED_FROM_SOURCE = 'LOAI_KHOI_NGUON' // Đã loại khỏi nguồn (Soft delete)
}

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER' | 'PROVINCE_ADMIN';

export interface User {
  username: string;
  fullName: string; // Tên hiển thị (thường là đơn vị)
  personalName?: string; // Họ và tên người đăng ký
  position?: string; // Chức vụ
  phoneNumber?: string; // Số điện thoại
  password?: string;
  role: UserRole;
  unit: {
    province: string;
    commune: string; // Nếu là cấp Tỉnh thì commune để trống
  };
  pendingPassword?: string; // Mật khẩu mới đang chờ duyệt (Đổi MK)
  resetRequested?: boolean; // Yêu cầu cấp lại mật khẩu (Quên MK)
  isLocked?: boolean; // Vô hiệu hóa nhập dữ liệu
  isApproved?: boolean; // Đã được Admin duyệt hay chưa
}

export interface Feedback {
    id: string;
    username: string;
    unitName: string;
    content: string;
    timestamp: number;
    isRead: boolean;
    reply?: string; // Nội dung trả lời của Admin
    replyTimestamp?: number; // Thời gian trả lời
}

export interface FamilyMember {
  fullName: string;
  birthYear?: string; // Năm sinh
  job: string; // Nhập tay
  phoneNumber: string;
}

export interface RecruitAttachment {
  name: string;
  url: string; // Base64 string
  type: string; // 'application/pdf'
  uploadDate: string;
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
    educationPeriod?: string; // Niên khóa (ví dụ: 2020-2022)
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
  defermentReason?: string; // Lý do tạm hoãn, miễn HOẶC lý do không đạt sức khỏe
  defermentProof?: string; // Văn bản chứng minh (cho lý do chính sách)
  enlistmentUnit?: string; // Đơn vị nhập ngũ (khi đã chốt)
  enlistmentDate?: string; // Ngày nhập ngũ
  enlistmentType?: 'OFFICIAL' | 'RESERVE'; // 'OFFICIAL': Chính thức, 'RESERVE': Dự bị
  recruitmentYear: number;
  attachments?: RecruitAttachment[]; // Giấy tờ kèm theo (PDF)
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
  description?: string; // Mô tả/Trích yếu văn bản
  url: string; // Trong thực tế là link file, ở demo có thể là mock url
  uploadDate: string;
  fileType: 'WORD' | 'PDF' | 'EXCEL' | 'OTHER';
  category?: 'LUAT' | 'NGHI_DINH' | 'THONG_TU' | 'HUONG_DAN' | 'QUYET_DINH' | 'KHAC'; // Phân loại văn bản
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}
