
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
        // Danh sách 4: Toàn bộ nguồn
        result = result.filter(isTotalSource);
        break;

      case 'TT50':
        result = result.filter(r => tt50Statuses.includes(r.status));
        break;

      case 'KTC_SUB1':
        result = result.filter(r => [RecruitmentStatus.NOT_SELECTED_TT50, RecruitmentStatus.KTC_KHONG_TUYEN_CHON].includes(r.status));
        break;

      case 'KTC_SUB2':
        result = result.filter(r => r.status === RecruitmentStatus.KTC_CHUA_GOI_NHAP_NGU);
        break;

      case 'PRE_CHECK':
        result = result.filter(r => {
            if (!isTotalSource(r)) return false;
            return ![
                ...tt50Statuses,
                RecruitmentStatus.DEFERRED, 
                RecruitmentStatus.EXEMPTED,
                RecruitmentStatus.REMOVED_FROM_SOURCE
            ].includes(r.status);
        });
        break;

      case 'PRE_CHECK_PASS':
        result = result.filter(r => {
            if (!isTotalSource(r)) return false;
            return [
                RecruitmentStatus.PRE_CHECK_PASSED, 
                RecruitmentStatus.MED_EXAM_PASSED, 
                RecruitmentStatus.MED_EXAM_FAILED, 
                RecruitmentStatus.FINALIZED, 
                RecruitmentStatus.ENLISTED
            ].includes(r.status);
        });
        break;

      case 'PRE_CHECK_FAIL':
        result = result.filter(r => {
            if (!isTotalSource(r)) return false;
            return r.status === RecruitmentStatus.PRE_CHECK_FAILED;
        });
        break;

      case 'MED_EXAM':
        result = result.filter(r => {
            if (!isTotalSource(r)) return false;
            return [
                RecruitmentStatus.PRE_CHECK_PASSED, 
                RecruitmentStatus.MED_EXAM_PASSED, 
                RecruitmentStatus.MED_EXAM_FAILED, 
                RecruitmentStatus.FINALIZED, 
                RecruitmentStatus.ENLISTED
            ].includes(r.status);
        });
        break;

      case 'MED_EXAM_PASS':
        result = result.filter(r => {
            if (!isTotalSource(r)) return false;
            return [RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status);
        });
        break;

      case 'MED_EXAM_FAIL':
        result = result.filter(r => {
            if (!isTotalSource(r)) return false;
            return r.status === RecruitmentStatus.MED_EXAM_FAILED;
        });
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
        result = result.filter(r => {
            if (!isTotalSource(r)) return false;
            if (r.status === RecruitmentStatus.REMOVED_FROM_SOURCE) return false;
            const isEnlistedOfficial = (r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL';
            return !isEnlistedOfficial;
        });
        break;

      case 'NEXT_YEAR_SOURCE':
        result = result.filter(r => {
            if (r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION) return true;
            if (!isTotalSource(r)) return false;
            if (r.status === RecruitmentStatus.REMOVED_FROM_SOURCE) return false;
            const isEnlistedOfficial = (r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL';
            return !isEnlistedOfficial;
        });
        break;

      case 'EXPIRING_LIST':
        result = result.filter(r => {
            const isEduExpired = r.status === RecruitmentStatus.DEFERRED && isExpiredInSession(r.details.educationPeriod);
            const isSentenceExpired = r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION && isExpiredInSession(r.details.sentencePeriod);
            return isEduExpired || isSentenceExpired;
        });
        break;

      case 'EXPIRING_EDU':
        result = result.filter(r => r.status === RecruitmentStatus.DEFERRED && isExpiredInSession(r.details.educationPeriod));
        break;

      case 'EXPIRING_SENTENCE':
        result = result.filter(r => r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION && isExpiredInSession(r.details.sentencePeriod));
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
        if (filterAgeRange === 'under18') return age < 18;
        if (filterAgeRange === '18-24') return age >= 18 && age <= 24;
        if (filterAgeRange === '25-27') return age >= 25 && age <= 27;
        if (filterAgeRange === 'over27') return age > 27;
        return true;
      });
    }
    if (advFilterEducation) result = result.filter(r => r.details.education === advFilterEducation);
    if (advFilterHealth) result = result.filter(r => r.physical.healthGrade === Number(advFilterHealth));
    if (advFilterPolitical) result = result.filter(r => r.details.politicalStatus === advFilterPolitical);

    return result;
  }, [scopeRecruits, activeTabId, options, sessionYear]);
};
