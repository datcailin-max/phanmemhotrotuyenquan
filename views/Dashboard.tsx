import React, { useMemo, useState } from 'react';
import { Recruit, RecruitmentStatus, UserRole } from '../types';
import { PROVINCES_VN, LOCATION_DATA } from '../constants';
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
  TrendingUp,
  AlertCircle,
  Tent,
  Smile,
  Filter,
  Ruler,
  UserX
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
  Legend
} from 'recharts';

interface DashboardProps {
  recruits: Recruit[];
  onNavigate: (tabId: string) => void;
  sessionYear: number;
  userRole: UserRole;
}

// Màu sắc biểu đồ chuẩn quân đội/báo cáo
const COLORS = {
    primary: '#059669',   // Green 600
    secondary: '#3b82f6', // Blue 500
    accent: '#f59e0b',    // Amber 500
    danger: '#ef4444',    // Red 500
    neutral: '#6b7280',   // Gray 500
    pie: ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1']
};

// Component thẻ quy trình (Process Step)
const ProcessStepCard = ({ title, count, total, icon: Icon, color, onClick, isLast = false, subLabel }: any) => {
    // Nếu total = 0 thì percentage = 0
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    
    return (
        <div 
            onClick={onClick}
            className={`flex-1 relative p-4 rounded-xl border transition-all cursor-pointer group bg-white hover:shadow-lg ${isLast ? 'border-green-500 bg-green-50/30' : 'border-gray-200 hover:border-military-300'}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${color} text-white shadow-sm`}>
                    <Icon size={20} />
                </div>
                <div className="text-right">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{subLabel}</p>
                     <p className={`text-2xl font-bold ${isLast ? 'text-green-700' : 'text-gray-800'}`}>{count}</p>
                </div>
            </div>
            
            <h3 className="text-sm font-bold text-gray-700 mt-2 mb-1 group-hover:text-military-700 transition-colors">{title}</h3>
            
            {/* Progress bar visual indicating funnel retention */}
            {!isLast && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="h-full bg-gray-300 group-hover:bg-military-500 transition-all" style={{ width: '100%' }}></div>
                </div>
            )}
            
            {/* Arrow visual for flow */}
            {!isLast && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 text-gray-300">
                    <TrendingUp size={24} className="rotate-90 md:rotate-0"/>
                </div>
            )}
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ recruits, onNavigate, sessionYear, userRole }) => {
  // --- ADMIN FILTERS ---
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCommune, setFilterCommune] = useState('');

  // --- MEMO: Filter Data by Session Year & Location ---
  const yearRecruits = useMemo(() => {
      // Quan trọng: Lọc bỏ những người đã bị loại khỏi nguồn (Status = REMOVED_FROM_SOURCE)
      let filtered = recruits.filter(r => 
          r.recruitmentYear === sessionYear && 
          r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE
      );
      
      if (filterProvince) {
          filtered = filtered.filter(r => r.address.province === filterProvince);
      }
      if (filterCommune) {
          filtered = filtered.filter(r => r.address.commune === filterCommune);
      }
      return filtered;
  }, [recruits, sessionYear, filterProvince, filterCommune]);

  // Commune List based on selected province
  const communeList = useMemo(() => {
     if (!filterProvince) return [];
     // @ts-ignore
     const data = LOCATION_DATA[filterProvince];
     return data ? Object.keys(data) : [];
  }, [filterProvince]);

  // --- MEMO: Calculate Stats ---
  const stats = useMemo(() => {
    const total = yearRecruits.length;
    
    // 1. Pipeline Stats - REVISED Logic
    // Đạt sơ khám = Đủ điều kiện (Passed) + các trạng thái sau đó (Med Exam, Finalized)
    // Loại bỏ: Source, Pre-check Failed, Deferred/Exempted (nếu bị loại ngay từ đầu)
    const countPreCheck = yearRecruits.filter(r => [
        RecruitmentStatus.PRE_CHECK_PASSED, 
        RecruitmentStatus.MED_EXAM_PASSED, 
        RecruitmentStatus.MED_EXAM_FAILED, 
        RecruitmentStatus.FINALIZED
    ].includes(r.status)).length;

    const countMedExam = yearRecruits.filter(r => [
        RecruitmentStatus.MED_EXAM_PASSED, 
        RecruitmentStatus.FINALIZED
    ].includes(r.status)).length;
    
    const countFinal = yearRecruits.filter(r => r.status === RecruitmentStatus.FINALIZED).length;
    
    // Calculate Removed Count separately (as yearRecruits excludes them)
    const countRemoved = recruits.filter(r => 
        r.recruitmentYear === sessionYear && 
        r.status === RecruitmentStatus.REMOVED_FROM_SOURCE &&
        (!filterProvince || r.address.province === filterProvince) &&
        (!filterCommune || r.address.commune === filterCommune)
    ).length;

    // 2. Health & Political
    const dangVien = yearRecruits.filter(r => r.details.politicalStatus === 'Dang_Vien').length;
    const doanVien = yearRecruits.filter(r => r.details.politicalStatus === 'Doan_Vien').length;
    
    // Health Grades 1-4
    const healthGrade1 = yearRecruits.filter(r => r.physical.healthGrade === 1).length;
    const healthGrade2 = yearRecruits.filter(r => r.physical.healthGrade === 2).length;
    const healthGrade3 = yearRecruits.filter(r => r.physical.healthGrade === 3).length;
    const healthGrade4 = yearRecruits.filter(r => r.physical.healthGrade === 4).length;

    // 3. Education Breakdown (For Pie Chart)
    const eduMap: Record<string, number> = {};
    yearRecruits.forEach(r => {
        // Group "Cao đẳng, Đại học" for simpler view
        let edu = r.details.education;
        if (edu.includes('Đại học') || edu.includes('Cao đẳng') || edu.includes('Trung cấp')) {
            edu = 'ĐH/CĐ/TC';
        }
        eduMap[edu] = (eduMap[edu] || 0) + 1;
    });
    const eduChartData = Object.entries(eduMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // Sort descending

    // 4. Birth Year Breakdown (For Bar Chart)
    const ageMap: Record<string, number> = {};
    yearRecruits.forEach(r => {
        if (r.dob) {
            const year = r.dob.split('-')[0]; // Extract YYYY
            if (year) ageMap[year] = (ageMap[year] || 0) + 1;
        }
    });
    const ageChartData = Object.entries(ageMap)
        .map(([name, value]) => ({ name: `Năm ${name}`, value }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort ascending by year

    // 5. Village Breakdown (For Horizontal Bar Chart)
    const villageMap: Record<string, number> = {};
    yearRecruits.forEach(r => {
        const v = r.address.village || 'Khác';
        villageMap[v] = (villageMap[v] || 0) + 1;
    });
    const villageChartData = Object.entries(villageMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10 populated villages
    
    // 6. Ethnicity Breakdown
    const ethnicityMap: Record<string, number> = {};
    yearRecruits.forEach(r => {
        const e = r.details.ethnicity || 'Chưa cập nhật';
        ethnicityMap[e] = (ethnicityMap[e] || 0) + 1;
    });
    const ethnicityData = Object.entries(ethnicityMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

    // 7. Religion Breakdown
    const religionMap: Record<string, number> = {};
    yearRecruits.forEach(r => {
        const rName = r.details.religion || 'Chưa cập nhật';
        religionMap[rName] = (religionMap[rName] || 0) + 1;
    });
    const religionData = Object.entries(religionMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

    // 8. Height, Weight, BMI
    const heightStats = {
        'Duoi_160': yearRecruits.filter(r => r.physical.height > 0 && r.physical.height < 160).length,
        '160_165': yearRecruits.filter(r => r.physical.height >= 160 && r.physical.height <= 165).length,
        '166_170': yearRecruits.filter(r => r.physical.height >= 166 && r.physical.height <= 170).length,
        'Tren_170': yearRecruits.filter(r => r.physical.height > 170).length
    };
    
    const weightStats = {
        'Duoi_50': yearRecruits.filter(r => r.physical.weight > 0 && r.physical.weight < 50).length,
        '50_60': yearRecruits.filter(r => r.physical.weight >= 50 && r.physical.weight <= 60).length,
        'Tren_60': yearRecruits.filter(r => r.physical.weight > 60).length
    };

    const bmiStats = {
        'Gay': yearRecruits.filter(r => r.physical.bmi > 0 && r.physical.bmi < 18.5).length,
        'Binh_Thuong': yearRecruits.filter(r => r.physical.bmi >= 18.5 && r.physical.bmi <= 24.9).length,
        'Thua_Can': yearRecruits.filter(r => r.physical.bmi >= 25).length
    };

    return { 
        total,
        countPreCheck, countMedExam, countFinal, countRemoved,
        dangVien, doanVien,
        healthGrade1, healthGrade2, healthGrade3, healthGrade4,
        eduChartData,
        ageChartData,
        villageChartData,
        ethnicityData,
        religionData,
        heightStats,
        weightStats,
        bmiStats
    };
  }, [yearRecruits, recruits, sessionYear, filterProvince, filterCommune]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* FILTER BAR FOR ADMIN (Optional view context) */}
      {userRole === 'ADMIN' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
               <div className="flex items-center gap-2 text-gray-700 font-bold whitespace-nowrap">
                   <Filter size={18} /> Phạm vi thống kê:
               </div>
               <select 
                  className="border border-gray-300 rounded p-2 text-sm w-full md:w-48"
                  value={filterProvince}
                  onChange={(e) => { setFilterProvince(e.target.value); setFilterCommune(''); }}
               >
                   <option value="">-- Cả nước (Tổng hợp) --</option>
                   {PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}
               </select>
               
               <select 
                  className="border border-gray-300 rounded p-2 text-sm w-full md:w-48 disabled:bg-gray-100 disabled:text-gray-400"
                  value={filterCommune}
                  onChange={(e) => setFilterCommune(e.target.value)}
                  disabled={!filterProvince}
               >
                   <option value="">-- Toàn tỉnh --</option>
                   {communeList.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
               
               <div className="ml-auto text-xs text-gray-500 italic">
                   Dữ liệu tự động tổng hợp từ các đơn vị cấp dưới
               </div>
            </div>
        </div>
      )}

      {/* SECTION 1: QUY TRÌNH TUYỂN QUÂN (PIPELINE) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
         <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 uppercase">
                 <Activity className="text-military-600" /> Tiến độ thực hiện {sessionYear}
             </h2>
             <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                 Tổng hồ sơ: {stats.total}
             </span>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative">
             <ProcessStepCard 
                title="TỔNG NGUỒN" 
                subLabel="QUẢN LÝ"
                count={stats.total} 
                total={stats.total}
                icon={Users} 
                color="bg-gray-500" 
                onClick={() => onNavigate('ALL')}
             />
             <ProcessStepCard 
                title="ĐẠT SƠ KHÁM" 
                subLabel="ĐỦ ĐIỀU KIỆN"
                count={stats.countPreCheck} 
                total={stats.total}
                icon={ClipboardList} 
                color="bg-blue-600"
                onClick={() => onNavigate('PRE_CHECK')}
             />
             <ProcessStepCard 
                title="ĐẠT KHÁM TUYỂN" 
                subLabel="ĐỦ ĐK SỨC KHỎE"
                count={stats.countMedExam} 
                total={stats.total}
                icon={Stethoscope} 
                color="bg-indigo-600"
                onClick={() => onNavigate('MED_EXAM')}
             />
             <ProcessStepCard 
                title="BÌNH CỬ" 
                subLabel="CHỐT DANH SÁCH"
                count={stats.countFinal} 
                total={stats.total}
                icon={FileSignature} 
                color="bg-green-600"
                isLast={true}
                onClick={() => onNavigate('FINAL')}
             />
             <ProcessStepCard 
                title="ĐÃ LOẠI" 
                subLabel="KHỎI NGUỒN"
                count={stats.countRemoved} 
                total={0} // Không cần progress bar
                icon={UserX} 
                color="bg-red-600"
                isLast={true}
                onClick={() => onNavigate('REMOVED')}
             />
         </div>
      </div>

      {/* SECTION 2: PHÂN TÍCH CHẤT LƯỢNG NGUỒN (CHARTS ROW) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CỘT 1: PHÂN BỐ NĂM SINH */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4 uppercase border-b pb-2">
                  <Calendar size={16} className="text-blue-500"/> Độ tuổi (Năm sinh)
              </h3>
              <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.ageChartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                          <YAxis fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                          <Bar dataKey="value" fill={COLORS.secondary} radius={[4, 4, 0, 0]} barSize={20}>
                               <LabelList dataKey="value" position="top" fontSize={10} fontWeight="bold" fill="#6b7280" />
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* CỘT 2: TRÌNH ĐỘ HỌC VẤN */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
               <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4 uppercase border-b pb-2">
                  <BookOpen size={16} className="text-accent"/> Trình độ văn hóa
              </h3>
              <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={stats.eduChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                          >
                              {stats.eduChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} />
                              ))}
                          </Pie>
                          <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle" 
                            iconSize={8}
                            formatter={(value, entry: any) => <span className="text-xs font-medium text-gray-600 ml-1">{value} ({entry.payload.value})</span>}
                          />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
              {/* Summary Text */}
              <div className="mt-2 text-center text-xs text-gray-500">
                  {stats.eduChartData.length > 0 && (
                      <span>Đa số: <span className="font-bold text-gray-800">{stats.eduChartData[0].name}</span> ({stats.eduChartData[0].value})</span>
                  )}
              </div>
          </div>

          {/* CỘT 3: PHÂN BỐ ĐỊA BÀN (THÔN/ẤP) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4 uppercase border-b pb-2">
                  <MapPin size={16} className="text-military-600"/> Phân bổ theo Thôn/Ấp
              </h3>
              <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.villageChartData} layout="vertical" margin={{top: 0, right: 30, left: 10, bottom: 0}}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} fontSize={11} tickLine={false} axisLine={false} fontWeight={500} />
                          <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                          <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#f9fafb' }}>
                              <LabelList dataKey="value" position="right" fontSize={11} fontWeight="bold" fill="#374151" />
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>
      
      {/* SECTION 2.5: THỂ TRẠNG (NEW ROW) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
           <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4 uppercase border-b pb-2">
               <Ruler size={18} className="text-blue-600" /> Thống kê Thể trạng (Chiều cao, Cân nặng, BMI)
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CHIỀU CAO */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">Chiều cao</h4>
                    <div className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between text-xs mb-1"><span>Dưới 1m60</span><span className="font-bold">{stats.heightStats['Duoi_160']}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${(stats.heightStats['Duoi_160']/stats.total)*100}%`}}></div></div>
                        
                        <div className="flex justify-between text-xs mb-1"><span>1m60 - 1m65</span><span className="font-bold">{stats.heightStats['160_165']}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3"><div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${(stats.heightStats['160_165']/stats.total)*100}%`}}></div></div>
                        
                        <div className="flex justify-between text-xs mb-1"><span>1m66 - 1m70</span><span className="font-bold">{stats.heightStats['166_170']}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3"><div className="bg-blue-700 h-1.5 rounded-full" style={{width: `${(stats.heightStats['166_170']/stats.total)*100}%`}}></div></div>
                        
                        <div className="flex justify-between text-xs mb-1"><span>Trên 1m70</span><span className="font-bold">{stats.heightStats['Tren_170']}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-blue-800 h-1.5 rounded-full" style={{width: `${(stats.heightStats['Tren_170']/stats.total)*100}%`}}></div></div>
                    </div>
                </div>

                {/* CÂN NẶNG */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">Cân nặng</h4>
                    <div className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between text-xs mb-1"><span>Dưới 50kg</span><span className="font-bold">{stats.weightStats['Duoi_50']}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3"><div className="bg-orange-500 h-1.5 rounded-full" style={{width: `${(stats.weightStats['Duoi_50']/stats.total)*100}%`}}></div></div>
                        
                        <div className="flex justify-between text-xs mb-1"><span>50kg - 60kg</span><span className="font-bold">{stats.weightStats['50_60']}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3"><div className="bg-orange-600 h-1.5 rounded-full" style={{width: `${(stats.weightStats['50_60']/stats.total)*100}%`}}></div></div>
                        
                        <div className="flex justify-between text-xs mb-1"><span>Trên 60kg</span><span className="font-bold">{stats.weightStats['Tren_60']}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-orange-700 h-1.5 rounded-full" style={{width: `${(stats.weightStats['Tren_60']/stats.total)*100}%`}}></div></div>
                    </div>
                </div>

                 {/* BMI */}
                 <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">Chỉ số BMI</h4>
                    <div className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between text-xs mb-1"><span>Thiếu cân (&lt;18.5)</span><span className="font-bold">{stats.bmiStats['Gay']}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3"><div className="bg-red-400 h-1.5 rounded-full" style={{width: `${(stats.bmiStats['Gay']/stats.total)*100}%`}}></div></div>
                        
                        <div className="flex justify-between text-xs mb-1"><span>Bình thường</span><span className="font-bold">{stats.bmiStats['Binh_Thuong']}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3"><div className="bg-green-600 h-1.5 rounded-full" style={{width: `${(stats.bmiStats['Binh_Thuong']/stats.total)*100}%`}}></div></div>
                        
                        <div className="flex justify-between text-xs mb-1"><span>Thừa cân (&gt;25)</span><span className="font-bold">{stats.bmiStats['Thua_Can']}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-yellow-500 h-1.5 rounded-full" style={{width: `${(stats.bmiStats['Thua_Can']/stats.total)*100}%`}}></div></div>
                    </div>
                </div>
           </div>
      </div>

      {/* SECTION 3: SỨC KHỎE & CHÍNH TRỊ (Modified) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SỨC KHỎE CHI TIẾT 1-4 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4 uppercase">
                  <HeartPulse className="text-red-500" /> Chất lượng sức khỏe (Sau khám)
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
                      <p className="text-xs text-emerald-800 font-bold uppercase">Loại 1</p>
                      <span className="text-2xl font-bold text-emerald-600 block mt-1">{stats.healthGrade1}</span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100 text-center">
                      <p className="text-xs text-green-800 font-bold uppercase">Loại 2</p>
                      <span className="text-2xl font-bold text-green-600 block mt-1">{stats.healthGrade2}</span>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100 text-center">
                      <p className="text-xs text-yellow-800 font-bold uppercase">Loại 3</p>
                      <span className="text-2xl font-bold text-yellow-600 block mt-1">{stats.healthGrade3}</span>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-100 text-center">
                      <p className="text-xs text-orange-800 font-bold uppercase">Loại 4</p>
                      <span className="text-2xl font-bold text-orange-600 block mt-1">{stats.healthGrade4}</span>
                  </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500 flex gap-2 items-start">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>Số liệu dựa trên kết quả khám tuyển chính thức. Chỉ tiêu thường lấy Loại 1, 2, 3 (Tùy địa phương).</span>
              </div>
          </div>

          {/* CHÍNH TRỊ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4 uppercase">
                  <Flag className="text-red-600" /> Tiêu chuẩn Chính trị
              </h3>
              <div className="space-y-4">
                 {/* Đảng Viên */}
                 <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                        <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-100 mr-2">
                            Đảng Viên
                        </span>
                        </div>
                        <div className="text-right">
                        <span className="text-sm font-bold inline-block text-red-600">
                            {stats.dangVien}
                        </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-50">
                        <div style={{ width: `${stats.total ? (stats.dangVien / stats.total) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 transition-all duration-1000"></div>
                    </div>
                 </div>

                 {/* Đoàn Viên */}
                 <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                        <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100 mr-2">
                            Đoàn Viên
                        </span>
                        </div>
                        <div className="text-right">
                        <span className="text-sm font-bold inline-block text-blue-600">
                            {stats.doanVien}
                        </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-50">
                        <div style={{ width: `${stats.total ? (stats.doanVien / stats.total) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-1000"></div>
                    </div>
                 </div>
              </div>
          </div>
      </div>

      {/* SECTION 4: DEMOGRAPHICS (Ethnicity & Religion) - NEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            
            {/* DÂN TỘC */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4 uppercase">
                    <Tent className="text-purple-600" size={18} /> Thành phần Dân tộc
                </h3>
                {stats.ethnicityData.length > 0 ? (
                    <div className="space-y-3">
                        {stats.ethnicityData.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                                <span className="text-sm font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md">{item.value}</span>
                            </div>
                        ))}
                        {stats.ethnicityData.length > 5 && (
                             <div className="text-xs text-center text-gray-400 italic pt-2">... và các dân tộc khác</div>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 italic">Chưa có dữ liệu</div>
                )}
            </div>

            {/* TÔN GIÁO */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4 uppercase">
                    <Smile className="text-orange-500" size={18} /> Thành phần Tôn giáo
                </h3>
                {stats.religionData.length > 0 ? (
                    <div className="space-y-3">
                        {stats.religionData.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                                <span className="text-sm font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md">{item.value}</span>
                            </div>
                        ))}
                        {stats.religionData.length > 5 && (
                             <div className="text-xs text-center text-gray-400 italic pt-2">... và các tôn giáo khác</div>
                        )}
                    </div>
                ) : (
                     <div className="text-sm text-gray-400 italic">Chưa có dữ liệu</div>
                )}
            </div>

      </div>

    </div>
  );
};

export default Dashboard;