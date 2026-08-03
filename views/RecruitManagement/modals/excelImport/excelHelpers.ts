import { RecruitmentStatus } from '../../../../types';

// Trạng thái mặc định của công dân khi nhập vào dựa theo danh sách/tab hiện tại
export const getDefaultStatusForTab = (tabId: string): RecruitmentStatus => {
  switch (tabId) {
    case 'NOT_ALLOWED_REG':
      return RecruitmentStatus.NOT_ALLOWED_REGISTRATION;
    case 'EXEMPT_REG':
      return RecruitmentStatus.EXEMPT_REGISTRATION;
    case 'FIRST_TIME_REG':
      return RecruitmentStatus.FIRST_TIME_REGISTRATION;
    case 'PRE_CHECK_MANAGEMENT':
    case 'PRE_CHECK_LIST':
      return RecruitmentStatus.SOURCE;
    case 'HEALTH_CHECK':
      return RecruitmentStatus.PRE_CHECK_PASSED;
    case 'DEFERRED_EXEMPTED':
      return RecruitmentStatus.DEFERRED;
    case 'ENLISTMENT_LIST':
      return RecruitmentStatus.FINALIZED;
    case 'ENLISTED_LIST':
      return RecruitmentStatus.ENLISTED;
    case 'AGE_17':
      return RecruitmentStatus.FIRST_TIME_REGISTRATION;
    default:
      return RecruitmentStatus.FIRST_TIME_REGISTRATION;
  }
};

// Trích xuất ngày sinh từ chuỗi hoặc số
export const parseExcelDate = (val: any): string => {
  if (!val) return '';
  
  if (typeof val === 'number') {
    const date = new Date((val - (25567 + 2)) * 86400 * 1000);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const str = String(val).trim();

  // Dạng DD/MM/YYYY hoặc DD-MM-YYYY
  const ddmmyyyy = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (ddmmyyyy) {
    const dd = ddmmyyyy[1].padStart(2, '0');
    const mm = ddmmyyyy[2].padStart(2, '0');
    const yyyy = ddmmyyyy[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // Dạng YYYY-MM-DD
  const yyyymmdd = str.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (yyyymmdd) {
    const yyyy = yyyymmdd[1];
    const mm = yyyymmdd[2].padStart(2, '0');
    const dd = yyyymmdd[3].padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Chỉ nhập năm sinh (ví dụ: 2005)
  const yearOnly = str.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearOnly) {
    return `${yearOnly[1]}-01-01`;
  }

  return '';
};

// Trích xuất số CCCD từ ô dữ liệu
export const extractCCCD = (str: string): string => {
  if (!str) return '';
  const match = str.match(/(?:cccd|cmnd|số|đdcn|id)?\s*:?\s*(\d{9,12})\b/i) || str.match(/\b(\d{9,12})\b/);
  return match ? match[1] : '';
};

// Tự động làm sạch và chuẩn hóa Họ tên công dân
export const sanitizeName = (str: string): string => {
  if (!str) return '';
  let cleaned = str
    .replace(/[\x00-\x1F\x7F-\x9F\uFFFD]/g, '') // Bỏ ký tự điều khiển & replacement character
    .replace(/\?\?\?/g, '')
    .replace(/ï¿½/g, '')
    .replace(/[@#$%^&*=+_<>\\\/~`]/g, '') // Bỏ ký tự đặc biệt rác
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.toUpperCase();
};

// Trích xuất Họ tên công dân chính chủ từ dòng text
export const extractNameFromCell = (cellText: string): string => {
  if (!cellText) return '';
  const lines = cellText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    // Bỏ qua dòng tiêu đề phụ hoặc dòng thông tin thân nhân / nhãn tiêu đề
    if (/cccd|cmnd|căn cước|định danh|ngày sinh|năm sinh|số thẻ|thẻ căn cước|số|loại|thôn|ấp|xã|cha:|mẹ:|vợ:|con:|họ, chữ đệm|họ và tên|khai sinh/i.test(lower)) continue;
    if (/\b\d{9,12}\b/.test(line)) continue;
    if (/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b/.test(line)) continue;
    
    if (/[a-zA-Zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ\s]{2,}/i.test(line)) {
      return sanitizeName(line);
    }
  }

  const firstClean = sanitizeName(lines[0] || '');
  if (/căn cước|cccd|ngày sinh|định danh|số thẻ|họ và tên|họ, chữ đệm/i.test(firstClean.toLowerCase())) {
    return '';
  }
  return firstClean;
};

// Kiểm tra cảnh báo font chữ, mã hóa UTF-8 hoặc chính tả (Không chặn nhập dữ liệu)
export const checkFontWarning = (str: string): { isWarning: boolean; detail?: string } => {
  if (!str) return { isWarning: false };

  // Ký tự đè / replacement character / ??? / ï¿½
  if (/\uFFFD/.test(str) || str.includes('???') || str.includes('ï¿½')) {
    return { 
      isWarning: true, 
      detail: 'Họ và tên chứa ký tự mã hóa Unicode/replacement character (?, ???, ï¿½).' 
    };
  }

  // Các chuỗi Mojibake / vỡ font chữ tiếng Việt khi dùng sai bảng mã TCVN3 / VNI
  const brokenPatterns = [/Ã¢/i, /Ã¡/i, /Ã /i, /Ã£/i, /Ã²/i, /Ã³/i, /Ãª/i, /Ã­/i, /Ãº/i, /áº/i, /â€/i, /â€™/i];
  for (const pattern of brokenPatterns) {
    if (pattern.test(str)) {
      return { 
        isWarning: true, 
        detail: 'Phát hiện vỡ font chữ tiếng Việt (chữ bị lỗi mã hóa UTF-8 / Mojibake).' 
      };
    }
  }

  // Họ tên chứa số hoặc ký tự đặc biệt bất thường
  if (/[0-9@#$%^&*=+_<>\\\/~`]/.test(str)) {
    return { 
      isWarning: true, 
      detail: 'Họ và tên chứa chữ số hoặc ký tự đặc biệt bất thường.' 
    };
  }

  return { isWarning: false };
};

// Kiểm tra dòng có phải là dòng Tiêu đề / Metadata / Thông tin chung không
export const isHeaderOrMetadataRow = (row: any[]): boolean => {
  if (!Array.isArray(row) || row.length === 0) return true;

  const joined = row.map(c => String(c || '').trim()).join(' ').toLowerCase();
  if (!joined) return true;

  const metadataKeywords = [
    'bộ chỉ huy quân sự',
    'cộng hòa xã hội chủ nghĩa',
    'danh sách công dân',
    'biểu số:',
    'khổ biểu:',
    'số tt',
    'stt',
    'họ, chữ đệm',
    'họ và tên',
    'ngày, tháng, năm sinh',
    'số định danh cá nhân',
    'số thẻ căn cước',
    'thẻ căn cước/cccd',
    'thẻ căn cước',
    'căn cước công dân',
    'thành phần gia đình',
    'trình độ văn hóa',
    'họ và tên cha',
    'họ và tên mẹ',
    'đơn vị giao nhận',
    'tính từ ngày',
    'nơi thường trú',
    'chuyên môn kỹ thuật'
  ];

  for (const kw of metadataKeywords) {
    if (joined.includes(kw)) return true;
  }

  // Dòng đánh số thứ tự cột [1], [2], [3], [4]...
  const nonNumCells = row.filter(c => {
    const s = String(c || '').trim();
    return s !== '' && !/^\d{1,2}$/.test(s);
  });
  if (nonNumCells.length === 0 && row.filter(c => String(c || '').trim() !== '').length >= 3) {
    return true;
  }

  return false;
};
