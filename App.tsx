
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, Menu, ShieldAlert, LogOut, Key, X, HelpCircle, CalendarDays, 
  UserCircle, Settings, Check, Phone, Mail, Award, Info, Lock, Unlock, RefreshCw, 
  CheckCircle2, Search, FileText, Download, File, AlertTriangle, Paperclip, Trash2, 
  PlusCircle, FilePlus, MessageSquare, Send, History, ChevronRight, Share2, Filter
} from 'lucide-react';
import { Recruit, User, ResearchDocument, Feedback, RecruitmentStatus } from './types';
import { LOCATION_DATA, PROVINCES_VN, generateUnitUsername, removeVietnameseTones } from './constants';
import Dashboard from './views/Dashboard';
import RecruitManagement from './views/RecruitManagement';
import Login from './views/Login';
import YearSelection from './views/YearSelection';
import CommunicationView from './views/CommunicationView';
import { api } from './api';

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
  
  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [profileData, setProfileData] = useState({ personalName: '', rank: '', position: '', email: '', phoneNumber: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 1. Fetch Data & Logic tự động chuyển diện hết tuổi
  const fetchAllData = async () => {
    if (!user || !sessionYear) return;
    setIsLoading(true);
    try {
      const [rData, dData, fData] = await Promise.all([api.getRecruits(), api.getDocuments(), api.getFeedbacks()]);
      if (rData) {
          const processedRecruits = (rData as Recruit[]).map((r: Recruit) => {
              const birthYear = parseInt(r.dob?.split('-')[0] || '0');
              if (birthYear > 0) {
                  const age = sessionYear - birthYear;
                  // Chỉ xét các diện thuộc NGUỒN (4-13)
                  const isEligibleForSourceStatus = [
                      RecruitmentStatus.SOURCE, 
                      RecruitmentStatus.PRE_CHECK_PASSED, 
                      RecruitmentStatus.MED_EXAM_PASSED,
                      RecruitmentStatus.DEFERRED,
                      RecruitmentStatus.NOT_SELECTED_TT50,
                      RecruitmentStatus.PRE_CHECK_FAILED,
                      RecruitmentStatus.MED_EXAM_FAILED
                  ].includes(r.status);
                  
                  if (age > 27 && isEligibleForSourceStatus) {
                      const updated = { 
                          ...r, 
                          status: RecruitmentStatus.REMOVED_FROM_SOURCE, 
                          previousStatus: r.status,
                          defermentReason: `Tự động: Hết tuổi gọi nhập ngũ (${age} tuổi)`
                      };
                      api.updateRecruit(updated);
                      return updated;
                  }
              }
              return r;
          });
          setRecruits(processedRecruits);
      }
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

  useEffect(() => {
    if (user) {
        setProfileData({
            personalName: user.personalName || '', rank: user.rank || '',
            position: user.position || '', email: user.email || '', phoneNumber: user.phoneNumber || ''
        });
    }
  }, [user]);

  const handleUpdateRecruit = async (updated: Recruit) => {
    const res = updated.createdAt ? await api.updateRecruit(updated) : await api.createRecruit(updated);
    if (res) setRecruits(prev => prev.some(r => r.id === res.id) ? prev.map(r => r.id === res.id ? res : r) : [...prev, res]);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault(); if (!user) return;
      if (await api.updateUser(user.username, profileData)) {
          setUser({ ...user, ...profileData }); alert("Đã cập nhật hồ sơ!"); setShowProfileModal(false);
      }
  };

  const handleLogout = () => { 
    setUser(null); 
    setSessionYear(null); 
    setActiveTab('dashboard'); 
    localStorage.removeItem('isDemoAccount'); 
  };

  const AdminPanel = () => {
    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => { api.getUsers().then(setUsers); }, []);
    const toggleLock = async (username: string, currentLock: boolean) => {
      if (await api.updateUser(username, { isLocked: !currentLock })) {
        setUsers(users.map(u => u.username === username ? { ...u, isLocked: !currentLock } : u));
      }
    };
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-military-800 mb-6 flex items-center gap-2"><Settings className="text-military-600" /> QUẢN TRỊ NGƯỜI DÙNG</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-500 border-b">
                <tr><th className="p-4">Đơn vị / Cán bộ</th><th className="p-4">Username</th><th className="p-4">Quyền</th><th className="p-4 text-center">Trạng thái</th></tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.username} className="hover:bg-gray-50">
                    <td className="p-4"><div className="font-bold text-gray-900">{u.fullName}</div><div className="text-xs text-gray-500">{u.personalName || '---'}</div></td>
                    <td className="p-4 font-mono text-xs">{u.username}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black">{u.role}</span></td>
                    <td className="p-4 text-center">
                      <button onClick={() => toggleLock(u.username, !!u.isLocked)} className={`flex items-center gap-2 mx-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${u.isLocked ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>{u.isLocked ? <><Lock size={14}/> KHÓA</> : <><Unlock size={14}/> MỞ</>}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const DocumentsPanel = () => (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-military-800 mb-6 flex items-center gap-2"><FileText className="text-military-600" /> THƯ VIỆN VĂN BẢN</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="p-4 border rounded-xl hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24}/></div><span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded uppercase">{doc.category}</span></div>
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">{doc.title}</h3>
                <div className="flex items-center justify-between mt-4"><span className="text-[10px] text-gray-400 font-bold uppercase">{doc.uploadDate}</span><a href={doc.url} download={doc.title} className="flex items-center gap-1 text-xs font-black text-blue-600 hover:underline"><Download size={14}/> TẢI VỀ</a></div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );

  const QAPanel = () => {
    const [newFeedback, setNewFeedback] = useState('');
    const [category, setCategory] = useState<'HỎI ĐÁP' | 'GÓP Ý' | 'MẬT KHẨU' | 'KHÁC'>('HỎI ĐÁP');
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); if (!user) return;
      const res = await api.createFeedback({ username: user.username, unitName: user.fullName, category, content: newFeedback, isRead: false, timestamp: Date.now() });
      if (res) { setFeedbacks([res, ...feedbacks]); setNewFeedback(''); alert("Gửi thành công!"); }
    };
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-military-800 mb-6 flex items-center gap-2"><HelpCircle className="text-military-600" /> PHÒNG HỎI ĐÁP</h2>
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-gray-50 p-6 rounded-xl border">
            <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Chủ đề</label><select className="w-full border rounded-lg p-2 text-sm font-bold" value={category} onChange={(e: any) => setCategory(e.target.value)}><option value="HỎI ĐÁP">HỎI ĐÁP NGHIỆP VỤ</option><option value="GÓP Ý">GÓP Ý HỆ THỐNG</option><option value="MẬT KHẨU">YÊU CẦU CẤP MẬT KHẨU</option><option value="KHÁC">CHỦ ĐỀ KHÁC</option></select></div>
            <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Nội dung</label><textarea required className="w-full border rounded-lg p-3 text-sm h-24" placeholder="Nhập câu hỏi hoặc ý kiến..." value={newFeedback} onChange={e => setNewFeedback(e.target.value)} /></div>
            <button type="submit" className="bg-military-700 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-military-800 transition-all shadow-md"><Send size={18}/> GỬI PHẢN HỒI</button>
          </form>
          <div className="space-y-4">
            {feedbacks.map(f => (
              <div key={f.id} className="p-4 border rounded-xl hover:bg-gray-50 transition-all">
                <div className="flex items-center justify-between mb-2"><span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${f.category === 'MẬT KHẨU' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{f.category}</span><span className="text-[10px] text-gray-400 font-bold">{new Date(f.timestamp).toLocaleDateString('vi-VN')}</span></div>
                <p className="text-sm text-gray-800 font-medium mb-3">{f.content}</p>
                {f.reply && <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3"><MessageSquare size={16} className="text-amber-600 mt-1 shrink-0"/><div><p className="text-xs font-bold text-amber-800">Phản hồi:</p><p className="text-xs text-amber-700 mt-1">{f.reply}</p></div></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!user) return <Login onLogin={setUser} />;
  if (!sessionYear) return <YearSelection onSelectYear={setSessionYear} currentUser={user} />;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative">
      <aside className={`bg-military-900 text-white transition-all duration-300 flex flex-col shadow-2xl z-20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-military-800 h-16 shrink-0 overflow-hidden">
            <span className="font-bold flex items-center gap-2 shrink-0"><ShieldAlert className="text-amber-500 shrink-0" />{isSidebarOpen && <span className="text-sm font-black uppercase tracking-tight truncate">Tuyển chọn & Gọi NN</span>}</span>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-military-800 transition-colors"><Menu size={20} /></button>
        </div>
        <nav className="flex-1 py-6 px-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><LayoutDashboard size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Tổng quan</span>}</button>
          <button onClick={() => setActiveTab('recruits')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'recruits' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><Users size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Hồ sơ công dân</span>}</button>
          <button onClick={() => setActiveTab('communication')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'communication' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><Share2 size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Báo cáo & Văn bản</span>}</button>
          <button onClick={() => setActiveTab('documents')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'documents' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><FileText size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Văn bản pháp quy</span>}</button>
          <button onClick={() => setActiveTab('qa')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'qa' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><HelpCircle size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Hỏi đáp & Góp ý</span>}</button>
          {user.role === 'ADMIN' && <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 border-t border-military-800 pt-4 ${activeTab === 'admin' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-amber-400 hover:bg-military-800'}`}><Settings size={20}/>{isSidebarOpen && <span className="text-xs font-bold uppercase">Quản trị ADMIN</span>}</button>}
        </nav>
        <div className="p-4 border-t border-military-800 space-y-2 bg-military-950/20 shrink-0">
             <button onClick={() => setShowProfileModal(true)} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-military-200 hover:bg-military-800 transition-colors"><UserCircle size={18} />{isSidebarOpen && <span className="text-[10px] font-bold uppercase">Hồ sơ cán bộ</span>}</button>
             <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-military-200 hover:bg-military-800 transition-colors"><Key size={18} />{isSidebarOpen && <span className="text-[10px] font-bold uppercase">Đổi mật khẩu</span>}</button>
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-300 hover:bg-red-900/30 transition-colors"><LogOut size={18} />{isSidebarOpen && <span className="text-[10px] font-bold uppercase">Đăng xuất</span>}</button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <h1 className="text-lg font-black uppercase text-military-800 tracking-tight">
              {activeTab === 'dashboard' ? `Dữ liệu Tuyển quân ${sessionYear}` : activeTab === 'admin' ? 'Quản trị hệ thống' : activeTab === 'documents' ? 'Thư viện pháp quy' : activeTab === 'qa' ? 'Phòng Hỏi đáp' : activeTab === 'communication' ? 'Báo cáo & Văn bản' : `Quản lý hồ sơ ${sessionYear}`}
          </h1>
          <div className="flex items-center gap-4">
              <button onClick={() => setSessionYear(null)} className="flex items-center gap-2 text-xs font-bold bg-military-50 text-military-700 px-3 py-1.5 rounded-lg border border-military-200 hover:bg-military-100 transition-all shadow-sm">NĂM {sessionYear}</button>
              <div className="text-[10px] leading-tight text-right">
                <p className="font-black uppercase text-military-900">{user.fullName}</p>
                <p className="text-gray-500 font-bold uppercase">{user.personalName ? `${user.rank} ${user.personalName}` : 'Quản trị viên'}</p>
              </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto custom-scrollbar">
            {activeTab === 'dashboard' && <Dashboard recruits={recruits} onNavigate={(id) => {setActiveRecruitSubTab(id); setActiveTab('recruits');}} sessionYear={sessionYear} userRole={user.role} userUnit={user.unit} />}
            {activeTab === 'recruits' && <RecruitManagement user={user} recruits={recruits} onUpdate={handleUpdateRecruit} onDelete={(id) => api.deleteRecruit(id).then(() => setRecruits(prev => prev.filter(r => r.id !== id)))} initialTab={activeRecruitSubTab} onTabChange={setActiveRecruitSubTab} sessionYear={sessionYear} />}
            {activeTab === 'admin' && <AdminPanel />}
            {activeTab === 'documents' && <DocumentsPanel />}
            {activeTab === 'qa' && <QAPanel />}
            {activeTab === 'communication' && <CommunicationView user={user} sessionYear={sessionYear} />}
        </div>
      </main>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-military-800 p-5 flex justify-between items-center text-white"><h3 className="font-bold uppercase flex items-center gap-2 text-sm"><UserCircle size={20}/> Hồ sơ cán bộ</h3><button onClick={() => setShowProfileModal(false)}><X size={20}/></button></div>
            <form onSubmit={handleUpdateProfile} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Họ tên cán bộ</label><input type="text" className="w-full border p-2 rounded-lg text-sm font-bold" value={profileData.personalName} onChange={e => setProfileData({...profileData, personalName: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Cấp bậc</label><input type="text" className="w-full border p-2 rounded-lg text-sm" value={profileData.rank} onChange={e => setProfileData({...profileData, rank: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Chức vụ</label><input type="text" className="w-full border p-2 rounded-lg text-sm" value={profileData.position} onChange={e => setProfileData({...profileData, position: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Email</label><input type="email" className="w-full border p-2 rounded-lg text-sm font-mono" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Số điện thoại</label><input type="tel" className="w-full border p-2 rounded-lg text-sm font-mono" value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} /></div>
              </div>
              <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => setShowProfileModal(false)} className="px-5 py-2 text-sm font-bold text-gray-500">Hủy</button><button type="submit" className="px-8 py-2 bg-military-700 text-white rounded-lg font-black uppercase text-xs shadow-lg hover:bg-military-800 transition-all">Lưu</button></div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-red-800 p-5 flex justify-between items-center text-white"><h3 className="font-bold uppercase flex items-center gap-2 text-sm"><Key size={20}/> Đổi mật khẩu</h3><button onClick={() => setShowPasswordModal(false)}><X size={20}/></button></div>
            <div className="p-8 space-y-4">
               <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Mật khẩu mới</label><input type="password" className="w-full border p-2 rounded-lg" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
               <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Xác nhận</label><input type="password" className="w-full border p-2 rounded-lg" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
               <button onClick={async () => { if (newPassword !== confirmPassword) { alert("Mật khẩu không khớp!"); return; } if (await api.updateUser(user!.username, { password: newPassword })) { alert("Đã đổi mật khẩu!"); setShowPasswordModal(false); setNewPassword(''); setConfirmPassword(''); } }} className="w-full py-3 bg-red-700 text-white rounded-xl font-black uppercase text-xs shadow-lg mt-4" >Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
