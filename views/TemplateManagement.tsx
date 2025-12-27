
import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Plus, Trash2, Edit3, UploadCloud, Info, 
  Settings2, CheckCircle2, X, AlertTriangle, List, Sparkles, Loader2,
  Check, XCircle, Type, Filter, UserSearch
} from 'lucide-react';
import { ExcelTemplate, User } from '../types';
import { api } from '../api';
import { FIELD_MAPPINGS } from '../services/TemplateExportService';
import { TABS } from './RecruitManagement/constants';

interface TemplateManagementProps {
  user: User;
}

const TemplateManagement: React.FC<TemplateManagementProps> = ({ user }) => {
  const [templates, setTemplates] = useState<ExcelTemplate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<ExcelTemplate> | null>(null);

  const fetchTemplates = async () => {
    const data = await api.getTemplates();
    setTemplates(data || []);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleOpenAdd = () => {
    setEditingTemplate({ 
      name: '', description: '', startRow: 10, mapping: {}, 
      sourceTabs: ['ALL'], onlyAge17: false 
    });
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditingTemplate(prev => prev ? ({ ...prev, fileData: ev.target?.result as string }) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSourceTab = (tabId: string) => {
    setEditingTemplate(prev => {
      if (!prev) return null;
      const current = prev.sourceTabs || [];
      const next = current.includes(tabId) 
        ? current.filter(id => id !== tabId)
        : [...current, tabId];
      return { ...prev, sourceTabs: next };
    });
  };

  const toggleFieldInMapping = (colIndex: number, fieldKey: string) => {
    if (fieldKey === 'CUSTOM_TEXT') {
        const customVal = window.prompt("Nhập nội dung văn bản cố định muốn hiển thị trong cột này:");
        if (customVal !== null) {
            addFieldToCol(colIndex, `STATIC:${customVal}`);
        }
        return;
    }
    addFieldToCol(colIndex, fieldKey);
  };

  const addFieldToCol = (colIndex: number, finalKey: string) => {
    setEditingTemplate(prev => {
      if (!prev) return null;
      const currentMapping = { ...(prev.mapping || {}) };
      const colKey = colIndex.toString();
      
      let colFields = Array.isArray(currentMapping[colKey]) 
        ? [...(currentMapping[colKey] as string[])]
        : currentMapping[colKey] 
          ? [currentMapping[colKey] as string]
          : [];

      colFields.push(finalKey);
      currentMapping[colKey] = colFields;
      return { ...prev, mapping: currentMapping };
    });
  };

  const removeFieldFromCol = (colIndex: number, fieldIndex: number) => {
    setEditingTemplate(prev => {
      if (!prev) return null;
      const currentMapping = { ...(prev.mapping || {}) };
      const colKey = colIndex.toString();
      
      let colFields = Array.isArray(currentMapping[colKey]) 
        ? [...(currentMapping[colKey] as string[])]
        : [];

      colFields.splice(fieldIndex, 1);
      if (colFields.length === 0) {
        delete currentMapping[colKey];
      } else {
        currentMapping[colKey] = colFields;
      }
      return { ...prev, mapping: currentMapping };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.fileData) { 
      alert("Vui lòng tải lên file mẫu Excel (.xlsx)"); 
      return; 
    }
    
    setIsProcessing(true);
    try {
      const payload = { ...editingTemplate };
      const tplId = payload._id || payload.id;
      
      if (tplId) { 
        await api.updateTemplate(tplId, payload); 
      } else { 
        await api.createTemplate(payload); 
      }
      
      setShowModal(false); 
      await fetchTemplates(); 
      alert("Đã lưu mẫu biểu thành công.");
    } catch (err) { 
      console.error(err);
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

  const getLabelForDisplay = (key: string) => {
      if (key.startsWith('STATIC:')) return `[Văn bản]: ${key.replace('STATIC:', '')}`;
      return FIELD_MAPPINGS.find(m => m.key === key)?.label || key;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-700"><FileSpreadsheet size={32} /></div>
          <div>
            <h2 className="text-2xl font-black text-military-900 uppercase tracking-tight">Quản lý mẫu biểu chuẩn (Excel Injection)</h2>
            <p className="text-sm text-gray-500 font-medium italic">Thiết lập nguồn dữ liệu và vị trí các trường trong file Excel mẫu</p>
          </div>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-military-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-military-800 transition-all active:scale-95"><Plus size={18} /> Thêm mẫu mới</button>
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
                <span>Nguồn lấy dữ liệu:</span>
                <span className="text-blue-600 font-black">{tpl.sourceTabs?.length || 0} danh sách</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400">
                <span>Lọc tuổi 17:</span>
                <span className={tpl.onlyAge17 ? "text-green-600 font-black" : "text-gray-300"}>{tpl.onlyAge17 ? "BẬT" : "TẮT"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="bg-military-800 p-5 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg"><Settings2 size={20}/></div>
                <h3 className="font-black uppercase text-sm tracking-widest text-white">Thiết lập thông số mẫu Excel</h3>
              </div>
              <button onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Cột trái: Cấu hình chung & Nguồn */}
                <div className="lg:col-span-4 space-y-6">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b pb-2"><Info size={14} className="text-blue-500"/> 1. Thông tin mẫu & Nguồn</h4>
                   
                   <div className="space-y-4">
                     <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Tên mẫu biểu</label>
                       <input required type="text" className="w-full border p-2.5 rounded-xl font-bold text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-military-50" value={editingTemplate?.name || ''} onChange={e => setEditingTemplate(prev => prev ? ({...prev, name: e.target.value}) : null)} placeholder="VD: Danh sách 17 tuổi chuẩn (Injection)" />
                     </div>
                     
                     <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                       <label className="block text-[10px] font-black text-amber-700 uppercase mb-2">Tải file Excel khung (.xlsx)</label>
                       <input type="file" accept=".xlsx" onChange={handleFileUpload} className="w-full text-[10px] p-2 bg-white border border-dashed rounded-lg border-amber-300" />
                       {editingTemplate?.fileData && <p className="mt-2 text-[9px] text-green-600 font-black uppercase flex items-center gap-1"><CheckCircle2 size={12}/> Đã nhận file mẫu</p>}
                     </div>

                     {/* PHẦN CHỌN DANH SÁCH NGUỒN */}
                     <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                        <label className="block text-[10px] font-black text-blue-800 uppercase mb-3 flex items-center gap-1"><Filter size={12}/> Lấy công dân từ các danh sách:</label>
                        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                           {TABS.filter(t => !t.isSub).map(tab => (
                             <label key={tab.id} className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                                  checked={editingTemplate?.sourceTabs?.includes(tab.id) || false}
                                  onChange={() => toggleSourceTab(tab.id)}
                                />
                                <span className={`text-[10px] font-bold uppercase transition-colors ${editingTemplate?.sourceTabs?.includes(tab.id) ? 'text-blue-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{tab.label}</span>
                             </label>
                           ))}
                        </div>
                     </div>

                     {/* PHẦN LỌC TUỔI 17 */}
                     <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <UserSearch size={18} className="text-green-600"/>
                           <div>
                              <p className="text-[10px] font-black text-green-800 uppercase">Chế độ lọc tuổi 17</p>
                              <p className="text-[8px] text-green-600 font-bold uppercase opacity-70">Chỉ lấy những người đủ 17 tuổi</p>
                           </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setEditingTemplate(prev => prev ? ({...prev, onlyAge17: !prev.onlyAge17}) : null)}
                          className={`w-12 h-6 rounded-full transition-all relative ${editingTemplate?.onlyAge17 ? 'bg-green-600' : 'bg-gray-300'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingTemplate?.onlyAge17 ? 'left-7' : 'left-1'}`}></div>
                        </button>
                     </div>

                     <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Dòng bắt đầu điền dữ liệu</label>
                       <input type="number" className="w-24 border p-2.5 rounded-xl font-black text-center text-military-800 bg-military-50 outline-none focus:ring-2 focus:ring-military-400" value={editingTemplate?.startRow || 10} onChange={e => setEditingTemplate(prev => prev ? ({...prev, startRow: parseInt(e.target.value) || 0}) : null)} />
                     </div>
                   </div>
                </div>

                {/* Cột phải: Cấu hình Cột */}
                <div className="lg:col-span-8 space-y-5">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b pb-2"><Sparkles size={14} className="text-amber-500"/> 2. Thiết lập ánh xạ cột (Mapping)</h4>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(colIdx => {
                        const mappingValue = editingTemplate?.mapping?.[colIdx.toString()];
                        const colFields = Array.isArray(mappingValue) ? mappingValue : (mappingValue ? [mappingValue as string] : []);
                        const isMapped = colFields.length > 0;

                        return (
                          <div key={colIdx} className={`p-4 rounded-2xl border transition-all ${isMapped ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-100 shadow-sm'}`}>
                             <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${isMapped ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-white'}`}>{String.fromCharCode(64 + colIdx)}</div>
                                <span className="text-[9px] font-black text-gray-400 uppercase">Cột {String.fromCharCode(64 + colIdx)} (Vị trí {colIdx})</span>
                             </div>
                             
                             <div className="flex flex-wrap gap-1.5 mb-3 min-h-[40px]">
                                {isMapped ? colFields.map((fieldKey, fIdx) => (
                                  <div key={`${fieldKey}-${fIdx}`} className="flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-lg shadow-sm">
                                    <span className="text-[8px] font-black text-blue-700 uppercase line-clamp-1 max-w-[120px]">{getLabelForDisplay(fieldKey)}</span>
                                    <button type="button" onClick={() => removeFieldFromCol(colIdx, fIdx)} className="text-blue-300 hover:text-red-500 transition-colors"><XCircle size={12}/></button>
                                  </div>
                                )) : <span className="text-[9px] text-gray-300 italic font-bold">Chưa gán trường dữ liệu</span>}
                             </div>

                             <div className="relative">
                                <select 
                                  className="w-full text-[10px] font-black border border-gray-200 rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer uppercase"
                                  value=""
                                  onChange={e => { if(e.target.value) toggleFieldInMapping(colIdx, e.target.value); }}
                                >
                                   <option value="">+ Thêm dữ liệu vào cột...</option>
                                   {FIELD_MAPPINGS.map(m => (
                                     <option key={m.key} value={m.key}>{m.label}</option>
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
                <button type="submit" disabled={isProcessing} className="px-10 py-2.5 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-military-800 transition-all active:scale-95">
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận lưu cấu hình'}
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
