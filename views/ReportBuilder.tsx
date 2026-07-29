
import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Download, UserCheck2, CheckCircle2, BarChart3, Settings2 
} from 'lucide-react';
import { Recruit, User, RecruitmentStatus, ExcelTemplate } from '../types';
import { ExcelExportService } from '../services/ExcelExportService';
import { TemplateExportService } from '../services/TemplateExportService';
import { api } from '../api';
import { TABS } from './RecruitManagement/constants';
import { checkAge, isRecruitInTab } from './RecruitManagement/utils';

interface ReportBuilderProps {
  user: User;
  recruits: Recruit[];
  sessionYear: number;
}

const SYSTEM_TEMPLATES = [
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

  const currentYearRecruits = recruits.filter(r => r.recruitmentYear === sessionYear);

  const handleExport = async () => {
    if (currentYearRecruits.length === 0) {
      alert("Không có dữ liệu công dân.");
      return;
    }

    setIsExporting(true);
    try {
      const customTpl = customTemplates.find(t => t.id === selectedTemplateId || t._id === selectedTemplateId);
      
      if (customTpl) {
        // --- XỬ LÝ LỌC DỮ LIỆU NÂNG CAO CHO MẪU TÙY BIẾN ---
        let filteredData = currentYearRecruits;

        // 1. Lọc theo danh sách nguồn
        const sourceTabs = customTpl.sourceTabs || [];
        if (sourceTabs.length > 0) {
           filteredData = filteredData.filter(r => 
             sourceTabs.some(tabId => isRecruitInTab(r, tabId, sessionYear))
           );
        }

        // 2. Lọc theo tuổi 17 (Cố định năm)
        if (customTpl.onlyAge17) {
           const targetBirthYear = (sessionYear - 1) - 17;
           filteredData = filteredData.filter(r => parseInt(r.dob?.split('-')[0] || '0') === targetBirthYear);
        }

        // 3. Lọc theo danh sách độ tuổi cụ thể (18-27)
        if (customTpl.filterAges && customTpl.filterAges.length > 0) {
           filteredData = filteredData.filter(r => customTpl.filterAges!.includes(checkAge(r, sessionYear)));
        }

        // 4. Lọc theo dân tộc
        if (customTpl.filterEthnicities && customTpl.filterEthnicities.length > 0) {
           filteredData = filteredData.filter(r => customTpl.filterEthnicities!.includes(r.details.ethnicity));
        }

        // 5. Lọc theo tôn giáo
        if (customTpl.filterReligions && customTpl.filterReligions.length > 0) {
           filteredData = filteredData.filter(r => customTpl.filterReligions!.includes(r.details.religion));
        }

        // 6. Lọc theo loại sức khỏe
        if (customTpl.filterHealthGrades && customTpl.filterHealthGrades.length > 0) {
           filteredData = filteredData.filter(r => r.physical.healthGrade && customTpl.filterHealthGrades!.includes(r.physical.healthGrade));
        }

        if (filteredData.length === 0) {
            alert("Không tìm thấy công dân nào khớp với các bộ lọc của mẫu biểu này.");
            setIsExporting(false);
            return;
        }

        await TemplateExportService.inject(filteredData, customTpl, sessionYear);
      } else {
        const unitName = user.fullName || user.unit.commune || 'CƠ QUAN QUÂN SỰ';
        ExcelExportService.exportToTemplate(currentYearRecruits, selectedTemplateId, sessionYear, unitName);
      }
      alert("Đã tạo báo cáo thành công!");
    } catch (e) {
      console.error(e);
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
          <p className="text-sm text-gray-500 font-medium italic">Sử dụng mẫu hệ thống hoặc mẫu tùy chỉnh đã được cấu hình bộ lọc thông minh</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">Mẫu biểu hệ thống (Chuẩn 2025)</h3>
            <div className="grid grid-cols-1 gap-3">
              {SYSTEM_TEMPLATES.map((tpl) => (
                <div key={tpl.id} onClick={() => setSelectedTemplateId(tpl.id)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedTemplateId === tpl.id ? 'border-military-600 bg-military-50/50' : 'border-gray-100 bg-white shadow-sm'}`}>
                  <div className={`p-2 rounded-lg ${selectedTemplateId === tpl.id ? 'bg-military-600 text-white' : 'bg-gray-100 text-gray-400'}`}><tpl.icon size={20} /></div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black uppercase text-military-900">{tpl.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-1">{tpl.description}</p>
                  </div>
                  {selectedTemplateId === tpl.id && <CheckCircle2 size={16} className="text-military-600" />}
                </div>
              ))}
            </div>
          </div>

          {customTemplates.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">Mẫu biểu tùy chỉnh (Bộ lọc thông minh)</h3>
              <div className="grid grid-cols-1 gap-3">
                {customTemplates.map((tpl) => {
                  const hasFilters = (tpl.filterAges?.length || 0) + (tpl.filterEthnicities?.length || 0) + (tpl.filterReligions?.length || 0) + (tpl.filterHealthGrades?.length || 0) > 0;
                  return (
                    <div key={tpl.id || tpl._id} onClick={() => setSelectedTemplateId((tpl._id || tpl.id)!)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedTemplateId === (tpl._id || tpl.id) ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-white shadow-sm'}`}>
                      <div className={`p-2 rounded-lg ${selectedTemplateId === (tpl._id || tpl.id) ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-400'}`}><Settings2 size={20} /></div>
                      <div className="flex-1">
                        <h4 className="text-xs font-black uppercase text-blue-900">{tpl.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                           {tpl.sourceTabs?.length ? <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase">{tpl.sourceTabs.length} Nguồn</span> : null}
                           {hasFilters && <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black uppercase">Đang áp dụng bộ lọc chi tiết</span>}
                        </div>
                      </div>
                      {selectedTemplateId === (tpl._id || tpl.id) && <CheckCircle2 size={16} className="text-blue-600" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-8">
               <div className="p-4 bg-gray-50 rounded-2xl text-center mb-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Năm tuyển quân</p>
                  <p className="text-3xl font-black text-military-800">{sessionYear}</p>
               </div>
               <button onClick={handleExport} disabled={isExporting} className="w-full py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-3 bg-military-700 text-white hover:bg-military-800 transition-all active:scale-95 disabled:opacity-50">
                  <Download size={20} /> {isExporting ? 'Đang chuẩn bị dữ liệu...' : 'Kết xuất báo cáo ngay'}
               </button>
               <div className="bg-blue-50 p-4 rounded-2xl mt-6 border border-blue-100">
                  <p className="text-[10px] text-blue-800 leading-relaxed font-bold italic">Dữ liệu sẽ được tự động lọc theo các điều kiện gán trong từng mẫu biểu trước khi xuất file.</p>
               </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
