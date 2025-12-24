
import React from 'react';
import { 
  FileSignature, FileEdit, ArrowUpCircle, Trash2, PauseCircle, ShieldCheck, 
  BookX, UserX, CheckCircle2, XCircle, Flag, Tent, Undo2, Save, RotateCcw, UserPlus
} from 'lucide-react';
import { Recruit, RecruitmentStatus } from '../../../types';

interface ActionButtonsProps {
  recruit: Recruit;
  activeTabId: string;
  isReadOnly: boolean;
  failureReasons: Record<string, string>;
  setFailureReasons: (val: any) => void;
  onEdit: (r: Recruit) => void;
  onUpdate: (r: Recruit) => void;
  onDelete: (id: string) => void;
  onOpenReasonModal: (r: Recruit, type: 'DEFERRED' | 'EXEMPTED') => void;
  onOpenRemoveModal: (r: Recruit, type: 'DEFERRED' | 'EXEMPTED') => void; // Chỉnh sửa kiểu dữ liệu prop nếu cần, hoặc giữ nguyên
  onHealthGradeSelect: (r: Recruit, grade: number) => void;
  onUpdateFailureReason: (r: Recruit) => void;
  isExpiring?: boolean; // Prop mới để nhận diện trạng thái hết hạn
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  recruit, activeTabId, isReadOnly, failureReasons, setFailureReasons,
  onEdit, onUpdate, onDelete, onOpenReasonModal, onOpenRemoveModal, onHealthGradeSelect, onUpdateFailureReason,
  isExpiring = false
}) => {
  if (isReadOnly) return (
    <div className="flex items-center justify-center gap-1">
      <button onClick={() => onEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Xem hồ sơ">
        <FileSignature size={16} />
      </button>
    </div>
  );

  const handleSoftDelete = () => {
    if (window.confirm(`Xác nhận chuyển hồ sơ của công dân ${recruit.fullName} vào Thùng rác (Danh sách 15)?`)) {
      onUpdate({ 
        ...recruit, 
        status: RecruitmentStatus.DELETED, 
        previousStatus: recruit.status,
        enlistmentType: undefined,
        enlistmentUnit: undefined,
        enlistmentDate: undefined
      });
    }
  };

  const handleMoveToFirstTimeReg = () => {
    const listName = activeTabId === 'NOT_ALLOWED_REG' ? 'Danh sách 1' : 'Danh sách 2';
    if (window.confirm(`Xác nhận chuyển công dân ${recruit.fullName} từ ${listName} sang Danh sách 3 (Đăng ký lần đầu)?\n\nHệ thống sẽ xóa bỏ hoàn toàn lý do và tình trạng cấm/miễn đăng ký trước đó.`)) {
      onUpdate({ 
        ...recruit, 
        status: RecruitmentStatus.FIRST_TIME_REGISTRATION, 
        previousStatus: recruit.status,
        defermentReason: '',
        defermentProof: '',
        enlistmentType: undefined,
        enlistmentUnit: undefined,
        enlistmentDate: undefined
      });
    }
  };
  
  switch (activeTabId) {
    case 'NOT_ALLOWED_REG':
      return (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => onEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Sửa hồ sơ"><FileEdit size={16} /></button>
          <button 
            onClick={handleMoveToFirstTimeReg}
            className="p-1 text-purple-600 hover:bg-purple-50 rounded" 
            title="Đưa về Đăng ký lần đầu (DS 3)"
          >
            <UserPlus size={16} />
          </button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa hồ sơ (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
    case 'EXEMPT_REG':
      return (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => onEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Sửa hồ sơ"><FileEdit size={16} /></button>
          <button 
            onClick={handleMoveToFirstTimeReg}
            className="p-1 text-purple-600 hover:bg-purple-50 rounded" 
            title="Đưa về Đăng ký lần đầu (DS 3)"
          >
            <UserPlus size={16} />
          </button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa hồ sơ (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
    case 'FIRST_TIME_REG':
      return (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => onEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Sửa hồ sơ"><FileEdit size={16} /></button>
          <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.SOURCE, previousStatus: recruit.status })} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Đưa vào nguồn (DS 4)"><ArrowUpCircle size={16} /></button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa hồ sơ (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
    case 'ALL':
      return (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => onEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa"><FileEdit size={16} /></button>
          <button onClick={() => onOpenReasonModal(recruit, 'DEFERRED')} className="p-1 text-amber-600 hover:bg-amber-50 rounded" title="Tạm hoãn (DS 8)"><PauseCircle size={16}/></button>
          <button onClick={() => onOpenReasonModal(recruit, 'EXEMPTED')} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Miễn gọi nhập ngũ (DS 9)"><ShieldCheck size={16}/></button>
          <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.NOT_SELECTED_TT50, previousStatus: recruit.status, enlistmentType: undefined, enlistmentUnit: undefined, enlistmentDate: undefined })} className="p-1 text-slate-600 hover:bg-slate-50 rounded" title="TT 50 (DS 5)"><BookX size={16}/></button>
          <button onClick={() => onOpenRemoveModal(recruit, 'DEFERRED')} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Loại khỏi nguồn (DS 12)"><UserX size={16} /></button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
    case 'PRE_CHECK':
      return (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.PRE_CHECK_PASSED, previousStatus: recruit.status })} className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-black uppercase hover:bg-blue-700 transition-all"><CheckCircle2 size={12}/> Đạt sơ khám</button>
          <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.PRE_CHECK_FAILED, previousStatus: recruit.status })} className="flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded text-[10px] font-black uppercase hover:bg-orange-700 transition-all"><XCircle size={12}/> Loại sơ khám</button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded ml-1" title="Xóa (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
    case 'MED_EXAM':
      return (
        <div className="flex flex-wrap items-center justify-center gap-1 min-w-[150px]">
          {[1,2,3,4,5,6].map(g => (
            <button 
              key={g} 
              onClick={() => onHealthGradeSelect(recruit, g)}
              className={`w-7 h-7 rounded text-[10px] font-black border transition-all ${recruit.physical.healthGrade === g ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50'}`}
            >
              {g}
            </button>
          ))}
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded ml-1" title="Xóa (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
    case 'FINAL':
      return (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.ENLISTED, enlistmentType: 'OFFICIAL', previousStatus: recruit.status })} className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-[10px] font-black uppercase hover:bg-red-700 transition-all"><Flag size={12}/> Phát lệnh</button>
          <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.FINALIZED, enlistmentType: 'RESERVE', previousStatus: recruit.status })} className="flex items-center gap-1 px-2 py-1 bg-teal-600 text-white rounded text-[10px] font-black uppercase hover:bg-teal-700 transition-all"><Tent size={12}/> Chốt Dự bị</button>
          <button onClick={() => onEdit(recruit)} className="p-1 text-gray-500 hover:bg-gray-100 rounded ml-1"><FileEdit size={14}/></button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa (Chuyển vào DS 15)"><Trash2 size={16} /></button>
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
          <button onClick={() => onUpdateFailureReason(recruit)} className="p-1.5 bg-military-600 text-white rounded hover:bg-military-700" title="Lưu lý do"><Save size={14}/></button>
          <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.SOURCE, defermentReason: '', previousStatus: recruit.status, enlistmentType: undefined, enlistmentUnit: undefined, enlistmentDate: undefined })} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Khôi phục về Nguồn"><Undo2 size={16}/></button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
    case 'DELETED_LIST':
      return (
        <div className="flex items-center justify-center gap-1">
          <button 
            onClick={() => onUpdate({ ...recruit, status: recruit.previousStatus || RecruitmentStatus.SOURCE, previousStatus: RecruitmentStatus.DELETED, enlistmentType: undefined, enlistmentUnit: undefined, enlistmentDate: undefined })} 
            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-[10px] font-black uppercase hover:bg-green-700 transition-all"
            title="Khôi phục hồ sơ"
          >
            <RotateCcw size={12}/> Khôi phục
          </button>
          <button 
            onClick={() => {
              if(window.confirm(`XÓA VĨNH VIỄN: Bạn có chắc muốn xóa vĩnh viễn hồ sơ của ${recruit.fullName}? Hành động này không thể hoàn tác.`)) {
                onDelete(recruit.id);
              }
            }} 
            className="p-1.5 text-red-600 hover:bg-red-50 rounded" 
            title="Xóa vĩnh viễn"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => onEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa"><FileEdit size={16} /></button>
          <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.SOURCE, defermentReason: '', previousStatus: recruit.status, enlistmentType: undefined, enlistmentUnit: undefined, enlistmentDate: undefined })} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Khôi phục về Nguồn"><Undo2 size={16}/></button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
  }
};

export default ActionButtons;
