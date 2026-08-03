
import { Recruit, RecruitmentStatus } from '../types';
import { isRecruitInTab } from '../views/RecruitManagement/utils';
import { TABS } from '../views/RecruitManagement/constants';
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
      // 0. Lọc danh sách công dân thuộc đúng Tab / Sub-tab đã chọn (dùng isRecruitInTab)
      const validRecruits = recruits.filter(r => isRecruitInTab(r, templateId, sessionYear));

      // Xác định thông tin Tab và Parent Tab (nếu là danh sách con như 12.1, 12.2, 12.3, 5.1, 5.2...)
      const currentTabObj = TABS.find(t => t.id === templateId);
      const parentTabId = currentTabObj?.parentId;
      const parentTabObj = parentTabId ? TABS.find(t => t.id === parentTabId) : null;

      // 1. Kiểm tra các mẫu tùy biến được cấu hình bởi Cán bộ/Quản trị viên
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

        // Ưu tiên 3: Khớp tên danh sách (listLabel) hoặc nhãn Tab hiện tại
        if (!customTpl && listLabel) {
          const cleanLabel = listLabel.toLowerCase().replace(/^[0-9.]+\s*/, '').trim();
          if (cleanLabel.length > 2) {
            customTpl = customTemplates.find(t => {
              const cleanName = (t.name || '').toLowerCase().replace(/^[0-9.]+\s*/, '').trim();
              return cleanName && (cleanName.includes(cleanLabel) || cleanLabel.includes(cleanName));
            });
          }
        }

        // Ưu tiên 4: Nếu là Tab con (như 12.1, 12.2, 12.3, 5.1, 5.2) chưa có mẫu riêng, kế thừa mẫu của Tab cha (12, 5...)
        if (!customTpl && parentTabId) {
          // a. Khớp parentTabId với id / _id
          customTpl = customTemplates.find(t => t.id === parentTabId || t._id === parentTabId);

          // b. Khớp sourceTabs chứa parentTabId
          if (!customTpl) {
            customTpl = customTemplates.find(t => 
              t.sourceTabs && 
              t.sourceTabs.includes(parentTabId) && 
              !t.sourceTabs.includes('ALL')
            );
          }

          // c. Khớp tên mẫu chứa tên Tab cha
          if (!customTpl && parentTabObj) {
            const cleanParentLabel = parentTabObj.label.toLowerCase().replace(/^[0-9.]+\s*/, '').trim();
            if (cleanParentLabel.length > 2) {
              customTpl = customTemplates.find(t => {
                const cleanName = (t.name || '').toLowerCase().replace(/^[0-9.]+\s*/, '').trim();
                return cleanName && (cleanName.includes(cleanParentLabel) || cleanParentLabel.includes(cleanName));
              });
            }
          }
        }

        // Ưu tiên 5: Dành cho tab 'ALL' hoặc mẫu áp dụng chung
        if (!customTpl && templateId === 'ALL') {
          customTpl = customTemplates.find(t => t.sourceTabs && t.sourceTabs.includes('ALL'));
        }
      }

      const hasValidCustomFile = customTpl?.fileData && 
        customTpl.fileData.length > 500 && 
        Object.keys(customTpl.mapping || {}).length > 0;

      if (customTpl && hasValidCustomFile) {
        await TemplateExportService.inject(validRecruits, customTpl, sessionYear, listLabel);
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
