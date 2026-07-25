
import React, { useState, useMemo } from 'react';
import { X, MapPin, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Recruit } from '../../../types';

interface BulkVillageRenameModalProps {
  recruits: Recruit[];
  onClose: () => void;
  onConfirm: (oldName: string, newName: string) => Promise<void>;
}

const BulkVillageRenameModal: React.FC<BulkVillageRenameModalProps> = ({ recruits, onClose, onConfirm }) => {
  const [oldVillage, setOldVillage] = useState('');
  const [newVillage, setNewVillage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Lấy danh sách các thôn/ấp duy nhất hiện có trong dữ liệu
  const existingVillages = useMemo(() => {
    const villages = recruits.map(r => r.address.village).filter(v => !!v);
    // Fix: Explicitly type sort parameters as strings to resolve 'localeCompare' error on 'unknown' type
    return Array.from(new Set(villages)).sort((a: string, b: string) => a.localeCompare(b));
  }, [recruits]);

  // Tính số lượng công dân sẽ bị ảnh hưởng
  const affectedCount = useMemo(() => {
    if (!oldVillage) return 0;
    return recruits.filter(r => r.address.village === oldVillage).length;
  }, [oldVillage, recruits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldVillage || !newVillage.trim()) return;

    if (oldVillage === newVillage.trim()) {
        alert("Tên mới không được trùng với tên cũ.");
        return;
    }

    const confirmMessage = `Xác nhận đổi tên đồng loạt:\n- Từ: "${oldVillage}"\n- Sang: "${newVillage.trim()}"\n\nSẽ có ${affectedCount} hồ sơ được cập nhật địa chỉ. Bạn có chắc chắn không?`;
    
    if (window.confirm(confirmMessage)) {
      setIsProcessing(true);
      await onConfirm(oldVillage, newVillage.trim());
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-military-700 p-5 flex justify-between items-center text-white">
          <h3 className="font-bold uppercase flex items-center gap-2 text-sm">
            <RefreshCw size={20} className={isProcessing ? 'animate-spin' : ''} />
            Đổi tên Thôn/Ấp đồng loạt
          </h3>
          <button onClick={onClose} disabled={isProcessing}><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
             <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
             <div className="text-xs text-blue-800 leading-relaxed font-medium">
               Tính năng này giúp cập nhật địa chỉ nhanh chóng khi địa phương có sự thay đổi tên gọi hành chính của Thôn, Ấp, Tổ dân phố.
             </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 tracking-widest">Chọn Thôn/Ấp cũ (Hiện tại)</label>
              <select 
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:border-military-500 outline-none"
                value={oldVillage}
                onChange={e => setOldVillage(e.target.value)}
                disabled={isProcessing}
              >
                <option value="">-- Chọn thôn/ấp cần đổi --</option>
                {existingVillages.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              {oldVillage && (
                <p className="mt-2 text-[10px] font-black text-military-600 uppercase flex items-center gap-1">
                   <CheckCircle2 size={12}/> Có {affectedCount} công dân đang ở địa chỉ này
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 tracking-widest">Nhập tên Thôn/Ấp mới</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  required
                  type="text"
                  placeholder="VD: Thôn Mới (thay cho Thôn A)..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold focus:border-military-500 outline-none uppercase"
                  value={newVillage}
                  onChange={e => setNewVillage(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              disabled={isProcessing} 
              onClick={onClose} 
              className="flex-1 py-3 text-xs font-black text-gray-500 uppercase border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isProcessing || !oldVillage || !newVillage.trim()}
              className="flex-[2] bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-military-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkVillageRenameModal;
