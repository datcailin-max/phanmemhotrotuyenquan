import { RecruitmentStatus } from '../../../../types';
import { EDUCATIONS } from '../../../../constants';

// Chuẩn hóa chuỗi text nhiều dòng (hỗ trợ \r\n, \r, \n, _x000D_\n, _x000D_)
export const normalizeMultilineText = (val: any): string => {
  if (!val && val !== 0) return '';
  return String(val)
    .replace(/_x000D_\n/g, '\n')
    .replace(/_x000D_/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
};

// Chuẩn hóa và nhận diện Trình độ học vấn / Chuyên môn kỹ thuật từ chuỗi Excel
export const parseEducationDegree = (rawStr: string): string => {
  if (!rawStr) return 'Lớp 12';
  const normalized = normalizeMultilineText(rawStr);
  const str = normalized.trim();
  if (!str) return 'Lớp 12';

  const lower = str.toLowerCase();

  // 1. Kiểm tra trình độ chuyên môn kỹ thuật (Đại học, Cao đẳng, Trung cấp)
  if (lower.includes('trên đh') || lower.includes('thạc sĩ') || lower.includes('tiến sĩ')) {
    return 'Trên ĐH';
  }
  if (lower.includes('đại học') || lower.includes('dai hoc') || /\bđh\b/i.test(str)) {
    return lower.includes('đang học') ? 'Đang học ĐH' : 'Đại học';
  }
  if (lower.includes('cao đẳng') || lower.includes('cao dang') || /\bcđ\b/i.test(str)) {
    return lower.includes('đang học') ? 'Đang học CĐ' : 'Cao đẳng';
  }
  if (lower.includes('trung cấp') || lower.includes('trung cap') || /\btc\b/i.test(str)) {
    return 'Trung cấp';
  }

  // 2. Kiểm tra lớp văn hóa phổ thông (12/12, 11/12, Lớp 12, Lớp 11...)
  if (lower.includes('12/12') || /\blớp\s*12\b/i.test(str) || /\b12\b/.test(str)) {
    return lower.includes('đang học') ? 'Đang học lớp 12' : 'Lớp 12';
  }
  if (lower.includes('11/12') || /\blớp\s*11\b/i.test(str) || /\b11\b/.test(str)) {
    return lower.includes('đang học') ? 'Đang học lớp 11' : 'Lớp 11';
  }
  if (lower.includes('10/12') || /\blớp\s*10\b/i.test(str) || /\b10\b/.test(str)) {
    return 'Lớp 10';
  }
  if (lower.includes('9/12') || /\blớp\s*9\b/i.test(str) || /\b9\b/.test(str)) {
    return 'Lớp 9';
  }
  if (lower.includes('8/12') || /\blớp\s*8\b/i.test(str) || /\b8\b/.test(str)) {
    return 'Lớp 8';
  }
  if (lower.includes('7/12') || /\blớp\s*7\b/i.test(str) || /\b7\b/.test(str)) {
    return 'Lớp 7';
  }
  if (lower.includes('6/12') || /\blớp\s*6\b/i.test(str) || /\b6\b/.test(str)) {
    return 'Lớp 6';
  }
  if (lower.includes('5/12') || /\blớp\s*5\b/i.test(str) || /\b5\b/.test(str)) {
    return 'Lớp 5';
  }
  if (lower.includes('4/12') || /\blớp\s*4\b/i.test(str) || /\b4\b/.test(str)) {
    return 'Lớp 4';
  }
  if (lower.includes('3/12') || /\blớp\s*3\b/i.test(str) || /\b3\b/.test(str)) {
    return 'Lớp 3';
  }
  if (lower.includes('2/12') || /\blớp\s*2\b/i.test(str) || /\b2\b/.test(str)) {
    return 'Lớp 2';
  }
  if (lower.includes('1/12') || /\blớp\s*1\b/i.test(str) || /\b1\b/.test(str)) {
    return 'Lớp 1';
  }

  if ((EDUCATIONS as readonly string[]).includes(str)) {
    return str;
  }

  return 'Lớp 12';
};

// Trạng thái mặc định của công dân khi nhập vào dựa theo danh sách/tab hiện tại
export const getDefaultStatusForTab = (tabId: string): RecruitmentStatus => {
  switch (tabId) {
    case 'NOT_ALLOWED_REG':
      return RecruitmentStatus.NOT_ALLOWED_REGISTRATION;
    case 'EXEMPT_REG':
      return RecruitmentStatus.EXEMPT_REGISTRATION;
    case 'FIRST_TIME_REG':
    case 'AGE_17':
      return RecruitmentStatus.FIRST_TIME_REGISTRATION;
    case 'ALL':
    case 'PRE_CHECK':
    case 'PRE_CHECK_PASS':
    case 'PRE_CHECK_FAIL':
    case 'PRE_CHECK_MANAGEMENT':
    case 'PRE_CHECK_LIST':
    case 'SOURCE':
    case 'SOURCE_LIST':
      return RecruitmentStatus.SOURCE;
    case 'MED_EXAM':
    case 'MED_EXAM_PASS':
    case 'MED_EXAM_FAIL':
    case 'HEALTH_CHECK':
      return RecruitmentStatus.PRE_CHECK_PASSED;
    case 'DEFERRED_LIST':
    case 'DEFERRED_HEALTH':
    case 'DEFERRED_EDUCATION':
    case 'DEFERRED_POLICY':
    case 'DEFERRED_DQTT':
    case 'DEFERRED_EXEMPTED':
      return RecruitmentStatus.DEFERRED;
    case 'EXEMPTED_LIST':
      return RecruitmentStatus.EXEMPTED;
    case 'FINAL':
    case 'FINAL_OFFICIAL':
    case 'FINAL_RESERVE':
    case 'ENLISTMENT_LIST':
      return RecruitmentStatus.FINALIZED;
    case 'ENLISTED':
    case 'ENLISTED_LIST':
      return RecruitmentStatus.ENLISTED;
    case 'TT50':
    case 'KTC_SUB1':
    case 'KTC_SUB2':
      return RecruitmentStatus.KTC_KHONG_TUYEN_CHON;
    default:
      return RecruitmentStatus.SOURCE;
  }
};

// Trích xuất ngày sinh từ chuỗi hoặc số (Lọc bỏ các dòng thông tin cha mẹ/thân nhân)
export const parseExcelDate = (val: any): string => {
  if (!val) return '';
  
  if (typeof val === 'number') {
    const date = new Date((val - (25567 + 2)) * 86400 * 1000);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    if (yyyy >= 1950 && yyyy <= 2030) {
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  const str = String(val).trim();

  // Lọc bỏ các dòng chứa thông tin cha, mẹ, thân nhân, gia đình để không lấy nhầm năm sinh của cha/mẹ
  const cleanLines = str.split(/\r?\n/).filter(line => {
    const lower = line.toLowerCase();
    return !/cha\s*:|mẹ\s*:|thân nhân|gia đình|phụ huynh|ông\s*:|bà\s*:/i.test(lower);
  });
  const cleanText = cleanLines.join(' ');

  // Dạng DD/MM/YYYY hoặc DD-MM-YYYY hoặc DD.MM.YYYY
  const ddmmyyyy = cleanText.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (ddmmyyyy) {
    const dd = ddmmyyyy[1].padStart(2, '0');
    const mm = ddmmyyyy[2].padStart(2, '0');
    const yyyy = ddmmyyyy[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // Dạng YYYY-MM-DD hoặc YYYY/MM/DD
  const yyyymmdd = cleanText.match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (yyyymmdd) {
    const yyyy = yyyymmdd[1];
    const mm = yyyymmdd[2].padStart(2, '0');
    const dd = yyyymmdd[3].padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Chỉ nhập năm sinh (ví dụ: 2005) - ưu tiên các năm trong độ tuổi nghĩa vụ quân sự (1990 - 2012)
  const recruitYears = cleanText.match(/\b(199\d|20[0-1]\d|202[0-5])\b/);
  if (recruitYears) {
    return `${recruitYears[1]}-01-01`;
  }

  const yearOnly = cleanText.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearOnly) {
    return `${yearOnly[1]}-01-01`;
  }

  return '';
};

// Trích xuất năm sinh chính xác từ 12 số CCCD của công dân
export const extractBirthYearFromCCCD = (cccd: string): number | null => {
  if (!cccd || typeof cccd !== 'string') return null;
  const cleanCccd = cccd.replace(/\D/g, '');
  if (cleanCccd.length !== 12) return null;

  // Ký tự thứ 4 (index 3) là giới tính & thế kỷ:
  // 0: Nam (19xx), 1: Nữ (19xx)
  // 2: Nam (20xx), 3: Nữ (20xx)
  // 4: Nam (21xx), 5: Nữ (21xx)
  const centuryDigit = parseInt(cleanCccd[3]);
  const yearTwoDigits = parseInt(cleanCccd.substring(4, 6));

  if (isNaN(centuryDigit) || isNaN(yearTwoDigits)) return null;

  let century = 1900;
  if (centuryDigit === 2 || centuryDigit === 3) {
    century = 2000;
  } else if (centuryDigit === 0 || centuryDigit === 1) {
    century = 1900;
  } else if (centuryDigit === 4 || centuryDigit === 5) {
    century = 2100;
  } else {
    return null;
  }

  const fullYear = century + yearTwoDigits;
  if (fullYear >= 1950 && fullYear <= 2030) {
    return fullYear;
  }

  return null;
};

// Trích xuất số CCCD từ ô dữ liệu
export const extractCCCD = (str: string): string => {
  if (!str) return '';
  const match = str.match(/(?:cccd|cmnd|số|đdcn|id)?\s*:?\s*(\d{9,12})\b/i) || str.match(/\b(\d{9,12})\b/);
  return match ? match[1] : '';
};

// Tự động làm sạch và chuẩn hóa Họ tên công dân (lược bỏ hoàn toàn các chữ số tự nhiên trong họ tên)
export const sanitizeName = (str: string): string => {
  if (!str) return '';
  let cleaned = str
    .replace(/[\x00-\x1F\x7F-\x9F\uFFFD]/g, '') // Bỏ ký tự điều khiển & replacement character
    .replace(/\?\?\?/g, '')
    .replace(/ï¿½/g, '')
    .replace(/[0-9]/g, ' ') // LƯỢC BỎ HOÀN TOÀN CÁC CHỮ SỐ TỰ NHIÊN TRONG HỌ VÀ TÊN
    .replace(/[@#$%^&*=+_<>\\\/~`|!?;:()[\]{}'"]/g, ' ') // Bỏ ký tự đặc biệt rác
    .replace(/[-–—•\*\+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.toUpperCase();
};

// Trích xuất Họ tên công dân chính chủ từ ô text
export const extractNameFromCell = (cellText: any): string => {
  if (cellText === undefined || cellText === null || cellText === '') return '';
  const normalized = normalizeMultilineText(cellText);
  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';

  for (let line of lines) {
    let cleanLine = line
      .replace(/^[-–—•\*\+]\s*/, '') // bỏ dấu gạch đầu dòng
      .replace(/^(họ và tên thường dùng|họ và tên khai sinh|họ, chữ đệm và tên thường dùng|họ, chữ đệm và tên khai sinh|họ và tên|họ tên|họ chữ đệm|họ tên khai sinh|tên công dân|họ và chữ đệm)\s*[:\-]?\s*/i, '')
      .trim();

    // Bỏ qua nếu dòng này là dòng thông tin thân nhân / nhãn tiêu đề / nơi ở / nghề nghiệp
    const lower = cleanLine.toLowerCase();
    if (/^(cha|mẹ|vợ|con|chồng|bố|phụ huynh|ông|bà)\s*:/i.test(lower)) continue;
    if (isNonPersonName(cleanLine)) continue;
    if (/^(cccd|cmnd|căn cước|định danh|ngày sinh|năm sinh|số thẻ|thẻ căn cước|nghề nghiệp|nơi làm việc|thành phần|học vấn|địa chỉ|thường trú|tạm trú|khen thưởng|kỷ luật|ghi chú)\b/i.test(lower)) continue;

    // Loại bỏ ngày sinh / năm sinh / CCCD nếu nằm chung trên cùng một dòng (vd: "Đinh Quốc Trí - 04/04/2007" hoặc "Đinh Quốc Trí 04/04/2007")
    cleanLine = cleanLine
      .replace(/\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}\b/g, '')
      .replace(/\b\d{9,12}\b/g, '')
      .replace(/\b(199\d|20[0-2]\d)\b/g, '')
      .replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, '')
      .replace(/[@#$%^&*=+_<>\\\/~`:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanLine || isNonPersonName(cleanLine)) continue;

    // Kiểm tra tên có chứa ít nhất 2 từ tiếng Việt hợp lệ (độ dài >= 3)
    const words = cleanLine.split(/\s+/).filter(w => /[a-zA-Zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i.test(w));
    if (words.length >= 2) {
      return sanitizeName(cleanLine);
    }
  }

  // Fallback: dòng đầu tiên được làm sạch
  const firstLine = lines[0]
    .replace(/^[-–—•\*\+]\s*/, '')
    .replace(/^(họ và tên thường dùng|họ và tên khai sinh|họ, chữ đệm và tên thường dùng|họ, chữ đệm và tên khai sinh|họ và tên|họ tên|họ chữ đệm|họ tên khai sinh|tên công dân|họ và chữ đệm)\s*[:\-]?\s*/i, '')
    .replace(/\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}\b/g, '')
    .replace(/\b\d{9,12}\b/g, '')
    .replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const firstClean = sanitizeName(firstLine);
  if (isNonPersonName(firstClean) || /căn cước|cccd|ngày sinh|định danh|số thẻ|họ và tên|họ, chữ đệm/i.test(firstClean.toLowerCase())) {
    return '';
  }
  return firstClean;
};

// Tự động quét tìm ô chứa Họ và tên công dân trong một hàng dữ liệu nếu cột được gán không tìm thấy
export const findCitizenNameInRow = (row: any[], excludeColIndices: number[] = []): string => {
  if (!Array.isArray(row)) return '';

  for (let cIdx = 0; cIdx < row.length; cIdx++) {
    if (excludeColIndices.includes(cIdx)) continue;
    const cellVal = row[cIdx];
    if (cellVal === undefined || cellVal === null || cellVal === '') continue;

    const cellText = normalizeMultilineText(cellVal);
    // Bỏ qua nếu ô chỉ là số STT thuần túy
    if (/^\d{1,4}$/.test(cellText.trim())) continue;

    const extracted = extractNameFromCell(cellText);
    if (extracted && extracted.length >= 3 && !isNonPersonName(extracted)) {
      const words = extracted.split(/\s+/).filter(Boolean);
      if (words.length >= 2) {
        return extracted;
      }
    }
  }

  return '';
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

  const joined = row.map(c => normalizeMultilineText(c)).filter(Boolean).join(' ');
  if (!joined || joined.trim().length === 0) return true;

  const lower = joined.toLowerCase();

  // 1. Nếu dòng chứa các tiêu đề hành chính lớn ở đầu văn bản (Quyết định, Quốc hiệu, Tiêu ngữ, Tên bảng biểu)
  const docHeaderKeywords = [
    'bộ chỉ huy quân sự',
    'cộng hòa xã hội chủ nghĩa',
    'độc lập - tự do - hạnh phúc',
    'hội đồng nghĩa vụ quân sự',
    'ủy ban nhân dân',
    'danh sách công dân',
    'biểu số:',
    'khổ biểu:',
    'mẫu biểu:',
    'theo điều 5',
    'theo điều 6',
    'thông tư 50',
    'quyết định số'
  ];

  for (const kw of docHeaderKeywords) {
    if (lower.includes(kw)) return true;
  }

  // 2. Kiểm tra nếu hàng là dòng tiêu đề các cột của bảng (Chứa >= 2 từ khóa tiêu đề cột)
  const colHeaderKeywords = [
    'số tt',
    'họ, chữ đệm',
    'họ và tên khai sinh',
    'ngày,tháng, năm sinh',
    'ngày, tháng, năm sinh',
    'số cccd',
    'số định danh cá nhân',
    'số thẻ căn cước',
    'thẻ căn cước/cccd',
    'thành phần gia đình',
    'trình độ văn hóa',
    'họ và tên cha',
    'họ tên cha, mẹ',
    'họ tên cha, năm sinh',
    'khen thưởng, kỷ luật',
    'đơn vị giao nhận',
    'chuyên môn kỹ thuật'
  ];

  let matchCount = 0;
  for (const kw of colHeaderKeywords) {
    if (lower.includes(kw)) {
      matchCount++;
    }
  }
  // Nếu có từ 2 tiêu đề cột trở lên trong cùng 1 dòng -> chắc chắn là dòng tiêu đề bảng
  if (matchCount >= 2) return true;

  // 3. Dòng đánh số thứ tự cột [1], [2], [3], [4]...
  const nonNumCells = row.filter(c => {
    const s = String(c || '').trim();
    return s !== '' && !/^\(?\d{1,2}\)?$/.test(s);
  });
  if (nonNumCells.length === 0 && row.filter(c => String(c || '').trim() !== '').length >= 3) {
    return true;
  }

  return false;
};

export interface ParsedAddress {
  village: string;
  street: string;
}

export const parseAddressInfo = (
  rawAddressText: string,
  rawVillageText?: string,
  defaultVillage: string = 'Ấp Mỹ An'
): ParsedAddress => {
  let village = (rawVillageText || '').trim();
  let street = (rawAddressText || '').trim();

  // Làm sạch xuống dòng
  village = village.replace(/[\r\n]+/g, ', ').replace(/\s+/g, ' ').trim();
  street = street.replace(/[\r\n]+/g, ', ').replace(/\s+/g, ' ').trim();

  // Nếu street và village giống nhau hoàn toàn
  if (street.toLowerCase() === village.toLowerCase()) {
    street = '';
  }

  // Hàm loại bỏ thông tin hành chính cấp Xã/Phường/Huyện/Tỉnh thừa ở cuối chuỗi
  const cleanAdminUnits = (str: string) => {
    return str
      .replace(/,\s*(xã|phường|thị trấn|huyện|thị xã|thành phố|tp|tỉnh)\s+[^,]+/gi, '')
      .replace(/,\s*việt nam$/gi, '')
      .trim();
  };

  street = cleanAdminUnits(street);
  village = cleanAdminUnits(village);

  // Helper kiểm tra xem chuỗi có CHỈ là tên Thôn/Ấp/Tổ/Khu phố mà KHÔNG có số nhà/đường không
  const isOnlyVillageInfo = (str: string): boolean => {
    if (!str) return false;
    const lower = str.toLowerCase();
    
    // Nếu chứa các từ số nhà/đường/hẻm/ngõ -> Không phải chỉ là thôn/ấp
    if (/\b(số\s*\d+|số\s*nhà|đường|hẻm|ngõ|ngách|kdc|chung\s*cư|khu\s*dân\s*cư)\b/i.test(lower)) {
      return false;
    }
    // Nếu bắt đầu bằng số nhà (vd: "30 Lê Hoàn", "12/3 Nguyễn Trãi") -> Không phải chỉ là thôn/ấp
    if (/^\d+[\d\/\-A-Za-z]*\s+[a-zàáảãạăắằẳẵặânấầnẩẫậneéèẻẽẹêếềểễệiíìỉĩịoóòỏõọôốồổỗộơớờởỡợuúùủũụưứừửữựyýỳỷỹỵ]/i.test(lower)) {
      return false;
    }

    // Có chứa các từ chỉ địa danh thôn, ấp, tổ, khu phố, khóm, xóm...
    return /\b(tổ\s*\d*|khu\s*phố\s*\d*|kp\s*\d*|thôn\s*\d*|ấp\s*\d*|khóm\s*\d*|xóm\s*\d*|đội\s*\d*|buôn|sóc)\b/i.test(lower);
  };

  // Trường hợp không có rawVillageText, nhưng rawAddressText chứa dữ liệu địa chỉ
  if (!village && street) {
    if (isOnlyVillageInfo(street)) {
      // Ví dụ: "Tổ 10 kp Ninh Thịnh" hoặc "Thôn 5 Lộc Thuận"
      village = street;
      street = '';
    } else {
      // Ví dụ: "30 đường Lê Hoàn, tổ 10 kp Ninh Thịnh"
      const villageMatch = street.match(/,\s*(\b(tổ\s*\d*|khu\s*phố\s*\d*|kp\s*\d*|thôn\s*\d*|ấp\s*\d*|khóm\s*\d*|xóm\s*\d*|đội\s*\d*)\b.*)/i);
      if (villageMatch) {
        village = villageMatch[1].trim();
        street = street.replace(villageMatch[0], '').trim();
      }
    }
  }

  // Trường hợp đã có village, và street cũng có nội dung
  if (village && street) {
    // Nếu street bằng village hoặc street chỉ là thông tin thôn/ấp
    if (street.toLowerCase() === village.toLowerCase() || isOnlyVillageInfo(street)) {
      street = '';
    } else {
      // Nếu street chứa village ở cuối, cắt village khỏi street
      const lowerStreet = street.toLowerCase();
      const lowerVillage = village.toLowerCase();
      if (lowerStreet.endsWith(lowerVillage)) {
        street = street.substring(0, street.length - village.length).replace(/,$/g, '').trim();
      }
    }
  }

  if (!village) {
    village = defaultVillage;
  }

  return { village, street };
};

export const isNonPersonName = (str: string): boolean => {
  if (!str) return true;
  const clean = str.toLowerCase().replace(/[:,\-\.\(\)]/g, ' ').trim();
  if (clean.length < 2) return true;

  if (
    clean.includes('thành phần gia đình') ||
    clean.includes('thành phần bản thân') ||
    clean.includes('thông tin cha') ||
    clean.includes('thông tin mẹ') ||
    clean.includes('họ và tên cha') ||
    clean.includes('họ và tên mẹ') ||
    clean.includes('họ tên cha') ||
    clean.includes('họ tên mẹ') ||
    clean.includes('năm sinh') ||
    clean.includes('nghề nghiệp') ||
    clean.includes('chuyên môn') ||
    clean.includes('dân tộc') ||
    clean.includes('tôn giáo') ||
    clean.includes('trình độ')
  ) {
    return true;
  }

  const exactKeywords = [
    'nông dân', 'phụ thuộc', 'kinh', 'tày', 'nùng', 'hoa', 'dao', 'chăm', 'khơ me', 'mường', 'sán dìu', 'sán rìu',
    'không', 'phật giáo', 'thiên chúa', 'công giáo', 'tin lành', 'cao đài', 'hòa hảo',
    'đảng viên', 'đoàn viên', 'học sinh', 'sinh viên', 'thất nghiệp', 'tự do', 'lao động tự do',
    'công nhân', 'làm vườn', 'nội trợ', 'bộ đội', 'giáo viên', 'buôn bán', 'làm nông', 'kinh doanh', 'cán bộ',
    'chưa có', 'không nghề nghiệp', 'hộ khẩu', 'tạm trú', 'thường trú', 'quê quán',
    'ở nhà', 'làm mộc', 'làm ruộng', 'làm thuê', 'làm rẫy', 'thợ mộc', 'thợ xây', 'thợ sắt', 'thợ điện',
    'thợ cơ khí', 'lái xe', 'tài xế', 'bảo vệ', 'buôn bán nhỏ', 'chăn nuôi', 'trồng trọt', 'đã mất', 'qua đời',
    'đã chết', 'mất', 'chết', 'chủ hộ', 'cháu', 'cháu ngoại', 'cháu nội', 'ông', 'bà', 'anh', 'chị', 'em'
  ];

  if (exactKeywords.some(kw => clean === kw || clean === kw + ' gia đình')) {
    return true;
  }

  if (
    clean.startsWith('ở nhà') ||
    clean.startsWith('chủ hộ') ||
    clean.startsWith('cháu ') ||
    clean.startsWith('cháu ngoại') ||
    clean.startsWith('cháu nội') ||
    clean.startsWith('đã mất') ||
    clean.startsWith('qua đời')
  ) {
    return true;
  }

  return false;
};

export interface ParentInfoParsed {
  father: { fullName: string; birthYear: string; job: string; isDeceased?: boolean };
  mother: { fullName: string; birthYear: string; job: string; isDeceased?: boolean };
}

// Kiểm tra tình trạng cha/mẹ đã mất/chết/qua đời
export const isParentDeceased = (str?: string): boolean => {
  if (!str) return false;
  const lower = str.toLowerCase().trim();
  return /^(chết|đã chết|mất|đã mất|qua đời|đã qua đời|từ trần|hi sinh|liệt sĩ|liệt sỹ)\b/i.test(lower) ||
         /\b(đã chết|đã mất|qua đời|đã qua đời|từ trần|hi sinh|liệt sĩ|liệt sỹ)\b/i.test(lower) ||
         lower === 'chết' || lower === 'mất';
};

// Làm sạch nghề nghiệp thân nhân (Nếu là chết/đã chết/mất thì tự động điền thành "Không" vì đã có cột Sống/chết riêng)
export const cleanParentJob = (job?: string): string => {
  if (!job) return 'Không';
  let clean = job.trim();
  if (isParentDeceased(clean)) {
    // Loại bỏ các từ chỉ tình trạng chết khỏi nghề nghiệp
    clean = clean
      .replace(/\b(đã chết|đã mất|qua đời|đã qua đời|từ trần|hi sinh|liệt sĩ|liệt sỹ|chết|mất)\b/gi, '')
      .replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, '')
      .replace(/^[:,\-\s\(\)]+/, '')
      .replace(/[:,\-\s\(\)]+$/, '')
      .trim();
    if (!clean || clean === '---' || clean.toLowerCase() === 'không' || clean.toLowerCase() === 'chưa cập nhật') {
      return 'Không';
    }
  }
  if (!clean || clean === '---' || clean.toLowerCase() === 'chưa cập nhật' || clean.toLowerCase() === 'chua cap nhat') {
    return 'Không';
  }
  return clean;
};

export const parseParentInfo = (textInputs: (string | undefined | null)[]): ParentInfoParsed => {
  const result: ParentInfoParsed = {
    father: { fullName: '', birthYear: '', job: '', isDeceased: false },
    mother: { fullName: '', birthYear: '', job: '', isDeceased: false }
  };

  if (!textInputs || textInputs.length === 0) return result;

  // 1. Tách các dòng đầu vào theo dòng hoặc theo từ khóa phân cách Cha / Mẹ
  const rawLines: string[] = [];
  textInputs.forEach(input => {
    if (!input) return;
    const str = String(input).trim();
    if (!str) return;

    // Phân tách nếu 1 chuỗi chứa cả Cha và Mẹ (Ví dụ: "Cha: NGUYỄN NAM (1975) - công nhân; Mẹ: HÀ THỊ HỒNG DIỆU (1978) - công nhân")
    const splitByParentKeyword = str.split(/(?=\b(?:mẹ|họ tên mẹ|thông tin mẹ|họ và tên mẹ|bố|cha|họ tên cha|thông tin cha|họ và tên cha)\b\s*[:\-]?)/i);

    splitByParentKeyword.forEach(subStr => {
      subStr.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed) rawLines.push(trimmed);
      });
    });
  });

  // Lọc các dòng tiêu đề trùng lặp không chứa dữ liệu thực tế
  const lines = rawLines.filter(line => {
    const lower = line.toLowerCase();
    if (
      (lower.includes('họ tên cha') || lower.includes('họ và tên cha') || lower.includes('họ tên mẹ') || lower.includes('họ và tên mẹ')) && 
      (lower.includes('nghề nghiệp') || lower.includes('năm sinh')) && 
      !lower.includes(':') && 
      !/\b(19[0-9xX\?\*_]{2}|20[0-9xX\?\*_]{2}|\d{2})\b/i.test(lower)
    ) return false;

    if (lower === 'thành phần gia đình' || lower === 'thông tin thân nhân' || lower === 'thông tin cha mẹ') return false;

    return true;
  });

  if (lines.length === 0) return result;

  // Trích xuất Năm sinh (xử lý cả 4 chữ số 19xx/20xx, tuổi 51t/51 tuổi, 2 chữ số 7x/8x/9x, ngoặc đơn (1975), tiền tố SN, NS, sinh năm...)
  const extractBirthYear = (str: string): { birthYear: string; cleanStr: string } => {
    if (!str) return { birthYear: '', cleanStr: '' };

    // 1. Full date (VD: 15/08/1975, 1975-08-15, 15.8.1975, 08/1975)
    const fullDateMatch = str.match(/(?:\b\d{1,2}[\/\.-]\d{1,2}[\/\.-]|\b\d{1,2}[\/\.-])(19[2-9]\d|20[0-2]\d)\b/);
    if (fullDateMatch) {
      const birthYear = fullDateMatch[1];
      const cleanStr = str.replace(fullDateMatch[0], ' ').replace(/\s+/g, ' ').trim();
      return { birthYear, cleanStr };
    }

    // 2. Tuổi (VD: "51t", "51 tuổi", "51T", "48 tuổi") -> quy đổi năm sinh = (2026 - tuổi)
    const ageMatch = str.match(/\b([2-8]\d)\s*(?:tuổi|t)\b/i);
    if (ageMatch) {
      const age = parseInt(ageMatch[1], 10);
      if (age >= 25 && age <= 85) {
        const currentYr = new Date().getFullYear() || 2026;
        const birthYear = String(currentYr - age);
        const cleanStr = str.replace(ageMatch[0], ' ').replace(/\s+/g, ' ').trim();
        return { birthYear, cleanStr };
      }
    }

    // 3. Tìm năm 4 chữ số (1920-2029 hoặc 19xx, 197x) - có hoặc không có tiền tố SN, NS, sinh...
    const year4Match = str.match(/(?:SN|S\.N|Năm\s*sinh|sinh\s*năm|NS|N\.S|S\/N|sinh|tuổi|dob)?\s*[:\-\(\[\{]*\b(19[2-9]\d|20[0-2]\d|19[0-9xX\?\*_]{2}|20[0-9xX\?\*_]{2})\b[:\-\)\]\}]*/i);
    if (year4Match) {
      const birthYear = year4Match[1];
      const cleanStr = str.replace(year4Match[0], ' ').replace(/\s+/g, ' ').trim();
      return { birthYear, cleanStr };
    }

    // 4. Tìm năm sinh đứng trong ngoặc đơn e.g. "(75)", "[75]", "(1975)"
    const parenYearMatch = str.match(/[\(\[\{]\s*(?:SN|NS|sinh)?\s*(\d{2,4})\s*[\)\]\}]/i);
    if (parenYearMatch) {
      let yr = parenYearMatch[1];
      if (yr.length === 2) {
        const num = parseInt(yr, 10);
        if (num >= 30 && num <= 99) yr = '19' + yr;
        else if (num >= 0 && num <= 29) yr = '20' + yr;
      }
      if (yr.length === 4) {
        const cleanStr = str.replace(parenYearMatch[0], ' ').replace(/\s+/g, ' ').trim();
        return { birthYear: yr, cleanStr };
      }
    }

    // 5. Tìm năm sinh 2 chữ số có tiền tố (VD: "SN 75", "NS: 78", "sinh 80", "Năm sinh 82")
    const year2Match = str.match(/(?:SN|S\.N|Năm\s*sinh|sinh\s*năm|NS|N\.S|S\/N|sinh)\s*[:\-\(\[\s]*\b([3-9]\d)\b[:\-\)\]\s]*/i);
    if (year2Match) {
      const birthYear = '19' + year2Match[1];
      const cleanStr = str.replace(year2Match[0], ' ').replace(/\s+/g, ' ').trim();
      return { birthYear, cleanStr };
    }

    // 6. Ô độc lập chỉ chứa 2 chữ số (VD: "51" hoặc "75")
    const pureTrimmed = str.trim();
    if (/^\d{2}$/.test(pureTrimmed)) {
      const num = parseInt(pureTrimmed, 10);
      if (num >= 60 && num <= 99) {
        return { birthYear: '19' + pureTrimmed, cleanStr: '' };
      } else if (num >= 25 && num < 60) {
        const currentYr = new Date().getFullYear() || 2026;
        return { birthYear: String(currentYr - num), cleanStr: '' };
      }
    }

    // 7. Tìm năm sinh 2 chữ số đứng độc lập giữa các dấu phân cách (VD: "Cha: NGUYỄN NAM, 75, công nhân")
    const standalone2digitMatch = str.match(/(?:^|[:,\-\s\(\/])\b([3-9]\d)\b(?:$|[:,\-\s\)\/])/);
    if (standalone2digitMatch) {
      const numStr = standalone2digitMatch[1];
      const birthYear = '19' + numStr;
      const cleanStr = str.replace(standalone2digitMatch[0], ' ').replace(/\s+/g, ' ').trim();
      return { birthYear, cleanStr };
    }

    return { birthYear: '', cleanStr: str };
  };

  // Helper tách Tên và Nghề nghiệp
  const parseNameAndJob = (str: string) => {
    let text = str
      .replace(/^(họ và tên cha|họ tên cha|thông tin cha|năm sinh cha|nghề nghiệp cha|cha|bố|họ và tên mẹ|họ tên mẹ|thông tin mẹ|năm sinh mẹ|nghề nghiệp mẹ|mẹ)\s*[:\-]?\s*/i, '')
      .replace(/^[:,\-\s\(\)]+/, '')
      .replace(/[:,\-\s\(\)]+$/, '')
      .trim();

    text = text
      .replace(/(?:^|[:,\-\s])(năm sinh|nghề nghiệp|nghề|chuyên môn|làm|làm nghề|họ và tên|họ tên|thông tin)\s*[:\-]?\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) return { name: '', job: '' };

    if (isNonPersonName(text)) {
      return { name: '', job: text };
    }

    const jobKeywords = [
      'công nhân', 'nông dân', 'làm ruộng', 'buôn bán', 'tự do', 'lao động tự do',
      'cán bộ', 'giáo viên', 'bộ đội', 'công chức', 'viên chức', 'hưu trí', 'nội trợ',
      'làm vườn', 'kinh doanh', 'thất nghiệp', 'phụ giúp gia đình', 'bần nông', 'trung nông',
      'ở nhà', 'làm mộc', 'làm thuê', 'làm rẫy', 'làm nông', 'thợ mộc', 'thợ xây', 'thợ sắt',
      'thợ điện', 'thợ cơ khí', 'lái xe', 'tài xế', 'bảo vệ', 'buôn bán nhỏ', 'chăn nuôi',
      'trồng trọt', 'đã mất', 'qua đời', 'đã chết', 'mất', 'chết', 'liệt sĩ', 'liệt sỹ', 'từ trần'
    ];

    let name = text;
    let job = '';

    for (const kw of jobKeywords) {
      const idx = text.toLowerCase().lastIndexOf(kw);
      if (idx > 0) {
        name = text.substring(0, idx).replace(/[:,\-\s\(\)]+$/, '').trim();
        job = text.substring(idx).replace(/^[:,\-\s\(\)]+/, '').trim();
        break;
      }
    }

    if (!job) {
      const delims = [';', ',', '-', ':'];
      for (const delim of delims) {
        if (name.includes(delim)) {
          const parts = name.split(delim).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            const potentialName = parts[0];
            const potentialJob = parts.slice(1).join(' ').trim();
            if (potentialName && !isNonPersonName(potentialName)) {
              name = potentialName;
              job = potentialJob;
              break;
            }
          }
        }
      }
    }

    // Làm sạch Họ tên người (lược bỏ chữ số)
    name = sanitizeName(name);

    return { name, job };
  };

  let currentTarget: 'father' | 'mother' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const isFatherExplicit = /\b(cha|bố|họ tên cha|họ và tên cha|thông tin cha|năm sinh cha|nghề nghiệp cha)\b/i.test(line);
    const isMotherExplicit = /\b(mẹ|họ tên mẹ|họ và tên mẹ|thông tin mẹ|năm sinh mẹ|nghề nghiệp mẹ)\b/i.test(line);
    const isOtherRelative = /^\s*(chủ hộ|cháu|cháu ngoại|cháu nội|ông|bà|anh|chị|em|cậu|dì|chú|bác|vợ|chồng)\b/i.test(line) && !isFatherExplicit && !isMotherExplicit;

    if (isOtherRelative) {
      continue;
    }

    const { birthYear, cleanStr } = extractBirthYear(line);

    if (isFatherExplicit) {
      currentTarget = 'father';
      if (birthYear) result.father.birthYear = birthYear;
      const { name, job } = parseNameAndJob(cleanStr);
      if (name && !isNonPersonName(name)) result.father.fullName = name;
      if (job) result.father.job = job;
      continue;
    }

    if (isMotherExplicit) {
      currentTarget = 'mother';
      if (birthYear) result.mother.birthYear = birthYear;
      const { name, job } = parseNameAndJob(cleanStr);
      if (name && !isNonPersonName(name)) result.mother.fullName = name;
      if (job) result.mother.job = job;
      continue;
    }

    const { name, job } = parseNameAndJob(cleanStr);

    // 1. Line without a valid person name (contains only birth year and/or job, e.g. "1977 Ở nhà", "1982 Buôn bán")
    if (!name || isNonPersonName(name)) {
      if (currentTarget === 'father') {
        if (birthYear && !result.father.birthYear) result.father.birthYear = birthYear;
        if (job && !result.father.job) result.father.job = job;
      } else if (currentTarget === 'mother') {
        if (birthYear && !result.mother.birthYear) result.mother.birthYear = birthYear;
        if (job && !result.mother.job) result.mother.job = job;
      } else {
        if (!result.father.fullName || (!result.father.birthYear && !result.father.job)) {
          if (birthYear && !result.father.birthYear) result.father.birthYear = birthYear;
          if (job && !result.father.job) result.father.job = job;
        } else if (!result.mother.fullName || (!result.mother.birthYear && !result.mother.job)) {
          if (birthYear && !result.mother.birthYear) result.mother.birthYear = birthYear;
          if (job && !result.mother.job) result.mother.job = job;
        }
      }
      continue;
    }

    // 2. Line contains a valid person name
    if (name && !isNonPersonName(name)) {
      if (!result.father.fullName) {
        result.father.fullName = name;
        if (birthYear) result.father.birthYear = birthYear;
        if (job) result.father.job = job;
        currentTarget = 'father';
      } else if (!result.mother.fullName) {
        result.mother.fullName = name;
        if (birthYear) result.mother.birthYear = birthYear;
        if (job) result.mother.job = job;
        currentTarget = 'mother';
      } else {
        if (currentTarget === 'father') {
          if (birthYear && !result.father.birthYear) result.father.birthYear = birthYear;
          if (job && !result.father.job) result.father.job = job;
        } else if (currentTarget === 'mother') {
          if (birthYear && !result.mother.birthYear) result.mother.birthYear = birthYear;
          if (job && !result.mother.job) result.mother.job = job;
        }
      }
    }
  }

  // Chuẩn hóa định dạng năm sinh thành 4 chữ số (VD: "75" -> "1975")
  const formatYear4 = (yr: string): string => {
    if (!yr) return '';
    const m = yr.match(/\b(19[2-9]\d|20[0-2]\d)\b/);
    if (m) return m[1];
    const m2 = yr.match(/\b([3-9]\d)\b/);
    if (m2) return '19' + m2[1];
    return yr.replace(/\D/g, '').substring(0, 4);
  };

  result.father.birthYear = formatYear4(result.father.birthYear);
  result.mother.birthYear = formatYear4(result.mother.birthYear);

  // Xử lý tình trạng chết/mất và chuẩn hóa nghề nghiệp thành "Không" nếu chết
  result.father.isDeceased = isParentDeceased(result.father.job);
  result.father.job = cleanParentJob(result.father.job);

  result.mother.isDeceased = isParentDeceased(result.mother.job);
  result.mother.job = cleanParentJob(result.mother.job);

  return result;
};
