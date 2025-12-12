// ... (imports remain the same)
import React, { useState, useEffect, useMemo } from 'react';
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
  CalendarDays, 
  Wifi, 
  WifiOff, 
  UserCog, 
  Check, 
  Phone, 
  Mail, 
  Lock, 
  Unlock, 
  BellRing 
} from 'lucide-react';
import { Recruit, User } from './types';
import { INITIAL_RECRUITS } from './constants';
import Dashboard from './views/Dashboard';
import RecruitManagement from './views/RecruitManagement';
import Login from './views/Login';
import YearSelection from './views/YearSelection';
import { api } from './api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionYear, setSessionYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recruits' | 'admin'>('dashboard');
  
  // State to control which sub-tab of RecruitManagement is active
  const [activeRecruitSubTab, setActiveRecruitSubTab] = useState<string>('ALL');

  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Desktop sidebar state (collapsed/expanded)
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Mobile sidebar state (hidden/visible)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassMsg, setChangePassMsg] = useState('');

  // Support Modal State
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  // Admin Update Trigger (to refresh sidebar badge)
  const [adminUpdateTrigger, setAdminUpdateTrigger] = useState(0);

  // FETCH DATA FROM SERVER
  useEffect(() => {
    const fetchData = async () => {
      if (user && sessionYear) {
        setIsLoading(true);
        const data = await api.getRecruits();
        
        if (data !== null) {
            // Kết nối thành công (có thể là mảng rỗng hoặc có dữ liệu)
            setRecruits(data);
            setIsOnline(true);
        } else {
            // Lỗi kết nối (null) -> Offline
            setRecruits([]); 
            setIsOnline(false);
        }
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, sessionYear]);

  // Close mobile menu when navigating
  const handleNavigate = (tabId: string) => {
      setActiveRecruitSubTab(tabId);
      setActiveTab('recruits');
      setIsMobileMenuOpen(false);
  };

  const handleUpdateRecruit = async (updatedRecruit: Recruit) => {
    // Optimistic Update (Cập nhật giao diện trước cho mượt)
    const oldRecruits = [...recruits];
    const exists = recruits.find(r => r.id === updatedRecruit.id);
    
    // Update Local State
    setRecruits(prev => {
      if (exists) {
        return prev.map(r => r.id === updatedRecruit.id ? updatedRecruit : r);
      }
      return [...prev, updatedRecruit];
    });

    // Call API
    let result;
    if (exists) {
        result = await api.updateRecruit(updatedRecruit);
    } else {
        result = await api.createRecruit(updatedRecruit);
    }

    // Rollback if error
    if (!result) {
        alert("Lỗi kết nối Server! Không lưu được dữ liệu.");
        setRecruits(oldRecruits);
        setIsOnline(false);
    } else {
        setIsOnline(true);
    }
  };

  const handleDeleteRecruit = async (id: string) => {
    // Confirmation is handled in the View layer (RecruitManagement) for better context
    const oldRecruits = [...recruits];
    
    // Optimistic delete: Remove immediately from UI
    setRecruits(prev => prev.filter(r => r.id !== id));
    
    const success = await api.deleteRecruit(id);
    if (!success) {
        alert("Lỗi kết nối Server! Không xóa được dữ liệu.");
        setRecruits(oldRecruits); // Rollback
        setIsOnline(false);
    } else {
        setIsOnline(true);
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
    
    if (newPassword !== confirmPassword) {
        setChangePassMsg("Mật khẩu xác nhận không khớp!");
        return;
    }

    // Update in LocalStorage (Auth is still local for this version)
    const savedUsers = JSON.parse(localStorage.getItem('military_users') || '[]');
    
    if (user?.role === 'ADMIN') {
        // Admin changes password directly
        const updatedUsers = savedUsers.map((u: User) => {
            if (u.username === user?.username) {
                return { ...u, password: newPassword };
            }
            return u;
        });
        localStorage.setItem('military_users', JSON.stringify(updatedUsers));
        if (user) setUser({ ...user, password: newPassword });
        setChangePassMsg("Đổi mật khẩu thành công!");
    } else {
        // Normal user sends request
        const updatedUsers = savedUsers.map((u: User) => {
            if (u.username === user?.username) {
                return { ...u, pendingPassword: newPassword };
            }
            return u;
        });
        localStorage.setItem('military_users', JSON.stringify(updatedUsers));
        setChangePassMsg("Đã gửi yêu cầu đổi mật khẩu tới Quản trị viên.");
    }

    setAdminUpdateTrigger(prev => prev + 1);

    setTimeout(() => {
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setChangePassMsg('');
    }, 2000);
  };

  const AdminPanel = () => {
      const [allUsers, setAllUsers] = useState<User[]>(JSON.parse(localStorage.getItem('military_users') || '[]'));
      const pendingUsers = allUsers.filter(u => u.pendingPassword);

      const refreshUsers = () => {
          setAllUsers(JSON.parse(localStorage.getItem('military_users') || '[]'));
          setAdminUpdateTrigger(prev => prev + 1);
      };

      const approvePassword = (username: string) => {
          const updatedUsers = allUsers.map(u => {
              if (u.username === username && u.pendingPassword) {
                  return { ...u, password: u.pendingPassword, pendingPassword: undefined };
              }
              return u;
          });
          localStorage.setItem('military_users', JSON.stringify(updatedUsers));
          refreshUsers();
          alert(`Đã duyệt mật khẩu cho ${username}`);
      };

      const toggleLockUser = (username: string, currentStatus: boolean | undefined) => {
          if (username === user?.username) {
              alert("Không thể tự khóa tài khoản của chính mình!");
              return;
          }
          const updatedUsers = allUsers.map(u => {
              if (u.username === username) {
                  return { ...u, isLocked: !currentStatus };
              }
              return u;
          });
          localStorage.setItem('military_users', JSON.stringify(updatedUsers));
          refreshUsers();
      };

      const resetUserPassword = (username: string) => {
          const newPass = prompt(`Nhập mật khẩu mới cho tài khoản ${username}:`);
          if (newPass) {
              const updatedUsers = allUsers.map(u => {
                  if (u.username === username) {
                      return { ...u, password: newPass, pendingPassword: undefined };
                  }
                  return u;
              });
              localStorage.setItem('military_users', JSON.stringify(updatedUsers));
              refreshUsers();
              alert(`Đã đổi mật khẩu cho ${username} thành công.`);
          }
      };

      return (
          <div className="p-6 bg-white m-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-military-700 mb-6 flex items-center gap-2">
                  <UserCog /> Quản trị hệ thống
              </h2>
              
              {/* NOTIFICATIONS SECTION */}
              <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                  <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <BellRing size={18} className={pendingUsers.length > 0 ? "animate-bounce" : ""}/> 
                      Thông báo & Yêu cầu ({pendingUsers.length})
                  </h3>
                  {pendingUsers.length === 0 ? (
                      <p className="text-sm text-gray-500 italic ml-6">Không có yêu cầu nào cần xử lý.</p>
                  ) : (
                      <div className="overflow-x-auto mt-2 bg-white rounded border border-amber-100 shadow-sm">
                          <table className="w-full text-left border-collapse">
                              <thead className="bg-amber-100 text-xs text-amber-900 uppercase">
                                  <tr>
                                      <th className="p-2 border-b">Tài khoản</th>
                                      <th className="p-2 border-b">Đơn vị</th>
                                      <th className="p-2 border-b">Yêu cầu</th>
                                      <th className="p-2 border-b text-center">Xử lý</th>
                                  </tr>
                              </thead>
                              <tbody className="text-sm">
                                  {pendingUsers.map(u => (
                                      <tr key={u.username} className="border-b border-gray-100 last:border-0">
                                          <td className="p-2 font-bold">{u.username}</td>
                                          <td className="p-2">{u.fullName}</td>
                                          <td className="p-2">
                                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">Đổi mật khẩu: <b>{u.pendingPassword}</b></span>
                                          </td>
                                          <td className="p-2 text-center">
                                              <button 
                                                onClick={() => approvePassword(u.username)}
                                                className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1 mx-auto"
                                              >
                                                  <Check size={14} /> Duyệt
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  )}
              </div>

              {/* ALL USERS LIST */}
              <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Users size={18} /> Danh sách tài khoản ({allUsers.length})
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                              <tr>
                                  <th className="p-3 border-b">TT</th>
                                  <th className="p-3 border-b">Tài khoản</th>
                                  <th className="p-3 border-b">Thông tin người dùng</th>
                                  <th className="p-3 border-b">Vai trò</th>
                                  <th className="p-3 border-b text-center">Trạng thái</th>
                                  <th className="p-3 border-b text-center">Thao tác</th>
                              </tr>
                          </thead>
                          <tbody className="text-sm divide-y divide-gray-100">
                              {allUsers.map((u, idx) => (
                                  <tr key={u.username} className={`hover:bg-gray-50 ${u.isLocked ? 'bg-red-50/50' : ''}`}>
                                      <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                                      <td className="p-3">
                                          <div className="font-bold font-mono text-military-700">{u.username}</div>
                                      </td>
                                      <td className="p-3">
                                          <div className="font-bold">{u.fullName}</div>
                                          <div className="text-xs text-gray-500">{u.personalName} - {u.position}</div>
                                          <div className="text-xs text-gray-400">{u.phoneNumber}</div>
                                      </td>
                                      <td className="p-3">
                                          <span className={`text-xs px-2 py-1 rounded font-bold border ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' : u.role === 'EDITOR' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                              {u.role}
                                          </span>
                                      </td>
                                      <td className="p-3 text-center">
                                          {u.isLocked ? (
                                              <span className="text-xs font-bold text-red-600 flex items-center justify-center gap-1"><Lock size={12}/> Đã khóa</span>
                                          ) : (
                                              <span className="text-xs font-bold text-green-600 flex items-center justify-center gap-1"><Check size={12}/> Hoạt động</span>
                                          )}
                                      </td>
                                      <td className="p-3">
                                          <div className="flex items-center justify-center gap-2">
                                              <button 
                                                  onClick={() => toggleLockUser(u.username, u.isLocked)}
                                                  className={`p-1.5 rounded transition-colors ${u.isLocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                                  title={u.isLocked ? "Mở khóa nhập liệu" : "Vô hiệu hóa nhập liệu"}
                                                  disabled={u.role === 'ADMIN'}
                                              >
                                                  {u.isLocked ? <Unlock size={16}/> : <Lock size={16}/>}
                                              </button>
                                              
                                              <button 
                                                  onClick={() => resetUserPassword(u.username)}
                                                  className="p-1.5 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                                                  title="Đặt lại mật khẩu"
                                              >
                                                  <Key size={16}/>
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )
  };

  // 1. Login Screen
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // 2. Year Selection Screen (After Login, Before App)
  if (!sessionYear) {
    return <YearSelection onSelectYear={setSessionYear} currentUser={user} />;
  }

  // Calculate pending requests for sidebar badge
  const pendingRequestsCount = (() => {
      if (user.role !== 'ADMIN') return 0;
      const allUsers: User[] = JSON.parse(localStorage.getItem('military_users') || '[]');
      return allUsers.filter(u => u.pendingPassword).length;
  })();

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

          {user.role === 'ADMIN' && (
              <button 
                onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'admin' ? 'bg-white text-gray-900 border-l-4 border-amber-500 font-bold' : 'text-military-200 hover:bg-military-800'}`}
              >
                <div className="relative shrink-0">
                    <UserCog size={20} />
                    {pendingRequestsCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold animate-pulse">
                            {pendingRequestsCount}
                        </span>
                    )}
                </div>
                {(isSidebarOpen || isMobileMenuOpen) && (
                    <div className="flex items-center justify-between w-full">
                        <span>QUẢN TRỊ</span>
                        {pendingRequestsCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {pendingRequestsCount} yêu cầu
                            </span>
                        )}
                    </div>
                )}
              </button>
          )}

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
             {(isSidebarOpen || isMobileMenuOpen) && (
                 <div className="mt-4 text-[10px] text-military-400 text-center border-t border-military-800 pt-2">
                     <div className="font-bold text-military-300">Admin: Thới Hạ Sang</div>
                     <div className="flex justify-center items-center gap-1 mt-1">
                         <Phone size={10} /> 0334429954
                     </div>
                 </div>
             )}
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
             <h1 className="text-lg md:text-xl font-bold text-gray-900 uppercase tracking-tight truncate max-w-[200px] md:max-w-none flex flex-col">
                <span>{activeTab === 'dashboard' ? `Quy trình tuyển quân ${sessionYear}` : activeTab === 'admin' ? 'Quản trị hệ thống' : `Quản lý công dân nhập ngũ ${sessionYear}`}</span>
                {isLoading && <span className="text-[10px] text-gray-400 normal-case font-normal animate-pulse">Đang đồng bộ dữ liệu...</span>}
             </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Server Status Indicator */}
             <div className="hidden md:flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border border-gray-200">
                 {isOnline ? (
                     <><Wifi size={14} className="text-green-600"/> <span className="text-green-700">Online</span></>
                 ) : (
                     <><WifiOff size={14} className="text-red-600"/> <span className="text-red-700">Offline</span></>
                 )}
             </div>

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
          {activeTab === 'dashboard' && <Dashboard 
                recruits={recruits} 
                onNavigate={handleNavigate} 
                sessionYear={sessionYear} 
                userRole={user.role} 
                userUnit={user.unit}
          />}
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
          {activeTab === 'admin' && <AdminPanel />}
        </div>
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Đổi mật khẩu</h3>
                 {changePassMsg ? (
                     <div className="text-green-600 font-bold text-center py-4 px-2">{changePassMsg}</div>
                 ) : (
                     <form onSubmit={handleChangePassword}>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                         <input 
                            type="password"
                            required
                            className="w-full border border-gray-300 rounded p-2 mb-3 text-gray-900 bg-white"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                         />
                         <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
                         <input 
                            type="password"
                            required
                            className="w-full border border-gray-300 rounded p-2 mb-4 text-gray-900 bg-white"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
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
                        <p className="text-xs text-cyan-700 uppercase font-bold">Admin / Tác giả</p>
                        <p className="text-lg font-bold text-gray-900">Thới Hạ Sang</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="text-cyan-700"/>
                            <p className="text-xs text-cyan-700 uppercase font-bold">Số điện thoại / Zalo</p>
                        </div>
                        <p className="text-lg font-mono font-bold text-gray-900">0334429954</p>
                    </div>
                    <div>
                         <div className="flex items-center gap-2">
                            <Mail size={16} className="text-cyan-700"/>
                            <p className="text-xs text-cyan-700 uppercase font-bold">Email</p>
                        </div>
                        <p className="text-lg font-mono font-bold text-gray-900 break-words">thoihasang@gmail.com</p>
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