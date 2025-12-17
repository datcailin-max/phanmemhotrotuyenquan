
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Recruit, RecruitmentStatus, User } from '../types';
import { LOCATION_DATA, PROVINCES_VN, removeVietnameseTones, LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS, EDUCATIONS } from '../constants';
import RecruitForm from '../components/RecruitForm';
import { 
  Search, Plus, CheckCircle2, XCircle, FileEdit, Stethoscope, ClipboardList, Filter,
  PauseCircle, Users, FileSignature, UserX, Flag, Layers, ShieldCheck, 
  ChevronRight, BookX, ArrowRightCircle,
  Ban, Shield, ChevronLeft, Download, ShieldOff, RefreshCw, Undo2, Ban as BanIcon,
  HeartPulse, GraduationCap, Scale, Tent, ToggleLeft, ToggleRight, AlertTriangle,
  Calendar, UserPlus, Trash2, Copy, Import
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
  { id: 'FIRST_TIME_REG', label: '3. DS ĐĂNG KÝ NVQS LẦN ĐẦU', status: [RecruitmentStatus.FIRST_TIME_REGISTRATION], color: 'bg-cyan-600', lightColor: 'bg-cyan-50', borderColor: 'border-cyan-600', textColor: 'text-cyan-900', icon: UserPlus },
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
  { id: 'REMOVED', label: '12. DS LOẠI KHỎI NGUỒN', status: [RecruitmentStatus.REMOVED_FROM_SOURCE], color: 'bg-gray-400', lightColor: 'bg-gray-100', borderColor: 'border-gray-400', textColor: 'text-gray-600', icon: UserX },
  { id: 'REMAINING', label: '13. DS NGUỒN CÒN LẠI', status: null, color: 'bg-teal-600', lightColor: 'bg-teal-50', borderColor: 'border-teal-600', textColor: 'text-teal-900', icon: Layers },
  { id: 'NEXT_YEAR_SOURCE', label: '14. NGUỒN CỦA NĂM SAU', status: null, color: 'bg-cyan-600', lightColor: 'bg-cyan-50', borderColor: 'border-cyan-600', textColor: 'text-cyan-900', icon: Calendar },
  { id: 'DELETED_LIST', label: '15. DS ĐÃ XÓA', status: [RecruitmentStatus.DELETED], color: 'bg-black', lightColor: 'bg-gray-200', borderColor: 'border-black', textColor: 'text-gray-900', icon: Trash2 },
];

const ITEMS_PER_PAGE = 10;

// Helper function to get status label
const getStatusLabel = (status: RecruitmentStatus) => {
    switch (status) {
        case RecruitmentStatus.NOT_ALLOWED_REGISTRATION: return 'Cấm ĐK';
        case RecruitmentStatus.EXEMPT_REGISTRATION: return 'Miễn ĐK';
        case RecruitmentStatus.FIRST_TIME_REGISTRATION: return 'ĐK Lần đầu';
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
        case RecruitmentStatus.DELETED: return 'Đã xóa';
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
        case RecruitmentStatus.FIRST_TIME_REGISTRATION:
            return 'bg-cyan-50 text-cyan-700 border-cyan-200';
        case RecruitmentStatus.DELETED:
            return 'bg-gray-100 text-gray-500 border-gray-300 line-through';
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
  
  // Removal Reason Modal State (Soft Delete - List 12)
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [recruitToRemove, setRecruitToRemove] = useState<Recruit | null>(null);
  const [removeReason, setRemoveReason] = useState('');

  // Admin Filters
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCommune, setFilterCommune] = useState('');

  // Local Filters (Village, Age, Advanced)
  const [filterVillage, setFilterVillage] = useState('');
  const [filterAgeRange, setFilterAgeRange] = useState('');
  
  // Advanced Filters Popover State
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advFilterEducation, setAdvFilterEducation] = useState('');
  const [advFilterHealth, setAdvFilterHealth] = useState('');
  const [advFilterPolitical, setAdvFilterPolitical] = useState('');
  const advancedFilterRef = useRef<HTMLDivElement>(null);

  const isAdmin = user.role === 'ADMIN';
  const isProvinceAdmin = user.role === 'PROVINCE_ADMIN';
  const isReadOnly = user.role === 'VIEWER' || isProvinceAdmin;

  // Close advanced filter on outside click
  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (advancedFilterRef.current && !advancedFilterRef.current.contains(event.target as Node)) {
              setShowAdvancedFilter(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [advancedFilterRef]);

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
        RecruitmentStatus.EXEMPT_REGISTRATION,
        RecruitmentStatus.DELETED
    ].includes(status);
  };

  // Filter Recruits based on User Scope and Admin Filters
  const scopeRecruits = useMemo(() => {
      let filtered = recruits.filter(r => r.recruitmentYear === sessionYear);

      // Exclude test data for Admin
      if (isAdmin) {
          filtered = filtered.filter(r => r.address.province !== 'Tỉnh THUNGHIEM');
      }
      
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
          case 'ALL': // List 4 (Modified to include Removed Recruits but exclude List 1, 2, 3)
              result = result.filter(r => {
                  if (checkAge(r) < 18) return false;
                  // Exclude List 1, 2, 3 and Deleted
                  if (r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || 
                      r.status === RecruitmentStatus.EXEMPT_REGISTRATION ||
                      r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION ||
                      r.status === RecruitmentStatus.DELETED) return false;
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
                  RecruitmentStatus.EXEMPT_REGISTRATION,
                  RecruitmentStatus.FIRST_TIME_REGISTRATION,
                  RecruitmentStatus.DELETED
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

          case 'REMAINING': // List 13: List 4 - List 11 - List 12
              result = result.filter(r => {
                  // 1. Phải là >= 18 tuổi (Thuộc List 4, Trừ List 3)
                  if (checkAge(r) < 18) return false;

                  // 2. Trừ List 1, 2, 3 and Deleted
                  if (r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || 
                      r.status === RecruitmentStatus.EXEMPT_REGISTRATION ||
                      r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION ||
                      r.status === RecruitmentStatus.DELETED) return false;

                  // 3. Trừ List 12 (Loại khỏi nguồn)
                  if (r.status === RecruitmentStatus.REMOVED_FROM_SOURCE) return false;

                  // 4. Trừ List 11 (Nhập ngũ/Chốt Chính thức)
                  if ((r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL') return false;

                  return true;
              });
              break;

          case 'NEXT_YEAR_SOURCE': // List 14: Combine List 3 and List 13
              result = result.filter(r => {
                  if (r.status === RecruitmentStatus.REMOVED_FROM_SOURCE || r.status === RecruitmentStatus.DELETED) return false;
                  
                  // Logic from List 3
                  if (r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION) return true;

                  // Logic from List 13 (Remaining >= 18)
                  if (checkAge(r) < 18) return false;
                  if (r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || r.status === RecruitmentStatus.EXEMPT_REGISTRATION) return false;
                  if ((r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL') return false;
                  
                  return true;
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

      // NEW: Filter by Village
      if (filterVillage) {
          const v = removeVietnameseTones(filterVillage.toLowerCase());
          result = result.filter(r => removeVietnameseTones((r.address.village || '').toLowerCase()).includes(v));
      }

      // NEW: Filter by Age Range
      if (filterAgeRange) {
          result = result.filter(r => {
              const age = checkAge(r);
              if (filterAgeRange === '18-25') return age >= 18 && age <= 25;
              if (filterAgeRange === '26-27') return age >= 26 && age <= 27;
              return true;
          });
      }

      // NEW: Advanced Filters
      if (advFilterEducation) {
           result = result.filter(r => r.details.education === advFilterEducation);
      }
      if (advFilterHealth) {
           result = result.filter(r => r.physical.healthGrade === Number(advFilterHealth));
      }
      if (advFilterPolitical) {
           result = result.filter(r => r.details.politicalStatus === advFilterPolitical);
      }

      return result;
  }, [scopeRecruits, activeTabId, searchTerm, activeTab, sessionYear, filterVillage, filterAgeRange, advFilterEducation, advFilterHealth, advFilterPolitical]);

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

  // Logic to transfer data from previous year for List 1 AND List 2
  const handleTransferFromPreviousYear = async (targetStatus: RecruitmentStatus) => {
      const prevYear = sessionYear - 1;
      const listName = targetStatus === RecruitmentStatus.NOT_ALLOWED_REGISTRATION ? "Danh sách 1 (Cấm ĐK)" : "Danh sách 2 (Miễn ĐK)";

      // 1. Determine scope filter (similar to scopeRecruits but for prevYear)
      let sourceData = recruits.filter(r => r.recruitmentYear === prevYear);

      if (!isAdmin) {
          if (user.unit.province && user.unit.commune) {
              sourceData = sourceData.filter(r =>
                  r.address.province === user.unit.province &&
                  r.address.commune === user.unit.commune
              );
          } else if (isProvinceAdmin && user.unit.province) {
               sourceData = sourceData.filter(r => r.address.province === user.unit.province);
          }
      } else {
          // Admin filters
          if (filterProvince) sourceData = sourceData.filter(r => r.address.province === filterProvince);
          if (filterCommune) sourceData = sourceData.filter(r => r.address.commune === filterCommune);
      }

      // 2. Filter for List 1 or List 2 status
      const prevList = sourceData.filter(r => r.status === targetStatus);

      if (prevList.length === 0) {
          alert(`Không tìm thấy công dân thuộc ${listName} trong năm ${prevYear} (tại đơn vị/phạm vi này).`);
          return;
      }

      if (!window.confirm(`Tìm thấy ${prevList.length} hồ sơ trong ${listName} năm ${prevYear}. Bạn có muốn chuyển sang năm ${sessionYear}? (Hệ thống sẽ giữ nguyên danh sách hiện có và chỉ thêm mới các trường hợp chưa có trong năm nay).`)) {
          return;
      }

      let count = 0;
      // 3. Iterate and Copy (Merge Strategy)
      for (const oldRecruit of prevList) {
          // Check for duplicate in CURRENT year based on citizenId
          const exists = recruits.find(r =>
              r.recruitmentYear === sessionYear &&
              r.citizenId === oldRecruit.citizenId
          );

          if (!exists) {
              const newRecruit: Recruit = {
                  ...oldRecruit,
                  id: Date.now().toString(36) + Math.random().toString(36).substring(2) + `_${count}`, // Ensure unique ID
                  recruitmentYear: sessionYear,
                  // We keep the status and reason as is from prev year
                  createdAt: undefined,
                  updatedAt: undefined
              };
              onUpdate(newRecruit); // Call the prop which calls API
              count++;
          }
          // If exists, do nothing (preserve current data)
      }

      if (count > 0) {
          alert(`Đã bổ sung thành công ${count} hồ sơ sang năm ${sessionYear}.`);
      } else {
          alert(`Tất cả hồ sơ từ năm ${prevYear} đã tồn tại trong năm ${sessionYear}. Không có dữ liệu mới được thêm.`);
      }
  };

  // Logic for importing List 14 from previous year (To populate List 4)
  const handleImportFromList14 = async () => {
      const prevYear = sessionYear - 1;
      
      // 1. Get previous year data (filtered by scope)
      let sourceData = recruits.filter(r => r.recruitmentYear === prevYear);

      if (!isAdmin) {
          if (user.unit.province && user.unit.commune) {
              sourceData = sourceData.filter(r =>
                  r.address.province === user.unit.province &&
                  r.address.commune === user.unit.commune
              );
          } else if (isProvinceAdmin && user.unit.province) {
               sourceData = sourceData.filter(r => r.address.province === user.unit.province);
          }
      } else {
          if (filterProvince) sourceData = sourceData.filter(r => r.address.province === filterProvince);
          if (filterCommune) sourceData = sourceData.filter(r => r.address.commune === filterCommune);
      }

      // 2. Identify List 14 Candidates (from previous year's context)
      // List 14 = First Time Reg + Remaining Source
      // Logic mirrors 'NEXT_YEAR_SOURCE' in filteredRecruits
      const list14Candidates = sourceData.filter(r => {
          if (r.status === RecruitmentStatus.REMOVED_FROM_SOURCE || r.status === RecruitmentStatus.DELETED) return false;
          
          // Logic from List 3
          if (r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION) return true;

          // Logic from List 13 (Remaining >= 18) - but using prev year status
          // Filter out excluded lists (1, 2) and Enlisted (11)
          if (r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION || r.status === RecruitmentStatus.EXEMPT_REGISTRATION) return false;
          if ((r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL') return false;
          
          return true;
      });

      if (list14Candidates.length === 0) {
          alert(`Không tìm thấy dữ liệu "Nguồn của năm sau" (List 14) từ năm ${prevYear}.`);
          return;
      }

      if (!window.confirm(`Tìm thấy ${list14Candidates.length} hồ sơ trong List 14 năm ${prevYear}. Bạn có muốn nhập vào năm ${sessionYear}? (Trạng thái sẽ được reset về Nguồn, trừ các trường hợp Tạm hoãn/Miễn/TT50).`)) {
          return;
      }

      let count = 0;
      for (const oldRecruit of list14Candidates) {
          // Check Duplicate
          const exists = recruits.find(r => r.recruitmentYear === sessionYear && r.citizenId === oldRecruit.citizenId);
          if (exists) continue;

          // Determine New Status
          let newStatus = RecruitmentStatus.SOURCE;
          let newReason = ''; 

          // Exceptions: Keep status for Exempt, Deferred, TT50
          if (oldRecruit.status === RecruitmentStatus.EXEMPTED ||
              oldRecruit.status === RecruitmentStatus.DEFERRED ||
              oldRecruit.status === RecruitmentStatus.NOT_SELECTED_TT50) {
              newStatus = oldRecruit.status;
              newReason = oldRecruit.defermentReason || '';
          }

          const newRecruit: Recruit = {
              ...oldRecruit,
              id: Date.now().toString(36) + Math.random().toString(36).substring(2) + `_${count}`,
              recruitmentYear: sessionYear,
              status: newStatus,
              defermentReason: newReason,
              // If status is SOURCE, reset health grade to 0 (Need re-check)
              // If status is DEFERRED/EXEMPTED, we might keep health if it was the reason, 
              // but since we copy the object, health info is preserved. 
              // We only explicitly reset healthGrade if moving to SOURCE to indicate "Unchecked".
              physical: {
                  ...oldRecruit.physical,
                  healthGrade: newStatus === RecruitmentStatus.SOURCE ? 0 : oldRecruit.physical.healthGrade
              },
              createdAt: undefined,
              updatedAt: undefined,
              // Clear old enlistment info
              enlistmentDate: undefined,
              enlistmentUnit: undefined,
              enlistmentType: 'OFFICIAL' // Default back
          };

          onUpdate(newRecruit);
          count++;
      }

      if (count > 0) {
          alert(`Đã nhập thành công ${count} hồ sơ từ năm ${prevYear}.`);
      } else {
          alert(`Dữ liệu từ năm ${prevYear} đã được đồng bộ đầy đủ trước đó.`);
      }
  };

  // Logic to Empty Trash (Permanently Delete List 15)
  const handleEmptyTrash = async () => {
      // The filteredRecruits here are already filtered by DELETED_LIST active tab and user scope
      // So we can safely iterate over them.
      const trashCount = filteredRecruits.length;
      
      if (trashCount === 0) {
          alert("Thùng rác đang trống.");
          return;
      }

      if (!window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn ${trashCount} hồ sơ trong thùng rác? Hành động này KHÔNG THỂ khôi phục!`)) {
          return;
      }

      const inputPass = prompt("Vui lòng nhập mật khẩu để xác nhận xóa vĩnh viễn:");
      if (!inputPass || inputPass !== user.password) {
          alert("Mật khẩu không đúng! Không thể thực hiện hành động này.");
          return;
      }

      // Iterate and Delete
      for (const r of filteredRecruits) {
          onDelete(r.id);
      }
      
      alert(`Đã xóa vĩnh viễn ${trashCount} hồ sơ khỏi hệ thống.`);
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

  // List of Tab IDs where adding new citizens is allowed (1, 2, 3, 4)
  const ALLOWED_ADD_TABS = ['NOT_ALLOWED_REG', 'EXEMPT_REG', 'FIRST_TIME_REG', 'ALL'];

  const renderActions = (recruit: Recruit) => {
      if (isReadOnly) return null;

      switch (activeTabId) {
          case 'NOT_ALLOWED_REG': // List 1
          case 'EXEMPT_REG': // List 2
              return (
                  <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa">
                          <FileEdit size={16} />
                      </button>
                      <button 
                          onClick={() => {
                              onUpdate({ 
                                  ...recruit, 
                                  status: RecruitmentStatus.FIRST_TIME_REGISTRATION, 
                                  previousStatus: recruit.status // Lưu lại để có thể khôi phục
                              });
                          }} 
                          className="p-1 text-cyan-600 hover:bg-cyan-50 rounded" 
                          title="Chuyển sang ĐK Lần đầu"
                      >
                          <UserPlus size={16} />
                      </button>
                      <button 
                          onClick={() => {
                              if(window.confirm('Bạn có chắc chắn muốn chuyển hồ sơ này vào thùng rác (DS 15)?')) {
                                  onUpdate({ 
                                      ...recruit, 
                                      status: RecruitmentStatus.DELETED, 
                                      previousStatus: recruit.status 
                                  });
                              }
                          }} 
                          className="p-1 text-red-500 hover:bg-red-50 rounded" 
                          title="Xóa (Chuyển sang DS 15)"
                      >
                          <Trash2 size={16} />
                      </button>
                  </div>
              );

          case 'FIRST_TIME_REG': // List 3
              return (
                  <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa">
                          <FileEdit size={16} />
                      </button>
                      <button 
                          onClick={() => {
                              // Khôi phục về trạng thái cũ hoặc về Nguồn nếu không có trạng thái cũ
                              onUpdate({ 
                                  ...recruit, 
                                  status: recruit.previousStatus || RecruitmentStatus.SOURCE, 
                                  previousStatus: undefined 
                              });
                          }} 
                          className="p-1 text-gray-500 hover:bg-gray-100 rounded" 
                          title="Khôi phục trạng thái cũ"
                      >
                          <Undo2 size={16} />
                      </button>
                      <button 
                          onClick={() => {
                              if(window.confirm('Bạn có chắc chắn muốn chuyển hồ sơ này vào thùng rác (DS 15)?')) {
                                  onUpdate({ 
                                      ...recruit, 
                                      status: RecruitmentStatus.DELETED, 
                                      previousStatus: recruit.status 
                                  });
                              }
                          }} 
                          className="p-1 text-red-500 hover:bg-red-50 rounded" 
                          title="Xóa (Chuyển sang DS 15)"
                      >
                          <Trash2 size={16} />
                      </button>
                  </div>
              );

          case 'ALL': // List 4
              return (
                  <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa">
                          <FileEdit size={16} />
                      </button>
                      <button 
                          onClick={() => {
                              if(window.confirm('Bạn có chắc chắn muốn chuyển hồ sơ này vào thùng rác (DS 15)?')) {
                                  onUpdate({ 
                                      ...recruit, 
                                      status: RecruitmentStatus.DELETED, 
                                      previousStatus: recruit.status 
                                  });
                              }
                          }} 
                          className="p-1 text-red-500 hover:bg-red-50 rounded" 
                          title="Xóa (Chuyển sang DS 15)"
                      >
                          <Trash2 size={16} />
                      </button>
                      <button 
                          onClick={() => {
                              setRecruitToRemove(recruit);
                              setRemoveReason(recruit.defermentReason || '');
                              setShowRemoveModal(true);
                          }} 
                          className={`p-1 rounded ${recruit.status === RecruitmentStatus.REMOVED_FROM_SOURCE ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`} 
                          title="Loại khỏi nguồn (Soft delete)"
                      >
                          <UserX size={16} />
                      </button>
                      
                      <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>

                      <button 
                          onClick={() => {
                              onUpdate({ 
                                  ...recruit, 
                                  status: RecruitmentStatus.NOT_SELECTED_TT50, 
                                  previousStatus: recruit.status 
                              });
                          }} 
                          className={`p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800`} 
                          title="Chưa tuyển chọn (TT50)"
                      >
                          <BookX size={16} />
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
                  </div>
              );
          
          case 'REMOVED':
               return (
                  <div className="flex items-center justify-center gap-1">
                      <button 
                          onClick={() => {
                              onUpdate({ 
                                  ...recruit, 
                                  status: RecruitmentStatus.SOURCE, 
                                  defermentReason: '' 
                              });
                          }} 
                          className="p-1 text-green-600 hover:bg-green-50 rounded" 
                          title="Khôi phục về Nguồn"
                      >
                          <Undo2 size={16} />
                      </button>
                  </div>
               );
          
          case 'DELETED_LIST':
               return (
                  <div className="flex items-center justify-center gap-1">
                      <button 
                          onClick={() => {
                              onUpdate({ 
                                  ...recruit, 
                                  status: recruit.previousStatus || RecruitmentStatus.SOURCE, 
                                  previousStatus: undefined 
                              });
                          }} 
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                          title="Khôi phục"
                      >
                          <Undo2 size={16} />
                      </button>
                  </div>
               );

          case 'TT50': // List 5
          case 'DEFERRED_LIST': // List 8
          case 'DEFERRED_HEALTH':
          case 'DEFERRED_EDUCATION':
          case 'DEFERRED_POLICY':
          case 'DEFERRED_DQTT':
          case 'EXEMPTED_LIST': // List 9
              return (
                  <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa">
                          <FileEdit size={16} />
                      </button>
                      <button 
                          onClick={() => {
                              // Khôi phục về Nguồn và xóa lý do
                              onUpdate({ 
                                  ...recruit, 
                                  status: RecruitmentStatus.SOURCE, 
                                  defermentReason: '' 
                              });
                          }} 
                          className="p-1 text-green-600 hover:bg-green-50 rounded" 
                          title="Khôi phục về Nguồn (Xóa lý do)"
                      >
                          <Undo2 size={16} />
                      </button>
                  </div>
              );

          default:
              return (
                  <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa">
                          <FileEdit size={16} />
                      </button>
                  </div>
              );
      }
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 1. SIDEBAR TABS (Left side) */}
      <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Danh sách quản lý</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {visibleTabs.map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-2 px-3 py-3 text-xs font-bold text-left rounded-md transition-all ${
                          activeTabId === tab.id 
                          ? `${tab.color} text-white shadow-md` 
                          : `${tab.lightColor} ${tab.textColor} hover:brightness-95`
                      }`}
                  >
                      {tab.icon && <tab.icon size={16} className="shrink-0" />}
                      <span className="line-clamp-2">{tab.label}</span>
                  </button>
              ))}
          </div>
      </div>

      {/* 2. MAIN CONTENT (Right side) */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
          
          {/* HEADER: Title & Actions */}
          <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shrink-0">
              <div>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${activeTab.textColor}`}>
                      {activeTab.icon && <activeTab.icon size={24} />} {activeTab.label}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Quản lý danh sách và hồ sơ chi tiết</p>
              </div>
              
              <div className="flex items-center gap-2">
                  {!isReadOnly && (
                    <>
                      {activeTabId === 'NOT_ALLOWED_REG' && (
                          <button onClick={() => handleTransferFromPreviousYear(RecruitmentStatus.NOT_ALLOWED_REGISTRATION)} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-bold shadow-sm">
                              <Import size={16}/> Lấy từ năm {sessionYear - 1}
                          </button>
                      )}
                      {activeTabId === 'EXEMPT_REG' && (
                          <button onClick={() => handleTransferFromPreviousYear(RecruitmentStatus.EXEMPT_REGISTRATION)} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-bold shadow-sm">
                              <Import size={16}/> Lấy từ năm {sessionYear - 1}
                          </button>
                      )}
                      {activeTabId === 'ALL' && (
                          <button onClick={handleImportFromList14} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-bold shadow-sm">
                              <Import size={16}/> Nhập từ List 14 ({sessionYear - 1})
                          </button>
                      )}
                      {activeTabId === 'DELETED_LIST' && (
                          <button onClick={handleEmptyTrash} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-bold shadow-sm">
                              <Trash2 size={16}/> Xóa toàn bộ (Cần mật khẩu)
                          </button>
                      )}

                      {ALLOWED_ADD_TABS.includes(activeTabId) && (
                          <button 
                              onClick={handleCreate} 
                              className="flex items-center gap-2 px-4 py-2 bg-military-800 text-white rounded-md font-bold hover:bg-military-900 shadow-sm text-sm"
                          >
                              <Plus size={16} /> Thêm công dân
                          </button>
                      )}
                    </>
                  )}
              </div>
          </div>

          {/* TOOLBAR: Filters */}
          <div className="p-3 border-b border-gray-200 bg-gray-50/50 flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input 
                      type="text" 
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-military-500 bg-white" 
                      placeholder="Tên, số CCCD..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              
              <input 
                  type="text"
                  className="border border-gray-300 rounded px-3 py-2 text-sm bg-white w-40"
                  placeholder="Nhập tên thôn/ấp..."
                  value={filterVillage}
                  onChange={(e) => setFilterVillage(e.target.value)}
              />

              <select
                    className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    value={filterAgeRange}
                    onChange={(e) => setFilterAgeRange(e.target.value)}
              >
                  <option value="">-- Tuổi --</option>
                  <option value="18-25">18 - 25</option>
                  <option value="26-27">26 - 27</option>
              </select>

              {/* Advanced Filter Button */}
              <div className="relative" ref={advancedFilterRef}>
                  <button 
                      onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                      className={`flex items-center gap-2 px-3 py-2 border rounded hover:bg-white text-sm font-medium ${showAdvancedFilter || advFilterEducation || advFilterHealth || advFilterPolitical ? 'border-military-500 text-military-700 bg-military-50' : 'border-gray-300 text-gray-600 bg-white'}`}
                  >
                      <Filter size={16} /> Bộ lọc khác
                  </button>
                  {showAdvancedFilter && (
                      <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg p-4 z-20 animate-in fade-in zoom-in-95">
                          <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase">Bộ lọc nâng cao</h4>
                          <div className="space-y-3">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">Trình độ</label>
                                  <select className="w-full border rounded p-1.5 text-sm" value={advFilterEducation} onChange={(e) => setAdvFilterEducation(e.target.value)}>
                                      <option value="">Tất cả</option>
                                      {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">Sức khỏe (Loại)</label>
                                  <select className="w-full border rounded p-1.5 text-sm" value={advFilterHealth} onChange={(e) => setAdvFilterHealth(e.target.value)}>
                                      <option value="">Tất cả</option>
                                      {[1,2,3,4,5,6].map(h => <option key={h} value={h}>Loại {h}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">Chính trị</label>
                                  <select className="w-full border rounded p-1.5 text-sm" value={advFilterPolitical} onChange={(e) => setAdvFilterPolitical(e.target.value)}>
                                      <option value="">Tất cả</option>
                                      <option value="None">Quần chúng</option>
                                      <option value="Doan_Vien">Đoàn viên</option>
                                      <option value="Dang_Vien">Đảng viên</option>
                                  </select>
                              </div>
                              <button 
                                  onClick={() => { setAdvFilterEducation(''); setAdvFilterHealth(''); setAdvFilterPolitical(''); }}
                                  className="w-full py-1 text-xs text-red-500 hover:text-red-700 font-medium"
                              >
                                  Xóa bộ lọc
                              </button>
                          </div>
                      </div>
                  )}
              </div>

              <button 
                className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-500 transition-colors" 
                title="Làm mới bộ lọc" 
                onClick={() => {setSearchTerm(''); setFilterVillage(''); setFilterAgeRange(''); setAdvFilterEducation(''); setAdvFilterHealth(''); setAdvFilterPolitical('');}}
              >
                  <RefreshCw size={16} />
              </button>
          </div>

          {/* 3. TABLE DATA */}
          <div className="flex-1 overflow-auto bg-white relative">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-xs text-gray-600 uppercase sticky top-0 z-10 shadow-sm">
                      <tr>
                          <th className="p-3 border-b text-center w-12">STT</th>
                          <th className="p-3 border-b min-w-[200px]">Họ và tên / CCCD</th>
                          <th className="p-3 border-b text-center">Năm sinh</th>
                          <th className="p-3 border-b">Địa chỉ (Thôn/Ấp)</th>
                          <th className="p-3 border-b">Trình độ / Chính trị / SK</th>
                          <th className="p-3 border-b min-w-[150px]">Tình trạng / Lý do</th>
                          <th className="p-3 border-b text-right">Thao tác</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                      {paginatedRecruits.length === 0 ? (
                          <tr>
                              <td colSpan={7} className="p-8 text-center text-gray-500 italic">
                                  Không có dữ liệu phù hợp.
                              </td>
                          </tr>
                      ) : (
                          paginatedRecruits.map((recruit, index) => {
                              const statusColor = getStatusColor(recruit.status);
                              return (
                                  <tr key={recruit.id} className="hover:bg-gray-50 transition-colors group">
                                      <td className="p-3 text-center text-gray-500">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                      <td className="p-3">
                                          <div className="font-bold text-gray-900 text-base">{recruit.fullName}</div>
                                          <div className="flex items-center gap-2 mt-1">
                                              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded">{recruit.citizenId || '---'}</span>
                                          </div>
                                      </td>
                                      <td className="p-3 text-center">
                                          {recruit.dob ? recruit.dob.split('-')[0] : '---'}
                                      </td>
                                      <td className="p-3">
                                          <div className="text-sm font-medium">{recruit.address.village}</div>
                                          <div className="text-xs text-gray-500">{recruit.address.commune}</div>
                                      </td>
                                      <td className="p-3">
                                          <div className="flex flex-col gap-1">
                                              <div className="flex items-center gap-1 text-xs">
                                                  <GraduationCap size={12} className="text-blue-500"/> 
                                                  <span className="font-medium">{recruit.details.education}</span>
                                              </div>
                                              <div className="flex items-center gap-1 text-xs">
                                                  <Flag size={12} className={recruit.details.politicalStatus === 'Dang_Vien' ? 'text-red-600' : recruit.details.politicalStatus === 'Doan_Vien' ? 'text-blue-600' : 'text-gray-400'}/>
                                                  <span>{recruit.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : recruit.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng'}</span>
                                              </div>
                                              <div className="flex items-center gap-1 text-xs">
                                                  <HeartPulse size={12} className={recruit.physical.healthGrade === 1 ? 'text-green-600' : (recruit.physical.healthGrade || 0) >= 4 ? 'text-red-500' : 'text-amber-500'}/>
                                                  {/* Allow Inline Edit for Health Grade if Active Tab is related to Health or Pre-Check/Med-Exam */}
                                                  {!isReadOnly && (activeTabId === 'PRE_CHECK' || activeTabId === 'MED_EXAM') ? (
                                                      <select 
                                                          className="border-none bg-transparent p-0 text-xs font-bold cursor-pointer focus:ring-0"
                                                          value={recruit.physical.healthGrade || 0}
                                                          onChange={(e) => handleHealthGradeChange(recruit, Number(e.target.value))}
                                                          onClick={(e) => e.stopPropagation()}
                                                      >
                                                          <option value="0">--</option>
                                                          {[1,2,3,4,5,6].map(g => <option key={g} value={g}>Loại {g}</option>)}
                                                      </select>
                                                  ) : (
                                                      <span className="font-bold">{recruit.physical.healthGrade ? `Loại ${recruit.physical.healthGrade}` : 'Chưa khám'}</span>
                                                  )}
                                              </div>
                                          </div>
                                      </td>
                                      <td className="p-3">
                                          <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${statusColor} mb-1`}>
                                              {getStatusLabel(recruit.status)}
                                          </span>
                                          {/* Inline Edit for Reason (If deferred/exempt) */}
                                          {(recruit.status === RecruitmentStatus.DEFERRED || recruit.status === RecruitmentStatus.EXEMPTED) && !isReadOnly ? (
                                              <div className="mt-1">
                                                  <TableInput 
                                                      value={recruit.defermentReason || ''}
                                                      onSave={(val) => handleReasonChange(recruit, val)}
                                                      placeholder="Nhập lý do..."
                                                  />
                                              </div>
                                          ) : (
                                              recruit.defermentReason && <div className="text-xs text-gray-600 italic mt-1 max-w-[200px] truncate" title={recruit.defermentReason}>{recruit.defermentReason}</div>
                                      )}
                                      
                                      {recruit.details.gifted && <div className="text-[10px] text-purple-600 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> NK: {recruit.details.gifted}</div>}
                                  </td>
                                  <td className="p-3 text-right">
                                      {renderActions(recruit)}
                                  </td>
                              </tr>
                          );
                      })
                  )}
              </tbody>
          </table>
      </div>

      {/* 4. PAGINATION */}
      {totalPages > 1 && (
          <div className="p-3 border-t border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
              <div className="text-xs text-gray-500">
                  Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredRecruits.length)} trên {filteredRecruits.length}
              </div>
              <div className="flex gap-1">
                  <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 border rounded hover:bg-white disabled:opacity-50"
                  >
                      <ChevronLeft size={16}/>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 flex items-center justify-center border rounded text-xs font-bold ${currentPage === p ? 'bg-military-600 text-white border-military-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                      >
                          {p}
                      </button>
                  ))}
                  <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border rounded hover:bg-white disabled:opacity-50"
                  >
                      <ChevronRight size={16}/>
                  </button>
              </div>
          </div>
      )}
      </div>

      {/* MODALS */}
      {showForm && (
          <RecruitForm 
              initialData={editingRecruit}
              initialStatus={activeTab.status?.[0] || RecruitmentStatus.SOURCE}
              user={user}
              onSubmit={handleSave}
              onClose={() => setShowForm(false)}
              sessionYear={sessionYear}
          />
      )}

      {showRemoveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Xác nhận loại khỏi nguồn</h3>
                  <p className="text-sm text-gray-600 mb-4">
                      Bạn có chắc chắn muốn đưa công dân <b>{recruitToRemove?.fullName}</b> ra khỏi nguồn quản lý? 
                  </p>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Lý do loại bỏ (Bắt buộc):</label>
                  <textarea 
                      className="w-full border border-gray-300 rounded p-2 text-sm mb-4"
                      rows={3}
                      placeholder="VD: Chuyển hộ khẩu đi nơi khác, chết, mất tích..."
                      value={removeReason}
                      onChange={(e) => setRemoveReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setShowRemoveModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-bold text-sm">Hủy</button>
                      <button 
                          onClick={handleConfirmRemove}
                          disabled={!removeReason.trim()}
                          className="px-4 py-2 bg-red-600 text-white rounded font-bold text-sm hover:bg-red-700 disabled:bg-gray-400"
                      >
                          Xác nhận loại bỏ
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RecruitManagement;
