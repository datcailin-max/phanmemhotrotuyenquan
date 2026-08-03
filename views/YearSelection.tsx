
import React, { useState } from 'react';
import { Calendar, CheckCircle2, ShieldAlert, MapPin, AlertCircle, Info } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface YearSelectionProps {
  onSelectYear: (year: number) => void;
  currentUser: User;
}

const YearSelection: React.FC<YearSelectionProps> = ({ onSelectYear, currentUser }) => {
  const currentYear = new Date().getFullYear();
  const [selected, setSelected] = useState<number>(currentYear);
  const [isSpecialArea, setIsSpecialArea] = useState<boolean>(currentUser.isSpecialArea || false);
  const [showSpecialAreaConfirm, setShowSpecialAreaConfirm] = useState<boolean>(currentUser.role === 'EDITOR' || currentUser.role === 'VIEWER');

  // Generate years from 2000 to 2099
  const years = Array.from({ length: 100 }, (_, i) => 2000 + i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lưu lại trạng thái vùng miền cho tài khoản
    if (currentUser.role !== 'PROVINCE_ADMIN' && currentUser.role !== 'ADMIN') {
        await api.updateUser(currentUser.username, { isSpecialArea });
        currentUser.isSpecialArea = isSpecialArea;
    }

    onSelectYear(selected);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-military-900 overflow-hidden text-gray-900">
      
      {/* Background decoration similar to Login */}
      <div className="absolute inset-0 z-0">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Qu%C3%A2n_hi%E1%BB%87u_Qu%C3%A2n_%C4%91%E1%BB%99i_nh%C3%A2n_d%C3%A2n_Vi%E1%BB%87t_Nam.png/1200px-Qu%C3%A2n_hi%E1%BB%87u_Qu%C3%A2n_%C4%91%E1%BB%99i_nh%C3%A2n_d%C3%A2n_Vi%E1%BB%87t_Nam.png"
            alt="Background"
            className="w-full h-full object-cover object-center opacity-40 blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-military-900/90 to-military-800/95 mix-blend-multiply"></div>
      </div>

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-military-700 to-military-600 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20">
             <Calendar size={32} />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wide">Thiết lập phiên làm việc</h2>
          <p className="text-military-100 text-sm mt-1">Xin chào, Ban CHQS {currentUser.unit.commune || 'Đơn vị'}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {showSpecialAreaConfirm && (
             <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-500">
                <label className="flex items-start gap-3 cursor-pointer group">
                   <div className="mt-1">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={isSpecialArea}
                        onChange={(e) => setIsSpecialArea(e.target.checked)}
                      />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black text-blue-900 uppercase leading-tight mb-1">Xác nhận diện địa bàn đặc thù</p>
                      <p className="text-[10px] text-blue-700 font-medium leading-relaxed italic">
                        Địa phương thuộc vùng sâu, vùng xa, vùng ĐK KT-XH đặc biệt khó khăn hoặc có đồng bào DTTS dưới 10.000 người?
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 bg-blue-100/50 p-1.5 rounded-lg border border-blue-200">
                        <Info size={12} className="text-blue-600"/>
                        <p className="text-[9px] font-black text-blue-800 uppercase">Hệ thống sẽ tự điều chỉnh logic học vấn</p>
                      </div>
                   </div>
                </label>
             </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase text-center">
              Chọn năm tuyển quân
            </label>
            <div className="relative">
              <select
                value={selected}
                onChange={(e) => setSelected(Number(e.target.value))}
                className="block w-full text-center text-2xl font-bold text-military-800 py-3 border-2 border-military-200 rounded-lg focus:outline-none focus:border-military-600 focus:ring-4 focus:ring-military-50 transition-all cursor-pointer bg-gray-50 hover:bg-white appearance-none"
                size={5} // Hiển thị dạng list cuộn ngắn
                style={{ scrollbarWidth: 'thin' }}
              >
                {years.map((year) => (
                  <option key={year} value={year} className="py-2 hover:bg-military-100 rounded cursor-pointer">
                    Năm {year}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2 italic">
              * Dữ liệu sẽ được lọc và xử lý theo năm đã chọn (2000 - 2099)
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all transform hover:-translate-y-0.5 uppercase tracking-wide"
          >
            <CheckCircle2 size={20} /> Xác nhận & Bắt đầu
          </button>
        </form>
      </div>
      
      <div className="absolute bottom-4 text-military-400 text-[10px] font-bold uppercase text-center z-10 tracking-widest px-4 leading-relaxed">
        PHẦN MỀM HTTQ 4.0
      </div>
    </div>
  );
};

export default YearSelection;
