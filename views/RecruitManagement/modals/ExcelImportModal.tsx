import React, { useState } from 'react';
import { X, Upload, CheckCircle2, FileSpreadsheet, RefreshCw, Download, HelpCircle, FileText } from 'lucide-react';
import XLSX from 'xlsx-js-style';
import { Recruit, User, FamilyMember, RecruitmentStatus } from '../../../types';
import { api } from '../../../api';

import {
  ExcelImportModalProps,
  ProcessError,
  ProcessSuccess,
  DeferredExemptNotice,
  FontWarningNotice,
  MissingCccdNotice
} from './excelImport/types';

import { removeVietnameseTones } from '../../../constants';

import {
  getDefaultStatusForTab,
  parseExcelDate,
  extractCCCD,
  sanitizeName,
  extractNameFromCell,
  checkFontWarning,
  isHeaderOrMetadataRow,
  parseParentInfo,
  parseAddressInfo,
  extractBirthYearFromCCCD,
  parseEducationDegree
} from './excelImport/excelHelpers';

import { hasDefermentReason, hasExemptionReason, isRealDefermentReason } from '../utils';

import {
  handleDownloadTemplate17,
  handleDownloadTemplateSource
} from './excelImport/excelTemplates';

import { ImportReportView } from './excelImport/ImportReportView';

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  recruits,
  activeTabId,
  sessionYear,
  currentUser,
  onClose,
  onRefresh
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [insertedCount, setInsertedCount] = useState(0);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [errorList, setErrorList] = useState<ProcessError[]>([]);
  const [successList, setSuccessList] = useState<ProcessSuccess[]>([]);
  const [deferredExemptList, setDeferredExemptList] = useState<DeferredExemptNotice[]>([]);
  const [fontWarningList, setFontWarningList] = useState<FontWarningNotice[]>([]);
  const [missingCccdList, setMissingCccdList] = useState<MissingCccdNotice[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIsCompleted(false);
      setErrorList([]);
      setSuccessList([]);
      setDeferredExemptList([]);
      setFontWarningList([]);
      setMissingCccdList([]);
      setProgressPercent(0);
      setInsertedCount(0);
      setUpdatedCount(0);
    }
  };

  // Xử lý đọc và nhập dữ liệu từ File Excel
  const handleStartImport = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn tệp Excel để bắt đầu!");
      return;
    }

    setIsProcessing(true);
    setIsCompleted(false);
    setProgressPercent(0);
    setProcessedRows(0);
    setInsertedCount(0);
    setUpdatedCount(0);
    setErrorList([]);
    setSuccessList([]);
    setDeferredExemptList([]);
    setFontWarningList([]);
    setMissingCccdList([]);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const XLSXLib: any = XLSX;
      const utils = XLSXLib?.utils || XLSXLib?.default?.utils;

      if (!utils) {
        throw new Error("Không thể khởi chạy thư viện đọc Excel.");
      }

      const workbook = XLSXLib.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawRows: any[][] = utils.sheet_to_json(worksheet, { header: 1 });

      if (!rawRows || rawRows.length === 0) {
        throw new Error("Tệp Excel không có dữ liệu!");
      }

      // 1. TÌM DÒNG TIÊU ĐỀ (HEADER ROW) VÀ XÁC ĐỊNH VỊ TRÍ CỘT DỮ LIỆU
      let headerRowIndex = -1;
      let nameCol = -1;
      let dobCol = -1;
      let cccdCol = -1;
      let villageCol = -1;
      let addressCol = -1;
      let eduCol = -1;
      let jobCol = -1;
      let healthCol = -1;
      let reasonCol = -1;
      let familyBgCol = -1;
      let parentColIndices: number[] = [];
      let isOfficialExportFormat = false;
      let officialColIndex = -1;

      for (let i = 0; i < Math.min(rawRows.length, 25); i++) {
        const row = rawRows[i];
        if (!Array.isArray(row) || row.length === 0) continue;

        const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');

        if (
          rowStr.includes('stt') || 
          rowStr.includes('số tt') || 
          rowStr.includes('họ') || 
          rowStr.includes('tên') || 
          rowStr.includes('cccd') || 
          rowStr.includes('ngày sinh')
        ) {
          headerRowIndex = i;

          row.forEach((cell, colIdx) => {
            const cellStr = String(cell || '').trim().toLowerCase();

            if (cellStr.includes('thành phần gia đình') || cellStr.includes('thành phần bản thân') || cellStr.includes('dân tộc') || cellStr.includes('tôn giáo')) {
              familyBgCol = colIdx;
            }

            if (
              cellStr.includes('cha') || 
              cellStr.includes('mẹ') || 
              cellStr.includes('thân nhân') || 
              cellStr.includes('phụ huynh') ||
              cellStr.includes('ông, bà')
            ) {
              if (!parentColIndices.includes(colIdx)) parentColIndices.push(colIdx);
            }

            if (
              !cellStr.includes('cha') && 
              !cellStr.includes('mẹ') && 
              !cellStr.includes('vợ') && 
              !cellStr.includes('chồng') &&
              !cellStr.includes('thân nhân') &&
              !cellStr.includes('gia đình') &&
              !cellStr.includes('phụ huynh')
            ) {
              if (
                cellStr.includes('họ và tên') || 
                cellStr.includes('họ tên') || 
                cellStr.includes('họ, chữ đệm') || 
                cellStr.includes('tên công dân') ||
                cellStr.includes('khai sinh')
              ) {
                if (nameCol === -1) nameCol = colIdx;
              }

              if (
                cellStr.includes('ngày sinh') || 
                cellStr.includes('năm sinh') || 
                cellStr.includes('dob')
              ) {
                if (dobCol === -1) dobCol = colIdx;
              }

              if (
                cellStr.includes('cccd') || 
                cellStr.includes('cmnd') || 
                cellStr.includes('số định danh') || 
                cellStr.includes('thẻ căn cước')
              ) {
                if (cccdCol === -1) cccdCol = colIdx;
              }

              if (cellStr.includes('thôn') || cellStr.includes('ấp') || cellStr.includes('tổ dân phố') || cellStr.includes('khóm')) {
                villageCol = colIdx;
              }

              if (cellStr.includes('thường trú') || cellStr.includes('địa chỉ') || cellStr.includes('quê quán') || cellStr.includes('hktt')) {
                if (villageCol !== colIdx) addressCol = colIdx;
              }

              if (cellStr.includes('văn hóa') || cellStr.includes('học vấn') || cellStr.includes('trình độ')) {
                eduCol = colIdx;
              }

              if (cellStr.includes('chuyên môn') || cellStr.includes('kỹ thuật') || cellStr.includes('nghề nghiệp')) {
                jobCol = colIdx;
              }

              if (cellStr.includes('sức khỏe') || cellStr.includes('loại sk') || cellStr.includes('phân loại')) {
                healthCol = colIdx;
              }

              if (
                cellStr.includes('lý do') || 
                cellStr.includes('tạm hoãn') || 
                cellStr.includes('miễn') || 
                cellStr.includes('ghi chú') || 
                cellStr.includes('tình trạng')
              ) {
                reasonCol = colIdx;
              }

              // Kiểm tra nếu ô tiêu đề chứa đồng thời Họ tên + Ngày sinh/CCCD (Biểu mẫu gộp)
              if (
                (cellStr.includes('họ, chữ đệm') || cellStr.includes('khai sinh') || cellStr.includes('họ và tên')) &&
                (cellStr.includes('ngày, tháng') || cellStr.includes('năm sinh') || cellStr.includes('căn cước') || cellStr.includes('cccd'))
              ) {
                isOfficialExportFormat = true;
                officialColIndex = colIdx;
                nameCol = colIdx;
                dobCol = colIdx;
                cccdCol = colIdx;
              }
            }
          });

          // Dự phòng quét cột có tiêu đề gộp
          if (!isOfficialExportFormat) {
            row.forEach((c, idx) => {
              const cStr = String(c || '').toLowerCase();
              if ((cStr.includes('họ, chữ đệm') || cStr.includes('khai sinh')) && (cStr.includes('căn cước') || cStr.includes('ngày sinh'))) {
                isOfficialExportFormat = true;
                officialColIndex = idx;
                nameCol = idx;
                dobCol = idx;
                cccdCol = idx;
              }
            });
          }

          break;
        }
      }

      // Dự phòng vị trí cột tiêu chuẩn
      if (headerRowIndex === -1) {
        headerRowIndex = 3;
        nameCol = 1;
        dobCol = 2;
        cccdCol = 3;
        villageCol = 4;
        addressCol = 5;
        eduCol = 6;
        jobCol = 7;
        healthCol = 8;
        reasonCol = 9;
      }

      // 2. LỌC CHÍNH XÁC CÁC DÒNG CÔNG DÂN THỰC TẾ (LOẠI BỎ HẰNG ĐẲNG CÁC DÒNG TIÊU ĐỀ PHỤ)
      const rawDataRows = rawRows.slice(headerRowIndex + 1);
      const validRowsToProcess: { rowNumberInExcel: number; cells: any[] }[] = [];

      rawDataRows.forEach((row, idx) => {
        if (!Array.isArray(row) || row.length === 0) return;

        const rowNumberInExcel = headerRowIndex + 2 + idx;
        
        // Loại bỏ hoàn toàn các dòng tiêu đề, ghi chú hoặc thông tin metadata
        if (isHeaderOrMetadataRow(row)) return;

        validRowsToProcess.push({
          rowNumberInExcel,
          cells: row
        });
      });

      setTotalRows(validRowsToProcess.length);

      if (validRowsToProcess.length === 0) {
        throw new Error("Không tìm thấy các dòng dữ liệu công dân hợp lệ trong file Excel!");
      }

      const defaultStatus = getDefaultStatusForTab(activeTabId);
      let userCommune = currentUser?.unit?.commune?.trim() || '';
      let userProvince = currentUser?.unit?.province?.trim() || '';

      if (!userCommune && currentUser?.fullName) {
        const match = currentUser.fullName.match(/BAN CHQS (?:XÃ|PHƯỜNG|THỊ TRẤN)?\s*(.+)/i);
        if (match && match[1]) userCommune = match[1].trim();
      }
      if (!userCommune) userCommune = 'Mỹ Hòa Hưng';
      if (!userProvince) userProvince = 'An Giang';

      const errors: ProcessError[] = [];
      const successes: ProcessSuccess[] = [];
      const deferredExempts: DeferredExemptNotice[] = [];
      const fontWarnings: FontWarningNotice[] = [];
      const missingCccdNotices: MissingCccdNotice[] = [];

      let inserted = 0;
      let updated = 0;

      let currentRecruitsState = [...recruits];
      const emptyFamilyMember: FamilyMember = { fullName: '', job: '', phoneNumber: '', birthYear: '' };

      for (let idx = 0; idx < validRowsToProcess.length; idx++) {
        const item = validRowsToProcess[idx];
        const row = item.cells;
        const rowNumberInExcel = item.rowNumberInExcel;

        const rowJoinedText = row.map(c => String(c || '')).join(' \n ');

        let rawName = '';
        let rawDob = '';
        let rawCccd = '';
        let village = 'Ấp Mỹ An';
        let address = '';
        let edu = '12/12';
        let job = 'Không';
        let parsedHealthGrade = 1;
        let reason = '';

        if (isOfficialExportFormat) {
          const mainColIdx = officialColIndex >= 0 ? officialColIndex : 1;
          const col1Text = String(row[mainColIdx] || '');
          rawCccd = extractCCCD(col1Text) || extractCCCD(rowJoinedText);
          rawName = extractNameFromCell(col1Text) || extractNameFromCell(rowJoinedText);
          rawDob = parseExcelDate(col1Text);

          const col3Address = String(row[mainColIdx + 2] || row[3] || '');
          if (col3Address) {
            const parsedAddr = parseAddressInfo(col3Address, '', 'Ấp Mỹ An');
            village = parsedAddr.village;
            address = parsedAddr.street;
          }

          const col5Edu = String(row[mainColIdx + 4] || row[5] || '');
          if (col5Edu) {
            edu = parseEducationDegree(col5Edu);
          }

          const lastColText = String(row[row.length - 1] || '');
          if (lastColText && lastColText !== '---') reason = lastColText.trim();

        } else {
          const nameCellText = nameCol >= 0 ? String(row[nameCol] || '').trim() : '';
          rawName = extractNameFromCell(nameCellText) || nameCellText;

          const cccdCellText = cccdCol >= 0 ? String(row[cccdCol] || '').trim() : '';
          rawCccd = extractCCCD(cccdCellText) || extractCCCD(rowJoinedText);

          const dobCellVal = dobCol >= 0 ? row[dobCol] : '';
          rawDob = parseExcelDate(dobCellVal);

          // Nếu cột DOB riêng chưa trích xuất được, thử trích xuất từ cột Họ tên (trường hợp ô gộp)
          if (!rawDob && nameCellText) {
            rawDob = parseExcelDate(nameCellText);
          }

          const rawVillageVal = villageCol >= 0 && row[villageCol] ? String(row[villageCol]).trim() : '';
          const rawStreetVal = addressCol >= 0 && row[addressCol] ? String(row[addressCol]).trim() : '';

          const parsedAddr = parseAddressInfo(rawStreetVal, rawVillageVal, 'Ấp Mỹ An');
          village = parsedAddr.village;
          address = parsedAddr.street;

          if (eduCol >= 0 && row[eduCol]) {
            edu = parseEducationDegree(String(row[eduCol]));
          }

          if (jobCol >= 0 && row[jobCol]) {
            job = String(row[jobCol]).trim();
          }

          if (healthCol >= 0 && row[healthCol]) {
            const hVal = row[healthCol];
            if (typeof hVal === 'number' && hVal >= 1 && hVal <= 6) {
              parsedHealthGrade = hVal;
            } else if (typeof hVal === 'string') {
              const matchNum = hVal.match(/[1-6]/);
              if (matchNum) parsedHealthGrade = parseInt(matchNum[0]);
            }
          }

          if (reasonCol >= 0 && row[reasonCol]) {
            reason = String(row[reasonCol]).trim();
          }
        }

        // 1. TỰ ĐỘNG CHUẨN HÓA LÀM SẠCH HỌ TÊN & CẢNH BÁO FONT CHỮ
        const fontWarning = checkFontWarning(rawName);
        const cleanedName = sanitizeName(rawName) || rawName.trim().toUpperCase();

        // Kiểm tra xem Họ tên có bị trống hoặc chứa nhãn tiêu đề bị lỡ lọt
        if (
          !cleanedName || 
          cleanedName.length < 2 || 
          /SỐ THẺ CĂN CƯỚC|THẺ CĂN CƯỚC|MÃ ĐỊNH DANH|HỌ VÀ TÊN|NGÀY SÍNH|XÃ PHƯỜNG|THÔN ẤP/i.test(cleanedName)
        ) {
          errors.push({
            rowNum: rowNumberInExcel,
            cccd: rawCccd,
            errorType: 'THIEU_HO_TEN',
            reason: "Không tìm thấy hoặc thiếu Họ và tên công dân.",
            suggestion: "Điền đầy đủ Họ và tên công dân vào cột Họ và tên."
          });
          continue;
        }

        const cleanRawCccd = rawCccd ? rawCccd.trim() : '';
        const isCccdMissing = !cleanRawCccd || !/^\d{9,12}$/.test(cleanRawCccd);

        // Cảnh báo lỗi font chữ / vỡ mã tiếng Việt (KHÔNG CHẶN NHẬP - Đã làm sạch & Lưu thành công)
        if (fontWarning.isWarning) {
          fontWarnings.push({
            rowNum: rowNumberInExcel,
            fullName: cleanedName,
            cccd: rawCccd,
            detail: fontWarning.detail || 'Phát hiện vỡ font chữ/Mã hóa (Hệ thống đã tự động làm sạch & lưu CSDL)'
          });
        }

        // TỰ ĐỘNG ĐỐI CHIẾU XÁC MINH NGÀY SINH & NĂM SINH THEO SỐ CCCD CỦA CÔNG DÂN
        let finalDob = rawDob;
        let parsedYear = finalDob ? parseInt(finalDob.split('-')[0]) : 0;

        // Trích xuất năm sinh chính xác từ 12 số CCCD của công dân
        const cccdBirthYear = extractBirthYearFromCCCD(rawCccd);

        if (cccdBirthYear) {
          if (!finalDob || isNaN(parsedYear) || parsedYear < 1985 || parsedYear > 2012) {
            if (finalDob && finalDob.includes('-')) {
              const parts = finalDob.split('-');
              if (parts.length === 3 && parts[1] && parts[2] && parts[1] !== '01') {
                finalDob = `${cccdBirthYear}-${parts[1]}-${parts[2]}`;
              } else {
                finalDob = `${cccdBirthYear}-01-01`;
              }
            } else {
              finalDob = `${cccdBirthYear}-01-01`;
            }
          }
        }

        const formattedDob = finalDob || '2005-01-01';
        const birthYear = parseInt(formattedDob.split('-')[0] || '2005');
        const citizenAge = sessionYear - birthYear;

        // Quét tự động nhận dạng thông tin Cha / Mẹ từ các ô trong hàng
        const parentTexts: string[] = [];

        if (isOfficialExportFormat) {
          // Biểu mẫu xuất bản chính thức (Biểu mẫu NVQS): Cột 7 (Index = officialColIndex + 5) là cột Thông tin Cha, Mẹ
          const pCol = officialColIndex >= 0 ? officialColIndex + 5 : 6;
          if (row[pCol] !== undefined && row[pCol] !== null) {
            const valStr = String(row[pCol]).trim();
            if (valStr) parentTexts.push(valStr);
          }
        }

        if (parentColIndices.length > 0) {
          parentColIndices.forEach(pCol => {
            if (row[pCol] !== undefined && row[pCol] !== null) {
              const valStr = String(row[pCol]).trim();
              if (valStr && !parentTexts.includes(valStr)) {
                parentTexts.push(valStr);
              }
            }
          });
        }

        // Nếu chưa tìm thấy parentTexts từ cột định danh, quét lọc các cột chưa phân ánh chứa từ khóa thân nhân hoặc Họ tên + Năm sinh
        if (parentTexts.length === 0) {
          row.forEach((cell, cIdx) => {
            if (
              cIdx === nameCol || 
              cIdx === cccdCol || 
              cIdx === dobCol || 
              cIdx === villageCol || 
              cIdx === addressCol || 
              cIdx === eduCol || 
              cIdx === jobCol || 
              cIdx === healthCol || 
              cIdx === reasonCol ||
              cIdx === familyBgCol
            ) return;

            if (cell === undefined || cell === null) return;
            const cellStr = String(cell).trim();
            if (!cellStr) return;

            const lower = cellStr.toLowerCase();
            // Bắt buộc chứa từ chỉ thân nhân HOẶC chứa định dạng Họ tên + Năm sinh (19xx)
            if (
              /\b(cha|bố|mẹ|thân nhân|phụ huynh)\b/i.test(lower) ||
              (/[a-zA-Zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ\s]{3,}/i.test(cellStr) && /\b(19[3-9]\d|20[0-2]\d)\b/.test(cellStr))
            ) {
              if (!parentTexts.includes(cellStr)) {
                parentTexts.push(cellStr);
              }
            }
          });
        }

        const parsedParents = parseParentInfo(parentTexts);

        const isRealDefer = isRealDefermentReason(reason);
        const isRealExempt = hasExemptionReason({ defermentReason: reason });

        // Ghi nhận nếu công dân có lý do Tạm hoãn / Miễn / Ghi chú đặc biệt hợp lệ
        if (reason && reason !== '---' && (isRealDefer || isRealExempt)) {
          deferredExempts.push({
            rowNum: rowNumberInExcel,
            fullName: cleanedName,
            cccd: rawCccd,
            reason: reason
          });
        }

        // Tự động xác định trạng thái Tạm hoãn / Miễn gọi từ lý do nếu có
        let autoStatus = defaultStatus;

        // KIỂM TRA QUY ĐỊNH LUẬT NVQS VỀ TUỔI
        if (citizenAge < 17) {
          deferredExempts.push({
            rowNum: rowNumberInExcel,
            fullName: cleanedName,
            cccd: rawCccd,
            reason: `CẢNH BÁO LUẬT NVQS: Công dân ${citizenAge} tuổi (chưa đủ 17 tuổi trong năm ${sessionYear}) - Chưa đến tuổi đăng ký NVQS lần đầu.`
          });
          autoStatus = RecruitmentStatus.FIRST_TIME_REGISTRATION;
        } else if (citizenAge < 18) {
          // Công dân 17 tuổi (dưới 18 tuổi): Thuộc Danh sách Đăng ký NVQS lần đầu (DS 3)
          if (defaultStatus !== RecruitmentStatus.FIRST_TIME_REGISTRATION || (reason && reason !== '---')) {
            deferredExempts.push({
              rowNum: rowNumberInExcel,
              fullName: cleanedName,
              cccd: rawCccd,
              reason: `NHẮC NHỞ LUẬT NVQS: Công dân ${citizenAge} tuổi (dưới 18 tuổi) - Không thuộc diện vào Danh sách Nguồn/Tạm hoãn nguồn. Đã giữ tại Danh sách Đăng ký NVQS lần đầu (DS 3).`
            });
          }
          autoStatus = RecruitmentStatus.FIRST_TIME_REGISTRATION;
        } else if (reason && reason !== '---' && reason.toLowerCase() !== 'không') {
          if (isRealExempt) {
            autoStatus = RecruitmentStatus.EXEMPTED;
          } else if (isRealDefer) {
            autoStatus = RecruitmentStatus.DEFERRED;
          }
        }

        // 3. ĐỐI CHIẾU SỐ CCCD & TRÙNG TÊN VỚI CƠ SỞ DỮ LIỆU CÔNG DÂN
        let existingIndex = -1;

        // Ưu tiên 1: Tìm theo Số CCCD nếu có số CCCD hợp lệ (9-12 chữ số)
        if (cleanRawCccd && /^\d{9,12}$/.test(cleanRawCccd)) {
          existingIndex = currentRecruitsState.findIndex(r => r.citizenId?.trim() === cleanRawCccd);
        }

        // Ưu tiên 2: Nếu chưa tìm thấy theo CCCD (hoặc công dân trong Excel/CSDL thiếu CCCD),
        // tiến hành đối chiếu Công dân trùng tên với các dữ liệu khác (Ngày sinh, Thôn/Ấp, Địa chỉ, Tên Cha...)
        if (existingIndex === -1 && cleanedName) {
          const normCleanedName = removeVietnameseTones(cleanedName.toLowerCase()).trim();
          const cleanedBirthYear = formattedDob ? formattedDob.split('-')[0] : '';
          const normVillage = village ? removeVietnameseTones(village.toLowerCase()).trim() : '';
          const normAddress = address ? removeVietnameseTones(address.toLowerCase()).trim() : '';

          existingIndex = currentRecruitsState.findIndex(r => {
            if (!r.fullName) return false;
            const normExistingName = removeVietnameseTones(r.fullName.toLowerCase()).trim();
            if (normExistingName !== normCleanedName) return false;

            // Đã trùng Họ tên -> Kiểm tra bổ sung các trường dữ liệu khác
            const existingDob = r.dob || '';
            const existingBirthYear = existingDob ? existingDob.split('-')[0] : '';
            const existingVillage = r.address?.village ? removeVietnameseTones(r.address.village.toLowerCase()).trim() : '';
            const existingStreet = r.address?.street ? removeVietnameseTones(r.address.street.toLowerCase()).trim() : '';

            // So sánh Ngày sinh hoặc Năm sinh
            const isSameDob = Boolean(formattedDob && existingDob && formattedDob === existingDob);
            const isSameBirthYear = Boolean(cleanedBirthYear && existingBirthYear && cleanedBirthYear === existingBirthYear);
            const isDobMatch = isSameDob || isSameBirthYear;

            // So sánh Thôn / Ấp hoặc Địa chỉ chi tiết
            const isSameVillage = Boolean(normVillage && existingVillage && (
              normVillage === existingVillage ||
              normVillage.includes(existingVillage) ||
              existingVillage.includes(normVillage)
            ));
            const isSameAddress = Boolean(normAddress && existingStreet && (
              normAddress === existingStreet ||
              normAddress.includes(existingStreet) ||
              existingStreet.includes(normAddress)
            ));
            const isAddressMatch = isSameVillage || isSameAddress;

            // So sánh Họ tên Cha nếu có
            const existingFather = r.family?.father?.fullName ? removeVietnameseTones(r.family.father.fullName.toLowerCase()).trim() : '';
            const newFather = parsedParents?.father?.fullName ? removeVietnameseTones(parsedParents.father.fullName.toLowerCase()).trim() : '';
            const isFatherMatch = Boolean(existingFather && newFather && (existingFather === newFather || existingFather.includes(newFather) || newFather.includes(existingFather)));

            // Nếu trùng Ngày/Năm sinh HOẶC Địa chỉ HOẶC Họ tên Cha -> Coi là cùng 1 công dân trong CSDL
            if (isDobMatch || isAddressMatch || isFatherMatch) {
              return true;
            }

            // Nếu cả 2 đều không có ngày sinh và địa chỉ chi tiết, coi như cùng 1 công dân do trùng họ tên trong cùng đơn vị
            if (!cleanedBirthYear && !existingBirthYear && !normVillage && !existingVillage) {
              return true;
            }

            return false;
          });
        }

        // Ghi nhận thông báo cho Cán bộ biết nếu công dân thiếu CCCD
        if (isCccdMissing) {
          missingCccdNotices.push({
            rowNum: rowNumberInExcel,
            fullName: cleanedName,
            dob: formattedDob || '',
            village: village || '',
            address: address || '',
            matchedExisting: existingIndex > -1 ? {
              citizenId: currentRecruitsState[existingIndex].citizenId,
              fullName: currentRecruitsState[existingIndex].fullName,
              dob: currentRecruitsState[existingIndex].dob,
              village: currentRecruitsState[existingIndex].address?.village || '',
              reason: 'Khớp trùng tên & ngày sinh/địa chỉ (đã cập nhật hồ sơ)'
            } : undefined
          });
        }

        if (existingIndex > -1) {
          // CẬP NHẬT CÔNG DÂN ĐÃ TỒN TẠI
          const existing = currentRecruitsState[existingIndex];
          let targetStatus = existing.status;

          if (citizenAge < 18) {
            targetStatus = RecruitmentStatus.FIRST_TIME_REGISTRATION;
          } else if (existing.status === RecruitmentStatus.SOURCE && autoStatus !== RecruitmentStatus.SOURCE) {
            targetStatus = autoStatus;
          } else if (reason && autoStatus !== defaultStatus && autoStatus !== RecruitmentStatus.SOURCE) {
            targetStatus = autoStatus;
          }

          let finalReason = '';
          if (targetStatus === RecruitmentStatus.DEFERRED || targetStatus === RecruitmentStatus.EXEMPTED || isRealDefer || isRealExempt) {
            finalReason = reason || existing.defermentReason || '';
          }

          const existingStreet = existing.address?.street || '';
          const cleanExistingStreet = (existingStreet.toLowerCase() === village.toLowerCase()) ? '' : existingStreet;

          const updatedRecruit: Recruit = {
            ...existing,
            citizenId: (cleanRawCccd && /^\d{9,12}$/.test(cleanRawCccd)) ? cleanRawCccd : (existing.citizenId || cleanRawCccd || ''),
            fullName: cleanedName || existing.fullName,
            dob: formattedDob || existing.dob,
            address: {
              province: existing.address?.province || userProvince,
              commune: existing.address?.commune || userCommune,
              village: village || existing.address?.village || 'Ấp Mỹ An',
              street: address || cleanExistingStreet
            },
            physical: {
              height: existing.physical?.height || 0,
              weight: existing.physical?.weight || 0,
              chest: existing.physical?.chest || 0,
              bmi: existing.physical?.bmi || 0,
              healthGrade: parsedHealthGrade || existing.physical?.healthGrade || 1,
              bloodPressure: existing.physical?.bloodPressure || '',
              note: existing.physical?.note || ''
            },
            details: {
              ...existing.details,
              education: edu || existing.details?.education || '12/12',
              job: job || existing.details?.job || 'Không'
            },
            family: {
              father: {
                fullName: parsedParents.father.fullName || existing.family?.father?.fullName || '',
                birthYear: parsedParents.father.birthYear || existing.family?.father?.birthYear || '',
                job: parsedParents.father.job || existing.family?.father?.job || '',
                phoneNumber: existing.family?.father?.phoneNumber || ''
              },
              mother: {
                fullName: parsedParents.mother.fullName || existing.family?.mother?.fullName || '',
                birthYear: parsedParents.mother.birthYear || existing.family?.mother?.birthYear || '',
                job: parsedParents.mother.job || existing.family?.mother?.job || '',
                phoneNumber: existing.family?.mother?.phoneNumber || ''
              },
              wife: existing.family?.wife || { ...emptyFamilyMember },
              children: existing.family?.children || ''
            },
            status: targetStatus,
            defermentReason: finalReason,
            updatedAt: new Date().toISOString()
          };

          await api.updateRecruit(updatedRecruit);
          currentRecruitsState[existingIndex] = updatedRecruit;

          updated++;
          successes.push({
            rowNum: rowNumberInExcel,
            fullName: cleanedName,
            cccd: updatedRecruit.citizenId || 'Thiếu CCCD',
            isUpdate: true
          });

        } else {
          // CHÈN BẢN GHI CÔNG DÂN MỚI
          let targetStatus = (defaultStatus === RecruitmentStatus.SOURCE && autoStatus !== RecruitmentStatus.SOURCE) ? autoStatus : defaultStatus;
          if (citizenAge < 18) {
            targetStatus = RecruitmentStatus.FIRST_TIME_REGISTRATION;
          }

          const newRecruit: Recruit = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2) + idx,
            citizenId: cleanRawCccd || '',
            fullName: cleanedName,
            dob: formattedDob,
            phoneNumber: '',
            avatarUrl: '',
            address: {
              province: userProvince,
              commune: userCommune,
              village: village || 'Ấp Mỹ An',
              street: address || ''
            },
            hometown: {
              province: userProvince,
              commune: userCommune,
              village: village || 'Ấp Mỹ An'
            },
            physical: {
              height: 0,
              weight: 0,
              chest: 0,
              bmi: 0,
              healthGrade: parsedHealthGrade,
              bloodPressure: '',
              note: ''
            },
            details: {
              education: edu || '12/12',
              ethnicity: 'Kinh',
              religion: 'Không',
              maritalStatus: 'Độc thân',
              job: job || 'Không',
              politicalStatus: 'Doan_Vien',
              familyComposition: 'Nông dân',
              personalComposition: 'Phụ thuộc'
            },
            family: {
              father: {
                fullName: parsedParents.father.fullName || '',
                birthYear: parsedParents.father.birthYear || '',
                job: parsedParents.father.job || '',
                phoneNumber: ''
              },
              mother: {
                fullName: parsedParents.mother.fullName || '',
                birthYear: parsedParents.mother.birthYear || '',
                job: parsedParents.mother.job || '',
                phoneNumber: ''
              },
              wife: { ...emptyFamilyMember },
              children: ''
            },
            status: targetStatus,
            defermentReason: (targetStatus === RecruitmentStatus.DEFERRED || targetStatus === RecruitmentStatus.EXEMPTED || isRealDefer || isRealExempt) ? (reason || '') : '',
            recruitmentYear: sessionYear,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await api.createRecruit(newRecruit);
          currentRecruitsState.push(newRecruit);

          inserted++;
          successes.push({
            rowNum: rowNumberInExcel,
            fullName: cleanedName,
            cccd: newRecruit.citizenId || 'Thiếu CCCD',
            isUpdate: false
          });
        }

        const currentCount = idx + 1;
        setProcessedRows(currentCount);
        setInsertedCount(inserted);
        setUpdatedCount(updated);
        setProgressPercent(Math.round((currentCount / validRowsToProcess.length) * 100));
      }

      setErrorList(errors);
      setSuccessList(successes);
      setDeferredExemptList(deferredExempts);
      setFontWarningList(fontWarnings);
      setMissingCccdList(missingCccdNotices);
      setIsProcessing(false);
      setIsCompleted(true);

      onRefresh();

    } catch (err: any) {
      alert(`Có lỗi xảy ra khi đọc file Excel: ${err.message || err}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-military-800 text-white p-5 flex justify-between items-center border-b border-military-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <FileSpreadsheet size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight">
                Nhập & Đối soát danh sách công dân từ File Excel
              </h3>
              <p className="text-[11px] text-military-200 font-bold uppercase mt-0.5">
                Năm tuyển chọn {sessionYear} • Tự động quét thông tin & Phát hiện lỗi chính tả, font chữ
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 text-military-200 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* Hướng dẫn & Tải Mẫu Excel */}
          <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <HelpCircle size={22} className="text-blue-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black uppercase text-blue-950">Mẫu file nhập dữ liệu theo từng loại danh sách:</p>
                <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                  Danh sách <b>Đăng ký lần đầu (Đủ 17 tuổi)</b> sử dụng Mẫu Biểu 01. Các danh sách còn lại (Nguồn tuyển quân, Tạm hoãn, Miễn...) sử dụng Mẫu Danh sách nguồn. Tải mẫu bên cạnh:
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <button
                onClick={() => handleDownloadTemplate17(sessionYear)}
                className="flex-1 md:flex-initial px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[11px] uppercase shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
                title="Mẫu Biểu 01 - Dành cho Danh sách Đăng ký lần đầu (Tuổi 17)"
              >
                <Download size={13} /> Mẫu Đăng Ký Lần Đầu (17 Tuổi)
              </button>
              <button
                onClick={() => handleDownloadTemplateSource(sessionYear, currentUser?.unit?.commune)}
                className="flex-1 md:flex-initial px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-[11px] uppercase shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
                title="Mẫu Danh sách nguồn tuyển quân - Dành cho các danh sách khác"
              >
                <Download size={13} /> Mẫu Danh Sách Nguồn & Khác
              </button>
            </div>
          </div>

          {/* Khu vực Chọn File */}
          {!isProcessing && (
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase text-military-900 tracking-wider">
                Chọn tệp dữ liệu Excel (.xlsx, .xls)
              </label>

              <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50/50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform text-emerald-600">
                    <Upload size={24} />
                  </div>
                  <p className="text-xs font-black text-gray-700 uppercase">
                    Nhấp vào đây hoặc kéo thả file Excel vào đây
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Chấp nhận cả Mẫu Excel Nhập Chuẩn và tất cả các Biểu mẫu Xuất bản (01, 16C, 17A...)
                  </p>
                </div>
              </div>

              {selectedFile && (
                <div className="bg-emerald-50 p-3.5 rounded-xl flex items-center justify-between border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <FileText size={20} className="text-emerald-700" />
                    <div>
                      <p className="text-xs font-black text-emerald-950">{selectedFile.name}</p>
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">
                        Kích thước: {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedFile(null); setIsCompleted(false); }}
                    className="text-[11px] font-bold text-red-600 hover:underline uppercase px-2 py-1"
                  >
                    Bỏ chọn
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Thanh Tiến Trình Processing */}
          {isProcessing && (
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-military-900 flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin text-emerald-600" />
                    Đang quét, phân tách & đối chiếu thông tin công dân...
                  </span>
                  <p className="text-[11px] text-gray-500 mt-1 font-bold">
                    Thêm mới: <span className="text-emerald-700">{insertedCount}</span> • Cập nhật: <span className="text-blue-700">{updatedCount}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600 font-mono">
                    {progressPercent}%
                  </span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    {processedRows} / {totalRows} dòng
                  </p>
                </div>
              </div>

              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden p-0.5 border border-gray-300">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Báo cáo Kết quả sau khi hoàn tất */}
          {isCompleted && (
            <ImportReportView
              insertedCount={insertedCount}
              updatedCount={updatedCount}
              errorList={errorList}
              deferredExemptList={deferredExemptList}
              fontWarningList={fontWarningList}
              missingCccdList={missingCccdList}
              sessionYear={sessionYear}
              selectedFileName={selectedFile?.name}
            />
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Hệ thống tự động kiểm tra trùng lặp & đồng bộ CSDL công dân
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-black text-xs uppercase hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isCompleted ? 'Đóng cửa sổ' : 'Hủy bỏ'}
            </button>

            {!isCompleted && (
              <button
                onClick={handleStartImport}
                disabled={isProcessing || !selectedFile}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Upload size={16} />
                Bắt đầu quét & Nhập dữ liệu
              </button>
            )}

            {isCompleted && (
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setIsCompleted(false);
                }}
                className="px-5 py-2.5 bg-military-800 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-military-900 active:scale-95 transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Nhập tiếp file Excel khác
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
