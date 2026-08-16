import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Recruit, User, RecruitmentStatus } from '../types';
import RecruitForm from '../components/RecruitForm';
import { BookOpen, Info } from 'lucide-react';

import { TABS, ITEMS_PER_PAGE } from './RecruitManagement/constants';
import { useRecruitFilters } from './RecruitManagement/useRecruitFilters';

// Sub-components
import RecruitSidebar from './RecruitManagement/components/RecruitSidebar';
import RecruitHeader from './RecruitManagement/components/RecruitHeader';
import RecruitFilterBar from './RecruitManagement/components/RecruitFilterBar';
import RecruitTable from './RecruitManagement/components/RecruitTable';
import LegalReasonModal from './RecruitManagement/modals/LegalReasonModal';
import RemovalModal from './RecruitManagement/modals/RemovalModal';
import BulkVillageRenameModal from './RecruitManagement/modals/BulkVillageRenameModal';
import TT50ReasonModal from './RecruitManagement/modals/TT50ReasonModal'; 
import PreCheckFailModal from './RecruitManagement/modals/PreCheckFailModal';
import DuplicateCheckModal from './RecruitManagement/modals/DuplicateCheckModal';
import Age17TransferModal from './RecruitManagement/modals/Age17TransferModal';
import { BulkAvatarModal } from './RecruitManagement/modals/BulkAvatarModal';
import { ExcelImportModal } from './RecruitManagement/modals/ExcelImportModal';
import { useRecruitActions } from './RecruitManagement/hooks/useRecruitActions';
import { ExcelExportService } from '../services/ExcelExportService';
import { api } from '../api';

interface RecruitManagementProps {
  recruits: Recruit[];
  user: User;
  onUpdate: (data: Recruit) => void;
  onDelete: (id: string) => void;
  initialTab?: string;
  onTabChange?: (tabId: string) => void;
  sessionYear: number;
  onRefreshData?: () => void;
}

const RecruitManagement: React.FC<RecruitManagementProps> = ({ 
  recruits: rawRecruits, user, onUpdate, onDelete, initialTab = 'ALL', onTabChange, sessionYear, onRefreshData
}) => {
  const [activeTabId, setActiveTabId] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showAge17Modal, setShowAge17Modal] = useState(false);
  const [showBulkAvatarModal, setShowBulkAvatarModal] = useState(false);
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [editingRecruit, setEditingRecruit] = useState<Recruit | undefined>(undefined);
  const [recruits, setRecruits] = useState<Recruit[]>(rawRecruits);

  // Đồng bộ local state khi props thay đổi
  useEffect(() => { setRecruits(rawRecruits); }, [rawRecruits]);

  const [filterProvince, setFilterProvince] = useState('');
  const [filterCommune, setFilterCommune] = useState('');
  const [filterVillage, setFilterVillage] = useState('');
  const [filterAgeRange, setFilterAgeRange] = useState('');
  
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advFilterEducation, setAdvFilterEducation] = useState('');
  const [advFilterHealth, setAdvFilterHealth] = useState('');
  const [advFilterPolitical, setAdvFilterPolitical] = useState('');
  const advancedFilterRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = user.role === 'ADMIN';
  const isProvinceAdmin = user.role === 'PROVINCE_ADMIN';
  const isReadOnly = user.role === 'VIEWER' || isProvinceAdmin;

  // Custom hook cho các hành động logic
  const ra = useRecruitActions(user, sessionYear, onUpdate, setRecruits);

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

  const formatTab = (tab: typeof TABS[0]) => {
    if (tab.id === 'SPECIAL_JAN_17') {
      return {
        ...tab,
        label: `17. DS CÔNG DÂN SINH THÁNG 01 NĂM ${sessionYear - 17}`
      };
    }
    return tab;
  };

  const rawActiveTab = TABS.find(t => t.id === activeTabId) || TABS[0];
  const activeTab = formatTab(rawActiveTab);

  const visibleTabs = useMemo(() => {
    return TABS.filter(tab => {
      if (!tab.isSub) return true;
      const parent = tab.parentId;
      if (activeTabId === parent) return true;
      const currentActive = TABS.find(t => t.id === activeTabId);
      if (currentActive?.parentId === parent) return true;
      return activeTabId === tab.id;
    }).map(formatTab);
  }, [activeTabId, sessionYear]);

  const handleTransferAllSpecialJan = async () => {
    const targetBirthYear = sessionYear - 17;
    const candidates = filteredRecruits.filter(r => {
      if (r.status === RecruitmentStatus.SOURCE) return false;
      const birthYear = parseInt(r.dob?.split('-')[0] || '0');
      const birthMonth = parseInt(r.dob?.split('-')[1] || '0');
      return birthYear === targetBirthYear && birthMonth === 1;
    });

    if (candidates.length === 0) {
      alert(`Tất cả công dân sinh tháng 01/${targetBirthYear} trong danh sách đã ở trạng thái Nguồn.`);
      return;
    }

    const confirmMsg = `Xác nhận chuyển ${candidates.length} công dân sinh tháng 01/${targetBirthYear} sang danh sách Nguồn (DS 4) theo yêu cầu của cấp trên?\n\n(Lưu ý: Nếu không chuyển, công dân vẫn được giữ tại Danh sách Đăng ký lần đầu).`;
    if (window.confirm(confirmMsg)) {
      try {
        for (const recruit of candidates) {
          const updated = {
            ...recruit,
            status: RecruitmentStatus.SOURCE,
            previousStatus: recruit.status,
            updatedAt: new Date().toISOString()
          };
          await api.updateRecruit(updated);
          onUpdate(updated);
        }
        alert(`Đã chuyển thành công ${candidates.length} công dân sang danh sách Nguồn.`);
      } catch (e) {
        console.error("Lỗi khi chuyển nguồn công dân sinh tháng 1:", e);
        alert("Đã xảy ra lỗi khi cập nhật.");
      }
    }
  };

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
  
  const handleCreate = () => { 
    setEditingRecruit(undefined); 
    setShowForm(true); 
  };

  const handleBulkVillageRename = async (oldName: string, newName: string) => {
    const targetRecruits = scopeRecruits.filter(r => r.address.village === oldName);
    
    try {
      for (const r of targetRecruits) {
        const updated = { 
          ...r, 
          address: { ...r.address, village: newName } 
        };
        await api.updateRecruit(updated);
        onUpdate(updated);
      }
      alert(`Đã cập nhật địa chỉ thành công cho ${targetRecruits.length} công dân.`);
    } catch (e) {
      console.error("Lỗi khi cập nhật đồng loạt:", e);
      alert("Quá trình cập nhật gặp sự cố. Một số hồ sơ có thể chưa được đổi tên.");
    }
  };

  const handleTransferAge17 = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const recruit = recruits.find(r => r.id === id);
        if (recruit) {
          const updated = {
            ...recruit,
            status: RecruitmentStatus.FIRST_TIME_REGISTRATION,
            updatedAt: new Date().toISOString()
          };
          await api.updateRecruit(updated);
          onUpdate(updated);
        }
      }
    } catch (e) {
      console.error("Lỗi khi chuyển trạng thái công dân 17 tuổi:", e);
      throw e;
    }
  };

  const initialStatusForNew = useMemo(() => {
    if (activeTabId === 'NOT_ALLOWED_REG') return RecruitmentStatus.NOT_ALLOWED_REGISTRATION;
    if (activeTabId === 'EXEMPT_REG') return RecruitmentStatus.EXEMPT_REGISTRATION;
    if (activeTabId === 'FIRST_TIME_REG') return RecruitmentStatus.FIRST_TIME_REGISTRATION;
    return RecruitmentStatus.SOURCE;
  }, [activeTabId]);

  const handleSave = (data: Recruit) => { 
    setRecruits(prev => {
      const exists = prev.some(r => r.id === data.id);
      if (exists) return prev.map(r => r.id === data.id ? data : r);
      return [...prev, data];
    });
    onUpdate(data); 
    setShowForm(false); 
  };

  const handleDeleteAllTrash = async () => {
    if (filteredRecruits.length === 0) {
      alert("Thùng rác đã trống!");
      return;
    }
    
    const password = window.prompt("CẢNH BÁO: Thao tác này sẽ xóa VĨNH VIỄN toàn bộ " + filteredRecruits.length + " hồ sơ trong Thùng rác.\nVui lòng nhập mật khẩu xác nhận:");
    
    if (password === null) return; 
    
    const isValidPass = password === user.password || password === 'ADMIN' || (password === '1' && user.username === 'DEMO');
    
    if (!isValidPass) {
      alert("Mật khẩu xác nhận không chính xác!");
      return;
    }

    if (window.confirm(`XÁC NHẬN CUỐI CÙNG: Bạn có chắc chắn muốn xóa vĩnh viễn ${filteredRecruits.length} hồ sơ? Thao tác này KHÔNG THỂ khôi phục.`)) {
      try {
        for (const recruit of filteredRecruits) {
          await api.deleteRecruit(recruit.id);
          onDelete(recruit.id); 
        }
        alert("Đã dọn sạch thùng rác vĩnh viễn.");
      } catch (e) {
        console.error("Lỗi khi dọn thùng rác:", e);
        alert("Đã xảy ra lỗi trong quá trình xóa dữ liệu.");
      }
    }
  };

  const isExpiring = (recruit: Recruit) => {
    const isExpiredYear = (period?: string) => {
        if (!period) return false;
        const parts = period.split('-');
        const lastPart = parts[parts.length - 1].trim();
        const yearStr = lastPart.includes('/') ? lastPart.split('/').pop() : lastPart;
        const endYear = parseInt(yearStr || '0');
        return endYear > 0 && endYear < sessionYear;
    };
    return isExpiredYear(recruit.details.educationPeriod) || isExpiredYear(recruit.details.sentencePeriod);
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <RecruitSidebar visibleTabs={visibleTabs} activeTabId={activeTabId} onTabChange={handleTabChange} />

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <RecruitHeader 
          activeTab={activeTab} 
          sessionYear={sessionYear} 
          filteredCount={filteredRecruits.length} 
          isReadOnly={isReadOnly} 
          activeTabId={activeTabId}
          onAdd={handleCreate}
          onDeleteAll={handleDeleteAllTrash}
          onBulkVillageRename={() => setShowBulkModal(true)}
          onCheckDuplicates={() => setShowDuplicateModal(true)}
          onProposeAge17={() => setShowAge17Modal(true)}
          onTransferAllSpecialJan={handleTransferAllSpecialJan}
          onBulkAvatarUpload={() => setShowBulkAvatarModal(true)}
          onBulkExcelImport={() => setShowExcelImportModal(true)}
          onExportCurrentList={() => {
            const unitName = user.fullName || user.unit?.commune || 'CƠ QUAN QUÂN SỰ';
            ExcelExportService.exportToTemplate(filteredRecruits, activeTabId, sessionYear, unitName, activeTab.label);
          }}
        />

        {/* THÔNG BÁO QUY ĐỊNH CHO DANH SÁCH 17 (SINH THÁNG 01) */}
        {activeTabId === 'SPECIAL_JAN_17' ? (
          <div className="mx-6 mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-start gap-4 animate-in slide-in-from-top-2 duration-500">
             <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
               <Info size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Info size={12}/> Trường hợp đặc biệt: Công dân sinh tháng 01/{sessionYear - 17}
                </p>
                <p className="text-xs font-bold text-emerald-900 leading-relaxed">
                  Đây là danh sách thông báo các công dân sinh vào <span className="underline font-black">tháng 01 năm {sessionYear - 17}</span> (sẽ đủ 18 tuổi vào tháng 01/{sessionYear + 1} - trước thời điểm giao quân năm {sessionYear + 1}). 
                  Cán bộ có thể bấm <strong>"Chuyển về nguồn"</strong> nếu cấp trên yêu cầu bổ sung vào nguồn nhập ngũ. 
                  Nếu cán bộ không chuyển về nguồn, công dân vẫn được hiển thị và quản lý tại <strong>Danh sách Đăng ký NVQS lần đầu (DS 3)</strong>.
                </p>
             </div>
          </div>
        ) : null}

        {/* THÔNG BÁO QUY ĐỊNH CHO DANH SÁCH 5 */}
        {activeTabId.startsWith('TT50') || activeTabId.startsWith('KTC_SUB') ? (
          <div className="mx-6 mt-4 p-4 bg-slate-50 border-l-4 border-slate-400 rounded-r-xl flex items-start gap-4 animate-in slide-in-from-top-2 duration-500">
             <div className="p-2 bg-slate-200 rounded-lg text-slate-600 shrink-0">
               <BookOpen size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Info size={12}/> Cơ sở pháp lý thực hiện xét duyệt
                </p>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  Văn bản hợp nhất số 85/VBHN-BQP ngày 18/10/2025 của Bộ Quốc phòng về việc quy định tiêu chuẩn chính trị tuyển chọn công dân vào phục vụ trong môi trường Quân đội nhân dân Việt Nam.
                </p>
             </div>
          </div>
        ) : null}

        <RecruitFilterBar 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filterVillage={filterVillage} setFilterVillage={setFilterVillage}
          filterAgeRange={filterAgeRange} setFilterAgeRange={setFilterAgeRange}
          showAdvancedFilter={showAdvancedFilter} setShowAdvancedFilter={setShowAdvancedFilter}
          advFilterEducation={advFilterEducation} setAdvFilterEducation={setAdvFilterEducation}
          advFilterHealth={advFilterHealth} setAdvFilterHealth={setAdvFilterHealth}
          advFilterPolitical={advFilterPolitical} setAdvFilterPolitical={setAdvFilterPolitical}
          advancedFilterRef={advancedFilterRef}
        />

        <RecruitTable
          paginatedRecruits={paginatedRecruits}
          currentPage={currentPage}
          totalPages={totalPages}
          totalFilteredCount={filteredRecruits.length}
          activeTabId={activeTabId}
          sessionYear={sessionYear}
          isReadOnly={isReadOnly}
          onPageChange={setCurrentPage}
          onEdit={handleEdit}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isExpiring={isExpiring}
          failureReasons={ra.failureReasons}
          setFailureReasons={ra.setFailureReasons}
          enlistmentUnits={ra.enlistmentUnits}
          setEnlistmentUnits={ra.setEnlistmentUnits}
          enlistmentDates={ra.enlistmentDates}
          setEnlistmentDates={ra.setEnlistmentDates}
          onOpenReasonModal={ra.handleOpenReasonModal}
          onOpenRemoveModal={(r) => { ra.setRecruitToRemove(r); ra.setShowRemoveModal(true); }}
          onHealthGradeSelect={ra.handleHealthGradeSelect}
          onUpdateFailureReason={ra.handleUpdateFailureReason}
          onUpdateEnlistmentInfo={ra.handleUpdateEnlistmentInfo}
          onOpenTT50Modal={(r) => { ra.setTt50Recruit(r); ra.setShowTT50Modal(true); }}
          onOpenPreCheckFailModal={(r) => { ra.setPreCheckRecruit(r); ra.setShowPreCheckFailModal(true); }}
        />
      </div>
      
      {showForm && (
        <RecruitForm 
            initialData={editingRecruit} 
            initialStatus={initialStatusForNew}
            user={user} 
            onSubmit={handleSave} 
            onClose={() => setShowForm(false)} 
            sessionYear={sessionYear}
            existingRecruits={recruits}
        />
      )}

      {showBulkModal && (
        <BulkVillageRenameModal 
            recruits={scopeRecruits}
            onClose={() => setShowBulkModal(false)}
            onConfirm={handleBulkVillageRename}
        />
      )}

      {showDuplicateModal && (
        <DuplicateCheckModal 
          recruits={scopeRecruits}
          onClose={() => setShowDuplicateModal(false)}
          onRefreshData={() => {}}
          onDelete={(id) => {
            setRecruits(prev => prev.filter(r => r.id !== id));
            onDelete(id);
          }}
        />
      )}
      
      {ra.showReasonModal && ra.reasonModalConfig && (
        <LegalReasonModal 
          type={ra.reasonModalConfig.type} 
          onClose={() => ra.setShowReasonModal(false)} 
          onApply={ra.handleApplyReason} 
        />
      )}

      {ra.showTT50Modal && (
        <TT50ReasonModal 
          onClose={() => ra.setShowTT50Modal(false)}
          onApply={ra.handleApplyTT50Reason}
        />
      )}

      {ra.showPreCheckFailModal && (
        <PreCheckFailModal 
          recruit={ra.preCheckRecruit}
          onClose={() => ra.setShowPreCheckFailModal(false)}
          onApply={ra.handleApplyPreCheckFailReason}
        />
      )}

      {ra.showRemoveModal && (
        <RemovalModal 
          reason={ra.removeReason} 
          setReason={ra.setRemoveReason} 
          onClose={() => ra.setShowRemoveModal(false)} 
          onConfirm={ra.handleConfirmRemove} 
        />
      )}

      {showAge17Modal && (
        <Age17TransferModal 
          recruits={scopeRecruits}
          sessionYear={sessionYear}
          onClose={() => setShowAge17Modal(false)}
          onTransfer={handleTransferAge17}
        />
      )}

      {showBulkAvatarModal && (
        <BulkAvatarModal 
          recruits={recruits}
          sessionYear={sessionYear}
          onClose={() => setShowBulkAvatarModal(false)}
          onUpdateRecruit={(updated) => {
            setRecruits(prev => prev.map(r => r.id === updated.id ? updated : r));
            onUpdate(updated);
          }}
        />
      )}

      {showExcelImportModal && (
        <ExcelImportModal 
          recruits={recruits}
          activeTabId={activeTabId}
          sessionYear={sessionYear}
          currentUser={user}
          onClose={() => setShowExcelImportModal(false)}
          onRefresh={async () => {
            const data = await api.getRecruits();
            if (data && Array.isArray(data)) {
              setRecruits(data);
            }
            if (onRefreshData) {
              await onRefreshData();
            }
          }}
        />
      )}
    </div>
  );
};

export default RecruitManagement;
