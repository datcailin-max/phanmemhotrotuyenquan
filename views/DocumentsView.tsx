
import React, { useState, useMemo } from 'react';
import { 
  FileText, Plus, Trash2, Edit3, Download, Search, 
  Filter, FileCheck, ShieldAlert, RefreshCw, X, Eye, AlertCircle, Loader2
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  const isAdmin = user.role === 'ADMIN';

  const filteredDocs = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    return documents.filter(doc => {
      if (!doc || !doc.title) return false;
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory ? doc.category === filterCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchTerm, filterCategory]);

  const handleAction = async (doc: ResearchDocument, type: 'VIEW' | 'DOWNLOAD') => {
    const docId = (doc as any)._id || doc.id;
    setLoadingFileId(docId);
    
    try {
        const blob = await api.downloadDocumentBinary(docId);
        if (!blob) {
            alert("Không thể tải nội dung file từ máy chủ.");
            return;
        }

        const blobUrl = URL.createObjectURL(blob);
        
        if (type === 'VIEW') {
            const newWindow = window.open(blobUrl, '_blank');
            if (!newWindow) alert("Vui lòng cho phép hiện Popup để xem file.");
            setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
        } else {
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${doc.title.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        }
    } catch (err) {
        alert("Đã xảy ra lỗi khi xử lý tệp tin.");
    } finally {
        setLoadingFileId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Xóa vĩnh viễn tài liệu này khỏi hệ thống?")) {
      const success = await api.deleteDocument(id);
      if (success) onRefresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const file = target.docFile.files[0];
    
    if (!file) {
        alert("Vui lòng chọn file PDF.");
        return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', target.docTitle.value);
    formData.append('category', target.docCategory.value);
    formData.append('description', target.docDesc.value);
    formData.append('uploadDate', new Date().toLocaleDateString('vi-VN'));

    try {
        const res = await api.createDocument(formData);
        if (res) {
            setShowModal(false);
            onRefresh();
            alert("Tải lên tài liệu thành công!");
        } else {
            alert("Lỗi máy chủ khi lưu tài liệu. Kiểm tra kết nối mạng.");
        }
    } catch (err) {
        alert("Lỗi hệ thống.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-military-100 p-3 rounded-xl text-military-700">
            <FileText size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-military-900 uppercase tracking-tight">Thư viện tài liệu nghiên cứu</h2>
            <p className="text-sm text-gray-500 font-medium">Hệ thống lưu trữ nhị phân trực tiếp (High Performance)</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={onRefresh} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"><RefreshCw size={20}/></button>
            {isAdmin && (
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-military-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-military-800 transition-all"
              >
                <Plus size={18} /> Thêm tài liệu
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input 
            type="text" placeholder="Tìm kiếm tài liệu..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-military-50"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-3 text-gray-400" size={20} />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm outline-none appearance-none font-bold text-gray-700"
            value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Tất cả loại văn bản</option>
            <option value="LUAT">Luật NVQS</option>
            <option value="NGHI_DINH">Nghị định</option>
            <option value="THONG_TU">Thông tư</option>
            <option value="HUONG_DAN">Hướng dẫn</option>
            <option value="QUYET_DINH">Quyết định</option>
            <option value="KHAC">Văn bản khác</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
             <FileText size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Danh sách tài liệu đang trống hoặc chưa tải được</p>
          </div>
        ) : filteredDocs.map(doc => {
          const docId = (doc as any)._id || doc.id;
          const isThisLoading = loadingFileId === docId;
          return (
            <div key={docId} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
              {isThisLoading && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-10 flex flex-col items-center justify-center space-y-3">
                      <Loader2 size={32} className="text-military-600 animate-spin" />
                      <span className="text-[10px] font-black text-military-800 uppercase animate-pulse">Đang tải file...</span>
                  </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-military-50 text-military-700 border border-military-100">
                  {doc.category || 'KHÁC'}
                </div>
                <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                  <FileCheck size={12}/> {doc.uploadDate}
                </div>
              </div>
              <h4 className="text-sm font-black text-military-900 leading-tight mb-2 line-clamp-2 uppercase group-hover:text-military-600 transition-colors">
                {doc.title}
              </h4>
              <p className="text-xs text-gray-500 font-medium mb-6 line-clamp-3 italic flex-1">
                {doc.description || 'Văn bản pháp luật phục vụ công tác tuyển chọn và gọi công dân nhập ngũ.'}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-4">
                  <button onClick={() => handleAction(doc, 'VIEW')} className="flex items-center gap-2 text-military-600 hover:text-military-800 text-[10px] font-black uppercase">
                    <Eye size={16} /> Xem
                  </button>
                  <button onClick={() => handleAction(doc, 'DOWNLOAD')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase">
                    <Download size={16} /> Tải về
                  </button>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(docId)} className="p-1.5 text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-military-800 p-6 flex justify-between items-center text-white">
              <h3 className="font-black uppercase text-sm tracking-widest">Tải lên văn bản nghiên cứu</h3>
              <button onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Tiêu đề tài liệu</label>
                <input name="docTitle" required type="text" placeholder="VD: Luật Nghĩa vụ quân sự năm 2015" className="w-full border-gray-200 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-military-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Loại văn bản</label>
                  <select name="docCategory" className="w-full border-gray-200 border p-3 rounded-xl text-sm font-bold bg-gray-50">
                    <option value="LUAT">LUẬT</option>
                    <option value="NGHI_DINH">NGHỊ ĐỊNH</option>
                    <option value="THONG_TU">THÔNG TƯ</option>
                    <option value="HUONG_DAN">HƯỚNG DẪN</option>
                    <option value="KHAC">VĂN BẢN KHÁC</option>
                  </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Chọn file PDF (Tối đa 100MB)</label>
                    <input name="docFile" type="file" accept=".pdf" className="w-full text-[10px] p-2 border border-dashed rounded-xl bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Ghi chú / Mô tả</label>
                <textarea name="docDesc" rows={3} className="w-full border-gray-200 border p-3 rounded-xl text-sm font-medium" placeholder="Nhập tóm tắt nội dung văn bản..." />
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                 <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={16} />
                 <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                   Lưu ý: Hệ thống đã nâng cấp lên chuẩn Streaming. Bạn có thể tải file lên tới 100MB mà không lo bị treo.
                 </p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" disabled={isSubmitting} onClick={() => setShowModal(false)} className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-10 py-3 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center gap-2">
                  {isSubmitting ? (<Loader2 size={14} className="animate-spin" />) : ("Xác nhận tải lên")}
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
