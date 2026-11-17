
import React, { useState, useEffect } from 'react';
import { Recruit, User } from './types';
import Dashboard from './views/Dashboard';
import RecruitManagement from './views/RecruitManagement';
import Login from './views/Login';
import YearSelection from './views/YearSelection';
import CommunicationView from './views/CommunicationView';
import QAView from './views/QAView';
import AccountManagement from './views/AccountManagement';
import ReportBuilder from './views/ReportBuilder';
import TemplateManagement from './views/TemplateManagement';
import DocumentsView from './views/DocumentsView';
import Sidebar from './components/layout/Sidebar';
import MainHeader from './components/layout/MainHeader';
import ProfileModal from './components/modals/ProfileModal';
import PasswordModal from './components/modals/PasswordModal';
import { api } from './api';
import { useInitialData } from './hooks/useInitialData';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Lỗi khi đọc auth_user từ localStorage:', e);
      return null;
    }
  });

  const [sessionYear, setSessionYear] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('session_year');
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'recruits' | 'admin' | 'qa' | 'communication' | 'accounts' | 'report-builder' | 'templates' | 'documents'>(() => {
    try {
      const saved = localStorage.getItem('active_tab');
      const validTabs = ['dashboard', 'recruits', 'admin', 'qa', 'communication', 'accounts', 'report-builder', 'templates', 'documents'];
      return saved && validTabs.includes(saved) ? (saved as any) : 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [activeRecruitSubTab, setActiveRecruitSubTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('active_recruit_subtab');
      return saved || 'ALL';
    } catch {
      return 'ALL';
    }
  });
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const { recruits, setRecruits, feedbacks, isLoading, fetchAllData } = useInitialData(user, sessionYear);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ personalName: '', rank: '', position: '', email: '', phoneNumber: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Lưu thông tin người dùng vào localStorage khi thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
      if (user.username === 'DEMO') {
        localStorage.setItem('isDemoAccount', 'true');
      } else {
        localStorage.setItem('isDemoAccount', 'false');
      }
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  // Lưu năm phiên làm việc vào localStorage
  useEffect(() => {
    if (sessionYear !== null) {
      localStorage.setItem('session_year', String(sessionYear));
    } else {
      localStorage.removeItem('session_year');
    }
  }, [sessionYear]);

  // Lưu tab hiện tại vào localStorage
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('active_tab', activeTab);
    }
  }, [activeTab]);

  // Lưu danh sách công dân con (subtab) hiện tại vào localStorage
  useEffect(() => {
    if (activeRecruitSubTab) {
      localStorage.setItem('active_recruit_subtab', activeRecruitSubTab);
    }
  }, [activeRecruitSubTab]);

  // Nếu người dùng không phải ADMIN mà đang lưu tab quản trị thì chuyển về dashboard
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      if (activeTab === 'templates' || activeTab === 'accounts') {
        setActiveTab('dashboard');
      }
    }
  }, [user, activeTab]);

  // Kiểm tra trạng thái tài khoản với máy chủ trong nền khi đã có phiên đăng nhập
  useEffect(() => {
    if (user && user.username !== 'DEMO') {
      api.getUsers().then(users => {
        if (!Array.isArray(users) || users.length === 0) return;
        const currentInDb = users.find((u: any) => u.username === user.username);
        if (currentInDb) {
          if (currentInDb.isLocked) {
            alert("Tài khoản của bạn đã bị khóa bởi Quản trị viên.");
            handleLogout(false);
          } else {
            setUser(prev => {
              if (!prev) return null;
              if (
                prev.role !== currentInDb.role ||
                prev.fullName !== currentInDb.fullName ||
                prev.unit?.province !== currentInDb.unit?.province ||
                prev.unit?.commune !== currentInDb.unit?.commune ||
                prev.isSpecialArea !== currentInDb.isSpecialArea ||
                prev.secondaryPassword !== currentInDb.secondaryPassword
              ) {
                return { ...prev, ...currentInDb };
              }
              return prev;
            });
          }
        }
      }).catch(err => {
        console.warn('Không thể kiểm tra trạng thái tài khoản:', err);
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
        setProfileData({ personalName: user.personalName || '', rank: user.rank || '', position: user.position || '', email: user.email || '', phoneNumber: user.phoneNumber || '' });
    }
  }, [user]);

  const handleUpdateRecruit = async (updated: Recruit): Promise<boolean> => {
    try {
      const isExisting = recruits.some(r => r.id === updated.id);
      const res = isExisting ? await api.updateRecruit(updated) : await api.createRecruit(updated);
      if (res) {
          setRecruits(prev => {
              const exists = prev.some(r => r.id === res.id);
              if (exists) return prev.map(r => r.id === res.id ? res : r);
              return [...prev, res];
          });
          return true;
      }
      alert('Không thể lưu hồ sơ công dân lên máy chủ. Vui lòng thử lại.');
      return false;
    } catch (err: any) {
      console.error('Lỗi khi lưu hồ sơ công dân:', err);
      alert(`Lưu hồ sơ công dân thất bại: ${err?.message || 'Lỗi kết nối máy chủ'}`);
      return false;
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const updatedUser = { ...user, ...profileData };
    if (await api.updateUser(user.username, updatedUser)) {
        setUser(updatedUser); setShowProfileModal(false); alert("Đã cập nhật!");
    }
  };

  const handleChangePassword = async () => {
      if (!newPassword || newPassword !== confirmPassword) { alert("Lỗi mật khẩu!"); return; }
      if (user && await api.updateUser(user.username, { password: newPassword })) {
          alert("Đã đổi mật khẩu!"); setShowPasswordModal(false);
      }
  };

  const handleLogout = (needConfirm = true) => {
    if (!needConfirm || window.confirm("Đăng xuất khỏi hệ thống?")) {
      setUser(null);
      setSessionYear(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('session_year');
      localStorage.removeItem('active_tab');
      localStorage.removeItem('active_recruit_subtab');
      localStorage.removeItem('isDemoAccount');
    }
  };

  const handleSelectYear = (year: number) => {
    setSessionYear(year);
    if (user) {
      setUser({ ...user });
    }
  };

  if (!user) return <Login onLogin={setUser} />;
  if (!sessionYear) return <YearSelection onSelectYear={handleSelectYear} currentUser={user} />;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} onProfileClick={() => setShowProfileModal(true)} onPasswordClick={() => setShowPasswordModal(true)} onLogout={() => handleLogout(true)} sessionYear={sessionYear} user={user} />
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full relative">
        <MainHeader activeTab={activeTab} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} sessionYear={sessionYear} onYearReset={() => setSessionYear(null)} user={user} />
        <div className="flex-1 overflow-auto custom-scrollbar relative">
            {activeTab === 'dashboard' && <Dashboard recruits={recruits} onNavigate={(id: string) => {setActiveRecruitSubTab(id); setActiveTab('recruits');}} sessionYear={sessionYear} userRole={user.role} userUnit={user.unit} currentUser={user} onUpdateUser={setUser} />}
            {activeTab === 'recruits' && <RecruitManagement user={user} recruits={recruits} onUpdate={handleUpdateRecruit} onDelete={(id: string) => api.deleteRecruit(id).then(() => setRecruits(prev => prev.filter(r => r.id !== id)))} initialTab={activeRecruitSubTab} onTabChange={setActiveRecruitSubTab} sessionYear={sessionYear} onRefreshData={fetchAllData} />}
            {activeTab === 'communication' && <CommunicationView user={user} sessionYear={sessionYear} />}
            {activeTab === 'report-builder' && <ReportBuilder user={user} recruits={recruits} sessionYear={sessionYear} />}
            {activeTab === 'documents' && <DocumentsView user={user} />}
            {activeTab === 'templates' && user.role === 'ADMIN' && <TemplateManagement user={user} />}
            {activeTab === 'accounts' && user.role === 'ADMIN' && <AccountManagement user={user} />}
            {activeTab === 'qa' && <QAView feedbacks={feedbacks} user={user} />}
        </div>
      </main>
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} data={profileData} setData={setProfileData} onSave={handleSaveProfile} />
      <PasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} newPass={newPassword} setNewPass={setNewPassword} confirmPass={confirmPassword} setConfirmPass={setConfirmPassword} onSave={handleChangePassword} />
    </div>
  );
}

export default App;
