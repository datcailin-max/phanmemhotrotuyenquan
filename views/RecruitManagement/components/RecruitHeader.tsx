
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
    <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shrink-0 shadow-sm relative z-10">
      <div className="flex-1">
        <h2 className={`text-xl font-black flex items-center gap-2 uppercase tracking-tight ${activeTab.textColor}`}>
          {activeTab.icon && <activeTab.icon size={24} />} {activeTab.label}
        </h2>
        <div className="flex items-center gap-4 mt-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none border-r pr-4">
            NĂM TUYỂN CHỌN {sessionYear}
          </p>
          <p className="text-[10px] font-black text-military-600 uppercase tracking-widest leading-none bg-military-50 px-2 py-0.5 rounded">
            {filteredCount} HỒ SƠ TRONG DANH SÁCH
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap md:flex-nowrap">
        {/* Nút Xuất danh sách Excel hiện tại */}
        {onExportCurrentList && (
           <button 
             onClick={onExportCurrentList}
             className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-xs shadow-md hover:bg-blue-700 transition-all active:scale-95"
             title="Xuất file Excel cho danh sách công dân đang hiển thị"
           >
             <Download size={18} /> Xuất Excel
           </button>
        )}

        {/* Nút Nhập dữ liệu tự động từ Excel */}
        {!isReadOnly && onBulkExcelImport && (
           <button 
             onClick={onBulkExcelImport}
             className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl font-black uppercase text-xs shadow-md hover:bg-emerald-800 transition-all active:scale-95"
             title="Nhập dữ liệu công dân tự động từ tệp Excel (Thêm mới & Cập nhật theo CCCD)"
           >
             <FileSpreadsheet size={18} /> Nhập từ Excel
           </button>
        )}

        {/* Nút Chèn ảnh công dân hàng loạt theo số CCCD */}
        {!isReadOnly && onBulkAvatarUpload && (
           <button 
             onClick={onBulkAvatarUpload}
             className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-black uppercase text-xs shadow-md hover:bg-teal-700 transition-all active:scale-95"
             title="Tải lên và tự động gán ảnh công dân theo số CCCD (Cú pháp file: TÊN-SỐCCCD)"
           >
             <Camera size={18} /> Chèn ảnh
           </button>
        )}

        {/* Nút lọc và xử lý trùng lặp - Chỉ hiện cho đơn vị có quyền sửa */}
        {!isReadOnly && onCheckDuplicates && (
           <button 
             onClick={onCheckDuplicates}
             className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-black uppercase text-xs shadow-md hover:bg-amber-600 transition-all active:scale-95"
           >
             <Layers size={18} /> Quét trùng lặp
           </button>
        )}

        {/* Nút đổi tên thôn đồng loạt - Chỉ hiện cho đơn vị có quyền sửa */}
        {!isReadOnly && onBulkVillageRename && (
           <button 
             onClick={onBulkVillageRename}
             className="flex items-center gap-2 px-4 py-2.5 bg-military-100 text-military-800 rounded-xl font-black uppercase text-xs border border-military-200 hover:bg-military-200 transition-all active:scale-95"
           >
             <MapPin size={18} /> Đổi tên Thôn/Ấp
           </button>
        )}

        {/* Nút xóa vĩnh viễn toàn bộ - Chỉ dành cho DS 15 */}
        {activeTabId === 'DELETED_LIST' && !isReadOnly && (
          <button 
            onClick={onDeleteAll} 
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-red-700 transition-all active:scale-95 animate-in slide-in-from-right-2"
          >
            <Trash2 size={18} /> Xóa vĩnh viễn toàn bộ
          </button>
        )}
        
        {!isReadOnly && ['NOT_ALLOWED_REG', 'EXEMPT_REG', 'FIRST_TIME_REG', 'ALL'].includes(activeTabId) && (
          <>
            {activeTabId === 'FIRST_TIME_REG' && onProposeAge17 && (
              <button 
                onClick={onProposeAge17} 
                className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-xl font-black uppercase text-xs shadow-xl hover:bg-cyan-700 transition-all active:scale-95"
              >
                <ArrowRightLeft size={18} /> Đề nghị chuyển công dân 17 tuổi
              </button>
            )}
            <button 
              onClick={onAdd} 
              className="flex items-center gap-2 px-4 py-2.5 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl hover:bg-military-800 transition-all active:scale-95"
            >
              <Plus size={18} /> Thêm công dân
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecruitHeader;
