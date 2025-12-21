
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Recruit, User } from '../types';
import RecruitForm from '../components/RecruitForm';
import { 
  Paperclip, ChevronRight, ChevronLeft, GraduationCap, Flag, HeartPulse
} from 'lucide-react';

import { TABS, ITEMS_PER_PAGE } from './RecruitManagement/constants';
import { getStatusLabel, getStatusColor } from './RecruitManagement/utils';
import { useRecruitFilters } from './RecruitManagement/useRecruitFilters';

// Sub-components
import RecruitSidebar from './RecruitManagement/components/RecruitSidebar';
import RecruitHeader from './RecruitManagement/components/RecruitHeader';
import RecruitFilterBar from './RecruitManagement/components/RecruitFilterBar';
import ActionButtons from './RecruitManagement/components/ActionButtons';
import LegalReasonModal from './RecruitManagement/modals/LegalReasonModal';
import RemovalModal from './RecruitManagement/modals/RemovalModal';
import { useRecruitActions } from './RecruitManagement/hooks/useRecruitActions';
import { api } from '../api';

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
  recruits: rawRecruits, user, onUpdate, onDelete, initialTab = 'ALL', onTabChange, sessionYear
}) => {
  const [activeTabId, setActiveTabId] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
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
  const advancedFilterRef = useRef<HTMLDivElement>(null);

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

  const activeTab = TABS.find(t => t.id === activeTabId) || TABS[0];

  const visibleTabs = useMemo(() => {
    return TABS.filter(tab => {
      if (!tab.isSub) return true;
      const parent = tab.parentId;
      if (activeTabId === parent) return true;
      const currentActive = TABS.find(t => t.id === activeTabId);
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

  const handleDeleteAllTrash = async () => {
    if (filteredRecruits.length === 0) {
      alert("Thùng rác đã trống!");
      return;
    }
    
    const password = window.prompt("CẢNH BÁO: Thao tác này sẽ xóa VĨNH VIỄN toàn bộ " + filteredRecruits.length + " hồ sơ trong Thùng rác.\nVui lòng nhập mật khẩu xác nhận:");
    
    if (password === null) return; // Người dùng nhấn Cancel
    
    // Kiểm tra mật khẩu (Sử dụng mật khẩu của User hiện tại hoặc ADMIN mặc định)
    const isValidPass = password === user.password || password === 'ADMIN' || (password === '1' && user.username === 'DEMO');
    
    if (!isValidPass) {
      alert("Mật khẩu xác nhận không chính xác!");
      return;
    }

    if (window.confirm(`XÁC NHẬN CUỐI CÙNG: Bạn có chắc chắn muốn xóa VĨNH VIỄN ${filteredRecruits.length} hồ sơ? Thao tác này KHÔNG THỂ khôi phục.`)) {
      try {
        // Thực hiện xóa vĩnh viễn từng hồ sơ
        for (const recruit of filteredRecruits) {
          await api.deleteRecruit(recruit.id);
          onDelete(recruit.id); // Đồng bộ lên App state
        }
        alert("Đã dọn sạch thùng rác vĩnh viễn.");
      } catch (e) {
        console.error("Lỗi khi dọn thùng rác:", e);
        alert("Đã xảy ra lỗi trong quá trình xóa dữ liệu.");
      }
    }
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
          onExport={() => ra.handleExportExcel(filteredRecruits, activeTabId, activeTab.label)}
          onAdd={handleCreate}
          onDeleteAll={handleDeleteAllTrash}
        />

        <RecruitFilterBar 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filterVillage={filterVillage} setFilterVillage={setFilterVillage}
          showAdvancedFilter={showAdvancedFilter} setShowAdvancedFilter={setShowAdvancedFilter}
          advFilterEducation={advFilterEducation} setAdvFilterEducation={setAdvFilterEducation}
          advFilterHealth={advFilterHealth} setAdvFilterHealth={setAdvFilterHealth}
          advFilterPolitical={advFilterPolitical} setAdvFilterPolitical={setAdvFilterPolitical}
          advancedFilterRef={advancedFilterRef}
        />

        <div className="flex-1 overflow-auto bg-white relative custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-[10px] text-gray-500 uppercase font-black sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 border-b text-center w-12">STT</th>
                <th className="p-4 border-b min-w-[200px]">Họ và tên / CCCD</th>
                <th className="p-4 border-b text-center">Năm sinh</th>
                <th className="p-4 border-b">Địa bàn cư trú</th>
                <th className="p-4 border-b">Chất lượng (HV/CT/SK)</th>
                <th className="p-4 border-b min-w-[150px]">Tình trạng hiện tại</th>
                <th className="p-4 border-b text-center">Thao tác xử lý</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {paginatedRecruits.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-gray-400 italic">Không tìm thấy hồ sơ nào phù hợp với điều kiện lọc.</td></tr>
              ) : paginatedRecruits.map((recruit, index) => (
                <tr key={recruit.id} className="hover:bg-military-50/30 transition-colors group">
                  <td className="p-4 text-center text-gray-400 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="font-black text-military-900 uppercase tracking-tight">{recruit.fullName}</div>
                      {recruit.attachments?.length ? <Paperclip size={14} className="text-blue-500" /> : null}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5 tracking-tighter">{recruit.citizenId || 'Chưa cập nhật CCCD'}</div>
                  </td>
                  <td className="p-4 text-center font-bold text-gray-700">{recruit.dob ? recruit.dob.split('-')[0] : '---'}</td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-gray-800">{recruit.address.village}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">{recruit.address.commune}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-[10px] font-black uppercase">
                      <div className="flex items-center gap-1.5 text-gray-600"><GraduationCap size={12} className="text-military-400"/> {recruit.details.education}</div>
                      <div className="flex items-center gap-1.5 text-gray-600"><Flag size={12} className="text-red-400"/> {recruit.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : recruit.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng'}</div>
                      <div className="flex items-center gap-1.5 text-gray-600"><HeartPulse size={12} className="text-blue-400"/> SK Loại {recruit.physical.healthGrade || '---'}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusColor(recruit.status)}`}>{getStatusLabel(recruit.status)}</span>
                    {recruit.defermentReason && (
                      <div className="text-[10px] text-gray-500 italic mt-1.5 leading-tight truncate max-w-[180px]" title={recruit.defermentReason}>{recruit.defermentReason}</div>
                    )}
                    {recruit.enlistmentType === 'OFFICIAL' && (
                      <div className="mt-1.5 flex items-center gap-1 text-[9px] font-black text-red-700 uppercase"><Flag size={10}/> Phát lệnh chính thức</div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <ActionButtons 
                      recruit={recruit}
                      activeTabId={activeTabId}
                      isReadOnly={isReadOnly}
                      failureReasons={ra.failureReasons}
                      setFailureReasons={ra.setFailureReasons}
                      onEdit={handleEdit}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onOpenReasonModal={ra.handleOpenReasonModal}
                      onOpenRemoveModal={(r) => { ra.setRecruitToRemove(r); ra.setShowRemoveModal(true); }}
                      onHealthGradeSelect={ra.handleHealthGradeSelect}
                      onUpdateFailureReason={ra.handleUpdateFailureReason}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between bg-gray-50/50 shrink-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trang {currentPage} / {totalPages} (Tổng {filteredRecruits.length} kết quả)</div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-white transition-all shadow-sm"><ChevronLeft size={18}/></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-white transition-all shadow-sm"><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>
      
      {showForm && <RecruitForm initialData={editingRecruit} user={user} onSubmit={handleSave} onClose={() => setShowForm(false)} sessionYear={sessionYear} />}
      
      {ra.showReasonModal && ra.reasonModalConfig && (
        <LegalReasonModal 
          type={ra.reasonModalConfig.type} 
          onClose={() => ra.setShowReasonModal(false)} 
          onApply={ra.handleApplyReason} 
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
    </div>
  );
};

export default RecruitManagement;
