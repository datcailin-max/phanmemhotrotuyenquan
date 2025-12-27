
import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Plus, Trash2, Edit3, UploadCloud, Info, 
  Settings2, CheckCircle2, X, AlertTriangle, List, Sparkles, Loader2,
  Check, XCircle
} from 'lucide-react';
import { ExcelTemplate, User } from '../types';
import { api } from '../api';
import { FIELD_MAPPINGS } from '../services/TemplateExportService';
import ExcelJS from 'exceljs';
import { removeVietnameseTones } from '../constants';

interface TemplateManagementProps {
  user: User;
}

const MAPPING_KEYWORDS: Record<string, string[]> = {
  'STT': ['stt', 'so tt', 'so thu tu', 'thu tu'],
  'FULL_NAME': ['ho ten', 'ho va ten', 'ten khai sinh', 'chu dem', 'ho va chu dem'],
  'DOB': ['ngay sinh', 'ngay thang nam sinh', 'nam sinh', 'ngay thang nam'],
  'AGE': ['tuoi', 'tuoi doi'],
  'CITIZEN_ID': ['cccd', 'dinh danh', 'can cuoc', 'chung minh', 'so dinh danh', 'ma dinh danh'],
  'VILLAGE': ['thon', 'ap', 'to dan pho', 'khom', 'doi', 'khu pho', 'dia chi', 'cu tru'],
  'COMMUNE': ['xa', 'phuong', 'thi tran'],
  'PROVINCE': ['tinh', 'thanh pho'],
  'EDUCATION': ['van hoa', 'hoc van', 'trinh do', 'cmkt', 'chuyen mon', 'ky thuat'],
  'POLITICAL': ['dang', 'doan', 'chinh tri', 'dang vien', 'doan vien'],
  'HEALTH': ['suc khoe', 'loai sk', 'phan loai', 'suc khoe loai'],
  'JOB': ['nghe nghiep', 'cong viec', 'noi lam viec', 'co quan', 'lam gi'],
  'FAMILY_INFO': ['cha', 'me', 'gia dinh', 'vo con', 'ho ten cha', 'ho ten me'],
  'ENLISTMENT_UNIT': ['don vi', 'giao quan', 'nhan quan', 'don vi nhan', 'noi den'],
  'REASON': ['ly do', 'dien', 'tam hoan', 'mien', 'ghi chu', 'tinh trang']
};

const TemplateManagement: React.FC<TemplateManagementProps> = ({ user }) => {
  const [templates, setTemplates] = useState<ExcelTemplate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<ExcelTemplate> | null>(null);

  const fetchTemplates = async () => {
    const data = await api.getTemplates();
    setTemplates(data || []);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleOpenAdd = () => {
    setEditingTemplate({
      name: '',
      description: '',
      startRow: 10,
      mapping: {}
    });
    setShowModal(true);
  };

  const analyzeExcelHeaders = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) return;

      let bestHeaderRow = 1;
      let maxMatches = 0;
      let finalMapping: Record<string, string[]> = {};

      for (let i = 1; i <= 20; i++) {
        const row = worksheet.getRow(i);
        let currentMatches = 0;
        const tempMapping: Record<string, string[]> = {};

        for (let j = 1; j <= 30; j++) {
          const cell = row.getCell(j);
          const cellValue = cell.value ? removeVietnameseTones(cell.value.toString().toLowerCase()).trim() : "";
          
          if (!cellValue) continue;

          for (const [fieldKey, keywords] of Object.entries(MAPPING_KEYWORDS)) {
            if (keywords.some(k => cellValue.includes(k))) {
              if (!tempMapping[j.toString()]) tempMapping[j.toString()] = [];
              tempMapping[j.toString()].push(fieldKey);
              currentMatches++;
              // Lưu ý: Tạm thời chỉ tự động nhận diện 1 field mỗi cột khi quét tiêu đề để tránh nhiễu
              break;
            }
          }
        }

        if (currentMatches > maxMatches) {
          maxMatches = currentMatches;
          bestHeaderRow = i;
          finalMapping = { ...tempMapping };
        }
      }

      if (maxMatches > 0) {
        setEditingTemplate(prev => ({
          ...prev,
          startRow: bestHeaderRow + 1,
          mapping: finalMapping
        }));
      }
    } catch (error) {
      console.error("Lỗi phân tích file:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditingTemplate(prev => ({ ...prev, fileData: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
      analyzeExcelHeaders(file);
    }
  };

  // Logic cập nhật mảng mapping cho một cột
  const toggleFieldInMapping = (colIndex: number, fieldKey: string) => {
    setEditingTemplate(prev => {
      const currentMapping = { ...(prev?.mapping || {}) };
      let colFields = Array.isArray(currentMapping[colIndex.toString()]) 
        ? [...(currentMapping[colIndex.toString()] as string[])]
        : currentMapping[colIndex.toString()] 
          ? [currentMapping[colIndex.toString()] as string]
          : [];

      if (colFields.includes(fieldKey)) {
        colFields = colFields.filter(k => k !== fieldKey);
      } else {
        colFields.push(fieldKey);
      }

      if (colFields.length === 0) {
        delete currentMapping[colIndex.toString()];
      } else {
        currentMapping[colIndex.toString()] = colFields;
      }

      return { ...prev, mapping: currentMapping };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate?.fileData) {
      alert("Vui lòng tải lên file mẫu Excel (.xlsx)");
      return;
    }

    setIsProcessing(true);
    try {
      const tplId = editingTemplate._id || editingTemplate.id;
      if (tplId) {
        await api.updateTemplate(tplId, editingTemplate);
      } else {
        await api.createTemplate(editingTemplate);
      }
      setShowModal(false);
      fetchTemplates();
      alert("Đã lưu mẫu biểu thành công.");
    } catch (err) {
      alert("Lỗi khi lưu mẫu biểu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Xóa mẫu biểu này?")) {
      await api.deleteTemplate(id);
      fetchTemplates();
    }
  };

  const getLabelForKey = (key: string) => FIELD_MAPPINGS.find(m => m.key === key)?.label || key;

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-700">
            <FileSpreadsheet size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-military-900 uppercase tracking-tight">Quản lý mẫu biểu chuẩn (Excel Injection)</h2>
            <p className="text-sm text-gray-500 font-medium italic">Có thể ghép nhiều loại thông tin vào cùng một cột Excel</p>
          </div>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-military-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-military-800 transition-all active:scale-95"
        >
          <Plus size={18} /> Thêm mẫu mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
             <FileSpreadsheet size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-400 font-bold">Chưa có mẫu biểu tùy biến nào được thiết lập.</p>
          </div>
        ) : templates.map(tpl => (
          <div key={tpl.id || tpl._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-50 rounded-lg text-green-600"><FileSpreadsheet size={20}/></div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingTemplate(tpl); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-military-600 transition-colors"><Edit3 size={16}/></button>
                <button onClick={() => handleDelete((tpl._id || tpl.id)!)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
            <h4 className="text-sm font-black text-military-900 uppercase mb-1">{tpl.name}</h4>
            <p className="text-xs text-gray-500 italic mb-4 line-clamp-2">{tpl.description}</p>
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400">
                <span>Dòng bắt đầu:</span>
                <span className="text-military-700">Dòng {tpl.startRow}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400">
                <span>Số cột đã cấu hình:</span>
                <span className="text-blue-600 font-black">{Object.keys(tpl.mapping || {}).length} cột</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="bg-military-800 p-5 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg"><Settings2 size={20}/></div>
                <h3 className="font-black uppercase text-sm tracking-widest text-white">Thiết lập thông số mẫu Excel</h3>
              </div>
              <button onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-5">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Info size={14} className="text-blue-500"/> Thông tin cơ bản
                   </h4>
                   <div>
                     <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Tên mẫu biểu (Gợi nhớ)</label>
                     <input 
                      required type="text" className="w-full border p-2.5 rounded-xl font-bold text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-military-50"
                      value={editingTemplate?.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      placeholder="VD: Danh sách đủ 17 tuổi (Cột gộp)"
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Mô tả chi tiết</label>
                     <textarea 
                      rows={2} className="w-full border p-2.5 rounded-xl text-xs font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-military-50"
                      value={editingTemplate?.description} onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})}
                      placeholder="Ghi chú về mẫu biểu này..."
                     />
                   </div>
                   <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 relative overflow-hidden">
                     {isAnalyzing && (
                       <div className="absolute inset-0 bg-amber-50/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
                          <Loader2 size={24} className="text-amber-600 animate-spin" />
                          <span className="text-[9px] font-black text-amber-800 uppercase animate-pulse">Đang phân tích tiêu đề...</span>
                       </div>
                     )}
                     <label className="block text-[10px] font-black text-amber-700 uppercase mb-2">1. Tải lên file Excel khung (.xlsx)</label>
                     <input type="file" accept=".xlsx" onChange={handleFileUpload} className="w-full text-[10px] p-2 bg-white border border-dashed rounded-lg border-amber-300" />
                     {editingTemplate?.fileData && (
                       <p className="mt-2 text-[9px] text-green-600 font-black uppercase flex items-center gap-1">
                         <CheckCircle2 size={12}/> Đã nhận file mẫu gốc
                       </p>
                     )}
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 flex items-center gap-1">
                        Dòng bắt đầu điền dữ liệu <AlertTriangle size={12} className="text-amber-500"/>
                     </label>
                     <input 
                      type="number" className="w-24 border p-2.5 rounded-xl font-black text-center text-military-800 bg-military-50 outline-none focus:ring-2 focus:ring-military-400"
                      value={editingTemplate?.startRow} onChange={e => setEditingTemplate({...editingTemplate, startRow: parseInt(e.target.value) || 0})}
                     />
                     <p className="text-[9px] text-gray-400 mt-2 italic">* Hệ thống sẽ điền dữ liệu từ dòng này trở xuống.</p>
                   </div>
                </div>

                <div className="lg:col-span-8 space-y-5">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Sparkles size={14} className="text-amber-500"/> Thiết lập cột đa tầng (Multi-mapping)
                   </h4>
                   <p className="text-[9px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-dashed leading-relaxed">
                     Chọn một hoặc nhiều trường thông tin cho mỗi cột. Phần mềm sẽ tự động nối các dòng bằng dấu xuống dòng trong cùng 1 ô Excel.
                   </p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(colIdx => {
                        const mappingValue = editingTemplate?.mapping?.[colIdx.toString()];
                        const colFields = Array.isArray(mappingValue) ? mappingValue : (mappingValue ? [mappingValue as string] : []);
                        const isMapped = colFields.length > 0;

                        return (
                          <div key={colIdx} className={`p-4 rounded-2xl border transition-all ${isMapped ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-100 shadow-sm'}`}>
                             <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${isMapped ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-white'}`}>
                                   {String.fromCharCode(64 + colIdx)}
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase">Cột thứ {colIdx}</span>
                             </div>
                             
                             <div className="flex flex-wrap gap-1.5 mb-3 min-h-[40px]">
                                {isMapped ? colFields.map(fieldKey => (
                                  <div key={fieldKey} className="flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-lg shadow-sm">
                                    <span className="text-[8px] font-black text-blue-700 uppercase">{getLabelForKey(fieldKey)}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => toggleFieldInMapping(colIdx, fieldKey)}
                                      className="text-blue-300 hover:text-red-500 transition-colors"
                                    >
                                      <XCircle size={12}/>
                                    </button>
                                  </div>
                                )) : (
                                  <span className="text-[9px] text-gray-300 italic font-bold">Chưa chọn thông tin nào cho cột này</span>
                                )}
                             </div>

                             <div className="relative group">
                                <select 
                                  className="w-full text-[10px] font-black border border-gray-200 rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer uppercase"
                                  value=""
                                  onChange={e => { if(e.target.value) toggleFieldInMapping(colIdx, e.target.value); }}
                                >
                                   <option value="">+ Thêm trường thông tin...</option>
                                   {FIELD_MAPPINGS.map(m => (
                                     <option 
                                      key={m.key} 
                                      value={m.key}
                                      disabled={colFields.includes(m.key)}
                                      className={colFields.includes(m.key) ? 'text-gray-300' : 'text-gray-700'}
                                     >
                                      {m.label}
                                     </option>
                                   ))}
                                </select>
                                <Plus size={14} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-xs font-black text-gray-500 uppercase">Hủy bỏ</button>
                <button 
                  type="submit" disabled={isProcessing}
                  className="px-10 py-2.5 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-military-800 transition-all active:scale-95"
                >
                  {isProcessing ? 'Đang lưu...' : 'Xác nhận lưu mẫu biểu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;
