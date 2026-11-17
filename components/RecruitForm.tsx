
import React, { useState, useEffect, useRef } from 'react';
import { Recruit, RecruitmentStatus, FamilyMember, User, RecruitAttachment, RecruitWordDocument } from '../types';
import { X, Save, User as UserIcon, AlertTriangle, Camera, ShieldAlert, Globe, UserPlus, User as UserIconAlt, Trash2, FileText, UserCheck } from 'lucide-react';
import { LEGAL_DEFERMENT_REASONS, LOW_EDUCATION_GRADES, removeVietnameseTones } from '../constants';
import { api } from '../api';
import { helperAutoFillCV, isParentDeceased } from '../services/WordExportService';
import { getStatusLabel } from '../views/RecruitManagement/utils';

// Sub-components
import LocationFields from './RecruitForm/LocationFields';
import QualityFields from './RecruitForm/QualityFields';
import StatusFields from './RecruitForm/StatusFields';
import FamilyFields from './RecruitForm/FamilyFields';
import AttachmentFields from './RecruitForm/AttachmentFields';
import { WordDocumentSection } from './RecruitForm/WordDocumentSection';
import { CurriculumVitaeTab } from './RecruitForm/CurriculumVitaeTab';

interface RecruitFormProps {
  initialData?: Recruit;
  initialStatus?: RecruitmentStatus;
  user: User;
  onSubmit: (data: Recruit) => Promise<boolean | void> | boolean | void;
  onClose: () => void;
  sessionYear: number;
  existingRecruits: Recruit[];
}

const RecruitForm: React.FC<RecruitFormProps> = ({ 
  initialData, 
  initialStatus, 
  user, 
  onSubmit, 
  onClose, 
  sessionYear, 
  existingRecruits 
}) => {
  const isReadOnly = user.role === 'PROVINCE_ADMIN' || user.role === 'VIEWER';
  const emptyFamilyMember: FamilyMember = { fullName: '', job: '', phoneNumber: '', birthYear: '' };
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const buildMergedRecruit = (source?: Recruit): Recruit => {
    if (!source) {
      return {
        id: generateId(), citizenId: '', fullName: '', dob: '', phoneNumber: '', avatarUrl: '',
        address: { province: user.unit.province, commune: user.unit.commune, village: '', street: '' },
        hometown: { province: '', commune: '', village: '' },
        physical: { height: 0, weight: 0, chest: 0, bmi: 0, healthGrade: 0, bloodPressure: '', note: '' },
        details: { 
          education: 'Lớp 12', ethnicity: 'Kinh', religion: 'Không', maritalStatus: 'Độc thân', 
          job: '', workAddress: '', gradeGroup: '', salaryLevel: '',
          politicalStatus: 'Doan_Vien', gifted: '',
          familyComposition: 'Bần nông', personalComposition: 'Phụ thuộc',
          proposedForSelection: false
        },
        family: { father: { ...emptyFamilyMember }, mother: { ...emptyFamilyMember }, wife: { ...emptyFamilyMember }, children: '' },
        status: initialStatus || RecruitmentStatus.SOURCE,
        recruitmentYear: sessionYear,
        attachments: []
      };
    }

    const cv = source.curriculumVitae || {};
    const fatherName = source.family?.father?.fullName || cv.fatherName || '';
    const fatherBirthYear = source.family?.father?.birthYear || cv.fatherBirthDate || '';
    const fatherJob = source.family?.father?.job || cv.fatherJob || '';
    const fatherPhone = source.family?.father?.phoneNumber || '';

    const motherName = source.family?.mother?.fullName || cv.motherName || '';
    const motherBirthYear = source.family?.mother?.birthYear || cv.motherBirthDate || '';
    const motherJob = source.family?.mother?.job || cv.motherJob || '';
    const motherPhone = source.family?.mother?.phoneNumber || '';

    const wifeName = source.family?.wife?.fullName || cv.spouseName || '';
    const wifeBirthYear = source.family?.wife?.birthYear || cv.spouseBirthDate || '';
    const wifeJob = source.family?.wife?.job || cv.spouseJob || '';

    const height = source.physical?.height || 0;
    const weight = source.physical?.weight || 0;
    let bmi = source.physical?.bmi || 0;
    if (height > 0 && weight > 0 && (!bmi || bmi === 0)) {
      const h = height / 100;
      bmi = parseFloat((weight / (h * h)).toFixed(2));
    }

    const mergedRecruit: Recruit = {
      ...source,
      physical: {
        height,
        weight,
        chest: source.physical?.chest || 0,
        bmi,
        healthGrade: source.physical?.healthGrade || 0,
        bloodPressure: source.physical?.bloodPressure || '',
        note: source.physical?.note || ''
      },
      family: {
        father: {
          fullName: fatherName,
          birthYear: fatherBirthYear,
          job: fatherJob,
          phoneNumber: fatherPhone,
        },
        mother: {
          fullName: motherName,
          birthYear: motherBirthYear,
          job: motherJob,
          phoneNumber: motherPhone,
        },
        wife: {
          fullName: wifeName,
          birthYear: wifeBirthYear,
          job: wifeJob,
          phoneNumber: source.family?.wife?.phoneNumber || '',
        },
        children: source.family?.children || cv.childrenCount || '',
      },
    };

    const autoCV = helperAutoFillCV(mergedRecruit);
    mergedRecruit.curriculumVitae = {
      ...autoCV,
      ...cv,
      fatherName: fatherName || cv.fatherName || autoCV.fatherName,
      fatherBirthDate: fatherBirthYear || cv.fatherBirthDate || autoCV.fatherBirthDate,
      fatherJob: fatherJob || cv.fatherJob || autoCV.fatherJob,
      motherName: motherName || cv.motherName || autoCV.motherName,
      motherBirthDate: motherBirthYear || cv.motherBirthDate || autoCV.motherBirthDate,
      motherJob: motherJob || cv.motherJob || autoCV.motherJob,
      spouseName: wifeName || cv.spouseName || autoCV.spouseName,
      spouseBirthDate: wifeBirthYear || cv.spouseBirthDate || autoCV.spouseBirthDate,
      spouseJob: wifeJob || cv.spouseJob || autoCV.spouseJob,
      childrenCount: mergedRecruit.family.children || autoCV.childrenCount,
    };

    return mergedRecruit;
  };

  const [formData, setFormData] = useState<Recruit>(() => buildMergedRecruit(initialData));

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'CURRICULUM_VITAE'>('PROFILE');

  // Chỉ tự động xét chuyển trạng thái khi cán bộ chủ động sửa các trường thể lực hoặc học vấn
  const physicalEditedByUserRef = useRef(false);
  const educationEditedByUserRef = useRef(false);

  useEffect(() => {
    physicalEditedByUserRef.current = false;
    educationEditedByUserRef.current = false;
    if (initialData) {
      setFormData(buildMergedRecruit(initialData));
    }
  }, [initialData]);

  // Logic tự động tính BMI, xét hoãn sức khỏe và phân loại danh sách khám tuyển
  useEffect(() => {
    if (!physicalEditedByUserRef.current) {
      return;
    }

    const { height, weight, chest, bmi, healthGrade } = formData.physical;
    let nextStatus = formData.status;
    let nextReason = formData.defermentReason || '';

    // 1. Tự động tính BMI (Vẫn tính nhưng không tự chuyển status cho DS 1,2,3)
    let calculatedBmi = bmi;
    if (height > 0 && weight > 0) {
      const h = height / 100;
      calculatedBmi = parseFloat((weight / (h * h)).toFixed(2));
      if (calculatedBmi !== bmi) {
        setFormData(prev => ({ ...prev, physical: { ...prev.physical, bmi: calculatedBmi } }));
        return; 
      }
    }

    // Không áp dụng logic tự động Tạm hoãn cho DS 1, 2, 3, Thông tư 50 (KTC, CGNN), Sơ khám, Miễn gọi, Chốt hồ sơ, Nhập ngũ, Loại khỏi nguồn, Đã xóa
    const exemptFromAutoDeferStatus = [
      RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
      RecruitmentStatus.EXEMPT_REGISTRATION,
      RecruitmentStatus.FIRST_TIME_REGISTRATION,
      RecruitmentStatus.NOT_SELECTED_TT50,
      RecruitmentStatus.KTC_KHONG_TUYEN_CHON,
      RecruitmentStatus.KTC_CHUA_GOI_NHAP_NGU,
      RecruitmentStatus.PRE_CHECK_PASSED,
      RecruitmentStatus.PRE_CHECK_FAILED,
      RecruitmentStatus.EXEMPTED,
      RecruitmentStatus.FINALIZED,
      RecruitmentStatus.ENLISTED,
      RecruitmentStatus.REMOVED_FROM_SOURCE,
      RecruitmentStatus.DELETED
    ];
    
    if (exemptFromAutoDeferStatus.includes(formData.status)) {
        return;
    }

    // 2. Logic Tự động Tạm hoãn về Sức khỏe (Chỉ áp dụng từ DS 4 trở đi khi có chỉnh sửa chỉ số thể lực)
    const isUnderHeight = height > 0 && height < 157;
    const isUnderWeight = weight > 0 && weight < 43;
    const isUnderChest = chest > 0 && chest < 75;
    const isInvalidBmi = calculatedBmi > 0 && (calculatedBmi > 29.9 || calculatedBmi < 18.5);
    const isFailingHealthGrade = healthGrade !== undefined && healthGrade >= 4 && healthGrade <= 6;
    const hasEnteredPhysicalData = height > 0 || weight > 0 || chest > 0 || calculatedBmi > 0 || (healthGrade !== undefined && healthGrade > 0);

    // Nếu công dân đang ở giai đoạn Khám tuyển (Đạt hoặc Không đạt khám tuyển)
    if (formData.status === RecruitmentStatus.MED_EXAM_PASSED || formData.status === RecruitmentStatus.MED_EXAM_FAILED) {
      if (healthGrade !== undefined && healthGrade > 0) {
        if (healthGrade >= 1 && healthGrade <= 3 && !isUnderHeight && !isUnderWeight && !isUnderChest && !isInvalidBmi) {
          nextStatus = RecruitmentStatus.MED_EXAM_PASSED;
          nextReason = '';
        } else {
          nextStatus = RecruitmentStatus.MED_EXAM_FAILED;
          nextReason = isFailingHealthGrade ? `Sức khỏe loại ${healthGrade}` : LEGAL_DEFERMENT_REASONS[0];
        }
      }
    } else {
      // Đối với các trạng thái khác (Nguồn, Tạm hoãn sức khỏe...):
      if (isUnderHeight || isUnderWeight || isUnderChest || isInvalidBmi || isFailingHealthGrade) {
        nextStatus = RecruitmentStatus.DEFERRED;
        nextReason = isFailingHealthGrade ? `Sức khỏe loại ${healthGrade}` : LEGAL_DEFERMENT_REASONS[0];
      } else if (
        hasEnteredPhysicalData &&
        formData.status === RecruitmentStatus.DEFERRED && 
        (formData.defermentReason === LEGAL_DEFERMENT_REASONS[0] || formData.defermentReason?.startsWith('Sức khỏe loại '))
      ) {
        // Chỉ khôi phục về Nguồn khi cán bộ thực sự nhập lại chỉ số thể lực đạt yêu cầu
        nextStatus = RecruitmentStatus.SOURCE;
        nextReason = '';
      }
      // TUYỆT ĐỐI KHÔNG tự động chuyển trạng thái NGUỒN hoặc các trạng thái khác thành MED_EXAM_PASSED (ĐẠT)
    }

    if (nextStatus !== formData.status || nextReason !== formData.defermentReason) {
      setFormData(prev => ({ ...prev, status: nextStatus, defermentReason: nextReason }));
    }
  }, [formData.physical.height, formData.physical.weight, formData.physical.chest, formData.physical.bmi, formData.physical.healthGrade]);

  // LOGIC TỰ ĐỘNG XÉT TẠM HOÃN THEO HỌC VẤN
  useEffect(() => {
    if (!educationEditedByUserRef.current) {
      return;
    }

    const edu = formData.details.education;
    let nextStatus = formData.status;
    let nextReason = formData.defermentReason;

    // Không áp dụng logic tự động Tạm hoãn cho DS 1, 2, 3, Thông tư 50 (KTC, CGNN), Sơ khám, Khám tuyển, Miễn gọi, Chốt hồ sơ, Nhập ngũ, Loại khỏi nguồn, Đã xóa
    const exemptFromAutoDeferStatus = [
      RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
      RecruitmentStatus.EXEMPT_REGISTRATION,
      RecruitmentStatus.FIRST_TIME_REGISTRATION,
      RecruitmentStatus.NOT_SELECTED_TT50,
      RecruitmentStatus.KTC_KHONG_TUYEN_CHON,
      RecruitmentStatus.KTC_CHUA_GOI_NHAP_NGU,
      RecruitmentStatus.PRE_CHECK_PASSED,
      RecruitmentStatus.PRE_CHECK_FAILED,
      RecruitmentStatus.MED_EXAM_PASSED,
      RecruitmentStatus.MED_EXAM_FAILED,
      RecruitmentStatus.EXEMPTED,
      RecruitmentStatus.FINALIZED,
      RecruitmentStatus.ENLISTED,
      RecruitmentStatus.REMOVED_FROM_SOURCE,
      RecruitmentStatus.DELETED
    ];

    if (exemptFromAutoDeferStatus.includes(formData.status)) {
        return;
    }

    const isSpecialArea = user.isSpecialArea;
    const isProposedL7 = edu === 'Lớp 7' && formData.details.proposedForSelection;

    if (edu === 'Đang học ĐH' || edu === 'Đang học CĐ') {
      nextStatus = RecruitmentStatus.DEFERRED;
      nextReason = LEGAL_DEFERMENT_REASONS[6];
    } 
    // Logic mới: Nếu là xã đặc thù HOẶC Lớp 7 được đề xuất thì KHÔNG hoãn học vấn thấp
    else if (!isSpecialArea && !isProposedL7 && LOW_EDUCATION_GRADES.includes(edu)) {
      nextStatus = RecruitmentStatus.DEFERRED;
      nextReason = LEGAL_DEFERMENT_REASONS[8];
    }
    // Nếu trước đó đang hoãn vì học vấn mà nay thỏa mãn điều kiện mới thì khôi phục về nguồn
    else if (formData.status === RecruitmentStatus.DEFERRED && 
            (formData.defermentReason === LEGAL_DEFERMENT_REASONS[6] || formData.defermentReason === LEGAL_DEFERMENT_REASONS[8])) {
      
      // Nếu là hoãn học vấn thấp mà nay là xã đặc thù hoặc được đề xuất lớp 7
      if (formData.defermentReason === LEGAL_DEFERMENT_REASONS[8] && (isSpecialArea || isProposedL7)) {
          nextStatus = RecruitmentStatus.SOURCE;
          nextReason = '';
      }
      // Nếu là hoãn ĐH/CĐ nhưng nay không còn là đang học (do thay đổi trong form)
      else if (formData.defermentReason === LEGAL_DEFERMENT_REASONS[6] && edu !== 'Đang học ĐH' && edu !== 'Đang học CĐ') {
          nextStatus = RecruitmentStatus.SOURCE;
          nextReason = '';
      }
    }

    if (nextStatus !== formData.status || nextReason !== formData.defermentReason) {
      setFormData(prev => ({ ...prev, status: nextStatus, defermentReason: nextReason }));
    }
  }, [formData.details.education, formData.details.proposedForSelection, user.isSpecialArea]);

  const handleChange = (field: string, value: any) => {
    if (
      field === 'physical.height' ||
      field === 'physical.weight' ||
      field === 'physical.chest' ||
      field === 'physical.bmi' ||
      field === 'physical.healthGrade'
    ) {
      physicalEditedByUserRef.current = true;
    } else if (field === 'details.education' || field === 'details.proposedForSelection') {
      educationEditedByUserRef.current = true;
    }
    setFormData(prev => {
      const newData = { ...prev };
      const parts = field.split('.');
      let target = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        // @ts-ignore
        target = target[parts[i]] = { ...target[parts[i]] };
      }
      // @ts-ignore
      target[parts[parts.length - 1]] = value;

      // ĐỒNG BỘ TỰ ĐỘNG VÀO SƠ YẾU LÝ LỊCH (MỤC I)
      const currentCV = newData.curriculumVitae ? { ...newData.curriculumVitae } : helperAutoFillCV(newData);
      let cvNeedsUpdate = false;

      if (field === 'family.father.fullName') {
        currentCV.fatherName = value;
        cvNeedsUpdate = true;
      } else if (field === 'family.father.birthYear') {
        currentCV.fatherBirthDate = value;
        cvNeedsUpdate = true;
      } else if (field === 'family.father.job') {
        currentCV.fatherJob = value;
        if (isParentDeceased(value)) {
          currentCV.fatherStatus = 'Chết';
        }
        cvNeedsUpdate = true;
      } else if (field === 'curriculumVitae.fatherStatus') {
        currentCV.fatherStatus = value;
        cvNeedsUpdate = true;
      } else if (field === 'family.mother.fullName') {
        currentCV.motherName = value;
        cvNeedsUpdate = true;
      } else if (field === 'family.mother.birthYear') {
        currentCV.motherBirthDate = value;
        cvNeedsUpdate = true;
      } else if (field === 'family.mother.job') {
        currentCV.motherJob = value;
        if (isParentDeceased(value)) {
          currentCV.motherStatus = 'Chết';
        }
        cvNeedsUpdate = true;
      } else if (field === 'curriculumVitae.motherStatus') {
        currentCV.motherStatus = value;
        cvNeedsUpdate = true;
      } else if (field === 'family.wife.fullName') {
        currentCV.spouseName = value;
        cvNeedsUpdate = true;
      } else if (field === 'family.wife.birthYear') {
        currentCV.spouseBirthDate = value;
        cvNeedsUpdate = true;
      } else if (field === 'family.wife.job') {
        currentCV.spouseJob = value;
        cvNeedsUpdate = true;
      } else if (field === 'family.children') {
        currentCV.childrenCount = value;
        cvNeedsUpdate = true;
      } else if (field === 'fullName') {
        currentCV.fullNameUpper = value ? value.toUpperCase() : '';
        currentCV.aliasName = value;
        cvNeedsUpdate = true;
      } else if (field === 'citizenId') {
        currentCV.citizenId = value;
        cvNeedsUpdate = true;
      } else if (field === 'dob') {
        if (value) {
          const p = value.split(/[-/.]/);
          if (p.length === 3) {
            if (p[0].length === 4) {
              currentCV.birthYear = p[0];
              currentCV.birthMonth = p[1];
              currentCV.birthDay = p[2];
            } else {
              currentCV.birthDay = p[0];
              currentCV.birthMonth = p[1];
              currentCV.birthYear = p[2];
            }
            cvNeedsUpdate = true;
          }
        }
      } else if (field === 'details.familyComposition') {
        currentCV.familyClass = value;
        cvNeedsUpdate = true;
      } else if (field === 'details.personalComposition') {
        currentCV.personalClass = value;
        cvNeedsUpdate = true;
      } else if (field === 'details.education') {
        currentCV.educationLevel = value;
        cvNeedsUpdate = true;
      } else if (field === 'details.school') {
        currentCV.qualificationLevel = value;
        cvNeedsUpdate = true;
      } else if (field === 'details.major') {
        currentCV.major = value;
        cvNeedsUpdate = true;
      } else if (field === 'details.job') {
        currentCV.job = value;
        cvNeedsUpdate = true;
      } else if (field === 'details.workAddress') {
        currentCV.workplace = value;
        cvNeedsUpdate = true;
      } else if (field === 'details.partyEntryDate') {
        currentCV.communistPartyJoinedDate = value;
        cvNeedsUpdate = true;
      } else if (field === 'details.rewards') {
        currentCV.commendations = value;
        cvNeedsUpdate = true;
      } else if (field === 'details.disciplines') {
        currentCV.disciplinaryAction = value;
        cvNeedsUpdate = true;
      } else if (field === 'details.siblingCount') {
        currentCV.totalSiblings = value;
        cvNeedsUpdate = true;
      } else if (field === 'details.birthOrder') {
        currentCV.siblingOrder = value;
        cvNeedsUpdate = true;
      }

      if (cvNeedsUpdate) {
        newData.curriculumVitae = currentCV;
      }

      return newData;
    });
  };

  const readImageAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.onerror = (ev) => reject(ev);
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ảnh quá lớn (vượt quá 2MB). Vui lòng chọn ảnh nhẹ hơn.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await api.uploadFile(file, 'avatar');
      handleChange('avatarUrl', url);
    } catch (err: any) {
      try {
        const base64 = await readImageAsBase64(file);
        alert(`Không thể tải ảnh lên Cloudinary: ${err.message || err}. Hệ thống sẽ lưu tạm dưới dạng ảnh cục bộ.`);
        handleChange('avatarUrl', base64);
      } catch {
        alert(`Lỗi đọc tệp ảnh: ${err?.message || err}`);
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAddAttachment = (file: RecruitAttachment) => {
    setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), file] }));
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments?.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || isSaving) return;
    if (isUploadingAvatar || isUploadingAttachment) {
      alert("Hệ thống đang tải lên ảnh hoặc tệp PDF, vui lòng đợi hoàn tất trước khi lưu.");
      return;
    }

    // --- KIỂM TRA TRÙNG LẶP DỮ LIỆU ---
    const cleanCitizenId = formData.citizenId?.trim();
    const cleanFullName = formData.fullName?.trim();
    const normalizedNewName = removeVietnameseTones(cleanFullName.toLowerCase());

    const otherRecruits = existingRecruits.filter(
      r => r.id !== formData.id && r.recruitmentYear === formData.recruitmentYear
    );

    // 1. Kiểm tra trùng CCCD
    if (cleanCitizenId) {
      const duplicateCCCD = otherRecruits.find(r => r.citizenId?.trim() === cleanCitizenId);
      if (duplicateCCCD) {
        alert(`LỖI: Số CCCD "${cleanCitizenId}" đã tồn tại trong hệ thống (Hồ sơ: ${duplicateCCCD.fullName}).\n\nMỗi công dân chỉ được có duy nhất một mã định danh. Vui lòng kiểm tra lại.`);
        return;
      }
    } 
    // 2. Kiểm tra trùng tên
    else {
      const duplicateName = otherRecruits.find(r => removeVietnameseTones(r.fullName.toLowerCase()) === normalizedNewName);
      if (duplicateName) {
        const confirmSave = window.confirm(
          `CẢNH BÁO: Công dân "${cleanFullName}" trùng tên với hồ sơ "${duplicateName.fullName}" (Sinh năm: ${duplicateName.dob?.split('-')[0] || '---'}) đã có trong hệ thống.\n\nVì công dân hiện tại chưa có số CCCD để đối soát duy nhất, bạn có chắc chắn đây là hai người khác nhau và muốn tiếp tục lưu không?`
        );
        if (!confirmSave) return;
      }
    }
    
    const birthYear = parseInt(formData.dob.split('-')[0] || '0');
    const birthMonth = parseInt(formData.dob.split('-')[1] || '0');
    // Tính tuổi trong năm tuyển quân sessionYear
    const age = sessionYear - birthYear;
    const isJanSpecialCase = birthYear === (sessionYear - 17) && birthMonth === 1;
    
    const isSourceTab = ![
      RecruitmentStatus.NOT_ALLOWED_REGISTRATION, 
      RecruitmentStatus.EXEMPT_REGISTRATION, 
      RecruitmentStatus.FIRST_TIME_REGISTRATION,
      RecruitmentStatus.REMOVED_FROM_SOURCE,
      RecruitmentStatus.DELETED
    ].includes(formData.status);

    if (birthYear > 0 && isSourceTab && age < 18 && !isJanSpecialCase) {
        alert(`Công dân sinh năm ${birthYear} (${age} tuổi) chưa đủ 18 tuổi trong năm tuyển quân ${sessionYear}.\nVui lòng chuyển sang "DS 3: Đăng ký lần đầu" nếu đủ 17 tuổi.`);
        return;
    }

    // Yêu cầu chọn hình thức đăng ký cho DS 3
    if (formData.status === RecruitmentStatus.FIRST_TIME_REGISTRATION && !formData.details.registrationMethod) {
        alert("Vui lòng chọn Hình thức đăng ký (Trực tiếp hoặc Trực tuyến) cho công dân này.");
        return;
    }

    setIsSaving(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const currentEduLower = (formData.details.education || '').toLowerCase();
  const isStudyingHigherEd =
    formData.details.education === 'Đang học ĐH' ||
    formData.details.education === 'Đang học CĐ' ||
    currentEduLower.includes('đang học đại học') ||
    currentEduLower.includes('đang học cao đẳng') ||
    currentEduLower.includes('đang học đh') ||
    currentEduLower.includes('đang học cđ');
  const isDS3 = formData.status === RecruitmentStatus.FIRST_TIME_REGISTRATION;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        <div className="bg-military-800 text-white border-b p-5 flex justify-between items-center shrink-0 shadow-lg relative z-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg"><UserIcon size={24}/></div>
             <div>
               <h2 className="text-xl font-black uppercase tracking-tight">
                 {initialData ? (isReadOnly ? 'Hồ sơ quân nhân' : 'Cập nhật dữ liệu') : 'Tiếp nhận công dân mới'}
               </h2>
               {initialData && (
                 <div className="flex items-center gap-2 mt-1">
                   <span className="text-xs text-white/80 font-bold">Trạng thái:</span>
                   <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                     formData.status === RecruitmentStatus.SOURCE ? 'bg-green-700 text-white' :
                     formData.status === RecruitmentStatus.MED_EXAM_PASSED ? 'bg-emerald-600 text-white' :
                     'bg-white/20 text-white border border-white/30'
                   }`}>
                     {getStatusLabel(formData.status)}
                   </span>
                   {formData.status !== RecruitmentStatus.SOURCE && !isReadOnly && (
                     <button
                       type="button"
                       onClick={() => {
                         if (window.confirm('Xác nhận chuyển công dân này về trạng thái Nguồn (DS 4)?')) {
                           setFormData(prev => ({ 
                             ...prev, 
                             status: RecruitmentStatus.SOURCE, 
                             defermentReason: '',
                             enlistmentType: undefined,
                             enlistmentUnit: undefined,
                             enlistmentDate: undefined 
                           }));
                         }
                       }}
                       className="text-[9px] bg-green-600 hover:bg-green-500 text-white font-black px-2 py-0.5 rounded uppercase border border-green-400 transition-colors shadow-sm cursor-pointer"
                       title="Chuyển công dân này về trạng thái Nguồn (DS 4)"
                     >
                       Khôi phục về Nguồn
                     </button>
                   )}
                 </div>
               )}
             </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-gray-50/50">
          {/* VĂN BẢN WORD HỒ SƠ CÔNG DÂN (TỰ ĐỘNG XUẤT HIỆN Ở ĐẦU MỖI HỒ SƠ) */}
          <WordDocumentSection 
            wordDocument={formData.wordDocument}
            user={user}
            recruitName={formData.fullName}
            recruitData={formData}
            isReadOnly={isReadOnly}
            onUpdateWordDoc={(newWordDoc: RecruitWordDocument | undefined) => {
              setFormData(prev => ({ ...prev, wordDocument: newWordDoc }));
            }}
          />

          {isReadOnly && (
            <div className="bg-blue-600 text-white p-4 rounded-xl mb-8 flex items-center justify-between shadow-lg animate-pulse">
               <div className="flex items-center gap-3">
                  <ShieldAlert size={24}/> 
                  <span className="text-sm font-black uppercase tracking-widest">Dữ liệu đang được bảo vệ (Chế độ xem)</span>
               </div>
               <div className="text-[10px] font-bold opacity-75">Ban CHQS Tỉnh giám sát</div>
            </div>
          )}

          {/* TAB CHUYỂN ĐỔI GIỮA THÔNG TIN CHUNG VÀ SƠ YẾU LÝ LỊCH (MỤC I, II, III) */}
          <div className="flex items-center gap-3 mb-6 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('PROFILE')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-black text-xs uppercase transition-all ${
                activeTab === 'PROFILE'
                  ? 'bg-military-700 text-white shadow-md scale-[1.01]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <UserIcon size={18} /> Thông tin chung
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CURRICULUM_VITAE')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-black text-xs uppercase transition-all ${
                activeTab === 'CURRICULUM_VITAE'
                  ? 'bg-blue-700 text-white shadow-md scale-[1.01]'
                  : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50/80'
              }`}
            >
              <FileText size={18} /> Sơ yếu lý lịch (Mục I, II, III)
            </button>
          </div>

          {activeTab === 'CURRICULUM_VITAE' ? (
            <CurriculumVitaeTab
              formData={formData}
              isReadOnly={isReadOnly}
              onUpdateCV={(updatedCV) => {
                setFormData(prev => {
                  const updatedRecruit = { ...prev, curriculumVitae: updatedCV };
                  const fam = {
                    ...prev.family,
                    father: {
                      ...(prev.family?.father || { fullName: '', birthYear: '', job: '', phoneNumber: '' }),
                      fullName: updatedCV.fatherName !== undefined ? updatedCV.fatherName : (prev.family?.father?.fullName || ''),
                      birthYear: updatedCV.fatherBirthDate !== undefined ? updatedCV.fatherBirthDate : (prev.family?.father?.birthYear || ''),
                      job: updatedCV.fatherJob !== undefined ? updatedCV.fatherJob : (prev.family?.father?.job || ''),
                    },
                    mother: {
                      ...(prev.family?.mother || { fullName: '', birthYear: '', job: '', phoneNumber: '' }),
                      fullName: updatedCV.motherName !== undefined ? updatedCV.motherName : (prev.family?.mother?.fullName || ''),
                      birthYear: updatedCV.motherBirthDate !== undefined ? updatedCV.motherBirthDate : (prev.family?.mother?.birthYear || ''),
                      job: updatedCV.motherJob !== undefined ? updatedCV.motherJob : (prev.family?.mother?.job || ''),
                    },
                    wife: {
                      ...(prev.family?.wife || { fullName: '', birthYear: '', job: '', phoneNumber: '' }),
                      fullName: updatedCV.spouseName !== undefined ? updatedCV.spouseName : (prev.family?.wife?.fullName || ''),
                      birthYear: updatedCV.spouseBirthDate !== undefined ? updatedCV.spouseBirthDate : (prev.family?.wife?.birthYear || ''),
                      job: updatedCV.spouseJob !== undefined ? updatedCV.spouseJob : (prev.family?.wife?.job || ''),
                    },
                    children: updatedCV.childrenCount !== undefined ? updatedCV.childrenCount : (prev.family?.children || ''),
                  };
                  updatedRecruit.family = fam;

                  if (updatedCV.fullNameUpper && !prev.fullName) {
                    updatedRecruit.fullName = updatedCV.fullNameUpper;
                  }
                  if (updatedCV.citizenId && !prev.citizenId) {
                    updatedRecruit.citizenId = updatedCV.citizenId;
                  }

                  return updatedRecruit;
                });
              }}
            />
          ) : (
            <>
              {/* MỤC CHỌN HÌNH THỨC ĐĂNG KÝ - ĐƯA LÊN ĐẦU CHO DS 3 */}
              {isDS3 && (
                <div className="bg-cyan-50 border-2 border-cyan-200 p-5 rounded-2xl mb-8 animate-in slide-in-from-top-2 duration-500">
                   <label className="block text-xs font-black text-cyan-800 uppercase mb-3 flex items-center gap-2">
                      <UserPlus size={18} className="text-cyan-600"/> Hình thức đăng ký Nghĩa vụ quân sự (Bắt buộc)
                   </label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => handleChange('details.registrationMethod', 'DIRECT')}
                        className={`flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 transition-all font-black uppercase text-xs ${
                          formData.details.registrationMethod === 'DIRECT' 
                            ? 'bg-cyan-600 border-cyan-700 text-white shadow-lg scale-[1.02]' 
                            : 'bg-white border-gray-200 text-gray-400 hover:border-cyan-200'
                        }`}
                        disabled={isReadOnly}
                      >
                        <UserIconAlt size={20}/> Đăng ký trực tiếp
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleChange('details.registrationMethod', 'ONLINE')}
                        className={`flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 transition-all font-black uppercase text-xs ${
                          formData.details.registrationMethod === 'ONLINE' 
                            ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-[1.02]' 
                            : 'bg-white border-gray-200 text-gray-400 hover:border-blue-200'
                        }`}
                        disabled={isReadOnly}
                      >
                        <Globe size={20}/> Đăng ký trực tuyến
                      </button>
                   </div>
                   <p className="text-[10px] text-cyan-600 font-bold italic mt-2">* Thông tin này dùng để phân loại cách thức công dân thực hiện nghĩa vụ tại địa phương.</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="flex flex-col items-center gap-2 shrink-0 mx-auto md:mx-0">
                            <div className="w-32 h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative group shadow-sm">
                               {isUploadingAvatar ? (
                                 <div className="text-center p-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-military-600 mx-auto"></div>
                                    <p className="text-[8px] font-black text-gray-400 mt-2 uppercase">Đang tải...</p>
                                 </div>
                               ) : formData.avatarUrl ? (
                                 <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="Avatar"/>
                               ) : (
                                 <div className="text-center p-2">
                                    <Camera size={32} className="mx-auto text-gray-300" />
                                    <p className="text-[8px] font-black text-gray-400 mt-2 uppercase">Ảnh chân dung</p>
                                 </div>
                               )}
                               {!isReadOnly && !isUploadingAvatar && (
                                 <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-black uppercase p-2 gap-1 text-center">
                                    <Camera size={18} />
                                    <span>{formData.avatarUrl ? 'Thay ảnh mới' : 'Tải ảnh lên'}</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                 </label>
                               )}
                            </div>

                            {!isReadOnly && !isUploadingAvatar && (
                              <div className="flex items-center gap-1.5 w-32 mt-1">
                                <label className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 bg-military-50 text-military-800 hover:bg-military-100 rounded-lg text-[10px] font-black uppercase cursor-pointer border border-military-200 transition-colors text-center">
                                  <Camera size={11} />
                                  <span>{formData.avatarUrl ? 'Thay' : 'Tải'}</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                </label>
                                {formData.avatarUrl && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm("Xác nhận xóa ảnh chân dung của công dân này?")) {
                                        handleChange('avatarUrl', '');
                                      }
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-black uppercase border border-red-200 transition-colors text-center"
                                    title="Xóa ảnh công dân"
                                  >
                                    <Trash2 size={11} />
                                    <span>Xóa</span>
                                  </button>
                                )}
                              </div>
                            )}
                         </div>

                        <div className="flex-1 space-y-4">
                           <h3 className="text-gray-900 font-bold border-b border-gray-200 pb-3 flex items-center gap-2 uppercase text-sm mb-4">
                              <UserIcon size={18} className="text-military-600" /> Lý lịch trích ngang
                           </h3>
                           <div className="grid grid-cols-2 gap-4">
                             <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Họ và tên công dân</label>
                                <input required type="text" readOnly={isReadOnly} className="w-full rounded-lg border-gray-300 border p-2.5 font-black uppercase text-gray-800 focus:ring-2 focus:ring-military-50 outline-none" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)}/>
                             </div>
                             <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Ngày sinh</label>
                                <input required type="date" readOnly={isReadOnly} className="w-full rounded-lg border-gray-300 border p-2.5 font-bold text-gray-800" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)}/>
                             </div>
                             <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Số CCCD</label>
                                <input type="text" readOnly={isReadOnly} className="w-full rounded-lg border-gray-300 border p-2.5 font-mono font-black text-blue-700" value={formData.citizenId} onChange={(e) => handleChange('citizenId', e.target.value)}/>
                             </div>
                           </div>
                        </div>
                     </div>

                     <LocationFields 
                        label="Địa chỉ thường trú (Theo hộ khẩu)" icon={null} prefix="address"
                        province={formData.address.province} commune={formData.address.commune} village={formData.address.village} street={formData.address.street}
                        isLocalityFixed={!!user.unit.commune} isReadOnly={isReadOnly} onUpdate={handleChange}
                     />
                   </div>

                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <FamilyFields formData={formData} isReadOnly={isReadOnly} handleChange={handleChange} />
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <QualityFields formData={formData} isReadOnly={isReadOnly} handleChange={handleChange} isStudyingHigherEd={isStudyingHigherEd} />
                     <StatusFields formData={formData} isReadOnly={isReadOnly} handleChange={handleChange} />
                   </div>

                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <AttachmentFields 
                        attachments={formData.attachments} 
                        isReadOnly={isReadOnly} 
                        onUpload={handleAddAttachment} 
                        onDelete={handleRemoveAttachment}
                        onUploadingChange={setIsUploadingAttachment}
                     />
                   </div>
                </div>
              </div>
            </>
          )}
        </form>

        <div className="bg-white p-5 border-t flex items-center justify-between shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] relative z-10">
          <div className="hidden md:block text-left">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Đơn vị tiếp nhận hồ sơ:</p>
             <p className="text-xs font-black text-military-800 uppercase">{user.fullName}</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button type="button" onClick={onClose} className="flex-1 md:flex-none px-6 py-2.5 text-xs font-black text-gray-500 uppercase hover:text-gray-700 transition-colors">Hủy bỏ</button>
            {!isReadOnly && (
              <button 
                type="submit" 
                onClick={handleSubmit}
                disabled={isSaving || isUploadingAvatar || isUploadingAttachment}
                className="flex-1 md:flex-none px-10 py-2.5 bg-military-700 text-white rounded-xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-military-800 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={18} /> {isSaving ? 'Đang lưu...' : (isUploadingAvatar || isUploadingAttachment) ? 'Đang tải tệp...' : 'Lưu hồ sơ công dân'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitForm;
