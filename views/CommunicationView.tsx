
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Send, Download, Trash2, PlusCircle, Calendar, 
  MapPin, UserCheck, ShieldAlert, X, Eye, CheckCircle2, History, Filter, RefreshCw
} from 'lucide-react';
import { User, UnitReport, ProvincialDispatch } from '../types';
import { api } from '../api';
import { LOCATION_DATA } from '../constants';

interface CommunicationViewProps {
  user: User;
  sessionYear: number;
}

const CommunicationView: React.FC<CommunicationViewProps> = ({ user, sessionYear }) => {
  const [reports, setReports] = useState<UnitReport[]>([]);
  const [dispatches, setDispatches] = useState<ProvincialDispatch[]>([]);
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'DISPATCHES'>('REPORTS');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  
  // Filter for Province Admin
  const [filterCommune, setFilterCommune] = useState('');

  const isProvinceAdmin = user.role === 'PROVINCE_ADMIN';
  const isCommuneUser = user.role === 'EDITOR' || user.role === 'VIEWER';

  const fetchData = async () => {
    setIsLoading(true);
    let rParams: any = { year: sessionYear };
    let dParams: any = { year: sessionYear };

    if (isProvinceAdmin) {
      rParams.province = user.unit.province;
      dParams.province = user.unit.province;
    } else if (isCommuneUser) {
      rParams.username = user.username;
      dParams.username = user.username;
    }

    const [rData, dData] = await Promise.all([
      api.getReports(rParams),
      api.getDispatches(dParams)
    ]);

    setReports(rData);
    setDispatches(dData);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [user, sessionYear]);

  const communesInProvince = useMemo(() => {
    if (!isProvinceAdmin) return [];
    // @ts-ignore
    const provinceData = LOCATION_DATA[user.unit.province];
    return provinceData ? Object.keys(provinceData) : [];
  }, [user, isProvinceAdmin]);

  const filteredReports = useMemo(() => {
      if (!filterCommune) return reports;
      return reports.filter(r => r.senderUnitName.includes(filterCommune));
  }, [reports, filterCommune]);

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const file = target.reportFile.files[0];
    if (!file) return;

    if (file.size > 16 * 1024 * 1024) {
        alert("CẢNH BÁO: File lớn hơn 16MB có thể không lưu được. Vui lòng thử nén file hoặc chia nhỏ.");
    }

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
        const newReport = {
            senderUsername: user.username,
            senderUnitName: user.fullName,
            targetProvince: user.unit.province,
            title: target.reportTitle.value,
            url: ev.target?.result as string,
            year: sessionYear,
            timestamp: Date.now()
        };
        const res = await api.sendReport(newReport);
        setIsProcessingFile(false);
        if (res) {
            setReports([res, ...reports]);
            setShowReportModal(false);
            alert("Đã gửi báo cáo thành công lên Bộ CHQS Tỉnh!");
        } else {
            alert("Lỗi: Không thể gửi file lớn. Vui lòng kiểm tra kích thước file.");
        }
    };
    reader.readAsDataURL(file);
  };

  const handleSendDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const file = target.dispatchFile.files[0];
    if (!file) return;

    if (file.size > 16 * 1024 * 1024) {
        alert("CẢNH BÁO: File chỉ đạo lớn hơn 16MB có thể không ban hành được. Vui lòng nén file.");
    }

    const selectedRecipients = Array.from(target.dispatchRecipients.selectedOptions).map((opt: any) => opt.value);
    if (selectedRecipients.length === 0) {
        alert("Vui lòng chọn ít nhất một đơn vị nhận.");
        return;
    }

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
        const newDispatch = {
            senderUsername: user.username,
            senderProvince: user.unit.province,
            title: target.dispatchTitle.value,
            url: ev.target?.result as string,
            recipients: selectedRecipients,
            year: sessionYear,
            timestamp: Date.now()
        };
        const res = await api.sendDispatch(newDispatch);
        setIsProcessingFile(false);
        if (res) {
            setDispatches([res, ...dispatches]);
            setShowDispatchModal(false);
            alert("Đã ban hành văn bản thành công tới các xã/phường!");
        } else {
            alert("Lỗi: Không thể ban hành file lớn.");
        }
    };
    reader.readAsDataURL(file);
  };

  const deleteReport = async (id: string) => {
      if (window.confirm("Xóa báo cáo này?") && await api.deleteReport(id)) {
          setReports(reports.filter(r => (r as any)._id !== id));
      }
  };

  const deleteDispatch = async (id: string) => {
    if (window.confirm("Xóa văn bản này?") && await api.deleteDispatch(id)) {
        setDispatches(dispatches.filter(d => (d as any)._id !== id));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header Bar */}
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
          {isCommuneUser && (
            <button 
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 bg-military-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-military-800 transition-all"
            >
              <PlusCircle size={18}/> Gửi báo cáo lên Tỉnh
            </button>
          )}
          {isProvinceAdmin && (
            <button 
              onClick={() => setShowDispatchModal(true)}
              className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-blue-800 transition-all"
            >
              <Send size={18}/> Ban hành văn bản chỉ đạo
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl shadow-sm border overflow-hidden p-1 w-fit">
          <button 
            onClick={() => setActiveTab('REPORTS')} 
            className={`px-6 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-all ${activeTab === 'REPORTS' ? 'bg-military-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <History size={16}/> {isProvinceAdmin ? 'Báo cáo nhận được' : 'Lịch sử gửi báo cáo'}
          </button>
          <button 
            onClick={() => setActiveTab('DISPATCHES')} 
            className={`px-6 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-all ${activeTab === 'DISPATCHES' ? 'bg-blue-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <FileText size={16}/> {isProvinceAdmin ? 'Văn bản đã ban hành' : 'Văn bản chỉ đạo từ Tỉnh'}
          </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        {activeTab === 'REPORTS' ? (
          <div className="flex flex-col h-full">
            {isProvinceAdmin && (
              <div className="p-4 bg-gray-50 border-b flex items-center gap-3">
                 <Filter size={16} className="text-gray-400"/>
                 <span className="text-xs font-bold text-gray-500 uppercase">Lọc theo đơn vị cấp xã:</span>
                 <select 
                   className="text-xs border rounded p-1.5 bg-white font-bold"
                   value={filterCommune}
                   onChange={e => setFilterCommune(e.target.value)}
                 >
                    <option value="">-- Tất cả các đơn vị --</option>
                    {communesInProvince.map(c => <option key={c} value={c}>{c}</option>)}
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
                  ) : filteredReports.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Chưa có báo cáo nào</td></tr>
                  ) : filteredReports.map((r, i) => (
                    <tr key={(r as any)._id} className="hover:bg-military-50/50">
                      <td className="p-4 text-gray-400 font-medium">{i + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-bold text-military-900">
                          <Calendar size={14} className="text-gray-400"/>
                          {new Date(r.timestamp).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td className="p-4 font-black uppercase text-military-800">{r.senderUnitName}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{r.title}</div>
                      </td>
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
                          {(isCommuneUser || user.role === 'ADMIN') && (
                            <button 
                              onClick={() => deleteReport((r as any)._id)}
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
        ) : (
          <div className="flex flex-col h-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-blue-50/50 border-b text-[10px] font-black text-blue-400 uppercase">
                  <tr>
                    <th className="p-4 w-12">STT</th>
                    <th className="p-4">Ngày ban hành</th>
                    <th className="p-4">Tên văn bản</th>
                    <th className="p-4">Phạm vi</th>
                    <th className="p-4 text-right">Tải về</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Đang tải dữ liệu...</td></tr>
                  ) : dispatches.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Chưa có văn bản chỉ đạo nào</td></tr>
                  ) : dispatches.map((d, i) => (
                    <tr key={(d as any)._id} className="hover:bg-blue-50/50">
                      <td className="p-4 text-gray-400 font-medium">{i + 1}</td>
                      <td className="p-4">
                         <div className="flex items-center gap-2 font-bold text-blue-900">
                          <Calendar size={14} className="text-gray-400"/>
                          {new Date(d.timestamp).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-800">{d.title}</td>
                      <td className="p-4">
                        {d.recipients.includes('ALL') ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black">TOÀN TỈNH</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {d.recipients.map((rec, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border text-[9px] font-bold">{rec}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <a 
                            href={d.url} 
                            download={`VBCĐ_TINH_${d.title}.pdf`}
                            className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-700 hover:text-white transition-all shadow-sm"
                          >
                            <Download size={16}/>
                          </a>
                          {(isProvinceAdmin || user.role === 'ADMIN') && (
                            <button 
                              onClick={() => deleteDispatch((d as any)._id)}
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
        )}
      </div>

      {/* MODAL GỬI BÁO CÁO */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-military-800 p-5 flex justify-between items-center text-white">
              <h3 className="font-bold uppercase flex items-center gap-2 text-sm">Gửi báo cáo lên Tỉnh</h3>
              <button onClick={() => setShowReportModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSendReport} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Tiêu đề báo cáo</label>
                <input name="reportTitle" required type="text" placeholder="VD: Danh sách công dân đạt khám tuyển đợt 1" className="w-full border p-2.5 rounded-lg text-sm font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Chọn File PDF</label>
                <input name="reportFile" required type="file" accept=".pdf" className="w-full text-xs p-2 border border-dashed rounded-lg bg-gray-50" />
                <p className="text-[9px] text-red-500 mt-1 italic">* Ưu tiên file &lt; 16MB để tránh lỗi lưu trữ</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" disabled={isProcessingFile} onClick={() => setShowReportModal(false)} className="px-5 py-2 text-xs font-bold text-gray-500">Hủy</button>
                <button type="submit" disabled={isProcessingFile} className={`px-7 py-2 bg-military-700 text-white rounded-lg font-black uppercase text-xs flex items-center gap-2 ${isProcessingFile ? 'opacity-50' : ''}`}>
                    {isProcessingFile ? <><RefreshCw size={14} className="animate-spin" /> Đang gửi...</> : 'Xác nhận gửi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GỬI VĂN BẢN (TỈNH) */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-blue-800 p-5 flex justify-between items-center text-white shadow-lg">
              <h3 className="font-bold uppercase flex items-center gap-2 text-sm">Ban hành văn bản chỉ đạo</h3>
              <button onClick={() => setShowDispatchModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSendDispatch} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Tiêu đề văn bản</label>
                <input name="dispatchTitle" required type="text" placeholder="VD: Thông báo lịch huấn luyện dự bị động viên" className="w-full border p-2.5 rounded-lg text-sm font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Đơn vị nhận (Giữ Ctrl để chọn nhiều)</label>
                <select name="dispatchRecipients" multiple required className="w-full border p-2 rounded-lg text-xs h-32 custom-scrollbar">
                  <option value="ALL" className="font-bold text-blue-600">--- GỬI TOÀN BỘ CẤP XÃ ---</option>
                  {communesInProvince.map(c => <option key={c} value={c}>Ban CHQS {c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase">Chọn File PDF</label>
                <input name="dispatchFile" required type="file" accept=".pdf" className="w-full text-xs p-2 border border-dashed rounded-lg bg-blue-50/20" />
                <p className="text-[9px] text-red-500 mt-1 italic">* File &gt; 16MB có thể gây lỗi hệ thống</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" disabled={isProcessingFile} onClick={() => setShowDispatchModal(false)} className="px-5 py-2 text-xs font-bold text-gray-500">Hủy</button>
                <button type="submit" disabled={isProcessingFile} className={`px-7 py-2 bg-blue-700 text-white rounded-lg font-black uppercase text-xs flex items-center gap-2 ${isProcessingFile ? 'opacity-50' : ''}`}>
                   {isProcessingFile ? <><RefreshCw size={14} className="animate-spin" /> Đang ban hành...</> : 'Ban hành ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationView;
