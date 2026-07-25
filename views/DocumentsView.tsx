import React, { useState, useEffect } from 'react';
import { 
  Folder, FolderOpen, ArrowLeft, FileText, Plus, Trash2, Download, 
  Search, RefreshCw, X, UploadCloud, Eye, BookOpen, FileSpreadsheet, 
  ChevronRight, AlertCircle, Pencil
} from 'lucide-react';
import { ResearchDocument, User } from '../types';
import { api } from '../api';

interface DocumentsViewProps {
  user: User;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ user }) => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDocId, setIsFetchingDocId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<'MAU_BIEU' | 'TAI_LIEU_THAM_KHAO' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Upload modal state
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docDesc, setDocDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ResearchDocument | null>(null);

  const isAdmin = user.role === 'ADMIN';

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDocuments();
      setDocuments(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Helper function to map categories safely (including legacy ones)
  const getDocFolderCategory = (doc: ResearchDocument): 'MAU_BIEU' | 'TAI_LIEU_THAM_KHAO' => {
    if (doc.category === 'MAU_DANH_SACH' || doc.category === 'MAU_BAO_CAO' || doc.category === 'MAU_BIEU') {
      return 'MAU_BIEU';
    }
    return 'TAI_LIEU_THAM_KHAO'; // Default legacy documents to "Tài liệu tham khảo"
  };

  const getBlobFromBase64 = (base64Data: string) => {
    try {
      if (!base64Data.includes(';base64,')) {
        const raw = window.atob(base64Data);
        const uInt8Array = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
        return new Blob([uInt8Array], { type: 'application/pdf' });
      }

      const parts = base64Data.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    } catch (e) {
      console.error("Lỗi giải mã file:", e);
      return null;
    }
  };

  const handleView = async (doc: ResearchDocument) => {
    const docId = (doc as any)._id || doc.id;
    let fullDoc = doc;
    
    if (!doc.url) {
      setIsFetchingDocId(docId);
      try {
        const fetched = await (api as any).getDocumentById(docId);
        if (fetched && fetched.url) {
          fullDoc = fetched;
        } else {
          alert("Không thể lấy nội dung tài liệu. Vui lòng thử lại.");
          setIsFetchingDocId(null);
          return;
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi khi tải tài liệu từ máy chủ.");
        setIsFetchingDocId(null);
        return;
      } finally {
        setIsFetchingDocId(null);
      }
    }

    if (fullDoc.url.startsWith('http://') || fullDoc.url.startsWith('https://')) {
      const newWindow = window.open(fullDoc.url, '_blank');
      if (!newWindow) {
        alert("Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cho phép hiển thị popup để xem tài liệu.");
      }
      return;
    }

    const blob = getBlobFromBase64(fullDoc.url);
    if (!blob) {
      alert("Không thể hiển thị tài liệu này. Dữ liệu có thể đã bị hỏng hoặc dung lượng quá lớn.");
      return;
    }
    const blobUrl = URL.createObjectURL(blob);
    const newWindow = window.open(blobUrl, '_blank');
    if (!newWindow) {
      alert("Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cho phép hiển thị popup để xem tài liệu.");
    }
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  const handleDownload = async (doc: ResearchDocument) => {
    const docId = (doc as any)._id || doc.id;
    let fullDoc = doc;

    if (!doc.url) {
      setIsFetchingDocId(docId);
      try {
        const fetched = await (api as any).getDocumentById(docId);
        if (fetched && fetched.url) {
          fullDoc = fetched;
        } else {
          alert("Không thể lấy nội dung tài liệu để tải xuống.");
          setIsFetchingDocId(null);
          return;
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi khi tải tài liệu từ máy chủ.");
        setIsFetchingDocId(null);
        return;
      } finally {
        setIsFetchingDocId(null);
      }
    }

    if (fullDoc.url.startsWith('http://') || fullDoc.url.startsWith('https://')) {
      window.open(fullDoc.url, '_blank');
      return;
    }

    const blob = getBlobFromBase64(fullDoc.url);
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

  const handleDelete = async (doc: ResearchDocument) => {
    const docId = (doc as any)._id || doc.id;
    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài liệu "${doc.title}"?`)) {
      const success = await api.deleteDocument(docId);
      if (success) {
        alert("Đã xóa tài liệu thành công.");
        fetchDocs();
      } else {
        alert("Lỗi: Không thể xóa tài liệu. Vui lòng thử lại.");
      }
    }
  };

  const handleEditClick = (doc: ResearchDocument) => {
    setEditingDoc(doc);
    setDocTitle(doc.title);
    setDocDesc(doc.description || '');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    const docId = (editingDoc as any)._id || editingDoc.id;

    setIsSubmitting(true);
    try {
      const payload = {
        title: docTitle,
        description: docDesc
      };
      
      const success = await api.updateDocument(docId, payload);
      if (success) {
        alert("Cập nhật thông tin tài liệu thành công.");
        setShowEditModal(false);
        setEditingDoc(null);
        setDocTitle('');
        setDocDesc('');
        fetchDocs();
      } else {
        alert("Lỗi: Không thể cập nhật thông tin tài liệu.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi cập nhật tài liệu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolder) return;
    if (!selectedFile) {
      alert("Vui lòng chọn file PDF để tải lên.");
      return;
    }

    if (selectedFile.size > 70 * 1024 * 1024) {
      alert(`File quá lớn (${(selectedFile.size/1024/1024).toFixed(1)}MB). Giới hạn tối đa là 70MB.`);
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(1); // Bắt đầu hiển thị thanh % từ 1%

    let uploadedUrl = '';
    let isCloudinarySuccess = false;

    try {
      uploadedUrl = await api.uploadFile(selectedFile, 'documents', (percent) => {
        setUploadProgress(percent);
      });
      isCloudinarySuccess = true;
    } catch (err: any) {
      console.error(err);
      alert(`Tải file lên Cloudinary thất bại: ${err.message || err}`);
      setIsSubmitting(false);
      setUploadProgress(0);
      return;
    }

    const payload = {
      title: docTitle,
      category: selectedFolder,
      description: docDesc,
      url: uploadedUrl,
      uploadDate: new Date().toLocaleDateString('vi-VN'),
      fileType: 'PDF'
    };

    try {
      const res = await api.createDocument(payload);
      if (res) {
        alert("Đã tải lên tài liệu thành công.");
        setShowModal(false);
        setDocTitle('');
        setDocDesc('');
        setSelectedFile(null);
        setUploadProgress(0);
        fetchDocs();
      } else {
        alert("Tải tệp lên thành công nhưng không thể ghi lại đường dẫn liên kết vào cơ sở dữ liệu MongoDB.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi nghiêm trọng khi kết nối máy chủ.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const docsInSelectedFolder = Array.isArray(documents) ? documents.filter(doc => doc && getDocFolderCategory(doc) === selectedFolder) : [];
  const filteredDocs = docsInSelectedFolder.filter(doc => 
    doc && (
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const countByFolder = (folderKey: 'MAU_BIEU' | 'TAI_LIEU_THAM_KHAO') => {
    if (!Array.isArray(documents)) return 0;
    return documents.filter(doc => doc && getDocFolderCategory(doc) === folderKey).length;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-military-50 p-3 rounded-xl text-military-700 border border-military-100">
            <BookOpen size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-military-900 uppercase tracking-tight">Tài liệu liên quan</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
              Hệ thống quản lý và chia sẻ các biểu mẫu, hướng dẫn công tác tuyển quân trực tuyến
            </p>
          </div>
        </div>
        <button 
          onClick={fetchDocs}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-600 hover:text-military-800 hover:bg-gray-100 border border-gray-200 rounded-xl font-bold text-xs transition-all shrink-0 active:scale-95"
          title="Tải lại thư mục"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Cập nhật
        </button>
      </div>

      {isLoading && documents.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-military-600" size={36} />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải tài liệu từ máy chủ...</p>
        </div>
      ) : selectedFolder === null ? (
        // --- 1. DIRECTORY/FOLDERS VIEW ---
        <div className="space-y-6">
          <div className="bg-military-50/50 p-4 rounded-xl border border-military-100 flex items-center gap-2.5">
            <AlertCircle className="text-military-700 shrink-0" size={16} />
            <p className="text-[11px] text-military-800 font-bold uppercase tracking-wide">
              Mẹo: Nhấp vào từng thư mục bên dưới để truy cập danh sách các tệp PDF tương ứng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Folder 1: Mẫu biểu */}
            <div 
              onClick={() => setSelectedFolder('MAU_BIEU')}
              className="bg-white rounded-3xl border-2 border-gray-200 hover:border-emerald-500 hover:shadow-xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between group h-64 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 opacity-40 group-hover:scale-110 transition-transform duration-300" />
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center shadow-inner">
                  <FolderOpen size={30} className="group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full">
                    Thư mục 1
                  </span>
                  <h3 className="text-base font-black text-military-900 uppercase tracking-tight mt-2.5 group-hover:text-emerald-700 transition-colors">
                    Mẫu biểu
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    Các mẫu bảng biểu, danh sách công dân đăng ký, tạm hoãn, miễn NVQS và báo cáo tổng hợp kết quả
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4 relative z-10">
                <span className="text-xs font-black text-gray-500">
                  {countByFolder('MAU_BIEU')} tài liệu
                </span>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                  Mở mục <ChevronRight size={14} />
                </span>
              </div>
            </div>

            {/* Folder 2: Tài liệu tham khảo */}
            <div 
              onClick={() => setSelectedFolder('TAI_LIEU_THAM_KHAO')}
              className="bg-white rounded-3xl border-2 border-gray-200 hover:border-amber-500 hover:shadow-xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between group h-64 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-10 -mt-10 opacity-40 group-hover:scale-110 transition-transform duration-300" />
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 flex items-center justify-center shadow-inner">
                  <FolderOpen size={30} className="group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full">
                    Thư mục 2
                  </span>
                  <h3 className="text-base font-black text-military-900 uppercase tracking-tight mt-2.5 group-hover:text-amber-700 transition-colors">
                    Tài liệu tham khảo
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    Văn bản pháp luật, Luật nghĩa vụ quân sự, hướng dẫn chuyên môn tuyển chọn
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4 relative z-10">
                <span className="text-xs font-black text-gray-500">
                  {countByFolder('TAI_LIEU_THAM_KHAO')} tài liệu
                </span>
                <span className="text-xs font-black text-amber-600 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                  Mở mục <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // --- 2. INSIDE SELECTED FOLDER VIEW ---
        <div className="space-y-6">
          {/* Path Header / Breadcrumbs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setSelectedFolder(null); setSearchTerm(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 hover:text-military-900 border border-gray-200 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 shrink-0"
              >
                <ArrowLeft size={14} /> Quay lại
              </button>
              <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">
                <span>Thư viện</span>
                <ChevronRight size={12} className="mx-1" />
                <span className="text-military-900 font-black">
                  {selectedFolder === 'MAU_BIEU' ? 'Mẫu biểu' : 'Tài liệu tham khảo'}
                </span>
              </div>
            </div>

            {isAdmin && (
              <button 
                onClick={() => {
                  setDocTitle('');
                  setDocDesc('');
                  setSelectedFile(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-1.5 bg-military-700 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-wider shadow-lg hover:bg-military-800 transition-all active:scale-95 shrink-0"
              >
                <Plus size={16} /> Tải tài liệu lên mục này
              </button>
            )}
          </div>

          {/* Local Search in Folder */}
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài liệu PDF trong thư mục này..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-military-50 font-bold text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* PDF Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                <FileText size={48} className="text-gray-200 mb-3" />
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                  Chưa có tài liệu nào trong thư mục này
                </h4>
                <p className="text-[10px] text-gray-400 font-medium mt-1">
                  {isAdmin ? 'Vui lòng nhấp nút tải lên để bổ sung các biểu mẫu cần thiết.' : 'Hệ thống chưa ghi nhận tài liệu tham chiếu từ Quản trị viên.'}
                </p>
              </div>
            ) : (
              filteredDocs.map(doc => {
                return (
                  <div key={(doc as any)._id || doc.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative">
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
                        {isFetchingDocId === ((doc as any)._id || doc.id) ? (
                          <span className="flex items-center gap-1 text-gray-400 text-[10px] font-black uppercase tracking-wider">
                            <RefreshCw size={12} className="animate-spin" /> Đang tải tệp...
                          </span>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleView(doc)}
                              className="flex items-center gap-1 text-military-700 hover:text-military-900 text-[10px] font-black uppercase tracking-wider transition-all"
                              title="Xem trực tuyến"
                            >
                              <Eye size={14} /> Xem
                            </button>
                            <button 
                              onClick={() => handleDownload(doc)}
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
                            onClick={() => handleEditClick(doc)}
                            className="p-1.5 text-gray-400 hover:text-military-700 hover:bg-military-50 rounded-lg transition-all"
                            title="Chỉnh sửa tài liệu"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(doc)}
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
              })
            )}
          </div>
        </div>
      )}

      {/* Upload Modal (Triggered inside a selected folder) */}
      {showModal && selectedFolder && (
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
                onClick={() => setShowModal(false)}
                className="hover:bg-white/10 p-1 rounded-full text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
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
                  onClick={() => setShowModal(false)} 
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
      )}

      {/* Edit Modal */}
      {showEditModal && editingDoc && (
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
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDoc(null);
                }}
                className="hover:bg-white/10 p-1 rounded-full text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
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
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDoc(null);
                  }} 
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
      )}
    </div>
  );
};

export default DocumentsView;
