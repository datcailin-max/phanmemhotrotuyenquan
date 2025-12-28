
import React from 'react';
import { Users, Heart, ShieldCheck, UserCheck, Baby, Users2, Medal } from 'lucide-react';
import { FAMILY_JOBS } from '../../constants';
import { RecruitmentStatus } from '../../types';

const FamilyFields = ({ formData, isReadOnly, handleChange }: any) => {
  const members = [
    { key: 'father', label: 'Thông tin Cha' },
    { key: 'mother', label: 'Thông tin Mẹ' },
    { key: 'wife', label: 'Thông tin Vợ' }
  ];

  const compositionsFamily = ["Bần nông", "Trung nông", "Bần nông (cố nông)", "Trí thức", "Công chức", "Tiểu thương", "Tiểu tư sản", "Địa chủ", "Khác"];
  const compositionsPersonal = ["Phụ thuộc", "Bần nông", "Công nhân", "Trí thức", "Lao động tự do", "Công chức/Viên chức", "Khác"];

  // Xác định xem có phải diện 1, 2, 3 không để hiện các ô tự nhập bổ sung
  const isDS123 = [
    RecruitmentStatus.NOT_ALLOWED_REGISTRATION,
    RecruitmentStatus.EXEMPT_REGISTRATION,
    RecruitmentStatus.FIRST_TIME_REGISTRATION
  ].includes(formData.status);

  return (
    <div className="space-y-6">
      <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-6">
        <Users size={18} className="text-military-600" /> Quan hệ gia đình & Thành phần
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
         <div>
            <label className="block text-[10px] font-black text-military-700 uppercase mb-1 flex items-center gap-1">
               <ShieldCheck size={12}/> Thành phần gia đình
            </label>
            <select 
              className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold text-gray-800 bg-military-50/30"
              value={formData.details.familyComposition} 
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
              className="w-full rounded-lg border-gray-300 border p-2 text-sm font-bold text-gray-800 bg-military-50/30"
              value={formData.details.personalComposition} 
              onChange={(e) => handleChange('details.personalComposition', e.target.value)} 
              disabled={isReadOnly}
            >
              {compositionsPersonal.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
         </div>
      </div>

      {/* BỔ SUNG: THÔNG TIN ANH CHỊ EM & CHÍNH SÁCH CHA MẸ (Cho diện 1, 2, 3) */}
      {isDS123 && (
        <div className="grid grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100 animate-in fade-in slide-in-from-top-2">
           <div className="col-span-2 text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2 mb-1">
              <Baby size={14}/> Thông tin hoàn cảnh gia đình (Bổ sung cho DS 1,2,3)
           </div>
           <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Có bao nhiêu anh, chị, em ruột</label>
              <input 
                type="text" placeholder="Nhập số lượng..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold bg-white"
                value={formData.details.siblingCount || ''}
                onChange={(e) => handleChange('details.siblingCount', e.target.value)}
                readOnly={isReadOnly}
              />
           </div>
           <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Là con thứ mấy trong gia đình</label>
              <input 
                type="text" placeholder="VD: Thứ nhất, Thứ hai..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold bg-white"
                value={formData.details.birthOrder || ''}
                onChange={(e) => handleChange('details.birthOrder', e.target.value)}
                readOnly={isReadOnly}
              />
           </div>
           <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 flex items-center gap-1">
                 <Medal size={12} className="text-red-600"/> Cha, mẹ là Liệt sĩ, thương, bệnh binh; hạng mấy (nếu có)
              </label>
              <textarea 
                rows={2} placeholder="Nhập chi tiết diện chính sách của cha mẹ (nếu có)..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-medium bg-white"
                value={formData.details.parentPolicyStatus || ''}
                onChange={(e) => handleChange('details.parentPolicyStatus', e.target.value)}
                readOnly={isReadOnly}
              />
           </div>
        </div>
      )}

      <div className="space-y-4">
        {members.map((m) => (
          <div key={m.key} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">{m.label}</label>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-5">
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Họ và tên</label>
                <input 
                  placeholder="Nhập họ tên..."
                  className="w-full p-2 border border-gray-300 rounded text-sm font-bold uppercase focus:ring-1 focus:ring-military-500"
                  value={formData.family?.[m.key]?.fullName || ''}
                  onChange={(e) => handleChange(`family.${m.key}.fullName`, e.target.value)}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="col-span-6 md:col-span-2">
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Năm sinh</label>
                <input 
                  type="text"
                  placeholder="19xx"
                  className="w-full p-2 border border-gray-300 rounded text-sm font-bold text-center"
                  value={formData.family?.[m.key]?.birthYear || ''}
                  onChange={(e) => handleChange(`family.${m.key}.birthYear`, e.target.value)}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="col-span-6 md:col-span-5">
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Nghề nghiệp</label>
                <input 
                  placeholder="Tự nhập nghề nghiệp..."
                  className="w-full p-2 border border-gray-300 rounded text-sm font-medium bg-white"
                  value={formData.family?.[m.key]?.job || ''}
                  onChange={(e) => handleChange(`family.${m.key}.job`, e.target.value)}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="col-span-12">
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Số điện thoại liên hệ</label>
                <input 
                  placeholder="Nhập SĐT..."
                  className="w-full p-2 border border-gray-300 rounded text-sm font-mono focus:ring-1 focus:ring-military-500"
                  value={formData.family?.[m.key]?.phoneNumber || ''}
                  onChange={(e) => handleChange(`family.${m.key}.phoneNumber`, e.target.value)}
                  readOnly={isReadOnly}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="bg-pink-50/50 p-3 rounded-lg border border-pink-100">
          <label className="block text-[10px] font-black text-pink-700 uppercase mb-1 flex items-center gap-1">
             <Heart size={12}/> Thông tin con (nếu có)
          </label>
          <textarea 
            rows={2}
            placeholder="Họ tên, năm sinh các con..."
            className="w-full p-2 border border-pink-200 rounded text-sm font-medium focus:ring-1 focus:ring-pink-500 bg-white"
            value={formData.family?.children || ''}
            onChange={(e) => handleChange('family.children', e.target.value)}
            readOnly={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default FamilyFields;
