
import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS } from '../../../constants';

interface LegalReasonModalProps {
  type: 'DEFERRED' | 'EXEMPTED';
  onClose: () => void;
  onApply: (reason: string) => void;
}

const LegalReasonModal: React.FC<LegalReasonModalProps> = ({ type, onClose, onApply }) => {
  const reasons = type === 'DEFERRED' ? LEGAL_DEFERMENT_REASONS : LEGAL_EXEMPTION_REASONS;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className={`p-5 flex justify-between items-center text-white ${type === 'DEFERRED' ? 'bg-amber-600' : 'bg-purple-600'}`}>
          <h3 className="font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <ShieldCheck size={18}/> {type === 'DEFERRED' ? 'Lý do tạm hoãn nghĩa vụ' : 'Lý do miễn gọi nhập ngũ'}
          </h3>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><X size={24}/></button>
        </div>
        <div className="p-6 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {reasons.map((reason, idx) => (
            <button key={idx} onClick={() => onApply(reason)} className="w-full text-left p-3.5 text-[11px] font-bold border border-gray-100 rounded-xl hover:bg-military-50 hover:border-military-200 transition-all flex items-start gap-3">
              <div className="w-4 h-4 rounded-full border border-gray-300 mt-0.5 shrink-0"></div>
              <span className="leading-normal text-gray-700">{reason}</span>
            </button>
          ))}
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button onClick={onClose} className="px-6 py-2 text-xs font-black text-gray-500 uppercase">Hủy bỏ</button>
        </div>
      </div>
    </div>
  );
};

export default LegalReasonModal;
