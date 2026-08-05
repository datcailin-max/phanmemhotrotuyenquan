import { Document, Packer, Paragraph, TextRun, AlignmentType, Header, Footer, PageNumber } from 'docx';
import { saveAs } from 'file-saver';
// @ts-ignore
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import PizZip from 'pizzip';
import { Recruit, CurriculumVitae } from '../types';
import { api } from '../api';

export const buildTemplateData = (recruit: Recruit, cv: CurriculumVitae): Record<string, any> => {
  const dobStr = recruit.dob || (cv.birthDay ? `${cv.birthDay}/${cv.birthMonth}/${cv.birthYear}` : '');

  const data: Record<string, any> = {
    fullNameUpper: cv.fullNameUpper || (recruit.fullName ? recruit.fullName.toUpperCase() : ''),
    fullName: recruit.fullName || '',
    aliasName: cv.aliasName || recruit.fullName || '',
    birthDay: cv.birthDay || '',
    birthMonth: cv.birthMonth || '',
    birthYear: cv.birthYear || '',
    dob: dobStr,
    gender: cv.gender || 'Nam',
    citizenId: cv.citizenId || recruit.citizenId || '',
    placeOfBirth: cv.placeOfBirth || '',
    hometown: cv.hometown || '',
    ethnicity: cv.ethnicity || recruit.details?.ethnicity || '',
    religion: cv.religion || recruit.details?.religion || '',
    nationality: cv.nationality || 'Việt Nam',
    permanentAddress: cv.permanentAddress || '',
    temporaryAddress: cv.temporaryAddress || '',
    familyClass: cv.familyClass || '',
    personalClass: cv.personalClass || '',
    educationLevel: cv.educationLevel || recruit.details?.education || '',
    qualificationLevel: cv.qualificationLevel || recruit.details?.school || '',
    languageLevel: cv.languageLevel || '',
    major: cv.major || recruit.details?.major || '',
    communistPartyJoinedDate: cv.communistPartyJoinedDate || recruit.details?.partyEntryDate || '',
    communistPartyOfficialDate: cv.communistPartyOfficialDate || '',
    youthUnionJoinedDate: cv.youthUnionJoinedDate || '',
    commendations: cv.commendations || recruit.details?.rewards || '',
    disciplinaryAction: cv.disciplinaryAction || recruit.details?.disciplines || '',
    job: cv.job || recruit.details?.job || '',
    salary: cv.salary || '',
    salaryGrade: cv.salaryGrade || '',
    salaryRank: cv.salaryRank || '',
    workplace: cv.workplace || recruit.details?.workAddress || '',
    foreignTravel: cv.foreignTravel || '',
    fatherName: cv.fatherName || recruit.family?.father?.fullName || '',
    fatherStatus: cv.fatherStatus || '',
    fatherBirthDate: cv.fatherBirthDate || '',
    fatherJob: cv.fatherJob || recruit.family?.father?.job || '',
    motherName: cv.motherName || recruit.family?.mother?.fullName || '',
    motherStatus: cv.motherStatus || '',
    motherBirthDate: cv.motherBirthDate || '',
    motherJob: cv.motherJob || recruit.family?.mother?.job || '',
    spouseName: cv.spouseName || recruit.family?.wife?.fullName || '',
    spouseBirthDate: cv.spouseBirthDate || '',
    spouseJob: cv.spouseJob || recruit.family?.wife?.job || '',
    childrenCount: cv.childrenCount || '0',
    totalSiblings: cv.totalSiblings || '1',
    maleSiblings: cv.maleSiblings || '',
    femaleSiblings: cv.femaleSiblings || '',
    siblingOrder: cv.siblingOrder || '1',
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

  let activeUrl = templateUrl;
  if (!activeUrl) {
    try {
      const master = await api.getMasterWordTemplate().catch(() => null);
      if (master?.url) {
        activeUrl = master.url;
      }
    } catch (e) {
      console.warn("Không thể lấy mẫu file Word từ Admin:", e);
    }
  }

  // If a Word template URL is provided or retrieved from Admin master template
  if (activeUrl) {
    try {
      let arrayBuffer: ArrayBuffer;
      if (activeUrl.startsWith('data:')) {
        const base64Data = activeUrl.split(';base64,').pop() || '';
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      } else {
        const res = await fetch(activeUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        arrayBuffer = await res.arrayBuffer();
      }

      const zip = new PizZip(arrayBuffer);
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
      return;
    } catch (err: any) {
      console.warn("Lỗi khi bơm dữ liệu vào mẫu file Word Admin, chuyển sang tự tạo file Word đầy đủ...", err);
    }
  }

  // Fallback programmatic generation for complete 5-section Military Record document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header Quốc Hiệu
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, size: 26, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, size: 24, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: '---------------------------------', size: 22, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: 'LÝ LỊCH NGHĨA VỤ QUÂN SỰ', bold: true, size: 30, font: 'Times New Roman' }),
            ],
          }),

          // --- I. SƠ YẾU LÝ LỊCH ---
          new Paragraph({
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({ text: 'I. SƠ YẾU LÝ LỊCH', bold: true, size: 26, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: '1. Họ, chữ đệm và tên khai sinh (viết chữ in hoa): ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.fullNameUpper || recruit.fullName?.toUpperCase() || '................................................', bold: true, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: '2. Họ, chữ đệm và tên thường dùng: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.aliasName || recruit.fullName || '................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `3. Sinh ngày ${cv.birthDay || '......'} tháng ${cv.birthMonth || '......'} năm ${cv.birthYear || '..........'}`, font: 'Times New Roman', size: 24 }),
              new TextRun({ text: `    Giới tính: ${cv.gender || 'Nam'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: '4. Số thẻ căn cước/CCCD: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.citizenId || recruit.citizenId || '................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: '5. Nơi đăng ký khai sinh: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.placeOfBirth || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: '6. Quê quán: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.hometown || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `7. Dân tộc: ${cv.ethnicity || recruit.details?.ethnicity || 'Kinh'}    Tôn giáo: ${cv.religion || recruit.details?.religion || 'Không'}    Quốc tịch: ${cv.nationality || 'Việt Nam'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: '8. Nơi thường trú của gia đình: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.permanentAddress || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: '9. Nơi ở hiện tại của bản thân: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.temporaryAddress || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `10. Thành phần gia đình: ${cv.familyClass || 'Bình dân'}    Bản thân: ${cv.personalClass || 'Học sinh / Lao động'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `11. Trình độ văn hóa: ${cv.educationLevel || recruit.details?.education || '12/12'}    Đào tạo: ${cv.qualificationLevel || recruit.details?.school || 'Chưa qua đào tạo'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `12. Ngoại ngữ: ${cv.languageLevel || 'Không'}    Chuyên ngành: ${cv.major || recruit.details?.major || 'Không'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `13. Ngày vào Đoàn TNCS Hồ Chí Minh: ${cv.youthUnionJoinedDate || '........................'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `14. Ngày vào Đảng CSVN: ${cv.communistPartyJoinedDate || recruit.details?.partyEntryDate || '........................'}    Chính thức: ${cv.communistPartyOfficialDate || '........................'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `15. Khen thưởng: ${cv.commendations || recruit.details?.rewards || 'Không'}    Kỷ luật: ${cv.disciplinaryAction || recruit.details?.disciplines || 'Không'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `16. Nghề nghiệp: ${cv.job || recruit.details?.job || 'Lao động tự do'}    Nơi làm việc: ${cv.workplace || recruit.details?.workAddress || '........................'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),

          // --- II. LỊCH SỬ BẢN THÂN ---
          new Paragraph({
            spacing: { before: 250, after: 150 },
            children: [
              new TextRun({ text: 'II. LỊCH SỬ BẢN THÂN', bold: true, size: 26, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: '1. Tóm tắt quá trình sinh sống, học tập, làm việc từ nhỏ đến nay:', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `- Từ nhỏ đến khi đi học: Sinh sống cùng gia đình tại địa phương ${cv.hometown || cv.permanentAddress || ''}.`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `- Quá trình học phổ thông / đào tạo: Đã tốt nghiệp ${cv.educationLevel || recruit.details?.education || '12/12'} tại ${cv.qualificationLevel || recruit.details?.school || 'trường địa phương'}.`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `- Việc làm hiện nay: ${cv.job || recruit.details?.job || 'Lao động tại địa phương'}.`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `2. Đã đi nước ngoài: ${cv.foreignTravel || 'Chưa bao giờ đi nước ngoài.'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),

          // --- III. QUÁ TRÌNH HỌC TẬP, CÔNG TÁC ---
          new Paragraph({
            spacing: { before: 250, after: 150 },
            children: [
              new TextRun({ text: 'III. QUÁ TRÌNH HỌC TẬP, CÔNG TÁC', bold: true, size: 26, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: '• Từ năm 6 tuổi đến 18 tuổi: Học sinh phổ thông, sinh hoạt Đoàn TNCS Hồ Chí Minh.', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `• Từ năm 18 tuổi đến nay: ${cv.workplace || 'Lao động và sinh sống tại địa phương, chấp hành tốt chính sách pháp luật.'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),

          // --- IV. HOÀN CẢNH GIA ĐÌNH ---
          new Paragraph({
            spacing: { before: 250, after: 150 },
            children: [
              new TextRun({ text: 'IV. HOÀN CẢNH GIA ĐÌNH', bold: true, size: 26, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `1. Họ tên cha: ${cv.fatherName || recruit.family?.father?.fullName || '................................................'} (${cv.fatherStatus || 'Sống'})`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `    Năm sinh: ${cv.fatherBirthDate || '............'}    Nghề nghiệp: ${cv.fatherJob || recruit.family?.father?.job || '........................'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `2. Họ tên mẹ: ${cv.motherName || recruit.family?.mother?.fullName || '................................................'} (${cv.motherStatus || 'Sống'})`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `    Năm sinh: ${cv.motherBirthDate || '............'}    Nghề nghiệp: ${cv.motherJob || recruit.family?.mother?.job || '........................'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `3. Họ tên vợ (chồng): ${cv.spouseName || recruit.family?.wife?.fullName || 'Chưa có'}    Năm sinh: ${cv.spouseBirthDate || '............'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `    Nghề nghiệp: ${cv.spouseJob || recruit.family?.wife?.job || '............'}    Con: ${cv.childrenCount || recruit.family?.children || '0'} con`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `4. Gia đình có ${cv.totalSiblings || '1'} anh chị em (${cv.maleSiblings || '...'} trai, ${cv.femaleSiblings || '...'} gái); bản thân là con thứ ${cv.siblingOrder || '1'}.`, font: 'Times New Roman', size: 24 }),
            ],
          }),

          // --- V. CAM ĐOAN VÀ XÁC NHẬN CỦA CHÍNH QUYỀN ĐỊA PHƯƠNG ---
          new Paragraph({
            spacing: { before: 250, after: 150 },
            children: [
              new TextRun({ text: 'V. LỜI CAM ĐOAN VÀ XÁC NHẬN CỦA CHÍNH QUYỀN ĐỊA PHƯƠNG', bold: true, size: 26, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Tôi xin cam đoan những lời khai trên đây là hoàn toàn đúng sự thật. Nếu có điều gì sai trái tôi xin chịu trách nhiệm trước pháp luật.', font: 'Times New Roman', italics: true, size: 24 }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),
          new Paragraph({
            spacing: { line: 360 },
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `......, Ngày ..... tháng ..... năm 20...`, italics: true, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'XÁC NHẬN CỦA UBND XÃ / PHƯỜNG / THỊ TRẤN               NGƯỜI KHAI KÝ TÊN', bold: true, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: '(Ký tên, đóng dấu)                                                                   (Ký và ghi rõ họ tên)', italics: true, font: 'Times New Roman', size: 22 }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `So_Yeu_Ly_Lich_${recruit.fullName ? recruit.fullName.replace(/\s+/g, '_') : 'Cong_Dan'}.docx`;
  saveAs(blob, filename);
};
