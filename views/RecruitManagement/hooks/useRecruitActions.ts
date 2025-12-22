
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
  const [reasonModalConfig, setReasonModalConfig] = useState<{ recruit: Recruit, type: 'DEFERRED' | 'EXEMPTED' } | null>(null);
  const [recruitToRemove, setRecruitToRemove] = useState<Recruit | null>(null);
  const [removeReason, setRemoveReason] = useState('');
  const [failureReasons, setFailureReasons] = useState<Record<string, string>>({});

  const handleExportExcel = (filteredRecruits: Recruit[], activeTabId: string, activeTabLabel: string) => {
    if (filteredRecruits.length === 0) {
      alert("Không có dữ liệu trong danh sách hiện tại để xuất Excel!");
      return;
    }
    try {
      const unitName = user.unit.commune || user.unit.province || 'CO_QUAN_CHUYEN_TRACH';
      const fileName = `Danh_Sach_${activeTabId}_${unitName}_Nam_${sessionYear}.xlsx`;
      ExcelExportService.exportToTemplate(filteredRecruits, `DANH SÁCH - ${activeTabLabel}`, fileName);
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
        enlistmentType: undefined, // Làm sạch dữ liệu nhập ngũ khi hoãn/miễn
        enlistmentUnit: undefined,
        enlistmentDate: undefined
      });
      setShowReasonModal(false);
      setReasonModalConfig(null);
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

  return {
    showRemoveModal, setShowRemoveModal,
    showReasonModal, setShowReasonModal,
    reasonModalConfig, setReasonModalConfig,
    recruitToRemove, setRecruitToRemove,
    removeReason, setRemoveReason,
    failureReasons, setFailureReasons,
    handleExportExcel,
    handleConfirmRemove,
    handleOpenReasonModal,
    handleApplyReason,
    handleHealthGradeSelect,
    handleUpdateFailureReason
  };
};
