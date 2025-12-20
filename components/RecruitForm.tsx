
import React, { useState, useEffect } from 'react';
import { Recruit, RecruitmentStatus, FamilyMember, User, RecruitAttachment } from '../types';
// Add missing ShieldAlert to the lucide-react import list
import { X, Save, User as UserIcon, AlertTriangle, Camera, ShieldAlert } from 'lucide-react';

// Sub-components
import LocationFields from './RecruitForm/LocationFields';
import QualityFields from './RecruitForm/QualityFields';
import StatusFields from './RecruitForm/StatusFields';
import FamilyFields from './RecruitForm/FamilyFields';
import AttachmentFields from './RecruitForm/AttachmentFields';

interface RecruitFormProps {
  initialData?: Recruit;
  initialStatus?: RecruitmentStatus;
  user: User;
  onSubmit: (data: Recruit) => void;
  onClose: () => void;
  sessionYear: number;
}

const RecruitForm: React.FC<RecruitFormProps> = ({ initialData, initialStatus, user, onSubmit, onClose, sessionYear }) => {
  const isReadOnly = user.role === 'PROVINCE_ADMIN' || user.role === 'VIEWER';
  const emptyFamilyMember: FamilyMember = { fullName: '', job: 'Làm nông', phoneNumber: '', birthYear: '' };
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const [formData, setFormData] = useState<Recruit>({
    id: generateId(), citizenId: '', fullName: '', dob: '', phoneNumber: '', avatarUrl: '',
    address: { province: user.unit.province, commune: user.unit.commune, village: '', street: '' },
    hometown: { province: '', commune: '', village: '' },
    physical: { height: 0, weight: 0, bmi: 0, healthGrade: 0 },
    details: { education: 'Lớp 12', ethnicity: 'Kinh', religion: 'Không', maritalStatus: 'Độc thân', job: '', politicalStatus: 'Doan_Vien', gifted: '' },
    family: { father: { ...emptyFamilyMember }, mother: { ...emptyFamilyMember }, wife: { ...emptyFamilyMember }, children: '' },
    status: initialStatus || RecruitmentStatus.SOURCE,
    recruitmentYear: sessionYear,
    attachments: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        family: {
          father: initialData.family?.father || { ...emptyFamilyMember },
          mother: initialData.family?.mother || { ...emptyFamilyMember },
          wife: initialData.family?.wife || { ...emptyFamilyMember },
          children: initialData.family?.children || ''
        },
        details: {
          ...formData.details,
          ...initialData.details
        }
      });
    }
  }, [initialData]);

  // Logic tự động tính BMI
  useEffect(() => {
    if (formData.physical.height > 0 && formData.physical.weight > 0) {
      const h = formData.physical.height / 100;
      const bmi = parseFloat((formData.physical.weight / (h * h)).toFixed(2));
      setFormData(prev => ({ ...prev, physical: { ...prev.physical, bmi } }));
    }
  }, [formData.physical.height, formData.physical.weight]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const parts = field.split('.');
      let target = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        // @ts-ignore
        target = target[parts[i]] = { ...target[parts[i]] };
      }
      // @ts-ignore
      target[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => handleChange('avatarUrl', ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAddAttachment = (file: RecruitAttachment) => {
    setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), file] }));
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments?.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    // RÀNG BUỘC ĐỘ TUỔI: Danh sách 4 chỉ cho phép >= 18 tuổi (tức trên 17)
    const birthYear = parseInt(formData.dob.split('-')[0] || '0');
    const age = sessionYear - birthYear;
    const isSourceTab = formData.status !== RecruitmentStatus.NOT_ALLOWED_REGISTRATION && 
                        formData.status !== RecruitmentStatus.EXEMPT_REGISTRATION && 
                        formData.status !== RecruitmentStatus.FIRST_TIME_REGISTRATION;

    if (birthYear > 0 && isSourceTab && age < 18) {
        alert(`Công dân sinh năm ${birthYear} (${age} tuổi) chưa đủ 18 tuổi tại năm tuyển quân ${sessionYear}.\nDanh sách 4 chỉ tiếp nhận công dân từ 18 đến 27 tuổi.\n\nVui lòng chuyển công dân sang "Danh sách 3: Đăng ký lần đầu" nếu công dân đủ 17 tuổi.`);
        return;
    }

    onSubmit(formData);
  };

  const isStudyingHigherEd = formData.details.education?.startsWith('Đang học');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-military-800 text-white border-b p-5 flex justify-between items-center shrink-0 shadow-lg relative z-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg"><UserIcon size={24}/></div>
             <h2 className="text-xl font-black uppercase tracking-tight">
               {initialData ? (isReadOnly ? 'Hồ sơ quân nhân' : 'Cập nhật dữ liệu') : 'Tiếp nhận công dân mới'}
             </h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-gray-50/50">
          {isReadOnly && (
            <div className="bg-blue-600 text-white p-4 rounded-xl mb-8 flex items-center justify-between shadow-lg animate-pulse">
               <div className="flex items-center gap-3">
                  <ShieldAlert size={24}/> 
                  <span className="text-sm font-black uppercase tracking-widest">Dữ liệu đang được bảo vệ (Chế độ xem)</span>
               </div>
               <div className="text-[10px] font-bold opacity-75">Ban CHQS Tỉnh giám sát</div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Cột 1: Nhân thân */}
            <div className="space-y-8">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <div className="flex flex-col md:flex-row gap-6 mb-8">
                    {/* Avatar Area */}
                    <div className="relative shrink-0 mx-auto md:mx-0">
                       <div className="w-32 h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative group">
                          {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="Avatar"/>
                          ) : (
                            <div className="text-center p-2">
                               <Camera size={32} className="mx-auto text-gray-300" />
                               <p className="text-[8px] font-black text-gray-400 mt-2 uppercase">Ảnh 3x4</p>
                            </div>
                          )}
                          {!isReadOnly && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                               <label className="cursor-pointer text-white text-[10px] font-black uppercase">Thay ảnh</label>
                               <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="flex-1 space-y-4">
                       <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-3 flex items-center gap-2 uppercase text-sm mb-4">
                          <UserIcon size={18} className="text-military-600" /> Lý lịch trích ngang
                       </h3>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Họ và tên công dân</label>
                            <input required type="text" readOnly={isReadOnly} className="w-full rounded-lg border-gray-300 border p-2.5 font-black uppercase text-gray-800 focus:ring-2 focus:ring-military-50 outline-none" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)}/>
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Ngày sinh</label>
                            <input required type="date" readOnly={isReadOnly} className="w-full rounded-lg border-gray-300 border p-2.5 font-bold text-gray-800" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)}/>
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Số CCCD</label>
                            <input type="text" readOnly={isReadOnly} className="w-full rounded-lg border-gray-300 border p-2.5 font-mono font-black text-blue-700" value={formData.citizenId} onChange={(e) => handleChange('citizenId', e.target.value)}/>
                         </div>
                       </div>
                    </div>
                 </div>

                 <LocationFields 
                    label="Nơi ở hiện tại (Theo hộ khẩu)" icon={null} prefix="address"
                    province={formData.address.province} commune={formData.address.commune} village={formData.address.village} street={formData.address.street}
                    isLocalityFixed={!!user.unit.commune} isReadOnly={isReadOnly} onUpdate={handleChange}
                 />
                 <div className="mt-8">
                   <LocationFields 
                      label="Quê quán" icon={null} prefix="hometown"
                      province={formData.hometown.province} commune={formData.hometown.commune} village={formData.hometown.village}
                      isReadOnly={isReadOnly} onUpdate={handleChange}
                   />
                 </div>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <FamilyFields formData={formData} isReadOnly={isReadOnly} handleChange={handleChange} />
               </div>
            </div>

            {/* Cột 2: Chất lượng & Phụ lục */}
            <div className="space-y-8">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <QualityFields formData={formData} isReadOnly={isReadOnly} handleChange={handleChange} isStudyingHigherEd={isStudyingHigherEd} />
                 <StatusFields formData={formData} isReadOnly={isReadOnly} handleChange={handleChange} />
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <AttachmentFields 
                    attachments={formData.attachments} 
                    isReadOnly={isReadOnly} 
                    onUpload={handleAddAttachment} 
                    onDelete={handleRemoveAttachment} 
                 />
               </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-white p-5 border-t flex items-center justify-between shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] relative z-10">
          <div className="hidden md:block">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Đơn vị tiếp nhận hồ sơ:</p>
             <p className="text-xs font-black text-military-800 uppercase">{user.fullName}</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button type="button" onClick={onClose} className="flex-1 md:flex-none px-6 py-2.5 text-xs font-black text-gray-500 uppercase hover:text-gray-700 transition-colors">Đóng lại</button>
            {!isReadOnly && (
              <button 
                type="submit" 
                onClick={handleSubmit}
                className="flex-1 md:flex-none px-10 py-2.5 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-military-800 transition-all active:scale-95"
              >
                <Save size={18} /> Lưu hồ sơ công dân
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitForm;
