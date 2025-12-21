
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { EDUCATIONS } from '../../../constants';

interface RecruitFilterBarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterVillage: string;
  setFilterVillage: (v: string) => void;
  showAdvancedFilter: boolean;
  setShowAdvancedFilter: (v: boolean) => void;
  advFilterEducation: string;
  setAdvFilterEducation: (v: string) => void;
  advFilterHealth: string;
  setAdvFilterHealth: (v: string) => void;
  advFilterPolitical: string;
  setAdvFilterPolitical: (v: string) => void;
  advancedFilterRef: React.RefObject<HTMLDivElement | null>;
}

const RecruitFilterBar: React.FC<RecruitFilterBarProps> = ({
  searchTerm, setSearchTerm, filterVillage, setFilterVillage,
  showAdvancedFilter, setShowAdvancedFilter,
  advFilterEducation, setAdvFilterEducation,
  advFilterHealth, setAdvFilterHealth,
  advFilterPolitical, setAdvFilterPolitical,
  advancedFilterRef
}) => {
  return (
    <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input 
          type="text" 
          className="w-full pl-10 pr-3 py-2 border-gray-200 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-military-50 outline-none font-medium" 
          placeholder="Tìm theo tên công dân hoặc mã CCCD..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <input 
        type="text" 
        className="border-gray-200 border rounded-xl px-4 py-2 text-sm bg-white w-40 font-bold placeholder:font-normal" 
        placeholder="Lọc Thôn/Ấp..." 
        value={filterVillage} 
        onChange={(e) => setFilterVillage(e.target.value)}
      />
      
      <div className="relative" ref={advancedFilterRef}>
        <button 
          onClick={() => setShowAdvancedFilter(!showAdvancedFilter)} 
          className={`flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-white text-xs font-black uppercase tracking-widest transition-all ${
            showAdvancedFilter || advFilterEducation || advFilterHealth || advFilterPolitical 
              ? 'border-military-300 text-military-800 bg-military-50' 
              : 'border-gray-200 text-gray-500 bg-white'
          }`}
        >
          <Filter size={16} /> Lọc nâng cao
        </button>
        {showAdvancedFilter && (
          <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-gray-200 shadow-2xl rounded-2xl p-5 z-20 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Trình độ học vấn</label>
                <select 
                  className="w-full border-gray-200 border rounded-lg p-2 text-xs font-bold" 
                  value={advFilterEducation} 
                  onChange={(e) => setAdvFilterEducation(e.target.value)}
                >
                  <option value="">-- Tất cả trình độ --</option>
                  {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Phân loại sức khỏe</label>
                <select 
                  className="w-full border-gray-200 border rounded-lg p-2 text-xs font-bold" 
                  value={advFilterHealth} 
                  onChange={(e) => setAdvFilterHealth(e.target.value)}
                >
                  <option value="">-- Tất cả loại --</option>
                  {[1,2,3,4,5,6].map(h => <option key={h} value={h.toString()}>Sức khỏe Loại {h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Chất lượng chính trị</label>
                <select 
                  className="w-full border-gray-200 border rounded-lg p-2 text-xs font-bold" 
                  value={advFilterPolitical} 
                  onChange={(e) => setAdvFilterPolitical(e.target.value)}
                >
                  <option value="">-- Tất cả --</option>
                  <option value="None">Quần chúng</option>
                  <option value="Doan_Vien">Đoàn viên</option>
                  <option value="Dang_Vien">Đảng viên</option>
                </select>
              </div>
              <button 
                onClick={() => {setAdvFilterEducation(''); setAdvFilterHealth(''); setAdvFilterPolitical('');}} 
                className="w-full text-xs font-bold text-military-600 hover:underline pt-2"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruitFilterBar;
