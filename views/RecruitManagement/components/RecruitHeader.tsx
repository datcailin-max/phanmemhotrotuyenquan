
import React from 'react';
import { Download, Plus, Trash2, MapPin, Layers, ArrowRightLeft, Camera, FileSpreadsheet } from 'lucide-react';

interface RecruitHeaderProps {
  activeTab: any;
  sessionYear: number;
  filteredCount: number;
  isReadOnly: boolean;
  activeTabId: string;
  onAdd: () => void;
  onDeleteAll?: () => void;
  onBulkVillageRename?: () => void;
  onCheckDuplicates?: () => void;
  onProposeAge17?: () => void;
  onBulkAvatarUpload?: () => void;
  onBulkExcelImport?: () => void;
  onExportCurrentList?: () => void;
}

const RecruitHeader: React.FC<RecruitHeaderProps> = ({ 
  activeTab, sessionYear, filteredCount, isReadOnly, activeTabId, onAdd, onDeleteAll, onBulkVillageRename, onCheckDuplicates, onProposeAge17, onBulkAvatarUpload, onBulkExcelImport, onExportCurrentList
}) => {
  return (
    <div className="p-4 px-5 md:px-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white shrink-0 shadow-sm relative z-10">
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
        <h2 className={`text-base font-black flex items-center gap-2 uppercase tracking-tight whitespace-nowrap ${activeTab.textColor}`}>
          {activeTab.icon && <activeTab.icon size={18} />} {activeTab.label}
        </h2>
        <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
            NĂM TUYỂN CHỌN {sessionYear}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-[11px] font-black text-military-700 uppercase tracking-wider bg-military-50 border border-military-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
            {filteredCount} HỒ SƠ TRONG DANH SÁCH
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 flex-wrap md:flex-nowrap">
        {/* Nút Xuất danh sách Excel hiện tại */}
        {onExportCurrentList && (
           <button 
             onClick={onExportCurrentList}
             className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold uppercase text-xs shadow-sm hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
             title="Xuất file Excel cho danh sách công dân đang hiển thị"
           >
             <Download size={14} /> Xuất Excel
           </button>
        )}

        {/* Nút Nhập dữ liệu tự động từ Excel */}
        {!isReadOnly && onBulkExcelImport && (
           <button 
             onClick={onBulkExcelImport}
             className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-700 text-white rounded-lg font-bold uppercase text-xs shadow-sm hover:bg-emerald-800 transition-all active:scale-95 whitespace-nowrap"
             title="Nhập dữ liệu công dân tự động từ tệp Excel (Thêm mới & Cập nhật theo CCCD)"
           >
             <FileSpreadsheet size={14} /> Nhập từ Excel
           </button>
        )}

        {/* Nút Chèn ảnh công dân hàng loạt theo số CCCD */}
        {!isReadOnly && onBulkAvatarUpload && (
           <button 
             onClick={onBulkAvatarUpload}
             className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-600 text-white rounded-lg font-bold uppercase text-xs shadow-sm hover:bg-teal-700 transition-all active:scale-95 whitespace-nowrap"
             title="Tải lên và tự động gán ảnh công dân theo số CCCD (Cú pháp file: TÊN-SỐCCCD)"
           >
             <Camera size={14} /> Chèn ảnh
           </button>
        )}

        {/* Nút lọc và xử lý trùng lặp - Chỉ hiện cho đơn vị có quyền sửa */}
        {!isReadOnly && onCheckDuplicates && (
           <button 
             onClick={onCheckDuplicates}
             className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 text-white rounded-lg font-bold uppercase text-xs shadow-sm hover:bg-amber-600 transition-all active:scale-95 whitespace-nowrap"
           >
             <Layers size={14} /> Quét trùng lặp
           </button>
        )}

        {/* Nút đổi tên thôn đồng loạt - Chỉ hiện cho đơn vị có quyền sửa */}
        {!isReadOnly && onBulkVillageRename && (
           <button 
             onClick={onBulkVillageRename}
             className="flex items-center gap-1.5 px-2.5 py-1.5 bg-military-100 text-military-800 rounded-lg font-bold uppercase text-xs border border-military-200 hover:bg-military-200 transition-all active:scale-95 whitespace-nowrap"
           >
             <MapPin size={14} /> Đổi tên Thôn/Ấp
           </button>
        )}

        {/* Nút xóa vĩnh viễn toàn bộ - Chỉ dành cho DS 15 */}
        {activeTabId === 'DELETED_LIST' && !isReadOnly && (
          <button 
            onClick={onDeleteAll} 
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-600 text-white rounded-lg font-bold uppercase text-xs shadow-sm hover:bg-red-700 transition-all active:scale-95 whitespace-nowrap animate-in slide-in-from-right-2"
          >
            <Trash2 size={14} /> Xóa vĩnh viễn toàn bộ
          </button>
        )}
        
        {!isReadOnly && ['NOT_ALLOWED_REG', 'EXEMPT_REG', 'FIRST_TIME_REG', 'ALL'].includes(activeTabId) && (
          <>
            {activeTabId === 'FIRST_TIME_REG' && onProposeAge17 && (
              <button 
                onClick={onProposeAge17} 
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-600 text-white rounded-lg font-bold uppercase text-xs shadow-sm hover:bg-cyan-700 transition-all active:scale-95 whitespace-nowrap"
              >
                <ArrowRightLeft size={14} /> Đề nghị chuyển công dân 17 tuổi
              </button>
            )}
            <button 
              onClick={onAdd} 
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-military-700 text-white rounded-lg font-bold uppercase text-xs shadow-sm hover:bg-military-800 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={14} /> Thêm công dân
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecruitHeader;
