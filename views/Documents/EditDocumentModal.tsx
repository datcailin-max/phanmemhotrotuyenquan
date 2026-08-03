import React from 'react';
import { Pencil, X, RefreshCw } from 'lucide-react';
import { EditDocumentModalProps } from './types';

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  editingDoc,
  docTitle,
  setDocTitle,
  docDesc,
  setDocDesc,
  isSubmitting,
  onClose,
  onSubmit
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-military-800 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Pencil size={18} />
            <h3 className="font-black uppercase text-xs tracking-widest">
              Chỉnh sửa thông tin tài liệu
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-white/10 p-1 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">
              Tiêu đề tài liệu / số hiệu
            </label>
            <input 
              type="text"
              required
              placeholder="VD: Mẫu 02 - Danh sách công dân đủ tuổi"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full border p-2.5 rounded-xl font-bold text-xs bg-white outline-none focus:ring-2 focus:ring-military-50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">
              Mô tả / Trích yếu nội dung
            </label>
            <textarea 
              rows={4}
              placeholder="Mô tả nội dung hoặc hướng dẫn đặc biệt khi sử dụng mẫu biểu..."
              value={docDesc}
              onChange={(e) => setDocDesc(e.target.value)}
              className="w-full border p-2.5 rounded-xl font-medium text-xs bg-white outline-none focus:ring-2 focus:ring-military-50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button 
              type="button" 
              disabled={isSubmitting} 
              onClick={onClose} 
              className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-military-700 hover:bg-military-800 text-white rounded-xl font-black uppercase text-[10px] shadow-md flex items-center gap-1.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={12} className="animate-spin" /> Đang cập nhật...
                </>
              ) : (
                'Cập nhật'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
