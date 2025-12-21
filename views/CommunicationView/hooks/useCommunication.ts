
import { useState, useEffect } from 'react';
import { User, UnitReport, ProvincialDispatch } from '../../../types';
import { api } from '../../../api';

export const useCommunication = (user: User, sessionYear: number) => {
  const [reports, setReports] = useState<UnitReport[]>([]);
  const [dispatches, setDispatches] = useState<ProvincialDispatch[]>([]);
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'DISPATCHES'>('REPORTS');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [filterCommune, setFilterCommune] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    let rParams: any = { year: sessionYear };
    let dParams: any = { year: sessionYear };

    if (user.role === 'PROVINCE_ADMIN') {
      rParams.province = user.unit.province;
      dParams.province = user.unit.province;
    } else if (user.role === 'EDITOR' || user.role === 'VIEWER') {
      rParams.username = user.username;
      dParams.province = user.unit.province;
      dParams.commune = user.unit.commune; 
      dParams.username = user.username;
    }

    try {
      const [rData, dData] = await Promise.all([
        api.getReports(rParams),
        api.getDispatches(dParams)
      ]);
      setReports(rData || []);
      setDispatches(dData || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    if (user && sessionYear) {
      fetchData();
    }
  }, [user.username, sessionYear]);

  const handleDeleteReport = async (id: string) => {
    if (window.confirm("Xóa báo cáo này?") && await api.deleteReport(id)) {
      fetchData();
    }
  };

  const handleDeleteDispatch = async (id: string) => {
    if (window.confirm("Xóa văn bản này?") && await api.deleteDispatch(id)) {
      fetchData();
    }
  };

  return {
    reports, setReports,
    dispatches, setDispatches,
    activeTab, setActiveTab,
    isLoading, fetchData,
    isProcessingFile, setIsProcessingFile,
    showReportModal, setShowReportModal,
    showDispatchModal, setShowDispatchModal,
    filterCommune, setFilterCommune,
    handleDeleteReport, handleDeleteDispatch
  };
};
