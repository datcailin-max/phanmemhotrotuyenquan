import React, { useState, useMemo } from 'react';
import { X, Trash2, AlertTriangle, CheckCircle2, Lock, KeyRound, Info, HelpCircle } from 'lucide-react';
import { Recruit, User } from '../../../types';
import { api } from '../../../api';

interface DeleteYearDataModalProps {
  currentRecruits: Recruit[];
  sessionYear: number;
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteYearDataModal: React.FC<DeleteYearDataModalProps> = ({
  currentRecruits,
  sessionYear,
  currentUser,
  onUpdateUser,
  onClose,
  onSuccess
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(sessionYear);
  const [secondaryPasswordInput, setSecondaryPasswordInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Setup / Reset level 2 password states
  const [isSettingUp, setIsSettingUp] = useState(!currentUser.secondaryPassword);
  const [isResettingMode, setIsResettingMode] = useState(false);
  const [mainPasswordVerify, setMainPasswordVerify] = useState('');
  const [newSecondaryPassword, setNewSecondaryPassword] = useState('');
  const [confirmSecondaryPassword, setConfirmSecondaryPassword] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupSuccess, setSetupSuccess] = useState('');

  // Extract unique years from existing recruits list
  const uniqueYears = useMemo(() => {
    const years = currentRecruits.map(r => r.recruitmentYear);
    if (!years.includes(sessionYear)) {
      years.push(sessionYear);
    }
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [currentRecruits, sessionYear]);

  // Count recruits of selected year
  const recruitsInSelectedYearCount = useMemo(() => {
    return currentRecruits.filter(r => r.recruitmentYear === selectedYear).length;
  }, [currentRecruits, selectedYear]);

  // Handle setting up secondary password
  const handleSetupSecondaryPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    setSetupSuccess('');

    if (!newSecondaryPassword) {
      setSetupError('Vui lòng nhập mật khẩu cấp 2 mới');
      return;
    }

    if (newSecondaryPassword.length < 4) {
      setSetupError('Mật khẩu cấp 2 phải chứa ít nhất 4 ký tự');
      return;
    }

    if (newSecondaryPassword !== confirmSecondaryPassword) {
      setSetupError('Mật khẩu cấp 2 nhập lại không trùng khớp');
      return;
    }

    // If resetting existing one, verify with Main Password
    if (isResettingMode && currentUser.secondaryPassword) {
      if (!mainPasswordVerify) {
        setSetupError('Vui lòng nhập mật khẩu tài khoản chính để xác thực đặt lại');
        return;
      }
      
      const successLogin = await api.login(currentUser.username, mainPasswordVerify);
      if (typeof successLogin === 'string') {
        setSetupError('Mật khẩu tài khoản chính không chính xác');
        return;
      }
    }

    try {
      const updatedUser = { ...currentUser, secondaryPassword: newSecondaryPassword };
      const success = await api.updateUser(currentUser.username, { secondaryPassword: newSecondaryPassword });
      
      if (success) {
        onUpdateUser(updatedUser);
        setSetupSuccess('Thiết lập mật khẩu cấp 2 thành công!');
        setNewSecondaryPassword('');
        setConfirmSecondaryPassword('');
        setMainPasswordVerify('');
        
        // Return to delete screen after 1.5 seconds
        setTimeout(() => {
          setIsSettingUp(false);
          setIsResettingMode(false);
          setSetupSuccess('');
        }, 1500);
      } else {
        setSetupError('Không thể lưu mật khẩu cấp 2 lên máy chủ. Vui lòng thử lại.');
      }
    } catch (err) {
      setSetupError('Lỗi kết nối máy chủ.');
    }
  };

  // Handle deleting all data of selected year
  const handleDeleteYearData = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!secondaryPasswordInput) {
      setErrorMsg('Vui lòng nhập mật khẩu cấp 2 để xác nhận');
      return;
    }

    if (secondaryPasswordInput !== currentUser.secondaryPassword) {
      setErrorMsg('Mật khẩu cấp 2 không chính xác');
      return;
    }

    const confirmMessage = `CẢNH BÁO CỰC KỲ QUAN TRỌNG!\n\nBạn đang thực hiện xóa toàn bộ ${recruitsInSelectedYearCount} hồ sơ tuyển quân của năm ${selectedYear}!\n\nHành động này sẽ XÓA VĨNH VIỄN toàn bộ dữ liệu này và KHÔNG THỂ KHÔI PHỤC.\n\nBạn có chắc chắn muốn tiếp tục không?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const finalConfirm = prompt(`Nhập chữ "XOA ${selectedYear}" vào ô dưới đây để hoàn tất việc xóa dữ liệu năm ${selectedYear}:`);
    if (finalConfirm !== `XOA ${selectedYear}`) {
      alert('Chuỗi xác nhận không chính xác. Đã hủy bỏ thao tác xóa.');
      return;
    }

    setIsDeleting(true);
    try {
      const success = await api.deleteYearData(selectedYear);
      if (success) {
        alert(`Đã xóa sạch toàn bộ dữ liệu năm tuyển chọn ${selectedYear} thành công!`);
        onSuccess();
        onClose();
      } else {
        setErrorMsg('Có lỗi xảy ra trong quá trình xóa dữ liệu trên máy chủ.');
      }
    } catch (err) {
      setErrorMsg('Lỗi hệ thống khi gửi yêu cầu xóa.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300 border border-red-100">
        
        {/* Header */}
        <div className="bg-red-950 p-5 flex justify-between items-center text-white">
          <h3 className="font-extrabold uppercase flex items-center gap-2 text-sm tracking-wide">
            <Trash2 size={20} className={isDeleting ? 'animate-bounce' : 'text-red-400'} />
            Xóa toàn bộ dữ liệu của năm
          </h3>
          <button 
            onClick={onClose} 
            disabled={isDeleting}
            className="hover:bg-white/10 p-1 rounded-full transition-colors"
          >
            <X size={24}/>
          </button>
        </div>

        {isSettingUp ? (
          /* Form Setup Secondary Password */
          <form onSubmit={handleSetupSecondaryPassword} className="p-6 space-y-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs text-red-900 leading-relaxed font-semibold">
              <div className="flex gap-2 items-start mb-1">
                <KeyRound size={16} className="text-red-700 shrink-0 mt-0.5" />
                <span className="font-bold text-red-950 uppercase">
                  {isResettingMode ? 'Đổi/Đặt lại mật khẩu cấp 2' : 'Thiết lập mật khẩu cấp 2'}
                </span>
              </div>
              Mật khẩu cấp 2 là lớp bảo mật đặc biệt dùng để bảo vệ dữ liệu diện rộng. Hãy ghi nhớ kỹ mật khẩu này, không chia sẻ cho bất kỳ ai.
            </div>

            {setupError && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-xs font-bold">
                {setupError}
              </div>
            )}

            {setupSuccess && (
              <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                {setupSuccess}
              </div>
            )}

            {isResettingMode && currentUser.secondaryPassword && (
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                  Mật khẩu tài khoản chính để xác minh
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu tài khoản chính..."
                  className="w-full border p-3 rounded-xl font-bold text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-red-600 transition-all"
                  value={mainPasswordVerify}
                  onChange={e => setMainPasswordVerify(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                Mật khẩu cấp 2 mới
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu cấp 2..."
                className="w-full border p-3 rounded-xl font-bold text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-red-600 transition-all"
                value={newSecondaryPassword}
                onChange={e => setNewSecondaryPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                Xác nhận mật khẩu cấp 2 mới
              </label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu cấp 2..."
                className="w-full border p-3 rounded-xl font-bold text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-red-600 transition-all"
                value={confirmSecondaryPassword}
                onChange={e => setConfirmSecondaryPassword(e.target.value)}
                required
              />
            </div>

            <div className="pt-2 flex gap-3">
              {currentUser.secondaryPassword && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingUp(false);
                    setIsResettingMode(false);
                    setSetupError('');
                  }}
                  className="w-1/3 border border-gray-300 text-gray-700 py-3 rounded-xl font-black uppercase text-xs hover:bg-gray-50 active:scale-95 transition-all text-center"
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                className={`flex-1 bg-red-700 text-white py-3 rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-red-800 active:scale-95 transition-all`}
              >
                <CheckCircle2 size={16} />
                Lưu mật khẩu cấp 2
              </button>
            </div>
          </form>
        ) : (
          /* Form Verify & Delete Year Data */
          <form onSubmit={handleDeleteYearData} className="p-6 space-y-4">
            
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                Chọn năm cần xóa dữ liệu
              </label>
              <select
                className="w-full border-2 border-gray-200 p-3 rounded-xl font-bold text-base bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-red-600 transition-all cursor-pointer"
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                disabled={isDeleting}
              >
                {uniqueYears.map(year => (
                  <option key={year} value={year}>
                    Năm {year} ({currentRecruits.filter(r => r.recruitmentYear === year).length} hồ sơ)
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-xs text-amber-900 font-semibold leading-relaxed">
              <div className="flex gap-2 items-start mb-1">
                <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5 animate-pulse" />
                <span className="font-bold text-amber-950 uppercase">Cảnh báo nghiêm trọng</span>
              </div>
              Mọi dữ liệu công dân thuộc năm tuyển chọn <b>{selectedYear}</b> sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu. Thao tác này <b>không thể hoàn tác</b> và sẽ ảnh hưởng trực tiếp đến báo cáo, thống kê của năm này.
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-black text-gray-500 uppercase">
                  Mật khẩu cấp 2 của bạn
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingUp(true);
                    setIsResettingMode(true);
                    setErrorMsg('');
                  }}
                  className="text-[10px] font-black text-red-700 uppercase hover:underline"
                >
                  Quên / Đổi mật khẩu cấp 2?
                </button>
              </div>
              <input
                type="password"
                placeholder="Nhập mật khẩu cấp 2 để xác nhận..."
                className="w-full border p-3 rounded-xl font-bold text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-red-600 transition-all"
                value={secondaryPasswordInput}
                onChange={e => setSecondaryPasswordInput(e.target.value)}
                disabled={isDeleting}
                required
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="w-1/3 border border-gray-300 text-gray-700 py-3 rounded-xl font-black uppercase text-xs hover:bg-gray-50 active:scale-95 transition-all text-center"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isDeleting || recruitsInSelectedYearCount === 0}
                className={`flex-1 text-white py-3 rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 transition-all ${
                  recruitsInSelectedYearCount === 0 
                    ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-red-700 hover:bg-red-800 active:scale-95'
                }`}
              >
                <Trash2 size={16} />
                {isDeleting ? 'Đang xóa sạch...' : 'Xóa vĩnh viễn dữ liệu'}
              </button>
            </div>
            
            {recruitsInSelectedYearCount === 0 && (
              <p className="text-[10px] text-center text-gray-500 italic mt-1">
                * Năm {selectedYear} hiện tại không có dữ liệu để xóa.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default DeleteYearDataModal;
