import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, FileImage, Camera, RefreshCw, HelpCircle, ArrowRight } from 'lucide-react';
import { Recruit } from '../../../types';
import { api } from '../../../api';

interface BulkAvatarModalProps {
  recruits: Recruit[];
  onUpdateRecruit: (updated: Recruit) => void;
  onClose: () => void;
  sessionYear: number;
}

interface SuccessItem {
  fileName: string;
  cccd: string;
  fullName: string;
}

interface ErrorItem {
  fileName: string;
  cccd?: string;
  reason: string;
}

export const BulkAvatarModal: React.FC<BulkAvatarModalProps> = ({
  recruits,
  onUpdateRecruit,
  onClose,
  sessionYear
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [processedCount, setProcessedCount] = useState(0);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [successList, setSuccessList] = useState<SuccessItem[]>([]);
  const [errorList, setErrorList] = useState<ErrorItem[]>([]);

  // Lọc danh sách công dân thuộc năm làm việc hiện tại
  const currentYearRecruits = recruits.filter(r => r.recruitmentYear === sessionYear);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      setSelectedFiles(filesArray);
      setIsCompleted(false);
      setSuccessList([]);
      setErrorList([]);
      setProgressPercent(0);
      setProcessedCount(0);
    }
  };

  // Hàm bóc tách số CCCD từ tên file ảnh
  // Quy định: TÊN_CÔNG_DÂN-SỐ_CCCD (Ví dụ: NGUYENVANA-038200001234.jpg hoặc 038200001234.png)
  const extractCCCD = (fileName: string): string | null => {
    // Loai bo phan mo roi .jpg, .png, .jpeg, .webp ...
    const baseName = fileName.replace(/\.[^/.]+$/, "").trim();
    
    // Tách theo dấu gạch ngang hoặc gạch dưới nếu có
    const parts = baseName.split(/[-_]/);
    for (const part of parts) {
      const cleanPart = part.trim();
      if (/^\d{9,12}$/.test(cleanPart)) {
        return cleanPart;
      }
    }

    // Nếu không tách được theo gạch ngang, dùng Regex tìm chuỗi 9 đến 12 chữ số liên tiếp
    const match = baseName.match(/\d{9,12}/);
    if (match) {
      return match[0];
    }

    return null;
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const handleStartProcess = async () => {
    if (selectedFiles.length === 0) {
      alert("Vui lòng chọn ít nhất 1 file ảnh để thực hiện!");
      return;
    }

    setIsProcessing(true);
    setIsCompleted(false);
    setProgressPercent(0);
    setProcessedCount(0);
    
    const successes: SuccessItem[] = [];
    const errors: ErrorItem[] = [];

    const total = selectedFiles.length;

    for (let i = 0; i < total; i++) {
      const file = selectedFiles[i];
      setCurrentFileName(file.name);
      
      const cccd = extractCCCD(file.name);

      if (!cccd) {
        errors.push({
          fileName: file.name,
          reason: "Tên file không đúng định dạng quy định (TÊN-SỐ_CCCD). Không tìm thấy dãy số CCCD (9-12 chữ số)."
        });
      } else {
        // Tìm công dân có số CCCD trùng khớp trong danh sách năm hiện tại
        const targetRecruit = currentYearRecruits.find(r => r.citizenId?.trim() === cccd);

        if (!targetRecruit) {
          errors.push({
            fileName: file.name,
            cccd,
            reason: `Không tìm thấy công dân nào có số CCCD "${cccd}" trong cơ sở dữ liệu năm ${sessionYear}.`
          });
        } else {
          try {
            // Tải/chuyển đổi ảnh
            let imageUrl = '';
            try {
              imageUrl = await api.uploadFile(file, 'avatar');
            } catch (err) {
              // Fallback dùng base64 nếu upload lỗi
              imageUrl = await readFileAsBase64(file);
            }

            const updatedRecruit: Recruit = {
              ...targetRecruit,
              avatarUrl: imageUrl,
              updatedAt: new Date().toISOString()
            };

            await api.updateRecruit(updatedRecruit);
            onUpdateRecruit(updatedRecruit);

            successes.push({
              fileName: file.name,
              cccd,
              fullName: targetRecruit.fullName
            });
          } catch (uploadErr: any) {
            errors.push({
              fileName: file.name,
              cccd,
              reason: `Lỗi xử lý file ảnh: ${uploadErr.message || uploadErr}`
            });
          }
        }
      }

      const completedCount = i + 1;
      setProcessedCount(completedCount);
      const percent = Math.round((completedCount / total) * 100);
      setProgressPercent(percent);
    }

    setSuccessList(successes);
    setErrorList(errors);
    setIsProcessing(false);
    setIsCompleted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-military-800 text-white p-5 flex justify-between items-center border-b border-military-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Camera size={22} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight">
                Chèn ảnh công dân tự động hàng loạt
              </h3>
              <p className="text-[10px] text-military-200 font-bold uppercase mt-0.5">
                Năm tuyển chọn {sessionYear} • Khớp chính xác theo Số CCCD
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* Hướng dẫn quy định đặt tên file */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
            <HelpCircle size={20} className="text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 space-y-1">
              <p className="font-black uppercase text-emerald-950">Quy định đặt tên tệp ảnh:</p>
              <p className="font-bold">
                Cú pháp chuẩn: <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800 font-black">NGUYENVANA-SốCCCD.jpg</span>
              </p>
              <p className="text-[11px] text-emerald-800">
                • Ví dụ: <span className="font-mono font-bold">NGUYENVANAN-038200001234.jpg</span> hoặc <span className="font-mono font-bold">038200001234.png</span>
              </p>
              <p className="text-[11px] text-emerald-700 italic">
                • Hệ thống sẽ tự động tìm dãy 9–12 số CCCD trong tên file để ghép đúng hình ảnh vào hồ sơ công dân.
              </p>
            </div>
          </div>

          {/* Khu vực chọn File */}
          {!isProcessing && (
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase text-military-900 tracking-wider">
                Chọn danh sách ảnh chân dung công dân
              </label>
              
              <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50/50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform text-emerald-600">
                    <Upload size={24} />
                  </div>
                  <p className="text-xs font-black text-gray-700 uppercase">
                    Nhấp vào đây hoặc kéo thả nhiều tệp ảnh vào đây
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Hỗ trợ định dạng PNG, JPG, JPEG, WEBP
                  </p>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="bg-gray-100 p-3 rounded-xl flex items-center justify-between border border-gray-200">
                  <div className="flex items-center gap-2">
                    <FileImage size={18} className="text-emerald-600" />
                    <span className="text-xs font-black text-gray-800">
                      Đã chọn {selectedFiles.length} tệp ảnh
                    </span>
                  </div>
                  <button 
                    onClick={() => { setSelectedFiles([]); setIsCompleted(false); }}
                    className="text-[10px] font-bold text-red-600 hover:underline uppercase"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Thanh Tiến Trình (%) */}
          {isProcessing && (
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-military-900 flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin text-emerald-600" />
                    Đang xử lý chèn ảnh tự động...
                  </span>
                  <p className="text-[11px] font-mono text-gray-500 mt-1 truncate max-w-md">
                    Đang xử lý: <span className="font-bold text-military-800">{currentFileName}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600 font-mono">
                    {progressPercent}%
                  </span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    {processedCount} / {selectedFiles.length} tệp
                  </p>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden p-0.5 border border-gray-300">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Báo cáo kết quả khi hoàn thành */}
          {isCompleted && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle2 size={28} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-emerald-700">Chèn thành công</p>
                    <p className="text-xl font-black text-emerald-900 font-mono">
                      {successList.length} / {selectedFiles.length}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl flex items-center gap-3 border ${errorList.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <AlertTriangle size={28} className={errorList.length > 0 ? "text-red-600 shrink-0" : "text-gray-400 shrink-0"} />
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-700">Cần kiểm tra lại</p>
                    <p className={`text-xl font-black font-mono ${errorList.length > 0 ? 'text-red-900' : 'text-gray-500'}`}>
                      {errorList.length} tệp
                    </p>
                  </div>
                </div>
              </div>

              {/* Danh sách lỗi / Không khớp được */}
              {errorList.length > 0 && (
                <div className="bg-red-50/80 border border-red-200 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-red-200 pb-2">
                    <h4 className="text-xs font-black text-red-900 uppercase flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-red-600" />
                      Danh sách {errorList.length} tệp ảnh chưa thể chèn tự động
                    </h4>
                    <span className="text-[10px] font-bold text-red-700">
                      Vui lòng kiểm tra đặt lại tên file ảnh
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {errorList.map((err, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-red-100 text-xs flex flex-col gap-1 shadow-sm">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-gray-800 break-all">{err.fileName}</span>
                          {err.cccd && (
                            <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-black">
                              CCCD: {err.cccd}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-red-700 font-medium">
                          • {err.reason}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-red-800 italic font-bold">
                    💡 Hướng dẫn sửa: Cán bộ kiểm tra lại số CCCD của công dân trong danh sách, sau đó đổi tên file ảnh thành <span className="font-mono underline">TÊN-SỐCCCD.jpg</span> rồi chọn lại các file lỗi để tải lên.
                  </p>
                </div>
              )}

              {/* Danh sách thành công rút gọn */}
              {successList.length > 0 && (
                <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl">
                  <p className="text-[10px] font-black uppercase text-emerald-800 mb-1">
                    Đã gán ảnh thành công cho các công dân:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pt-1">
                    {successList.map((s, idx) => (
                      <span key={idx} className="bg-white border border-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-emerald-600" />
                        {s.fullName} ({s.cccd})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-[10px] font-bold text-gray-500 uppercase">
            {currentYearRecruits.length} công dân trong CSDL năm {sessionYear}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-black text-xs uppercase hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isCompleted ? 'Đóng' : 'Hủy bỏ'}
            </button>

            {!isCompleted && (
              <button
                onClick={handleStartProcess}
                disabled={isProcessing || selectedFiles.length === 0}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Camera size={16} />
                Bắt đầu chèn ảnh ({selectedFiles.length})
              </button>
            )}

            {isCompleted && (
              <button
                onClick={() => {
                  setSelectedFiles([]);
                  setIsCompleted(false);
                  setSuccessList([]);
                  setErrorList([]);
                }}
                className="px-5 py-2 bg-military-800 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-military-900 active:scale-95 transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Tải lên đợt ảnh khác
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
