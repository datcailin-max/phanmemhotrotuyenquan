
import React, { useMemo } from 'react';
import { Filter, Calendar, Download, Trash2 } from 'lucide-react';
import { UnitReport, User } from '../../../types';
import { LOCATION_DATA } from '../../../constants';

interface ReportTableProps {
  user: User;
  reports: UnitReport[];
  isLoading: boolean;
  filterCommune: string;
  onFilterChange: (val: string) => void;
  onDelete: (id: string) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({ 
  user, reports, isLoading, filterCommune, onFilterChange, onDelete 
}) => {
  const isProvinceAdmin = user.role === 'PROVINCE_ADMIN';
  const isAdmin = user.role === 'ADMIN';
  const isCommuneUser = user.role === 'EDITOR' || user.role === 'VIEWER';

  const communes = useMemo(() => {
    if (!isProvinceAdmin && !isAdmin) return [];
    const pName = user.unit.province || "";
    // @ts-ignore
    const data = LOCATION_DATA[pName];
    return data ? Object.keys(data) : [];
  }, [user.unit.province, isProvinceAdmin, isAdmin]);

  const filtered = useMemo(() => {
    if (!filterCommune) return reports;
    return reports.filter(r => (r.senderUnitName || "").includes(filterCommune));
  }, [reports, filterCommune]);

  return (
    <div className="flex flex-col h-full">
      {(isProvinceAdmin || isAdmin) && (
        <div className="p-4 bg-gray-50 border-b flex items-center gap-3">
          <Filter size={16} className="text-gray-400"/>
          <span className="text-xs font-bold text-gray-500 uppercase">Lọc theo đơn vị cấp xã:</span>
          <select 
            className="text-xs border rounded p-1.5 bg-white font-bold"
            value={filterCommune}
            onChange={e => onFilterChange(e.target.value)}
          >
            <option value="">-- Tất cả các đơn vị --</option>
            {communes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase">
            <tr>
              <th className="p-4 w-12">STT</th>
              <th className="p-4">Thời gian gửi</th>
              <th className="p-4">Đơn vị gửi</th>
              <th className="p-4">Tên báo cáo</th>
              <th className="p-4 text-right">Tải về</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Đang tải dữ liệu...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Chưa có báo cáo nào</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={(r as any)._id || i} className="hover:bg-military-50/50">
                <td className="p-4 text-gray-400 font-medium">{i + 1}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 font-bold text-military-900">
                    <Calendar size={14} className="text-gray-400"/>
                    {new Date(r.timestamp).toLocaleString('vi-VN')}
                  </div>
                </td>
                <td className="p-4 font-black uppercase text-military-800">{r.senderUnitName}</td>
                <td className="p-4 font-bold text-gray-800">{r.title}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <a 
                      href={r.url} 
                      download={`${r.senderUnitName}_${r.title}.pdf`}
                      className="p-2 bg-military-50 text-military-700 rounded-lg hover:bg-military-700 hover:text-white transition-all shadow-sm"
                      title="Tải PDF"
                    >
                      <Download size={16}/>
                    </a>
                    {(isCommuneUser || isAdmin) && (
                      <button 
                        onClick={() => onDelete((r as any)._id)}
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

export default ReportTable;
