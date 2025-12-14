
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Recruit, RecruitmentStatus, FamilyMember, User } from '../types';
import { EDUCATIONS, ETHNICITIES, RELIGIONS, LOCATION_DATA, PROVINCES_VN, removeVietnameseTones, MARITAL_STATUSES, LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS, LOW_EDUCATION_GRADES, POLICY_DEFERMENT_REASONS } from '../constants';
import { X, Save, User as UserIcon, Users, MapPin, Home, Activity, Info, Tent, Calendar, FileText } from 'lucide-react';

interface RecruitFormProps {
  initialData?: Recruit;
  user: User; // Current logged in user for auto-fill
  onSubmit: (data: Recruit) => void;
  onClose: () => void;
  sessionYear: number; // Nhận năm của phiên làm việc
}

const RecruitForm: React.FC<RecruitFormProps> = ({ initialData, user, onSubmit, onClose, sessionYear }) => {
  const emptyFamilyMember: FamilyMember = { fullName: '', job: 'Làm nông', phoneNumber: '', birthYear: '' };

  // Helper to safely generate IDs in all environments
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const [formData, setFormData] = useState<Recruit>({
    id: generateId(),
    citizenId: '',
    fullName: '',
    dob: '',
    phoneNumber: '',
    address: { 
        province: user.unit.province, // Auto-fill from User
        commune: user.unit.commune,   // Auto-fill from User
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
      education: 'Lớp 12', // Default reasonable value
      educationPeriod: '',
      ethnicity: 'Kinh',
      religion: 'Không',
      maritalStatus: 'Độc thân',
      job: '',
      politicalStatus: 'Doan_Vien',
      partyEntryDate: ''
    },
    family: {
      father: { ...emptyFamilyMember },
      mother: { ...emptyFamilyMember },
      wife: { ...emptyFamilyMember },
      children: ''
    },
    status: RecruitmentStatus.SOURCE,
    recruitmentYear: sessionYear, // Mặc định theo sessionYear
    enlistmentUnit: '',
    enlistmentDate: '',
    defermentReason: '',
    defermentProof: ''
  });

  // Check if locality is fixed based on user login
  const isLocalityFixed = useMemo(() => {
     return !!user.unit.province && !!user.unit.commune;
  }, [user]);

  // Suggestion State for Address Commune
  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);
  const communeWrapperRef = useRef<HTMLDivElement>(null);

  // Suggestion State for Hometown Commune
  const [showHometownSuggestions, setShowHometownSuggestions] = useState(false);
  const hometownWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
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
        // Handle backward compatibility for hometown
        hometown: typeof initialData.hometown === 'string' 
            ? { province: '', commune: initialData.hometown, village: '' } 
            : { 
                province: initialData.hometown?.province || '',
                commune: initialData.hometown?.commune || '',
                village: initialData.hometown?.village || ''
            },
        details: {
            ...initialData.details,
            politicalStatus: initialData.details.politicalStatus || 'None', // Default to None if undefined
            partyEntryDate: initialData.details.partyEntryDate || '',
            educationPeriod: initialData.details.educationPeriod || ''
        },
        physical: {
            ...initialData.physical,
            healthGrade: initialData.physical.healthGrade || 0
        },
        enlistmentUnit: initialData.enlistmentUnit || '',
        enlistmentDate: initialData.enlistmentDate || '',
        defermentReason: initialData.defermentReason || '',
        defermentProof: initialData.defermentProof || ''
      });
    } else {
        // Ensure new records allow follow sessionYear
        setFormData(prev => ({...prev, recruitmentYear: sessionYear}));
    }
  }, [initialData, sessionYear]);

  // Click outside to close suggestions
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

  // Use Full Country List for Address
  const provinceList = PROVINCES_VN;

  const addressCommuneList = useMemo(() => {
    // @ts-ignore
    const provinceData = LOCATION_DATA[formData.address.province];
    return provinceData ? Object.keys(provinceData) : [];
  }, [formData.address.province]);

  // Filter Logic for Address Commune
  const filteredAddressCommunes = useMemo(() => {
      if (!formData.address.commune) return addressCommuneList;
      const search = removeVietnameseTones(formData.address.commune.toLowerCase());
      return addressCommuneList.filter(c => 
          removeVietnameseTones(c.toLowerCase()).includes(search)
      );
  }, [formData.address.commune, addressCommuneList]);

  // Hometown uses full list + suggestion logic
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

  // --- LOGIC TỰ ĐỘNG CHUYỂN TRẠNG THÁI ---
  
  // 1. Logic BMI: Tự động tính BMI và kiểm tra điều kiện hoãn
  useEffect(() => {
    if (formData.physical.height > 0 && formData.physical.weight > 0) {
      const heightInM = formData.physical.height / 100;
      const bmi = parseFloat((formData.physical.weight / (heightInM * heightInM)).toFixed(2));
      
      setFormData(prev => {
          // Điều kiện BMI < 18 hoặc BMI > 29.9 -> Tự động hoãn
          const isBadBMI = bmi < 18 || bmi > 29.9;
          
          let newStatus = prev.status;
          let newReason = prev.defermentReason;

          if (isBadBMI && prev.status !== RecruitmentStatus.ENLISTED && prev.status !== RecruitmentStatus.REMOVED_FROM_SOURCE) {
              newStatus = RecruitmentStatus.DEFERRED;
              // Nếu chưa có lý do hoặc lý do cũ là lý do sức khỏe mặc định, cập nhật lý do mới
              if (!newReason || newReason.includes("BMI")) {
                   newReason = `Sức khỏe không đạt (BMI=${bmi})`;
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

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const parts = field.split('.');
      
      // Update value logic (deep copy)
      let target = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        // @ts-ignore
        target = target[parts[i]] = { ...target[parts[i]] };
      }
      // @ts-ignore
      target[parts[parts.length - 1]] = value;

      // --- LOGIC 2: KIỂM TRA LOẠI SỨC KHỎE (4, 5, 6) -> Tự động chuyển Tạm hoãn ---
      if (field === 'physical.healthGrade') {
          const grade = Number(value);
          // Trường hợp loại 4,5,6 tiếp tục chuyển về danh sách “tạm hoãn sức khỏe”.
          if (grade >= 4 && newData.status !== RecruitmentStatus.ENLISTED && newData.status !== RecruitmentStatus.REMOVED_FROM_SOURCE) {
              newData.status = RecruitmentStatus.DEFERRED;
              // Cập nhật lý do để lọt vào filter Sức khỏe
              newData.defermentReason = `Sức khỏe loại ${grade}`;
          }
      }

      // --- LOGIC 3: KIỂM TRA TRÌNH ĐỘ HỌC VẤN THẤP (< Lớp 7) ---
      if (field === 'details.education') {
          if (LOW_EDUCATION_GRADES.includes(value) && newData.status !== RecruitmentStatus.ENLISTED && newData.status !== RecruitmentStatus.REMOVED_FROM_SOURCE) {
              newData.status = RecruitmentStatus.DEFERRED;
              newData.defermentReason = "Trình độ văn hóa thấp (Chưa hết lớp 7)";
              // Clear period if switching away from higher ed
              newData.details.educationPeriod = '';
          } else {
              // Clear period logic for standard cases
              if (value !== 'Đang học CĐ' && value !== 'Đang học ĐH') {
                  newData.details.educationPeriod = '';
              }
          }
      }

      return newData;
    });
  };

  const handleAddressChange = (field: 'province' | 'commune' | 'village', value: string) => {
      setFormData(prev => {
          const newAddr = { ...prev.address, [field]: value };
          // Cascading resets
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Require reason if Deferred or Exempted
    if ((formData.status === RecruitmentStatus.DEFERRED || formData.status === RecruitmentStatus.EXEMPTED) && !formData.defermentReason) {
        alert("Vui lòng nhập lý do " + (formData.status === RecruitmentStatus.DEFERRED ? "tạm hoãn" : "miễn"));
        return;
    }

    // Validation: Proof required for Policy reasons
    if (formData.status === RecruitmentStatus.DEFERRED && POLICY_DEFERMENT_REASONS.includes(formData.defermentReason || '')) {
        if (!formData.defermentProof || formData.defermentProof.trim() === '') {
            alert("Vui lòng nhập văn bản chứng minh cho trường hợp hoãn về chính sách (VD: Số quyết định, ngày tháng...)");
            return;
        }
    }
    
    // Validation: Require Party Date if Party Member
    if (formData.details.politicalStatus === 'Dang_Vien' && !formData.details.partyEntryDate) {
        alert("Vui lòng nhập ngày vào Đảng");
        return;
    }

    // Validation: Require Education Period if studying CĐ/ĐH
    const isStudyingHigherEd = formData.details.education === 'Đang học CĐ' || formData.details.education === 'Đang học ĐH';
    if (isStudyingHigherEd && !formData.details.educationPeriod) {
        alert("Vui lòng nhập Niên khóa (VD: 2023-2027) cho trường hợp đang đi học.");
        return;
    }

    onSubmit(formData);
  };

  // Determine which reasons to show based on status
  const legalReasons = formData.status === RecruitmentStatus.DEFERRED 
      ? LEGAL_DEFERMENT_REASONS 
      : formData.status === RecruitmentStatus.EXEMPTED 
          ? LEGAL_EXEMPTION_REASONS 
          : [];

  const isStudyingHigherEd = formData.details.education === 'Đang học CĐ' || formData.details.education === 'Đang học ĐH';
  const isPolicyReason = POLICY_DEFERMENT_REASONS.includes(formData.defermentReason || '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="bg-white text-gray-900 border-b border-gray-200 p-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold uppercase flex items-center gap-2 text-military-700">
            {initialData ? 'Cập nhật hồ sơ' : 'Thêm mới công dân'}
          </h2>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: Personal Info */}
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-military-500 focus:ring-military-500 border p-2 text-gray-900"
                    value={formData.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                  />
                 </div>
                 <div>
                  <label className="block text-sm font-bold text-gray-700">Số CCCD</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-military-500 focus:ring-military-500 border p-2 text-gray-900 font-mono"
                    value={formData.citizenId}
                    onChange={(e) => handleChange('citizenId', e.target.value)}
                  />
                 </div>

                 <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700">Số điện thoại</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-military-500 focus:ring-military-500 border p-2 text-gray-900"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  />
                 </div>
               </div>

               {/* ADDRESS */}
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
                            className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500"
                            value={formData.address.province}
                            onChange={(e) => handleAddressChange('province', e.target.value)}
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
                                className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500"
                                value={formData.address.commune}
                                onChange={(e) => {
                                    handleAddressChange('commune', e.target.value);
                                    setShowCommuneSuggestions(true);
                                }}
                                onFocus={() => setShowCommuneSuggestions(true)}
                                disabled={!formData.address.province}
                            />
                            {showCommuneSuggestions && formData.address.province && (
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
                        className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500"
                        value={formData.address.village}
                        onChange={(e) => handleAddressChange('village', e.target.value)}
                        placeholder="Nhập tên Thôn/Ấp..."
                    />
                 </div>
                 
                 <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Số nhà, đường</label>
                    <input 
                        type="text" 
                        className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500"
                        value={formData.address.street}
                        onChange={(e) => setFormData(prev => ({...prev, address: {...prev.address, street: e.target.value}}))}
                    />
                 </div>
               </div>

               {/* HOMETOWN */}
               <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-6">
                 <Home size={18} /> Quê quán
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tỉnh / Thành phố</label>
                    <select 
                        className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500"
                        value={formData.hometown.province}
                        onChange={(e) => handleHometownChange('province', e.target.value)}
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
                        disabled={!formData.hometown.province}
                    />
                     {showHometownSuggestions && formData.hometown.province && (
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
                        className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500"
                        value={formData.hometown.village}
                        onChange={(e) => handleHometownChange('village', e.target.value)}
                        placeholder="Nhập tên Thôn/Ấp..."
                    />
                 </div>
               </div>
            </div>

            {/* RIGHT COLUMN: Details & Family */}
            <div className="space-y-6">
                
                {/* ENLISTMENT UNIT & DATE INPUT (Conditional) */}
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
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-green-700 mb-1">Đơn vị tiếp nhận</label>
                                <input 
                                    type="text" 
                                    placeholder="VD: Sư đoàn 309..."
                                    className="w-full p-2 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500 font-bold text-green-900 bg-white"
                                    value={formData.enlistmentUnit || ''}
                                    onChange={(e) => handleChange('enlistmentUnit', e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-green-700 mb-1">Ngày nhập ngũ</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500 font-bold text-green-900 bg-white"
                                    value={formData.enlistmentDate || ''}
                                    onChange={(e) => handleChange('enlistmentDate', e.target.value)}
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        value={formData.details.education}
                        onChange={(e) => {
                            handleChange('details.education', e.target.value);
                        }}
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
                              className="mt-1 block w-full rounded-md border-blue-300 shadow-sm border p-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                              value={formData.details.educationPeriod || ''}
                              onChange={(e) => handleChange('details.educationPeriod', e.target.value)}
                          />
                      </div>
                  )}

                  <div className={isStudyingHigherEd ? "col-span-2" : ""}>
                    <label className="block text-sm font-bold text-gray-700">Công việc (Nhập tay)</label>
                    <input 
                        type="text" 
                        placeholder="VD: Làm nông, Công nhân..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        value={formData.details.job}
                        onChange={(e) => handleChange('details.job', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700">Dân tộc</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        value={formData.details.ethnicity}
                        onChange={(e) => handleChange('details.ethnicity', e.target.value)}
                    >
                        {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Tôn giáo</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        value={formData.details.religion}
                        onChange={(e) => handleChange('details.religion', e.target.value)}
                    >
                        {RELIGIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700">Hôn nhân</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        value={formData.details.maritalStatus}
                        onChange={(e) => handleChange('details.maritalStatus', e.target.value)}
                    >
                        {MARITAL_STATUSES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  
                  {/* Political Status */}
                  <div className="col-span-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                     <label className="block text-sm font-bold text-gray-700 mb-2">Chính trị</label>
                     <div className="flex gap-4">
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="political" value="None" checked={formData.details.politicalStatus === 'None'} onChange={() => handleChange('details.politicalStatus', 'None')} />
                             <span className="text-sm">Quần chúng</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="political" value="Doan_Vien" checked={formData.details.politicalStatus === 'Doan_Vien'} onChange={() => handleChange('details.politicalStatus', 'Doan_Vien')} />
                             <span className="text-sm font-bold text-blue-600">Đoàn viên</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="political" value="Dang_Vien" checked={formData.details.politicalStatus === 'Dang_Vien'} onChange={() => handleChange('details.politicalStatus', 'Dang_Vien')} />
                             <span className="text-sm font-bold text-red-600">Đảng viên</span>
                         </label>
                     </div>
                     {formData.details.politicalStatus === 'Dang_Vien' && (
                         <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                             <label className="text-xs font-bold text-gray-500">Ngày vào Đảng:</label>
                             <input 
                                type="date" 
                                className="ml-2 border border-gray-300 rounded p-1 text-sm"
                                value={formData.details.partyEntryDate || ''}
                                onChange={(e) => handleChange('details.partyEntryDate', e.target.value)}
                             />
                         </div>
                     )}
                  </div>

                  {/* Physical Info */}
                  <div className="col-span-2 grid grid-cols-4 gap-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                      <div>
                          <label className="block text-xs font-bold text-gray-500">Chiều cao (cm)</label>
                          <input 
                            type="number" 
                            className="w-full mt-1 p-1 border rounded text-center font-bold" 
                            value={formData.physical.height || ''} 
                            onChange={(e) => handleChange('physical.height', Number(e.target.value))} 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500">Cân nặng (kg)</label>
                          <input 
                            type="number" 
                            className="w-full mt-1 p-1 border rounded text-center font-bold" 
                            value={formData.physical.weight || ''} 
                            onChange={(e) => handleChange('physical.weight', Number(e.target.value))} 
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
                          <select className="w-full mt-1 p-1 border rounded text-center font-bold" value={formData.physical.healthGrade} onChange={(e) => handleChange('physical.healthGrade', Number(e.target.value))}>
                              <option value="0">--</option>
                              <option value="1">Loại 1</option>
                              <option value="2">Loại 2</option>
                              <option value="3">Loại 3</option>
                              <option value="4">Loại 4</option>
                              <option value="5">Loại 5</option>
                              <option value="6">Loại 6</option>
                          </select>
                      </div>
                      {/* BMI Status Hint */}
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
                  
                  {/* Deferment Reason (Conditional) */}
                   {(formData.status === RecruitmentStatus.DEFERRED || formData.status === RecruitmentStatus.EXEMPTED) && (
                      <div className={`col-span-2 p-3 rounded-md border animate-in fade-in slide-in-from-top-2 ${formData.status === RecruitmentStatus.DEFERRED ? 'bg-amber-50 border-amber-200' : 'bg-purple-50 border-purple-200'}`}>
                          <label className={`block text-sm font-bold mb-1 ${formData.status === RecruitmentStatus.DEFERRED ? 'text-amber-800' : 'text-purple-800'}`}>
                              Lý do {formData.status === RecruitmentStatus.DEFERRED ? 'Tạm hoãn' : 'Miễn'}:
                          </label>
                          <div className="relative">
                            <input 
                                list="reason-suggestions"
                                required
                                type="text"
                                placeholder="Chọn hoặc nhập lý do cụ thể..."
                                className={`w-full p-2 border rounded text-sm focus:ring-2 ${formData.status === RecruitmentStatus.DEFERRED ? 'border-amber-300 focus:ring-amber-500' : 'border-purple-300 focus:ring-purple-500'}`}
                                value={formData.defermentReason || ''}
                                onChange={(e) => handleChange('defermentReason', e.target.value)}
                            />
                            <datalist id="reason-suggestions">
                                {legalReasons.map((reason, idx) => (
                                    <option key={idx} value={reason} />
                                ))}
                            </datalist>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 italic">
                              * Có thể chọn lý do pháp lý hoặc nhập lý do sức khỏe cụ thể (VD: Cận thị 5 độ, Gãy tay...)
                          </p>

                          {/* Policy Proof Input - Show ONLY if a policy reason is selected */}
                          {isPolicyReason && (
                              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                      <FileText size={12} /> Văn bản chứng minh (Bắt buộc):
                                  </label>
                                  <input 
                                      type="text"
                                      required
                                      placeholder="VD: Theo Quyết định số 123/QĐ-UBND ngày 20/10/2024..."
                                      className="w-full p-2 border border-amber-300 rounded text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                                      value={formData.defermentProof || ''}
                                      onChange={(e) => handleChange('defermentProof', e.target.value)}
                                  />
                              </div>
                          )}
                      </div>
                   )}
               </div>
               
               {/* Family */}
               <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-6">
                 <Users size={18} /> Quan hệ gia đình
               </h3>
               <div className="space-y-4">
                   {/* Father */}
                   <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                       <span className="text-sm font-bold text-gray-700 block mb-2 border-b pb-1">THÔNG TIN CHA</span>
                       <div className="grid grid-cols-2 gap-2">
                           <input placeholder="Họ và tên cha" className="col-span-1 p-2 border rounded text-sm" value={formData.family.father.fullName} onChange={(e) => handleChange('family.father.fullName', e.target.value)} />
                           <input placeholder="Năm sinh" className="col-span-1 p-2 border rounded text-sm" type="number" value={formData.family.father.birthYear || ''} onChange={(e) => handleChange('family.father.birthYear', e.target.value)} />
                           <input placeholder="Nghề nghiệp" className="col-span-1 p-2 border rounded text-sm" value={formData.family.father.job} onChange={(e) => handleChange('family.father.job', e.target.value)} />
                           <input placeholder="SĐT" className="col-span-1 p-2 border rounded text-sm" value={formData.family.father.phoneNumber} onChange={(e) => handleChange('family.father.phoneNumber', e.target.value)} />
                       </div>
                   </div>

                   {/* Mother */}
                   <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                       <span className="text-sm font-bold text-gray-700 block mb-2 border-b pb-1">THÔNG TIN MẸ</span>
                       <div className="grid grid-cols-2 gap-2">
                           <input placeholder="Họ và tên mẹ" className="col-span-1 p-2 border rounded text-sm" value={formData.family.mother.fullName} onChange={(e) => handleChange('family.mother.fullName', e.target.value)} />
                           <input placeholder="Năm sinh" className="col-span-1 p-2 border rounded text-sm" type="number" value={formData.family.mother.birthYear || ''} onChange={(e) => handleChange('family.mother.birthYear', e.target.value)} />
                           <input placeholder="Nghề nghiệp" className="col-span-1 p-2 border rounded text-sm" value={formData.family.mother.job} onChange={(e) => handleChange('family.mother.job', e.target.value)} />
                           <input placeholder="SĐT" className="col-span-1 p-2 border rounded text-sm" value={formData.family.mother.phoneNumber} onChange={(e) => handleChange('family.mother.phoneNumber', e.target.value)} />
                       </div>
                   </div>

                   {/* Wife (Optional) */}
                   <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                       <span className="text-sm font-bold text-gray-700 block mb-2 border-b pb-1">THÔNG TIN VỢ (NẾU CÓ)</span>
                       <div className="grid grid-cols-2 gap-2">
                           <input placeholder="Họ và tên vợ" className="col-span-1 p-2 border rounded text-sm" value={formData.family.wife?.fullName || ''} onChange={(e) => handleChange('family.wife.fullName', e.target.value)} />
                           <input placeholder="Năm sinh" className="col-span-1 p-2 border rounded text-sm" type="number" value={formData.family.wife?.birthYear || ''} onChange={(e) => handleChange('family.wife.birthYear', e.target.value)} />
                           <input placeholder="Nghề nghiệp" className="col-span-1 p-2 border rounded text-sm" value={formData.family.wife?.job || ''} onChange={(e) => handleChange('family.wife.job', e.target.value)} />
                           <input placeholder="SĐT" className="col-span-1 p-2 border rounded text-sm" value={formData.family.wife?.phoneNumber || ''} onChange={(e) => handleChange('family.wife.phoneNumber', e.target.value)} />
                       </div>
                   </div>

                   {/* Children */}
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                       <span className="text-sm font-bold text-gray-700 block mb-2 border-b pb-1">THÔNG TIN CON (NẾU CÓ)</span>
                       <textarea 
                           placeholder="Nhập tên, năm sinh con..." 
                           className="w-full p-2 border rounded text-sm" 
                           value={formData.family.children || ''} 
                           onChange={(e) => handleChange('family.children', e.target.value)} 
                       />
                   </div>
               </div>

            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
             <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-bold text-sm"
             >
                Hủy bỏ
             </button>
             <button 
                type="submit"
                className="px-4 py-2 bg-military-600 text-white rounded hover:bg-military-700 font-bold text-sm flex items-center gap-2 shadow-sm"
             >
                <Save size={18} /> Lưu hồ sơ
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruitForm;
