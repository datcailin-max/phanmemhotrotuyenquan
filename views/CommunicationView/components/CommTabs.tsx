
import React from 'react';
import { History, FileText } from 'lucide-react';
import { User } from '../../../types';

interface CommTabsProps {
  user: User;
  activeTab: 'REPORTS' | 'DISPATCHES';
  onTabChange: (tab: 'REPORTS' | 'DISPATCHES') => void;
}

const CommTabs: React.FC<CommTabsProps> = ({ user, activeTab, onTabChange }) => {
  const isProvinceAdmin = user.role === 'PROVINCE_ADMIN';

  return (
    <div className="flex bg-white rounded-xl shadow-sm border overflow-hidden p-1 w-fit">
      <button 
        onClick={() => onTabChange('REPORTS')} 
        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-all ${activeTab === 'REPORTS' ? 'bg-military-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
      >
        <History size={16}/> {isProvinceAdmin ? 'Báo cáo nhận được' : 'Lịch sử gửi báo cáo'}
      </button>
      <button 
        onClick={() => onTabChange('DISPATCHES')} 
        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-all ${activeTab === 'DISPATCHES' ? 'bg-blue-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
      >
        <FileText size={16}/> {isProvinceAdmin ? 'Văn bản đã ban hành' : 'Văn bản chỉ đạo từ Tỉnh'}
      </button>
    </div>
  );
};

export default CommTabs;
