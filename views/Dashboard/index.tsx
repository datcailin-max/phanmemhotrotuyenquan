
import React, { useState, useMemo } from 'react';
import { Recruit, UserRole } from '../../types';
import { Activity } from 'lucide-react';
import FilterHeader from './components/FilterHeader';
import ProgressSection from './components/ProgressSection';
import AnalyticsCharts from './components/AnalyticsCharts';
import { useDashboardStats } from './hooks/useDashboardStats';

interface DashboardProps {
  recruits: Recruit[];
  onNavigate: (tabId: string) => void;
  sessionYear: number;
  userRole: UserRole;
  userUnit?: { commune: string; province: string };
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCommune, setFilterCommune] = useState('');

  const { stats } = useDashboardStats({
      ...props, filterProvince, filterCommune
  });

  const scopeName = useMemo(() => {
      if (filterCommune) return `BAN CHQS ${filterCommune.toUpperCase()}`;
      if (props.userRole === 'PROVINCE_ADMIN' && props.userUnit) return `BỘ CHQS TỈNH ${props.userUnit.province.toUpperCase()}`;
      if (props.userRole !== 'ADMIN' && props.userUnit) return `BAN CHQS ${props.userUnit.commune.toUpperCase()}`;
      if (filterProvince) return `BỘ CHQS TỈNH ${filterProvince.toUpperCase()}`;
      return "TOÀN QUỐC (TỔNG HỢP)";
  }, [props.userRole, props.userUnit, filterProvince, filterCommune]);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-700 bg-gray-50/50 min-h-screen">
      <FilterHeader 
        userRole={props.userRole} userUnit={props.userUnit}
        filterProvince={filterProvince} filterCommune={filterCommune}
        onProvinceChange={(v) => { setFilterProvince(v); setFilterCommune(''); }}
        onCommuneChange={setFilterCommune}
        onReset={() => { setFilterProvince(''); setFilterCommune(''); }}
      />

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 overflow-hidden relative">
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-2">
             <div>
                <h2 className="text-xl font-black text-military-900 flex items-center gap-2 uppercase tracking-tight">
                    <Activity className="text-military-600 animate-pulse" /> TIẾN ĐỘ THỰC HIỆN {props.sessionYear}
                </h2>
                <p className="text-[11px] font-black text-military-600 uppercase tracking-widest mt-1">{scopeName}</p>
             </div>
             <div className="bg-military-50 px-3 py-1.5 rounded-lg border border-military-100 text-[10px] font-black text-military-700 uppercase">Dữ liệu đồng bộ trực tuyến</div>
         </div>
         <ProgressSection stats={stats.counts} onNavigate={props.onNavigate} />
      </div>

      <AnalyticsCharts stats={stats} />
    </div>
  );
};

export default Dashboard;
