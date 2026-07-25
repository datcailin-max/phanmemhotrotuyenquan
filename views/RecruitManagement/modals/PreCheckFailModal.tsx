
import React, { useState } from 'react';
import { XCircle, X, Save } from 'lucide-react';
import { Recruit } from '../../../types';

interface PreCheckFailModalProps {
  recruit: Recruit | null;
  onClose: () => void;
  onApply: (reason: string) => void;
}

const PreCheckFailModal: React.FC<PreCheckFailModalProps> = ({ recruit, onClose, onApply }) => {
  const [reason, setReason] = useState('');

  if (!recruit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do loại sơ tuyển!");
      return;
    }
    onApply(reason.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-orange-600 p-5 flex justify-between items-center text-white shadow-lg">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-lg"><XCircle size={20}/></div>
             <h3 className="font-black uppercase text-sm tracking-tight">Xác định lý do Loại sơ tuyển</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><X size={24}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
             <p className="text-[10px] font-black text-orange-700 uppercase mb-1 tracking-widest">Công dân xử lý:</p>
             <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{recruit.fullName}</p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 tracking-widest">Lý do không đạt sơ tuyển</label>
            <textarea 
              autoFocus
              className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-orange-500 focus:ring-2 focus:ring-orange-50 outline-none transition-all"
              rows={4}
              placeholder="VD: Vi phạm đạo đức, Sức khỏe không đảm bảo, Chấp hành án phạt..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-6 py-3 text-xs font-black text-gray-500 uppercase hover:bg-gray-50 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="flex-[2] bg-orange-600 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-orange-700 transition-all active:scale-95"
            >
              <Save size={18} /> Xác nhận & Lưu lý do
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreCheckFailModal;
