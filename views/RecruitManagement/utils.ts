
import { Recruit, RecruitmentStatus } from '../../types';

export const checkAge = (r: Recruit, sessionYear: number) => {
  const birthYear = parseInt(r.dob.split('-')[0] || '0');
  // Năm thực hiện là sessionYear - 1
  return (sessionYear - 1) - birthYear;
};

export const getStatusLabel = (status: RecruitmentStatus) => {
    switch (status) {
        case RecruitmentStatus.NOT_ALLOWED_REGISTRATION: return 'Cấm ĐK';
        case RecruitmentStatus.EXEMPT_REGISTRATION: return 'Miễn ĐK';
        case RecruitmentStatus.FIRST_TIME_REGISTRATION: return 'ĐK Lần đầu';
        case RecruitmentStatus.SOURCE: return 'Nguồn';
        case RecruitmentStatus.NOT_SELECTED_TT50: return 'KTC, CGNN';
        case RecruitmentStatus.KTC_KHONG_TUYEN_CHON: return 'Không tuyển chọn';
        case RecruitmentStatus.KTC_CHUA_GOI_NHAP_NGU: return 'Chưa gọi nhập ngũ';
        case RecruitmentStatus.PRE_CHECK_PASSED: return 'Đạt sơ tuyển';
        case RecruitmentStatus.PRE_CHECK_FAILED: return 'Không đạt sơ tuyển';
        case RecruitmentStatus.MED_EXAM_PASSED: return 'Đạt';
        case RecruitmentStatus.MED_EXAM_FAILED: return 'Không đạt khám tuyển';
        case RecruitmentStatus.FINALIZED: return 'Chốt hồ sơ';
        case RecruitmentStatus.ENLISTED: return 'Nhập ngũ';
        case RecruitmentStatus.DEFERRED: return 'Tạm hoãn';
        case RecruitmentStatus.EXEMPTED: return 'Miễn gọi';
        case RecruitmentStatus.REMOVED_FROM_SOURCE: return 'Đưa ra khỏi nguồn';
        case RecruitmentStatus.DELETED: return 'Đã xóa';
        default: return status;
    }
};

export const getStatusColor = (status: RecruitmentStatus) => {
    switch (status) {
        case RecruitmentStatus.MED_EXAM_PASSED:
            return 'bg-green-50 text-green-700 border-green-200';
        case RecruitmentStatus.MED_EXAM_FAILED:
            return 'bg-orange-50 text-orange-700 border-orange-200';
        case RecruitmentStatus.FINALIZED:
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case RecruitmentStatus.ENLISTED:
            return 'bg-red-50 text-red-700 border-red-200';
        case RecruitmentStatus.DEFERRED:
            return 'bg-amber-50 text-amber-700 border-amber-200';
        case RecruitmentStatus.FIRST_TIME_REGISTRATION:
            return 'bg-cyan-50 text-cyan-700 border-cyan-200';
        case RecruitmentStatus.KTC_KHONG_TUYEN_CHON:
        case RecruitmentStatus.KTC_CHUA_GOI_NHAP_NGU:
            return 'bg-slate-100 text-slate-700 border-slate-300';
        case RecruitmentStatus.DELETED:
            return 'bg-gray-100 text-gray-500 border-gray-300 line-through';
        default:
            return 'bg-gray-50 text-gray-600 border-gray-200';
    }
};
