
import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell
} from 'recharts';
import { 
    Stethoscope, UserCheck, 
    MapPin, ShieldCheck, Award, Users, CheckCircle2, XCircle, HelpCircle
} from 'lucide-react';

interface AnalyticsChartsProps {
    stats: any;
}

export default function AnalyticsCharts({ stats }: AnalyticsChartsProps) {
    const totalPolitical = stats.political.total || 1;
    const dangVien = stats.political.dangVien || 0;
    const doanVien = stats.political.doanVien || 0;
    const quanChung = Math.max(0, totalPolitical - dangVien - doanVien);

    const dangVienPct = ((dangVien / totalPolitical) * 100).toFixed(1);
    const doanVienPct = ((doanVien / totalPolitical) * 100).toFixed(1);
    const quanChungPct = ((quanChung / totalPolitical) * 100).toFixed(1);

    // Dữ liệu sức khỏe
    const healthGradeData = stats.charts.healthGradeData || [];
    const grade1 = healthGradeData.find((d: any) => d.name === 'Loại 1')?.value || 0;
    const grade2 = healthGradeData.find((d: any) => d.name === 'Loại 2')?.value || 0;
    const grade3 = healthGradeData.find((d: any) => d.name === 'Loại 3')?.value || 0;
    const grade4 = healthGradeData.find((d: any) => d.name === 'Loại 4')?.value || 0;
    const grade5 = healthGradeData.find((d: any) => d.name === 'Loại 5')?.value || 0;
    const grade6 = healthGradeData.find((d: any) => d.name === 'Loại 6')?.value || 0;

    const healthPassCount = grade1 + grade2 + grade3;
    const healthFailCount = grade4 + grade5 + grade6;
    const totalClassified = healthPassCount + healthFailCount;
    const unclassifiedCount = Math.max(0, totalPolitical - totalClassified);

    const healthColors: Record<string, string> = {
        'Loại 1': '#10b981', // Emerald green
        'Loại 2': '#3b82f6', // Blue
        'Loại 3': '#06b6d4', // Cyan
        'Loại 4': '#f59e0b', // Amber
        'Loại 5': '#f97316', // Orange
        'Loại 6': '#ef4444', // Red
    };

    // Dữ liệu địa bàn
    const geoData = stats.charts.geoData || [];
    const maxGeoValue = geoData.length > 0 ? Math.max(...geoData.map((d: any) => d.value)) : 1;

    return (
        <div className="space-y-6">
            {/* TIÊU ĐỀ KHỐI PHÂN TÍCH */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-military-800 text-white rounded-xl shadow-md">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight">
                            CHẤT LƯỢNG CÔNG DÂN
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Giám sát nhanh chất lượng chính trị, phân loại sức khỏe và mật độ phân bổ địa bàn
                        </p>
                    </div>
                </div>
            </div>

            {/* KHỐI 3 CỘT TRỰC QUAN SINH ĐỘNG */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. CHẤT LƯỢNG CHÍNH TRỊ */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200/90 p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
                            <h3 className="text-xs md:text-sm font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                                <UserCheck size={18} className="text-red-600" /> CHẤT LƯỢNG CHÍNH TRỊ
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                                Tổng nguồn: {totalPolitical}
                            </span>
                        </div>

                        {/* Thanh phân bố tỷ lệ sinh động */}
                        <div className="mb-4">
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                                <div 
                                    style={{ width: `${dangVienPct}%` }} 
                                    className="bg-gradient-to-r from-red-600 to-red-500 h-full transition-all duration-500" 
                                    title={`Đảng viên: ${dangVien} (${dangVienPct}%)`}
                                />
                                <div 
                                    style={{ width: `${doanVienPct}%` }} 
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-full transition-all duration-500" 
                                    title={`Đoàn viên: ${doanVien} (${doanVienPct}%)`}
                                />
                                <div 
                                    style={{ width: `${quanChungPct}%` }} 
                                    className="bg-slate-300 h-full transition-all duration-500" 
                                    title={`Quần chúng: ${quanChung} (${quanChungPct}%)`}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 font-semibold mt-1 px-0.5">
                                <span className="text-red-600 font-bold">● Đảng viên {dangVienPct}%</span>
                                <span className="text-blue-600 font-bold">● Đoàn viên {doanVienPct}%</span>
                                <span className="text-slate-600 font-bold">● Quần chúng {quanChungPct}%</span>
                            </div>
                        </div>

                        {/* 3 Khối chỉ số chi tiết */}
                        <div className="space-y-2.5">
                            {/* Đảng viên */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50/50 border border-red-200/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-red-600 text-white rounded-lg shadow-sm">
                                        <Award size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-red-900 uppercase">Đảng viên</h4>
                                        <p className="text-[10px] text-red-600 font-semibold">Chỉ tiêu ưu tiên nhập ngũ</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-red-700 tracking-tight">{dangVien}</span>
                                    <span className="text-xs font-bold text-red-500 ml-1">({dangVienPct}%)</span>
                                </div>
                            </div>

                            {/* Đoàn viên */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-sky-50/50 border border-blue-200/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-blue-900 uppercase">Đoàn viên TN</h4>
                                        <p className="text-[10px] text-blue-600 font-semibold">Lực lượng nòng cốt</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-blue-700 tracking-tight">{doanVien}</span>
                                    <span className="text-xs font-bold text-blue-500 ml-1">({doanVienPct}%)</span>
                                </div>
                            </div>

                            {/* Quần chúng */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200/70">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-slate-500 text-white rounded-lg shadow-sm">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800 uppercase">Quần chúng</h4>
                                        <p className="text-[10px] text-slate-500 font-semibold">Chưa vào Đoàn/Đảng</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-slate-700 tracking-tight">{quanChung}</span>
                                    <span className="text-xs font-bold text-slate-500 ml-1">({quanChungPct}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. PHÂN LOẠI SỨC KHỎE */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200/90 p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
                            <h3 className="text-xs md:text-sm font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                                <Stethoscope size={18} className="text-teal-600" /> PHÂN LOẠI SỨC KHỎE
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                                {totalClassified}/{totalPolitical} đã kết luận
                            </span>
                        </div>

                        {/* Thống kê nhanh: Đạt chuẩn vs Không đạt */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-800 uppercase">Đủ ĐK (Loại 1-3)</p>
                                        <p className="text-[10px] text-emerald-600 font-semibold">
                                            {totalClassified > 0 ? ((healthPassCount / totalClassified) * 100).toFixed(1) : 0}% đã khám
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xl font-black text-emerald-700">{healthPassCount}</span>
                            </div>

                            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <XCircle size={16} className="text-amber-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black text-amber-800 uppercase">Không đạt (4-6)</p>
                                        <p className="text-[10px] text-amber-600 font-semibold">
                                            {totalClassified > 0 ? ((healthFailCount / totalClassified) * 100).toFixed(1) : 0}% đã khám
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xl font-black text-amber-700">{healthFailCount}</span>
                            </div>
                        </div>

                        {/* Biểu đồ cột phân loại Loại 1 - 6 */}
                        <div className="h-[145px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={healthGradeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" fontSize={10} fontWeight="700" tickLine={false} />
                                    <YAxis fontSize={10} fontWeight="600" allowDecimals={false} />
                                    <Tooltip 
                                        formatter={(val: any) => [`${val} công dân`, 'Số lượng']}
                                        contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
                                        {healthGradeData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={healthColors[entry.name] || '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {unclassifiedCount > 0 && (
                        <div className="mt-2 text-[11px] font-bold text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-200 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                                <HelpCircle size={13} className="text-gray-400" /> Chưa khám/Chưa kết luận SK:
                            </span>
                            <span className="text-slate-700 font-extrabold">{unclassifiedCount} công dân</span>
                        </div>
                    )}
                </div>

                {/* 3. PHÂN BỔ ĐỊA BÀN QUẢN LÝ */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200/90 p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
                            <h3 className="text-xs md:text-sm font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                                <MapPin size={18} className="text-military-600" /> PHÂN BỔ NGUỒN THEO ĐỊA BÀN
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-military-50 text-military-800 border border-military-200">
                                {geoData.length} địa bàn
                            </span>
                        </div>

                        {/* Danh sách phân bổ theo địa bàn với thanh trực quan */}
                        {geoData.length === 0 ? (
                            <div className="h-[210px] flex items-center justify-center text-xs text-gray-400 font-bold">
                                Chưa có dữ liệu địa chỉ nguồn
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                {geoData.slice(0, 7).map((item: any, idx: number) => {
                                    const pct = ((item.value / totalPolitical) * 100).toFixed(1);
                                    const barWidth = Math.max(8, (item.value / maxGeoValue) * 100);
                                    return (
                                        <div key={item.name || idx} className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-800 truncate max-w-[170px]" title={item.name}>
                                                    <span className="inline-block w-4 text-[10px] font-black text-gray-400">#{idx + 1}</span> {item.name || 'Khác'}
                                                </span>
                                                <span className="font-extrabold text-military-800 shrink-0">
                                                    {item.value} <span className="text-[10px] font-semibold text-gray-400">({pct}%)</span>
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    style={{ width: `${barWidth}%` }} 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        idx === 0 ? 'bg-gradient-to-r from-military-600 to-emerald-500' :
                                                        idx === 1 ? 'bg-gradient-to-r from-blue-600 to-sky-500' :
                                                        idx === 2 ? 'bg-gradient-to-r from-teal-600 to-cyan-500' :
                                                        'bg-slate-400'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

