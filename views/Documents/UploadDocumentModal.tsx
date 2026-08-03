import React from 'react';
import { UploadCloud, X, AlertCircle, RefreshCw } from 'lucide-react';
import { UploadDocumentModalProps } from './types';

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  selectedFolder,
  docTitle,
  setDocTitle,
  docDesc,
  setDocDesc,
  setSelectedFile,
  isSubmitting,
  uploadProgress,
  onClose,
  onSubmit
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-military-800 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <UploadCloud size={20} />
            <h3 className="font-black uppercase text-xs tracking-widest">
              Tải tài liệu PDF mới
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
              Thư mục đích
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-black text-xs text-military-800 uppercase">
              {selectedFolder === 'MAU_BIEU' ? '1. Mẫu biểu' : '2. Tài liệu tham khảo'}
            </div>
          </div>

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
              rows={2}
              placeholder="Mô tả nội dung hoặc hướng dẫn đặc biệt khi sử dụng mẫu biểu..."
              value={docDesc}
              onChange={(e) => setDocDesc(e.target.value)}
              className="w-full border p-2.5 rounded-xl font-medium text-xs bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">
              Chọn tệp tài liệu (PDF)
            </label>
            <input 
              type="file"
              required
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-[10px] p-2 border border-dashed border-military-200 rounded-xl bg-military-50/30"
            />
            <p className="text-[9px] text-gray-400 mt-1 font-bold">
              * Hệ thống chấp nhận tệp định dạng PDF tối đa 70MB.
            </p>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-2">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={14} />
            <p className="text-[9px] text-amber-800 leading-normal font-medium">
              Tài liệu sau khi gửi thành công sẽ hiển thị ngay tại chuyên mục này trên tất cả các đơn vị thuộc hệ thống.
            </p>
          </div>

          {isSubmitting && uploadProgress > 0 && (
            <div className="space-y-1.5 bg-military-50/50 p-3 rounded-xl border border-military-100">
              <div className="flex justify-between items-center text-[10px] font-black text-military-800 uppercase tracking-wide">
                <span>Đang tải tệp lên...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-military-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

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
                  <RefreshCw size={12} className="animate-spin" /> Đang gửi...
                </>
              ) : (
                'Gửi tài liệu'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
