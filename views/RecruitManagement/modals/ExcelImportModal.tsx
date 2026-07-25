import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet, RefreshCw, Download, HelpCircle, FileText, FileX, Info, ShieldAlert } from 'lucide-react';
import XLSX from 'xlsx-js-style';
import { Recruit, RecruitmentStatus, User, FamilyMember } from '../../../types';
import { api } from '../../../api';

interface ExcelImportModalProps {
  recruits: Recruit[];
  activeTabId: string;
  sessionYear: number;
  currentUser?: User;
  onClose: () => void;
  onRefresh: () => void;
}

export type ErrorType = 
  | 'THIEU_CCCD' 
  | 'CCCD_SAI_DINH_DANG' 
  | 'THIEU_HO_TEN' 
  | 'LOI_FONT_CHINH_TA' 
  | 'DU_LIEU_KHONG_HOP_LE';

export interface ProcessError {
  rowNum: number;
  name?: string;
  cccd?: string;
  errorType: ErrorType;
  reason: string;
  suggestion: string;
}

export interface ProcessSuccess {
  rowNum: number;
  fullName: string;
  cccd: string;
  isUpdate: boolean;
}

export interface DeferredExemptNotice {
  rowNum: number;
  fullName: string;
  cccd: string;
  reason: string;
}

export interface FontWarningNotice {
  rowNum: number;
  fullName: string;
  cccd: string;
  detail: string;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  recruits,
  activeTabId,
  sessionYear,
  currentUser,
  onClose,
  onRefresh
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [insertedCount, setInsertedCount] = useState(0);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [errorList, setErrorList] = useState<ProcessError[]>([]);
  const [successList, setSuccessList] = useState<ProcessSuccess[]>([]);
  const [deferredExemptList, setDeferredExemptList] = useState<DeferredExemptNotice[]>([]);
  const [fontWarningList, setFontWarningList] = useState<FontWarningNotice[]>([]);
  const [filterErrorCategory, setFilterErrorCategory] = useState<string>('ALL');

  // Trạng thái mặc định của công dân khi nhập vào dựa theo danh sách/tab hiện tại
  const getDefaultStatusForTab = (tabId: string): RecruitmentStatus => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIsCompleted(false);
      setErrorList([]);
      setSuccessList([]);
      setDeferredExemptList([]);
      setFontWarningList([]);
      setProgressPercent(0);
      setInsertedCount(0);
      setUpdatedCount(0);
    }
  };

  // Tải mẫu Excel nhập chuẩn
  const handleDownloadTemplate = () => {
    const XLSXLib: any = XLSX;
    const utils = XLSXLib?.utils || XLSXLib?.default?.utils;
    const writeFile = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

    if (!utils || !writeFile) {
      alert("Không thể khởi tạo thư viện Excel!");
      return;
    }

    const templateData = [
      ["DANH SÁCH CÔNG DÂN NHẬP NGHŨ / ĐĂNG KÝ NVQS"],
      [`Năm tuyển chọn: ${sessionYear} - Đơn vị: ${currentUser?.unit?.commune || 'Mỹ Hòa Hưng'}`],
      [""], // Dòng trống
      [
        "STT", 
        "Họ và tên (*)", 
        "Ngày sinh (*)", 
        "Số CCCD (*)", 
        "Thôn/Ấp/Tổ dân phố", 
        "Địa chỉ thường trú", 
        "Trình độ văn hóa", 
        "Chuyên môn kỹ thuật", 
        "Sức khỏe (1-6)", 
        "Lý do hoãn/miễn/Ghi chú"
      ],
      [
        1, 
        "Nguyễn Văn A", 
        "15/05/2005", 
        "038205001234", 
        "Ấp Mỹ An", 
        "Xã Mỹ Hòa Hưng, TP Long Xuyên", 
        "12/12", 
        "Đại học CNTT", 
        1, 
        "Đang học Đại học"
      ],
      [
        2, 
        "Trần Văn B", 
        "20/10/2006", 
        "038206005678", 
        "Ấp Mỹ Khánh", 
        "Xã Mỹ Hòa Hưng, TP Long Xuyên", 
        "12/12", 
        "Không", 
        2, 
        ""
      ]
    ];

    const ws = utils.aoa_to_sheet(templateData);

    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 25 }, // Họ tên
      { wch: 15 }, // Ngày sinh
      { wch: 18 }, // CCCD
      { wch: 20 }, // Thôn/Ấp
      { wch: 35 }, // Thường trú
      { wch: 18 }, // Trình độ VH
      { wch: 22 }, // CMKT
      { wch: 15 }, // Sức khỏe
      { wch: 25 }  // Ghi chú
    ];

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "DanhSachCongDan");

    writeFile(wb, `Excel_Mau_Nhap_Cong_Dan_${sessionYear}.xlsx`);
  };

  // Tải báo cáo lỗi Excel chi tiết cho cán bộ
  const handleDownloadErrorReport = () => {
    if (errorList.length === 0 && fontWarningList.length === 0) {
      alert("Không có lỗi hoặc cảnh báo nào để xuất báo cáo!");
      return;
    }

    const XLSXLib: any = XLSX;
    const utils = XLSXLib?.utils || XLSXLib?.default?.utils;
    const writeFile = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

    if (!utils || !writeFile) {
      alert("Không thể khởi tạo thư viện Excel!");
      return;
    }

    const wb = utils.book_new();

    if (errorList.length > 0) {
      const getErrorCategoryLabel = (type: ErrorType): string => {
        switch (type) {
          case 'THIEU_CCCD': return 'Thiếu số CCCD';
          case 'CCCD_SAI_DINH_DANG': return 'Số CCCD sai định dạng';
          case 'THIEU_HO_TEN': return 'Thiếu Họ và tên';
          case 'LOI_FONT_CHINH_TA': return 'Lỗi font chữ / chính tả';
          case 'DU_LIEU_KHONG_HOP_LE': return 'Dữ liệu không hợp lệ';
          default: return 'Lỗi dữ liệu';
        }
      };

      const reportData = [
        ["BÁO CÁO DÒNG LỖI KHÔNG THỂ NHẬP DỮ LIỆU CÔNG DÂN NVQS"],
        [`Năm tuyển chọn: ${sessionYear} - Ngày tạo báo cáo: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`],
        [`Tệp Excel nguồn: ${selectedFile?.name || 'Tệp tải lên'} - Tổng số dòng lỗi: ${errorList.length} dòng`],
        [""], // Dòng trống
        [
          "STT Dòng Excel", 
          "Họ và tên đọc được", 
          "Số CCCD", 
          "Phân loại lỗi", 
          "Chi tiết nguyên nhân lỗi", 
          "Hướng dẫn điều chỉnh cho Cán bộ"
        ],
        ...errorList.map(err => [
          err.rowNum,
          err.name || "---",
          err.cccd || "---",
          getErrorCategoryLabel(err.errorType),
          err.reason,
          err.suggestion
        ])
      ];

      const ws = utils.aoa_to_sheet(reportData);

      ws['!cols'] = [
        { wch: 15 }, // Dòng Excel
        { wch: 28 }, // Họ tên
        { wch: 18 }, // CCCD
        { wch: 25 }, // Phân loại lỗi
        { wch: 50 }, // Chi tiết nguyên nhân
        { wch: 50 }  // Hướng dẫn điều chỉnh
      ];

      utils.book_append_sheet(wb, ws, "DongLoi_KhongNhapDuoc");
    }

    if (fontWarningList.length > 0) {
      const warningData = [
        ["DANH SÁCH CÔNG DÂN CÓ CẢNH BÁO FONT CHỮ (ĐÃ TỰ ĐỘNG CHUẨN HÓA & LƯU THÀNH CÔNG)"],
        [`Tệp Excel nguồn: ${selectedFile?.name || 'Tệp tải lên'} - Tổng số cảnh báo: ${fontWarningList.length} trường hợp`],
        ["Lưu ý: Dữ liệu bên dưới ĐÃ ĐƯỢC LƯU VÀO CSDL. Cán bộ có thể đối soát lại nếu cần."],
        [""],
        ["STT Dòng Excel", "Họ và tên đã chuẩn hóa", "Số CCCD", "Chi tiết cảnh báo font / mã hóa ban đầu"],
        ...fontWarningList.map(w => [
          w.rowNum,
          w.fullName,
          w.cccd,
          w.detail
        ])
      ];

      const wsWarning = utils.aoa_to_sheet(warningData);
      wsWarning['!cols'] = [
        { wch: 15 },
        { wch: 28 },
        { wch: 18 },
        { wch: 60 }
      ];
      utils.book_append_sheet(wb, wsWarning, "CanhBaoFontChu_DaLuu");
    }

    writeFile(wb, `Bao_Cao_Doi_Soat_Nhap_Excel_${sessionYear}.xlsx`);
  };

  // Trích xuất ngày sinh từ chuỗi hoặc số
  const parseExcelDate = (val: any): string => {
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
  const extractCCCD = (str: string): string => {
    if (!str) return '';
    const match = str.match(/(?:cccd|cmnd|số|đdcn|id)?\s*:?\s*(\d{9,12})\b/i) || str.match(/\b(\d{9,12})\b/);
    return match ? match[1] : '';
  };

  // Trích xuất Họ tên công dân chính chủ từ dòng text
  const extractNameFromCell = (cellText: string): string => {
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

  // Tự động làm sạch và chuẩn hóa Họ tên công dân
  const sanitizeName = (str: string): string => {
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

  // Kiểm tra cảnh báo font chữ, mã hóa UTF-8 hoặc chính tả (Không chặn nhập dữ liệu)
  const checkFontWarning = (str: string): { isWarning: boolean; detail?: string } => {
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
  const isHeaderOrMetadataRow = (row: any[]): boolean => {
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

  // Xử lý đọc và nhập dữ liệu từ File Excel
  const handleStartImport = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn tệp Excel để bắt đầu!");
      return;
    }

    setIsProcessing(true);
    setIsCompleted(false);
    setProgressPercent(0);
    setProcessedRows(0);
    setInsertedCount(0);
    setUpdatedCount(0);
    setErrorList([]);
    setSuccessList([]);
    setDeferredExemptList([]);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const XLSXLib: any = XLSX;
      const utils = XLSXLib?.utils || XLSXLib?.default?.utils;

      if (!utils) {
        throw new Error("Không thể khởi chạy thư viện đọc Excel.");
      }

      const workbook = XLSXLib.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawRows: any[][] = utils.sheet_to_json(worksheet, { header: 1 });

      if (!rawRows || rawRows.length === 0) {
        throw new Error("Tệp Excel không có dữ liệu!");
      }

      // 1. TÌM DÒNG TIÊU ĐỀ (HEADER ROW) VÀ XÁC ĐỊNH VỊ TRÍ CỘT DỮ LIỆU
      let headerRowIndex = -1;
      let nameCol = -1;
      let dobCol = -1;
      let cccdCol = -1;
      let villageCol = -1;
      let addressCol = -1;
      let eduCol = -1;
      let jobCol = -1;
      let healthCol = -1;
      let reasonCol = -1;
      let isOfficialExportFormat = false;

      for (let i = 0; i < Math.min(rawRows.length, 25); i++) {
        const row = rawRows[i];
        if (!Array.isArray(row) || row.length === 0) continue;

        const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');

        if (
          rowStr.includes('stt') || 
          rowStr.includes('số tt') || 
          rowStr.includes('họ') || 
          rowStr.includes('tên') || 
          rowStr.includes('cccd') || 
          rowStr.includes('ngày sinh')
        ) {
          headerRowIndex = i;

          row.forEach((cell, colIdx) => {
            const cellStr = String(cell || '').trim().toLowerCase();

            if (
              !cellStr.includes('cha') && 
              !cellStr.includes('mẹ') && 
              !cellStr.includes('vợ') && 
              !cellStr.includes('chồng')
            ) {
              if (
                cellStr.includes('họ và tên') || 
                cellStr.includes('họ tên') || 
                cellStr.includes('họ, chữ đệm') || 
                cellStr.includes('tên công dân') ||
                cellStr.includes('khai sinh')
              ) {
                nameCol = colIdx;
              }
            }

            if (cellStr.includes('ngày sinh') || cellStr.includes('năm sinh') || cellStr.includes('dob')) {
              dobCol = colIdx;
            }

            if (cellStr.includes('cccd') || cellStr.includes('cmnd') || cellStr.includes('số định danh') || cellStr.includes('thẻ căn cước')) {
              cccdCol = colIdx;
            }

            if (cellStr.includes('thôn') || cellStr.includes('ấp') || cellStr.includes('tổ dân phố') || cellStr.includes('khóm')) {
              villageCol = colIdx;
            }

            if (cellStr.includes('thường trú') || cellStr.includes('địa chỉ') || cellStr.includes('quê quán') || cellStr.includes('hktt')) {
              if (villageCol !== colIdx) addressCol = colIdx;
            }

            if (cellStr.includes('văn hóa') || cellStr.includes('học vấn') || cellStr.includes('trình độ')) {
              eduCol = colIdx;
            }

            if (cellStr.includes('chuyên môn') || cellStr.includes('kỹ thuật') || cellStr.includes('nghề nghiệp')) {
              jobCol = colIdx;
            }

            if (cellStr.includes('sức khỏe') || cellStr.includes('loại sk') || cellStr.includes('phân loại')) {
              healthCol = colIdx;
            }

            if (
              cellStr.includes('lý do') || 
              cellStr.includes('tạm hoãn') || 
              cellStr.includes('miễn') || 
              cellStr.includes('ghi chú') || 
              cellStr.includes('tình trạng')
            ) {
              reasonCol = colIdx;
            }
          });

          // Nếu cột B (Index 1) chứa thông tin gộp Họ tên + Ngày sinh + CCCD (Biểu mẫu xuất bản)
          const col1HeaderStr = String(row[1] || '').toLowerCase();
          if (col1HeaderStr.includes('họ, chữ đệm') || col1HeaderStr.includes('khai sinh') || col1HeaderStr.includes('căn cước')) {
            isOfficialExportFormat = true;
            nameCol = 1;
            dobCol = 1;
            cccdCol = 1;
          }

          break;
        }
      }

      // Dự phòng vị trí cột tiêu chuẩn
      if (headerRowIndex === -1) {
        headerRowIndex = 3;
        nameCol = 1;
        dobCol = 2;
        cccdCol = 3;
        villageCol = 4;
        addressCol = 5;
        eduCol = 6;
        jobCol = 7;
        healthCol = 8;
        reasonCol = 9;
      }

      // 2. LỌC CHÍNH XÁC CÁC DÒNG CÔNG DÂN THỰC TẾ (LOẠI BỎ HẰNG ĐẲNG CÁC DÒNG TIÊU ĐỀ PHỤ)
      const rawDataRows = rawRows.slice(headerRowIndex + 1);
      const validRowsToProcess: { rowNumberInExcel: number; cells: any[] }[] = [];

      rawDataRows.forEach((row, idx) => {
        if (!Array.isArray(row) || row.length === 0) return;

        const rowNumberInExcel = headerRowIndex + 2 + idx;
        
        // Loại bỏ hoàn toàn các dòng tiêu đề, ghi chú hoặc thông tin metadata
        if (isHeaderOrMetadataRow(row)) return;

        validRowsToProcess.push({
          rowNumberInExcel,
          cells: row
        });
      });

      setTotalRows(validRowsToProcess.length);

      if (validRowsToProcess.length === 0) {
        throw new Error("Không tìm thấy các dòng dữ liệu công dân hợp lệ trong file Excel!");
      }

      const defaultStatus = getDefaultStatusForTab(activeTabId);
      const userCommune = currentUser?.unit?.commune || 'Mỹ Hòa Hưng';
      const userProvince = currentUser?.unit?.province || 'An Giang';

      const errors: ProcessError[] = [];
      const successes: ProcessSuccess[] = [];
      const deferredExempts: DeferredExemptNotice[] = [];
      const fontWarnings: FontWarningNotice[] = [];

      let inserted = 0;
      let updated = 0;

      let currentRecruitsState = [...recruits];
      const emptyFamilyMember: FamilyMember = { fullName: '', job: '', phoneNumber: '', birthYear: '' };

      for (let idx = 0; idx < validRowsToProcess.length; idx++) {
        const item = validRowsToProcess[idx];
        const row = item.cells;
        const rowNumberInExcel = item.rowNumberInExcel;

        const rowJoinedText = row.map(c => String(c || '')).join(' \n ');

        let rawName = '';
        let rawDob = '';
        let rawCccd = '';
        let village = 'Ấp Mỹ An';
        let address = '';
        let edu = '12/12';
        let job = 'Không';
        let parsedHealthGrade = 1;
        let reason = '';

        if (isOfficialExportFormat) {
          const col1Text = String(row[1] || '');
          rawCccd = extractCCCD(col1Text) || extractCCCD(rowJoinedText);
          rawName = extractNameFromCell(col1Text);
          rawDob = parseExcelDate(col1Text) || parseExcelDate(rowJoinedText);

          const col3Address = String(row[3] || '');
          if (col3Address) {
            const firstLine = col3Address.split(/\r?\n/)[0] || '';
            const villageMatch = firstLine.split(',')[0] || firstLine;
            if (villageMatch.trim()) village = villageMatch.trim();
            address = col3Address.replace(/\n/g, ', ');
          }

          const col5Edu = String(row[5] || '');
          if (col5Edu) {
            const eduMatch = col5Edu.match(/(\d{1,2}\/\d{1,2}|Đại học|Cao đẳng|Trung cấp|Lớp \d{1,2})/i);
            if (eduMatch) edu = eduMatch[0];
          }

          const lastColText = String(row[row.length - 1] || '');
          if (lastColText && lastColText !== '---') reason = lastColText.trim();

        } else {
          const nameCellText = nameCol >= 0 ? String(row[nameCol] || '').trim() : '';
          rawName = extractNameFromCell(nameCellText) || nameCellText;

          const cccdCellText = cccdCol >= 0 ? String(row[cccdCol] || '').trim() : '';
          rawCccd = extractCCCD(cccdCellText) || extractCCCD(rowJoinedText);

          const dobCellVal = dobCol >= 0 ? row[dobCol] : '';
          rawDob = parseExcelDate(dobCellVal) || parseExcelDate(rowJoinedText);

          if (villageCol >= 0 && row[villageCol]) {
            village = String(row[villageCol]).trim();
          }

          if (addressCol >= 0 && row[addressCol]) {
            address = String(row[addressCol]).trim();
          }

          if (eduCol >= 0 && row[eduCol]) {
            edu = String(row[eduCol]).trim();
          }

          if (jobCol >= 0 && row[jobCol]) {
            job = String(row[jobCol]).trim();
          }

          if (healthCol >= 0 && row[healthCol]) {
            const hVal = row[healthCol];
            if (typeof hVal === 'number' && hVal >= 1 && hVal <= 6) {
              parsedHealthGrade = hVal;
            } else if (typeof hVal === 'string') {
              const matchNum = hVal.match(/[1-6]/);
              if (matchNum) parsedHealthGrade = parseInt(matchNum[0]);
            }
          }

          if (reasonCol >= 0 && row[reasonCol]) {
            reason = String(row[reasonCol]).trim();
          }
        }

        // 1. TỰ ĐỘNG CHUẨN HÓA LÀM SẠCH HỌ TÊN & CẢNH BÁO FONT CHỮ
        const fontWarning = checkFontWarning(rawName);
        const cleanedName = sanitizeName(rawName) || rawName.trim().toUpperCase();

        // Kiểm tra xem Họ tên có bị trống hoặc chứa nhãn tiêu đề bị lỡ lọt
        if (
          !cleanedName || 
          cleanedName.length < 2 || 
          /SỐ THẺ CĂN CƯỚC|THẺ CĂN CƯỚC|MÃ ĐỊNH DANH|HỌ VÀ TÊN|NGÀY SÍNH|XÃ PHƯỜNG|THÔN ẤP/i.test(cleanedName)
        ) {
          errors.push({
            rowNum: rowNumberInExcel,
            cccd: rawCccd,
            errorType: 'THIEU_HO_TEN',
            reason: "Không tìm thấy hoặc thiếu Họ và tên công dân.",
            suggestion: "Điền đầy đủ Họ và tên công dân vào cột Họ và tên."
          });
          continue;
        }

        if (!rawCccd) {
          errors.push({
            rowNum: rowNumberInExcel,
            name: cleanedName,
            errorType: 'THIEU_CCCD',
            reason: `Công dân "${cleanedName}" chưa có Số thẻ CCCD / Mã định danh cá nhân.`,
            suggestion: "Bổ sung chính xác Số CCCD (12 chữ số) hoặc CMND (9 chữ số) cho công dân này."
          });
          continue;
        }

        if (!/^\d{9,12}$/.test(rawCccd)) {
          errors.push({
            rowNum: rowNumberInExcel,
            name: cleanedName,
            cccd: rawCccd,
            errorType: 'CCCD_SAI_DINH_DANG',
            reason: `Số CCCD "${rawCccd}" không đủ hoặc vượt quá 9-12 chữ số.`,
            suggestion: "Kiểm tra lại số CCCD, loại bỏ ký tự chữ hoặc dấu cách thừa."
          });
          continue;
        }

        // Cảnh báo lỗi font chữ / vỡ mã tiếng Việt (KHÔNG CHẶN NHẬP - Đã làm sạch & Lưu thành công)
        if (fontWarning.isWarning) {
          fontWarnings.push({
            rowNum: rowNumberInExcel,
            fullName: cleanedName,
            cccd: rawCccd,
            detail: fontWarning.detail || 'Phát hiện vỡ font chữ/Mã hóa (Hệ thống đã tự động làm sạch & lưu CSDL)'
          });
        }

        const formattedDob = rawDob || '2005-01-01';

        // Ghi nhận nếu công dân có lý do Tạm hoãn / Miễn / Ghi chú đặc biệt
        if (reason && reason !== '---') {
          deferredExempts.push({
            rowNum: rowNumberInExcel,
            fullName: cleanedName,
            cccd: rawCccd,
            reason: reason
          });
        }

        // 3. ĐỐI CHIẾU SỐ CCCD VỚI CƠ SỞ DỮ LIỆU CÔNG DÂN
        const existingIndex = currentRecruitsState.findIndex(r => r.citizenId?.trim() === rawCccd);

        if (existingIndex > -1) {
          // CẬP NHẬT CÔNG DÂN ĐÃ TỒN TẠI
          const existing = currentRecruitsState[existingIndex];
          const updatedRecruit: Recruit = {
            ...existing,
            fullName: cleanedName || existing.fullName,
            dob: formattedDob || existing.dob,
            address: {
              province: existing.address?.province || userProvince,
              commune: existing.address?.commune || userCommune,
              village: village || existing.address?.village || 'Ấp Mỹ An',
              street: address || existing.address?.street || ''
            },
            physical: {
              height: existing.physical?.height || 0,
              weight: existing.physical?.weight || 0,
              chest: existing.physical?.chest || 0,
              bmi: existing.physical?.bmi || 0,
              healthGrade: parsedHealthGrade || existing.physical?.healthGrade || 1,
              bloodPressure: existing.physical?.bloodPressure || '',
              note: existing.physical?.note || ''
            },
            details: {
              ...existing.details,
              education: edu || existing.details?.education || '12/12',
              job: job || existing.details?.job || 'Không'
            },
            defermentReason: reason || existing.defermentReason,
            updatedAt: new Date().toISOString()
          };

          await api.updateRecruit(updatedRecruit);
          currentRecruitsState[existingIndex] = updatedRecruit;

          updated++;
          successes.push({
            rowNum: rowNumberInExcel,
            fullName: cleanedName,
            cccd: rawCccd,
            isUpdate: true
          });

        } else {
          // CHÈN BẢN GHI CÔNG DÂN MỚI
          const newRecruit: Recruit = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2) + idx,
            citizenId: rawCccd,
            fullName: cleanedName,
            dob: formattedDob,
            phoneNumber: '',
            avatarUrl: '',
            address: {
              province: userProvince,
              commune: userCommune,
              village: village || 'Ấp Mỹ An',
              street: address || ''
            },
            hometown: {
              province: userProvince,
              commune: userCommune,
              village: village || 'Ấp Mỹ An'
            },
            physical: {
              height: 0,
              weight: 0,
              chest: 0,
              bmi: 0,
              healthGrade: parsedHealthGrade,
              bloodPressure: '',
              note: ''
            },
            details: {
              education: edu || '12/12',
              ethnicity: 'Kinh',
              religion: 'Không',
              maritalStatus: 'Độc thân',
              job: job || 'Không',
              politicalStatus: 'Doan_Vien',
              familyComposition: 'Nông dân',
              personalComposition: 'Phụ thuộc'
            },
            family: {
              father: { ...emptyFamilyMember },
              mother: { ...emptyFamilyMember },
              wife: { ...emptyFamilyMember },
              children: ''
            },
            status: defaultStatus,
            defermentReason: reason,
            recruitmentYear: sessionYear,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await api.createRecruit(newRecruit);
          currentRecruitsState.push(newRecruit);

          inserted++;
          successes.push({
            rowNum: rowNumberInExcel,
            fullName: cleanedName,
            cccd: rawCccd,
            isUpdate: false
          });
        }

        const currentCount = idx + 1;
        setProcessedRows(currentCount);
        setInsertedCount(inserted);
        setUpdatedCount(updated);
        setProgressPercent(Math.round((currentCount / validRowsToProcess.length) * 100));
      }

      setErrorList(errors);
      setSuccessList(successes);
      setDeferredExemptList(deferredExempts);
      setFontWarningList(fontWarnings);
      setIsProcessing(false);
      setIsCompleted(true);

      onRefresh();

    } catch (err: any) {
      alert(`Có lỗi xảy ra khi đọc file Excel: ${err.message || err}`);
      setIsProcessing(false);
    }
  };

  const filteredErrorList = errorList.filter(err => {
    if (filterErrorCategory === 'ALL') return true;
    return err.errorType === filterErrorCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-military-800 text-white p-5 flex justify-between items-center border-b border-military-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <FileSpreadsheet size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight">
                Nhập & Đối soát danh sách công dân từ File Excel
              </h3>
              <p className="text-[11px] text-military-200 font-bold uppercase mt-0.5">
                Năm tuyển chọn {sessionYear} • Tự động quét thông tin & Phát hiện lỗi chính tả, font chữ
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 text-military-200 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* Hướng dẫn & Tải Mẫu Excel */}
          <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <HelpCircle size={22} className="text-blue-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black uppercase text-blue-950">Quy trình kiểm tra dữ liệu nghiêm ngặt:</p>
                <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                  Hệ thống tự động phân tách thông tin công dân chính chủ với thông tin thân nhân (Cha, Mẹ, Vợ), kiểm tra lỗi vỡ font tiếng Việt, số CCCD sai định dạng và xuất tệp Excel Báo cáo Lỗi để cán bộ dễ dàng chỉnh sửa.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Download size={14} /> Tải Mẫu Excel
            </button>
          </div>

          {/* Khu vực Chọn File */}
          {!isProcessing && (
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase text-military-900 tracking-wider">
                Chọn tệp dữ liệu Excel (.xlsx, .xls)
              </label>

              <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50/50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform text-emerald-600">
                    <Upload size={24} />
                  </div>
                  <p className="text-xs font-black text-gray-700 uppercase">
                    Nhấp vào đây hoặc kéo thả file Excel vào đây
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Chấp nhận cả Mẫu Excel Nhập Chuẩn và tất cả các Biểu mẫu Xuất bản (01, 16C, 17A...)
                  </p>
                </div>
              </div>

              {selectedFile && (
                <div className="bg-emerald-50 p-3.5 rounded-xl flex items-center justify-between border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <FileText size={20} className="text-emerald-700" />
                    <div>
                      <p className="text-xs font-black text-emerald-950">{selectedFile.name}</p>
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">
                        Kích thước: {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedFile(null); setIsCompleted(false); }}
                    className="text-[11px] font-bold text-red-600 hover:underline uppercase px-2 py-1"
                  >
                    Bỏ chọn
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Thanh Tiến Trình Processing */}
          {isProcessing && (
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-military-900 flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin text-emerald-600" />
                    Đang quét, phân tách & đối chiếu thông tin công dân...
                  </span>
                  <p className="text-[11px] text-gray-500 mt-1 font-bold">
                    Thêm mới: <span className="text-emerald-700">{insertedCount}</span> • Cập nhật: <span className="text-blue-700">{updatedCount}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600 font-mono">
                    {progressPercent}%
                  </span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    {processedRows} / {totalRows} dòng
                  </p>
                </div>
              </div>

              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden p-0.5 border border-gray-300">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Báo cáo Kết quả sau khi hoàn tất */}
          {isCompleted && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Thống kê Tổng quan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3.5">
                  <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-emerald-800">Thêm mới thành công</p>
                    <p className="text-xl font-black text-emerald-950 font-mono">
                      {insertedCount} công dân
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center gap-3.5">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-blue-700">
                    <RefreshCw size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-blue-800">Cập nhật thông tin</p>
                    <p className="text-xl font-black text-blue-950 font-mono">
                      {updatedCount} công dân
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl flex items-center gap-3.5 border ${errorList.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`p-2.5 rounded-xl ${errorList.length > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-500'}`}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-700">Dòng lỗi không nhập được</p>
                    <p className={`text-xl font-black font-mono ${errorList.length > 0 ? 'text-red-950' : 'text-gray-500'}`}>
                      {errorList.length} dòng
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông báo Công dân có lý do Tạm hoãn / Miễn NVQS */}
              {deferredExemptList.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <h4 className="text-xs font-black text-amber-950 uppercase flex items-center gap-2">
                      <Info size={16} className="text-amber-600" />
                      Thông báo Cán bộ: Phát hiện {deferredExemptList.length} công dân có lý do Tạm hoãn / Miễn NVQS hoặc Ghi chú
                    </h4>
                    <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                      Lưu ý quản lý
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                    {deferredExemptList.map((item, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-100 text-xs flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-500">#{item.rowNum}</span>
                          <span className="font-black text-gray-900">{item.fullName}</span>
                          <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                            CCCD: {item.cccd}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 truncate max-w-xs">
                          {item.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Thông báo Cán bộ: Công dân bị vỡ font / lỗi mã hóa nhưng ĐÃ TỰ ĐỘNG CHUẨN HÓA & LƯU THÀNH CÔNG */}
              {fontWarningList.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                    <h4 className="text-xs font-black text-orange-950 uppercase flex items-center gap-2">
                      <AlertTriangle size={16} className="text-orange-600" />
                      Phát hiện {fontWarningList.length} công dân bị vỡ font / lỗi mã hóa (Đã tự động làm sạch & Lưu thành công)
                    </h4>
                    <span className="text-[10px] font-black bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full uppercase font-bold">
                      Đã lưu CSDL
                    </span>
                  </div>

                  <p className="text-[11px] text-orange-900 font-medium">
                    Hệ thống đã tự động loại bỏ ký tự rác và lưu thành công thông tin công dân vào CSDL. Cán bộ có thể đối soát lại danh sách dưới đây:
                  </p>

                  <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                    {fontWarningList.map((item, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-orange-100 text-xs flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-500">#{item.rowNum}</span>
                          <span className="font-black text-gray-900">{item.fullName}</span>
                          <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                            CCCD: {item.cccd}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-orange-800 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60 truncate max-w-xs">
                          {item.detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KHU VỰC CHI TIẾT DÒNG LỖI & NÚT TẢI BÁO CÁO EXCEL LỖI */}
              {errorList.length > 0 && (
                <div className="bg-red-50/90 border border-red-200 p-4 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-red-950 uppercase flex items-center gap-2">
                        <ShieldAlert size={18} className="text-red-600" />
                        Danh sách chi tiết {errorList.length} dòng lỗi không thể nhập vào CSDL
                      </h4>
                      <p className="text-[11px] text-red-700 font-medium mt-0.5">
                        Tải về báo cáo Excel bên dưới để chỉnh sửa nhanh các dòng bị thiếu hoặc sai sót.
                      </p>
                    </div>

                    {/* NÚT TẢI BÁO CÁO EXCEL LỖI QUAN TRỌNG */}
                    <button
                      onClick={handleDownloadErrorReport}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-all flex items-center gap-2 shrink-0 border border-red-500"
                    >
                      <FileX size={16} />
                      Tải File Excel Báo Cáo Lỗi
                    </button>
                  </div>

                  {/* Bộ lọc loại lỗi */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-black uppercase text-red-900 text-[10px]">Lọc loại lỗi:</span>
                    <select
                      value={filterErrorCategory}
                      onChange={(e) => setFilterErrorCategory(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-950 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="ALL">Tất cả ({errorList.length} dòng)</option>
                      <option value="LOI_FONT_CHINH_TA">
                        Lỗi Font chữ / Mã hóa ({errorList.filter(e => e.errorType === 'LOI_FONT_CHINH_TA').length})
                      </option>
                      <option value="THIEU_CCCD">
                        Thiếu CCCD ({errorList.filter(e => e.errorType === 'THIEU_CCCD').length})
                      </option>
                      <option value="CCCD_SAI_DINH_DANG">
                        CCCD sai định dạng ({errorList.filter(e => e.errorType === 'CCCD_SAI_DINH_DANG').length})
                      </option>
                      <option value="THIEU_HO_TEN">
                        Thiếu Họ tên ({errorList.filter(e => e.errorType === 'THIEU_HO_TEN').length})
                      </option>
                    </select>
                  </div>

                  {/* Danh sách hiển thị lỗi */}
                  <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                    {filteredErrorList.map((err, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-red-200 text-xs flex flex-col gap-1.5 shadow-sm">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-black text-red-950 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded font-mono font-bold text-[10px]">
                              Dòng #{err.rowNum}
                            </span>
                            {err.name ? `• ${err.name}` : ''}
                          </span>
                          {err.cccd && (
                            <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-mono font-bold">
                              CCCD: {err.cccd}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] space-y-1">
                          <p className="text-red-800 font-bold flex items-start gap-1">
                            <span className="text-red-500 font-bold">• Nguyên nhân:</span> {err.reason}
                          </p>
                          <p className="text-gray-600 font-medium flex items-start gap-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                            <span className="text-blue-700 font-bold">💡 Gợi ý điều chỉnh:</span> {err.suggestion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Hệ thống tự động kiểm tra trùng lặp & đồng bộ CSDL công dân
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-black text-xs uppercase hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isCompleted ? 'Đóng cửa sổ' : 'Hủy bỏ'}
            </button>

            {!isCompleted && (
              <button
                onClick={handleStartImport}
                disabled={isProcessing || !selectedFile}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Upload size={16} />
                Bắt đầu quét & Nhập dữ liệu
              </button>
            )}

            {isCompleted && (
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setIsCompleted(false);
                }}
                className="px-5 py-2.5 bg-military-800 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-military-900 active:scale-95 transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Nhập tiếp file Excel khác
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
