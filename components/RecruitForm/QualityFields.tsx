
import React from 'react';
import { Activity, GraduationCap, Award, Globe, Landmark, ShieldAlert, HeartPulse, Briefcase, MapPin } from 'lucide-react';
import { EDUCATIONS, ETHNICITIES, RELIGIONS } from '../../constants';
import { RecruitmentStatus } from '../../types';

const QualityFields = ({ formData, isReadOnly, handleChange, isStudyingHigherEd }: any) => {
  const isBanned = formData.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION;

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

        {/* Mới: Niên khóa án phạt */}
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

        {/* Công việc & Nghề nghiệp chuyên sâu */}
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

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Nhóm ngạch</label>
          <input 
            type="text" placeholder="VD: Chuyên viên, Kỹ thuật..."
            className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold"
            value={formData.details.gradeGroup || ''} 
            onChange={(e) => handleChange('details.gradeGroup', e.target.value)} 
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Bậc lương</label>
          <input 
            type="text" placeholder="VD: 2.34, 3/10..."
            className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold"
            value={formData.details.salaryLevel || ''} 
            onChange={(e) => handleChange('details.salaryLevel', e.target.value)} 
            readOnly={isReadOnly}
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Tên trường (nếu có)</label>
          <input type="text" className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold" value={formData.details.school || ''} onChange={(e) => handleChange('details.school', e.target.value)} readOnly={isReadOnly}/>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Chuyên ngành</label>
          <input type="text" className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold" value={formData.details.major || ''} onChange={(e) => handleChange('details.major', e.target.value)} readOnly={isReadOnly}/>
        </div>

        {/* Thể lực */}
        <div className="col-span-2 grid grid-cols-5 gap-3 bg-military-50/50 p-3 rounded-xl border border-military-100">
          <div>
            <label className="block text-[9px] font-black text-military-700 uppercase">C.Cao (cm)</label>
            <input type="number" className="w-full mt-1 p-2 border rounded-lg text-center font-black text-military-900" value={formData.physical.height || ''} onChange={(e) => handleChange('physical.height', Number(e.target.value))} readOnly={isReadOnly}/>
          </div>
          <div>
            <label className="block text-[9px] font-black text-military-700 uppercase">C.Nặng (kg)</label>
            <input type="number" className="w-full mt-1 p-2 border rounded-lg text-center font-black text-military-900" value={formData.physical.weight || ''} onChange={(e) => handleChange('physical.weight', Number(e.target.value))} readOnly={isReadOnly}/>
          </div>
          <div>
            <label className="block text-[9px] font-black text-military-700 uppercase">BMI</label>
            <div className={`mt-1 py-2 px-1 border rounded-lg text-center text-[10px] font-black bg-white ${formData.physical.bmi >= 18.5 && formData.physical.bmi <= 29.9 ? 'text-green-600' : 'text-red-600'}`}>{formData.physical.bmi || '--'}</div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-red-600 uppercase">H.Áp</label>
            <input type="text" placeholder="120/80" className="w-full mt-1 p-2 border rounded-lg text-center font-black text-red-900" value={formData.physical.bloodPressure || ''} onChange={(e) => handleChange('physical.bloodPressure', e.target.value)} readOnly={isReadOnly}/>
          </div>
          <div>
            <label className="block text-[9px] font-black text-military-700 uppercase">PL SK</label>
            <select className="w-full mt-1 p-2 border rounded-lg text-center font-black text-military-900 bg-white" value={formData.physical.healthGrade} onChange={(e) => handleChange('physical.healthGrade', Number(e.target.value))} disabled={isReadOnly}>
              <option value="0">-</option>{[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
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
