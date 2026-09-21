
import { Recruit, RecruitmentStatus } from '../../types';
import { LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS } from '../../constants';

export const isSpecialJanCitizen = (r: { dob?: string }, sessionYear: number): boolean => {
  if (!r || !r.dob) return false;
  let birthYear = 0;
  let birthMonth = 0;
  if (r.dob.includes('-')) {
    const parts = r.dob.split('-');
    birthYear = parseInt(parts[0] || '0');
    birthMonth = parseInt(parts[1] || '0');
  } else if (r.dob.includes('/')) {
    const parts = r.dob.split('/');
    birthMonth = parseInt(parts[1] || '0');
    birthYear = parseInt(parts[2] || '0');
  }
  return birthYear === (sessionYear - 17) && birthMonth === 1;
};

export const hasExemptionReason = (r: { defermentReason?: string; legalReason?: string; notes?: string }): boolean => {
  const reason = [r.defermentReason, r.legalReason, r.notes].filter(Boolean).join(' ').trim().toLowerCase();
  if (!reason || reason === '---' || reason === 'không') return false;
  return (
    reason.includes('miễn gọi') ||
    reason.includes('con liệt sĩ') ||
    reason.includes('con thương binh hạng một') ||
    reason.includes('con thương binh hạng 1') ||
    reason.includes('con thương binh hạng hai') ||
    reason.includes('con thương binh hạng 2') ||
    LEGAL_EXEMPTION_REASONS.some(ex => reason.includes(ex.toLowerCase()))
  );
};

export const isRealDefermentReason = (str?: string): boolean => {
  if (!str) return false;
  const lower = str.toLowerCase().trim();
  if (!lower || lower === '---' || lower === 'không' || lower === 'chưa có' || lower === 'bình thường' || lower === 'không nghề nghiệp') return false;

  // Cụm từ thông thường không phải là lý do tạm hoãn (nghề nghiệp, dân tộc, gia cảnh, địa chỉ, đoàn thể...)
  const nonDefermentPhrases = [
    'lao động tự do', 'nông dân', 'công nhân', 'buôn bán', 'làm vườn', 'kinh doanh',
    'trung nông', 'bần nông', 'phụ thuộc', 'kinh', 'thất nghiệp', 'phụ giúp gia đình',
    'đoàn viên', 'đảng viên', 'độc thân', 'ấp mỹ an', 'thôn lộc thuận'
  ];
  if (nonDefermentPhrases.includes(lower)) return false;

  // Kiểm tra trùng khớp với danh sách lý do tạm hoãn theo luật
  if (LEGAL_DEFERMENT_REASONS.some(r => lower.includes(r.toLowerCase()))) return true;

  // Từ khóa chỉ lý do tạm hoãn thực tế
  const defermentKeywords = [
    'tạm hoãn', 'hoãn gọi', 'đang học', 'sinh viên', 'đang theo học', 'đang đào tạo',
    'niên khóa', 'niên khoá', 'khóa học', 'khoá học',
    'dqtt', 'dân quân thường trực',
    'sức khỏe', 'sức khoẻ', 'chữa bệnh', 'lao động duy nhất', 'nuôi dưỡng',
    'da cam', 'bệnh binh', 'thương binh', 'liệt sĩ', 'di dân', 'đặc biệt khó khăn', 'hộ nghèo',
    'loại 3', 'loại 4', 'loại 5', 'loại 6', 'loai 3', 'loai 4', 'loai 5', 'loai 6',
    'loại sơ tuyển', 'khám loại', 'sơ tuyển loại', 'bmi', 'chiều cao', 'cân nặng', 'thể lực', 'vòng ngực',
    'cận thị', 'viễn thị', 'loạn thị', 'khúc xạ', 'tật khúc xạ', 'răng', 'khớp cắn', 'tai mũi họng',
    'huyết áp', 'tim mạch', 'xquang', 'vẹo cột sống', 'chấn thương', 'phẫu thuật', 'điều trị',
    'hvt', 'học vấn thấp', 'hoc van thap', 'dưới lớp 8', 'duoi lop 8', 'văn hóa thấp', 'van hoa thap',
    'hoãn học vấn', 'hoãn sức khỏe', 'hoãn chính sách'
  ];

  if (/\bhvt\b/i.test(str)) return true;

  return defermentKeywords.some(kw => lower.includes(kw));
};

export const hasDefermentReason = (r: { defermentReason?: string; legalReason?: string; notes?: string }): boolean => {
  const reason = [r.defermentReason, r.legalReason, r.notes].filter(Boolean).join(' ').trim();
  if (!reason || reason === '---' || reason.toLowerCase() === 'không') return false;
  if (hasExemptionReason(r)) return false;
  return isRealDefermentReason(reason);
};

export const isRecruitDeferred = (r: Recruit, sessionYear: number): boolean => {
  const isSpecialJan = isSpecialJanCitizen(r, sessionYear);
  if (checkAge(r, sessionYear) < 18 && !isSpecialJan) return false;
  if (r.status === RecruitmentStatus.DEFERRED) return true;
  if (
    r.status === RecruitmentStatus.EXEMPTED || 
    r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || 
    r.status === RecruitmentStatus.EXEMPT_REGISTRATION || 
    r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION || 
    r.status === RecruitmentStatus.NOT_SELECTED_TT50 ||
    r.status === RecruitmentStatus.KTC_KHONG_TUYEN_CHON ||
    r.status === RecruitmentStatus.KTC_CHUA_GOI_NHAP_NGU ||
    r.status === RecruitmentStatus.REMOVED_FROM_SOURCE || 
    r.status === RecruitmentStatus.DELETED
  ) {
    return false;
  }
  return isTotalSource(r, sessionYear) && hasDefermentReason(r);
};

export const isRecruitExempted = (r: Recruit, sessionYear: number): boolean => {
  const isSpecialJan = isSpecialJanCitizen(r, sessionYear);
  if (checkAge(r, sessionYear) < 18 && !isSpecialJan) return false;
  if (r.status === RecruitmentStatus.EXEMPTED) return true;
  if (
    r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || 
    r.status === RecruitmentStatus.EXEMPT_REGISTRATION || 
    r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION || 
    r.status === RecruitmentStatus.REMOVED_FROM_SOURCE || 
    r.status === RecruitmentStatus.DELETED
  ) {
    return false;
  }
  return isTotalSource(r, sessionYear) && hasExemptionReason(r);
};

export const isMilitarySchoolRecruit = (r: {
  defermentReason?: string;
  legalReason?: string;
  notes?: string;
  details?: {
    workAddress?: string;
    major?: string;
    note?: string;
    job?: string;
  };
}): boolean => {
  const textParts = [
    r.defermentReason,
    r.legalReason,
    r.notes,
    r.details?.workAddress,
    r.details?.major,
    r.details?.note,
    r.details?.job
  ].filter(Boolean);

  const combinedText = textParts.join(' ').toLowerCase();
  if (!combinedText.trim()) return false;

  const militaryKeywords = [
    'quân đội', 'quan doi', 'trường qđ', 'truong qd', 'học qđ', 'hoc qd', 'trường qd', 'học qd',
    'sĩ quan', 'si quan', ' sq ', 'sq.', 'sqlq', 'sqtt', 'sqcb', 'sqph', 'sqpb', 'sqđc', 'sqktqs', 'sqkq', 'sqttg', 'sqcq',
    'quốc phòng', 'quoc phong',
    'khoa học quân sự', 'khoa hoc quan su', 'khqs',
    'kỹ thuật quân sự', 'ky thuat quan su', 'ktqs',
    'nghệ thuật quân đội', 'nghe thuat quan doi',
    'quân y', 'quan y',
    'hải quân', 'hai quan',
    'phòng không', 'phong khong', 'pkkq', 'pk-kq',
    'không quân', 'khong quan',
    'biên phòng', 'bien phong',
    'tăng - thiết giáp', 'tăng thiết giáp', 'tang thiet giap', 'ttg',
    'công binh', 'cong binh',
    'phòng hóa', 'phong hoa',
    'pháo binh', 'phao binh',
    'đặc công', 'dac cong',
    'lục quân', 'luc quan',
    'hậu cần', 'hau can',
    'trần quốc tuấn', 'tran quoc tuan',
    'nguyễn huệ', 'nguyen hue',
    'trần đại nghĩa', 'tran dai nghia',
    'đại học chính trị', 'dai hoc chinh tri',
    'học viện chính trị', 'hoc vien chinh tri',
    'học viện quốc phòng', 'hoc vien quoc phong',
    'học viện lục quân', 'hoc vien luc quan',
    'học viện hậu cần', 'hoc vien hau can',
    'học viện quân y', 'hoc vien quan y',
    'học viện khoa học quân sự', 'hoc vien khoa hoc quan su',
    'học viện hải quân', 'hoc vien hai quan',
    'học viện phòng không', 'hoc vien phong khong',
    'học viện biên phòng', 'hoc vien bien phong',
    'hv quốc phòng', 'hv quoc phong',
    'hv chính trị', 'hv chinh tri',
    'hv lục quân', 'hv luc quan',
    'hv kỹ thuật quân sự', 'hv ky thuat quan su',
    'hv hậu cần', 'hv hau can',
    'hv quân y', 'hv quan y',
    'hv khoa học quân sự', 'hv khoa hoc quan su',
    'hv hải quân', 'hv hai quan',
    'hv phòng không', 'hv phong khong',
    'hv biên phòng', 'hv bien phong'
  ];

  return militaryKeywords.some(kw => combinedText.includes(kw));
};

export const isTransferredRecruit = (r: {
  defermentReason?: string;
  legalReason?: string;
  notes?: string;
  details?: {
    workAddress?: string;
    note?: string;
  };
}): boolean => {
  const textParts = [
    r.defermentReason,
    r.legalReason,
    r.notes,
    r.details?.workAddress,
    r.details?.note
  ].filter(Boolean);

  const combinedText = textParts.join(' ').toLowerCase();

  return (
    combinedText.includes('chuyển khẩu') ||
    combinedText.includes('chuyển hộ khẩu') ||
    combinedText.includes('chuyển đi') ||
    combinedText.includes('chuyển nơi ở') ||
    combinedText.includes('chuyen khau') ||
    combinedText.includes('chuyen ho khau') ||
    combinedText.includes('chuyen di') ||
    combinedText.includes('chuyen noi o') ||
    combinedText.includes('cắt hộ khẩu') ||
    combinedText.includes('cat ho khau')
  );
};

export const checkAge = (r: Recruit, sessionYear: number) => {
  const birthYear = parseInt(r.dob?.split('-')[0] || '0');
  if (birthYear <= 0) return 0;
  // Công tác tuyển quân năm sessionYear: tuổi = sessionYear - birthYear (VD: 2026 - 2009 = 17 tuổi)
  return sessionYear - birthYear;
};

export const isEducationExpired = (r: Recruit, sessionYear: number): boolean => {
  // 1. Kiểm tra niên khóa trong details.educationPeriod
  const period = r.details?.educationPeriod;
  if (period) {
    const parts = period.split(/[-–—/]/);
    const lastPart = parts[parts.length - 1].trim();
    const yearMatch = lastPart.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const endYear = parseInt(yearMatch[1]);
      if (endYear > 0 && endYear <= sessionYear) return true;
    }
  }

  // 2. Kiểm tra niên khóa nằm trong defermentReason, legalReason, notes, details.note
  const rAny = r as any;
  const reasonText = [r.defermentReason, rAny.legalReason, rAny.notes, r.physical?.note, rAny.details?.note].filter(Boolean).join(' ');
  const periodMatch = reasonText.match(/(?:20\d{2})\s*[-–—/]\s*(20\d{2})/);
  if (periodMatch && periodMatch[1]) {
    const endYear = parseInt(periodMatch[1]);
    if (endYear > 0 && endYear <= sessionYear) return true;
  }

  // 3. Nếu đang ở trạng thái DEFERRED (Tạm hoãn) vì học vấn nhưng trình độ học vấn là Đại học, Cao đẳng, Trung cấp (đã tốt nghiệp)
  const isDeferredEducation = (r.status === RecruitmentStatus.DEFERRED || isRecruitDeferred(r, sessionYear)) && getDefermentSubCategory(r) === 'EDUCATION';
  if (isDeferredEducation) {
    const edu = r.details?.education || '';
    if (['Đại học', 'Cao đẳng', 'Trung cấp', 'Trên ĐH'].includes(edu)) {
      return true; // Đã học xong nhưng chưa đưa về nguồn xem xét
    }
  }

  return false;
};

export const isSentenceExpired = (r: Recruit, sessionYear: number): boolean => {
  const period = r.details?.sentencePeriod;
  if (period) {
    const parts = period.split(/[-–—/]/);
    const lastPart = parts[parts.length - 1].trim();
    const yearMatch = lastPart.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const endYear = parseInt(yearMatch[1]);
      if (endYear > 0 && endYear <= sessionYear) return true;
    }
  }

  const rAny = r as any;
  const text = [r.defermentReason, rAny.legalReason, rAny.notes, r.physical?.note, rAny.details?.note].filter(Boolean).join(' ');
  const periodMatch = text.match(/(?:20\d{2})\s*[-–—/]\s*(20\d{2})/);
  if (periodMatch && periodMatch[1]) {
    const endYear = parseInt(periodMatch[1]);
    if (endYear > 0 && endYear <= sessionYear) return true;
  }

  return false;
};

export const isExpiredInSession = (period: string | undefined, sessionYear: number) => {
  if (!period) return false;
  const parts = period.split(/[-–—/]/);
  const lastPart = parts[parts.length - 1].trim();
  const yearMatch = lastPart.match(/\b(20\d{2})\b/);
  const endYear = yearMatch ? parseInt(yearMatch[1]) : parseInt(lastPart || '0');
  return endYear > 0 && endYear <= sessionYear;
};

export const isTotalSource = (r: Recruit, sessionYear: number) => {
  if ([
      RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
      RecruitmentStatus.EXEMPT_REGISTRATION,
      RecruitmentStatus.FIRST_TIME_REGISTRATION,
      RecruitmentStatus.REMOVED_FROM_SOURCE,
      RecruitmentStatus.DELETED
  ].includes(r.status)) return false;
  
  const age = checkAge(r, sessionYear);
  const isSpecialJan = isSpecialJanCitizen(r, sessionYear);
  // Nếu công dân đã được đưa vào SOURCE hoặc các bước tiếp theo của nguồn (kể cả trường hợp đặc biệt 17 tuổi sinh tháng 1)
  if (r.status === RecruitmentStatus.SOURCE || isSpecialJan) return true;
  if (age < 18) return false;
  
  return true;
};

export const getDefermentSubCategory = (r: {
  defermentReason?: string;
  legalReason?: string;
  notes?: string;
  details?: {
    workAddress?: string;
    note?: string;
  };
  physical?: {
    height?: number;
    weight?: number;
    chest?: number;
    bmi?: number;
    healthGrade?: number;
  };
}): 'DQTT' | 'EDUCATION' | 'POLICY' | 'HEALTH' => {
  const reasonParts = [
    r.defermentReason,
    r.legalReason,
    r.notes,
    r.details?.note,
    r.details?.workAddress
  ].filter(Boolean);
  const text = reasonParts.join(' ').toLowerCase();

  // 1. HEALTH (8.1 - Hoãn về Sức khỏe / Thể lực / BMI / Vòng ngực / Chiều cao / Cân nặng / Bệnh tật)
  // Ưu tiên kiểm tra sức khỏe trước để tránh bị nuốt bởi lý do chính sách
  const isHealthPhysical = (
    (r.physical?.height && r.physical.height < 157) ||
    (r.physical?.weight && r.physical.weight < 43) ||
    (r.physical?.chest && r.physical.chest < 75) ||
    (r.physical?.bmi && (r.physical.bmi < 18.5 || r.physical.bmi > 29.9)) ||
    (r.physical?.healthGrade && r.physical.healthGrade >= 4)
  );

  const isHealthKeyword = (
    r.defermentReason === LEGAL_DEFERMENT_REASONS[0] ||
    text.startsWith('1.') ||
    text.includes('điều 41.1.a') ||
    text.includes('khoản 1 điểm a') ||
    text.includes('chưa đủ sức khỏe') ||
    text.includes('chua du suc khoe') ||
    text.includes('sức khỏe') ||
    text.includes('sức khoẻ') ||
    text.includes('suc khoe') ||
    text.includes('thể lực') ||
    text.includes('the luc') ||
    text.includes('bmi') ||
    text.includes('chiều cao') ||
    text.includes('chieu cao') ||
    text.includes('cân nặng') ||
    text.includes('can nang') ||
    text.includes('vòng ngực') ||
    text.includes('vong nguc') ||
    text.includes('lồng ngực') ||
    text.includes('loại 3') ||
    text.includes('loại 4') ||
    text.includes('loại 5') ||
    text.includes('loại 6') ||
    text.includes('loai 3') ||
    text.includes('loai 4') ||
    text.includes('loai 5') ||
    text.includes('loai 6') ||
    text.includes('cận thị') ||
    text.includes('viễn thị') ||
    text.includes('loạn thị') ||
    text.includes('khúc xạ') ||
    text.includes('tai mũi họng') ||
    text.includes('răng hàm mặt') ||
    text.includes('tim mạch') ||
    text.includes('huyết áp') ||
    text.includes('xquang') ||
    text.includes('vẹo cột sống') ||
    text.includes('phẫu thuật') ||
    text.includes('chấn thương') ||
    text.includes('điều trị bệnh') ||
    text.includes('chữa bệnh')
  );

  if (isHealthPhysical || isHealthKeyword) {
    return 'HEALTH';
  }

  // 2. DQTT (8.4 - Hoãn về Dân quân thường trực)
  if (
    text.includes('dqtt') ||
    text.includes('dân quân thường trực') ||
    text.includes('dan quan thuong truc') ||
    text.startsWith('8.') ||
    text.includes('điều 41.1.h') ||
    text.includes('khoản 1 điểm h') ||
    r.defermentReason === LEGAL_DEFERMENT_REASONS[7]
  ) {
    return 'DQTT';
  }

  // 3. EDUCATION (8.2 - Hoãn về học vấn / Cơ sở giáo dục)
  if (
    text.includes('đang học') ||
    text.includes('dang hoc') ||
    text.includes('học sinh') ||
    text.includes('sinh viên') ||
    text.includes('đại học') ||
    text.includes('dai hoc') ||
    text.includes('cao đẳng') ||
    text.includes('cao dang') ||
    text.includes('trung cấp') ||
    text.includes('trung cap') ||
    text.includes('học viện') ||
    text.includes('hoc vien') ||
    text.includes('đào tạo') ||
    text.includes('dao tao') ||
    text.includes('phổ thông') ||
    text.includes('thpt') ||
    text.includes('thcs') ||
    text.includes('niên khóa') ||
    text.includes('niên khoá') ||
    text.includes('khóa học') ||
    text.includes('khoá học') ||
    text.includes('giáo dục') ||
    text.includes('du học') ||
    text.includes('bổ túc') ||
    text.includes('hvt') ||
    text.includes('học vấn thấp') ||
    text.includes('hoc van thap') ||
    text.includes('dưới lớp 8') ||
    text.includes('duoi lop 8') ||
    text.includes('văn hóa thấp') ||
    text.includes('van hoa thap') ||
    text.startsWith('7.') ||
    text.startsWith('9.') ||
    text.includes('điều 41.1.g') ||
    text.includes('khoản 1 điểm g') ||
    r.defermentReason === LEGAL_DEFERMENT_REASONS[6] ||
    r.defermentReason === LEGAL_DEFERMENT_REASONS[8]
  ) {
    return 'EDUCATION';
  }

  // 4. POLICY (8.3 - Hoãn về chính sách / Gia cảnh / Thân nhân)
  const policyReasons = [
    LEGAL_DEFERMENT_REASONS[1], 
    LEGAL_DEFERMENT_REASONS[2], 
    LEGAL_DEFERMENT_REASONS[3], 
    LEGAL_DEFERMENT_REASONS[4], 
    LEGAL_DEFERMENT_REASONS[5]
  ];
  if (
    policyReasons.includes(r.defermentReason || '') ||
    text.includes('lao động duy nhất') ||
    text.includes('lao dong duy nhat') ||
    text.includes('nuôi dưỡng') ||
    text.includes('nuoi duong') ||
    text.includes('chính sách') ||
    text.includes('chinh sach') ||
    text.includes('thương binh') ||
    text.includes('thuong binh') ||
    text.includes('bệnh binh') ||
    text.includes('benh binh') ||
    text.includes('liệt sĩ') ||
    text.includes('liet si') ||
    text.includes('da cam') ||
    text.includes('chất độc') ||
    text.includes('di dân') ||
    text.includes('giãn dân') ||
    text.includes('đặc biệt khó khăn') ||
    text.includes('hộ nghèo') ||
    text.includes('cận nghèo') ||
    text.includes('anh trai đang tại ngũ') ||
    text.includes('em trai đang tại ngũ') ||
    text.includes('anh ruột') ||
    text.includes('em ruột') ||
    text.includes('chị ruột') ||
    text.includes('thanh niên xung phong') ||
    text.includes('mồ côi') ||
    text.includes('con một') ||
    text.includes('con duy nhất') ||
    text.startsWith('2.') ||
    text.startsWith('3.') ||
    text.startsWith('4.') ||
    text.startsWith('5.') ||
    text.startsWith('6.') ||
    text.includes('l1.') ||
    text.includes('l2.')
  ) {
    return 'POLICY';
  }

  // Mặc định còn lại
  return 'HEALTH';
};

export const isRecruitInTab = (r: Recruit, tabId: string, sessionYear: number): boolean => {
  // Loại bỏ tuyệt đối công dân đã xóa hoặc đã đưa ra khỏi nguồn ở các danh sách không thuộc phạm vi
  if (tabId !== 'DELETED_LIST' && r.status === RecruitmentStatus.DELETED) {
    return false;
  }
  if (!tabId.startsWith('REMOVED') && r.status === RecruitmentStatus.REMOVED_FROM_SOURCE) {
    return false;
  }

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

    case 'FIRST_TIME_REG': {
      const isSpecialJan = isSpecialJanCitizen(r, sessionYear);
      // Nếu là trường hợp sinh tháng 1 đã được đưa vào nguồn hoặc các bước tiếp theo, không còn nằm ở DS 3
      if (isSpecialJan && r.status !== RecruitmentStatus.FIRST_TIME_REGISTRATION) {
        return false;
      }
      const age = checkAge(r, sessionYear);
      if (age < 18 && ![
        RecruitmentStatus.NOT_ALLOWED_REGISTRATION,
        RecruitmentStatus.EXEMPT_REGISTRATION,
        RecruitmentStatus.REMOVED_FROM_SOURCE,
        RecruitmentStatus.DELETED,
        RecruitmentStatus.SOURCE
      ].includes(r.status)) {
        return true;
      }
      return r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION;
    }

    case 'SPECIAL_JAN_17': {
      if (r.status === RecruitmentStatus.DELETED) return false;
      return isSpecialJanCitizen(r, sessionYear);
    }

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
      ].includes(r.status) && !hasDefermentReason(r) && !hasExemptionReason(r);

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
      return isRecruitDeferred(r, sessionYear);

    case 'DEFERRED_HEALTH':
      return isRecruitDeferred(r, sessionYear) && getDefermentSubCategory(r) === 'HEALTH';

    case 'DEFERRED_EDUCATION':
      return isRecruitDeferred(r, sessionYear) && getDefermentSubCategory(r) === 'EDUCATION';

    case 'DEFERRED_POLICY':
      return isRecruitDeferred(r, sessionYear) && getDefermentSubCategory(r) === 'POLICY';

    case 'DEFERRED_DQTT':
      return isRecruitDeferred(r, sessionYear) && getDefermentSubCategory(r) === 'DQTT';

    case 'EXEMPTED_LIST':
      return isRecruitExempted(r, sessionYear);

    case 'FINAL':
      return [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status);

    case 'FINAL_OFFICIAL':
      return [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status) && r.enlistmentType !== 'RESERVE';

    case 'FINAL_RESERVE':
      return [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status) && r.enlistmentType === 'RESERVE';

    case 'ENLISTED':
      return r.status === RecruitmentStatus.ENLISTED && r.enlistmentType !== 'RESERVE';

    case 'REMOVED':
      return r.status === RecruitmentStatus.REMOVED_FROM_SOURCE;

    case 'REMOVED_MILITARY_SCHOOL': {
      if (r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE) return false;
      return isMilitarySchoolRecruit(r);
    }

    case 'REMOVED_TRANSFERRED': {
      if (r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE) return false;
      return !isMilitarySchoolRecruit(r) && isTransferredRecruit(r);
    }

    case 'REMOVED_OTHER': {
      if (r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE) return false;
      return !isMilitarySchoolRecruit(r) && !isTransferredRecruit(r);
    }

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
      return (
        (r.status === RecruitmentStatus.DEFERRED && isEducationExpired(r, sessionYear)) ||
        (r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION && isSentenceExpired(r, sessionYear))
      );

    case 'EXPIRING_EDU':
      return (r.status === RecruitmentStatus.DEFERRED || isRecruitDeferred(r, sessionYear)) && isEducationExpired(r, sessionYear);

    case 'EXPIRING_SENTENCE':
      return r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION && isSentenceExpired(r, sessionYear);

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
