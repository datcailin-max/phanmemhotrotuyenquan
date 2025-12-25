
import React from 'react';
import { UserX } from 'lucide-react';

interface RemovalModalProps {
  reason: string;
  setReason: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const RemovalModal: React.FC<RemovalModalProps> = ({ reason, setReason, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
        <h3 className="font-black text-lg text-military-900 uppercase tracking-tight mb-2 flex items-center gap-2"><UserX className="text-red-600"/> Đưa ra khỏi danh sách nguồn</h3>
        <p className="text-xs text-gray-500 mb-4 font-medium italic">* Vui lòng ghi rõ lý do (Chuyển HK, đã đi nghĩa vụ trước đó, vi phạm pháp luật...)</p>
        <textarea 
          className="w-full border-gray-200 border rounded-xl p-4 text-sm mb-6 focus:ring-2 focus:ring-military-50 outline-none font-bold" 
          rows={4} 
          placeholder="Nhập lý do chi tiết..." 
          value={reason} 
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-gray-500 font-black text-xs uppercase">Đóng</button>
          <button 
            onClick={onConfirm} 
            disabled={!reason.trim()} 
            className="px-8 py-2.5 bg-red-600 text-white rounded-xl font-black text-xs uppercase shadow-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemovalModal;
