
import { useMemo } from 'react';
import { Recruit, RecruitmentStatus, UserRole } from '../../../types';
import { 
  isMilitarySchoolRecruit, 
  isTransferredRecruit, 
  isRecruitDeferred, 
  isRecruitExempted,
  isRecruitInTab
} from '../../RecruitManagement/utils';

interface UseDashboardStatsProps {
    recruits: Recruit[];
    sessionYear: number;
    userRole: UserRole;
    userUnit?: { commune: string; province: string };
    filterProvince: string;
    filterCommune: string;
}

export const useDashboardStats = ({
    recruits, sessionYear, userRole, userUnit, filterProvince, filterCommune
}: UseDashboardStatsProps) => {

    // 1. Lọc nguồn theo phạm vi đơn vị (Tỉnh/Xã) và Năm hiện tại
    const currentYearRecruits = useMemo(() => {
        let filtered = recruits.filter(r => r.recruitmentYear === sessionYear);
        if (userRole === 'ADMIN') {
            filtered = filtered.filter(r => r.address.province !== 'Tỉnh THUNGHIEM');
            if (filterProvince) filtered = filtered.filter(r => r.address.province === filterProvince);
            if (filterCommune) filtered = filtered.filter(r => r.address.commune === filterCommune);
        } else if (userRole === 'PROVINCE_ADMIN' && userUnit?.province) {
            filtered = filtered.filter(r => r.address.province === userUnit.province);
            if (filterCommune) filtered = filtered.filter(r => r.address.commune === filterCommune);
        } else if (userUnit?.province && userUnit?.commune) {
            filtered = filtered.filter(r => r.address.province === userUnit.province && r.address.commune === userUnit.commune);
        }
        return filtered;
    }, [recruits, sessionYear, filterProvince, filterCommune, userRole, userUnit]);

    const stats = useMemo(() => {
        // --- TÍNH TOÁN CÁC CON SỐ TIẾN ĐỘ ĐỒNG NHẤT 100% VỚI DANH SÁCH ---
        const activeYearRecruits = currentYearRecruits.filter(r => r.status !== RecruitmentStatus.DELETED);

        const countNotAllowed = activeYearRecruits.filter(r => isRecruitInTab(r, 'NOT_ALLOWED_REG', sessionYear)).length;
        const countExemptReg = activeYearRecruits.filter(r => isRecruitInTab(r, 'EXEMPT_REG', sessionYear)).length;
        const countFirstTime = activeYearRecruits.filter(r => isRecruitInTab(r, 'FIRST_TIME_REG', sessionYear)).length;
        const countTotalSource = activeYearRecruits.filter(r => isRecruitInTab(r, 'ALL', sessionYear)).length;

        // Tính toán chi tiết Danh sách 5
        const countKTC = activeYearRecruits.filter(r => isRecruitInTab(r, 'KTC_SUB1', sessionYear)).length;
        const countCGNN = activeYearRecruits.filter(r => isRecruitInTab(r, 'KTC_SUB2', sessionYear)).length;
        const countTT50 = activeYearRecruits.filter(r => isRecruitInTab(r, 'TT50', sessionYear)).length;

        const ds6_count = activeYearRecruits.filter(r => isRecruitInTab(r, 'PRE_CHECK', sessionYear)).length;
        const countPreCheckPass = activeYearRecruits.filter(r => isRecruitInTab(r, 'PRE_CHECK_PASS', sessionYear)).length;
        const countPreCheckFail = activeYearRecruits.filter(r => isRecruitInTab(r, 'PRE_CHECK_FAIL', sessionYear)).length;

        const countMedExam = activeYearRecruits.filter(r => isRecruitInTab(r, 'MED_EXAM', sessionYear)).length;
        const countMedPass = activeYearRecruits.filter(r => isRecruitInTab(r, 'MED_EXAM_PASS', sessionYear)).length;
        const countMedFail = activeYearRecruits.filter(r => isRecruitInTab(r, 'MED_EXAM_FAIL', sessionYear)).length;

        const countDeferred = activeYearRecruits.filter(r => isRecruitInTab(r, 'DEFERRED_LIST', sessionYear)).length;
        const countExempted = activeYearRecruits.filter(r => isRecruitInTab(r, 'EXEMPTED_LIST', sessionYear)).length;

        const countFinalized = activeYearRecruits.filter(r => isRecruitInTab(r, 'FINAL', sessionYear)).length;
        const countFinalizedOfficial = activeYearRecruits.filter(r => isRecruitInTab(r, 'FINAL_OFFICIAL', sessionYear)).length;
        const countFinalizedReserve = activeYearRecruits.filter(r => isRecruitInTab(r, 'FINAL_RESERVE', sessionYear)).length;

        const countEnlisted = activeYearRecruits.filter(r => isRecruitInTab(r, 'ENLISTED', sessionYear)).length;

        const countRemoved = activeYearRecruits.filter(r => isRecruitInTab(r, 'REMOVED', sessionYear)).length;
        const countRemovedMilitary = activeYearRecruits.filter(r => isRecruitInTab(r, 'REMOVED_MILITARY_SCHOOL', sessionYear)).length;
        const countRemovedTransferred = activeYearRecruits.filter(r => isRecruitInTab(r, 'REMOVED_TRANSFERRED', sessionYear)).length;
        const countRemovedOther = activeYearRecruits.filter(r => isRecruitInTab(r, 'REMOVED_OTHER', sessionYear)).length;

        const countRemaining = activeYearRecruits.filter(r => isRecruitInTab(r, 'REMAINING', sessionYear)).length;
        const countNextYearSource = activeYearRecruits.filter(r => isRecruitInTab(r, 'NEXT_YEAR_SOURCE', sessionYear)).length;

        // --- CÔNG DÂN HẾT HẠN CẦN RÀ SOÁT ---
        const expiringCount = activeYearRecruits.filter(r => isRecruitInTab(r, 'EXPIRING_LIST', sessionYear)).length;
        const expiringEduCount = activeYearRecruits.filter(r => isRecruitInTab(r, 'EXPIRING_EDU', sessionYear)).length;
        const expiringSentenceCount = activeYearRecruits.filter(r => isRecruitInTab(r, 'EXPIRING_SENTENCE', sessionYear)).length;

        // --- TÍNH TOÁN DỮ LIỆU BIỂU ĐỒ ---
        const validSource = activeYearRecruits.filter(r => isRecruitInTab(r, 'ALL', sessionYear));
        
        const createMap = (arr: any[], keyPath: string) => {
            const map: Record<string, number> = {};
            arr.forEach(r => {
                const parts = keyPath.split('.');
                let val = r;
                for(const p of parts) val = val ? val[p] : null;
                
                let rawKey = (val || 'Không xác định').toString().trim();
                let key = rawKey;
                
                if (rawKey.length > 0 && rawKey !== 'Không xác định') {
                    key = rawKey.charAt(0).toUpperCase() + rawKey.slice(1).toLowerCase();
                }

                map[key] = (map[key] || 0) + 1;
            });
            return Object.entries(map).map(([name, value]) => ({ name, value }));
        };

        // Custom Edu Mapping
        const eduMapping: Record<string, string> = {
            "Lớp 1": "Dưới lớp 8", "Lớp 2": "Dưới lớp 8", "Lớp 3": "Dưới lớp 8",
            "Lớp 4": "Dưới lớp 8", "Lớp 5": "Dưới lớp 8", "Lớp 6": "Dưới lớp 8",
            "Lớp 7": "Dưới lớp 8",
            "Lớp 8": "Lớp 8-12", "Lớp 9": "Lớp 8-12", "Lớp 10": "Lớp 8-12",
            "Lớp 11": "Lớp 8-12", "Lớp 12": "Lớp 8-12",
            "Đang học lớp 11": "Lớp 8-12", "Đang học lớp 12": "Lớp 8-12",
            "Đại học": "Đại học",
            "Cao đẳng": "Cao đẳng",
            "Trung cấp": "Trung cấp",
            "Đang học CĐ": "Đang học CĐ",
            "Đang học ĐH": "Đang học ĐH"
        };

        const eduStats: Record<string, number> = {
            "Dưới lớp 8": 0,
            "Lớp 8-12": 0,
            "Trung cấp": 0,
            "Cao đẳng": 0,
            "Đại học": 0,
            "Đang học CĐ": 0,
            "Đang học ĐH": 0
        };

        validSource.forEach(r => {
            const cat = eduMapping[r.details.education];
            if (cat && eduStats[cat] !== undefined) {
                eduStats[cat]++;
            }
        });
        const eduData = Object.entries(eduStats).map(([name, value]) => ({ name, value }));

        const ethnicityMap = createMap(validSource, 'details.ethnicity');
        const religionMap = createMap(validSource, 'details.religion');
        const jobMap = createMap(validSource, 'details.job');

        const geoMap: Record<string, number> = {};
        const isProvinceScope = (userRole === 'ADMIN' || userRole === 'PROVINCE_ADMIN') && !filterCommune;
        validSource.forEach(r => {
            const key = isProvinceScope ? r.address.commune : r.address.village;
            geoMap[key] = (geoMap[key] || 0) + 1;
        });

        const yearTrendMap: Record<number, number> = {};
        recruits.forEach(r => {
            let isOurUnit = true;
            if (userRole === 'PROVINCE_ADMIN') isOurUnit = r.address.province === userUnit?.province;
            if (userRole === 'EDITOR' || userRole === 'VIEWER') isOurUnit = r.address.province === userUnit?.province && r.address.commune === userUnit?.commune;
            
            if (isOurUnit && ![RecruitmentStatus.NOT_ALLOWED_REGISTRATION, RecruitmentStatus.EXEMPT_REGISTRATION, RecruitmentStatus.FIRST_TIME_REGISTRATION, RecruitmentStatus.DELETED].includes(r.status)) {
                // Tính tuổi cho năm tuyển chọn ghi trên hồ sơ
                const ageAtThatYear = (r.recruitmentYear - 1) - parseInt(r.dob.split('-')[0] || '0');
                if (ageAtThatYear >= 18 && ageAtThatYear <= 27) {
                    yearTrendMap[r.recruitmentYear] = (yearTrendMap[r.recruitmentYear] || 0) + 1;
                }
            }
        });
        const yearlyTrend = Object.entries(yearTrendMap)
            .map(([year, count]) => ({ year: `Năm ${year}`, count }))
            .sort((a, b) => a.year.localeCompare(b.year));

        return {
            counts: {
                countNotAllowed, countExemptReg, countFirstTime, countTotalSource, countTT50,
                countKTC, countCGNN,
                countPreCheckPass, countPreCheckFail, countMedExam, countMedPass, countMedFail,
                countDeferred, countExempted, 
                countFinalized,
                countFinalizedOfficial,
                countFinalizedReserve,
                countEnlisted, countRemoved, countRemovedMilitary, countRemovedTransferred, countRemovedOther, countRemaining, countNextYearSource,
                ds6_count,
                expiringCount,
                expiringEduCount,
                expiringSentenceCount
            },
            political: {
                dangVien: validSource.filter(r => r.details.politicalStatus === 'Dang_Vien').length,
                doanVien: validSource.filter(r => r.details.politicalStatus === 'Doan_Vien').length,
                total: validSource.length || 1
            },
            charts: {
                eduData,
                ethnicityData: ethnicityMap.sort((a,b) => b.value - a.value).slice(0, 8),
                religionData: religionMap,
                jobData: jobMap.sort((a,b) => b.value - a.value).slice(0, 8),
                geoData: Object.entries(geoMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 10),
                healthGradeData: [1,2,3,4,5,6].map(g => ({ name: `Loại ${g}`, value: validSource.filter(r => r.physical.healthGrade === g).length })),
                bmiData: [
                    { name: 'Gầy', value: validSource.filter(r => r.physical.bmi > 0 && r.physical.bmi < 18.5).length },
                    { name: 'Bình thường', value: validSource.filter(r => r.physical.bmi >= 18.5 && r.physical.bmi <= 25).length },
                    { name: 'Thừa cân', value: validSource.filter(r => r.physical.bmi > 25).length }
                ],
                yearlyTrend
            },
            isProvinceScope
        };
    }, [currentYearRecruits, sessionYear, userRole, filterCommune, recruits, userUnit]);

    return { stats, allYearRecruits: currentYearRecruits };
};
