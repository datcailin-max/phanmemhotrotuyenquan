import { Recruit, User } from '../../../../types';

export interface ExcelImportModalProps {
  recruits: Recruit[];
  activeTabId: string;
  sessionYear: number;
  currentUser?: User;
  onClose: () => void;
  onRefresh: () => void;
}

export type ErrorType = 
  | 'THIEU_CCCD' 
  | 'CCCD_SAI_DINH_DANG' 
  | 'THIEU_HO_TEN' 
  | 'LOI_FONT_CHINH_TA' 
  | 'DU_LIEU_KHONG_HOP_LE';

export interface ProcessError {
  rowNum: number;
  name?: string;
  cccd?: string;
  errorType: ErrorType;
  reason: string;
  suggestion: string;
}

export interface ProcessSuccess {
  rowNum: number;
  fullName: string;
  cccd: string;
  isUpdate: boolean;
}

export interface DeferredExemptNotice {
  rowNum: number;
  fullName: string;
  cccd: string;
  reason: string;
}

export interface FontWarningNotice {
  rowNum: number;
  fullName: string;
  cccd: string;
  detail: string;
}
