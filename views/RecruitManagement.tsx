import React, { useState, useMemo, useEffect } from 'react';
import { Recruit, RecruitmentStatus, User } from '../types';
import { EDUCATIONS, GET_ALL_COMMUNES, SOURCE_DEFERMENT_REASONS, LOW_EDUCATION_GRADES, ETHNICITIES, RELIGIONS, MARITAL_STATUSES } from '../constants';
import RecruitForm from '../components/RecruitForm';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  FileEdit, 
  Trash2,
  Stethoscope,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Filter,
  Briefcase,
  ShieldOff,
  Tent,
  Calendar,
  Flag,
  Lock,
  PauseCircle,
  PlayCircle,
  Users,
  FileSignature,
  Edit3
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
  { 
      id: 'ALL', 
      label: 'Toàn bộ nguồn', 
      status: null, 
      color: 'bg-gray-600', 
      borderColor: 'border-gray-600', 
      textColor: 'text-gray-700',
      icon: Users 
  },
  { 
      id: 'PRE_CHECK', 
      label: 'Sơ khám', 
      status: [
          RecruitmentStatus.SOURCE, 
          RecruitmentStatus.PRE_CHECK_PASSED, 
          RecruitmentStatus.PRE_CHECK_FAILED,
          RecruitmentStatus.MED_EXAM_PASSED,
          RecruitmentStatus.MED_EXAM_FAILED,
          RecruitmentStatus.FINALIZED,
          RecruitmentStatus.DEFERRED,
          RecruitmentStatus.EXEMPTED
      ], 
      color: 'bg-blue-600', 
      borderColor: 'border-blue-600',
      textColor: 'text-blue-700',
      icon: ClipboardList
  },
  { 
      id: 'MED_EXAM', 
      label: 'Khám tuyển', 
      status: [
          RecruitmentStatus.PRE_CHECK_PASSED, 
          RecruitmentStatus.MED_EXAM_PASSED, 
          RecruitmentStatus.MED_EXAM_FAILED,
          RecruitmentStatus.FINALIZED,
          RecruitmentStatus.DEFERRED,
          RecruitmentStatus.EXEMPTED
      ], 
      color: 'bg-indigo-600', 
      borderColor: 'border-indigo-600',
      textColor: 'text-indigo-700',
      icon: Stethoscope
  },
  { 
      id: 'FINAL', 
      label: 'Xét duyệt & Chốt', 
      status: [
          RecruitmentStatus.MED_EXAM_PASSED, 
          RecruitmentStatus.FINALIZED, 
          RecruitmentStatus.DEFERRED, 
          RecruitmentStatus.EXEMPTED
      ], 
      color: 'bg-green-600', 
      borderColor: 'border-green-600',
      textColor: 'text-green-700',
      icon: FileSignature
  },
];

const RecruitManagement: React.FC<RecruitManagementProps> = ({ recruits, user, onUpdate, onDelete, initialTab = 'ALL', onTabChange, sessionYear }) => {
  const isAdmin = user.role === 'ADMIN';
  const isViewer = user.role === 'VIEWER';

  const [activeTabId, setActiveTabId] = useState(initialTab);
  const [showForm, setShowForm] = useState(false);
  const [editingRecruit, setEditingRecruit] = useState<Recruit | undefined>(undefined);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // State for Source Deferment Modal
  const [showDefermentModal, setShowDefermentModal] = useState(false);
  const [selectedDefermentRecruit, setSelectedDefermentRecruit] = useState<Recruit | null>(null);
  const [selectedDefermentReason, setSelectedDefermentReason] = useState(SOURCE_DEFERMENT_REASONS[0]);

  // Sync internal state if prop changes
  useEffect(() => {
      setActiveTabId(initialTab);
  }, [initialTab]);

  const handleTabChange = (id: string) => {
      setActiveTabId(id);
      if (onTabChange) onTabChange(id);
  };
  
  // Filters
  const initialFilters = {
    search: '',
    commune: '',
    village: '', // Text input for manual filtering
    age: '', // Age filter
    education: '',
    year: sessionYear, // Use sessionYear as default (fixed)
    ethnicity: '',
    religion: '',
    maritalStatus: '',
  };

  const [filters, setFilters] = useState(initialFilters);

  // Update filters when sessionYear changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, year: sessionYear }));
  }, [sessionYear]);

  const COMMUNES = useMemo(() => GET_ALL_COMMUNES(), []);

  // Calculate Ages List (18 to 27)
  const AGE_OPTIONS = useMemo(() => {
      return Array.from({length: 10}, (_, i) => 18 + i); // 18, 19, ... 27
  }, []);

  const filteredRecruits = useMemo(() => {
    let result = recruits;
    
    // 1. DATA ACCESS CONTROL (PERMISSION)
    if (!isAdmin) {
        // If not admin, FORCE filter by the user's commune
        result = result.filter(r => r.address.commune === user.unit.commune);
    } 

    // 2. Tab filtering
    const currentTab = TABS.find(t => t.id === activeTabId);
    if (currentTab?.status) {
      result = result.filter(r => currentTab.status && currentTab.status.includes(r.status));
    }

    // 3. User Input filtering
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(r => r.fullName.toLowerCase().includes(q));
    }
    
    // Only filter by commune input if Admin (Locals are already filtered)
    if (isAdmin && filters.commune) {
      result = result.filter(r => r.address.commune === filters.commune);
    }

    // Village Filter - Manual Text Search
    if (filters.village) {
      const v = filters.village.toLowerCase();
      result = result.filter(r => r.address.village.toLowerCase().includes(v));
    }

    // Age Filter
    if (filters.age) {
        if (filters.age === 'UNDER_18') {
             // Lọc những người có tuổi < 18 (Năm tuyển quân - Năm sinh < 18)
            result = result.filter(r => {
                const birthYear = parseInt(r.dob.split('-')[0]);
                return (sessionYear - birthYear) < 18;
            });
        } else {
            const targetAge = parseInt(filters.age);
            result = result.filter(r => {
                const birthYear = parseInt(r.dob.split('-')[0]);
                const age = sessionYear - birthYear;
                return age === targetAge;
            });
        }
    }

    if (filters.education) {
      result = result.filter(r => r.details.education === filters.education);
    }

    // Ethnicity Filter
    if (filters.ethnicity) {
        result = result.filter(r => r.details.ethnicity === filters.ethnicity);
    }

    // Religion Filter
    if (filters.religion) {
        result = result.filter(r => r.details.religion === filters.religion);
    }

    // Marital Status Filter
    if (filters.maritalStatus) {
        result = result.filter(r => r.details.maritalStatus === filters.maritalStatus);
    }
    
    // Always filter by sessionYear
    result = result.filter(r => r.recruitmentYear === sessionYear);

    return result;
  }, [recruits, activeTabId, filters, isAdmin, user, sessionYear]);

  const resetFilters = () => {
      setFilters(initialFilters);
  };

  const handleEdit = (recruit: Recruit) => {
    // Viewers cannot edit
    if (isViewer) return;
    setEditingRecruit(recruit);
    setShowForm(true);
  };

  const handleStatusChange = (e: React.MouseEvent, recruit: Recruit, newStatus: RecruitmentStatus) => {
    e.stopPropagation(); // Prevent row click
    if (isViewer) return; // Viewers cannot change status
    
    // Validation: Low Education Check for Pre-Check
    if (newStatus === RecruitmentStatus.PRE_CHECK_PASSED && LOW_EDUCATION_GRADES.includes(recruit.details.education)) {
        alert(`Công dân có trình độ văn hóa ${recruit.details.education} (Dưới lớp 8) không đủ điều kiện tham gia Sơ khám.`);
        return;
    }

    const updated = { ...recruit, status: newStatus };
    
    // Clean up reason if not relevant
    if (newStatus !== RecruitmentStatus.DEFERRED && newStatus !== RecruitmentStatus.EXEMPTED) {
        updated.defermentReason = undefined;
    }
    // Clean up unit if not finalized
    if (newStatus !== RecruitmentStatus.FINALIZED) {
        updated.enlistmentUnit = undefined;
    }

    onUpdate(updated);
  };

  // NEW: Toggle Med Exam Result directly (Passed <-> Failed)
  const toggleMedExamResult = (e: React.MouseEvent, recruit: Recruit) => {
      e.stopPropagation();
      if (isViewer) return;
      
      let newStatus: RecruitmentStatus;
      if (recruit.status === RecruitmentStatus.MED_EXAM_PASSED) {
          newStatus = RecruitmentStatus.MED_EXAM_FAILED;
      } else if (recruit.status === RecruitmentStatus.MED_EXAM_FAILED) {
          newStatus = RecruitmentStatus.MED_EXAM_PASSED;
      } else {
          return;
      }
      
      const updated = { ...recruit, status: newStatus };
      onUpdate(updated);
  };

  const openSourceDefermentModal = (e: React.MouseEvent, recruit: Recruit) => {
      e.stopPropagation();
      // IF already deferred -> Toggle OFF (Un-defer)
      if (recruit.status === RecruitmentStatus.DEFERRED) {
          const updated = {
              ...recruit,
              status: RecruitmentStatus.SOURCE, // Reset to source
              defermentReason: undefined
          };
          onUpdate(updated);
          return;
      }
      
      // IF not deferred -> Open Modal to Defer
      setSelectedDefermentRecruit(recruit);
      setSelectedDefermentReason(SOURCE_DEFERMENT_REASONS[0]);
      setShowDefermentModal(true);
  };

  const confirmSourceDeferment = () => {
      if (!selectedDefermentRecruit) return;
      const updated = {
          ...selectedDefermentRecruit,
          status: RecruitmentStatus.DEFERRED,
          defermentReason: selectedDefermentReason
      };
      onUpdate(updated);
      setShowDefermentModal(false);
      setSelectedDefermentRecruit(null);
  };

  // Toggle Finalization: Finalized <-> Med Exam Passed
  const toggleFinalization = (e: React.MouseEvent, recruit: Recruit) => {
      e.stopPropagation();
      if (recruit.status === RecruitmentStatus.FINALIZED) {
          // Un-finalize
          handleStatusChange(e, recruit, RecruitmentStatus.MED_EXAM_PASSED);
      } else {
          // Finalize
          handleStatusChange(e, recruit, RecruitmentStatus.FINALIZED);
      }
  };

  const getStatusBadge = (recruit: Recruit) => {
    switch (recruit.status) {
      case RecruitmentStatus.SOURCE:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-900 border border-gray-300 whitespace-nowrap">Nguồn</span>;
      case RecruitmentStatus.PRE_CHECK_PASSED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 whitespace-nowrap">Đạt sơ khám</span>;
      case RecruitmentStatus.PRE_CHECK_FAILED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300 whitespace-nowrap">Sơ khám KĐ</span>;
      case RecruitmentStatus.MED_EXAM_PASSED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 whitespace-nowrap">Đủ điều kiện</span>;
      case RecruitmentStatus.MED_EXAM_FAILED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300 whitespace-nowrap">Sức khỏe KĐ</span>;
      case RecruitmentStatus.FINALIZED:
        return (
            <div className="flex flex-col items-start gap-1">
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-300 whitespace-nowrap">Chốt nhập ngũ</span>
                {recruit.enlistmentUnit && <span className="text-xs font-bold text-green-700 flex items-center gap-1"><Tent size={10}/> {recruit.enlistmentUnit}</span>}
            </div>
        );
      case RecruitmentStatus.DEFERRED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">Tạm hoãn</span>;
      case RecruitmentStatus.EXEMPTED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 whitespace-nowrap">Miễn NVQS</span>;
      default:
        return null;
    }
  };

  const renderTableHead = () => {
    switch (activeTabId) {
        case 'PRE_CHECK':
            return (
                <tr>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">STT</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Họ tên & Ngày sinh</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">SĐT / Địa chỉ</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Đánh giá Sơ khám</th>
                    {!isViewer && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Thao tác</th>}
                </tr>
            );
        case 'MED_EXAM':
            return (
                <tr>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">STT</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Họ tên & Ngày sinh</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Thể trạng (BMI)</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Kết quả Khám tuyển</th>
                    {!isViewer && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Thao tác</th>}
                </tr>
            );
        case 'FINAL':
            return (
                <tr>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">STT</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Công dân</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Trình độ / SK</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Đơn vị & Lệnh gọi</th>
                    {!isViewer && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Tác vụ</th>}
                </tr>
            );
        default: // ALL
            return (
                <tr>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">STT</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Họ tên & Ngày sinh</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Địa chỉ</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Học vấn / Nghề</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Trạng thái</th>
                    {!isViewer && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Thao tác</th>}
                </tr>
            );
    }
  };

  const renderRow = (recruit: Recruit, index: number) => {
      // Common Cells
      const infoCell = (
          <div>
            <div className="font-bold text-gray-900">{recruit.fullName}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar size={10}/> {recruit.dob.split('-').reverse().join('/')}
                <span className="text-gray-300">|</span> 
                {sessionYear - parseInt(recruit.dob.split('-')[0])} tuổi
            </div>
            <div className="text-xs font-mono text-gray-400">{recruit.citizenId}</div>
          </div>
      );

      const addressCell = (
          <div className="text-sm">
             <div className="text-gray-900 font-medium">{recruit.address.village}</div>
             <div className="text-xs text-gray-500">{recruit.address.commune}, {recruit.address.province}</div>
             {recruit.phoneNumber && <div className="text-xs text-blue-600 font-mono mt-1">Tel: {recruit.phoneNumber}</div>}
          </div>
      );

      // TAB SPECIFIC ROWS
      if (activeTabId === 'PRE_CHECK') {
          return (
            <tr key={recruit.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                <td className="p-4 text-center text-gray-500 font-mono text-xs">{index + 1}</td>
                <td className="p-4">{infoCell}</td>
                <td className="p-4">{addressCell}</td>
                <td className="p-4 text-center">
                    {recruit.status === RecruitmentStatus.SOURCE ? (
                         <div className="flex justify-center gap-2">
                             <button 
                                onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.PRE_CHECK_PASSED)}
                                className="px-3 py-1 bg-white border border-green-500 text-green-600 rounded hover:bg-green-50 text-xs font-bold flex items-center gap-1"
                                disabled={isViewer}
                             >
                                <CheckCircle2 size={14}/> Đạt
                             </button>
                             <button 
                                onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.PRE_CHECK_FAILED)}
                                className="px-3 py-1 bg-white border border-red-500 text-red-600 rounded hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                                disabled={isViewer}
                             >
                                <XCircle size={14}/> Không
                             </button>
                         </div>
                    ) : (
                         getStatusBadge(recruit)
                    )}
                </td>
                {!isViewer && (
                    <td className="p-4 text-center">
                        <button onClick={() => handleEdit(recruit)} className="text-gray-400 hover:text-military-600 p-2"><FileEdit size={16} /></button>
                    </td>
                )}
            </tr>
          );
      }

      if (activeTabId === 'MED_EXAM') {
        const bmiColor = recruit.physical.bmi < 18.0 || recruit.physical.bmi > 29.9 ? 'text-red-600' : 'text-green-600';
        return (
          <tr key={recruit.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
              <td className="p-4 text-center text-gray-500 font-mono text-xs">{index + 1}</td>
              <td className="p-4">{infoCell}</td>
              <td className="p-4 text-sm">
                   <div className="font-bold">{recruit.physical.height}cm / {recruit.physical.weight}kg</div>
                   <div className={`text-xs font-bold ${bmiColor}`}>BMI: {recruit.physical.bmi || '--'}</div>
              </td>
              <td className="p-4 text-center">
                   {recruit.status === RecruitmentStatus.PRE_CHECK_PASSED ? (
                       <div className="flex flex-col items-center gap-2">
                           <div className="flex gap-2">
                                <button 
                                    onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.MED_EXAM_PASSED)}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-bold shadow-sm"
                                    disabled={isViewer}
                                >
                                    Đủ ĐK Sức khỏe
                                </button>
                                <button 
                                    onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.MED_EXAM_FAILED)}
                                    className="px-3 py-1 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 text-xs font-bold"
                                    disabled={isViewer}
                                >
                                    Loại
                                </button>
                           </div>
                           <span className="text-[10px] text-gray-400 italic">Vui lòng cập nhật Loại SK trong chi tiết</span>
                       </div>
                   ) : (
                       // Allow toggling result if already set (Pass/Fail)
                       [RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED].includes(recruit.status) && !isViewer ? (
                           <div 
                                onClick={(e) => toggleMedExamResult(e, recruit)}
                                className="cursor-pointer hover:opacity-80 transition-opacity relative group inline-block"
                                title="Bấm để thay đổi kết quả (Thực tế đơn vị)"
                           >
                               {getStatusBadge(recruit)}
                               <div className="absolute -top-2 -right-3 text-military-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-sm border border-military-100 p-0.5">
                                   <Edit3 size={10} />
                               </div>
                           </div>
                       ) : (
                           getStatusBadge(recruit)
                       )
                   )}
              </td>
              {!isViewer && (
                <td className="p-4 text-center">
                    <button onClick={() => handleEdit(recruit)} className="text-gray-400 hover:text-military-600 p-2"><FileEdit size={16} /></button>
                </td>
               )}
          </tr>
        );
      }

      if (activeTabId === 'FINAL') {
          return (
            <tr key={recruit.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 bg-green-50/10">
                <td className="p-4 text-center text-gray-500 font-mono text-xs">{index + 1}</td>
                <td className="p-4">{infoCell}</td>
                <td className="p-4">
                     <div className="text-sm font-bold text-gray-800">{recruit.details.education}</div>
                     <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 border">{recruit.physical.healthGrade ? `Loại ${recruit.physical.healthGrade}` : 'Chưa PL'}</span>
                         {recruit.details.politicalStatus === 'Dang_Vien' && <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-bold border border-red-200">Đảng viên</span>}
                     </div>
                </td>
                <td className="p-4 text-center">
                     <button 
                        onClick={(e) => toggleFinalization(e, recruit)}
                        className={`px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-2 mx-auto w-32 justify-center
                            ${recruit.status === RecruitmentStatus.FINALIZED 
                                ? 'bg-green-600 text-white hover:bg-green-700 ring-2 ring-green-200' 
                                : 'bg-white border border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600'
                            }`}
                        disabled={isViewer}
                     >
                         {recruit.status === RecruitmentStatus.FINALIZED ? <><CheckCircle2 size={14}/> Đã chốt</> : 'Chốt lệnh'}
                     </button>
                </td>
                {!isViewer && (
                    <td className="p-4 text-center">
                        <button onClick={() => handleEdit(recruit)} className="text-gray-400 hover:text-military-600 p-2"><FileEdit size={16} /></button>
                    </td>
                )}
            </tr>
          );
      }

      // Default ALL view
      return (
        <tr key={recruit.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 group">
          <td className="p-4 text-center text-gray-500 font-mono text-xs">{index + 1}</td>
          <td className="p-4 cursor-pointer" onClick={() => handleEdit(recruit)}>
            <div className="font-bold text-military-700 group-hover:text-military-900 transition-colors">{recruit.fullName}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar size={10}/> {recruit.dob.split('-').reverse().join('/')}
                <span className="text-gray-300">|</span> 
                {sessionYear - parseInt(recruit.dob.split('-')[0])} tuổi
            </div>
          </td>
          <td className="p-4">{addressCell}</td>
          <td className="p-4">
             <div className="text-sm font-medium">{recruit.details.education}</div>
             <div className="text-xs text-gray-500">{recruit.details.job}</div>
          </td>
          <td className="p-4 text-center">
             {getStatusBadge(recruit)}
             {recruit.defermentReason && (
                 <div className="text-[10px] text-amber-600 mt-1 max-w-[120px] mx-auto truncate" title={recruit.defermentReason}>
                     ({recruit.defermentReason})
                 </div>
             )}
          </td>
          {!isViewer && (
            <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        title="Tạm hoãn nguồn"
                        onClick={(e) => openSourceDefermentModal(e, recruit)}
                        className={`p-1.5 rounded hover:bg-amber-50 transition-colors ${recruit.status === RecruitmentStatus.DEFERRED ? 'text-amber-600 bg-amber-50' : 'text-gray-400 hover:text-amber-600'}`}
                    >
                        <PauseCircle size={16} />
                    </button>
                    <button 
                        title="Sửa"
                        onClick={() => handleEdit(recruit)} 
                        className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                        <FileEdit size={16} />
                    </button>
                    <button 
                        title="Xóa"
                        onClick={(e) => { e.stopPropagation(); onDelete(recruit.id); }} 
                        className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
          )}
        </tr>
      );
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0">
          {TABS.map(tab => {
              const isActive = activeTabId === tab.id;
              const Icon = tab.icon;
              return (
                <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                        ${isActive 
                            ? `${tab.color} text-white shadow-md ring-2 ring-offset-1 ring-gray-200` 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                        }
                    `}
                >
                    <Icon size={16} /> {tab.label}
                </button>
              );
          })}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {!isViewer && activeTabId === 'ALL' && (
            <button
                onClick={() => { setEditingRecruit(undefined); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-military-600 text-white rounded-lg hover:bg-military-700 shadow-md font-bold text-sm transition-transform active:scale-95 w-full md:w-auto justify-center"
            >
                <Plus size={18} /> Bổ sung nguồn
            </button>
          )}
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 w-full">
                {/* Search */}
                <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Tìm kiếm</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tên, số CCCD..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-military-500 focus:border-transparent"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                </div>

                {/* Village Filter - Manual Input (UPDATED) */}
                <div className="md:col-span-1">
                     <label className="block text-xs font-bold text-gray-500 mb-1">Thôn / Ấp</label>
                     <input
                         type="text"
                         placeholder="Nhập tên thôn/ấp..."
                         className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-military-500 focus:border-transparent"
                         value={filters.village}
                         onChange={(e) => setFilters(prev => ({...prev, village: e.target.value}))}
                     />
                </div>

                {/* Age Filter (UPDATED) */}
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Độ tuổi ({sessionYear})</label>
                    <select
                        className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700"
                        value={filters.age}
                        onChange={(e) => setFilters(prev => ({...prev, age: e.target.value}))}
                    >
                        <option value="">-- Tất cả --</option>
                        <option value="UNDER_18" className="font-bold text-red-600">Dưới 18 tuổi</option>
                        {AGE_OPTIONS.map(age => (
                             <option key={age} value={age}>{age} tuổi (Sinh {sessionYear - age})</option>
                        ))}
                    </select>
                </div>

                {/* Commune Filter (Admin Only) */}
                {isAdmin && (
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Xã / Phường</label>
                        <select
                            className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700"
                            value={filters.commune}
                            onChange={(e) => setFilters(prev => ({...prev, commune: e.target.value}))}
                        >
                            <option value="">-- Tất cả --</option>
                            {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                )}

                <div className="md:col-span-1 flex items-end">
                    <button 
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`w-full py-2 px-3 rounded text-sm font-bold border transition-colors flex items-center justify-center gap-1 ${showAdvancedFilters ? 'bg-military-50 border-military-300 text-military-700' : 'bg-gray-50 border-gray-300 text-gray-600'}`}
                    >
                        <Filter size={14}/> {showAdvancedFilters ? 'Thu gọn' : 'Bộ lọc khác'}
                    </button>
                </div>
            </div>
            
            <div className="shrink-0 mb-0.5">
                 <button 
                    onClick={resetFilters}
                    className="p-2 text-gray-400 hover:text-military-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Đặt lại bộ lọc"
                 >
                    <RefreshCw size={18} />
                 </button>
            </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Trình độ văn hóa</label>
                    <select
                        className="w-full border border-gray-300 rounded p-1.5 text-sm"
                        value={filters.education}
                        onChange={(e) => setFilters(prev => ({...prev, education: e.target.value}))}
                    >
                        <option value="">-- Tất cả --</option>
                        {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Dân tộc</label>
                    <select
                        className="w-full border border-gray-300 rounded p-1.5 text-sm"
                        value={filters.ethnicity}
                        onChange={(e) => setFilters(prev => ({...prev, ethnicity: e.target.value}))}
                    >
                        <option value="">-- Tất cả --</option>
                        {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Tôn giáo</label>
                    <select
                        className="w-full border border-gray-300 rounded p-1.5 text-sm"
                        value={filters.religion}
                        onChange={(e) => setFilters(prev => ({...prev, religion: e.target.value}))}
                    >
                        <option value="">-- Tất cả --</option>
                        {RELIGIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Hôn nhân</label>
                    <select
                        className="w-full border border-gray-300 rounded p-1.5 text-sm"
                        value={filters.maritalStatus}
                        onChange={(e) => setFilters(prev => ({...prev, maritalStatus: e.target.value}))}
                    >
                        <option value="">-- Tất cả --</option>
                        {MARITAL_STATUSES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                 </div>
            </div>
        )}
      </div>

      {/* 3. Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredRecruits.length === 0 ? (
             <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                 <ShieldOff size={48} className="mb-3 opacity-20"/>
                 <p className="text-lg font-medium">Không tìm thấy dữ liệu</p>
                 <p className="text-sm">Vui lòng thử lại với bộ lọc khác</p>
                 <button onClick={resetFilters} className="mt-4 text-military-600 font-bold hover:underline">Xóa bộ lọc</button>
             </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs sticky top-0 z-10">
                        {renderTableHead()}
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredRecruits.map((recruit, index) => renderRow(recruit, index))}
                    </tbody>
                </table>
            </div>
        )}
        
        {/* Footer Stats */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 text-xs text-gray-500 flex justify-between items-center">
             <span>Hiển thị <strong>{filteredRecruits.length}</strong> / <strong>{recruits.length}</strong> hồ sơ</span>
             <span className="italic">Dữ liệu năm {sessionYear}</span>
        </div>
      </div>

      {/* MODAL: Recruit Form */}
      {showForm && (
        <RecruitForm 
            initialData={editingRecruit}
            user={user}
            onSubmit={(data) => {
                onUpdate(data);
                setShowForm(false);
            }}
            onClose={() => setShowForm(false)}
            sessionYear={sessionYear}
        />
      )}

      {/* MODAL: Deferment Reason */}
      {showDefermentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
                  <h3 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-2">
                      <PauseCircle /> Tạm hoãn nguồn
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                      Vui lòng chọn lý do tạm hoãn cho công dân <strong>{selectedDefermentRecruit?.fullName}</strong>:
                  </p>
                  
                  <div className="space-y-2 mb-6">
                      {SOURCE_DEFERMENT_REASONS.map(reason => (
                          <label key={reason} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-amber-50 transition-colors">
                              <input 
                                  type="radio" 
                                  name="deferReason" 
                                  className="text-amber-600 focus:ring-amber-500"
                                  checked={selectedDefermentReason === reason}
                                  onChange={() => setSelectedDefermentReason(reason)}
                              />
                              <span className="text-sm font-medium text-gray-800">{reason}</span>
                          </label>
                      ))}
                  </div>

                  <div className="flex justify-end gap-3">
                      <button 
                          onClick={() => setShowDefermentModal(false)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-bold"
                      >
                          Hủy
                      </button>
                      <button 
                          onClick={confirmSourceDeferment}
                          className="px-4 py-2 bg-amber-600 text-white rounded font-bold hover:bg-amber-700"
                      >
                          Xác nhận
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default RecruitManagement;