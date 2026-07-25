import React, { useState, useMemo } from 'react';
import { X, Trash2, CheckCircle2, UserCheck, AlertTriangle, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Recruit } from '../../../types';
import { api } from '../../../api';
import { getStatusLabel, getStatusColor } from '../utils';

interface DuplicateCheckModalProps {
  recruits: Recruit[];
  onClose: () => void;
  onRefreshData: () => void;
  onDelete: (id: string) => void;
}

interface DuplicateGroup {
  key: string;
  name: string;
  dob: string;
  citizenId: string;
  items: Recruit[];
}

const DuplicateCheckModal: React.FC<DuplicateCheckModalProps> = ({ recruits, onClose, onRefreshData, onDelete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Thuật toán phát hiện trùng lặp
  const duplicateGroups = useMemo(() => {
    const groupsMap = new Map<string, Recruit[]>();
    
    recruits.forEach(r => {
      const cId = r.citizenId ? r.citizenId.trim() : '';
      const name = r.fullName ? r.fullName.trim().replace(/\s+/g, ' ').toLowerCase() : '';
      const dob = r.dob ? r.dob.trim() : '';
      
      let key = '';
      if (cId) {
        // Trùng CCCD
        key = `cid_${cId}`;
      } else if (name && dob) {
        // Trùng tên + ngày sinh
        key = `namedob_${name}_${dob}`;
      }
      
      if (key) {
        if (!groupsMap.has(key)) {
          groupsMap.set(key, []);
        }
        groupsMap.get(key)!.push(r);
      }
    });

    const groups: DuplicateGroup[] = [];
    groupsMap.forEach((items, key) => {
      if (items.length > 1) {
        const first = items[0];
        groups.push({
          key,
          name: first.fullName,
          dob: first.dob,
          citizenId: first.citizenId,
          items
        });
      }
    });
    
    return groups;
  }, [recruits]);

  // Đếm tổng số bản ghi bị dư thừa cần xóa
  const totalDuplicatesToRemove = useMemo(() => {
    return duplicateGroups.reduce((acc, group) => acc + (group.items.length - 1), 0);
  }, [duplicateGroups]);

  // Xóa thủ công 1 bản ghi trùng lặp
  const handleDeleteItem = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bản ghi trùng lặp này của công dân "${name}"?`)) {
      setIsProcessing(true);
      setProcessingStatus(`Đang xóa bản ghi trùng lặp...`);
      try {
        const ok = await api.deleteRecruit(id);
        if (ok) {
          onDelete(id);
          onRefreshData();
        } else {
          alert("Lỗi khi xóa bản ghi trùng lặp.");
        }
      } catch (e) {
        console.error(e);
        alert("Đã xảy ra lỗi hệ thống.");
      } finally {
        setIsProcessing(false);
        setProcessingStatus('');
      }
    }
  };

  // Tự động dọn dẹp một nhóm trùng lặp (giữ lại 1 bản ghi tốt nhất, xóa các bản còn lại)
  // Bản tốt nhất được định nghĩa là bản ghi có trạng thái cụ thể hơn (không phải là trạng thái sơ khởi nhất nếu có lựa chọn),
  // hoặc bản ghi đầu tiên.
  const handleCleanGroup = async (group: DuplicateGroup) => {
    setIsProcessing(true);
    setProcessingStatus(`Đang dọn dẹp trùng lặp cho công dân: ${group.name}...`);
    try {
      // Sắp xếp các bản ghi để giữ lại bản ghi có nhiều thông tin nhất hoặc được sửa đổi gần nhất
      // Ở đây ta ưu tiên giữ lại bản ghi đầu tiên hoặc bản ghi có status khác NOT_ALLOWED_REGISTRATION / EXEMPT_REGISTRATION
      const sortedItems = [...group.items].sort((a, b) => {
        const aScore = a.status ? 1 : 0;
        const bScore = b.status ? 1 : 0;
        return bScore - aScore;
      });

      const keepItem = sortedItems[0];
      const itemsToDelete = sortedItems.slice(1);

      let successCount = 0;
      for (const item of itemsToDelete) {
        const ok = await api.deleteRecruit(item.id);
        if (ok) {
          onDelete(item.id);
          successCount++;
        }
      }

      onRefreshData();
      alert(`Đã xử lý xong trùng lặp cho ${group.name}. Đã xóa ${successCount} bản ghi dư thừa.`);
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi trong quá trình xử lý.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Tự động dọn dẹp TẤT CẢ các nhóm trùng lặp trong danh sách
  const handleCleanAllDuplicates = async () => {
    const confirmMsg = `XÁC NHẬN DỌN DẸP TOÀN BỘ:\n\nHệ thống phát hiện ${duplicateGroups.length} nhóm công dân bị trùng lặp.\nSẽ thực hiện xóa tổng cộng ${totalDuplicatesToRemove} bản ghi dư thừa và giữ lại duy nhất 1 bản ghi chính xác nhất cho mỗi công dân.\n\nBạn có chắc chắn muốn tiếp tục thực hiện tự động dọn dẹp không?`;
    
    if (window.confirm(confirmMsg)) {
      setIsProcessing(true);
      let totalDeleted = 0;
      
      try {
        for (let i = 0; i < duplicateGroups.length; i++) {
          const group = duplicateGroups[i];
          setProcessingStatus(`Đang xử lý nhóm (${i + 1}/${duplicateGroups.length}): ${group.name}...`);
          
          // Sắp xếp ưu tiên
          const sortedItems = [...group.items].sort((a, b) => {
            const aScore = a.status ? 1 : 0;
            const bScore = b.status ? 1 : 0;
            return bScore - aScore;
          });

          const itemsToDelete = sortedItems.slice(1);
          for (const item of itemsToDelete) {
            const ok = await api.deleteRecruit(item.id);
            if (ok) {
              onDelete(item.id);
              totalDeleted++;
            }
          }
        }
        
        onRefreshData();
        alert(`DỌN DẸP THÀNH CÔNG!\n\nĐã xử lý toàn bộ trùng lặp hệ thống.\nTổng số bản ghi trùng lặp đã xóa: ${totalDeleted}`);
      } catch (e) {
        console.error(e);
        alert("Đã xảy ra lỗi khi dọn dẹp hàng loạt.");
      } finally {
        setIsProcessing(false);
        setProcessingStatus('');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-military-700 p-5 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold uppercase flex items-center gap-2 text-sm tracking-wide">
            <Layers size={20} className={isProcessing ? 'animate-spin' : ''} />
            Phát hiện và xử lý trùng lặp hồ sơ công dân
          </h3>
          <button onClick={onClose} disabled={isProcessing} className="hover:bg-military-600 p-1 rounded-lg transition-colors">
            <X size={24}/>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Trạng thái xử lý */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3 animate-pulse">
              <RefreshCw className="text-blue-600 animate-spin shrink-0" size={20} />
              <div className="text-sm font-bold text-blue-800">
                {processingStatus || 'Hệ thống đang xử lý dữ liệu, vui lòng đợi...'}
              </div>
            </div>
          )}

          {/* Banner thông tin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 md:col-span-2">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={24} />
              <div>
                <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider mb-1">Cơ chế phát hiện trùng lặp</h4>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  Hệ thống tự động phát hiện trùng lặp dựa trên việc đối khớp trùng <strong>Số Căn cước công dân (CCCD)</strong> hoặc trùng đồng thời cả <strong>Họ tên (không dấu/có dấu) và Ngày tháng năm sinh</strong>.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số nhóm trùng lặp</p>
              <p className="text-3xl font-black text-military-700">{duplicateGroups.length}</p>
              <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Cần dọn dẹp: {totalDuplicatesToRemove} bản ghi dư thừa</p>
            </div>
          </div>

          {duplicateGroups.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-xs font-bold text-gray-600 uppercase">Danh sách chi tiết các công dân bị trùng lặp</span>
                <button 
                  onClick={handleCleanAllDuplicates}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-md"
                >
                  <UserCheck size={16} /> Tự động dọn dẹp tất cả ({totalDuplicatesToRemove} bản dư)
                </button>
              </div>

              {/* Duplicate Groups List */}
              <div className="space-y-4">
                {duplicateGroups.map((group, gIdx) => (
                  <div key={group.key} className="border-2 border-gray-100 hover:border-military-200 rounded-2xl p-4 transition-all bg-white shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{gIdx + 1}</span>
                        <h4 className="text-sm font-black text-gray-800 uppercase">{group.name}</h4>
                        <span className="text-xs font-medium text-gray-400">|</span>
                        <span className="text-xs font-bold text-gray-500">Ngày sinh: {group.dob}</span>
                        {group.citizenId && (
                          <>
                            <span className="text-xs font-medium text-gray-400">|</span>
                            <span className="text-xs font-bold text-military-600">CCCD: {group.citizenId}</span>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleCleanGroup(group)}
                        disabled={isProcessing}
                        className="self-start sm:self-center px-3 py-1.5 bg-military-50 hover:bg-military-100 text-military-800 disabled:opacity-50 text-[10px] font-black uppercase rounded-lg border border-military-100 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} className="text-military-600" /> Giữ 1 bản, dọn trùng
                      </button>
                    </div>

                    {/* Table of items in group */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
                            <th className="p-2 pl-3">ID hồ sơ</th>
                            <th className="p-2">Địa bàn cư trú</th>
                            <th className="p-2">Tình trạng tuyển quân</th>
                            <th className="p-2">Năm tuyển</th>
                            <th className="p-2 pr-3 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((item, idx) => (
                            <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                              <td className="p-2 pl-3 font-mono text-[10px] text-gray-400">{item.id} {idx === 0 && <span className="ml-1 px-1.5 py-0.5 bg-military-100 text-military-800 text-[9px] font-black uppercase rounded">Gốc / Giữ lại</span>}</td>
                              <td className="p-2 font-medium text-gray-600">
                                {item.address.village}, {item.address.commune}
                              </td>
                              <td className="p-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${getStatusColor(item.status)}`}>
                                  {getStatusLabel(item.status)}
                                </span>
                              </td>
                              <td className="p-2 font-bold text-gray-500">{item.recruitmentYear}</td>
                              <td className="p-2 pr-3 text-right">
                                {idx > 0 && (
                                  <button
                                    onClick={() => handleDeleteItem(item.id, item.fullName)}
                                    disabled={isProcessing}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Xóa bản ghi trùng lặp này"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col justify-center items-center text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <CheckCircle2 size={48} className="text-green-500 mb-3 animate-bounce" />
              <h4 className="text-sm font-black text-gray-700 uppercase tracking-wide">Không phát hiện hồ sơ trùng lặp</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed">
                Hệ thống dữ liệu tuyển quân hiện tại rất sạch, không có công dân nào bị trùng lặp thông tin CCCD hoặc Họ tên + Ngày sinh.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            disabled={isProcessing} 
            onClick={onClose} 
            className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
};

export default DuplicateCheckModal;
