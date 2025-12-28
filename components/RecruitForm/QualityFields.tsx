
import React from 'react';
import { Activity, Globe, Landmark, ShieldAlert, HeartPulse, Briefcase, MapPin, Award, FileEdit, Star, AlertCircle, Banknote } from 'lucide-react';
import { EDUCATIONS, ETHNICITIES, RELIGIONS } from '../../constants';
import { RecruitmentStatus } from '../../types';

const QualityFields = ({ formData, isReadOnly, handleChange, isStudyingHigherEd }: any) => {
  const isBanned = formData.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION;

  // Xác định diện danh sách 4 trở đi (Nguồn)
  const isDS4Up = ![
    RecruitmentStatus.NOT_ALLOWED_REGISTRATION,
    RecruitmentStatus.EXEMPT_REGISTRATION,
    RecruitmentStatus.FIRST_TIME_REGISTRATION
  ].includes(formData.status);

  return (
    <div className="space-y-6">
      <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm">
        <Activity size={18} className="text-military-600" /> Chi tiết & Chất lượng
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Dân tộc & Tôn giáo */}
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 flex items-center gap-1">
            <Globe size={12} className="text-blue-500"/> Dân tộc
          </label>
          <select 
            className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-military-500"
            value={formData.details.ethnicity} 
            onChange={(e) => handleChange('details.ethnicity', e.target.value)} 
            disabled={isReadOnly}
          >
            {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 flex items-center gap-1">
            <Landmark size={12} className="text-amber-500"/> Tôn giáo
          </label>
          <select 
            className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-military-500"
            value={formData.details.religion} 
            onChange={(e) => handleChange('details.religion', e.target.value)} 
            disabled={isReadOnly}
          >
            {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Học vấn */}
        <div className="col-span-2">
          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Trình độ học vấn</label>
          <select 
            className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-military-500"
            value={formData.details.education} 
            onChange={(e) => handleChange('details.education', e.target.value)} 
            disabled={isReadOnly}
          >
            {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        
        {isStudyingHigherEd && (
          <div className="col-span-2 animate-in fade-in slide-in-from-top-1">
            <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">Niên khóa đào tạo (VD: 2023-2027)</label>
            <input 
              type="text" required
              className="w-full rounded-lg border-blue-200 bg-blue-50 border p-2 text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
              value={formData.details.educationPeriod || ''} 
              onChange={(e) => handleChange('details.educationPeriod', e.target.value)} 
              readOnly={isReadOnly}
              placeholder="VD: 2021-2025"
            />
          </div>
        )}

        {/* Niên khóa án phạt */}
        {isBanned && (
            <div className="col-span-2 animate-in fade-in slide-in-from-top-1">
                <label className="block text-[10px] font-black text-red-600 uppercase mb-1 flex items-center gap-1">
                    <ShieldAlert size={14}/> Thời hạn chấp hành án (VD: 2022-2026)
                </label>
                <input 
                    type="text" 
                    className="w-full rounded-lg border-red-200 bg-red-50 border p-2 text-sm font-bold text-red-900 focus:ring-2 focus:ring-red-500"
                    value={formData.details.sentencePeriod || ''} 
                    onChange={(e) => handleChange('details.sentencePeriod', e.target.value)} 
                    readOnly={isReadOnly}
                    placeholder="VD: 2022-2026"
                />
            </div>
        )}

        {/* Công việc & Nghề nghiệp */}
        <div className="col-span-2">
          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Nghề nghiệp hiện tại</label>
          <input 
            type="text" placeholder="VD: Công nhân, Làm nông, Tự do..."
            className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold"
            value={formData.details.job} 
            onChange={(e) => handleChange('details.job', e.target.value)} 
            readOnly={isReadOnly}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-[10px] font-black text-military-600 uppercase mb-1 flex items-center gap-1">
             <MapPin size={12}/> Địa chỉ làm việc
          </label>
          <input 
            type="text" placeholder="Tên cơ quan, công ty, địa chỉ..."
            className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold"
            value={formData.details.workAddress || ''} 
            onChange={(e) => handleChange('details.workAddress', e.target.value)} 
            readOnly={isReadOnly}
          />
        </div>

        {/* BỔ SUNG: KHEN THƯỞNG, KỶ LUẬT, LƯƠNG (Cho diện 4 trở đi) */}
        {isDS4Up && (
          <div className="col-span-2 grid grid-cols-2 gap-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
            <div className="col-span-2 text-[10px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-2 mb-1">
               <Briefcase size={14}/> Thông tin công tác (Bổ sung cho DS 4)
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 flex items-center gap-1">
                <Star size={12} className="text-amber-500"/> Khen thưởng
              </label>
              <input 
                type="text" placeholder="Hình thức khen thưởng..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold bg-white"
                value={formData.details.rewards || ''}
                onChange={(e) => handleChange('details.rewards', e.target.value)}
                readOnly={isReadOnly}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 flex items-center gap-1">
                <AlertCircle size={12} className="text-red-500"/> Kỷ luật
              </label>
              <input 
                type="text" placeholder="Hình thức kỷ luật..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold bg-white"
                value={formData.details.disciplines || ''}
                onChange={(e) => handleChange('details.disciplines', e.target.value)}
                readOnly={isReadOnly}
              />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 flex items-center gap-1">
                  <Banknote size={12} className="text-green-600"/> Nhóm, ngạch lương
                </label>
                <input 
                  type="text" placeholder="VD: Nhóm A1, Ngạch cán sự..."
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold bg-white"
                  value={formData.details.gradeGroup || ''}
                  onChange={(e) => handleChange('details.gradeGroup', e.target.value)}
                  readOnly={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Bậc lương hiện tại</label>
                <input 
                  type="text" placeholder="VD: 2.34, 3.00..."
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold bg-white text-center"
                  value={formData.details.salaryLevel || ''}
                  onChange={(e) => handleChange('details.salaryLevel', e.target.value)}
                  readOnly={isReadOnly}
                />
              </div>
            </div>
          </div>
        )}

        {/* Thể lực */}
        <div className="col-span-2 space-y-3 bg-military-50/50 p-4 rounded-xl border border-military-100">
          <div className="grid grid-cols-6 gap-2">
            <div>
              <label className="block text-[9px] font-black text-military-700 uppercase">C.Cao</label>
              <input type="number" className="w-full mt-1 p-2 border rounded-lg text-center font-black text-military-900 text-xs" value={formData.physical.height || ''} onChange={(e) => handleChange('physical.height', Number(e.target.value))} readOnly={isReadOnly}/>
            </div>
            <div>
              <label className="block text-[9px] font-black text-military-700 uppercase">C.Nặng</label>
              <input type="number" className="w-full mt-1 p-2 border rounded-lg text-center font-black text-military-900 text-xs" value={formData.physical.weight || ''} onChange={(e) => handleChange('physical.weight', Number(e.target.value))} readOnly={isReadOnly}/>
            </div>
            <div>
              <label className="block text-[9px] font-black text-military-700 uppercase">V.Ngực</label>
              <input type="number" className={`w-full mt-1 p-2 border rounded-lg text-center font-black text-xs ${formData.physical.chest > 0 && formData.physical.chest < 75 ? 'text-red-600 bg-red-50 border-red-200' : 'text-military-900'}`} value={formData.physical.chest || ''} onChange={(e) => handleChange('physical.chest', Number(e.target.value))} readOnly={isReadOnly}/>
            </div>
            <div>
              <label className="block text-[9px] font-black text-military-700 uppercase">BMI</label>
              <input 
                type="number" step="0.01"
                className={`w-full mt-1 p-2 border border-gray-300 rounded-lg text-center font-black focus:ring-2 focus:ring-military-400 outline-none text-xs ${formData.physical.bmi > 29.9 || (formData.physical.bmi > 0 && formData.physical.bmi < 18.5) ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-700 bg-white'}`}
                value={formData.physical.bmi || ''} 
                onChange={(e) => handleChange('physical.bmi', Number(e.target.value))} 
                readOnly={isReadOnly}
                placeholder="--"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-red-600 uppercase">H.ÁP</label>
              <input type="text" className="w-full mt-1 p-2 border rounded-lg text-center font-black text-red-900 text-xs" value={formData.physical.bloodPressure || ''} onChange={(e) => handleChange('physical.bloodPressure', e.target.value)} readOnly={isReadOnly}/>
            </div>
            <div>
              <label className="block text-[9px] font-black text-military-700 uppercase">PL SK</label>
              <select className="w-full mt-1 p-2 border rounded-lg text-center font-black text-military-900 bg-white text-xs" value={formData.physical.healthGrade} onChange={(e) => handleChange('physical.healthGrade', Number(e.target.value))} disabled={isReadOnly}>
                <option value="0">-</option>{[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
              <FileEdit size={12} className="text-military-500"/> Ghi chú về sức khỏe (Dị tật, bệnh lý, lưu ý đặc biệt...)
            </label>
            <textarea 
              rows={2}
              className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white outline-none focus:ring-1 focus:ring-military-400"
              placeholder="Nhập các chú ý đặc biệt về thể lực công dân..."
              value={formData.physical.note || ''}
              onChange={(e) => handleChange('physical.note', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>
        </div>

        {/* Năng khiếu & Chính trị */}
        <div className="col-span-2">
           <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 flex items-center gap-1"><Award size={12}/> Năng khiếu / Sở trường</label>
           <input 
            type="text" placeholder="VD: Võ thuật, Ca hát, Sửa chữa điện..."
            className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold text-purple-700"
            value={formData.details.gifted || ''} 
            onChange={(e) => handleChange('details.gifted', e.target.value)} 
            readOnly={isReadOnly}
           />
        </div>

        <div className="col-span-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Chất lượng chính trị</label>
          <div className="flex gap-6">
            {[
              { id: 'None', label: 'Quần chúng' },
              { id: 'Doan_Vien', label: 'Đoàn viên' },
              { id: 'Dang_Vien', label: 'Đảng viên' }
            ].map(item => (
              <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  className="w-4 h-4 text-military-600 border-gray-300 focus:ring-military-500"
                  checked={formData.details.politicalStatus === item.id} 
                  onChange={() => handleChange('details.politicalStatus', item.id)} 
                  disabled={isReadOnly} 
                />
                <span className={`text-sm font-bold ${formData.details.politicalStatus === item.id ? 'text-military-900' : 'text-gray-400'}`}>{item.label}</span>
              </label>
            ))}
          </div>
          {formData.details.politicalStatus === 'Dang_Vien' && (
            <div className="mt-3 flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
              <label className="text-[10px] font-black text-red-600 uppercase">Ngày vào Đảng:</label>
              <input type="date" className="border-gray-300 rounded-lg p-1.5 text-sm font-bold text-red-700 focus:ring-red-500" value={formData.details.partyEntryDate || ''} onChange={(e) => handleChange('details.partyEntryDate', e.target.value)} readOnly={isReadOnly}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityFields;
