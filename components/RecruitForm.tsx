import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Recruit, RecruitmentStatus, FamilyMember, User } from '../types';
import { EDUCATIONS, ETHNICITIES, RELIGIONS, FAMILY_JOBS, LOCATION_DATA, PROVINCES_VN, removeVietnameseTones, MARITAL_STATUSES } from '../constants';
import { X, Save, User as UserIcon, Users, MapPin, Home, Tent, Flag, Activity, PauseCircle, Info } from 'lucide-react';

interface RecruitFormProps {
  initialData?: Recruit;
  user: User; // Current logged in user for auto-fill
  onSubmit: (data: Recruit) => void;
  onClose: () => void;
  sessionYear: number; // Nhận năm của phiên làm việc
}

const RecruitForm: React.FC<RecruitFormProps> = ({ initialData, user, onSubmit, onClose, sessionYear }) => {
  const emptyFamilyMember: FamilyMember = { fullName: '', job: 'Làm nông', phoneNumber: '' };

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
    defermentReason: ''
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
            partyEntryDate: initialData.details.partyEntryDate || ''
        },
        physical: {
            ...initialData.physical,
            healthGrade: initialData.physical.healthGrade || 0
        },
        enlistmentUnit: initialData.enlistmentUnit || '',
        defermentReason: initialData.defermentReason || ''
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

  // Auto calculate BMI and Suggest Health Grade
  useEffect(() => {
    if (formData.physical.height > 0 && formData.physical.weight > 0) {
      const heightInM = formData.physical.height / 100;
      const bmi = parseFloat((formData.physical.weight / (heightInM * heightInM)).toFixed(2));
      
      // Calculate Health Grade based on Circular 68/2025/TT-BQP
      let suggestedGrade = 0;
      
      if (bmi >= 18.5 && bmi <= 24.9) {
          suggestedGrade = 1;
      } else if (bmi >= 25.0 && bmi <= 26.9) {
          suggestedGrade = 2;
      } else if (bmi >= 27.0 && bmi <= 29.9) {
          suggestedGrade = 3;
      } else if (bmi < 18.5 || (bmi >= 30.0 && bmi <= 34.9)) {
          suggestedGrade = 4;
      } else if (bmi >= 35.0 && bmi <= 39.9) {
          suggestedGrade = 5;
      } else if (bmi >= 40.0) {
          suggestedGrade = 6;
      }

      setFormData(prev => ({ 
          ...prev, 
          physical: { 
              ...prev.physical, 
              bmi,
              healthGrade: suggestedGrade
          } 
      }));
    } else {
        // Reset if invalid input
        if(formData.physical.bmi !== 0) {
             setFormData(prev => ({ ...prev, physical: { ...prev.physical, bmi: 0, healthGrade: 0 } }));
        }
    }
  }, [formData.physical.height, formData.physical.weight]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const parts = field.split('.');
      
      if (parts.length === 1) {
         // @ts-ignore
         newData[parts[0]] = value;
      } else if (parts.length === 2) {
         // @ts-ignore
         newData[parts[0]] = { ...newData[parts[0]], [parts[1]]: value };
      } else if (parts.length === 3) {
         // @ts-ignore
         newData[parts[0]] = {
            // @ts-ignore
            ...newData[parts[0]],
            [parts[1]]: {
                // @ts-ignore
                ...newData[parts[0]][parts[1]],
                [parts[2]]: value
            }
         };
      }
      return newData;
    });
  };

  const handleAddressChange = (field: 'province' | 'commune' | 'village', value: string) => {
      setFormData(prev => {
          const newAddr = { ...prev.address, [field]: value };
          // Cascading resets
          if (field === 'province') { newAddr.commune = ''; newAddr.village = ''; } 
          // Removed automatic village reset since it's manual now
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
    
    // Validation: Require Party Date if Party Member
    if (formData.details.politicalStatus === 'Dang_Vien' && !formData.details.partyEntryDate) {
        alert("Vui lòng nhập ngày vào Đảng");
        return;
    }

    onSubmit(formData);
  };

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
                <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm">
                 <Activity size={18} /> Chi tiết & Gia cảnh
               </h3>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Trình độ học vấn</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900"
                        value={formData.details.education}
                        onChange={(e) => handleChange('details.education', e.target.value)}
                    >
                        {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Công việc</label>
                    <input 
                        type="text" 
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
                              ${formData.physical.bmi >= 18.0 && formData.physical.bmi <= 29.9 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}
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
                                <Info size={14} className={formData.physical.bmi >= 18.0 && formData.physical.bmi <= 29.9 ? "text-green-600" : "text-red-600"}/>
                                {formData.physical.bmi < 18.0 && <span className="text-red-600 font-bold">Gầy (Không đủ ĐK nhập ngũ)</span>}
                                {formData.physical.bmi >= 18.0 && formData.physical.bmi <= 29.9 && <span className="text-green-600 font-bold">Đủ ĐK nhập ngũ (18.0 - 29.9)</span>}
                                {formData.physical.bmi > 29.9 && <span className="text-red-600 font-bold">Thừa cân/Béo phì (Không đủ ĐK nhập ngũ)</span>}
                              </>
                          ) : (
                              <span className="text-gray-400 italic">* Nhập chiều cao & cân nặng để tính BMI</span>
                          )}
                      </div>
                  </div>
               </div>
               
               {/* Family */}
               <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-6">
                 <Users size={18} /> Quan hệ gia đình
               </h3>
               <div className="space-y-3">
                   {/* Father */}
                   <div className="grid grid-cols-12 gap-2 items-center">
                       <span className="col-span-2 text-sm font-bold text-gray-600">Cha:</span>
                       <input placeholder="Họ tên cha" className="col-span-4 p-2 border rounded text-sm" value={formData.family.father.fullName} onChange={(e) => handleChange('family.father.fullName', e.target.value)} />
                       <select className="col-span-3 p-2 border rounded text-sm" value={formData.family.father.job} onChange={(e) => handleChange('family.father.job', e.target.value)}>
                           {FAMILY_JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                       </select>
                       <input placeholder="SĐT" className="col-span-3 p-2 border rounded text-sm" value={formData.family.father.phoneNumber} onChange={(e) => handleChange('family.father.phoneNumber', e.target.value)} />
                   </div>
                   {/* Mother */}
                   <div className="grid grid-cols-12 gap-2 items-center">
                       <span className="col-span-2 text-sm font-bold text-gray-600">Mẹ:</span>
                       <input placeholder="Họ tên mẹ" className="col-span-4 p-2 border rounded text-sm" value={formData.family.mother.fullName} onChange={(e) => handleChange('family.mother.fullName', e.target.value)} />
                       <select className="col-span-3 p-2 border rounded text-sm" value={formData.family.mother.job} onChange={(e) => handleChange('family.mother.job', e.target.value)}>
                           {FAMILY_JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                       </select>
                       <input placeholder="SĐT" className="col-span-3 p-2 border rounded text-sm" value={formData.family.mother.phoneNumber} onChange={(e) => handleChange('family.mother.phoneNumber', e.target.value)} />
                   </div>
                   {/* Wife (Optional) */}
                   <div className="grid grid-cols-12 gap-2 items-center">
                       <span className="col-span-2 text-sm font-bold text-gray-600">Vợ:</span>
                       <input placeholder="(Nếu có)" className="col-span-4 p-2 border rounded text-sm" value={formData.family.wife?.fullName || ''} onChange={(e) => handleChange('family.wife.fullName', e.target.value)} />
                       <select className="col-span-3 p-2 border rounded text-sm" value={formData.family.wife?.job || 'Làm nông'} onChange={(e) => handleChange('family.wife.job', e.target.value)}>
                           {FAMILY_JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                       </select>
                       <input placeholder="SĐT" className="col-span-3 p-2 border rounded text-sm" value={formData.family.wife?.phoneNumber || ''} onChange={(e) => handleChange('family.wife.phoneNumber', e.target.value)} />
                   </div>
               </div>

            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
             <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium">Hủy bỏ</button>
             <button type="submit" className="px-6 py-2 bg-military-600 text-white hover:bg-military-700 rounded-md font-bold shadow-lg flex items-center gap-2">
                 <Save size={18}/> Lưu hồ sơ
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruitForm;