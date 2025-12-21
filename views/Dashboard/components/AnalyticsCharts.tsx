
import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, PieChart, Pie, Legend, AreaChart, Area 
} from 'recharts';
import { CHART_COLORS } from '../constants';
import { 
    BookOpen, MapPin, Stethoscope, HeartPulse, UserCheck, 
    Users, Briefcase, Globe, Landmark, TrendingUp 
} from 'lucide-react';

export default function AnalyticsCharts({ stats }: any) {
    return (
        <div className="space-y-6">
            {/* Hàng 1: Thống kê Dân tộc - Tôn giáo - Chính trị */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col h-[300px]">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase border-b pb-3 tracking-widest">
                        <Globe size={18} className="text-blue-500"/> CƠ CẤU DÂN TỘC
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={stats.charts.ethnicityData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                {stats.charts.ethnicityData.map((_:any, i:number) => <Cell key={i} fill={CHART_COLORS.pie[i % CHART_COLORS.pie.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '600' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col h-[300px]">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase border-b pb-3 tracking-widest">
                        <Landmark size={18} className="text-amber-600"/> THÀNH PHẦN TÔN GIÁO
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.charts.religionData} layout="vertical" margin={{ left: -10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={90} fontSize={9} fontWeight="600" />
                            <Tooltip />
                            <Bar dataKey="value" fill={CHART_COLORS.accent} radius={[0, 4, 4, 0]} barSize={15} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col h-[300px]">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase border-b pb-3 tracking-widest">
                        <UserCheck size={18} className="text-red-600"/> CHẤT LƯỢNG CHÍNH TRỊ
                    </h3>
                    <div className="flex-1 flex flex-col justify-around gap-2">
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                            <h4 className="text-[10px] font-bold text-red-700 uppercase mb-0.5">ĐẢNG VIÊN</h4>
                            <p className="text-2xl font-extrabold text-red-600">{stats.political.dangVien}</p>
                            <p className="text-[9px] text-red-500 font-bold">{((stats.political.dangVien/stats.political.total)*100).toFixed(1)}%</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                            <h4 className="text-[10px] font-bold text-blue-700 uppercase mb-0.5">ĐOÀN VIÊN</h4>
                            <p className="text-2xl font-extrabold text-blue-600">{stats.political.doanVien}</p>
                            <p className="text-[9px] text-blue-500 font-bold">{((stats.political.doanVien/stats.political.total)*100).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hàng 2: Học vấn - Nghề nghiệp - Xu hướng */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col h-[300px]">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase border-b pb-3 tracking-widest">
                        <BookOpen size={18} className="text-military-600"/> TRÌNH ĐỘ VĂN HÓA (DS 4)
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={stats.charts.eduData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                {stats.charts.eduData.map((_:any, i:number) => <Cell key={i} fill={CHART_COLORS.pie[i % CHART_COLORS.pie.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '600' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col h-[300px]">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase border-b pb-3 tracking-widest">
                        <Briefcase size={18} className="text-teal-600"/> NGÀNH NGHỀ / CÔNG VIỆC
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.charts.jobData} layout="vertical" margin={{ left: -10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} fontSize={9} fontWeight="600" />
                            <Tooltip />
                            <Bar dataKey="value" fill={CHART_COLORS.teal} radius={[0, 4, 4, 0]} barSize={15} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col h-[300px]">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase border-b pb-3 tracking-widest">
                        <TrendingUp size={18} className="text-indigo-600"/> BIẾN ĐỘNG NGUỒN QUA CÁC NĂM
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.charts.yearlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={CHART_COLORS.indigo} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={CHART_COLORS.indigo} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="year" fontSize={9} fontWeight="600" />
                            <YAxis fontSize={9} />
                            <Tooltip />
                            <Area type="monotone" dataKey="count" stroke={CHART_COLORS.indigo} fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Hàng 3: Sức khỏe & BMI & Địa bàn */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-[300px] flex flex-col">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase border-b pb-3 tracking-widest">
                        <Stethoscope size={18} className="text-indigo-600"/> PHÂN LOẠI SỨC KHỎE
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.charts.healthGradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" fontSize={9} fontWeight="600" />
                            <YAxis fontSize={9} />
                            <Tooltip />
                            <Bar dataKey="value" fill={CHART_COLORS.indigo} radius={[4, 4, 0, 0]} barSize={25} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-[300px] flex flex-col">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase border-b pb-3 tracking-widest">
                        <HeartPulse size={18} className="text-red-500"/> CHỈ SỐ BMI (NGUỒN)
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={stats.charts.bmiData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                                <Cell fill="#fcd34d" /><Cell fill="#10b981" /><Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" align="center" layout="horizontal" wrapperStyle={{ fontSize: '10px', fontWeight: '600' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col h-[300px]">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase border-b pb-3 tracking-widest">
                        <MapPin size={18} className="text-military-600"/> PHÂN BỔ ĐỊA BÀN
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.charts.geoData} layout="vertical" margin={{ left: -10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} fontSize={9} fontWeight="600" />
                            <Tooltip />
                            <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} barSize={15} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
