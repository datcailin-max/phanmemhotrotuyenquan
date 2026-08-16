import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Download, CheckCircle2, Settings2, Sliders
} from 'lucide-react';
import { Recruit, User, ExcelTemplate, RecruitmentStatus } from '../types';
import { ExcelExportService } from '../services/ExcelExportService';
import { TemplateExportService } from '../services/TemplateExportService';
import { api } from '../api';
import { DEFAULT_CATALOG } from '../constants';
import { checkAge, isRecruitInTab } from './RecruitManagement/utils';

interface ReportBuilderProps {
  user: User;
  recruits: Recruit[];
  sessionYear: number;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({ user, recruits, sessionYear }) => {
  const [customTemplates, setCustomTemplates] = useState<ExcelTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('CAT_1');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchCustom = async () => {
      const data = await api.getTemplates();
      setCustomTemplates(data || []);
    };
    fetchCustom();
  }, []);

  // Tổng hợp danh sách biểu mẫu từ Danh mục chuẩn và Mẫu tùy biến
  const displayTemplates = DEFAULT_CATALOG.map(catItem => {
    const custom = customTemplates.find(t => 
      t.name === catItem.name || 
      (t.sourceTabs && catItem.sources && t.sourceTabs.join(',') === catItem.sources.join(','))
    );
    if (custom) return custom;
    return {
      id: catItem.id,
      name: catItem.name,
      description: `Mẫu biểu chuẩn cho ${catItem.name}`,
      startRow: 10,
      mapping: {},
      sourceTabs: catItem.sources,
      onlyAge17: catItem.only17 || false,
      fileData: ''
    } as ExcelTemplate;
  });

  // Bổ sung các mẫu tùy biến ngoài danh mục chuẩn nếu có
  customTemplates.forEach(ct => {
    const exists = displayTemplates.some(dt => (dt.id || dt._id) === (ct.id || ct._id) || dt.name === ct.name);
    if (!exists) {
      displayTemplates.push(ct);
    }
  });

  const handleExport = async () => {
    if (recruits.length === 0) {
      alert("Không có dữ liệu công dân.");
      return;
    }

    setIsExporting(true);
    try {
      const matchedTpl = displayTemplates.find(t => (t.id || t._id) === selectedTemplateId);
      const unitName = user.fullName || user.unit?.commune || 'CƠ QUAN QUÂN SỰ';

      if (matchedTpl) {
        // 1. Lọc theo danh sách nguồn được gán cho mẫu biểu và loại bỏ công dân đã xóa/đưa ra khỏi nguồn
        let filteredData = recruits;
        const sourceTabs = matchedTpl.sourceTabs || [];
        
        const isDeletedTab = sourceTabs.includes('DELETED_LIST') || matchedTpl.id === 'DELETED_LIST';
        const isRemovedTab = sourceTabs.some(s => s.startsWith('REMOVED')) || matchedTpl.id?.startsWith('REMOVED');

        if (!isDeletedTab && !isRemovedTab) {
          filteredData = filteredData.filter(r => r.status !== RecruitmentStatus.DELETED && r.status !== RecruitmentStatus.REMOVED_FROM_SOURCE);
        }

        if (sourceTabs.length > 0) {
           filteredData = filteredData.filter(r => 
             sourceTabs.some(tabId => isRecruitInTab(r, tabId, sessionYear))
           );
        }

        // 2. Lọc theo tuổi 17 (nếu được đánh dấu)
        if (matchedTpl.onlyAge17) {
           const targetBirthYear = sessionYear - 17;
           filteredData = filteredData.filter(r => parseInt(r.dob?.split('-')[0] || '0') === targetBirthYear);
        }

        // 3. Lọc theo danh sách độ tuổi cụ thể (18-27)
        if (matchedTpl.filterAges && matchedTpl.filterAges.length > 0) {
           filteredData = filteredData.filter(r => matchedTpl.filterAges!.includes(checkAge(r, sessionYear)));
        }

        // 4. Lọc theo dân tộc
        if (matchedTpl.filterEthnicities && matchedTpl.filterEthnicities.length > 0) {
           filteredData = filteredData.filter(r => matchedTpl.filterEthnicities!.includes(r.details.ethnicity));
        }

        // 5. Lọc theo tôn giáo
        if (matchedTpl.filterReligions && matchedTpl.filterReligions.length > 0) {
           filteredData = filteredData.filter(r => matchedTpl.filterReligions!.includes(r.details.religion));
        }

        // 6. Lọc theo loại sức khỏe
        if (matchedTpl.filterHealthGrades && matchedTpl.filterHealthGrades.length > 0) {
           filteredData = filteredData.filter(r => r.physical.healthGrade && matchedTpl.filterHealthGrades!.includes(r.physical.healthGrade));
        }

        if (filteredData.length === 0) {
            alert(`Không tìm thấy công dân nào thuộc danh sách "${matchedTpl.name}".`);
            setIsExporting(false);
            return;
        }

        const hasValidCustomFile = matchedTpl.fileData && 
          matchedTpl.fileData.length > 500 && 
          Object.keys(matchedTpl.mapping || {}).length > 0;

        if (hasValidCustomFile) {
          await TemplateExportService.inject(filteredData, matchedTpl, sessionYear);
        } else {
          const primaryTab = sourceTabs[0] || 'ALL';
          await ExcelExportService.exportToTemplate(filteredData, primaryTab, sessionYear, unitName, matchedTpl.name);
        }
      } else {
        await ExcelExportService.exportToTemplate(recruits, selectedTemplateId, sessionYear, unitName);
      }
      alert("Đã kết xuất báo cáo thành công!");
    } catch (e) {
      console.error(e);
      alert("Đã có lỗi xảy ra khi kết xuất báo cáo.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="bg-military-800 p-4 rounded-2xl text-white shadow-lg"><FileSpreadsheet size={32} /></div>
        <div>
          <h2 className="text-2xl font-black text-military-900 uppercase tracking-tight">Thiết lập biểu mẫu báo cáo</h2>
          <p className="text-sm text-gray-500 font-medium italic">Xuất báo cáo theo danh mục biểu mẫu chuẩn hoặc mẫu tự tạo đã tải lên hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sliders size={16} /> Danh sách biểu mẫu báo cáo ({displayTemplates.length} mẫu)
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {displayTemplates.map((tpl) => {
              const itemKey = (tpl.id || tpl._id)!;
              const isSelected = selectedTemplateId === itemKey;
              const sourcesCount = tpl.sourceTabs?.length || 1;
              const hasCustomFile = tpl.fileData && tpl.fileData.length > 500;

              return (
                <div 
                  key={itemKey} 
                  onClick={() => setSelectedTemplateId(itemKey)} 
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${isSelected ? 'border-military-600 bg-military-50/60 shadow-md' : 'border-gray-100 bg-white shadow-sm hover:border-gray-200'}`}
                >
                  <div className={`p-3 rounded-xl ${isSelected ? 'bg-military-800 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Sliders size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black uppercase text-military-900 truncate">{tpl.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-black uppercase">
                        {sourcesCount} Nguồn
                      </span>
                      {hasCustomFile ? (
                        <span className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-black uppercase">
                          Đã có File Mẫu Excel
                        </span>
                      ) : (
                        <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">
                          Mẫu hệ thống
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={20} className="text-military-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-8 text-center">
             <div className="p-4 bg-gray-50 rounded-2xl mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Năm tuyển quân</p>
                <p className="text-4xl font-black text-military-800">{sessionYear}</p>
             </div>

             <button 
                onClick={handleExport} 
                disabled={isExporting} 
                className="w-full py-4 bg-military-800 text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-3 hover:bg-military-900 transition-all active:scale-95 disabled:opacity-50"
             >
                <Download size={20} /> {isExporting ? 'Đang chuẩn bị dữ liệu...' : 'Kết xuất báo cáo ngay'}
             </button>

             <div className="bg-blue-50 p-4 rounded-2xl mt-6 border border-blue-100 text-left">
                <p className="text-[11px] text-blue-900 leading-relaxed font-semibold italic">
                  Dữ liệu sẽ được tự động lọc theo các điều kiện gán trong từng mẫu biểu trước khi xuất file.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
