
import { RecruitmentStatus } from '../../types';
import { 
  Users, ClipboardList, Stethoscope, FileSignature, Flag, Calendar, 
  PauseCircle, ShieldCheck, Layers, Ban, Shield, BookX, UserPlus, Trash2, 
  CheckCircle2, XCircle, UserX, Tent
} from 'lucide-react';

export const ITEMS_PER_PAGE = 10;

export const TABS = [
  { id: 'NOT_ALLOWED_REG', label: '1. DS KHÔNG ĐƯỢC ĐĂNG KÝ NVQS', status: [RecruitmentStatus.NOT_ALLOWED_REGISTRATION], color: 'bg-red-800', lightColor: 'bg-red-50', borderColor: 'border-red-800', textColor: 'text-red-900', icon: Ban },
  { id: 'EXEMPT_REG', label: '2. DS ĐƯỢC MIỄN ĐK NVQS', status: [RecruitmentStatus.EXEMPT_REGISTRATION], color: 'bg-slate-500', lightColor: 'bg-slate-100', borderColor: 'border-slate-500', textColor: 'text-slate-800', icon: Shield },
  { id: 'FIRST_TIME_REG', label: '3. DS ĐĂNG KÝ NVQS LẦN ĐẦU', status: [RecruitmentStatus.FIRST_TIME_REGISTRATION], color: 'bg-cyan-600', lightColor: 'bg-cyan-50', borderColor: 'border-cyan-600', textColor: 'text-cyan-900', icon: UserPlus },
  { id: 'ALL', label: '4. TOÀN BỘ NGUỒN', status: null, color: 'bg-gray-600', lightColor: 'bg-gray-100', borderColor: 'border-gray-600', textColor: 'text-gray-900', icon: Users },
  { id: 'TT50', label: '5. DS KHÔNG TUYỂN CHỌN (TT 50)', status: [RecruitmentStatus.NOT_SELECTED_TT50], color: 'bg-slate-600', lightColor: 'bg-slate-200', borderColor: 'border-slate-600', textColor: 'text-slate-900', icon: BookX },
  { id: 'PRE_CHECK', label: '6. DS ĐỦ ĐK SƠ TUYỂN', status: null, color: 'bg-blue-600', lightColor: 'bg-blue-50', borderColor: 'border-blue-600', textColor: 'text-blue-900', icon: ClipboardList },
  { id: 'PRE_CHECK_PASS', label: '6.1. DS ĐẠT SƠ TUYỂN', status: [RecruitmentStatus.PRE_CHECK_PASSED, RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.MED_EXAM_FAILED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-blue-500', lightColor: 'bg-blue-50', borderColor: 'border-blue-500', textColor: 'text-blue-800', icon: CheckCircle2, isSub: true, parentId: 'PRE_CHECK' },
  { id: 'PRE_CHECK_FAIL', label: '6.2. DS KHÔNG ĐẠT SƠ TUYỂN', status: [RecruitmentStatus.PRE_CHECK_FAILED], color: 'bg-orange-500', lightColor: 'bg-orange-50', borderColor: 'border-orange-500', textColor: 'text-orange-900', icon: XCircle, isSub: true, parentId: 'PRE_CHECK' },
  { id: 'MED_EXAM', label: '7. DS ĐỦ ĐK KHÁM TUYỂN', status: null, color: 'bg-indigo-600', lightColor: 'bg-indigo-50', borderColor: 'border-indigo-600', textColor: 'text-indigo-900', icon: Stethoscope },
  { id: 'MED_EXAM_PASS', label: '7.1. DS ĐẠT KHÁM TUYỂN', status: [RecruitmentStatus.MED_EXAM_PASSED, RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-indigo-500', lightColor: 'bg-indigo-50', borderColor: 'border-indigo-500', textColor: 'text-indigo-800', icon: CheckCircle2, isSub: true, parentId: 'MED_EXAM' },
  { id: 'MED_EXAM_FAIL', label: '7.2. DS KHÔNG ĐẠT KHÁM TUYỂN', status: [RecruitmentStatus.MED_EXAM_FAILED], color: 'bg-orange-600', lightColor: 'bg-orange-100', borderColor: 'border-orange-600', textColor: 'text-orange-900', icon: XCircle, isSub: true, parentId: 'MED_EXAM' },
  { id: 'DEFERRED_LIST', label: '8. DS TẠM HOÃN (NGUỒN)', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-600', lightColor: 'bg-amber-50', borderColor: 'border-amber-600', textColor: 'text-amber-900', icon: PauseCircle },
  { id: 'DEFERRED_HEALTH', label: '8.1. HOÃN VỀ SỨC KHỎE', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-500', lightColor: 'bg-amber-50', borderColor: 'border-amber-500', textColor: 'text-amber-800', icon: Stethoscope, isSub: true, parentId: 'DEFERRED_LIST' },
  { id: 'DEFERRED_EDUCATION', label: '8.2. HOÃN VỀ HỌC VẤN', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-500', lightColor: 'bg-amber-50', borderColor: 'border-amber-500', textColor: 'text-amber-800', icon: ClipboardList, isSub: true, parentId: 'DEFERRED_LIST' },
  { id: 'DEFERRED_POLICY', label: '8.3. HOÃN VỀ CHÍNH SÁCH', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-500', lightColor: 'bg-amber-50', borderColor: 'border-amber-500', textColor: 'text-amber-800', icon: ShieldCheck, isSub: true, parentId: 'DEFERRED_LIST' },
  { id: 'DEFERRED_DQTT', label: '8.4. HOÃN VỀ DQTT', status: [RecruitmentStatus.DEFERRED], color: 'bg-amber-500', lightColor: 'bg-amber-50', borderColor: 'border-amber-500', textColor: 'text-amber-800', icon: ShieldCheck, isSub: true, parentId: 'DEFERRED_LIST' },
  { id: 'EXEMPTED_LIST', label: '9. DS MIỄN GỌI NHẬP NGŨ', status: [RecruitmentStatus.EXEMPTED], color: 'bg-purple-600', lightColor: 'bg-purple-50', borderColor: 'border-purple-600', textColor: 'text-purple-900', icon: ShieldCheck },
  { id: 'FINAL', label: '10. DS CHỐT HỒ SƠ', status: [RecruitmentStatus.FINALIZED, RecruitmentStatus.ENLISTED], color: 'bg-green-600', lightColor: 'bg-green-50', borderColor: 'border-green-600', textColor: 'text-green-900', icon: FileSignature },
  { id: 'FINAL_OFFICIAL', label: '10.1. DANH SÁCH CHÍNH THỨC', status: null, color: 'bg-green-500', lightColor: 'bg-green-50', borderColor: 'border-green-500', textColor: 'text-green-800', icon: Flag, isSub: true, parentId: 'FINAL' },
  { id: 'FINAL_RESERVE', label: '10.2. DANH SÁCH DỰ BỊ', status: null, color: 'bg-teal-500', lightColor: 'bg-teal-50', borderColor: 'border-teal-500', textColor: 'text-teal-800', icon: Tent, isSub: true, parentId: 'FINAL' },
  { id: 'ENLISTED', label: '11. DS LỆNH NHẬP NGŨ', status: [RecruitmentStatus.ENLISTED], color: 'bg-red-600', lightColor: 'bg-red-50', borderColor: 'border-red-600', textColor: 'text-red-900', icon: Flag },
  { id: 'REMOVED', label: '12. DS LOẠI KHỎI NGUỒN', status: [RecruitmentStatus.REMOVED_FROM_SOURCE], color: 'bg-gray-400', lightColor: 'bg-gray-100', borderColor: 'border-gray-400', textColor: 'text-gray-600', icon: UserX },
  { id: 'REMAINING', label: '13. DS NGUỒN CÒN LẠI', status: null, color: 'bg-teal-600', lightColor: 'bg-teal-50', borderColor: 'border-teal-600', textColor: 'text-teal-900', icon: Layers },
  { id: 'NEXT_YEAR_SOURCE', label: '14. NGUỒN CỦA NĂM SAU', status: null, color: 'bg-cyan-600', lightColor: 'bg-cyan-50', borderColor: 'border-cyan-600', textColor: 'text-cyan-900', icon: Calendar },
  { id: 'DELETED_LIST', label: '15. DS ĐÃ XÓA', status: [RecruitmentStatus.DELETED], color: 'bg-black', lightColor: 'bg-gray-200', borderColor: 'border-black', textColor: 'text-gray-900', icon: Trash2 },
];
