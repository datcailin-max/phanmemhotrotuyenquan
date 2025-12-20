
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, Menu, ShieldAlert, LogOut, Key, X, HelpCircle, CalendarDays, 
  UserCircle, Settings, Check, Phone, Mail, Award, Info, Lock, Unlock, RefreshCw, 
  CheckCircle2, Search, FileText, Download, File, AlertTriangle, Paperclip, Trash2, 
  PlusCircle, FilePlus, MessageSquare, Send, History, ChevronRight, Share2
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
  const [showDocModal, setShowDocModal] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  
  const [profileData, setProfileData] = useState({ personalName: '', rank: '', position: '', email: '', phoneNumber: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassMsg, setChangePassMsg] = useState('');

  // 1. Fetch Data
  useEffect(() => {
    if (user && sessionYear) {
      setIsLoading(true);
      Promise.all([api.getRecruits(), api.getDocuments(), api.getFeedbacks()]).then(([rData, dData, fData]) => {
        if (rData) {
            const processedRecruits = (rData as Recruit[]).map((r: Recruit) => {
                const birthYear = parseInt(r.dob?.split('-')[0] || '0');
                if (birthYear > 0) {
                    const age = sessionYear - birthYear;
                    if (age > 27 && r.status !== RecruitmentStatus.DELETED) {
                        const updated = { 
                            ...r, 
                            status: RecruitmentStatus.DELETED, 
                            previousStatus: r.status,
                            defermentReason: `Tự động chuyển: Hết tuổi nghĩa vụ (${age} tuổi)`
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

  // --- CHI TIẾT CÁC PANEL ---

  const QAPanel = () => {
      const [question, setQuestion] = useState('');
      const [cat, setCat] = useState<'HỎI ĐÁP' | 'GÓP Ý' | 'KHÁC'>('HỎI ĐÁP');
      const myFeedbacks = feedbacks.filter(f => f.username === user?.username);
      const handleSubmitQA = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!question.trim()) return;
          const res = await api.createFeedback({
              username: user?.username,
              unitName: user?.fullName,
              category: cat,
              content: question,
              isRead: false
          });
          if (res) { setFeedbacks([res, ...feedbacks]); setQuestion(''); alert("Đã gửi thắc mắc tới Master Admin!"); }
      };
      return (
          <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
              <div className="bg-white rounded-xl shadow-sm border p-6 h-fit">
                  <h3 className="text-lg font-bold text-military-800 flex items-center gap-2 mb-4 border-b pb-3 uppercase"><Send size={20} className="text-blue-600"/> Gửi thắc mắc / Góp ý</h3>
                  <form onSubmit={handleSubmitQA} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Loại yêu cầu</label>
                        <select className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 font-bold" value={cat} onChange={e => setCat(e.target.value as any)}>
                          <option value="HỎI ĐÁP">Hỏi đáp kỹ thuật</option>
                          <option value="GÓP Ý">Góp ý tính năng</option>
                          <option value="KHÁC">Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Nội dung câu hỏi</label>
                        <textarea required rows={5} className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-military-500 outline-none font-medium" placeholder="Mô tả chi tiết thắc mắc hoặc lỗi gặp phải..." value={question} onChange={e => setQuestion(e.target.value)} />
                      </div>
                      <button type="submit" className="w-full py-3 bg-military-700 text-white rounded-lg font-black uppercase text-xs shadow-lg hover:bg-military-800 transition-all flex items-center justify-center gap-2">
                        <Send size={16}/> Gửi yêu cầu ngay
                      </button>
                  </form>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col min-h-[500px]">
                  <h3 className="text-lg font-bold text-military-800 flex items-center gap-2 mb-4 border-b pb-3 uppercase"><History size={20} className="text-amber-500"/> Lịch sử thắc mắc & Trả lời</h3>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      {myFeedbacks.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 italic">Chưa có thắc mắc nào được gửi</div>
                      ) : myFeedbacks.map(f => (
                          <div key={f.id || (f as any)._id} className={`p-4 rounded-xl border-l-4 shadow-sm ${f.reply ? 'bg-green-50 border-l-green-500' : 'bg-gray-50 border-l-gray-300'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black px-2 py-0.5 bg-white border rounded-full uppercase text-gray-500">{f.category}</span>
                                <span className="text-[10px] text-gray-400 font-bold">{new Date((f as any).createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm font-bold text-gray-800 leading-snug">{f.content}</p>
                              {f.reply ? (
                                <div className="mt-3 pt-3 border-t border-green-200">
                                  <p className="text-[10px] font-black text-green-700 uppercase flex items-center gap-1 mb-1">
                                    <ShieldAlert size={12}/> Phản hồi từ Admin:
                                  </p>
                                  <p className="text-sm text-green-800 italic font-medium bg-white/50 p-2 rounded">{f.reply}</p>
                                </div>
                              ) : (
                                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-600 font-bold uppercase animate-pulse">
                                  <RefreshCw size={10}/> Đang chờ xử lý...
                                </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const AdminPanel = () => {
      const [allDbUsers, setAllDbUsers] = useState<User[]>([]);
      const [adminTab, setAdminTab] = useState<'USERS' | 'FEEDBACK'>('USERS');
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
              Object.keys(LOCATION_DATA[p]).forEach(c => {
                  ['1', '2'].forEach(type => {
                      const uName = generateUnitUsername(p, c, type as '1' | '2');
                      accounts.push(dbMap.get(uName) || { username: uName, password: '1', fullName: `Ban CHQS ${c}`, role: type === '1' ? 'EDITOR' : 'VIEWER', unit: { province: p, commune: c }, isLocked: true });
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

      const resetPass = async (u: User) => { 
        const np = prompt(`Nhập mật khẩu mới cho ${u.username}:`, "1"); 
        if (np && await api.updateUser(u.username, { ...u, password: np })) { fetchUsers(); alert("Đã cấp lại mật khẩu!"); } 
      };

      const handleReply = async (id: string) => { 
        const r = prompt("Nhập phản hồi cho đơn vị:"); 
        if (r) { 
          const res = await api.updateFeedback(id, { reply: r, isRead: true, replyTimestamp: Date.now() }); 
          if (res) setFeedbacks(feedbacks.map(f => (f.id === id || (f as any)._id === id) ? res : f)); 
        } 
      };

      const delFeedback = async (id: string) => { 
        if(window.confirm("Xóa phản hồi này?") && await api.deleteFeedback(id)) { 
          setFeedbacks(feedbacks.filter(f => f.id !== id && (f as any)._id !== id)); 
        } 
      };

      const accountStats = useMemo(() => ({ 
        total: allPossibleUnitAccounts.length, 
        active: allPossibleUnitAccounts.filter(u => !u.isLocked).length, 
        locked: allPossibleUnitAccounts.filter(u => u.isLocked).length 
      }), [allPossibleUnitAccounts]);

      return (
          <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
              <div className="flex bg-white rounded-xl shadow-sm border overflow-hidden p-1 w-fit">
                  <button onClick={() => setAdminTab('USERS')} className={`px-6 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-all ${adminTab === 'USERS' ? 'bg-military-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}><Users size={16}/> Tài khoản đơn vị</button>
                  <button onClick={() => setAdminTab('FEEDBACK')} className={`px-6 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-all ${adminTab === 'FEEDBACK' ? 'bg-military-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}><MessageSquare size={16}/> Phản hồi & Hỏi đáp {feedbacks.filter(f => !f.isRead).length > 0 && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">{feedbacks.filter(f => !f.isRead).length}</span>}</button>
              </div>

              {adminTab === 'USERS' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
                      <div className="p-3 bg-military-100 rounded-lg text-military-700"><Users size={28} /></div>
                      <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Tổng số đơn vị</p><p className="text-2xl font-black text-gray-800">{accountStats.total}</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-l-4 border-l-green-500 flex items-center gap-4 shadow-sm">
                      <div className="p-3 bg-green-50 rounded-lg text-green-600"><Unlock size={28} /></div>
                      <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Đang hoạt động</p><p className="text-2xl font-black text-green-700">{accountStats.active}</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-l-4 border-l-red-500 flex items-center gap-4 shadow-sm">
                      <div className="p-3 bg-red-50 rounded-lg text-red-600"><Lock size={28} /></div>
                      <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Đang tạm khóa</p><p className="text-2xl font-black text-red-700">{accountStats.locked}</p></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                      <h2 className="text-lg font-bold text-military-800 flex items-center gap-2"><Settings className="text-military-600"/> Quản lý Tài khoản</h2>
                      <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                        <input className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm font-medium" placeholder="Tìm tên đơn vị, tài khoản..." value={adminSearch} onChange={e => setAdminSearch(e.target.value)}/>
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-military-900 text-white uppercase text-[10px] font-bold sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="p-4">Đơn vị / Tài khoản</th>
                            <th className="p-4">Cán bộ phụ trách</th>
                            <th className="p-4 text-center">Trạng thái</th>
                            <th className="p-4 text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {allPossibleUnitAccounts.slice(0, 500).map(u => (
                            <tr key={u.username} className={`hover:bg-military-50/50 ${u.isLocked ? 'bg-red-50/5' : ''}`}>
                              <td className="p-4">
                                <div className="font-bold text-military-800">{u.fullName}</div>
                                <div className="text-[10px] font-mono text-gray-400 uppercase font-bold">{u.username}</div>
                              </td>
                              <td className="p-4">
                                {u.personalName ? (
                                  <div className="space-y-0.5">
                                    <div className="text-xs font-bold uppercase">{u.rank} {u.personalName}</div>
                                    <div className="text-[10px] text-gray-500 font-bold">{u.phoneNumber}</div>
                                  </div>
                                ) : <span className="text-[10px] text-gray-400 italic">Chưa cập nhật thông tin</span>}
                              </td>
                              <td className="p-4 text-center">
                                {u.isLocked ? (
                                  <span className="inline-flex px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">BỊ KHÓA</span>
                                ) : (
                                  <span className="inline-flex px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">ĐANG MỞ</span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex justify-center gap-2">
                                  <button onClick={() => toggleLock(u)} className={`p-2 rounded-lg text-white shadow-md transition-all hover:scale-110 ${u.isLocked ? 'bg-green-600' : 'bg-red-600'}`} title={u.isLocked ? "Mở khóa" : "Khóa"}>
                                    {u.isLocked ? <Unlock size={16}/> : <Lock size={16}/>}
                                  </button>
                                  <button onClick={() => resetPass(u)} className="p-2 rounded-lg bg-amber-500 text-white shadow-md transition-all hover:scale-110" title="Cấp lại mật khẩu">
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
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-5 border-b"><h2 className="text-lg font-bold text-military-800 flex items-center gap-2"><MessageSquare className="text-blue-600"/> Phản hồi từ các địa phương</h2></div>
                  <div className="divide-y overflow-y-auto max-h-[600px] custom-scrollbar">
                    {feedbacks.length === 0 ? (
                      <div className="p-10 text-center text-gray-400 italic">Chưa có yêu cầu nào</div>
                    ) : feedbacks.map((f: any) => (
                      <div key={f.id || f._id} className={`p-6 transition-all ${!f.isRead ? 'bg-blue-50/30' : 'bg-white'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${f.category === 'MẬT KHẨU' ? 'bg-red-600 text-white' : 'bg-military-100 text-military-800'}`}>{f.category}</span>
                            <div className="text-sm font-black text-military-800 uppercase">{f.unitName} <span className="text-xs font-mono text-gray-400 ml-2">({f.username})</span></div>
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold">{new Date(f.createdAt).toLocaleString()}</div>
                        </div>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100 shadow-sm mb-4 leading-relaxed font-medium">{f.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {f.reply ? (
                              <div className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 flex items-center gap-2">
                                <Check size={14}/> <b>Đã phản hồi:</b> {f.reply}
                              </div>
                            ) : (
                              <span className="text-[10px] font-black text-amber-600 uppercase border border-amber-200 px-2 py-1 rounded-md animate-pulse">Chưa trả lời</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleReply(f.id || f._id)} className="px-4 py-1.5 bg-military-700 text-white rounded-lg text-xs font-black shadow-md hover:bg-military-800 flex items-center gap-2 transition-all"><Send size={14}/> {f.reply ? 'Sửa' : 'Trả lời'}</button>
                            <button onClick={() => delFeedback(f.id || f._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
      );
  };

  const DocumentsPanel = () => {
    const handleAddDoc = async (e: React.FormEvent) => {
        e.preventDefault(); 
        const target = e.target as any; 
        const file = target.docFile.files[0]; 
        if (!file) return;

        // KIỂM TRA GIỚI HẠN MONGODB (16MB) - Base64 tăng 35% kích thước
        // Giới hạn an toàn là file gốc khoảng 11-12MB
        if (file.size > 12 * 1024 * 1024) {
            alert("LỖI: File quá lớn (" + (file.size / 1024 / 1024).toFixed(1) + "MB). \nMongoDB chỉ hỗ trợ lưu trữ tối đa 16MB cho mỗi bản ghi (bao gồm cả dữ liệu văn bản). \nVui lòng nén file PDF xuống dưới 12MB hoặc chia nhỏ file.");
            return;
        }

        setIsUploadingDoc(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const fileData = ev.target?.result as string;
            
            const newDoc = { 
              title: target.docTitle.value, 
              category: target.docCat.value, 
              fileType: 'PDF', 
              url: fileData, 
              uploadDate: new Date().toLocaleDateString('vi-VN'), 
              description: target.docDesc.value 
            };

            const res = await api.createDocument(newDoc); 
            setIsUploadingDoc(false);
            
            if (res) { 
                setDocuments([res, ...documents]); 
                setShowDocModal(false); 
                alert("Đã lưu văn bản thành công!");
            } else {
                alert("LỖI HỆ THỐNG: Không thể lưu file lên Database. \nCó thể do đường truyền hoặc cấu hình server bị chặn payload lớn. Thử lại với file nhỏ hơn.");
            }
        };
        reader.onerror = () => {
            setIsUploadingDoc(false);
            alert("Lỗi đọc file từ thiết bị.");
        };
        reader.readAsDataURL(file);
    };

    const deleteDoc = async (id: string) => { 
      if (window.confirm("Xóa tài liệu này?") && await api.deleteDocument(id)) 
        setDocuments(documents.filter(d => d.id !== id && (d as any)._id !== id)); 
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div><h2 className="text-xl font-bold text-military-800 flex items-center gap-2"><FileText className="text-military-600"/> Thư viện Văn bản pháp quy</h2><p className="text-xs text-gray-500 mt-1 font-medium">Dành cho địa phương nghiên cứu và triển khai</p></div>
              {user?.role === 'ADMIN' && <button onClick={() => setShowDocModal(true)} className="flex items-center gap-2 bg-military-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-military-800 transition-all"><PlusCircle size={18}/> Thêm văn bản</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc: any) => (
                <div key={doc._id || doc.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all group border-l-4 border-l-military-600">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-military-50 rounded-xl text-military-700 group-hover:bg-military-700 group-hover:text-white transition-colors"><File size={24} /></div>
                    <div className="flex-1 overflow-hidden">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-military-100 text-military-800 uppercase mb-1.5 inline-block">{doc.category}</span>
                      <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{doc.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-bold"><CalendarDays size={10}/> {doc.uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={doc.url} download={doc.title} className="flex-1 py-2 bg-gray-100 border border-gray-200 rounded-lg text-center text-xs font-black text-military-700 hover:bg-military-700 hover:text-white flex items-center justify-center gap-2 transition-all"><Download size={14} /> TẢI VỀ</a>
                    {user?.role === 'ADMIN' && <button onClick={() => deleteDoc(doc._id || doc.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button>}
                  </div>
                </div>
              ))}
            </div>
            {showDocModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
                  <div className="bg-military-800 p-5 flex justify-between items-center text-white"><h3 className="font-bold uppercase flex items-center gap-2 text-sm"><FilePlus size={20}/> Tải lên văn bản mới</h3><button onClick={() => setShowDocModal(false)}><X size={20}/></button></div>
                  <form onSubmit={handleAddDoc} className="p-6 space-y-4">
                    <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Tiêu đề văn bản</label><input name="docTitle" required type="text" className="w-full border p-2.5 rounded-lg text-sm font-bold" placeholder="VD: Luật Nghĩa vụ quân sự 2015" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Danh mục</label>
                        <select name="docCat" className="w-full border p-2.5 rounded-lg text-sm font-bold">
                          <option value="LUAT">Luật</option>
                          <option value="NGHI_DINH">Nghị định</option>
                          <option value="THONG_TU">Thông tư</option>
                          <option value="HUONG_DAN">Hướng dẫn</option>
                          <option value="QUYET_DINH">Quyết định</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Chọn File PDF</label>
                        <input name="docFile" required type="file" accept=".pdf" className="w-full text-xs font-bold" />
                        <p className="text-[9px] text-red-500 mt-1 italic font-bold">* Giới hạn tối đa 12MB/file (Yêu cầu MongoDB)</p>
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                      <button type="button" disabled={isUploadingDoc} onClick={() => setShowDocModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Hủy bỏ</button>
                      <button 
                        type="submit" 
                        disabled={isUploadingDoc}
                        className={`px-6 py-2 bg-military-700 text-white rounded-lg font-black uppercase text-xs shadow-md flex items-center gap-2 ${isUploadingDoc ? 'opacity-50 cursor-not-allowed' : 'hover:bg-military-800'}`}
                      >
                        {isUploadingDoc ? (
                            <><RefreshCw size={14} className="animate-spin" /> Đang gửi...</>
                        ) : (
                            'Lưu văn bản'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
        </div>
    );
  };

  if (!user) return <Login onLogin={setUser} />;
  if (!sessionYear) return <YearSelection onSelectYear={setSessionYear} currentUser={user} />;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden relative">
      <aside className={`bg-military-900 text-white transition-all duration-300 flex flex-col shadow-2xl z-20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-military-800 h-16 shrink-0">
            <span className="font-bold flex items-center gap-2"><ShieldAlert className="text-amber-500" />{isSidebarOpen && <span className="text-sm font-black uppercase tracking-tight">Tuyển Quân</span>}</span>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-military-800 transition-colors"><Menu size={20} /></button>
        </div>
        <nav className="flex-1 py-6 px-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><LayoutDashboard size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Tổng quan</span>}</button>
          <button onClick={() => setActiveTab('recruits')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'recruits' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><Users size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Hồ sơ công dân</span>}</button>
          
          <button onClick={() => setActiveTab('communication')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'communication' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><Share2 size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Báo cáo & Văn bản</span>}</button>
          
          <button onClick={() => setActiveTab('documents')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'documents' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><FileText size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Văn bản pháp quy</span>}</button>
          <button onClick={() => setActiveTab('qa')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'qa' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-military-200 hover:bg-military-800'}`}><HelpCircle size={20} />{isSidebarOpen && <span className="text-xs font-bold uppercase">Hỏi đáp & Góp ý</span>}</button>
          {user.role === 'ADMIN' && <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 border-t border-military-800 pt-4 ${activeTab === 'admin' ? 'bg-white text-military-900 font-bold shadow-lg' : 'text-amber-400 hover:bg-military-800'}`}><Settings size={20}/>{isSidebarOpen && <span className="text-xs font-bold uppercase">Quản trị Master</span>}</button>}
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
              {activeTab === 'dashboard' ? `Dữ liệu Tuyển quân ${sessionYear}` : activeTab === 'admin' ? 'Hệ thống Quản trị Master' : activeTab === 'documents' ? 'Thư viện Văn bản pháp quy' : activeTab === 'qa' ? 'Phòng Hỏi đáp & Góp ý' : activeTab === 'communication' ? 'Hệ thống Báo cáo & Văn bản' : `Quản lý Hồ sơ ${sessionYear}`}
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

      {/* --- CÁC MODAL HỆ THỐNG --- */}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
                <div className="bg-amber-600 p-5 text-white font-bold flex justify-between items-center shadow-lg"><h3 className="uppercase flex items-center gap-2 text-sm"><Key size={20}/> Thiết lập mật khẩu mới</h3><button onClick={() => setShowPasswordModal(false)}><X size={20}/></button></div>
                <div className="p-6">
                    {changePassMsg ? (
                      <div className="bg-green-50 text-green-700 font-bold py-10 text-center rounded-xl border border-green-200 animate-in zoom-in duration-300">
                        <CheckCircle2 className="mx-auto mb-3 text-green-500" size={48}/>
                        <p className="text-sm uppercase tracking-wide">{changePassMsg}</p>
                      </div>
                    ) : (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (newPassword !== confirmPassword) { alert("Mật khẩu xác nhận không khớp!"); return; }
                            if (await api.updateUser(user.username, { password: newPassword })) { 
                                setUser({ ...user, password: newPassword });
                                setChangePassMsg("Đã cập nhật mật khẩu thành công!"); 
                                setTimeout(() => { setShowPasswordModal(false); setChangePassMsg(''); setNewPassword(''); setConfirmPassword(''); }, 2000); 
                            }
                        }} className="space-y-4">
                            <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Mật khẩu mới</label><input type="password" required className="w-full border border-gray-200 p-2.5 rounded-lg text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                            <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Xác nhận lại</label><input type="password" required className="w-full border border-gray-200 p-2.5 rounded-lg text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                              <button type="button" onClick={() => setShowPasswordModal(false)} className="px-5 py-2 text-xs font-bold text-gray-500 uppercase">Hủy bỏ</button>
                              <button type="submit" className="px-7 py-2 bg-amber-600 text-white rounded-lg font-black uppercase text-xs shadow-lg transition-all hover:bg-amber-700">Xác nhận thay đổi</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
      )}

      {showProfileModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                  <div className="bg-military-800 p-5 flex justify-between items-center text-white"><h3 className="font-bold uppercase tracking-wide text-sm">Cập nhật hồ sơ cán bộ phụ trách</h3><button onClick={() => setShowProfileModal(false)}><X size={20}/></button></div>
                  <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Họ và tên cán bộ</label><input type="text" required className="w-full border border-gray-200 p-2.5 rounded-lg text-sm font-bold focus:ring-2 focus:ring-military-500" value={profileData.personalName} onChange={e => setProfileData({...profileData, personalName: e.target.value})} /></div>
                          <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Cấp bậc (Quân hàm)</label><input type="text" required className="w-full border border-gray-200 p-2.5 rounded-lg text-sm font-bold focus:ring-2 focus:ring-military-500" value={profileData.rank} onChange={e => setProfileData({...profileData, rank: e.target.value})} /></div>
                      </div>
                      <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Chức vụ hiện tại</label><input type="text" required className="w-full border border-gray-200 p-2.5 rounded-lg text-sm font-bold focus:ring-2 focus:ring-military-500" value={profileData.position} onChange={e => setProfileData({...profileData, position: e.target.value})} /></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Số điện thoại liên hệ</label><input type="tel" required className="w-full border border-gray-200 p-2.5 rounded-lg text-sm font-black text-blue-700 focus:ring-2 focus:ring-military-500" value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} /></div>
                          <div><label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-wider">Hòm thư điện tử (Email)</label><input type="email" className="w-full border border-gray-200 p-2.5 rounded-lg text-sm font-bold focus:ring-2 focus:ring-military-500" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} /></div>
                      </div>
                      <div className="pt-6 border-t flex justify-end gap-3">
                        <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Hủy bỏ</button>
                        <button type="submit" className="px-6 py-2 bg-military-700 text-white rounded-lg font-black uppercase text-xs shadow-xl transition-all hover:bg-military-800">Lưu thông tin cán bộ</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

export default App;
