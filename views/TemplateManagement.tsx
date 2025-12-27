
import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Plus, Trash2, Edit3, UploadCloud, Info, 
  Settings2, CheckCircle2, X, AlertTriangle, List, Sparkles, Loader2
} from 'lucide-react';
import { ExcelTemplate, User } from '../types';
import { api } from '../api';
import { FIELD_MAPPINGS } from '../services/TemplateExportService';
import ExcelJS from 'exceljs';
import { removeVietnameseTones } from '../constants';

interface TemplateManagementProps {
  user: User;
}

// Bộ từ khóa để nhận diện cột tự động
const MAPPING_KEYWORDS: Record<string, string[]> = {
  'STT': ['stt', 'so tt', 'so thu tu'],
  'FULL_NAME': ['ho ten', 'ho va ten', 'ten khai sinh', 'chu dem'],
  'DOB': ['ngay sinh', 'ngay thang nam sinh', 'nam sinh'],
  'AGE': ['tuoi', 'tuoi doi'],
  'CITIZEN_ID': ['cccd', 'dinh danh', 'can cuoc', 'chung minh'],
  'VILLAGE': ['thon', 'ap', 'to dan pho', 'khom', 'doi'],
  'COMMUNE': ['xa', 'phuong', 'thi tran'],
  'PROVINCE': ['tinh', 'thanh pho'],
  'EDUCATION': ['van hoa', 'hoc van', 'trinh do', 'cmkt'],
  'POLITICAL': ['dang', 'doan', 'chinh tri'],
  'HEALTH': ['suc khoe', 'loai sk', 'phan loai'],
  'JOB': ['nghe nghiep', 'cong viec', 'noi lam viec'],
  'FAMILY_INFO': ['cha', 'me', 'gia dinh', 'vo con'],
  'ENLISTMENT_UNIT': ['don vi', 'giao quan', 'nhan quan'],
  'REASON': ['ly do', 'dien', 'tam hoan', 'mien']
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
      const detectedMapping: Record<string, string> = {};

      // Quét 15 dòng đầu tiên để tìm dòng tiêu đề tốt nhất
      for (let i = 1; i <= 15; i++) {
        const row = worksheet.getRow(i);
        let currentMatches = 0;
        const tempMapping: Record<string, string> = {};

        row.eachCell((cell, colNumber) => {
          const cellValue = removeVietnameseTones(cell.text.toLowerCase());
          
          for (const [fieldKey, keywords] of Object.entries(MAPPING_KEYWORDS)) {
            if (keywords.some(k => cellValue.includes(k))) {
              tempMapping[colNumber.toString()] = fieldKey;
              currentMatches++;
              break;
            }
          }
        });

        if (currentMatches > maxMatches) {
          maxMatches = currentMatches;
          bestHeaderRow = i;
          Object.assign(detectedMapping, tempMapping);
        }
      }

      if (maxMatches > 0) {
        setEditingTemplate(prev => ({
          ...prev,
          startRow: bestHeaderRow + 1,
          mapping: detectedMapping
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
      
      // Bắt đầu phân tích tiêu đề cột
      analyzeExcelHeaders(file);
    }
  };

  const updateMapping = (colIndex: number, fieldKey: string) => {
    setEditingTemplate(prev => {
      const newMapping = { ...(prev?.mapping || {}) };
      if (!fieldKey) {
        delete newMapping[colIndex.toString()];
      } else {
        newMapping[colIndex.toString()] = fieldKey;
      }
      return { ...prev, mapping: newMapping };
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
      if (editingTemplate._id || editingTemplate.id) {
        await api.updateTemplate((editingTemplate._id || editingTemplate.id)!, editingTemplate);
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

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-700">
            <FileSpreadsheet size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-military-900 uppercase tracking-tight">Quản lý mẫu biểu chuẩn (Excel Injection)</h2>
            <p className="text-sm text-gray-500 font-medium italic">Cho phép "bơm" dữ liệu phần mềm vào các tệp Excel in sẵn của Ngành</p>
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
                <span>Số cột đã ánh xạ:</span>
                <span className="text-blue-600">{Object.keys(tpl.mapping || {}).length} cột</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="bg-military-800 p-5 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg"><Settings2 size={20}/></div>
                <h3 className="font-black uppercase text-sm tracking-widest">Thiết lập thông số mẫu Excel</h3>
              </div>
              <button onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Info size={14} className="text-blue-500"/> Thông tin cơ bản
                   </h4>
                   <div>
                     <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Tên mẫu biểu (Gợi nhớ)</label>
                     <input 
                      required type="text" className="w-full border p-2.5 rounded-xl font-bold text-sm bg-gray-50"
                      value={editingTemplate?.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      placeholder="VD: Danh sách 17 tuổi (Mẫu riêng của Tỉnh)"
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Mô tả chi tiết</label>
                     <textarea 
                      rows={2} className="w-full border p-2.5 rounded-xl text-xs font-medium bg-gray-50"
                      value={editingTemplate?.description} onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})}
                      placeholder="Ghi chú về mục đích sử dụng mẫu biểu này..."
                     />
                   </div>
                   <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 relative overflow-hidden">
                     {isAnalyzing && (
                       <div className="absolute inset-0 bg-amber-50/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
                          <Loader2 size={24} className="text-amber-600 animate-spin" />
                          <span className="text-[9px] font-black text-amber-800 uppercase animate-pulse">Đang nhận diện tiêu đề cột...</span>
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
                      type="number" className="w-24 border p-2.5 rounded-xl font-black text-center text-military-800 bg-military-50"
                      value={editingTemplate?.startRow} onChange={e => setEditingTemplate({...editingTemplate, startRow: parseInt(e.target.value)})}
                     />
                     <p className="text-[9px] text-gray-400 mt-1 italic">* Hệ thống đề xuất dựa trên phân tích dòng tiêu đề.</p>
                   </div>
                </div>

                <div className="space-y-5">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Sparkles size={14} className="text-amber-500"/> Ánh xạ dữ liệu cột
                   </h4>
                   <p className="text-[9px] text-gray-500 bg-gray-50 p-2 rounded border border-dashed leading-relaxed">
                     Hệ thống đã tự động nhận diện dựa trên nội dung cột. Vui lòng kiểm tra lại sự chính xác bên dưới.
                   </p>
                   
                   <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(colIdx => {
                        const isMapped = !!editingTemplate?.mapping?.[colIdx.toString()];
                        return (
                          <div key={colIdx} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${isMapped ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-100 shadow-sm'}`}>
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${isMapped ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'}`}>
                                {String.fromCharCode(64 + colIdx)}
                             </div>
                             <div className="flex-1">
                                <select 
                                  className="w-full text-[10px] font-bold border-none bg-transparent outline-none focus:ring-0 text-gray-700"
                                  value={editingTemplate?.mapping?.[colIdx.toString()] || ''}
                                  onChange={e => updateMapping(colIdx, e.target.value)}
                                >
                                   <option value="">-- Trống --</option>
                                   {FIELD_MAPPINGS.map(m => (
                                     <option key={m.key} value={m.key}>{m.label}</option>
                                   ))}
                                </select>
                             </div>
                             {isMapped && <Sparkles size={12} className="text-blue-400 animate-pulse" />}
                          </div>
                        );
                      })}
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-xs font-black text-gray-500 uppercase">Hủy bỏ</button>
                <button 
                  type="submit" disabled={isProcessing}
                  className="px-10 py-2.5 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-military-800 transition-all active:scale-95"
                >
                  {isProcessing ? 'Đang lưu...' : 'Xác nhận lưu mẫu'}
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
