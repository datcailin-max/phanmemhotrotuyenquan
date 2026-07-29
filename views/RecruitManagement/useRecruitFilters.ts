
import { useMemo } from 'react';
import { Recruit, RecruitmentStatus } from '../../types';
import { checkAge, isRecruitInTab } from './utils';
import { removeVietnameseTones, LEGAL_DEFERMENT_REASONS } from '../../constants';
import { TABS } from './constants';

interface FilterOptions {
  searchTerm: string;
  filterVillage: string;
  filterAgeRange: string;
  advFilterEducation: string;
  advFilterHealth: string;
  advFilterPolitical: string;
}

export const useRecruitFilters = (
  scopeRecruits: Recruit[], 
  activeTabId: string, 
  options: FilterOptions,
  sessionYear: number
) => {
  return useMemo(() => {
    let result = scopeRecruits;
    const { searchTerm, filterVillage, filterAgeRange, advFilterEducation, advFilterHealth, advFilterPolitical } = options;

    const activeTab = TABS.find(t => t.id === activeTabId) || TABS[0];

    // Helper check hết hạn
    const isExpiredInSession = (period?: string) => {
        if (!period) return false;
        const parts = period.split('-');
        const lastPart = parts[parts.length - 1].trim();
        const yearStr = lastPart.includes('/') ? lastPart.split('/').pop() : lastPart;
        const endYear = parseInt(yearStr || '0');
        return endYear > 0 && endYear < sessionYear;
    };

    const isTotalSource = (r: Recruit) => {
        if ([
            RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
            RecruitmentStatus.EXEMPT_REGISTRATION,
            RecruitmentStatus.FIRST_TIME_REGISTRATION,
            RecruitmentStatus.DELETED
        ].includes(r.status)) return false;
        
        const age = checkAge(r, sessionYear);
        if (r.status === RecruitmentStatus.SOURCE && age < 18) return false;
        
        return true;
    };

    const tt50Statuses = [
        RecruitmentStatus.NOT_SELECTED_TT50, 
        RecruitmentStatus.KTC_KHONG_TUYEN_CHON, 
        RecruitmentStatus.KTC_CHUA_GOI_NHAP_NGU
    ];

    // Logic lọc theo từng Tab (Danh sách) bằng hàm chuẩn hóa isRecruitInTab
    result = result.filter(r => isRecruitInTab(r, activeTabId, sessionYear));

    if (searchTerm) {
      const s = removeVietnameseTones(searchTerm.toLowerCase());
      result = result.filter(r => removeVietnameseTones(r.fullName.toLowerCase()).includes(s) || (r.citizenId && r.citizenId.includes(s)));
    }
    if (filterVillage) {
      const v = removeVietnameseTones(filterVillage.toLowerCase());
      result = result.filter(r => removeVietnameseTones((r.address.village || '').toLowerCase()).includes(v));
    }
    if (filterAgeRange) {
      result = result.filter(r => {
        const age = checkAge(r, sessionYear);
        if (filterAgeRange === 'under18') return age < 18;
        if (filterAgeRange === '18-24') return age >= 18 && age <= 24;
        if (filterAgeRange === '18-27') return age >= 18 && age <= 27;
        if (filterAgeRange === '25-27') return age >= 25 && age <= 27;
        if (filterAgeRange === 'over27') return age > 27;
        const exactAge = Number(filterAgeRange);
        if (!isNaN(exactAge) && exactAge > 0) return age === exactAge;
        return true;
      });
    }
    if (advFilterEducation) result = result.filter(r => r.details.education === advFilterEducation);
    if (advFilterHealth) result = result.filter(r => r.physical.healthGrade === Number(advFilterHealth));
    if (advFilterPolitical) result = result.filter(r => r.details.politicalStatus === advFilterPolitical);

    return result;
  }, [scopeRecruits, activeTabId, options, sessionYear]);
};
