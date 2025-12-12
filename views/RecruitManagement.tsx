
import React, { useState, useMemo, useEffect } from 'react';
import { Recruit, RecruitmentStatus, User } from '../types';
import { EDUCATIONS, GET_ALL_COMMUNES, LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS, LOW_EDUCATION_GRADES, ETHNICITIES, RELIGIONS, MARITAL_STATUSES } from '../constants';
import RecruitForm from '../components/RecruitForm';
import { 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  FileEdit, 
  Trash2,
  Stethoscope,
  ClipboardList,
  RefreshCw,
  Filter,
  ShieldOff,
  Tent,
  Calendar,
  PauseCircle,
  Users,
  FileSignature,
  Edit3,
  UserX,
  RotateCcw,
  Lock,
  Flag,
  Send,
  CornerUpLeft,
  ChevronRight,
  Layers,
  ShieldCheck,
  Baby,
  Activity,
  Star
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
      label: 'Toàn bộ nguồn (18+)', 
      status: null, 
      color: 'bg-gray-600', 
      borderColor: 'border-gray-600', 
      textColor: 'text-gray-700',
      icon: Users 
  },
  { 
      id: 'UNDER_18', 
      label: 'Chưa đủ 18 tuổi', 
      status: null, // Custom Logic
      color: 'bg-pink-600', 
      borderColor: 'border-pink-600', 
      textColor: 'text-pink-700',
      icon: Baby 
  },
  { 
      id: 'PRE_CHECK', 
      label: 'DS Đủ ĐK Sơ tuyển', 
      status: [
          RecruitmentStatus.SOURCE, 
          RecruitmentStatus.PRE_CHECK_PASSED, 
          // Removed PRE_CHECK_FAILED (Moved to separate list)
          RecruitmentStatus.MED_EXAM_PASSED,
          RecruitmentStatus.MED_EXAM_FAILED,
          RecruitmentStatus.FINALIZED,
          RecruitmentStatus.ENLISTED
          // EXEMPTED & DEFERRED are automatically excluded because they are not in this list
      ], 
      color: 'bg-blue-600', 
      borderColor: 'border-blue-600',
      textColor: 'text-blue-700',
      icon: ClipboardList
  },
  { 
      id: 'MED_EXAM', 
      label: 'DS Đủ ĐK Khám tuyển', 
      status: [
          RecruitmentStatus.PRE_CHECK_PASSED, 
          RecruitmentStatus.MED_EXAM_PASSED, 
          // Removed MED_EXAM_FAILED (Moved to separate list)
          RecruitmentStatus.FINALIZED,
          RecruitmentStatus.ENLISTED
      ], 
      color: 'bg-indigo-600', 
      borderColor: 'border-indigo-600',
      textColor: 'text-indigo-700',
      icon: Stethoscope
  },
  { 
      id: 'FINAL', 
      label: 'DS Đủ ĐK Nhập ngũ', 
      status: [
          RecruitmentStatus.MED_EXAM_PASSED, 
          RecruitmentStatus.FINALIZED,
          RecruitmentStatus.ENLISTED 
      ], 
      color: 'bg-green-600', 
      borderColor: 'border-green-600',
      textColor: 'text-green-700',
      icon: FileSignature
  },
  { 
      id: 'ENLISTED', 
      label: 'Danh sách nhập ngũ', 
      status: [
          RecruitmentStatus.ENLISTED
      ], 
      color: 'bg-red-600', 
      borderColor: 'border-red-600',
      textColor: 'text-red-700',
      icon: Flag
  },
  { 
    id: 'DEFERRED_LIST', 
    label: 'DS Tạm hoãn (Nguồn)', 
    status: [
        RecruitmentStatus.DEFERRED
    ], 
    color: 'bg-amber-600', 
    borderColor: 'border-amber-600',
    textColor: 'text-amber-700',
    icon: PauseCircle
  },
  { 
    id: 'POST_PRE_CHECK_DEFERRED', 
    label: 'Tạm hoãn (Sơ tuyển)', 
    status: [
        RecruitmentStatus.PRE_CHECK_FAILED
    ], 
    color: 'bg-orange-600', 
    borderColor: 'border-orange-600',
    textColor: 'text-orange-700',
    icon: Activity
  },
  { 
    id: 'POST_MED_EXAM_DEFERRED', 
    label: 'Tạm hoãn (Khám tuyển)', 
    status: [
        RecruitmentStatus.MED_EXAM_FAILED
    ], 
    color: 'bg-red-500', 
    borderColor: 'border-red-500',
    textColor: 'text-red-600',
    icon: Activity
  },
  { 
    id: 'EXEMPTED_LIST', 
    label: 'Danh sách Miễn', 
    status: [
        RecruitmentStatus.EXEMPTED
    ], 
    color: 'bg-purple-600', 
    borderColor: 'border-purple-600',
    textColor: 'text-purple-700',
    icon: ShieldCheck
  },
  { 
    id: 'REMAINING', 
    label: 'Nguồn còn lại', 
    status: [
        RecruitmentStatus.SOURCE,
        RecruitmentStatus.PRE_CHECK_PASSED,
        RecruitmentStatus.PRE_CHECK_FAILED,
        RecruitmentStatus.MED_EXAM_PASSED,
        RecruitmentStatus.MED_EXAM_FAILED,
        RecruitmentStatus.FINALIZED,
        RecruitmentStatus.DEFERRED,
        RecruitmentStatus.EXEMPTED
        // Tất cả trừ ENLISTED và REMOVED_FROM_SOURCE
    ], 
    color: 'bg-teal-600', 
    borderColor: 'border-teal-600',
    textColor: 'text-teal-700',
    icon: Layers
  },
  { 
    id: 'REMOVED', 
    label: 'DS Loại khỏi nguồn', 
    status: [
        RecruitmentStatus.REMOVED_FROM_SOURCE
    ], 
    color: 'bg-gray-600', 
    borderColor: 'border-gray-600',
    textColor: 'text-gray-700',
    icon: UserX
  },
];

const RecruitManagement: React.FC<RecruitManagementProps> = ({ recruits, user, onUpdate, onDelete, initialTab = 'ALL', onTabChange, sessionYear }) => {
  const isAdmin = user.role === 'ADMIN';
  // Check if User is locked or is just a viewer
  const isReadOnly = user.role === 'VIEWER' || !!user.isLocked;

  const [activeTabId, setActiveTabId] = useState(initialTab);
  const [showForm, setShowForm] = useState(false);
  const [editingRecruit, setEditingRecruit] = useState<Recruit | undefined>(undefined);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // State for Exception Modal (Deferment & Exemption)
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [targetExceptionStatus, setTargetExceptionStatus] = useState<RecruitmentStatus | null>(null);
  const [selectedExceptionRecruit, setSelectedExceptionRecruit] = useState<Recruit | null>(null);
  const [selectedExceptionReason, setSelectedExceptionReason] = useState('');
  const [customExceptionReason, setCustomExceptionReason] = useState('');

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

  // --- LOGIC MỚI: Tính tổng số hồ sơ THỰC TẾ của năm hiện tại và đơn vị hiện tại (Mẫu số) ---
  const totalRelevantRecruits = useMemo(() => {
      return recruits.filter(r => {
          // 1. Phải thuộc năm tuyển quân đang chọn
          if (r.recruitmentYear !== sessionYear) return false;
          // 2. Phải thuộc đơn vị quản lý (nếu không phải Admin)
          if (!isAdmin && r.address.commune !== user.unit.commune) return false;
          return true;
      }).length;
  }, [recruits, sessionYear, isAdmin, user]);

  const filteredRecruits = useMemo(() => {
    let result = recruits;
    
    // 1. DATA ACCESS CONTROL (PERMISSION)
    if (!isAdmin) {
        // If not admin, FORCE filter by the user's commune
        result = result.filter(r => r.address.commune === user.unit.commune);
    } 

    // 2. Tab filtering logic
    const currentTab = TABS.find(t => t.id === activeTabId);
    
    if (activeTabId === 'UNDER_18') {
        // Chỉ lấy những người dưới 18 tuổi (tính theo năm)
        result = result.filter(r => {
            const birthYear = parseInt(r.dob.split('-')[0]);
            return (sessionYear - birthYear) < 18 && r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE;
        });
    } else if (activeTabId === 'ALL') {
        // Toàn bộ nguồn nhưng PHẢI >= 18 tuổi
        result = result.filter(r => {
            const birthYear = parseInt(r.dob.split('-')[0]);
            return (sessionYear - birthYear) >= 18 && r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE;
        });
    } else if (currentTab?.status) {
        // Các tab khác lọc theo Status như bình thường
        result = result.filter(r => currentTab.status && currentTab.status.includes(r.status));

        // TÙY CHỈNH: Tab "DS Đủ ĐK Sơ tuyển" (PRE_CHECK) phải lọc bỏ người dưới 18 tuổi
        if (activeTabId === 'PRE_CHECK') {
            result = result.filter(r => {
                const birthYear = parseInt(r.dob.split('-')[0]);
                return (sessionYear - birthYear) >= 18;
            });
        }
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
    // Read only cannot edit
    if (isReadOnly) return;
    setEditingRecruit(recruit);
    setShowForm(true);
  };

  const handleStatusChange = (e: React.MouseEvent, recruit: Recruit, newStatus: RecruitmentStatus, enlistmentType?: 'OFFICIAL' | 'RESERVE') => {
    e.stopPropagation(); // Prevent row click
    if (isReadOnly) return; // Read Only cannot change status
    
    // Validation: Low Education Check for Pre-Check
    if (newStatus === RecruitmentStatus.PRE_CHECK_PASSED && LOW_EDUCATION_GRADES.includes(recruit.details.education)) {
        alert(`Công dân có trình độ văn hóa ${recruit.details.education} (Dưới lớp 8) không đủ điều kiện tham gia Sơ khám.`);
        return;
    }

    // Logic: Nếu chuyển sang "Không đạt sơ khám" hoặc "Không đạt khám tuyển", BẮT BUỘC nhập lý do
    if (newStatus === RecruitmentStatus.PRE_CHECK_FAILED || newStatus === RecruitmentStatus.MED_EXAM_FAILED) {
        const reason = window.prompt("Vui lòng nhập lý do KHÔNG ĐẠT (Ví dụ: Cận thị, Xăm hình, Viêm gan B...):");
        
        // Nếu người dùng bấm Cancel hoặc để trống
        if (reason === null) return; 
        if (reason.trim() === "") {
            alert("Bạn phải nhập lý do không đạt để tiếp tục!");
            return;
        }

        // Reset enlistment unit, save reason
        const updated = {
            ...recruit,
            status: newStatus,
            defermentReason: reason, // Lưu lý do không đạt vào trường này
            enlistmentUnit: undefined,
            enlistmentDate: undefined,
            enlistmentType: undefined
        };
        onUpdate(updated);
        return;
    }

    const updated = { ...recruit, status: newStatus };
    
    // Handle Enlistment Type
    if (newStatus === RecruitmentStatus.ENLISTED && enlistmentType) {
        updated.enlistmentType = enlistmentType;
    } else if (newStatus !== RecruitmentStatus.ENLISTED) {
        updated.enlistmentType = undefined; // Reset if moving out of enlisted
    }
    
    // Clean up reason if not relevant (nếu đạt thì xóa lý do cũ)
    if (newStatus !== RecruitmentStatus.DEFERRED && newStatus !== RecruitmentStatus.EXEMPTED && newStatus !== RecruitmentStatus.REMOVED_FROM_SOURCE) {
        updated.defermentReason = '';
    }
    // Clean up unit if not finalized
    if (newStatus !== RecruitmentStatus.FINALIZED && newStatus !== RecruitmentStatus.ENLISTED) {
        updated.enlistmentUnit = undefined;
        updated.enlistmentDate = undefined;
    }

    onUpdate(updated);
  };

  // Soft Delete Handler (Move to Removed List)
  const handleSoftDelete = (e: React.MouseEvent, recruit: Recruit) => {
      e.stopPropagation();
      if (isReadOnly) return;
      
      // Yêu cầu nhập lý do khi loại khỏi nguồn
      const reason = window.prompt(`Nhập lý do loại công dân ${recruit.fullName} khỏi nguồn:`);
      
      // Nếu user bấm Cancel (reason === null), hủy thao tác
      if (reason === null) return;

      const updated: Recruit = {
          ...recruit,
          status: RecruitmentStatus.REMOVED_FROM_SOURCE,
          defermentReason: reason || 'Không có lý do cụ thể' // Lưu lý do vào defermentReason
      };
      
      onUpdate(updated);
  };

  // Permanent Delete Handler (Actually delete)
  const handlePermanentDelete = (e: React.MouseEvent, recruitId: string) => {
      e.stopPropagation();
      if (isReadOnly) return;
      
      // Hỏi xác nhận kỹ vì xóa thật
      if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa VĨNH VIỄN hồ sơ này không?\nHành động này không thể hoàn tác.")) {
          onDelete(recruitId);
      }
  };

  // Restore Handler (Move back to Source)
  const handleRestore = (e: React.MouseEvent, recruit: Recruit) => {
      e.stopPropagation();
      if (isReadOnly) return;
      
      // Trực tiếp khôi phục không cần hỏi lại để thao tác nhanh
      const updated: Recruit = { 
          ...recruit, 
          status: RecruitmentStatus.SOURCE,
          defermentReason: '', // Clear reason
          enlistmentUnit: undefined, // Clear unit if any
          enlistmentDate: undefined,
          enlistmentType: undefined
      };
      onUpdate(updated);
  };

  // NEW: Toggle Med Exam Result directly (Passed <-> Failed)
  const toggleMedExamResult = (e: React.MouseEvent, recruit: Recruit) => {
      e.stopPropagation();
      if (isReadOnly) return;
      
      let newStatus: RecruitmentStatus;
      if (recruit.status === RecruitmentStatus.MED_EXAM_PASSED) {
          // Từ Đạt -> Không đạt (Cần lý do)
          handleStatusChange(e, recruit, RecruitmentStatus.MED_EXAM_FAILED);
          return;
      } else if (recruit.status === RecruitmentStatus.MED_EXAM_FAILED) {
          newStatus = RecruitmentStatus.MED_EXAM_PASSED;
      } else {
          return;
      }
      
      const updated = { ...recruit, status: newStatus };
      onUpdate(updated);
  };

  const openExceptionModal = (e: React.MouseEvent, recruit: Recruit, status: RecruitmentStatus) => {
      e.stopPropagation();
      if (isReadOnly) return;
      
      // IF already in that status -> Toggle OFF (Un-defer / Un-exempt)
      if (recruit.status === status) {
          const updated = {
              ...recruit,
              status: RecruitmentStatus.SOURCE, // Reset to source
              defermentReason: undefined
          };
          onUpdate(updated);
          return;
      }
      
      // IF not -> Open Modal to Set Reason
      setSelectedExceptionRecruit(recruit);
      setTargetExceptionStatus(status);
      
      // Set default first reason
      const reasonList = status === RecruitmentStatus.DEFERRED ? LEGAL_DEFERMENT_REASONS : LEGAL_EXEMPTION_REASONS;
      setSelectedExceptionReason(reasonList[0]);
      
      setCustomExceptionReason(''); // Reset custom
      setShowExceptionModal(true);
  };

  const confirmExceptionStatus = () => {
      if (!selectedExceptionRecruit || !targetExceptionStatus) return;
      
      const finalReason = selectedExceptionReason.startsWith('Khác') 
          ? (customExceptionReason || 'Lý do khác') 
          : selectedExceptionReason;

      const updated = {
          ...selectedExceptionRecruit,
          status: targetExceptionStatus,
          defermentReason: finalReason
      };
      onUpdate(updated);
      setShowExceptionModal(false);
      setSelectedExceptionRecruit(null);
      setTargetExceptionStatus(null);
  };

  const getStatusBadge = (recruit: Recruit) => {
    switch (recruit.status) {
      case RecruitmentStatus.SOURCE:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-900 border border-gray-300 whitespace-nowrap">Nguồn</span>;
      case RecruitmentStatus.PRE_CHECK_PASSED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 whitespace-nowrap">Đạt sơ khám</span>;
      case RecruitmentStatus.PRE_CHECK_FAILED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300 whitespace-nowrap">Tạm hoãn (Sơ tuyển)</span>;
      case RecruitmentStatus.MED_EXAM_PASSED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 whitespace-nowrap">Đủ điều kiện</span>;
      case RecruitmentStatus.MED_EXAM_FAILED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300 whitespace-nowrap">Tạm hoãn (Khám tuyển)</span>;
      case RecruitmentStatus.FINALIZED:
        return (
            <div className="flex flex-col items-start gap-1">
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-300 whitespace-nowrap">Đã niêm yết</span>
            </div>
        );
      case RecruitmentStatus.ENLISTED:
        return (
            <div className="flex flex-col items-start gap-1">
                <span className={`px-2 py-1 rounded-full text-xs font-bold border whitespace-nowrap flex items-center gap-1 ${recruit.enlistmentType === 'RESERVE' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                    <Flag size={10} fill="currentColor"/> 
                    {recruit.enlistmentType === 'RESERVE' ? 'NHẬP NGŨ (DỰ BỊ)' : 'NHẬP NGŨ (CHÍNH THỨC)'}
                </span>
                {recruit.enlistmentUnit && <span className="text-xs font-bold text-green-700 flex items-center gap-1"><Tent size={10}/> {recruit.enlistmentUnit}</span>}
            </div>
        );
      case RecruitmentStatus.DEFERRED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">Tạm hoãn</span>;
      case RecruitmentStatus.EXEMPTED:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 whitespace-nowrap">Miễn NVQS</span>;
      case RecruitmentStatus.REMOVED_FROM_SOURCE:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-600 text-white border border-gray-700 whitespace-nowrap">Đã loại</span>;
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
                    <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Đánh giá Sơ tuyển</th>
                    {!isReadOnly && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Thao tác</th>}
                </tr>
            );
        case 'MED_EXAM':
            return (
                <tr>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">STT</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Họ tên & Ngày sinh</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Thể trạng (BMI)</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Kết quả Khám tuyển</th>
                    {!isReadOnly && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Thao tác</th>}
                </tr>
            );
        case 'FINAL':
            return (
                <tr>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">STT</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Công dân</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Trình độ / SK</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Tình trạng niêm yết</th>
                    {!isReadOnly && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">QUYẾT ĐỊNH NHẬP NGŨ</th>}
                </tr>
            );
        case 'ENLISTED':
            return (
                <tr>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">STT</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Công dân nhập ngũ</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Thông tin chi tiết</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Đơn vị & Thời gian</th>
                    {!isReadOnly && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Tác vụ</th>}
                </tr>
            );
        case 'REMOVED':
            return (
                <tr>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">STT</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Họ tên & Ngày sinh</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Địa chỉ</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Lý do loại</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Trạng thái</th>
                    {!isReadOnly && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">HÀNH ĐỘNG</th>}
                </tr>
            );
        case 'DEFERRED_LIST':
        case 'POST_PRE_CHECK_DEFERRED':
        case 'POST_MED_EXAM_DEFERRED':
            return (
                <tr>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">STT</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Họ tên & Ngày sinh</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Địa chỉ</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Lý do Tạm hoãn</th>
                    {!isReadOnly && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Tác vụ</th>}
                </tr>
            );
        case 'EXEMPTED_LIST':
            return (
                <tr>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">STT</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Họ tên & Ngày sinh</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Địa chỉ</th>
                    <th className="p-4 font-bold text-sm border-b border-gray-200 whitespace-nowrap">Lý do Miễn</th>
                    {!isReadOnly && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Tác vụ</th>}
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
                    {!isReadOnly && <th className="p-4 font-bold text-sm border-b border-gray-200 text-center whitespace-nowrap">Thao tác</th>}
                </tr>
            );
    }
  };

  const renderRow = (recruit: Recruit, index: number) => {
      // Common Cells
      // ... (infoCell, addressCell logic remains the same)
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

      // Removed List Tab
      if (activeTabId === 'REMOVED') {
          return (
             <tr key={recruit.id} className="hover:bg-red-50/50 transition-colors border-b border-gray-100 bg-gray-50 opacity-80">
                 <td className="p-4 text-center text-gray-500 font-mono text-xs">{index + 1}</td>
                 <td className="p-4">{infoCell}</td>
                 <td className="p-4">{addressCell}</td>
                 <td className="p-4">
                     <span className="text-sm font-medium text-red-800">{recruit.defermentReason}</span>
                 </td>
                 <td className="p-4 text-center">{getStatusBadge(recruit)}</td>
                 {!isReadOnly && (
                     <td className="p-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                             <button 
                                onClick={(e) => handleRestore(e, recruit)}
                                className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded hover:bg-green-700 shadow-sm flex items-center gap-1 transition-colors"
                                title="Bổ sung lại vào nguồn"
                             >
                                 <RotateCcw size={14}/> Bổ sung nguồn
                             </button>
                             <button 
                                onClick={(e) => handlePermanentDelete(e, recruit.id)}
                                className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700 shadow-sm flex items-center gap-1 transition-colors"
                                title="Xóa vĩnh viễn khỏi hệ thống"
                             >
                                 <Trash2 size={14}/> Xóa vĩnh viễn
                             </button>
                         </div>
                     </td>
                 )}
             </tr>
          )
      }

      // Deferred List Tabs (Shared Logic for all 3 deferred types)
      if (['DEFERRED_LIST', 'POST_PRE_CHECK_DEFERRED', 'POST_MED_EXAM_DEFERRED'].includes(activeTabId || '')) {
          let bgClass = "bg-amber-50/20 hover:bg-amber-50/50";
          let textClass = "text-amber-700";
          
          if (activeTabId === 'POST_PRE_CHECK_DEFERRED') {
              bgClass = "bg-orange-50/20 hover:bg-orange-50/50";
              textClass = "text-orange-700";
          } else if (activeTabId === 'POST_MED_EXAM_DEFERRED') {
              bgClass = "bg-red-50/20 hover:bg-red-50/50";
              textClass = "text-red-700";
          }

          return (
             <tr key={recruit.id} className={`${bgClass} transition-colors border-b border-gray-100`}>
                 <td className="p-4 text-center text-gray-500 font-mono text-xs">{index + 1}</td>
                 <td className="p-4">{infoCell}</td>
                 <td className="p-4">{addressCell}</td>
                 <td className="p-4">
                     <div className={`text-sm font-bold ${textClass} whitespace-pre-wrap`}>{recruit.defermentReason}</div>
                 </td>
                 {!isReadOnly && (
                     <td className="p-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                             <button 
                                onClick={(e) => handleRestore(e, recruit)}
                                className="px-3 py-1.5 text-xs font-bold bg-white text-gray-600 border border-gray-300 rounded hover:bg-gray-100 shadow-sm flex items-center gap-1 transition-colors"
                                title="Hủy tạm hoãn (Đưa về nguồn)"
                             >
                                 <RotateCcw size={14}/> Hủy tạm hoãn
                             </button>
                             <button onClick={() => handleEdit(recruit)} className="text-gray-400 hover:text-military-600 p-2"><FileEdit size={16} /></button>
                         </div>
                     </td>
                 )}
             </tr>
          )
      }

      // Exempted List Tab
      if (activeTabId === 'EXEMPTED_LIST') {
          return (
             <tr key={recruit.id} className="hover:bg-purple-50/50 transition-colors border-b border-gray-100 bg-purple-50/20">
                 <td className="p-4 text-center text-gray-500 font-mono text-xs">{index + 1}</td>
                 <td className="p-4">{infoCell}</td>
                 <td className="p-4">{addressCell}</td>
                 <td className="p-4">
                     <div className="text-sm font-bold text-purple-700 whitespace-pre-wrap">{recruit.defermentReason}</div>
                 </td>
                 {!isReadOnly && (
                     <td className="p-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                             <button 
                                onClick={(e) => handleRestore(e, recruit)}
                                className="px-3 py-1.5 text-xs font-bold bg-white text-gray-600 border border-gray-300 rounded hover:bg-gray-100 shadow-sm flex items-center gap-1 transition-colors"
                                title="Hủy miễn (Đưa về nguồn)"
                             >
                                 <RotateCcw size={14}/> Hủy miễn
                             </button>
                             <button onClick={() => handleEdit(recruit)} className="text-gray-400 hover:text-military-600 p-2"><FileEdit size={16} /></button>
                         </div>
                     </td>
                 )}
             </tr>
          )
      }

      // ... (rest of the renderRow function)
      // TAB SPECIFIC ROWS
      if (activeTabId === 'PRE_CHECK') {
          return (
            <tr key={recruit.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                <td className="p-4 text-center text-gray-500 font-mono text-xs">{index + 1}</td>
                <td className="p-4">{infoCell}</td>
                <td className="p-4">{addressCell}</td>
                <td className="p-4 text-center">
                    {/* Luôn hiển thị nút để có thể thay đổi kết quả Sơ Khám */}
                     <div className="flex flex-col items-center gap-2">
                         <div className="flex justify-center gap-2">
                             <button 
                                onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.PRE_CHECK_PASSED)}
                                className={`px-3 py-1 border rounded text-xs font-bold flex items-center gap-1 transition-all
                                    ${recruit.status === RecruitmentStatus.PRE_CHECK_PASSED || recruit.status === RecruitmentStatus.MED_EXAM_PASSED || recruit.status === RecruitmentStatus.MED_EXAM_FAILED || recruit.status === RecruitmentStatus.FINALIZED || recruit.status === RecruitmentStatus.ENLISTED
                                        ? 'bg-green-600 text-white border-green-600 shadow-md ring-2 ring-green-100' 
                                        : 'bg-white text-gray-400 border-gray-200 hover:border-green-500 hover:text-green-600'
                                    }
                                `}
                                disabled={isReadOnly}
                             >
                                <CheckCircle2 size={14}/> Đạt
                             </button>
                             <button 
                                onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.PRE_CHECK_FAILED)}
                                className={`px-3 py-1 border rounded text-xs font-bold flex items-center gap-1 transition-all
                                    ${recruit.status === RecruitmentStatus.PRE_CHECK_FAILED 
                                        ? 'bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-100' 
                                        : 'bg-white text-gray-400 border-gray-200 hover:border-orange-500 hover:text-orange-600'
                                    }
                                `}
                                disabled={isReadOnly}
                             >
                                <XCircle size={14}/> Không
                             </button>
                         </div>
                     </div>
                </td>
                {!isReadOnly && (
                    <td className="p-4 text-center">
                        <button onClick={() => handleEdit(recruit)} className="text-gray-400 hover:text-military-600 p-2"><FileEdit size={16} /></button>
                    </td>
                )}
            </tr>
          );
      }

      if (activeTabId === 'MED_EXAM') {
        const bmiColor = recruit.physical.bmi < 18.5 || recruit.physical.bmi > 29.9 ? 'text-red-600' : 'text-green-600';
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
                                    disabled={isReadOnly}
                                >
                                    Đủ ĐK Sức khỏe
                                </button>
                                <button 
                                    onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.MED_EXAM_FAILED)}
                                    className="px-3 py-1 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 text-xs font-bold"
                                    disabled={isReadOnly}
                                >
                                    Loại
                                </button>
                           </div>
                           <span className="text-[10px] text-gray-400 italic">Vui lòng cập nhật Loại SK trong chi tiết</span>
                       </div>
                   ) : (
                       // Allow toggling result if already set (Pass/Fail)
                       [RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED].includes(recruit.status) && !isReadOnly ? (
                           <div className="flex flex-col items-center gap-1">
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
                           </div>
                       ) : (
                           getStatusBadge(recruit)
                       )
                   )}
              </td>
              {!isReadOnly && (
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
                     {(recruit.status === RecruitmentStatus.FINALIZED || recruit.status === RecruitmentStatus.ENLISTED) ? (
                         <div className="flex flex-col items-center gap-1">
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-300 whitespace-nowrap flex items-center justify-center gap-1">
                                <CheckCircle2 size={12}/> Đủ điều kiện nhập ngũ
                            </span>
                            {recruit.status === RecruitmentStatus.ENLISTED && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${recruit.enlistmentType === 'RESERVE' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    <Flag size={10} /> Đã phát lệnh ({recruit.enlistmentType === 'RESERVE' ? 'Dự bị' : 'Chính thức'})
                                </span>
                            )}
                         </div>
                     ) : (
                         <button 
                            onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.FINALIZED)}
                            className="px-4 py-1 bg-white border border-green-500 text-green-600 rounded-full hover:bg-green-50 text-xs font-bold shadow-sm transition-colors mx-auto flex items-center gap-1"
                            disabled={isReadOnly}
                         >
                             <FileSignature size={12}/> Niêm yết
                         </button>
                     )}
                </td>
                {!isReadOnly && (
                    <td className="p-4 text-center">
                        {recruit.status === RecruitmentStatus.FINALIZED && (
                            <div className="flex flex-col gap-1 items-center justify-center">
                                <div className="flex gap-2 mb-1">
                                    <button 
                                        onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.ENLISTED, 'OFFICIAL')}
                                        className="px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-bold shadow-md flex items-center gap-1 transition-all animate-in fade-in zoom-in w-28 justify-center"
                                        title="Chốt và Phát lệnh (Chính thức)"
                                    >
                                        <Send size={12} /> CT (Chính thức)
                                    </button>
                                    <button 
                                        onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.MED_EXAM_PASSED)}
                                        className="px-2 py-1.5 bg-gray-100 text-gray-600 border border-gray-300 rounded hover:bg-gray-200 text-xs font-bold flex items-center justify-center transition-all"
                                        title="Hủy niêm yết"
                                    >
                                        <XCircle size={12} />
                                    </button>
                                </div>
                                <button 
                                    onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.ENLISTED, 'RESERVE')}
                                    className="px-2 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 text-xs font-bold shadow-md flex items-center gap-1 transition-all animate-in fade-in zoom-in w-28 justify-center"
                                    title="Chốt và Phát lệnh (Dự bị)"
                                >
                                    <Star size={12} /> DB (Dự bị)
                                </button>
                            </div>
                        )}
                        {recruit.status === RecruitmentStatus.ENLISTED && (
                             <button 
                                onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.FINALIZED)}
                                className="px-3 py-1.5 bg-white text-gray-500 border border-gray-300 rounded hover:bg-gray-50 hover:text-red-600 text-xs font-bold shadow-sm transition-all"
                                title="Hủy lệnh gọi (Giữ lại danh sách niêm yết)"
                            >
                                <CornerUpLeft size={12} /> Hủy lệnh
                            </button>
                        )}
                        {recruit.status === RecruitmentStatus.MED_EXAM_PASSED && (
                            <button onClick={() => handleEdit(recruit)} className="text-gray-400 hover:text-military-600 p-2"><FileEdit size={16} /></button>
                        )}
                    </td>
                )}
            </tr>
          );
      }

      // Enlisted Tab
      if (activeTabId === 'ENLISTED') {
          return (
            <tr key={recruit.id} className="hover:bg-red-50/30 transition-colors border-b border-gray-100 bg-red-50/10">
                <td className="p-4 text-center text-gray-500 font-mono text-xs">{index + 1}</td>
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border border-opacity-50 ${recruit.enlistmentType === 'RESERVE' ? 'bg-amber-100 text-amber-600 border-amber-300' : 'bg-red-100 text-red-600 border-red-300'}`}>
                            {recruit.enlistmentType === 'RESERVE' ? <Star size={14} fill="currentColor"/> : <Flag size={14} fill="currentColor"/>}
                        </div>
                        {infoCell}
                    </div>
                </td>
                <td className="p-4">
                     <div className="text-sm font-bold text-gray-800">{recruit.details.education}</div>
                     <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                         <span>SK Loại {recruit.physical.healthGrade}</span>
                         <span>•</span>
                         <span>{recruit.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : recruit.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng'}</span>
                     </div>
                </td>
                <td className="p-4 text-center">
                     {recruit.enlistmentUnit ? (
                         <div className="flex flex-col items-center gap-1">
                             <span className="text-sm font-bold text-green-700 flex items-center justify-center gap-1 bg-green-50 py-1 px-2 rounded border border-green-200">
                                 <Tent size={14}/> {recruit.enlistmentUnit}
                             </span>
                             {recruit.enlistmentDate && (
                                 <span className="text-xs text-gray-500 italic flex items-center gap-1">
                                     <Calendar size={10} /> {recruit.enlistmentDate.split('-').reverse().join('/')}
                                 </span>
                             )}
                         </div>
                     ) : (
                         <span className="text-xs text-gray-400 italic">Chưa phân đơn vị</span>
                     )}
                </td>
                {!isReadOnly && (
                    <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                            <button onClick={() => handleEdit(recruit)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Sửa thông tin / Đơn vị">
                                <FileEdit size={16} />
                            </button>
                            <button 
                                onClick={(e) => handleStatusChange(e, recruit, RecruitmentStatus.FINALIZED)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
                                title="Hủy nhập ngũ (Quay lại Niêm yết)"
                            >
                                <CornerUpLeft size={16} />
                            </button>
                        </div>
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
          {!isReadOnly && (
            <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        title="Tạm hoãn nguồn"
                        onClick={(e) => openExceptionModal(e, recruit, RecruitmentStatus.DEFERRED)}
                        className={`p-1.5 rounded hover:bg-amber-50 transition-colors ${recruit.status === RecruitmentStatus.DEFERRED ? 'text-amber-600 bg-amber-50' : 'text-gray-400 hover:text-amber-600'}`}
                    >
                        <PauseCircle size={16} />
                    </button>

                    <button 
                        title="Miễn NVQS"
                        onClick={(e) => openExceptionModal(e, recruit, RecruitmentStatus.EXEMPTED)}
                        className={`p-1.5 rounded hover:bg-purple-50 transition-colors ${recruit.status === RecruitmentStatus.EXEMPTED ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:text-purple-600'}`}
                    >
                        <ShieldCheck size={16} />
                    </button>
                    
                    <button 
                        title="Sửa"
                        onClick={() => handleEdit(recruit)} 
                        className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                        <FileEdit size={16} />
                    </button>
                    
                    <button 
                        title="Loại khỏi nguồn"
                        onClick={(e) => handleSoftDelete(e, recruit)} 
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors bg-white border border-red-100 shadow-sm"
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
    // ... (rest of the component JSX remains the same)
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* 0. LOCKED BANNER */}
      {!!user.isLocked && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 shadow-sm mb-4">
              <Lock size={20} className="shrink-0" />
              <div>
                  <p className="font-bold text-sm">Tài khoản đã bị vô hiệu hóa chức năng nhập liệu</p>
                  <p className="text-xs">Bạn chỉ có thể xem dữ liệu. Vui lòng liên hệ Quản trị viên để được mở khóa.</p>
              </div>
          </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
          {/* 1. LEFT SIDEBAR: VERTICAL TABS */}
          <div className="lg:w-64 shrink-0">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 sticky top-4">
                  <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                      {TABS.map(tab => {
                          const isActive = activeTabId === tab.id;
                          const Icon = tab.icon;
                          return (
                              <button
                                  key={tab.id}
                                  onClick={() => handleTabChange(tab.id)}
                                  className={`
                                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap w-full text-left group
                                      ${isActive 
                                          ? `${tab.color} text-white shadow-md` 
                                          : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                      }
                                  `}
                              >
                                  <Icon size={18} className={!isActive ? "text-gray-400 group-hover:text-gray-600" : ""} /> 
                                  <span className="flex-1">{tab.label}</span>
                                  {isActive && <ChevronRight size={16} className="hidden lg:block opacity-50" />}
                              </button>
                          );
                      })}
                  </div>
              </div>
          </div>

          {/* 2. RIGHT CONTENT AREA */}
          <div className="flex-1 min-w-0 space-y-4">
              
              {/* CONTENT HEADER: Title + Add Button */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                      <h2 className="text-lg font-bold text-gray-900 uppercase">
                          {TABS.find(t => t.id === activeTabId)?.label}
                      </h2>
                      <p className="text-xs text-gray-500">Quản lý danh sách và hồ sơ chi tiết</p>
                  </div>

                  {!isReadOnly && activeTabId === 'ALL' && (
                      <button
                          onClick={() => { setEditingRecruit(undefined); setShowForm(true); }}
                          className="flex items-center gap-2 px-4 py-2 bg-military-600 text-white rounded-lg hover:bg-military-700 shadow-md font-bold text-sm transition-transform active:scale-95 w-full md:w-auto justify-center"
                      >
                          <Plus size={18} /> Bổ sung nguồn
                      </button>
                  )}
              </div>

              {/* FILTERS BAR */}
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

                        {/* Village Filter */}
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

                        {/* Age Filter */}
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

              {/* DATA TABLE */}
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
                    <span>Hiển thị <strong>{filteredRecruits.length}</strong> / <strong>{totalRelevantRecruits}</strong> hồ sơ</span>
                    <span className="italic">Dữ liệu năm {sessionYear}</span>
                </div>
              </div>
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

      {/* MODAL: Deferment / Exemption Reason */}
      {showExceptionModal && targetExceptionStatus && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${targetExceptionStatus === RecruitmentStatus.DEFERRED ? 'text-amber-700' : 'text-purple-700'}`}>
                      {targetExceptionStatus === RecruitmentStatus.DEFERRED ? <PauseCircle /> : <ShieldCheck />}
                      {targetExceptionStatus === RecruitmentStatus.DEFERRED ? 'Xét duyệt Tạm hoãn' : 'Xét duyệt Miễn NVQS'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                      Vui lòng chọn lý do pháp lý cho công dân <strong>{selectedExceptionRecruit?.fullName}</strong> theo Luật NVQS:
                  </p>
                  
                  <div className="space-y-2 mb-6">
                      {(targetExceptionStatus === RecruitmentStatus.DEFERRED ? LEGAL_DEFERMENT_REASONS : LEGAL_EXEMPTION_REASONS).map((reason, idx) => (
                          <label key={idx} className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-colors ${targetExceptionStatus === RecruitmentStatus.DEFERRED ? 'hover:bg-amber-50' : 'hover:bg-purple-50'}`}>
                              <input 
                                  type="radio" 
                                  name="exceptionReason" 
                                  className={`mt-1 ${targetExceptionStatus === RecruitmentStatus.DEFERRED ? 'text-amber-600 focus:ring-amber-500' : 'text-purple-600 focus:ring-purple-500'}`}
                                  checked={selectedExceptionReason === reason}
                                  onChange={() => setSelectedExceptionReason(reason)}
                              />
                              <span className="text-sm font-medium text-gray-800 leading-relaxed">{reason}</span>
                          </label>
                      ))}
                      
                      {/* Custom Reason Input if 'Khác' is selected */}
                      {selectedExceptionReason.startsWith('Khác') && (
                          <div className="pl-8 animate-in fade-in slide-in-from-top-1">
                              <input 
                                  type="text" 
                                  autoFocus
                                  className={`w-full border rounded p-2 text-sm outline-none ${targetExceptionStatus === RecruitmentStatus.DEFERRED ? 'border-amber-300 focus:ring-2 focus:ring-amber-500' : 'border-purple-300 focus:ring-2 focus:ring-purple-500'}`}
                                  placeholder="Nhập lý do cụ thể..."
                                  value={customExceptionReason}
                                  onChange={(e) => setCustomExceptionReason(e.target.value)}
                              />
                          </div>
                      )}
                  </div>

                  <div className="flex justify-end gap-3 border-t pt-4">
                      <button 
                          onClick={() => setShowExceptionModal(false)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-bold"
                      >
                          Hủy
                      </button>
                      <button 
                          onClick={confirmExceptionStatus}
                          className={`px-4 py-2 text-white rounded font-bold ${targetExceptionStatus === RecruitmentStatus.DEFERRED ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700'}`}
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
