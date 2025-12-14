
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShieldAlert, LogIn, Key, UserCheck, UserPlus, Check, Eye, Edit3, MapPin, Phone, Briefcase, User as UserIcon, HelpCircle, Landmark } from 'lucide-react';
import { MOCK_USERS, LOCATION_DATA, PROVINCES_VN, removeVietnameseTones } from '../constants';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register State
  const [regLevel, setRegLevel] = useState<'COMMUNE' | 'PROVINCE'>('COMMUNE');
  const [regProvince, setRegProvince] = useState('');
  const [regCommune, setRegCommune] = useState('');
  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [regUsername, setRegUsername] = useState('');
  const [regUnitName, setRegUnitName] = useState(''); // Tên đơn vị (Hiển thị)
  const [regPersonalName, setRegPersonalName] = useState(''); // Họ và tên
  const [regPosition, setRegPosition] = useState(''); // Chức vụ
  const [regPhone, setRegPhone] = useState(''); // SĐT

  const [regAccountType, setRegAccountType] = useState<'1' | '2'>('1'); // 1: Editor, 2: Viewer
  const [successInfo, setSuccessInfo] = useState<{user: string, pass: string} | null>(null);

  // Forgot Password State
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  // Derived Location Lists for Register
  const provinceList = PROVINCES_VN; // Use full list now
  
  const communeList = useMemo(() => {
    // @ts-ignore
    const provinceData = LOCATION_DATA[regProvince];
    return provinceData ? Object.keys(provinceData) : [];
  }, [regProvince]);

  // Filter Suggestions Logic
  const filteredCommunes = useMemo(() => {
      if (!regCommune) return communeList;
      const search = removeVietnameseTones(regCommune.toLowerCase());
      return communeList.filter(c => 
          removeVietnameseTones(c.toLowerCase()).includes(search)
      );
  }, [regCommune, communeList]);

  // Close suggestions when clicking outside
  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
              setShowCommuneSuggestions(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Auto-generate username logic
  useEffect(() => {
    if (regLevel === 'COMMUNE' && regCommune) {
        const rawName = regCommune.replace(/^(Xã|Phường)\s+/i, '');
        const noToneName = removeVietnameseTones(rawName);
        const cleanName = noToneName.toUpperCase().replace(/\s+/g, '');
        setRegUsername(cleanName + regAccountType);
        const roleDesc = regAccountType === '1' ? '(Cán bộ chuyên môn)' : '(Chỉ huy đơn vị)';
        setRegUnitName(`Ban CHQS ${regCommune} ${roleDesc}`);
    } else if (regLevel === 'PROVINCE' && regProvince) {
        const noToneName = removeVietnameseTones(regProvince);
        const cleanName = noToneName.toUpperCase().replace(/\s+/g, '');
        setRegUsername(cleanName);
        setRegUnitName(`Bộ CHQS Tỉnh ${regProvince}`);
    } else {
        setRegUsername('');
    }
  }, [regCommune, regAccountType, regLevel, regProvince]);

  // Load users from LS or init
  const getUsers = () => {
    let savedUsersStr = localStorage.getItem('military_users');
    let users: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
    
    // BACKWARD COMPATIBILITY: Assign roles to old users if missing
    let hasChanges = false;
    users = users.map(u => {
        if (!u.role) {
            hasChanges = true;
            return { ...u, role: u.username === 'ADMIN' ? 'ADMIN' : 'EDITOR' };
        }
        if (u.isApproved === undefined) {
            hasChanges = true;
            return { ...u, isApproved: true }; // Existing users are approved by default
        }
        return u;
    });

    // Initialize with MOCK_USERS if needed or merge THUNGHIEM
    MOCK_USERS.forEach(mockUser => {
        if (!users.find(u => u.username === mockUser.username)) {
            users.push(mockUser);
            hasChanges = true;
        }
    });

    // Save back if fixed or initialized
    if (hasChanges) {
        localStorage.setItem('military_users', JSON.stringify(users));
    }
    
    return users;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find((u: any) => u.username === username && u.password === password);
    
    if (user) {
        if (!user.isApproved && user.role !== 'ADMIN') {
            setError('Tài khoản chưa được duyệt đăng ký bởi ADMIN, vui lòng liên hệ người hỗ trợ: 4/Thới Hạ Sang, zalo: 0334429954');
            return;
        }
        onLogin(user);
    } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regProvince || (!regCommune && regLevel === 'COMMUNE') || !regUsername || !regUnitName || !regPersonalName || !regPosition || !regPhone) {
        setError("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    const users = getUsers();
    
    // Check if username exists (Exact match check)
    if (users.find((u: any) => u.username === regUsername)) {
        setError(`Tài khoản ${regUsername} đã tồn tại.`);
        return;
    }

    let newRole: UserRole;
    if (regLevel === 'PROVINCE') {
        newRole = 'PROVINCE_ADMIN';
    } else {
        newRole = regAccountType === '1' ? 'EDITOR' : 'VIEWER';
    }

    const newUser: User = {
        username: regUsername,
        password: '1', // Default password per requirement
        fullName: regUnitName, // Unit Name as display name
        personalName: regPersonalName,
        position: regPosition,
        phoneNumber: regPhone,
        role: newRole,
        unit: {
            province: regProvince,
            commune: regLevel === 'COMMUNE' ? regCommune : ''
        },
        isApproved: false // Requires approval
    };

    users.push(newUser);
    localStorage.setItem('military_users', JSON.stringify(users));
    
    setSuccessInfo({ user: regUsername, pass: '1' });
    setMode('LOGIN');
    setUsername(regUsername);
    setPassword('');
    setError('');
    
    // Reset form
    setRegProvince('');
    setRegCommune('');
    setRegUsername('');
    setRegUnitName('');
    setRegPersonalName('');
    setRegPosition('');
    setRegPhone('');
    setRegAccountType('1');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (!forgotUsername.trim()) return;

      const users = getUsers();
      const userIndex = users.findIndex(u => u.username === forgotUsername.trim());

      if (userIndex !== -1) {
          if (users[userIndex].role === 'ADMIN') {
              setForgotMsg("Không thể yêu cầu reset mật khẩu cho ADMIN theo cách này.");
              return;
          }
          // Set resetRequested flag
          users[userIndex].resetRequested = true;
          localStorage.setItem('military_users', JSON.stringify(users));
          setForgotMsg("Đã gửi yêu cầu cấp lại mật khẩu tới Quản trị viên. Vui lòng liên hệ cấp trên để nhận mật khẩu mới.");
      } else {
          setForgotMsg("Không tìm thấy tài khoản này trong hệ thống.");
      }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-military-900 overflow-hidden">
      
      {/* BACKGROUND IMAGE LAYER */}
      <div className="absolute inset-0 z-0">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Qu%C3%A2n_hi%E1%BB%87u_Qu%C3%A2n_%C4%91%E1%BB%99i_nh%C3%A2n_d%C3%A2n_Vi%E1%BB%87t_Nam.png/1200px-Qu%C3%A2n_hi%E1%BB%87u_Qu%C3%A2n_%C4%91%E1%BB%99i_nh%C3%A2n_d%C3%A2n_Vi%E1%BB%87t_Nam.png"
            alt="Quan hieu Quan doi nhan dan Viet Nam"
            className="w-full h-full object-cover object-center opacity-40 blur-sm scale-110"
          />
          {/* Gradient Overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-military-900/80 to-military-800/90 mix-blend-multiply"></div>
      </div>

      {/* LOGIN CARD */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-military-800 to-military-700 p-8 text-center relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>

             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-yellow-500 relative z-10">
                <ShieldAlert className="text-red-600 w-12 h-12" strokeWidth={2} />
             </div>
             <h1 className="text-2xl font-bold text-white uppercase tracking-wider drop-shadow-md">Hệ Thống Tuyển Quân</h1>
             <p className="text-military-100 text-sm mt-1 font-medium">Hỗ trợ Hội đồng NVQS địa phương</p>
             
             <div className="mt-5 pt-4 border-t border-military-600/50">
                <p className="text-military-200 text-[10px] uppercase tracking-widest">Bản quyền phần mềm thuộc về</p>
                <p className="text-yellow-400 text-sm font-bold uppercase tracking-wide mt-1 drop-shadow">Đại úy Thới Hạ Sang</p>
             </div>
        </div>

        {/* Success Modal Overlay */}
        {successInfo && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="text-green-600 w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4 text-xs text-yellow-800">
                    Tài khoản cần được ADMIN duyệt trước khi đăng nhập.
                </div>
                <div className="bg-gray-100 p-4 rounded-lg w-full mb-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Tài khoản</span>
                        <span className="font-mono font-bold text-lg text-military-700">{successInfo.user}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Mật khẩu</span>
                        <span className="font-mono font-bold text-lg text-military-700">{successInfo.pass}</span>
                    </div>
                </div>

                <button 
                    onClick={() => { setSuccessInfo(null); setUsername(successInfo.user); }}
                    className="w-full py-2 bg-military-600 text-white rounded font-bold hover:bg-military-700"
                >
                    Đến màn hình đăng nhập
                </button>
            </div>
        )}

        <div className="flex border-b border-gray-200 bg-gray-50/50">
            <button 
                onClick={() => { setMode('LOGIN'); setError(''); setForgotMsg(''); }}
                className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider transition-all ${mode === 'LOGIN' ? 'text-military-700 border-b-2 border-military-600 bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
                Đăng nhập
            </button>
            <button 
                onClick={() => { setMode('REGISTER'); setError(''); setForgotMsg(''); }}
                 className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider transition-all ${mode === 'REGISTER' ? 'text-military-700 border-b-2 border-military-600 bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
                Đăng ký mới
            </button>
        </div>

        <div className="p-8 max-h-[500px] overflow-y-auto custom-scrollbar">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200 flex flex-col gap-1 mb-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2"><ShieldAlert size={16} className="shrink-0"/> <span className="font-bold">Lỗi đăng nhập</span></div>
                    <div className="text-xs ml-6">{error}</div>
                </div>
            )}

            {mode === 'LOGIN' && (
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tài khoản</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserCheck className="h-5 w-5 text-gray-400 group-focus-within:text-military-600 transition-colors" />
                            </div>
                            <input 
                                type="text" 
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-military-500 focus:border-transparent text-gray-900 transition-all"
                                placeholder="Nhập tài khoản..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Mật khẩu</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key className="h-5 w-5 text-gray-400 group-focus-within:text-military-600 transition-colors" />
                            </div>
                            <input 
                                type="password" 
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-military-500 focus:border-transparent text-gray-900 transition-all"
                                placeholder="••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="text-right mt-2">
                           <button type="button" onClick={() => setMode('FORGOT')} className="text-xs text-military-600 hover:text-military-800 hover:underline font-medium">Quên mật khẩu?</button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-military-600 hover:bg-military-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-military-500 transition-all transform hover:-translate-y-0.5 uppercase tracking-wide"
                    >
                        <LogIn className="mr-2 h-5 w-5" /> Đăng nhập hệ thống
                    </button>
                </form>
            )}

            {mode === 'FORGOT' && (
                <div className="space-y-4 animate-in slide-in-from-right-2">
                    <h3 className="text-sm font-bold text-gray-700 text-center uppercase mb-2">Yêu cầu cấp lại mật khẩu</h3>
                    {forgotMsg ? (
                        <div className={`p-3 rounded-md text-sm border text-center ${forgotMsg.includes("Đã gửi") ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {forgotMsg}
                        </div>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <p className="text-xs text-gray-500">Nhập tên tài khoản của đơn vị. Yêu cầu sẽ được gửi tới Admin để xét duyệt cấp lại mật khẩu.</p>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tài khoản</label>
                                <input 
                                    type="text" 
                                    required
                                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-military-500 text-gray-900"
                                    placeholder="Nhập tài khoản cần khôi phục..."
                                    value={forgotUsername}
                                    onChange={(e) => setForgotUsername(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full py-2 bg-amber-500 text-white rounded font-bold hover:bg-amber-600 shadow-sm"
                            >
                                Gửi yêu cầu
                            </button>
                        </form>
                    )}
                    <button onClick={() => { setMode('LOGIN'); setForgotMsg(''); }} className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
                        Quay lại đăng nhập
                    </button>
                </div>
            )}

            {mode === 'REGISTER' && (
                <form onSubmit={handleRegister} className="space-y-4">
                     <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 mb-2 border border-blue-100 shadow-sm">
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Mật khẩu mặc định: <b className="font-mono text-red-600">1</b></li>
                            <li>Dữ liệu cần ADMIN duyệt mới có thể đăng nhập</li>
                        </ul>
                    </div>

                    {/* Level Selection */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <button
                            type="button"
                            onClick={() => { setRegLevel('COMMUNE'); setRegCommune(''); }}
                            className={`flex items-center justify-center p-2 rounded text-xs font-bold border ${regLevel === 'COMMUNE' ? 'bg-military-600 text-white border-military-700' : 'bg-white text-gray-600 border-gray-300'}`}
                        >
                            <MapPin size={14} className="mr-1"/> Cấp Xã / Phường
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRegLevel('PROVINCE'); setRegCommune(''); }}
                            className={`flex items-center justify-center p-2 rounded text-xs font-bold border ${regLevel === 'PROVINCE' ? 'bg-red-700 text-white border-red-800' : 'bg-white text-gray-600 border-gray-300'}`}
                        >
                            <Landmark size={14} className="mr-1"/> Cấp Tỉnh (Bộ CHQS)
                        </button>
                    </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Chọn Tỉnh / Thành phố</label>
                        <select 
                            required
                            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-military-500 text-gray-900"
                            value={regProvince}
                            onChange={(e) => { setRegProvince(e.target.value); setRegCommune(''); }}
                        >
                            <option value="">-- Chọn Tỉnh --</option>
                            {provinceList.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {regLevel === 'COMMUNE' && (
                        <div className="relative" ref={wrapperRef}>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Xã / Phường</label>
                            <input
                                type="text"
                                required
                                disabled={!regProvince}
                                placeholder={!regProvince ? "Vui lòng chọn Tỉnh trước" : "Nhập tên Xã/Phường (có gợi ý)..."}
                                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-military-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                                value={regCommune}
                                onChange={(e) => {
                                    setRegCommune(e.target.value);
                                    setShowCommuneSuggestions(true);
                                }}
                                onFocus={() => setShowCommuneSuggestions(true)}
                            />
                            {/* Suggestions Dropdown */}
                            {showCommuneSuggestions && regProvince && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                                    {communeList.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-gray-500 italic">Không có dữ liệu gợi ý cho tỉnh này. Vui lòng tự nhập.</div>
                                    ) : filteredCommunes.length > 0 ? (
                                        filteredCommunes.map((c, index) => (
                                            <div 
                                                key={index}
                                                className="px-3 py-2 text-sm text-gray-800 hover:bg-military-50 cursor-pointer flex items-center gap-2 border-b border-gray-50 last:border-0"
                                                onClick={() => {
                                                    setRegCommune(c);
                                                    setShowCommuneSuggestions(false);
                                                }}
                                            >
                                                <MapPin size={12} className="text-military-400" />
                                                {c}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-gray-500 italic">Không tìm thấy kết quả phù hợp</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Account Type Selection - Only for Commune */}
                    {regLevel === 'COMMUNE' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Loại tài khoản</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRegAccountType('1')}
                                    className={`flex flex-col items-center justify-center p-2 rounded border-2 transition-all ${regAccountType === '1' ? 'border-military-600 bg-military-50 text-military-700 shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Edit3 size={20} className="mb-1"/>
                                    <span className="text-xs font-bold text-center">TK 1<br/>(Nhập liệu)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRegAccountType('2')}
                                    className={`flex flex-col items-center justify-center p-2 rounded border-2 transition-all ${regAccountType === '2' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Eye size={20} className="mb-1"/>
                                    <span className="text-xs font-bold text-center">TK 2<br/>(Chỉ xem)</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 p-3 bg-gray-50 rounded border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-700 uppercase border-b border-gray-200 pb-1">Thông tin cá nhân</h4>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Họ và tên</label>
                            <div className="relative">
                                <UserIcon className="absolute left-2 top-2 text-gray-400" size={14} />
                                <input 
                                    type="text" required
                                    className="block w-full py-1.5 pl-7 pr-2 border border-gray-300 rounded text-sm"
                                    value={regPersonalName} onChange={(e) => setRegPersonalName(e.target.value)} placeholder="Nguyễn Văn A"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Chức vụ</label>
                            <div className="relative">
                                <Briefcase className="absolute left-2 top-2 text-gray-400" size={14} />
                                <input 
                                    type="text" required
                                    className="block w-full py-1.5 pl-7 pr-2 border border-gray-300 rounded text-sm"
                                    value={regPosition} onChange={(e) => setRegPosition(e.target.value)} placeholder="Chỉ huy trưởng, Phó CHT..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Số điện thoại</label>
                            <div className="relative">
                                <Phone className="absolute left-2 top-2 text-gray-400" size={14} />
                                <input 
                                    type="text" required
                                    className="block w-full py-1.5 pl-7 pr-2 border border-gray-300 rounded text-sm"
                                    value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="09xxxxxxxx"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tên đơn vị (Hiển thị)</label>
                        <input 
                            type="text" 
                            required
                            readOnly
                            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-military-500 text-gray-700 bg-gray-100 italic"
                            value={regUnitName}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tên đăng nhập (Tự động)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                readOnly
                                className="block w-full py-2 px-3 border border-gray-300 rounded-md bg-gray-100 text-military-700 font-bold font-mono"
                                value={regUsername}
                            />
                            {regUsername && <div className="absolute right-3 top-2.5 text-green-600 animate-pulse"><Check size={16}/></div>}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={!regUsername}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5 uppercase tracking-wide disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    >
                        <UserPlus className="mr-2 h-5 w-5" /> Đăng ký
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default Login;
