
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Users, FileCheck, Menu, ShieldAlert, LogOut, Key, X, HelpCircle, CalendarDays, 
  Wifi, WifiOff, UserCog, Check, Phone, Mail, Lock, Unlock, BellRing, FileText, Download, 
  Trash2, Plus, File, Book, Scale, ScrollText, MessageSquare, RefreshCw, UserPlus, Reply, History, Search, Filter,
  Award, Briefcase, User as UserIcon, Settings, UserCircle, AlertTriangle, Info, CheckCircle2
} from 'lucide-react';
import { Recruit, User, ResearchDocument, RecruitmentStatus, Feedback } from './types';
import { MOCK_USERS, LOCATION_DATA, PROVINCES_VN, generateUnitUsername, removeVietnameseTones } from './constants';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  // Profile State
  const [profileData, setProfileData] = useState({
      personalName: '',
      rank: '',
      position: '',
      email: '',
      phoneNumber: ''
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassMsg, setChangePassMsg] = useState('');
  
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [adminUpdateTrigger, setAdminUpdateTrigger] = useState(0);

  useEffect(() => {
      const savedDocs = localStorage.getItem('military_documents');
      if (savedDocs) setDocuments(JSON.parse(savedDocs));
  }, []);

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

  useEffect(() => {
    const fetchData = async () => {
      if (user && sessionYear) {
        setIsLoading(true);
        const data = await api.getRecruits();
        if (data !== null) { setRecruits(data); setIsOnline(true); } 
        else { setRecruits([]); setIsOnline(false); }
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, sessionYear]);

  const handleNavigate = (tabId: string) => {
      setActiveRecruitSubTab(tabId);
      setActiveTab('recruits');
      setIsMobileMenuOpen(false);
  };

  const handleUpdateRecruit = async (updatedRecruit: Recruit) => {
    const oldRecruits = [...recruits];
    const exists = recruits.find(r => r.id === updatedRecruit.id);
    setRecruits(prev => exists ? prev.map(r => r.id === updatedRecruit.id ? updatedRecruit : r) : [...prev, updatedRecruit]);
    let result = exists ? await api.updateRecruit(updatedRecruit) : await api.createRecruit(updatedRecruit);
    if (!result) { alert("Lỗi kết nối Server!"); setRecruits(oldRecruits); setIsOnline(false); } else { setIsOnline(true); }
  };

  const handleDeleteRecruit = async (id: string) => {
      if (await api.deleteRecruit(id)) { setRecruits(prev => prev.filter(r => r.id !== id)); setIsOnline(true); } 
      else { alert("Lỗi kết nối!"); setIsOnline(false); }
  };

  const handleLogout = () => { setUser(null); setSessionYear(null); setActiveTab('dashboard'); };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setChangePassMsg("Mật khẩu xác nhận không khớp!"); return; }
    const savedUsers = JSON.parse(localStorage.getItem('military_users') || '[]');
    const updatedUsers = savedUsers.map((u: User) => u.username === user?.username ? { ...u, password: newPassword } : u);
    localStorage.setItem('military_users', JSON.stringify(updatedUsers));
    if (user) setUser({ ...user, password: newPassword });
    setChangePassMsg("Đổi mật khẩu thành công!");
    setTimeout(() => { setShowPasswordModal(false); setNewPassword(''); setConfirmPassword(''); setChangePassMsg(''); }, 2000);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
      e.preventDefault();
      const savedUsers = JSON.parse(localStorage.getItem('military_users') || '[]');
      const updatedUsers = savedUsers.map((u: User) => 
          u.username === user?.username 
          ? { ...u, ...profileData } 
          : u
      );
      localStorage.setItem('military_users', JSON.stringify(updatedUsers));
      if (user) setUser({ ...user, ...profileData });
      alert("Cập nhật hồ sơ cán bộ thành công!");
      setShowProfileModal(false);
  };

  const AdminPanel = () => {
      const [allActiveUsers, setAllActiveUsers] = useState<User[]>(JSON.parse(localStorage.getItem('military_users') || '[]'));
      const [adminSearch, setAdminSearch] = useState('');
      const [adminProvinceFilter, setAdminProvinceFilter] = useState('');

      const refreshUsers = () => {
          setAllActiveUsers(JSON.parse(localStorage.getItem('military_users') || '[]'));
          setAdminUpdateTrigger(prev => prev + 1);
      };

      const allPossibleUnitAccounts = useMemo(() => {
          const accounts: User[] = [];
          const activeMap = new Map();
          allActiveUsers.forEach(u => activeMap.set(u.username, u));

          // 1. Tài khoản cấp Tỉnh
          PROVINCES_VN.forEach(p => {
              const uName = generateUnitUsername(p, '', 'PROVINCE');
              if (activeMap.has(uName)) accounts.push(activeMap.get(uName));
              else accounts.push({ username: uName, password: '1', fullName: `Bộ CHQS Tỉnh ${p}`, role: 'PROVINCE_ADMIN', unit: { province: p, commune: '' }, isLocked: true });
          });

          // 2. Tài khoản cấp Xã
          Object.keys(LOCATION_DATA).forEach(p => {
              // @ts-ignore
              Object.keys(LOCATION_DATA[p]).forEach(c => {
                  ['1', '2'].forEach(type => {
                      const uName = generateUnitUsername(p, c, type as '1' | '2');
                      if (activeMap.has(uName)) accounts.push(activeMap.get(uName));
                      else accounts.push({ username: uName, password: '1', fullName: `Ban CHQS ${c} (TK ${type})`, role: type === '1' ? 'EDITOR' : 'VIEWER', unit: { province: p, commune: c }, isLocked: true });
                  });
              });
          });

          let filtered = accounts;
          
          // Lọc theo tỉnh
          if (adminProvinceFilter) {
              filtered = filtered.filter(a => a.unit.province === adminProvinceFilter);
          }
          
          // Lọc theo từ khóa tìm kiếm (Sửa lỗi tìm kiếm)
          if (adminSearch) {
              const s = removeVietnameseTones(adminSearch.toLowerCase());
              filtered = filtered.filter(a => {
                  const uName = a.username.toLowerCase();
                  const fName = removeVietnameseTones(a.fullName.toLowerCase());
                  const pName = a.personalName ? removeVietnameseTones(a.personalName.toLowerCase()) : '';
                  return uName.includes(s) || fName.includes(s) || pName.includes(s);
              });
          }

          // CHỐNG TRÙNG LẶP: Đảm bảo mỗi username chỉ xuất hiện 1 lần duy nhất trong danh sách hiển thị
          const uniqueAccounts: User[] = [];
          const seenUsernames = new Set();
          filtered.forEach(acc => {
              if (!seenUsernames.has(acc.username)) {
                  uniqueAccounts.push(acc);
                  seenUsernames.add(acc.username);
              }
          });

          return uniqueAccounts;
      }, [allActiveUsers, adminProvinceFilter, adminSearch]);

      const adminStats = useMemo(() => {
          const total = allPossibleUnitAccounts.length;
          const open = allPossibleUnitAccounts.filter(u => !u.isLocked).length;
          const locked = total - open;
          return { total, open, locked };
      }, [allPossibleUnitAccounts]);

      const toggleLockUser = (u: User) => {
          if (u.username === 'ADMIN') return;
          const users = JSON.parse(localStorage.getItem('military_users') || '[]');
          const idx = users.findIndex((user: User) => user.username === u.username);
          if (idx !== -1) {
              users[idx].isLocked = !u.isLocked;
          } else {
              // Nếu chưa có trong DB local, thêm mới với trạng thái ngược lại của u hiện tại
              users.push({ ...u, isLocked: !u.isLocked }); 
          }
          localStorage.setItem('military_users', JSON.stringify(users));
          refreshUsers();
      };

      const resetUserPassword = (u: User) => {
          const newPass = prompt(`Đặt lại mật khẩu cho ${u.username}:`, "1");
          if (newPass) {
              const users = JSON.parse(localStorage.getItem('military_users') || '[]');
              const idx = users.findIndex((user: User) => user.username === u.username);
              if (idx !== -1) users[idx].password = newPass;
              else users.push({ ...u, password: newPass });
              localStorage.setItem('military_users', JSON.stringify(users));
              refreshUsers();
              alert("Đã đặt lại mật khẩu thành mật khẩu mặc định (1).");
          }
      };

      return (
          <div className="space-y-6 m-6 animate-in fade-in duration-500">
              {/* ADMIN STATISTICS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                      <div className="p-3 bg-military-100 rounded-lg text-military-700">
                          <Users size={28} />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng số đơn vị</p>
                          <p className="text-2xl font-black text-gray-900 leading-none mt-1">{adminStats.total}</p>
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 border-l-4 border-l-green-500">
                      <div className="p-3 bg-green-50 rounded-lg text-green-600">
                          <CheckCircle2 size={28} />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đã mở tài khoản</p>
                          <p className="text-2xl font-black text-green-700 leading-none mt-1">{adminStats.open}</p>
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 border-l-4 border-l-red-500">
                      <div className="p-3 bg-red-50 rounded-lg text-red-600">
                          <Lock size={28} />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chưa mở (Đang khóa)</p>
                          <p className="text-2xl font-black text-red-700 leading-none mt-1">{adminStats.locked}</p>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-military-700 flex items-center gap-2"><Settings className="text-military-600" /> Hệ thống Quản trị Master</h2>
                            <p className="text-xs text-gray-500 mt-1">Phê duyệt và kích hoạt tài khoản cán bộ tại các địa phương</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-6 items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm bg-white focus:ring-2 focus:ring-military-500 outline-none" 
                                placeholder="Tìm tên đơn vị, tên cán bộ hoặc username..." 
                                value={adminSearch} 
                                onChange={e => setAdminSearch(e.target.value)} 
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Lọc theo:</span>
                            <select className="border p-2 rounded-md text-sm bg-white min-w-[200px]" value={adminProvinceFilter} onChange={e => setAdminProvinceFilter(e.target.value)}>
                                <option value="">Tất cả Tỉnh/Thành</option>
                                {PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <button 
                            onClick={() => { setAdminSearch(''); setAdminProvinceFilter(''); }}
                            className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
                            title="Làm mới bộ lọc"
                        >
                            <RefreshCw size={18}/>
                        </button>
                    </div>

                    <div className="overflow-x-auto border rounded-xl max-h-[650px] overflow-y-auto custom-scrollbar shadow-inner">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-military-900 text-military-100 uppercase text-[10px] font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 border-b border-military-800">Cơ quan / Tài khoản</th>
                                    <th className="p-4 border-b border-military-800">Thông tin cán bộ phụ trách</th>
                                    <th className="p-4 border-b border-military-800 text-center">Tình trạng</th>
                                    <th className="p-4 border-b border-military-800 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {allPossibleUnitAccounts.slice(0, 500).map(u => (
                                    <tr key={u.username} className={`hover:bg-military-50 transition-colors ${u.isLocked ? 'bg-red-50/20' : ''}`}>
                                        <td className="p-4">
                                            <div className="font-bold text-military-800 text-sm leading-snug">{u.fullName}</div>
                                            <div className="text-[10px] font-mono text-gray-500 mt-1 flex items-center gap-1.5 uppercase tracking-tighter">
                                               <span className="bg-gray-100 px-1.5 py-0.5 rounded border">{u.username}</span>
                                               <span className="text-military-400">|</span>
                                               <span className={u.role === 'PROVINCE_ADMIN' ? 'text-red-600 font-bold' : 'text-blue-600 font-bold'}>
                                                  {u.role === 'PROVINCE_ADMIN' ? 'BỘ CHQS TỈNH' : (u.role === 'VIEWER' ? 'BAN CHQS - TK CHỈ HUY' : 'BAN CHQS - TK NHẬP LIỆU')}
                                               </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {u.personalName ? (
                                                <div className="space-y-1">
                                                    <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase">
                                                        <Award size={12} className="text-amber-500"/> {u.rank || '--'} {u.personalName}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium italic">{u.position}</div>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        {u.phoneNumber && <span className="flex items-center gap-1 text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm text-blue-700 font-bold"><Phone size={10}/> {u.phoneNumber}</span>}
                                                        {u.email && <span className="flex items-center gap-1 text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm text-gray-600"><Mail size={10}/> {u.email}</span>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 italic">
                                                    <AlertTriangle size={12}/> Đơn vị chưa cập nhật hồ sơ cán bộ
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {u.isLocked ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold border border-red-200 shadow-sm uppercase tracking-wider">
                                                    <Lock size={12}/> Đang khóa
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200 shadow-sm uppercase tracking-wider">
                                                    <Check size={12}/> Đã duyệt
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => toggleLockUser(u)} 
                                                    title={u.isLocked ? "Mở khóa và cấp quyền truy cập" : "Khóa tài khoản này"}
                                                    className={`p-2 rounded-lg shadow-sm transition-all transform active:scale-90 ${u.isLocked ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                                >
                                                    {u.isLocked ? <Unlock size={16}/> : <Lock size={16}/>}
                                                </button>
                                                <button 
                                                    onClick={() => resetUserPassword(u)} 
                                                    title="Đặt lại mật khẩu mặc định (1)"
                                                    className="p-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition-all transform active:scale-90"
                                                >
                                                    <RefreshCw size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {allPossibleUnitAccounts.length > 500 && <div className="p-6 text-center text-gray-400 italic text-xs bg-gray-50 border-t">Chỉ hiển thị 500 kết quả đầu tiên. Vui lòng sử dụng bộ lọc Tỉnh/Thành hoặc Ô tìm kiếm.</div>}
                    </div>
              </div>
          </div>
      )
  };

  const DocumentsPanel = () => (
      <div className="p-6 m-6 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px]">
          <h2 className="text-xl font-bold text-military-700 mb-6 flex items-center gap-2"><FileText /> Tài liệu & Văn bản Pháp luật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{documents.map(doc => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md bg-gray-50 flex flex-col justify-between transition-all">
                  <div className="flex items-start gap-3 mb-3"><div className="p-2 bg-gray-200 rounded shrink-0"><File size={24} /></div><div><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 uppercase mb-1 inline-block">{doc.category}</span><h4 className="font-bold text-gray-800 text-sm leading-tight">{doc.title}</h4><p className="text-xs text-gray-500 mt-1">{doc.uploadDate}</p></div></div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="w-full mt-2 py-2 bg-white border border-gray-300 rounded text-center text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors"><Download size={14} /> Tải về ({doc.fileType})</a>
              </div>
          ))}</div>
      </div>
  );

  if (!user) return <Login onLogin={setUser} />;
  if (!sessionYear) return <YearSelection onSelectYear={setSessionYear} currentUser={user} />;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      
      <aside className={`fixed md:relative inset-y-0 left-0 z-40 bg-military-900 text-white shadow-2xl transition-all duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} ${isSidebarOpen ? 'md:w-64' : 'md:w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-military-800 h-16">
            <span className="font-bold text-lg tracking-wider text-military-100 flex items-center gap-2">
                <ShieldAlert className="text-amber-500" /> 
                {isSidebarOpen && <span className="text-sm font-black uppercase">Tuyển quân</span>}
            </span>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="hidden md:block p-2 rounded text-military-200 hover:bg-military-800"><Menu size={20} /></button>
        </div>
        
        <nav className="flex-1 py-6 px-2 space-y-2 overflow-y-auto custom-scrollbar">
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-white text-military-900 font-bold shadow-md scale-[1.02]' : 'text-military-200 hover:bg-military-800'}`}><LayoutDashboard size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">Tổng quan</span>}</button>
          <button onClick={() => { setActiveTab('recruits'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'recruits' ? 'bg-white text-military-900 font-bold shadow-md scale-[1.02]' : 'text-military-200 hover:bg-military-800'}`}><Users size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">Hồ sơ công dân</span>}</button>
          <button onClick={() => { setActiveTab('documents'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'documents' ? 'bg-white text-military-900 font-bold shadow-md scale-[1.02]' : 'text-military-200 hover:bg-military-800'}`}><FileText size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">Văn bản</span>}</button>
          {user.role === 'ADMIN' && (
              <button onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'admin' ? 'bg-white text-military-900 font-bold shadow-md scale-[1.02]' : 'text-military-200 hover:bg-military-800 border-t border-military-800 pt-4'}`}>
                  <Settings size={20} className="text-amber-500" />
                  {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">Quản trị Master</span>}
              </button>
          )}
        </nav>

        <div className="p-4 border-t border-military-800 space-y-2 bg-military-950/30">
             <button onClick={() => setShowSupportModal(true)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-military-200 hover:bg-military-800 transition-colors group">
                 <HelpCircle size={18} className="group-hover:text-cyan-400" />{isSidebarOpen && <span className="text-[10px] font-bold uppercase">Hỗ trợ kỹ thuật</span>}
             </button>
             <button onClick={() => setShowProfileModal(true)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-military-200 hover:bg-military-800 transition-colors group"><UserCircle size={18} className="group-hover:text-blue-400" />{isSidebarOpen && <span className="text-[10px] font-bold uppercase">Hồ sơ cán bộ</span>}</button>
             <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-military-200 hover:bg-military-800 transition-colors group"><Key size={18} className="group-hover:text-amber-400" />{isSidebarOpen && <span className="text-[10px] font-bold uppercase">Đổi mật khẩu</span>}</button>
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-300 hover:bg-red-900/30 transition-colors group"><LogOut size={18} className="group-hover:text-red-400" />{isSidebarOpen && <span className="text-[10px] font-bold uppercase">Đăng xuất</span>}</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 h-full relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"><Menu size={24} /></button>
              <h1 className="text-lg font-black uppercase text-military-800 tracking-tight">
                  {activeTab === 'dashboard' ? `Phân tích dữ liệu Tuyển quân ${sessionYear}` : activeTab === 'admin' ? 'Quản trị Tài khoản Hệ thống' : activeTab === 'documents' ? 'Thư viện Văn bản & Pháp luật' : `Quản lý hồ sơ công dân ${sessionYear}`}
              </h1>
          </div>
          <div className="flex items-center gap-4">
              <button onClick={() => setSessionYear(null)} className="flex items-center gap-2 text-sm font-bold bg-military-50 text-military-700 px-3 py-1.5 rounded-md border border-military-200 hover:bg-military-100 transition-all shadow-sm">
                  <CalendarDays size={16}/> NĂM {sessionYear}
              </button>
              <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                  <div className="w-9 h-9 rounded-lg bg-military-700 flex items-center justify-center text-white font-bold text-xs shadow-md border border-military-600">
                      {user.username.substring(0,2).toUpperCase()}
                  </div>
                  <div className="text-[11px] hidden lg:block leading-tight">
                      <p className="font-black text-gray-900 uppercase tracking-tighter">{user.fullName}</p>
                      <p className="text-gray-500 font-medium">{user.personalName ? `${user.rank || ''} ${user.personalName}` : 'Cán bộ chưa định danh'}</p>
                  </div>
              </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
            {activeTab === 'dashboard' && <Dashboard recruits={recruits} onNavigate={handleNavigate} sessionYear={sessionYear} userRole={user.role} userUnit={user.unit} />}
            {activeTab === 'recruits' && <RecruitManagement user={user} recruits={recruits} onUpdate={handleUpdateRecruit} onDelete={handleDeleteRecruit} initialTab={activeRecruitSubTab} onTabChange={setActiveRecruitSubTab} sessionYear={sessionYear} />}
            {activeTab === 'admin' && <AdminPanel />}
            {activeTab === 'documents' && <DocumentsPanel />}
        </div>
      </main>

      {/* MODAL CẬP NHẬT HỒ SƠ CÁN BỘ ĐỊA PHƯƠNG */}
      {showProfileModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
                  <div className="bg-military-800 p-5 flex justify-between items-center text-white">
                      <h3 className="font-bold uppercase tracking-wide flex items-center gap-2 text-sm"><UserCircle size={20} className="text-blue-400"/> Cập nhật hồ sơ cán bộ phụ trách</h3>
                      <button onClick={() => setShowProfileModal(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="p-6 space-y-5 bg-white">
                      <div className="bg-amber-50 p-4 rounded-lg text-[11px] text-amber-800 leading-relaxed border border-amber-200 mb-2 flex items-start gap-3">
                         <Info size={24} className="shrink-0 mt-0.5 text-amber-600"/>
                         <p>Thông tin này vô cùng quan trọng để Master Admin nhận diện đơn vị và hỗ trợ kịp thời khi có yêu cầu phê duyệt hoặc xử lý sự cố. Vui lòng cung cấp chính xác.</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Họ và tên cán bộ</label>
                              <input type="text" required className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-military-500 outline-none text-sm transition-all" value={profileData.personalName} onChange={e => setProfileData({...profileData, personalName: e.target.value})} placeholder="VD: Nguyễn Văn A" />
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Cấp bậc quân hàm</label>
                              <select className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-military-500 outline-none text-sm bg-white cursor-pointer" value={profileData.rank} onChange={e => setProfileData({...profileData, rank: e.target.value})}>
                                  <option value="">-- Chọn --</option>
                                  <option value="Thượng úy">Thượng úy</option>
                                  <option value="Đại úy">Đại úy</option>
                                  <option value="Thiếu tá">Thiếu tá</option>
                                  <option value="Trung tá">Trung tá</option>
                                  <option value="Thượng tá">Thượng tá</option>
                                  <option value="Đại tá">Đại tá</option>
                                  <option value="QNCN">QNCN</option>
                                  <option value="Khác">Khác / Công chức</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Chức vụ tại đơn vị</label>
                          <input type="text" required className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-military-500 outline-none text-sm" value={profileData.position} onChange={e => setProfileData({...profileData, position: e.target.value})} placeholder="VD: Chỉ huy trưởng, Trợ lý Tuyển quân..." />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Số điện thoại liên hệ</label>
                              <input type="tel" required className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-military-500 outline-none text-sm font-mono" value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} placeholder="09xxxxxxxx" />
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Địa chỉ Email</label>
                              <input type="email" className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-military-500 outline-none text-sm" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} placeholder="canbo@gmail.com" />
                          </div>
                      </div>

                      <div className="pt-6 border-t flex justify-end gap-3">
                          <button type="button" onClick={() => setShowProfileModal(false)} className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-md transition-all uppercase tracking-widest">Hủy bỏ</button>
                          <button type="submit" className="px-7 py-2.5 bg-military-700 text-white rounded-md font-black hover:bg-military-800 shadow-xl transition-all flex items-center gap-2 transform active:scale-95 uppercase text-xs tracking-wider">
                              <Check size={18}/> Lưu hồ sơ
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
                <div className="bg-amber-600 p-5 text-white font-bold flex justify-between items-center">
                    <h3 className="uppercase tracking-widest flex items-center gap-2 text-sm"><Key size={20}/> Đổi mật khẩu đăng nhập</h3>
                    <button onClick={() => setShowPasswordModal(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={20}/></button>
                </div>
                <div className="p-6">
                    {changePassMsg ? (
                        <div className="bg-green-50 text-green-700 font-bold py-10 text-center rounded-lg border border-green-200 animate-in zoom-in duration-300">
                            <Check className="mx-auto mb-3 bg-green-500 text-white p-2 rounded-full" size={40}/> 
                            <p className="text-sm uppercase tracking-wide">{changePassMsg}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-tight">Mật khẩu mới</label>
                                <input type="password" required className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-amber-500 outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-tight">Nhập lại mật khẩu</label>
                                <input type="password" required className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-amber-500 outline-none" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-5 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-100 rounded-md">Hủy</button>
                                <button type="submit" className="px-7 py-2 bg-amber-600 text-white rounded-md font-black shadow-lg transition-all hover:bg-amber-700 uppercase text-xs tracking-widest transform active:scale-95">Xác nhận</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
      )}

      {showSupportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100">
                <button onClick={() => setShowSupportModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"><X size={20}/></button>
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="p-4 bg-cyan-50 rounded-2xl text-cyan-600 mb-4 shadow-inner"><HelpCircle size={48}/></div>
                    <h3 className="text-xl font-black text-military-800 uppercase tracking-tighter">Hỗ trợ kỹ thuật & Vận hành</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium italic">Vui lòng liên hệ tác giả khi cần phê duyệt tài khoản hoặc gặp lỗi hệ thống</p>
                </div>
                <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                        <div className="p-2 bg-military-800 rounded-lg text-amber-400"><Award size={24}/></div>
                        <div className="text-left">
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Chủ nhiệm đề tài / Tác giả</p>
                            <p className="font-bold text-military-800 text-base">Đại úy Thới Hạ Sang</p>
                        </div>
                    </div>
                    <div className="space-y-3 pt-2 text-left">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-blue-100 rounded text-blue-700"><Phone size={16}/></div>
                            <div>
                                <p className="text-[9px] uppercase font-bold text-gray-400">Điện thoại / Zalo</p>
                                <p className="font-black text-blue-800 text-base">0334 429 954</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-red-100 rounded text-red-700"><Mail size={16}/></div>
                            <div>
                                <p className="text-[9px] uppercase font-bold text-gray-400">Địa chỉ Email</p>
                                <p className="font-bold text-gray-700 text-sm">thoihasang@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowSupportModal(false)} className="w-full py-3.5 bg-military-800 text-white rounded-xl font-black hover:bg-military-900 shadow-xl transition-all transform active:scale-95 uppercase text-xs tracking-widest">Đã hiểu</button>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
