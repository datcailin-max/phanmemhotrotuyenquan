import { ResearchDocument, User } from '../../types';

export interface DocumentsViewProps {
  user: User;
}

export type DocumentFolderType = 'MAU_BIEU' | 'TAI_LIEU_THAM_KHAO';

export interface UploadDocumentModalProps {
  selectedFolder: DocumentFolderType;
  docTitle: string;
  setDocTitle: (val: string) => void;
  docDesc: string;
  setDocDesc: (val: string) => void;
  setSelectedFile: (file: File | null) => void;
  isSubmitting: boolean;
  uploadProgress: number;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface EditDocumentModalProps {
  editingDoc: ResearchDocument;
  docTitle: string;
  setDocTitle: (val: string) => void;
  docDesc: string;
  setDocDesc: (val: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface DocumentCardProps {
  doc: ResearchDocument;
  isAdmin: boolean;
  isFetchingDocId: string | null;
  onView: (doc: ResearchDocument) => void;
  onDownload: (doc: ResearchDocument) => void;
  onEdit: (doc: ResearchDocument) => void;
  onDelete: (doc: ResearchDocument) => void;
}
