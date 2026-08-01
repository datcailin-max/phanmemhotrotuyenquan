
import React, { useState, useEffect } from 'react';
import { UserX, GraduationCap, MapPin, Edit3 } from 'lucide-react';

interface RemovalModalProps {
  reason: string;
  setReason: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const RemovalModal: React.FC<RemovalModalProps> = ({ reason, setReason, onClose, onConfirm }) => {
  const [selectedOption, setSelectedOption] = useState<'MILITARY' | 'TRANSFER' | 'OTHER'>('MILITARY');

  useEffect(() => {
    if (!reason) {
      setReason('Đang học tại các trường trong quân đội');
      setSelectedOption('MILITARY');
    } else {
      const lower = reason.toLowerCase();
      if (lower.includes('quân đội') || lower.includes('trường qđ') || lower.includes('học qđ') || lower.includes('sĩ quan')) {
        setSelectedOption('MILITARY');
      } else if (lower.includes('chuyển khẩu') || lower.includes('chuyển hộ khẩu') || lower.includes('chuyển đi')) {
        setSelectedOption('TRANSFER');
      } else {
        setSelectedOption('OTHER');
      }
    }
  }, []);

  const handleSelectType = (type: 'MILITARY' | 'TRANSFER' | 'OTHER') => {
    setSelectedOption(type);
    if (type === 'MILITARY') {
      setReason('Đang học tại các trường trong quân đội');
    } else if (type === 'TRANSFER') {
      setReason('Chuyển hộ khẩu / chuyển khẩu sang địa phương khác');
    } else if (type === 'OTHER' && (reason.includes('quân đội') || reason.includes('chuyển khẩu'))) {
      setReason('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
        <h3 className="font-black text-lg text-military-900 uppercase tracking-tight mb-2 flex items-center gap-2">
          <UserX className="text-red-600"/> Đưa ra khỏi danh sách nguồn
        </h3>
        <p className="text-xs text-gray-500 mb-4 font-medium italic">
          * Chọn danh sách lý do (12.1, 12.2, 12.3) phù hợp:
        </p>

        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={() => handleSelectType('MILITARY')}
            className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
              selectedOption === 'MILITARY'
                ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <GraduationCap size={20} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase text-blue-950">12.1. Đang học trường quân đội</p>
              <p className="text-[10px] text-gray-500 font-semibold">Đang học tại các trường trong quân đội</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectType('TRANSFER')}
            className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
              selectedOption === 'TRANSFER'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MapPin size={20} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase text-emerald-950">12.2. Chuyển hộ khẩu</p>
              <p className="text-[10px] text-gray-500 font-semibold">Đã chuyển hộ khẩu / chuyển khẩu sang địa phương khác</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectType('OTHER')}
            className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
              selectedOption === 'OTHER'
                ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Edit3 size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase text-amber-950">12.3. Các lý do khác</p>
              <p className="text-[10px] text-gray-500 font-semibold">Vi phạm pháp luật, đã thực hiện NVQS trước đó...</p>
            </div>
          </button>
        </div>

        <textarea 
          className="w-full border-gray-200 border rounded-xl p-3 text-xs mb-6 focus:ring-2 focus:ring-military-50 outline-none font-bold" 
          rows={3} 
          placeholder="Nhập chi tiết lý do..." 
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
