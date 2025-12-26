
import XLSX from 'xlsx-js-style';
import { Recruit } from '../../types';
import { getStatusLabel, checkAge } from '../../views/RecruitManagement/utils';

/**
 * XUẤT DANH SÁCH TỔNG HỢP TÙY BIẾN (Dành cho việc in ấn nhanh sau khi lọc)
 */
export class GenericListExport {
  public static export(recruits: Recruit[], sessionYear: number, unitName: string, listLabel: string) {
    const XLSXLib: any = XLSX;
    const excelUtils = XLSXLib?.utils || XLSXLib?.default?.utils;
    const excelWrite = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

    if (!excelUtils || !excelWrite) return;

    const wb = excelUtils.book_new();
    
    // 1. Tiêu đề và thông tin chung
    const headerInfo = [
      [unitName.toUpperCase(), '', '', '', '', '', '', '', '', ''],
      ['DANH SÁCH TRÍCH NGANG CÔNG DÂN', '', '', '', '', '', '', '', '', ''],
      [listLabel.toUpperCase(), '', '', '', '', '', '', '', '', ''],
      [`(Dữ liệu thực hiện năm ${sessionYear - 1} - Kết xuất ngày ${new Date().toLocaleDateString('vi-VN')})`, '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
    ];

    // 2. Tiêu đề cột
    const tableHeaders = [[
      'STT',
      'Họ và tên',
      'Ngày sinh',
      'Tuổi',
      'Số CCCD',
      'Địa chỉ (Thôn/Ấp)',
      'Trình độ HV',
      'Chính trị',
      'Sức khỏe',
      'Tình trạng / Lý do'
    ]];

    // 3. Dữ liệu công dân
    const dataRows = recruits.map((r, index) => [
      (index + 1).toString(),
      r.fullName.toUpperCase(),
      r.dob ? r.dob.split('-').reverse().join('/') : '---',
      checkAge(r, sessionYear).toString(),
      r.citizenId || '---',
      r.address.village,
      r.details.education,
      r.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : (r.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng'),
      r.physical.healthGrade ? `Loại ${r.physical.healthGrade}` : '---',
      `${getStatusLabel(r.status)}${r.defermentReason ? ' - ' + r.defermentReason : ''}`
    ]);

    const allData = [...headerInfo, ...tableHeaders, ...dataRows];
    const ws = excelUtils.aoa_to_sheet(allData);

    // 4. Merges cho Tiêu đề
    ws['!merges'] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // Dòng "Danh sách trích ngang"
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }, // Dòng tên danh sách
      { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } }, // Dòng ngày tháng
    ];

    // 5. Độ rộng cột
    ws['!cols'] = [
      { wch: 5 },  { wch: 25 }, { wch: 12 }, { wch: 6 }, 
      { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, 
      { wch: 10 }, { wch: 40 }
    ];

    // 6. Định dạng Style
    const border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'}};
    const range = excelUtils.decode_range(ws['!ref'] || 'A1:J100');

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = excelUtils.encode_cell({r:R, c:C});
        if (!ws[addr]) continue;
        
        ws[addr].s = { font: { name: 'Times New Roman', size: 11 } };
        
        if (R < 4) {
          ws[addr].s.alignment = { horizontal: 'center' };
          if (R === 1 || R === 2) ws[addr].s.font.bold = true;
          if (R === 1) ws[addr].s.font.size = 14;
        } else if (R === 5) {
          ws[addr].s.font.bold = true;
          ws[addr].s.border = border;
          ws[addr].s.alignment = { horizontal: 'center', vertical: 'center' };
          ws[addr].s.fill = { fgColor: { rgb: "F2F2F2" } };
        } else if (R > 5) {
          ws[addr].s.border = border;
          ws[addr].s.alignment = { vertical: 'center', wrapText: true };
          if (C === 0 || C === 2 || C === 3 || C === 8) ws[addr].s.alignment.horizontal = 'center';
        }
      }
    }

    excelUtils.book_append_sheet(wb, ws, 'Danh sach');
    excelWrite(wb, `Danh_sach_tuy_bien_${unitName.replace(/\s+/g, '_')}.xlsx`);
  }
}
