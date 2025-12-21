import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Menu, ShieldAlert, LogOut, Key, X, HelpCircle, 
  UserCircle, Settings, FileText, Share2, RefreshCw, ShieldCheck, CheckCircle2, Save, User as UserIcon, Lock
} from 'lucide-react';
import { Recruit, User, ResearchDocument, Feedback } from './types';
import Dashboard from './views/Dashboard';
import RecruitManagement from './views/RecruitManagement';
import Login from './views/Login';
import YearSelection from './views/YearSelection';
import CommunicationView from './views/CommunicationView';
import { api } from './api';

// Các view bổ sung chưa tách file sẽ được render inline hoặc giả định có component tương ứng
const DocumentsView = ({ documents }: { documents: ResearchDocument[] }) => (
    <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Thư viện Văn bản Pháp quy</h2>
            <p className="text-gray-500 mt-2">Dữ liệu văn bản luật, nghị định, thông tư về nghĩa vụ quân sự.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {documents.map(doc => (
                    <div key={doc.id} className="p-4 border rounded-xl hover:bg-gray-50 text-left">
                        <p className="font-bold text-military-800">{doc.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{doc.category} - {doc.uploadDate}</p>
                        <a href={doc.url} target="_blank" className="text-blue-600 text-xs font-bold mt-2 inline-block">Xem chi tiết</a>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const QAView = ({ feedbacks, user }: { feedbacks: Feedback[], user: User }) => (
    <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><HelpCircle className="text-amber-500"/> Hỏi đáp & Hỗ trợ kỹ thuật</h2>
            <div className="space-y-4">
                {feedbacks.filter(f => f.username === user.username || user.role === 'ADMIN').map(f => (
                    <div key={f.id} className="p-4 bg-gray-50 rounded-xl border">
                        <div className="flex justify-between items-start">
                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">{f.category}</span>
                            <span className="text-[10px] text-gray-400">{new Date(f.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-sm font-medium">{f.content}</p>
                        {f.reply && (
                            <div className="mt-3 p-3 bg-white rounded-lg border-l-4 border-military-500 text-sm italic text-gray-600">
                                <b>Phản hồi:</b> {f.reply}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionYear, setSessionYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recruits' | 'admin' | 'documents' | 'qa' | 'communication'>('dashboard');
  const [activeRecruitSubTab, setActiveRecruitSubTab] = useState<string>('ALL');
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // States cho Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Dữ liệu tạm cho profile
  const [profileData, setProfileData] = useState({ 
    personalName: '', rank: '', position: '', email: '', phoneNumber: '' 
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchAllData = async () => {
    if (!user || !sessionYear) return;
    setIsLoading(true);
    try {
      const [rData, dData, fData] = await Promise.all([
        api.getRecruits(), 
        api.getDocuments(), 
        api.getFeedbacks()
      ]);
      if (rData) setRecruits(rData);
      if (dData) setDocuments(dData);
      if (fData) setFeedbacks(fData);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user, sessionYear]);

  // Đồng bộ profileData khi user đăng nhập
  useEffect(() => {
    if (user) {
        setProfileData({
            personalName: user.personalName || '',
            rank: user.rank || '',
            position: user.position || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || ''
        });
    }
  }, [user]);

  const handleUpdateRecruit = async (updated: Recruit) => {
    const res = updated.createdAt ? await api.updateRecruit(updated) : await api.createRecruit(updated);
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
    const success = await api.updateUser(user.username, updatedUser);
    if (success) {
        setUser(updatedUser);
        setShowProfileModal(false);
        alert("Đã cập nhật thông tin cá nhân thành công!");
    }
  };

  const handleChangePassword = async () => {
      if (!newPassword || newPassword !== confirmPassword) {
          alert("Mật khẩu không khớp hoặc để trống!");
          return;
      }
      if (!user) return;
      const success = await api.updateUser(user.username, { password: newPassword });
      if (success) {
          alert("Đã đổi mật khẩu thành công! Vui lòng nhớ mật khẩu mới.");
          setShowPasswordModal(false);
          setNewPassword('');
          setConfirmPassword('');
      }
  };

  const handleLogout = () => { 
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
        setUser(null); 
        setSessionYear(null); 
        setActiveTab('dashboard'); 
        localStorage.removeItem('isDemoAccount'); 
    }
  };

  if (!user) return <Login onLogin={setUser} />;
  if (!sessionYear) return <YearSelection onSelectYear={setSessionYear} currentUser={user} />;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative font-sans">
      {/* SIDEBAR */}
      <aside className={`bg-military-900 text-white transition-all duration-300 flex flex-col shadow-2xl z-20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-military-800 h-16 shrink-0 overflow-hidden bg-military-950">
            <span className="font-bold flex items-center gap-2 shrink-0">
                <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                {isSidebarOpen && <span className="text-sm font-black uppercase tracking-tight truncate">Quản lý Tuyển quân</span>}
            </span>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-military-800 transition-colors text-military-300">
                <Menu size={20} />
            </button>
        </div>

        <nav className="flex-1 py-6 px-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}>
            <LayoutDashboard size={20} />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wide">Tổng quan</span>}
          </button>
          
          <button onClick={() => setActiveTab('recruits')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'recruits' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}>
            <Users size={20} />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wide">Hồ sơ công dân</span>}
          </button>
          
          <button onClick={() => setActiveTab('communication')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'communication' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}>
            <Share2 size={20} />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wide">Báo cáo & Văn bản</span>}
          </button>
          
          <button onClick={() => setActiveTab('documents')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'documents' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}>
            <FileText size={20} />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wide">Pháp quy NVQS</span>}
          </button>
          
          <button onClick={() => setActiveTab('qa')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'qa' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}>
            <HelpCircle size={20} />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wide">Hỏi đáp & Hỗ trợ</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-military-800 space-y-2 shrink-0 bg-military-950/50">
             <button onClick={() => setShowProfileModal(true)} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-military-200 hover:bg-military-800 transition-colors">
                <UserCircle size={18} />
                {isSidebarOpen && <span className="text-[10px] font-bold uppercase tracking-widest">Thông tin cán bộ</span>}
             </button>
             <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-military-200 hover:bg-military-800 transition-colors">
                <Key size={18} />
                {isSidebarOpen && <span className="text-[10px] font-bold uppercase tracking-widest">Đổi mật khẩu</span>}
             </button>
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-300 hover:bg-red-900/30 transition-colors mt-2">
                <LogOut size={18} />
                {isSidebarOpen && <span className="text-[10px] font-bold uppercase tracking-widest">Thoát hệ thống</span>}
             </button>
        </div>
      </aside>
      
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
              <div className="p-2 bg-military-50 rounded-lg md:hidden">
                  <Menu size={20} className="text-military-700" onClick={() => setSidebarOpen(!isSidebarOpen)} />
              </div>
              <h1 className="text-lg font-black uppercase text-military-800 tracking-tight flex items-center gap-2">
                  <ShieldCheck size={20} className="text-military-600"/>
                  {activeTab === 'dashboard' && 'Bảng điều khiển tổng hợp'}
                  {activeTab === 'recruits' && 'Quản lý hồ sơ công dân'}
                  {activeTab === 'communication' && 'Trao đổi văn bản chỉ đạo'}
                  {activeTab === 'documents' && 'Văn bản pháp quy & Hướng dẫn'}
                  {activeTab === 'qa' && 'Hệ thống hỗ trợ trực tuyến'}
              </h1>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Hệ thống trực tuyến</span>
              </div>
              <button onClick={() => setSessionYear(null)} className="text-xs font-black bg-amber-50 text-amber-700 px-4 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-all flex items-center gap-2">
                  <RefreshCw size={14}/> NĂM {sessionYear}
              </button>
              <div className="text-[10px] leading-tight text-right hidden sm:block">
                <p className="font-black uppercase text-military-900">{user.fullName}</p>
                <p className="text-gray-400 font-bold">{user.role === 'ADMIN' ? 'Quản trị viên' : (user.role === 'PROVINCE_ADMIN' ? 'Cấp Tỉnh' : 'Cấp Xã/Phường')}</p>
              </div>
          </div>
        </header>
        
        {/* VIEW RENDERER */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
            {activeTab === 'dashboard' && <Dashboard recruits={recruits} onNavigate={(id) => {setActiveRecruitSubTab(id); setActiveTab('recruits');}} sessionYear={sessionYear} userRole={user.role} userUnit={user.unit} />}
            {activeTab === 'recruits' && <RecruitManagement user={user} recruits={recruits} onUpdate={handleUpdateRecruit} onDelete={(id) => api.deleteRecruit(id).then(() => setRecruits(prev => prev.filter(r => r.id !== id)))} initialTab={activeRecruitSubTab} onTabChange={setActiveRecruitSubTab} sessionYear={sessionYear} />}
            {activeTab === 'communication' && <CommunicationView user={user} sessionYear={sessionYear} />}
            {activeTab === 'documents' && <DocumentsView documents={documents} />}
            {activeTab === 'qa' && <QAView feedbacks={feedbacks} user={user} />}
        </div>
      </main>

      {/* MODAL: THÔNG TIN CÁN BỘ */}
      {showProfileModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
                  <div className="bg-military-800 p-5 flex justify-between items-center text-white">
                      <h3 className="font-bold uppercase flex items-center gap-2 text-sm"><UserIcon size={18}/> Thông tin cá nhân cán bộ</h3>
                      <button onClick={() => setShowProfileModal(false)} className="hover:bg-white/10 p-1 rounded-full"><X size={24}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Họ và tên cán bộ</label>
                          <input className="w-full border p-2.5 rounded-xl font-bold text-sm" value={profileData.personalName} onChange={e => setProfileData({...profileData, personalName: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Cấp bậc</label>
                              <input className="w-full border p-2.5 rounded-xl font-bold text-sm" value={profileData.rank} onChange={e => setProfileData({...profileData, rank: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Chức vụ</label>
                              <input className="w-full border p-2.5 rounded-xl font-bold text-sm" value={profileData.position} onChange={e => setProfileData({...profileData, position: e.target.value})} />
                          </div>
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Số điện thoại</label>
                          <input className="w-full border p-2.5 rounded-xl font-bold text-sm" value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Email liên hệ</label>
                          <input className="w-full border p-2.5 rounded-xl font-bold text-sm" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                      </div>
                      <button onClick={handleSaveProfile} className="w-full bg-military-700 text-white py-3 rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-military-800 active:scale-95 transition-all">
                          <Save size={18}/> Lưu thay đổi
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: ĐỔI MẬT KHẨU */}
      {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
                  <div className="bg-red-800 p-5 flex justify-between items-center text-white">
                      <h3 className="font-bold uppercase flex items-center gap-2 text-sm"><Lock size={18}/> Thiết lập bảo mật</h3>
                      <button onClick={() => setShowPasswordModal(false)} className="hover:bg-white/10 p-1 rounded-full"><X size={24}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Mật khẩu mới</label>
                          <input type="password" placeholder="Nhập mật khẩu mới..." className="w-full border p-3 rounded-xl font-bold text-sm" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Xác nhận mật khẩu</label>
                          <input type="password" placeholder="Nhập lại mật khẩu..." className="w-full border p-3 rounded-xl font-bold text-sm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                      </div>
                      <button onClick={handleChangePassword} className="w-full bg-red-700 text-white py-3 rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-red-800 active:scale-95 transition-all">
                          <CheckCircle2 size={18}/> Xác nhận thay đổi
                      </button>
                      <p className="text-[9px] text-center text-gray-400 italic">Lưu ý: Bạn nên ghi lại mật khẩu để tránh gián đoạn công tác.</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default App;