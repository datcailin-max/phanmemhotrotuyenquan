import React, { useEffect } from 'react';
import { FileText, Download, Sparkles, CheckCircle, RefreshCw, User, ShieldCheck } from 'lucide-react';
import { Recruit, CurriculumVitae } from '../../types';
import { helperAutoFillCV, generateCurriculumVitaeWordDoc } from '../../services/WordExportService';
import { api } from '../../api';

interface CurriculumVitaeTabProps {
  formData: Recruit;
  isReadOnly?: boolean;
  onUpdateCV: (cv: CurriculumVitae) => void;
}

export const CurriculumVitaeTab: React.FC<CurriculumVitaeTabProps> = ({
  formData,
  isReadOnly = false,
  onUpdateCV
}) => {
  const cv: CurriculumVitae = formData.curriculumVitae && Object.keys(formData.curriculumVitae).length > 0
    ? formData.curriculumVitae
    : helperAutoFillCV(formData);

  // Auto initialize if empty
  useEffect(() => {
    if (!formData.curriculumVitae || Object.keys(formData.curriculumVitae).length === 0) {
      onUpdateCV(helperAutoFillCV(formData));
    }
  }, []);

  const handleChange = (field: keyof CurriculumVitae, value: string) => {
    const updated = { ...cv, [field]: value };
    onUpdateCV(updated);
  };

  const handleSyncFromProfile = () => {
    const autoCV = helperAutoFillCV(formData);
    onUpdateCV(autoCV);
    alert("✅ Đã cập nhật & đồng bộ dữ liệu từ Hồ sơ quân sự bên ngoài vào Sơ yếu lý lịch!");
  };

  const handleExportWord = async () => {
    try {
      let tplUrl = formData.wordDocument?.url;
      if (!tplUrl) {
        const master = await api.getMasterWordTemplate().catch(() => null);
        if (master?.url) {
          tplUrl = master.url;
        }
      }
      await generateCurriculumVitaeWordDoc(formData, cv, tplUrl);
    } catch (err: any) {
      alert(`Lỗi khi xuất tệp Word: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-200">
      {/* Top Action Bar for Quick Sync & Word Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
        <div>
          <h3 className="text-sm font-black text-blue-950 flex items-center gap-2">
            <FileText size={18} className="text-blue-700" /> SƠ YẾU LÝ LỊCH NGHĨA VỤ QUÂN SỰ
          </h3>
          <p className="text-xs text-blue-700 font-medium mt-0.5">
            Dữ liệu dùng để in và xuất file Word lý lịch NVQS theo quy định chuẩn của Bộ Quốc phòng
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncFromProfile}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-blue-800 hover:bg-blue-100/60 border border-blue-300 rounded-lg text-xs font-black uppercase transition-all shadow-sm"
            title="Tự động điền và đồng bộ lại các trường từ thông tin hồ sơ bên ngoài"
          >
            <RefreshCw size={14} className="text-blue-700" />
            <span>Đồng bộ từ hồ sơ</span>
          </button>
          <button
            type="button"
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-black uppercase transition-all shadow-md active:scale-95"
            title="Xuất file Word (.docx) Lý lịch NVQS của công dân"
          >
            <Download size={14} />
            <span>Xuất Lý lịch NVQS (.docx)</span>
          </button>
        </div>
      </div>

      {/* SECTION I FORM FIELDS */}
      <div className="space-y-6">
        <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider border-b border-gray-200 pb-2 flex items-center gap-2">
          <User size={16} className="text-blue-600" /> THÔNG TIN BẢN THÂN CÔNG DÂN
        </h4>

        {/* Row 1: Full name & Alias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
              Họ, chữ đệm và tên khai sinh (In hoa):
            </label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-black uppercase text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              value={cv.fullNameUpper || ''}
              onChange={(e) => handleChange('fullNameUpper', e.target.value)}
              placeholder="NGUYỄN VĂN A"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
              Họ, chữ đệm và tên thường dùng:
            </label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
              value={cv.aliasName || ''}
              onChange={(e) => handleChange('aliasName', e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>
        </div>

        {/* Row 2: Birth Date & Gender & Citizen ID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Sinh ngày:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.birthDay || ''}
              onChange={(e) => handleChange('birthDay', e.target.value)}
              placeholder="01"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Tháng:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.birthMonth || ''}
              onChange={(e) => handleChange('birthMonth', e.target.value)}
              placeholder="01"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Năm:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.birthYear || ''}
              onChange={(e) => handleChange('birthYear', e.target.value)}
              placeholder="2005"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Giới tính (nam, nữ):</label>
            <select
              disabled={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.gender || 'Nam'}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
        </div>

        {/* Row 3: CCCD & Place of birth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Số thẻ căn cước / CCCD:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-black text-blue-700 font-mono"
              value={cv.citizenId || ''}
              onChange={(e) => handleChange('citizenId', e.target.value)}
              placeholder="001205000123"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Nơi đăng ký khai sinh:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.placeOfBirth || ''}
              onChange={(e) => handleChange('placeOfBirth', e.target.value)}
              placeholder="Xã A, Huyện B, Tỉnh C"
            />
          </div>
        </div>

        {/* Row 4: Hometown, Ethnicity, Religion, Nationality */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Quê quán:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.hometown || ''}
              onChange={(e) => handleChange('hometown', e.target.value)}
              placeholder="Quê quán"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Dân tộc:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.ethnicity || ''}
              onChange={(e) => handleChange('ethnicity', e.target.value)}
              placeholder="Kinh"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Tôn giáo:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.religion || ''}
              onChange={(e) => handleChange('religion', e.target.value)}
              placeholder="Không"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Quốc tịch:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.nationality || 'Việt Nam'}
              onChange={(e) => handleChange('nationality', e.target.value)}
              placeholder="Việt Nam"
            />
          </div>
        </div>

        {/* Row 5: Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Nơi thường trú của gia đình:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.permanentAddress || ''}
              onChange={(e) => handleChange('permanentAddress', e.target.value)}
              placeholder="Thôn, Xã, Huyện, Tỉnh"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Nơi ở hiện tại của bản thân:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.temporaryAddress || ''}
              onChange={(e) => handleChange('temporaryAddress', e.target.value)}
              placeholder="Thôn, Xã, Huyện, Tỉnh"
            />
          </div>
        </div>

        {/* Row 6: Composition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Thành phần gia đình:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.familyClass || ''}
              onChange={(e) => handleChange('familyClass', e.target.value)}
              placeholder="Nông dân / Bần nông / Công chức..."
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Thành phần bản thân:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.personalClass || ''}
              onChange={(e) => handleChange('personalClass', e.target.value)}
              placeholder="Học sinh / Lao động..."
            />
          </div>
        </div>

        {/* Row 7: Education & Qualification */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Trình độ giáo dục phổ thông:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.educationLevel || ''}
              onChange={(e) => handleChange('educationLevel', e.target.value)}
              placeholder="12/12"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Trình độ đào tạo:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.qualificationLevel || ''}
              onChange={(e) => handleChange('qualificationLevel', e.target.value)}
              placeholder="Đại học / Cao đẳng / Chưa qua đào tạo"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Ngoại ngữ:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.languageLevel || ''}
              onChange={(e) => handleChange('languageLevel', e.target.value)}
              placeholder="Tiếng Anh B1 / Không"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Chuyên ngành đào tạo:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.major || ''}
              onChange={(e) => handleChange('major', e.target.value)}
              placeholder="Công nghệ thông tin..."
            />
          </div>
        </div>

        {/* Row 8: Political status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Ngày vào Đảng CSVN:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.communistPartyJoinedDate || ''}
              onChange={(e) => handleChange('communistPartyJoinedDate', e.target.value)}
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Ngày chính thức:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.communistPartyOfficialDate || ''}
              onChange={(e) => handleChange('communistPartyOfficialDate', e.target.value)}
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Ngày vào Đoàn TNCS HCM:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.youthUnionJoinedDate || ''}
              onChange={(e) => handleChange('youthUnionJoinedDate', e.target.value)}
              placeholder="dd/mm/yyyy"
            />
          </div>
        </div>

        {/* Row 9: Rewards & Disciplines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Khen thưởng:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.commendations || ''}
              onChange={(e) => handleChange('commendations', e.target.value)}
              placeholder="Bằng khen..."
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Kỷ luật:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.disciplinaryAction || ''}
              onChange={(e) => handleChange('disciplinaryAction', e.target.value)}
              placeholder="Không"
            />
          </div>
        </div>

        {/* Row 10: Job, Salary, Grade, Rank */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Nghề nghiệp:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.job || ''}
              onChange={(e) => handleChange('job', e.target.value)}
              placeholder="Lao động tự do"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Lương:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.salary || ''}
              onChange={(e) => handleChange('salary', e.target.value)}
              placeholder="Triệu VNĐ"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Ngạch:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.salaryGrade || ''}
              onChange={(e) => handleChange('salaryGrade', e.target.value)}
              placeholder="Ngạch lương"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Bậc:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.salaryRank || ''}
              onChange={(e) => handleChange('salaryRank', e.target.value)}
              placeholder="Bậc lương"
            />
          </div>
        </div>

        {/* Row 11: Workplace & Foreign travel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Nơi làm việc, (học tập):</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.workplace || ''}
              onChange={(e) => handleChange('workplace', e.target.value)}
              placeholder="Tên cơ quan / trường học"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Đã đi nước ngoài (tên nước, thời gian, lý do):</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800"
              value={cv.foreignTravel || ''}
              onChange={(e) => handleChange('foreignTravel', e.target.value)}
              placeholder="Chưa đi nước ngoài"
            />
          </div>
        </div>

        {/* FAMILY RELATIONSHIPS SECTION */}
        <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider border-b border-gray-200 pb-2 pt-4 flex items-center gap-2">
          <User size={16} className="text-indigo-600" /> QUAN HỆ GIA ĐÌNH (CHA, MẸ, VỢ/CHỒNG, CON)
        </h4>

        {/* Father Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="md:col-span-1">
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Họ tên cha:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.fatherName || ''}
              onChange={(e) => handleChange('fatherName', e.target.value)}
              placeholder="Họ tên cha"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Tình trạng (sống, chết):</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.fatherStatus || 'Sống'}
              onChange={(e) => handleChange('fatherStatus', e.target.value)}
              placeholder="Sống"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Sinh ngày / năm:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.fatherBirthDate || ''}
              onChange={(e) => handleChange('fatherBirthDate', e.target.value)}
              placeholder="1970"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Nghề nghiệp cha:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.fatherJob || ''}
              onChange={(e) => handleChange('fatherJob', e.target.value)}
              placeholder="Nông dân"
            />
          </div>
        </div>

        {/* Mother Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="md:col-span-1">
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Họ tên mẹ:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.motherName || ''}
              onChange={(e) => handleChange('motherName', e.target.value)}
              placeholder="Họ tên mẹ"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Tình trạng (sống, chết):</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.motherStatus || 'Sống'}
              onChange={(e) => handleChange('motherStatus', e.target.value)}
              placeholder="Sống"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Sinh ngày / năm:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.motherBirthDate || ''}
              onChange={(e) => handleChange('motherBirthDate', e.target.value)}
              placeholder="1972"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Nghề nghiệp mẹ:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.motherJob || ''}
              onChange={(e) => handleChange('motherJob', e.target.value)}
              placeholder="Nội trợ / Nông dân"
            />
          </div>
        </div>

        {/* Spouse Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Họ tên vợ (chồng):</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.spouseName || ''}
              onChange={(e) => handleChange('spouseName', e.target.value)}
              placeholder="Chưa có"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Sinh ngày / năm:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.spouseBirthDate || ''}
              onChange={(e) => handleChange('spouseBirthDate', e.target.value)}
              placeholder="Năm sinh"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Nghề nghiệp vợ (chồng):</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.spouseJob || ''}
              onChange={(e) => handleChange('spouseJob', e.target.value)}
              placeholder="Nghề nghiệp"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Bản thân đã có ... con:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.childrenCount || '0'}
              onChange={(e) => handleChange('childrenCount', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Siblings Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Cha mẹ có ... người con:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.totalSiblings || ''}
              onChange={(e) => handleChange('totalSiblings', e.target.value)}
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">... con trai:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.maleSiblings || ''}
              onChange={(e) => handleChange('maleSiblings', e.target.value)}
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">... con gái:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.femaleSiblings || ''}
              onChange={(e) => handleChange('femaleSiblings', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">Bản thân là con thứ:</label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-bold text-gray-800 bg-white"
              value={cv.siblingOrder || ''}
              onChange={(e) => handleChange('siblingOrder', e.target.value)}
              placeholder="1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
