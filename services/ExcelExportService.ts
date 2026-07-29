
import { Recruit } from '../types';
import { isRecruitInTab, checkAge } from '../views/RecruitManagement/utils';
import { api } from '../api';
import { TemplateExportService } from './TemplateExportService';
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
   * Xuất danh sách theo template cụ thể hoặc theo Tab được chọn
   */
  public static async exportToTemplate(
    recruits: Recruit[], 
    templateId: string, 
    sessionYear: number, 
    unitName: string,
    listLabel: string = "Danh sách chi tiết"
  ) {
    try {
      // 1. Kiểm tra mẫu tùy biến được cấu hình bởi cán bộ/admin
      const customTemplates = await api.getTemplates();
      const customTpl = customTemplates?.find(t => 
        t.id === templateId || 
        t._id === templateId || 
        (t.sourceTabs && t.sourceTabs.includes(templateId)) ||
        (t.name && listLabel && t.name.toLowerCase().includes(listLabel.toLowerCase()))
      );

      const hasValidCustomFile = customTpl?.fileData && 
        customTpl.fileData.length > 500 && 
        Object.keys(customTpl.mapping || {}).length > 0;

      if (customTpl && hasValidCustomFile) {
        let filteredData = recruits.filter(r => isRecruitInTab(r, templateId, sessionYear));
        if (customTpl.sourceTabs && customTpl.sourceTabs.length > 0) {
          filteredData = recruits.filter(r => customTpl.sourceTabs!.some(tabId => isRecruitInTab(r, tabId, sessionYear)));
        }

        if (customTpl.onlyAge17) {
          const targetBirthYear = (sessionYear - 1) - 17;
          filteredData = filteredData.filter(r => parseInt(r.dob?.split('-')[0] || '0') === targetBirthYear);
        }
        if (customTpl.filterAges && customTpl.filterAges.length > 0) {
          filteredData = filteredData.filter(r => customTpl.filterAges!.includes(checkAge(r, sessionYear)));
        }
        if (customTpl.filterEthnicities && customTpl.filterEthnicities.length > 0) {
          filteredData = filteredData.filter(r => customTpl.filterEthnicities!.includes(r.details.ethnicity));
        }
        if (customTpl.filterReligions && customTpl.filterReligions.length > 0) {
          filteredData = filteredData.filter(r => customTpl.filterReligions!.includes(r.details.religion));
        }
        if (customTpl.filterHealthGrades && customTpl.filterHealthGrades.length > 0) {
          filteredData = filteredData.filter(r => r.physical.healthGrade && customTpl.filterHealthGrades!.includes(r.physical.healthGrade));
        }

        await TemplateExportService.inject(filteredData, customTpl, sessionYear);
        return;
      }

      // 2. Xuất theo các mẫu định sẵn hoặc Generic
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
