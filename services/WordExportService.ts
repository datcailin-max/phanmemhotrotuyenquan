import { Document, Packer, Paragraph, TextRun, AlignmentType, Header, Footer, PageNumber } from 'docx';
import { saveAs } from 'file-saver';
// @ts-ignore
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import PizZip from 'pizzip';
import { Recruit, CurriculumVitae } from '../types';

export const buildTemplateData = (recruit: Recruit, cv: CurriculumVitae): Record<string, any> => {
  const dobStr = recruit.dob || (cv.birthDay ? `${cv.birthDay}/${cv.birthMonth}/${cv.birthYear}` : '');

  return {
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

    // UPPERCASE Aliases for Template Tags
    FULL_NAME: cv.fullNameUpper || (recruit.fullName ? recruit.fullName.toUpperCase() : ''),
    ALIAS_NAME: cv.aliasName || recruit.fullName || '',
    DOB: dobStr,
    CITIZEN_ID: cv.citizenId || recruit.citizenId || '',
    PLACE_OF_BIRTH: cv.placeOfBirth || '',
    HOMETOWN: cv.hometown || '',
    ETHNICITY: cv.ethnicity || '',
    RELIGION: cv.religion || '',
    NATIONALITY: cv.nationality || 'Việt Nam',
    PERMANENT_ADDRESS: cv.permanentAddress || '',
    TEMPORARY_ADDRESS: cv.temporaryAddress || '',
    FAMILY_CLASS: cv.familyClass || '',
    PERSONAL_CLASS: cv.personalClass || '',
    EDUCATION: cv.educationLevel || '',
    QUALIFICATION: cv.qualificationLevel || '',
    JOB: cv.job || '',
    WORKPLACE: cv.workplace || '',
    FATHER_NAME: cv.fatherName || '',
    FATHER_BIRTH: cv.fatherBirthDate || '',
    FATHER_JOB: cv.fatherJob || '',
    MOTHER_NAME: cv.motherName || '',
    MOTHER_BIRTH: cv.motherBirthDate || '',
    MOTHER_JOB: cv.motherJob || '',
    SPOUSE_NAME: cv.spouseName || '',
    SPOUSE_BIRTH: cv.spouseBirthDate || '',
    SPOUSE_JOB: cv.spouseJob || '',
  };
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

  // If a Word template URL is provided (e.g. Admin master template or citizen custom Word template)
  if (templateUrl) {
    try {
      let arrayBuffer: ArrayBuffer;
      if (templateUrl.startsWith('data:')) {
        const base64Data = templateUrl.split(';base64,').pop() || '';
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      } else {
        const res = await fetch(templateUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        arrayBuffer = await res.arrayBuffer();
      }

      const zip = new PizZip(arrayBuffer);
      const docxtpl = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
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
      console.warn("Lỗi khi bơm dữ liệu vào mẫu file Word Admin, chuyển sang tự tạo file Word...", err);
    }
  }

  const makeDotted = (text?: string, minLength = 30) => {
    const str = text ? String(text).trim() : '';
    if (str.length >= minLength) return str;
    const dotsNeeded = Math.max(5, minLength - str.length);
    return str + ' ' + '.'.repeat(dotsNeeded);
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
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
              new TextRun({ text: 'I. SƠ YẾU LÝ LỊCH', bold: true, size: 28, font: 'Times New Roman' }),
            ],
          }),

          // Lines
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Họ, chữ đệm và tên khai sinh (viết chữ in hoa): ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.fullNameUpper || '................................................................................', bold: true, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Họ, chữ đệm và tên thường dùng: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.aliasName || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Sinh ngày ${cv.birthDay || '......'} tháng ${cv.birthMonth || '......'} năm ${cv.birthYear || '..........'}`, font: 'Times New Roman', size: 24 }),
              new TextRun({ text: `    Giới tính (nam, nữ): ${cv.gender || 'Nam'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Số thẻ căn cước/CCCD: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.citizenId || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Nơi đăng ký khai sinh: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.placeOfBirth || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Quê quán: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.hometown || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Dân tộc: ${cv.ethnicity || 'Kinh'}    Tôn giáo: ${cv.religion || 'Không'}    Quốc tịch: ${cv.nationality || 'Việt Nam'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Nơi thường trú của gia đình: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.permanentAddress || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Nơi ở hiện tại của bản thân: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.temporaryAddress || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Thành phần gia đình: ${cv.familyClass || '............'}    Bản thân: ${cv.personalClass || '............'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Trình độ giáo dục phổ thông: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.educationLevel || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Trình độ đào tạo: ${cv.qualificationLevel || '............'}    Ngoại ngữ: ${cv.languageLevel || 'Không'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Chuyên ngành đào tạo: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.major || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Ngày vào Đảng CSVN: ${cv.communistPartyJoinedDate || '............'}    Chính thức: ${cv.communistPartyOfficialDate || '............'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Ngày vào Đoàn TNCS Hồ Chí Minh: ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.youthUnionJoinedDate || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Khen thưởng: ${cv.commendations || 'Không'}    Kỷ luật: ${cv.disciplinaryAction || 'Không'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Nghề nghiệp: ${cv.job || '............'}    Lương: ${cv.salary || '......'}    Ngạch: ${cv.salaryGrade || '......'}    bậc: ${cv.salaryRank || '......'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Nơi làm việc, (học tập): ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.workplace || '................................................................................', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: 'Đã đi nước ngoài (tên nước, thời gian, lý do): ', font: 'Times New Roman', size: 24 }),
              new TextRun({ text: cv.foreignTravel || 'Chưa đi nước ngoài', font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Họ tên cha: ${cv.fatherName || '................................................'}    (${cv.fatherStatus || 'Sống'})`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Sinh ngày: ${cv.fatherBirthDate || '........................'}    Nghề nghiệp: ${cv.fatherJob || '........................'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Họ tên mẹ: ${cv.motherName || '................................................'}    (${cv.motherStatus || 'Sống'})`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Sinh ngày: ${cv.motherBirthDate || '........................'}    Nghề nghiệp: ${cv.motherJob || '........................'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Họ tên vợ (chồng): ${cv.spouseName || '................................................'}    Sinh ngày: ${cv.spouseBirthDate || '........................'}`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Nghề nghiệp: ${cv.spouseJob || '........................'}    Bản thân đã có ${cv.childrenCount || '0'} con`, font: 'Times New Roman', size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { line: 360 },
            children: [
              new TextRun({ text: `Cha mẹ có ${cv.totalSiblings || '1'} người con, ${cv.maleSiblings || '...'} trai, ${cv.femaleSiblings || '...'} gái; bản thân là con thứ ${cv.siblingOrder || '1'}.`, font: 'Times New Roman', size: 24 }),
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
