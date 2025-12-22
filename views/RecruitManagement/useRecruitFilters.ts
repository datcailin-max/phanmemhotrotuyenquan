
import { useMemo } from 'react';
import { Recruit, RecruitmentStatus } from '../../types';
import { checkAge } from './utils';
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

    // Logic lọc theo từng Tab (Danh sách)
    switch (activeTabId) {
      case 'NOT_ALLOWED_REG':
        result = result.filter(r => r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION);
        break;

      case 'EXEMPT_REG':
        result = result.filter(r => r.status === RecruitmentStatus.EXEMPT_REGISTRATION);
        break;

      case 'FIRST_TIME_REG':
        result = result.filter(r => r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION);
        break;

      case 'ALL':
        // Danh sách 4: Toàn bộ nguồn (>= 18 tuổi, trừ diện 1, 2, 3)
        result = result.filter(r => {
          if (checkAge(r, sessionYear) < 18) return false;
          if ([
              RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
              RecruitmentStatus.EXEMPT_REGISTRATION,
              RecruitmentStatus.FIRST_TIME_REGISTRATION,
              RecruitmentStatus.DELETED
          ].includes(r.status)) return false;
          return true;
        });
        break;

      case 'PRE_CHECK':
        // Danh sách 6: Hiển thị DS 4 - (DS 5 + DS 8 + DS 9 + DS 12)
        result = result.filter(r => {
            const age = checkAge(r, sessionYear);
            if (age < 18) return false;
            if ([RecruitmentStatus.NOT_ALLOWED_REGISTRATION, RecruitmentStatus.EXEMPT_REGISTRATION, RecruitmentStatus.FIRST_TIME_REGISTRATION].includes(r.status)) return false;
            if ([
                RecruitmentStatus.NOT_SELECTED_TT50, 
                RecruitmentStatus.DEFERRED, 
                RecruitmentStatus.EXEMPTED, 
                RecruitmentStatus.REMOVED_FROM_SOURCE,
                RecruitmentStatus.DELETED
            ].includes(r.status)) return false;
            return true;
        });
        break;

      case 'PRE_CHECK_PASS':
        result = result.filter(r => [
            RecruitmentStatus.PRE_CHECK_PASSED, 
            RecruitmentStatus.MED_EXAM_PASSED, 
            RecruitmentStatus.MED_EXAM_FAILED, 
            RecruitmentStatus.FINALIZED, 
            RecruitmentStatus.ENLISTED
        ].includes(r.status));
        break;

      case 'PRE_CHECK_FAIL':
        result = result.filter(r => r.status === RecruitmentStatus.PRE_CHECK_FAILED);
        break;

      case 'MED_EXAM':
        result = result.filter(r => [
            RecruitmentStatus.PRE_CHECK_PASSED, 
            RecruitmentStatus.MED_EXAM_PASSED, 
            RecruitmentStatus.MED_EXAM_FAILED, 
            RecruitmentStatus.FINALIZED, 
            RecruitmentStatus.ENLISTED
        ].includes(r.status));
        break;

      case 'MED_EXAM_PASS':
        result = result.filter(r => [RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status));
        break;

      case 'MED_EXAM_FAIL':
        result = result.filter(r => r.status === RecruitmentStatus.MED_EXAM_FAILED);
        break;

      case 'DEFERRED_LIST':
        result = result.filter(r => r.status === RecruitmentStatus.DEFERRED);
        break;

      case 'DEFERRED_HEALTH':
      case 'DEFERRED_EDUCATION':
      case 'DEFERRED_POLICY':
      case 'DEFERRED_DQTT':
        result = result.filter(r => r.status === RecruitmentStatus.DEFERRED);
        if (activeTabId === 'DEFERRED_HEALTH') result = result.filter(r => r.defermentReason === LEGAL_DEFERMENT_REASONS[0]);
        if (activeTabId === 'DEFERRED_EDUCATION') result = result.filter(r => (r.defermentReason === LEGAL_DEFERMENT_REASONS[6] || r.defermentReason === LEGAL_DEFERMENT_REASONS[8]));
        if (activeTabId === 'DEFERRED_POLICY') {
            const policyReasons = [LEGAL_DEFERMENT_REASONS[1], LEGAL_DEFERMENT_REASONS[2], LEGAL_DEFERMENT_REASONS[3], LEGAL_DEFERMENT_REASONS[4], LEGAL_DEFERMENT_REASONS[5]];
            result = result.filter(r => policyReasons.includes(r.defermentReason || ''));
        }
        if (activeTabId === 'DEFERRED_DQTT') result = result.filter(r => r.defermentReason === LEGAL_DEFERMENT_REASONS[7]);
        break;

      case 'FINAL':
        result = result.filter(r => [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status));
        break;

      case 'FINAL_OFFICIAL':
        result = result.filter(r => [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status) && r.enlistmentType === 'OFFICIAL');
        break;

      case 'FINAL_RESERVE':
        result = result.filter(r => [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status) && r.enlistmentType === 'RESERVE');
        break;

      case 'ENLISTED':
        result = result.filter(r => r.status === RecruitmentStatus.ENLISTED && r.enlistmentType === 'OFFICIAL');
        break;

      case 'REMAINING':
        // DS 13: Nguồn còn lại (Nguồn sẵn sàng nhưng chưa đi)
        result = result.filter(r => {
            if (checkAge(r, sessionYear) < 18) return false;
            // Loại bỏ hoàn toàn diện cấm, miễn, và đăng ký lần đầu
            const isRestricted = [
                RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
                RecruitmentStatus.EXEMPT_REGISTRATION, 
                RecruitmentStatus.FIRST_TIME_REGISTRATION, 
                RecruitmentStatus.DELETED, 
                RecruitmentStatus.REMOVED_FROM_SOURCE
            ];
            if (isRestricted.includes(r.status)) return false;
            // Loại bỏ người đã phát lệnh chính thức
            const isEnlistedOfficial = (r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL';
            if (isEnlistedOfficial) return false;
            return true;
        });
        break;

      case 'NEXT_YEAR_SOURCE':
        // DS 14: NGUỒN CỦA NĂM SAU = (DS 3: Đăng ký lần đầu) + (DS 13: Nguồn còn lại)
        // Tuyệt đối không bao gồm diện Cấm và Miễn (1 và 2)
        result = result.filter(r => {
            // 1. Chấp nhận diện đăng ký lần đầu
            if (r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION) return true;
            
            // 2. Chấp nhận diện Nguồn còn lại (Sẵn sàng nhưng chưa đi)
            const age = checkAge(r, sessionYear);
            if (age < 18) return false;
            const isRestricted = [
                RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
                RecruitmentStatus.EXEMPT_REGISTRATION, 
                RecruitmentStatus.FIRST_TIME_REGISTRATION, // Đã check ở trên
                RecruitmentStatus.DELETED, 
                RecruitmentStatus.REMOVED_FROM_SOURCE
            ];
            if (isRestricted.includes(r.status)) return false;
            const isEnlistedOfficial = (r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL';
            if (isEnlistedOfficial) return false;
            
            return true;
        });
        break;

      default:
        if (activeTab.status) {
            result = result.filter(r => activeTab.status!.includes(r.status));
        }
        break;
    }

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
        return filterAgeRange === '18-25' ? (age >= 18 && age <= 25) : (age >= 26 && age <= 27);
      });
    }
    if (advFilterEducation) result = result.filter(r => r.details.education === advFilterEducation);
    if (advFilterHealth) result = result.filter(r => r.physical.healthGrade === Number(advFilterHealth));
    if (advFilterPolitical) result = result.filter(r => r.details.politicalStatus === advFilterPolitical);

    return result;
  }, [scopeRecruits, activeTabId, options, sessionYear]);
};
