
import React from 'react';
import { 
  Users, ClipboardList, Stethoscope, FileSignature, Flag, Calendar, 
  PauseCircle, ShieldCheck, Layers, Ban, Shield, BookX, UserPlus, UserX, ArrowRightCircle, AlertOctagon, GraduationCap, Gavel
} from 'lucide-react';

const Card = ({ title, count, icon: Icon, color, onClick, detailText, isLast, isAlert }: any) => (
    <div onClick={onClick} className={`relative p-4 rounded-xl border transition-all cursor-pointer group bg-white hover:shadow-lg ${isLast ? 'border-teal-500 bg-teal-50/30' : isAlert ? 'border-red-500 bg-red-50/50 animate-pulse' : 'border-gray-200 hover:border-military-300'}`}>
        <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-lg ${color} text-white`}><Icon size={20} /></div>
            <p className={`text-2xl font-extrabold ${isLast ? 'text-teal-700' : isAlert ? 'text-red-700' : 'text-slate-800'}`}>{count.toLocaleString()}</p>
        </div>
        <h3 className="text-[11px] font-bold text-slate-700 mt-2 uppercase leading-tight tracking-tight">{title}</h3>
        {detailText && <p className="text-[10px] text-gray-500 font-bold bg-gray-50 px-1.5 py-0.5 rounded inline-block mt-1">{detailText}</p>}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"><ArrowRightCircle size={14} className={isAlert ? 'text-red-400' : "text-military-400"} /></div>
    </div>
);

export default function ProgressSection({ stats, onNavigate }: any) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
             <Card title="1. KHÔNG ĐƯỢC ĐK" count={stats.countNotAllowed} icon={Ban} color="bg-red-800" onClick={() => onNavigate('NOT_ALLOWED_REG')} />
             <Card title="2. MIỄN ĐK" count={stats.countExemptReg} icon={Shield} color="bg-slate-500" onClick={() => onNavigate('EXEMPT_REG')} />
             <Card title="3. ĐK LẦN ĐẦU" count={stats.countFirstTime} icon={UserPlus} color="bg-cyan-600" onClick={() => onNavigate('FIRST_TIME_REG')} />
             <Card title="4. TỔNG NGUỒN" count={stats.countTotalSource} icon={Users} color="bg-gray-600" onClick={() => onNavigate('ALL')} />
             <Card title="5. KHÔNG TUYỂN (TT50)" count={stats.countTT50} icon={BookX} color="bg-slate-600" onClick={() => onNavigate('TT50')} />
             <Card title="6. ĐỦ ĐK SƠ TUYỂN" count={stats.ds6_count} icon={ClipboardList} color="bg-blue-600" onClick={() => onNavigate('PRE_CHECK')} detailText={`${stats.countPreCheckPass} Đạt / ${stats.countPreCheckFail} Loại`} />
             <Card title="7. ĐỦ ĐK KHÁM TUYỂN" count={stats.countPreCheckPass} icon={Stethoscope} color="bg-indigo-600" onClick={() => onNavigate('MED_EXAM')} detailText={`${stats.countMedPass} Đạt / ${stats.countMedFail} Loại`} />
             <Card title="8. TẠM HOÃN" count={stats.countDeferred} icon={PauseCircle} color="bg-amber-600" onClick={() => onNavigate('DEFERRED_LIST')} />
             <Card title="9. MIỄN GỌI NN" count={stats.countExempted} icon={ShieldCheck} color="bg-purple-600" onClick={() => onNavigate('EXEMPTED_LIST')} />
             <Card title="10. CHỐT HỒ SƠ" count={stats.countFinalized} icon={FileSignature} color="bg-green-600" onClick={() => onNavigate('FINAL')} detailText={`${stats.countFinalizedOfficial} CT / ${stats.countFinalizedReserve} DB`} />
             <Card title="11. NHẬP NGŨ" count={stats.countEnlisted} icon={Flag} color="bg-red-600" onClick={() => onNavigate('ENLISTED')} />
             <Card title="12. LOẠI KHỔI NGUỒN" count={stats.countRemoved} icon={UserX} color="bg-gray-400" onClick={() => onNavigate('REMOVED')} />
             <Card title="13. NGUỒN CÒN LẠI" count={stats.countRemaining} icon={Layers} color="bg-teal-600" onClick={() => onNavigate('REMAINING')} />
             <Card title="14. NGUỒN NĂM SAU" count={stats.countNextYearSource} icon={Calendar} color="bg-cyan-600" onClick={() => onNavigate('NEXT_YEAR_SOURCE')} isLast />
             
             {/* Ô 1: Hết hạn hoãn do Học xong (CĐ, ĐH) */}
             {stats.expiringEduCount > 0 && (
                <Card 
                    title="HẾT HẠN HOÃN (HỌC XONG)" 
                    count={stats.expiringEduCount} 
                    icon={GraduationCap} 
                    color="bg-blue-600" 
                    onClick={() => onNavigate('DEFERRED_EDUCATION')} 
                    detailText="Cần đưa về Nguồn"
                    isAlert 
                />
             )}

             {/* Ô 2: Hết thời gian chấp hành án phạt */}
             {stats.expiringSentenceCount > 0 && (
                <Card 
                    title="HẾT THỜI HẠN ÁN PHẠT" 
                    count={stats.expiringSentenceCount} 
                    icon={Gavel} 
                    color="bg-red-600" 
                    onClick={() => onNavigate('NOT_ALLOWED_REG')} 
                    detailText="Cần đưa về DS 3"
                    isAlert 
                />
             )}
        </div>
    );
}
