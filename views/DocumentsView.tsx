
import React, { useState } from 'react';
import { 
  FileText, Plus, Trash2, Edit3, Download, Search, 
  Filter, FileCheck, ShieldAlert, RefreshCw, X, UploadCloud
} from 'lucide-react';
import { ResearchDocument, User } from '../types';
import { api } from '../api';

interface DocumentsViewProps {
  documents: ResearchDocument[];
  user: User;
  onRefresh: () => void;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ documents, user, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ResearchDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user.role === 'ADMIN';

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? doc.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tài liệu này?")) {
      const success = await api.deleteDocument(id);
      if (success) {
        alert("Đã xóa tài liệu.");
        onRefresh();
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setShowModal(true);
  };

  const handleOpenEdit = (doc: ResearchDocument) => {
    setEditingDoc(doc);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const fileInput = target.docFile.files[0];
    
    // Nếu là thêm mới thì bắt buộc file, nếu sửa có thể giữ file cũ
    if (!editingDoc && !fileInput) {
        alert("Vui lòng chọn file PDF để tải lên.");
        return;
    }

    if (fileInput && fileInput.size > 75 * 1024 * 1024) {
        alert(`File quá lớn (${(fileInput.size/1024/1024).toFixed(1)}MB). Giới hạn tối đa là 70MB.`);
        return;
    }

    setIsSubmitting(true);

    const processData = (fileBase64?: string) => {
        const payload = {
            title: target.docTitle.value,
            category: target.docCategory.value,
            description: target.docDesc.value,
            url: fileBase64 || editingDoc?.url,
            uploadDate: new Date().toLocaleDateString('vi-VN'),
            fileType: 'PDF'
        };

        if (editingDoc) {
            // Logic cập nhật (nếu cần endpoint updateDocument riêng, 
            // hiện tại api.ts chỉ có create/delete nên ta xử lý create mới)
            // Để đơn giản ta xóa cũ tạo mới hoặc bạn có thể bổ sung updateDocument vào api.ts
            api.createDocument(payload).then(() => {
                setIsSubmitting(false);
                setShowModal(false);
                onRefresh();
                alert("Đã lưu thay đổi tài liệu.");
            });
        } else {
            api.createDocument(payload).then(() => {
                setIsSubmitting(false);
                setShowModal(false);
                onRefresh();
                alert("Đã thêm tài liệu mới.");
            });
        }
    };

    if (fileInput) {
        const reader = new FileReader();
        reader.onload = (ev) => processData(ev.target?.result as string);
        reader.readAsDataURL(fileInput);
    } else {
        processData();
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-military-100 p-3 rounded-xl text-military-700">
            <FileText size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-military-900 uppercase tracking-tight">Thư viện văn bản pháp luật</h2>
            <p className="text-sm text-gray-500 font-medium">Hệ thống lưu trữ Luật, Nghị định, Thông tư về Nghĩa vụ quân sự</p>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-military-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-military-800 transition-all active:scale-95"
          >
            <Plus size={18} /> Thêm tài liệu mới
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tên văn bản, trích yếu..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-military-50 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-3 text-gray-400" size={20} />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm outline-none appearance-none font-bold text-gray-700"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Tất cả loại văn bản</option>
            <option value="LUAT">Luật NVQS</option>
            <option value="NGHI_DINH">Nghi định</option>
            <option value="THONG_TU">Thông tư</option>
            <option value="HUONG_DAN">Hướng dẫn</option>
            <option value="QUYET_DINH">Quyết định</option>
            <option value="KHAC">Văn bản khác</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
             <FileText size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-400 font-bold">Không tìm thấy tài liệu nào phù hợp.</p>
          </div>
        ) : filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                doc.category === 'LUAT' ? 'bg-red-50 text-red-700 border border-red-100' :
                doc.category === 'THONG_TU' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                'bg-gray-50 text-gray-600 border border-gray-100'
              }`}>
                {doc.category}
              </div>
              <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                <FileCheck size={12}/> {doc.uploadDate}
              </div>
            </div>

            <h4 className="text-sm font-black text-military-900 leading-tight mb-2 line-clamp-2 uppercase group-hover:text-military-600 transition-colors">
              {doc.title}
            </h4>
            
            <p className="text-xs text-gray-500 font-medium mb-6 line-clamp-3 italic flex-1">
              {doc.description || 'Chưa có nội dung tóm tắt cho văn bản này.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
              <a 
                href={doc.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs font-black uppercase tracking-wider"
              >
                <Download size={16} /> Tải về / Xem
              </a>
              
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenEdit(doc)}
                    className="p-2 text-gray-400 hover:text-military-600 hover:bg-military-50 rounded-lg transition-all"
                    title="Sửa"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Management Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-military-800 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg"><UploadCloud size={20}/></div>
                <h3 className="font-black uppercase text-sm tracking-widest">
                  {editingDoc ? 'Cập nhật tài liệu' : 'Tải lên tài liệu mới'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 tracking-widest">Tiêu đề văn bản / Số hiệu</label>
                <input 
                  name="docTitle" 
                  required 
                  type="text" 
                  defaultValue={editingDoc?.title}
                  placeholder="VD: Luật Nghĩa vụ quân sự năm 2015" 
                  className="w-full border-gray-200 border p-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-military-50 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 tracking-widest">Loại văn bản</label>
                  <select 
                    name="docCategory" 
                    required 
                    defaultValue={editingDoc?.category}
                    className="w-full border-gray-200 border p-3 rounded-xl text-sm font-bold bg-gray-50 outline-none"
                  >
                    <option value="LUAT">LUẬT</option>
                    <option value="NGHI_DINH">NGHỊ ĐỊNH</option>
                    <option value="THONG_TU">THÔNG TƯ</option>
                    <option value="HUONG_DAN">HƯỚNG DẪN</option>
                    <option value="QUYET_DINH">QUYẾT ĐỊNH</option>
                    <option value="KHAC">VĂN BẢN KHÁC</option>
                  </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 tracking-widest">Chọn tệp PDF</label>
                    <input 
                        name="docFile" 
                        type="file" 
                        accept=".pdf" 
                        className="w-full text-[10px] p-2 border border-dashed border-military-200 rounded-xl bg-military-50/30" 
                    />
                    <p className="text-[9px] text-military-600 mt-1 font-bold">* Chấp nhận PDF tối đa 70MB.</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 tracking-widest">Trích yếu nội dung (Ghi chú)</label>
                <textarea 
                  name="docDesc" 
                  rows={3}
                  defaultValue={editingDoc?.description}
                  placeholder="Nhập mô tả ngắn gọn về nội dung văn bản để các đơn vị dễ dàng tìm kiếm..."
                  className="w-full border-gray-200 border p-3 rounded-xl text-sm font-medium outline-none"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-3">
                 <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={16} />
                 <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                   Văn bản sau khi tải lên sẽ hiển thị công khai cho toàn bộ đơn vị cấp Xã và Tỉnh trong hệ thống. Vui lòng kiểm tra tính chính xác của file trước khi gửi.
                 </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  disabled={isSubmitting} 
                  onClick={() => setShowModal(false)} 
                  className="px-6 py-3 text-xs font-black text-gray-500 uppercase"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`px-10 py-3 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center gap-2 transition-all ${isSubmitting ? 'opacity-50' : 'hover:bg-military-800'}`}
                >
                  {isSubmitting ? <><RefreshCw size={14} className="animate-spin" /> Đang xử lý...</> : 'Xác nhận tải lên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsView;
