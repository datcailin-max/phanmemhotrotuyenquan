
import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Plus, Trash2, Edit3, Info, 
  Settings2, CheckCircle2, X, AlertTriangle, Sparkles,
  XCircle, Filter, UserSearch, Zap, Activity, Heart, Globe, Landmark, ChevronDown, ChevronUp
} from 'lucide-react';
import { ExcelTemplate, User } from '../types';
import { api } from '../api';
import { FIELD_MAPPINGS } from '../services/TemplateExportService';
import { TABS } from './RecruitManagement/constants';
import { ETHNICITIES, RELIGIONS, DEFAULT_CATALOG } from '../constants';

interface TemplateManagementProps {
  user: User;
}

const TemplateManagement: React.FC<TemplateManagementProps> = ({ user }) => {
  const [templates, setTemplates] = useState<ExcelTemplate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<ExcelTemplate> | null>(null);
  const [showAgeFilter, setShowAgeFilter] = useState(false);
  const [showEthnicityFilter, setShowEthnicityFilter] = useState(false);
  const [showReligionFilter, setShowReligionFilter] = useState(false);

  const fetchTemplates = async () => {
    const data = await api.getTemplates();
    setTemplates(data || []);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleOpenAdd = () => {
    setEditingTemplate({ 
      name: '', description: '', startRow: 10, mapping: {}, 
      sourceTabs: ['ALL'], onlyAge17: false,
      filterAges: [], filterEthnicities: [], filterReligions: [], filterHealthGrades: []
    });
    setShowModal(true);
  };

  const handleQuickSeed = async () => {
    if (!window.confirm("Hệ thống sẽ tự động tạo 21 mẫu biểu trống theo đúng danh mục chuẩn. Bạn có chắc chắn không?")) return;
    
    setIsProcessing(true);
    try {
      for (const item of DEFAULT_CATALOG) {
        const placeholderBase64 = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQAAAAIAAAAIQAAAAAA";
        
        await api.createTemplate({
          name: item.name,
          description: `Mẫu biểu chuẩn cho ${item.name}`,
          fileData: placeholderBase64,
          startRow: 10,
          mapping: {},
          sourceTabs: item.sources,
          onlyAge17: item.only17 || false,
          filterAges: [], filterEthnicities: [], filterReligions: [], filterHealthGrades: []
        });
      }
      await fetchTemplates();
      alert("Đã khởi tạo xong 21 mẫu biểu danh mục.");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi khởi tạo danh mục.");
    } finally {
      setIsProcessing(false);
    }
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
      const next = current.includes(tabId) ? current.filter(id => id !== tabId) : [...current, tabId];
      return { ...prev, sourceTabs: next };
    });
  };

  /**
   * Fix: Updated toggleValueInFilter to use type assertion for the field value.
   * This resolves the error where TypeScript was unable to determine if the field 
   * property of ExcelTemplate was an array, which is required for .includes, .filter and spread iteration.
   */
  const toggleValueInFilter = (field: keyof ExcelTemplate, val: any) => {
    setEditingTemplate(prev => {
      if (!prev) return null;
      
      const currentArray = (prev[field] as any[]) || [];
      const next = currentArray.includes(val) 
        ? currentArray.filter((v: any) => v !== val) 
        : [...currentArray, val];
      return { ...prev, [field]: next };
    });
  };

  const toggleFieldInMapping = (colIndex: number, fieldKey: string) => {
    if (fieldKey === 'CUSTOM_TEXT') {
        const customVal = window.prompt("Nhập nội dung văn bản cố định muốn hiển thị trong cột này:");
        if (customVal !== null) addFieldToCol(colIndex, `STATIC:${customVal}`);
        return;
    }
    addFieldToCol(colIndex, fieldKey);
  };

  const addFieldToCol = (colIndex: number, finalKey: string) => {
    setEditingTemplate(prev => {
      if (!prev) return null;
      const currentMapping = { ...(prev.mapping || {}) };
      const colKey = colIndex.toString();
      let colFields = Array.isArray(currentMapping[colKey]) ? [...(currentMapping[colKey] as string[])] : currentMapping[colKey] ? [currentMapping[colKey] as string] : [];
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
      let colFields = Array.isArray(currentMapping[colKey]) ? [...(currentMapping[colKey] as string[])] : [];
      colFields.splice(fieldIndex, 1);
      if (colFields.length === 0) delete currentMapping[colKey];
      else currentMapping[colKey] = colFields;
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
      if (tplId) await api.updateTemplate(tplId, payload); 
      else await api.createTemplate(payload); 
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
            <h2 className="text-2xl font-black text-military-900 uppercase tracking-tight">QUẢN LÝ MẪU BIỂU (EXCEL INJECTION)</h2>
            <p className="text-sm text-gray-500 font-medium italic">Tùy biến các trường thông tin cho từng loại danh sách xuất ra</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={handleQuickSeed} disabled={isProcessing} className="flex items-center gap-2 bg-amber-600 text-white px-5 py-3 rounded-xl font-black uppercase text-xs shadow-lg hover:bg-amber-700 transition-all active:scale-95 disabled:opacity-50"><Zap size={18} /> KHỞI TẠO NHANH DANH MỤC (21 MẪU)</button>
            <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-military-700 text-white px-5 py-3 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-military-800 transition-all active:scale-95"><Plus size={18} /> Thêm mẫu biểu</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
             <FileSpreadsheet size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-400 font-bold">Chưa có mẫu biểu nào. Hãy nhấp "Khởi tạo nhanh" để bắt đầu.</p>
          </div>
        ) : templates.map(tpl => {
          const isPlaceholder = tpl.fileData?.includes('UEsDBBQAAAAIAAAAIQAAAAAA');
          return (
            <div key={tpl.id || tpl._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${isPlaceholder ? 'bg-amber-400' : 'bg-green-500'}`}></div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${isPlaceholder ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}><FileSpreadsheet size={20}/></div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingTemplate(tpl); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-military-600 transition-colors"><Edit3 size={16}/></button>
                  <button onClick={() => handleDelete((tpl._id || tpl.id)!)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
              <h4 className="text-sm font-black text-military-900 uppercase mb-1">{tpl.name}</h4>
              <p className="text-[10px] text-gray-500 uppercase font-bold">{isPlaceholder ? 'File trống' : 'File mẫu khả dụng'}</p>
              <div className="space-y-2 border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400">
                  <span>Dòng bắt đầu:</span>
                  <span className="text-military-600 font-black">{tpl.startRow}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400">
                  <span>Số cột Mapping:</span>
                  <span className="text-blue-600 font-black">{Object.keys(tpl.mapping || {}).length} cột</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="bg-military-800 p-5 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg"><Settings2 size={20}/></div>
                <h3 className="font-black uppercase text-sm tracking-widest text-white">Thiết lập mẫu biểu thông minh</h3>
              </div>
              <button onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Panel Cấu hình & Lọc (Trái) */}
                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                      <h4 className="text-[10px] font-black text-military-800 uppercase tracking-widest flex items-center gap-2 border-b pb-3"><Info size={14} className="text-blue-500"/> 1. Thông tin chung</h4>
                      
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Tên mẫu biểu kết xuất</label>
                        <input required type="text" className="w-full border p-2.5 rounded-xl font-bold text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-military-100" value={editingTemplate?.name || ''} onChange={e => setEditingTemplate(prev => prev ? ({...prev, name: e.target.value}) : null)} />
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                        <label className="block text-[10px] font-black text-amber-700 uppercase mb-2">Tải tệp Excel khung (.xlsx)</label>
                        <input type="file" accept=".xlsx" onChange={handleFileUpload} className="w-full text-[10px] p-2 bg-white border border-dashed rounded-lg border-amber-300" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Dòng bắt đầu ghi dữ liệu</label>
                        <input type="number" className="w-24 border p-2.5 rounded-xl font-black text-center text-military-800 bg-military-50 outline-none" value={editingTemplate?.startRow || 10} onChange={e => setEditingTemplate(prev => prev ? ({...prev, startRow: parseInt(e.target.value) || 0}) : null)} />
                      </div>
                   </div>

                   {/* PHẦN BỘ LỌC DỮ LIỆU */}
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                      <h4 className="text-[10px] font-black text-military-800 uppercase tracking-widest flex items-center gap-2 border-b pb-3"><Filter size={14} className="text-green-600"/> 2. Bộ lọc công dân mục tiêu</h4>
                      
                      {/* Lọc Tab Nguồn */}
                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                        <label className="block text-[10px] font-black text-blue-800 uppercase mb-3 flex items-center gap-1">Lấy từ các danh sách:</label>
                        <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                           {TABS.map(tab => (
                             <label key={tab.id} className={`flex items-center gap-2 cursor-pointer group ${tab.isSub ? 'ml-4' : ''}`}>
                                <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-gray-300" checked={editingTemplate?.sourceTabs?.includes(tab.id) || false} onChange={() => toggleSourceTab(tab.id)} />
                                <span className={`text-[9px] font-bold uppercase transition-colors ${editingTemplate?.sourceTabs?.includes(tab.id) ? 'text-blue-900' : 'text-gray-400'}`}> {tab.isSub ? '↳ ' : ''}{tab.label}</span>
                             </label>
                           ))}
                        </div>
                      </div>

                      {/* Lọc Độ tuổi (18-27) */}
                      <div className="space-y-2">
                        <button type="button" onClick={() => setShowAgeFilter(!showAgeFilter)} className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-military-50 transition-colors">
                           <div className="flex items-center gap-2 text-[10px] font-black text-military-700 uppercase"><UserSearch size={14}/> Lọc độ tuổi (18 - 27)</div>
                           {showAgeFilter ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        </button>
                        {showAgeFilter && (
                           <div className="grid grid-cols-5 gap-2 p-2 border border-dashed rounded-xl animate-in slide-in-from-top-2">
                              {Array.from({length: 10}, (_, i) => 18 + i).map(age => (
                                <button type="button" key={age} onClick={() => toggleValueInFilter('filterAges', age)} className={`py-1.5 rounded-lg text-[10px] font-black border transition-all ${editingTemplate?.filterAges?.includes(age) ? 'bg-military-600 text-white border-military-700' : 'bg-white text-gray-400 border-gray-200'}`}> {age} </button>
                              ))}
                           </div>
                        )}
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[9px] font-bold text-gray-400 uppercase">Chỉ lấy tuổi 17:</span>
                            <button type="button" onClick={() => setEditingTemplate(prev => prev ? ({...prev, onlyAge17: !prev.onlyAge17}) : null)} className={`w-10 h-5 rounded-full relative transition-all ${editingTemplate?.onlyAge17 ? 'bg-green-600' : 'bg-gray-200'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${editingTemplate?.onlyAge17 ? 'left-5.5' : 'left-0.5'}`}></div></button>
                        </div>
                      </div>

                      {/* Lọc Dân tộc */}
                      <div className="space-y-2">
                         <button type="button" onClick={() => setShowEthnicityFilter(!showEthnicityFilter)} className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-military-50 transition-colors">
                            <div className="flex items-center gap-2 text-[10px] font-black text-military-700 uppercase"><Globe size={14}/> Lọc theo Dân tộc</div>
                            {showEthnicityFilter ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                         </button>
                         {showEthnicityFilter && (
                            <div className="p-3 border border-dashed rounded-xl max-h-[200px] overflow-y-auto custom-scrollbar space-y-1 animate-in slide-in-from-top-2">
                               {ETHNICITIES.map(e => (
                                 <label key={e} className="flex items-center gap-2 cursor-pointer py-1 hover:bg-gray-50 rounded">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600" checked={editingTemplate?.filterEthnicities?.includes(e) || false} onChange={() => toggleValueInFilter('filterEthnicities', e)} />
                                    <span className={`text-[10px] font-bold ${editingTemplate?.filterEthnicities?.includes(e) ? 'text-blue-800' : 'text-gray-400'}`}>{e}</span>
                                 </label>
                               ))}
                            </div>
                         )}
                      </div>

                      {/* Lọc Tôn giáo */}
                      <div className="space-y-2">
                         <button type="button" onClick={() => setShowReligionFilter(!showReligionFilter)} className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-military-50 transition-colors">
                            <div className="flex items-center gap-2 text-[10px] font-black text-military-700 uppercase"><Landmark size={14}/> Lọc theo Tôn giáo</div>
                            {showReligionFilter ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                         </button>
                         {showReligionFilter && (
                            <div className="p-3 border border-dashed rounded-xl space-y-1 animate-in slide-in-from-top-2">
                               {RELIGIONS.map(r => (
                                 <label key={r} className="flex items-center gap-2 cursor-pointer py-1 hover:bg-gray-50 rounded">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-amber-600" checked={editingTemplate?.filterReligions?.includes(r) || false} onChange={() => toggleValueInFilter('filterReligions', r)} />
                                    <span className={`text-[10px] font-bold ${editingTemplate?.filterReligions?.includes(r) ? 'text-amber-800' : 'text-gray-400'}`}>{r}</span>
                                 </label>
                               ))}
                            </div>
                         )}
                      </div>

                      {/* Lọc Sức khỏe */}
                      <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                         <label className="block text-[10px] font-black text-red-800 uppercase mb-3 flex items-center gap-1"><Heart size={12}/> Phân loại Sức khỏe:</label>
                         <div className="flex flex-wrap gap-2">
                            {[1,2,3,4,5,6].map(g => (
                              <button type="button" key={g} onClick={() => toggleValueInFilter('filterHealthGrades', g)} className={`w-8 h-8 rounded-lg text-[10px] font-black border transition-all ${editingTemplate?.filterHealthGrades?.includes(g) ? 'bg-red-600 text-white border-red-700' : 'bg-white text-gray-400 border-gray-200'}`}> {g} </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Panel Mapping (Phải) */}
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                   <h4 className="text-[10px] font-black text-military-800 uppercase tracking-widest flex items-center gap-2 border-b pb-3"><Sparkles size={14} className="text-amber-500"/> 3. Thiết lập ánh xạ cột dữ liệu (Mapping)</h4>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                      {Array.from({ length: 40 }, (_, i) => i + 1).map(colIdx => {
                        const mappingValue = editingTemplate?.mapping?.[colIdx.toString()];
                        const colFields = Array.isArray(mappingValue) ? mappingValue : (mappingValue ? [mappingValue as string] : []);
                        const isMapped = colFields.length > 0;

                        return (
                          <div key={colIdx} className={`p-4 rounded-2xl border transition-all ${isMapped ? 'bg-blue-50/30 border-blue-200' : 'bg-gray-50/50 border-gray-100 shadow-inner'}`}>
                             <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${isMapped ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'}`}>{String.fromCharCode(64 + (colIdx > 26 ? colIdx - 26 : colIdx))}{colIdx > 26 ? "'" : ""}</div>
                                <span className="text-[9px] font-black text-gray-400 uppercase">Vị trí cột {colIdx}</span>
                             </div>
                             
                             <div className="flex flex-wrap gap-1.5 mb-3 min-h-[45px]">
                                {isMapped ? colFields.map((fieldKey, fIdx) => (
                                  <div key={`${fieldKey}-${fIdx}`} className="flex items-center gap-1 px-2 py-1 bg-white border border-blue-100 rounded-lg shadow-sm">
                                    <span className="text-[8px] font-black text-blue-700 uppercase line-clamp-1 max-w-[120px]">{getLabelForDisplay(fieldKey)}</span>
                                    <button type="button" onClick={() => removeFieldFromCol(colIdx, fIdx)} className="text-blue-300 hover:text-red-500 transition-colors"><XCircle size={12}/></button>
                                  </div>
                                )) : <span className="text-[9px] text-gray-300 italic font-bold">Trống</span>}
                             </div>

                             <div className="relative">
                                <select className="w-full text-[10px] font-black border border-gray-200 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer uppercase" value="" onChange={e => { if(e.target.value) toggleFieldInMapping(colIdx, e.target.value); }}>
                                   <option value="">+ Thêm trường dữ liệu...</option>
                                   {FIELD_MAPPINGS.map(m => ( <option key={m.key} value={m.key}>{m.label}</option> ))}
                                </select>
                                <Plus size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex justify-end gap-3 shrink-0 bg-white sticky bottom-0 z-10 p-4 rounded-b-3xl">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 text-xs font-black text-gray-400 uppercase">Hủy bỏ</button>
                <button type="submit" disabled={isProcessing} className="px-12 py-3 bg-military-700 text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-military-800 transition-all active:scale-95">
                   {isProcessing ? 'Đang xử lý...' : 'Lưu cấu hình mẫu biểu'}
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
