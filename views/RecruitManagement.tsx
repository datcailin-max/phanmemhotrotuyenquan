
import React, { useState, useMemo, useEffect } from 'react';
import { Recruit, RecruitmentStatus, User } from '../types';
import { EDUCATIONS, GET_ALL_COMMUNES, LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS, LOW_EDUCATION_GRADES, ETHNICITIES, RELIGIONS, LOCATION_DATA, PROVINCES_VN, POLICY_DEFERMENT_REASONS } from '../constants';
import RecruitForm from '../components/RecruitForm';
import { 
  Search, Plus, CheckCircle2, XCircle, FileEdit, Trash2, Stethoscope, ClipboardList, RefreshCw, Filter, ShieldOff,
  PauseCircle, Users, FileSignature, UserX, RotateCcw, Lock, Flag, Layers, ShieldCheck, Baby, Activity,
  ArchiveRestore, Briefcase, Ruler, AlertTriangle, Check, X, ChevronRight, FileText, BookX, ArrowRightCircle,
  Ban, Shield
} from 'lucide-react';

interface RecruitManagementProps {
  recruits: Recruit[];
  user: User;
  onUpdate: (data: Recruit) => void;
  onDelete: (id: string) => void;
  initialTab?: string;
  onTabChange?: (tabId: string) => void;
  sessionYear: number;
}

// Updated TABS order and structure based on requirements
const TABS = [
  { id: 'NOT_ALLOWED_REG', label: '1. DS Không được đăng ký NVQS', status: [RecruitmentStatus.NOT_ALLOWED_REGISTRATION], color: 'bg-red-800', borderColor: 'border-red-800', textColor: 'text-red-900', icon: Ban },
  { id: 'EXEMPT_REG', label: '2. DS được miễn ĐK NVQS', status: [RecruitmentStatus.EXEMPT_REGISTRATION], color: 'bg-slate-500', borderColor: 'border-slate-500', textColor: 'text-slate-600', icon: Shield },
  { id: 'FIRST_TIME_REG', label: '3. DS đăng ký NVQS lần đầu', status: null, color: 'bg-pink-600', borderColor: 'border-pink-600', textColor: 'text-pink-700', icon: Baby },
  { id: 'ALL', label: '4. Toàn bộ nguồn (18+)', status: null, color: 'bg-gray-600', borderColor: 'border-gray-600', textColor: 'text-gray-700', icon: Users },
  { id: 'TT50', label: '5. DS Không tuyển chọn (TT 50)', status: [RecruitmentStatus.NOT_SELECTED_TT50], color: 'bg-slate-600', borderColor: 'border-slate-600', textColor: 'text-slate-700', icon: BookX },
  { id: 'PRE_CHECK', label: '6. DS Đủ ĐK Sơ tuyển', status: [RecruitmentStatus.SOURCE, RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.PRE_CHECK_FAILED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-blue-600', borderColor: 'border-blue-600', textColor: 'text-blue-700', icon: ClipboardList },
  { id: 'PRE_CHECK_PASS', label: '6.1. DS Đạt sơ tuyển', status: [RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-blue-500', borderColor: 'border-blue-500', textColor: 'text-blue-600', icon: CheckCircle2, isSub: true },
  { id: 'PRE_CHECK_FAIL', label: '6.2. DS Không đạt sơ tuyển', status: [RecruitmentStatus.PRE_CHECK_FAILED], color: 'bg-orange-500', borderColor: 'border-orange-500', textColor: 'text-orange-600', icon: XCircle, isSub: true },
  { id: 'MED_EXAM', label: '7. DS Đủ ĐK Khám tuyển', status: [RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-indigo-600', borderColor: 'border-indigo-600', textColor: 'text-indigo-700', icon: Stethoscope },
  { id: 'MED_EXAM_PASS', label: '7.1. DS Đạt khám tuyển', status: [RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-indigo-500', borderColor: 'border-indigo-500', textColor: 'text-indigo-600', icon: CheckCircle2, isSub: true },
  { id: 'MED_EXAM_FAIL', label: '7.2. DS Không đạt khám tuyển', status: [RecruitmentStatus.MED_EXAM_FAILED], color: 'bg-red-500', borderColor: 'border-red-500', textColor: 'text-red-600', icon: XCircle, isSub: true },
  { id: 'DEFERRED_LIST', label: '8. DS Tạm hoãn (Nguồn)', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-600', borderColor: 'border-amber-600', textColor: 'text-amber-700', icon: PauseCircle },
  { id: 'EXEMPTED_LIST', label: '9. DS Miễn gọi nhập ngũ', status: [RecruitmentStatus.EXEMPTED], color: 'bg-purple-600', borderColor: 'border-purple-600', textColor: 'text-purple-700', icon: ShieldCheck },
  { id: 'FINAL', label: '10. DS Chốt hồ sơ', status: [RecruitmentStatus.FINALIZED], color: 'bg-green-600', borderColor: 'border-green-600', textColor: 'text-green-700', icon: FileSignature },
  { id: 'ENLISTED', label: '11. DS Nhập ngũ', status: [RecruitmentStatus.ENLISTED], color: 'bg-red-600', borderColor: 'border-red-600', textColor: 'text-red-700', icon: Flag },
  { id: 'REMOVED', label: '12. DS Loại khỏi nguồn', status: [RecruitmentStatus.REMOVED_FROM_SOURCE], color: 'bg-gray-600', borderColor: 'border-gray-600', textColor: 'text-gray-700', icon: UserX },
  { id: 'REMAINING', label: '13. DS Nguồn còn lại', status: null, color: 'bg-teal-600', borderColor: 'border-teal-600', textColor: 'text-teal-700', icon: Layers },
];

const DEFERRED_SUB_TABS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'POLICY', label: 'Về Chính sách' },
    { id: 'HEALTH', label: 'Về Sức khỏe' },
    { id: 'EDUCATION', label: 'Về Học vấn' },
    { id: 'DQTT', label: 'Dân quân thường trực' },
];

const JOB_SUGGESTIONS = ["Làm nông", "Công nhân", "Thợ hàn", "Thợ xây", "Thợ hồ", "Cạo mủ cao su", "Lái xe", "Sinh viên", "Buôn bán", "Giáo viên", "Công chức", "Tự do"];
const HEIGHT_RANGES = [
    { value: 'BELOW_160', label: 'Dưới 160 cm' },
    { value: '160_170', label: 'Từ 160 - 170 cm' },
    { value: '170_175', label: 'Từ 170 - 175 cm' },
    { value: '175_180', label: 'Từ 175 - 180 cm' },
    { value: 'ABOVE_180', label: 'Trên 180 cm' }
];

type ActionType = 'DEFER' | 'EXEMPT' | 'REMOVE' | 'DELETE' | 'TT50' | 'NOT_ALLOWED_REG' | 'EXEMPT_REG' | null;

// Component nhập liệu có local state để tránh bị lag/lock khi gõ phím
const EnlistmentUnitInput = ({ value, onSave }: { value: string, onSave: (val: string) => void }) => {
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    return (
        <input 
            type="text" 
            className="w-full text-xs border border-gray-300 rounded p-1.5 focus:border-red-500 focus:ring-1 focus:ring-red-200 font-bold text-gray-800" 
            placeholder="Nhập đơn vị..." 
            value={localValue} 
            onChange={(e) => setLocalValue(e.target.value)} 
            onBlur={() => { if(localValue !== (value || '')) onSave(localValue); }} 
            onKeyDown={(e) => { if(e.key === 'Enter') { if(localValue !== (value || '')) onSave(localValue); (e.target as HTMLInputElement).blur(); } }} 
        />
    );
};

const EnlistmentDateInput = ({ value, onSave }: { value: string, onSave: (val: string) => void }) => {
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    return (
        <input 
            type="date" 
            className="w-full text-xs border border-gray-300 rounded p-1.5 focus:border-red-500 focus:ring-1 focus:ring-red-200" 
            value={localValue} 
            onChange={(e) => setLocalValue(e.target.value)} 
            onBlur={() => { if(localValue !== (value || '')) onSave(localValue); }} 
        />
    );
};

const RecruitManagement: React.FC<RecruitManagementProps> = ({ recruits, user, onUpdate, onDelete, initialTab = 'FIRST_TIME_REG', onTabChange, sessionYear }) => {
  const isAdmin = user.role === 'ADMIN';
  const isProvinceAdmin = user.role === 'PROVINCE_ADMIN';
  const isReadOnly = user.role === 'VIEWER' || isProvinceAdmin || !!user.isLocked;

  const [activeTabId, setActiveTabId] = useState(initialTab);
  const [activeDeferredSubTab, setActiveDeferredSubTab] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingRecruit, setEditingRecruit] = useState<Recruit | undefined>(undefined);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedRecruit, setSelectedRecruit] = useState<Recruit | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [customReasonInput, setCustomReasonInput] = useState('');
  const [proofInput, setProofInput] = useState('');

  useEffect(() => { setActiveTabId(initialTab); }, [initialTab]);

  const handleTabChange = (id: string) => {
      setActiveTabId(id);
      if (id !== 'DEFERRED_LIST') setActiveDeferredSubTab('ALL');
      if (onTabChange) onTabChange(id);
  };

  const getInitialStatus = () => {
      if (activeTabId === 'NOT_ALLOWED_REG') return RecruitmentStatus.NOT_ALLOWED_REGISTRATION;
      if (activeTabId === 'EXEMPT_REG') return RecruitmentStatus.EXEMPT_REGISTRATION;
      return RecruitmentStatus.SOURCE;
  };
  
  const initialFilters = {
    search: '', province: isProvinceAdmin ? user.unit.province : '', commune: '', village: '', age: '', education: '',
    year: sessionYear, ethnicity: '', religion: '', maritalStatus: '', height: '', job: ''
  };
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => { setFilters(prev => ({ ...prev, year: sessionYear })); }, [sessionYear]);

  const adminCommuneList = useMemo(() => {
    // If Admin, use filter province. If Province Admin, use user's province.
    const province = isProvinceAdmin ? user.unit.province : filters.province;
    if (!province) return [];
    // @ts-ignore
    const data = LOCATION_DATA[province];
    return data ? Object.keys(data) : [];
  }, [filters.province, user.unit.province, isProvinceAdmin]);

  const AGE_OPTIONS = useMemo(() => Array.from({length: 10}, (_, i) => 18 + i), []);

  const totalRelevantRecruits = useMemo(() => {
      return recruits.filter(r => {
          if (r.recruitmentYear !== sessionYear) return false;
          if (isProvinceAdmin) {
              return r.address.province === user.unit.province;
          }
          if (!isAdmin && r.address.commune !== user.unit.commune) return false;
          return true;
      }).length;
  }, [recruits, sessionYear, isAdmin, user, isProvinceAdmin]);

  const filteredRecruits = useMemo(() => {
    let result = recruits;
    // Base Filtering by Scope
    if (isProvinceAdmin) {
        result = result.filter(r => r.address.province === user.unit.province);
    } else if (!isAdmin) {
        result = result.filter(r => r.address.commune === user.unit.commune);
    }

    const currentTab = TABS.find(t => t.id === activeTabId);
    
    // --- SPECIAL TAB LOGIC ---
    if (activeTabId === 'FIRST_TIME_REG') {
        // DS đăng ký lần đầu: 17 tuổi trong năm
        result = result.filter(r => (sessionYear - parseInt(r.dob.split('-')[0])) < 18 && r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE && r.status !== RecruitmentStatus.NOT_ALLOWED_REGISTRATION && r.status !== RecruitmentStatus.EXEMPT_REGISTRATION);
    } else if (activeTabId === 'ALL') {
        // Toàn bộ nguồn 18+: Trừ những người < 18, Loại, Không được ĐK, Miễn ĐK
        result = result.filter(r => (sessionYear - parseInt(r.dob.split('-')[0])) >= 18 && r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE && r.status !== RecruitmentStatus.NOT_ALLOWED_REGISTRATION && r.status !== RecruitmentStatus.EXEMPT_REGISTRATION);
    } else if (activeTabId === 'REMAINING') {
        // DS Nguồn còn lại: SOURCE, PRE_CHECK..., MED_EXAM..., FINALIZED (Reserve), DEFERRED, EXEMPTED, TT50
        // Loại trừ: ENLISTED (Official), REMOVED_FROM_SOURCE, NOT_ALLOWED_REGISTRATION, EXEMPT_REGISTRATION
        // Chỉ lấy >= 18
        const remainingStatuses = [
            RecruitmentStatus.SOURCE, 
            RecruitmentStatus.PRE_CHECK_PASSED, 
            RecruitmentStatus.PRE_CHECK_FAILED, 
            RecruitmentStatus.MED_EXAM_PASSED, 
            RecruitmentStatus.MED_EXAM_FAILED, 
            RecruitmentStatus.FINALIZED, 
            RecruitmentStatus.DEFERRED, 
            RecruitmentStatus.EXEMPTED,
            RecruitmentStatus.NOT_SELECTED_TT50
        ];
        result = result.filter(r => {
            const birthYear = parseInt(r.dob.split('-')[0] || '0');
            const age = sessionYear - birthYear;
            return remainingStatuses.includes(r.status) && 
                   r.enlistmentType !== 'OFFICIAL' &&
                   age >= 18; 
        });
    } else if (currentTab?.status) {
        // General Status Filtering based on TABS config
        result = result.filter(r => currentTab.status && currentTab.status.includes(r.status));
        
        // Refinements for Pre-Check & Med-Exam (should apply to 18+)
        if (['PRE_CHECK', 'PRE_CHECK_PASS', 'PRE_CHECK_FAIL', 'MED_EXAM', 'MED_EXAM_PASS', 'MED_EXAM_FAIL'].includes(activeTabId || '')) {
            result = result.filter(r => (sessionYear - parseInt(r.dob.split('-')[0])) >= 18);
        }
        
        // DEFERRED Sub-tabs Logic
        if (activeTabId === 'DEFERRED_LIST' && activeDeferredSubTab !== 'ALL') {
            result = result.filter(r => {
                const reason = (r.defermentReason || '');
                const lowerReason = reason.toLowerCase();

                if (activeDeferredSubTab === 'POLICY') return POLICY_DEFERMENT_REASONS.includes(reason);
                if (activeDeferredSubTab === 'HEALTH') {
                    const isLegalReason = reason === LEGAL_DEFERMENT_REASONS[0];
                    const isCustomReason = lowerReason.includes('sức khỏe') || lowerReason.includes('bệnh') || lowerReason.includes('tật') || lowerReason.includes('bmi') || lowerReason.includes('loại 4') || lowerReason.includes('loại 5') || lowerReason.includes('loại 6');
                    return isLegalReason || isCustomReason;
                }
                if (activeDeferredSubTab === 'EDUCATION') {
                     const isLegalReason = reason === LEGAL_DEFERMENT_REASONS[6];
                     const isCustomReason = lowerReason.includes('học vấn') || lowerReason.includes('trình độ') || lowerReason.includes('văn hóa') || lowerReason.includes('lớp');
                     return isLegalReason || isCustomReason;
                }
                if (activeDeferredSubTab === 'DQTT') return reason === LEGAL_DEFERMENT_REASONS[7];
                
                return true;
            });
        }
    }

    // --- COMMON FILTERS ---
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(r => r.fullName.toLowerCase().includes(q) || r.citizenId.includes(q));
    }
    
    // Filters for Admin and Province Admin
    if (isAdmin) {
        if (filters.province) result = result.filter(r => r.address.province === filters.province);
        if (filters.commune) result = result.filter(r => r.address.commune === filters.commune);
    }
    
    // Filters specifically for Province Admin (Province is already filtered by base scope)
    if (isProvinceAdmin) {
        if (filters.commune) result = result.filter(r => r.address.commune === filters.commune);
    }

    if (filters.village) result = result.filter(r => r.address.village.toLowerCase().includes(filters.village.toLowerCase()));
    if (filters.age) {
        if (filters.age === 'UNDER_18') result = result.filter(r => (sessionYear - parseInt(r.dob.split('-')[0])) < 18);
        else result = result.filter(r => (sessionYear - parseInt(r.dob.split('-')[0])) === parseInt(filters.age));
    }
    if (filters.education) result = result.filter(r => r.details.education === filters.education);
    if (filters.ethnicity) result = result.filter(r => r.details.ethnicity === filters.ethnicity);
    if (filters.religion) result = result.filter(r => r.details.religion === filters.religion);
    if (filters.maritalStatus) result = result.filter(r => r.details.maritalStatus === filters.maritalStatus);
    if (filters.height) {
        result = result.filter(r => {
            const h = r.physical.height;
            if (h === 0) return false;
            if (filters.height === 'BELOW_160') return h < 160;
            if (filters.height === '160_170') return h >= 160 && h <= 170;
            if (filters.height === '170_175') return h > 170 && h <= 175;
            if (filters.height === '175_180') return h > 175 && h <= 180;
            if (filters.height === 'ABOVE_180') return h > 180;
            return true;
        });
    }
    if (filters.job) result = result.filter(r => r.details.job.toLowerCase().includes(filters.job.toLowerCase()));
    
    result = result.filter(r => r.recruitmentYear === sessionYear);
    return result;
  }, [recruits, activeTabId, activeDeferredSubTab, filters, isAdmin, isProvinceAdmin, user, sessionYear]);

  const resetFilters = () => setFilters(initialFilters);

  // Cập nhật nguồn từ năm trước (cũ)
  const handleTransferFromPreviousYear = async () => {
      if (isReadOnly) return;
      const prevYear = sessionYear - 1;
      let prevYearRecruits = recruits.filter(r => r.recruitmentYear === prevYear);
      if (!isAdmin) prevYearRecruits = prevYearRecruits.filter(r => r.address.commune === user.unit.commune);
      else {
          if (filters.province) prevYearRecruits = prevYearRecruits.filter(r => r.address.province === filters.province);
          if (filters.commune) prevYearRecruits = prevYearRecruits.filter(r => r.address.commune === filters.commune);
      }
      const eligibleToTransfer = prevYearRecruits.filter(r => {
          return !(r.status === RecruitmentStatus.ENLISTED && r.enlistmentType !== 'RESERVE') && 
                 r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE && 
                 r.status !== RecruitmentStatus.EXEMPTED &&
                 r.status !== RecruitmentStatus.NOT_ALLOWED_REGISTRATION &&
                 r.status !== RecruitmentStatus.EXEMPT_REGISTRATION;
      });
      if (eligibleToTransfer.length === 0) { alert(`Không tìm thấy hồ sơ nào từ năm ${prevYear} đủ điều kiện cập nhật.`); return; }
      
      const currentYearRecruits = recruits.filter(r => r.recruitmentYear === sessionYear);
      const existingCitizenIds = new Set(currentYearRecruits.map(r => r.citizenId));
      const toCreate = eligibleToTransfer.filter(r => !existingCitizenIds.has(r.citizenId));
      
      if (toCreate.length === 0) { alert(`Tất cả hồ sơ nguồn năm ${prevYear} đã có mặt trong năm ${sessionYear}.`); return; }
      if (!window.confirm(`Xác nhận cập nhật ${toCreate.length} hồ sơ từ năm ${prevYear}?`)) return;
      
      let successCount = 0;
      for (const r of toCreate) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, createdAt, updatedAt, __v, ...cleanRecruitData } = r as any;

          const newRecruit: Recruit = { 
              ...cleanRecruitData, 
              id: Date.now().toString(36) + Math.random().toString(36).substr(2) + successCount, 
              recruitmentYear: sessionYear, 
              status: RecruitmentStatus.SOURCE, 
              defermentReason: '', 
              defermentProof: '',
              enlistmentUnit: undefined, 
              enlistmentDate: undefined, 
              enlistmentType: undefined 
          };
          onUpdate(newRecruit);
          successCount++;
      }
      alert(`Đã gửi yêu cầu cập nhật ${successCount} hồ sơ.`);
  };

  // Cập nhật nguồn CHO NĂM SAU (Mới)
  const handleTransferToNextYear = async () => {
      if (isReadOnly) return;
      const nextYear = sessionYear + 1;
      
      let currentYearRecruits = recruits.filter(r => r.recruitmentYear === sessionYear);
      
      if (!isAdmin) {
          currentYearRecruits = currentYearRecruits.filter(r => r.address.commune === user.unit.commune);
      } else {
          if (filters.province) currentYearRecruits = currentYearRecruits.filter(r => r.address.province === filters.province);
          if (filters.commune) currentYearRecruits = currentYearRecruits.filter(r => r.address.commune === filters.commune);
      }

      const eligibleToTransfer = currentYearRecruits.filter(r => {
          const birthYear = parseInt(r.dob.split('-')[0] || '0');
          const age = sessionYear - birthYear;
          
          if (age === 17) return true;

          const isEligibleSource = age >= 18 && 
                r.status !== RecruitmentStatus.ENLISTED && 
                (r.status !== RecruitmentStatus.FINALIZED || r.enlistmentType === 'RESERVE') && 
                r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE && 
                r.status !== RecruitmentStatus.EXEMPTED &&
                r.status !== RecruitmentStatus.NOT_ALLOWED_REGISTRATION &&
                r.status !== RecruitmentStatus.EXEMPT_REGISTRATION;

          return isEligibleSource;
      });

      if (eligibleToTransfer.length === 0) { 
          alert(`Không tìm thấy hồ sơ nào đủ điều kiện chuyển sang năm ${nextYear}.`); 
          return; 
      }

      const nextYearRecruits = recruits.filter(r => r.recruitmentYear === nextYear);
      const existingCitizenIds = new Set(nextYearRecruits.map(r => r.citizenId));
      
      const toCreate = eligibleToTransfer.filter(r => !existingCitizenIds.has(r.citizenId));

      if (toCreate.length === 0) { 
          alert(`Tất cả hồ sơ đủ điều kiện đã có mặt trong dữ liệu năm ${nextYear}.`); 
          return; 
      }

      if (!window.confirm(`Tìm thấy ${toCreate.length} hồ sơ đủ điều kiện (17 tuổi lên 18, nguồn còn lại...). Xác nhận chuyển sang nguồn năm ${nextYear}?`)) return;

      let successCount = 0;
      for (const r of toCreate) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, createdAt, updatedAt, __v, ...cleanRecruitData } = r as any;

          const newRecruit: Recruit = { 
              ...cleanRecruitData, 
              id: Date.now().toString(36) + Math.random().toString(36).substr(2) + successCount, 
              recruitmentYear: nextYear, 
              status: RecruitmentStatus.SOURCE, 
              defermentReason: '', 
              defermentProof: '',
              enlistmentUnit: undefined, 
              enlistmentDate: undefined, 
              enlistmentType: undefined 
          };
          onUpdate(newRecruit);
          successCount++;
      }
      alert(`Đã chuyển thành công ${successCount} hồ sơ sang năm ${nextYear}.`);
  };

  const handleEdit = (recruit: Recruit) => {
    // Province Admin can also view details (Read Only)
    setEditingRecruit(recruit);
    setShowForm(true);
  };

  const getStatusBadge = (status: RecruitmentStatus) => {
    switch (status) {
      case RecruitmentStatus.SOURCE: return <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600">Nguồn</span>;
      case RecruitmentStatus.NOT_ALLOWED_REGISTRATION: return <span className="px-2 py-1 rounded text-xs font-bold bg-red-800 text-white">Không được ĐK</span>;
      case RecruitmentStatus.EXEMPT_REGISTRATION: return <span className="px-2 py-1 rounded text-xs font-bold bg-slate-500 text-white">Miễn ĐK</span>;
      case RecruitmentStatus.NOT_SELECTED_TT50: return <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600">TT50</span>;
      case RecruitmentStatus.PRE_CHECK_PASSED: return <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-600">Đạt Sơ tuyển</span>;
      case RecruitmentStatus.PRE_CHECK_FAILED: return <span className="px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-600">Rớt Sơ tuyển</span>;
      case RecruitmentStatus.MED_EXAM_PASSED: return <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-600">Đạt Khám tuyển</span>;
      case RecruitmentStatus.MED_EXAM_FAILED: return <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-600">Rớt Khám tuyển</span>;
      case RecruitmentStatus.FINALIZED: return <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-600">Chốt hồ sơ</span>;
      case RecruitmentStatus.ENLISTED: return <span className="px-2 py-1 rounded text-xs font-bold bg-red-600 text-white">Đã nhập ngũ</span>;
      case RecruitmentStatus.DEFERRED: return <span className="px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-600">Tạm hoãn</span>;
      case RecruitmentStatus.EXEMPTED: return <span className="px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-600">Miễn NVQS</span>;
      case RecruitmentStatus.REMOVED_FROM_SOURCE: return <span className="px-2 py-1 rounded text-xs font-bold bg-gray-200 text-gray-500 line-through">Đã loại</span>;
      default: return <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600">Unknown</span>;
    }
  };

  const openActionModal = (recruit: Recruit, type: ActionType) => {
      if (isReadOnly) return;
      setSelectedRecruit(recruit);
      setActionType(type);
      setReasonInput('');
      setCustomReasonInput('');
      setProofInput('');
      setShowActionModal(true);
  };

  const confirmAction = () => {
      if (!selectedRecruit || !actionType) return;
      let finalReason = reasonInput;
      if (actionType === 'REMOVE' || actionType === 'DELETE' || actionType === 'NOT_ALLOWED_REG' || actionType === 'EXEMPT_REG') {
          if (!reasonInput.trim()) { alert("Vui lòng nhập lý do cụ thể."); return; }
      } else if (actionType === 'TT50') {
          finalReason = reasonInput || "Theo Thông tư 50";
      } else {
          if (reasonInput.startsWith('Khác') || !reasonInput) {
              if(!customReasonInput.trim()) { alert("Vui lòng nhập lý do cụ thể"); return; }
              finalReason = customReasonInput;
          }
      }

      if (actionType === 'DEFER' && POLICY_DEFERMENT_REASONS.includes(finalReason) && !proofInput.trim()) {
          alert("Vui lòng nhập văn bản chứng minh cho lý do chính sách này.");
          return;
      }

      switch (actionType) {
          case 'DEFER': onUpdate({ ...selectedRecruit, status: RecruitmentStatus.DEFERRED, defermentReason: finalReason, defermentProof: proofInput }); break;
          case 'EXEMPT': onUpdate({ ...selectedRecruit, status: RecruitmentStatus.EXEMPTED, defermentReason: finalReason, defermentProof: proofInput }); break;
          case 'REMOVE': onUpdate({ ...selectedRecruit, status: RecruitmentStatus.REMOVED_FROM_SOURCE, defermentReason: finalReason }); break;
          case 'TT50': onUpdate({ ...selectedRecruit, status: RecruitmentStatus.NOT_SELECTED_TT50, defermentReason: finalReason }); break;
          case 'NOT_ALLOWED_REG': onUpdate({ ...selectedRecruit, status: RecruitmentStatus.NOT_ALLOWED_REGISTRATION, defermentReason: finalReason }); break;
          case 'EXEMPT_REG': onUpdate({ ...selectedRecruit, status: RecruitmentStatus.EXEMPT_REGISTRATION, defermentReason: finalReason }); break;
          case 'DELETE': onDelete(selectedRecruit.id); break;
      }
      setShowActionModal(false); setSelectedRecruit(null); setActionType(null);
  };

  const renderRow = (recruit: Recruit, index: number) => {
      const birthYear = parseInt(recruit.dob.split('-')[0] || '0');
      const age = sessionYear - birthYear;
      const isUnder18 = age < 18;
      const healthGrade = recruit.physical.healthGrade || 0;
      
      const healthStyle = healthGrade === 1 ? 'bg-emerald-500' : 
                          healthGrade === 2 ? 'bg-green-500' : 
                          healthGrade === 3 ? 'bg-yellow-500' : 
                          healthGrade >= 4 ? 'bg-red-500 ring-2 ring-red-200' : 'bg-gray-300';

      return (
          <tr key={recruit.id} className={`hover:bg-gray-50 group border-b border-gray-100 last:border-0 ${recruit.status === RecruitmentStatus.REMOVED_FROM_SOURCE ? 'bg-gray-50 opacity-60' : ''}`}>
              <td className="p-3 text-center text-gray-500 font-mono">{index + 1}</td>
              <td className="p-3">
                  <div className="font-bold text-gray-900 group-hover:text-military-700 transition-colors">{recruit.fullName}</div>
                  <div className="text-xs text-gray-500 font-mono">{recruit.citizenId || '---'}</div>
                  {isUnder18 && <span className="text-[10px] font-bold text-pink-600 border border-pink-200 bg-pink-50 px-1 rounded mt-1 inline-block">Chưa đủ 18 ({age}t)</span>}
                  {activeTabId === 'FINAL' && recruit.enlistmentType === 'RESERVE' && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1 rounded border border-blue-200 ml-1">Dự bị</span>
                  )}
              </td>
              <td className="p-3">
                  <div className="text-sm font-semibold">{recruit.dob} <span className="text-gray-400 font-normal">({age} tuổi)</span></div>
                  <div className="text-xs text-gray-500 max-w-[200px] truncate" title={`${recruit.address.village}, ${recruit.address.commune}, ${recruit.address.province}`}>{recruit.address.village}, {recruit.address.commune}</div>
              </td>
              <td className="p-3">
                  <div className={`text-sm font-bold ${LOW_EDUCATION_GRADES.includes(recruit.details.education) ? 'text-orange-600' : 'text-gray-700'}`}>{recruit.details.education}</div>
                  {recruit.details.educationPeriod && (
                      <div className="text-[10px] text-blue-600 font-bold">{recruit.details.educationPeriod}</div>
                  )}
                  <div className="text-xs text-gray-500">{recruit.details.job || '---'}</div>
              </td>
              <td className="p-3 text-center">
                  {(activeTabId === 'MED_EXAM' || activeTabId === 'MED_EXAM_PASS' || activeTabId === 'MED_EXAM_FAIL') && !isReadOnly ? (
                      <div className="flex flex-col items-center">
                          <select 
                              className={`text-xs font-bold border rounded p-1 text-center cursor-pointer outline-none focus:ring-2 focus:ring-indigo-300 
                                  ${healthGrade >= 1 && healthGrade <= 3 ? 'text-green-700 border-green-300 bg-green-50' : 
                                    healthGrade >= 4 ? 'text-red-700 border-red-300 bg-red-50' : 'text-gray-600 border-gray-300'}`}
                              value={healthGrade}
                              onChange={(e) => {
                                  const grade = Number(e.target.value);
                                  if (grade >= 4) {
                                      if(window.confirm(`Xác nhận xếp loại sức khỏe ${grade}?`)) {
                                          onUpdate({
                                              ...recruit,
                                              physical: { ...recruit.physical, healthGrade: grade },
                                              status: RecruitmentStatus.MED_EXAM_FAILED,
                                              defermentReason: ''
                                          });
                                      }
                                  } else if (grade >= 1) {
                                      onUpdate({
                                          ...recruit,
                                          physical: { ...recruit.physical, healthGrade: grade },
                                          status: RecruitmentStatus.MED_EXAM_PASSED,
                                          defermentReason: ''
                                      });
                                  } else {
                                      onUpdate({ ...recruit, physical: { ...recruit.physical, healthGrade: 0 }, status: RecruitmentStatus.PRE_CHECK_PASSED }); // Revert to pre-check if health is 0
                                  }
                              }}
                          >
                              <option value="0">-- PL --</option>
                              <option value="1">Loại 1</option>
                              <option value="2">Loại 2</option>
                              <option value="3">Loại 3</option>
                              <option value="4">Loại 4</option>
                              <option value="5">Loại 5</option>
                              <option value="6">Loại 6</option>
                          </select>
                          {recruit.physical.bmi > 0 && <div className={`text-[9px] font-bold mt-1 ${recruit.physical.bmi < 18.5 || recruit.physical.bmi > 25 ? 'text-red-500' : 'text-gray-400'}`}>BMI: {recruit.physical.bmi}</div>}
                      </div>
                  ) : (
                      <>
                        {healthGrade > 0 ? (
                            <span className={`inline-block w-8 h-8 leading-8 rounded-full font-bold text-white text-sm shadow-sm ${healthStyle}`}>{healthGrade}</span>
                        ) : <span className="text-gray-300">--</span>}
                      </>
                  )}
              </td>
              
              {activeTabId === 'ENLISTED' ? (
                  <>
                      <td className="p-3 w-40">
                          {isReadOnly ? (
                              <span className="text-sm font-bold text-gray-800">{recruit.enlistmentUnit || '---'}</span>
                          ) : (
                              <EnlistmentUnitInput value={recruit.enlistmentUnit || ''} onSave={(val) => onUpdate({...recruit, enlistmentUnit: val})} />
                          )}
                      </td>
                      <td className="p-3 w-32">
                          {isReadOnly ? (
                              <span className="text-sm text-gray-800">{recruit.enlistmentDate ? new Date(recruit.enlistmentDate).toLocaleDateString('vi-VN') : '---'}</span>
                          ) : (
                              <EnlistmentDateInput value={recruit.enlistmentDate || ''} onSave={(val) => onUpdate({...recruit, enlistmentDate: val})} />
                          )}
                      </td>
                  </>
              ) : (
                  <td className="p-3 text-center">
                      {getStatusBadge(recruit.status)}
                      {(recruit.status === RecruitmentStatus.DEFERRED || recruit.status === RecruitmentStatus.EXEMPTED || recruit.status === RecruitmentStatus.REMOVED_FROM_SOURCE || recruit.status === RecruitmentStatus.NOT_SELECTED_TT50 || recruit.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || recruit.status === RecruitmentStatus.EXEMPT_REGISTRATION) && recruit.defermentReason && (
                          <div className="text-[10px] text-gray-500 max-w-[150px] truncate mx-auto mt-1 italic" title={recruit.defermentReason}>{recruit.defermentReason}</div>
                      )}
                      {recruit.defermentProof && (
                          <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 mt-1 max-w-[150px] truncate mx-auto" title={recruit.defermentProof}>
                              MC: {recruit.defermentProof}
                          </div>
                      )}
                  </td>
              )}

              <td className="p-3">
                  <div className={`flex items-center justify-center gap-2 ${activeTabId !== 'ENLISTED' && activeTabId !== 'FINAL' ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
                      {/* GLOBAL ACTIONS FOR MOST TABS */}
                      <button onClick={() => handleEdit(recruit)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">{isReadOnly ? <ClipboardList size={18} /> : <FileEdit size={18} />}</button>
                      
                      {!isReadOnly && (
                          <>
                            {/* Actions specifically for Source or early stages */}
                            {(activeTabId === 'ALL' || activeTabId === 'FIRST_TIME_REG') && (
                                <>
                                    <button onClick={() => openActionModal(recruit, 'NOT_ALLOWED_REG')} className="p-1.5 text-red-800 hover:bg-red-50 rounded" title="Không được đăng ký NVQS"><Ban size={18} /></button>
                                    <button onClick={() => openActionModal(recruit, 'EXEMPT_REG')} className="p-1.5 text-slate-500 hover:bg-slate-50 rounded" title="Miễn đăng ký NVQS"><Shield size={18} /></button>
                                </>
                            )}

                            {recruit.status !== RecruitmentStatus.REMOVED_FROM_SOURCE && recruit.status !== RecruitmentStatus.ENLISTED && recruit.status !== RecruitmentStatus.NOT_ALLOWED_REGISTRATION && recruit.status !== RecruitmentStatus.EXEMPT_REGISTRATION && (
                                <>
                                    <button onClick={() => { if (recruit.status === RecruitmentStatus.DEFERRED) { if(window.confirm(`Xác nhận đưa công dân ${recruit.fullName} ra khỏi danh sách Tạm hoãn?`)) onUpdate({...recruit, status: RecruitmentStatus.SOURCE, defermentReason: '', defermentProof: ''}); } else openActionModal(recruit, 'DEFER'); }} className={`p-1.5 rounded transition-colors ${recruit.status === RecruitmentStatus.DEFERRED ? 'bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200' : 'text-amber-600 hover:bg-amber-50'}`} title={recruit.status === RecruitmentStatus.DEFERRED ? "Đang tạm hoãn" : "Tạm hoãn nguồn"}><PauseCircle size={18} fill={recruit.status === RecruitmentStatus.DEFERRED ? "currentColor" : "none"} /></button>
                                    <button onClick={() => { if (recruit.status === RecruitmentStatus.EXEMPTED) { if(window.confirm(`Xác nhận đưa công dân ${recruit.fullName} ra khỏi danh sách Miễn?`)) onUpdate({...recruit, status: RecruitmentStatus.SOURCE, defermentReason: '', defermentProof: ''}); } else openActionModal(recruit, 'EXEMPT'); }} className={`p-1.5 rounded transition-colors ${recruit.status === RecruitmentStatus.EXEMPTED ? 'bg-purple-100 text-purple-700 shadow-sm ring-1 ring-purple-200' : 'text-purple-600 hover:bg-purple-50'}`} title={recruit.status === RecruitmentStatus.EXEMPTED ? "Đang miễn" : "Miễn NVQS"}><ShieldCheck size={18} fill={recruit.status === RecruitmentStatus.EXEMPTED ? "currentColor" : "none"} /></button>
                                    <button onClick={() => { if (recruit.status === RecruitmentStatus.NOT_SELECTED_TT50) { if(window.confirm(`Xác nhận đưa công dân ${recruit.fullName} ra khỏi danh sách TT50?`)) onUpdate({...recruit, status: RecruitmentStatus.SOURCE, defermentReason: ''}); } else openActionModal(recruit, 'TT50'); }} className={`p-1.5 rounded transition-colors ${recruit.status === RecruitmentStatus.NOT_SELECTED_TT50 ? 'bg-slate-100 text-slate-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-50'}`} title="Không tuyển chọn (TT50)"><BookX size={18} /></button>
                                </>
                            )}
                            
                            {/* RESTORE LOGIC */}
                            {(recruit.status === RecruitmentStatus.REMOVED_FROM_SOURCE || recruit.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || recruit.status === RecruitmentStatus.EXEMPT_REGISTRATION) ? (
                                <button onClick={() => { if(window.confirm("Khôi phục về danh sách nguồn?")) onUpdate({...recruit, status: RecruitmentStatus.SOURCE, defermentReason: '', defermentProof: ''}) }} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded bg-teal-50 ring-1 ring-teal-200" title="Khôi phục về Nguồn"><RotateCcw size={18} /></button>
                            ) : (
                                <button onClick={() => openActionModal(recruit, 'REMOVE')} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded" title="Loại khỏi nguồn"><UserX size={18} /></button>
                            )}

                            {/* DELETE */}
                            <button onClick={() => openActionModal(recruit, 'DELETE')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xóa vĩnh viễn"><Trash2 size={18} /></button>
                          </>
                      )}
                      
                      {activeTabId === 'FINAL' && !isReadOnly && (
                        <div className="flex bg-gray-100 rounded p-0.5 border border-gray-200 gap-1">
                            <button onClick={() => { if(window.confirm(`Xác nhận CHÍNH THỨC nhập ngũ đối với ${recruit.fullName}? (Chuyển sang DS Nhập ngũ)`)) onUpdate({...recruit, status: RecruitmentStatus.ENLISTED, enlistmentType: 'OFFICIAL'}) }} className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${recruit.enlistmentType === 'OFFICIAL' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'}`}>Chính thức</button>
                            <button onClick={() => onUpdate({...recruit, status: RecruitmentStatus.FINALIZED, enlistmentType: 'RESERVE'})} className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${recruit.enlistmentType === 'RESERVE' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>Dự bị</button>
                        </div>
                      )}

                      {/* QUICK PRE-CHECK ACTIONS */}
                      {(activeTabId === 'PRE_CHECK' || activeTabId === 'PRE_CHECK_PASS' || activeTabId === 'PRE_CHECK_FAIL') && !isReadOnly && (
                           <>
                                <button onClick={() => onUpdate({...recruit, status: RecruitmentStatus.PRE_CHECK_PASSED})} className={`p-1.5 rounded ${recruit.status === RecruitmentStatus.PRE_CHECK_PASSED || recruit.status === RecruitmentStatus.MED_EXAM_PASSED ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-blue-600'}`} title="Đạt sơ tuyển"><CheckCircle2 size={18} /></button>
                                <button onClick={() => onUpdate({...recruit, status: RecruitmentStatus.PRE_CHECK_FAILED})} className={`p-1.5 rounded ${(recruit.status as RecruitmentStatus) === RecruitmentStatus.PRE_CHECK_FAILED ? 'bg-orange-100 text-orange-700' : 'text-gray-400 hover:text-orange-600'}`} title="Không đạt sơ tuyển"><XCircle size={18} /></button>
                           </>
                      )}
                  </div>
              </td>
          </tr>
      );
  };

  const renderTableHead = () => (
      <tr>
          <th className="p-3 border-b text-center w-12">#</th>
          <th className="p-3 border-b">Họ tên / CCCD</th>
          <th className="p-3 border-b">Ngày sinh / Địa chỉ</th>
          <th className="p-3 border-b">Học vấn / Nghề nghiệp</th>
          <th className="p-3 border-b text-center">Sức khỏe {['MED_EXAM', 'MED_EXAM_PASS', 'MED_EXAM_FAIL'].includes(activeTabId || '') && '(Phân loại)'}</th>
          {activeTabId === 'ENLISTED' ? (
              <>
                  <th className="p-3 border-b text-left">Đơn vị nhập ngũ</th>
                  <th className="p-3 border-b text-left">Ngày nhập ngũ</th>
              </>
          ) : (
              <th className="p-3 border-b text-center">Trạng thái</th>
          )}
          <th className="p-3 border-b text-center w-32">Thao tác</th>
      </tr>
  );

  const showAddButton = !isReadOnly && ['ALL', 'FIRST_TIME_REG', 'NOT_ALLOWED_REG', 'EXEMPT_REG'].includes(activeTabId || '');
  const addButtonLabel = ['NOT_ALLOWED_REG', 'EXEMPT_REG', 'FIRST_TIME_REG'].includes(activeTabId || '') ? "Thêm công dân" : "Bổ sung nguồn";

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {!!user.isLocked && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 shadow-sm mb-4"><Lock size={20} className="shrink-0" /><div><p className="font-bold text-sm">Tài khoản đã bị vô hiệu hóa chức năng nhập liệu</p><p className="text-xs">Bạn chỉ có thể xem dữ liệu. Vui lòng liên hệ Quản trị viên để được mở khóa.</p></div></div>}
      <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-72 shrink-0">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 sticky top-4 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
                  <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                      {TABS.map(tab => {
                          const isActive = activeTabId === tab.id;
                          const Icon = tab.icon;
                          // @ts-ignore
                          const isSub = tab.isSub;
                          return (
                              <button 
                                key={tab.id} 
                                onClick={() => handleTabChange(tab.id)} 
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap w-full text-left group border 
                                    ${isActive ? `${tab.color} ${tab.borderColor} text-white shadow-md` : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                                    ${isSub ? 'ml-4 w-[calc(100%-1rem)] border-l-4' : ''}
                                `}
                              >
                                  <Icon size={18} className={!isActive ? "text-gray-400 group-hover:text-gray-600" : ""} /> 
                                  <span className="flex-1 truncate">{tab.label}</span>
                                  {isActive && <ChevronRight size={16} className="hidden lg:block opacity-50" />}
                              </button>
                          );
                      })}
                  </div>
              </div>
          </div>
          <div className="flex-1 min-w-0 space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div><h2 className="text-lg font-bold text-gray-900 uppercase">{TABS.find(t => t.id === activeTabId)?.label}</h2><p className="text-xs text-gray-500">Quản lý danh sách và hồ sơ chi tiết</p></div>
                  {showAddButton && (
                      <div className="flex flex-wrap gap-2 w-full md:w-auto">
                          {activeTabId === 'ALL' && (
                            <>
                              <button onClick={handleTransferFromPreviousYear} className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 shadow-md font-bold text-xs transition-transform active:scale-95"><ArchiveRestore size={16} /> Cập nhật nguồn {sessionYear - 1}</button>
                              <button onClick={handleTransferToNextYear} className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md font-bold text-xs transition-transform active:scale-95"><ArrowRightCircle size={16} /> Chuyển nguồn sang {sessionYear + 1}</button>
                            </>
                          )}
                          <button onClick={() => { setEditingRecruit(undefined); setShowForm(true); }} className="flex items-center gap-2 px-3 py-2 bg-military-600 text-white rounded-lg hover:bg-military-700 shadow-md font-bold text-xs transition-transform active:scale-95"><Plus size={16} /> {addButtonLabel}</button>
                      </div>
                  )}
              </div>
              {activeTabId === 'DEFERRED_LIST' && (
                  <div className="flex flex-wrap gap-2 mb-4 bg-amber-50 p-2 rounded-lg border border-amber-100">
                      {DEFERRED_SUB_TABS.map(sub => (
                          <button key={sub.id} onClick={() => setActiveDeferredSubTab(sub.id)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${activeDeferredSubTab === sub.id ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-amber-800 hover:bg-amber-100 border border-amber-200'}`}>{sub.label}</button>
                      ))}
                  </div>
              )}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 w-full">
                        <div className="md:col-span-2 lg:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Tìm kiếm</label>
                            <div className="relative">
                                <input type="text" placeholder="Tên, số CCCD..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-military-500 focus:border-transparent" value={filters.search} onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))} />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            </div>
                        </div>
                         {(isAdmin || isProvinceAdmin) && (
                            <>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Tỉnh / Thành phố</label>
                                    <select 
                                        className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700 disabled:bg-gray-100" 
                                        value={filters.province} 
                                        onChange={(e) => setFilters(prev => ({...prev, province: e.target.value, commune: ''}))}
                                        disabled={isProvinceAdmin}
                                    >
                                        <option value="">-- Tất cả --</option>
                                        {PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Xã / Phường</label>
                                    <select className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700 disabled:bg-gray-100" value={filters.commune} onChange={(e) => setFilters(prev => ({...prev, commune: e.target.value}))} disabled={!filters.province}><option value="">-- Tất cả --</option>{adminCommuneList.map(c => <option key={c} value={c}>{c}</option>)}</select>
                                </div>
                            </>
                        )}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Thôn / Ấp</label>
                            <input type="text" placeholder="Nhập tên thôn/ấp..." className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-military-500 focus:border-transparent" value={filters.village} onChange={(e) => setFilters(prev => ({...prev, village: e.target.value}))} />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Độ tuổi ({sessionYear})</label>
                            <select className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700" value={filters.age} onChange={(e) => setFilters(prev => ({...prev, age: e.target.value}))}><option value="">-- Tất cả --</option><option value="UNDER_18" className="font-bold text-red-600">Dưới 18 tuổi</option>{AGE_OPTIONS.map(age => <option key={age} value={age}>{age} tuổi (Sinh {sessionYear - age})</option>)}</select>
                        </div>
                        <div className="md:col-span-1 flex items-end">
                            <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`w-full py-2 px-3 rounded text-sm font-bold border transition-colors flex items-center justify-center gap-1 ${showAdvancedFilters ? 'bg-military-50 border-military-300 text-military-700' : 'bg-gray-50 border-gray-300 text-gray-600'}`}><Filter size={14}/> {showAdvancedFilters ? 'Thu gọn' : 'Bộ lọc khác'}</button>
                        </div>
                    </div>
                    <div className="shrink-0 mb-0.5">
                        <button onClick={resetFilters} className="p-2 text-gray-400 hover:text-military-600 hover:bg-gray-100 rounded-full transition-colors" title="Đặt lại bộ lọc"><RefreshCw size={18} /></button>
                    </div>
                </div>
                {showAdvancedFilters && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2">
                        <div><label className="block text-xs font-bold text-gray-500 mb-1">Trình độ học vấn</label><select className="w-full border border-gray-300 rounded p-1.5 text-sm" value={filters.education} onChange={(e) => setFilters(prev => ({...prev, education: e.target.value}))}><option value="">-- Tất cả --</option>{EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1">Dân tộc</label><select className="w-full border border-gray-300 rounded p-1.5 text-sm" value={filters.ethnicity} onChange={(e) => setFilters(prev => ({...prev, ethnicity: e.target.value}))}><option value="">-- Tất cả --</option>{ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1">Tôn giáo</label><select className="w-full border border-gray-300 rounded p-1.5 text-sm" value={filters.religion} onChange={(e) => setFilters(prev => ({...prev, religion: e.target.value}))}><option value="">-- Tất cả --</option>{RELIGIONS.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1">Chiều cao</label><div className="relative"><Ruler size={14} className="absolute left-2 top-2 text-gray-400" /><select className="w-full border border-gray-300 rounded p-1.5 pl-7 text-sm" value={filters.height} onChange={(e) => setFilters(prev => ({...prev, height: e.target.value}))}><option value="">-- Tất cả --</option>{HEIGHT_RANGES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}</select></div></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1">Công việc</label><div className="relative"><Briefcase size={14} className="absolute left-2 top-2 text-gray-400" /><input type="text" list="job-suggestions" placeholder="Thợ hàn, lái xe..." className="w-full border border-gray-300 rounded p-1.5 pl-7 text-sm" value={filters.job} onChange={(e) => setFilters(prev => ({...prev, job: e.target.value}))} /><datalist id="job-suggestions">{JOB_SUGGESTIONS.map(job => <option key={job} value={job} />)}</datalist></div></div>
                    </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {filteredRecruits.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center"><ShieldOff size={48} className="mb-3 opacity-20"/><p className="text-lg font-medium">Không tìm thấy dữ liệu</p><p className="text-sm">Vui lòng thử lại với bộ lọc khác</p><button onClick={resetFilters} className="mt-4 text-military-600 font-bold hover:underline">Xóa bộ lọc</button></div>
                ) : (
                    <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="bg-gray-50 text-gray-600 uppercase text-xs sticky top-0 z-10">{renderTableHead()}</thead><tbody className="divide-y divide-gray-100 text-sm">{filteredRecruits.map((recruit, index) => renderRow(recruit, index))}</tbody></table></div>
                )}
                <div className="bg-gray-50 border-t border-gray-200 p-3 text-xs text-gray-500 flex justify-between items-center"><span>Hiển thị <strong>{filteredRecruits.length}</strong> / <strong>{totalRelevantRecruits}</strong> hồ sơ</span><span className="italic">Dữ liệu năm {sessionYear}</span></div>
              </div>
          </div>
      </div>
      {showForm && <RecruitForm initialData={editingRecruit} initialStatus={editingRecruit ? undefined : getInitialStatus()} user={user} onSubmit={(data) => { onUpdate(data); setShowForm(false); }} onClose={() => setShowForm(false)} sessionYear={sessionYear} />}
      {showActionModal && actionType && selectedRecruit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                  <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${actionType === 'DEFER' ? 'text-amber-700' : actionType === 'EXEMPT' ? 'text-purple-700' : actionType === 'REMOVE' ? 'text-orange-700' : actionType === 'TT50' ? 'text-slate-700' : 'text-red-700'}`}>
                      {actionType === 'DEFER' && <PauseCircle />}
                      {actionType === 'EXEMPT' && <ShieldCheck />}
                      {actionType === 'REMOVE' && <UserX />}
                      {actionType === 'TT50' && <BookX />}
                      {actionType === 'DELETE' && <AlertTriangle />}
                      {actionType === 'NOT_ALLOWED_REG' && <Ban />}
                      {actionType === 'EXEMPT_REG' && <Shield />}

                      {actionType === 'DEFER' && 'Xét duyệt Tạm hoãn'}
                      {actionType === 'EXEMPT' && 'Xét duyệt Miễn NVQS'}
                      {actionType === 'REMOVE' && 'Loại khỏi nguồn'}
                      {actionType === 'TT50' && 'Không tuyển chọn (TT50)'}
                      {actionType === 'DELETE' && 'Xóa vĩnh viễn hồ sơ'}
                      {actionType === 'NOT_ALLOWED_REG' && 'Không được đăng ký NVQS'}
                      {actionType === 'EXEMPT_REG' && 'Miễn đăng ký NVQS'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Đối tượng: <strong>{selectedRecruit.fullName}</strong> - Năm sinh: {selectedRecruit.dob.split('-')[0]}</p>
                  <div className="space-y-4 mb-6">
                      {(actionType === 'DEFER' || actionType === 'EXEMPT') && (
                          <div className="space-y-2">
                              <p className="text-xs font-bold uppercase text-gray-500">Chọn lý do pháp lý hoặc nhập lý do:</p>
                              {/* Reason Input with Suggestions */}
                              <div className="relative">
                                  <input 
                                      list="action-reason-suggestions"
                                      type="text"
                                      placeholder="Chọn hoặc nhập lý do cụ thể..."
                                      className={`w-full p-3 border rounded text-sm focus:ring-2 outline-none ${actionType === 'DEFER' ? 'border-amber-300 focus:ring-amber-500' : 'border-purple-300 focus:ring-purple-500'}`}
                                      value={reasonInput}
                                      onChange={(e) => setReasonInput(e.target.value)}
                                  />
                                  <datalist id="action-reason-suggestions">
                                      {(actionType === 'DEFER' ? LEGAL_DEFERMENT_REASONS : LEGAL_EXEMPTION_REASONS).map((reason, idx) => (
                                          <option key={idx} value={reason} />
                                      ))}
                                  </datalist>
                              </div>
                              <p className="text-[10px] text-gray-500 italic">* Cho phép nhập lý do sức khỏe cụ thể (VD: Gãy tay, Cận thị...)</p>
                              
                              {/* Show Proof Input if Policy Reason detected in Input */}
                              {actionType === 'DEFER' && POLICY_DEFERMENT_REASONS.includes(reasonInput) && (
                                  <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                      <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                          <FileText size={12} /> Văn bản chứng minh (Bắt buộc):
                                      </label>
                                      <input 
                                          type="text"
                                          required
                                          placeholder="VD: Theo Quyết định số 123/QĐ-UBND..."
                                          className="w-full p-2 border border-amber-300 rounded text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                                          value={proofInput}
                                          onChange={(e) => setProofInput(e.target.value)}
                                      />
                                  </div>
                              )}
                          </div>
                      )}
                      {(actionType === 'REMOVE' || actionType === 'DELETE' || actionType === 'NOT_ALLOWED_REG' || actionType === 'EXEMPT_REG') && (
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                  {actionType === 'REMOVE' ? 'Lý do loại khỏi nguồn:' : 
                                   actionType === 'DELETE' ? 'Lý do xóa vĩnh viễn (Bắt buộc):' :
                                   actionType === 'NOT_ALLOWED_REG' ? 'Lý do không được đăng ký (VD: Có tiền án...):' :
                                   'Lý do miễn đăng ký (VD: Khuyết tật...):'}
                              </label>
                              <textarea required rows={4} className={`w-full border rounded p-3 text-sm focus:ring-2 ${actionType === 'REMOVE' ? 'border-orange-300 focus:ring-orange-500' : actionType === 'DELETE' ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-500'}`} placeholder={actionType === 'REMOVE' ? "VD: Chuyển hộ khẩu đi nơi khác, chết, sai sót dữ liệu..." : "Nhập lý do chi tiết..."} value={reasonInput} onChange={(e) => setReasonInput(e.target.value)}></textarea>
                              {actionType === 'DELETE' && <p className="text-xs text-red-500 mt-2 italic flex items-center gap-1"><AlertTriangle size={12}/> Cảnh báo: Hành động này không thể hoàn tác!</p>}
                          </div>
                      )}
                      {actionType === 'TT50' && (
                          <div>
                              <p className="text-sm text-gray-700 mb-2">Xác nhận chuyển công dân vào danh sách <b>Không tuyển chọn chưa gọi nhập ngũ theo Thông tư 50</b>?</p>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Ghi chú (Tùy chọn):</label>
                              <input type="text" className="w-full p-2 border rounded text-sm" placeholder="VD: Theo TT50" value={reasonInput} onChange={e => setReasonInput(e.target.value)} />
                          </div>
                      )}
                  </div>
                  <div className="flex justify-end gap-3 border-t pt-4"><button onClick={() => setShowActionModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-bold">Hủy bỏ</button><button onClick={confirmAction} className={`px-4 py-2 text-white rounded font-bold shadow-sm ${actionType === 'DEFER' ? 'bg-amber-600 hover:bg-amber-700' : actionType === 'EXEMPT' ? 'bg-purple-600 hover:bg-purple-700' : actionType === 'REMOVE' ? 'bg-orange-600 hover:bg-orange-700' : actionType === 'TT50' ? 'bg-slate-600 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-700'}`}>Xác nhận</button></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RecruitManagement;
