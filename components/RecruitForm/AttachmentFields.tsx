
import React from 'react';
import { Paperclip, Eye, Trash2, FileText } from 'lucide-react';
import { RecruitAttachment } from '../../types';

const AttachmentFields = ({ attachments, isReadOnly, onUpload, onDelete }: any) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert("Hệ thống chỉ chấp nhận định dạng PDF để đảm bảo tính pháp lý.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Dung lượng file quá lớn (Vượt quá 5MB).");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newAttach: RecruitAttachment = {
          name: file.name,
          url: ev.target?.result as string,
          type: 'application/pdf',
          uploadDate: new Date().toISOString()
        };
        onUpload(newAttach);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-6">
        <Paperclip size={18} className="text-blue-600" /> Hồ sơ số (PDF)
      </h3>
      
      <div className="mt-2">
        {!isReadOnly && (
          <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors group cursor-pointer">
            <input 
              type="file" accept=".pdf" onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500">
               <FileText size={24} />
               <span className="text-[10px] font-black uppercase mt-1">Nhấp để tải lên PDF hồ sơ</span>
            </div>
          </div>
        )}

        <div className="space-y-2 mt-4">
          {attachments && attachments.length > 0 ? (
            attachments.map((f: RecruitAttachment, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 group">
                <div className="flex items-center gap-2 overflow-hidden">
                   <div className="bg-white p-1.5 rounded shadow-sm text-blue-600"><FileText size={16}/></div>
                   <div className="overflow-hidden">
                      <p className="text-xs font-black text-blue-900 truncate max-w-[180px]">{f.name}</p>
                      <p className="text-[9px] text-blue-400 font-bold uppercase">{new Date(f.uploadDate).toLocaleDateString('vi-VN')}</p>
                   </div>
                </div>
                <div className="flex gap-1">
                  <a href={f.url} download={f.name} className="p-1.5 text-blue-600 hover:bg-white rounded transition-colors" title="Xem/Tải về">
                    <Eye size={16}/>
                  </a>
                  {!isReadOnly && (
                    <button type="button" onClick={() => onDelete(i)} className="p-1.5 text-red-500 hover:bg-white rounded transition-colors">
                      <Trash2 size={16}/>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400 italic text-xs border border-gray-50 rounded">Chưa có tệp đính kèm</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentFields;
