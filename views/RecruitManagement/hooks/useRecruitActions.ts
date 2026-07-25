
// Fix: Import React to resolve namespace errors for React.Dispatch and React.SetStateAction
import React, { useState } from 'react';
import { Recruit, RecruitmentStatus, User } from '../../../types';
import { api } from '../../../api';
import { ExcelExportService } from '../../../services/ExcelExportService';

export const useRecruitActions = (
  user: User, 
  sessionYear: number, 
  onUpdate: (data: Recruit) => void,
  setRecruits: React.Dispatch<React.SetStateAction<Recruit[]>>
) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showTT50Modal, setShowTT50Modal] = useState(false); 
  const [showPreCheckFailModal, setShowPreCheckFailModal] = useState(false); // Modal mới cho Loại sơ tuyển
  const [reasonModalConfig, setReasonModalConfig] = useState<{ recruit: Recruit, type: 'DEFERRED' | 'EXEMPTED' } | null>(null);
  const [tt50Recruit, setTt50Recruit] = useState<Recruit | null>(null); 
  const [preCheckRecruit, setPreCheckRecruit] = useState<Recruit | null>(null); // Recruit đang bị loại sơ tuyển
  const [recruitToRemove, setRecruitToRemove] = useState<Recruit | null>(null);
  const [removeReason, setRemoveReason] = useState('');
  const [failureReasons, setFailureReasons] = useState<Record<string, string>>({});
  
  const [enlistmentUnits, setEnlistmentUnits] = useState<Record<string, string>>({});
  const [enlistmentDates, setEnlistmentDates] = useState<Record<string, string>>({});

  const handleExportExcel = (filteredRecruits: Recruit[], activeTabId: string, activeTabLabel: string) => {
    if (filteredRecruits.length === 0) {
      alert("Không có dữ liệu trong danh sách hiện tại để xuất Excel!");
      return;
    }
    try {
      const unitName = user.unit.commune || user.unit.province || 'CO_QUAN_CHUYEN_TRACH';
      
      let templateId = activeTabId;
      if (activeTabId === 'EXEMPTED_LIST') templateId = 'TEMPLATE_EXEMPTED';
      if (activeTabId === 'DEFERRED_LIST') templateId = 'TEMPLATE_DEFERRED';
      if (activeTabId === 'ALL') templateId = 'TEMPLATE_4';
      if (activeTabId === 'ENLISTED') templateId = 'TEMPLATE_17A';

      ExcelExportService.exportToTemplate(filteredRecruits, templateId, sessionYear, unitName, activeTabLabel);
    } catch (e) {
      console.error("Lỗi xuất Excel:", e);
      alert("Có lỗi khi tạo file Excel. Vui lòng kiểm tra dữ liệu.");
    }
  };

  const handleConfirmRemove = () => {
    if (recruitToRemove) {
      onUpdate({ 
        ...recruitToRemove, 
        status: RecruitmentStatus.REMOVED_FROM_SOURCE, 
        defermentReason: removeReason,
        enlistmentType: undefined,
        enlistmentUnit: undefined,
        enlistmentDate: undefined
      });
      setShowRemoveModal(false); 
      setRecruitToRemove(null); 
      setRemoveReason('');
    }
  };

  const handleOpenReasonModal = (recruit: Recruit, type: 'DEFERRED' | 'EXEMPTED') => {
    setReasonModalConfig({ recruit, type });
    setShowReasonModal(true);
  };

  const handleApplyReason = (reason: string) => {
    if (reasonModalConfig) {
      onUpdate({ 
        ...reasonModalConfig.recruit, 
        status: reasonModalConfig.type === 'DEFERRED' ? RecruitmentStatus.DEFERRED : RecruitmentStatus.EXEMPTED,
        defermentReason: reason,
        previousStatus: reasonModalConfig.recruit.status,
        enlistmentType: undefined,
        enlistmentUnit: undefined,
        enlistmentDate: undefined
      });
      setShowReasonModal(false);
      setReasonModalConfig(null);
    }
  };

  const handleApplyTT50Reason = (reason: string, reasonIndex: number) => {
    if (tt50Recruit) {
      const nextStatus = reasonIndex <= 12 
        ? RecruitmentStatus.KTC_KHONG_TUYEN_CHON 
        : RecruitmentStatus.KTC_CHUA_GOI_NHAP_NGU;

      onUpdate({
        ...tt50Recruit,
        status: nextStatus,
        defermentReason: reason,
        previousStatus: tt50Recruit.status,
        enlistmentType: undefined,
        enlistmentUnit: undefined,
        enlistmentDate: undefined
      });
      setShowTT50Modal(false);
      setTt50Recruit(null);
    }
  };

  const handleApplyPreCheckFailReason = (reason: string) => {
    if (preCheckRecruit) {
      onUpdate({
        ...preCheckRecruit,
        status: RecruitmentStatus.PRE_CHECK_FAILED,
        defermentReason: reason,
        previousStatus: preCheckRecruit.status
      });
      setShowPreCheckFailModal(false);
      setPreCheckRecruit(null);
    }
  };

  const handleHealthGradeSelect = (recruit: Recruit, grade: number) => {
    const isPassed = grade >= 1 && grade <= 3;
    const newStatus = isPassed ? RecruitmentStatus.FINALIZED : RecruitmentStatus.MED_EXAM_FAILED;
    onUpdate({
      ...recruit,
      physical: { ...recruit.physical, healthGrade: grade },
      status: newStatus,
      enlistmentType: isPassed ? 'OFFICIAL' : undefined,
      enlistmentUnit: isPassed ? recruit.enlistmentUnit : undefined,
      enlistmentDate: isPassed ? recruit.enlistmentDate : undefined,
      previousStatus: recruit.status
    });
  };

  const handleUpdateFailureReason = (recruit: Recruit) => {
    const reason = failureReasons[recruit.id];
    if (reason !== undefined) {
      onUpdate({ ...recruit, defermentReason: reason });
      alert("Đã lưu lý do!");
    }
  };

  const handleUpdateEnlistmentInfo = (recruit: Recruit) => {
    const unit = enlistmentUnits[recruit.id] !== undefined ? enlistmentUnits[recruit.id] : recruit.enlistmentUnit;
    const date = enlistmentDates[recruit.id] !== undefined ? enlistmentDates[recruit.id] : recruit.enlistmentDate;
    
    onUpdate({
      ...recruit,
      enlistmentUnit: unit,
      enlistmentDate: date
    });
    alert(`Đã cập nhật thông tin nhập ngũ cho ${recruit.fullName}`);
  };

  return {
    showRemoveModal, setShowRemoveModal,
    showReasonModal, setShowReasonModal,
    showTT50Modal, setShowTT50Modal,
    showPreCheckFailModal, setShowPreCheckFailModal,
    reasonModalConfig, setReasonModalConfig,
    tt50Recruit, setTt50Recruit,
    preCheckRecruit, setPreCheckRecruit,
    recruitToRemove, setRecruitToRemove,
    removeReason, setRemoveReason,
    failureReasons, setFailureReasons,
    enlistmentUnits, setEnlistmentUnits,
    enlistmentDates, setEnlistmentDates,
    handleExportExcel,
    handleConfirmRemove,
    handleOpenReasonModal,
    handleApplyReason,
    handleApplyTT50Reason,
    handleApplyPreCheckFailReason,
    handleHealthGradeSelect,
    handleUpdateFailureReason,
    handleUpdateEnlistmentInfo
  };
};
