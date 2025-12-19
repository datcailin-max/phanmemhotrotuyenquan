
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShieldAlert, LogIn, Key, UserCheck, MapPin, Landmark, ChevronRight, Lock, Edit3, Eye, HelpCircle, CheckCircle2 } from 'lucide-react';
import { PROVINCES_VN, LOCATION_DATA, removeVietnameseTones, generateUnitUsername } from '../constants';
import { User, UserRole } from '../types';
import { api } from '../api';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'UNIT_SELECT' | 'FORGOT'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [selLevel, setSelLevel] = useState<'COMMUNE' | 'PROVINCE'>('COMMUNE');
  const [selProvince, setSelProvince] = useState('');
  const [selCommune, setSelCommune] = useState('');
  const [selAccountType, setSelAccountType] = useState<'1' | '2'>('1');
  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const communeList = useMemo(() => {
    // @ts-ignore
    const provinceData = LOCATION_DATA[selProvince];
    return provinceData ? Object.keys(provinceData) : [];
  }, [selProvince]);

  const filteredCommunes = useMemo(() => {
      if (!selCommune) return communeList;
      const search = removeVietnameseTones(selCommune.toLowerCase());
      return communeList.filter(c => removeVietnameseTones(c.toLowerCase()).includes(search));
  }, [selCommune, communeList]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // 1. Thử đăng nhập qua API trước (Để hỗ trợ mật khẩu đã đổi trong DB)
    const result = await api.login(username, password);
    
    if (typeof result !== 'string') {
        // Đăng nhập thành công từ database
        onLogin(result);
        setIsLoading(false);
        return;
    }

    // 2. Nếu đăng nhập API thất bại, kiểm tra xem có phải ADMIN sử dụng mật khẩu mặc định "1" không
    if (username === 'ADMIN' && password === '1') {
        const adminData: User = { 
            username: 'ADMIN', 
            fullName: 'Master Admin', 
            role: 'ADMIN', 
            unit: { province: '', commune: '' }, 
            isLocked: false, 
            password: '1' 
        };
        
        // Đồng bộ tài khoản ADMIN vào database nếu chưa có để sau này có thể đổi mật khẩu
        await api.syncAccount(adminData);
        
        onLogin(adminData);
        setIsLoading(false);
        return;
    }

    // 3. Nếu không khớp cả hai trường hợp trên thì báo lỗi
    setError(result);
    setIsLoading(false);
  };

  const handleUnitConfirm = async () => {
      if (!selProvince || (selLevel === 'COMMUNE' && !selCommune)) {
          setError("Vui lòng chọn đơn vị đầy đủ");
          return;
      }
      const uName = generateUnitUsername(selProvince, selCommune, selLevel === 'PROVINCE' ? 'PROVINCE' : selAccountType);
      
      const role = (selLevel === 'PROVINCE' ? 'PROVINCE_ADMIN' : (selAccountType === '2' ? 'VIEWER' : 'EDITOR')) as UserRole;

      await api.syncAccount({
          username: uName,
          password: '1',
          fullName: selLevel === 'PROVINCE' ? `Bộ CHQS Tỉnh ${selProvince}` : `Ban CHQS ${selCommune}`,
          role: role,
          unit: { province: selProvince, commune: selCommune },
          isLocked: true
      });

      setUsername(uName);
      setMode('LOGIN');
      setError('');
  };

  const handleRequestPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      const target = e.target as any;
      const u = target.userReq.value;
      const p = target.phoneReq.value;
      
      setIsLoading(true);
      const res = await api.createFeedback({
          username: u,
          unitName: 'Yêu cầu cấp lại mật khẩu',
          category: 'MẬT KHẨU',
          content: `Yêu cầu cấp lại mật khẩu cho tài khoản ${u}. SĐT liên hệ: ${p}`,
          isRead: false
      });
      setIsLoading(false);
      
      if (res) {
          setMsg("Yêu cầu đã được gửi tới Master Admin. Vui lòng chờ phản hồi qua SĐT hoặc liên hệ Zalo 0334 429 954.");
          setTimeout(() => { setMode('LOGIN'); setMsg(''); }, 5000);
      }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-military-900 overflow-hidden">
      <div className="absolute inset-0 z-0">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Qu%C3%A2n_hi%E1%BB%87u_Qu%C3%A2n_%C4%91%E1%BB%99i_nh%C3%A2n_d%C3%A2n_Vi%E1%BB%87t_Nam.png/1200px-Qu%C3%A2n_hi%E1%BB%87u_Qu%C3%A2n_%C4%91%E1%BB%99i_nh%C3%A2n_d%C3%A2n_Vi%E1%BB%87t_Nam.png" className="w-full h-full object-cover opacity-30 blur-sm scale-110" alt="bg"/>
          <div className="absolute inset-0 bg-gradient-to-b from-military-900/80 to-military-800/90"></div>
      </div>

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in duration-300">
        <div className="bg-military-800 p-6 text-center text-white">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-yellow-500 shadow-lg">
                <ShieldAlert className="text-red-600 w-10 h-10" />
             </div>
             <h1 className="text-xl font-bold uppercase tracking-wider">Hệ Thống Tuyển Quân</h1>
             <p className="text-military-200 text-[10px] mt-1 uppercase tracking-widest italic">Tác giả: Đại úy Thới Hạ Sang</p>
        </div>

        <div className="flex border-b border-gray-200">
            <button onClick={() => setMode('LOGIN')} className={`flex-1 py-3 text-xs font-bold uppercase ${mode === 'LOGIN' ? 'text-military-700 border-b-2 border-military-600 bg-white' : 'text-gray-400'}`}>Đăng nhập</button>
            <button onClick={() => setMode('UNIT_SELECT')} className={`flex-1 py-3 text-xs font-bold uppercase ${mode === 'UNIT_SELECT' ? 'text-military-700 border-b-2 border-military-600 bg-white' : 'text-gray-400'}`}>Lấy tài khoản</button>
        </div>

        <div className="p-8">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-xs border border-red-200 mb-4 flex items-center gap-2">
                    <Lock size={16} className="shrink-0"/> <span>{error}</span>
                </div>
            )}
            {msg && (
                <div className="bg-green-50 text-green-700 p-4 rounded text-xs border border-green-200 mb-4 flex items-center gap-2 font-bold animate-pulse">
                    <CheckCircle2 size={24} className="shrink-0"/> <span>{msg}</span>
                </div>
            )}

            {mode === 'LOGIN' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Tên đăng nhập</label>
                        <div className="relative">
                            <UserCheck className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                            <input type="text" required className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-military-500 outline-none font-mono" value={username} onChange={e => setUsername(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Mật khẩu</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                            <input type="password" required className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-military-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setMode('FORGOT')} className="text-[10px] font-bold text-military-600 hover:underline">Quên mật khẩu?</button>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-military-600 text-white py-3 rounded-md font-bold uppercase text-sm shadow-lg hover:bg-military-700 transition-all disabled:bg-gray-400">
                        {isLoading ? 'Đang xác thực...' : 'Vào hệ thống'}
                    </button>
                </form>
            ) : mode === 'FORGOT' ? (
                <form onSubmit={handleRequestPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-amber-50 p-3 rounded border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                        Nhập Username của đơn vị bạn. Master Admin sẽ liên hệ lại để cấp lại mật khẩu mới.
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Username cần cấp lại</label>
                        <input name="userReq" type="text" required className="w-full p-2 border rounded-md font-mono text-sm" placeholder="VD: BINHPHUOC_XADONGXOAI_1" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Số điện thoại liên hệ</label>
                        <input name="phoneReq" type="tel" required className="w-full p-2 border rounded-md text-sm" placeholder="Nhập SĐT cán bộ" />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setMode('LOGIN')} className="flex-1 py-2 text-xs font-bold text-gray-500 border rounded-md">Hủy bỏ</button>
                        <button type="submit" disabled={isLoading} className="flex-[2] bg-military-700 text-white py-2 rounded-md font-bold text-xs uppercase shadow-md">Gửi yêu cầu</button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setSelLevel('COMMUNE')} className={`p-2 rounded text-[10px] font-bold border ${selLevel === 'COMMUNE' ? 'bg-military-600 text-white' : 'bg-gray-50'}`}>XÃ / PHƯỜNG</button>
                        <button onClick={() => setSelLevel('PROVINCE')} className={`p-2 rounded text-[10px] font-bold border ${selLevel === 'PROVINCE' ? 'bg-red-700 text-white' : 'bg-gray-50'}`}>CẤP TỈNH</button>
                    </div>
                    <select className="w-full p-2 border rounded text-sm" value={selProvince} onChange={e => setSelProvince(e.target.value)}>
                        <option value="">-- Chọn Tỉnh --</option>
                        {PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {selLevel === 'COMMUNE' && (
                        <div className="relative" ref={wrapperRef}>
                            <input type="text" placeholder="Tên Xã/Phường..." className="w-full p-2 border rounded text-sm" value={selCommune} onChange={e => {setSelCommune(e.target.value); setShowCommuneSuggestions(true);}} onFocus={() => setShowCommuneSuggestions(true)} />
                            {showCommuneSuggestions && selProvince && (
                                <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-xl max-h-40 overflow-y-auto">
                                    {filteredCommunes.map((c, i) => <div key={i} className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer" onClick={() => {setSelCommune(c); setShowCommuneSuggestions(false);}}>{c}</div>)}
                                </div>
                            )}
                        </div>
                    )}
                    {selLevel === 'COMMUNE' && (
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setSelAccountType('1')} className={`p-2 border rounded flex flex-col items-center ${selAccountType === '1' ? 'border-military-600 bg-military-50' : ''}`}><Edit3 size={16}/><span className="text-[9px] font-bold">NHẬP LIỆU</span></button>
                            <button onClick={() => setSelAccountType('2')} className={`p-2 border rounded flex flex-col items-center ${selAccountType === '2' ? 'border-blue-600 bg-blue-50' : ''}`}><Eye size={16}/><span className="text-[9px] font-bold">CHỈ HUY</span></button>
                        </div>
                    )}
                    <div className="p-3 bg-gray-100 rounded text-center">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Username của đơn vị:</p>
                        <p className="text-lg font-mono font-bold text-military-800">{generateUnitUsername(selProvince, selCommune, selLevel === 'PROVINCE' ? 'PROVINCE' : selAccountType)}</p>
                    </div>
                    <button onClick={handleUnitConfirm} className="w-full bg-military-600 text-white py-3 rounded-md font-bold uppercase text-sm">Sử dụng tên này</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Login;
