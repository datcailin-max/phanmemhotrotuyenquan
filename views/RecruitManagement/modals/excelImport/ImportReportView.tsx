import React, { useState } from 'react';
import { CheckCircle2, RefreshCw, AlertTriangle, Info, ShieldAlert, FileX, AlertCircle, UserCheck } from 'lucide-react';
import { ProcessError, DeferredExemptNotice, FontWarningNotice, MissingCccdNotice } from './types';
import { handleDownloadErrorReport } from './excelTemplates';

interface ImportReportViewProps {
  insertedCount: number;
  updatedCount: number;
  errorList: ProcessError[];
  deferredExemptList: DeferredExemptNotice[];
  fontWarningList: FontWarningNotice[];
  missingCccdList?: MissingCccdNotice[];
  sessionYear: number;
  selectedFileName?: string;
}

export const ImportReportView: React.FC<ImportReportViewProps> = ({
  insertedCount,
  updatedCount,
  errorList,
  deferredExemptList,
  fontWarningList,
  missingCccdList = [],
  sessionYear,
  selectedFileName
}) => {
  const [filterErrorCategory, setFilterErrorCategory] = useState<string>('ALL');

  const filteredErrorList = errorList.filter(err => {
    if (filterErrorCategory === 'ALL') return true;
    return err.errorType === filterErrorCategory;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Thống kê Tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-emerald-800">Thêm mới thành công</p>
            <p className="text-xl font-black text-emerald-950 font-mono">
              {insertedCount} công dân
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-100 rounded-xl text-blue-700">
            <RefreshCw size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-blue-800">Cập nhật thông tin</p>
            <p className="text-xl font-black text-blue-950 font-mono">
              {updatedCount} công dân
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl flex items-center gap-3.5 border ${errorList.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`p-2.5 rounded-xl ${errorList.length > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-500'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-700">Dòng lỗi không nhập được</p>
            <p className={`text-xl font-black font-mono ${errorList.length > 0 ? 'text-red-950' : 'text-gray-500'}`}>
              {errorList.length} dòng
            </p>
          </div>
        </div>
      </div>

      {/* Thông báo Cán bộ: Danh sách Công dân thiếu số CCCD (Hệ thống vẫn cho nhập & Đã tự động lưu dữ liệu) */}
      {missingCccdList.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
            <h4 className="text-xs font-black text-blue-950 uppercase flex items-center gap-2">
              <AlertCircle size={16} className="text-blue-600" />
              Thông báo Cán bộ: Phát hiện {missingCccdList.length} công dân thiếu / chưa có số CCCD (Đã tự động lưu vào CSDL)
            </h4>
            <span className="text-[10px] font-black bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full uppercase font-bold">
              Đã lưu CSDL
            </span>
          </div>

          <p className="text-[11px] text-blue-900 font-medium">
            Tất cả công dân thiếu CCCD dưới đây đều đã được nhập thành công vào cơ sở dữ liệu (không bị bỏ qua). Cán bộ vui lòng kiểm tra và bổ sung Số CCCD / Mã định danh sau:
          </p>

          <div className="max-h-44 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {missingCccdList.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-blue-100 text-xs flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-gray-500">#{item.rowNum}</span>
                  <span className="font-black text-gray-900">{item.fullName}</span>
                  {item.dob && (
                    <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                      NS: {item.dob}
                    </span>
                  )}
                  {item.village && (
                    <span className="text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                      {item.village}
                    </span>
                  )}
                </div>
                <div>
                  {item.matchedExisting ? (
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <UserCheck size={12} /> Cập nhật hồ sơ trùng tên ({item.matchedExisting.dob || 'Đã có CSDL'})
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      ⚠️ Thiếu CCCD (Đã tạo hồ sơ)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thông báo Công dân có lý do Tạm hoãn / Miễn NVQS */}
      {deferredExemptList.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h4 className="text-xs font-black text-amber-950 uppercase flex items-center gap-2">
              <Info size={16} className="text-amber-600" />
              Thông báo Cán bộ: Phát hiện {deferredExemptList.length} công dân có lý do Tạm hoãn / Miễn NVQS hoặc Ghi chú
            </h4>
            <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase">
              Lưu ý quản lý
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {deferredExemptList.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-100 text-xs flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-500">#{item.rowNum}</span>
                  <span className="font-black text-gray-900">{item.fullName}</span>
                  <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                    CCCD: {item.cccd}
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 truncate max-w-xs">
                  {item.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thông báo Cán bộ: Công dân bị vỡ font / lỗi mã hóa nhưng ĐÃ TỰ ĐỘNG CHUẨN HÓA & LƯU THÀNH CÔNG */}
      {fontWarningList.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-orange-200 pb-2">
            <h4 className="text-xs font-black text-orange-950 uppercase flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-600" />
              Phát hiện {fontWarningList.length} công dân bị vỡ font / lỗi mã hóa (Đã tự động làm sạch & Lưu thành công)
            </h4>
            <span className="text-[10px] font-black bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full uppercase font-bold">
              Đã lưu CSDL
            </span>
          </div>

          <p className="text-[11px] text-orange-900 font-medium">
            Hệ thống đã tự động loại bỏ ký tự rác và lưu thành công thông tin công dân vào CSDL. Cán bộ có thể đối soát lại danh sách dưới đây:
          </p>

          <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {fontWarningList.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-orange-100 text-xs flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-500">#{item.rowNum}</span>
                  <span className="font-black text-gray-900">{item.fullName}</span>
                  <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                    CCCD: {item.cccd}
                  </span>
                </div>
                <span className="text-xs font-bold text-orange-800 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60 truncate max-w-xs">
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KHU VỰC CHI TIẾT DÒNG LỖI & NÚT TẢI BÁO CÁO EXCEL LỖI */}
      {errorList.length > 0 && (
        <div className="bg-red-50/90 border border-red-200 p-4 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200 pb-3">
            <div>
              <h4 className="text-xs font-black text-red-950 uppercase flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-600" />
                Danh sách chi tiết {errorList.length} dòng lỗi không thể nhập vào CSDL
              </h4>
              <p className="text-[11px] text-red-700 font-medium mt-0.5">
                Tải về báo cáo Excel bên dưới để chỉnh sửa nhanh các dòng bị thiếu hoặc sai sót.
              </p>
            </div>

            {/* NÚT TẢI BÁO CÁO EXCEL LỖI QUAN TRỌNG */}
            <button
              onClick={() => handleDownloadErrorReport(errorList, fontWarningList, sessionYear, selectedFileName)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-all flex items-center gap-2 shrink-0 border border-red-500"
            >
              <FileX size={16} />
              Tải File Excel Báo Cáo Lỗi
            </button>
          </div>

          {/* Bộ lọc loại lỗi */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-black uppercase text-red-900 text-[10px]">Lọc loại lỗi:</span>
            <select
              value={filterErrorCategory}
              onChange={(e) => setFilterErrorCategory(e.target.value)}
              className="px-2.5 py-1 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-950 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="ALL">Tất cả ({errorList.length} dòng)</option>
              <option value="LOI_FONT_CHINH_TA">
                Lỗi Font chữ / Mã hóa ({errorList.filter(e => e.errorType === 'LOI_FONT_CHINH_TA').length})
              </option>
              <option value="THIEU_CCCD">
                Thiếu CCCD ({errorList.filter(e => e.errorType === 'THIEU_CCCD').length})
              </option>
              <option value="CCCD_SAI_DINH_DANG">
                CCCD sai định dạng ({errorList.filter(e => e.errorType === 'CCCD_SAI_DINH_DANG').length})
              </option>
              <option value="THIEU_HO_TEN">
                Thiếu Họ tên ({errorList.filter(e => e.errorType === 'THIEU_HO_TEN').length})
              </option>
            </select>
          </div>

          {/* Danh sách hiển thị lỗi */}
          <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
            {filteredErrorList.map((err, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-red-200 text-xs flex flex-col gap-1.5 shadow-sm">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-black text-red-950 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded font-mono font-bold text-[10px]">
                      Dòng #{err.rowNum}
                    </span>
                    {err.name ? `• ${err.name}` : ''}
                  </span>
                  {err.cccd && (
                    <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-mono font-bold">
                      CCCD: {err.cccd}
                    </span>
                  )}
                </div>

                <div className="text-[11px] space-y-1">
                  <p className="text-red-800 font-bold flex items-start gap-1">
                    <span className="text-red-500 font-bold">• Nguyên nhân:</span> {err.reason}
                  </p>
                  <p className="text-gray-600 font-medium flex items-start gap-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                    <span className="text-blue-700 font-bold">💡 Gợi ý điều chỉnh:</span> {err.suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
