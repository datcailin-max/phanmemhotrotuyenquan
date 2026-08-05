import { saveAs } from 'file-saver';
// @ts-ignore
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import PizZip from 'pizzip';
import { Recruit, CurriculumVitae } from '../types';
import { api } from '../api';

export const buildTemplateData = (recruit: Recruit, cv: CurriculumVitae): Record<string, any> => {
  const DEFAULT_VAL = 'Chưa cập nhật';

  const getVal = (val?: string | number, fallback?: string | number): string => {
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
    if (fallback !== undefined && fallback !== null && String(fallback).trim() !== '') {
      return String(fallback).trim();
    }
    return DEFAULT_VAL;
  };

  let dobStr = recruit.dob || '';
  if (!dobStr && (cv.birthDay || cv.birthMonth || cv.birthYear)) {
    const d = cv.birthDay || '...';
    const m = cv.birthMonth || '...';
    const y = cv.birthYear || '...';
    dobStr = `${d}/${m}/${y}`;
  }

  const data: Record<string, any> = {
    fullNameUpper: getVal(cv.fullNameUpper, recruit.fullName?.toUpperCase()),
    fullName: getVal(recruit.fullName),
    aliasName: getVal(cv.aliasName, recruit.fullName),
    birthDay: getVal(cv.birthDay),
    birthMonth: getVal(cv.birthMonth),
    birthYear: getVal(cv.birthYear),
    dob: getVal(dobStr),
    gender: getVal(cv.gender, 'Nam'),
    citizenId: getVal(cv.citizenId, recruit.citizenId),
    placeOfBirth: getVal(cv.placeOfBirth),
    hometown: getVal(cv.hometown),
    ethnicity: getVal(cv.ethnicity, recruit.details?.ethnicity),
    religion: getVal(cv.religion, recruit.details?.religion),
    nationality: getVal(cv.nationality, 'Việt Nam'),
    permanentAddress: getVal(cv.permanentAddress),
    temporaryAddress: getVal(cv.temporaryAddress),
    familyClass: getVal(cv.familyClass, recruit.details?.familyComposition),
    personalClass: getVal(cv.personalClass, recruit.details?.personalComposition),
    educationLevel: getVal(cv.educationLevel, recruit.details?.education),
    qualificationLevel: getVal(cv.qualificationLevel, recruit.details?.school),
    languageLevel: getVal(cv.languageLevel),
    major: getVal(cv.major, recruit.details?.major),
    communistPartyJoinedDate: getVal(cv.communistPartyJoinedDate, recruit.details?.partyEntryDate),
    communistPartyOfficialDate: getVal(cv.communistPartyOfficialDate),
    youthUnionJoinedDate: getVal(cv.youthUnionJoinedDate),
    commendations: getVal(cv.commendations, recruit.details?.rewards),
    disciplinaryAction: getVal(cv.disciplinaryAction, recruit.details?.disciplines),
    job: getVal(cv.job, recruit.details?.job),
    salary: getVal(cv.salary),
    salaryGrade: getVal(cv.salaryGrade, recruit.details?.gradeGroup),
    salaryRank: getVal(cv.salaryRank, recruit.details?.salaryLevel),
    workplace: getVal(cv.workplace, recruit.details?.workAddress),
    foreignTravel: getVal(cv.foreignTravel, 'Chưa đi nước ngoài'),
    fatherName: getVal(cv.fatherName, recruit.family?.father?.fullName),
    fatherStatus: getVal(cv.fatherStatus, 'Sống'),
    fatherBirthDate: getVal(cv.fatherBirthDate),
    fatherJob: getVal(cv.fatherJob, recruit.family?.father?.job),
    motherName: getVal(cv.motherName, recruit.family?.mother?.fullName),
    motherStatus: getVal(cv.motherStatus, 'Sống'),
    motherBirthDate: getVal(cv.motherBirthDate),
    motherJob: getVal(cv.motherJob, recruit.family?.mother?.job),
    spouseName: getVal(cv.spouseName, recruit.family?.wife?.fullName),
    spouseBirthDate: getVal(cv.spouseBirthDate),
    spouseJob: getVal(cv.spouseJob, recruit.family?.wife?.job),
    childrenCount: getVal(cv.childrenCount, recruit.family?.children),
    totalSiblings: getVal(cv.totalSiblings, recruit.details?.siblingCount),
    maleSiblings: getVal(cv.maleSiblings),
    femaleSiblings: getVal(cv.femaleSiblings),
    siblingOrder: getVal(cv.siblingOrder, recruit.details?.birthOrder),
  };

  // UPPERCASE Aliases & Vietnamese Tag Names for Template Matching
  data.FULL_NAME = data.fullNameUpper;
  data.HO_TEN = data.fullName;
  data.HO_TEN_KHAI_SINH = data.fullNameUpper;
  data.ALIAS_NAME = data.aliasName;
  data.TEN_THUONG_DUNG = data.aliasName;
  data.BIRTH_DAY = data.birthDay;
  data.NGAY_SINH = data.birthDay;
  data.BIRTH_MONTH = data.birthMonth;
  data.THANG_SINH = data.birthMonth;
  data.BIRTH_YEAR = data.birthYear;
  data.NAM_SINH = data.birthYear;
  data.DOB = dobStr;
  data.NGAY_THANG_NAM_SINH = dobStr;
  data.GENDER = data.gender;
  data.GIOI_TINH = data.gender;
  data.CITIZEN_ID = data.citizenId;
  data.SO_CCCD = data.citizenId;
  data.CCCD = data.citizenId;
  data.CMND = data.citizenId;
  data.PLACE_OF_BIRTH = data.placeOfBirth;
  data.NOI_KHAI_SINH = data.placeOfBirth;
  data.HOMETOWN = data.hometown;
  data.QUE_QUAN = data.hometown;
  data.ETHNICITY = data.ethnicity;
  data.DAN_TOC = data.ethnicity;
  data.RELIGION = data.religion;
  data.TON_GIAO = data.religion;
  data.NATIONALITY = data.nationality;
  data.QUOC_TICH = data.nationality;
  data.PERMANENT_ADDRESS = data.permanentAddress;
  data.THUONG_TRU = data.permanentAddress;
  data.NOI_THUONG_TRU = data.permanentAddress;
  data.TEMPORARY_ADDRESS = data.temporaryAddress;
  data.TAM_TRU = data.temporaryAddress;
  data.NOI_O_HIEN_TAI = data.temporaryAddress;
  data.FAMILY_CLASS = data.familyClass;
  data.THANH_PHAN_GIA_DINH = data.familyClass;
  data.PERSONAL_CLASS = data.personalClass;
  data.THANH_PHAN_BAN_THAN = data.personalClass;
  data.EDUCATION_LEVEL = data.educationLevel;
  data.EDUCATION = data.educationLevel;
  data.TRINH_DO_VAN_HOA = data.educationLevel;
  data.TRINH_DO_PHO_THONG = data.educationLevel;
  data.QUALIFICATION_LEVEL = data.qualificationLevel;
  data.QUALIFICATION = data.qualificationLevel;
  data.TRINH_DO_DAO_TAO = data.qualificationLevel;
  data.TRINH_DO_CHUYEN_MON = data.qualificationLevel;
  data.LANGUAGE_LEVEL = data.languageLevel;
  data.NGOAI_NGU = data.languageLevel;
  data.MAJOR = data.major;
  data.CHUYEN_NGANH = data.major;
  data.COMMUNIST_PARTY_JOINED_DATE = data.communistPartyJoinedDate;
  data.NGAY_VAO_DANG = data.communistPartyJoinedDate;
  data.COMMUNIST_PARTY_OFFICIAL_DATE = data.communistPartyOfficialDate;
  data.NGAY_DANG_CHINH_THUC = data.communistPartyOfficialDate;
  data.YOUTH_UNION_JOINED_DATE = data.youthUnionJoinedDate;
  data.NGAY_VAO_DOAN = data.youthUnionJoinedDate;
  data.COMMENDATIONS = data.commendations;
  data.KHEN_THUONG = data.commendations;
  data.DISCIPLINARY_ACTION = data.disciplinaryAction;
  data.KY_LUAT = data.disciplinaryAction;
  data.JOB = data.job;
  data.NGHE_NGHIEP = data.job;
  data.SALARY = data.salary;
  data.LUONG = data.salary;
  data.SALARY_GRADE = data.salaryGrade;
  data.NGACH = data.salaryGrade;
  data.SALARY_RANK = data.salaryRank;
  data.BAC = data.salaryRank;
  data.WORKPLACE = data.workplace;
  data.NOI_LAM_VIEC = data.workplace;
  data.FOREIGN_TRAVEL = data.foreignTravel;
  data.DI_NUOC_NGOAI = data.foreignTravel;
  data.FATHER_NAME = data.fatherName;
  data.HO_TEN_CHA = data.fatherName;
  data.FATHER_STATUS = data.fatherStatus;
  data.FATHER_BIRTH = data.fatherBirthDate;
  data.FATHER_BIRTH_DATE = data.fatherBirthDate;
  data.NAM_SINH_CHA = data.fatherBirthDate;
  data.FATHER_JOB = data.fatherJob;
  data.NGHE_NGHIEP_CHA = data.fatherJob;
  data.MOTHER_NAME = data.motherName;
  data.HO_TEN_ME = data.motherName;
  data.MOTHER_STATUS = data.motherStatus;
  data.MOTHER_BIRTH = data.motherBirthDate;
  data.MOTHER_BIRTH_DATE = data.motherBirthDate;
  data.NAM_SINH_ME = data.motherBirthDate;
  data.MOTHER_JOB = data.motherJob;
  data.NGHE_NGHIEP_ME = data.motherJob;
  data.SPOUSE_NAME = data.spouseName;
  data.HO_TEN_VO = data.spouseName;
  data.SPOUSE_BIRTH = data.spouseBirthDate;
  data.SPOUSE_BIRTH_DATE = data.spouseBirthDate;
  data.NAM_SINH_VO = data.spouseBirthDate;
  data.SPOUSE_JOB = data.spouseJob;
  data.NGHE_NGHIEP_VO = data.spouseJob;
  data.CHILDREN_COUNT = data.childrenCount;
  data.SO_CON = data.childrenCount;
  data.TOTAL_SIBLINGS = data.totalSiblings;
  data.SO_ANH_EM = data.totalSiblings;
  data.MALE_SIBLINGS = data.maleSiblings;
  data.FEMALE_SIBLINGS = data.femaleSiblings;
  data.SIBLING_ORDER = data.siblingOrder;
  data.CON_THU = data.siblingOrder;

  return data;
};

export const helperAutoFillCV = (recruit: Recruit): CurriculumVitae => {
  const existingCV = recruit.curriculumVitae || {};

  // Extract DOB parts
  let birthDay = existingCV.birthDay || '';
  let birthMonth = existingCV.birthMonth || '';
  let birthYear = existingCV.birthYear || '';
  if ((!birthDay || !birthYear) && recruit.dob) {
    const parts = recruit.dob.split(/[-/.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        birthYear = parts[0];
        birthMonth = parts[1];
        birthDay = parts[2];
      } else {
        birthDay = parts[0];
        birthMonth = parts[1];
        birthYear = parts[2];
      }
    } else {
      birthYear = recruit.dob;
    }
  }

  // Address helper
  const formatAddr = (addr?: { province: string; commune: string; village: string; street?: string }) => {
    if (!addr) return '';
    const items = [addr.street, addr.village, addr.commune, addr.province].filter(Boolean);
    return items.join(', ');
  };

  const currentPermanent = formatAddr(recruit.address);
  const currentHometown = formatAddr(recruit.hometown);

  return {
    fullNameUpper: existingCV.fullNameUpper || (recruit.fullName ? recruit.fullName.toUpperCase() : ''),
    aliasName: existingCV.aliasName || recruit.fullName || '',
    birthDay,
    birthMonth,
    birthYear,
    gender: existingCV.gender || 'Nam',
    citizenId: existingCV.citizenId || recruit.citizenId || '',
    placeOfBirth: existingCV.placeOfBirth || currentPermanent || '',
    hometown: existingCV.hometown || currentHometown || '',
    ethnicity: existingCV.ethnicity || recruit.details?.ethnicity || 'Kinh',
    religion: existingCV.religion || recruit.details?.religion || 'Không',
    nationality: existingCV.nationality || 'Việt Nam',
    permanentAddress: existingCV.permanentAddress || currentPermanent || '',
    temporaryAddress: existingCV.temporaryAddress || currentPermanent || '',
    familyClass: existingCV.familyClass || recruit.details?.familyComposition || 'Nông dân',
    personalClass: existingCV.personalClass || recruit.details?.personalComposition || 'Học sinh / Lao động',
    educationLevel: existingCV.educationLevel || recruit.details?.education || '12/12',
    qualificationLevel: existingCV.qualificationLevel || recruit.details?.school || 'Chưa qua đào tạo',
    languageLevel: existingCV.languageLevel || 'Không',
    major: existingCV.major || recruit.details?.major || '',
    communistPartyJoinedDate: existingCV.communistPartyJoinedDate || recruit.details?.partyEntryDate || '',
    communistPartyOfficialDate: existingCV.communistPartyOfficialDate || '',
    youthUnionJoinedDate: existingCV.youthUnionJoinedDate || '',
    commendations: existingCV.commendations || recruit.details?.rewards || 'Không',
    disciplinaryAction: existingCV.disciplinaryAction || recruit.details?.disciplines || 'Không',
    job: existingCV.job || recruit.details?.job || 'Tự do',
    salary: existingCV.salary || '',
    salaryGrade: existingCV.salaryGrade || recruit.details?.gradeGroup || '',
    salaryRank: existingCV.salaryRank || recruit.details?.salaryLevel || '',
    workplace: existingCV.workplace || recruit.details?.workAddress || '',
    foreignTravel: existingCV.foreignTravel || 'Chưa đi nước ngoài',
    fatherName: existingCV.fatherName || recruit.family?.father?.fullName || '',
    fatherStatus: existingCV.fatherStatus || 'Sống',
    fatherBirthDate: existingCV.fatherBirthDate || '',
    fatherJob: existingCV.fatherJob || recruit.family?.father?.job || '',
    motherName: existingCV.motherName || recruit.family?.mother?.fullName || '',
    motherStatus: existingCV.motherStatus || 'Sống',
    motherBirthDate: existingCV.motherBirthDate || '',
    motherJob: existingCV.motherJob || recruit.family?.mother?.job || '',
    spouseName: existingCV.spouseName || recruit.family?.wife?.fullName || '',
    spouseBirthDate: existingCV.spouseBirthDate || '',
    spouseJob: existingCV.spouseJob || recruit.family?.wife?.job || '',
    childrenCount: existingCV.childrenCount || recruit.family?.children || '0',
    totalSiblings: existingCV.totalSiblings || recruit.details?.siblingCount || '1',
    maleSiblings: existingCV.maleSiblings || '',
    femaleSiblings: existingCV.femaleSiblings || '',
    siblingOrder: existingCV.siblingOrder || recruit.details?.birthOrder || '1',
  };
};

export const generateCurriculumVitaeWordDoc = async (
  recruit: Recruit, 
  customCV?: CurriculumVitae,
  templateUrl?: string
) => {
  const cv = customCV || helperAutoFillCV(recruit);

  const DEFAULT_SAMPLE_URL = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQAAAAIAAAAIQAAAAAA';

  // Get master template from Admin if available
  let masterUrl: string | undefined;
  try {
    const master = await api.getMasterWordTemplate().catch(() => null);
    if (master?.url && master.url !== DEFAULT_SAMPLE_URL) {
      masterUrl = master.url;
    }
  } catch (e) {
    console.warn("Không thể lấy mẫu file Word từ Admin:", e);
  }

  let activeUrl = (templateUrl && templateUrl !== DEFAULT_SAMPLE_URL) ? templateUrl : masterUrl;

  if (!activeUrl) {
    throw new Error("Chưa có tệp mẫu Word (.docx) do Admin / Cấp trên tải lên. Vui lòng vào mục Quản lý tệp Word để tải mẫu file Word chuẩn của cấp trên!");
  }

  const tryGenerate = async (urlToUse: string): Promise<boolean> => {
    let arrayBuffer: ArrayBuffer;
    if (urlToUse.startsWith('data:')) {
      const base64Data = urlToUse.split(';base64,').pop() || '';
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      arrayBuffer = bytes.buffer;
    } else {
      const res = await fetch(urlToUse);
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      arrayBuffer = await res.arrayBuffer();
    }

    const zip = new PizZip(arrayBuffer);
    
    // Check if the zip file contains word/document.xml (standard .docx requirement)
    if (!zip.files || !zip.files['word/document.xml']) {
      throw new Error(
        "Tệp mẫu Word không đúng định dạng .docx tiêu chuẩn (thiếu word/document.xml)."
      );
    }

    const docxtpl = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      parser(tag: string) {
        const cleanTag = tag.trim();
        return {
          get(scope: any) {
            if (cleanTag === '.') return scope;
            if (scope[cleanTag] !== undefined && scope[cleanTag] !== null && scope[cleanTag] !== '') {
              return scope[cleanTag];
            }
            const normTag = cleanTag.toLowerCase().replace(/_/g, '').replace(/\s+/g, '');
            for (const k of Object.keys(scope)) {
              if (k.toLowerCase().replace(/_/g, '').replace(/\s+/g, '') === normTag) {
                if (scope[k] !== undefined && scope[k] !== null && scope[k] !== '') {
                  return scope[k];
                }
              }
            }
            return scope[cleanTag] ?? '';
          }
        };
      },
      nullGetter() { return ''; }
    });

    const dataPayload = buildTemplateData(recruit, cv);
    docxtpl.render(dataPayload);

    const outBlob = docxtpl.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const filename = `Ho_So_NVQS_${recruit.fullName ? recruit.fullName.replace(/\s+/g, '_') : 'Cong_Dan'}.docx`;
    saveAs(outBlob, filename);
    return true;
  };

  try {
    await tryGenerate(activeUrl);
  } catch (firstErr: any) {
    // If passed templateUrl (e.g. custom file) failed, and we have a masterUrl from Admin, fallback to masterUrl!
    if (masterUrl && activeUrl !== masterUrl) {
      console.warn("Mẫu tệp Word riêng của công dân bị lỗi hoặc là file .doc cũ. Tự động chuyển sang dùng Mẫu Word chuẩn của Admin:", firstErr);
      try {
        await tryGenerate(masterUrl);
        return;
      } catch (masterErr: any) {
        console.error("Lỗi cả trên mẫu Admin:", masterErr);
      }
    }

    console.error("Lỗi khi trộn dữ liệu vào file Word mẫu:", firstErr);
    if (firstErr.message && (firstErr.message.includes('filetype') || firstErr.message.includes('corrupted') || firstErr.message.includes('word/document.xml'))) {
      throw new Error(
        "Tệp mẫu Word do Admin/Cấp trên tải lên không đúng định dạng .docx tiêu chuẩn.\n\n" +
        "👉 Nguyên nhân: Tệp đang ở định dạng .doc cũ (Word 97-2003) hoặc file bị lỗi cấu trúc zip.\n" +
        "👉 Cách xử lý: Hãy mở tệp này bằng Microsoft Word -> Chọn File -> Save As -> Chọn kiểu 'Word Document (*.docx)' và tải lại lên hệ thống."
      );
    }
    throw new Error(`Lỗi khi điền dữ liệu vào tệp mẫu Word của Admin: ${firstErr.message || firstErr}`);
  }
};
