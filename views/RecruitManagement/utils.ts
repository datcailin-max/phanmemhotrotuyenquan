
import { Recruit, RecruitmentStatus } from '../../types';
import { LEGAL_DEFERMENT_REASONS } from '../../constants';

export const checkAge = (r: Recruit, sessionYear: number) => {
  const birthYear = parseInt(r.dob?.split('-')[0] || '0');
  // Năm thực hiện là sessionYear - 1
  return (sessionYear - 1) - birthYear;
};

export const isExpiredInSession = (period: string | undefined, sessionYear: number) => {
  if (!period) return false;
  const parts = period.split('-');
  const lastPart = parts[parts.length - 1].trim();
  const yearStr = lastPart.includes('/') ? lastPart.split('/').pop() : lastPart;
  const endYear = parseInt(yearStr || '0');
  return endYear > 0 && endYear < sessionYear;
};

export const isTotalSource = (r: Recruit, sessionYear: number) => {
  if ([
      RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
      RecruitmentStatus.EXEMPT_REGISTRATION,
      RecruitmentStatus.FIRST_TIME_REGISTRATION,
      RecruitmentStatus.DELETED
  ].includes(r.status)) return false;
  
  const age = checkAge(r, sessionYear);
  if (r.status === RecruitmentStatus.SOURCE && age < 18) return false;
  
  return true;
};

export const isRecruitInTab = (r: Recruit, tabId: string, sessionYear: number): boolean => {
  const tt50Statuses = [
    RecruitmentStatus.NOT_SELECTED_TT50, 
    RecruitmentStatus.KTC_KHONG_TUYEN_CHON, 
    RecruitmentStatus.KTC_CHUA_GOI_NHAP_NGU
  ];

  const reason = r.defermentReason || '';

  switch (tabId) {
    case 'NOT_ALLOWED_REG':
      return r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION;

    case 'EXEMPT_REG':
      return r.status === RecruitmentStatus.EXEMPT_REGISTRATION;

    case 'FIRST_TIME_REG':
      return r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION;

    case 'ALL':
      return isTotalSource(r, sessionYear);

    case 'TT50':
      return tt50Statuses.includes(r.status);

    case 'KTC_SUB1':
      return [RecruitmentStatus.NOT_SELECTED_TT50, RecruitmentStatus.KTC_KHONG_TUYEN_CHON].includes(r.status);

    case 'KTC_SUB2':
      return r.status === RecruitmentStatus.KTC_CHUA_GOI_NHAP_NGU;

    case 'PRE_CHECK':
      return isTotalSource(r, sessionYear) && ![
        ...tt50Statuses,
        RecruitmentStatus.DEFERRED, 
        RecruitmentStatus.EXEMPTED,
        RecruitmentStatus.REMOVED_FROM_SOURCE
      ].includes(r.status);

    case 'PRE_CHECK_PASS':
      return isTotalSource(r, sessionYear) && [
        RecruitmentStatus.PRE_CHECK_PASSED, 
        RecruitmentStatus.MED_EXAM_PASSED, 
        RecruitmentStatus.MED_EXAM_FAILED, 
        RecruitmentStatus.FINALIZED, 
        RecruitmentStatus.ENLISTED
      ].includes(r.status);

    case 'PRE_CHECK_FAIL':
      return isTotalSource(r, sessionYear) && r.status === RecruitmentStatus.PRE_CHECK_FAILED;

    case 'MED_EXAM':
      return isTotalSource(r, sessionYear) && [
        RecruitmentStatus.PRE_CHECK_PASSED, 
        RecruitmentStatus.MED_EXAM_PASSED, 
        RecruitmentStatus.MED_EXAM_FAILED, 
        RecruitmentStatus.FINALIZED, 
        RecruitmentStatus.ENLISTED
      ].includes(r.status);

    case 'MED_EXAM_PASS':
      return isTotalSource(r, sessionYear) && [
        RecruitmentStatus.MED_EXAM_PASSED, 
        RecruitmentStatus.FINALIZED, 
        RecruitmentStatus.ENLISTED
      ].includes(r.status);

    case 'MED_EXAM_FAIL':
      return isTotalSource(r, sessionYear) && r.status === RecruitmentStatus.MED_EXAM_FAILED;

    case 'DEFERRED_LIST':
      return r.status === RecruitmentStatus.DEFERRED;

    case 'DEFERRED_HEALTH':
      if (r.status !== RecruitmentStatus.DEFERRED) return false;
      return reason === LEGAL_DEFERMENT_REASONS[0] || 
             reason.startsWith('1.') || 
             reason.toLowerCase().includes('sức khỏe') || 
             reason.toLowerCase().includes('sức khoẻ');

    case 'DEFERRED_EDUCATION':
      if (r.status !== RecruitmentStatus.DEFERRED) return false;
      return reason === LEGAL_DEFERMENT_REASONS[6] || 
             reason === LEGAL_DEFERMENT_REASONS[8] || 
             reason.startsWith('7.') || 
             reason.startsWith('9.') || 
             reason.toLowerCase().includes('học') || 
             reason.toLowerCase().includes('giáo dục');

    case 'DEFERRED_POLICY':
      if (r.status !== RecruitmentStatus.DEFERRED) return false;
      const policyReasons = [
        LEGAL_DEFERMENT_REASONS[1], 
        LEGAL_DEFERMENT_REASONS[2], 
        LEGAL_DEFERMENT_REASONS[3], 
        LEGAL_DEFERMENT_REASONS[4], 
        LEGAL_DEFERMENT_REASONS[5]
      ];
      return policyReasons.includes(reason) || 
             reason.startsWith('2.') || 
             reason.startsWith('3.') || 
             reason.startsWith('4.') || 
             reason.startsWith('5.') || 
             reason.startsWith('6.') || 
             reason.toLowerCase().includes('lao động') || 
             reason.toLowerCase().includes('chính sách') || 
             reason.toLowerCase().includes('thương binh') || 
             reason.toLowerCase().includes('liệt sĩ');

    case 'DEFERRED_DQTT':
      if (r.status !== RecruitmentStatus.DEFERRED) return false;
      return reason === LEGAL_DEFERMENT_REASONS[7] || 
             reason.startsWith('8.') || 
             reason.includes('DQTT') || 
             reason.toLowerCase().includes('dân quân');

    case 'EXEMPTED_LIST':
      return r.status === RecruitmentStatus.EXEMPTED;

    case 'FINAL':
      return [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status);

    case 'FINAL_OFFICIAL':
      return [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status) && r.enlistmentType === 'OFFICIAL';

    case 'FINAL_RESERVE':
      return [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status) && r.enlistmentType === 'RESERVE';

    case 'ENLISTED':
      return r.status === RecruitmentStatus.ENLISTED && r.enlistmentType === 'OFFICIAL';

    case 'REMOVED':
      return r.status === RecruitmentStatus.REMOVED_FROM_SOURCE;

    case 'REMAINING':
      if (!isTotalSource(r, sessionYear)) return false;
      if (r.status === RecruitmentStatus.REMOVED_FROM_SOURCE) return false;
      const isEnlistedOfficialRem = (r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL';
      return !isEnlistedOfficialRem;

    case 'NEXT_YEAR_SOURCE':
      if (r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION) return true;
      if (!isTotalSource(r, sessionYear)) return false;
      if (r.status === RecruitmentStatus.REMOVED_FROM_SOURCE) return false;
      const isEnlistedOfficialNext = (r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL';
      return !isEnlistedOfficialNext;

    case 'DELETED_LIST':
      return r.status === RecruitmentStatus.DELETED;

    case 'EXPIRING_LIST':
      return isTotalSource(r, sessionYear) && (
        (r.status === RecruitmentStatus.DEFERRED && isExpiredInSession(r.details?.educationPeriod, sessionYear)) ||
        (r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION && isExpiredInSession(r.details?.sentencePeriod, sessionYear))
      );

    case 'EXPIRING_EDU':
      return r.status === RecruitmentStatus.DEFERRED && isExpiredInSession(r.details?.educationPeriod, sessionYear);

    case 'EXPIRING_SENTENCE':
      return r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION && isExpiredInSession(r.details?.sentencePeriod, sessionYear);

    default:
      return true;
  }
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
