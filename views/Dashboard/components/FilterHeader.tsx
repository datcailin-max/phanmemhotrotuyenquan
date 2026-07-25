
import React from 'react';
import { Filter } from 'lucide-react';
import { PROVINCES_VN, LOCATION_DATA } from '../../../constants';

interface FilterHeaderProps {
    userRole: string;
    userUnit: any;
    filterProvince: string;
    filterCommune: string;
    onProvinceChange: (val: string) => void;
    onCommuneChange: (val: string) => void;
    onReset: () => void;
}

const FilterHeader: React.FC<FilterHeaderProps> = ({
    userRole, userUnit, filterProvince, filterCommune, onProvinceChange, onCommuneChange, onReset
}) => {
    if (userRole !== 'ADMIN' && userRole !== 'PROVINCE_ADMIN') return null;

    const communes = userRole === 'PROVINCE_ADMIN' 
        ? Object.keys(LOCATION_DATA[userUnit?.province || ''] || {})
        : (filterProvince ? Object.keys(LOCATION_DATA[filterProvince] || {}) : []);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sticky top-0 z-20 backdrop-blur-md bg-white/90">
            <div className="flex flex-col md:flex-row gap-6 items-center">
               <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-widest">
                   <Filter size={18} className="text-military-600" /> Phạm vi giám sát:
               </div>
               <div className="flex flex-1 gap-3 w-full">
                 {userRole === 'ADMIN' && (
                    <select 
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-military-500 outline-none" 
                        value={filterProvince} 
                        onChange={(e) => onProvinceChange(e.target.value)}
                    >
                        <option value="">-- Toàn quốc --</option>
                        {PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 )}
                 <select 
                   className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-military-500 outline-none" 
                   value={filterCommune} 
                   onChange={(e) => onCommuneChange(e.target.value)} 
                   disabled={userRole === 'ADMIN' && !filterProvince}
                 >
                    <option value="">-- Tất cả đơn vị cấp xã --</option>
                    {communes.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
               <button onClick={onReset} className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold text-[10px] uppercase hover:bg-gray-200 transition-colors">Đặt lại</button>
            </div>
        </div>
    );
};

export default FilterHeader;
