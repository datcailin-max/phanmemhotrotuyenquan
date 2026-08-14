
import React, { useState, useMemo } from 'react';
import { Recruit, UserRole, User } from '../../types';
import { Activity, RefreshCw, Trash2 } from 'lucide-react';
import FilterHeader from './components/FilterHeader';
import ProgressSection from './components/ProgressSection';
import AnalyticsCharts from './components/AnalyticsCharts';
import YearTransferModal from './components/YearTransferModal';
import DeleteYearDataModal from './components/DeleteYearDataModal';
import { useDashboardStats } from './hooks/useDashboardStats';

interface DashboardProps {
  recruits: Recruit[];
  onNavigate: (tabId: string) => void;
  sessionYear: number;
  userRole: UserRole;
  userUnit?: { commune: string; province: string };
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCommune, setFilterCommune] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDeleteYearModal, setShowDeleteYearModal] = useState(false);

  const { stats, allYearRecruits } = useDashboardStats({
      ...props, filterProvince, filterCommune
  });

  const scopeName = useMemo(() => {
      if (filterCommune) return `BAN CHQS ${filterCommune.toUpperCase()}`;
      if (props.userRole === 'PROVINCE_ADMIN' && props.userUnit) return `BỘ CHQS TỈNH ${props.userUnit.province.toUpperCase()}`;
      if (props.userRole !== 'ADMIN' && props.userUnit) return `BAN CHQS ${props.userUnit.commune.toUpperCase()}`;
      if (filterProvince) return `BỘ CHQS TỈNH ${filterProvince.toUpperCase()}`;
      return "TOÀN QUỐC (TỔNG HỢP GIÁM SÁT)";
  }, [props.userRole, props.userUnit, filterProvince, filterCommune]);

  const canTransfer = props.userRole === 'EDITOR' || props.userRole === 'ADMIN';
  const canDeleteYear = props.userRole === 'EDITOR' || props.userRole === 'ADMIN';

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
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
             <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Activity className="text-military-600 animate-pulse" /> TIẾN ĐỘ THỰC HIỆN TUYỂN QUÂN NĂM {props.sessionYear}
                </h2>
                <p className="text-[11px] font-bold text-military-600 uppercase tracking-widest mt-1">Đơn vị: {scopeName}</p>
             </div>
             <div className="flex items-center gap-3 flex-wrap">
                 {canTransfer && !filterProvince && !filterCommune && (
                    <button 
                        onClick={() => setShowTransferModal(true)}
                        className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase shadow-sm hover:bg-amber-700 transition-all active:scale-95 duration-200"
                    >
                        <RefreshCw size={15} /> Kết chuyển dữ liệu
                    </button>
                 )}
                 {canDeleteYear && !filterProvince && !filterCommune && (
                    <button 
                        onClick={() => setShowDeleteYearModal(true)}
                        className="flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase shadow-sm hover:bg-red-800 transition-all active:scale-95 duration-200"
                    >
                        <Trash2 size={15} /> Xóa dữ liệu năm
                    </button>
                 )}
                 <div className="bg-military-50 px-3 py-1.5 rounded-lg border border-military-200 text-[10px] font-bold text-military-700 uppercase shrink-0 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Trực tuyến
                 </div>
             </div>
         </div>

         <ProgressSection stats={stats.counts} onNavigate={props.onNavigate} />
      </div>

      <AnalyticsCharts stats={stats} />

      {showTransferModal && (
          <YearTransferModal 
            currentRecruits={allYearRecruits}
            sessionYear={props.sessionYear}
            unitName={scopeName}
            onClose={() => setShowTransferModal(false)}
            onSuccess={() => window.location.reload()} 
          />
      )}

      {showDeleteYearModal && (
          <DeleteYearDataModal 
            currentRecruits={props.recruits}
            sessionYear={props.sessionYear}
            currentUser={props.currentUser}
            onUpdateUser={props.onUpdateUser}
            onClose={() => setShowDeleteYearModal(false)}
            onSuccess={() => window.location.reload()} 
          />
      )}
    </div>
  );
};

export default Dashboard;
