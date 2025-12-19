
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, Menu, ShieldAlert, LogOut, Key, X, HelpCircle, CalendarDays, 
  UserCircle, Settings, Check, Phone, Mail, Award, Info, Lock, Unlock, RefreshCw, 
  CheckCircle2, Search, FileText, Download, File, AlertTriangle, Paperclip, Trash2, 
  PlusCircle, FilePlus, ChevronRight, Bookmark
} from 'lucide-react';
import { Recruit, User, ResearchDocument, RecruitmentStatus } from './types';
import { LOCATION_DATA, PROVINCES_VN, generateUnitUsername, removeVietnameseTones } from './constants';
import Dashboard from './views/Dashboard';
import RecruitManagement from './views/RecruitManagement';
import Login from './views/Login';
import YearSelection from './views/YearSelection';
import { api } from './api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionYear, setSessionYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recruits' | 'admin' | 'documents'>('dashboard');
  const [activeRecruitSubTab, setActiveRecruitSubTab] = useState<string>('ALL');
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  
  const [profileData, setProfileData] = useState({ personalName: '', rank: '', position: '', email: '', phoneNumber: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassMsg, setChangePassMsg] = useState('');

  // 1. Fetch Data
  useEffect(() => {
    if (user && sessionYear) {
      setIsLoading(true);
      Promise.all([api.getRecruits(), api.getDocuments()]).then(([rData, dData]) => {
        if (rData) setRecruits(rData);
        if (dData) setDocuments(dData);
        setIsLoading(false);
      });
    }
  }, [user, sessionYear]);

  useEffect(() => {
    if (user) {
        setProfileData({
            personalName: user.personalName || '', rank: user.rank || '',
            position: user.position || '', email: user.email || '', phoneNumber: user.phoneNumber || ''
        });
    }
  }, [user]);

  // 2. Handlers
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

  const handleLogout = () => { setUser(null); setSessionYear(null); setActiveTab('dashboard'); };

  // --- DOCUMENTS PANEL ---
  const DocumentsPanel = () => {
      const handleAddDoc = async (e: React.FormEvent) => {
          e.preventDefault();
          const target = e.target as any;
          const file = target.docFile.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = async (ev) => {
              const newDoc = {
                  title: target.docTitle.value,
                  category: target.docCat.value,
                  fileType: 'PDF',
                  url: ev.target?.result as string,
                  uploadDate: new Date().toLocaleDateString('vi-VN'),
                  description: target.docDesc.value
              };
              const res = await api.createDocument(newDoc);
              if (res) {
                  setDocuments([res, ...documents]);
                  setShowDocModal(false);
              }
          };
          reader.readAsDataURL(file);
      };

      const deleteDoc = async (id: string) => {
          if (window.confirm("Xóa tài liệu này?") && await api.deleteDocument(id)) {
              setDocuments(documents.filter(d => d.id !== id && (d as any)._id !== id));
          }
      };

      return (
          <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div>
                      <h2 className="text-xl font-bold text-military-800 flex items-center gap-2"><FileText className="text-military-600"/> Thư viện Văn bản pháp quy</h2>
                      <p className="text-xs text-gray-500 mt-1">Văn bản, hướng dẫn và các mẫu biểu dùng chung toàn hệ thống</p>
                  </div>
                  {user?.role === 'ADMIN' && (
                      <button onClick={() => setShowDocModal(true)} className="flex items-center gap-2 bg-military-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-military-800 transition-all">
                          <PlusCircle size={18}/> Thêm văn bản
                      </button>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc: any) => (
                      <div key={doc._id || doc.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all group relative border-l-4 border-l-military-600">
                          <div className="flex items-start gap-4 mb-4">
                              <div className="p-3 bg-military-50 rounded-xl text-military-700 group-hover:bg-military-700 group-hover:text-white transition-colors">
                                  <File size={24} />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-military-100 text-military-800 uppercase mb-1.5 inline-block border border-military-200">
                                      {doc.category === 'LUAT' ? 'Luật' : doc.category === 'THONG_TU' ? 'Thông tư' : 'Hướng dẫn'}
                                  </span>
                                  <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2" title={doc.title}>{doc.title}</h4>
                                  <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><CalendarDays size={10}/> Cập nhật: {doc.uploadDate}</p>
                              </div>
                          </div>
                          
                          {doc.description && <p className="text-xs text-gray-500 italic mb-4 line-clamp-2">{doc.description}</p>}
                          
                          <div className="flex gap-2">
                              <a href={doc.url} download={doc.title} className="flex-1 py-2 bg-gray-100 border border-gray-200 rounded-lg text-center text-xs font-black text-military-700 hover:bg-military-700 hover:text-white hover:border-military-700 flex items-center justify-center gap-2 transition-all">
                                  <Download size={14} /> TẢI VỀ
                              </a>
                              {user?.role === 'ADMIN' && (
                                  <button onClick={() => deleteDoc(doc._id || doc.id)} className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-600 hover:text-white transition-all">
                                      <Trash2 size={16}/>
                                  </button>
                              )}
                          </div>
                      </div>
                  ))}
                  {documents.length === 0 && (
                      <div className="col-span-full py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 text-center text-gray-400">
                          <FileText size={48} className="mx-auto mb-3 opacity-20"/>
                          <p className="font-bold">Hiện chưa có văn bản nào được cập nhật</p>
                      </div>
                  )}
              </div>

              {/* MODAL THÊM VĂN BẢN */}
              {showDocModal && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
                          <div className="bg-military-800 p-5 flex justify-between items-center text-white">
                              <h3 className="font-bold uppercase flex items-center gap-2 text-sm"><FilePlus size={20}/> Tải lên văn bản mới</h3>
                              <button onClick={() => setShowDocModal(false)}><X size={20}/></button>
                          </div>
                          <form onSubmit={handleAddDoc} className="p-6 space-y-4">
                              <div>
                                  <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Tiêu đề văn bản</label>
                                  <input name="docTitle" required type="text" className="w-full border p-2.5 rounded-lg text-sm" placeholder="VD: Luật Nghĩa vụ quân sự 2015..." />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Danh mục</label>
                                      <select name="docCat" className="w-full border p-2.5 rounded-lg text-sm">
                                          <option value="LUAT">Luật</option>
                                          <option value="NGHI_DINH">Nghị định</option>
                                          <option value="THONG_TU">Thông tư</option>
                                          <option value="HUONG_DAN">Hướng dẫn</option>
                                          <option value="KHAC">Khác</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Chọn File (PDF)</label>
                                      <input name="docFile" required type="file" accept=".pdf" className="w-full text-xs" />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Mô tả tóm tắt</label>
                                  <textarea name="docDesc" rows={3} className="w-full border p-2.5 rounded-lg text-sm" placeholder="Nội dung chính của văn bản..."></textarea>
                              </div>
                              <div className="pt-4 flex justify-end gap-3">
                                  <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Hủy</button>
                                  <button type="submit" className="px-6 py-2 bg-military-700 text-white rounded-lg font-black uppercase text-xs shadow-lg">Lưu và đăng tải</button>
                              </div>
                          </form>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  // --- ADMIN PANEL (Quản lý User) ---
  const AdminPanel = () => {
      const [allDbUsers, setAllDbUsers] = useState<User[]>([]);
      const [adminSearch, setAdminSearch] = useState('');
      const fetchUsers = () => api.getUsers().then(setAllDbUsers);
      useEffect(() => { fetchUsers(); }, []);

      const allPossibleUnitAccounts = useMemo(() => {
          const accounts: User[] = [];
          const dbMap = new Map();
          allDbUsers.forEach(u => dbMap.set(u.username, u));

          PROVINCES_VN.forEach(p => {
              const uName = generateUnitUsername(p, '', 'PROVINCE');
              accounts.push(dbMap.get(uName) || { username: uName, password: '1', fullName: `Bộ CHQS Tỉnh ${p}`, role: 'PROVINCE_ADMIN', unit: { province: p, commune: '' }, isLocked: true });
          });

          Object.keys(LOCATION_DATA).forEach(p => {
              // @ts-ignore
              Object.keys(LOCATION_DATA[p]).forEach(c => {
                  ['1', '2'].forEach(type => {
                      const uName = generateUnitUsername(p, c, type as '1' | '2');
                      accounts.push(dbMap.get(uName) || { username: uName, password: '1', fullName: `Ban CHQS ${c} (TK ${type})`, role: type === '1' ? 'EDITOR' : 'VIEWER', unit: { province: p, commune: c }, isLocked: true });
                  });
              });
          });

          let filtered = accounts;
          if (adminSearch) {
              const s = removeVietnameseTones(adminSearch.toLowerCase());
              filtered = filtered.filter(a => removeVietnameseTones(a.fullName.toLowerCase()).includes(s) || a.username.toLowerCase().includes(s));
          }
          return filtered.filter((v,i,a)=>a.findIndex(t=>(t.username === v.username))===i);
      }, [allDbUsers, adminSearch]);

      const toggleLock = async (u: User) => {
          if (u.username === 'ADMIN') return;
          if (await api.updateUser(u.username, { ...u, isLocked: !u.isLocked })) fetchUsers();
      };

      // TÍNH TOÁN THỐNG KÊ TÀI KHOẢN
      const accountStats = useMemo(() => {
          const total = allPossibleUnitAccounts.length;
          const active = allPossibleUnitAccounts.filter(u => !u.isLocked).length;
          const locked = allPossibleUnitAccounts.filter(u => u.isLocked).length;
          return { total, active, locked };
      }, [allPossibleUnitAccounts]);

      return (
          <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
              {/* THẺ THỐNG KÊ CHO ADMIN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
                      <div className="p-3 bg-military-100 rounded-lg text-military-700">
                          <Users size={28} />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Tổng số đơn vị</p>
                          <p className="text-2xl font-black text-gray-800">{accountStats.total}</p>
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-l-4 border-l-green-500 flex items-center gap-4 shadow-sm">
                      <div className="p-3 bg-green-50 rounded-lg text-green-600">
                          <Unlock size={28} />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Đang hoạt động</p>
                          <p className="text-2xl font-black text-green-700">{accountStats.active}</p>
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-l-4 border-l-red-500 flex items-center gap-4 shadow-sm">
                      <div className="p-3 bg-red-50 rounded-lg text-red-600">
                          <Lock size={28} />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Đang tạm khóa</p>
                          <p className="text-2xl font-black text-red-700">{accountStats.locked}</p>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                          <h2 className="text-xl font-bold text-military-800 flex items-center gap-2"><Settings className="text-military-600"/> Quản trị Master</h2>
                          <p className="text-xs text-gray-500">Quản lý kích hoạt tài khoản cán bộ tuyển quân địa phương</p>
                      </div>
                      <div className="relative w-full md:w-80">
                          <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                          <input 
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-military-500 transition-all outline-none" 
                            placeholder="Tìm tên đơn vị, tài khoản..." 
                            value={adminSearch} 
                            onChange={e => setAdminSearch(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-sm border-collapse">
                          <thead className="bg-military-900 text-white uppercase text-[10px] font-bold sticky top-0 z-10 shadow-sm">
                              <tr>
                                  <th className="p-4 border-b border-military-800">Đơn vị / Tài khoản</th>
                                  <th className="p-4 border-b border-military-800">Cán bộ phụ trách</th>
                                  <th className="p-4 border-b border-military-800 text-center">Trạng thái</th>
                                  <th className="p-4 border-b border-military-800 text-center">Thao tác</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                              {allPossibleUnitAccounts.slice(0, 300).map(u => (
                                  <tr key={u.username} className={`hover:bg-military-50/50 transition-colors ${u.isLocked ? 'bg-red-50/10' : ''}`}>
                                      <td className="p-4">
                                          <div className="font-bold text-military-800">{u.fullName}</div>
                                          <div className="text-[10px] font-mono text-gray-400 uppercase">{u.username}</div>
                                      </td>
                                      <td className="p-4">
                                          {u.personalName ? (
                                              <div className="space-y-0.5">
                                                  <div className="text-xs font-bold uppercase">{u.rank} {u.personalName}</div>
                                                  <div className="text-[10px] text-gray-500">{u.phoneNumber}</div>
                                              </div>
                                          ) : (
                                              <span className="text-[10px] text-gray-400 italic">Chưa định danh</span>
                                          )}
                                      </td>
                                      <td className="p-4 text-center">
                                          {u.isLocked ? (
                                              <span className="inline-flex px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">BỊ KHÓA</span>
                                          ) : (
                                              <span className="inline-flex px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">ĐÃ MỞ</span>
                                          )}
                                      </td>
                                      <td className="p-4 text-center">
                                          <button 
                                            onClick={() => toggleLock(u)} 
                                            className={`p-2 rounded-lg text-white shadow-md active:scale-95 transition-all ${u.isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                            title={u.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                          >
                                              {u.isLocked ? <Unlock size={16}/> : <Lock size={16}/>}
                                          </button>
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

  if (!user) return <Login onLogin={setUser} />;
  if (!sessionYear) return <YearSelection onSelectYear={setSessionYear} currentUser={user} />;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative">
      <aside className={`bg-military-900 text-white transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-military-800 h-16 shrink-0">
            <span className="font-bold flex items-center gap-2"><ShieldAlert className="text-amber-500" />{isSidebarOpen && <span className="text-sm font-black uppercase">Tuyển quân</span>}</span>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-military-800"><Menu size={20} /></button>
        </div>
        <nav className="flex-1 py-6 px-2 space-y-1.5 overflow-y-auto">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><LayoutDashboard size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Tổng quan</span>}</button>
          <button onClick={() => setActiveTab('recruits')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'recruits' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><Users size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Hồ sơ công dân</span>}</button>
          <button onClick={() => setActiveTab('documents')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'documents' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><FileText size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Văn bản</span>}</button>
          {user.role === 'ADMIN' && <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><Settings size={20} className="text-amber-500" />{isSidebarOpen && <span className="text-xs font-bold uppercase">Quản trị Master</span>}</button>}
        </nav>
        <div className="p-4 border-t border-military-800 space-y-2 bg-military-950/20 shrink-0">
             <button onClick={() => setShowSupportModal(true)} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-military-200 hover:bg-military-800"><HelpCircle size={18} />{isSidebarOpen && <span className="text-[10px] font-bold">HỖ TRỢ</span>}</button>
             <button onClick={() => setShowProfileModal(true)} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-military-200 hover:bg-military-800"><UserCircle size={18} />{isSidebarOpen && <span className="text-[10px] font-bold">HỒ SƠ</span>}</button>
             <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-military-200 hover:bg-military-800"><Key size={18} />{isSidebarOpen && <span className="text-[10px] font-bold">MẬT KHẨU</span>}</button>
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-300 hover:bg-red-900/30"><LogOut size={18} />{isSidebarOpen && <span className="text-[10px] font-bold">ĐĂNG XUẤT</span>}</button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <h1 className="text-lg font-black uppercase text-military-800 tracking-tight">
              {activeTab === 'dashboard' ? `Dữ liệu Tuyển quân ${sessionYear}` : activeTab === 'admin' ? 'Hệ thống Quản trị' : activeTab === 'documents' ? 'Thư viện Văn bản' : `Hồ sơ ${sessionYear}`}
          </h1>
          <div className="flex items-center gap-4">
              <button onClick={() => setSessionYear(null)} className="flex items-center gap-2 text-xs font-bold bg-military-50 text-military-700 px-3 py-1.5 rounded-lg border border-military-200">NĂM {sessionYear}</button>
              <div className="text-[10px] leading-tight text-right"><p className="font-black uppercase">{user.fullName}</p><p className="text-gray-500 font-medium">{user.personalName ? `${user.rank} ${user.personalName}` : 'Chưa định danh'}</p></div>
          </div>
        </header>
        <div className="flex-1 overflow-auto custom-scrollbar">
            {activeTab === 'dashboard' && <Dashboard recruits={recruits} onNavigate={(id) => {setActiveRecruitSubTab(id); setActiveTab('recruits');}} sessionYear={sessionYear} userRole={user.role} userUnit={user.unit} />}
            {activeTab === 'recruits' && <RecruitManagement user={user} recruits={recruits} onUpdate={handleUpdateRecruit} onDelete={(id) => api.deleteRecruit(id).then(() => setRecruits(prev => prev.filter(r => r.id !== id)))} initialTab={activeRecruitSubTab} onTabChange={setActiveRecruitSubTab} sessionYear={sessionYear} />}
            {activeTab === 'admin' && <AdminPanel />}
            {activeTab === 'documents' && <DocumentsPanel />}
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="bg-military-800 p-5 flex justify-between items-center text-white">
                      <h3 className="font-bold uppercase tracking-wide text-sm">Hồ sơ cán bộ phụ trách</h3>
                      <button onClick={() => setShowProfileModal(false)}><X size={20}/></button>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Họ và tên</label><input type="text" required className="w-full border border-gray-200 p-2.5 rounded-lg text-sm" value={profileData.personalName} onChange={e => setProfileData({...profileData, personalName: e.target.value})} /></div>
                          <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Cấp bậc</label><input type="text" required className="w-full border border-gray-200 p-2.5 rounded-lg text-sm" value={profileData.rank} onChange={e => setProfileData({...profileData, rank: e.target.value})} /></div>
                      </div>
                      <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Chức vụ</label><input type="text" required className="w-full border border-gray-200 p-2.5 rounded-lg text-sm" value={profileData.position} onChange={e => setProfileData({...profileData, position: e.target.value})} /></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Số điện thoại</label><input type="tel" required className="w-full border border-gray-200 p-2.5 rounded-lg text-sm" value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} /></div>
                          <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Email</label><input type="email" className="w-full border border-gray-200 p-2.5 rounded-lg text-sm" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} /></div>
                      </div>
                      <div className="pt-6 border-t flex justify-end gap-3">
                          <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Hủy</button>
                          <button type="submit" className="px-6 py-2 bg-military-700 text-white rounded-lg font-black uppercase text-xs shadow-xl">Lưu thông tin</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
                <button onClick={() => setShowSupportModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="p-4 bg-cyan-50 rounded-2xl text-cyan-600 mb-4 shadow-inner"><HelpCircle size={48}/></div>
                    <h3 className="text-xl font-black text-military-800 uppercase tracking-tighter">Hỗ trợ kỹ thuật & Vận hành</h3>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 text-left">
                    <div className="flex items-center gap-4 border-b pb-4"><div className="p-2 bg-military-800 rounded-xl text-amber-400 shadow-lg"><Award size={24}/></div><div><p className="text-[10px] uppercase font-black text-gray-400">Tác giả</p><p className="font-bold text-military-800">Đại úy Thới Hạ Sang</p></div></div>
                    <div className="flex items-center gap-3"><Phone size={16} className="text-blue-700"/><div><p className="text-[9px] uppercase font-bold text-gray-400">Zalo</p><p className="font-black text-blue-800">0334 429 954</p></div></div>
                    <div className="flex items-center gap-3"><Mail size={16} className="text-red-700"/><div><p className="text-[9px] uppercase font-bold text-gray-400">Email</p><p className="font-bold text-gray-700 text-sm">thoihasang@gmail.com</p></div></div>
                </div>
                <button onClick={() => setShowSupportModal(false)} className="w-full mt-6 py-3.5 bg-military-800 text-white rounded-xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Đã hiểu</button>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
