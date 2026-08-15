import { saveAs } from 'file-saver';
// @ts-ignore
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import PizZip from 'pizzip';
import { 
  Document, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  AlignmentType, 
  WidthType, 
  TabStopType, 
  Packer, 
  BorderStyle, 
  convertMillimetersToTwip 
} from 'docx';
import { Recruit, CurriculumVitae } from '../types';
import { api } from '../api';

// Precise dots tailored to cell widths in standard military resume tables
const DOTS_FULL_ROW_SHORT_LABEL = '..............................................................................'; // for Quê quán (~78 dots)
const DOTS_FULL_ROW_MED_LABEL = '..................................................................'; // for Nơi khai sinh, Chuyên ngành (~66 dots)
const DOTS_FULL_ROW_LONG_LABEL = '............................................................'; // for Thường trú, Tạm trú (~60 dots)
const DOTS_FULL_ROW_CCCD = '..............................................................'; // for Số CCCD (~62 dots)
const DOTS_FULL_ROW_DOAN = '..........................................................'; // for Ngày vào Đoàn (~58 dots)
const DOTS_FULL_ROW_WORKPLACE = '................................................................'; // for Nơi làm việc (~64 dots)
const DOTS_FULL_ROW_FOREIGN = '............................................'; // for Đi nước ngoài (~44 dots)

const DOTS_HALF_ROW_LEFT_SHORT = '..................................'; // ~34 dots
const DOTS_HALF_ROW_LEFT_MED = '...........................'; // ~27 dots (Trình độ đào tạo)
const DOTS_HALF_ROW_LEFT_LONG = '.........................'; // ~25 dots (Ngày vào Đảng, Vợ chồng)
const DOTS_HALF_ROW_RIGHT = '................................'; // ~32 dots (Ngoại ngữ, Chính thức, Kỷ luật, Cha Mẹ Nghề nghiệp)
const DOTS_HALF_ROW_RIGHT_LONG = '...................................'; // ~35 dots (Bản thân, Khen thưởng)

const DOTS_4COL_JOB = '................'; // ~16 dots (Nghề nghiệp)
const DOTS_4COL_SALARY = '..................'; // ~18 dots (Lương)
const DOTS_4COL_GRADE = '............'; // ~12 dots (Ngạch)
const DOTS_4COL_RANK = '...............'; // ~15 dots (Bậc)

const DOTS_SPOUSE_JOB = '....................'; // ~20 dots (Nghề nghiệp vợ - fits single line perfectly)
const DOTS_SPOUSE_CHILDREN = '...................................'; // ~35 dots (Bản thân đã có ... con)

export const getVal = (val?: string | number, fallback?: string | number, defaultDots: string = DOTS_HALF_ROW_LEFT_MED): string => {
  if (val !== undefined && val !== null) {
    const s = String(val).trim();
    if (s !== '' && s.toLowerCase() !== 'chưa cập nhật' && s.toLowerCase() !== 'chua cap nhat') {
      return s;
    }
  }
  if (fallback !== undefined && fallback !== null) {
    const s = String(fallback).trim();
    if (s !== '' && s.toLowerCase() !== 'chưa cập nhật' && s.toLowerCase() !== 'chua cap nhat') {
      return s;
    }
  }
  return defaultDots;
};

export const formatFamilyBirthDate = (val?: string | number): string => {
  if (!val) return 'ngày .. tháng...... ..năm ........';
  const str = String(val).trim();
  if (str === '' || str.toLowerCase() === 'chưa cập nhật' || str.toLowerCase() === 'chua cap nhat') {
    return 'ngày .. tháng...... ..năm ........';
  }
  if (/^\d{4}$/.test(str)) {
    return `ngày .. tháng...... ..năm ${str}`;
  }
  if (str.startsWith('ngày') || str.startsWith('..')) {
    return str;
  }
  const parts = str.split(/[-/.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
    }
    return `ngày ${parts[0]} tháng ${parts[1]} năm ${parts[2]}`;
  }
  return str;
};

export const formatBirthDateCitizen = (day?: string, month?: string, year?: string, fullDob?: string): string => {
  if (day && month && year && day !== '...' && month !== '...' && day !== '..' && month !== '..') {
    return `ngày ${day} tháng ${month} năm ${year}`;
  }
  if (fullDob) {
    const trimmed = fullDob.trim();
    if (/^\d{4}$/.test(trimmed)) {
      return `ngày .. tháng...... ..năm ${trimmed}`;
    }
    const parts = trimmed.split(/[-/.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
      }
      return `ngày ${parts[0]} tháng ${parts[1]} năm ${parts[2]}`;
    }
    if (trimmed.startsWith('ngày') || trimmed.startsWith('..')) {
      return trimmed;
    }
    return trimmed;
  }
  if (year && /^\d{4}$/.test(year)) {
    return `ngày .. tháng...... ..năm ${year}`;
  }
  return `ngày ${day || '..'} tháng ${month || '......'} ..năm ${year || '........'}`;
};

export const buildTemplateData = (recruit: Recruit, cv: CurriculumVitae): Record<string, any> => {
  let dobStr = recruit.dob || '';
  if (!dobStr && (cv.birthDay || cv.birthMonth || cv.birthYear)) {
    const d = cv.birthDay || '...';
    const m = cv.birthMonth || '...';
    const y = cv.birthYear || '...';
    dobStr = `${d}/${m}/${y}`;
  }

  const birthDayVal = getVal(cv.birthDay, undefined, '..');
  const birthMonthVal = getVal(cv.birthMonth, undefined, '..');
  const birthYearVal = getVal(cv.birthYear, undefined, '....');

  const citizenDobFormatted = formatBirthDateCitizen(cv.birthDay, cv.birthMonth, cv.birthYear, dobStr);
  const fatherBirthFormatted = formatFamilyBirthDate(cv.fatherBirthDate || recruit.family?.father?.birthYear);
  const motherBirthFormatted = formatFamilyBirthDate(cv.motherBirthDate || recruit.family?.mother?.birthYear);
  const spouseBirthFormatted = formatFamilyBirthDate(cv.spouseBirthDate);

  const ethnicityVal = getVal(cv.ethnicity, recruit.details?.ethnicity, 'Kinh');
  const religionVal = getVal(cv.religion, recruit.details?.religion, 'Không');
  const nationalityVal = getVal(cv.nationality, 'Việt Nam');

  const citizenIdVal = getVal(cv.citizenId, recruit.citizenId, DOTS_FULL_ROW_CCCD);
  const placeOfBirthVal = getVal(cv.placeOfBirth, undefined, DOTS_FULL_ROW_MED_LABEL);
  const hometownVal = getVal(cv.hometown, undefined, DOTS_FULL_ROW_SHORT_LABEL);
  const permanentAddressVal = getVal(cv.permanentAddress, undefined, DOTS_FULL_ROW_LONG_LABEL);
  const temporaryAddressVal = getVal(cv.temporaryAddress, undefined, DOTS_FULL_ROW_LONG_LABEL);

  const familyClassVal = getVal(cv.familyClass, recruit.details?.familyComposition, DOTS_HALF_ROW_LEFT_LONG);
  const personalClassVal = getVal(cv.personalClass, recruit.details?.personalComposition, DOTS_HALF_ROW_RIGHT_LONG);

  const educationLevelVal = getVal(cv.educationLevel, recruit.details?.education, '12/12');
  const qualificationLevelVal = getVal(cv.qualificationLevel, recruit.details?.school, 'Không');
  const languageLevelVal = getVal(cv.languageLevel, undefined, 'Không');

  const majorVal = getVal(cv.major, recruit.details?.major, 'Không');
  const partyJoinedVal = getVal(cv.communistPartyJoinedDate, recruit.details?.partyEntryDate, 'Không');
  const partyOfficialVal = getVal(cv.communistPartyOfficialDate, undefined, 'Không');
  const youthUnionVal = getVal(cv.youthUnionJoinedDate, undefined, 'Không');

  const commendationsVal = getVal(cv.commendations, recruit.details?.rewards, 'Không');
  const disciplinaryVal = getVal(cv.disciplinaryAction, recruit.details?.disciplines, 'Không');

  const jobVal = getVal(cv.job, recruit.details?.job, 'Không');
  const salaryVal = getVal(cv.salary, undefined, 'Không');
  const salaryGradeVal = getVal(cv.salaryGrade, recruit.details?.gradeGroup, 'Không');
  const salaryRankVal = getVal(cv.salaryRank, recruit.details?.salaryLevel, 'Không');
  const workplaceVal = getVal(cv.workplace, recruit.details?.workAddress, 'Không');
  const foreignTravelVal = getVal(cv.foreignTravel, undefined, 'Không');

  const fatherNameVal = getVal(cv.fatherName, recruit.family?.father?.fullName, DOTS_HALF_ROW_LEFT_SHORT);
  const fatherStatusVal = getVal(cv.fatherStatus, undefined, 'Sống');
  const fatherJobVal = getVal(cv.fatherJob, recruit.family?.father?.job, DOTS_HALF_ROW_RIGHT);

  const motherNameVal = getVal(cv.motherName, recruit.family?.mother?.fullName, DOTS_HALF_ROW_LEFT_SHORT);
  const motherStatusVal = getVal(cv.motherStatus, undefined, 'Sống');
  const motherJobVal = getVal(cv.motherJob, recruit.family?.mother?.job, DOTS_HALF_ROW_RIGHT);

  const spouseNameVal = getVal(cv.spouseName, recruit.family?.wife?.fullName, 'Không');
  const spouseJobVal = getVal(cv.spouseJob, recruit.family?.wife?.job, 'Không');

  const childrenCountNum = cv.childrenCount ? String(cv.childrenCount).padStart(2, '0') : '00';
  const totalSiblingsNum = cv.totalSiblings ? String(cv.totalSiblings).padStart(2, '0') : '01';
  const maleSiblingsNum = cv.maleSiblings ? String(cv.maleSiblings).padStart(2, '0') : '01';
  const femaleSiblingsNum = cv.femaleSiblings ? String(cv.femaleSiblings).padStart(2, '0') : '00';
  const siblingOrderNum = cv.siblingOrder ? String(cv.siblingOrder).padStart(2, '0') : '01';

  const data: Record<string, any> = {
    fullNameUpper: getVal(cv.fullNameUpper, recruit.fullName?.toUpperCase(), DOTS_HALF_ROW_LEFT_SHORT),
    fullName: getVal(recruit.fullName, undefined, DOTS_HALF_ROW_LEFT_SHORT),
    aliasName: getVal(cv.aliasName, recruit.fullName, DOTS_HALF_ROW_LEFT_SHORT),
    birthDay: birthDayVal,
    birthMonth: birthMonthVal,
    birthYear: birthYearVal,
    dob: getVal(dobStr, undefined, DOTS_HALF_ROW_LEFT_MED),
    citizenDobFormatted: citizenDobFormatted,
    gender: getVal(cv.gender, 'Nam'),
    citizenId: citizenIdVal,
    placeOfBirth: placeOfBirthVal,
    hometown: hometownVal,
    ethnicity: ethnicityVal,
    religion: religionVal,
    nationality: nationalityVal,
    permanentAddress: permanentAddressVal,
    temporaryAddress: temporaryAddressVal,
    familyClass: familyClassVal,
    personalClass: personalClassVal,
    educationLevel: educationLevelVal,
    qualificationLevel: qualificationLevelVal,
    languageLevel: languageLevelVal,
    major: majorVal,
    communistPartyJoinedDate: partyJoinedVal,
    communistPartyOfficialDate: partyOfficialVal,
    youthUnionJoinedDate: youthUnionVal,
    commendations: commendationsVal,
    disciplinaryAction: disciplinaryVal,
    job: jobVal,
    salary: salaryVal,
    salaryGrade: salaryGradeVal,
    salaryRank: salaryRankVal,
    workplace: workplaceVal,
    foreignTravel: foreignTravelVal,
    fatherName: fatherNameVal,
    fatherStatus: fatherStatusVal,
    fatherBirthDate: fatherBirthFormatted,
    fatherJob: fatherJobVal,
    motherName: motherNameVal,
    motherStatus: motherStatusVal,
    motherBirthDate: motherBirthFormatted,
    motherJob: motherJobVal,
    spouseName: spouseNameVal,
    spouseBirthDate: spouseBirthFormatted,
    spouseJob: spouseJobVal,
    childrenCount: childrenCountNum,
    totalSiblings: totalSiblingsNum,
    maleSiblings: maleSiblingsNum,
    femaleSiblings: femaleSiblingsNum,
    siblingOrder: siblingOrderNum,

    // COMPOSITE ROWS WITH PROPER TABS
    ROW_ETHNICITY_RELIGION_NATIONALITY: `Dân tộc: ${ethnicityVal};\tTôn giáo: ${religionVal};\tQuốc tịch: ${nationalityVal}`,
    ROW_FAMILY_PERSONAL_CLASS: `Thành phần gia đình: ${familyClassVal}\tBản thân: ${personalClassVal}`,
    ROW_QUALIFICATION_LANGUAGE: `Trình độ đào tạo: ${qualificationLevelVal}\tNgoại ngữ: ${languageLevelVal}`,
    ROW_PARTY_DATES: `Ngày vào Đảng CSVN: ${partyJoinedVal}\tChính thức: ${partyOfficialVal}`,
    ROW_COMMENDATION_DISCIPLINE: `Khen thưởng: ${commendationsVal}\tKỷ luật: ${disciplinaryVal}`,
    ROW_JOB_SALARY: `Nghề nghiệp: ${jobVal}\tLương: Ngạch ${salaryGradeVal} bậc ${salaryRankVal}`,
    ROW_FATHER_STATUS: `Họ tên cha: ${fatherNameVal}\t(Sống, chết): ${fatherStatusVal}`,
    ROW_FATHER_BIRTH_JOB: `Sinh ngày ${fatherBirthFormatted}\tNghề nghiệp: ${fatherJobVal}`,
    ROW_MOTHER_STATUS: `Họ tên mẹ: ${motherNameVal}\t(Sống, chết): ${motherStatusVal}`,
    ROW_MOTHER_BIRTH_JOB: `Sinh ngày ${motherBirthFormatted}\tNghề nghiệp: ${motherJobVal}`,
    ROW_SPOUSE_BIRTH: `Họ tên vợ (chồng): ${spouseNameVal}\tSinh ngày ${spouseBirthFormatted}`,
    ROW_SPOUSE_JOB_CHILDREN: `Nghề nghiệp: ${spouseJobVal}\tBản thân đã có  ${childrenCountNum} con`,
    ROW_SIBLINGS: `Cha mẹ có ${totalSiblingsNum} người con, ${maleSiblingsNum} trai ${femaleSiblingsNum} gái; bản thân là con thứ ${siblingOrderNum}`,
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
  data.CHUYEN_NGANH_DAO_TAO = data.major;
  data.COMMUNIST_PARTY_JOINED_DATE = data.communistPartyJoinedDate;
  data.NGAY_VAO_DANG = data.communistPartyJoinedDate;
  data.COMMUNIST_PARTY_OFFICIAL_DATE = data.communistPartyOfficialDate;
  data.NGAY_DANG_CHINH_THUC = data.communistPartyOfficialDate;
  data.CHINH_THUC = data.communistPartyOfficialDate;
  data.YOUTH_UNION_JOINED_DATE = data.youthUnionJoinedDate;
  data.NGAY_VAO_DOAN = data.youthUnionJoinedDate;
  data.NGAY_VAO_DOAN_TNCS = data.youthUnionJoinedDate;
  data.NGAY_VAO_DOAN_TNCS_HO_CHI_MINH = data.youthUnionJoinedDate;
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
  data.NOI_LAM_VIEC_HOC_TAP = data.workplace;
  data.FOREIGN_TRAVEL = data.foreignTravel;
  data.DI_NUOC_NGOAI = data.foreignTravel;
  data.DA_DI_NUOC_NGOAI = data.foreignTravel;
  data.FATHER_NAME = data.fatherName;
  data.HO_TEN_CHA = data.fatherName;
  data.FATHER_STATUS = data.fatherStatus;
  data.TINH_TRANG_CHA = data.fatherStatus;
  data.SONG_CHET_CHA = data.fatherStatus;
  data.FATHER_BIRTH = data.fatherBirthDate;
  data.FATHER_BIRTH_DATE = data.fatherBirthDate;
  data.NAM_SINH_CHA = data.fatherBirthDate;
  data.FATHER_JOB = data.fatherJob;
  data.NGHE_NGHIEP_CHA = data.fatherJob;
  data.MOTHER_NAME = data.motherName;
  data.HO_TEN_ME = data.motherName;
  data.MOTHER_STATUS = data.motherStatus;
  data.TINH_TRANG_ME = data.motherStatus;
  data.SONG_CHET_ME = data.motherStatus;
  data.MOTHER_BIRTH = data.motherBirthDate;
  data.MOTHER_BIRTH_DATE = data.motherBirthDate;
  data.NAM_SINH_ME = data.motherBirthDate;
  data.MOTHER_JOB = data.motherJob;
  data.NGHE_NGHIEP_ME = data.motherJob;
  data.SPOUSE_NAME = data.spouseName;
  data.HO_TEN_VO = data.spouseName;
  data.HO_TEN_VO_CHONG = data.spouseName;
  data.HO_VA_TEN_VO_CHONG = data.spouseName;
  data.SPOUSE_BIRTH = data.spouseBirthDate;
  data.SPOUSE_BIRTH_DATE = data.spouseBirthDate;
  data.NAM_SINH_VO = data.spouseBirthDate;
  data.SPOUSE_JOB = data.spouseJob;
  data.NGHE_NGHIEP_VO = data.spouseJob;
  data.NGHE_NGHIEP_VO_CHONG = data.spouseJob;
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
    qualificationLevel: existingCV.qualificationLevel || recruit.details?.school || '',
    languageLevel: existingCV.languageLevel || '',
    major: existingCV.major || recruit.details?.major || '',
    communistPartyJoinedDate: existingCV.communistPartyJoinedDate || recruit.details?.partyEntryDate || '',
    communistPartyOfficialDate: existingCV.communistPartyOfficialDate || '',
    youthUnionJoinedDate: existingCV.youthUnionJoinedDate || '',
    commendations: existingCV.commendations || recruit.details?.rewards || '',
    disciplinaryAction: existingCV.disciplinaryAction || recruit.details?.disciplines || '',
    job: existingCV.job || recruit.details?.job || '',
    salary: existingCV.salary || '',
    salaryGrade: existingCV.salaryGrade || recruit.details?.gradeGroup || '',
    salaryRank: existingCV.salaryRank || recruit.details?.salaryLevel || '',
    workplace: existingCV.workplace || recruit.details?.workAddress || '',
    foreignTravel: existingCV.foreignTravel || '',
    fatherName: existingCV.fatherName || recruit.family?.father?.fullName || '',
    fatherStatus: existingCV.fatherStatus || 'Sống',
    fatherBirthDate: existingCV.fatherBirthDate || recruit.family?.father?.birthYear || '',
    fatherJob: existingCV.fatherJob || recruit.family?.father?.job || '',
    motherName: existingCV.motherName || recruit.family?.mother?.fullName || '',
    motherStatus: existingCV.motherStatus || 'Sống',
    motherBirthDate: existingCV.motherBirthDate || recruit.family?.mother?.birthYear || '',
    motherJob: existingCV.motherJob || recruit.family?.mother?.job || '',
    spouseName: existingCV.spouseName || recruit.family?.wife?.fullName || '',
    spouseBirthDate: existingCV.spouseBirthDate || '',
    spouseJob: existingCV.spouseJob || recruit.family?.wife?.job || '',
    childrenCount: existingCV.childrenCount || recruit.family?.children || '',
    totalSiblings: existingCV.totalSiblings || recruit.details?.siblingCount || '',
    maleSiblings: existingCV.maleSiblings || '',
    femaleSiblings: existingCV.femaleSiblings || '',
    siblingOrder: existingCV.siblingOrder || recruit.details?.birthOrder || '1',
  };
};

/**
 * Tạo trực tiếp file Word Lý lịch Nghĩa vụ Quân sự chuẩn bằng thư viện docx
 * Đảm bảo tab stop chuẩn xác, các trường trống để chấm lửng (không để "chưa cập nhật")
 */
export const generateStandardLyLichNVQSDocx = async (recruit: Recruit, cv: CurriculumVitae): Promise<Blob> => {
  const data = buildTemplateData(recruit, cv);

  const FONT_FAMILY = 'Times New Roman';
  const FONT_SIZE_BODY = 26; // 13pt
  const FONT_SIZE_TITLE = 30; // 15pt

  // Tab stop constants for exact column alignments matching standard military resume
  // Printable width = 9355 twips (16.5cm)
  const TAB_POS_2COL = 4900; // ~8.64cm from left margin
  const TAB_POS_3COL_1 = 2800; // ~4.94cm from left margin (Tôn giáo)
  const TAB_POS_3COL_2 = 5800; // ~10.23cm from left margin (Quốc tịch)

  const createBodyParagraph = (runs: TextRun[], tabStops?: { type: typeof TabStopType.LEFT; position: number }[]) => {
    return new Paragraph({
      tabStops: tabStops || [
        { type: TabStopType.LEFT, position: TAB_POS_2COL }
      ],
      spacing: { after: 50, line: 260 },
      children: runs.map(r => {
        return new TextRun({
          font: FONT_FAMILY,
          size: FONT_SIZE_BODY,
          ...r
        });
      }),
    });
  };

  const communeUpper = (recruit.address?.commune ? `XÃ/PHƯỜNG ${recruit.address.commune.toUpperCase()}` : "CẤP XÃ/PHƯỜNG");

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: FONT_SIZE_BODY,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMillimetersToTwip(20),
              bottom: convertMillimetersToTwip(20),
              left: convertMillimetersToTwip(25),
              right: convertMillimetersToTwip(15),
            },
          },
        },
        children: [
          // HEADER TABLE: Left - Cơ quan, Right - Quốc hiệu Tiêu ngữ
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 42, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "HỘI ĐỒNG NVQS", font: FONT_FAMILY, size: 22, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ 
                            text: communeUpper, 
                            font: FONT_FAMILY, 
                            size: 22, 
                            bold: true 
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 58, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", font: FONT_FAMILY, size: 24, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", font: FONT_FAMILY, size: 26, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "-----------------------", font: FONT_FAMILY, size: 20 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // SPACING BEFORE TITLE
          new Paragraph({ spacing: { after: 120 }, children: [] }),

          // MAIN TITLE
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: "SƠ YẾU LÝ LỊCH NGHĨA VỤ QUÂN SỰ",
                font: FONT_FAMILY,
                size: FONT_SIZE_TITLE,
                bold: true,
              }),
            ],
          }),

          // LINE 1: Họ, chữ đệm và tên khai sinh (viết chữ in hoa)
          createBodyParagraph([
            new TextRun("Họ, chữ đệm và tên khai sinh (viết chữ in hoa): "),
            new TextRun({ text: data.fullNameUpper, bold: true }),
          ]),

          // LINE 2: Họ, chữ đệm và tên thường dùng
          createBodyParagraph([
            new TextRun("Họ, chữ đệm và tên thường dùng: "),
            new TextRun(data.aliasName),
          ]),

          // LINE 3: Sinh ngày ... Giới tính: ...
          createBodyParagraph([
            new TextRun(`Sinh ${data.citizenDobFormatted}`),
            new TextRun(`\tGiới tính: ${data.gender}`),
          ]),

          // LINE 4: Số thẻ căn cước/CCCD
          createBodyParagraph([
            new TextRun("Số thẻ căn cước/CCCD: "),
            new TextRun(data.citizenId),
          ]),

          // LINE 5: Nơi đăng ký khai sinh
          createBodyParagraph([
            new TextRun("Nơi đăng ký khai sinh: "),
            new TextRun(data.placeOfBirth),
          ]),

          // LINE 6: Quê quán
          createBodyParagraph([
            new TextRun("Quê quán: "),
            new TextRun(data.hometown),
          ]),

          // LINE 7: Dân tộc; Tôn giáo; Quốc tịch (3 columns with exact tabs)
          createBodyParagraph([
            new TextRun("Dân tộc: "),
            new TextRun(`${data.ethnicity};`),
            new TextRun("\tTôn giáo: "),
            new TextRun(`${data.religion};`),
            new TextRun("\tQuốc tịch: "),
            new TextRun(data.nationality),
          ], [
            { type: TabStopType.LEFT, position: TAB_POS_3COL_1 },
            { type: TabStopType.LEFT, position: TAB_POS_3COL_2 },
          ]),

          // LINE 8: Nơi thường trú của gia đình
          createBodyParagraph([
            new TextRun("Nơi thường trú của gia đình: "),
            new TextRun(data.permanentAddress),
          ]),

          // LINE 9: Nơi ở hiện tại của bản thân
          createBodyParagraph([
            new TextRun("Nơi ở hiện tại của bản thân: "),
            new TextRun(data.temporaryAddress),
          ]),

          // LINE 10: Thành phần gia đình / Bản thân
          createBodyParagraph([
            new TextRun("Thành phần gia đình: "),
            new TextRun(data.familyClass),
            new TextRun("\tBản thân: "),
            new TextRun(data.personalClass),
          ]),

          // LINE 11: Trình độ giáo dục phổ thông
          createBodyParagraph([
            new TextRun("Trình độ giáo dục phổ thông: "),
            new TextRun(data.educationLevel),
          ]),

          // LINE 12: Trình độ đào tạo / Ngoại ngữ
          createBodyParagraph([
            new TextRun("Trình độ đào tạo: "),
            new TextRun(data.qualificationLevel),
            new TextRun("\tNgoại ngữ:"),
            new TextRun(data.languageLevel),
          ]),

          // LINE 13: Chuyên ngành đào tạo
          createBodyParagraph([
            new TextRun("Chuyên ngành đào tạo:"),
            new TextRun(data.major),
          ]),

          // LINE 14: Ngày vào Đảng CSVN / Chính thức
          createBodyParagraph([
            new TextRun("Ngày vào Đảng CSVN: "),
            new TextRun(data.communistPartyJoinedDate),
            new TextRun("\tChính thức:"),
            new TextRun(data.communistPartyOfficialDate),
          ]),

          // LINE 15: Ngày vào Đoàn TNCS Hồ Chí Minh
          createBodyParagraph([
            new TextRun("Ngày vào Đoàn TNCS Hồ Chí Minh: "),
            new TextRun(data.youthUnionJoinedDate),
          ]),

          // LINE 16: Khen thưởng / Kỷ luật
          createBodyParagraph([
            new TextRun("Khen thưởng:"),
            new TextRun(data.commendations),
            new TextRun("\tKỷ luật:"),
            new TextRun(data.disciplinaryAction),
          ]),

          // LINE 17: Nghề nghiệp / Lương
          createBodyParagraph([
            new TextRun("Nghề nghiệp: "),
            new TextRun(data.job),
            new TextRun(`\tLương: Ngạch${data.salaryGrade} bậc${data.salaryRank}`),
          ]),

          // LINE 18: Nơi làm việc, (học tập)
          createBodyParagraph([
            new TextRun("Nơi làm việc, (học tập): "),
            new TextRun(data.workplace),
          ]),

          // LINE 19: Đã đi nước ngoài
          createBodyParagraph([
            new TextRun("Đã đi nước ngoài (tên nước, thời gian, lý do):"),
            new TextRun(data.foreignTravel),
          ]),

          // LINE 20: Họ tên cha / (Sống, chết)
          createBodyParagraph([
            new TextRun("Họ tên cha: "),
            new TextRun(data.fatherName),
            new TextRun("\t(Sống, chết): "),
            new TextRun(data.fatherStatus),
          ]),

          // LINE 21: Sinh ngày cha / Nghề nghiệp
          createBodyParagraph([
            new TextRun(`Sinh ${data.fatherBirthDate}`),
            new TextRun("\tNghề nghiệp: "),
            new TextRun(data.fatherJob),
          ]),

          // LINE 22: Họ tên mẹ / (Sống, chết)
          createBodyParagraph([
            new TextRun("Họ tên mẹ: "),
            new TextRun(data.motherName),
            new TextRun("\t(Sống, chết): "),
            new TextRun(data.motherStatus),
          ]),

          // LINE 23: Sinh ngày mẹ / Nghề nghiệp
          createBodyParagraph([
            new TextRun(`Sinh ${data.motherBirthDate}`),
            new TextRun("\tNghề nghiệp: "),
            new TextRun(data.motherJob),
          ]),

          // LINE 24: Họ tên vợ (chồng) / Sinh ngày
          createBodyParagraph([
            new TextRun("Họ tên vợ (chồng): "),
            new TextRun(data.spouseName),
            new TextRun(`\tSinh ${data.spouseBirthDate}`),
          ]),

          // LINE 25: Nghề nghiệp vợ / Bản thân đã có ... con
          createBodyParagraph([
            new TextRun("Nghề nghiệp: "),
            new TextRun(data.spouseJob),
            new TextRun(`\tBản thân đã có ${data.childrenCount} con`),
          ]),

          // LINE 26: Cha mẹ có ... người con
          createBodyParagraph([
            new TextRun(`Cha mẹ có ${data.totalSiblings} người con, ${data.maleSiblings} trai ${data.femaleSiblings} gái; bản thân là con thứ ${data.siblingOrder}`),
          ]),

          // LINE 27: Lời cam đoan
          new Paragraph({
            spacing: { before: 80, after: 120, line: 260 },
            children: [
              new TextRun({
                text: "Tôi xin cam đoan những lời khai trên đây là đúng sự thật, nếu có điều gì sai trái tôi xin hoàn toàn chịu trách nhiệm trước pháp luật.",
                font: FONT_FAMILY,
                size: FONT_SIZE_BODY,
                italics: true,
              }),
            ],
          }),

          // LINE 28: SIGNATURE TABLE
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "TM. HỘI ĐỒNG NGHĨA VỤ QUÂN SỰ", font: FONT_FAMILY, size: FONT_SIZE_BODY, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "CHỈ HUY TRƯỞNG BAN CHQS", font: FONT_FAMILY, size: FONT_SIZE_BODY, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "(Ký tên, đóng dấu)", font: FONT_FAMILY, size: 22, italics: true }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "Ngày ..... tháng ..... năm 202...", font: FONT_FAMILY, size: 24, italics: true }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "NGƯỜI KHAI LÝ LỊCH", font: FONT_FAMILY, size: FONT_SIZE_BODY, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: "(Ký và ghi rõ họ tên)", font: FONT_FAMILY, size: 22, italics: true }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 800 },
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: data.fullName, font: FONT_FAMILY, size: FONT_SIZE_BODY, bold: true }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
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
    if (master?.url && master.url !== DEFAULT_SAMPLE_URL && !master.url.includes('UEsDBBQAAAAIAAAAIQAAAAAA')) {
      masterUrl = master.url;
    }
  } catch (e) {
    console.warn("Không thể lấy mẫu file Word từ Admin:", e);
  }

  let activeUrl = (templateUrl && templateUrl !== DEFAULT_SAMPLE_URL && !templateUrl.includes('UEsDBBQAAAAIAAAAIQAAAAAA')) 
    ? templateUrl 
    : masterUrl;

  const filename = `Ly_Lich_NVQS_${recruit.fullName ? recruit.fullName.replace(/\s+/g, '_') : 'Cong_Dan'}.docx`;

  // Always generate standard, pristine docx matching Image 1 directly
  // If an active custom template URL is present, try docxtemplater, and fallback seamlessly to standard docx
  if (!activeUrl) {
    const blob = await generateStandardLyLichNVQSDocx(recruit, cv);
    saveAs(blob, filename);
    return true;
  }

  const tryGenerateDocxtemplater = async (urlToUse: string): Promise<boolean> => {
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
            return scope[cleanTag] ?? DOTS_HALF_ROW_LEFT_MED;
          }
        };
      },
      nullGetter() { return DOTS_HALF_ROW_LEFT_MED; }
    });

    const dataPayload = buildTemplateData(recruit, cv);
    docxtpl.render(dataPayload);

    const outBlob = docxtpl.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    saveAs(outBlob, filename);
    return true;
  };

  try {
    await tryGenerateDocxtemplater(activeUrl);
  } catch (err: any) {
    console.warn("Lỗi khi trộn dữ liệu với mẫu tải lên, tự động xuất bằng Mẫu Lý Lịch Chuẩn định dạng Quân sự:", err);
    // Fallback directly to the standard docx generator
    const blob = await generateStandardLyLichNVQSDocx(recruit, cv);
    saveAs(blob, filename);
  }
  return true;
};
