import React, { useState, useMemo, useEffect } from 'react';
import { Recruit, RecruitmentStatus, User } from '../types';
import { LOCATION_DATA, PROVINCES_VN, removeVietnameseTones, LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS } from '../constants';
import RecruitForm from '../components/RecruitForm';
import { 
  Search, Plus, CheckCircle2, XCircle, FileEdit, Stethoscope, ClipboardList, Filter,
  PauseCircle, Users, FileSignature, UserX, Flag, Layers, ShieldCheck, Baby, 
  ChevronRight, BookX, ArrowRightCircle,
  Ban, Shield, ChevronLeft, Download, ShieldOff, RefreshCw, Undo2, Ban as BanIcon,
  HeartPulse, GraduationCap, Scale, Tent, ToggleLeft, ToggleRight, AlertTriangle
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
  { id: 'NOT_ALLOWED_REG', label: '1. DS KHÔNG ĐƯỢC ĐĂNG KÝ NVQS', status: [RecruitmentStatus.NOT_ALLOWED_REGISTRATION], color: 'bg-red-800', lightColor: 'bg-red-50', borderColor: 'border-red-800', textColor: 'text-red-900', icon: Ban },
  { id: 'EXEMPT_REG', label: '2. DS ĐƯỢC MIỄN ĐK NVQS', status: [RecruitmentStatus.EXEMPT_REGISTRATION], color: 'bg-slate-500', lightColor: 'bg-slate-100', borderColor: 'border-slate-500', textColor: 'text-slate-800', icon: Shield },
  { id: 'FIRST_TIME_REG', label: '3. DS ĐĂNG KÝ NVQS LẦN ĐẦU', status: null, color: 'bg-pink-600', lightColor: 'bg-pink-50', borderColor: 'border-pink-600', textColor: 'text-pink-900', icon: Baby },
  { id: 'ALL', label: '4. TOÀN BỘ NGUỒN', status: null, color: 'bg-gray-600', lightColor: 'bg-gray-100', borderColor: 'border-gray-600', textColor: 'text-gray-900', icon: Users },
  { id: 'TT50', label: '5. DS KHÔNG TUYỂN CHỌN (TT 50)', status: [RecruitmentStatus.NOT_SELECTED_TT50], color: 'bg-slate-600', lightColor: 'bg-slate-200', borderColor: 'border-slate-600', textColor: 'text-slate-900', icon: BookX },
  { id: 'PRE_CHECK', label: '6. DS ĐỦ ĐK SƠ TUYỂN', status: null, color: 'bg-blue-600', lightColor: 'bg-blue-50', borderColor: 'border-blue-600', textColor: 'text-blue-900', icon: ClipboardList },
  { id: 'PRE_CHECK_PASS', label: '6.1. DS ĐẠT SƠ TUYỂN', status: [RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-blue-500', lightColor: 'bg-blue-50', borderColor: 'border-blue-500', textColor: 'text-blue-800', icon: CheckCircle2, isSub: true, parentId: 'PRE_CHECK' },
  { id: 'PRE_CHECK_FAIL', label: '6.2. DS KHÔNG ĐẠT SƠ TUYỂN', status: [RecruitmentStatus.PRE_CHECK_FAILED], color: 'bg-orange-500', lightColor: 'bg-orange-50', borderColor: 'border-orange-500', textColor: 'text-orange-900', icon: XCircle, isSub: true, parentId: 'PRE_CHECK' },
  { id: 'MED_EXAM', label: '7. DS ĐỦ ĐK KHÁM TUYỂN', status: null, color: 'bg-indigo-600', lightColor: 'bg-indigo-50', borderColor: 'border-indigo-600', textColor: 'text-indigo-900', icon: Stethoscope },
  { id: 'MED_EXAM_PASS', label: '7.1. DS ĐẠT KHÁM TUYỂN', status: [RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-indigo-500', lightColor: 'bg-indigo-50', borderColor: 'border-indigo-500', textColor: 'text-indigo-800', icon: CheckCircle2, isSub: true, parentId: 'MED_EXAM' },
  { id: 'MED_EXAM_FAIL', label: '7.2. DS KHÔNG ĐẠT KHÁM TUYỂN', status: [RecruitmentStatus.MED_EXAM_FAILED], color: 'bg-orange-600', lightColor: 'bg-orange-100', borderColor: 'border-orange-600', textColor: 'text-orange-900', icon: XCircle, isSub: true, parentId: 'MED_EXAM' },
  
  // List 8 with sub-lists
  { id: 'DEFERRED_LIST', label: '8. DS TẠM HOÃN (NGUỒN)', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-600', lightColor: 'bg-amber-50', borderColor: 'border-amber-600', textColor: 'text-amber-900', icon: PauseCircle },
  { id: 'DEFERRED_HEALTH', label: '8.1. HOÃN VỀ SỨC KHỎE', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-500', lightColor: 'bg-amber-50', borderColor: 'border-amber-500', textColor: 'text-amber-800', icon: HeartPulse, isSub: true, parentId: 'DEFERRED_LIST' },
  { id: 'DEFERRED_EDUCATION', label: '8.2. HOÃN VỀ HỌC VẤN', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-500', lightColor: 'bg-amber-50', borderColor: 'border-amber-500', textColor: 'text-amber-800', icon: GraduationCap, isSub: true, parentId: 'DEFERRED_LIST' },
  { id: 'DEFERRED_POLICY', label: '8.3. HOÃN VỀ CHÍNH SÁCH', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-500', lightColor: 'bg-amber-50', borderColor: 'border-amber-500', textColor: 'text-amber-800', icon: Scale, isSub: true, parentId: 'DEFERRED_LIST' },
  { id: 'DEFERRED_DQTT', label: '8.4. HOÃN VỀ DQTT', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-500', lightColor: 'bg-amber-50', borderColor: 'border-amber-500', textColor: 'text-amber-800', icon: ShieldCheck, isSub: true, parentId: 'DEFERRED_LIST' },

  { id: 'EXEMPTED_LIST', label: '9. DS MIỄN GỌI NHẬP NGŨ', status: [RecruitmentStatus.EXEMPTED], color: 'bg-purple-600', lightColor: 'bg-purple-50', borderColor: 'border-purple-600', textColor: 'text-purple-900', icon: ShieldCheck },
  
  // List 10 with sub-lists
  { id: 'FINAL', label: '10. DS CHỐT HỒ SƠ', status: [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-green-600', lightColor: 'bg-green-50', borderColor: 'border-green-600', textColor: 'text-green-900', icon: FileSignature },
  { id: 'FINAL_OFFICIAL', label: '10.1. DANH SÁCH CHÍNH THỨC', status: [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-green-500', lightColor: 'bg-green-50', borderColor: 'border-green-500', textColor: 'text-green-800', icon: Flag, isSub: true, parentId: 'FINAL' },
  { id: 'FINAL_RESERVE', label: '10.2. DANH SÁCH DỰ BỊ', status: [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-teal-500', lightColor: 'bg-teal-50', borderColor: 'border-teal-500', textColor: 'text-teal-800', icon: Tent, isSub: true, parentId: 'FINAL' },

  { id: 'ENLISTED', label: '11. DS NHẬP NGŨ', status: null, color: 'bg-red-600', lightColor: 'bg-red-50', borderColor: 'border-red-600', textColor: 'text-red-900', icon: Flag },
  { id: 'REMOVED', label: '12. DS ĐƯA RA KHỎI NGUỒN', status: [RecruitmentStatus.REMOVED_FROM_SOURCE], color: 'bg-gray-400', lightColor: 'bg-gray-100', borderColor: 'border-gray-400', textColor: 'text-gray-600', icon: UserX },
  { id: 'REMAINING', label: '13. DS NGUỒN CÒN LẠI', status: null, color: 'bg-teal-600', lightColor: 'bg-teal-50', borderColor: 'border-teal-600', textColor: 'text-teal-900', icon: Layers },
];

const ITEMS_PER_PAGE = 10;

// Helper function to get status label
const getStatusLabel = (status: RecruitmentStatus) => {
    switch (status) {
        case RecruitmentStatus.NOT_ALLOWED_REGISTRATION: return 'Cấm ĐK';
        case RecruitmentStatus.EXEMPT_REGISTRATION: return 'Miễn ĐK';
        case RecruitmentStatus.SOURCE: return 'Nguồn';
        case RecruitmentStatus.NOT_SELECTED_TT50: return 'Không tuyển (TT50)';
        case RecruitmentStatus.PRE_CHECK_PASSED: return 'Đạt sơ tuyển';
        case RecruitmentStatus.PRE_CHECK_FAILED: return 'Không đạt sơ tuyển';
        case RecruitmentStatus.MED_EXAM_PASSED: return 'Đạt';
        case RecruitmentStatus.MED_EXAM_FAILED: return 'Không đạt khám tuyển';
        case RecruitmentStatus.FINALIZED: return 'Chốt hồ sơ';
        case RecruitmentStatus.ENLISTED: return 'Nhập ngũ';
        case RecruitmentStatus.DEFERRED: return 'Tạm hoãn';
        case RecruitmentStatus.EXEMPTED: return 'Miễn gọi';
        case RecruitmentStatus.REMOVED_FROM_SOURCE: return 'Đã loại';
        default: return status;
    }
};

const getStatusColor = (status: RecruitmentStatus) => {
    switch (status) {
        case RecruitmentStatus.MED_EXAM_PASSED:
            return 'bg-green-50 text-green-700 border-green-200';
        case RecruitmentStatus.MED_EXAM_FAILED:
            return 'bg-orange-50 text-orange-700 border-orange-200';
        case RecruitmentStatus.FINALIZED:
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case RecruitmentStatus.ENLISTED:
            return 'bg-red-50 text-red-700 border-red-200';
        case RecruitmentStatus.DEFERRED:
            return 'bg-amber-50 text-amber-700 border-amber-200';
        default:
            return 'bg-gray-50 text-gray-600 border-gray-200';
    }
}

// Optimized Input Component to avoid re-rendering entire table on typing
const TableInput = ({ value, onSave, placeholder }: { value: string, onSave: (val: string) => void, placeholder?: string }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = () => {
        if (localValue !== value) {
            onSave(localValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    return (
        <input
            type="text"
            className="w-full min-w-[100px] p-1 border border-gray-300 rounded text-xs focus:border-military-500 focus:ring-1 focus:ring-military-500"
            placeholder={placeholder}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        />
    );
};

const RecruitManagement: React.FC<RecruitManagementProps> = ({ 
  recruits, user, onUpdate, onDelete, initialTab = 'ALL', onTabChange, sessionYear
}) => {
  const [activeTabId, setActiveTabId] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingRecruit, setEditingRecruit] = useState<Recruit | undefined>(undefined);
  
  // Removal Reason Modal State
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [recruitToRemove, setRecruitToRemove] = useState<Recruit | null>(null);
  const [removeReason, setRemoveReason] = useState('');

  // Admin Filters
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCommune, setFilterCommune] = useState('');

  const isAdmin = user.role === 'ADMIN';
  const isProvinceAdmin = user.role === 'PROVINCE_ADMIN';
  const isReadOnly = user.role === 'VIEWER' || isProvinceAdmin;

  const handleTabChange = (id: string) => {
      setActiveTabId(id);
      setCurrentPage(1);
      if (onTabChange) onTabChange(id);
  };

  const activeTab = TABS.find(t => t.id === activeTabId) || TABS[0];

  // Logic to show/hide sub-tabs (Accordion behavior for 6.x and 7.x)
  const visibleTabs = useMemo(() => {
      return TABS.filter(tab => {
          // @ts-ignore
          if (!tab.isSub) return true; // Top level always visible
          // @ts-ignore
          const parent = tab.parentId;
          if (!parent) return true;

          const currentActive = TABS.find(t => t.id === activeTabId);
          
          // 1. Show if its parent is currently active (Expanded)
          if (activeTabId === parent) return true;
          
          // 2. Show if currently active is a sibling (Keep Expanded)
          // @ts-ignore
          if (currentActive?.parentId === parent) return true;
          
          // 3. Show if it is itself active (Redundant but safe)
          if (activeTabId === tab.id) return true;

          return false; // Otherwise hide
      });
  }, [activeTabId]);

  // Helper check age
  const checkAge = (r: Recruit) => {
    const birthYear = parseInt(r.dob.split('-')[0] || '0');
    return sessionYear - birthYear;
  };

  // Helper check valid source
  const isValidSourceStatus = (status: RecruitmentStatus) => {
    return ![
        RecruitmentStatus.REMOVED_FROM_SOURCE,
        RecruitmentStatus.NOT_ALLOWED_REGISTRATION,
        RecruitmentStatus.EXEMPT_REGISTRATION
    ].includes(status);
  };

  // Filter Recruits based on User Scope and Admin Filters
  const scopeRecruits = useMemo(() => {
      let filtered = recruits.filter(r => r.recruitmentYear === sessionYear);
      
      if (!isAdmin) {
          if (user.unit.province && user.unit.commune) {
              filtered = filtered.filter(r => 
                  r.address.province === user.unit.province && 
                  r.address.commune === user.unit.commune
              );
          } else if (isProvinceAdmin && user.unit.province) {
               filtered = filtered.filter(r => r.address.province === user.unit.province);
          }
      } else {
          // Admin filters
          if (filterProvince) filtered = filtered.filter(r => r.address.province === filterProvince);
          if (filterCommune) filtered = filtered.filter(r => r.address.commune === filterCommune);
      }
      return filtered;
  }, [recruits, sessionYear, user, isAdmin, isProvinceAdmin, filterProvince, filterCommune]);

  // Filter based on Tab & Search (UPDATED LOGIC)
  const filteredRecruits = useMemo(() => {
      let result = scopeRecruits;

      switch (activeTabId) {
          case 'FIRST_TIME_REG': // List 3
              result = result.filter(r => checkAge(r) < 18 && isValidSourceStatus(r.status));
              break;

          case 'ALL': // List 4 (Modified to include Removed Recruits but exclude List 1 & 2)
              result = result.filter(r => {
                  if (checkAge(r) < 18) return false;
                  // Exclude only List 1 & 2
                  if (r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || r.status === RecruitmentStatus.EXEMPT_REGISTRATION) return false;
                  return true;
              });
              break;

          case 'PRE_CHECK': // List 6
              const excludedFromPreCheck = [
                  RecruitmentStatus.DEFERRED, 
                  RecruitmentStatus.EXEMPTED, 
                  RecruitmentStatus.NOT_SELECTED_TT50,
                  RecruitmentStatus.REMOVED_FROM_SOURCE,
                  RecruitmentStatus.NOT_ALLOWED_REGISTRATION,
                  RecruitmentStatus.EXEMPT_REGISTRATION
              ];
              result = result.filter(r => checkAge(r) >= 18 && !excludedFromPreCheck.includes(r.status));
              break;

          case 'MED_EXAM': // List 7
              const eligibleForMedExam = [
                  RecruitmentStatus.PRE_CHECK_PASSED,
                  RecruitmentStatus.MED_EXAM_PASSED,
                  RecruitmentStatus.MED_EXAM_FAILED,
                  RecruitmentStatus.FINALIZED,
                  RecruitmentStatus.ENLISTED
              ];
              result = result.filter(r => eligibleForMedExam.includes(r.status));
              break;
          
          case 'FINAL': // List 10 (All Finalized)
              result = result.filter(r => 
                  [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status)
              );
              break;

          case 'FINAL_OFFICIAL': // List 10.1 (Official)
              result = result.filter(r => 
                  [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status) &&
                  r.enlistmentType === 'OFFICIAL'
              );
              break;

          case 'FINAL_RESERVE': // List 10.2 (Reserve)
              result = result.filter(r => 
                  [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(r.status) &&
                  r.enlistmentType === 'RESERVE'
              );
              break;

          case 'ENLISTED': // List 11 (Actually Enlisted / Final Official)
              result = result.filter(r => 
                  (r.status === RecruitmentStatus.ENLISTED && r.enlistmentType !== 'RESERVE') ||
                  (r.status === RecruitmentStatus.FINALIZED && r.enlistmentType === 'OFFICIAL')
              );
              break;

          case 'DEFERRED_HEALTH': // List 8.1 - Reason 1
              result = result.filter(r => 
                  r.status === RecruitmentStatus.DEFERRED && 
                  (r.defermentReason === LEGAL_DEFERMENT_REASONS[0] || r.defermentReason?.toLowerCase().includes('sức khỏe') || r.defermentReason?.includes('BMI'))
              );
              break;

          case 'DEFERRED_EDUCATION': // List 8.2 - Reason 7
              result = result.filter(r => 
                  r.status === RecruitmentStatus.DEFERRED && 
                  (r.defermentReason === LEGAL_DEFERMENT_REASONS[6] || r.defermentReason?.toLowerCase().includes('học'))
              );
              break;

          case 'DEFERRED_DQTT': // List 8.4 - Reason 8
              result = result.filter(r => 
                  r.status === RecruitmentStatus.DEFERRED && 
                  (r.defermentReason === LEGAL_DEFERMENT_REASONS[7] || r.defermentReason?.toLowerCase().includes('dân quân'))
              );
              break;

          case 'DEFERRED_POLICY': // List 8.3 - Reason 2, 3, 4, 5, 6
              const policyReasons = [
                  LEGAL_DEFERMENT_REASONS[1],
                  LEGAL_DEFERMENT_REASONS[2],
                  LEGAL_DEFERMENT_REASONS[3],
                  LEGAL_DEFERMENT_REASONS[4],
                  LEGAL_DEFERMENT_REASONS[5]
              ];
              result = result.filter(r => {
                  if (r.status !== RecruitmentStatus.DEFERRED) return false;
                  // If exact match found in policy list
                  if (policyReasons.includes(r.defermentReason || '')) return true;
                  
                  // Fallback for old data or manual entry: NOT Health, NOT Edu, NOT DQTT
                  const reason = r.defermentReason || '';
                  const isHealth = reason === LEGAL_DEFERMENT_REASONS[0] || reason.toLowerCase().includes('sức khỏe') || reason.includes('BMI');
                  const isEdu = reason === LEGAL_DEFERMENT_REASONS[6] || reason.toLowerCase().includes('học');
                  const isDqtt = reason === LEGAL_DEFERMENT_REASONS[7] || reason.toLowerCase().includes('dân quân');
                  
                  return !isHealth && !isEdu && !isDqtt;
              });
              break;

          case 'REMAINING': // List 13
              const remainingStatuses = [
                RecruitmentStatus.SOURCE, 
                RecruitmentStatus.PRE_CHECK_FAILED, 
                RecruitmentStatus.MED_EXAM_FAILED, 
                RecruitmentStatus.DEFERRED, 
                RecruitmentStatus.EXEMPTED, 
                RecruitmentStatus.NOT_SELECTED_TT50
              ];
              result = result.filter(r => {
                  if (r.status === RecruitmentStatus.REMOVED_FROM_SOURCE) return false;
                  if (checkAge(r) < 18 && isValidSourceStatus(r.status)) return true;
                  if (remainingStatuses.includes(r.status)) return true;
                  if ((r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'RESERVE') return true;
                  return false;
              });
              break;

          default:
              if (activeTab.status) {
                 result = result.filter(r => activeTab.status!.includes(r.status));
              }
              break;
      }

      // Filter by Search
      if (searchTerm) {
          const search = removeVietnameseTones(searchTerm.toLowerCase());
          result = result.filter(r => 
              removeVietnameseTones(r.fullName.toLowerCase()).includes(search) ||
              (r.citizenId && r.citizenId.includes(search))
          );
      }

      return result;
  }, [scopeRecruits, activeTabId, searchTerm, activeTab, sessionYear]);

  // Pagination
  const totalPages = Math.ceil(filteredRecruits.length / ITEMS_PER_PAGE);
  const paginatedRecruits = filteredRecruits.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handleEdit = (recruit: Recruit) => {
      setEditingRecruit(recruit);
      setShowForm(true);
  };

  const handleCreate = () => {
      setEditingRecruit(undefined);
      setShowForm(true);
  };

  const handleSave = (data: Recruit) => {
      onUpdate(data);
      setShowForm(false);
  };

  const handleConfirmRemove = () => {
      if (recruitToRemove) {
          onUpdate({
              ...recruitToRemove,
              status: RecruitmentStatus.REMOVED_FROM_SOURCE,
              defermentReason: removeReason // Save the removal reason
          });
          setShowRemoveModal(false);
          setRecruitToRemove(null);
          setRemoveReason('');
      }
  };

  // Helper for toggle actions
  const handleQuickStatusChange = (recruit: Recruit, targetStatus: RecruitmentStatus) => {
      let newStatus = targetStatus;
      
      if (recruit.status === targetStatus) {
          newStatus = RecruitmentStatus.SOURCE;
      }
      
      onUpdate({ ...recruit, status: newStatus });
  };

  // New Helper: Update Health Grade Inline (For List 7)
  const handleHealthGradeChange = (recruit: Recruit, grade: number) => {
      let newStatus = recruit.status;
      let newReason = recruit.defermentReason;
      
      // Các trạng thái chịu ảnh hưởng khi đổi loại sức khỏe
      const AFFECTED_STATUSES = [
          RecruitmentStatus.PRE_CHECK_PASSED,
          RecruitmentStatus.MED_EXAM_PASSED,
          RecruitmentStatus.MED_EXAM_FAILED,
          RecruitmentStatus.FINALIZED,
          RecruitmentStatus.ENLISTED
      ];

      if (AFFECTED_STATUSES.includes(recruit.status)) {
          if (grade >= 1 && grade <= 3) {
              // Nếu đang là Không đạt hoặc mới sơ tuyển -> Chuyển thành Đạt
              if (recruit.status === RecruitmentStatus.MED_EXAM_FAILED || recruit.status === RecruitmentStatus.PRE_CHECK_PASSED) {
                  newStatus = RecruitmentStatus.MED_EXAM_PASSED;
                  newReason = ''; // Xóa lý do sức khỏe cũ nếu có
              }
              // Nếu đang là FINALIZED/ENLISTED thì giữ nguyên (chỉ cập nhật lại grade)
          } else if (grade >= 4) {
              // Nếu loại 4,5,6 -> Luôn chuyển về Không đạt (kể cả đang Chốt/Nhập ngũ)
              newStatus = RecruitmentStatus.MED_EXAM_FAILED;
              newReason = LEGAL_DEFERMENT_REASONS[0]; // Lý do: Chưa đủ sức khỏe
          }
      }
      
      const updatedRecruit = { 
          ...recruit, 
          physical: { ...recruit.physical, healthGrade: grade },
          status: newStatus,
          defermentReason: newReason
      };

      // Nếu bị chuyển về không đạt, xóa phân loại chính thức/dự bị
      if (newStatus === RecruitmentStatus.MED_EXAM_FAILED) {
          updatedRecruit.enlistmentType = undefined;
      }

      onUpdate(updatedRecruit);
  };

  // New Helper: Update Reason Inline (For List 8, 9)
  const handleReasonChange = (recruit: Recruit, reason: string) => {
      onUpdate({ ...recruit, defermentReason: reason });
  };

  // Helper for Gifted column change
  const handleGiftedChange = (recruit: Recruit, val: string) => {
      onUpdate({ ...recruit, details: { ...recruit.details, gifted: val } });
  };

  const renderActions = (recruit: Recruit) => {
      if (isReadOnly) return null;

      switch (activeTabId) {
          case 'ALL': // List 4
              return (
                  <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa">
                          <FileEdit size={16} />
                      </button>
                      <button 
                          onClick={() => {
                              setRecruitToRemove(recruit);
                              setRemoveReason(recruit.defermentReason || '');
                              setShowRemoveModal(true);
                          }} 
                          className={`p-1 rounded ${recruit.status === RecruitmentStatus.REMOVED_FROM_SOURCE ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`} 
                          title="Loại khỏi nguồn"
                      >
                          <UserX size={16} />
                      </button>
                      <button 
                          onClick={() => handleQuickStatusChange(recruit, RecruitmentStatus.EXEMPTED)} 
                          className={`p-1 rounded ${recruit.status === RecruitmentStatus.EXEMPTED ? 'bg-purple-100 text-purple-700' : 'text-purple-300 hover:bg-purple-50 hover:text-purple-600'}`} 
                          title="Miễn NVQS"
                      >
                          <ShieldCheck size={16} />
                      </button>
                      <button 
                          onClick={() => handleQuickStatusChange(recruit, RecruitmentStatus.DEFERRED)} 
                          className={`p-1 rounded ${recruit.status === RecruitmentStatus.DEFERRED ? 'bg-amber-100 text-amber-700' : 'text-amber-300 hover:bg-amber-50 hover:text-amber-600'}`} 
                          title="Tạm hoãn"
                      >
                          <PauseCircle size={16} />
                      </button>
                      <button 
                          onClick={() => handleQuickStatusChange(recruit, RecruitmentStatus.NOT_SELECTED_TT50)} 
                          className={`p-1 rounded ${recruit.status === RecruitmentStatus.NOT_SELECTED_TT50 ? 'bg-slate-200 text-slate-800' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-600'}`} 
                          title="Không tuyển chọn (TT50)"
                      >
                          <BookX size={16} />
                      </button>
                  </div>
              );

          case 'PRE_CHECK': // List 6
              return (
                  <div className="flex items-center justify-center gap-2">
                      <button 
                          onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.PRE_CHECK_PASSED })} 
                          className={`p-1.5 rounded-full border ${recruit.status === RecruitmentStatus.PRE_CHECK_PASSED ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                          title="Đạt sơ tuyển"
                      >
                          <CheckCircle2 size={16} />
                      </button>
                      <button 
                          onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.PRE_CHECK_FAILED })} 
                          className={`p-1.5 rounded-full border ${recruit.status === RecruitmentStatus.PRE_CHECK_FAILED ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-50'}`}
                          title="Không đạt sơ tuyển"
                      >
                          <XCircle size={16} />
                      </button>
                  </div>
              );

          case 'MED_EXAM': // List 7 - Toggle Switch for Finalize
              if (recruit.physical.healthGrade && recruit.physical.healthGrade <= 3) {
                  const isFinalized = [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED].includes(recruit.status);
                  return (
                      <button
                          onClick={() => {
                              if (isFinalized) {
                                  // Toggle Off: Revert to Exam Passed, clear enlistment info
                                  onUpdate({ ...recruit, status: RecruitmentStatus.MED_EXAM_PASSED, enlistmentType: undefined });
                              } else {
                                  // Toggle On: Move to Finalized (List 10), BUT clear enlistmentType (not default Official)
                                  onUpdate({ ...recruit, status: RecruitmentStatus.FINALIZED, enlistmentType: undefined });
                              }
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm w-28 justify-center ${
                              isFinalized
                                  ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                                  : 'bg-white text-gray-400 border-gray-300 hover:border-green-500 hover:text-green-600'
                          }`}
                          title={isFinalized ? "Hủy chốt (Quay lại Đạt sức khỏe)" : "Chốt hồ sơ sang Danh sách 10"}
                      >
                          {isFinalized ? (
                              <>
                                  <CheckCircle2 size={14} /> <span>Đã chốt</span>
                              </>
                          ) : (
                              <>
                                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 group-hover:border-green-600"></div> <span>Chốt HS</span>
                              </>
                          )}
                      </button>
                  );
              }
              return <span className="text-gray-300 text-xs italic">Chưa đủ ĐK</span>;

          case 'FINAL': // List 10
          case 'FINAL_OFFICIAL':
          case 'FINAL_RESERVE':
              return (
                  <div className="flex items-center justify-center gap-1">
                       <button 
                          onClick={() => onUpdate({ ...recruit, enlistmentType: 'OFFICIAL' })}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${recruit.enlistmentType === 'OFFICIAL' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-500 border-gray-300 hover:border-red-400 hover:text-red-500'}`}
                          title="Chọn Chính thức"
                       >
                          Chính thức
                       </button>
                       <button 
                          onClick={() => onUpdate({ ...recruit, enlistmentType: 'RESERVE' })}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${recruit.enlistmentType === 'RESERVE' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-300 hover:border-teal-400 hover:text-teal-500'}`}
                          title="Chọn Dự bị"
                       >
                          Dự bị
                       </button>
                  </div>
              );

          case 'DEFERRED_LIST': // List 8
          case 'DEFERRED_HEALTH':
          case 'DEFERRED_EDUCATION':
          case 'DEFERRED_POLICY':
          case 'DEFERRED_DQTT':
          case 'EXEMPTED_LIST': // List 9
          case 'REMOVED': // List 12
          case 'REMAINING': // List 13
              return (
                  <div className="flex items-center justify-center">
                      <button 
                          onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.SOURCE })} 
                          className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-600 hover:text-blue-600 hover:border-blue-300"
                          title="Khôi phục về Nguồn (DS 4)"
                      >
                          <Undo2 size={14} /> Khôi phục
                      </button>
                  </div>
              );

          case 'FIRST_TIME_REG': // List 3
          case 'NOT_ALLOWED_REG': // List 1
          case 'EXEMPT_REG': // List 2
              return (
                  <div className="flex items-center justify-center">
                      <button onClick={() => handleEdit(recruit)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa">
                          <FileEdit size={16} />
                      </button>
                  </div>
              );

          default: 
              return <span className="text-gray-300">-</span>;
      }
  };

  const isDeferredOrExemptedTab = activeTabId === 'DEFERRED_LIST' || activeTabId === 'EXEMPTED_LIST' || activeTabId.startsWith('DEFERRED_');
  
  // Specific checks for required columns
  const isList7 = activeTabId.startsWith('MED_EXAM');
  const isList8 = activeTabId.startsWith('DEFERRED_') || activeTabId === 'DEFERRED_LIST';
  const isList9 = activeTabId === 'EXEMPTED_LIST';
  const isList12 = activeTabId === 'REMOVED';
  const isList11 = activeTabId === 'ENLISTED'; // Check for List 11

  const communeList = useMemo(() => {
    if (!filterProvince) return [];
    // @ts-ignore
    const data = LOCATION_DATA[filterProvince];
    return data ? Object.keys(data) : [];
  }, [filterProvince]);

  const handleExportCSV = () => {
    const headers = ["STT", "Họ tên", "CCCD", "Ngày sinh", "Địa chỉ", "Học vấn", "Sức khỏe", "Trạng thái", "Năng khiếu", "Chi tiết"];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + headers.join(",") + "\n"
        + filteredRecruits.map((r, i) => {
            const row = [
                i + 1,
                `"${r.fullName}"`,
                `"${r.citizenId || ''}"`,
                `"${r.dob}"`,
                `"${r.address.village}, ${r.address.commune}"`,
                `"${r.details.education}"`,
                r.physical.healthGrade || '',
                `"${getStatusLabel(r.status)}"`,
                `"${r.details.gifted || ''}"`,
                `"${r.defermentReason || ''}"`
            ];
            return row.join(",");
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DS_TuyenQuan_${sessionYear}_${activeTab.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Define Lists where Adding Citizen is allowed
  const ALLOW_ADD_CITIZEN_TABS = ['NOT_ALLOWED_REG', 'EXEMPT_REG', 'FIRST_TIME_REG', 'ALL'];

  return (
    <div className="flex flex-col h-full gap-4">
        {/* HEADER: TITLE & ADMIN FILTERS */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold uppercase text-gray-800 tracking-tight">
                Quản lý công dân nhập ngũ {sessionYear + 1}
            </h2>
            {isAdmin && (
                <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-2 text-gray-700 font-bold whitespace-nowrap text-sm uppercase">
                        <Filter size={16} /> Phạm vi:
                    </div>
                    <select 
                        className="border border-gray-300 rounded p-1.5 text-sm"
                        value={filterProvince}
                        onChange={(e) => { setFilterProvince(e.target.value); setFilterCommune(''); }}
                    >
                        <option value="">-- Cả nước --</option>
                        {PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select 
                        className="border border-gray-300 rounded p-1.5 text-sm disabled:bg-gray-100"
                        value={filterCommune}
                        onChange={(e) => setFilterCommune(e.target.value)}
                        disabled={!filterProvince}
                    >
                        <option value="">-- Toàn tỉnh --</option>
                        {communeList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            )}
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
             {/* LEFT SIDEBAR */}
             <div className="w-full md:w-64 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto custom-scrollbar flex flex-col">
                 <div className="p-3 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 text-sm uppercase">Danh sách quản lý</div>
                 <div className="p-2 space-y-1">
                     {visibleTabs.map(tab => (
                         <button
                             key={tab.id}
                             onClick={() => handleTabChange(tab.id)}
                             title={tab.label}
                             className={`w-full text-left px-2 py-2.5 rounded-r-lg border-l-4 transition-all flex items-center gap-2 mb-1 shadow-sm
                                 ${activeTabId === tab.id 
                                     ? `${tab.color} ${tab.borderColor} text-white` 
                                     : `${tab.lightColor} ${tab.textColor} ${tab.borderColor} hover:opacity-80`
                                 }
                                 ${'isSub' in tab ? 'pl-6' : ''}
                             `}
                         >
                             <tab.icon size={16} className={`shrink-0 ${activeTabId === tab.id ? 'text-white' : tab.textColor}`} />
                             <span className="font-bold text-[11px] uppercase whitespace-nowrap truncate">{tab.label}</span>
                         </button>
                     ))}
                 </div>
             </div>

             {/* MAIN CONTENT AREA */}
             <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
                 {/* Toolbar */}
                 <div className="p-4 border-b border-gray-200">
                     <div className="flex flex-col gap-4">
                         {/* Title & Stats */}
                         <div className="flex justify-between items-start">
                             <div>
                                 <h3 className={`text-lg font-bold flex items-center gap-2 ${activeTab.textColor}`}>
                                     <activeTab.icon size={20} /> {activeTab.label}
                                 </h3>
                                 <p className="text-sm text-gray-500 mt-1">Quản lý danh sách và hồ sơ chi tiết</p>
                             </div>
                             <div className="flex gap-2">
                                {/* Only show 'Thêm công dân' for Lists 1, 2, 3, 4 */}
                                {!isReadOnly && ALLOW_ADD_CITIZEN_TABS.includes(activeTabId) && (
                                    <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-military-700 text-white rounded hover:bg-military-800 text-sm font-bold shadow-sm">
                                        <Plus size={16} /> Thêm công dân
                                    </button>
                                )}
                             </div>
                         </div>

                         {/* Search & Filter Bar */}
                         <div className="flex flex-col md:flex-row gap-2 items-center bg-gray-50 p-2 rounded border border-gray-100">
                             <div className="relative flex-1 w-full">
                                 <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                 <input 
                                     type="text" 
                                     placeholder="Tên, số CCCD..." 
                                     className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-military-500"
                                     value={searchTerm}
                                     onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                 />
                             </div>
                             <div className="w-full md:w-auto flex items-center gap-2">
                                <input type="text" placeholder="Nhập tên thôn/ấp..." className="p-2 border border-gray-300 rounded text-sm w-full md:w-40" />
                                <select className="p-2 border border-gray-300 rounded text-sm w-full md:w-40">
                                    <option>-- Tất cả --</option>
                                    <option>18-25 tuổi</option>
                                    <option>26-27 tuổi</option>
                                </select>
                                <button className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-100 text-sm font-bold whitespace-nowrap flex items-center gap-1">
                                    <Filter size={14}/> Bộ lọc khác
                                </button>
                                <button onClick={() => {setSearchTerm(''); setCurrentPage(1);}} className="p-2 text-gray-500 hover:text-military-600" title="Làm mới">
                                    <RefreshCw size={16}/>
                                </button>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Table Data */}
                 <div className="flex-1 overflow-auto">
                     {filteredRecruits.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                             <ShieldOff size={48} className="mb-3 opacity-20" />
                             <p className="text-lg font-medium">Không tìm thấy dữ liệu</p>
                             <p className="text-sm">Vui lòng thử lại với bộ lọc khác</p>
                             {(searchTerm || filterProvince || filterCommune) && (
                                <button onClick={() => { setSearchTerm(''); setFilterProvince(''); setFilterCommune(''); }} className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-bold">
                                    Xóa bộ lọc
                                </button>
                             )}
                         </div>
                     ) : (
                         <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 text-xs uppercase text-gray-600 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-3 border-b border-gray-200 w-10 text-center">#</th>
                                    <th className="p-3 border-b border-gray-200">Họ Tên / CCCD</th>
                                    <th className="p-3 border-b border-gray-200">Ngày sinh / Địa chỉ</th>
                                    <th className="p-3 border-b border-gray-200">Học vấn / Nghề nghiệp</th>
                                    <th className="p-3 border-b border-gray-200 text-center">{isList7 ? 'PL Sức khỏe (Chọn)' : 'Sức khỏe'}</th>
                                    {isList11 && <th className="p-3 border-b border-gray-200 text-center">Năng khiếu</th>}
                                    <th className="p-3 border-b border-gray-200 text-center">
                                        {(isList8 || isList9) ? 'Lý do (Chọn)' : isList12 ? 'Lý do loại' : (isDeferredOrExemptedTab ? 'Trạng thái / Lý do' : 'Trạng thái')}
                                    </th>
                                    <th className="p-3 border-b border-gray-200 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100">
                                {paginatedRecruits.map((r, idx) => (
                                    <tr key={r.id} className="hover:bg-blue-50/30 group transition-colors">
                                        <td className="p-3 text-center text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                                        <td className="p-3">
                                            <div className="font-bold text-gray-900">{r.fullName}</div>
                                            <div className="text-xs text-gray-500 font-mono tracking-wide">{r.citizenId || '---'}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-medium text-gray-800">{r.dob.split('-')[0]} ({checkAge(r)} tuổi)</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[150px]" title={`${r.address.village}, ${r.address.commune}`}>, {r.address.commune}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-medium text-gray-800">{r.details.education}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[100px]">{r.details.job || '---'}</div>
                                        </td>
                                        <td className="p-3 text-center">
                                            {isList7 && !isReadOnly ? (
                                                <select 
                                                    className={`p-1 rounded border text-xs font-bold ${
                                                        (r.physical.healthGrade || 0) >= 1 && (r.physical.healthGrade || 0) <= 3 ? 'text-green-700 border-green-200 bg-green-50' : 
                                                        (r.physical.healthGrade || 0) >= 4 ? 'text-red-700 border-red-200 bg-red-50' : 'text-gray-500 border-gray-200'
                                                    }`}
                                                    value={r.physical.healthGrade || 0}
                                                    onChange={(e) => handleHealthGradeChange(r, Number(e.target.value))}
                                                >
                                                    <option value="0">--</option>
                                                    <option value="1">Loại 1</option>
                                                    <option value="2">Loại 2</option>
                                                    <option value="3">Loại 3</option>
                                                    <option value="4">Loại 4</option>
                                                    <option value="5">Loại 5</option>
                                                    <option value="6">Loại 6</option>
                                                </select>
                                            ) : (
                                                r.physical.healthGrade ? (
                                                    <span className={`inline-block w-8 h-8 leading-8 rounded-full text-xs font-bold ${
                                                        r.physical.healthGrade === 1 ? 'bg-emerald-100 text-emerald-700' :
                                                        r.physical.healthGrade === 2 ? 'bg-green-100 text-green-700' :
                                                        r.physical.healthGrade === 3 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {r.physical.healthGrade}
                                                    </span>
                                                ) : <span className="text-gray-300">...</span>
                                            )}
                                        </td>
                                        
                                        {isList11 && (
                                            <td className="p-3 text-center">
                                                {isReadOnly ? (
                                                    <span className="text-xs">{r.details.gifted || '---'}</span>
                                                ) : (
                                                    <TableInput 
                                                        value={r.details.gifted || ''} 
                                                        onSave={(val) => handleGiftedChange(r, val)} 
                                                        placeholder="Nhập..."
                                                    />
                                                )}
                                            </td>
                                        )}

                                        <td className="p-3 text-center">
                                             <div className="flex flex-col items-center">
                                                 {(isList8 || isList9) && !isReadOnly ? (
                                                     <select
                                                        className="w-full max-w-[200px] p-1 border border-gray-300 rounded text-xs truncate"
                                                        value={r.defermentReason || ''}
                                                        onChange={(e) => handleReasonChange(r, e.target.value)}
                                                        title={r.defermentReason}
                                                     >
                                                         <option value="">-- Chọn lý do --</option>
                                                         {(isList8 ? LEGAL_DEFERMENT_REASONS : LEGAL_EXEMPTION_REASONS).map((reason, idx) => (
                                                             <option key={idx} value={reason} title={reason}>{reason}</option>
                                                         ))}
                                                     </select>
                                                 ) : isList12 && !isReadOnly ? (
                                                     <input
                                                        type="text"
                                                        className="w-full max-w-[200px] p-1 border border-gray-300 rounded text-xs"
                                                        value={r.defermentReason || ''}
                                                        placeholder="Nhập lý do loại..."
                                                        onChange={(e) => handleReasonChange(r, e.target.value)}
                                                     />
                                                 ) : (
                                                     <>
                                                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusColor(r.status)}`}>
                                                             {getStatusLabel(r.status)}
                                                         </span>
                                                         {r.enlistmentType && (r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && (
                                                             <span className={`text-[9px] mt-0.5 font-bold uppercase ${r.enlistmentType === 'OFFICIAL' ? 'text-red-600' : 'text-teal-600'}`}>
                                                                 ({r.enlistmentType === 'OFFICIAL' ? 'Chính thức' : 'Dự bị'})
                                                             </span>
                                                         )}
                                                         {r.defermentReason && (
                                                             <span className="text-[10px] text-gray-500 mt-1 max-w-[200px] italic leading-tight" title={r.defermentReason}>
                                                                 {r.defermentReason}
                                                             </span>
                                                         )}
                                                     </>
                                                 )}
                                             </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            {renderActions(r)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                     )}
                 </div>

                 {/* Pagination & Export */}
                 <div className="p-3 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-lg">
                     <div className="text-xs text-gray-500 italic">
                         Hiển thị {paginatedRecruits.length} / {filteredRecruits.length} hồ sơ <span className="hidden md:inline">- Dữ liệu năm {sessionYear}</span>
                     </div>
                     
                     <div className="flex items-center gap-3">
                         {filteredRecruits.length > 0 && (
                            <button onClick={handleExportCSV} className="text-xs font-bold text-gray-600 hover:text-military-700 flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 rounded shadow-sm">
                                <Download size={12}/> Xuất Excel
                            </button>
                         )}

                         {totalPages > 1 && (
                             <div className="flex gap-1">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="p-1 rounded hover:bg-white disabled:opacity-50"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-bold leading-6 px-2">{currentPage} / {totalPages}</span>
                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="p-1 rounded hover:bg-white disabled:opacity-50"
                                >
                                    <ChevronRight size={16} />
                                </button>
                             </div>
                         )}
                     </div>
                 </div>
             </div>
        </div>

        {/* RECRUIT FORM MODAL */}
        {showForm && (
            <RecruitForm 
                initialData={editingRecruit}
                initialStatus={
                    activeTabId === 'NOT_ALLOWED_REG' ? RecruitmentStatus.NOT_ALLOWED_REGISTRATION :
                    activeTabId === 'EXEMPT_REG' ? RecruitmentStatus.EXEMPT_REGISTRATION :
                    activeTabId === 'FIRST_TIME_REG' ? RecruitmentStatus.SOURCE :
                    undefined
                }
                user={user}
                onSubmit={handleSave}
                onClose={() => setShowForm(false)}
                sessionYear={sessionYear}
            />
        )}

        {/* REMOVE REASON MODAL */}
        {showRemoveModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" /> Xác nhận Loại khỏi nguồn
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Vui lòng nhập lý do loại công dân <span className="font-bold text-gray-800">{recruitToRemove?.fullName}</span> khỏi nguồn NVQS:
                    </p>
                    <textarea 
                        className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none mb-4"
                        rows={3}
                        placeholder="Ví dụ: Chuyển khẩu đi nơi khác, Đã chết, Hết tuổi..."
                        value={removeReason}
                        onChange={(e) => setRemoveReason(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => { setShowRemoveModal(false); setRecruitToRemove(null); setRemoveReason(''); }}
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm font-bold hover:bg-gray-50"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleConfirmRemove}
                            disabled={!removeReason.trim()}
                            className="px-4 py-2 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Xác nhận Loại
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

export default RecruitManagement;