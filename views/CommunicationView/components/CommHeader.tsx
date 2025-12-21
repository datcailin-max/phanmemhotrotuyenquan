
import React from 'react';
import { FileText, RefreshCw, PlusCircle, Send } from 'lucide-react';
import { User } from '../../../types';

interface CommHeaderProps {
  user: User;
  sessionYear: number;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenReportModal: () => void;
  onOpenDispatchModal: () => void;
}

const CommHeader: React.FC<CommHeaderProps> = ({ 
  user, sessionYear, isLoading, onRefresh, onOpenReportModal, onOpenDispatchModal 
}) => {
  const isProvinceAdmin = user.role === 'PROVINCE_ADMIN';
  const isCommuneUser = user.role === 'EDITOR' || user.role === 'VIEWER';

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div>
        <h2 className="text-xl font-bold text-military-800 flex items-center gap-2">
          <FileText className="text-military-600"/> Hệ thống Báo cáo & Văn bản {sessionYear}
        </h2>
        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">
          {isProvinceAdmin ? `Bộ CHQS Tỉnh ${user.unit.province}` : `Ban CHQS ${user.unit.commune}`}
        </p>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className={`p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all border border-gray-200 ${isLoading ? 'opacity-50' : ''}`}
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
        {isCommuneUser && (
          <button 
            onClick={onOpenReportModal}
            className="flex items-center gap-2 bg-military-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-military-800 transition-all"
          >
            <PlusCircle size={18}/> Gửi báo cáo lên Tỉnh
          </button>
        )}
        {isProvinceAdmin && (
          <button 
            onClick={onOpenDispatchModal}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-blue-800 transition-all"
          >
            <Send size={18}/> Ban hành văn bản chỉ đạo
          </button>
        )}
      </div>
    </div>
  );
};

export default CommHeader;
