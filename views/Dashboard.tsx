
import React, { useMemo, useState } from 'react';
import { Recruit, RecruitmentStatus, UserRole } from '../types';
import { PROVINCES_VN, LOCATION_DATA, EDUCATIONS, LEGAL_DEFERMENT_REASONS } from '../constants';
import { 
  Users, 
  Activity, 
  ClipboardList,
  Stethoscope,
  FileSignature,
  Flag,
  MapPin,
  HeartPulse,
  BookOpen,
  Calendar,
  AlertCircle,
  Tent,
  Smile,
  Filter,
  Ruler,
  UserX,
  BarChart2,
  PauseCircle,
  ShieldCheck,
  Layers,
  Ban,
  Shield,
  BookX,
  UserPlus,
  TrendingUp,
  Briefcase,
  Landmark,
  Scale,
  Dna,
  UserCheck,
  ArrowRightCircle,
  ChevronRight,
  Home,
  CheckCircle2,
  AlertTriangle,
  Info,
  History
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LabelList,
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Line
} from 'recharts';

interface DashboardProps {
  recruits: Recruit[];
  onNavigate: (tabId: string) => void;
  sessionYear: number;
  userRole: UserRole;
  userUnit?: { commune: string; province: string };
}

// Màu sắc hệ thống chuẩn Military/Báo cáo chuyên nghiệp
const COLORS = {
    primary: '#059669',   // Green 600
    secondary: '#3b82f6', // Blue 500
    accent: '#f59e0b',    // Amber 500
    danger: '#ef4444',    // Red 500
    neutral: '#6b7280',   // Gray 500
    indigo: '#6366f1',
    purple: '#8b5cf6',
    pink: '#ec4899',
    teal: '#0d9488',
    pie: ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#0d9488', '#f43f5e']
};

const ProcessStepCard = ({ title, count, icon: Icon, color, onClick, isLast = false, subLabel, detailText }: any) => {
    return (
        <div 
            onClick={onClick}
            className={`flex-1 relative p-4 rounded-xl border transition-all cursor-pointer group bg-white hover:shadow-lg ${isLast ? 'border-teal-500 bg-teal-50/30' : 'border-gray-200 hover:border-military-300'}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                </div>
                <div className="text-right">
                     {subLabel && <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5 leading-none">{subLabel}</p>}
                     <p className={`text-2xl font-black ${isLast ? 'text-teal-700' : 'text-gray-800'}`}>{count.toLocaleString()}</p>
                </div>
            </div>
            
            <h3 className="text-[11px] font-black text-gray-700 mt-2 mb-1 group-hover:text-military-700 transition-colors uppercase leading-tight tracking-tighter">
                {title}
            </h3>
            
            {detailText && (
                <p className="text-[10px] text-gray-500 font-bold bg-gray-50 px-1.5 py-0.5 rounded inline-block mt-1">{detailText}</p>
            )}

            {/* Chỉ báo hướng đi */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRightCircle size={14} className="text-military-400" />
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ recruits, onNavigate, sessionYear, userRole, userUnit }) => {
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCommune, setFilterCommune] = useState('');

  // --- 1. LOGIC LỌC DỮ LIỆU ĐA CẤP (Dành cho Tỉnh và Master Admin) ---
  const allYearRecruits = useMemo(() => {
      let filtered = recruits.filter(r => r.recruitmentYear === sessionYear);
      
      // Loại bỏ dữ liệu test cho Admin
      if (userRole === 'ADMIN') {
          filtered = filtered.filter(r => r.address.province !== 'Tỉnh THUNGHIEM');
      }

      if (userRole !== 'ADMIN') {
          if (userRole === 'PROVINCE_ADMIN' && userUnit?.province) {
              // CẤP TỈNH: Mặc định lọc theo Tỉnh (Xã rỗng -> Lấy toàn bộ xã)
              filtered = filtered.filter(r => r.address.province === userUnit.province);
              // Tính năng bổ sung: Lọc theo xã cụ thể của tỉnh đó
              if (filterCommune) {
                  filtered = filtered.filter(r => r.address.commune === filterCommune);
              }
          } else if (userUnit?.province && userUnit?.commune) {
              // CẤP XÃ: Lọc chính xác theo Tỉnh và Xã của tài khoản
              filtered = filtered.filter(r => 
                  r.address.province === userUnit.province && 
                  r.address.commune === userUnit.commune
              );
          } else {
              return []; // Không xác định được đơn vị
          }
      } else {
          // MASTER ADMIN: Lọc linh hoạt
          if (filterProvince) filtered = filtered.filter(r => r.address.province === filterProvince);
          if (filterCommune) filtered = filtered.filter(r => r.address.commune === filterCommune);
      }
      return filtered;
  }, [recruits, sessionYear, filterProvince, filterCommune, userRole, userUnit]);

  // --- 2. TÍNH TOÁN CÁC CHỈ SỐ THỐNG KÊ CHI TIẾT (14 DANH SÁCH) ---
  const stats = useMemo(() => {
    const checkAge = (r: Recruit) => {
        const birthYear = parseInt(r.dob.split('-')[0] || '0');
        return sessionYear - birthYear;
    };

    const isValidSourceStatus = (status: RecruitmentStatus) => {
        return ![
            RecruitmentStatus.REMOVED_FROM_SOURCE,
            RecruitmentStatus.NOT_ALLOWED_REGISTRATION,
            RecruitmentStatus.EXEMPT_REGISTRATION,
            RecruitmentStatus.DELETED
        ].includes(status);
    };

    // 14 DANH SÁCH CHÍNH
    const countNotAllowed = allYearRecruits.filter(r => r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION).length;
    const countExemptReg = allYearRecruits.filter(r => r.status === RecruitmentStatus.EXEMPT_REGISTRATION).length;
    const countFirstTime = allYearRecruits.filter(r => r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION).length;
    
    // List 4: Tổng nguồn (>= 18, trừ 1,2,3 và Deleted)
    const countTotalSource = allYearRecruits.filter(r => {
        if (r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || 
            r.status === RecruitmentStatus.EXEMPT_REGISTRATION ||
            r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION ||
            r.status === RecruitmentStatus.DELETED) return false;
        if (checkAge(r) < 18) return false;
        return true;
    }).length;

    // List 5: TT50
    const countTT50 = allYearRecruits.filter(r => r.status === RecruitmentStatus.NOT_SELECTED_TT50).length;

    // List 6: Đủ ĐK Sơ tuyển
    const preCheckStatuses = [
        RecruitmentStatus.SOURCE, RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.PRE_CHECK_FAILED, 
        RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED
    ];
    const countEligiblePreCheck = allYearRecruits.filter(r => checkAge(r) >= 18 && preCheckStatuses.includes(r.status)).length;
    const countPreCheckPass = allYearRecruits.filter(r => [RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status)).length;
    const countPreCheckFail = allYearRecruits.filter(r => r.status === RecruitmentStatus.PRE_CHECK_FAILED).length;

    // List 7: Đủ ĐK Khám tuyển
    const medExamStatuses = [
        RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED
    ];
    const countEligibleMedExam = allYearRecruits.filter(r => checkAge(r) >= 18 && medExamStatuses.includes(r.status)).length;
    const countMedPass = allYearRecruits.filter(r => [RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status)).length;
    const countMedFail = allYearRecruits.filter(r => r.status === RecruitmentStatus.MED_EXAM_FAILED).length;

    // List 8, 9
    const countDeferred = allYearRecruits.filter(r => r.status === RecruitmentStatus.DEFERRED).length;
    const countExempted = allYearRecruits.filter(r => r.status === RecruitmentStatus.EXEMPTED).length;

    // List 10: Chốt hồ sơ
    const finalizedRecruits = allYearRecruits.filter(r => [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status));
    const countFinalized = finalizedRecruits.length;
    const countFinalizedOfficial = finalizedRecruits.filter(r => r.enlistmentType === 'OFFICIAL').length;
    const countFinalizedReserve = finalizedRecruits.filter(r => r.enlistmentType === 'RESERVE').length;

    // List 11: Nhập ngũ
    const countEnlisted = allYearRecruits.filter(r => 
        (r.status === RecruitmentStatus.ENLISTED && r.enlistmentType !== 'RESERVE') ||
        (r.status === RecruitmentStatus.FINALIZED && r.enlistmentType === 'OFFICIAL')
    ).length;

    // List 12, 13
    const countRemoved = allYearRecruits.filter(r => r.status === RecruitmentStatus.REMOVED_FROM_SOURCE).length;
    const countRemaining = allYearRecruits.filter(r => {
        if (checkAge(r) < 18) return false;
        if (r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || 
            r.status === RecruitmentStatus.EXEMPT_REGISTRATION ||
            r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION ||
            r.status === RecruitmentStatus.DELETED) return false;
        if (r.status === RecruitmentStatus.REMOVED_FROM_SOURCE) return false;
        if ((r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL') return false;
        return true;
    }).length;

    // List 14: Nguồn năm sau
    const countNextYearSource = countFirstTime + countRemaining;

    // --- PHÂN TÍCH DỮ LIỆU BIỂU ĐỒ (Dựa trên Nguồn hợp lệ) ---
    const validRecruitsForCharts = allYearRecruits.filter(r => {
        if (!isValidSourceStatus(r.status)) return false;
        if (r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION) return true;
        if (checkAge(r) < 18) return false;
        return true;
    });

    const totalValid = validRecruitsForCharts.length || 1;

    // 1. Trình độ văn hóa
    const eduMap: Record<string, number> = {};
    validRecruitsForCharts.forEach(r => {
        let edu = r.details.education;
        if (edu.includes('Đại học') || edu.includes('Cao đẳng') || edu.includes('Trung cấp')) edu = 'ĐH/CĐ/TC';
        eduMap[edu] = (eduMap[edu] || 0) + 1;
    });
    const eduChartData = Object.entries(eduMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // 2. Độ tuổi
    const ageMap: Record<string, number> = {};
    validRecruitsForCharts.forEach(r => {
        if (r.dob) {
            const year = r.dob.split('-')[0];
            if (year) ageMap[year] = (ageMap[year] || 0) + 1;
        }
    });
    const ageChartData = Object.entries(ageMap).map(([name, value]) => ({ name: `${name}`, value })).sort((a, b) => a.name.localeCompare(b.name));

    // 3. Phân bổ Địa bàn (QUAN TRỌNG: TỈNH XEM XÃ - XÃ XEM THÔN)
    const isViewingProvince = (userRole === 'PROVINCE_ADMIN' || userRole === 'ADMIN') && !filterCommune && !userUnit?.commune;
    
    const geoMap: Record<string, number> = {};
    validRecruitsForCharts.forEach(r => {
        // Nếu đang ở phạm vi Tỉnh và chưa lọc vào Xã cụ thể -> Hiển thị Xã
        // Nếu đã ở trong Xã (hoặc tài khoản Xã) -> Hiển thị Thôn
        const key = isViewingProvince ? (r.address.commune || 'Chưa rõ') : (r.address.village || 'Chưa rõ');
        geoMap[key] = (geoMap[key] || 0) + 1;
    });
    const geoChartData = Object.entries(geoMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
    
    // 4. Chính trị & Xã hội
    const ethnicityMap: Record<string, number> = {};
    const religionMap: Record<string, number> = {};
    const jobMap: Record<string, number> = {};
    validRecruitsForCharts.forEach(r => { 
        ethnicityMap[r.details.ethnicity || 'Kinh'] = (ethnicityMap[r.details.ethnicity || 'Kinh'] || 0) + 1; 
        religionMap[r.details.religion || 'Không'] = (religionMap[r.details.religion || 'Không'] || 0) + 1;
        jobMap[r.details.job || 'Tự do'] = (jobMap[r.details.job || 'Tự do'] || 0) + 1;
    });

    const ethnicityData = Object.entries(ethnicityMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 8);
    const religionData = Object.entries(religionMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 8);
    const jobData = Object.entries(jobMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 10);

    // 5. Thống kê Sức khỏe (Chi tiết nhất)
    const heightStats = {
        'Dưới 160': validRecruitsForCharts.filter(r => r.physical.height > 0 && r.physical.height < 160).length,
        '160 - 165': validRecruitsForCharts.filter(r => r.physical.height >= 160 && r.physical.height <= 165).length,
        '166 - 170': validRecruitsForCharts.filter(r => r.physical.height >= 166 && r.physical.height <= 170).length,
        'Trên 170': validRecruitsForCharts.filter(r => r.physical.height > 170).length
    };
    const heightChartData = Object.entries(heightStats).map(([name, value]) => ({ name, value }));

    const weightStats = {
        'Dưới 50kg': validRecruitsForCharts.filter(r => r.physical.weight > 0 && r.physical.weight < 50).length,
        '50 - 60kg': validRecruitsForCharts.filter(r => r.physical.weight >= 50 && r.physical.weight <= 60).length,
        'Trên 60kg': validRecruitsForCharts.filter(r => r.physical.weight > 60).length
    };
    const weightChartData = Object.entries(weightStats).map(([name, value]) => ({ name, value }));

    const bmiStats = {
        'Gầy (<18.5)': validRecruitsForCharts.filter(r => r.physical.bmi > 0 && r.physical.bmi < 18.5).length,
        'Bình thường (18.5-25)': validRecruitsForCharts.filter(r => r.physical.bmi >= 18.5 && r.physical.bmi <= 25).length,
        'Thừa cân (>25)': validRecruitsForCharts.filter(r => r.physical.bmi > 25).length
    };
    const bmiChartData = Object.entries(bmiStats).map(([name, value]) => ({ name, value }));

    const healthGradeStats = {
        'Loại 1': validRecruitsForCharts.filter(r => r.physical.healthGrade === 1).length,
        'Loại 2': validRecruitsForCharts.filter(r => r.physical.healthGrade === 2).length,
        'Loại 3': validRecruitsForCharts.filter(r => r.physical.healthGrade === 3).length,
        'Loại 4': validRecruitsForCharts.filter(r => r.physical.healthGrade === 4).length,
        'Loại 5': validRecruitsForCharts.filter(r => r.physical.healthGrade === 5).length,
        'Loại 6': validRecruitsForCharts.filter(r => r.physical.healthGrade === 6).length,
        'Chưa khám': validRecruitsForCharts.filter(r => !r.physical.healthGrade || r.physical.healthGrade === 0).length
    };
    const healthGradeData = Object.entries(healthGradeStats).map(([name, value]) => ({ name, value }));

    return { 
        countNotAllowed, countExemptReg, countFirstTime, countTotalSource, countTT50,
        countEligiblePreCheck, countPreCheckPass, countPreCheckFail,
        countEligibleMedExam, countMedPass, countMedFail,
        countDeferred, countExempted, 
        countFinalized, countFinalizedOfficial, countFinalizedReserve,
        countEnlisted, countRemoved, countRemaining, countNextYearSource,
        dangVien: validRecruitsForCharts.filter(r => r.details.politicalStatus === 'Dang_Vien').length,
        doanVien: validRecruitsForCharts.filter(r => r.details.politicalStatus === 'Doan_Vien').length,
        eduChartData, ageChartData, geoChartData, ethnicityData, religionData, jobData,
        heightChartData, weightChartData, bmiChartData, healthGradeData,
        totalValid, isViewingProvince
    };
  }, [allYearRecruits, sessionYear, userRole, filterCommune, userUnit]);

  // LOGIC Tên phạm vi hiển thị
  const dashboardScopeName = useMemo(() => {
      if (filterCommune) return `BAN CHQS ${filterCommune.toUpperCase()}`;
      if (userRole === 'PROVINCE_ADMIN' && userUnit) return `BỘ CHQS TỈNH ${userUnit.province.toUpperCase()}`;
      if (userRole !== 'ADMIN' && userUnit) return `BAN CHQS ${userUnit.commune.toUpperCase()}`;
      if (filterProvince) return `BỘ CHQS TỈNH ${filterProvince.toUpperCase()}`;
      return "TOÀN QUỐC (TỔNG HỢP)";
  }, [userRole, userUnit, filterProvince, filterCommune]);

  // LOGIC SO SÁNH QUA CÁC NĂM
  const yearlyComparisonData = useMemo(() => {
      const statsMap: Record<number, { year: string, source: number, enlisted: number }> = {};
      recruits.forEach(r => {
          if (userRole === 'ADMIN') {
              if (r.address.province === 'Tỉnh THUNGHIEM') return;
              if (filterProvince && r.address.province !== filterProvince) return;
              if (filterCommune && r.address.commune !== filterCommune) return;
          } else {
              if (userUnit?.province && r.address.province !== userUnit.province) return;
              if (userRole === 'PROVINCE_ADMIN') {
                  if (filterCommune && r.address.commune !== filterCommune) return;
              } else if (userUnit?.commune && r.address.commune !== userUnit.commune) {
                  return;
              }
          }
          const y = r.recruitmentYear;
          if (!statsMap[y]) statsMap[y] = { year: `Năm ${y}`, source: 0, enlisted: 0 };
          
          const age = y - parseInt(r.dob.split('-')[0] || '0');
          if (age >= 18 && ![RecruitmentStatus.NOT_ALLOWED_REGISTRATION, RecruitmentStatus.EXEMPT_REGISTRATION, RecruitmentStatus.FIRST_TIME_REGISTRATION, RecruitmentStatus.REMOVED_FROM_SOURCE, RecruitmentStatus.DELETED].includes(r.status as RecruitmentStatus)) {
              statsMap[y].source++;
          }
          if ((r.status === RecruitmentStatus.ENLISTED && r.enlistmentType !== 'RESERVE') || (r.status === RecruitmentStatus.FINALIZED && r.enlistmentType === 'OFFICIAL')) {
              statsMap[y].enlisted++;
          }
      });
      return Object.values(statsMap).sort((a, b) => parseInt(a.year.split(' ')[1]) - parseInt(b.year.split(' ')[1]));
  }, [recruits, filterProvince, filterCommune, userRole, userUnit]);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-700 bg-gray-50/50 min-h-screen">
      
      {/* 1. THANH LỌC DÀNH CHO TỈNH & MASTER ADMIN */}
      {(userRole === 'ADMIN' || userRole === 'PROVINCE_ADMIN') && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sticky top-0 z-20 backdrop-blur-md bg-white/90">
            <div className="flex flex-col md:flex-row gap-6 items-center">
               <div className="flex items-center gap-2 text-military-800 font-black text-xs uppercase tracking-widest"><Filter size={18} className="text-military-600" /> Phạm vi giám sát:</div>
               <div className="flex flex-1 gap-3 w-full">
                 {userRole === 'ADMIN' && (
                    <select 
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-military-500 outline-none shadow-inner bg-gray-50" 
                        value={filterProvince} 
                        onChange={(e) => { setFilterProvince(e.target.value); setFilterCommune(''); }}
                    >
                        <option value="">-- Toàn quốc --</option>
                        {PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 )}
                 <select 
                   className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-military-500 outline-none shadow-inner bg-gray-50" 
                   value={filterCommune} 
                   onChange={(e) => setFilterCommune(e.target.value)} 
                   disabled={userRole === 'ADMIN' && !filterProvince}
                 >
                    <option value="">-- {userRole === 'PROVINCE_ADMIN' ? 'Tất cả xã/phường trực thuộc' : 'Chọn xã/phường'} --</option>
                    {(userRole === 'PROVINCE_ADMIN' ? Object.keys(LOCATION_DATA[userUnit?.province || ''] || {}) : (filterProvince ? Object.keys(LOCATION_DATA[filterProvince] || {}) : [])).map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
               <button 
                 onClick={() => {setFilterProvince(''); setFilterCommune('');}}
                 className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-black text-[10px] uppercase hover:bg-gray-200 transition-colors"
               >
                 Đặt lại
               </button>
            </div>
        </div>
      )}

      {/* 2. TIẾN ĐỘ THỰC HIỆN - 14 DANH SÁCH */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 overflow-hidden relative group">
         {/* Background pattern decor */}
         <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Activity size={200} className="text-military-900" />
         </div>

         <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-2">
             <div>
                <h2 className="text-xl font-black text-military-900 flex items-center gap-2 uppercase tracking-tight">
                    <Activity className="text-military-600 animate-pulse" /> TIẾN ĐỘ THỰC HIỆN {sessionYear}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[11px] font-black text-military-600 uppercase tracking-widest">{dashboardScopeName}</p>
                </div>
             </div>
             <div className="bg-military-50 px-3 py-1.5 rounded-lg border border-military-100 text-[10px] font-black text-military-700 uppercase">
                Dữ liệu đồng bộ trực tuyến
             </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
             <ProcessStepCard title="1. DS KHÔNG ĐƯỢC ĐK" count={stats.countNotAllowed} icon={Ban} color="bg-red-800" onClick={() => onNavigate('NOT_ALLOWED_REG')} />
             <ProcessStepCard title="2. DS MIỄN ĐK" count={stats.countExemptReg} icon={Shield} color="bg-slate-500" onClick={() => onNavigate('EXEMPT_REG')} />
             <ProcessStepCard title="3. DS ĐĂNG KÝ LẦN ĐẦU" count={stats.countFirstTime} icon={UserPlus} color="bg-cyan-600" onClick={() => onNavigate('FIRST_TIME_REG')} />
             <ProcessStepCard title="4. TỔNG NGUỒN" count={stats.countTotalSource} icon={Users} color="bg-gray-600" onClick={() => onNavigate('ALL')} subLabel="SẴN SÀNG" />
             <ProcessStepCard title="5. DS KHÔNG TUYỂN (TT50)" count={stats.countTT50} icon={BookX} color="bg-slate-600" onClick={() => onNavigate('TT50')} />
             <ProcessStepCard title="6. DS ĐỦ ĐK SƠ TUYỂN" count={stats.countEligiblePreCheck} icon={ClipboardList} color="bg-blue-600" onClick={() => onNavigate('PRE_CHECK')} detailText={`${stats.countPreCheckPass} Đạt / ${stats.countPreCheckFail} Loại`} />
             <ProcessStepCard title="7. DS ĐỦ ĐK KHÁM TUYỂN" count={stats.countEligibleMedExam} icon={Stethoscope} color="bg-indigo-600" onClick={() => onNavigate('MED_EXAM')} detailText={`${stats.countMedPass} Đạt / ${stats.countMedFail} Loại`} />
             <ProcessStepCard title="8. DS TẠM HOÃN" count={stats.countDeferred} icon={PauseCircle} color="bg-amber-600" onClick={() => onNavigate('DEFERRED_LIST')} />
             <ProcessStepCard title="9. DS MIỄN GỌI NN" count={stats.countExempted} icon={ShieldCheck} color="bg-purple-600" onClick={() => onNavigate('EXEMPTED_LIST')} />
             <ProcessStepCard title="10. DS CHỐT HỒ SƠ" count={stats.countFinalized} icon={FileSignature} color="bg-green-600" onClick={() => onNavigate('FINAL')} detailText={`${stats.countFinalizedOfficial} CT / ${stats.countFinalizedReserve} DB`} />
             <ProcessStepCard title="11. DS NHẬP NGŨ" count={stats.countEnlisted} icon={Flag} color="bg-red-600" onClick={() => onNavigate('ENLISTED')} subLabel="QUYẾT ĐỊNH" />
             <ProcessStepCard title="12. DS LOẠI KHỎI NGUỒN" count={stats.countRemoved} icon={UserX} color="bg-gray-400" onClick={() => onNavigate('REMOVED')} />
             <ProcessStepCard title="13. DS NGUỒN CÒN LẠI" count={stats.countRemaining} icon={Layers} color="bg-teal-600" onClick={() => onNavigate('REMAINING')} />
             <ProcessStepCard title="14. NGUỒN CỦA NĂM SAU" count={stats.countNextYearSource} icon={Calendar} color="bg-cyan-600" onClick={() => onNavigate('NEXT_YEAR_SOURCE')} isLast={true} />
         </div>
      </div>

      {/* 3. BIỂU ĐỒ CƠ BẢN: ĐỘ TUỔI, VĂN HÓA, ĐỊA BÀN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart: Độ tuổi */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col hover:shadow-xl transition-shadow">
              <h3 className="text-xs font-black text-gray-800 flex items-center gap-2 mb-6 uppercase border-b border-gray-100 pb-3 tracking-widest">
                <Calendar size={18} className="text-blue-500"/> BIỂU ĐỒ ĐỘ TUỔI (NĂM SINH)
              </h3>
              <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={stats.ageChartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} fontWeight="black" />
                          <YAxis fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                            cursor={{fill: '#f8fafc'}}
                          />
                          <Bar dataKey="value" fill={COLORS.secondary} radius={[6, 6, 0, 0]} barSize={32}>
                              <LabelList dataKey="value" position="top" fontSize={11} fontWeight="black" fill="#1e293b" />
                              {stats.ageChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.secondary : '#60a5fa'} />
                              ))}
                          </Bar>
                          <Line type="monotone" dataKey="value" stroke={COLORS.accent} strokeWidth={2} dot={{r: 4, fill: COLORS.accent}} />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Chart: Văn hóa */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col hover:shadow-xl transition-shadow">
               <h3 className="text-xs font-black text-gray-800 flex items-center gap-2 mb-6 uppercase border-b border-gray-100 pb-3 tracking-widest">
                <BookOpen size={18} className="text-amber-500"/> TRÌNH ĐỘ VĂN HÓA (CHUNG)
              </h3>
              <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie 
                            data={stats.eduChartData} 
                            cx="50%" cy="50%" 
                            innerRadius={70} outerRadius={95} 
                            paddingAngle={4} 
                            dataKey="value"
                            stroke="none"
                          >
                              {stats.eduChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                          <Legend 
                            verticalAlign="bottom" 
                            height={40} 
                            iconType="circle" 
                            iconSize={8} 
                            formatter={(value, entry: any) => <span className="text-[10px] font-black text-gray-600 ml-1 uppercase">{value} ({entry.payload.value})</span>}
                          />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Chart: Địa bàn (TỈNH HIỆN XÃ - XÃ HIỆN THÔN) */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col hover:shadow-xl transition-shadow">
              <h3 className="text-xs font-black text-gray-800 flex items-center gap-2 mb-6 uppercase border-b border-gray-100 pb-3 tracking-widest">
                <MapPin size={18} className="text-military-600"/> PHÂN BỔ {stats.isViewingProvince ? 'XÃ / PHƯỜNG' : 'THÔN / ẤP'}
              </h3>
              <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.geoChartData} layout="vertical" margin={{top: 0, right: 40, left: 20, bottom: 0}}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} fontSize={10} tickLine={false} axisLine={false} fontWeight="black" textAnchor="end" />
                          <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                          <Bar dataKey="value" fill={COLORS.primary} radius={[0, 6, 6, 0]} barSize={20} background={{ fill: '#f8fafc' }}>
                            <LabelList dataKey="value" position="right" fontSize={11} fontWeight="black" fill="#334155" />
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* 4. CHẤT LƯỢNG CHÍNH TRỊ & NHÂN KHẨU HỌC (CHI TIẾT) */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 overflow-hidden">
           <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <h3 className="text-sm font-black text-military-900 flex items-center gap-2 uppercase tracking-widest">
                    <UserCheck size={20} className="text-red-600" /> CHẤT LƯỢNG CHÍNH TRỊ & NHÂN KHẨU HỌC
                </h3>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    Dữ liệu dựa trên tổng số: <span className="text-military-700">{stats.totalValid} công dân</span>
                </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Chính trị: Đảng & Đoàn */}
                <div className="space-y-6">
                    <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute -top-2 -right-2 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                             <Flag size={80} className="text-red-900" />
                        </div>
                        <h4 className="text-[10px] font-black text-red-700 uppercase mb-3 tracking-widest">ĐẢNG VIÊN</h4>
                        <div className="text-4xl font-black text-red-600 mb-2 leading-none">{stats.dangVien}</div>
                        <div className="text-[10px] text-red-500 font-black bg-white/80 px-3 py-1 rounded-full border border-red-200 shadow-sm">
                            {((stats.dangVien / stats.totalValid) * 100).toFixed(1)}% TỔNG NGUỒN
                        </div>
                    </div>
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute -top-2 -right-2 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                             <Users size={80} className="text-blue-900" />
                        </div>
                        <h4 className="text-[10px] font-black text-blue-700 uppercase mb-3 tracking-widest">ĐOÀN VIÊN</h4>
                        <div className="text-4xl font-black text-blue-600 mb-2 leading-none">{stats.doanVien}</div>
                        <div className="text-[10px] text-blue-500 font-black bg-white/80 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                            {((stats.doanVien / stats.totalValid) * 100).toFixed(1)}% TỔNG NGUỒN
                        </div>
                    </div>
                </div>

                {/* Dân tộc */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-inner">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-5 flex items-center gap-2 tracking-widest">
                        <Dna size={14} className="text-indigo-500"/> PHÂN TÍCH DÂN TỘC
                    </h4>
                    <div className="space-y-4">
                        {stats.ethnicityData.map((item) => (
                            <div key={item.name} className="flex flex-col group">
                                <div className="flex justify-between text-[11px] mb-1.5 font-black uppercase tracking-tighter">
                                    <span className="text-gray-600 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                                    <span className="text-gray-900">{item.value}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-indigo-500 h-full rounded-full group-hover:brightness-110 transition-all duration-500" 
                                        style={{width: `${(item.value / stats.totalValid) * 100}%`}}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tôn giáo */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-inner">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-5 flex items-center gap-2 tracking-widest">
                        <Landmark size={14} className="text-purple-500"/> PHÂN TÍCH TÔN GIÁO
                    </h4>
                    <div className="space-y-4">
                        {stats.religionData.map((item) => (
                            <div key={item.name} className="flex flex-col group">
                                <div className="flex justify-between text-[11px] mb-1.5 font-black uppercase tracking-tighter">
                                    <span className="text-gray-600 group-hover:text-purple-600 transition-colors">{item.name}</span>
                                    <span className="text-gray-900">{item.value}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-purple-500 h-full rounded-full group-hover:brightness-110 transition-all duration-500" 
                                        style={{width: `${(item.value / stats.totalValid) * 100}%`}}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nghề nghiệp */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-inner">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-5 flex items-center gap-2 tracking-widest">
                        <Briefcase size={14} className="text-teal-500"/> PHÂN TÍCH NGHỀ NGHIỆP
                    </h4>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                        {stats.jobData.length > 0 ? stats.jobData.map((item) => (
                            <div key={item.name} className="flex flex-col group">
                                <div className="flex justify-between text-[11px] mb-1.5 font-black uppercase tracking-tighter">
                                    <span className="text-gray-600 truncate max-w-[120px] group-hover:text-teal-600 transition-colors" title={item.name}>{item.name}</span>
                                    <span className="text-gray-900">{item.value}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-teal-500 h-full rounded-full group-hover:brightness-110 transition-all duration-500" 
                                        style={{width: `${(item.value / stats.totalValid) * 100}%`}}
                                    ></div>
                                </div>
                            </div>
                        )) : <div className="text-center text-gray-400 text-[10px] font-black uppercase py-20 italic">Chưa có dữ liệu nghề nghiệp</div>}
                    </div>
                </div>
           </div>
      </div>

      {/* 5. PHÂN TÍCH CHẤT LƯỢNG SỨC KHỎE (BIỂU ĐỒ LOẠI SK, BMI, CHIỀU CAO, CÂN NẶNG) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phân loại sức khỏe (1-6) */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col hover:shadow-xl transition-all">
              <h3 className="text-xs font-black text-gray-800 flex items-center gap-2 mb-6 uppercase border-b border-gray-100 pb-3 tracking-widest">
                <Stethoscope size={18} className="text-indigo-600"/> PHÂN LOẠI SỨC KHỎE (LOẠI 1 - 6)
              </h3>
              <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.healthGradeData} margin={{top: 20, right: 30, left: 0, bottom: 0}}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} fontWeight="black" />
                          <YAxis fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                              {stats.healthGradeData.map((entry, index) => {
                                  let color = '#cbd5e1'; // Xám cho chưa khám
                                  if (entry.name === 'Loại 1') color = '#059669';
                                  if (entry.name === 'Loại 2') color = '#10b981';
                                  if (entry.name === 'Loại 3') color = '#34d399';
                                  if (entry.name === 'Loại 4') color = '#f59e0b';
                                  if (entry.name === 'Loại 5') color = '#f97316';
                                  if (entry.name === 'Loại 6') color = '#ef4444';
                                  return <Cell key={`cell-${index}`} fill={color} />;
                              })}
                              <LabelList dataKey="value" position="top" fontSize={12} fontWeight="black" fill="#334155" />
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Phân phối BMI */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col hover:shadow-xl transition-all">
              <h3 className="text-xs font-black text-gray-800 flex items-center gap-2 mb-6 uppercase border-b border-gray-100 pb-3 tracking-widest">
                <HeartPulse size={18} className="text-red-500"/> CHỈ SỐ KHỐI CƠ THỂ (BMI)
              </h3>
              <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie 
                            data={stats.bmiChartData} 
                            cx="50%" cy="50%" 
                            innerRadius={80} outerRadius={110} 
                            paddingAngle={5} 
                            dataKey="value"
                            stroke="none"
                          >
                              <Cell fill="#fcd34d" /> {/* Gầy */}
                              <Cell fill="#10b981" /> {/* Bình thường */}
                              <Cell fill="#ef4444" /> {/* Thừa cân */}
                          </Pie>
                          <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                          <Legend 
                             verticalAlign="middle" 
                             align="right"
                             layout="vertical"
                             iconType="circle"
                             formatter={(value) => <span className="text-[11px] font-black text-gray-600 uppercase tracking-tighter">{value}</span>}
                          />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Phân tích Chiều cao & Cân nặng (Area Chart Gradient) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all">
              <h3 className="text-xs font-black text-gray-800 flex items-center gap-2 mb-6 uppercase border-b border-gray-100 pb-3 tracking-widest">
                <Ruler size={18} className="text-blue-600"/> PHÂN PHỐI CHIỀU CAO (CM)
              </h3>
              <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.heightChartData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                          <defs>
                              <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                          <YAxis fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHeight)" strokeWidth={3} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all">
              <h3 className="text-xs font-black text-gray-800 flex items-center gap-2 mb-6 uppercase border-b border-gray-100 pb-3 tracking-widest">
                <Scale size={18} className="text-emerald-600"/> PHÂN PHỐI CÂN NẶNG (KG)
              </h3>
              <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.weightChartData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                          <defs>
                              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                          <YAxis fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>
      
      {/* 6. SO SÁNH NGUỒN & KẾT QUẢ QUA CÁC NĂM */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-10 group overflow-hidden relative">
          <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
             <TrendingUp size={240} className="text-military-900" />
          </div>

          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h3 className="text-sm font-black text-military-900 flex items-center gap-2 uppercase tracking-widest leading-none">
                <TrendingUp size={24} className="text-military-600"/> PHÂN TÍCH TỔNG HỢP & SO SÁNH BIẾN ĐỘNG NGUỒN QUA CÁC NĂM
              </h3>
              <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-gray-400"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase">Tổng nguồn (List 4)</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-600"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase">Đã nhập ngũ (List 11)</span>
                  </div>
              </div>
          </div>

          <div className="h-[350px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyComparisonData} margin={{top: 30, right: 30, left: 20, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="year" fontSize={12} fontWeight="black" tickLine={false} axisLine={false} dy={10} />
                      <YAxis fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', fontWeight: 'black', padding: '12px'}}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="right" 
                        height={36} 
                        iconType="circle" 
                        iconSize={10}
                        formatter={(value) => <span className="text-[11px] font-black text-gray-600 uppercase tracking-tighter mr-4">{value}</span>}
                      />
                      <Bar name="Tổng nguồn (List 4)" dataKey="source" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={40}>
                         <LabelList dataKey="source" position="top" fontSize={11} fontWeight="black" fill="#64748b" offset={10} />
                      </Bar>
                      <Bar name="Đã nhập ngũ (List 11)" dataKey="enlisted" fill="#dc2626" radius={[6, 6, 0, 0]} barSize={40}>
                         <LabelList dataKey="enlisted" position="top" fontSize={11} fontWeight="black" fill="#991b1b" offset={10} />
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </div>
          <div className="mt-8 bg-gray-50 p-4 rounded-xl border border-gray-100 italic text-[11px] text-gray-500 font-bold text-center">
             * Lưu ý: Biểu đồ so sánh dựa trên dữ liệu lịch sử được lưu trữ trong hệ thống qua các niên độ tuyển quân.
          </div>
      </div>

    </div>
  );
};

export default Dashboard;
