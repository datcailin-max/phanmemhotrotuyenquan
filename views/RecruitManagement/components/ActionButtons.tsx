
import React from 'react';
import { 
  FileSignature, FileEdit, ArrowUpCircle, Trash2, PauseCircle, ShieldCheck, 
  BookX, UserX, CheckCircle2, XCircle, Flag, Tent, Undo2, Save, RotateCcw, UserPlus, Calendar as CalendarIcon, Building2
} from 'lucide-react';
import { Recruit, RecruitmentStatus } from '../../../types';

interface ActionButtonsProps {
  recruit: Recruit;
  activeTabId: string;
  isReadOnly: boolean;
  failureReasons: Record<string, string>;
  setFailureReasons: (val: any) => void;
  enlistmentUnits?: Record<string, string>;
  setEnlistmentUnits?: (val: any) => void;
  enlistmentDates?: Record<string, string>;
  setEnlistmentDates?: (val: any) => void;
  onEdit: (r: Recruit) => void;
  onUpdate: (r: Recruit) => void;
  onDelete: (id: string) => void;
  onOpenReasonModal: (r: Recruit, type: 'DEFERRED' | 'EXEMPTED') => void;
  onOpenRemoveModal: (r: Recruit, type: 'DEFERRED' | 'EXEMPTED') => void; 
  onHealthGradeSelect: (r: Recruit, grade: number) => void;
  onUpdateFailureReason: (r: Recruit) => void;
  onUpdateEnlistmentInfo?: (r: Recruit) => void;
  onOpenTT50Modal?: (r: Recruit) => void; 
  onOpenPreCheckFailModal?: (r: Recruit) => void; // Prop mới cho Loại sơ tuyển
  isExpiring?: boolean; 
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  recruit, activeTabId, isReadOnly, failureReasons, setFailureReasons,
  enlistmentUnits = {}, setEnlistmentUnits,
  enlistmentDates = {}, setEnlistmentDates,
  onEdit, onUpdate, onDelete, onOpenReasonModal, onOpenRemoveModal, onHealthGradeSelect, onUpdateFailureReason,
  onUpdateEnlistmentInfo,
  onOpenTT50Modal,
  onOpenPreCheckFailModal,
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

  const HealthButtons = () => (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5,6].map(g => (
        <button 
          key={g} 
          onClick={() => onHealthGradeSelect(recruit, g)}
          className={`w-7 h-7 rounded text-[10px] font-black border transition-all ${recruit.physical.healthGrade === g ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50'}`}
          title={`Phân loại sức khỏe Loại ${g}`}
        >
          {g}
        </button>
      ))}
    </div>
  );
  
  switch (activeTabId) {
    case 'NOT_ALLOWED_REG':
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
          <button onClick={() => onOpenTT50Modal?.(recruit)} className="p-1 text-slate-600 hover:bg-slate-50 rounded" title="KTC, CGNN (DS 5)"><BookX size={16}/></button>
          <button onClick={() => onOpenRemoveModal(recruit, 'DEFERRED')} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Loại khỏi nguồn (DS 12)"><UserX size={16} /></button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
    case 'TT50':
    case 'KTC_SUB1':
    case 'KTC_SUB2':
      return (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => onEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Sửa hồ sơ"><FileEdit size={16} /></button>
          <button 
            onClick={() => onOpenTT50Modal?.(recruit)} 
            className="p-1 text-slate-600 hover:bg-slate-50 rounded" 
            title="Cập nhật lý do KTC, CGNN (TT50)"
          >
            <BookX size={16}/>
          </button>
          <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.SOURCE, defermentReason: '', previousStatus: recruit.status, enlistmentType: undefined, enlistmentUnit: undefined, enlistmentDate: undefined })} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Khôi phục về Nguồn"><Undo2 size={16}/></button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
    case 'PRE_CHECK':
      return (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => onEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded mr-1" title="Sửa hồ sơ"><FileEdit size={16} /></button>
          <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.PRE_CHECK_PASSED, previousStatus: recruit.status })} className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-black uppercase hover:bg-blue-700 transition-all"><CheckCircle2 size={12}/> Đạt sơ khám</button>
          <button onClick={() => onOpenPreCheckFailModal?.(recruit)} className="flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded text-[10px] font-black uppercase hover:bg-orange-700 transition-all"><XCircle size={12}/> Loại sơ khám</button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded ml-1" title="Xóa (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
    case 'MED_EXAM':
    case 'MED_EXAM_PASS':
      return (
        <div className="flex items-center justify-center gap-2 min-w-[200px]">
          <button onClick={() => onEdit(recruit)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Sửa hồ sơ"><FileEdit size={18} /></button>
          <HealthButtons />
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
    case 'ENLISTED':
      return (
        <div className="flex items-center justify-end gap-2 min-w-[450px]">
          <button onClick={() => onEdit(recruit)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Sửa hồ sơ"><FileEdit size={18} /></button>
          
          <div className="flex items-center gap-1 border-x px-2 border-gray-100">
            <div className="flex flex-col gap-0.5">
              <div className="relative">
                <Building2 size={12} className="absolute left-2 top-2 text-gray-400"/>
                <input 
                  className="text-[10px] border border-gray-300 rounded pl-7 pr-2 py-1.5 w-40 font-bold bg-gray-50"
                  placeholder="Đơn vị nhập ngũ..."
                  value={enlistmentUnits[recruit.id] !== undefined ? enlistmentUnits[recruit.id] : (recruit.enlistmentUnit || '')}
                  onChange={(e) => setEnlistmentUnits?.({...enlistmentUnits, [recruit.id]: e.target.value})}
                />
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="relative">
                <CalendarIcon size={12} className="absolute left-2 top-2 text-gray-400"/>
                <input 
                  type="date"
                  className="text-[10px] border border-gray-300 rounded pl-7 pr-2 py-1.5 w-32 font-bold bg-gray-50"
                  value={enlistmentDates[recruit.id] !== undefined ? enlistmentDates[recruit.id] : (recruit.enlistmentDate || '')}
                  onChange={(e) => setEnlistmentDates?.({...enlistmentDates, [recruit.id]: e.target.value})}
                />
              </div>
            </div>
            <button onClick={() => onUpdateEnlistmentInfo?.(recruit)} className="p-2 bg-red-600 text-white rounded hover:bg-red-700 shadow-sm" title="Lưu thông tin lệnh">
              <Save size={14}/>
            </button>
          </div>

          <button onClick={() => onUpdate({ ...recruit, status: RecruitmentStatus.FINALIZED, previousStatus: recruit.status })} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Hoàn lại bước Chốt hồ sơ"><Undo2 size={16}/></button>
          <button onClick={handleSoftDelete} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xóa (Chuyển vào DS 15)"><Trash2 size={16} /></button>
        </div>
      );
    case 'PRE_CHECK_FAIL':
      return (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(recruit)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Sửa hồ sơ"><FileEdit size={16} /></button>
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
    case 'MED_EXAM_FAIL':
      return (
        <div className="flex items-center justify-end gap-2 min-w-[350px]">
          <button onClick={() => onEdit(recruit)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Sửa hồ sơ"><FileEdit size={18} /></button>
          
          <div className="flex flex-col items-center gap-1 border-x px-2 border-gray-100">
            <span className="text-[8px] font-black text-gray-400 uppercase">Khám lại</span>
            <HealthButtons />
          </div>

          <div className="flex items-center gap-1">
            <input 
              className="text-[10px] border border-gray-300 rounded px-2 py-1.5 w-32 font-bold bg-gray-50"
              placeholder="Ghi lý do loại..."
              value={failureReasons[recruit.id] !== undefined ? failureReasons[recruit.id] : (recruit.defermentReason || '')}
              onChange={(e) => setFailureReasons({...failureReasons, [recruit.id]: e.target.value})}
            />
            <button onClick={() => onUpdateFailureReason(recruit)} className="p-1.5 bg-military-600 text-white rounded hover:bg-military-700" title="Lưu lý do"><Save size={14}/></button>
          </div>

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
