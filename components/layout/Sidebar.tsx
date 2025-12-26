
import React from 'react';
import { 
  LayoutDashboard, Users, Menu, ShieldAlert, LogOut, Key, 
  UserCircle, Share2, HelpCircle, UsersRound, FileSpreadsheet 
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onProfileClick: () => void;
  onPasswordClick: () => void;
  onLogout: () => void;
  sessionYear: number | null;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, setIsOpen, activeTab, setActiveTab, onProfileClick, onPasswordClick, onLogout, sessionYear, user 
}) => {
  const isAdmin = user.role === 'ADMIN';

  return (
    <aside className={`bg-military-900 text-white transition-all duration-300 flex flex-col shadow-2xl z-20 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between border-b border-military-800 h-16 shrink-0 overflow-hidden bg-military-950">
        <span className="font-bold flex items-center gap-2 shrink-0">
          <ShieldAlert className="text-amber-500 shrink-0" size={24} />
          {isOpen && <span className="text-sm font-black uppercase tracking-tight truncate">Quản lý Tuyển quân</span>}
        </span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-military-800 transition-colors text-military-300">
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 py-6 px-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}>
          <LayoutDashboard size={20} />
          {isOpen && <span className="text-xs font-bold uppercase tracking-wide">Tổng quan</span>}
        </button>
        
        <button onClick={() => setActiveTab('recruits')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'recruits' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}>
          <Users size={20} />
          {isOpen && <span className="text-xs font-bold uppercase tracking-wide">Hồ sơ công dân</span>}
        </button>
        
        <button onClick={() => setActiveTab('communication')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'communication' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}>
          <Share2 size={20} />
          {isOpen && <span className="text-xs font-bold uppercase tracking-wide">Báo cáo & Văn bản</span>}
        </button>

        {/* MỤC MỚI BỔ SUNG */}
        <button onClick={() => setActiveTab('report-builder')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'report-builder' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}>
          <FileSpreadsheet size={20} />
          {isOpen && <span className="text-xs font-bold uppercase tracking-wide leading-tight">Biểu mẫu báo cáo</span>}
        </button>
        
        {isAdmin && (
          <button onClick={() => setActiveTab('accounts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'accounts' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}>
            <UsersRound size={20} />
            {isOpen && <span className="text-xs font-bold uppercase tracking-wide">Quản lý tài khoản</span>}
          </button>
        )}

        <button onClick={() => setActiveTab('qa')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'qa' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}>
          <HelpCircle size={20} />
          {isOpen && <span className="text-xs font-bold uppercase tracking-wide">Hỏi đáp & Hỗ trợ</span>}
        </button>
      </nav>

      <div className="p-4 border-t border-military-800 space-y-2 shrink-0 bg-military-950/50">
        <button onClick={onProfileClick} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-military-200 hover:bg-military-800 transition-colors">
          <UserCircle size={18} />
          {isOpen && <span className="text-[10px] font-bold uppercase tracking-widest">Thông tin cán bộ</span>}
        </button>
        <button onClick={onPasswordClick} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-military-200 hover:bg-military-800 transition-colors">
          <Key size={18} />
          {isOpen && <span className="text-[10px] font-bold uppercase tracking-widest">Đổi mật khẩu</span>}
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-300 hover:bg-red-900/30 transition-colors mt-2">
          <LogOut size={18} />
          {isOpen && <span className="text-[10px] font-bold uppercase tracking-widest">Thoát hệ thống</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
