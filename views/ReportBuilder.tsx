
import React, { useState } from 'react';
import { FileSpreadsheet, Download, Filter, FileText, CheckCircle2, ChevronRight, AlertCircle, Info, BarChart3, UserCheck2, ListOrdered, Flag } from 'lucide-react';
import { Recruit, User, RecruitmentStatus } from '../types';
import { ExcelExportService } from '../services/ExcelExportService';

interface ReportBuilderProps {
  user: User;
  recruits: Recruit[];
  sessionYear: number;
}

const REPORT_TEMPLATES = [
  { 
    id: 'TEMPLATE_17A', 
    title: 'Danh sách gọi công dân nhập ngũ (Mẫu 17A)', 
    description: 'Biểu số 17A/GNN-2025: Danh sách chi tiết công dân đã nhận lệnh và sẵn sàng nhập ngũ (Lấy từ Danh sách 11).',
    type: 'EXCEL',
    icon: Flag,
    statusRequired: [RecruitmentStatus.ENLISTED]
  },
  { 
    id: 'TEMPLATE_01', 
    title: 'Danh sách công dân nam đủ 17 tuổi trong năm (Mẫu 01)', 
    description: 'Biểu số 01/GNN-2025: Danh sách chi tiết 7 cột thông tin về thanh niên đủ 17 tuổi (Dùng cho đăng ký lần đầu).',
    type: 'EXCEL',
    icon: ListOrdered,
    statusRequired: null 
  },
  { 
    id: 'TEMPLATE_01A', 
    title: 'Báo cáo KQ đăng ký NVQS cho nam công dân đủ 17 tuổi (Mẫu 01A)', 
    description: 'Biểu số 01A/GNN-2025: Thống kê chi tiết kết quả đăng ký cho thanh niên đủ 17 tuổi trong năm.',
    type: 'EXCEL',
    icon: UserCheck2,
    statusRequired: null 
  },
  { 
    id: 'TEMPLATE_06', 
    title: 'Báo cáo số lượng công dân trong độ tuổi gọi nhập ngũ (Mẫu 06)', 
    description: 'Biểu số 06/GNN-2025: Thống kê chi tiết 37 cột về số lượng, trình độ, độ tuổi và diện miễn hoãn.',
    type: 'EXCEL',
    icon: BarChart3,
    statusRequired: null 
  },
  { 
    id: 'TEMPLATE_EXEMPTED', 
    title: 'Danh sách công dân miễn gọi nhập ngũ (Mẫu 16A)', 
    description: 'Biểu số 16A/GNN-2025: Thống kê chi tiết các công dân thuộc diện miễn gọi nhập ngũ theo Luật.',
    type: 'EXCEL',
    icon: FileText,
    statusRequired: [RecruitmentStatus.EXEMPTED]
  },
  { 
    id: 'TEMPLATE_DEFERRED', 
    title: 'Danh sách công dân tạm hoãn NVQS (Mẫu 16B)', 
    description: 'Biểu số 16B/GNN-2025: Thống kê chi tiết các công dân thuộc diện tạm hoãn nhập ngũ.',
    type: 'EXCEL',
    icon: FileText,
    statusRequired: [RecruitmentStatus.DEFERRED]
  },
  { 
    id: 'TEMPLATE_PRE_CHECK', 
    title: 'Danh sách công dân đủ ĐK gọi sơ tuyển (Mẫu 16C)', 
    description: 'Biểu số 16C/GNN-2025: Danh sách công dân đủ tiêu chuẩn gọi sơ tuyển Nghĩa vụ quân sự và Công an.',
    type: 'EXCEL',
    icon: FileText,
    statusRequired: null 
  }
];

const ReportBuilder: React.FC<ReportBuilderProps> = ({ user, recruits, sessionYear }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(REPORT_TEMPLATES[0].id);
  const [isExporting, setIsExporting] = useState(false);

  // Lọc dữ liệu theo năm làm việc
  const currentRecruits = recruits.filter(r => r.recruitmentYear === sessionYear);

  const handleExport = async () => {
    if (currentRecruits.length === 0) {
      alert("Không có dữ liệu công dân trong năm " + sessionYear + " để xuất báo cáo.");
      return;
    }

    setIsExporting(true);
    try {
      const template = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);
      const unitName = user.fullName || user.unit.commune || 'CƠ QUAN QUÂN SỰ';
      
      let dataToExport = currentRecruits;

      // Logic lọc dữ liệu phù hợp với loại danh sách
      if (selectedTemplate === 'TEMPLATE_01' || selectedTemplate === 'TEMPLATE_01A') {
          // Năm sinh 17 tuổi tính theo năm thực hiện (sessionYear - 1)
          const targetBirthYear = (sessionYear - 1) - 17;
          dataToExport = currentRecruits.filter(r => {
              const birthYear = parseInt(r.dob.split('-')[0] || '0');
              return birthYear === targetBirthYear && r.status !== RecruitmentStatus.DELETED;
          });
      } else if (selectedTemplate === 'TEMPLATE_PRE_CHECK') {
          dataToExport = currentRecruits.filter(r => {
              const birthYear = parseInt(r.dob.split('-')[0] || '0');
              const age = (sessionYear - 1) - birthYear;
              if (age < 18) return false;
              
              const excludedStatuses = [
                  RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
                  RecruitmentStatus.EXEMPT_REGISTRATION, 
                  RecruitmentStatus.FIRST_TIME_REGISTRATION,
                  RecruitmentStatus.NOT_SELECTED_TT50,
                  RecruitmentStatus.KTC_KHONG_TUYEN_CHON,
                  RecruitmentStatus.KTC_CHUA_GOI_NHAP_NGU,
                  RecruitmentStatus.DEFERRED,
                  RecruitmentStatus.EXEMPTED,
                  RecruitmentStatus.REMOVED_FROM_SOURCE,
                  RecruitmentStatus.DELETED
              ];
              return !excludedStatuses.includes(r.status);
          });
      } else if (selectedTemplate === 'TEMPLATE_06') {
          dataToExport = currentRecruits.filter(r => {
              const birthYear = parseInt(r.dob.split('-')[0] || '0');
              const age = (sessionYear - 1) - birthYear;
              return age >= 17 && age <= 27 && r.status !== RecruitmentStatus.DELETED;
          });
      } else if (template?.statusRequired) {
          dataToExport = currentRecruits.filter(r => template.statusRequired!.includes(r.status));
      }

      if (dataToExport.length === 0) {
        alert("Danh sách này hiện đang trống, không có dữ liệu để xuất file.");
        setIsExporting(false);
        return;
      }

      ExcelExportService.exportToTemplate(dataToExport, selectedTemplate, sessionYear, unitName);
      
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
        <div className="bg-military-800 p-4 rounded-2xl text-white shadow-lg">
          <FileSpreadsheet size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-military-900 uppercase tracking-tight">Hệ thống lập báo cáo chuyên nghiệp</h2>
          <p className="text-sm text-gray-500 font-medium">Tự động kết xuất dữ liệu sang các biểu mẫu chuẩn 2025 của ngành quân sự</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-500" /> Bước 1: Chọn biểu mẫu báo cáo cần thực hiện
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {REPORT_TEMPLATES.map((tpl) => (
              <div 
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer group relative overflow-hidden ${
                  selectedTemplate === tpl.id 
                    ? 'border-military-600 bg-military-50/50 shadow-md' 
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`p-3 rounded-xl transition-colors ${
                    selectedTemplate === tpl.id ? 'bg-military-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                  }`}>
                    <tpl.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-black uppercase tracking-tight ${selectedTemplate === tpl.id ? 'text-military-900' : 'text-gray-700'}`}>
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed italic">
                      {tpl.description}
                    </p>
                  </div>
                  <div className={`shrink-0 transition-all ${selectedTemplate === tpl.id ? 'text-military-600 translate-x-0 opacity-100' : 'opacity-0 -translate-x-2'}`}>
                    <ChevronRight size={20} />
                  </div>
                </div>
                {selectedTemplate === tpl.id && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-military-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Filter size={14} className="text-blue-500" /> Bước 2: Thiết lập & Xuất file
          </h3>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-8">
            <div className="space-y-6">
               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Năm tuyển quân hiển thị</p>
                  <p className="text-3xl font-black text-military-800">{sessionYear}</p>
                  <p className="text-[10px] font-bold text-military-600 mt-1 uppercase italic">(Năm thực hiện: {sessionYear - 1})</p>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                     <span>Hồ sơ khả dụng:</span>
                     <span className="text-military-700">{currentRecruits.length} hồ sơ</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-military-500 w-full animate-pulse"></div>
                  </div>
               </div>

               <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-800 leading-relaxed font-bold italic">
                    {selectedTemplate === 'TEMPLATE_01' || selectedTemplate === 'TEMPLATE_01A'
                      ? `Hệ thống tự động lọc thanh niên sinh năm ${(sessionYear - 1) - 17} (tức tròn 17 tuổi vào năm thực hiện ${sessionYear - 1}).`
                      : `Hệ thống tính toán tuổi dựa trên mốc năm thực hiện (${sessionYear - 1}).`}
                  </p>
               </div>

               <button 
                  onClick={handleExport}
                  disabled={isExporting || currentRecruits.length === 0}
                  className={`w-full py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
                    isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-military-700 text-white hover:bg-military-800'
                  }`}
               >
                  <Download size={20} />
                  {isExporting ? 'Đang khởi tạo file...' : 'Tạo danh sách / báo cáo'}
               </button>

               <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase justify-center mt-4">
                  <AlertCircle size={12} /> Dữ liệu được bảo mật theo phiên làm việc
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
