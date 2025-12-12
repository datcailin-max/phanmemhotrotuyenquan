
import React, { useState, useMemo, useEffect } from 'react';
import { Recruit, RecruitmentStatus, User } from '../types';
import { EDUCATIONS, GET_ALL_COMMUNES, LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS, LOW_EDUCATION_GRADES, ETHNICITIES, RELIGIONS, MARITAL_STATUSES, PROVINCES_VN, LOCATION_DATA } from '../constants';
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
  Star,
  ArchiveRestore
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
    province: '', // New Province filter for Admin
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

  // Commune List based on selected province in filter (Admin only)
  const adminCommuneList = useMemo(() => {
    if (!filters.province) return [];
    // @ts-ignore
    const data = LOCATION_DATA[filters.province];
    return data ? Object.keys(data) : [];
  }, [filters.province]);

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
    
    // ADMIN FILTERS: Province -> Commune
    if (isAdmin) {
        if (filters.province) {
            result = result.filter(r => r.address.province === filters.province);
        }
        if (filters.commune) {
            result = result.filter(r => r.address.commune === filters.commune);
        }
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

  // --- LOGIC KẾT CHUYỂN NGUỒN TỪ NĂM TRƯỚC ---
  const handleTransferFromPreviousYear = async () => {
      if (isReadOnly) return;

      const prevYear = sessionYear - 1;
      
      // 1. Lọc dữ liệu năm trước
      let prevYearRecruits = recruits.filter(r => r.recruitmentYear === prevYear);
      
      // Nếu không phải Admin, chỉ lấy của xã mình
      if (!isAdmin) {
          prevYearRecruits = prevYearRecruits.filter(r => r.address.commune === user.unit.commune);
      } else {
          // Nếu là Admin, áp dụng filter hiện tại (nếu có)
          if (filters.province) {
              prevYearRecruits = prevYearRecruits.filter(r => r.address.province === filters.province);
          }
          if (filters.commune) {
              prevYearRecruits = prevYearRecruits.filter(r => r.address.commune === filters.commune);
          }
      }

      // 2. Lọc "Nguồn còn lại" (Không Nhập ngũ chính thức, Không bị loại, KHÔNG ĐƯỢC MIỄN)
      const eligibleToTransfer = prevYearRecruits.filter(r => {
          const isEnlistedOfficial = r.status === RecruitmentStatus.ENLISTED && r.enlistmentType !== 'RESERVE';
          const isRemoved = r.status === RecruitmentStatus.REMOVED_FROM_SOURCE;
          const isExempted = r.status === RecruitmentStatus.EXEMPTED; // Thêm điều kiện: Không chuyển người được miễn
          return !isEnlistedOfficial && !isRemoved && !isExempted;
      });

      if (eligibleToTransfer.length === 0) {
          alert(`Không tìm thấy hồ sơ nào từ năm ${prevYear} đủ điều kiện cập nhật.`);
          return;
      }

      // 3. Kiểm tra trùng lặp trong năm hiện tại (dựa vào CCCD)
      const currentYearRecruits = recruits.filter(r => r.recruitmentYear === sessionYear);
      const existingCitizenIds = new Set(currentYearRecruits.map(r => r.citizenId));
      
      const toCreate = eligibleToTransfer.filter(r => !existingCitizenIds.has(r.citizenId));

      if (toCreate.length === 0) {
          alert(`Tất cả hồ sơ nguồn năm ${prevYear} đã có mặt trong năm ${sessionYear}.`);
          return;
      }

      const confirmMsg = `Tìm thấy ${eligibleToTransfer.length} hồ sơ đủ điều kiện cập nhật từ năm ${prevYear}.\n` +
                         `Trong đó có ${toCreate.length} hồ sơ chưa có trong năm ${sessionYear}.\n\n` +
                         `Bạn có chắc chắn muốn cập nhật ${toCreate.length} hồ sơ này sang năm ${sessionYear} không?\n` +
                         `(Trạng thái sẽ được đặt lại về "NGUỒN" để bắt đầu quy trình mới)`;

      if (!window.confirm(confirmMsg)) return;

      // 4. Thực hiện tạo mới
      let successCount = 0;
      for (const r of toCreate) {
          const newRecruit: Recruit = {
              ...r,
              id: Date.now().toString(36) + Math.random().toString(36).substr(2) + successCount, // Generate Unique ID
              recruitmentYear: sessionYear,
              status: RecruitmentStatus.SOURCE, // Reset status
              defermentReason: '', // Reset reason
              enlistmentUnit: undefined,
              enlistmentDate: undefined,
              enlistmentType: undefined,
              // Giữ nguyên các thông tin khác
          };
          onUpdate(newRecruit);
          successCount++;
      }

      alert(`Đã gửi yêu cầu cập nhật ${successCount} hồ sơ.`);
  };

  const handleEdit = (recruit: Recruit) => {
    // Read only cannot edit
    if (isReadOnly) return;
    setEditingRecruit(recruit);
    setShowForm(true);
  };

  // ... (rest of the functions remain same)
  // Helper for Status Badge
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

  const handleStatusChange = (recruit: Recruit, newStatus: RecruitmentStatus) => {
      if (isReadOnly) return;
      
      // If moving to Deferred/Exempted, open modal
      if (newStatus === RecruitmentStatus.DEFERRED || newStatus === RecruitmentStatus.EXEMPTED) {
          setSelectedExceptionRecruit(recruit);
          setTargetExceptionStatus(newStatus);
          setSelectedExceptionReason('');
          setCustomExceptionReason('');
          setShowExceptionModal(true);
          return;
      }

      // Normal status change
      onUpdate({ ...recruit, status: newStatus });
  };

  const confirmExceptionStatus = () => {
      if (!selectedExceptionRecruit || !targetExceptionStatus) return;
      
      let finalReason = selectedExceptionReason;
      if (selectedExceptionReason.startsWith('Khác') || !selectedExceptionReason) {
          if(!customExceptionReason) {
              alert("Vui lòng nhập lý do cụ thể");
              return;
          }
          finalReason = customExceptionReason;
      }

      onUpdate({
          ...selectedExceptionRecruit,
          status: targetExceptionStatus,
          defermentReason: finalReason
      });
      
      setShowExceptionModal(false);
      setSelectedExceptionRecruit(null);
      setTargetExceptionStatus(null);
  };

  const handleSoftDelete = (recruit: Recruit) => {
      if (isReadOnly) return;
      if (window.confirm(`Bạn có chắc muốn loại công dân ${recruit.fullName} khỏi nguồn không?`)) {
          onUpdate({ ...recruit, status: RecruitmentStatus.REMOVED_FROM_SOURCE });
      }
  };
  
  const handleRestore = (recruit: Recruit) => {
      if (isReadOnly) return;
      if (window.confirm(`Khôi phục công dân ${recruit.fullName} về danh sách nguồn?`)) {
          onUpdate({ ...recruit, status: RecruitmentStatus.SOURCE });
      }
  };

  const handlePermanentDelete = (id: string, name: string) => {
      if (isReadOnly) return;
      if (window.confirm(`CẢNH BÁO: Hành động này không thể hoàn tác!\nBạn có chắc chắn muốn xóa vĩnh viễn hồ sơ của ${name}?`)) {
          onDelete(id);
      }
  };

  const renderTableHead = () => (
      <tr>
          <th className="p-3 border-b text-center w-12">TT</th>
          <th className="p-3 border-b">Họ và tên / CCCD</th>
          <th className="p-3 border-b">Năm sinh / Địa chỉ</th>
          <th className="p-3 border-b">Trình độ / Nghề nghiệp</th>
          <th className="p-3 border-b text-center">Sức khỏe</th>
          <th className="p-3 border-b text-center">Trạng thái</th>
          <th className="p-3 border-b text-center">Thao tác</th>
      </tr>
  );

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
                  <div className="text-xs text-gray-500 max-w-[200px] truncate" title={`${recruit.address.village}, ${recruit.address.commune}, ${recruit.address.province}`}>
                      {recruit.address.village}, {recruit.address.commune}
                  </div>
              </td>
              <td className="p-3">
                  <div className={`text-sm font-bold ${LOW_EDUCATION_GRADES.includes(recruit.details.education) ? 'text-orange-600' : 'text-gray-700'}`}>
                      {recruit.details.education}
                  </div>
                  <div className="text-xs text-gray-500">{recruit.details.job || '---'}</div>
              </td>
              <td className="p-3 text-center">
                  {recruit.physical.healthGrade ? (
                      <span className={`inline-block w-8 h-8 leading-8 rounded-full font-bold text-white text-sm shadow-sm
                          ${recruit.physical.healthGrade === 1 ? 'bg-emerald-500' : 
                            recruit.physical.healthGrade === 2 ? 'bg-green-500' : 
                            recruit.physical.healthGrade === 3 ? 'bg-yellow-500' : 
                            'bg-red-500'}`
                      }>
                          {recruit.physical.healthGrade}
                      </span>
                  ) : (
                      <span className="text-gray-300">--</span>
                  )}
                  {recruit.physical.bmi > 0 && (
                       <div className={`text-[10px] font-bold mt-1 ${recruit.physical.bmi < 18.5 || recruit.physical.bmi > 25 ? 'text-red-500' : 'text-green-600'}`}>BMI: {recruit.physical.bmi}</div>
                  )}
              </td>
              <td className="p-3 text-center">
                  {getStatusBadge(recruit.status)}
                  {(recruit.status === RecruitmentStatus.DEFERRED || recruit.status === RecruitmentStatus.EXEMPTED) && recruit.defermentReason && (
                      <div className="text-[10px] text-gray-500 max-w-[150px] truncate mx-auto mt-1 italic" title={recruit.defermentReason}>
                          {recruit.defermentReason}
                      </div>
                  )}
              </td>
              <td className="p-3">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* VIEW/EDIT */}
                      <button 
                          onClick={() => handleEdit(recruit)} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" 
                          title={isReadOnly ? "Xem chi tiết" : "Chỉnh sửa"}
                      >
                          {isReadOnly ? <ClipboardList size={18} /> : <FileEdit size={18} />}
                      </button>

                      {!isReadOnly && (
                        <>
                            {/* ACTIONS BASED ON STATUS */}
                            {recruit.status === RecruitmentStatus.SOURCE && (
                                <button 
                                    onClick={() => handleStatusChange(recruit, RecruitmentStatus.PRE_CHECK_PASSED)}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                    title="Đạt Sơ tuyển"
                                >
                                    <CheckCircle2 size={18} />
                                </button>
                            )}

                             {(recruit.status === RecruitmentStatus.PRE_CHECK_PASSED) && (
                                <button 
                                    onClick={() => handleStatusChange(recruit, RecruitmentStatus.MED_EXAM_PASSED)}
                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                                    title="Đạt Khám tuyển"
                                >
                                    <Stethoscope size={18} />
                                </button>
                            )}

                             {(recruit.status === RecruitmentStatus.REMOVED_FROM_SOURCE) ? (
                                 <button 
                                    onClick={() => handleRestore(recruit)}
                                    className="p-1.5 text-teal-600 hover:bg-teal-50 rounded"
                                    title="Khôi phục về Nguồn"
                                 >
                                    <RotateCcw size={18} />
                                 </button>
                             ) : (
                                 <button 
                                    onClick={() => handleSoftDelete(recruit)}
                                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                                    title="Loại khỏi nguồn"
                                 >
                                    <UserX size={18} />
                                 </button>
                             )}

                            {/* PERMANENT DELETE */}
                            <button 
                                onClick={() => handlePermanentDelete(recruit.id, recruit.fullName)} 
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded" 
                                title="Xóa vĩnh viễn"
                            >
                                <Trash2 size={18} />
                            </button>
                        </>
                      )}
                  </div>
              </td>
          </tr>
      );
  };

  return (
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
                      <div className="flex gap-2 w-full md:w-auto">
                          <button
                              onClick={handleTransferFromPreviousYear}
                              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 shadow-md font-bold text-sm transition-transform active:scale-95 w-full md:w-auto justify-center"
                              title={`Cập nhật hồ sơ từ nguồn năm ${sessionYear - 1}`}
                          >
                              <ArchiveRestore size={18} /> Cập nhật nguồn {sessionYear - 1}
                          </button>
                          <button
                              onClick={() => { setEditingRecruit(undefined); setShowForm(true); }}
                              className="flex items-center gap-2 px-4 py-2 bg-military-600 text-white rounded-lg hover:bg-military-700 shadow-md font-bold text-sm transition-transform active:scale-95 w-full md:w-auto justify-center"
                          >
                              <Plus size={18} /> Bổ sung nguồn
                          </button>
                      </div>
                  )}
              </div>

              {/* ... FILTERS BAR AND DATA TABLE (SAME AS BEFORE) ... */}
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

                         {/* Admin Filters: Province & Commune */}
                         {isAdmin && (
                            <>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Tỉnh / Thành phố</label>
                                    <select
                                        className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700"
                                        value={filters.province}
                                        onChange={(e) => setFilters(prev => ({...prev, province: e.target.value, commune: ''}))}
                                    >
                                        <option value="">-- Tất cả --</option>
                                        {PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Xã / Phường</label>
                                    <select
                                        className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700 disabled:bg-gray-100"
                                        value={filters.commune}
                                        onChange={(e) => setFilters(prev => ({...prev, commune: e.target.value}))}
                                        disabled={!filters.province}
                                    >
                                        <option value="">-- Tất cả --</option>
                                        {adminCommuneList.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

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
