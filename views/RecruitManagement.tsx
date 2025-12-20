
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Recruit, RecruitmentStatus, User } from '../types';
import { LOCATION_DATA, PROVINCES_VN, LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS, EDUCATIONS } from '../constants';
import RecruitForm from '../components/RecruitForm';
import { 
  Search, Plus, CheckCircle2, XCircle, FileEdit, Stethoscope, ClipboardList, Filter,
  PauseCircle, Users, FileSignature, UserX, Flag, Layers, ShieldCheck, 
  ChevronRight, BookX, Paperclip,
  ChevronLeft, Trash2, RefreshCw, Undo2, HeartPulse, GraduationCap, ArrowUpCircle, UserPlus, Tent, Landmark, Calendar, X, Save
} from 'lucide-react';

// Sub-module imports
import { TABS, ITEMS_PER_PAGE } from './RecruitManagement/constants';
import { getStatusLabel, getStatusColor, checkAge } from './RecruitManagement/utils';
import { useRecruitFilters } from './RecruitManagement/useRecruitFilters';

interface RecruitManagementProps {
  recruits: Recruit[];
  user: User;
  onUpdate: (data: Recruit) => void;
  onDelete: (id: string) => void;
  initialTab?: string;
  onTabChange?: (tabId: string) => void;
  sessionYear: number;
}

const RecruitManagement: React.FC<RecruitManagementProps> = ({ 
  recruits, user, onUpdate, onDelete, initialTab = 'ALL', onTabChange, sessionYear
}) => {
  const [activeTabId, setActiveTabId] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingRecruit, setEditingRecruit] = useState<Recruit | undefined>(undefined);
  
  // Modals & States
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonModalConfig, setReasonModalConfig] = useState<{ recruit: Recruit, type: 'DEFERRED' | 'EXEMPTED' } | null>(null);
  const [recruitToRemove, setRecruitToRemove] = useState<Recruit | null>(null);
  const [removeReason, setRemoveReason] = useState('');
  const [failureReasons, setFailureReasons] = useState<Record<string, string>>({});

  const [filterProvince, setFilterProvince] = useState('');
  const [filterCommune, setFilterCommune] = useState('');
  const [filterVillage, setFilterVillage] = useState('');
  const [filterAgeRange, setFilterAgeRange] = useState('');
  
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advFilterEducation, setAdvFilterEducation] = useState('');
  const [advFilterHealth, setAdvFilterHealth] = useState('');
  const [advFilterPolitical, setAdvFilterPolitical] = useState('');
  const advancedFilterRef = useRef<HTMLDivElement>(null);

  const isAdmin = user.role === 'ADMIN';
  const isProvinceAdmin = user.role === 'PROVINCE_ADMIN';
  const isReadOnly = user.role === 'VIEWER' || isProvinceAdmin || isAdmin;

  const adminCommuneList = useMemo(() => {
      if (!filterProvince) return [];
      // @ts-ignore
      const provinceData = LOCATION_DATA[filterProvince];
      return provinceData ? Object.keys(provinceData) : [];
  }, [filterProvince]);

  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (advancedFilterRef.current && !advancedFilterRef.current.contains(event.target as Node)) {
              setShowAdvancedFilter(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabChange = (id: string) => {
      setActiveTabId(id);
      setCurrentPage(1);
      if (onTabChange) onTabChange(id);
  };

  const activeTab = TABS.find(t => t.id === activeTabId) || TABS[0];

  const visibleTabs = useMemo(() => {
      return TABS.filter(tab => {
          // @ts-ignore
          if (!tab.isSub) return true;
          // @ts-ignore
          const parent = tab.parentId;
          if (activeTabId === parent) return true;
          const currentActive = TABS.find(t => t.id === activeTabId);
          // @ts-ignore
          if (currentActive?.parentId === parent) return true;
          return activeTabId === tab.id;
      });
  }, [activeTabId]);

  const scopeRecruits = useMemo(() => {
      let filtered = recruits.filter(r => r.recruitmentYear === sessionYear);
      if (isAdmin) filtered = filtered.filter(r => r.address.province !== 'Tỉnh THUNGHIEM');
      if (!isAdmin) {
          if (user.unit.province && user.unit.commune) {
              filtered = filtered.filter(r => r.address.province === user.unit.province && r.address.commune === user.unit.commune);
          } else if (isProvinceAdmin && user.unit.province) {
               filtered = filtered.filter(r => r.address.province === user.unit.province);
          }
      } else {
          if (filterProvince) filtered = filtered.filter(r => r.address.province === filterProvince);
          if (filterCommune) filtered = filtered.filter(r => r.address.commune === filterCommune);
      }
      return filtered;
  }, [recruits, sessionYear, user, isAdmin, isProvinceAdmin, filterProvince, filterCommune]);

  const filteredRecruits = useRecruitFilters(scopeRecruits, activeTabId, {
    searchTerm, filterVillage, filterAgeRange, advFilterEducation, advFilterHealth, advFilterPolitical
  }, sessionYear);

  const totalPages = Math.ceil(filteredRecruits.length / ITEMS_PER_PAGE);
  const paginatedRecruits = filteredRecruits.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleEdit = (recruit: Recruit) => { setEditingRecruit(recruit); setShowForm(true); };
  const handleCreate = () => { setEditingRecruit(undefined); setShowForm(true); };
  const handleSave = (data: Recruit) => { onUpdate(data); setShowForm(false); };

  const handleConfirmRemove = () => {
      if (recruitToRemove) {
          onUpdate({ ...recruitToRemove, status: RecruitmentStatus.REMOVED_FROM_SOURCE, defermentReason: removeReason });
          setShowRemoveModal(false); setRecruitToRemove(null); setRemoveReason('');
      }
  };

  const handleOpenReasonModal = (recruit: Recruit, type: 'DEFERRED' | 'EXEMPTED') => {
      setReasonModalConfig({ recruit, type });
      setShowReasonModal(true);
  };

  const handleApplyReason = (reason: string) => {
      if (reasonModalConfig) {
          onUpdate({ 
              ...reasonModalConfig.recruit, 
              status: reasonModalConfig.type === 'DEFERRED' ? RecruitmentStatus.DEFERRED : RecruitmentStatus.EXEMPTED,
              defermentReason: reason,
              previousStatus: reasonModalConfig.recruit.status
          });
          setShowReasonModal(false);
          setReasonModalConfig(null);
      }
  };

  const handleHealthGradeSelect = (recruit: Recruit, grade: number) => {
    const isPassed = grade >= 1 && grade <= 3;
    const newStatus = isPassed ? RecruitmentStatus.FINALIZED : RecruitmentStatus.MED_EXAM_FAILED;
    onUpdate({
        ...recruit,
        physical: { ...recruit.physical, healthGrade: grade },
        status: newStatus,
        enlistmentType: isPassed ? 'OFFICIAL' : undefined,
        previousStatus: recruit.status
    });
  };

  const handleUpdateFailureReason = (recruit: Recruit) => {
    const reason = failureReasons[recruit.id];
    if (reason !== undefined) {
        onUpdate({ ...recruit, defermentReason: reason });
        alert("Đã lưu lý do!");
    }
  };

  const renderActions = (recruit: Recruit) => {
      if (isReadOnly) return (
          <div className="flex items-center justify-center gap-1">
              <button onClick={() => handleEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Xem hồ sơ"><FileSignature size={16} /></button>
          </div>
      );
      
      switch (activeTabId) {
          case 'FIRST_TIME_REG':
          case 'NOT_ALLOWED_REG':
          case 'EXEMPT_REG':
              return (
                  <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Sửa hồ sơ"><FileEdit size={16} /></button>
                      {activeTabId === 'FIRST_TIME_REG' && (
                        <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.SOURCE, previousStatus: recruit.status })} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Đưa vào nguồn (DS 4)"><ArrowUpCircle size={16} /></button>
                      )}
                      <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.DELETED, previousStatus: recruit.status })} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa hồ sơ (DS 15)"><Trash2 size={16} /></button>
                  </div>
              );
          case 'ALL':
              return (
                  <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa"><FileEdit size={16} /></button>
                      <button onClick={() => handleOpenReasonModal(recruit, 'DEFERRED')} className="p-1 text-amber-600 hover:bg-amber-50 rounded" title="Tạm hoãn (DS 8)"><PauseCircle size={16}/></button>
                      <button onClick={() => handleOpenReasonModal(recruit, 'EXEMPTED')} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Miễn gọi nhập ngũ (DS 9)"><ShieldCheck size={16}/></button>
                      <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.NOT_SELECTED_TT50, previousStatus: recruit.status })} className="p-1 text-slate-600 hover:bg-slate-50 rounded" title="TT 50 (DS 5)"><BookX size={16}/></button>
                      <button onClick={() => { setRecruitToRemove(recruit); setShowRemoveModal(true); }} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Loại khỏi nguồn (DS 12)"><UserX size={16} /></button>
                      <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.DELETED, previousStatus: recruit.status })} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa (DS 15)"><Trash2 size={16} /></button>
                  </div>
              );
          case 'PRE_CHECK':
                return (
                    <div className="flex items-center justify-center gap-1">
                        <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.PRE_CHECK_PASSED, previousStatus: recruit.status })} className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-black uppercase hover:bg-blue-700 transition-all"><CheckCircle2 size={12}/> Đạt</button>
                        <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.PRE_CHECK_FAILED, previousStatus: recruit.status })} className="flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded text-[10px] font-black uppercase hover:bg-orange-700 transition-all"><XCircle size={12}/> Loại</button>
                        <button onClick={() => handleEdit(recruit)} className="p-1 text-gray-500 hover:bg-gray-100 rounded ml-1"><FileEdit size={14}/></button>
                    </div>
                );
          case 'MED_EXAM':
                // Chỉ Tại danh sách 7 mới được phân loại sức khỏe 1-6
                return (
                    <div className="flex flex-wrap items-center justify-center gap-1 min-w-[150px]">
                        {[1,2,3,4,5,6].map(g => (
                            <button 
                                key={g} 
                                onClick={() => handleHealthGradeSelect(recruit, g)}
                                className={`w-7 h-7 rounded text-[10px] font-black border transition-all ${recruit.physical.healthGrade === g ? 'bg-indigo-600 text-white border-indigo-700 scale-110 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                );
          case 'FINAL':
          case 'FINAL_OFFICIAL':
          case 'FINAL_RESERVE':
              return (
                  <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.ENLISTED, enlistmentType: 'OFFICIAL', previousStatus: recruit.status })} className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-[10px] font-black uppercase hover:bg-red-700 transition-all"><Flag size={12}/> Phát lệnh CT</button>
                      <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.FINALIZED, enlistmentType: 'RESERVE', previousStatus: recruit.status })} className="flex items-center gap-1 px-2 py-1 bg-teal-600 text-white rounded text-[10px] font-black uppercase hover:bg-teal-700 transition-all"><Tent size={12}/> Chốt DB</button>
                      <button onClick={() => handleEdit(recruit)} className="p-1 text-gray-500 hover:bg-gray-100 rounded ml-1"><FileEdit size={14}/></button>
                  </div>
              );
          case 'PRE_CHECK_FAIL':
          case 'MED_EXAM_FAIL':
                return (
                    <div className="flex items-center gap-2">
                        <input 
                            className="text-[11px] border border-gray-300 rounded px-2 py-1 w-32 font-medium"
                            placeholder="Ghi lý do loại..."
                            value={failureReasons[recruit.id] !== undefined ? failureReasons[recruit.id] : (recruit.defermentReason || '')}
                            onChange={(e) => setFailureReasons({...failureReasons, [recruit.id]: e.target.value})}
                        />
                        <button onClick={() => handleUpdateFailureReason(recruit)} className="p-1.5 bg-military-600 text-white rounded hover:bg-military-700" title="Lưu lý do"><Save size={14}/></button>
                        <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.SOURCE, defermentReason: '', previousStatus: recruit.status })} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Khôi phục về Nguồn"><Undo2 size={16}/></button>
                    </div>
                );
          default:
              return (
                  <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><FileEdit size={16} /></button>
                      <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.SOURCE, defermentReason: '', previousStatus: recruit.status })} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Trả lại nguồn"><Undo2 size={16} /></button>
                  </div>
              );
      }
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar - Danh sách quản lý */}
      <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Danh sách quản lý</h3></div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {visibleTabs.map(tab => (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`w-full flex items-center gap-2 px-3 py-3 text-xs font-bold text-left rounded-md transition-all ${activeTabId === tab.id ? `${tab.color} text-white shadow-md` : `${tab.lightColor} ${tab.textColor} hover:brightness-95`}`}>
                      {tab.icon && <tab.icon size={16} className="shrink-0" />}<span className="line-clamp-2">{tab.label}</span>
                  </button>
              ))}
          </div>
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shrink-0">
              <div>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${activeTab.textColor}`}>{activeTab.icon && <activeTab.icon size={24} />} {activeTab.label}</h2>
                <p className="text-xs text-gray-500 mt-1">Hồ sơ tuyển quân năm {sessionYear}</p>
              </div>
              <div className="flex items-center gap-2">
                  {!isReadOnly && ['NOT_ALLOWED_REG', 'EXEMPT_REG', 'FIRST_TIME_REG', 'ALL'].includes(activeTabId) && (
                      <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-military-800 text-white rounded-md font-bold hover:bg-military-900 shadow-sm text-sm"><Plus size={16} /> Thêm công dân</button>
                  )}
              </div>
          </div>

          {/* Thanh lọc nhanh */}
          <div className="p-3 border-b border-gray-200 bg-gray-50/50 flex flex-wrap gap-2 items-center">
              {isAdmin && (
                  <div className="flex items-center gap-2 mr-2 border-r pr-2 border-gray-300">
                      <select className="border border-gray-300 rounded px-2 py-1 text-xs bg-white w-32 font-bold" value={filterProvince} onChange={(e) => { setFilterProvince(e.target.value); setFilterCommune(''); }}>
                          <option value="">-- Toàn quốc --</option>
                          {PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <select className="border border-gray-300 rounded px-2 py-1 text-xs bg-white w-32 font-bold disabled:bg-gray-100" value={filterCommune} onChange={(e) => setFilterCommune(e.target.value)} disabled={!filterProvince}>
                          <option value="">-- Toàn tỉnh --</option>
                          {adminCommuneList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  </div>
              )}
              <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-2.5 text-gray-400" size={16} /><input type="text" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm bg-white" placeholder="Tìm tên, CCCD..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
              <input type="text" className="border border-gray-300 rounded px-3 py-2 text-sm bg-white w-40" placeholder="Thôn/Ấp..." value={filterVillage} onChange={(e) => setFilterVillage(e.target.value)}/>
              
              <div className="relative" ref={advancedFilterRef}>
                  <button onClick={() => setShowAdvancedFilter(!showAdvancedFilter)} className={`flex items-center gap-2 px-3 py-2 border rounded hover:bg-white text-sm font-medium ${showAdvancedFilter || advFilterEducation || advFilterHealth || advFilterPolitical ? 'border-military-50 text-military-700 bg-military-50' : 'border-gray-300 text-gray-600 bg-white'}`}><Filter size={16} /> Lọc khác</button>
                  {showAdvancedFilter && (
                      <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg p-4 z-20">
                          <div className="space-y-3">
                              <select className="w-full border rounded p-1.5 text-sm" value={advFilterEducation} onChange={(e) => setAdvFilterEducation(e.target.value)}><option value="">-- Trình độ --</option>{EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}</select>
                              <select className="w-full border rounded p-1.5 text-sm" value={advFilterHealth} onChange={(e) => setAdvFilterHealth(e.target.value)}><option value="">-- Sức khỏe --</option>{[1,2,3,4,5,6].map(h => <option key={h} value={h}>Loại {h}</option>)}</select>
                              <select className="w-full border rounded p-1.5 text-sm" value={advFilterPolitical} onChange={(e) => setAdvFilterPolitical(e.target.value)}><option value="">-- Chính trị --</option><option value="None">Quần chúng</option><option value="Doan_Vien">Đoàn viên</option><option value="Dang_Vien">Đảng viên</option></select>
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="flex-1 overflow-auto bg-white relative">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-[10px] text-gray-600 uppercase font-black sticky top-0 z-10 shadow-sm">
                      <tr>
                          <th className="p-3 border-b text-center w-12">STT</th>
                          <th className="p-3 border-b min-w-[200px]">Họ và tên / CCCD</th>
                          <th className="p-3 border-b text-center">Năm sinh</th>
                          <th className="p-3 border-b">Địa bàn</th>
                          <th className="p-3 border-b">Chất lượng</th>
                          <th className="p-3 border-b min-w-[150px]">
                            {['PRE_CHECK_FAIL', 'MED_EXAM_FAIL'].includes(activeTabId) ? 'Lý do không đạt' : 'Tình trạng / Lý do'}
                          </th>
                          <th className="p-3 border-b text-center">
                            {['MED_EXAM'].includes(activeTabId) ? 'Phân loại SK (1-6)' : 'Thao tác'}
                          </th>
                      </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                      {paginatedRecruits.length === 0 ? (
                          <tr><td colSpan={7} className="p-8 text-center text-gray-500 italic">Không có dữ liệu phù hợp.</td></tr>
                      ) : paginatedRecruits.map((recruit, index) => (
                          <tr key={recruit.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-3 text-center text-gray-500">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2"><div className="font-bold text-gray-900 text-base">{recruit.fullName}</div>{recruit.attachments?.length ? <Paperclip size={14} className="text-blue-500" /> : null}</div>
                                <div className="text-xs text-gray-500 font-mono">{recruit.citizenId || '---'}</div>
                              </td>
                              <td className="p-3 text-center">{recruit.dob ? recruit.dob.split('-')[0] : '---'}</td>
                              <td className="p-3">
                                <div className="text-sm font-medium">{recruit.address.village}</div>
                                <div className="text-xs text-gray-500">{recruit.address.commune}</div>
                              </td>
                              <td className="p-3">
                                  <div className="flex flex-col gap-1 text-[11px] font-medium">
                                      <div className="flex items-center gap-1 text-gray-700"><GraduationCap size={12}/> {recruit.details.education}</div>
                                      <div className="flex items-center gap-1 text-gray-700"><Flag size={12}/> {recruit.details.politicalStatus === 'Dang_Vien' ? 'Đảng' : recruit.details.politicalStatus === 'Doan_Vien' ? 'Đoàn' : 'QC'}</div>
                                      <div className="flex items-center gap-1 text-gray-700"><HeartPulse size={12}/> {recruit.physical.healthGrade ? `Loại ${recruit.physical.healthGrade}` : '---'}</div>
                                  </div>
                              </td>
                              <td className="p-3">
                                  {!['PRE_CHECK_FAIL', 'MED_EXAM_FAIL'].includes(activeTabId) && (
                                      <span className={`inline-block px-2 py-1 rounded text-[10px] font-black border uppercase ${getStatusColor(recruit.status)} mb-1`}>{getStatusLabel(recruit.status)}</span>
                                  )}
                                  {(recruit.status === RecruitmentStatus.ENLISTED || recruit.status === RecruitmentStatus.FINALIZED) && recruit.enlistmentType === 'OFFICIAL' && (
                                      <div className="bg-red-50 p-2 rounded-lg border border-red-100 mt-1">
                                          <p className="text-[10px] font-black text-red-700 uppercase flex items-center gap-1"><Landmark size={12}/> {recruit.enlistmentUnit || '---'}</p>
                                          <p className="text-[10px] font-bold text-red-600 flex items-center gap-1"><Calendar size={12}/> {recruit.enlistmentDate ? new Date(recruit.enlistmentDate).toLocaleDateString('vi-VN') : '---'}</p>
                                      </div>
                                  )}
                                  {recruit.enlistmentType === 'RESERVE' && (
                                      <div className="bg-teal-50 p-1 rounded border border-teal-100 mt-1 text-[10px] font-black text-teal-700 uppercase">Diện dự bị</div>
                                  )}
                                  {!['PRE_CHECK_FAIL', 'MED_EXAM_FAIL'].includes(activeTabId) && recruit.defermentReason && (
                                      <div className="text-[10px] text-gray-600 italic truncate max-w-[150px]">{recruit.defermentReason}</div>
                                  )}
                                  {['PRE_CHECK_FAIL', 'MED_EXAM_FAIL'].includes(activeTabId) && (
                                      <div className="text-xs font-bold text-red-600">{recruit.defermentReason || '(Chưa nhập lý do)'}</div>
                                  )}
                              </td>
                              <td className="p-3 text-right">{renderActions(recruit)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
              <div className="p-3 border-t flex items-center justify-between bg-gray-50 shrink-0">
                  <div className="text-xs text-gray-500">Trang {currentPage} / {totalPages}</div>
                  <div className="flex gap-1">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border rounded disabled:opacity-50 hover:bg-white transition-all"><ChevronLeft size={16}/></button>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 border rounded disabled:opacity-50 hover:bg-white transition-all"><ChevronRight size={16}/></button>
                  </div>
              </div>
          )}
      </div>
      
      {/* Forms & Modals */}
      {showForm && <RecruitForm initialData={editingRecruit} initialStatus={activeTab.status?.[0] || RecruitmentStatus.SOURCE} user={user} onSubmit={handleSave} onClose={() => setShowForm(false)} sessionYear={sessionYear} />}
      
      {showReasonModal && reasonModalConfig && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className={`p-5 flex justify-between items-center text-white ${reasonModalConfig.type === 'DEFERRED' ? 'bg-amber-600' : 'bg-purple-600'}`}>
              <h3 className="font-bold uppercase text-sm">{reasonModalConfig.type === 'DEFERRED' ? 'Chọn lý do tạm hoãn' : 'Chọn lý do miễn gọi'}</h3>
              <button onClick={() => setShowReasonModal(false)}><X size={20}/></button>
            </div>
            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {(reasonModalConfig.type === 'DEFERRED' ? LEGAL_DEFERMENT_REASONS : LEGAL_EXEMPTION_REASONS).map((reason, idx) => (
                <button key={idx} onClick={() => handleApplyReason(reason)} className="w-full text-left p-3 text-sm font-medium border rounded-xl hover:bg-gray-50 transition-all">{reason}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRemoveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl animate-in zoom-in duration-300">
                <h3 className="font-bold text-lg text-gray-800 mb-2">Lý do loại khỏi nguồn</h3>
                <textarea className="w-full border rounded p-2 text-sm mb-4" rows={3} placeholder="Mô tả lý do..." value={removeReason} onChange={(e) => setRemoveReason(e.target.value)}/>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowRemoveModal(false)} className="px-4 py-2 text-gray-600 font-bold text-sm">Hủy</button>
                    <button onClick={handleConfirmRemove} disabled={!removeReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded font-bold text-sm shadow-md hover:bg-red-700">Xác nhận</button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default RecruitManagement;
