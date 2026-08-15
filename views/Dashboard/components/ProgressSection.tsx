
import React from 'react';
import { 
  Users, ClipboardList, Stethoscope, FileSignature, Flag, Calendar, 
  PauseCircle, ShieldCheck, Layers, Ban, Shield, BookX, UserPlus, UserX, ArrowRightCircle, GraduationCap
} from 'lucide-react';

interface CardProps {
    listNumber: string;
    title: string;
    count: number;
    icon: React.ElementType;
    badgeBg: string;
    borderColor: string;
    textColor: string;
    onClick: () => void;
    detailText?: string;
    isLast?: boolean;
    isAlert?: boolean;
    highlight?: boolean;
}

const Card = ({ 
    listNumber, title, count, icon: Icon, badgeBg, borderColor, textColor, 
    onClick, detailText, isLast, isAlert, highlight 
}: CardProps) => (
    <div 
        onClick={onClick} 
        className={`relative p-3.5 md:p-4 rounded-2xl border transition-all duration-200 cursor-pointer group bg-white shadow-xs hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between ${
            isAlert ? 'border-red-500 bg-red-50/40 ring-2 ring-red-300 ring-offset-1 animate-pulse' :
            highlight ? 'border-green-500 bg-gradient-to-br from-green-50/70 to-emerald-50/40 ring-1 ring-green-400' :
            isLast ? 'border-cyan-500 bg-cyan-50/30' : 
            'border-gray-200/90 hover:border-military-400'
        }`}
    >
        <div>
            {/* Top row: Icon + List Number + Main Count */}
            <div className="flex justify-between items-start mb-2.5">
                <div className="flex items-center gap-2">
                    <div className={`p-2.5 rounded-xl ${badgeBg} text-white shadow-sm flex items-center justify-center shrink-0`}>
                        <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded-md">
                        {listNumber}
                    </span>
                </div>
                <div className="text-right">
                    <p className={`text-2xl md:text-3xl font-black tracking-tight ${
                        isAlert ? 'text-red-700' : 
                        highlight ? 'text-green-700' : 
                        isLast ? 'text-cyan-700' : 
                        'text-slate-800'
                    }`}>
                        {count.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* List Title */}
            <h3 className="text-xs font-black text-slate-800 uppercase leading-snug tracking-tight line-clamp-2 min-h-[32px] flex items-center">
                {title}
            </h3>
        </div>

        {/* Bottom Tag / Sub-detail */}
        <div className="mt-2.5 pt-2 border-t border-gray-100/90 flex items-center justify-between">
            {detailText ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block truncate max-w-[85%] ${
                    isAlert ? 'bg-red-100 text-red-700 border border-red-200' : 
                    highlight ? 'bg-green-100 text-green-800 border border-green-200' : 
                    'bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}>
                    {detailText}
                </span>
            ) : (
                <span className="text-[10px] font-medium text-gray-400">Xem danh sách</span>
            )}
            <ArrowRightCircle size={14} className="text-gray-300 group-hover:text-military-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
        </div>
    </div>
);

interface ProgressSectionProps {
    stats: any;
    onNavigate: (tabId: string) => void;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ stats, onNavigate }) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                <Card 
                    listNumber="DS 01"
                    title="Không được đăng ký" 
                    count={stats.countNotAllowed} 
                    icon={Ban} 
                    badgeBg="bg-rose-700" 
                    borderColor="border-rose-300"
                    textColor="text-rose-700"
                    onClick={() => onNavigate('NOT_ALLOWED_REG')} 
                />
                
                <Card 
                    listNumber="DS 02"
                    title="Miễn đăng ký NVQS" 
                    count={stats.countExemptReg} 
                    icon={Shield} 
                    badgeBg="bg-slate-600" 
                    borderColor="border-slate-300"
                    textColor="text-slate-700"
                    onClick={() => onNavigate('EXEMPT_REG')} 
                />
                
                <Card 
                    listNumber="DS 03"
                    title="Đăng ký lần đầu (17T)" 
                    count={stats.countFirstTime} 
                    icon={UserPlus} 
                    badgeBg="bg-cyan-600" 
                    borderColor="border-cyan-300"
                    textColor="text-cyan-700"
                    onClick={() => onNavigate('FIRST_TIME_REG')} 
                />
                
                <Card 
                    listNumber="DS 04"
                    title="Tổng nguồn sẵn sàng" 
                    count={stats.countTotalSource} 
                    icon={Users} 
                    badgeBg="bg-military-700" 
                    borderColor="border-military-300"
                    textColor="text-military-800"
                    onClick={() => onNavigate('ALL')} 
                    detailText="Nguồn 18 - 27 tuổi"
                />
                
                <Card 
                    listNumber="DS 05"
                    title="Không tuyển chọn (TT50)" 
                    count={stats.countTT50} 
                    icon={BookX} 
                    badgeBg="bg-amber-700" 
                    borderColor="border-amber-300"
                    textColor="text-amber-800"
                    onClick={() => onNavigate('TT50')} 
                    detailText={`${stats.countKTC} KTC / ${stats.countCGNN} CGNN`} 
                />
                
                <Card 
                    listNumber="DS 06"
                    title="Đủ điều kiện sơ tuyển" 
                    count={stats.ds6_count} 
                    icon={ClipboardList} 
                    badgeBg="bg-blue-600" 
                    borderColor="border-blue-300"
                    textColor="text-blue-700"
                    onClick={() => onNavigate('PRE_CHECK')} 
                    detailText={`${stats.countPreCheckPass} Đạt / ${stats.countPreCheckFail} Loại`} 
                />
                
                <Card 
                    listNumber="DS 07"
                    title="Đủ điều kiện khám tuyển" 
                    count={stats.countMedExam} 
                    icon={Stethoscope} 
                    badgeBg="bg-indigo-600" 
                    borderColor="border-indigo-300"
                    textColor="text-indigo-700"
                    onClick={() => onNavigate('MED_EXAM')} 
                    detailText={`${stats.countMedPass} Đạt / ${stats.countMedFail} Loại`} 
                />
                
                <Card 
                    listNumber="DS 08"
                    title="Tạm hoãn gọi nhập ngũ" 
                    count={stats.countDeferred} 
                    icon={PauseCircle} 
                    badgeBg="bg-amber-600" 
                    borderColor="border-amber-300"
                    textColor="text-amber-700"
                    onClick={() => onNavigate('DEFERRED_LIST')} 
                />
                
                <Card 
                    listNumber="DS 09"
                    title="Miễn gọi nhập ngũ" 
                    count={stats.countExempted} 
                    icon={ShieldCheck} 
                    badgeBg="bg-purple-600" 
                    borderColor="border-purple-300"
                    textColor="text-purple-700"
                    onClick={() => onNavigate('EXEMPTED_LIST')} 
                />
                
                <Card 
                    listNumber="DS 10"
                    title="Chốt hồ sơ nhập ngũ" 
                    count={stats.countFinalized} 
                    icon={FileSignature} 
                    badgeBg="bg-emerald-600" 
                    borderColor="border-emerald-300"
                    textColor="text-emerald-800"
                    onClick={() => onNavigate('FINAL')} 
                    detailText={`${stats.countFinalizedOfficial} Chính thức / ${stats.countFinalizedReserve} Dự phòng`} 
                    highlight
                />
                
                <Card 
                    listNumber="DS 11"
                    title="Lệnh gọi nhập ngũ" 
                    count={stats.countEnlisted} 
                    icon={Flag} 
                    badgeBg="bg-red-600" 
                    borderColor="border-red-300"
                    textColor="text-red-700"
                    onClick={() => onNavigate('ENLISTED')} 
                    highlight
                />
                
                <Card 
                    listNumber="DS 12"
                    title="Đưa ra khỏi nguồn" 
                    count={stats.countRemoved} 
                    icon={UserX} 
                    badgeBg="bg-gray-500" 
                    borderColor="border-gray-300"
                    textColor="text-gray-700"
                    onClick={() => onNavigate('REMOVED')} 
                    detailText={`${stats.countRemovedMilitary || 0} Tr.QĐ / ${stats.countRemovedTransferred || 0} Chuyển HK`}
                />
                
                <Card 
                    listNumber="DS 13"
                    title="Nguồn còn lại sau tuyển" 
                    count={stats.countRemaining} 
                    icon={Layers} 
                    badgeBg="bg-teal-600" 
                    borderColor="border-teal-300"
                    textColor="text-teal-700"
                    onClick={() => onNavigate('REMAINING')} 
                />
                
                <Card 
                    listNumber="DS 14"
                    title="Nguồn chuyển năm sau" 
                    count={stats.countNextYearSource} 
                    icon={Calendar} 
                    badgeBg="bg-cyan-600" 
                    borderColor="border-cyan-300"
                    textColor="text-cyan-700"
                    onClick={() => onNavigate('NEXT_YEAR_SOURCE')} 
                    isLast 
                />
                
                {/* Danh sách 16. Cần rà soát (Hiển thị nếu có số liệu) */}
                {stats.expiringCount > 0 && (
                    <Card 
                        listNumber="DS 16"
                        title="Cần rà soát lại hạn" 
                        count={stats.expiringCount} 
                        icon={GraduationCap} 
                        badgeBg="bg-orange-600" 
                        borderColor="border-orange-300"
                        textColor="text-orange-700"
                        onClick={() => onNavigate('EXPIRING_LIST')} 
                        detailText={`${stats.expiringEduCount} Học xong / ${stats.expiringSentenceCount} Hết án`}
                        isAlert 
                    />
                )}
            </div>
        </div>
    );
};

export default ProgressSection;

