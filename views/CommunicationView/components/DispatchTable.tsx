
import React from 'react';
import { Calendar, Download, Trash2 } from 'lucide-react';
import { ProvincialDispatch, User } from '../../../types';

interface DispatchTableProps {
  user: User;
  dispatches: ProvincialDispatch[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

const DispatchTable: React.FC<DispatchTableProps> = ({ user, dispatches, isLoading, onDelete }) => {
  const isProvinceAdmin = user.role === 'PROVINCE_ADMIN';
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-blue-50/50 border-b text-[10px] font-black text-blue-400 uppercase">
            <tr>
              <th className="p-4 w-12">STT</th>
              <th className="p-4">Ngày ban hành</th>
              <th className="p-4">Tên văn bản</th>
              <th className="p-4">Phạm vi</th>
              <th className="p-4 text-right">Tải về</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Đang tải dữ liệu...</td></tr>
            ) : dispatches.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Chưa có văn bản chỉ đạo nào</td></tr>
            ) : dispatches.map((d, i) => (
              <tr key={(d as any)._id || i} className="hover:bg-blue-50/50">
                <td className="p-4 text-gray-400 font-medium">{i + 1}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 font-bold text-blue-900">
                    <Calendar size={14} className="text-gray-400"/>
                    {new Date(d.timestamp).toLocaleString('vi-VN')}
                  </div>
                </td>
                <td className="p-4 font-bold text-gray-800">{d.title}</td>
                <td className="p-4">
                  {d.recipients.includes('ALL') ? (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black">TOÀN TỈNH</span>
                  ) : (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {d.recipients.map((rec, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border text-[9px] font-bold">{rec}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <a 
                      href={d.url} 
                      download={`VBCĐ_TINH_${d.title}.pdf`}
                      className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-700 hover:text-white transition-all shadow-sm"
                    >
                      <Download size={16}/>
                    </a>
                    {(isProvinceAdmin || isAdmin) && (
                      <button 
                        onClick={() => onDelete((d as any)._id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DispatchTable;
