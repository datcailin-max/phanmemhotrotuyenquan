
import { useMemo } from 'react';
import { Recruit, RecruitmentStatus, UserRole } from '../../../types';

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
        const checkAge = (r: Recruit, year: number) => year - parseInt(r.dob.split('-')[0] || '0');

        // Helper check ending year
        const isExpiringInCurrentYear = (period?: string) => {
            if (!period) return false;
            const parts = period.split('-');
            const lastPart = parts[parts.length - 1].trim();
            const endYear = parseInt(lastPart);
            return endYear === sessionYear;
        };

        // --- TÍNH TOÁN CÁC CON SỐ TIẾN ĐỘ ---
        const countNotAllowed = currentYearRecruits.filter(r => r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION).length;
        const countExemptReg = currentYearRecruits.filter(r => r.status === RecruitmentStatus.EXEMPT_REGISTRATION).length;
        const countFirstTime = currentYearRecruits.filter(r => r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION).length;
        
        // DS 4: Tổng nguồn (Đủ tuổi 18-27, trừ diện 1, 2, 3)
        const ds4_recruits = currentYearRecruits.filter(r => {
            if ([RecruitmentStatus.NOT_ALLOWED_REGISTRATION, RecruitmentStatus.EXEMPT_REGISTRATION, RecruitmentStatus.FIRST_TIME_REGISTRATION, RecruitmentStatus.DELETED].includes(r.status)) return false;
            const age = checkAge(r, sessionYear);
            return age >= 18;
        });
        const countTotalSource = ds4_recruits.length;

        const countTT50 = currentYearRecruits.filter(r => r.status === RecruitmentStatus.NOT_SELECTED_TT50).length;
        const countDeferred = currentYearRecruits.filter(r => r.status === RecruitmentStatus.DEFERRED).length;
        const countExempted = currentYearRecruits.filter(r => r.status === RecruitmentStatus.EXEMPTED).length;
        const countRemoved = currentYearRecruits.filter(r => r.status === RecruitmentStatus.REMOVED_FROM_SOURCE).length;

        // DS 6: Đủ ĐK Sơ tuyển = DS 4 - (5 + 8 + 9 + 12)
        const ds6_count = ds4_recruits.filter(r => 
            ![RecruitmentStatus.NOT_SELECTED_TT50, RecruitmentStatus.DEFERRED, RecruitmentStatus.EXEMPTED, RecruitmentStatus.REMOVED_FROM_SOURCE].includes(r.status)
        ).length;

        const countPreCheckPass = currentYearRecruits.filter(r => [RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status)).length;
        const countPreCheckFail = currentYearRecruits.filter(r => r.status === RecruitmentStatus.PRE_CHECK_FAILED).length;
        const countMedPass = currentYearRecruits.filter(r => [RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status)).length;
        const countMedFail = currentYearRecruits.filter(r => r.status === RecruitmentStatus.MED_EXAM_FAILED).length;
        
        const finalized = currentYearRecruits.filter(r => [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status));
        const countEnlisted = currentYearRecruits.filter(r => (r.status === RecruitmentStatus.ENLISTED && r.enlistmentType !== 'RESERVE') || (r.status === RecruitmentStatus.FINALIZED && r.enlistmentType === 'OFFICIAL')).length;
        
        // DS 13: Nguồn còn lại (Những người trong DS 4 chưa đi nhập ngũ chính thức)
        const countRemaining = ds4_recruits.filter(r => {
            const isEnlistedOfficial = (r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL';
            return !isEnlistedOfficial;
        }).length;

        // DS 14: NGUỒN CỦA NĂM SAU = Nguồn còn lại (13) + Đăng ký lần đầu (3)
        // Chú ý: Tuyệt đối không cộng thêm countNotAllowed (1) hoặc countExemptReg (2)
        const countNextYearSource = countRemaining + countFirstTime;

        // --- CÔNG DÂN HẾT HẠN TRONG NĂM ---
        const expiringEdu = currentYearRecruits.filter(r => r.status === RecruitmentStatus.DEFERRED && isExpiringInCurrentYear(r.details.educationPeriod));
        const expiringSentence = currentYearRecruits.filter(r => r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION && isExpiringInCurrentYear(r.details.sentencePeriod));

        // --- TÍNH TOÁN DỮ LIỆU BIỂU ĐỒ (Dựa trên Tổng nguồn DS 4) ---
        const validSource = ds4_recruits;
        
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

        const eduMap = createMap(validSource, 'details.education');
        const ethnicityMap = createMap(validSource, 'details.ethnicity');
        const religionMap = createMap(validSource, 'details.religion');
        const jobMap = createMap(validSource, 'details.job');

        const geoMap: Record<string, number> = {};
        const isProvinceScope = (userRole === 'ADMIN' || userRole === 'PROVINCE_ADMIN') && !filterCommune;
        validSource.forEach(r => {
            const key = isProvinceScope ? r.address.commune : r.address.village;
            geoMap[key] = (geoMap[key] || 0) + 1;
        });

        // --- XU HƯỚNG NGUỒN QUA CÁC NĂM ---
        const yearTrendMap: Record<number, number> = {};
        recruits.forEach(r => {
            let isOurUnit = true;
            if (userRole === 'PROVINCE_ADMIN') isOurUnit = r.address.province === userUnit?.province;
            if (userRole === 'EDITOR' || userRole === 'VIEWER') isOurUnit = r.address.province === userUnit?.province && r.address.commune === userUnit?.commune;
            
            if (isOurUnit && ![RecruitmentStatus.NOT_ALLOWED_REGISTRATION, RecruitmentStatus.EXEMPT_REGISTRATION, RecruitmentStatus.FIRST_TIME_REGISTRATION, RecruitmentStatus.DELETED].includes(r.status)) {
                const ageAtThatYear = r.recruitmentYear - parseInt(r.dob.split('-')[0] || '0');
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
                countPreCheckPass, countPreCheckFail, countMedPass, countMedFail,
                countDeferred, countExempted, countFinalized: finalized.length,
                countFinalizedOfficial: finalized.filter(r => r.enlistmentType === 'OFFICIAL').length,
                countFinalizedReserve: finalized.filter(r => r.enlistmentType === 'RESERVE').length,
                countEnlisted, countRemoved, countRemaining, countNextYearSource,
                ds6_count,
                expiringCount: expiringEdu.length + expiringSentence.length,
                expiringEduCount: expiringEdu.length,
                expiringSentenceCount: expiringSentence.length
            },
            political: {
                dangVien: validSource.filter(r => r.details.politicalStatus === 'Dang_Vien').length,
                doanVien: validSource.filter(r => r.details.politicalStatus === 'Doan_Vien').length,
                total: validSource.length || 1
            },
            charts: {
                eduData: eduMap,
                ethnicityData: ethnicityMap.sort((a,b) => b.value - a.value).slice(0, 5),
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
