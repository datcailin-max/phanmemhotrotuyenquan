
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
  const [editingDoc, setEditingDoc] = useState<ResearchDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State quản lý việc tải file đơn lẻ
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

  const getBlobFromBase64 = (base64Data: string) => {
    try {
      if (!base64Data) return null;
      let contentType = 'application/pdf';
      let b64 = base64Data;
      if (base64Data.includes(';base64,')) {
        const parts = base64Data.split(';base64,');
        contentType = parts[0].split(':')[1] || 'application/pdf';
        b64 = parts[1];
      }
      const raw = window.atob(b64);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    } catch (e) {
      console.error("Lỗi giải mã file Base64:", e);
      return null;
    }
  };

  const handleAction = async (doc: ResearchDocument, type: 'VIEW' | 'DOWNLOAD') => {
    const docId = (doc as any)._id || doc.id;
    setLoadingFileId(docId);
    
    try {
        const fileContent = await api.getDocumentContent(docId);
        if (!fileContent) {
            alert("Không thể tải nội dung file từ máy chủ.");
            return;
        }

        const blob = getBlobFromBase64(fileContent);
        if (!blob) {
            alert("Lỗi xử lý file. Dữ liệu có thể bị hỏng.");
            return;
        }

        const blobUrl = URL.createObjectURL(blob);
        
        if (type === 'VIEW') {
            const newWindow = window.open(blobUrl, '_blank');
            if (!newWindow) alert("Vui lòng cho phép hiện Popup để xem file.");
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
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
        alert("Đã xảy ra lỗi khi truy xuất tệp tin.");
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
    const fileInput = target.docFile.files[0];
    
    if (!editingDoc && !fileInput) {
        alert("Vui lòng chọn file PDF.");
        return;
    }

    if (fileInput && fileInput.size > 55 * 1024 * 1024) {
        alert("File quá lớn. Vui lòng chọn file dưới 55MB.");
        return;
    }

    setIsSubmitting(true);
    const processSubmission = async (fileBase64?: string) => {
        const payload = {
            title: target.docTitle.value,
            category: target.docCategory.value,
            description: target.docDesc.value,
            url: fileBase64 || editingDoc?.url,
            uploadDate: editingDoc ? editingDoc.uploadDate : new Date().toLocaleDateString('vi-VN'),
            fileType: 'PDF'
        };

        try {
            if (editingDoc) {
                const docId = (editingDoc as any)._id || editingDoc.id;
                await api.updateDocument(docId, payload);
            } else {
                await api.createDocument(payload);
            }
            setShowModal(false);
            onRefresh();
        } catch (err) {
            alert("Lỗi máy chủ khi lưu tài liệu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (fileInput) {
        const reader = new FileReader();
        reader.onerror = () => { alert("Lỗi đọc file."); setIsSubmitting(false); };
        reader.onload = (ev) => processSubmission(ev.target?.result as string);
        reader.readAsDataURL(fileInput);
    } else {
        processSubmission();
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
            <p className="text-sm text-gray-500 font-medium">Đã tối ưu hóa cho hàng trăm văn bản pháp luật nặng</p>
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingDoc(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-military-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-military-800 transition-all"
          >
            <Plus size={18} /> Thêm tài liệu
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tài liệu..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-military-50"
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
             <p className="text-gray-400 font-bold">Không tìm thấy tài liệu nào.</p>
          </div>
        ) : filteredDocs.map(doc => {
          const docId = (doc as any)._id || doc.id;
          const isThisLoading = loadingFileId === docId;
          const statusColors = doc.category === 'LUAT' ? 'bg-red-50 text-red-700 border-red-100' :
                             doc.category === 'THONG_TU' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                             'bg-gray-50 text-gray-600 border-gray-100';

          return (
            <div key={docId} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
              {isThisLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-2">
                      <Loader2 size={32} className="text-military-600 animate-spin" />
                      <span className="text-[10px] font-black text-military-800 uppercase animate-pulse">Đang truy xuất file...</span>
                  </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors}`}>
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
                {doc.description || 'Không có mô tả.'}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-4">
                  <button 
                    disabled={!!loadingFileId}
                    onClick={() => handleAction(doc, 'VIEW')} 
                    className="flex items-center gap-2 text-military-600 hover:text-military-800 text-[10px] font-black uppercase disabled:opacity-50"
                  >
                    <Eye size={16} /> Xem
                  </button>
                  <button 
                    disabled={!!loadingFileId}
                    onClick={() => handleAction(doc, 'DOWNLOAD')} 
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase disabled:opacity-50"
                  >
                    <Download size={16} /> Tải về
                  </button>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingDoc(doc); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-military-600"><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(docId)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
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
              <h3 className="font-black uppercase text-sm tracking-widest">
                {editingDoc ? 'Cập nhật tài liệu' : 'Tải lên tài liệu'}
              </h3>
              <button onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Tiêu đề / Số hiệu</label>
                <input name="docTitle" required type="text" defaultValue={editingDoc?.title} className="w-full border-gray-200 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-military-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Loại văn bản</label>
                  <select name="docCategory" required defaultValue={editingDoc?.category} className="w-full border-gray-200 border p-3 rounded-xl text-sm font-bold bg-gray-50">
                    <option value="LUAT">LUẬT</option>
                    <option value="NGHI_DINH">NGHỊ ĐỊNH</option>
                    <option value="THONG_TU">THÔNG TƯ</option>
                    <option value="HUONG_DAN">HƯỚNG DẪN</option>
                    <option value="QUYET_DINH">QUYẾT ĐỊNH</option>
                    <option value="KHAC">VĂN BẢN KHÁC</option>
                  </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Chọn PDF (Tối đa 55MB)</label>
                    <input name="docFile" type="file" accept=".pdf" className="w-full text-[10px] p-2 border border-dashed rounded-xl bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Mô tả ngắn</label>
                <textarea name="docDesc" rows={3} defaultValue={editingDoc?.description} className="w-full border-gray-200 border p-3 rounded-xl text-sm font-medium outline-none" />
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-3">
                 <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={16} />
                 <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                   Lưu ý: Hệ thống đã hỗ trợ file lớn, nhưng để tốc độ nghiên cứu nhanh nhất, bạn nên sử dụng file dưới 20MB.
                 </p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" disabled={isSubmitting} onClick={() => setShowModal(false)} className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Hủy</button>
                <button type="submit" disabled={isSubmitting} className={"px-10 py-3 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center gap-2 transition-all " + (isSubmitting ? "opacity-50" : "hover:bg-military-800")}>
                  {isSubmitting ? (<Loader2 size={14} className="animate-spin" />) : ("Xác nhận lưu")}
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
