
import React from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';

interface RecruitHeaderProps {
  activeTab: any;
  sessionYear: number;
  filteredCount: number;
  isReadOnly: boolean;
  activeTabId: string;
  onExport: () => void;
  onAdd: () => void;
  onDeleteAll?: () => void;
}

const RecruitHeader: React.FC<RecruitHeaderProps> = ({ 
  activeTab, sessionYear, filteredCount, isReadOnly, activeTabId, onExport, onAdd, onDeleteAll 
}) => {
  return (
    <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shrink-0 shadow-sm relative z-10">
      <div className="flex-1">
        <h2 className={`text-xl font-black flex items-center gap-2 uppercase tracking-tight ${activeTab.textColor}`}>
          {activeTab.icon && <activeTab.icon size={24} />} {activeTab.label}
        </h2>
        <div className="flex items-center gap-4 mt-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none border-r pr-4">
            Năm tuyển chọn {sessionYear}
          </p>
          <p className="text-[10px] font-black text-military-600 uppercase tracking-widest leading-none bg-military-50 px-2 py-0.5 rounded">
            {filteredCount} hồ sơ trong danh sách
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {/* Nút xóa vĩnh viễn toàn bộ - Chỉ dành cho DS 15 */}
        {activeTabId === 'DELETED_LIST' && !isReadOnly && (
          <button 
            onClick={onDeleteAll} 
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-red-700 transition-all active:scale-95 animate-in slide-in-from-right-2"
          >
            <Trash2 size={18} /> Xóa vĩnh viễn toàn bộ
          </button>
        )}
        
        <button 
          onClick={onExport} 
          className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-green-800 transition-all active:scale-95"
        >
          <Download size={18} /> Xuất mẫu Excel
        </button>
        
        {!isReadOnly && ['NOT_ALLOWED_REG', 'EXEMPT_REG', 'FIRST_TIME_REG', 'ALL'].includes(activeTabId) && (
          <button 
            onClick={onAdd} 
            className="flex items-center gap-2 px-4 py-2.5 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-military-800 transition-all active:scale-95"
          >
            <Plus size={18} /> Thêm công dân
          </button>
        )}
      </div>
    </div>
  );
};

export default RecruitHeader;
