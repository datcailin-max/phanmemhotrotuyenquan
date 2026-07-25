
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UsersRound, Search, ShieldCheck, ShieldAlert, Lock, Unlock, 
  RotateCcw, Trash2, MapPin, User as UserIcon, Phone, Mail, Award, Briefcase, RefreshCw,
  UserCheck, UserX, AlertCircle
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api';

interface AccountManagementProps {
  user: User;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ user }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LOCKED' | 'ACTIVE'>('ALL');

  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await api.getUsers();
    setUsers(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        u.username.toLowerCase().includes(search) || 
        (u.fullName || '').toLowerCase().includes(search) ||
        (u.personalName || '').toLowerCase().includes(search);
      
      const matchesRole = filterRole ? u.role === filterRole : true;
      const matchesStatus = filterStatus === 'ALL' ? true : (filterStatus === 'LOCKED' ? u.isLocked : !u.isLocked);
      
      return matchesSearch && matchesRole && matchesStatus && u.username !== user.username;
    });
  }, [users, searchTerm, filterRole, filterStatus, user.username]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => !u.isLocked).length,
    locked: users.filter(u => u.isLocked).length,
    province: users.filter(u => u.role === 'PROVINCE_ADMIN').length,
    commune: users.filter(u => u.role === 'EDITOR' || u.role === 'VIEWER').length
  }), [users]);

  const handleToggleLock = async (u: User) => {
    const action = u.isLocked ? 'Phê duyệt & Mở khóa' : 'Khóa';
    if (window.confirm(`Xác nhận ${action} tài khoản ${u.username}?`)) {
      const success = await api.updateUser(u.username, { isLocked: !u.isLocked });
      if (success) {
        setUsers(users.map(item => item.username === u.username ? { ...item, isLocked: !item.isLocked } : item));
        alert(`Đã ${action} tài khoản thành công.`);
      }
    }
  };

  const handleResetPassword = async (u: User) => {
    if (window.confirm(`Khôi phục mật khẩu tài khoản ${u.username} về mặc định là "1"?`)) {
      const success = await api.updateUser(u.username, { password: '1' });
      if (success) {
        alert("Đã khôi phục mật khẩu thành công. Mật khẩu mới là '1'.");
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">Master</span>;
      case 'PROVINCE_ADMIN': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter">Cấp Tỉnh</span>;
      default: return <span className="bg-military-100 text-military-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter">Cấp Xã</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header & Stats Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="bg-military-800 p-3 rounded-xl text-white shadow-lg">
                <UsersRound size={32} />
             </div>
             <div>
                <h2 className="text-xl font-black text-military-900 uppercase tracking-tight">Quản trị & Phê duyệt tài khoản</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Tổng số: {stats.total} đơn vị tham gia hệ thống</p>
             </div>
          </div>
          <button 
            onClick={fetchUsers} 
            className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-military-50 hover:text-military-600 transition-all border shadow-sm"
            title="Làm mới danh sách"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-[2]">
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center relative group overflow-hidden">
              <div className="absolute inset-0 bg-military-500/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Tất cả</p>
              <p className="text-2xl font-black text-military-900 relative z-10">{stats.total}</p>
           </div>
           <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm text-center animate-pulse">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Chờ duyệt</p>
              <p className="text-2xl font-black text-amber-700">{stats.locked}</p>
           </div>
           <div className="bg-green-50 p-4 rounded-2xl border border-green-200 shadow-sm text-center">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Đang mở</p>
              <p className="text-2xl font-black text-green-700">{stats.active}</p>
           </div>
           <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-sm text-center">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Cấp Tỉnh</p>
              <p className="text-2xl font-black text-blue-700">{stats.province}</p>
           </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 text-gray-300" size={18} />
            <input 
               type="text" 
               placeholder="Tìm theo Username, Tên đơn vị hoặc Tên cán bộ..."
               className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-military-50 font-medium text-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-2">
            <select 
               className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm font-bold text-gray-700 text-xs appearance-none outline-none min-w-[140px]"
               value={filterRole}
               onChange={(e) => setFilterRole(e.target.value)}
            >
               <option value="">-- Tất cả Vai trò --</option>
               <option value="PROVINCE_ADMIN">Cấp Tỉnh</option>
               <option value="EDITOR">Cấp Xã (Nhập liệu)</option>
               <option value="VIEWER">Cấp Xã (Chỉ xem)</option>
            </select>
            <select 
               className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm font-bold text-gray-700 text-xs appearance-none outline-none min-w-[140px]"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value as any)}
            >
               <option value="ALL">-- Tất cả Trạng thái --</option>
               <option value="LOCKED">Đang Khóa / Chờ duyệt</option>
               <option value="ACTIVE">Đã mở / Đang hoạt động</option>
            </select>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative min-h-[450px]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest sticky top-0 z-10 border-b">
              <tr>
                <th className="p-5 text-center w-12">STT</th>
                <th className="p-5">Đơn vị & Tài khoản</th>
                <th className="p-5">Cán bộ phụ trách</th>
                <th className="p-5">Thông tin liên hệ</th>
                <th className="p-5 text-center">Vai trò</th>
                <th className="p-5 text-center">Trạng thái an ninh</th>
                <th className="p-5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="p-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-military-500" size={32} />
                    <p className="text-gray-400 font-bold italic">Đang đồng bộ dữ liệu người dùng...</p>
                  </div>
                </td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={7} className="p-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="text-gray-200" size={48} />
                    <p className="text-gray-400 font-bold italic">Không tìm thấy tài khoản nào khớp với yêu cầu lọc.</p>
                  </div>
                </td></tr>
              ) : filteredUsers.map((u, i) => (
                <tr key={u.username} className={`group transition-all ${u.isLocked ? 'bg-amber-50/20' : 'hover:bg-military-50/30'}`}>
                  <td className="p-5 text-center text-gray-400 font-bold text-xs">{i + 1}</td>
                  <td className="p-5">
                    <div className="font-black text-military-900 uppercase text-xs tracking-tight">{u.fullName}</div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="bg-white text-military-600 px-1.5 py-0.5 rounded font-mono text-[9px] font-black border border-military-100 shadow-sm">{u.username}</span>
                      <MapPin size={10} className="text-military-300" />
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{u.unit.province}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                       <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${u.isLocked ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-military-100 text-military-700 border-military-200'}`}>
                          {u.personalName ? u.personalName.charAt(0) : '?'}
                       </div>
                       <div>
                          <div className="font-black text-gray-800 text-xs uppercase tracking-tight">{u.personalName || 'Chưa khai báo'}</div>
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-bold uppercase mt-1">
                             <Award size={10} className="text-amber-500" /> {u.rank || '...'} <span className="text-gray-300">|</span> <Briefcase size={10} className="text-blue-500" /> {u.position || '...'}
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="space-y-1.5">
                       <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                          <Phone size={12} className="text-military-400" /> {u.phoneNumber || '---'}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium lowercase">
                          <Mail size={12} className="text-gray-300" /> {u.email || '---'}
                       </div>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    {getRoleBadge(u.role)}
                  </td>
                  <td className="p-5 text-center">
                    {u.isLocked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black border border-amber-200 uppercase tracking-widest shadow-sm">
                        <Lock size={10}/> Chờ phê duyệt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[9px] font-black border border-green-200 uppercase tracking-widest shadow-sm">
                        <Unlock size={10}/> Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      {u.isLocked ? (
                        <button 
                          onClick={() => handleToggleLock(u)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-green-700 transition-all active:scale-90"
                          title="Phê duyệt tài khoản"
                        >
                          <UserCheck size={14} /> Phê duyệt
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleLock(u)}
                          className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Khóa tài khoản (Tạm dừng)"
                        >
                          <Lock size={16} />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleResetPassword(u)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Khôi phục mật khẩu (Reset về 1)"
                      >
                        <RotateCcw size={16} />
                      </button>
                      
                      <button 
                        className="p-2 bg-gray-50 text-gray-300 rounded-xl border border-gray-200 cursor-not-allowed"
                        disabled
                        title="Không có quyền xóa đơn vị"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Policy Banner */}
      <div className="bg-blue-900 text-white p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
         <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12"></div>
         <ShieldAlert size={48} className="text-amber-400 shrink-0 relative z-10" />
         <div className="relative z-10 flex-1 text-center md:text-left">
            <h4 className="font-black uppercase tracking-wider text-sm mb-1.5">Nguyên tắc quản trị an ninh mạng:</h4>
            <p className="text-xs text-blue-100 font-medium leading-relaxed">
              Mặc định mọi tài khoản đơn vị sau khi khởi tạo đều ở trạng thái <b>Khóa (Chờ phê duyệt)</b>. Quản trị viên (Master Admin) có trách nhiệm xác minh danh tính cán bộ qua điện thoại hoặc công văn trước khi thực hiện Mở khóa. Tuyệt đối không Reset mật khẩu cho các đầu mối chưa rõ danh tính.
            </p>
         </div>
         <div className="shrink-0 flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
            <AlertCircle size={16} className="text-amber-300" />
            <span className="text-[10px] font-black uppercase tracking-widest">Quy định 124-BQP</span>
         </div>
      </div>
    </div>
  );
};

export default AccountManagement;
