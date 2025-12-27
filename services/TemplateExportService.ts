
import ExcelJS from 'exceljs';
import { Recruit, ExcelTemplate } from '../types';
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
  { key: 'EDUCATION', label: 'Trình độ văn hóa & CMKT' },
  { key: 'POLITICAL', label: 'Chất lượng chính trị (Đảng, Đoàn)' },
  { key: 'HEALTH', label: 'Sức khỏe đạt loại' },
  { key: 'JOB', label: 'Nghề nghiệp, nơi làm việc' },
  { key: 'FAMILY_INFO', label: 'Thông tin Gia đình (Cha, mẹ, vợ con)' },
  { key: 'ENLISTMENT_UNIT', label: 'Đơn vị giao nhận quân' },
  { key: 'REASON', label: 'Lý do (Miễn, hoãn, KTC...)' }
];

export class TemplateExportService {
  /**
   * Thực hiện "bơm" dữ liệu vào mẫu file mẫu có sẵn
   */
  public static async inject(recruits: Recruit[], template: ExcelTemplate, sessionYear: number) {
    try {
      const workbook = new ExcelJS.Workbook();
      
      // 1. Đọc dữ liệu Base64 của file mẫu
      const base64Data = template.fileData.split(';base64,').pop() || '';
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      await workbook.xlsx.load(buffer as any);

      const worksheet = workbook.getWorksheet(1); // Mặc định dùng Sheet đầu tiên
      if (!worksheet) throw new Error("Không tìm thấy Sheet trong file mẫu.");

      // 2. Điền dữ liệu bắt đầu từ dòng cấu hình
      let currentRow = template.startRow;

      recruits.forEach((r, index) => {
        // Duyệt qua mapping của template
        Object.entries(template.mapping).forEach(([colIndex, mappingValue]) => {
          const col = parseInt(colIndex);
          const fieldKeys = Array.isArray(mappingValue) ? mappingValue : [mappingValue];
          
          // Lấy dữ liệu cho từng field key trong mảng
          const lines = fieldKeys.map(fieldKey => {
            let val: any = '';
            switch (fieldKey) {
              case 'STT': val = index + 1; break;
              case 'FULL_NAME': val = r.fullName.toUpperCase(); break;
              case 'DOB': val = r.dob ? r.dob.split('-').reverse().join('/') : '---'; break;
              case 'AGE': val = checkAge(r, sessionYear); break;
              case 'CITIZEN_ID': val = r.citizenId || ''; break;
              case 'VILLAGE': val = r.address.village; break;
              case 'COMMUNE': val = r.address.commune; break;
              case 'PROVINCE': val = r.address.province; break;
              case 'EDUCATION': 
                  const edu = r.details.education;
                  val = `VH: ${edu.includes('Lớp') ? edu.replace('Lớp ', '') + '/12' : '12/12'}; CMKT: ${r.details.major || 'Không'}`;
                  break;
              case 'POLITICAL': 
                  val = r.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : (r.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng');
                  break;
              case 'HEALTH': val = r.physical.healthGrade ? `Loại ${r.physical.healthGrade}` : '---'; break;
              case 'JOB': val = `${r.details.job || 'Lao động tự do'}\nTại: ${r.details.workAddress || 'Địa phương'}`; break;
              case 'FAMILY_INFO': 
                  val = `Cha: ${r.family.father.fullName} (${r.family.father.birthYear})\nMẹ: ${r.family.mother.fullName} (${r.family.mother.birthYear})`;
                  break;
              case 'ENLISTMENT_UNIT': val = r.enlistmentUnit || '---'; break;
              case 'REASON': val = `${getStatusLabel(r.status)}${r.defermentReason ? ': ' + r.defermentReason : ''}`; break;
            }
            return val;
          }).filter(v => v !== '');

          // Nối các dòng bằng ký tự xuống dòng
          const combinedValue = lines.join('\n');
          
          const row = worksheet.getRow(currentRow);
          const cell = row.getCell(col);
          cell.value = combinedValue;
          
          // QUAN TRỌNG: Cần wrapText để Excel hiểu ký tự \n là xuống dòng trong ô
          cell.alignment = { 
            vertical: 'top', 
            horizontal: 'left', 
            wrapText: true 
          };
          
          cell.font = cell.font || { name: 'Times New Roman', size: 11 };
          cell.border = {
            top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
          };
        });

        // Tăng chỉ số dòng cho người tiếp theo
        currentRow++;
      });

      // 3. Xuất file hoàn chỉnh
      const outBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Danh_sach_In_An_${template.name.replace(/\s+/g, '_')}_${sessionYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Lỗi Template Export:", error);
      alert("Đã xảy ra lỗi khi bơm dữ liệu vào mẫu Excel. Vui lòng kiểm tra lại cấu hình mẫu.");
    }
  }
}
