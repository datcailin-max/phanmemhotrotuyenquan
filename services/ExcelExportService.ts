
import XLSX from 'xlsx-js-style';
import { Recruit } from '../types';

/**
 * Service xử lý xuất dữ liệu Excel với định dạng chuyên sâu (styled)
 * Sử dụng thư viện xlsx-js-style để giữ nguyên định dạng, kẻ bảng và căn lề.
 */
export class ExcelExportService {
  /**
   * Xuất danh sách công dân ra file Excel theo mẫu Danh sách 4
   * @param recruits Danh sách công dân cần xuất
   * @param title Tiêu đề của danh sách (VD: DANH SÁCH NGUỒN CÔNG DÂN GỌI NHẬP NGŨ NĂM 2025)
   * @param fileName Tên file xuất ra
   */
  public static exportToTemplate(recruits: Recruit[], title: string = 'DANH SÁCH CÔNG DÂN', fileName: string = 'danh_sach_tuyen_quan.xlsx') {
    // Sửa lỗi import: Kiểm tra xem XLSX có được load đúng không
    // Với esm.sh, đôi khi cần truy cập qua .utils trên đối tượng default hoặc trực tiếp
    const excelUtils = XLSX?.utils;

    if (!excelUtils) {
      console.error("XLSX.utils is undefined. Check library import.", XLSX);
      alert("Lỗi: Không thể khởi tạo công cụ xuất Excel. Vui lòng thử lại sau.");
      return;
    }

    const wb = excelUtils.book_new();
    
    // 1. Định nghĩa Headers theo mẫu trong ảnh
    const headers = [
      ['Số TT', 'Họ, chữ đệm và tên thường dùng\n- Họ, chữ đệm và tên khai sinh\n- Ngày, tháng, năm sinh', 'Nghề nghiệp\n- Nơi làm việc\n- Nhóm, ngạch,\n- Bậc lương', 'Nơi thường trú của gia đình; bản thân\n- Nơi ở hiện nay của bản thân\n- Nơi làm việc (nếu có)', 'Thành phần gia đình\n- Thành phần bản thân\n- Dân tộc\n- Tôn giáo', 'Học vấn, CMKT\n- Ngoại ngữ\n- Đảng, đoàn', 'Họ tên cha, năm sinh, nghề nghiệp\n- Họ tên mẹ, năm sinh, nghề nghiệp\n- Họ và tên vợ (chồng), năm sinh, nghề nghiệp', 'Khen thưởng\n- Kỷ luật\n- Sức khỏe', 'Ghi chú']
    ];

    // 2. Chuyển đổi dữ liệu từ mảng Recruit sang định dạng dòng của Excel
    const dataRows = recruits.map((r, index) => {
      // Cột B: Họ tên + Ngày sinh
      const colB = `${r.fullName.toUpperCase()}\nSinh ngày: ${r.dob ? new Date(r.dob).toLocaleDateString('vi-VN') : '---'}`;
      
      // Cột C: Nghề nghiệp
      const colC = `${r.details.job || 'Lao động tự do'}\n${r.details.school || ''}`;
      
      // Cột D: Địa chỉ
      const colD = `${r.address.village}, ${r.address.commune}, ${r.address.province}\nHiện nay: ${r.address.street || ''} ${r.address.village}`;
      
      // Cột E: Thành phần, Dân tộc, Tôn giáo
      const colE = `GĐ: Lao động\nBT: ${r.details.job || 'Lao động'}\nDT: ${r.details.ethnicity}\nTG: ${r.details.religion}`;
      
      // Cột F: Học vấn, Đảng, Đoàn
      const polStatus = r.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : (r.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng');
      const colF = `${r.details.education}\n${polStatus}${r.details.partyEntryDate ? ` (${r.details.partyEntryDate})` : ''}`;
      
      // Cột G: Gia đình (Cha, Mẹ, Vợ)
      const colG = `Cha: ${r.family.father.fullName} (${r.family.father.job})\nMẹ: ${r.family.mother.fullName} (${r.family.mother.job})\n${r.family.wife?.fullName ? `Vợ: ${r.family.wife.fullName}` : ''}`;
      
      // Cột H: Sức khỏe
      const colH = `Sức khỏe: Loại ${r.physical.healthGrade || '...'}\nCao: ${r.physical.height}cm, Nặng: ${r.physical.weight}kg`;

      return [
        (index + 1).toString(),
        colB,
        colC,
        colD,
        colE,
        colF,
        colG,
        colH,
        r.defermentReason || ''
      ];
    });

    // Tạo sheet từ dữ liệu
    const ws = excelUtils.aoa_to_sheet([...headers, ...dataRows]);

    // 3. Định dạng Style cho các ô
    const headerStyle = {
      font: { bold: true, size: 10, name: 'Times New Roman' },
      alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      },
      fill: { fgColor: { rgb: "E9E9E9" } }
    };

    const cellStyle = {
      font: { size: 10, name: 'Times New Roman' },
      alignment: { vertical: 'top', horizontal: 'left', wrapText: true },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    const sttStyle = {
      ...cellStyle,
      alignment: { vertical: 'center', horizontal: 'center' }
    };

    // Áp dụng style cho header (Dòng 1)
    const range = excelUtils.decode_range(ws['!ref'] || 'A1:I1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = excelUtils.encode_cell({ r: 0, c: C });
      if (!ws[address]) continue;
      ws[address].s = headerStyle;
    }

    // Áp dụng style cho dữ liệu (Từ dòng 2 trở đi)
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = excelUtils.encode_cell({ r: R, c: C });
        if (!ws[address]) continue;
        ws[address].s = (C === 0) ? sttStyle : cellStyle;
      }
    }

    // 4. Thiết lập độ rộng cột (Căn chỉnh theo mẫu)
    ws['!cols'] = [
      { wch: 6 },  // A: STT
      { wch: 35 }, // B: Họ tên
      { wch: 25 }, // C: Nghề nghiệp
      { wch: 35 }, // D: Nơi cư trú
      { wch: 25 }, // E: Thành phần
      { wch: 20 }, // F: Học vấn
      { wch: 45 }, // G: Gia đình
      { wch: 25 }, // H: Sức khỏe
      { wch: 20 }  // I: Ghi chú
    ];

    // Thiết lập độ cao dòng (Để nội dung wrap text hiển thị đẹp)
    ws['!rows'] = [
      { hpt: 80 }, // Header cao hơn
      ...dataRows.map(() => ({ hpt: 100 })) // Các dòng dữ liệu cao để in ấn rõ ràng
    ];

    excelUtils.book_append_sheet(wb, ws, 'Danh sách 4');

    // 5. Xuất file
    XLSX.writeFile(wb, fileName);
  }
}
