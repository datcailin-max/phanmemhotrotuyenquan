
import React from 'react';
import { X, Lock, CheckCircle2 } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPass: string;
  setNewPass: (val: string) => void;
  confirmPass: string;
  setConfirmPass: (val: string) => void;
  onSave: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ 
  isOpen, onClose, newPass, setNewPass, confirmPass, setConfirmPass, onSave 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-red-800 p-5 flex justify-between items-center text-white">
          <h3 className="font-bold uppercase flex items-center gap-2 text-sm"><Lock size={18}/> Thiết lập bảo mật</h3>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><X size={24}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Mật khẩu mới</label>
            <input type="password" placeholder="Nhập mật khẩu mới..." className="w-full border p-3 rounded-xl font-bold text-sm" value={newPass} onChange={e => setNewPass(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Xác nhận mật khẩu</label>
            <input type="password" placeholder="Nhập lại mật khẩu..." className="w-full border p-3 rounded-xl font-bold text-sm" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
          </div>
          <button onClick={onSave} className="w-full bg-red-700 text-white py-3 rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-red-800 active:scale-95 transition-all">
            <CheckCircle2 size={18}/> Xác nhận thay đổi
          </button>
          <p className="text-[9px] text-center text-gray-400 italic">Lưu ý: Bạn nên ghi lại mật khẩu để tránh gián đoạn công tác.</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
