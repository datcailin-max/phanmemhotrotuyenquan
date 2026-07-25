import React, { useState, useMemo } from 'react';
import { X, CheckSquare, Square, AlertCircle, ArrowRightLeft, Check, Search } from 'lucide-react';
import { Recruit, RecruitmentStatus } from '../../../types';
import { checkAge } from '../utils';

interface Age17TransferModalProps {
  recruits: Recruit[];
  sessionYear: number;
  onClose: () => void;
  onTransfer: (ids: string[]) => Promise<void>;
}

const Age17TransferModal: React.FC<Age17TransferModalProps> = ({
  recruits,
  sessionYear,
  onClose,
  onTransfer,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Lọc ra danh sách công dân 17 tuổi của địa phương (trừ người đã Đăng ký lần đầu hoặc đã xóa)
  const candidates = useMemo(() => {
    return recruits.filter((r) => {
      // Đúng 17 tuổi
      const age = checkAge(r, sessionYear);
      if (age !== 17) return false;

      // Không ở trạng thái Đăng ký lần đầu và không Đã xóa
      if (r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION) return false;
      if (r.status === RecruitmentStatus.DELETED) return false;

      // Lọc theo tìm kiếm (tên hoặc số CCCD)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const nameMatches = r.fullName.toLowerCase().includes(query);
        const citizenIdMatches = r.citizenId ? r.citizenId.includes(query) : false;
        return nameMatches || citizenIdMatches;
      }

      return true;
    });
  }, [recruits, sessionYear, searchTerm]);

  // Chọn tất cả
  const isAllSelected = candidates.length > 0 && selectedIds.length === candidates.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((c) => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;

    const confirmMessage = `Xác nhận đề nghị chuyển ${selectedIds.length} công dân 17 tuổi vào danh sách đăng ký lần đầu. Bạn có chắc chắn không?`;
    if (window.confirm(confirmMessage)) {
      setIsProcessing(true);
      try {
        await onTransfer(selectedIds);
        alert(`Đã chuyển thành công ${selectedIds.length} công dân.`);
        onClose();
      } catch (error) {
        console.error('Lỗi khi chuyển trạng thái công dân 17 tuổi:', error);
        alert('Có lỗi xảy ra trong quá trình chuyển trạng thái.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-military-700 p-5 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold uppercase flex items-center gap-2 text-sm">
            <ArrowRightLeft size={20} className={isProcessing ? 'animate-spin' : ''} />
            Đề nghị chuyển công dân 17 tuổi đăng ký lần đầu
          </h3>
          <button onClick={onClose} disabled={isProcessing}>
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Info panel */}
          <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-cyan-600 shrink-0 mt-0.5" size={20} />
            <div className="text-xs text-cyan-800 leading-relaxed font-medium">
              Hệ thống tự động rà soát toàn bộ các công dân của địa phương đạt <span className="font-bold text-cyan-900">17 tuổi</span> trong năm tuyển quân hiện tại ({sessionYear}) nhưng chưa được đưa vào <span className="font-bold text-cyan-900">Danh sách đăng ký NVQS lần đầu</span> để đề nghị chuyển trạng thái đồng loạt.
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm họ tên, CCCD..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl text-xs font-bold focus:border-military-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {selectedIds.length} / {candidates.length} đã chọn
            </div>
          </div>

          {/* Candidates List */}
          <div className="border border-gray-100 rounded-xl overflow-hidden max-h-[40vh] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase font-black sticky top-0 z-10 shadow-sm">
                <tr className="border-b border-gray-100">
                  <th className="p-3 text-center w-12">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      disabled={candidates.length === 0 || isProcessing}
                      className="text-gray-400 hover:text-military-600 transition-colors"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="text-military-600" size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Họ và tên / CCCD</th>
                  <th className="p-3 text-center">Ngày sinh</th>
                  <th className="p-3">Thôn / Ấp</th>
                  <th className="p-3">Trạng thái hiện tại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 italic text-xs">
                      Không tìm thấy công dân 17 tuổi nào cần đề xuất.
                    </td>
                  </tr>
                ) : (
                  candidates.map((c) => {
                    const isSelected = selectedIds.includes(c.id);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => !isProcessing && handleSelectOne(c.id)}
                        className={`hover:bg-military-50/20 cursor-pointer transition-colors text-xs ${
                          isSelected ? 'bg-military-50/10' : ''
                        }`}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleSelectOne(c.id)}
                            disabled={isProcessing}
                            className="text-gray-400 hover:text-military-600 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="text-military-600" size={18} />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-gray-900 uppercase">{c.fullName}</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {c.citizenId || 'Chưa có CCCD'}
                          </div>
                        </td>
                        <td className="p-3 text-center font-semibold text-gray-600">
                          {c.dob ? c.dob.split('-').reverse().join('/') : '---'}
                        </td>
                        <td className="p-3 font-semibold text-gray-600">{c.address.village}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/50">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="flex-1 py-3 text-xs font-black text-gray-500 uppercase border border-gray-200 bg-white rounded-xl hover:bg-gray-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={isProcessing || selectedIds.length === 0}
            onClick={handleSubmit}
            className="flex-[2] bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-military-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? 'Đang thực hiện...' : `Xác nhận chuyển (${selectedIds.length})`}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Age17TransferModal;
