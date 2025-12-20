
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, Home } from 'lucide-react';
import { PROVINCES_VN, LOCATION_DATA, removeVietnameseTones } from '../../constants';

interface LocationFieldsProps {
  label: string;
  icon: React.ReactNode;
  province: string;
  commune: string;
  village: string;
  street?: string;
  isLocalityFixed?: boolean;
  isReadOnly: boolean;
  onUpdate: (field: string, value: string) => void;
  prefix: string; // 'address' or 'hometown'
}

const LocationFields: React.FC<LocationFieldsProps> = ({ 
  label, icon, province, commune, village, street, isLocalityFixed, isReadOnly, onUpdate, prefix 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const communeList = useMemo(() => {
    // @ts-ignore
    const provinceData = LOCATION_DATA[province];
    return provinceData ? Object.keys(provinceData) : [];
  }, [province]);

  const filteredCommunes = useMemo(() => {
    if (!commune) return communeList;
    const search = removeVietnameseTones(commune.toLowerCase());
    return communeList.filter(c => removeVietnameseTones(c.toLowerCase()).includes(search));
  }, [commune, communeList]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 uppercase text-sm mt-2">
        {icon} {label}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tỉnh / Thành phố</label>
          {isLocalityFixed ? (
            <div className="p-2 bg-gray-100 rounded text-gray-700 font-bold text-sm border border-gray-200">{province}</div>
          ) : (
            <select 
              className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500 disabled:bg-gray-100"
              value={province}
              onChange={(e) => onUpdate(`${prefix}.province`, e.target.value)}
              disabled={isReadOnly}
            >
              <option value="">-- Chọn Tỉnh --</option>
              {PROVINCES_VN.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
        </div>

        <div className="relative" ref={wrapperRef}>
          <label className="block text-xs font-medium text-gray-500 mb-1">Xã / Phường</label>
          {isLocalityFixed ? (
            <div className="p-2 bg-gray-100 rounded text-gray-700 font-bold text-sm border border-gray-200">{commune}</div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Nhập tên Xã/Phường..."
                className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500 disabled:bg-gray-100 font-bold"
                value={commune}
                onChange={(e) => { onUpdate(`${prefix}.commune`, e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                disabled={!province || isReadOnly}
              />
              {showSuggestions && province && !isReadOnly && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                  {communeList.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 italic">Dữ liệu đang cập nhật...</div>
                  ) : filteredCommunes.length > 0 ? (
                    filteredCommunes.map((c, idx) => (
                      <div key={idx} className="px-3 py-2 text-sm text-gray-800 hover:bg-military-50 cursor-pointer flex items-center gap-2 border-b border-gray-50 last:border-0"
                           onClick={() => { onUpdate(`${prefix}.commune`, c); setShowSuggestions(false); }}>
                        <MapPin size={12} className="text-military-400" /> {c}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500 italic">Không tìm thấy</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className={prefix === 'address' ? 'col-span-1' : 'col-span-2'}>
          <label className="block text-xs font-medium text-gray-500 mb-1">Thôn / Ấp</label>
          <input 
            type="text" className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500 disabled:bg-gray-100 font-bold"
            value={village} onChange={(e) => onUpdate(`${prefix}.village`, e.target.value)} placeholder="Nhập tên Thôn/Ấp..." readOnly={isReadOnly}
          />
        </div>

        {prefix === 'address' && (
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Số nhà, đường</label>
            <input 
              type="text" className="block w-full p-2 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-military-500 disabled:bg-gray-100"
              value={street || ''} onChange={(e) => onUpdate(`${prefix}.street`, e.target.value)} readOnly={isReadOnly}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationFields;
