
import { Recruit } from '../types';
import { isRecruitInTab } from '../views/RecruitManagement/utils';
import { ExemptionListExport } from './export/ExemptionListExport';
import { DefermentListExport } from './export/DefermentListExport';
import { PreCheckListExport } from './export/PreCheckListExport';
import { StatisticalReport06Export } from './export/StatisticalReport06Export';
import { RegistrationResult01AExport } from './export/RegistrationResult01AExport';
import { RegistrationList01Export } from './export/RegistrationList01Export';
import { EnlistmentList17AExport } from './export/EnlistmentList17AExport';
import { GenericListExport } from './export/GenericListExport';

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
    listLabel: string = "Danh sách chi tiết"
  ) {
    try {
      switch (templateId) {
        case 'TEMPLATE_EXEMPTED':
          ExemptionListExport.export(
            recruits.filter(r => isRecruitInTab(r, 'EXEMPTED_LIST', sessionYear)), 
            sessionYear, 
            unitName
          );
          break;
        
        case 'TEMPLATE_DEFERRED':
          DefermentListExport.export(
            recruits.filter(r => isRecruitInTab(r, 'DEFERRED_LIST', sessionYear)), 
            sessionYear, 
            unitName
          );
          break;

        case 'TEMPLATE_PRE_CHECK':
          PreCheckListExport.export(
            recruits.filter(r => isRecruitInTab(r, 'PRE_CHECK', sessionYear)), 
            sessionYear, 
            unitName
          );
          break;

        case 'TEMPLATE_06':
          StatisticalReport06Export.export(recruits, sessionYear, unitName);
          break;

        case 'TEMPLATE_01A':
          RegistrationResult01AExport.export(
            recruits.filter(r => isRecruitInTab(r, 'FIRST_TIME_REG', sessionYear)), 
            sessionYear, 
            unitName
          );
          break;

        case 'TEMPLATE_01':
          RegistrationList01Export.export(
            recruits.filter(r => isRecruitInTab(r, 'FIRST_TIME_REG', sessionYear)), 
            sessionYear, 
            unitName
          );
          break;

        case 'TEMPLATE_17A':
          EnlistmentList17AExport.export(
            recruits.filter(r => isRecruitInTab(r, 'ENLISTED', sessionYear)), 
            sessionYear, 
            unitName
          );
          break;
        
        default:
          // Nếu templateId là một mã Tab (ví dụ DEFERRED_HEALTH, DEFERRED_EDUCATION, DEFERRED_POLICY, v.v.)
          // Hoặc tên mẫu tự định nghĩa, ta lọc công dân theo đúng tiêu chí của Tab đó
          const filteredRecruits = recruits.filter(r => isRecruitInTab(r, templateId, sessionYear));
          GenericListExport.export(filteredRecruits, sessionYear, unitName, listLabel);
          break;
      }
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("Đã xảy ra lỗi khi tạo tệp Excel.");
    }
  }
}
