
import React from 'react';
import { AlertTriangle, Tent, FileText, Calendar, CheckCircle2 } from 'lucide-react';
import { RecruitmentStatus } from '../../types';
import { 
  LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS, 
  NOT_ALLOWED_REGISTRATION_REASONS, EXEMPT_REGISTRATION_REASONS 
} from '../../constants';

const StatusFields = ({ formData, isReadOnly, handleChange }: any) => {
  const s = formData.status;

  let reasons: string[] = [];
  let label = "Lý do cụ thể";
  let showProofInput = false;

  if (s === RecruitmentStatus.DEFERRED) {
    reasons = LEGAL_DEFERMENT_REASONS;
    label = "Lý do tạm hoãn (Theo Luật)";
    showProofInput = true;
  } else if (s === RecruitmentStatus.EXEMPTED) {
    reasons = LEGAL_EXEMPTION_REASONS;
    label = "Lý do miễn gọi nhập ngũ";
    showProofInput = true;
  } else if (s === RecruitmentStatus.NOT_ALLOWED_REGISTRATION) {
    reasons = NOT_ALLOWED_REGISTRATION_REASONS;
    label = "Lý do không được đăng ký NVQS";
    showProofInput = true;
  } else if (s === RecruitmentStatus.EXEMPT_REGISTRATION) {
    reasons = EXEMPT_REGISTRATION_REASONS;
    label = "Lý do miễn đăng ký NVQS";
    showProofInput = true;
  }

  // Nếu là diện 4, 5, 6, 7 thông thường thì không hiện panel này
  const isSpecialStatus = [
    RecruitmentStatus.DEFERRED, 
    RecruitmentStatus.EXEMPTED, 
    RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
    RecruitmentStatus.EXEMPT_REGISTRATION,
    RecruitmentStatus.FINALIZED,
    RecruitmentStatus.ENLISTED
  ].includes(s);

  if (!isSpecialStatus) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-6">
        <AlertTriangle size={18} className="text-amber-500" /> Thông tin trạng thái đặc biệt
      </h3>

      <div className={`p-5 rounded-2xl border shadow-sm space-y-4 ${s === RecruitmentStatus.FINALIZED || s === RecruitmentStatus.ENLISTED ? 'bg-green-50/50 border-green-200' : 'bg-amber-50/50 border-amber-200'}`}>
        
        {/* Lý do cho các diện Tạm hoãn/Miễn */}
        {reasons.length > 0 && (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-black text-amber-800 uppercase mb-1">{label}</label>
              <select 
                className="w-full p-2.5 border border-amber-200 rounded-lg text-sm font-bold bg-white focus:ring-2 focus:ring-amber-500"
                value={formData.defermentReason || ''}
                onChange={(e) => handleChange('defermentReason', e.target.value)}
                disabled={isReadOnly}
              >
                <option value="">-- Chọn lý do phù hợp theo Luật --</option>
                {reasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
                <option value="Khác">Lý do đặc thù khác...</option>
              </select>
            </div>

            {showProofInput && (
              <div className="animate-in fade-in duration-500">
                <label className="block text-[10px] font-black text-amber-800 uppercase mb-1">Chi tiết văn bản / Quyết định số</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 text-amber-400" size={16}/>
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-3 py-2 border border-amber-200 rounded-lg text-sm font-bold bg-white focus:ring-2 focus:ring-amber-500"
                    placeholder="VD: Quyết định số 123/QĐ-UBND ngày..."
                    value={formData.defermentProof || ''}
                    onChange={(e) => handleChange('defermentProof', e.target.value)}
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thông tin cho diện Chốt hồ sơ / Nhập ngũ */}
        {(s === RecruitmentStatus.FINALIZED || s === RecruitmentStatus.ENLISTED) && (
          <div className="grid grid-cols-2 gap-4 pt-2">
             <div className="col-span-2">
                <label className="block text-[10px] font-black text-green-800 uppercase mb-1 flex items-center gap-1">
                   <Tent size={14} className="text-green-600"/> Đơn vị dự kiến nhập ngũ
                </label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border border-green-200 rounded-lg text-sm font-black text-green-900 bg-white uppercase placeholder:text-green-200"
                  placeholder="VD: Sư đoàn 330 / Bộ Chỉ huy Quân sự Tỉnh..."
                  value={formData.enlistmentUnit || ''}
                  onChange={(e) => handleChange('enlistmentUnit', e.target.value)}
                  readOnly={isReadOnly}
                />
             </div>
             <div>
                <label className="block text-[10px] font-black text-green-800 uppercase mb-1">Phân loại danh sách</label>
                <select 
                  className="w-full p-2.5 border border-green-200 rounded-lg text-sm font-bold bg-white text-green-900"
                  value={formData.enlistmentType || 'OFFICIAL'}
                  onChange={(e) => handleChange('enlistmentType', e.target.value)}
                  disabled={isReadOnly}
                >
                   <option value="OFFICIAL">CHÍNH THỨC</option>
                   <option value="RESERVE">DỰ PHÒNG (DỰ BỊ)</option>
                </select>
             </div>
             <div>
                <label className="block text-[10px] font-black text-green-800 uppercase mb-1">Ngày hội tòng quân</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-green-400" size={16}/>
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-3 py-2 border border-green-200 rounded-lg text-sm font-bold bg-white text-green-900"
                    value={formData.enlistmentDate || ''}
                    onChange={(e) => handleChange('enlistmentDate', e.target.value)}
                    readOnly={isReadOnly}
                  />
                </div>
             </div>
             <div className="col-span-2 flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-100/50 p-2 rounded-lg">
                <CheckCircle2 size={14}/> HỒ SƠ ĐÃ SẴN SÀNG ĐỂ PHÁT LỆNH GỌI NHẬP NGŨ
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusFields;
