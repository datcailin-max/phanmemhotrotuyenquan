
import XLSX from 'xlsx-js-style';
import { Recruit } from '../../types';

/**
 * MẪU BIỂU 17A/GNN-2025: DANH SÁCH GỌI CÔNG DÂN NHẬP NGŨ
 * Ánh xạ dữ liệu từ phần mềm sang thuật ngữ chuẩn ngành quân sự
 */
export class EnlistmentList17AExport {
  public static export(recruits: Recruit[], sessionYear: number, unitName: string) {
    const XLSXLib: any = XLSX;
    const excelUtils = XLSXLib?.utils || XLSXLib?.default?.utils;
    const excelWrite = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

    if (!excelUtils || !excelWrite) return;

    const wb = excelUtils.book_new();

    // 1. Header chuẩn theo quy định hành chính quân sự
    const metaInfo = [
      ['Biểu số: 17A/GNN-2025', '', '', 'Phụ lục I', '', '', '', ''],
      ['Khổ biểu: 29,7x21cm', '', '', `DANH SÁCH GỌI CÔNG DÂN NHẬP NGŨ NĂM ${sessionYear}`, '', '', '', ''],
      ['', '', '', `(Kèm theo Báo cáo số: ...../.... ngày....tháng....năm....của ${unitName})`, '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
    ];

    // 2. Tiêu đề cột (Thuật ngữ chuẩn xác theo mẫu in sẵn của Bộ)
    const tableHeaders = [
      [
        'Số TT', 
        '- Họ, chữ đệm và tên khai sinh\n- Họ, chữ đệm và tên thường dùng\n- Ngày, tháng, năm sinh\n- Số định danh cá nhân/CCCD', 
        '- Nghề nghiệp\n- Nơi làm việc\n- Nhóm, ngạch, bậc lương',
        '- Nơi thường trú của gia đình; bản thân\n- Nơi ở hiện nay của bản thân\n- Nơi đăng ký NVQS tại...', 
        '- Thành phần gia đình\n- Thành phần bản thân\n- Dân tộc, tôn giáo\n- Sức khỏe đạt loại', 
        '- Trình độ văn hóa, CMKT\n- Ngoại ngữ\n- Đảng, đoàn', 
        '- Họ và tên cha, năm sinh, nghề nghiệp\n- Họ và tên mẹ, năm sinh, nghề nghiệp\n- Họ và tên vợ (chồng), con (nếu có)',
        'Đơn vị\ngiao nhận quân'
      ]
    ];

    // 3. Logic "Dịch" dữ liệu (Mapping) sang thuật ngữ chuyên ngành
    const dataRows = recruits.map((r, index) => {
      // Dịch Chính trị
      let politicalStr = 'Quần chúng';
      if (r.details.politicalStatus === 'Dang_Vien') politicalStr = 'Đảng viên Đảng CSVN';
      if (r.details.politicalStatus === 'Doan_Vien') politicalStr = 'Đoàn viên TNCS HCM';

      // Dịch Học vấn
      const eduStr = `VH: ${r.details.education.includes('Lớp') ? r.details.education.replace('Lớp ', '') + '/12' : '12/12'}\nCMKT: ${r.details.major || 'Không'}`;
      
      // Dịch Gia đình & Con cái
      const familyStr = `Cha: ${r.family.father.fullName} (${r.family.father.birthYear || '---'})\nMẹ: ${r.family.mother.fullName} (${r.family.mother.birthYear || '---'})\nVợ: ${r.family.wife?.fullName || 'Chưa có'}\nCon: ${r.family.children || 'Chưa có'}`;

      return [
        (index + 1).toString(),
        `${r.fullName.toUpperCase()}\n${r.fullName.toUpperCase()}\n${r.dob ? r.dob.split('-').reverse().join('/') : '---'}\n${r.citizenId || '---'}`,
        `${r.details.job || 'Lao động tự do'}\n${r.details.workAddress || 'Tại địa phương'}\n${r.details.gradeGroup || '---'}-${r.details.salaryLevel || '---'}`,
        `${r.address.village}, ${r.address.commune}\n${r.address.province}\nBan CHQS ${r.address.commune}`,
        `${r.details.familyComposition || 'Bần nông'}\n${r.details.personalComposition || 'Phụ thuộc'}\n${r.details.ethnicity}, ${r.details.religion}\nLoại ${r.physical.healthGrade || '---'}`,
        `${eduStr}\nNgoại ngữ: ---\n${politicalStr}`,
        familyStr,
        r.enlistmentUnit || '---'
      ];
    });

    const allData = [...metaInfo, ...tableHeaders, ...dataRows];
    const ws = excelUtils.aoa_to_sheet(allData);

    // Cấu hình Merges và Style tương tự nhưng đảm bảo Font là Times New Roman
    ws['!merges'] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }, 
      { s: { r: 1, c: 3 }, e: { r: 1, c: 6 } }, 
      { s: { r: 2, c: 3 }, e: { r: 2, c: 6 } },
    ];

    ws['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 25 }, { wch: 35 }, { wch: 25 }, { wch: 22 }, { wch: 45 }, { wch: 20 }];

    const border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    const range = excelUtils.decode_range(ws['!ref'] || 'A1:H100');
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = excelUtils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        
        ws[addr].s = { 
          font: { name: 'Times New Roman', size: 11 }, 
          alignment: { wrapText: true, vertical: 'top' } 
        };
        
        if (R < 5) {
          ws[addr].s.alignment.horizontal = C >= 3 ? 'center' : 'left';
          if (R === 1) ws[addr].s.font.bold = true;
        } else if (R === 5) {
          ws[addr].s.font.bold = true;
          ws[addr].s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
          ws[addr].s.border = border;
          ws[addr].s.fill = { fgColor: { rgb: "F2F2F2" } };
        } else {
          ws[addr].s.border = border;
          if (C === 0) ws[addr].s.alignment.horizontal = 'center';
        }
      }
    }

    ws['!rows'] = [];
    ws['!rows'][5] = { hpt: 100 };

    excelUtils.book_append_sheet(wb, ws, 'Mau 17A');
    excelWrite(wb, `Mau_17A_Goi_Nhap_Ngu_${unitName}_${sessionYear}.xlsx`);
  }
}
