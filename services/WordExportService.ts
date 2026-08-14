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

const DEFAULT_DOTS_SHORT = '............';
const DEFAULT_DOTS_MED = '................................';
const DEFAULT_DOTS_LONG = '...................................................................';

export const getVal = (val?: string | number, fallback?: string | number, defaultDots: string = DEFAULT_DOTS_MED): string => {
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
  if (!val) return '.. tháng...... ..năm ........';
  const str = String(val).trim();
  if (str === '' || str.toLowerCase() === 'chưa cập nhật' || str.toLowerCase() === 'chua cap nhat') {
    return '.. tháng...... ..năm ........';
  }
  if (/^\d{4}$/.test(str)) {
    return `.. tháng...... ..năm ${str}`;
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
  if (day && month && year && day !== '...' && month !== '...') {
    return `ngày ${day} tháng ${month} năm ${year}`;
  }
  if (fullDob) {
    const parts = fullDob.split(/[-/.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
      }
      return `ngày ${parts[0]} tháng ${parts[1]} năm ${parts[2]}`;
    }
    if (parts.length === 1 && parts[0].length === 4) {
      return `.. tháng...... ..năm ${parts[0]}`;
    }
    return fullDob;
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

  const fatherBirthFormatted = formatFamilyBirthDate(cv.fatherBirthDate || recruit.family?.father?.birthYear);
  const motherBirthFormatted = formatFamilyBirthDate(cv.motherBirthDate || recruit.family?.mother?.birthYear);
  const spouseBirthFormatted = formatFamilyBirthDate(cv.spouseBirthDate);

  const ethnicityVal = getVal(cv.ethnicity, recruit.details?.ethnicity, 'Kinh');
  const religionVal = getVal(cv.religion, recruit.details?.religion, 'Không');
  const nationalityVal = getVal(cv.nationality, 'Việt Nam');

  const familyClassVal = getVal(cv.familyClass, recruit.details?.familyComposition, '........................');
  const personalClassVal = getVal(cv.personalClass, recruit.details?.personalComposition, '........................');

  const educationLevelVal = getVal(cv.educationLevel, recruit.details?.education, '12/12');
  const qualificationLevelVal = getVal(cv.qualificationLevel, recruit.details?.school, '........................');
  const languageLevelVal = getVal(cv.languageLevel, undefined, '............................................');

  const majorVal = getVal(cv.major, recruit.details?.major, DEFAULT_DOTS_LONG);
  const partyJoinedVal = getVal(cv.communistPartyJoinedDate, recruit.details?.partyEntryDate, DEFAULT_DOTS_MED);
  const partyOfficialVal = getVal(cv.communistPartyOfficialDate, undefined, '.........................');
  const youthUnionVal = getVal(cv.youthUnionJoinedDate, undefined, DEFAULT_DOTS_MED);

  const commendationsVal = getVal(cv.commendations, recruit.details?.rewards, '........................................');
  const disciplinaryVal = getVal(cv.disciplinaryAction, recruit.details?.disciplines, '............................');

  const jobVal = getVal(cv.job, recruit.details?.job, '........................');
  const salaryGradeVal = getVal(cv.salaryGrade, recruit.details?.gradeGroup, '..................');
  const salaryRankVal = getVal(cv.salaryRank, recruit.details?.salaryLevel, '..........................');
  const workplaceVal = getVal(cv.workplace, recruit.details?.workAddress, DEFAULT_DOTS_LONG);
  const foreignTravelVal = getVal(cv.foreignTravel, undefined, DEFAULT_DOTS_LONG);

  const fatherNameVal = getVal(cv.fatherName, recruit.family?.father?.fullName, DEFAULT_DOTS_MED);
  const fatherStatusVal = getVal(cv.fatherStatus, undefined, 'Sống');
  const fatherJobVal = getVal(cv.fatherJob, recruit.family?.father?.job, DEFAULT_DOTS_MED);

  const motherNameVal = getVal(cv.motherName, recruit.family?.mother?.fullName, DEFAULT_DOTS_MED);
  const motherStatusVal = getVal(cv.motherStatus, undefined, 'Sống');
  const motherJobVal = getVal(cv.motherJob, recruit.family?.mother?.job, DEFAULT_DOTS_MED);

  const spouseNameVal = getVal(cv.spouseName, recruit.family?.wife?.fullName, DEFAULT_DOTS_MED);
  const spouseJobVal = getVal(cv.spouseJob, recruit.family?.wife?.job, DEFAULT_DOTS_MED);

  const childrenCountNum = cv.childrenCount ? String(cv.childrenCount).padStart(2, '0') : '00';
  const totalSiblingsNum = cv.totalSiblings ? String(cv.totalSiblings).padStart(2, '0') : '01';
  const maleSiblingsNum = cv.maleSiblings ? String(cv.maleSiblings).padStart(2, '0') : '01';
  const femaleSiblingsNum = cv.femaleSiblings ? String(cv.femaleSiblings).padStart(2, '0') : '00';
  const siblingOrderNum = cv.siblingOrder ? String(cv.siblingOrder).padStart(2, '0') : '01';

  const data: Record<string, any> = {
    fullNameUpper: getVal(cv.fullNameUpper, recruit.fullName?.toUpperCase(), DEFAULT_DOTS_MED),
    fullName: getVal(recruit.fullName, undefined, DEFAULT_DOTS_MED),
    aliasName: getVal(cv.aliasName, recruit.fullName, DEFAULT_DOTS_MED),
    birthDay: birthDayVal,
    birthMonth: birthMonthVal,
    birthYear: birthYearVal,
    dob: getVal(dobStr, undefined, DEFAULT_DOTS_MED),
    gender: getVal(cv.gender, 'Nam'),
    citizenId: getVal(cv.citizenId, recruit.citizenId, DEFAULT_DOTS_MED),
    placeOfBirth: getVal(cv.placeOfBirth, undefined, DEFAULT_DOTS_LONG),
    hometown: getVal(cv.hometown, undefined, DEFAULT_DOTS_LONG),
    ethnicity: ethnicityVal,
    religion: religionVal,
    nationality: nationalityVal,
    permanentAddress: getVal(cv.permanentAddress, undefined, DEFAULT_DOTS_LONG),
    temporaryAddress: getVal(cv.temporaryAddress, undefined, DEFAULT_DOTS_LONG),
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
    salary: getVal(cv.salary, undefined, DEFAULT_DOTS_MED),
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
  const FONT_SIZE_HEADING = 28; // 14pt
  const FONT_SIZE_TITLE = 32; // 16pt

  // Tab stop constants for exact column alignments
  // Page width A4 = 11906 twips. Left margin = 1417 twips, Right margin = 1134 twips. Printable width = 9355 twips.
  const TAB_POS_2COL = 4800; // ~8.5cm from left
  const TAB_POS_3COL_1 = 3800; // ~6.7cm from left
  const TAB_POS_3COL_2 = 6800; // ~12cm from left

  const createBodyParagraph = (runs: TextRun[], tabStops?: { type: typeof TabStopType.LEFT; position: number }[]) => {
    return new Paragraph({
      tabStops: tabStops || [
        { type: TabStopType.LEFT, position: TAB_POS_2COL }
      ],
      spacing: { after: 100, line: 276 },
      children: runs.map(r => {
        return new TextRun({
          font: FONT_FAMILY,
          size: FONT_SIZE_BODY,
          ...r
        });
      }),
    });
  };

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
                    width: { size: 40, type: WidthType.PERCENTAGE },
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
                            text: (recruit.address?.commune ? `XÃ/PHƯỜNG ${recruit.address.commune.toUpperCase()}` : "CẤP XÃ/PHƯỜNG"), 
                            font: FONT_FAMILY, 
                            size: 22, 
                            bold: true 
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
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

          // SPACING
          new Paragraph({ spacing: { after: 180 }, children: [] }),

          // MAIN TITLE
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "SƠ YẾU LÝ LỊCH NGHĨA VỤ QUÂN SỰ",
                font: FONT_FAMILY,
                size: FONT_SIZE_TITLE,
                bold: true,
              }),
            ],
          }),

          // BASIC PROFILE TABLE (Ảnh 4x6 & Tên, ngày sinh, CCCD)
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
                    width: { size: 24, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 4, color: "888888" },
                      bottom: { style: BorderStyle.SINGLE, size: 4, color: "888888" },
                      left: { style: BorderStyle.SINGLE, size: 4, color: "888888" },
                      right: { style: BorderStyle.SINGLE, size: 4, color: "888888" },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 500, after: 500 },
                        children: [
                          new TextRun({ text: "Ảnh 4 x 6 cm", font: FONT_FAMILY, size: 20, italics: true, color: "777777" }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 76, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        spacing: { after: 80, line: 260 },
                        children: [
                          new TextRun({ text: "  Họ, chữ đệm và tên khai sinh: ", font: FONT_FAMILY, size: FONT_SIZE_BODY }),
                          new TextRun({ text: data.fullNameUpper, font: FONT_FAMILY, size: FONT_SIZE_BODY, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80, line: 260 },
                        children: [
                          new TextRun({ text: "  Họ, chữ đệm và tên thường dùng: ", font: FONT_FAMILY, size: FONT_SIZE_BODY }),
                          new TextRun({ text: data.aliasName, font: FONT_FAMILY, size: FONT_SIZE_BODY }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80, line: 260 },
                        tabStops: [{ type: TabStopType.LEFT, position: 4000 }],
                        children: [
                          new TextRun({ 
                            text: `  Sinh ngày ${data.birthDay} tháng ${data.birthMonth} năm ${data.birthYear}`, 
                            font: FONT_FAMILY, 
                            size: FONT_SIZE_BODY 
                          }),
                          new TextRun({ text: `\tGiới tính: ${data.gender}`, font: FONT_FAMILY, size: FONT_SIZE_BODY }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 80, line: 260 },
                        children: [
                          new TextRun({ text: "  Số thẻ căn cước / CCCD: ", font: FONT_FAMILY, size: FONT_SIZE_BODY }),
                          new TextRun({ text: data.citizenId, font: FONT_FAMILY, size: FONT_SIZE_BODY, bold: true }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 120 }, children: [] }),

          // SECTION I: LÝ LỊCH BẢN THÂN
          new Paragraph({
            spacing: { before: 120, after: 120 },
            children: [
              new TextRun({
                text: "I. LÝ LỊCH BẢN THÂN",
                font: FONT_FAMILY,
                size: FONT_SIZE_HEADING,
                bold: true,
              }),
            ],
          }),

          createBodyParagraph([
            new TextRun("Nơi đăng ký khai sinh: "),
            new TextRun(data.placeOfBirth),
          ]),

          createBodyParagraph([
            new TextRun("Quê quán: "),
            new TextRun(data.hometown),
          ]),

          // Dân tộc; Tôn giáo; Quốc tịch (3 columns with Tabs)
          createBodyParagraph([
            new TextRun("Dân tộc: "),
            new TextRun(data.ethnicity),
            new TextRun(";\tTôn giáo: "),
            new TextRun(data.religion),
            new TextRun(";\tQuốc tịch: "),
            new TextRun(data.nationality),
          ], [
            { type: TabStopType.LEFT, position: TAB_POS_3COL_1 },
            { type: TabStopType.LEFT, position: TAB_POS_3COL_2 },
          ]),

          createBodyParagraph([
            new TextRun("Nơi thường trú của gia đình: "),
            new TextRun(data.permanentAddress),
          ]),

          createBodyParagraph([
            new TextRun("Nơi ở hiện tại của bản thân: "),
            new TextRun(data.temporaryAddress),
          ]),

          // Thành phần gia đình / Bản thân
          createBodyParagraph([
            new TextRun("Thành phần gia đình: "),
            new TextRun(data.familyClass),
            new TextRun("\tBản thân: "),
            new TextRun(data.personalClass),
          ]),

          createBodyParagraph([
            new TextRun("Trình độ giáo dục phổ thông: "),
            new TextRun(data.educationLevel),
          ]),

          // Trình độ đào tạo / Ngoại ngữ
          createBodyParagraph([
            new TextRun("Trình độ đào tạo: "),
            new TextRun(data.qualificationLevel),
            new TextRun("\tNgoại ngữ: "),
            new TextRun(data.languageLevel),
          ]),

          createBodyParagraph([
            new TextRun("Chuyên ngành đào tạo: "),
            new TextRun(data.major),
          ]),

          // Ngày vào Đảng / Chính thức
          createBodyParagraph([
            new TextRun("Ngày vào Đảng CSVN: "),
            new TextRun(data.communistPartyJoinedDate),
            new TextRun("\tChính thức: "),
            new TextRun(data.communistPartyOfficialDate),
          ]),

          createBodyParagraph([
            new TextRun("Ngày vào Đoàn TNCS Hồ Chí Minh: "),
            new TextRun(data.youthUnionJoinedDate),
          ]),

          // Khen thưởng / Kỷ luật
          createBodyParagraph([
            new TextRun("Khen thưởng: "),
            new TextRun(data.commendations),
            new TextRun("\tKỷ luật: "),
            new TextRun(data.disciplinaryAction),
          ]),

          // Nghề nghiệp / Lương: Ngạch... bậc...
          createBodyParagraph([
            new TextRun("Nghề nghiệp: "),
            new TextRun(data.job),
            new TextRun(`\tLương: Ngạch ${data.salaryGrade} bậc ${data.salaryRank}`),
          ]),

          createBodyParagraph([
            new TextRun("Nơi làm việc, (học tập): "),
            new TextRun(data.workplace),
          ]),

          createBodyParagraph([
            new TextRun("Đã đi nước ngoài (tên nước, thời gian, lý do): "),
            new TextRun(data.foreignTravel),
          ]),

          // SECTION II: THÀNH PHẦN GIA ĐÌNH
          new Paragraph({
            spacing: { before: 180, after: 120 },
            children: [
              new TextRun({
                text: "II. THÀNH PHẦN GIA ĐÌNH",
                font: FONT_FAMILY,
                size: FONT_SIZE_HEADING,
                bold: true,
              }),
            ],
          }),

          // Cha: Họ tên / Tình trạng
          createBodyParagraph([
            new TextRun("Họ tên cha: "),
            new TextRun(data.fatherName),
            new TextRun("\t(Sống, chết): "),
            new TextRun(data.fatherStatus),
          ]),

          // Cha: Ngày sinh / Nghề nghiệp
          createBodyParagraph([
            new TextRun(`Sinh ngày ${data.fatherBirthDate}`),
            new TextRun("\tNghề nghiệp: "),
            new TextRun(data.fatherJob),
          ]),

          // Mẹ: Họ tên / Tình trạng
          createBodyParagraph([
            new TextRun("Họ tên mẹ: "),
            new TextRun(data.motherName),
            new TextRun("\t(Sống, chết): "),
            new TextRun(data.motherStatus),
          ]),

          // Mẹ: Ngày sinh / Nghề nghiệp
          createBodyParagraph([
            new TextRun(`Sinh ngày ${data.motherBirthDate}`),
            new TextRun("\tNghề nghiệp: "),
            new TextRun(data.motherJob),
          ]),

          // Vợ (chồng): Họ tên / Sinh ngày
          createBodyParagraph([
            new TextRun("Họ tên vợ (chồng): "),
            new TextRun(data.spouseName),
            new TextRun(`\tSinh ngày ${data.spouseBirthDate}`),
          ]),

          // Vợ: Nghề nghiệp / Đã có ... con
          createBodyParagraph([
            new TextRun("Nghề nghiệp: "),
            new TextRun(data.spouseJob),
            new TextRun(`\tBản thân đã có  ${data.childrenCount} con`),
          ]),

          // Anh chị em
          createBodyParagraph([
            new TextRun(`Cha mẹ có ${data.totalSiblings} người con, ${data.maleSiblings} trai ${data.femaleSiblings} gái; bản thân là con thứ ${data.siblingOrder}`),
          ]),

          // SECTION III: CAM ĐOAN & XÁC NHẬN
          new Paragraph({
            spacing: { before: 180, after: 120 },
            children: [
              new TextRun({
                text: "III. LỜI CAM ĐOAN CỦA BẢN THÂN VÀ XÁC NHẬN",
                font: FONT_FAMILY,
                size: FONT_SIZE_HEADING,
                bold: true,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 140, line: 276 },
            children: [
              new TextRun({
                text: "Tôi xin cam đoan những lời khai trên đây là đúng sự thật, nếu có điều gì sai trái tôi xin hoàn toàn chịu trách nhiệm trước pháp luật.",
                font: FONT_FAMILY,
                size: FONT_SIZE_BODY,
                italics: true,
              }),
            ],
          }),

          // SIGNATURE TABLE
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

  // If no custom template URL, generate using standard docx generator directly!
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
            return scope[cleanTag] ?? DEFAULT_DOTS_MED;
          }
        };
      },
      nullGetter() { return DEFAULT_DOTS_MED; }
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
