
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
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet(1); // Mặc định dùng Sheet đầu tiên
      if (!worksheet) throw new Error("Không tìm thấy Sheet trong file mẫu.");

      // 2. Điền dữ liệu bắt đầu từ dòng cấu hình
      let currentRow = template.startRow;

      recruits.forEach((r, index) => {
        const rowData: any = {};
        
        // Duyệt qua mapping của template để biết cột nào điền thông tin gì
        // Mapping là Object: { "1": "STT", "2": "FULL_NAME", ... }
        Object.entries(template.mapping).forEach(([colIndex, fieldKey]) => {
          const col = parseInt(colIndex);
          let value: any = '';

          // Logic dịch dữ liệu (Mapping field sang value chuẩn quân sự)
          switch (fieldKey) {
            case 'STT': value = index + 1; break;
            case 'FULL_NAME': value = r.fullName.toUpperCase(); break;
            case 'DOB': value = r.dob ? r.dob.split('-').reverse().join('/') : '---'; break;
            case 'AGE': value = checkAge(r, sessionYear); break;
            case 'CITIZEN_ID': value = r.citizenId || ''; break;
            case 'VILLAGE': value = r.address.village; break;
            case 'COMMUNE': value = r.address.commune; break;
            case 'PROVINCE': value = r.address.province; break;
            case 'EDUCATION': 
                const edu = r.details.education;
                value = `VH: ${edu.includes('Lớp') ? edu.replace('Lớp ', '') + '/12' : '12/12'}; CMKT: ${r.details.major || 'Không'}`;
                break;
            case 'POLITICAL': 
                value = r.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên Đảng CSVN' : (r.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên TNCS HCM' : 'Quần chúng');
                break;
            case 'HEALTH': value = r.physical.healthGrade ? `Loại ${r.physical.healthGrade}` : '---'; break;
            case 'JOB': value = `${r.details.job || 'Lao động tự do'}\nTại: ${r.details.workAddress || 'Địa phương'}`; break;
            case 'FAMILY_INFO': 
                value = `Cha: ${r.family.father.fullName} (${r.family.father.birthYear})\nMẹ: ${r.family.mother.fullName} (${r.family.mother.birthYear})\nVợ: ${r.family.wife?.fullName || '---'}`;
                break;
            case 'ENLISTMENT_UNIT': value = r.enlistmentUnit || '---'; break;
            case 'REASON': value = `${getStatusLabel(r.status)}${r.defermentReason ? ': ' + r.defermentReason : ''}`; break;
          }

          const cell = worksheet.getRow(currentRow).getCell(col);
          cell.value = value;
          
          // Giữ nguyên format hoặc áp dụng format cơ bản nếu cần (Font Times New Roman)
          cell.font = cell.font || { name: 'Times New Roman', size: 11 };
          cell.alignment = { vertical: 'middle', wrapText: true };
          cell.border = {
            top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
          };
        });

        currentRow++;
      });

      // 3. Xuất file hoàn chỉnh
      const outBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bao_cao_theo_mau_${template.name.replace(/\s+/g, '_')}_${sessionYear}.xlsx`;
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
