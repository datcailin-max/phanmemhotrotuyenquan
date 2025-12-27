
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
    const targetBirthYear = (sessionYear - 1) - 17;

    const metaInfo = [
      ['Biểu số: 01/GNN-2025', '', '', `DANH SÁCH CÔNG DÂN NAM ĐỦ 17 TUỔI TRONG NĂM ${sessionYear - 1}`, '', '', ''],
      ['Khổ biểu: 29,7x21cm', '', '', `(Tính từ ngày..../..../.... Đến..../..../....)`, '', '', ''],
      ['', '', '', '', '', '', ''], 
      ['', '', '', '', '', '', ''], 
    ];

    const tableHeaders = [
      [
        'Số\nTT', 
        '- Họ, chữ đệm tên khai sinh\n- Họ, chữ đệm tên thường dùng\n- Ngày tháng năm sinh\n- Số định danh cá nhân/CCCD', 
        'Trình độ văn\nhóa tốt nghiệp\nphổ thông\n(lớp.../12);\nđang học...', 
        '- Nơi thường trú của gđ, bản thân\n- Nơi ở hiện nay của bản thân\n- Nơi làm việc (nếu có)\n- Nơi đăng ký NVQS tại...', 
        '- Thành phần gia đình\n- Thành phần bản thân\n- Dân tộc, tôn giáo', 
        '- Trình độ CMKT, học\nnghề gì? Làm việc gì?\n- Có... anh chị em ruột\n- Là con thứ... trong gđ', 
        '- Họ tên cha, năm sinh, nghề nghiệp\n- Họ tên mẹ, năm sinh, nghề nghiệp\n- Vợ/Con (nếu có)'
      ]
    ];

    const filteredRecruits = recruits.filter(r => {
        const birthYear = parseInt(r.dob.split('-')[0] || '0');
        return birthYear === targetBirthYear;
    });

    const dataRows = filteredRecruits.map((r, index) => {
      return [
        (index + 1).toString(), 
        `${r.fullName.toUpperCase()}\n${r.fullName.toUpperCase()}\n${r.dob ? r.dob.split('-').reverse().join('/') : '---'}\n${r.citizenId || '---'}`,
        r.details.education.includes('Lớp') ? r.details.education.replace('Lớp ', '') + '/12' : '12/12',
        `${r.address.village}, ${r.address.commune}\n${r.address.province}\n${r.details.workAddress || '---'}\nBan CHQS ${r.address.commune}`,
        `${r.details.familyComposition || '---'}\n${r.details.personalComposition || '---'}\n${r.details.ethnicity}, ${r.details.religion}`,
        `${r.details.major || 'Không'}, ${r.details.job || '---'}\nCó ... anh chị em\nLà con thứ ...`,
        `Cha: ${r.family.father.fullName}, ${r.family.father.birthYear}, ${r.family.father.job}\nMẹ: ${r.family.mother.fullName}, ${r.family.mother.birthYear}, ${r.family.mother.job}`
      ];
    });

    const colNums = ['1', '2', '3', '4', '5', '6', '7'];
    const allData = [...metaInfo, ...tableHeaders, colNums, ...dataRows];
    const ws = excelUtils.aoa_to_sheet(allData);

    ws['!merges'] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 5 } }, 
      { s: { r: 1, c: 3 }, e: { r: 1, c: 5 } }, 
    ];

    ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 35 }, { wch: 25 }, { wch: 25 }, { wch: 45 }];

    const range = excelUtils.decode_range(ws['!ref'] || 'A1:G100');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = excelUtils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        ws[addr].s = { 
          font: { name: 'Times New Roman', size: 11 }, 
          alignment: { wrapText: true, vertical: 'top' } 
        };
        if (R < 4) {
            ws[addr].s.alignment.horizontal = C >= 3 ? 'center' : 'left';
            if (R <= 1) ws[addr].s.font.bold = true;
        } else if (R === 4 || R === 5) {
            ws[addr].s.font.bold = true;
            ws[addr].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
            ws[addr].s.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'}};
        } else {
            ws[addr].s.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'}};
        }
      }
    }

    excelUtils.book_append_sheet(wb, ws, 'DS 17 Tuoi');
    excelWrite(wb, `Mau_01_DS_17_Tuoi_${unitName}_${sessionYear}.xlsx`);
  }
}
