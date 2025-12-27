
import ExcelJS from 'exceljs';
import { Recruit, ExcelTemplate, RecruitmentStatus } from '../types';
import { getStatusLabel, checkAge } from '../views/RecruitManagement/utils';

/**
 * FIELD_MAPPINGS: Các từ khóa dữ liệu khả dụng để người dùng gán vào cột
 */
export const FIELD_MAPPINGS = [
  { key: 'STT', label: 'Số thứ tự (1, 2, 3...)' },
  { key: 'FULL_NAME', label: 'Họ và tên (Chữ IN HOA)' },
  { key: 'DOB', label: 'Ngày tháng năm sinh (dd/mm/yyyy)' },
  { key: 'AGE', label: 'Tuổi đời' },
  { key: 'CITIZEN_ID', label: 'Số định danh / CCCD' },
  { key: 'VILLAGE', label: 'Thôn / Ấp / Tổ dân phố' },
  { key: 'COMMUNE', label: 'Xã / Phường' },
  { key: 'PROVINCE', label: 'Tỉnh / Thành phố' },
  { key: 'RESIDENCE_FULL', label: 'Nơi thường trú của GĐ, bản thân (Địa chỉ đầy đủ)' },
  { key: 'RESIDENCE_CURRENT', label: 'Nơi ở hiện nay của bản thân (Địa chỉ đầy đủ)' },
  { key: 'EDUCATION', label: 'Trình độ văn hóa (Lớp.../12)' },
  { key: 'MAJOR', label: 'Trình độ CMKT (Ngành học)' },
  { key: 'ETHNICITY_RELIGION', label: 'Dân tộc, tôn giáo' },
  { key: 'POLITICAL_STATUS', label: 'Đảng / Đoàn' },
  { key: 'FOREIGN_LANG', label: 'Ngoại ngữ' },
  { key: 'HEALTH', label: 'Sức khỏe đạt loại' },
  { key: 'HEALTH_NOTE', label: 'Ghi chú về sức khỏe (Dị tật, bệnh lý...)' },
  { key: 'JOB', label: 'Nghề nghiệp' },
  { key: 'WORK_ADDRESS', label: 'Nơi làm việc' },
  { key: 'FAMILY_COMP', label: 'Thành phần gia đình' },
  { key: 'PERSONAL_COMP', label: 'Thành phần bản thân' },
  { key: 'FATHER_DETAILS', label: 'Họ tên cha, năm sinh, nghề nghiệp' },
  { key: 'MOTHER_DETAILS', label: 'Họ tên mẹ, năm sinh, nghề nghiệp' },
  { key: 'WIFE_DETAILS', label: 'Họ tên vợ, năm sinh, nghề nghiệp' },
  { key: 'ENLISTMENT_UNIT', label: 'Đơn vị nhập ngũ' },
  { key: 'ENLISTMENT_DATE', label: 'Ngày/tháng/năm nhập ngũ' },
  { key: 'REASON', label: 'Lý do chung (Miễn, hoãn, KTC...)' },
  { key: 'PRE_CHECK_FAIL_REASON', label: 'Lý do không đạt sơ tuyển' },
  { key: 'MED_EXAM_FAIL_REASON', label: 'Lý do không đạt khám tuyển' },
  { key: 'CUSTOM_TEXT', label: '== VĂN BẢN TỰ NHẬP ==' }
];

export class TemplateExportService {
  /**
   * Thực hiện "bơm" dữ liệu vào mẫu file mẫu có sẵn
   */
  public static async inject(recruits: Recruit[], template: ExcelTemplate, sessionYear: number) {
    try {
      const workbook = new ExcelJS.Workbook();
      
      const base64Data = template.fileData.split(';base64,').pop() || '';
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      await workbook.xlsx.load(buffer as any);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) throw new Error("Không tìm thấy Sheet trong file mẫu.");

      let currentRow = template.startRow;

      // Sắp xếp danh sách theo tên để xuất cho chuyên nghiệp
      const sortedRecruits = [...recruits].sort((a, b) => a.fullName.localeCompare(b.fullName));

      sortedRecruits.forEach((r, index) => {
        const row = worksheet.getRow(currentRow);
        
        // QUAN TRỌNG: Phá bỏ mọi ô bị Gộp (Merge) tại dòng này trong file mẫu 
        row.eachCell({ includeEmpty: true }, (cell) => {
          if (cell.isMerged) {
            worksheet.unMergeCells(cell.address);
          }
        });

        Object.entries(template.mapping).forEach(([colIndex, mappingValue]) => {
          const col = parseInt(colIndex);
          const fieldKeys = Array.isArray(mappingValue) ? mappingValue : [mappingValue];
          
          const lines = fieldKeys.map(fieldKey => {
            if (fieldKey.startsWith('STATIC:')) {
                return fieldKey.replace('STATIC:', '');
            }

            let val: any = '';
            switch (fieldKey) {
              case 'STT': val = index + 1; break;
              case 'FULL_NAME': val = (r.fullName || '').toUpperCase(); break;
              case 'DOB': val = r.dob ? r.dob.split('-').reverse().join('/') : ''; break;
              case 'AGE': val = checkAge(r, sessionYear); break;
              case 'CITIZEN_ID': val = r.citizenId || ''; break;
              case 'VILLAGE': val = r.address?.village || ''; break;
              case 'COMMUNE': val = r.address?.commune || ''; break;
              case 'PROVINCE': val = r.address?.province || ''; break;
              case 'RESIDENCE_FULL': 
              case 'RESIDENCE_CURRENT':
                  val = `${r.address?.village || ''}, ${r.address?.commune || ''}, ${r.address?.province || ''}`;
                  if (val.trim() === ', ,') val = '';
                  break;
              case 'EDUCATION': 
                  val = (r.details?.education || '').includes('Lớp') ? r.details.education.replace('Lớp ', '') + '/12' : '12/12';
                  break;
              case 'MAJOR': val = r.details?.major || ''; break;
              case 'ETHNICITY_RELIGION': val = `${r.details?.ethnicity || ''}, ${r.details?.religion || ''}`; break;
              case 'POLITICAL_STATUS': 
                  val = r.details?.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : (r.details?.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng');
                  break;
              case 'HEALTH': val = r.physical?.healthGrade ? `Loại ${r.physical.healthGrade}` : ''; break;
              case 'HEALTH_NOTE': val = r.physical?.note || ''; break;
              case 'JOB': val = r.details?.job || ''; break;
              case 'WORK_ADDRESS': val = r.details?.workAddress || ''; break;
              case 'FAMILY_COMP': val = r.details?.familyComposition || ''; break;
              case 'PERSONAL_COMP': val = r.details?.personalComposition || ''; break;
              case 'FATHER_DETAILS': 
                  val = r.family?.father?.fullName ? `Cha: ${r.family.father.fullName}, ${r.family.father.birthYear || ''}, ${r.family.father.job || ''}` : '';
                  break;
              case 'MOTHER_DETAILS': 
                  val = r.family?.mother?.fullName ? `Mẹ: ${r.family.mother.fullName}, ${r.family.mother.birthYear || ''}, ${r.family.mother.job || ''}` : '';
                  break;
              case 'WIFE_DETAILS': 
                  val = r.family?.wife?.fullName ? `Vợ: ${r.family.wife.fullName}, ${r.family.wife.birthYear || ''}, ${r.family.wife.job || ''}` : '';
                  break;
              case 'ENLISTMENT_UNIT': val = r.enlistmentUnit || ''; break;
              case 'ENLISTMENT_DATE': val = r.enlistmentDate ? r.enlistmentDate.split('-').reverse().join('/') : ''; break;
              case 'REASON': val = `${getStatusLabel(r.status)}${r.defermentReason ? ': ' + r.defermentReason : ''}`; break;
              case 'PRE_CHECK_FAIL_REASON': val = r.status === RecruitmentStatus.PRE_CHECK_FAILED ? r.defermentReason : ''; break;
              case 'MED_EXAM_FAIL_REASON': val = r.status === RecruitmentStatus.MED_EXAM_FAILED ? r.defermentReason : ''; break;
            }
            return (val === undefined || val === null) ? '' : val.toString();
          });

          const combinedValue = lines.join('\n');
          const cell = row.getCell(col);
          cell.value = combinedValue;
          cell.alignment = { vertical: 'top', horizontal: col === 1 ? 'center' : 'left', wrapText: true };
          
          cell.font = { name: 'Times New Roman', size: 11 };
          cell.border = { 
            top: {style:'thin'}, left: {style:'thin'}, 
            bottom: {style:'thin'}, right: {style:'thin'} 
          };
        });
        
        const maxLinesInRow = Math.max(...Object.values(template.mapping).map(v => Array.isArray(v) ? v.length : 1));
        row.height = Math.max(25, maxLinesInRow * 15);
        
        currentRow++;
      });

      const outBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Danh_sach_Xuat_Ban_${template.name.replace(/\s+/g, '_')}_${sessionYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi Template Export:", error);
      alert("Đã xảy ra lỗi khi bơm dữ liệu vào mẫu Excel.");
    }
  }
}
