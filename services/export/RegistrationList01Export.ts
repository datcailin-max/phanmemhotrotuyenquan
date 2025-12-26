
import XLSX from 'xlsx-js-style';
import { Recruit } from '../../types';

/**
 * MẪU BIỂU 01/GNN-2025: DANH SÁCH CÔNG DÂN NAM ĐỦ 17 TUỔI TRONG NĂM
 */
export class RegistrationList01Export {
  public static export(recruits: Recruit[], sessionYear: number, unitName: string) {
    const XLSXLib: any = XLSX;
    const excelUtils = XLSXLib?.utils || XLSXLib?.default?.utils;
    const excelWrite = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

    if (!excelUtils || !excelWrite) return;

    const wb = excelUtils.book_new();
    const targetBirthYear = sessionYear - 17;

    // 1. Dữ liệu Meta Header
    const metaInfo = [
      ['Biểu số: 01/GNN-2025', '', '', `DANH SÁCH CÔNG DÂN NAM ĐỦ 17 TUỔI TRONG NĂM ${sessionYear}`, '', '', ''],
      ['Khổ biểu: 29,7x21cm', '', '', `(Tính từ ngày..../..../.... Đến..../..../....)`, '', '', ''],
      ['', '', '', '', '', '', ''], // Dòng trống
      ['', '', '', '', '', '', ''], // Dòng trống
    ];

    // 2. Header bảng (7 cột chính)
    const tableHeaders = [
      [
        'Số\nTT', 
        '- Họ, chữ đệm tên khai sinh\n- Họ, chữ đệm tên thường dùng\n- Ngày tháng năm sinh\n- Số Thẻ căn cước/CCCD', 
        'Trình độ văn\nhóa tốt nghiệp\nphổ thông\n(lớp.../12);\nđang học...', 
        '- Nơi thường trú của gđ, bản thân\n- Nơi ở hiện nay của bản thân\n- Nơi làm việc (nếu có)\n- Nơi đăng ký NVQS tại...', 
        '- Thành phần gia đình\n- Thành phần bản thân\n- Dân tộc, tôn giáo', 
        '- Trình độ CMKT, học\nnghề gì? Làm việc gì?\n- Có... anh chị em ruột\n- Là con thứ... trong gđ', 
        '- Họ tên cha, năm sinh, nghề nghiệp\nLiệt sĩ, thương, bệnh binh; hạng (nếu có)\n- Họ tên mẹ, năm sinh, nghề nghiệp\nLiệt sĩ, thương, bệnh binh; hạng (nếu có)'
      ]
    ];

    // 3. Mapping dữ liệu công dân (Lọc đúng 17 tuổi)
    const filteredRecruits = recruits.filter(r => {
        const birthYear = parseInt(r.dob.split('-')[0] || '0');
        return birthYear === targetBirthYear;
    });

    const dataRows = filteredRecruits.map((r, index) => {
      return [
        (index + 1).toString(), // 1
        // 2: Thông tin cá nhân
        `${r.fullName.toUpperCase()}\n${r.fullName.toUpperCase()}\n${r.dob ? r.dob.split('-').reverse().join('/') : '---'}\n${r.citizenId || '---'}`,
        // 3: Học vấn
        r.details.education,
        // 4: Địa chỉ
        `${r.address.village}, ${r.address.commune}, ${r.address.province}\n${r.address.street || '---'}\n${r.details.workAddress || '---'}\nBan CHQS ${r.address.commune}`,
        // 5: Thành phần
        `${r.details.familyComposition || '---'}\n${r.details.personalComposition || '---'}\n${r.details.ethnicity}, ${r.details.religion}`,
        // 6: CMKT & Gia cảnh
        `${r.details.major || '---'}, ${r.details.job || '---'}\nCó ... anh chị em\nLà con thứ ...`,
        // 7: Cha mẹ
        `Cha: ${r.family.father.fullName}, ${r.family.father.birthYear}, ${r.family.father.job}\n\nMẹ: ${r.family.mother.fullName}, ${r.family.mother.birthYear}, ${r.family.mother.job}`
      ];
    });

    const colNums = ['1', '2', '3', '4', '5', '6', '7'];
    const allData = [...metaInfo, ...tableHeaders, colNums, ...dataRows];
    const ws = excelUtils.aoa_to_sheet(allData);

    // 4. Merges & Widths
    ws['!merges'] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 5 } }, // Tiêu đề chính
      { s: { r: 1, c: 3 }, e: { r: 1, c: 5 } }, // Dòng thời gian
    ];

    ws['!cols'] = [
      { wch: 5 },   // 1
      { wch: 30 },  // 2
      { wch: 15 },  // 3
      { wch: 35 },  // 4
      { wch: 25 },  // 5
      { wch: 25 },  // 6
      { wch: 45 }   // 7
    ];

    // 5. Styles
    const border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    const range = excelUtils.decode_range(ws['!ref'] || 'A1:G100');
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = excelUtils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        
        ws[addr].s = { font: { name: 'Times New Roman', size: 10 }, alignment: { wrapText: true, vertical: 'top' } };
        
        // Style cho Header trang
        if (R < 4) {
            ws[addr].s.alignment = { horizontal: C >= 3 ? 'center' : 'left' };
            if (R <= 1) ws[addr].s.font.bold = true;
        } 
        // Style cho Header bảng (Dòng 5, 6)
        else if (R === 4 || R === 5) {
            ws[addr].s.font.bold = true;
            ws[addr].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
            ws[addr].s.border = border;
        } 
        // Style cho Dữ liệu
        else {
            ws[addr].s.border = border;
            if (C === 0 || C === 2) ws[addr].s.alignment.horizontal = 'center';
        }
      }
    }

    // Độ cao dòng
    ws['!rows'] = [];
    ws['!rows'][4] = { hpt: 120 }; // Header chính cao hơn

    excelUtils.book_append_sheet(wb, ws, 'Danh sach 17 tuoi');
    excelWrite(wb, `Danh_Sach_17_Tuoi_Mau_01_${unitName}_${sessionYear}.xlsx`);
  }
}
