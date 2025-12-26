
import XLSX from 'xlsx-js-style';
import { Recruit } from '../../types';

/**
 * MẪU BIỂU 17A/GNN-2025: DANH SÁCH GỌI CÔNG DÂN NHẬP NGŨ
 */
export class EnlistmentList17AExport {
  public static export(recruits: Recruit[], sessionYear: number, unitName: string) {
    const XLSXLib: any = XLSX;
    const excelUtils = XLSXLib?.utils || XLSXLib?.default?.utils;
    const excelWrite = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

    if (!excelUtils || !excelWrite) return;

    const wb = excelUtils.book_new();

    // 1. Dữ liệu Meta Header
    const metaInfo = [
      ['Biểu số: 17A/GNN-2025', '', '', 'Phụ lục I', '', '', '', ''],
      ['Khổ biểu: 29,7x21cm', '', '', `DANH SÁCH GỌI CÔNG DÂN NHẬP NGŨ NĂM ${sessionYear}`, '', '', '', ''],
      ['', '', '', `(Kèm theo Báo cáo số: ...../.... ngày....tháng....năm....của ${unitName})`, '', '', '', ''],
      ['', '', '', '', '', '', '', ''], // Dòng trống
      ['', '', '', '', '', '', '', ''], // Dòng trống
    ];

    // 2. Header bảng (8 cột chính)
    const tableHeaders = [
      [
        'Số TT', 
        '- Họ, chữ đệm và tên khai sinh\n- Họ, chữ đệm và tên thường dùng\n- Ngày, tháng, năm sinh\n- Số thẻ căn cước/CCCD', 
        '- Nghề nghiệp\n- Nơi làm việc\n- Nhóm, ngạch, bậc lương',
        '- Nơi thường trú của gia đình; bản thân\n- Nơi ở hiện nay của bản thân\n- Nơi làm việc (nếu có)', 
        '- Thành phần gia đình\n- Thành phần bản thân\n- Dân tộc, tôn giáo\n- Sức khỏe đạt loại', 
        '- Trình độ văn hóa, CMKT\n- Ngoại ngữ\n- Đảng, đoàn', 
        '- Họ và tên cha, năm sinh, nghề nghiệp\n- Họ và tên mẹ, năm sinh, nghề nghiệp\n- Họ và tên vợ (chồng), năm sinh, nghề nghiệp',
        'Ghi chú'
      ]
    ];

    // 3. Mapping dữ liệu công dân (Danh sách 11)
    const dataRows = recruits.map((r, index) => {
      const political = r.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : (r.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng');
      
      return [
        (index + 1).toString(), // 1. Số TT
        // 2. Thông tin cá nhân
        `${r.fullName.toUpperCase()}\n${r.fullName.toUpperCase()}\n${r.dob ? r.dob.split('-').reverse().join('/') : '---'}\nCCCD: ${r.citizenId || '---'}`,
        // 3. Nghề nghiệp
        `${r.details.job || '---'}\n${r.details.workAddress || '---'}\n${r.details.gradeGroup || '---'}-${r.details.salaryLevel || '---'}`,
        // 4. Địa chỉ
        `${r.address.village}, ${r.address.commune}, ${r.address.province}\n${r.address.street || '---'}\n${r.details.workAddress || '---'}`,
        // 5. Thành phần & Sức khỏe
        `${r.details.familyComposition || '---'}\n${r.details.personalComposition || '---'}\n${r.details.ethnicity}, ${r.details.religion}\nLoại ${r.physical.healthGrade || '---'}`,
        // 6. Trình độ
        `${r.details.education}\nNgoại ngữ: ---\n${political}`,
        // 7. Cha mẹ/Vợ chồng
        `Cha: ${r.family.father.fullName} (${r.family.father.birthYear}), ${r.family.father.job}\nMẹ: ${r.family.mother.fullName} (${r.family.mother.birthYear}), ${r.family.mother.job}\nVợ: ${r.family.wife?.fullName || '---'}`,
        // 8. Ghi chú
        `Đơn vị: ${r.enlistmentUnit || '---'}`
      ];
    });

    const allData = [...metaInfo, ...tableHeaders, ...dataRows];
    const ws = excelUtils.aoa_to_sheet(allData);

    // 4. Merges & Widths
    ws['!merges'] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }, // Phụ lục I
      { s: { r: 1, c: 3 }, e: { r: 1, c: 6 } }, // Tiêu đề chính
      { s: { r: 2, c: 3 }, e: { r: 2, c: 6 } }, // Căn cứ báo cáo
    ];

    ws['!cols'] = [
      { wch: 6 },   // 1
      { wch: 32 },  // 2
      { wch: 25 },  // 3
      { wch: 35 },  // 4
      { wch: 25 },  // 5
      { wch: 20 },  // 6
      { wch: 48 },  // 7
      { wch: 20 }   // 8
    ];

    // 5. Styles
    const border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    const range = excelUtils.decode_range(ws['!ref'] || 'A1:H100');
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = excelUtils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        
        ws[addr].s = { font: { name: 'Times New Roman', size: 10 }, alignment: { wrapText: true, vertical: 'top' } };
        
        if (R < 5) {
            ws[addr].s.alignment = { horizontal: C >= 3 ? 'center' : 'left' };
            if (R === 1) ws[addr].s.font.bold = true;
        } 
        else if (R === 5) {
            ws[addr].s.font.bold = true;
            ws[addr].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
            ws[addr].s.border = border;
            ws[addr].s.fill = { fgColor: { rgb: "F2F2F2" } };
        } 
        else {
            ws[addr].s.border = border;
            if (C === 0) ws[addr].s.alignment.horizontal = 'center';
        }
      }
    }

    ws['!rows'] = [];
    ws['!rows'][5] = { hpt: 90 };

    excelUtils.book_append_sheet(wb, ws, 'DS Goi Nhap Ngu');
    excelWrite(wb, `DS_Goi_Nhap_Ngu_Mau_17A_${unitName}_${sessionYear}.xlsx`);
  }
}
