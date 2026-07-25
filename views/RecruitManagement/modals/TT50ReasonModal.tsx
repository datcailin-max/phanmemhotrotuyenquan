
import React from 'react';
import { X, BookX, Info } from 'lucide-react';
import { TT50_REASONS } from '../../../constants/legal';

interface TT50ReasonModalProps {
  onClose: () => void;
  onApply: (reason: string, index: number) => void;
}

const TT50ReasonModal: React.FC<TT50ReasonModalProps> = ({ onClose, onApply }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg"><BookX size={20}/></div>
             <h3 className="font-bold uppercase text-sm tracking-tight">Xác định lý do KTC, CGNN (DS 5)</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><X size={24}/></button>
        </div>
        
        <div className="bg-slate-50 p-4 border-b border-slate-200">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                <Info size={14}/> Hướng dẫn phân loại
            </p>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="text-[9px] font-bold text-slate-600 bg-white p-2 rounded border border-slate-200">
                    Lý do 1 - 13: Sẽ đưa vào <span className="text-red-600">5.1. KHÔNG TUYỂN CHỌN</span>
                </div>
                <div className="text-[9px] font-bold text-slate-600 bg-white p-2 rounded border border-slate-200">
                    Lý do 14 - 17: Sẽ đưa vào <span className="text-blue-600">5.2. CHƯA GỌI NHẬP NGŨ</span>
                </div>
            </div>
        </div>

        <div className="p-4 space-y-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {TT50_REASONS.map((reason, idx) => {
            const isNoSelect = idx <= 12;
            return (
              <button 
                key={idx} 
                onClick={() => onApply(reason, idx)} 
                className={`w-full text-left p-3 text-[11px] font-bold border rounded-xl transition-all flex items-start gap-3 ${
                  isNoSelect 
                    ? 'border-red-50 hover:bg-red-50/50 hover:border-red-200' 
                    : 'border-blue-50 hover:bg-blue-50/50 hover:border-blue-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border mt-0.5 shrink-0 flex items-center justify-center text-[10px] ${
                  isNoSelect ? 'border-red-200 text-red-600' : 'border-blue-200 text-blue-600'
                }`}>
                  {idx + 1}
                </div>
                <span className="leading-relaxed text-slate-700">{reason}</span>
              </button>
            );
          })}
        </div>
        
        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
          <p className="text-[9px] text-gray-400 italic">* Nội dung căn cứ theo Văn bản hợp nhất số 85/VBHN-BQP</p>
          <button onClick={onClose} className="px-6 py-2 text-xs font-black text-gray-500 uppercase hover:text-gray-700">Hủy bỏ</button>
        </div>
      </div>
    </div>
  );
};

export default TT50ReasonModal;
