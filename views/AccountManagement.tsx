
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UsersRound, Search, ShieldCheck, ShieldAlert, Lock, Unlock, 
  RotateCcw, Trash2, MapPin, User as UserIcon, Phone, Mail, Award, Briefcase, RefreshCw
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
      
      // Không hiển thị chính mình trong danh sách quản lý để tránh tự khóa
      return matchesSearch && matchesRole && u.username !== user.username;
    });
  }, [users, searchTerm, filterRole, user.username]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => !u.isLocked).length,
    locked: users.filter(u => u.isLocked).length,
    province: users.filter(u => u.role === 'PROVINCE_ADMIN').length,
    commune: users.filter(u => u.role === 'EDITOR' || u.role === 'VIEWER').length
  }), [users]);

  const handleToggleLock = async (u: User) => {
    const action = u.isLocked ? 'mở khóa' : 'khóa';
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản ${u.username}?`)) {
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
        alert("Đã khôi phục mật khẩu thành công. Vui lòng báo đơn vị đăng nhập và đổi lại mật khẩu ngay.");
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
                <h2 className="text-xl font-black text-military-900 uppercase tracking-tight">Hệ thống quản lý tài khoản</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Cấp quyền & Giám sát an ninh đơn vị</p>
             </div>
          </div>
          <button 
            onClick={fetchUsers} 
            className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-military-50 hover:text-military-600 transition-all border"
            title="Làm mới danh sách"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-[2]">
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng cộng</p>
              <p className="text-2xl font-black text-military-900">{stats.total}</p>
           </div>
           <div className="bg-green-50 p-4 rounded-2xl border border-green-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Đang mở</p>
              <p className="text-2xl font-black text-green-700">{stats.active}</p>
           </div>
           <div className="bg-red-50 p-4 rounded-2xl border border-red-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Bị khóa</p>
              <p className="text-2xl font-black text-red-700">{stats.locked}</p>
           </div>
           <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Cấp Tỉnh</p>
              <p className="text-2xl font-black text-blue-700">{stats.province}</p>
           </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 text-gray-300" size={20} />
            <input 
               type="text" 
               placeholder="Tìm theo Username, Tên đơn vị hoặc Tên cán bộ..."
               className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-military-50 font-medium"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="w-full md:w-64 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-2">
            <UserIcon size={18} className="text-gray-400" />
            <select 
               className="w-full bg-transparent outline-none font-bold text-gray-700 text-sm appearance-none"
               value={filterRole}
               onChange={(e) => setFilterRole(e.target.value)}
            >
               <option value="">Tất cả vai trò</option>
               <option value="PROVINCE_ADMIN">Cấp Tỉnh</option>
               <option value="EDITOR">Cấp Xã (Nhập liệu)</option>
               <option value="VIEWER">Cấp Xã (Chỉ xem)</option>
            </select>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative min-h-[400px]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest sticky top-0 z-10 border-b">
              <tr>
                <th className="p-5 text-center w-12">STT</th>
                <th className="p-5">Tên đơn vị & Tài khoản</th>
                <th className="p-5">Thông tin cán bộ phụ trách</th>
                <th className="p-5">Liên hệ</th>
                <th className="p-5 text-center">Vai trò</th>
                <th className="p-5 text-center">Trạng thái</th>
                <th className="p-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="p-20 text-center text-gray-400 italic font-bold">Đang đồng bộ dữ liệu người dùng...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={7} className="p-20 text-center text-gray-400 italic font-bold">Không tìm thấy tài khoản nào phù hợp.</td></tr>
              ) : filteredUsers.map((u, i) => (
                <tr key={u.username} className={`group hover:bg-military-50/30 transition-colors ${u.isLocked ? 'bg-gray-50/50' : ''}`}>
                  <td className="p-5 text-center text-gray-400 font-bold">{i + 1}</td>
                  <td className="p-5">
                    <div className="font-black text-military-900 uppercase text-xs">{u.fullName}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border border-gray-200">{u.username}</span>
                      <MapPin size={10} className="text-gray-300" />
                      <span className="text-[9px] text-gray-400 font-bold uppercase">{u.unit.province}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-military-100 rounded-full flex items-center justify-center text-military-600 font-black text-xs shrink-0">
                          {u.personalName ? u.personalName.charAt(0) : '?'}
                       </div>
                       <div>
                          <div className="font-bold text-gray-800 text-xs">{u.personalName || 'Chưa cập nhật'}</div>
                          <div className="flex items-center gap-1 text-[9px] text-gray-500 font-black uppercase mt-0.5">
                             <Award size={10} className="text-amber-500" /> {u.rank || '---'} | <Briefcase size={10} className="text-blue-500" /> {u.position || '---'}
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="space-y-1">
                       <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                          <Phone size={12} className="text-gray-400" /> {u.phoneNumber || '---'}
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium lowercase">
                          <Mail size={12} className="text-gray-300" /> {u.email || '---'}
                       </div>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    {getRoleBadge(u.role)}
                  </td>
                  <td className="p-5 text-center">
                    {u.isLocked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-black border border-red-100 uppercase">
                        <Lock size={10}/> Đã khóa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black border border-green-100 uppercase">
                        <Unlock size={10}/> Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleToggleLock(u)}
                        className={`p-2 rounded-xl border transition-all ${u.isLocked ? 'bg-green-600 text-white border-green-700 shadow-md' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white'}`}
                        title={u.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                      >
                        {u.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                      <button 
                        onClick={() => handleResetPassword(u)}
                        className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 hover:bg-amber-600 hover:text-white transition-all"
                        title="Khôi phục mật khẩu về mặc định (1)"
                      >
                        <RotateCcw size={16} />
                      </button>
                      {u.role !== 'PROVINCE_ADMIN' && (
                        <button 
                          className="p-2 bg-gray-50 text-gray-400 rounded-xl border border-gray-200 hover:bg-red-600 hover:text-white transition-all"
                          title="Xóa tài khoản (Liên hệ dev)"
                          disabled
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-4 shadow-inner">
         <ShieldAlert size={24} className="text-amber-600 shrink-0 mt-1" />
         <div className="text-xs text-amber-900 leading-relaxed font-medium">
            <p className="font-black uppercase mb-1">Quy định bảo mật Quản trị viên:</p>
            Mọi thao tác Khóa hoặc Reset mật khẩu sẽ có hiệu lực ngay lập tức. Cán bộ quản lý cấp Xã/Tỉnh sẽ nhận được thông báo lỗi xác thực nếu tài khoản bị khóa. 
            Vui lòng thực hiện Reset mật khẩu chỉ khi có yêu cầu chính thức từ đơn vị qua SĐT liên hệ hoặc Hệ thống Hỏi đáp.
         </div>
      </div>
    </div>
  );
};

export default AccountManagement;
