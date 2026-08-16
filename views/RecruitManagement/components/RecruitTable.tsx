import React from 'react';
import { 
  Paperclip, ChevronRight, ChevronLeft, GraduationCap, Flag, HeartPulse, AlertTriangle, Globe, User as UserIcon, CheckCircle2, Star 
} from 'lucide-react';
import { Recruit, RecruitmentStatus } from '../../../types';
import { ITEMS_PER_PAGE } from '../constants';
import { getStatusLabel, getStatusColor, checkAge } from '../utils';
import ActionButtons from './ActionButtons';

interface RecruitTableProps {
  paginatedRecruits: Recruit[];
  currentPage: number;
  totalPages: number;
  totalFilteredCount: number;
  activeTabId: string;
  sessionYear: number;
  isReadOnly: boolean;
  onPageChange: (page: number) => void;
  onEdit: (recruit: Recruit) => void;
  onUpdate: (data: Recruit) => void;
  onDelete: (id: string) => void;
  isExpiring: (recruit: Recruit) => boolean;
  
  // Handlers matching ActionButtonsProps
  failureReasons: Record<string, string>;
  setFailureReasons: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  enlistmentUnits: Record<string, string>;
  setEnlistmentUnits: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  enlistmentDates: Record<string, string>;
  setEnlistmentDates: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onOpenReasonModal: (r: Recruit, type: 'DEFERRED' | 'EXEMPTED') => void;
  onOpenRemoveModal: (r: Recruit) => void;
  onHealthGradeSelect: (r: Recruit, grade: number) => void;
  onUpdateFailureReason: (r: Recruit) => void;
  onUpdateEnlistmentInfo: (r: Recruit) => void;
  onOpenTT50Modal: (r: Recruit) => void;
  onOpenPreCheckFailModal: (r: Recruit) => void;
}

export const RecruitTable: React.FC<RecruitTableProps> = ({
  paginatedRecruits,
  currentPage,
  totalPages,
  totalFilteredCount,
  activeTabId,
  sessionYear,
  isReadOnly,
  onPageChange,
  onEdit,
  onUpdate,
  onDelete,
  isExpiring,
  failureReasons,
  setFailureReasons,
  enlistmentUnits,
  setEnlistmentUnits,
  enlistmentDates,
  setEnlistmentDates,
  onOpenReasonModal,
  onOpenRemoveModal,
  onHealthGradeSelect,
  onUpdateFailureReason,
  onUpdateEnlistmentInfo,
  onOpenTT50Modal,
  onOpenPreCheckFailModal
}) => {
  return (
    <>
      <div className="flex-1 overflow-auto bg-white relative custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-[10px] text-gray-500 uppercase font-black sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 border-b text-center w-12">STT</th>
              <th className="p-4 border-b min-w-[200px]">Họ và tên / CCCD</th>
              <th className="p-4 border-b text-center">Ngày sinh / Tuổi</th>
              <th className="p-4 border-b">Địa bàn cư trú</th>
              <th className="p-4 border-b">Chất lượng (HV/CT/SK)</th>
              {activeTabId === 'FIRST_TIME_REG' && <th className="p-4 border-b text-center">Hình thức ĐK</th>}
              <th className="p-4 border-b min-w-[150px]">Tình trạng hiện tại</th>
              <th className="p-4 border-b text-center">Thao tác xử lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedRecruits.length === 0 ? (
              <tr>
                <td colSpan={activeTabId === 'FIRST_TIME_REG' ? 8 : 7} className="p-12 text-center text-gray-400 italic">
                  Không tìm thấy hồ sơ nào phù hợp với điều kiện lọc.
                </td>
              </tr>
            ) : paginatedRecruits.map((recruit, index) => {
              const expiring = isExpiring(recruit);
              const isProposedL7 = recruit.details.education === 'Lớp 7' && recruit.details.proposedForSelection;
              const birthYear = parseInt(recruit.dob?.split('-')[0] || '0');
              const birthMonth = parseInt(recruit.dob?.split('-')[1] || '0');
              const isJanSpecial = birthYear === (sessionYear - 17) && birthMonth === 1;
              
              return (
                <tr key={recruit.id} className={`hover:bg-military-50/30 transition-colors group ${expiring ? 'bg-red-50/20' : ''} ${isProposedL7 ? 'bg-amber-50/30 border-l-4 border-amber-400' : ''}`}>
                  <td className="p-4 text-center text-gray-400 font-medium">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-black text-military-900 uppercase tracking-tight">{recruit.fullName}</div>
                      {recruit.attachments?.length ? <Paperclip size={14} className="text-blue-500" /> : null}
                      {expiring && (
                        <span title="Hồ sơ đã hết thời gian tạm hoãn/cấm ĐK - Cần chuyển trạng thái">
                          <AlertTriangle size={14} className="text-red-500 animate-bounce" />
                        </span>
                      )}
                      {isProposedL7 && (
                        <span title="Công dân Lớp 7 được đề xuất tuyển chọn đặc cách">
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                        </span>
                      )}
                      {isJanSpecial && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded border border-emerald-300" title={`Công dân sinh tháng 01/${sessionYear - 17} - Đủ 18 tuổi vào đợt giao quân đầu năm ${sessionYear + 1}`}>
                          T01/{sessionYear - 17}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5 tracking-tighter">
                      {recruit.citizenId || 'Chưa cập nhật CCCD'}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-bold text-gray-700">
                      {recruit.dob ? recruit.dob.split('-').reverse().join('/') : '---'}
                    </div>
                    {recruit.dob && (
                      <div className="text-[10px] font-black text-military-500 uppercase mt-0.5 tracking-tighter">
                        {checkAge(recruit, sessionYear)} Tuổi
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-gray-800">{recruit.address.village}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">{recruit.address.commune}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-[10px] font-black uppercase">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <GraduationCap size={12} className="text-military-400"/> 
                        {recruit.details.education}
                        {expiring && recruit.status === RecruitmentStatus.DEFERRED && <span className="text-red-600 bg-red-50 px-1 rounded ml-1">ĐÃ HỌC XONG</span>}
                        {isProposedL7 && <span className="text-amber-700 bg-amber-100 px-1 rounded ml-1">ĐỀ XUẤT</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Flag size={12} className="text-red-400"/> 
                        {recruit.details.politicalStatus === 'Dang_Vien' ? 'Đảng viên' : recruit.details.politicalStatus === 'Doan_Vien' ? 'Đoàn viên' : 'Quần chúng'}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <HeartPulse size={12} className="text-blue-400"/> SK Loại {recruit.physical.healthGrade || '---'}
                      </div>
                    </div>
                  </td>
                  {activeTabId === 'FIRST_TIME_REG' && (
                    <td className="p-4 text-center">
                      {recruit.details.registrationMethod === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-black border border-blue-100 uppercase">
                          <Globe size={10}/> Trực tuyến
                        </span>
                      ) : recruit.details.registrationMethod === 'DIRECT' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-[9px] font-black border border-cyan-100 uppercase">
                          <UserIcon size={10}/> Trực tiếp
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-400 italic font-bold">Chưa chọn</span>
                      )}
                    </td>
                  )}
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusColor(recruit.status)}`}>
                      {getStatusLabel(recruit.status)}
                    </span>
                    {recruit.defermentReason && (
                      <div className="text-[10px] text-gray-500 italic mt-1.5 leading-tight truncate max-w-[180px]" title={recruit.defermentReason}>
                        {recruit.defermentReason}
                      </div>
                    )}
                    {expiring && recruit.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION && (
                      <div className="mt-1 flex items-center gap-1 text-[9px] font-black text-red-600 uppercase">
                        <AlertTriangle size={10}/> HẾT ÁN PHẠT ({recruit.details.sentencePeriod}) - CẦN ĐƯA VỀ DS 3
                      </div>
                    )}
                    {isProposedL7 && (
                      <div className="mt-1 flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase">
                        <CheckCircle2 size={10}/> ĐƯỢC ĐỀ XUẤT ĐẶC CÁCH
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <ActionButtons 
                      recruit={recruit}
                      activeTabId={activeTabId}
                      isReadOnly={isReadOnly}
                      failureReasons={failureReasons}
                      setFailureReasons={setFailureReasons}
                      enlistmentUnits={enlistmentUnits}
                      setEnlistmentUnits={setEnlistmentUnits}
                      enlistmentDates={enlistmentDates}
                      setEnlistmentDates={setEnlistmentDates}
                      onEdit={onEdit}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onOpenReasonModal={onOpenReasonModal}
                      onOpenRemoveModal={onOpenRemoveModal}
                      onHealthGradeSelect={onHealthGradeSelect}
                      onUpdateFailureReason={onUpdateFailureReason}
                      onUpdateEnlistmentInfo={onUpdateEnlistmentInfo}
                      onOpenTT50Modal={onOpenTT50Modal}
                      onOpenPreCheckFailModal={onOpenPreCheckFailModal}
                      isExpiring={expiring}
                      sessionYear={sessionYear}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between bg-gray-50/50 shrink-0">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Trang {currentPage} / {totalPages} (Tổng {totalFilteredCount} kết quả)
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
              disabled={currentPage === 1} 
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-white transition-all shadow-sm"
            >
              <ChevronLeft size={18}/>
            </button>
            <button 
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
              disabled={currentPage === totalPages} 
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-white transition-all shadow-sm"
            >
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RecruitTable;
