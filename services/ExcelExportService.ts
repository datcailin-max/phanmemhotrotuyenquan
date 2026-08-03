
import { Recruit, RecruitmentStatus } from '../types';
import { isRecruitInTab } from '../views/RecruitManagement/utils';
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
      // 0. Loại bỏ tuyệt đối công dân Đã xóa / Đưa ra khỏi nguồn khỏi các danh sách thông thường
      let validRecruits: Recruit[] = [];
      
      if (templateId === 'DELETED_LIST') {
        validRecruits = recruits.filter(r => r.status === RecruitmentStatus.DELETED);
      } else if (templateId.startsWith('REMOVED')) {
        validRecruits = recruits.filter(r => r.status === RecruitmentStatus.REMOVED_FROM_SOURCE);
      } else {
        validRecruits = recruits.filter(r => 
          r.status !== RecruitmentStatus.DELETED && 
          r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE &&
          isRecruitInTab(r, templateId, sessionYear)
        );
      }

      // 1. Kiểm tra mẫu tùy biến được cấu hình bởi cán bộ/admin
      const customTemplates = await api.getTemplates();
      let customTpl = null;

      if (customTemplates && customTemplates.length > 0) {
        // Ưu tiên 1: Khớp chính xác id / _id với templateId
        customTpl = customTemplates.find(t => t.id === templateId || t._id === templateId);

        // Ưu tiên 2: Khớp sourceTabs chứa chính xác templateId (không phải 'ALL')
        if (!customTpl) {
          customTpl = customTemplates.find(t => 
            t.sourceTabs && 
            t.sourceTabs.includes(templateId) && 
            !t.sourceTabs.includes('ALL')
          );
        }

        // Ưu tiên 3: Khớp tên danh sách (listLabel)
        if (!customTpl && listLabel) {
          const cleanLabel = listLabel.toLowerCase().replace(/^[0-9.]+\s*/, '').trim();
          if (cleanLabel.length > 3) {
            customTpl = customTemplates.find(t => {
              const cleanName = (t.name || '').toLowerCase().replace(/^[0-9.]+\s*/, '').trim();
              return cleanName && (cleanName.includes(cleanLabel) || cleanLabel.includes(cleanName));
            });
          }
        }

        // Ưu tiên 4: Dành cho tab 'ALL'
        if (!customTpl && templateId === 'ALL') {
          customTpl = customTemplates.find(t => t.sourceTabs && t.sourceTabs.includes('ALL'));
        }
      }

      const hasValidCustomFile = customTpl?.fileData && 
        customTpl.fileData.length > 500 && 
        Object.keys(customTpl.mapping || {}).length > 0;

      if (customTpl && hasValidCustomFile) {
        await TemplateExportService.inject(validRecruits, customTpl, sessionYear);
        return;
      }

      // 2. Xuất theo các mẫu biểu định sẵn tương ứng với từng Tab nếu không có mẫu file tùy biến
      switch (templateId) {
        case 'EXEMPT_REG':
        case 'EXEMPTED_LIST':
        case 'TEMPLATE_EXEMPTED':
          ExemptionListExport.export(validRecruits, sessionYear, unitName);
          break;
        
        case 'DEFERRED_LIST':
        case 'DEFERRED_HEALTH':
        case 'DEFERRED_EDUCATION':
        case 'DEFERRED_POLICY':
        case 'DEFERRED_DQTT':
        case 'TEMPLATE_DEFERRED':
          DefermentListExport.export(validRecruits, sessionYear, unitName);
          break;

        case 'PRE_CHECK':
        case 'PRE_CHECK_PASS':
        case 'PRE_CHECK_FAIL':
        case 'TEMPLATE_PRE_CHECK':
          PreCheckListExport.export(validRecruits, sessionYear, unitName);
          break;

        case 'TEMPLATE_06':
          StatisticalReport06Export.export(validRecruits, sessionYear, unitName);
          break;

        case 'TEMPLATE_01A':
          RegistrationResult01AExport.export(validRecruits, sessionYear, unitName);
          break;

        case 'FIRST_TIME_REG':
        case 'TEMPLATE_01':
          RegistrationList01Export.export(validRecruits, sessionYear, unitName);
          break;

        case 'ENLISTED':
        case 'TEMPLATE_17A':
          EnlistmentList17AExport.export(validRecruits, sessionYear, unitName);
          break;
        
        default:
          GenericListExport.export(validRecruits, sessionYear, unitName, listLabel);
          break;
      }
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("Đã xảy ra lỗi khi tạo tệp Excel.");
    }
  }
}
