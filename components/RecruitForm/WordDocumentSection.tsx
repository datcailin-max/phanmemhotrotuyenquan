import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, RefreshCw, CheckCircle2, ShieldCheck, AlertCircle, Edit3, Trash2, Settings } from 'lucide-react';
import { Recruit, RecruitWordDocument, MasterWordTemplate, User } from '../../types';
import { api } from '../../api';
import { generateCurriculumVitaeWordDoc } from '../../services/WordExportService';

interface WordDocumentSectionProps {
  wordDocument?: RecruitWordDocument;
  user: User;
  recruitName: string;
  recruitData?: Recruit;
  isReadOnly?: boolean;
  onUpdateWordDoc: (doc: RecruitWordDocument | undefined) => void;
}

export const WordDocumentSection: React.FC<WordDocumentSectionProps> = ({
  wordDocument,
  user,
  recruitName,
  recruitData,
  isReadOnly = false,
  onUpdateWordDoc
}) => {
  const isAdmin = user.role === 'ADMIN' || user.role === 'PROVINCE_ADMIN' || user.username === 'ADMIN';
  const [masterTemplate, setMasterTemplate] = useState<MasterWordTemplate | null>(null);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAdminUpload, setShowAdminUpload] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Default sample base64 docx if no template uploaded yet
  const DEFAULT_SAMPLE_NAME = 'Mau_Ly_Lich_Nghia_Vu_Quan_Su_Chuan.docx';
  // Standard minimal docx base64 header structure so it triggers real file download if clicked
  const DEFAULT_SAMPLE_URL = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQAAAAIAAAAIQAAAAAA';

  const fetchMasterTemplate = async () => {
    setIsLoadingMaster(true);
    try {
      const tpl = await api.getMasterWordTemplate();
      if (tpl) {
        setMasterTemplate(tpl);
      }
    } catch (e) {
      console.error("Lỗi khi lấy mẫu file Word từ Admin:", e);
    } finally {
      setIsLoadingMaster(false);
    }
  };

  useEffect(() => {
    fetchMasterTemplate();
  }, []);

  // Active Word document details (custom recruit file or master template fallback)
  const activeDocName = wordDocument?.name || masterTemplate?.name || DEFAULT_SAMPLE_NAME;
  const activeDocUrl = wordDocument?.url || masterTemplate?.url || DEFAULT_SAMPLE_URL;
  const activeDocDate = wordDocument?.uploadDate || masterTemplate?.uploadDate || '01/01/2026';
  const activeDocUpdatedBy = wordDocument?.updatedBy || masterTemplate?.updatedBy || 'Ban CHQS Tỉnh';
  const isCustom = !!wordDocument?.isCustom;

  // Handle Download file with populated citizen data
  const handleDownload = async () => {
    if (recruitData) {
      try {
        const tplUrl = activeDocUrl !== DEFAULT_SAMPLE_URL ? activeDocUrl : undefined;
        await generateCurriculumVitaeWordDoc(recruitData, recruitData.curriculumVitae, tplUrl);
        return;
      } catch (err: any) {
        console.error("Lỗi khi bơm dữ liệu công dân vào file Word:", err);
        alert(err.message || "Lỗi khi trộn dữ liệu công dân vào tệp mẫu Word!");
        return;
      }
    }

    if (!activeDocUrl) {
      alert("Chưa tìm thấy liên kết tệp Word.");
      return;
    }

    const cleanName = recruitName
      ? `Ho_So_NVQS_${recruitName.replace(/\s+/g, '_')}.docx`
      : activeDocName;

    const link = document.createElement('a');
    link.href = activeDocUrl;
    link.download = cleanName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Officer Replacing File for this specific citizen
  const handleReplaceOfficerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['doc', 'docx', 'docm'].includes(fileExt || '')) {
      alert("Vui lòng chọn tệp Word có định dạng .docx (hoặc .docm)");
      return;
    }

    if (fileExt === 'doc') {
      alert("⚠️ LƯU Ý QUAN TRỌNG:\n\nTệp định dạng .doc (Word 97-2003) không hỗ trợ tính năng tự động trộn dữ liệu.\n\nVui lòng mở tệp trên trong Microsoft Word -> Vào File -> Chọn Save As (Lưu thành) -> Chọn định dạng 'Word Document (*.docx)' -> Rồi tải tệp .docx mới lên hệ thống!");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert("Kích thước tệp quá lớn (>15MB). Vui lòng nén hoặc chọn tệp nhỏ hơn.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const uploadedUrl = await api.uploadFile(file, 'word_documents', (percent: number) => {
        setUploadProgress(percent);
      });

      const updatedDoc: RecruitWordDocument = {
        name: file.name,
        url: uploadedUrl,
        uploadDate: new Date().toLocaleDateString('vi-VN'),
        updatedBy: user.fullName || user.username || 'Cán bộ đơn vị',
        isCustom: true
      };

      onUpdateWordDoc(updatedDoc);
      alert(`✅ Đã tải lên và thay thế bằng bản cập nhật Word mới "${file.name}" cho công dân thành công!`);
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi khi tải tệp Word lên: ${err.message || err}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  // Handle Admin Uploading System-Wide Master Word Template
  const handleAdminUploadMaster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['doc', 'docx', 'docm'].includes(fileExt || '')) {
      alert("Vui lòng chọn tệp Word có định dạng .docx");
      return;
    }

    if (fileExt === 'doc') {
      alert("⚠️ LƯU Ý BẮT BUỘC:\n\nMẫu file Word định dạng cũ .doc (Word 97-2003) không hỗ trợ tính năng trộn dữ liệu.\n\nVui lòng mở tệp mẫu đó trong Microsoft Word -> Chọn Save As (Lưu thành) -> Chọn định dạng 'Word Document (*.docx)' -> Sau đó tải file .docx đó lên hệ thống!");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const uploadedUrl = await api.uploadFile(file, 'master_templates', (percent: number) => {
        setUploadProgress(percent);
      });

      const payload: Partial<MasterWordTemplate> = {
        name: file.name,
        url: uploadedUrl,
        uploadDate: new Date().toLocaleDateString('vi-VN'),
        updatedBy: user.fullName || user.username || 'ADMIN',
        fileType: 'WORD'
      };

      const saved = await api.saveMasterWordTemplate(payload);
      if (saved) {
        setMasterTemplate(saved);
        alert(`✅ Quản trị viên đã cập nhật Mẫu file Word hệ thống "${file.name}" thành công! Mẫu này sẽ tự động xuất hiện ở trên đầu mọi hồ sơ công dân.`);
        setShowAdminUpload(false);
      } else {
        alert("Không thể lưu mẫu file Word hệ thống.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi khi tải file Word mẫu lên: ${err.message || err}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  // Handle Revert back to Admin Master Template
  const handleRevertToMaster = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục về Mẫu Word mặc định từ Admin và xóa bản chỉnh sửa riêng của công dân này không?")) {
      onUpdateWordDoc(undefined);
      alert("Đã khôi phục về Mẫu Word chuẩn của Admin.");
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 mb-8 shadow-xl border border-blue-700/50 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Decorative Word Watermark Pattern */}
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none select-none text-blue-200">
        <FileText size={180} />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-blue-700/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg border border-blue-400/30 flex items-center justify-center shrink-0">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black uppercase tracking-wider text-blue-100 flex items-center gap-2">
                  VĂN BẢN WORD HỒ SƠ CÔNG DÂN
                </h3>
                {isCustom ? (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-white border border-emerald-300 shadow-sm flex items-center gap-1">
                    <CheckCircle2 size={11} /> Bản Word cập nhật riêng
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/80 text-white border border-blue-300/40 shadow-sm flex items-center gap-1">
                    <ShieldCheck size={11} /> Mẫu chuẩn từ Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-200 font-medium mt-0.5">
                {isCustom
                  ? `Đã được Cán bộ (${activeDocUpdatedBy}) thay thế bản mới lúc ${activeDocDate}`
                  : `Mẫu hồ sơ chuẩn do Ban CHQS phát hành (Cập nhật: ${activeDocDate})`}
              </p>
            </div>
          </div>

          {/* Admin System Management Toggle */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowAdminUpload(!showAdminUpload)}
              className="text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-blue-100 border border-blue-500/40 transition-all flex items-center gap-1.5 shrink-0"
              title="Quyền Admin: Cấu hình Mẫu Word Hệ thống"
            >
              <Settings size={14} />
              <span>{showAdminUpload ? 'Đóng cấu hình Admin' : 'Admin: Cập nhật file mẫu'}</span>
            </button>
          )}
        </div>

        {/* Admin Upload Banner Panel (when expanded by Admin) */}
        {isAdmin && showAdminUpload && (
          <div className="bg-blue-950/80 border border-amber-400/40 p-4 rounded-xl space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase">
              <ShieldCheck size={16} /> Quản trị viên: Tải lên / Thay đổi Mẫu Word Mặc định Toàn Hệ thống
            </div>
            <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
              Khi Admin tải lên file Word mẫu mới tại đây, tệp sẽ tự động hiển thị ở trên đầu mỗi hồ sơ công dân cho toàn bộ cán bộ các đơn vị tải về và sử dụng.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <label className="cursor-pointer inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-black uppercase text-xs shadow-md transition-all active:scale-95">
                <Upload size={15} /> Tải lên Word Mẫu (.docx)
                <input
                  type="file"
                  accept=".doc,.docx,.docm"
                  className="hidden"
                  onChange={handleAdminUploadMaster}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="bg-blue-950 p-3 rounded-xl border border-blue-500/50 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-blue-200">
              <span className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-blue-400" />
                Đang tải tệp Word lên hệ thống...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-blue-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* File Card & Actions Row */}
        <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-600/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-12 h-12 bg-blue-600/30 border border-blue-400/40 rounded-xl flex items-center justify-center shrink-0">
              <span className="font-black text-xs text-blue-200 uppercase">DOCX</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-black text-sm text-white truncate" title={activeDocName}>
                {activeDocName}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-blue-200 font-semibold mt-1 flex-wrap">
                <span>Cập nhật: {activeDocDate}</span>
                <span>•</span>
                <span>Tác giả: {activeDocUpdatedBy}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons for Officers */}
          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto shrink-0">
            {/* 1. Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-black uppercase text-xs shadow-lg transition-all active:scale-95 border border-emerald-400/30"
              title="Tải file Word này về máy"
            >
              <Download size={16} /> Tải file Word về
            </button>

            {/* 2. Guide Button */}
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center justify-center p-2.5 bg-blue-800/60 hover:bg-blue-700 text-blue-200 rounded-xl border border-blue-500/30 transition-all"
              title="Xem hướng dẫn chỉnh sửa"
            >
              <Edit3 size={16} />
            </button>

            {/* 3. Replace Button (Hidden when Admin has uploaded master template) */}
            {!isReadOnly && !masterTemplate?.url && (
              <label className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-black uppercase text-xs shadow-lg transition-all cursor-pointer active:scale-95">
                <Upload size={16} />
                <span>{isCustom ? 'Thay bằng bản cập nhật mới' : 'Tải lên & Thay thế file'}</span>
                <input
                  type="file"
                  accept=".doc,.docx,.docm"
                  className="hidden"
                  onChange={handleReplaceOfficerFile}
                  disabled={isUploading}
                />
              </label>
            )}

            {/* 4. Revert Button */}
            {!isReadOnly && isCustom && !masterTemplate?.url && (
              <button
                type="button"
                onClick={handleRevertToMaster}
                className="p-2.5 bg-red-900/60 hover:bg-red-800 text-red-200 rounded-xl border border-red-500/30 transition-all"
                title="Khôi phục về file Word mẫu chuẩn của Admin"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Guide Box (when toggled) */}
        {showGuide && (
          <div className="bg-blue-950 border border-blue-500/50 p-4 rounded-xl text-xs space-y-2 animate-in fade-in duration-200">
            <div className="font-black text-amber-300 uppercase flex items-center gap-1.5">
              <AlertCircle size={15} /> Hướng dẫn xuất hồ sơ file Word:
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-blue-100 font-medium pl-1">
              <li>Cán bộ tiến hành nhập / cập nhật thông tin trực tiếp vào tab <strong className="text-white">"Sơ yếu lý lịch"</strong> bên dưới.</li>
              <li>Nhấp nút <strong className="text-emerald-300">"Tải file Word về"</strong> ở trên, hệ thống sẽ tự động tự điền (trộn) toàn bộ dữ liệu công dân vào tệp Word mẫu chuẩn.</li>
              <li>Mở tệp Word đã tải về để kiểm tra hoặc in ấn phục vụ công tác giao nhận quân.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
