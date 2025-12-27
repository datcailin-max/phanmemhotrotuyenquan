
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
import Sidebar from './components/layout/Sidebar';
import MainHeader from './components/layout/MainHeader';
import ProfileModal from './components/modals/ProfileModal';
import PasswordModal from './components/modals/PasswordModal';
import { api } from './api';
import { useInitialData } from './hooks/useInitialData';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionYear, setSessionYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recruits' | 'admin' | 'qa' | 'communication' | 'accounts' | 'report-builder' | 'templates'>('dashboard');
  const [activeRecruitSubTab, setActiveRecruitSubTab] = useState<string>('ALL');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const { recruits, setRecruits, feedbacks, isLoading } = useInitialData(user, sessionYear);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ personalName: '', rank: '', position: '', email: '', phoneNumber: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
        setProfileData({ personalName: user.personalName || '', rank: user.rank || '', position: user.position || '', email: user.email || '', phoneNumber: user.phoneNumber || '' });
    }
  }, [user]);

  const handleUpdateRecruit = async (updated: Recruit) => {
    const isExisting = recruits.some(r => r.id === updated.id);
    const res = isExisting ? await api.updateRecruit(updated) : await api.createRecruit(updated);
    if (res) {
        setRecruits(prev => {
            const exists = prev.some(r => r.id === res.id);
            if (exists) return prev.map(r => r.id === res.id ? res : r);
            return [...prev, res];
        });
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

  const handleLogout = () => { if (window.confirm("Đăng xuất?")) { setUser(null); setSessionYear(null); localStorage.removeItem('isDemoAccount'); } };

  if (!user) return <Login onLogin={setUser} />;
  if (!sessionYear) return <YearSelection onSelectYear={setSessionYear} currentUser={user} />;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} onProfileClick={() => setShowProfileModal(true)} onPasswordClick={() => setShowPasswordModal(true)} onLogout={handleLogout} sessionYear={sessionYear} user={user} />
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full relative">
        <MainHeader activeTab={activeTab} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} sessionYear={sessionYear} onYearReset={() => setSessionYear(null)} user={user} />
        <div className="flex-1 overflow-auto custom-scrollbar relative">
            {activeTab === 'dashboard' && <Dashboard recruits={recruits} onNavigate={(id) => {setActiveRecruitSubTab(id); setActiveTab('recruits');}} sessionYear={sessionYear} userRole={user.role} userUnit={user.unit} />}
            {activeTab === 'recruits' && <RecruitManagement user={user} recruits={recruits} onUpdate={handleUpdateRecruit} onDelete={(id) => api.deleteRecruit(id).then(() => setRecruits(prev => prev.filter(r => r.id !== id)))} initialTab={activeRecruitSubTab} onTabChange={setActiveRecruitSubTab} sessionYear={sessionYear} />}
            {activeTab === 'communication' && <CommunicationView user={user} sessionYear={sessionYear} />}
            {activeTab === 'report-builder' && <ReportBuilder user={user} recruits={recruits} sessionYear={sessionYear} />}
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
