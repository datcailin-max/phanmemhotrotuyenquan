
import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Download, Filter, FileText, CheckCircle2, ChevronRight, 
  AlertCircle, Info, BarChart3, UserCheck2, ListOrdered, Flag, Settings2 
} from 'lucide-react';
import { Recruit, User, RecruitmentStatus, ExcelTemplate } from '../types';
import { ExcelExportService } from '../services/ExcelExportService';
import { TemplateExportService } from '../services/TemplateExportService';
import { api } from '../api';

interface ReportBuilderProps {
  user: User;
  recruits: Recruit[];
  sessionYear: number;
}

const SYSTEM_TEMPLATES = [
  { id: 'TEMPLATE_17A', title: 'Danh sách gọi nhập ngũ (Mẫu 17A)', description: 'Biểu số 17A/GNN-2025: Danh sách công dân đã nhận lệnh.', icon: Flag },
  { id: 'TEMPLATE_01', title: 'Danh sách công dân nam đủ 17 tuổi (Mẫu 01)', description: 'Biểu số 01/GNN-2025: Danh sách chi tiết 7 cột thông tin.', icon: ListOrdered },
  { id: 'TEMPLATE_01A', title: 'Báo cáo KQ đăng ký 17 tuổi (Mẫu 01A)', description: 'Thống kê kết quả đăng ký cho thanh niên đủ 17 tuổi.', icon: UserCheck2 },
  { id: 'TEMPLATE_06', title: 'Báo cáo 37 cột (Mẫu 06)', description: 'Thống kê chi tiết số lượng, trình độ, diện miễn hoãn.', icon: BarChart3 },
];

const ReportBuilder: React.FC<ReportBuilderProps> = ({ user, recruits, sessionYear }) => {
  const [customTemplates, setCustomTemplates] = useState<ExcelTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(SYSTEM_TEMPLATES[0].id);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchCustom = async () => {
      const data = await api.getTemplates();
      setCustomTemplates(data || []);
    };
    fetchCustom();
  }, []);

  const currentRecruits = recruits.filter(r => r.recruitmentYear === sessionYear);

  const handleExport = async () => {
    if (currentRecruits.length === 0) {
      alert("Không có dữ liệu công dân.");
      return;
    }

    setIsExporting(true);
    try {
      const customTpl = customTemplates.find(t => t.id === selectedTemplateId || t._id === selectedTemplateId);
      
      if (customTpl) {
        // --- XUẤT THEO MẪU TÙY BIẾN (INJECTION) ---
        await TemplateExportService.inject(currentRecruits, customTpl, sessionYear);
      } else {
        // --- XUẤT THEO MẪU HỆ THỐNG CỐ ĐỊNH ---
        const unitName = user.fullName || user.unit.commune || 'CƠ QUAN QUÂN SỰ';
        ExcelExportService.exportToTemplate(currentRecruits, selectedTemplateId, sessionYear, unitName);
      }
      alert("Đã tạo báo cáo thành công!");
    } catch (e) {
      alert("Đã có lỗi xảy ra khi xuất báo cáo.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="bg-military-800 p-4 rounded-2xl text-white shadow-lg"><FileSpreadsheet size={32} /></div>
        <div>
          <h2 className="text-2xl font-black text-military-900 uppercase tracking-tight">Trung tâm kết xuất báo cáo</h2>
          <p className="text-sm text-gray-500 font-medium italic">Sử dụng mẫu hệ thống hoặc mẫu tùy chỉnh đã được chuẩn hóa riêng của địa phương</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* MẪU HỆ THỐNG */}
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">Mẫu biểu hệ thống (Chuẩn 2025)</h3>
            <div className="grid grid-cols-1 gap-3">
              {SYSTEM_TEMPLATES.map((tpl) => (
                <div key={tpl.id} onClick={() => setSelectedTemplateId(tpl.id)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedTemplateId === tpl.id ? 'border-military-600 bg-military-50/50' : 'border-gray-100 bg-white'}`}>
                  <div className={`p-2 rounded-lg ${selectedTemplateId === tpl.id ? 'bg-military-600 text-white' : 'bg-gray-100 text-gray-400'}`}><tpl.icon size={20} /></div>
                  <div className="flex-1"><h4 className="text-xs font-black uppercase text-military-900">{tpl.title}</h4></div>
                  {selectedTemplateId === tpl.id && <CheckCircle2 size={16} className="text-military-600" />}
                </div>
              ))}
            </div>
          </div>

          {/* MẪU TÙY BIẾN */}
          {customTemplates.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">Mẫu biểu tùy chỉnh (Excel Injection)</h3>
              <div className="grid grid-cols-1 gap-3">
                {customTemplates.map((tpl) => (
                  <div key={tpl.id || tpl._id} onClick={() => setSelectedTemplateId((tpl._id || tpl.id)!)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedTemplateId === (tpl._id || tpl.id) ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-white'}`}>
                    <div className={`p-2 rounded-lg ${selectedTemplateId === (tpl._id || tpl.id) ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-400'}`}><Settings2 size={20} /></div>
                    <div className="flex-1"><h4 className="text-xs font-black uppercase text-blue-900">{tpl.name}</h4></div>
                    {selectedTemplateId === (tpl._id || tpl.id) && <CheckCircle2 size={16} className="text-blue-600" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-8">
               <div className="p-4 bg-gray-50 rounded-2xl text-center mb-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Năm hiển thị</p>
                  <p className="text-3xl font-black text-military-800">{sessionYear}</p>
               </div>
               <button 
                  onClick={handleExport} disabled={isExporting}
                  className="w-full py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-3 bg-military-700 text-white hover:bg-military-800 transition-all active:scale-95 disabled:opacity-50"
               >
                  <Download size={20} /> {isExporting ? 'Đang tạo tệp...' : 'Xuất báo cáo ngay'}
               </button>
               <div className="bg-blue-50 p-4 rounded-2xl mt-6 border border-blue-100">
                  <p className="text-[10px] text-blue-800 leading-relaxed font-bold italic">Lưu ý: Nếu dùng mẫu tùy chỉnh, dữ liệu sẽ được điền vào đúng vị trí ô bạn đã cấu hình.</p>
               </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
