
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Recruit, RecruitmentStatus, FamilyMember, User, RecruitAttachment } from '../types';
// Fix: Corrected import name from NOT_ALLOWED_REGISTRATION to NOT_ALLOWED_REGISTRATION_REASONS
import { EDUCATIONS, ETHNICITIES, RELIGIONS, LOCATION_DATA, PROVINCES_VN, removeVietnameseTones, MARITAL_STATUSES, LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS, LOW_EDUCATION_GRADES, POLICY_DEFERMENT_REASONS, NOT_ALLOWED_REGISTRATION_REASONS, EXEMPT_REGISTRATION_REASONS } from '../constants';
import { X, Save, User as UserIcon, Users, MapPin, Home, Activity, Info, Tent, Calendar, FileText, AlertTriangle, Paperclip, Trash2, Eye, Award } from 'lucide-react';

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
    id: generateId(),
    citizenId: '',
    fullName: '',
    dob: '',
    phoneNumber: '',
    address: { 
        province: user.unit.province,
        commune: user.unit.commune,
        village: '', 
        street: '' 
    },
    hometown: {
        province: '',
        commune: '',
        village: ''
    },
    physical: { height: 0, weight: 0, bmi: 0, healthGrade: 0 },
    details: {
      education: 'Lớp 12',
      educationPeriod: '',
      major: '',
      school: '',
      ethnicity: 'Kinh',
      religion: 'Không',
      maritalStatus: 'Độc thân',
      job: '',
      politicalStatus: 'Doan_Vien',
      partyEntryDate: '',
      gifted: ''
    },
    family: {
      father: { ...emptyFamilyMember },
      mother: { ...emptyFamilyMember },
      wife: { ...emptyFamilyMember },
      children: ''
    },
    status: initialStatus || RecruitmentStatus.SOURCE,
    recruitmentYear: sessionYear,
    enlistmentUnit: '',
    enlistmentDate: '',
    enlistmentType: 'OFFICIAL',
    defermentReason: '',
    defermentProof: '',
    attachments: []
  });

  // State to hold the specific reason selected from the dropdown
  const [selectedSpecialReason, setSelectedSpecialReason] = useState('');
  // State to hold the specific date details (e.g., date of release from prison)
  const [specialReasonDetail, setSpecialReasonDetail] = useState('');

  const isLocalityFixed = useMemo(() => {
     return !!user.unit.province && !!user.unit.commune;
  }, [user]);

  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);
  const communeWrapperRef = useRef<HTMLDivElement>(null);

  const [showHometownSuggestions, setShowHometownSuggestions] = useState(false);
  const hometownWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      // Logic to split existing reason if it contains details (for Not Allowed/Exempt)
      let parsedReason = initialData.defermentReason || '';
      let parsedDetail = '';
      
      const isNotAllowed = initialData.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION;
      const isExemptReg = initialData.status === RecruitmentStatus.EXEMPT_REGISTRATION;

      if (isNotAllowed) {
          // Fix: Used the correct constant name NOT_ALLOWED_REGISTRATION_REASONS
          const match = NOT_ALLOWED_REGISTRATION_REASONS.find(r => parsedReason.startsWith(r));
          if (match) {
              setSelectedSpecialReason(match);
              parsedDetail = parsedReason.replace(match, '').trim().replace(/^:\s*/, '').replace(/^\(\s*/, '').replace(/\)\s*$/, '');
          } else {
              setSelectedSpecialReason(parsedReason); // Fallback
          }
      } else if (isExemptReg) {
          const match = EXEMPT_REGISTRATION_REASONS.find(r => parsedReason.startsWith(r));
          if (match) {
              setSelectedSpecialReason(match);
              parsedDetail = parsedReason.replace(match, '').trim();
          } else {
              setSelectedSpecialReason(parsedReason);
          }
      } else {
          // For normal deferment, set selected reason if it matches any legal reason
          const match = LEGAL_DEFERMENT_REASONS.find(r => r === parsedReason);
          if (match) {
              // Just ensure consistency, actual reason is in formData
          }
      }
      setSpecialReasonDetail(parsedDetail);

      setFormData({
        ...initialData,
        citizenId: initialData.citizenId || '',
        address: {
            ...initialData.address,
        },
        family: {
          father: initialData.family?.father || { ...emptyFamilyMember },
          mother: initialData.family?.mother || { ...emptyFamilyMember },
          wife: initialData.family?.wife || { ...emptyFamilyMember },
          children: initialData.family?.children || ''
        },
        hometown: typeof initialData.hometown === 'string' 
            ? { province: '', commune: initialData.hometown, village: '' } 
            : { 
                province: initialData.hometown?.province || '',
                commune: initialData.hometown?.commune || '',
                village: initialData.hometown?.village || ''
            },
        details: {
            ...initialData.details,
            politicalStatus: initialData.details.politicalStatus || 'None',
            partyEntryDate: initialData.details.partyEntryDate || '',
            educationPeriod: initialData.details.educationPeriod || '',
            major: initialData.details.major || '',
            school: initialData.details.school || '',
            gifted: initialData.details.gifted || ''
        },
        physical: {
            ...initialData.physical,
            healthGrade: initialData.physical.healthGrade || 0
        },
        enlistmentUnit: initialData.enlistmentUnit || '',
        enlistmentDate: initialData.enlistmentDate || '',
        enlistmentType: initialData.enlistmentType || 'OFFICIAL',
        defermentReason: initialData.defermentReason || '',
        defermentProof: initialData.defermentProof || '',
        attachments: initialData.attachments || []
      });
    } else {
        setFormData(prev => ({
            ...prev, 
            recruitmentYear: sessionYear,
            status: initialStatus || RecruitmentStatus.SOURCE
        }));
    }
  }, [initialData, sessionYear, initialStatus]);

  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (communeWrapperRef.current && !communeWrapperRef.current.contains(event.target as Node)) {
              setShowCommuneSuggestions(false);
          }
          if (hometownWrapperRef.current && !hometownWrapperRef.current.contains(event.target as Node)) {
              setShowHometownSuggestions(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const provinceList = PROVINCES_VN;

  const addressCommuneList = useMemo(() => {
    // @ts-ignore
    const provinceData = LOCATION_DATA[formData.address.province];
    return provinceData ? Object.keys(provinceData) : [];
  }, [formData.address.province]);

  const filteredAddressCommunes = useMemo(() => {
      if (!formData.address.commune) return addressCommuneList;
      const search = removeVietnameseTones(formData.address.commune.toLowerCase());
      return addressCommuneList.filter(c => 
          removeVietnameseTones(c.toLowerCase()).includes(search)
      );
  }, [formData.address.commune, addressCommuneList]);

  const hometownProvinceList = PROVINCES_VN;

  const hometownCommuneList = useMemo(() => {
    // @ts-ignore
    const provinceData = LOCATION_DATA[formData.hometown.province];
    return provinceData ? Object.keys(provinceData) : [];
  }, [formData.hometown.province]);

  const filteredHometownCommunes = useMemo(() => {
      if (!formData.hometown.commune) return hometownCommuneList;
      const search = removeVietnameseTones(formData.hometown.commune.toLowerCase());
      return hometownCommuneList.filter(c => 
          removeVietnameseTones(c.toLowerCase()).includes(search)
      );
  }, [formData.hometown.commune, hometownCommuneList]);

  // LOGIC TÍNH BMI TỰ ĐỘNG
  useEffect(() => {
    if (formData.physical.height > 0 && formData.physical.weight > 0) {
      const heightInM = formData.physical.height / 100;
      const bmi = parseFloat((formData.physical.weight / (heightInM * heightInM)).toFixed(2));
      
      setFormData(prev => {
          const isBadBMI = bmi < 18 || bmi > 29.9;
          
          let newStatus = prev.status;
          let newReason = prev.defermentReason;

          const AUTO_DEFER_ALLOWED_STATUSES = [
              RecruitmentStatus.SOURCE, 
              RecruitmentStatus.PRE_CHECK_PASSED, 
              RecruitmentStatus.PRE_CHECK_FAILED, 
              RecruitmentStatus.MED_EXAM_PASSED, 
              RecruitmentStatus.MED_EXAM_FAILED, 
              RecruitmentStatus.DEFERRED
          ];

          if (isBadBMI && AUTO_DEFER_ALLOWED_STATUSES.includes(prev.status)) {
              newStatus = RecruitmentStatus.DEFERRED;
              if (!newReason || newReason.includes("BMI")) {
                   newReason = LEGAL_DEFERMENT_REASONS[0]; 
              }
          }
          
          return { 
              ...prev, 
              physical: { ...prev.physical, bmi },
              status: newStatus,
              defermentReason: newReason
          };
      });
    } else {
        if(formData.physical.bmi !== 0) {
             setFormData(prev => ({ ...prev, physical: { ...prev.physical, bmi: 0 } }));
        }
    }
  }, [formData.physical.height, formData.physical.weight]);

  // MỚI: TỰ ĐỘNG CHUYỂN TẠM HOÃN NẾU HỌC VẤN DƯỚI LỚP 8
  useEffect(() => {
      const isLowEdu = LOW_EDUCATION_GRADES.includes(formData.details.education);
      if (isLowEdu) {
          setFormData(prev => {
              if (prev.status !== RecruitmentStatus.DEFERRED || prev.defermentReason !== LEGAL_DEFERMENT_REASONS[8]) {
                  return {
                      ...prev,
                      status: RecruitmentStatus.DEFERRED,
                      defermentReason: LEGAL_DEFERMENT_REASONS[8] // Lý do số 9: Học vấn thấp
                  };
              }
              return prev;
          });
      }
  }, [formData.details.education]);

  // LOGIC TỰ ĐỘNG XÉT HOÃN/NGUỒN DỰA TRÊN NIÊN KHÓA
  useEffect(() => {
      const isStudyingHigherEd = formData.details.education === 'Đang học CĐ' || formData.details.education === 'Đang học ĐH';
      if (isStudyingHigherEd && formData.details.educationPeriod) {
          const parts = formData.details.educationPeriod.split('-');
          if (parts.length === 2) {
              const endYear = parseInt(parts[1].trim());
              if (!isNaN(endYear)) {
                  setFormData(prev => {
                      if (sessionYear <= endYear) {
                          if (prev.status !== RecruitmentStatus.DEFERRED) {
                              return {
                                  ...prev,
                                  status: RecruitmentStatus.DEFERRED,
                                  defermentReason: LEGAL_DEFERMENT_REASONS[6]
                              };
                          }
                      } 
                      else {
                          if (prev.status === RecruitmentStatus.DEFERRED && prev.defermentReason === LEGAL_DEFERMENT_REASONS[6]) {
                              return {
                                  ...prev,
                                  status: RecruitmentStatus.SOURCE,
                                  defermentReason: ''
                              };
                          }
                      }
                      return prev;
                  });
              }
          }
      }
  }, [formData.details.education, formData.details.educationPeriod, sessionYear]);

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

      if (field === 'physical.healthGrade') {
          const grade = Number(value);
          if (grade >= 4 && newData.status !== RecruitmentStatus.ENLISTED && newData.status !== RecruitmentStatus.REMOVED_FROM_SOURCE) {
              newData.status = RecruitmentStatus.DEFERRED;
              newData.defermentReason = LEGAL_DEFERMENT_REASONS[0]; 
          }
      }

      return newData;
    });
  };

  const handleAddressChange = (field: 'province' | 'commune' | 'village', value: string) => {
      setFormData(prev => {
          const newAddr = { ...prev.address, [field]: value };
          if (field === 'province') { newAddr.commune = ''; newAddr.village = ''; } 
          return { ...prev, address: newAddr };
      });
  };

  const handleHometownChange = (field: 'province' | 'commune' | 'village', value: string) => {
      setFormData(prev => {
          const newHome = { ...prev.hometown, [field]: value };
          if (field === 'province') { newHome.commune = ''; newHome.village = ''; }
          return { ...prev, hometown: newHome };
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          
          if (file.type !== 'application/pdf') {
              alert("Chỉ chấp nhận file PDF.");
              return;
          }

          if (file.size > 2 * 1024 * 1024) {
              alert("Cảnh báo: File lớn hơn 2MB có thể gây chậm hệ thống.");
          }

          const reader = new FileReader();
          reader.onload = (ev) => {
              const base64Url = ev.target?.result as string;
              const newAttachment: RecruitAttachment = {
                  name: file.name,
                  url: base64Url,
                  type: 'application/pdf',
                  uploadDate: new Date().toISOString()
              };
              setFormData(prev => ({
                  ...prev,
                  attachments: [...(prev.attachments || []), newAttachment]
              }));
          };
          reader.readAsDataURL(file);
      }
  };

  const removeAttachment = (index: number) => {
      setFormData(prev => ({
          ...prev,
          attachments: prev.attachments?.filter((_, i) => i !== index)
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    const isNotAllowed = formData.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION;
    const isExemptReg = formData.status === RecruitmentStatus.EXEMPT_REGISTRATION;

    let finalData = { ...formData };

    if (isNotAllowed || isExemptReg) {
        if (!selectedSpecialReason) {
            alert("Vui lòng chọn lý do cụ thể.");
            return;
        }
        let fullReason = selectedSpecialReason;
        if (specialReasonDetail && isNotAllowed) {
            fullReason = `${selectedSpecialReason} (${specialReasonDetail})`;
        }
        finalData.defermentReason = fullReason;
    }

    const statusRequiringReason = [
        RecruitmentStatus.DEFERRED, 
        RecruitmentStatus.EXEMPTED, 
        RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
        RecruitmentStatus.EXEMPT_REGISTRATION
    ];

    if (statusRequiringReason.includes(finalData.status) && !finalData.defermentReason) {
        alert("Vui lòng chọn hoặc nhập lý do cụ thể cho trạng thái này");
        return;
    }

    if (finalData.status === RecruitmentStatus.DEFERRED && POLICY_DEFERMENT_REASONS.includes(finalData.defermentReason || '')) {
        if (!finalData.defermentProof || finalData.defermentProof.trim() === '') {
            alert("Vui lòng nhập văn bản chứng minh cho trường hợp hoãn về chính sách (VD: Số quyết định, ngày tháng...)");
            return;
        }
    }
    
    if (finalData.details.politicalStatus === 'Dang_Vien' && !finalData.details.partyEntryDate) {
        alert("Vui lòng nhập ngày vào Đảng");
        return;
    }

    const isStudyingHigherEd = finalData.details.education === 'Đang học CĐ' || finalData.details.education === 'Đang học ĐH';
    if (isStudyingHigherEd && !finalData.details.educationPeriod) {
        alert("Vui lòng nhập Niên khóa (VD: 2023-2027) cho trường hợp đang đi học.");
        return;
    }

    // Cập nhật kiểm tra tuổi: Không cho phép thêm dưới 18 tuổi vào List 4
    const birthYear = parseInt(finalData.dob.split('-')[0] || '0');
    if (birthYear > 0) {
        const age = sessionYear - birthYear;
        if (finalData.status === RecruitmentStatus.SOURCE && age < 18) {
             alert(`Công dân sinh năm ${birthYear} (${age} tuổi) chưa đủ 18 tuổi để thêm vào danh sách 4 (Tổng nguồn). Theo quy định, Danh sách 4 chỉ nhận công dân từ đủ 18 tuổi.`);
             return;
        }
        // Nếu trên 27 tuổi, tự động đưa vào danh sách 15 (Xóa) khi lưu
        if (age > 27 && finalData.status !== RecruitmentStatus.DELETED) {
             if (window.confirm(`Công dân đã ${age} tuổi (trên 27 tuổi). Hệ thống sẽ tự động chuyển hồ sơ này vào Danh sách 15 (Đã xóa/Hết tuổi). Bạn đồng ý?`)) {
                 finalData.status = RecruitmentStatus.DELETED;
             } else {
                 return;
             }
        }
    }

    onSubmit(finalData);
  };

  const isStudyingHigherEd = formData.details.education === 'Đang học CĐ' || formData.details.education === 'Đang học ĐH';
  const isPolicyReason = POLICY_DEFERMENT_REASONS.includes(formData.defermentReason || '');
  const isSpecialList = formData.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || formData.status === RecruitmentStatus.EXEMPT_REGISTRATION;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="bg-white text-gray-900 border-b border-gray-200 p-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold uppercase flex items-center gap-2 text-military-700">
            {initialData ? (isReadOnly ? 'Chi tiết hồ sơ' : 'Cập nhật hồ sơ') : 'Thêm mới công dân'}
          </h2>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Read Only Banner */}
          {isReadOnly && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded mb-4 flex items-center gap-2">
                  <AlertTriangle size={18}/> <span>Bạn đang ở chế độ xem. Không thể chỉnh sửa thông tin này.</span>
              </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm">
                 <UserIcon size={18} /> Thông tin chung
               </h3>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700">Họ và tên</label>
                  <input 
                    required
                    type="text" 
                    readOnly={isReadOnly}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-military-500 focus:ring-military-500 border p-2 text-gray-900"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                  />
                 </div>
                 
                 <div>
                  <label className="block text-sm font-bold text-gray-700">Ngày sinh</label>
                  <input 
                    required
                    type="date" 
                    readOnly={isReadOnly}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-military-500 focus:ring-military-500 border p-2 text-gray-900"
                    value={formData.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                  />
                 </div>
                 <div>
                  <label className="block text-sm font-bold text-gray-700">Số CCCD</label>
                  <input 
                    type="text" 
                    readOnly={isReadOnly}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-military-500 focus:ring-military-500 border p-2 text-gray-900 font-mono"
                    value={formData.citizenId}
                    onChange={(e) => handleChange('citizenId', e.target.value)}
                  />
                 </div>

                 <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700">Số điện thoại</label>
                  <input 
                    type="text" 
                    readOnly={isReadOnly}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-military-500 focus:ring-military-500 border p-2 text-gray-900"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  />
                 </div>
               </div>

               <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-6">
                 <MapPin size={18} /> Nơi ở hiện tại
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tỉnh / Thành phố</label>
                    {isLocalityFixed ? (
                        <div className="p-2 bg-gray-100 rounded text-gray-700 font-bold text-sm border border-gray-200">
                            {formData.address.province}
                        </div>
                    ) : (
                        <select 
                            className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500 disabled:bg-gray-100"
                            value={formData.address.province}
                            onChange={(e) => handleAddressChange('province', e.target.value)}
                            disabled={isReadOnly}
                        >
                            <option value="">-- Chọn Tỉnh --</option>
                            {provinceList.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    )}
                 </div>
                 
                 <div className="col-span-1 relative" ref={communeWrapperRef}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Xã / Phường</label>
                    {isLocalityFixed ? (
                        <div className="p-2 bg-gray-100 rounded text-gray-700 font-bold text-sm border border-gray-200">
                            {formData.address.commune}
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="Nhập tên Xã/Phường..."
                                className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500 disabled:bg-gray-100"
                                value={formData.address.commune}
                                onChange={(e) => {
                                    handleAddressChange('commune', e.target.value);
                                    setShowCommuneSuggestions(true);
                                }}
                                onFocus={() => setShowCommuneSuggestions(true)}
                                disabled={!formData.address.province || isReadOnly}
                            />
                            {showCommuneSuggestions && formData.address.province && !isReadOnly && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                                    {addressCommuneList.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-gray-500 italic">Dữ liệu đang cập nhật...</div>
                                    ) : filteredAddressCommunes.length > 0 ? (
                                        filteredAddressCommunes.map((c, index) => (
                                            <div 
                                                key={index}
                                                className="px-3 py-2 text-sm text-gray-800 hover:bg-military-50 cursor-pointer flex items-center gap-2 border-b border-gray-50 last:border-0"
                                                onClick={() => {
                                                    handleAddressChange('commune', c);
                                                    setShowCommuneSuggestions(false);
                                                }}
                                            >
                                                <MapPin size={12} className="text-military-400" />
                                                {c}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-gray-500 italic">Không tìm thấy kết quả phù hợp</div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                 </div>

                 <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Thôn / Ấp</label>
                    <input 
                        type="text"
                        className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500 disabled:bg-gray-100"
                        value={formData.address.village}
                        onChange={(e) => handleAddressChange('village', e.target.value)}
                        placeholder="Nhập tên Thôn/Ấp..."
                        readOnly={isReadOnly}
                    />
                 </div>
                 
                 <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Số nhà, đường</label>
                    <input 
                        type="text" 
                        className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500 disabled:bg-gray-100"
                        value={formData.address.street}
                        onChange={(e) => setFormData(prev => ({...prev, address: {...prev.address, street: e.target.value}}))}
                        readOnly={isReadOnly}
                    />
                 </div>
               </div>

               <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-6">
                 <Home size={18} /> Quê quán
               </h3>
                <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tỉnh / Thành phố</label>
                    <select 
                        className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500 disabled:bg-gray-100"
                        value={formData.hometown.province}
                        onChange={(e) => handleHometownChange('province', e.target.value)}
                        disabled={isReadOnly}
                    >
                        <option value="">-- Chọn Tỉnh --</option>
                        {hometownProvinceList.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 
                 <div className="col-span-1 relative" ref={hometownWrapperRef}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Xã / Phường</label>
                    <input
                        type="text"
                        placeholder="Nhập tên Xã/Phường..."
                        className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500 disabled:bg-gray-100"
                        value={formData.hometown.commune}
                        onChange={(e) => {
                            handleHometownChange('commune', e.target.value);
                            setShowHometownSuggestions(true);
                        }}
                        onFocus={() => setShowHometownSuggestions(true)}
                        disabled={!formData.hometown.province || isReadOnly}
                    />
                     {showHometownSuggestions && formData.hometown.province && !isReadOnly && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                            {hometownCommuneList.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-gray-500 italic">Dữ liệu đang cập nhật...</div>
                            ) : filteredHometownCommunes.length > 0 ? (
                                filteredHometownCommunes.map((c, index) => (
                                    <div 
                                        key={index}
                                        className="px-3 py-2 text-sm text-gray-800 hover:bg-military-50 cursor-pointer flex items-center gap-2 border-b border-gray-50 last:border-0"
                                        onClick={() => {
                                            handleHometownChange('commune', c);
                                            setShowHometownSuggestions(false);
                                        }}
                                    >
                                        <MapPin size={12} className="text-military-400" />
                                        {c}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-500 italic">Không tìm thấy kết quả phù hợp</div>
                            )}
                        </div>
                    )}
                 </div>

                 <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Thôn / Ấp</label>
                    <input 
                        type="text"
                        className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500 disabled:bg-gray-100"
                        value={formData.hometown.village}
                        onChange={(e) => handleHometownChange('village', e.target.value)}
                        placeholder="Nhập tên Thôn/Ấp..."
                        readOnly={isReadOnly}
                    />
                 </div>
               </div>
            </div>

            <div className="space-y-6">
                
                {(formData.status === RecruitmentStatus.FINALIZED || formData.status === RecruitmentStatus.ENLISTED) && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-green-100 rounded-full text-green-700">
                                <Tent size={16} />
                            </div>
                            <label className="text-sm font-bold text-green-800 uppercase">
                                Nhập ngũ (Dự kiến / Chính thức)
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-green-700 mb-1">Loại nhập ngũ</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="enlistmentType" 
                                            value="OFFICIAL" 
                                            checked={formData.enlistmentType === 'OFFICIAL' || !formData.enlistmentType} 
                                            onChange={() => handleChange('enlistmentType', 'OFFICIAL')} 
                                            disabled={isReadOnly}
                                        />
                                        <span className="text-sm font-bold text-red-600">Chính thức</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="enlistmentType" 
                                            value="RESERVE" 
                                            checked={formData.enlistmentType === 'RESERVE'} 
                                            onChange={() => handleChange('enlistmentType', 'RESERVE')} 
                                            disabled={isReadOnly}
                                        />
                                        <span className="text-sm font-bold text-teal-600">Dự bị</span>
                                    </label>
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-green-700 mb-1">Đơn vị tiếp nhận</label>
                                <input 
                                    type="text" 
                                    placeholder="VD: Sư đoàn 309..."
                                    className="w-full p-2 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500 font-bold text-green-900 bg-white disabled:bg-gray-100"
                                    value={formData.enlistmentUnit || ''}
                                    onChange={(e) => handleChange('enlistmentUnit', e.target.value)}
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-green-700 mb-1">Ngày nhập ngũ</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500 font-bold text-green-900 bg-white disabled:bg-gray-100"
                                    value={formData.enlistmentDate || ''}
                                    onChange={(e) => handleChange('enlistmentDate', e.target.value)}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm">
                 <Activity size={18} /> Chi tiết & Gia cảnh
               </h3>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Trình độ học vấn</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 disabled:bg-gray-100"
                        value={formData.details.education}
                        onChange={(e) => {
                            handleChange('details.education', e.target.value);
                        }}
                        disabled={isReadOnly}
                    >
                        {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  
                  {isStudyingHigherEd && (
                      <div className="animate-in fade-in slide-in-from-top-1">
                          <label className="block text-sm font-bold text-blue-700">Niên khóa (Bắt buộc)</label>
                          <input 
                              type="text" 
                              required
                              placeholder="VD: 2023-2027"
                              className="mt-1 block w-full rounded-md border-blue-300 shadow-sm border p-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 bg-blue-50 disabled:bg-gray-100"
                              value={formData.details.educationPeriod || ''}
                              onChange={(e) => handleChange('details.educationPeriod', e.target.value)}
                              readOnly={isReadOnly}
                          />
                          {!isReadOnly && <p className="text-[10px] text-blue-500 mt-1 italic">* Hệ thống sẽ tự động đối chiếu năm tuyển quân ({sessionYear}) để xếp vào diện Tạm hoãn hoặc Đủ ĐK sơ tuyển.</p>}
                      </div>
                  )}

                  <div className={isStudyingHigherEd ? "col-span-2" : ""}>
                    <label className="block text-sm font-bold text-gray-700">Công việc (Nhập tay)</label>
                    <input 
                        type="text" 
                        placeholder="VD: Làm nông, Công nhân..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 disabled:bg-gray-100"
                        value={formData.details.job}
                        onChange={(e) => handleChange('details.job', e.target.value)}
                        readOnly={isReadOnly}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700">Trường học</label>
                    <input 
                        type="text" 
                        placeholder="Nhập tên trường học..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 disabled:bg-gray-100"
                        value={formData.details.school || ''}
                        onChange={(e) => handleChange('details.school', e.target.value)}
                        readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Ngành học</label>
                    <input 
                        type="text" 
                        placeholder="Nhập tên ngành học..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 disabled:bg-gray-100"
                        value={formData.details.major || ''}
                        onChange={(e) => handleChange('details.major', e.target.value)}
                        readOnly={isReadOnly}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700">Dân tộc</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 disabled:bg-gray-100"
                        value={formData.details.ethnicity}
                        onChange={(e) => handleChange('details.ethnicity', e.target.value)}
                        disabled={isReadOnly}
                    >
                        {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Tôn giáo</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 disabled:bg-gray-100"
                        value={formData.details.religion}
                        onChange={(e) => handleChange('details.religion', e.target.value)}
                        disabled={isReadOnly}
                    >
                        {RELIGIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700">Hôn nhân</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 disabled:bg-gray-100"
                        value={formData.details.maritalStatus}
                        onChange={(e) => handleChange('details.maritalStatus', e.target.value)}
                        disabled={isReadOnly}
                    >
                        {MARITAL_STATUSES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700">Năng khiếu</label>
                    <input 
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 disabled:bg-gray-100"
                        value={formData.details.gifted || ''}
                        onChange={(e) => handleChange('details.gifted', e.target.value)}
                        placeholder="VD: Hát, đá bóng, lái xe..."
                        readOnly={isReadOnly}
                    />
                  </div>
                  
                  <div className="col-span-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                     <label className="block text-sm font-bold text-gray-700 mb-2">Chính trị</label>
                     <div className="flex gap-4">
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="political" value="None" checked={formData.details.politicalStatus === 'None'} onChange={() => handleChange('details.politicalStatus', 'None')} disabled={isReadOnly} />
                             <span className="text-sm">Quần chúng</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="political" value="Doan_Vien" checked={formData.details.politicalStatus === 'Doan_Vien'} onChange={() => handleChange('details.politicalStatus', 'Doan_Vien')} disabled={isReadOnly} />
                             <span className="text-sm font-bold text-blue-600">Đoàn viên</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="political" value="Dang_Vien" checked={formData.details.politicalStatus === 'Dang_Vien'} onChange={() => handleChange('details.politicalStatus', 'Dang_Vien')} disabled={isReadOnly} />
                             <span className="text-sm font-bold text-red-600">Đảng viên</span>
                         </label>
                     </div>
                     {formData.details.politicalStatus === 'Dang_Vien' && (
                         <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                             <label className="text-xs font-bold text-gray-500">Ngày vào Đảng:</label>
                             <input 
                                type="date" 
                                className="ml-2 border border-gray-300 rounded p-1 text-sm disabled:bg-gray-100"
                                value={formData.details.partyEntryDate || ''}
                                onChange={(e) => handleChange('details.partyEntryDate', e.target.value)}
                                readOnly={isReadOnly}
                             />
                         </div>
                     )}
                  </div>

                  <div className="col-span-2 grid grid-cols-4 gap-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                      <div>
                          <label className="block text-xs font-bold text-gray-500">Chiều cao (cm)</label>
                          <input 
                            type="number" 
                            className="w-full mt-1 p-1 border rounded text-center font-bold disabled:bg-gray-100" 
                            value={formData.physical.height || ''} 
                            onChange={(e) => handleChange('physical.height', Number(e.target.value))} 
                            readOnly={isReadOnly}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500">Cân nặng (kg)</label>
                          <input 
                            type="number" 
                            className="w-full mt-1 p-1 border rounded text-center font-bold disabled:bg-gray-100" 
                            value={formData.physical.weight || ''} 
                            onChange={(e) => handleChange('physical.weight', Number(e.target.value))} 
                            readOnly={isReadOnly}
                          />
                      </div>
                      <div className="flex flex-col justify-end">
                          <label className="block text-xs font-bold text-gray-500">BMI (Tự động)</label>
                          <div className={`mt-1 py-1 px-2 border rounded text-center font-bold bg-white flex items-center justify-center gap-1
                              ${formData.physical.bmi >= 18.5 && formData.physical.bmi <= 29.9 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}
                          `}>
                              {formData.physical.bmi || '--'}
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500">PL Sức khỏe</label>
                          <select className="w-full mt-1 p-1 border rounded text-center font-bold disabled:bg-gray-100" value={formData.physical.healthGrade} onChange={(e) => handleChange('physical.healthGrade', Number(e.target.value))} disabled={isReadOnly}>
                              <option value="0">--</option>
                              <option value="1">Loại 1</option>
                              <option value="2">Loại 2</option>
                              <option value="3">Loại 3</option>
                              <option value="4">Loại 4</option>
                              <option value="5">Loại 5</option>
                              <option value="6">Loại 6</option>
                          </select>
                      </div>
                      <div className="col-span-4 mt-1 flex items-center gap-2 text-[11px]">
                          {formData.physical.bmi > 0 ? (
                              <>
                                <Info size={14} className={formData.physical.bmi >= 18.5 && formData.physical.bmi <= 29.9 ? "text-green-600" : "text-red-600"}/>
                                {formData.physical.bmi < 18.5 && <span className="text-red-600 font-bold">Gầy (BMI &lt; 18.5)</span>}
                                {formData.physical.bmi >= 18.5 && formData.physical.bmi <= 29.9 && <span className="text-green-600 font-bold">Bình thường (18.5 - 29.9)</span>}
                                {formData.physical.bmi > 29.9 && <span className="text-red-600 font-bold">Thừa cân/Béo phì (BMI &gt; 29.9)</span>}
                                <span className="text-gray-400 italic ml-2">- Cần khám lâm sàng để kết luận PL Sức khỏe</span>
                              </>
                          ) : (
                              <span className="text-gray-400 italic">* Nhập chiều cao & cân nặng để tính BMI tham khảo</span>
                          )}
                      </div>
                  </div>
                  
                   {(formData.status === RecruitmentStatus.DEFERRED || formData.status === RecruitmentStatus.EXEMPTED || isSpecialList) && (
                      <div className={`col-span-2 p-3 rounded-md border animate-in fade-in slide-in-from-top-2 ${formData.status === RecruitmentStatus.DEFERRED ? 'bg-amber-50 border-amber-200' : isSpecialList ? 'bg-gray-100 border-gray-300' : 'bg-purple-50 border-purple-200'}`}>
                          <label className={`block text-sm font-bold mb-1 ${formData.status === RecruitmentStatus.DEFERRED ? 'text-amber-800' : isSpecialList ? 'text-gray-800' : 'text-purple-800'}`}>
                              Lý do {formData.status === RecruitmentStatus.DEFERRED ? 'Tạm hoãn' : formData.status === RecruitmentStatus.EXEMPTED ? 'Miễn' : formData.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION ? 'Không được đăng ký' : 'Miễn đăng ký'}:
                          </label>
                          
                          {isSpecialList ? (
                              <div className="space-y-2">
                                  <select 
                                      className="w-full p-2 border rounded text-sm focus:ring-2 border-gray-300 disabled:bg-gray-100"
                                      value={selectedSpecialReason}
                                      onChange={(e) => setSelectedSpecialReason(e.target.value)}
                                      disabled={isReadOnly}
                                  >
                                      <option value="">-- Chọn lý do theo quy định --</option>
                                      {/* Fix: Used the correct constant name NOT_ALLOWED_REGISTRATION_REASONS */}
                                      {(formData.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION ? NOT_ALLOWED_REGISTRATION_REASONS : EXEMPT_REGISTRATION_REASONS).map((reason, idx) => (
                                          <option key={idx} value={reason}>{reason}</option>
                                      ))}
                                  </select>
                                  
                                  {formData.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION && selectedSpecialReason && (
                                      <div className="animate-in fade-in slide-in-from-top-1">
                                          <label className="block text-xs font-bold text-gray-600 mb-1">Chi tiết thời gian (bắt buộc):</label>
                                          <input 
                                              type="text"
                                              placeholder={selectedSpecialReason.includes("tù") ? "Thời gian ra khi nào?" : "Thời gian thực hiện/áp dụng?"}
                                              className="w-full p-2 border border-gray-300 rounded text-sm bg-white disabled:bg-gray-100"
                                              value={specialReasonDetail}
                                              onChange={(e) => setSpecialReasonDetail(e.target.value)}
                                              readOnly={isReadOnly}
                                          />
                                      </div>
                                  )}
                              </div>
                          ) : formData.status === RecruitmentStatus.DEFERRED ? (
                              <div className="relative">
                                <select 
                                    required
                                    className="w-full p-2 border border-amber-300 rounded text-sm focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                                    value={formData.defermentReason || ''}
                                    onChange={(e) => handleChange('defermentReason', e.target.value)}
                                    disabled={isReadOnly}
                                >
                                    <option value="">-- Chọn lý do Tạm hoãn (Bắt buộc) --</option>
                                    {LEGAL_DEFERMENT_REASONS.map((reason, idx) => (
                                        <option key={idx} value={reason}>{reason}</option>
                                    ))}
                                </select>
                              </div>
                          ) : formData.status === RecruitmentStatus.EXEMPTED ? (
                              <div className="relative">
                                <select 
                                    required
                                    className="w-full p-2 border border-purple-300 rounded text-sm focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                    value={formData.defermentReason || ''}
                                    onChange={(e) => handleChange('defermentReason', e.target.value)}
                                    disabled={isReadOnly}
                                >
                                    <option value="">-- Chọn lý do Miễn (Bắt buộc) --</option>
                                    {LEGAL_EXEMPTION_REASONS.map((reason, idx) => (
                                        <option key={idx} value={reason}>{reason}</option>
                                    ))}
                                </select>
                              </div>
                          ) : (
                              <div className="relative">
                                <input 
                                    required
                                    type="text"
                                    placeholder="Nhập lý do cụ thể..."
                                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100"
                                    value={formData.defermentReason || ''}
                                    onChange={(e) => handleChange('defermentReason', e.target.value)}
                                    readOnly={isReadOnly}
                                />
                              </div>
                          )}
                          
                          {isPolicyReason && formData.status === RecruitmentStatus.DEFERRED && (
                              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                      <FileText size={12} /> Văn bản chứng minh (Bắt buộc):
                                  </label>
                                  <input 
                                      type="text"
                                      required
                                      placeholder="VD: Theo Quyết định số 123/QĐ-UBND ngày 20/10/2024..."
                                      className="w-full p-2 border border-amber-300 rounded text-sm focus:ring-2 focus:ring-amber-500 bg-white disabled:bg-gray-100"
                                      value={formData.defermentProof || ''}
                                      onChange={(e) => handleChange('defermentProof', e.target.value)}
                                      readOnly={isReadOnly}
                                  />
                              </div>
                          )}
                      </div>
                   )}
               </div>
               
               <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-6">
                 <Users size={18} /> Quan hệ gia đình
               </h3>

               <div className="space-y-4 mt-4">
                  {/* Father */}
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Thông tin Cha</label>
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="text" placeholder="Họ và tên cha"
                            className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                            value={formData.family.father.fullName}
                            onChange={(e) => handleChange('family.father.fullName', e.target.value)}
                            readOnly={isReadOnly}
                        />
                         <input 
                            type="text" placeholder="Năm sinh"
                            className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                            value={formData.family.father.birthYear || ''}
                            onChange={(e) => handleChange('family.father.birthYear', e.target.value)}
                            readOnly={isReadOnly}
                        />
                        <input 
                            type="text" placeholder="Nghề nghiệp"
                            className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                            value={formData.family.father.job}
                            onChange={(e) => handleChange('family.father.job', e.target.value)}
                            readOnly={isReadOnly}
                        />
                        <input 
                            type="text" placeholder="SĐT liên hệ"
                            className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                            value={formData.family.father.phoneNumber}
                            onChange={(e) => handleChange('family.father.phoneNumber', e.target.value)}
                            readOnly={isReadOnly}
                        />
                    </div>
                  </div>

                  {/* Mother */}
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Thông tin Mẹ</label>
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="text" placeholder="Họ và tên mẹ"
                            className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                            value={formData.family.mother.fullName}
                            onChange={(e) => handleChange('family.mother.fullName', e.target.value)}
                            readOnly={isReadOnly}
                        />
                         <input 
                            type="text" placeholder="Năm sinh"
                            className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                            value={formData.family.mother.birthYear || ''}
                            onChange={(e) => handleChange('family.mother.birthYear', e.target.value)}
                            readOnly={isReadOnly}
                        />
                        <input 
                            type="text" placeholder="Nghề nghiệp"
                            className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                            value={formData.family.mother.job}
                            onChange={(e) => handleChange('family.mother.job', e.target.value)}
                            readOnly={isReadOnly}
                        />
                        <input 
                            type="text" placeholder="SĐT liên hệ"
                            className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                            value={formData.family.mother.phoneNumber}
                            onChange={(e) => handleChange('family.mother.phoneNumber', e.target.value)}
                            readOnly={isReadOnly}
                        />
                    </div>
                  </div>

                  {/* Wife (Optional) */}
                  {formData.details.maritalStatus === 'Đã kết hôn' && (
                      <div className="bg-gray-50 p-3 rounded border border-gray-200 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Thông tin Vợ</label>
                        <div className="grid grid-cols-2 gap-3">
                            <input 
                                type="text" placeholder="Họ và tên vợ"
                                className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                                value={formData.family.wife?.fullName || ''}
                                onChange={(e) => handleChange('family.wife.fullName', e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <input 
                                type="text" placeholder="Năm sinh"
                                className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                                value={formData.family.wife?.birthYear || ''}
                                onChange={(e) => handleChange('family.wife.birthYear', e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <input 
                                type="text" placeholder="Nghề nghiệp"
                                className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                                value={formData.family.wife?.job || ''}
                                onChange={(e) => handleChange('family.wife.job', e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <input 
                                type="text" placeholder="SĐT liên hệ"
                                className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                                value={formData.family.wife?.phoneNumber || ''}
                                onChange={(e) => handleChange('family.wife.phoneNumber', e.target.value)}
                                readOnly={isReadOnly}
                            />
                        </div>
                      </div>
                  )}
                  
                  {/* Children */}
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Thông tin con cái (nếu có)</label>
                      <textarea 
                          className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                          rows={2}
                          placeholder="Nhập tên, năm sinh các con..."
                          value={formData.family.children}
                          onChange={(e) => handleChange('family.children', e.target.value)}
                          readOnly={isReadOnly}
                      />
                  </div>
               </div>

               {/* Attachments Section */}
               <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-6">
                 <Paperclip size={18} /> Hồ sơ đính kèm (PDF)
               </h3>
               <div className="mt-4">
                   {!isReadOnly && (
                       <div className="mb-4">
                           <input type="file" accept="application/pdf" id="file-upload" className="hidden" onChange={handleFileUpload} />
                           <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded border border-gray-300 transition-colors">
                               <Paperclip size={16}/> Chọn tệp PDF
                           </label>
                           <span className="ml-3 text-xs text-gray-500 italic">Tối đa 2MB/file</span>
                       </div>
                   )}
                   
                   {formData.attachments && formData.attachments.length > 0 ? (
                       <div className="space-y-2">
                           {formData.attachments.map((file, idx) => (
                               <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded">
                                   <div className="flex items-center gap-2 overflow-hidden">
                                       <FileText size={16} className="text-blue-500 shrink-0"/>
                                       <span className="text-sm font-medium text-blue-800 truncate">{file.name}</span>
                                       <span className="text-xs text-gray-400">({new Date(file.uploadDate).toLocaleDateString()})</span>
                                   </div>
                                   <div className="flex items-center gap-2 shrink-0">
                                       <a href={file.url} download={file.name} className="p-1 hover:bg-blue-200 rounded text-blue-600" title="Tải xuống"><Eye size={16}/></a>
                                       {!isReadOnly && (
                                           <button type="button" onClick={() => removeAttachment(idx)} className="p-1 hover:bg-red-200 rounded text-red-600" title="Xóa"><Trash2 size={16}/></button>
                                       )}
                                   </div>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <p className="text-sm text-gray-400 italic">Chưa có tệp đính kèm nào.</p>
                   )}
               </div>

            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 sticky bottom-0 bg-white p-4 -mx-6 -mb-6 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors">
              Hủy bỏ
            </button>
            {!isReadOnly && (
                <button type="submit" className="px-6 py-2 bg-military-600 text-white rounded-lg font-bold hover:bg-military-700 shadow-md flex items-center gap-2 transition-transform transform hover:-translate-y-0.5">
                  <Save size={18} /> Lưu hồ sơ
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruitForm;
