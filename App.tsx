import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  Menu,
  ShieldAlert,
  LogOut,
  Key,
  X,
  HelpCircle,
  CalendarDays
} from 'lucide-react';
import { Recruit, User } from './types';
import { INITIAL_RECRUITS } from './constants';
import Dashboard from './views/Dashboard';
import RecruitManagement from './views/RecruitManagement';
import Login from './views/Login';
import YearSelection from './views/YearSelection';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionYear, setSessionYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recruits'>('dashboard');
  
  // State to control which sub-tab of RecruitManagement is active
  const [activeRecruitSubTab, setActiveRecruitSubTab] = useState<string>('ALL');

  const [recruits, setRecruits] = useState<Recruit[]>(() => {
    const saved = localStorage.getItem('military_recruits');
    return saved ? JSON.parse(saved) : INITIAL_RECRUITS;
  });

  // Desktop sidebar state (collapsed/expanded)
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Mobile sidebar state (hidden/visible)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changePassMsg, setChangePassMsg] = useState('');

  // Support Modal State
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('military_recruits', JSON.stringify(recruits));
  }, [recruits]);

  // Close mobile menu when navigating
  const handleNavigate = (tabId: string) => {
      setActiveRecruitSubTab(tabId);
      setActiveTab('recruits');
      setIsMobileMenuOpen(false);
  };

  const handleUpdateRecruit = (updatedRecruit: Recruit) => {
    setRecruits(prev => {
      const exists = prev.find(r => r.id === updatedRecruit.id);
      if (exists) {
        return prev.map(r => r.id === updatedRecruit.id ? updatedRecruit : r);
      }
      return [...prev, updatedRecruit];
    });
  };

  const handleDeleteRecruit = (id: string) => {
    if(window.confirm('Đồng chí chắc chắn muốn xóa hồ sơ này?')) {
        setRecruits(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleLogout = () => {
      setUser(null);
      setSessionYear(null);
      setActiveTab('dashboard');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 1) return;

    // Update in LocalStorage
    const savedUsers = JSON.parse(localStorage.getItem('military_users') || '[]');
    const updatedUsers = savedUsers.map((u: User) => {
        if (u.username === user?.username) {
            return { ...u, password: newPassword };
        }
        return u;
    });
    localStorage.setItem('military_users', JSON.stringify(updatedUsers));
    
    // Update current session
    if (user) setUser({ ...user, password: newPassword });

    setChangePassMsg("Đổi mật khẩu thành công!");
    setTimeout(() => {
        setShowPasswordModal(false);
        setNewPassword('');
        setChangePassMsg('');
    }, 1500);
  };

  // 1. Login Screen
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // 2. Year Selection Screen (After Login, Before App)
  if (!sessionYear) {
    return <YearSelection onSelectYear={setSessionYear} currentUser={user} />;
  }

  // Sidebar Content Component to reuse
  const SidebarContent = () => (
    <>
      <div className="p-4 flex items-center justify-between border-b border-military-800 h-16 shrink-0">
          {(isSidebarOpen || isMobileMenuOpen) ? (
             <span className="font-bold text-lg tracking-wider text-military-100 flex items-center gap-2">
                <ShieldAlert className="text-amber-500" /> TUYỂN QUÂN
             </span>
          ) : (
             <ShieldAlert className="text-amber-500 mx-auto" />
          )}
          
          {/* Desktop Toggle */}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="hidden md:block p-2 hover:bg-military-800 rounded text-military-200">
            <Menu size={20} />
          </button>

          {/* Mobile Close */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 hover:bg-military-800 rounded text-military-200">
            <X size={20} />
          </button>
      </div>

      <nav className="flex-1 py-6 px-2 space-y-2 overflow-y-auto">
          {/* Year Display Badge in Sidebar */}
          {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="px-4 mb-4">
                  <div className="bg-military-800 rounded p-2 flex items-center justify-between border border-military-700">
                      <div className="flex items-center gap-2 text-military-200 text-xs font-bold uppercase">
                          <CalendarDays size={14}/> Năm tuyển quân
                      </div>
                      <div className="text-amber-400 font-bold">{sessionYear}</div>
                  </div>
              </div>
          )}

          <button 
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-white text-gray-900 border-l-4 border-amber-500 font-bold' : 'text-military-200 hover:bg-military-800'}`}
          >
            <LayoutDashboard size={20} className="shrink-0" />
            {(isSidebarOpen || isMobileMenuOpen) && <span>TỔNG QUAN</span>}
          </button>
          
          <button 
             onClick={() => { setActiveTab('recruits'); setIsMobileMenuOpen(false); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'recruits' ? 'bg-white text-gray-900 border-l-4 border-amber-500 font-bold' : 'text-military-200 hover:bg-military-800'}`}
          >
            <Users size={20} className="shrink-0" />
            {(isSidebarOpen || isMobileMenuOpen) && <span>CHI TIẾT</span>}
          </button>

          <div className="mt-8 px-4 text-xs font-semibold text-military-400 uppercase tracking-wider">
            {(isSidebarOpen || isMobileMenuOpen) && "Báo cáo & Tiện ích"}
          </div>
          
           <button 
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-military-200 hover:bg-military-800 opacity-50 cursor-not-allowed`}
          >
            <FileCheck size={20} className="shrink-0" />
            {(isSidebarOpen || isMobileMenuOpen) && <span>Xuất báo cáo</span>}
          </button>
      </nav>

      <div className="p-4 border-t border-military-800 space-y-2 shrink-0">
             <button 
                onClick={() => { setShowSupportModal(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-military-200 hover:bg-military-800 transition-colors"
             >
                <HelpCircle size={20} className="shrink-0 text-cyan-400" />
                {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium text-cyan-100">Trợ giúp</span>}
             </button>
             <button 
                onClick={() => { setShowPasswordModal(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-military-200 hover:bg-military-800 transition-colors"
             >
                <Key size={20} className="shrink-0" />
                {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium">Đổi mật khẩu</span>}
             </button>
             <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-200 hover:bg-red-900/30 hover:text-red-100 transition-colors"
             >
                <LogOut size={20} className="shrink-0" />
                {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium">Đăng xuất</span>}
             </button>
             {(isSidebarOpen || isMobileMenuOpen) && <div className="mt-4 text-xs text-military-400 text-center">Phiên bản 2.2</div>}
      </div>
    </>
  );

  // Main App
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed md:relative inset-y-0 left-0 z-40
          bg-military-900 text-white shadow-2xl transition-all duration-300 flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isSidebarOpen ? 'md:w-64' : 'md:w-20'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 h-full">
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
             {/* Mobile Menu Button */}
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
             >
                <Menu size={24} />
             </button>
             <h1 className="text-lg md:text-xl font-bold text-gray-900 uppercase tracking-tight truncate max-w-[200px] md:max-w-none">
                {activeTab === 'dashboard' ? `Quy trình tuyển quân ${sessionYear}` : `Quản lý công dân nhập ngũ ${sessionYear}`}
             </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Re-select year button */}
             <button 
                onClick={() => setSessionYear(null)}
                className="hidden md:flex items-center gap-2 text-sm font-bold text-military-700 bg-military-50 px-3 py-1.5 rounded hover:bg-military-100 border border-military-200"
                title="Đổi năm tuyển quân"
             >
                 <CalendarDays size={16}/> {sessionYear}
             </button>

             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-military-600 flex items-center justify-center text-white font-bold border border-military-700 shrink-0">
                    {user.username.substring(0,2).toUpperCase()}
                </div>
                <div className="text-sm hidden md:block">
                    <p className="font-bold text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-600">{user.unit.commune}, {user.unit.province}</p>
                </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 relative">
          {activeTab === 'dashboard' && <Dashboard recruits={recruits} onNavigate={handleNavigate} sessionYear={sessionYear} />}
          {activeTab === 'recruits' && (
            <RecruitManagement 
                user={user}
                recruits={recruits} 
                onUpdate={handleUpdateRecruit}
                onDelete={handleDeleteRecruit}
                initialTab={activeRecruitSubTab}
                onTabChange={setActiveRecruitSubTab}
                sessionYear={sessionYear}
            />
          )}
        </div>
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Đổi mật khẩu</h3>
                 {changePassMsg ? (
                     <div className="text-green-600 font-bold text-center py-4">{changePassMsg}</div>
                 ) : (
                     <form onSubmit={handleChangePassword}>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                         <input 
                            type="password"
                            required
                            className="w-full border border-gray-300 rounded p-2 mb-4 text-gray-900 bg-white"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                         />
                         <div className="flex justify-end gap-2">
                             <button type="button" onClick={() => setShowPasswordModal(false)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
                             <button type="submit" className="px-3 py-2 bg-military-600 text-white rounded hover:bg-military-700">Xác nhận</button>
                         </div>
                     </form>
                 )}
             </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                 <div className="flex items-center gap-2 mb-4">
                     <HelpCircle className="text-cyan-600" size={24}/>
                     <h3 className="text-lg font-bold text-gray-900">Thông tin hỗ trợ</h3>
                 </div>
                 
                 <div className="space-y-3 mb-6 bg-cyan-50 p-4 rounded border border-cyan-100">
                    <div>
                        <p className="text-xs text-cyan-700 uppercase font-bold">Người hỗ trợ kỹ thuật</p>
                        <p className="text-lg font-bold text-gray-900">Đồng chí Sang</p>
                    </div>
                    <div>
                        <p className="text-xs text-cyan-700 uppercase font-bold">Số điện thoại / Zalo</p>
                        <p className="text-lg font-mono font-bold text-gray-900">0222.020.022</p>
                    </div>
                    <div className="text-xs text-gray-500 italic mt-2 border-t border-cyan-200 pt-2">
                        Vui lòng liên hệ trong giờ hành chính để được hỗ trợ tốt nhất về nghiệp vụ và phần mềm.
                    </div>
                 </div>
                 
                 <div className="flex justify-end">
                     <button onClick={() => setShowSupportModal(false)} className="px-4 py-2 bg-military-600 text-white rounded font-bold hover:bg-military-700">Đóng</button>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
}

export default App;