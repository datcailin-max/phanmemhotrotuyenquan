
import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import { User } from '../../../types';
import { api } from '../../../api';

interface ReportModalProps {
  user: User;
  sessionYear: number;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ 
  user, sessionYear, isProcessing, setIsProcessing, onClose, onSuccess 
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const file = target.reportFile.files[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert("LỖI: File quá lớn (" + (file.size / 1024 / 1024).toFixed(1) + "MB). Vui lòng chọn file dưới 12MB.");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const newReport = {
        senderUsername: user.username,
        senderUnitName: user.fullName,
        targetProvince: user.unit.province,
        title: target.reportTitle.value,
        url: ev.target?.result as string,
        year: sessionYear,
        timestamp: Date.now()
      };
      const res = await api.sendReport(newReport);
      setIsProcessing(false);
      if (res) {
        onSuccess();
        alert("Đã gửi báo cáo thành công!");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-military-800 p-5 flex justify-between items-center text-white">
          <h3 className="font-bold uppercase flex items-center gap-2 text-sm">Gửi báo cáo lên Tỉnh</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Tiêu đề báo cáo</label>
            <input name="reportTitle" required type="text" placeholder="VD: Báo cáo kết quả khám tuyển đợt 1" className="w-full border p-2.5 rounded-lg text-sm font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Chọn File PDF</label>
            <input name="reportFile" required type="file" accept=".pdf" className="w-full text-xs p-2 border border-dashed rounded-lg bg-gray-50" />
            <p className="text-[9px] text-red-500 mt-1 italic font-bold">* Giới hạn tối đa 12MB. Chỉ nhận file PDF.</p>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" disabled={isProcessing} onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500">Hủy</button>
            <button type="submit" disabled={isProcessing} className={`px-7 py-2 bg-military-700 text-white rounded-lg font-black uppercase text-xs flex items-center gap-2 shadow-lg transition-all ${isProcessing ? 'opacity-50' : 'hover:bg-military-800'}`}>
              {isProcessing ? <><RefreshCw size={14} className="animate-spin" /> Đang tải...</> : 'Xác nhận gửi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
