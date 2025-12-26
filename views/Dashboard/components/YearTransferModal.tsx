
import React, { useState, useMemo } from 'react';
import { X, RefreshCw, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Recruit, RecruitmentStatus } from '../../../types';
import { api } from '../../../api';

interface YearTransferModalProps {
  currentRecruits: Recruit[];
  sessionYear: number;
  unitName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const YearTransferModal: React.FC<YearTransferModalProps> = ({ 
  currentRecruits, sessionYear, unitName, onClose, onSuccess 
}) => {
  const [targetYear, setTargetYear] = useState(sessionYear + 1);
  const [isTransferring, setIsTransferring] = useState(false);

  // Logic lọc và tính toán dữ liệu sẽ kết chuyển
  const transferData = useMemo(() => {
    const checkAge = (r: Recruit, year: number) => (year - 1) - parseInt(r.dob.split('-')[0] || '0');
    
    // 1. Danh sách 1 (Không được đăng ký NVQS)
    const list1 = currentRecruits.filter(r => r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION);
    
    // 2. Danh sách 2 (Miễn đăng ký NVQS)
    const list2 = currentRecruits.filter(r => r.status === RecruitmentStatus.EXEMPT_REGISTRATION);

    // 3. Danh sách 3 (17 tuổi - Đăng ký lần đầu)
    const list3 = currentRecruits.filter(r => r.status === RecruitmentStatus.FIRST_TIME_REGISTRATION);
    
    // 4. Danh sách 13 (Nguồn còn lại - Sẵn sàng nhập ngũ nhưng chưa đi)
    const list13 = currentRecruits.filter(r => {
      if (checkAge(r, sessionYear) < 18) return false;
      const isRestricted = [
        RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
        RecruitmentStatus.EXEMPT_REGISTRATION, 
        RecruitmentStatus.FIRST_TIME_REGISTRATION, 
        RecruitmentStatus.DELETED, 
        RecruitmentStatus.REMOVED_FROM_SOURCE
      ];
      if (isRestricted.includes(r.status)) return false;
      const isEnlistedOfficial = (r.status === RecruitmentStatus.FINALIZED || r.status === RecruitmentStatus.ENLISTED) && r.enlistmentType === 'OFFICIAL';
      if (isEnlistedOfficial) return false;
      return true;
    });

    // Gộp tất cả các đối tượng cần chuyển (Lưu ý: Chỉ chuyển những người còn trong độ tuổi gọi nhập ngũ 17-27 cho năm tới)
    const rawTotalList = [...list1, ...list2, ...list3, ...list13];
    const filteredByAge = rawTotalList.filter(r => {
        const ageInTargetYear = checkAge(r, targetYear);
        return ageInTargetYear <= 27;
    });

    // Phân tích trạng thái sau khi chuyển
    const finalizedTransferList = filteredByAge.map(r => {
      let nextStatus = RecruitmentStatus.SOURCE;
      
      // Giữ nguyên trạng thái cho diện 1, 2, 5, 8, 9
      if ([
        RecruitmentStatus.NOT_ALLOWED_REGISTRATION,
        RecruitmentStatus.EXEMPT_REGISTRATION,
        RecruitmentStatus.NOT_SELECTED_TT50, 
        RecruitmentStatus.DEFERRED, 
        RecruitmentStatus.EXEMPTED
      ].includes(r.status)) {
        nextStatus = r.status;
      }
      
      return { ...r, status: nextStatus };
    });

    return {
      total: finalizedTransferList.length,
      list: finalizedTransferList,
      stats: {
          list1Count: list1.length,
          list2Count: list2.length,
          ds3ToDs4: list3.length,
          keepStatus: finalizedTransferList.filter(r => [RecruitmentStatus.DEFERRED, RecruitmentStatus.EXEMPTED, RecruitmentStatus.NOT_SELECTED_TT50, RecruitmentStatus.NOT_ALLOWED_REGISTRATION, RecruitmentStatus.EXEMPT_REGISTRATION].includes(r.status)).length,
          resetToSource: finalizedTransferList.filter(r => r.status === RecruitmentStatus.SOURCE && !list3.find(l => l.id === r.id)).length
      }
    };
  }, [currentRecruits, sessionYear, targetYear]);

  const handleTransfer = async () => {
    if (transferData.total === 0) {
        alert("Không có hồ sơ nào đủ điều kiện kết chuyển!");
        return;
    }

    if (!window.confirm(`Xác nhận kết chuyển ${transferData.total} hồ sơ từ năm ${sessionYear} sang năm ${targetYear}?\n\nLưu ý:\n- Danh sách 1 và 2 sẽ được kế thừa trạng thái.\n- Danh sách 3 và Nguồn cũ sẽ được đưa về diện sẵn sàng gọi nhập ngũ.\n- Thao tác này sẽ tạo bản sao hồ sơ mới cho năm ${targetYear}.`)) {
        return;
    }

    setIsTransferring(true);
    try {
        const success = await api.transferYearData(transferData.list, targetYear);
        if (success) {
            alert(`Đã kết chuyển thành công ${transferData.total} hồ sơ sang năm ${targetYear}!`);
            onSuccess();
            onClose();
        } else {
            alert("Có lỗi xảy ra trong quá trình kết chuyển.");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi hệ thống.");
    } finally {
        setIsTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-military-800 p-5 flex justify-between items-center text-white">
          <h3 className="font-bold uppercase flex items-center gap-2 text-sm">
            <RefreshCw size={20} className={isTransferring ? 'animate-spin' : ''} />
            Kết chuyển nguồn sang năm sau
          </h3>
          <button onClick={onClose} disabled={isTransferring}><X size={24}/></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
             <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
             <div className="text-xs text-amber-800 leading-relaxed font-medium">
               Quy trình này thực hiện kết chuyển dữ liệu công dân từ năm cũ sang năm mới. 
               <br/><br/>
               <b>Quy tắc chuyển đổi:</b>
               <ul className="list-disc ml-4 mt-1 space-y-1">
                 <li>Hồ sơ diện <b>Cấm ĐK (DS 1)</b> và <b>Miễn ĐK (DS 2)</b>: Giữ nguyên trạng thái.</li>
                 <li>Hồ sơ diện <b>Tạm hoãn, Miễn gọi và Không tuyển chọn (TT50)</b>: Giữ nguyên trạng thái.</li>
                 <li>Hồ sơ diện <b>Đăng ký lần đầu (DS 3)</b> và <b>Nguồn cũ</b>: Đưa về trạng thái <b>Nguồn sẵn sàng</b>.</li>
               </ul>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8 items-center py-4 border-y border-gray-100">
             <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Từ năm hiện tại</p>
                <div className="text-3xl font-black text-gray-800">{sessionYear}</div>
             </div>
             <div className="flex justify-center">
                <div className="w-12 h-12 bg-military-50 rounded-full flex items-center justify-center text-military-600 shadow-inner">
                   <ArrowRight size={24} />
                </div>
             </div>
             <div className="col-span-2 md:col-span-1 text-center">
                <p className="text-[10px] font-black text-military-600 uppercase tracking-widest mb-1">Kết chuyển đến năm</p>
                <select 
                  className="text-3xl font-black text-military-800 bg-white border-2 border-military-200 rounded-xl px-4 py-1 focus:ring-4 focus:ring-military-50 outline-none"
                  value={targetYear}
                  onChange={e => setTargetYear(Number(e.target.value))}
                  disabled={isTransferring}
                >
                   {[0,1,2].map(i => <option key={i} value={sessionYear + i + 1}>{sessionYear + i + 1}</option>)}
                </select>
             </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Thống kê hồ sơ dự kiến ({transferData.total})</h4>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                   <p className="text-[9px] font-black text-red-700 uppercase">Kế thừa DS 1</p>
                   <p className="text-xl font-black text-red-900">{transferData.stats.list1Count}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-700 uppercase">Kế thừa DS 2</p>
                   <p className="text-xl font-black text-slate-900">{transferData.stats.list2Count}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                   <p className="text-[9px] font-black text-amber-700 uppercase">Hoãn/Miễn/TT50</p>
                   <p className="text-xl font-black text-amber-900">{transferData.stats.keepStatus - (transferData.stats.list1Count + transferData.stats.list2Count)}</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                   <p className="text-[9px] font-black text-teal-700 uppercase">Làm mới Nguồn</p>
                   <p className="text-xl font-black text-teal-900">{transferData.stats.resetToSource + transferData.stats.ds3ToDs4}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-gray-50 p-5 border-t flex items-center justify-between">
          <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-500"/> Sẵn sàng thực hiện cho {unitName}
          </div>
          <div className="flex gap-3">
            <button 
              disabled={isTransferring} 
              onClick={onClose} 
              className="px-6 py-2 text-xs font-black text-gray-500 uppercase"
            >
              Hủy bỏ
            </button>
            <button 
              disabled={isTransferring || transferData.total === 0} 
              onClick={handleTransfer}
              className={`px-8 py-2 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center gap-2 transition-all ${isTransferring ? 'opacity-50' : 'hover:bg-military-800 active:scale-95'}`}
            >
              {isTransferring ? 'Đang xử lý dữ liệu...' : 'Thực hiện kết chuyển'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearTransferModal;
