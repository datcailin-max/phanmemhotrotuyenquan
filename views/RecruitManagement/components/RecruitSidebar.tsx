
import React from 'react';

interface RecruitSidebarProps {
  visibleTabs: any[];
  activeTabId: string;
  onTabChange: (id: string) => void;
}

const RecruitSidebar: React.FC<RecruitSidebarProps> = ({ visibleTabs, activeTabId, onTabChange }) => {
  return (
    <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-military-50/30">
        <h3 className="text-xs font-black text-military-800 uppercase tracking-widest">Phân loại danh sách</h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {visibleTabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => onTabChange(tab.id)} 
            className={`w-full flex items-center gap-2 px-3 py-3 text-[10px] font-black text-left rounded-lg transition-all ${
              activeTabId === tab.id 
                ? `${tab.color} text-white shadow-lg scale-[1.02] z-10` 
                : `${tab.lightColor} ${tab.textColor} hover:brightness-95 border border-transparent hover:border-gray-200`
            }`}
          >
            {tab.icon && <tab.icon size={16} className="shrink-0" />}
            <span className="line-clamp-2 leading-tight uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecruitSidebar;
