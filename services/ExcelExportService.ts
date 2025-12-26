
import { Recruit } from '../types';
import { ExemptionListExport } from './export/ExemptionListExport';
import { DefermentListExport } from './export/DefermentListExport';
import { PreCheckListExport } from './export/PreCheckListExport';
import { StatisticalReport06Export } from './export/StatisticalReport06Export';
import { RegistrationResult01AExport } from './export/RegistrationResult01AExport';
import { RegistrationList01Export } from './export/RegistrationList01Export';
import { EnlistmentList17AExport } from './export/EnlistmentList17AExport';
import { GenericListExport } from './export/GenericListExport'; // Import mới

/**
 * Service điều phối xuất dữ liệu Excel
 */
export class ExcelExportService {
  /**
   * Xuất danh sách theo template cụ thể
   */
  public static exportToTemplate(
    recruits: Recruit[], 
    templateId: string, 
    sessionYear: number, 
    unitName: string,
    listLabel: string = "Danh sách chi tiết" // Thêm tham số nhãn danh sách
  ) {
    try {
      switch (templateId) {
        case 'TEMPLATE_EXEMPTED':
          ExemptionListExport.export(recruits, sessionYear, unitName);
          break;
        
        case 'TEMPLATE_DEFERRED':
          DefermentListExport.export(recruits, sessionYear, unitName);
          break;

        case 'TEMPLATE_PRE_CHECK':
          PreCheckListExport.export(recruits, sessionYear, unitName);
          break;

        case 'TEMPLATE_06':
          StatisticalReport06Export.export(recruits, sessionYear, unitName);
          break;

        case 'TEMPLATE_01A':
          RegistrationResult01AExport.export(recruits, sessionYear, unitName);
          break;

        case 'TEMPLATE_01':
          RegistrationList01Export.export(recruits, sessionYear, unitName);
          break;

        case 'TEMPLATE_17A':
          EnlistmentList17AExport.export(recruits, sessionYear, unitName);
          break;
        
        default:
          // Nếu không có mẫu biểu định sẵn, sử dụng mẫu Generic để in ấn nhanh
          GenericListExport.export(recruits, sessionYear, unitName, listLabel);
          break;
      }
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("Đã xảy ra lỗi khi tạo tệp Excel.");
    }
  }
}
