import React, { useState, useMemo } from 'react';
import { Recruit, RecruitmentStatus, User } from '../types';
import { PROVINCES_VN, LOCATION_DATA, removeVietnameseTones } from '../constants';
import RecruitForm from '../components/RecruitForm';
import { 
    Search, Filter, Plus, FileEdit, Trash2, 
    Download, ArrowRightCircle, Users, Ban, Shield, 
    Baby, BookX, ClipboardList, Stethoscope, 
    PauseCircle, ShieldCheck, FileSignature, Flag, 
    UserX, Layers, ChevronLeft, ChevronRight, X
} from 'lucide-react';

interface RecruitManagementProps {
  user: User;
  recruits: Recruit[];
  onUpdate: (data: Recruit) => void;
  onDelete: (id: string) => void;
  initialTab: string;
  onTabChange: (tab: string) => void;
  sessionYear: number;
}

const ITEMS_PER_PAGE = 10;

const RecruitManagement: React.FC<RecruitManagementProps> = ({ 
    user, recruits, onUpdate, onDelete, initialTab, onTabChange, sessionYear 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecruit, setEditingRecruit] = useState<Recruit | undefined>(undefined);
  
  // Admin Filters
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCommune, setFilterCommune] = useState('');

  const isAdmin = user.role === 'ADMIN';
  const isProvinceAdmin = user.role === 'PROVINCE_ADMIN';
  const isReadOnly = user.role === 'VIEWER' || isProvinceAdmin;

  const TABS = [
      { id: 'ALL', label: 'Tổng nguồn (18+)', icon: Users, color: 'text-gray-600' },
      { id: 'NOT_ALLOWED_REG', label: 'Không được ĐK', icon: Ban, color: 'text-red-600' },
      { id: 'EXEMPT_REG', label: 'Miễn ĐK', icon: Shield, color: 'text-slate-600' },
      { id: 'FIRST_TIME_REG', label: 'ĐK Lần đầu (17t)', icon: Baby, color: 'text-pink-600' },
      { id: 'TT50', label: 'Không tuyển (TT50)', icon: BookX, color: 'text-slate-500' },
      { id: 'PRE_CHECK', label: 'Đủ ĐK Sơ tuyển', icon: ClipboardList, color: 'text-blue-600' },
      { id: 'MED_EXAM', label: 'Đủ ĐK Khám', icon: Stethoscope, color: 'text-indigo-600' },
      { id: 'DEFERRED_LIST', label: 'Tạm hoãn', icon: PauseCircle, color: 'text-amber-600' },
      { id: 'EXEMPTED_LIST', label: 'Miễn gọi NN', icon: ShieldCheck, color: 'text-purple-600' },
      { id: 'FINAL', label: 'Chốt hồ sơ', icon: FileSignature, color: 'text-green-600' },
      { id: 'ENLISTED', label: 'Nhập ngũ', icon: Flag, color: 'text-red-600' },
      { id: 'REMOVED', label: 'Loại khỏi nguồn', icon: UserX, color: 'text-gray-400' },
      { id: 'REMAINING', label: 'Nguồn còn lại', icon: Layers, color: 'text-teal-600' },
  ];

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
              // Cấp Xã/Phường
              filtered = filtered.filter(r => 
                  r.address.province === user.unit.province && 
                  r.address.commune === user.unit.commune
              );
          } else if (isProvinceAdmin && user.unit.province) {
               // Cấp Tỉnh (Xem toàn tỉnh)
               filtered = filtered.filter(r => r.address.province === user.unit.province);
          }
      } else {
          // Admin filters
          if (filterProvince) filtered = filtered.filter(r => r.address.province === filterProvince);
          if (filterCommune) filtered = filtered.filter(r => r.address.commune === filterCommune);
      }
      return filtered;
  }, [recruits, sessionYear, user, isAdmin, isProvinceAdmin, filterProvince, filterCommune]);

  // Filter based on Tab & Search
  const filteredRecruits = useMemo(() => {
      let result = scopeRecruits;

      // Filter by Tab
      switch (initialTab) {
          case 'NOT_ALLOWED_REG':
              result = result.filter(r => r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION);
              break;
          case 'EXEMPT_REG':
              result = result.filter(r => r.status === RecruitmentStatus.EXEMPT_REGISTRATION);
              break;
          case 'FIRST_TIME_REG':
              result = result.filter(r => checkAge(r) < 18 && isValidSourceStatus(r.status));
              break;
          case 'ALL':
              result = result.filter(r => checkAge(r) >= 18 && isValidSourceStatus(r.status));
              break;
          case 'TT50':
              result = result.filter(r => r.status === RecruitmentStatus.NOT_SELECTED_TT50);
              break;
          case 'PRE_CHECK':
              const preCheckStatuses = [
                RecruitmentStatus.SOURCE, RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.PRE_CHECK_FAILED, 
                RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED
              ];
              result = result.filter(r => checkAge(r) >= 18 && preCheckStatuses.includes(r.status));
              break;
          case 'MED_EXAM':
              const medStatuses = [
                RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, 
                RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED
              ];
              result = result.filter(r => checkAge(r) >= 18 && medStatuses.includes(r.status));
              break;
          case 'DEFERRED_LIST':
              result = result.filter(r => r.status === RecruitmentStatus.DEFERRED);
              break;
          case 'EXEMPTED_LIST':
              result = result.filter(r => r.status === RecruitmentStatus.EXEMPTED);
              break;
          case 'FINAL':
              result = result.filter(r => r.status === RecruitmentStatus.FINALIZED);
              break;
          case 'ENLISTED':
              result = result.filter(r => r.status === RecruitmentStatus.ENLISTED);
              break;
          case 'REMOVED':
              result = result.filter(r => r.status === RecruitmentStatus.REMOVED_FROM_SOURCE);
              break;
          case 'REMAINING':
              const remainingStatuses = [
                RecruitmentStatus.SOURCE, RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.PRE_CHECK_FAILED, 
                RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, 
                RecruitmentStatus.DEFERRED, RecruitmentStatus.EXEMPTED, RecruitmentStatus.NOT_SELECTED_TT50
              ];
              result = result.filter(r => checkAge(r) >= 18 && remainingStatuses.includes(r.status) && r.enlistmentType !== 'OFFICIAL');
              break;
          default:
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
  }, [scopeRecruits, initialTab, searchTerm, sessionYear]);

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

  // Export to CSV
  const handleExportCSV = () => {
      const headers = ["HoVaTen", "NgaySinh", "CCCD", "SDT", "HocVan", "DanToc", "TonGiao", "DiaChi", "TrangThai", "GhiChu"];
      const rows = filteredRecruits.map(r => [
          r.fullName,
          r.dob,
          r.citizenId || '',
          r.phoneNumber || '',
          r.details.education,
          r.details.ethnicity,
          r.details.religion,
          `${r.address.village}, ${r.address.commune}, ${r.address.province}`,
          r.status,
          r.defermentReason || ''
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n" 
          + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `DS_TuyenQuan_${initialTab}_${sessionYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Tính năng riêng: Chuyển Danh sách 1 hoặc 2 sang năm sau
  const handleSpecialListTransfer = async (targetStatus: RecruitmentStatus) => {
      if (isReadOnly) return;
      const nextYear = sessionYear + 1;
      
      let currentList = filteredRecruits.filter(r => r.status === targetStatus);
      
      if (currentList.length === 0) {
          alert("Danh sách hiện tại đang trống.");
          return;
      }

      // Fix: Chỉ lấy danh sách năm sau CỦA ĐƠN VỊ ĐANG QUẢN LÝ để kiểm tra trùng
      let nextYearRecruits = recruits.filter(r => r.recruitmentYear === nextYear);
      
      if (isProvinceAdmin) {
          nextYearRecruits = nextYearRecruits.filter(r => r.address.province === user.unit.province);
      } else if (!isAdmin) {
          nextYearRecruits = nextYearRecruits.filter(r => r.address.commune === user.unit.commune);
      } else {
          // Nếu là Admin, kiểm tra theo bộ lọc đang chọn (nếu có)
          if (filterProvince) nextYearRecruits = nextYearRecruits.filter(r => r.address.province === filterProvince);
          if (filterCommune) nextYearRecruits = nextYearRecruits.filter(r => r.address.commune === filterCommune);
      }

      const toCreate: Recruit[] = [];

      currentList.forEach(sourceRecruit => {
          const exists = nextYearRecruits.some(t => t.citizenId === sourceRecruit.citizenId);
          if (!exists) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, ...cleanRecruitData } = sourceRecruit;
              const newRecruit: Recruit = {
                  ...cleanRecruitData,
                  id: Date.now().toString(36) + Math.random().toString(36).substr(2) + toCreate.length,
                  recruitmentYear: nextYear,
                  // Giữ nguyên trạng thái và lý do cho DS 1 và 2
                  status: targetStatus,
                  defermentReason: sourceRecruit.defermentReason,
                  defermentProof: sourceRecruit.defermentProof,
                  enlistmentUnit: undefined, enlistmentDate: undefined, enlistmentType: undefined
              };
              toCreate.push(newRecruit);
          }
      });

      if (toCreate.length === 0) {
          alert(`Tất cả hồ sơ trong danh sách này đã có mặt ở năm ${nextYear} (hoặc trùng CCCD với hồ sơ đã có).`);
          return;
      }

      if (!window.confirm(`Xác nhận chuyển ${toCreate.length} hồ sơ sang năm ${nextYear}?\n(Trạng thái và lý do sẽ được bảo lưu)`)) return;

      for (const r of toCreate) {
          onUpdate(r);
      }
      alert(`Đã chuyển thành công ${toCreate.length} hồ sơ.`);
  };

  const communeList = useMemo(() => {
     if (!filterProvince) return [];
     // @ts-ignore
     const data = LOCATION_DATA[filterProvince];
     return data ? Object.keys(data) : [];
  }, [filterProvince]);

  return (
    <div className="flex flex-col h-full gap-4">
        {/* HEADER: TABS & FILTER */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            {/* Admin Filters */}
            {isAdmin && (
                <div className="flex flex-col md:flex-row gap-4 items-center mb-4 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2 text-gray-700 font-bold whitespace-nowrap text-sm uppercase">
                        <Filter size={16} /> Phạm vi:
                    </div>
                    <select 
                        className="border border-gray-300 rounded p-2 text-sm w-full md:w-48"
                        value={filterProvince}
                        onChange={(e) => { setFilterProvince(e.target.value); setFilterCommune(''); }}
                    >
                        <option value="">-- Cả nước --</option>
                        {PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select 
                        className="border border-gray-300 rounded p-2 text-sm w-full md:w-48 disabled:bg-gray-100"
                        value={filterCommune}
                        onChange={(e) => setFilterCommune(e.target.value)}
                        disabled={!filterProvince}
                    >
                        <option value="">-- Toàn tỉnh --</option>
                        {communeList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            )}

            {/* Tabs List */}
            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { onTabChange(tab.id); setCurrentPage(1); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${initialTab === tab.id ? 'bg-military-50 border-military-300 text-military-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                        <tab.icon size={14} className={initialTab === tab.id ? 'text-military-600' : tab.color} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm công dân..." 
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-military-500"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium text-gray-700 whitespace-nowrap">
                        <Download size={16} /> Xuất DS
                    </button>

                    {/* Special Transfer Buttons for Lists 1 & 2 */}
                    {!isReadOnly && initialTab === 'NOT_ALLOWED_REG' && (
                         <button onClick={() => handleSpecialListTransfer(RecruitmentStatus.NOT_ALLOWED_REGISTRATION)} className="flex items-center gap-2 px-3 py-2 border border-red-300 bg-red-50 text-red-700 rounded hover:bg-red-100 text-sm font-bold whitespace-nowrap">
                            <ArrowRightCircle size={16} /> Chuyển sang năm {sessionYear + 1}
                         </button>
                    )}
                    {!isReadOnly && initialTab === 'EXEMPT_REG' && (
                         <button onClick={() => handleSpecialListTransfer(RecruitmentStatus.EXEMPT_REGISTRATION)} className="flex items-center gap-2 px-3 py-2 border border-slate-300 bg-slate-50 text-slate-700 rounded hover:bg-slate-100 text-sm font-bold whitespace-nowrap">
                            <ArrowRightCircle size={16} /> Chuyển sang năm {sessionYear + 1}
                         </button>
                    )}

                    {!isReadOnly && (
                        <button onClick={handleCreate} className="flex items-center gap-2 px-3 py-2 bg-military-600 text-white rounded hover:bg-military-700 text-sm font-bold whitespace-nowrap shadow-sm">
                            <Plus size={16} /> Thêm mới
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-600 sticky top-0 z-10">
                        <tr>
                            <th className="p-3 border-b border-gray-200">Họ và tên</th>
                            <th className="p-3 border-b border-gray-200">Năm sinh</th>
                            <th className="p-3 border-b border-gray-200">Trình độ</th>
                            <th className="p-3 border-b border-gray-200">Sức khỏe</th>
                            <th className="p-3 border-b border-gray-200">Địa chỉ</th>
                            <th className="p-3 border-b border-gray-200">Ghi chú / Lý do</th>
                            <th className="p-3 border-b border-gray-200 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {paginatedRecruits.length > 0 ? (
                            paginatedRecruits.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50 group">
                                    <td className="p-3">
                                        <div className="font-bold text-gray-900">{r.fullName}</div>
                                        <div className="text-xs text-gray-500 font-mono">{r.citizenId}</div>
                                    </td>
                                    <td className="p-3">{r.dob.split('-')[0]}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.details.education.includes('ĐH') || r.details.education.includes('CĐ') ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                                            {r.details.education}
                                        </span>
                                    </td>
                                    <td className="p-3 font-bold text-center w-24">
                                        {r.physical.healthGrade ? `Loại ${r.physical.healthGrade}` : '--'}
                                    </td>
                                    <td className="p-3 max-w-[200px] truncate" title={`${r.address.village}, ${r.address.commune}`}>
                                        {r.address.village}, {r.address.commune}
                                    </td>
                                    <td className="p-3 max-w-[200px] truncate text-gray-500 italic">
                                        {r.defermentReason || r.status}
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Xem/Sửa">
                                                <FileEdit size={16} />
                                            </button>
                                            {!isReadOnly && (
                                                <button 
                                                    onClick={() => { if(window.confirm('Xóa hồ sơ này?')) onDelete(r.id); }} 
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Trang {currentPage} / {totalPages} ({filteredRecruits.length} hồ sơ)</span>
                    <div className="flex gap-1">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* RECRUIT FORM MODAL */}
        {showForm && (
            <RecruitForm 
                initialData={editingRecruit}
                initialStatus={
                    initialTab === 'NOT_ALLOWED_REG' ? RecruitmentStatus.NOT_ALLOWED_REGISTRATION :
                    initialTab === 'EXEMPT_REG' ? RecruitmentStatus.EXEMPT_REGISTRATION :
                    undefined
                }
                user={user}
                onSubmit={handleSave}
                onClose={() => setShowForm(false)}
                sessionYear={sessionYear}
            />
        )}
    </div>
  );
}

export default RecruitManagement;
