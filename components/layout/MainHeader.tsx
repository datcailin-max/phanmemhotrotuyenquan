import React from 'react';
import { Menu, ShieldCheck, RefreshCw } from 'lucide-react';
import { User } from '../../types';

interface MainHeaderProps {
  activeTab: string;
  isSidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  sessionYear: number | null;
  onYearReset: () => void;
  user: User;
}

const MainHeader: React.FC<MainHeaderProps> = ({ 
  activeTab, isSidebarOpen, setSidebarOpen, sessionYear, onYearReset, user 
}) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-military-50 rounded-lg md:hidden cursor-pointer">
          <Menu size={20} className="text-military-700" onClick={() => setSidebarOpen(!isSidebarOpen)} />
        </div>
        <h1 className="text-lg font-black uppercase text-military-800 tracking-tight flex items-center gap-2">
          <ShieldCheck size={20} className="text-military-600"/>
          {activeTab === 'dashboard' && 'Bảng điều khiển tổng hợp'}
          {activeTab === 'recruits' && 'Quản lý hồ sơ công dân'}
          {activeTab === 'communication' && 'Trao đổi văn bản chỉ đạo'}
          {activeTab === 'documents' && 'Thư viện tài liệu'}
          {activeTab === 'qa' && 'Hệ thống hỗ trợ trực tuyến'}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Hệ thống trực tuyến</span>
        </div>
        <button onClick={onYearReset} className="text-xs font-black bg-amber-50 text-amber-700 px-4 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-all flex items-center gap-2">
          <RefreshCw size={14}/> NĂM {sessionYear}
        </button>
        <div className="text-[10px] leading-tight text-right hidden sm:block">
          <p className="font-black uppercase text-military-900">{user.fullName}</p>
          <p className="text-gray-400 font-bold">{user.role === 'ADMIN' ? 'Quản trị viên' : (user.role === 'PROVINCE_ADMIN' ? 'Cấp Tỉnh' : 'Cấp Xã/Phường')}</p>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;