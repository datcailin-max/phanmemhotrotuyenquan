
// ... (imports remain the same)
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  BellRing,
  Bot,
  Send,
  FileText,
  Download,
  Trash2,
  Plus,
  File
} from 'lucide-react';
import { Recruit, User, ResearchDocument, ChatMessage, RecruitmentStatus } from './types';
import { INITIAL_RECRUITS } from './constants';
import Dashboard from './views/Dashboard';
import RecruitManagement from './views/RecruitManagement';
import Login from './views/Login';
import YearSelection from './views/YearSelection';
import { api } from './api';
import { GoogleGenAI } from "@google/genai";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionYear, setSessionYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recruits' | 'admin' | 'documents'>('dashboard');
  
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
  
  // Assistant Modal State
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
      { id: '1', role: 'model', text: 'Xin chào đồng chí! Tôi là Trợ lý tuyển quân ảo. Tôi có thể giúp gì cho đồng chí về số liệu tuyển quân tại địa phương? (Ví dụ: "Có bao nhiêu thanh niên bị miễn?", "Danh sách nhập ngũ năm nay bao nhiêu người?")', timestamp: Date.now() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Documents State
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);

  // Admin Update Trigger (to refresh sidebar badge)
  const [adminUpdateTrigger, setAdminUpdateTrigger] = useState(0);

  // Load Documents on start
  useEffect(() => {
      const savedDocs = localStorage.getItem('military_documents');
      if (savedDocs) {
          setDocuments(JSON.parse(savedDocs));
      } else {
          // Sample Data
          setDocuments([
             { id: '1', title: 'Thông tư quy định tiêu chuẩn tuyển quân 2025', description: 'Quy định chi tiết về tiêu chuẩn sức khỏe, chính trị, văn hóa.', url: '#', uploadDate: '2024-10-20', fileType: 'PDF' },
             { id: '2', title: 'Hướng dẫn rà soát chính sách miễn hoãn', description: 'Hướng dẫn các bước rà soát đối tượng miễn, tạm hoãn gọi nhập ngũ.', url: '#', uploadDate: '2024-11-05', fileType: 'WORD' }
          ]);
      }
  }, []);

  const saveDocuments = (newDocs: ResearchDocument[]) => {
      setDocuments(newDocs);
      localStorage.setItem('military_documents', JSON.stringify(newDocs));
  };

  // Scroll chat to bottom
  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, showAssistantModal]);

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

  // --- AI ASSISTANT LOGIC ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiThinking || !user) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage, timestamp: Date.now() }]);
    setIsAiThinking(true);

    try {
        // 1. Prepare Data Context (Filter for current user's locality to ensure privacy/relevance)
        const relevantRecruits = user.role === 'ADMIN' 
            ? recruits.filter(r => r.recruitmentYear === sessionYear) 
            : recruits.filter(r => r.recruitmentYear === sessionYear && r.address.commune === user.unit.commune);

        // 2. Simplify data to save tokens (remove PII like citizenId, name)
        const simplifiedData = relevantRecruits.map(r => ({
            status: r.status,
            dob: r.dob,
            edu: r.details.education,
            health: r.physical.healthGrade,
            deferment: r.defermentReason || 'Không',
            ethnicity: r.details.ethnicity,
            village: r.address.village
        }));

        const dataContext = JSON.stringify(simplifiedData);

        // 3. Call Gemini
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API Key not found");
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const systemInstruction = `Bạn là Trợ lý Tuyển quân ảo. Bạn đang hỗ trợ cán bộ tại ${user.unit.commune || 'địa phương'}. 
        Nhiệm vụ: Trả lời câu hỏi dựa trên dữ liệu JSON được cung cấp.
        Dữ liệu bao gồm các trường: status (trạng thái), dob (ngày sinh), edu (học vấn), health (loại sức khỏe), deferment (lý do hoãn/miễn).
        
        Quy tắc:
        1. Chỉ trả lời dựa trên dữ liệu. Nếu không biết, nói không có dữ liệu.
        2. Status key: 
           - NGUON: Nguồn 
           - SO_KHAM_DAT/KHONG_DAT: Sơ tuyển
           - KHAM_TUYEN_DAT/KHONG_DAT: Khám tuyển
           - TAM_HOAN: Tạm hoãn
           - MIEN_KHAM: Miễn
           - NHAP_NGU: Nhập ngũ
        3. Trả lời ngắn gọn, súc tích, chuyên nghiệp kiểu quân đội.
        4. Nếu hỏi về danh sách cụ thể (tên), hãy nói "Vì lý do bảo mật, tôi chỉ cung cấp số liệu thống kê".
        
        Dữ liệu hiện tại (Năm ${sessionYear}): ${dataContext}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                role: 'user',
                parts: [{ text: userMessage }]
            }],
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const reply = response.text;
        
        setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: reply, timestamp: Date.now() }]);

    } catch (error) {
        console.error("AI Error:", error);
        setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Xin lỗi, hệ thống đang bận hoặc chưa cấu hình API Key. Vui lòng thử lại sau.', timestamp: Date.now() }]);
    } finally {
        setIsAiThinking(false);
    }
  };

  const AdminPanel = () => {
      const [allUsers, setAllUsers] = useState<User[]>(JSON.parse(localStorage.getItem('military_users') || '[]'));
      const pendingUsers = allUsers.filter(u => u.pendingPassword);

      // Document Management State
      const [newDocTitle, setNewDocTitle] = useState('');
      const [newDocDesc, setNewDocDesc] = useState('');
      const [newDocUrl, setNewDocUrl] = useState(''); // Simulated file input
      const [newDocType, setNewDocType] = useState<'WORD' | 'PDF' | 'EXCEL' | 'OTHER'>('WORD');

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

      const handleAddDocument = (e: React.FormEvent) => {
          e.preventDefault();
          if(!newDocTitle) return;
          const newDoc: ResearchDocument = {
              id: Date.now().toString(),
              title: newDocTitle,
              description: newDocDesc,
              url: newDocUrl || '#',
              fileType: newDocType,
              uploadDate: new Date().toISOString().split('T')[0]
          };
          saveDocuments([...documents, newDoc]);
          setNewDocTitle('');
          setNewDocDesc('');
          setNewDocUrl('');
          alert("Đã cập nhật tài liệu thành công!");
      };

      const handleDeleteDocument = (id: string) => {
          if(window.confirm("Xác nhận xóa tài liệu này?")) {
              saveDocuments(documents.filter(d => d.id !== id));
          }
      };

      return (
          <div className="space-y-6 m-6">
              
              {/* NOTIFICATIONS SECTION */}
              {pendingUsers.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                      <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                          <BellRing size={18} className="animate-bounce"/> 
                          Thông báo & Yêu cầu ({pendingUsers.length})
                      </h3>
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
                  </div>
              )}

               {/* DOCUMENT MANAGEMENT */}
               <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-military-700 mb-4 flex items-center gap-2">
                      <FileText /> Cập nhật Tài liệu Nghiên cứu
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <form onSubmit={handleAddDocument} className="bg-gray-50 p-4 rounded border border-gray-200 h-fit">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Thêm tài liệu mới</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Tên tài liệu / Văn bản</label>
                                    <input required type="text" className="w-full p-2 border rounded text-sm" placeholder="VD: Hướng dẫn tuyển quân 2025" value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Mô tả / Trích yếu</label>
                                    <textarea className="w-full p-2 border rounded text-sm" placeholder="Nội dung chính của văn bản..." rows={3} value={newDocDesc} onChange={e => setNewDocDesc(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Loại file</label>
                                    <select className="w-full p-2 border rounded text-sm" value={newDocType} onChange={(e:any) => setNewDocType(e.target.value)}>
                                        <option value="WORD">Word (.docx)</option>
                                        <option value="PDF">PDF (.pdf)</option>
                                        <option value="EXCEL">Excel (.xlsx)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Đường dẫn tải về (Link Google Drive/SharePoint)</label>
                                    <input type="text" className="w-full p-2 border rounded text-sm" placeholder="https://..." value={newDocUrl} onChange={e => setNewDocUrl(e.target.value)} />
                                    <p className="text-[10px] text-gray-500 italic mt-1">* Hệ thống demo sử dụng liên kết ngoài thay vì upload trực tiếp.</p>
                                </div>
                                <button type="submit" className="w-full py-2 bg-military-600 text-white font-bold rounded hover:bg-military-700 flex items-center justify-center gap-2">
                                    <Plus size={16} /> Cập nhật lên hệ thống
                                </button>
                            </div>
                        </form>

                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Danh sách tài liệu hiện có</h4>
                            <div className="border rounded bg-white overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                        <tr>
                                            <th className="p-3">Tên tài liệu</th>
                                            <th className="p-3 text-center">Loại</th>
                                            <th className="p-3 text-center">Xóa</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {documents.map(doc => (
                                            <tr key={doc.id} className="hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div className="font-bold">{doc.title}</div>
                                                    <span className="text-xs text-gray-400 block">{doc.uploadDate}</span>
                                                    {doc.description && (
                                                        <span className="text-xs text-gray-500 block italic mt-1 truncate max-w-xs">{doc.description}</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center"><span className="text-[10px] font-bold bg-gray-200 px-2 py-1 rounded">{doc.fileType}</span></td>
                                                <td className="p-3 text-center">
                                                    <button onClick={() => handleDeleteDocument(doc.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {documents.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-400 italic">Chưa có tài liệu nào</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
               </div>

              {/* ALL USERS LIST */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-xl font-bold text-military-700 mb-4 flex items-center gap-2">
                      <Users /> Danh sách Cán bộ & Tài khoản ({allUsers.length})
                  </h2>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                              <tr>
                                  <th className="p-3 border-b">TT</th>
                                  <th className="p-3 border-b">Đơn vị (Xã/Phường)</th>
                                  <th className="p-3 border-b">Cán bộ phụ trách</th>
                                  <th className="p-3 border-b">Chức vụ</th>
                                  <th className="p-3 border-b">Số điện thoại</th>
                                  <th className="p-3 border-b text-center">Trạng thái</th>
                                  <th className="p-3 border-b text-center">Thao tác</th>
                              </tr>
                          </thead>
                          <tbody className="text-sm divide-y divide-gray-100">
                              {allUsers.map((u, idx) => (
                                  <tr key={u.username} className={`hover:bg-gray-50 ${u.isLocked ? 'bg-red-50/50' : ''}`}>
                                      <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                                      <td className="p-3">
                                          <div className="font-bold">{u.unit.commune || 'Cấp Huyện/Tỉnh'}</div>
                                          <div className="text-xs text-gray-500 font-mono">{u.username}</div>
                                      </td>
                                      <td className="p-3 font-medium text-gray-900">
                                          {u.personalName || '---'}
                                      </td>
                                      <td className="p-3 text-gray-700">
                                          {u.position || '---'}
                                      </td>
                                      <td className="p-3 text-gray-700 font-mono">
                                          {u.phoneNumber || '---'}
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

  const DocumentsPanel = () => {
      return (
          <div className="p-6 m-6 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px]">
              <h2 className="text-xl font-bold text-military-700 mb-6 flex items-center gap-2">
                  <FileText /> Tài liệu Nghiên cứu & Văn bản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.length === 0 ? (
                      <div className="col-span-3 text-center py-10 text-gray-500 italic">
                          Chưa có tài liệu nào được cập nhật. Vui lòng liên hệ Ban CHQS cấp trên.
                      </div>
                  ) : (
                      documents.map(doc => (
                          <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 flex flex-col justify-between">
                              <div className="flex items-start gap-3 mb-3">
                                  <div className={`p-2 rounded shrink-0 ${doc.fileType === 'WORD' ? 'bg-blue-100 text-blue-600' : doc.fileType === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                      <File size={24} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-gray-800 line-clamp-2 text-sm">{doc.title}</h4>
                                      <p className="text-xs text-gray-500 mt-1">Cập nhật: {doc.uploadDate}</p>
                                      {doc.description && (
                                          <p className="text-xs text-gray-600 mt-2 line-clamp-3 bg-white p-2 rounded border border-gray-100">
                                              {doc.description}
                                          </p>
                                      )}
                                  </div>
                              </div>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="w-full mt-2 py-2 bg-white border border-gray-300 rounded text-center text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2">
                                  <Download size={14} /> Tải về / Xem
                              </a>
                          </div>
                      ))
                  )}
              </div>
          </div>
      );
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

          <button 
             onClick={() => { setActiveTab('documents'); setIsMobileMenuOpen(false); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'documents' ? 'bg-white text-gray-900 border-l-4 border-amber-500 font-bold' : 'text-military-200 hover:bg-military-800'}`}
          >
            <FileText size={20} className="shrink-0" />
            {(isSidebarOpen || isMobileMenuOpen) && <span>TÀI LIỆU</span>}
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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 h-full relative">
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
                <span>{activeTab === 'dashboard' ? `Quy trình tuyển quân ${sessionYear}` : activeTab === 'admin' ? 'Quản trị hệ thống' : activeTab === 'documents' ? 'Tài liệu nghiên cứu' : `Quản lý công dân nhập ngũ ${sessionYear}`}</span>
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
          {activeTab === 'documents' && <DocumentsPanel />}
        </div>

        {/* FLOATING ACTION BUTTON: TRỢ LÝ ẢO */}
        <button 
            onClick={() => setShowAssistantModal(true)}
            className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-military-600 to-military-500 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-transform z-20"
            title="Trợ lý Tuyển quân Ảo"
        >
            <Bot size={28} />
        </button>

      </main>

      {/* AI ASSISTANT MODAL */}
      {showAssistantModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden animate-in zoom-in-95">
                 {/* Header */}
                 <div className="bg-gradient-to-r from-military-700 to-military-600 p-4 text-white flex justify-between items-center shrink-0">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                            <Bot size={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-lg">Trợ lý Tuyển quân</h3>
                             <p className="text-xs text-military-100 opacity-80">Hỗ trợ tra cứu số liệu địa phương</p>
                         </div>
                     </div>
                     <button onClick={() => setShowAssistantModal(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={20}/></button>
                 </div>
                 
                 {/* Chat Area */}
                 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
                     {chatMessages.map(msg => (
                         <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                                 {msg.text.split('\n').map((line, i) => <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>)}
                                 <div className={`text-[10px] mt-1 opacity-70 ${msg.role === 'user' ? 'text-blue-100 text-right' : 'text-gray-400'}`}>
                                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </div>
                             </div>
                         </div>
                     ))}
                     {isAiThinking && (
                         <div className="flex justify-start">
                             <div className="bg-white p-3 rounded-lg rounded-bl-none border border-gray-200 shadow-sm flex gap-1">
                                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                             </div>
                         </div>
                     )}
                     <div ref={chatEndRef} />
                 </div>
                 
                 {/* Input Area */}
                 <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 shrink-0 flex gap-2">
                     <input 
                        type="text" 
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-military-500 focus:ring-2 focus:ring-military-100"
                        placeholder="Nhập câu hỏi..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        disabled={isAiThinking}
                     />
                     <button 
                        type="submit" 
                        disabled={!chatInput.trim() || isAiThinking}
                        className="w-10 h-10 bg-military-600 text-white rounded-full flex items-center justify-center hover:bg-military-700 disabled:bg-gray-300 transition-colors shadow-sm"
                     >
                         <Send size={18} className={isAiThinking ? 'opacity-0' : 'ml-0.5'} />
                     </button>
                 </form>
             </div>
          </div>
      )}

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