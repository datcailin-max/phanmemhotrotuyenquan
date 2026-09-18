
import React from 'react';
import { ShieldCheck, UserCheck, Baby, Medal, Users, User, HeartHandshake, Phone, Calendar, Briefcase, RefreshCw, Heart } from 'lucide-react';
import { RecruitmentStatus } from '../../types';
import { isParentDeceased } from '../../services/WordExportService';

const FamilyFields = ({ formData, isReadOnly, handleChange }: any) => {
  const compositionsFamily = ["Bần nông", "Trung nông", "Bần nông (cố nông)", "Trí thức", "Công chức", "Tiểu thương", "Tiểu tư sản", "Địa chủ", "Khác"];
  const compositionsPersonal = ["Phụ thuộc", "Bần nông", "Công nhân", "Trí thức", "Lao động tự do", "Công chức/Viên chức", "Khác"];

  const fatherDeceased = formData.curriculumVitae?.fatherStatus === 'Chết' || 
    (formData.family?.father?.job && isParentDeceased(formData.family.father.job));

  const motherDeceased = formData.curriculumVitae?.motherStatus === 'Chết' || 
    (formData.family?.mother?.job && isParentDeceased(formData.family.mother.job));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
        <h3 className="text-gray-900 font-bold flex items-center gap-2 uppercase text-sm">
          <Users size={18} className="text-military-600" /> Thông tin Cha, Mẹ & Hoàn cảnh gia đình
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
          <RefreshCw size={12} className="text-blue-600" />
          <span>Tự động liên thông với Sơ yếu lý lịch (Mục I)</span>
        </div>
      </div>

      {/* THÔNG TIN VỀ CHA (BỐ) */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wide">
            <User size={15} className="text-military-600" />
            <span>Thông tin về Cha (Bố)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Tình trạng:</span>
            <select
              className={`text-xs font-black px-2.5 py-1 rounded-lg border transition-all ${
                fatherDeceased
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}
              value={fatherDeceased ? 'Chết' : 'Sống'}
              onChange={(e) => {
                const nextStatus = e.target.value;
                handleChange('curriculumVitae.fatherStatus', nextStatus);
                if (nextStatus === 'Chết') {
                  if (!formData.family?.father?.job || formData.family.father.job === 'Không') {
                    handleChange('family.father.job', 'Đã mất');
                  }
                } else {
                  if (formData.family?.father?.job && isParentDeceased(formData.family.father.job)) {
                    handleChange('family.father.job', 'Nông dân');
                  }
                }
              }}
              disabled={isReadOnly}
            >
              <option value="Sống">Sống</option>
              <option value="Chết">Đã mất (Chết)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1">
              Họ và tên cha <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập họ và tên cha..."
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-black uppercase text-gray-800 bg-white focus:ring-2 focus:ring-military-500 focus:border-military-500 outline-none"
              value={formData.family?.father?.fullName || ''}
              onChange={(e) => handleChange('family.father.fullName', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-gray-400" /> Năm sinh / Ngày sinh cha
            </label>
            <input
              type="text"
              placeholder="VD: 1970 hoặc 15/08/1970"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 bg-white focus:ring-2 focus:ring-military-500 focus:border-military-500 outline-none"
              value={formData.family?.father?.birthYear || ''}
              onChange={(e) => handleChange('family.father.birthYear', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1 flex items-center gap-1">
              <Briefcase size={12} className="text-gray-400" /> Nghề nghiệp cha
            </label>
            <input
              type="text"
              placeholder="VD: Nông dân, Công nhân, Cán bộ..."
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 bg-white focus:ring-2 focus:ring-military-500 focus:border-military-500 outline-none"
              value={formData.family?.father?.job || ''}
              onChange={(e) => handleChange('family.father.job', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1 flex items-center gap-1">
              <Phone size={12} className="text-gray-400" /> Số điện thoại cha
            </label>
            <input
              type="text"
              placeholder="VD: 0912345678"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-mono font-bold text-blue-700 bg-white focus:ring-2 focus:ring-military-500 focus:border-military-500 outline-none"
              value={formData.family?.father?.phoneNumber || ''}
              onChange={(e) => handleChange('family.father.phoneNumber', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* THÔNG TIN VỀ MẸ */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wide">
            <HeartHandshake size={15} className="text-pink-600" />
            <span>Thông tin về Mẹ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Tình trạng:</span>
            <select
              className={`text-xs font-black px-2.5 py-1 rounded-lg border transition-all ${
                motherDeceased
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}
              value={motherDeceased ? 'Chết' : 'Sống'}
              onChange={(e) => {
                const nextStatus = e.target.value;
                handleChange('curriculumVitae.motherStatus', nextStatus);
                if (nextStatus === 'Chết') {
                  if (!formData.family?.mother?.job || formData.family.mother.job === 'Không') {
                    handleChange('family.mother.job', 'Đã mất');
                  }
                } else {
                  if (formData.family?.mother?.job && isParentDeceased(formData.family.mother.job)) {
                    handleChange('family.mother.job', 'Nội trợ');
                  }
                }
              }}
              disabled={isReadOnly}
            >
              <option value="Sống">Sống</option>
              <option value="Chết">Đã mất (Chết)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1">
              Họ và tên mẹ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập họ và tên mẹ..."
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-black uppercase text-gray-800 bg-white focus:ring-2 focus:ring-military-500 focus:border-military-500 outline-none"
              value={formData.family?.mother?.fullName || ''}
              onChange={(e) => handleChange('family.mother.fullName', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-gray-400" /> Năm sinh / Ngày sinh mẹ
            </label>
            <input
              type="text"
              placeholder="VD: 1973 hoặc 20/10/1973"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 bg-white focus:ring-2 focus:ring-military-500 focus:border-military-500 outline-none"
              value={formData.family?.mother?.birthYear || ''}
              onChange={(e) => handleChange('family.mother.birthYear', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1 flex items-center gap-1">
              <Briefcase size={12} className="text-gray-400" /> Nghề nghiệp mẹ
            </label>
            <input
              type="text"
              placeholder="VD: Nội trợ, Nông dân, Công nhân..."
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 bg-white focus:ring-2 focus:ring-military-500 focus:border-military-500 outline-none"
              value={formData.family?.mother?.job || ''}
              onChange={(e) => handleChange('family.mother.job', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1 flex items-center gap-1">
              <Phone size={12} className="text-gray-400" /> Số điện thoại mẹ
            </label>
            <input
              type="text"
              placeholder="VD: 0987654321"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-mono font-bold text-blue-700 bg-white focus:ring-2 focus:ring-military-500 focus:border-military-500 outline-none"
              value={formData.family?.mother?.phoneNumber || ''}
              onChange={(e) => handleChange('family.mother.phoneNumber', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* THÔNG TIN VỢ (CHỒNG) & CON (NẾU CÓ) */}
      {(formData.details?.maritalStatus === 'Đã kết hôn' || formData.family?.wife?.fullName) && (
        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-black text-purple-800 uppercase tracking-wide border-b border-purple-200 pb-2">
            <Heart size={15} className="text-purple-600" />
            <span>Thông tin Vợ (Chồng) & Con</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase mb-1">Họ tên vợ (chồng)</label>
              <input
                type="text"
                placeholder="Nhập họ tên vợ..."
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 bg-white"
                value={formData.family?.wife?.fullName || ''}
                onChange={(e) => handleChange('family.wife.fullName', e.target.value)}
                readOnly={isReadOnly}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase mb-1">Năm sinh</label>
              <input
                type="text"
                placeholder="VD: 1998"
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 bg-white"
                value={formData.family?.wife?.birthYear || ''}
                onChange={(e) => handleChange('family.wife.birthYear', e.target.value)}
                readOnly={isReadOnly}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase mb-1">Nghề nghiệp vợ</label>
              <input
                type="text"
                placeholder="VD: Giáo viên, Tự do..."
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 bg-white"
                value={formData.family?.wife?.job || ''}
                onChange={(e) => handleChange('family.wife.job', e.target.value)}
                readOnly={isReadOnly}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-600 uppercase mb-1">Số con hiện có</label>
              <input
                type="text"
                placeholder="VD: 01"
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 bg-white"
                value={formData.family?.children || formData.curriculumVitae?.childrenCount || ''}
                onChange={(e) => {
                  handleChange('family.children', e.target.value);
                  handleChange('curriculumVitae.childrenCount', e.target.value);
                }}
                readOnly={isReadOnly}
              />
            </div>
          </div>
        </div>
      )}

      {/* THÀNH PHẦN GIA ĐÌNH & BẢN THÂN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-military-700 uppercase mb-1 flex items-center gap-1">
            <ShieldCheck size={12}/> Thành phần gia đình
          </label>
          <select 
            className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold text-gray-800 bg-military-50/30 focus:ring-2 focus:ring-military-500 focus:border-military-500 outline-none"
            value={formData.details?.familyComposition || 'Bần nông'} 
            onChange={(e) => handleChange('details.familyComposition', e.target.value)} 
            disabled={isReadOnly}
          >
            {compositionsFamily.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-military-700 uppercase mb-1 flex items-center gap-1">
            <UserCheck size={12}/> Thành phần bản thân
          </label>
          <select 
            className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold text-gray-800 bg-military-50/30 focus:ring-2 focus:ring-military-500 focus:border-military-500 outline-none"
            value={formData.details?.personalComposition || 'Phụ thuộc'} 
            onChange={(e) => handleChange('details.personalComposition', e.target.value)} 
            disabled={isReadOnly}
          >
            {compositionsPersonal.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* THÔNG TIN HOÀN CẢNH ANH CHỊ EM & CHÍNH SÁCH CHA MẸ */}
      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-3">
        <div className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
          <Baby size={14}/> Hoàn cảnh anh, chị, em & Chính sách gia đình
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1">
              Số anh, chị, em ruột
            </label>
            <input 
              type="text" 
              placeholder="VD: 02 (hoặc 2)"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              value={formData.details?.siblingCount || ''}
              onChange={(e) => handleChange('details.siblingCount', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1">
              Là con thứ mấy trong gia đình
            </label>
            <input 
              type="text" 
              placeholder="VD: Thứ 1, Thứ 2..."
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              value={formData.details?.birthOrder || ''}
              onChange={(e) => handleChange('details.birthOrder', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1 flex items-center gap-1">
              <Medal size={12} className="text-red-600"/> Cha, mẹ là Liệt sĩ, thương, bệnh binh; hạng mấy (nếu có)
            </label>
            <textarea 
              rows={2} 
              placeholder="Nhập chi tiết diện chính sách của cha mẹ (nếu có)..."
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              value={formData.details?.parentPolicyStatus || ''}
              onChange={(e) => handleChange('details.parentPolicyStatus', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyFields;
