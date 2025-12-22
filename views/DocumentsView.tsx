
import React, { useState, useMemo } from 'react';
import { 
  FileText, Plus, Trash2, Edit3, Download, Search, 
  Filter, FileCheck, ShieldAlert, RefreshCw, X, UploadCloud, Eye, AlertCircle
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

  const handleView = (doc: ResearchDocument) => {
    const blob = getBlobFromBase64(doc.url);
    if (!blob) {
      alert("Không thể hiển thị tài liệu này. Dữ liệu có thể đã bị lỗi hoặc trình duyệt không đủ bộ nhớ.");
      return;
    }
    const blobUrl = URL.createObjectURL(blob);
    const newWindow = window.open(blobUrl, '_blank');
    if (!newWindow) {
      alert("Vui lòng cho phép trình duyệt hiển thị Popup để xem tài liệu.");
    }
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
  };

  const handleDownload = (doc: ResearchDocument) => {
    const blob = getBlobFromBase64(doc.url);
    if (!blob) {
      alert("Không thể tải tài liệu này.");
      return;
    }
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${doc.title.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Xóa vĩnh viễn tài liệu này khỏi hệ thống?")) {
      const success = await api.deleteDocument(id);
      if (success) {
        onRefresh();
      }
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

    // Nới lỏng giới hạn lên 55MB
    if (fileInput && fileInput.size > 55 * 1024 * 1024) {
        alert(`File quá lớn (${(fileInput.size/1024/1024).toFixed(1)}MB). Vui lòng nén file PDF xuống dưới 50MB để đảm bảo hệ thống ổn định.`);
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
            alert("Lỗi máy chủ khi lưu tài liệu. Có thể do file quá nặng so với khả năng xử lý của RAM máy chủ.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (fileInput) {
        const reader = new FileReader();
        reader.onerror = () => {
            alert("Lỗi khi đọc file từ thiết bị.");
            setIsSubmitting(false);
        };
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
            <h2 className="text-2xl font-black text-military-900 uppercase tracking-tight">Thư viện văn bản pháp luật</h2>
            <p className="text-sm text-gray-500 font-medium">Lưu trữ văn bản chỉ đạo & pháp lý về Tuyển quân</p>
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingDoc(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-military-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-military-800 transition-all active:scale-95"
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
            placeholder="Tìm kiếm tên văn bản..." 
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
             <p className="text-gray-400 font-bold">Không tìm thấy tài liệu phù hợp.</p>
          </div>
        ) : filteredDocs.map(doc => {
          try {
            const docId = (doc as any)._id || doc.id;
            const isHeavy = doc.url ? doc.url.length > 20 * 1024 * 1024 : false;
            return (
              <div key={docId} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
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
                  {doc.description || 'Không có mô tả.'}
                </p>
                {isHeavy && (
                    <div className="mb-4 flex items-center gap-1.5 text-[9px] font-bold text-amber-600 bg-amber-50 p-1.5 rounded border border-amber-100">
                        <AlertCircle size={12}/> File nặng, quá trình mở có thể chậm
                    </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleView(doc)} className="flex items-center gap-2 text-military-600 hover:text-military-800 text-[10px] font-black uppercase transition-all">
                      <Eye size={16} /> Xem
                    </button>
                    <button onClick={() => handleDownload(doc)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase transition-all">
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
          } catch (err) { return null; }
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
                   Lưu ý: Bạn đang tải file rất nặng (>30MB). Hệ thống sẽ cần nhiều thời gian để xử lý và lưu trữ. Vui lòng không đóng trình duyệt.
                 </p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" disabled={isSubmitting} onClick={() => setShowModal(false)} className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Hủy</button>
                <button type="submit" disabled={isSubmitting} className={`px-10 py-3 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center gap-2 transition-all ${isSubmitting ? 'opacity-50' : 'hover:bg-military-800'}`}>
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : 'Xác nhận'}
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
