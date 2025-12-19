
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShieldAlert, LogIn, Key, UserCheck, UserPlus, Check, Eye, Edit3, MapPin, Phone, Briefcase, User as UserIcon, HelpCircle, Landmark, ChevronRight, Lock } from 'lucide-react';
import { MOCK_USERS, LOCATION_DATA, PROVINCES_VN, removeVietnameseTones, generateUnitUsername } from '../constants';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'UNIT_SELECT' | 'FORGOT'>('LOGIN');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [selLevel, setSelLevel] = useState<'COMMUNE' | 'PROVINCE'>('COMMUNE');
  const [selProvince, setSelProvince] = useState('');
  const [selCommune, setSelCommune] = useState('');
  const [selAccountType, setSelAccountType] = useState<'1' | '2'>('1');
  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const provinceList = PROVINCES_VN;
  
  const communeList = useMemo(() => {
    // @ts-ignore
    const provinceData = LOCATION_DATA[selProvince];
    return provinceData ? Object.keys(provinceData) : [];
  }, [selProvince]);

  const filteredCommunes = useMemo(() => {
      if (!selCommune) return communeList;
      const search = removeVietnameseTones(selCommune.toLowerCase());
      return communeList.filter(c => 
          removeVietnameseTones(c.toLowerCase()).includes(search)
      );
  }, [selCommune, communeList]);

  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
              setShowCommuneSuggestions(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const getUsersFromStorage = (): User[] => {
    let savedUsersStr = localStorage.getItem('military_users');
    let users: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
    if (!users.find(u => u.username === 'ADMIN')) {
        users.push(MOCK_USERS[0]);
        localStorage.setItem('military_users', JSON.stringify(users));
    }
    return users;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsersFromStorage();
    const user = users.find((u: any) => u.username === username && u.password === password);
    
    if (user) {
        if (user.isLocked && user.username !== 'ADMIN') {
            setError('Tài khoản này hiện đang bị KHÓA. Vui lòng liên hệ Master Admin (Người tạo phần mềm) để xác minh và kích hoạt tài khoản cho đơn vị của bạn.');
            return;
        }
        onLogin(user);
    } else {
        // Trường hợp đăng nhập lần đầu bằng pass mặc định 1 của các unit
        if (password === '1' && (username.startsWith('TINH_') || username.includes('_1') || username.includes('_2'))) {
            const existingInStorage = users.find(u => u.username === username);
            if (!existingInStorage) {
                const newUser: User = {
                    username: username,
                    password: '1',
                    fullName: username.startsWith('TINH_') ? `Bộ CHQS Tỉnh ${selProvince || username.replace('TINH_', '')}` : `Ban CHQS ${selCommune || 'địa phương'}`,
                    role: username.startsWith('TINH_') ? 'PROVINCE_ADMIN' : (username.endsWith('_2') ? 'VIEWER' : 'EDITOR'),
                    unit: { province: selProvince || '', commune: selCommune || '' },
                    isLocked: true, 
                    isApproved: false
                };
                const updatedUsers = [...users, newUser];
                localStorage.setItem('military_users', JSON.stringify(updatedUsers));
                setError('Tài khoản đã được khởi tạo thành công nhưng đang ở trạng thái KHÓA mặc định. Vui lòng liên hệ Master Admin để được cấp quyền truy cập.');
            } else if (existingInStorage.isLocked) {
                setError('Tài khoản của đơn vị đang bị KHÓA. Vui lòng liên hệ Master Admin để mở khóa.');
            } else {
                onLogin(existingInStorage);
            }
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin.');
        }
    }
  };

  const handleUnitConfirm = () => {
      if (!selProvince || (selLevel === 'COMMUNE' && !selCommune)) {
          setError("Vui lòng chọn đơn vị đầy đủ");
          return;
      }
      const uName = generateUnitUsername(selProvince, selCommune, selLevel === 'PROVINCE' ? 'PROVINCE' : selAccountType);
      setUsername(uName);
      setMode('LOGIN');
      setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-military-900 overflow-hidden">
      
      <div className="absolute inset-0 z-0">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Qu%C3%A2n_hi%E1%BB%87u_Qu%C3%A2n_%C4%91%E1%BB%99i_nh%C3%A2n_d%C3%A2n_Vi%E1%BB%87t_Nam.png/1200px-Qu%C3%A2n_hi%E1%BB%87u_Qu%C3%A2n_%C4%91%E1%BB%99i_nh%C3%A2n_d%C3%A2n_Vi%E1%BB%87t_Nam.png"
            alt="Logo"
            className="w-full h-full object-cover object-center opacity-40 blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-military-900/80 to-military-800/90 mix-blend-multiply"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-military-800 to-military-700 p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-yellow-500 relative z-10">
                <ShieldAlert className="text-red-600 w-12 h-12" strokeWidth={2} />
             </div>
             <h1 className="text-2xl font-bold text-white uppercase tracking-wider drop-shadow-md">Hệ Thống Tuyển Quân</h1>
             <p className="text-military-100 text-sm mt-1 font-medium">Phần mềm hỗ trợ Ban CHQS địa phương</p>
             
             <div className="mt-5 pt-4 border-t border-military-600/50">
                <p className="text-military-200 text-[10px] uppercase tracking-widest">Bản quyền phần mềm thuộc về</p>
                <p className="text-yellow-400 text-sm font-bold uppercase tracking-wide mt-1 drop-shadow">Đại úy Thới Hạ Sang</p>
             </div>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50/50">
            <button 
                onClick={() => { setMode('LOGIN'); setError(''); }}
                className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider transition-all ${mode === 'LOGIN' ? 'text-military-700 border-b-2 border-military-600 bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
                Đăng nhập
            </button>
            <button 
                onClick={() => { setMode('UNIT_SELECT'); setError(''); }}
                 className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider transition-all ${mode === 'UNIT_SELECT' ? 'text-military-700 border-b-2 border-military-600 bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
                Lấy tài khoản
            </button>
        </div>

        <div className="p-8 max-h-[520px] overflow-y-auto custom-scrollbar">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-200 flex flex-col gap-1 mb-6 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2"><Lock size={18} className="shrink-0"/> <span className="font-bold uppercase">Truy cập bị từ chối</span></div>
                    <div className="text-xs ml-6 font-medium leading-relaxed mt-1">{error}</div>
                </div>
            )}

            {mode === 'LOGIN' && (
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">Tên đăng nhập (Username)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserCheck className="h-5 w-5 text-gray-400 group-focus-within:text-military-600 transition-colors" />
                            </div>
                            <input 
                                type="text" 
                                required
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-military-500 focus:border-transparent text-gray-900 transition-all font-mono"
                                placeholder="VD: BINHTHUAN_1"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">Mật khẩu</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key className="h-5 w-5 text-gray-400 group-focus-within:text-military-600 transition-colors" />
                            </div>
                            <input 
                                type="password" 
                                required
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-military-500 focus:border-transparent text-gray-900 transition-all"
                                placeholder="Nhập mật khẩu đơn vị..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-military-600 hover:bg-military-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-military-500 transition-all transform hover:-translate-y-0.5 uppercase tracking-wide"
                    >
                        <LogIn className="mr-2 h-5 w-5" /> Vào hệ thống
                    </button>
                    
                    <div className="text-center pt-2">
                        <p className="text-[10px] text-gray-400 font-medium italic">
                            * Lưu ý: Mọi tài khoản đơn vị mới sẽ bị khóa cho đến khi Master Admin phê duyệt.
                        </p>
                    </div>
                </form>
            )}

            {mode === 'UNIT_SELECT' && (
                <div className="space-y-4 animate-in slide-in-from-right-2">
                    <div className="bg-amber-50 p-3 rounded text-[11px] text-amber-800 mb-2 border border-amber-100 shadow-sm leading-relaxed">
                        <span className="font-bold uppercase text-red-600">Chú ý:</span> Bạn cần chọn đúng đơn vị của mình để nhận đúng tên đăng nhập chuẩn theo hệ thống. Master Admin sẽ dựa vào tên này để kích hoạt quyền cho bạn.
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <button
                            type="button"
                            onClick={() => { setSelLevel('COMMUNE'); setSelCommune(''); }}
                            className={`flex items-center justify-center p-2 rounded text-[10px] font-bold border transition-all ${selLevel === 'COMMUNE' ? 'bg-military-600 text-white border-military-700 shadow-inner' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                        >
                            <MapPin size={14} className="mr-1"/> CẤP XÃ / PHƯỜNG
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSelLevel('PROVINCE'); setSelCommune(''); }}
                            className={`flex items-center justify-center p-2 rounded text-[10px] font-bold border transition-all ${selLevel === 'PROVINCE' ? 'bg-red-700 text-white border-red-800 shadow-inner' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                        >
                            <Landmark size={14} className="mr-1"/> CẤP TỈNH
                        </button>
                    </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Chọn Tỉnh / Thành phố</label>
                        <select 
                            required
                            className="block w-full py-2.5 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-military-500 text-gray-900 bg-white"
                            value={selProvince}
                            onChange={(e) => { setSelProvince(e.target.value); setSelCommune(''); }}
                        >
                            <option value="">-- Chọn Tỉnh --</option>
                            {provinceList.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {selLevel === 'COMMUNE' && (
                        <div className="relative" ref={wrapperRef}>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tên Xã / Phường</label>
                            <input
                                type="text"
                                required
                                disabled={!selProvince}
                                placeholder={!selProvince ? "Hãy chọn Tỉnh ở trên trước" : "Nhập tên đơn vị..."}
                                className="block w-full py-2.5 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-military-500 text-gray-900 disabled:bg-gray-100 bg-white"
                                value={selCommune}
                                onChange={(e) => {
                                    setSelCommune(e.target.value);
                                    setShowCommuneSuggestions(true);
                                }}
                                onFocus={() => setShowCommuneSuggestions(true)}
                            />
                            {showCommuneSuggestions && selProvince && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                                    {filteredCommunes.map((c, index) => (
                                        <div 
                                            key={index}
                                            className="px-3 py-2.5 text-sm text-gray-800 hover:bg-military-50 cursor-pointer flex items-center gap-2 border-b border-gray-50 last:border-0"
                                            onClick={() => {
                                                setSelCommune(c);
                                                setShowCommuneSuggestions(false);
                                            }}
                                        >
                                            <MapPin size={12} className="text-military-400" />
                                            {c}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selLevel === 'COMMUNE' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Chọn loại tài khoản</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelAccountType('1')}
                                    className={`flex flex-col items-center justify-center p-2.5 rounded border-2 transition-all ${selAccountType === '1' ? 'border-military-600 bg-military-50 text-military-700 shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Edit3 size={18} className="mb-1.5"/>
                                    <span className="text-[10px] font-bold text-center leading-tight">TÀI KHOẢN 1<br/>(Nhập liệu)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelAccountType('2')}
                                    className={`flex flex-col items-center justify-center p-2.5 rounded border-2 transition-all ${selAccountType === '2' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Eye size={18} className="mb-1.5"/>
                                    <span className="text-[10px] font-bold text-center leading-tight">TÀI KHOẢN 2<br/>(Chỉ huy xem)</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center mt-2 shadow-inner">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Username đơn vị của bạn là:</p>
                        <p className="text-xl font-mono font-bold text-military-800 select-all">
                            {generateUnitUsername(selProvince, selCommune, selLevel === 'PROVINCE' ? 'PROVINCE' : selAccountType) || '---'}
                        </p>
                    </div>

                    <button 
                        onClick={handleUnitConfirm}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-military-600 hover:bg-military-700 uppercase tracking-wide transition-all"
                    >
                        Sử dụng tên này <ChevronRight className="ml-2 h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Login;
