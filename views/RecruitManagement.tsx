
import React, { useState, useMemo, useEffect } from 'react';
import { Recruit, RecruitmentStatus, User } from '../types';
import { EDUCATIONS, GET_ALL_COMMUNES, LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS, LOW_EDUCATION_GRADES, ETHNICITIES, RELIGIONS, LOCATION_DATA, PROVINCES_VN } from '../constants';
import RecruitForm from '../components/RecruitForm';
import { 
  Search, Plus, CheckCircle2, XCircle, FileEdit, Trash2, Stethoscope, ClipboardList, RefreshCw, Filter, ShieldOff,
  PauseCircle, Users, FileSignature, UserX, RotateCcw, Lock, Flag, Layers, ShieldCheck, Baby, Activity,
  ArchiveRestore, Briefcase, Ruler, AlertTriangle, Check, X, ChevronRight
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

const TABS = [
  { id: 'ALL', label: 'Toàn bộ nguồn (18+)', status: null, color: 'bg-gray-600', borderColor: 'border-gray-600', textColor: 'text-gray-700', icon: Users },
  { id: 'UNDER_18', label: 'DS đủ 17 tuổi trong năm', status: null, color: 'bg-pink-600', borderColor: 'border-pink-600', textColor: 'text-pink-700', icon: Baby },
  { id: 'PRE_CHECK', label: 'DS Đủ ĐK Sơ tuyển', status: [RecruitmentStatus.SOURCE, RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.PRE_CHECK_FAILED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-blue-600', borderColor: 'border-blue-600', textColor: 'text-blue-700', icon: ClipboardList },
  { id: 'MED_EXAM', label: 'DS Đủ ĐK Khám tuyển', status: [RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-indigo-600', borderColor: 'border-indigo-600', textColor: 'text-indigo-700', icon: Stethoscope },
  { id: 'FINAL', label: 'DS Đủ ĐK Nhập ngũ', status: [RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.FINALIZED], color: 'bg-green-600', borderColor: 'border-green-600', textColor: 'text-green-700', icon: FileSignature },
  { id: 'ENLISTED', label: 'Danh sách nhập ngũ', status: [RecruitmentStatus.ENLISTED], color: 'bg-red-600', borderColor: 'border-red-600', textColor: 'text-red-700', icon: Flag },
  { id: 'DEFERRED_LIST', label: 'DS Tạm hoãn (Nguồn)', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-600', borderColor: 'border-amber-600', textColor: 'text-amber-700', icon: PauseCircle },
  { id: 'POST_PRE_CHECK_DEFERRED', label: 'DS hoãn sơ khám', status: [RecruitmentStatus.PRE_CHECK_FAILED], color: 'bg-orange-600', borderColor: 'border-orange-600', textColor: 'text-orange-700', icon: Activity },
  { id: 'POST_MED_EXAM_DEFERRED', label: 'DS hoãn khám tuyển', status: [RecruitmentStatus.MED_EXAM_FAILED], color: 'bg-red-500', borderColor: 'border-red-500', textColor: 'text-red-600', icon: Activity },
  { id: 'EXEMPTED_LIST', label: 'Danh sách Miễn', status: [RecruitmentStatus.EXEMPTED], color: 'bg-purple-600', borderColor: 'border-purple-600', textColor: 'text-purple-700', icon: ShieldCheck },
  { id: 'REMAINING', label: 'DS Nguồn còn lại', status: [RecruitmentStatus.SOURCE, RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.PRE_CHECK_FAILED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.DEFERRED, RecruitmentStatus.EXEMPTED], color: 'bg-teal-600', borderColor: 'border-teal-600', textColor: 'text-teal-700', icon: Layers },
  { id: 'REMOVED', label: 'DS Loại khỏi nguồn', status: [RecruitmentStatus.REMOVED_FROM_SOURCE], color: 'bg-gray-600', borderColor: 'border-gray-600', textColor: 'text-gray-700', icon: UserX },
];

const DEFERRED_SUB_TABS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'HEALTH', label: 'Về Sức khỏe' },
    { id: 'EDUCATION', label: 'Về Học vấn' },
    { id: 'POLICY', label: 'Về Chính sách' },
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

type ActionType = 'DEFER' | 'EXEMPT' | 'REMOVE' | 'DELETE' | null;

// Component nhập liệu có local state để tránh bị lag/lock khi gõ phím
const EnlistmentUnitInput = ({ value, onSave }: { value: string, onSave: (val: string) => void }) => {
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    return (
        <input 
            type="text" 
            className="w-full text-xs border border-gray-300 rounded p-1.5 focus:border-red-500 focus:ring-1 focus:ring-red-200" 
            placeholder="Nhập đơn vị..." 
            value={localValue} 
            onChange={(e) => setLocalValue(e.target.value)} 
            onBlur={() => { if(localValue !== (value || '')) onSave(localValue); }} 
            onKeyDown={(e) => { if(e.key === 'Enter') { if(localValue !== (value || '')) onSave(localValue); (e.target as HTMLInputElement).blur(); } }} 
        />
    );
};

const RecruitManagement: React.FC<RecruitManagementProps> = ({ recruits, user, onUpdate, onDelete, initialTab = 'ALL', onTabChange, sessionYear }) => {
  const isAdmin = user.role === 'ADMIN';
  const isReadOnly = user.role === 'VIEWER' || !!user.isLocked;

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

  useEffect(() => { setActiveTabId(initialTab); }, [initialTab]);

  const handleTabChange = (id: string) => {
      setActiveTabId(id);
      if (id !== 'DEFERRED_LIST') setActiveDeferredSubTab('ALL');
      if (onTabChange) onTabChange(id);
  };
  
  const initialFilters = {
    search: '', province: '', commune: '', village: '', age: '', education: '',
    year: sessionYear, ethnicity: '', religion: '', maritalStatus: '', height: '', job: ''
  };
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => { setFilters(prev => ({ ...prev, year: sessionYear })); }, [sessionYear]);

  const adminCommuneList = useMemo(() => {
    if (!filters.province) return [];
    // @ts-ignore
    const data = LOCATION_DATA[filters.province];
    return data ? Object.keys(data) : [];
  }, [filters.province]);

  const AGE_OPTIONS = useMemo(() => Array.from({length: 10}, (_, i) => 18 + i), []);

  const totalRelevantRecruits = useMemo(() => {
      return recruits.filter(r => {
          if (r.recruitmentYear !== sessionYear) return false;
          if (!isAdmin && r.address.commune !== user.unit.commune) return false;
          return true;
      }).length;
  }, [recruits, sessionYear, isAdmin, user]);

  const filteredRecruits = useMemo(() => {
    let result = recruits;
    if (!isAdmin) result = result.filter(r => r.address.commune === user.unit.commune);

    const currentTab = TABS.find(t => t.id === activeTabId);
    
    if (activeTabId === 'UNDER_18') {
        result = result.filter(r => (sessionYear - parseInt(r.dob.split('-')[0])) < 18 && r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE);
    } else if (activeTabId === 'ALL') {
        result = result.filter(r => (sessionYear - parseInt(r.dob.split('-')[0])) >= 18 && r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE);
    } else if (currentTab?.status) {
        result = result.filter(r => currentTab.status && currentTab.status.includes(r.status));
        if (activeTabId === 'PRE_CHECK') {
            result = result.filter(r => (sessionYear - parseInt(r.dob.split('-')[0])) >= 18);
        }
        if (activeTabId === 'DEFERRED_LIST' && activeDeferredSubTab !== 'ALL') {
            result = result.filter(r => {
                const reason = (r.defermentReason || '');
                // 1. Tạm hoãn về Sức khỏe
                if (activeDeferredSubTab === 'HEALTH') {
                    // "Chưa đủ sức khỏe phục vụ tại ngũ theo kết luận của Hội đồng khám sức khỏe" (Index 0)
                    return reason === LEGAL_DEFERMENT_REASONS[0];
                }
                
                // 2. Tạm hoãn về Học vấn
                if (activeDeferredSubTab === 'EDUCATION') {
                     // "Đang học tại cơ sở giáo dục phổ thông..." (Index 6)
                     return reason === LEGAL_DEFERMENT_REASONS[6];
                }

                // 3. Tạm hoãn về Chính sách (Các index 1, 2, 3, 4, 5)
                if (activeDeferredSubTab === 'POLICY') {
                     return [
                        LEGAL_DEFERMENT_REASONS[1], // Lao động duy nhất
                        LEGAL_DEFERMENT_REASONS[2], // Con bệnh binh
                        LEGAL_DEFERMENT_REASONS[3], // Có anh chị em tại ngũ
                        LEGAL_DEFERMENT_REASONS[4], // Di dân
                        LEGAL_DEFERMENT_REASONS[5]  // Cán bộ công chức vùng khó khăn
                     ].includes(reason);
                }

                // 4. Dân quân thường trực
                if (activeDeferredSubTab === 'DQTT') {
                     return reason === LEGAL_DEFERMENT_REASONS[7];
                }
                
                return true;
            });
        }
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(r => r.fullName.toLowerCase().includes(q) || r.citizenId.includes(q));
    }
    if (isAdmin) {
        if (filters.province) result = result.filter(r => r.address.province === filters.province);
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
  }, [recruits, activeTabId, activeDeferredSubTab, filters, isAdmin, user, sessionYear]);

  const resetFilters = () => setFilters(initialFilters);

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
                 r.status !== RecruitmentStatus.EXEMPTED;
      });
      if (eligibleToTransfer.length === 0) { alert(`Không tìm thấy hồ sơ nào từ năm ${prevYear} đủ điều kiện cập nhật.`); return; }
      
      const currentYearRecruits = recruits.filter(r => r.recruitmentYear === sessionYear);
      const existingCitizenIds = new Set(currentYearRecruits.map(r => r.citizenId));
      const toCreate = eligibleToTransfer.filter(r => !existingCitizenIds.has(r.citizenId));
      
      if (toCreate.length === 0) { alert(`Tất cả hồ sơ nguồn năm ${prevYear} đã có mặt trong năm ${sessionYear}.`); return; }
      if (!window.confirm(`Xác nhận cập nhật ${toCreate.length} hồ sơ từ năm ${prevYear}?`)) return;
      
      let successCount = 0;
      for (const r of toCreate) {
          // QUAN TRỌNG: Loại bỏ _id, createdAt, updatedAt của Mongo cũ để tránh lỗi Duplicate Key
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, createdAt, updatedAt, __v, ...cleanRecruitData } = r as any;

          const newRecruit: Recruit = { 
              ...cleanRecruitData, 
              id: Date.now().toString(36) + Math.random().toString(36).substr(2) + successCount, 
              recruitmentYear: sessionYear, 
              status: RecruitmentStatus.SOURCE, 
              defermentReason: '', 
              enlistmentUnit: undefined, 
              enlistmentDate: undefined, 
              enlistmentType: undefined 
          };
          onUpdate(newRecruit);
          successCount++;
      }
      alert(`Đã gửi yêu cầu cập nhật ${successCount} hồ sơ.`);
  };

  const handleEdit = (recruit: Recruit) => {
    if (isReadOnly) return;
    setEditingRecruit(recruit);
    setShowForm(true);
  };

  const getStatusBadge = (status: RecruitmentStatus) => {
    switch (status) {
      case RecruitmentStatus.SOURCE: return <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600">Nguồn</span>;
      case RecruitmentStatus.PRE_CHECK_PASSED: return <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-600">Đạt Sơ tuyển</span>;
      case RecruitmentStatus.PRE_CHECK_FAILED: return <span className="px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-600">Rớt Sơ tuyển</span>;
      case RecruitmentStatus.MED_EXAM_PASSED: return <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-600">Đạt Khám tuyển</span>;
      case RecruitmentStatus.MED_EXAM_FAILED: return <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-600">Rớt Khám tuyển</span>;
      case RecruitmentStatus.FINALIZED: return <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-600">Bình cử</span>;
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
      setShowActionModal(true);
  };

  const confirmAction = () => {
      if (!selectedRecruit || !actionType) return;
      let finalReason = reasonInput;
      if (actionType === 'REMOVE' || actionType === 'DELETE') {
          if (!reasonInput.trim()) { alert("Vui lòng nhập lý do cụ thể."); return; }
      } else {
          if (reasonInput.startsWith('Khác') || !reasonInput) {
              if(!customReasonInput.trim()) { alert("Vui lòng nhập lý do cụ thể"); return; }
              finalReason = customReasonInput;
          }
      }
      switch (actionType) {
          case 'DEFER': onUpdate({ ...selectedRecruit, status: RecruitmentStatus.DEFERRED, defermentReason: finalReason }); break;
          case 'EXEMPT': onUpdate({ ...selectedRecruit, status: RecruitmentStatus.EXEMPTED, defermentReason: finalReason }); break;
          case 'REMOVE': onUpdate({ ...selectedRecruit, status: RecruitmentStatus.REMOVED_FROM_SOURCE, defermentReason: finalReason }); break;
          case 'DELETE': onDelete(selectedRecruit.id); break;
      }
      setShowActionModal(false); setSelectedRecruit(null); setActionType(null);
  };

  const renderRow = (recruit: Recruit, index: number) => {
      const birthYear = parseInt(recruit.dob.split('-')[0] || '0');
      const age = sessionYear - birthYear;
      const isUnder18 = age < 18;
      return (
          <tr key={recruit.id} className={`hover:bg-gray-50 group border-b border-gray-100 last:border-0 ${recruit.status === RecruitmentStatus.REMOVED_FROM_SOURCE ? 'bg-gray-50 opacity-60' : ''}`}>
              <td className="p-3 text-center text-gray-500 font-mono">{index + 1}</td>
              <td className="p-3">
                  <div className="font-bold text-gray-900 group-hover:text-military-700 transition-colors">{recruit.fullName}</div>
                  <div className="text-xs text-gray-500 font-mono">{recruit.citizenId || '---'}</div>
                  {isUnder18 && <span className="text-[10px] font-bold text-pink-600 border border-pink-200 bg-pink-50 px-1 rounded mt-1 inline-block">Chưa đủ 18 ({age}t)</span>}
              </td>
              <td className="p-3">
                  <div className="text-sm font-semibold">{recruit.dob} <span className="text-gray-400 font-normal">({age} tuổi)</span></div>
                  <div className="text-xs text-gray-500 max-w-[200px] truncate" title={`${recruit.address.village}, ${recruit.address.commune}, ${recruit.address.province}`}>{recruit.address.village}, {recruit.address.commune}</div>
              </td>
              <td className="p-3">
                  <div className={`text-sm font-bold ${LOW_EDUCATION_GRADES.includes(recruit.details.education) ? 'text-orange-600' : 'text-gray-700'}`}>{recruit.details.education}</div>
                  <div className="text-xs text-gray-500">{recruit.details.job || '---'}</div>
              </td>
              <td className="p-3 text-center">
                  {recruit.physical.healthGrade ? (
                      <span className={`inline-block w-8 h-8 leading-8 rounded-full font-bold text-white text-sm shadow-sm ${recruit.physical.healthGrade === 1 ? 'bg-emerald-500' : recruit.physical.healthGrade === 2 ? 'bg-green-500' : recruit.physical.healthGrade === 3 ? 'bg-yellow-500' : 'bg-red-500'}`}>{recruit.physical.healthGrade}</span>
                  ) : <span className="text-gray-300">--</span>}
                  {recruit.physical.bmi > 0 && <div className={`text-[10px] font-bold mt-1 ${recruit.physical.bmi < 18.5 || recruit.physical.bmi > 25 ? 'text-red-500' : 'text-green-600'}`}>BMI: {recruit.physical.bmi}</div>}
              </td>
              <td className="p-3 text-center">
                  {getStatusBadge(recruit.status)}
                  {(recruit.status === RecruitmentStatus.DEFERRED || recruit.status === RecruitmentStatus.EXEMPTED || recruit.status === RecruitmentStatus.REMOVED_FROM_SOURCE) && recruit.defermentReason && (
                      <div className="text-[10px] text-gray-500 max-w-[150px] truncate mx-auto mt-1 italic" title={recruit.defermentReason}>{recruit.defermentReason}</div>
                  )}
              </td>
              <td className="p-3">
                  <div className={`flex items-center justify-center gap-2 ${activeTabId !== 'ENLISTED' ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
                      {activeTabId === 'ALL' && (
                        <>
                            <button onClick={() => handleEdit(recruit)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title={isReadOnly ? "Xem chi tiết" : "Chỉnh sửa"}>{isReadOnly ? <ClipboardList size={18} /> : <FileEdit size={18} />}</button>
                            {!isReadOnly && (
                                <>
                                    {recruit.status !== RecruitmentStatus.REMOVED_FROM_SOURCE && recruit.status !== RecruitmentStatus.ENLISTED && (
                                        <button onClick={() => { if (recruit.status === RecruitmentStatus.DEFERRED) { if(window.confirm(`Xác nhận đưa công dân ${recruit.fullName} ra khỏi danh sách Tạm hoãn?`)) onUpdate({...recruit, status: RecruitmentStatus.SOURCE, defermentReason: ''}); } else openActionModal(recruit, 'DEFER'); }} className={`p-1.5 rounded transition-colors ${recruit.status === RecruitmentStatus.DEFERRED ? 'bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200' : 'text-amber-600 hover:bg-amber-50'}`} title={recruit.status === RecruitmentStatus.DEFERRED ? "Đang tạm hoãn" : "Tạm hoãn nguồn"}><PauseCircle size={18} fill={recruit.status === RecruitmentStatus.DEFERRED ? "currentColor" : "none"} /></button>
                                    )}
                                    {recruit.status !== RecruitmentStatus.REMOVED_FROM_SOURCE && recruit.status !== RecruitmentStatus.ENLISTED && (
                                        <button onClick={() => { if (recruit.status === RecruitmentStatus.EXEMPTED) { if(window.confirm(`Xác nhận đưa công dân ${recruit.fullName} ra khỏi danh sách Miễn?`)) onUpdate({...recruit, status: RecruitmentStatus.SOURCE, defermentReason: ''}); } else openActionModal(recruit, 'EXEMPT'); }} className={`p-1.5 rounded transition-colors ${recruit.status === RecruitmentStatus.EXEMPTED ? 'bg-purple-100 text-purple-700 shadow-sm ring-1 ring-purple-200' : 'text-purple-600 hover:bg-purple-50'}`} title={recruit.status === RecruitmentStatus.EXEMPTED ? "Đang miễn" : "Miễn NVQS"}><ShieldCheck size={18} fill={recruit.status === RecruitmentStatus.EXEMPTED ? "currentColor" : "none"} /></button>
                                    )}
                                    {recruit.status !== RecruitmentStatus.REMOVED_FROM_SOURCE ? (
                                        <button onClick={() => openActionModal(recruit, 'REMOVE')} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded" title="Loại khỏi nguồn"><UserX size={18} /></button>
                                    ) : (
                                        <button onClick={() => { if(window.confirm("Khôi phục về danh sách nguồn?")) onUpdate({...recruit, status: RecruitmentStatus.SOURCE, defermentReason: ''}) }} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded bg-teal-50 ring-1 ring-teal-200" title="Khôi phục về Nguồn"><RotateCcw size={18} /></button>
                                    )}
                                    <button onClick={() => openActionModal(recruit, 'DELETE')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xóa vĩnh viễn"><Trash2 size={18} /></button>
                                </>
                            )}
                        </>
                      )}
                      {activeTabId === 'PRE_CHECK' && !isReadOnly && (
                        <>
                            {(recruit.status as RecruitmentStatus) === RecruitmentStatus.PRE_CHECK_FAILED ? (
                                <button onClick={() => { if(window.confirm("Khôi phục về trạng thái Nguồn ban đầu?")) onUpdate({...recruit, status: RecruitmentStatus.SOURCE}) }} className="px-3 py-1.5 rounded bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 flex items-center gap-1 text-xs font-bold" title="Khôi phục lại Nguồn"><RotateCcw size={14} /> Khôi phục</button>
                            ) : (
                                <>
                                    <button onClick={() => onUpdate({...recruit, status: RecruitmentStatus.PRE_CHECK_PASSED})} className={`p-1.5 rounded transition-colors ${recruit.status === RecruitmentStatus.PRE_CHECK_PASSED ? 'bg-blue-100 text-blue-700 font-bold ring-1 ring-blue-300' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`} title="Đạt Sơ tuyển"><CheckCircle2 size={20} fill={recruit.status === RecruitmentStatus.PRE_CHECK_PASSED ? "currentColor" : "none"} className={recruit.status === RecruitmentStatus.PRE_CHECK_PASSED ? "text-blue-600" : ""} /></button>
                                    <button onClick={() => onUpdate({...recruit, status: RecruitmentStatus.PRE_CHECK_FAILED})} className={`p-1.5 rounded transition-colors ${(recruit.status as RecruitmentStatus) === RecruitmentStatus.PRE_CHECK_FAILED ? 'bg-orange-100 text-orange-700 font-bold' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`} title="Không đạt Sơ tuyển"><XCircle size={20} fill={recruit.status === RecruitmentStatus.PRE_CHECK_FAILED ? "currentColor" : "none"} className={recruit.status === RecruitmentStatus.PRE_CHECK_FAILED ? "text-orange-600" : ""} /></button>
                                </>
                            )}
                        </>
                      )}
                      {activeTabId === 'MED_EXAM' && !isReadOnly && (
                        <>
                            {(recruit.status as RecruitmentStatus) === RecruitmentStatus.MED_EXAM_FAILED ? (
                                <button onClick={() => { if(window.confirm("Khôi phục về trạng thái Đạt Sơ tuyển (để khám lại)?")) onUpdate({...recruit, status: RecruitmentStatus.PRE_CHECK_PASSED}) }} className="px-3 py-1.5 rounded bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 flex items-center gap-1 text-xs font-bold" title="Khôi phục về Đạt Sơ tuyển"><RotateCcw size={14} /> Khôi phục</button>
                            ) : (
                                <>
                                    <button onClick={() => onUpdate({...recruit, status: RecruitmentStatus.MED_EXAM_PASSED})} className={`p-1.5 rounded transition-colors ${recruit.status === RecruitmentStatus.MED_EXAM_PASSED ? 'bg-indigo-100 text-indigo-700 font-bold ring-1 ring-indigo-300' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`} title="Đạt Khám tuyển"><Stethoscope size={20} className={recruit.status === RecruitmentStatus.MED_EXAM_PASSED ? "text-indigo-600" : ""} /></button>
                                    <button onClick={() => onUpdate({...recruit, status: RecruitmentStatus.MED_EXAM_FAILED})} className={`p-1.5 rounded transition-colors ${(recruit.status as RecruitmentStatus) === RecruitmentStatus.MED_EXAM_FAILED ? 'bg-red-100 text-red-700 font-bold' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`} title="Không đạt Khám tuyển"><AlertTriangle size={20} className={recruit.status === RecruitmentStatus.MED_EXAM_FAILED ? "text-red-600" : ""} /></button>
                                </>
                            )}
                        </>
                      )}
                      {activeTabId === 'FINAL' && !isReadOnly && (
                        <>
                            <button onClick={() => { if(window.confirm(`Xác nhận CHỐT danh sách nhập ngũ đối với ${recruit.fullName}?`)) onUpdate({...recruit, status: RecruitmentStatus.ENLISTED}) }} className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300`} title="Chốt danh sách nhập ngũ"><Check size={14} /> Chốt Nhập ngũ</button>
                            <button onClick={() => { if(window.confirm(`Xác nhận KHÔNG CHỐT (trả về nguồn còn lại) đối với ${recruit.fullName}?`)) onUpdate({...recruit, status: RecruitmentStatus.SOURCE}) }} className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100`} title="Không chốt (Trả về nguồn)"><X size={14} /> Không chốt</button>
                        </>
                      )}
                      {activeTabId === 'ENLISTED' && !isReadOnly && (
                          <div className="flex flex-col gap-2 w-full max-w-[200px]">
                              <EnlistmentUnitInput 
                                  value={recruit.enlistmentUnit || ''} 
                                  onSave={(val) => onUpdate({...recruit, enlistmentUnit: val})} 
                              />
                              <div className="flex bg-gray-100 rounded p-0.5 border border-gray-200">
                                  <button onClick={() => onUpdate({...recruit, enlistmentType: 'OFFICIAL'})} className={`flex-1 text-[10px] font-bold py-1 rounded transition-all ${recruit.enlistmentType !== 'RESERVE' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Chính thức</button>
                                  <button onClick={() => onUpdate({...recruit, enlistmentType: 'RESERVE'})} className={`flex-1 text-[10px] font-bold py-1 rounded transition-all ${recruit.enlistmentType === 'RESERVE' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Dự bị</button>
                              </div>
                          </div>
                      )}
                      {['DEFERRED_LIST', 'EXEMPTED_LIST', 'REMOVED', 'POST_PRE_CHECK_DEFERRED', 'POST_MED_EXAM_DEFERRED'].includes(activeTabId || '') && !isReadOnly && (
                           <button onClick={() => { if(window.confirm("Khôi phục hồ sơ về trạng thái Nguồn ban đầu?")) onUpdate({...recruit, status: RecruitmentStatus.SOURCE, defermentReason: ''}) }} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded bg-teal-50 ring-1 ring-teal-200 flex items-center gap-1 px-2" title="Khôi phục về Nguồn"><RotateCcw size={16} /> <span className="text-xs font-bold">Khôi phục</span></button>
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
          <th className="p-3 border-b text-center">Sức khỏe</th>
          <th className="p-3 border-b text-center">Trạng thái</th>
          <th className="p-3 border-b text-center w-32">Thao tác</th>
      </tr>
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {!!user.isLocked && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 shadow-sm mb-4"><Lock size={20} className="shrink-0" /><div><p className="font-bold text-sm">Tài khoản đã bị vô hiệu hóa chức năng nhập liệu</p><p className="text-xs">Bạn chỉ có thể xem dữ liệu. Vui lòng liên hệ Quản trị viên để được mở khóa.</p></div></div>}
      <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 shrink-0">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 sticky top-4">
                  <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                      {TABS.map(tab => {
                          const isActive = activeTabId === tab.id;
                          const Icon = tab.icon;
                          return (
                              <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap w-full text-left group ${isActive ? `${tab.color} text-white shadow-md` : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                  <Icon size={18} className={!isActive ? "text-gray-400 group-hover:text-gray-600" : ""} /> 
                                  <span className="flex-1">{tab.label}</span>
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
                  {!isReadOnly && activeTabId === 'ALL' && (
                      <div className="flex gap-2 w-full md:w-auto">
                          <button onClick={handleTransferFromPreviousYear} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 shadow-md font-bold text-sm transition-transform active:scale-95 w-full md:w-auto justify-center"><ArchiveRestore size={18} /> Cập nhật nguồn {sessionYear - 1}</button>
                          <button onClick={() => { setEditingRecruit(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-military-600 text-white rounded-lg hover:bg-military-700 shadow-md font-bold text-sm transition-transform active:scale-95 w-full md:w-auto justify-center"><Plus size={18} /> Bổ sung nguồn</button>
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
                         {isAdmin && (
                            <>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Tỉnh / Thành phố</label>
                                    <select className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700" value={filters.province} onChange={(e) => setFilters(prev => ({...prev, province: e.target.value, commune: ''}))}><option value="">-- Tất cả --</option>{PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}</select>
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
      {showForm && <RecruitForm initialData={editingRecruit} user={user} onSubmit={(data) => { onUpdate(data); setShowForm(false); }} onClose={() => setShowForm(false)} sessionYear={sessionYear} />}
      {showActionModal && actionType && selectedRecruit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                  <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${actionType === 'DEFER' ? 'text-amber-700' : actionType === 'EXEMPT' ? 'text-purple-700' : actionType === 'REMOVE' ? 'text-orange-700' : 'text-red-700'}`}>{actionType === 'DEFER' && <PauseCircle />}{actionType === 'EXEMPT' && <ShieldCheck />}{actionType === 'REMOVE' && <UserX />}{actionType === 'DELETE' && <AlertTriangle />}{actionType === 'DEFER' && 'Xét duyệt Tạm hoãn'}{actionType === 'EXEMPT' && 'Xét duyệt Miễn NVQS'}{actionType === 'REMOVE' && 'Loại khỏi nguồn'}{actionType === 'DELETE' && 'Xóa vĩnh viễn hồ sơ'}</h3>
                  <p className="text-sm text-gray-600 mb-4">Đối tượng: <strong>{selectedRecruit.fullName}</strong> - Năm sinh: {selectedRecruit.dob.split('-')[0]}</p>
                  <div className="space-y-4 mb-6">
                      {(actionType === 'DEFER' || actionType === 'EXEMPT') && (
                          <div className="space-y-2">
                              <p className="text-xs font-bold uppercase text-gray-500">Chọn lý do pháp lý:</p>
                              {(actionType === 'DEFER' ? LEGAL_DEFERMENT_REASONS : LEGAL_EXEMPTION_REASONS).map((reason, idx) => (
                                  <label key={idx} className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-colors ${actionType === 'DEFER' ? 'hover:bg-amber-50' : 'hover:bg-purple-50'}`}><input type="radio" name="exceptionReason" className={`mt-1 ${actionType === 'DEFER' ? 'text-amber-600 focus:ring-amber-500' : 'text-purple-600 focus:ring-purple-500'}`} checked={reasonInput === reason} onChange={() => setReasonInput(reason)} /><span className="text-sm font-medium text-gray-800 leading-relaxed">{reason}</span></label>
                              ))}
                              {reasonInput.startsWith('Khác') && (<div className="pl-8 animate-in fade-in slide-in-from-top-1"><input type="text" autoFocus className={`w-full border rounded p-2 text-sm outline-none ${actionType === 'DEFER' ? 'border-amber-300 focus:ring-2 focus:ring-amber-500' : 'border-purple-300 focus:ring-2 focus:ring-purple-500'}`} placeholder="Nhập lý do cụ thể..." value={customReasonInput} onChange={(e) => setCustomReasonInput(e.target.value)} /></div>)}
                          </div>
                      )}
                      {(actionType === 'REMOVE' || actionType === 'DELETE') && (
                          <div><label className="block text-sm font-bold text-gray-700 mb-2">{actionType === 'REMOVE' ? 'Lý do loại khỏi nguồn:' : 'Lý do xóa vĩnh viễn (Bắt buộc):'}</label><textarea required rows={4} className={`w-full border rounded p-3 text-sm focus:ring-2 ${actionType === 'REMOVE' ? 'border-orange-300 focus:ring-orange-500' : 'border-red-300 focus:ring-red-500'}`} placeholder={actionType === 'REMOVE' ? "VD: Chuyển hộ khẩu đi nơi khác, chết, sai sót dữ liệu..." : "Nhập lý do xóa để lưu vết hệ thống..."} value={reasonInput} onChange={(e) => setReasonInput(e.target.value)}></textarea>{actionType === 'DELETE' && <p className="text-xs text-red-500 mt-2 italic flex items-center gap-1"><AlertTriangle size={12}/> Cảnh báo: Hành động này không thể hoàn tác!</p>}</div>
                      )}
                  </div>
                  <div className="flex justify-end gap-3 border-t pt-4"><button onClick={() => setShowActionModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-bold">Hủy bỏ</button><button onClick={confirmAction} className={`px-4 py-2 text-white rounded font-bold shadow-sm ${actionType === 'DEFER' ? 'bg-amber-600 hover:bg-amber-700' : actionType === 'EXEMPT' ? 'bg-purple-600 hover:bg-purple-700' : actionType === 'REMOVE' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'}`}>Xác nhận</button></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RecruitManagement;
