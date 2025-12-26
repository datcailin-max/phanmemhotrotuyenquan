
import XLSX from 'xlsx-js-style';
import { Recruit } from '../../types';

/**
 * MẪU BIỂU 16C/GNN-2025: DANH SÁCH CÔNG DÂN ĐỦ ĐIỀU KIỆN GỌI SƠ TUYỂN
 */
export class PreCheckListExport {
  public static export(recruits: Recruit[], sessionYear: number, unitName: string) {
    const XLSXLib: any = XLSX;
    const excelUtils = XLSXLib?.utils || XLSXLib?.default?.utils;
    const excelWrite = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

    if (!excelUtils || !excelWrite) return;

    const wb = excelUtils.book_new();
    
    // 1. Dữ liệu Meta (Header phía trên bảng)
    const metaInfo = [
      ['Biểu số: 16C/GNN-2025', '', '', 'Phụ lục III', '', '', '', ''],
      ['Khổ biểu: 29,7x21cm', '', '', `DANH SÁCH CÔNG DÂN ĐỦ ĐIỀU KIỆN GỌI SƠ TUYỂN NGHĨA VỤ QUÂN SỰ`, '', '', '', ''],
      ['', '', '', `VÀ THỰC HIỆN NGHĨA VỤ THAM GIA CÔNG AN NHÂN DÂN NĂM ${sessionYear}`, '', '', '', ''],
      ['', '', '', `(Kèm theo Báo cáo số: ...../.... ngày....tháng....năm....của ${unitName})`, '', '', '', ''],
      ['', '', '', '', '', '', '', ''], // Dòng trống
    ];

    // 2. Header của bảng (Cấu trúc 8 cột theo ảnh mẫu)
    const tableHeaders = [
      [
        'Số TT', 
        '- Họ, chữ đệm và tên khai sinh\n- Họ, chữ đệm và tên thường dùng\n- Ngày, tháng, năm sinh\n- Số thẻ căn cước/CCCD', 
        '- Nghề nghiệp\n- Nơi làm việc\n- Nhóm, ngạch, bậc lương', 
        '- Nơi thường trú của gia đình; bản thân\n- Nơi ở hiện nay của bản thân\n- Nơi làm việc (nếu có)', 
        '- Thành phần gia đình\n- Thành phần bản thân\n- Dân tộc, tôn giáo', 
        '- Trình độ văn hóa, CMKT\n- Ngoại ngữ\n- Đảng, đoàn', 
        '- Họ và tên cha, năm sinh, nghề nghiệp\n- Họ và tên mẹ, năm sinh, nghề nghiệp\n- Họ và tên vợ (chồng), năm sinh, nghề nghiệp', 
        'Ghi chú'
      ]
    ];

    // 3. Mapping dữ liệu công dân
    const dataRows = recruits.map((r, index) => {
      const political = r.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : (r.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng');
      
      return [
        (index + 1).toString(), // A: STT
        `${r.fullName.toUpperCase()}\n${r.fullName.toUpperCase()}\n${r.dob ? new Date(r.dob).toLocaleDateString('vi-VN') : '---'}\nCCCD: ${r.citizenId || '---'}`, // B
        `${r.details.job || 'Lao động tự do'}\n${r.details.workAddress || 'Tại địa phương'}\n${r.details.gradeGroup || '---'} - ${r.details.salaryLevel || '---'}`, // C
        `${r.address.village}, ${r.address.commune}, ${r.address.province}\n${r.address.street || 'Không'}\n${r.details.workAddress || '---'}`, // D
        `${r.details.familyComposition || 'Bần nông'}\n${r.details.personalComposition || 'Phụ thuộc'}\n${r.details.ethnicity}, ${r.details.religion}`, // E
        `${r.details.education}\nNgoại ngữ: ---\n${political}`, // F
        `Cha: ${r.family.father.fullName} (${r.family.father.birthYear || '---'}), ${r.family.father.job}\nMẹ: ${r.family.mother.fullName} (${r.family.mother.birthYear || '---'}), ${r.family.mother.job}\nVợ/Chồng: ${r.family.wife?.fullName || '---'}`, // G
        r.physical.note || '' // H: Ghi chú (Dùng note sức khỏe hoặc các ghi chú khác)
      ];
    });

    const allData = [...metaInfo, ...tableHeaders, ...dataRows];
    const ws = excelUtils.aoa_to_sheet(allData);

    // 4. Định dạng Merges
    ws['!merges'] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }, // Phụ lục III
      { s: { r: 1, c: 3 }, e: { r: 1, c: 6 } }, // Tiêu đề chính dòng 1
      { s: { r: 2, c: 3 }, e: { r: 2, c: 6 } }, // Tiêu đề chính dòng 2
      { s: { r: 3, c: 3 }, e: { r: 3, c: 6 } }, // Dòng căn cứ
    ];

    // 5. Thiết lập độ rộng cột
    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 32 }, // Họ tên
      { wch: 25 }, // Nghề nghiệp
      { wch: 35 }, // Nơi trú
      { wch: 25 }, // Thành phần
      { wch: 22 }, // Trình độ
      { wch: 48 }, // Gia đình
      { wch: 20 }  // Ghi chú
    ];

    // 6. Áp dụng Style
    const borderStyle = { 
        top: { style: 'thin' }, bottom: { style: 'thin' }, 
        left: { style: 'thin' }, right: { style: 'thin' } 
    };

    const range = excelUtils.decode_range(ws['!ref'] || 'A1:H100');
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = excelUtils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        
        // Style cho Header trang
        if (R < 5) {
            ws[addr].s = { 
                font: { name: 'Times New Roman', size: (R >= 1 && R <= 2) ? 12 : 10, bold: R <= 2 },
                alignment: { horizontal: C >= 3 ? 'center' : 'left' }
            };
        } 
        // Style cho Header của Bảng (Dòng 6)
        else if (R === 5) {
            ws[addr].s = { 
                font: { name: 'Times New Roman', size: 10, bold: true },
                alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                border: borderStyle,
                fill: { fgColor: { rgb: "F2F2F2" } }
            };
        } 
        // Style cho Dữ liệu
        else {
            ws[addr].s = { 
                font: { name: 'Times New Roman', size: 10 },
                alignment: { wrapText: true, vertical: 'top', horizontal: C === 0 ? 'center' : 'left' },
                border: borderStyle
            };
        }
      }
    }

    // Thiết lập độ cao dòng
    ws['!rows'] = [];
    ws['!rows'][5] = { hpt: 90 };
    for(let i = 6; i <= range.e.r; i++) ws['!rows'][i] = { hpt: 120 };

    excelUtils.book_append_sheet(wb, ws, 'DS So Tuyen');
    excelWrite(wb, `DS_Du_Dieu_Kien_So_Tuyen_${unitName.replace(/\s+/g, '_')}_${sessionYear}.xlsx`);
  }
}
