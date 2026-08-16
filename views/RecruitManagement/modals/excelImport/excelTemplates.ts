import XLSX from 'xlsx-js-style';
import { ProcessError, FontWarningNotice, ErrorType } from './types';
import { api } from '../../../../api';

// Tải mẫu Excel 1: Đăng ký lần đầu (Tuổi 17) - Biểu 01/GNN-2025
export const handleDownloadTemplate17 = async (sessionYear: number) => {
  try {
    const master = await api.getMasterExcelTemplate('17').catch(() => null);
    if (master?.url) {
      if (master.url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = master.url;
        link.download = master.name || `Excel_Mau_01_Dang_Ky_Lan_Dau_17_Tuoi_${sessionYear}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(master.url, '_blank');
      }
      return;
    }
  } catch (e) {
    console.warn("Không thể lấy mẫu Excel 17 từ Admin, sử dụng mẫu mặc định:", e);
  }

  const XLSXLib: any = XLSX;
  const utils = XLSXLib?.utils || XLSXLib?.default?.utils;
  const writeFile = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

  if (!utils || !writeFile) {
    alert("Không thể khởi tạo thư viện Excel!");
    return;
  }

  const templateData = [
    ["Biểu số: 01/GNN-2025", "", "", `DANH SÁCH CÔNG DÂN NAM ĐỦ 17 TUỔI TRONG NĂM ${sessionYear}`, "", "", "", ""],
    ["Khổ biểu: 29,7x21cm", "", "", "(Tính từ ngày..../..../.... Đến..../..../....)", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    [
      "Số\nTT", 
      "- Họ, chữ đệm tên khai sinh\n- Họ, chữ đệm tên thường dùng\n- Ngày tháng năm sinh\n- Số Thẻ căn cước/CCCD", 
      "Trình độ văn hóa tốt nghiệp phổ thông (lớp.../12); đang học...", 
      "- Nơi thường trú của gđ, bản thân\n- Nơi ở hiện nay của bản thân\n- Nơi làm việc (nếu có)\n- Nơi đăng ký NVQS tại...", 
      "- Thành phần gia đình\n- Thành phần bản thân\n- Dân tộc, tôn giáo", 
      "- Trình độ CMKT, học nghề gì? Làm việc gì?\n- Có... anh chị em ruột\n- Là con thứ... trong gđ", 
      "- Họ tên cha, năm sinh, nghề nghiệp\n- Họ tên mẹ, năm sinh, nghề nghiệp", 
      "GHI CHÚ"
    ],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [
      1,
      `- BẾ ĐĂNG KHÔI\n- BẾ ĐĂNG KHÔI\n- 09/12/${sessionYear - 17}\n- 040208017552`,
      "- 11/12",
      "- thôn Lộc Thái 3, Xã Lộc Ninh, Đồng Nai\n- thôn Lộc Thái 3, Xã Lộc Ninh, Đồng Nai\n- Ban CHQS Xã Lộc Ninh",
      "- Trung nông\n- Phụ thuộc\n- Kinh, Không",
      "- Học sinh",
      "- Cha: Bế Đăng Tuấn, 1980, NV ngân hàng\n- Mẹ: Võ Thị Kiều Oanh, 1982, NV ngân hàng",
      "- ĐK Lần đầu"
    ],
    [
      2,
      "- BÙI ĐIỀN TƯỜNG\n- BÙI ĐIỀN TƯỜNG\n- 22/03/2008\n- 070208002346",
      "- 11/12",
      "- thôn Lộc Thuận 9, Xã Lộc Ninh, Đồng Nai\n- thôn Lộc Thuận 9, Xã Lộc Ninh, Đồng Nai\n- Ban CHQS Xã Lộc Ninh",
      "- Trung nông\n- Phụ thuộc\n- Kinh, Không",
      "- Học sinh",
      "- Cha: Bùi Điền Du, 1978, Làm vườn\n- Mẹ: Trần Thị Kim Phương, 1980, Làm vườn",
      "- ĐK Lần đầu"
    ]
  ];

  const ws = utils.aoa_to_sheet(templateData);
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 30 }, // Họ tên / DOB / CCCD
    { wch: 20 }, // Trình độ VH
    { wch: 35 }, // Nơi trú
    { wch: 22 }, // Thành phần
    { wch: 22 }, // CMKT
    { wch: 45 }, // Thân nhân
    { wch: 20 }  // Ghi chú
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Mau_01_DK_Lan_Dau");
  writeFile(wb, `Excel_Mau_01_Dang_Ky_Lan_Dau_17_Tuoi_${sessionYear}.xlsx`);
};

// Tải mẫu Excel 2: Danh sách nguồn tuyển quân & các danh sách còn lại - Mẫu Biểu số 16B/16A
export const handleDownloadTemplateSource = async (sessionYear: number, userCommune?: string) => {
  try {
    const master = await api.getMasterExcelTemplate('SOURCE').catch(() => null);
    if (master?.url) {
      if (master.url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = master.url;
        link.download = master.name || `Excel_Mau_Danh_Sach_Nguon_Tuyen_Quan_${sessionYear}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(master.url, '_blank');
      }
      return;
    }
  } catch (e) {
    console.warn("Không thể lấy mẫu Excel Nguồn từ Admin, sử dụng mẫu mặc định:", e);
  }

  const XLSXLib: any = XLSX;
  const utils = XLSXLib?.utils || XLSXLib?.default?.utils;
  const writeFile = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

  if (!utils || !writeFile) {
    alert("Không thể khởi tạo thư viện Excel!");
    return;
  }

  const templateData = [
    ["Biểu số: 16B/GNN-2025", "", "", `DANH SÁCH NGUỒN CÔNG DÂN TUYỂN QUÂN NĂM ${sessionYear}`, "", "", "", "", ""],
    ["Khổ biểu: 29,7x21cm", "", "", `Đơn vị: ${userCommune || 'Mỹ Hòa Hưng'}`, "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    [
      "Số TT", 
      "- Họ, chữ đệm và tên khai sinh\n- Họ, chữ đệm và tên thường dùng\n- Ngày, tháng, năm sinh\n- Số thẻ căn cước/CCCD", 
      "- Nghề nghiệp\n- Nơi làm việc\n- Nhóm, ngạch, bậc lương", 
      "- Nơi thường trú của gia đình; bản thân\n- Nơi ở hiện nay của bản thân\n- Nơi làm việc (nếu có)", 
      "- Thành phần gia đình\n- Thành phần bản thân\n- Dân tộc, tôn giáo", 
      "- Trình độ văn hóa, CMKT\n- Ngoại ngữ\n- Đảng, đoàn", 
      "- Họ và tên cha, năm sinh, nghề nghiệp\n- Họ và tên mẹ, năm sinh, nghề nghiệp\n- Họ và tên vợ (chồng), năm sinh, nghề nghiệp", 
      "- Khen thưởng\n- Kỷ luật\n- Sức khỏe", 
      "GHI CHÚ"
    ],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [
      1, 
      "- BÀNH THỤC MINH\n- BÀNH THỤC MINH\n- 28/01/2007\n- 070207010085", 
      "- Công nhân", 
      "- Tổ 1 Khu phố Ninh Phú, Xã Lộc Ninh, Đồng Nai\n- Tổ 1 Khu phố Ninh Phú, Xã Lộc Ninh, Đồng Nai", 
      "- Bần nông\n- Phụ thuộc\n- Kinh, Không", 
      "- 12/12\n- Đoàn viên", 
      "- Cha: Bành Mỹ Bình, 1975, Làm nông\n- Mẹ: Tiêu Hòa, 1978, Buôn bán", 
      "- Sức khỏe: Loại 1", 
      "- Tạm hoãn: 9."
    ],
    [
      2, 
      "- NGUYỄN VĂN A\n- NGUYỄN VĂN A\n- 15/05/2005\n- 038205001234", 
      "- Sinh viên", 
      "- Ấp Mỹ An, Xã Mỹ Hòa Hưng, TP Long Xuyên", 
      "- Nông dân\n- Phụ thuộc\n- Kinh, Không", 
      "- 12/12\n- Cao đẳng CNTT\n- Đoàn viên", 
      "- Cha: Nguyễn Văn B, 1972, Làm nông\n- Mẹ: Trần Thị C, 1975, Nội trợ", 
      "- Sức khỏe: Loại 2", 
      "- Tạm hoãn học tập"
    ]
  ];

  const ws = utils.aoa_to_sheet(templateData);
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 30 }, // Họ tên / DOB / CCCD
    { wch: 22 }, // Nghề nghiệp
    { wch: 35 }, // Địa chỉ
    { wch: 22 }, // Thành phần
    { wch: 22 }, // Trình độ
    { wch: 45 }, // Thân nhân
    { wch: 22 }, // Khen thưởng / SK
    { wch: 25 }  // Ghi chú
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Mau_Nguon_Tuyen_Quan");
  writeFile(wb, `Excel_Mau_Danh_Sach_Nguon_Tuyen_Quan_${sessionYear}.xlsx`);
};

// Tải báo cáo lỗi Excel chi tiết cho cán bộ
export const handleDownloadErrorReport = (
  errorList: ProcessError[], 
  fontWarningList: FontWarningNotice[], 
  sessionYear: number, 
  selectedFileName?: string
) => {
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
      [`Tệp Excel nguồn: ${selectedFileName || 'Tệp tải lên'} - Tổng số dòng lỗi: ${errorList.length} dòng`],
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
      [`Tệp Excel nguồn: ${selectedFileName || 'Tệp tải lên'} - Tổng số cảnh báo: ${fontWarningList.length} trường hợp`],
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
