
import XLSX from 'xlsx-js-style';
import { Recruit } from '../../types';

/**
 * MẪU BIỂU 16B/GNN-2025: DANH SÁCH CÔNG DÂN TẠM HOÃN GỌI NHẬP NGŨ
 */
export class DefermentListExport {
  public static export(recruits: Recruit[], sessionYear: number, unitName: string) {
    const XLSXLib: any = XLSX;
    const excelUtils = XLSXLib?.utils || XLSXLib?.default?.utils;
    const excelWrite = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

    if (!excelUtils || !excelWrite) return;

    const wb = excelUtils.book_new();
    
    // 1. Dữ liệu Meta (Thông tin phía trên bảng)
    const metaInfo = [
      ['Biểu số: 16B/GNN-2025', '', '', 'Phụ lục II', '', '', '', ''],
      ['Khổ biểu: 29,7x21cm', '', '', `DANH SÁCH CÔNG DÂN TẠM HOÃN GỌI NHẬP NGŨ NĂM ${sessionYear}`, '', '', '', ''],
      ['', '', '', `(Kèm theo Báo cáo số: ...../.... ngày....tháng....năm....của ${unitName})`, '', '', '', ''],
      ['', '', '', '', '', '', '', ''], // Dòng trống
      ['', '', '', '', '', '', '', ''], // Dòng trống
    ];

    // 2. Header của bảng (Mapping chính xác theo ảnh mẫu)
    const tableHeaders = [
      [
        'Số TT', 
        '- Họ, chữ đệm và tên khai sinh\n- Họ, chữ đệm và tên thường dùng\n- Ngày, tháng, năm sinh\n- Số thẻ căn cước/CCCD', 
        '- Nghề nghiệp\n- Nơi làm việc\n- Nhóm, ngạch, bậc lương', 
        '- Nơi thường trú của gia đình; bản thân\n- Nơi ở hiện nay của bản thân\n- Nơi làm việc (nếu có)', 
        '- Thành phần gia đình\n- Thành phần bản thân\n- Dân tộc, tôn giáo', 
        '- Trình độ văn hóa, CMKT\n- Ngoại ngữ\n- Đảng, đoàn', 
        '- Họ và tên cha, năm sinh, nghề nghiệp\n- Họ và tên mẹ, năm sinh, nghề nghiệp\n- Họ và tên vợ (chồng), năm sinh, nghề nghiệp', 
        'Lý do\ntạm hoãn gọi nhập ngũ'
      ]
    ];

    // 3. Ánh xạ dữ liệu công dân (Mapping data)
    const dataRows = recruits.map((r, index) => {
      // Định dạng thông tin Đảng/Đoàn
      const political = r.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : (r.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng');
      
      return [
        (index + 1).toString(), // Cột A: STT
        // Cột B: Thông tin cá nhân gộp
        `${r.fullName.toUpperCase()}\n${r.fullName.toUpperCase()}\n${r.dob ? new Date(r.dob).toLocaleDateString('vi-VN') : '---'}\nCCCD: ${r.citizenId || '---'}`, 
        // Cột C: Nghề nghiệp
        `${r.details.job || 'Lao động tự do'}\n${r.details.workAddress || 'Tại địa phương'}\n${r.details.gradeGroup || '---'} - ${r.details.salaryLevel || '---'}`, 
        // Cột D: Địa chỉ
        `${r.address.village}, ${r.address.commune}, ${r.address.province}\n${r.address.street || 'Không'}\n${r.details.workAddress || '---'}`, 
        // Cột E: Thành phần
        `${r.details.familyComposition || 'Bần nông'}\n${r.details.personalComposition || 'Phụ thuộc'}\n${r.details.ethnicity}, ${r.details.religion}`, 
        // Cột F: Trình độ
        `${r.details.education}\nNgoại ngữ: ---\n${political}`, 
        // Cột G: Thông tin gia đình gộp
        `Cha: ${r.family.father.fullName} (${r.family.father.birthYear || '---'}), ${r.family.father.job}\nMẹ: ${r.family.mother.fullName} (${r.family.mother.birthYear || '---'}), ${r.family.mother.job}\nVợ/Chồng: ${r.family.wife?.fullName || '---'}`, 
        // Cột H: Lý do tạm hoãn
        r.defermentReason || 'Chưa xác định' 
      ];
    });

    const allData = [...metaInfo, ...tableHeaders, ...dataRows];
    const ws = excelUtils.aoa_to_sheet(allData);

    // 4. Thiết lập Gộp ô (Merges)
    ws['!merges'] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }, // Phụ lục II
      { s: { r: 1, c: 3 }, e: { r: 1, c: 6 } }, // Tiêu đề chính
      { s: { r: 2, c: 3 }, e: { r: 2, c: 6 } }, // Dòng căn cứ báo cáo
    ];

    // 5. Thiết lập Độ rộng cột (Widths)
    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 32 }, // Họ tên
      { wch: 25 }, // Nghề nghiệp
      { wch: 35 }, // Nơi trú
      { wch: 25 }, // Thành phần
      { wch: 22 }, // Trình độ
      { wch: 48 }, // Gia đình
      { wch: 32 }  // Lý do hoãn
    ];

    // 6. Áp dụng Style chuẩn quân sự
    const commonStyle = { 
        font: { name: 'Times New Roman', size: 10 }, 
        alignment: { wrapText: true, vertical: 'top', horizontal: 'left' } 
    };
    const headerTableStyle = {
        font: { name: 'Times New Roman', size: 10, bold: true },
        alignment: { wrapText: true, vertical: 'center', horizontal: 'center' },
        border: { 
            top: { style: 'thin' }, bottom: { style: 'thin' }, 
            left: { style: 'thin' }, right: { style: 'thin' } 
        },
        fill: { fgColor: { rgb: "E9ECEF" } }
    };
    const dataCellStyle = {
        font: { name: 'Times New Roman', size: 10 },
        alignment: { wrapText: true, vertical: 'top', horizontal: 'left' },
        border: { 
            top: { style: 'thin' }, bottom: { style: 'thin' }, 
            left: { style: 'thin' }, right: { style: 'thin' } 
        }
    };

    const range = excelUtils.decode_range(ws['!ref'] || 'A1:H100');
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = excelUtils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        
        // Style cho Header trang (Thông tin chung phía trên)
        if (R < 5) {
            ws[addr].s = { 
                font: { name: 'Times New Roman', size: R === 1 ? 12 : 10, bold: R <= 2 },
                alignment: { horizontal: C >= 3 ? 'center' : 'left' }
            };
        } 
        // Style cho Header của Bảng (Dòng tiêu đề cột)
        else if (R === 5) {
            ws[addr].s = headerTableStyle;
        } 
        // Style cho các dòng dữ liệu
        else {
            ws[addr].s = {
                ...dataCellStyle,
                alignment: { ...dataCellStyle.alignment, horizontal: C === 0 ? 'center' : 'left' }
            };
        }
      }
    }

    // Thiết lập độ cao dòng tự động
    ws['!rows'] = [];
    ws['!rows'][5] = { hpt: 90 }; // Dòng header bảng cao hơn
    for(let i = 6; i <= range.e.r; i++) ws['!rows'][i] = { hpt: 120 }; // Các dòng dữ liệu gộp ô nên cần cao

    excelUtils.book_append_sheet(wb, ws, 'DS Tam Hoan');
    excelWrite(wb, `DS_Tam_Hoan_Nhap_Ngu_${unitName.replace(/\s+/g, '_')}_${sessionYear}.xlsx`);
  }
}
