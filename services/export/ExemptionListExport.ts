
import XLSX from 'xlsx-js-style';
import { Recruit } from '../../types';

/**
 * MẪU BIỂU 16A/GNN-2025: DANH SÁCH CÔNG DÂN MIỄN GỌI NHẬP NGŨ
 */
export class ExemptionListExport {
  public static export(recruits: Recruit[], sessionYear: number, unitName: string) {
    const XLSXLib: any = XLSX;
    const excelUtils = XLSXLib?.utils || XLSXLib?.default?.utils;
    const excelWrite = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

    if (!excelUtils || !excelWrite) return;

    const wb = excelUtils.book_new();
    
    // 1. Dữ liệu Meta (Header phía trên bảng)
    const metaInfo = [
      ['Biểu số: 16A/GNN-2025', '', '', 'Phụ lục I', '', '', '', ''],
      ['Khổ biểu: 29,7x21cm', '', '', `DANH SÁCH CÔNG DÂN MIỄN GỌI NHẬP NGŨ NĂM ${sessionYear}`, '', '', '', ''],
      ['', '', '', `(Kèm theo Báo cáo số: ...../.... ngày....tháng....năm....của ${unitName})`, '', '', '', ''],
      ['', '', '', '', '', '', '', ''], // Dòng trống
      ['', '', '', '', '', '', '', ''], // Dòng trống
    ];

    // 2. Header của bảng (3 dòng gộp)
    const tableHeaders = [
      [
        'Số TT', 
        '- Họ, chữ đệm và tên khai sinh\n- Họ, chữ đệm và tên thường dùng\n- Ngày, tháng, năm sinh\n- Số thẻ CCCD', 
        '- Nghề nghiệp\n- Nơi làm việc\n- Nhóm, ngạch, bậc lương', 
        '- Nơi thường trú của gia đình; bản thân\n- Nơi ở hiện nay của bản thân\n- Nơi làm việc (nếu có)', 
        '- Thành phần gia đình\n- Thành phần bản thân\n- Dân tộc, tôn giáo', 
        '- Trình độ văn hóa, CMKT\n- Ngoại ngữ\n- Đảng, đoàn', 
        '- Họ và tên cha, năm sinh, nghề nghiệp\n- Họ và tên mẹ, năm sinh, nghề nghiệp\n- Họ và tên vợ (chồng), năm sinh, nghề nghiệp', 
        'Lý do\nmiễn gọi nhập ngũ'
      ]
    ];

    const formatBullet = (items: (string | undefined | null)[]) => {
      const valid = items.map(i => (i || '').trim()).filter(Boolean);
      if (valid.length === 0) return '- ---';
      return valid.map(i => i.startsWith('-') ? i : `- ${i}`).join('\n');
    };

    // 3. Mapping dữ liệu công dân vào các cột
    const dataRows = recruits.map((r, index) => {
      const political = r.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : (r.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng');
      const dobStr = r.dob ? r.dob.split('-').reverse().join('/') : '---';
      const addrStr1 = `${r.address.village}, ${r.address.commune}, ${r.address.province}`;
      const addrStr2 = r.address.street || addrStr1;
      
      const fatherStr = r.family.father?.fullName ? `Cha: ${r.family.father.fullName}${r.family.father.birthYear ? ' (' + r.family.father.birthYear + ')' : ''}${r.family.father.job ? ', ' + r.family.father.job : ''}` : '';
      const motherStr = r.family.mother?.fullName ? `Mẹ: ${r.family.mother.fullName}${r.family.mother.birthYear ? ' (' + r.family.mother.birthYear + ')' : ''}${r.family.mother.job ? ', ' + r.family.mother.job : ''}` : '';
      const wifeStr = r.family.wife?.fullName ? `Vợ: ${r.family.wife.fullName}${r.family.wife.birthYear ? ' (' + r.family.wife.birthYear + ')' : ''}` : '';

      return [
        (index + 1).toString(), // A: STT
        formatBullet([r.fullName.toUpperCase(), r.fullName.toUpperCase(), dobStr, `CCCD: ${r.citizenId || '---'}`]),
        formatBullet([r.details.job, r.details.workAddress, (r.details.gradeGroup || r.details.salaryLevel) ? `${r.details.gradeGroup || ''} - ${r.details.salaryLevel || ''}` : '']),
        formatBullet([addrStr1, addrStr2, r.details.workAddress]),
        formatBullet([r.details.familyComposition || 'Bần nông', r.details.personalComposition || 'Phụ thuộc', `${r.details.ethnicity || 'Kinh'}, ${r.details.religion || 'Không'}`]),
        formatBullet([r.details.education, 'Ngoại ngữ: ---', political]),
        formatBullet([fatherStr, motherStr, wifeStr]),
        formatBullet([r.defermentReason || 'Chưa xác định'])
      ];
    });

    const allData = [...metaInfo, ...tableHeaders, ...dataRows];
    const ws = excelUtils.aoa_to_sheet(allData);

    // 4. Định dạng Merges (Gộp ô cho Header phía trên)
    ws['!merges'] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }, // Phụ lục I
      { s: { r: 1, c: 3 }, e: { r: 1, c: 5 } }, // Tiêu đề chính
      { s: { r: 2, c: 3 }, e: { r: 2, c: 6 } }, // Dòng reference
    ];

    // 5. Thiết lập độ rộng cột
    ws['!cols'] = [
      { wch: 6 },  // A
      { wch: 30 }, // B
      { wch: 25 }, // C
      { wch: 35 }, // D
      { wch: 25 }, // E
      { wch: 20 }, // F
      { wch: 45 }, // G
      { wch: 30 }  // H
    ];

    // 6. Áp dụng Style
    const commonStyle = { font: { name: 'Times New Roman', size: 10 }, alignment: { wrapText: true, vertical: 'center', horizontal: 'left' } };
    const borderStyle = { 
        top: { style: 'thin' }, bottom: { style: 'thin' }, 
        left: { style: 'thin' }, right: { style: 'thin' } 
    };

    const range = excelUtils.decode_range(ws['!ref'] || 'A1:H100');
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = excelUtils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        
        // Style cho Header phía trên bảng
        if (R < 5) {
            ws[addr].s = { 
                font: { name: 'Times New Roman', size: R === 1 ? 12 : 10, bold: R <= 2 },
                alignment: { horizontal: C >= 3 ? 'center' : 'left' }
            };
        } 
        // Style cho Header của Bảng (Dòng 6)
        else if (R === 5) {
            ws[addr].s = { 
                ...commonStyle, 
                font: { ...commonStyle.font, bold: true },
                alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                border: borderStyle,
                fill: { fgColor: { rgb: "F2F2F2" } }
            };
        } 
        // Style cho Dữ liệu
        else {
            ws[addr].s = { 
                ...commonStyle, 
                border: borderStyle,
                alignment: { ...commonStyle.alignment, horizontal: C === 0 ? 'center' : 'left' }
            };
        }
      }
    }

    // Thiết lập độ cao dòng (Dòng header bảng cao hơn)
    ws['!rows'] = [];
    ws['!rows'][5] = { hpt: 80 };
    for(let i = 6; i <= range.e.r; i++) ws['!rows'][i] = { hpt: 110 };

    excelUtils.book_append_sheet(wb, ws, 'DS Mien Goi');
    excelWrite(wb, `DS_Mien_Goi_Nhap_Ngu_${unitName}_${sessionYear}.xlsx`);
  }
}
