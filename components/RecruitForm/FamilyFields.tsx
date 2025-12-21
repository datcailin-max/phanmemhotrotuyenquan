import React from 'react';
import { Users, Heart, Calendar } from 'lucide-react';
import { FAMILY_JOBS } from '../../constants';

const FamilyFields = ({ formData, isReadOnly, handleChange }: any) => {
  const members = [
    { key: 'father', label: 'Thông tin Cha' },
    { key: 'mother', label: 'Thông tin Mẹ' },
    { key: 'wife', label: 'Thông tin Vợ' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-6">
        <Users size={18} className="text-military-600" /> Quan hệ gia đình
      </h3>

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