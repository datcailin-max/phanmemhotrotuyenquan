import React from 'react';
import { Eye, Download, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { DocumentCardProps } from './types';

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  isAdmin,
  isFetchingDocId,
  onView,
  onDownload,
  onEdit,
  onDelete
}) => {
  const docId = (doc as any)._id || doc.id;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[9px] font-black uppercase bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-md">
          PDF
        </span>
        <span className="text-[9px] text-gray-400 font-bold">
          {doc.uploadDate}
        </span>
      </div>

      <h4 className="text-xs font-black text-military-900 leading-snug uppercase tracking-tight group-hover:text-military-700 transition-colors line-clamp-2 mb-2 flex-1">
        {doc.title}
      </h4>

      {doc.description && (
        <p className="text-[10px] text-gray-500 font-medium italic mb-5 line-clamp-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
          {doc.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3.5 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-3">
          {isFetchingDocId === docId ? (
            <span className="flex items-center gap-1 text-gray-400 text-[10px] font-black uppercase tracking-wider">
              <RefreshCw size={12} className="animate-spin" /> Đang tải tệp...
            </span>
          ) : (
            <>
              <button 
                onClick={() => onView(doc)}
                className="flex items-center gap-1 text-military-700 hover:text-military-900 text-[10px] font-black uppercase tracking-wider transition-all"
                title="Xem trực tuyến"
              >
                <Eye size={14} /> Xem
              </button>
              <button 
                onClick={() => onDownload(doc)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-wider transition-all"
                title="Tải về máy"
              >
                <Download size={14} /> Tải xuống
              </button>
            </>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onEdit(doc)}
              className="p-1.5 text-gray-400 hover:text-military-700 hover:bg-military-50 rounded-lg transition-all"
              title="Chỉnh sửa tài liệu"
            >
              <Pencil size={14} />
            </button>
            <button 
              onClick={() => onDelete(doc)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Xóa tài liệu"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
