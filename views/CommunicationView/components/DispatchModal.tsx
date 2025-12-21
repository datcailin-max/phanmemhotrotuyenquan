
import React, { useMemo } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { User } from '../../../types';
import { api } from '../../../api';
import { LOCATION_DATA } from '../../../constants';

interface DispatchModalProps {
  user: User;
  sessionYear: number;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
}

const DispatchModal: React.FC<DispatchModalProps> = ({ 
  user, sessionYear, isProcessing, setIsProcessing, onClose, onSuccess 
}) => {
  const communes = useMemo(() => {
    const pName = user.unit.province || "";
    // @ts-ignore
    const data = LOCATION_DATA[pName];
    return data ? Object.keys(data) : [];
  }, [user.unit.province]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const file = target.dispatchFile.files[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert("LỖI: File quá lớn (" + (file.size / 1024 / 1024).toFixed(1) + "MB). Vui lòng chọn file dưới 12MB.");
      return;
    }

    const selectedRecipients = Array.from(target.dispatchRecipients.selectedOptions).map((opt: any) => opt.value);
    if (selectedRecipients.length === 0) {
      alert("Vui lòng chọn ít nhất một đơn vị nhận.");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const newDispatch = {
        senderUsername: user.username,
        senderProvince: user.unit.province,
        title: target.dispatchTitle.value,
        url: ev.target?.result as string,
        recipients: selectedRecipients,
        year: sessionYear,
        timestamp: Date.now()
      };
      const res = await api.sendDispatch(newDispatch);
      setIsProcessing(false);
      if (res) {
        onSuccess();
        alert("Đã ban hành văn bản thành công!");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-blue-800 p-5 flex justify-between items-center text-white shadow-lg">
          <h3 className="font-bold uppercase flex items-center gap-2 text-sm">Ban hành văn bản chỉ đạo</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Tiêu đề văn bản</label>
            <input name="dispatchTitle" required type="text" placeholder="VD: Hướng dẫn công tác sơ tuyển năm mới" className="w-full border p-2.5 rounded-lg text-sm font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Đơn vị nhận (Giữ Ctrl để chọn nhiều)</label>
            <select name="dispatchRecipients" multiple required className="w-full border p-2 rounded-lg text-xs h-32 custom-scrollbar">
              <option value="ALL" className="font-bold text-blue-600">--- GỬI TOÀN BỘ CẤP XÃ ---</option>
              {communes.map(c => <option key={c} value={c}>Ban CHQS {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Chọn File PDF</label>
            <input name="dispatchFile" required type="file" accept=".pdf" className="w-full text-xs p-2 border border-dashed rounded-lg bg-blue-50/20" />
            <p className="text-[9px] text-red-500 mt-1 italic font-bold">* Giới hạn 12MB. Hệ thống không hỗ trợ file quá lớn.</p>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" disabled={isProcessing} onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500">Hủy</button>
            <button type="submit" disabled={isProcessing} className={`px-7 py-2 bg-blue-700 text-white rounded-lg font-black uppercase text-xs flex items-center gap-2 shadow-lg transition-all ${isProcessing ? 'opacity-50' : 'hover:bg-blue-800'}`}>
              {isProcessing ? <><RefreshCw size={14} className="animate-spin" /> Đang gửi...</> : 'Ban hành ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DispatchModal;
