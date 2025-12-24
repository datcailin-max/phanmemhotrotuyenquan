
import React, { useState, useEffect } from 'react';
import { Recruit, RecruitmentStatus, FamilyMember, User, RecruitAttachment } from '../types';
import { X, Save, User as UserIcon, AlertTriangle, Camera, ShieldAlert, Globe, UserPlus, User as UserIconAlt } from 'lucide-react';
import { LEGAL_DEFERMENT_REASONS, LOW_EDUCATION_GRADES, removeVietnameseTones } from '../constants';

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
  existingRecruits: Recruit[];
}

const RecruitForm: React.FC<RecruitFormProps> = ({ 
  initialData, 
  initialStatus, 
  user, 
  onSubmit, 
  onClose, 
  sessionYear, 
  existingRecruits 
}) => {
  const isReadOnly = user.role === 'PROVINCE_ADMIN' || user.role === 'VIEWER';
  const emptyFamilyMember: FamilyMember = { fullName: '', job: '', phoneNumber: '', birthYear: '' };
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const [formData, setFormData] = useState<Recruit>({
    id: generateId(), citizenId: '', fullName: '', dob: '', phoneNumber: '', avatarUrl: '',
    address: { province: user.unit.province, commune: user.unit.commune, village: '', street: '' },
    hometown: { province: '', commune: '', village: '' },
    physical: { height: 0, weight: 0, chest: 0, bmi: 0, healthGrade: 0, bloodPressure: '', note: '' },
    details: { 
      education: 'Lớp 12', ethnicity: 'Kinh', religion: 'Không', maritalStatus: 'Độc thân', 
      job: '', workAddress: '', gradeGroup: '', salaryLevel: '',
      politicalStatus: 'Doan_Vien', gifted: '',
      familyComposition: 'Bần nông', personalComposition: 'Phụ thuộc'
    },
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
        }
      });
    }
  }, [initialData]);

  // Logic tự động tính BMI, xét hoãn sức khỏe và phân loại danh sách khám tuyển
  useEffect(() => {
    const { height, weight, chest, bmi, healthGrade } = formData.physical;
    let nextStatus = formData.status;
    let nextReason = formData.defermentReason || '';

    // 1. Tự động tính BMI
    let calculatedBmi = bmi;
    if (height > 0 && weight > 0) {
      const h = height / 100;
      calculatedBmi = parseFloat((weight / (h * h)).toFixed(2));
      if (calculatedBmi !== bmi) {
        setFormData(prev => ({ ...prev, physical: { ...prev.physical, bmi: calculatedBmi } }));
        return; 
      }
    }

    if ([RecruitmentStatus.NOT_ALLOWED_REGISTRATION, RecruitmentStatus.EXEMPT_REGISTRATION].includes(formData.status)) {
        return;
    }

    // 2. Logic Tự động Tạm hoãn về Sức khỏe
    const isUnderHeight = height > 0 && height < 157;
    const isUnderWeight = weight > 0 && weight < 43;
    const isUnderChest = chest > 0 && chest < 75;
    const isInvalidBmi = calculatedBmi > 0 && (calculatedBmi > 29.9 || calculatedBmi < 18.5);

    if (isUnderHeight || isUnderWeight || isUnderChest || isInvalidBmi) {
        nextStatus = RecruitmentStatus.DEFERRED;
        nextReason = LEGAL_DEFERMENT_REASONS[0]; 
    } else {
      // 3. Tự động chuyển danh sách theo loại Sức khỏe
      if (healthGrade !== undefined && healthGrade > 0) {
          if (healthGrade >= 1 && healthGrade <= 3) {
              nextStatus = RecruitmentStatus.MED_EXAM_PASSED;
              nextReason = '';
          } else if (healthGrade >= 4 && healthGrade <= 6) {
              nextStatus = RecruitmentStatus.MED_EXAM_FAILED;
              nextReason = 'Sức khỏe loại ' + healthGrade;
          }
      } else if (nextStatus === RecruitmentStatus.DEFERRED && nextReason === LEGAL_DEFERMENT_REASONS[0]) {
          nextStatus = RecruitmentStatus.SOURCE;
          nextReason = '';
      }
    }

    if (nextStatus !== formData.status || nextReason !== formData.defermentReason) {
      setFormData(prev => ({ ...prev, status: nextStatus, defermentReason: nextReason }));
    }
  }, [formData.physical.height, formData.physical.weight, formData.physical.chest, formData.physical.bmi, formData.physical.healthGrade]);

  // LOGIC TỰ ĐỘNG XÉT TẠM HOÃN THEO HỌC VẤN
  useEffect(() => {
    const edu = formData.details.education;
    let nextStatus = formData.status;
    let nextReason = formData.defermentReason;

    if ([RecruitmentStatus.NOT_ALLOWED_REGISTRATION, RecruitmentStatus.EXEMPT_REGISTRATION].includes(formData.status)) {
        return;
    }

    if (edu === 'Đang học ĐH' || edu === 'Đang học CĐ') {
      nextStatus = RecruitmentStatus.DEFERRED;
      nextReason = LEGAL_DEFERMENT_REASONS[6];
    } 
    else if (LOW_EDUCATION_GRADES.includes(edu)) {
      nextStatus = RecruitmentStatus.DEFERRED;
      nextReason = LEGAL_DEFERMENT_REASONS[8];
    }
    else if (formData.status === RecruitmentStatus.DEFERRED && 
            (formData.defermentReason === LEGAL_DEFERMENT_REASONS[6] || formData.defermentReason === LEGAL_DEFERMENT_REASONS[8])) {
      nextStatus = RecruitmentStatus.SOURCE;
      nextReason = '';
    }

    if (nextStatus !== formData.status || nextReason !== formData.defermentReason) {
      setFormData(prev => ({ ...prev, status: nextStatus, defermentReason: nextReason }));
    }
  }, [formData.details.education]);

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
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Ảnh quá lớn (vượt quá 2MB). Vui lòng chọn ảnh nhẹ hơn.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        handleChange('avatarUrl', base64);
      };
      reader.readAsDataURL(file);
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

    // --- KIỂM TRA TRÙNG LẶP DỮ LIỆU ---
    const cleanCitizenId = formData.citizenId?.trim();
    const cleanFullName = formData.fullName?.trim();
    const normalizedNewName = removeVietnameseTones(cleanFullName.toLowerCase());

    const otherRecruits = existingRecruits.filter(r => r.id !== formData.id);

    // 1. Kiểm tra trùng CCCD
    if (cleanCitizenId) {
      const duplicateCCCD = otherRecruits.find(r => r.citizenId?.trim() === cleanCitizenId);
      if (duplicateCCCD) {
        alert(`LỖI: Số CCCD "${cleanCitizenId}" đã tồn tại trong hệ thống (Hồ sơ: ${duplicateCCCD.fullName}).\n\nMỗi công dân chỉ được có duy nhất một mã định danh. Vui lòng kiểm tra lại.`);
        return;
      }
    } 
    // 2. Kiểm tra trùng tên
    else {
      const duplicateName = otherRecruits.find(r => removeVietnameseTones(r.fullName.toLowerCase()) === normalizedNewName);
      if (duplicateName) {
        const confirmSave = window.confirm(
          `CẢNH BÁO: Công dân "${cleanFullName}" trùng tên với hồ sơ "${duplicateName.fullName}" (Sinh năm: ${duplicateName.dob?.split('-')[0] || '---'}) đã có trong hệ thống.\n\nVì công dân hiện tại chưa có số CCCD để đối soát duy nhất, bạn có chắc chắn đây là hai người khác nhau và muốn tiếp tục lưu không?`
        );
        if (!confirmSave) return;
      }
    }
    
    const birthYear = parseInt(formData.dob.split('-')[0] || '0');
    const age = sessionYear - birthYear;
    
    const isSourceTab = ![
      RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
      RecruitmentStatus.EXEMPT_REGISTRATION, 
      RecruitmentStatus.FIRST_TIME_REGISTRATION
    ].includes(formData.status);

    if (birthYear > 0 && isSourceTab && age < 18) {
        alert(`Công dân sinh năm ${birthYear} (${age} tuổi) chưa đủ 18 tuổi.\nVui lòng chuyển sang "DS 3: Đăng ký lần đầu" nếu đủ 17 tuổi.`);
        return;
    }

    // Yêu cầu chọn hình thức đăng ký cho DS 3
    if (formData.status === RecruitmentStatus.FIRST_TIME_REGISTRATION && !formData.details.registrationMethod) {
        alert("Vui lòng chọn Hình thức đăng ký (Trực tiếp hoặc Trực tuyến) cho công dân này.");
        return;
    }

    onSubmit(formData);
  };

  const isStudyingHigherEd = formData.details.education?.startsWith('Đang học');
  const isDS3 = formData.status === RecruitmentStatus.FIRST_TIME_REGISTRATION;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        <div className="bg-military-800 text-white border-b p-5 flex justify-between items-center shrink-0 shadow-lg relative z-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg"><UserIcon size={24}/></div>
             <h2 className="text-xl font-black uppercase tracking-tight">
               {initialData ? (isReadOnly ? 'Hồ sơ quân nhân' : 'Cập nhật dữ liệu') : 'Tiếp nhận công dân mới'}
             </h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={24} /></button>
        </div>

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

          {/* MỤC CHỌN HÌNH THỨC ĐĂNG KÝ - ĐƯA LÊN ĐẦU CHO DS 3 */}
          {isDS3 && (
            <div className="bg-cyan-50 border-2 border-cyan-200 p-5 rounded-2xl mb-8 animate-in slide-in-from-top-2 duration-500">
               <label className="block text-xs font-black text-cyan-800 uppercase mb-3 flex items-center gap-2">
                  <UserPlus size={18} className="text-cyan-600"/> Hình thức đăng ký Nghĩa vụ quân sự (Bắt buộc)
               </label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => handleChange('details.registrationMethod', 'DIRECT')}
                    className={`flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 transition-all font-black uppercase text-xs ${
                      formData.details.registrationMethod === 'DIRECT' 
                        ? 'bg-cyan-600 border-cyan-700 text-white shadow-lg scale-[1.02]' 
                        : 'bg-white border-gray-200 text-gray-400 hover:border-cyan-200'
                    }`}
                    disabled={isReadOnly}
                  >
                    <UserIconAlt size={20}/> Đăng ký trực tiếp
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleChange('details.registrationMethod', 'ONLINE')}
                    className={`flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 transition-all font-black uppercase text-xs ${
                      formData.details.registrationMethod === 'ONLINE' 
                        ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-[1.02]' 
                        : 'bg-white border-gray-200 text-gray-400 hover:border-blue-200'
                    }`}
                    disabled={isReadOnly}
                  >
                    <Globe size={20}/> Đăng ký trực tuyến
                  </button>
               </div>
               <p className="text-[10px] text-cyan-600 font-bold italic mt-2">* Thông tin này dùng để phân loại cách thức công dân thực hiện nghĩa vụ tại địa phương.</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="relative shrink-0 mx-auto md:mx-0">
                       <div className="w-32 h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative group">
                          {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="Avatar"/>
                          ) : (
                            <div className="text-center p-2">
                               <Camera size={32} className="mx-auto text-gray-300" />
                               <p className="text-[8px] font-black text-gray-400 mt-2 uppercase">Ảnh chân dung</p>
                            </div>
                          )}
                          {!isReadOnly && (
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-black uppercase">
                               Thay ảnh
                               <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </label>
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
                    label="Địa chỉ thường trú (Theo hộ khẩu)" icon={null} prefix="address"
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

        <div className="bg-white p-5 border-t flex items-center justify-between shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] relative z-10">
          <div className="hidden md:block text-left">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Đơn vị tiếp nhận hồ sơ:</p>
             <p className="text-xs font-black text-military-800 uppercase">{user.fullName}</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button type="button" onClick={onClose} className="flex-1 md:flex-none px-6 py-2.5 text-xs font-black text-gray-500 uppercase hover:text-gray-700 transition-colors">Hủy bỏ</button>
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
