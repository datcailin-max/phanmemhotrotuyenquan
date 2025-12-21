
import React from 'react';
import { X, User as UserIcon, Save } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { 
    personalName: string; 
    rank: string; 
    position: string; 
    email: string; 
    phoneNumber: string; 
  };
  setData: (data: any) => void;
  onSave: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, data, setData, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-military-800 p-5 flex justify-between items-center text-white">
          <h3 className="font-bold uppercase flex items-center gap-2 text-sm"><UserIcon size={18}/> Thông tin cá nhân cán bộ</h3>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><X size={24}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Họ và tên cán bộ</label>
            <input className="w-full border p-2.5 rounded-xl font-bold text-sm" value={data.personalName} onChange={e => setData({...data, personalName: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Cấp bậc</label>
              <input className="w-full border p-2.5 rounded-xl font-bold text-sm" value={data.rank} onChange={e => setData({...data, rank: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Chức vụ</label>
              <input className="w-full border p-2.5 rounded-xl font-bold text-sm" value={data.position} onChange={e => setData({...data, position: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Số điện thoại</label>
            <input className="w-full border p-2.5 rounded-xl font-bold text-sm" value={data.phoneNumber} onChange={e => setData({...data, phoneNumber: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Email liên hệ</label>
            <input className="w-full border p-2.5 rounded-xl font-bold text-sm" value={data.email} onChange={e => setData({...data, email: e.target.value})} />
          </div>
          <button onClick={onSave} className="w-full bg-military-700 text-white py-3 rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-military-800 active:scale-95 transition-all">
            <Save size={18}/> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
