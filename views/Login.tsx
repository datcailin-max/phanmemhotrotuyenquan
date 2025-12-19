
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShieldAlert, LogIn, Key, UserCheck, MapPin, Landmark, ChevronRight, Lock, Edit3, Eye } from 'lucide-react';
import { PROVINCES_VN, LOCATION_DATA, removeVietnameseTones, generateUnitUsername } from '../constants';
import { User } from '../types';
import { api } from '../api';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'UNIT_SELECT'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
    
    // Đặc cách cho tài khoản ADMIN mặc định nếu chưa có DB
    if (username === 'ADMIN' && password === '1') {
        onLogin({ username: 'ADMIN', fullName: 'Master Admin', role: 'ADMIN', unit: { province: '', commune: '' }, isLocked: false });
        setIsLoading(false);
        return;
    }

    const result = await api.login(username, password);
    if (typeof result === 'string') {
        setError(result);
    } else {
        onLogin(result);
    }
    setIsLoading(false);
  };

  const handleUnitConfirm = async () => {
      if (!selProvince || (selLevel === 'COMMUNE' && !selCommune)) {
          setError("Vui lòng chọn đơn vị đầy đủ");
          return;
      }
      const uName = generateUnitUsername(selProvince, selCommune, selLevel === 'PROVINCE' ? 'PROVINCE' : selAccountType);
      
      // Đồng bộ tài khoản lên server nếu chưa có
      await api.syncAccount({
          username: uName,
          password: '1',
          fullName: selLevel === 'PROVINCE' ? `Bộ CHQS Tỉnh ${selProvince}` : `Ban CHQS ${selCommune}`,
          role: selLevel === 'PROVINCE' ? 'PROVINCE_ADMIN' : (selAccountType === '2' ? 'VIEWER' : 'EDITOR'),
          unit: { province: selProvince, commune: selCommune },
          isLocked: true
      });

      setUsername(uName);
      setMode('LOGIN');
      setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-military-900 overflow-hidden">
      <div className="absolute inset-0 z-0">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Qu%C3%A2n_hi%E1%BB%87u_Qu%C3%A2n_%C4%91%E1%BB%99i_nh%C3%A2n_d%C3%A2n_Vi%E1%BB%87t_Nam.png/1200px-Qu%C3%A2n_hi%E1%BB%87u_Qu%C3%A2n_%C4%91%E1%BB%99i_nh%C3%A2n_d%C3%A2n_Vi%E1%BB%87t_Nam.png" className="w-full h-full object-cover opacity-40 blur-sm scale-110" alt="bg"/>
          <div className="absolute inset-0 bg-gradient-to-b from-military-900/80 to-military-800/90"></div>
      </div>

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in duration-300">
        <div className="bg-military-800 p-8 text-center text-white">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-yellow-500 shadow-lg">
                <ShieldAlert className="text-red-600 w-12 h-12" />
             </div>
             <h1 className="text-2xl font-bold uppercase tracking-wider">Hệ Thống Tuyển Quân</h1>
             <p className="text-military-200 text-xs mt-2 uppercase tracking-widest">Bản quyền: Đại úy Thới Hạ Sang</p>
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
                    <button type="submit" disabled={isLoading} className="w-full bg-military-600 text-white py-3 rounded-md font-bold uppercase text-sm shadow-lg hover:bg-military-700 transition-all disabled:bg-gray-400">
                        {isLoading ? 'Đang xác thực...' : 'Vào hệ thống'}
                    </button>
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
