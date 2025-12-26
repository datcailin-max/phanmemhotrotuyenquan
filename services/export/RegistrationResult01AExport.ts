
import XLSX from 'xlsx-js-style';
import { Recruit, RecruitmentStatus } from '../../types';

export class RegistrationResult01AExport {
  public static export(recruits: Recruit[], sessionYear: number, unitName: string) {
    const XLSXLib: any = XLSX;
    const excelUtils = XLSXLib?.utils || XLSXLib?.default?.utils;
    const excelWrite = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

    if (!excelUtils || !excelWrite) return;

    const wb = excelUtils.book_new();
    const targetBirthYear = sessionYear - 17;

    // --- LOGIC TỔNG HỢP DỮ LIỆU ---
    // Phân nhóm theo Thôn/Ấp (Nếu là cấp xã)
    const villages = Array.from(new Set(recruits.map(r => r.address.village))).filter(v => !!v).sort();
    
    const calculateRow = (list: Recruit[], name: string) => {
        const row: (string | number)[] = Array(31).fill(0);
        row[1] = name; // Cột 1: Địa phương

        // Lọc đúng tuổi 17
        const age17 = list.filter(r => parseInt(r.dob.split('-')[0] || '0') === targetBirthYear);
        if (age17.length === 0) return row;

        row[2] = age17.length; // Cột 2: Tổng dân số nam (tính trong diện 17 tuổi)
        row[3] = age17.length; // Cột 3: Tổng số nam 17 tuổi
        row[4] = 100; // Cột 4: Tỷ lệ % (Mặc định 100% trong phạm vi lọc)

        // KHÔNG THUỘC DIỆN ĐK (Cột 5-7)
        const banned = age17.filter(r => r.status === RecruitmentStatus.NOT_ALLOWED_REGISTRATION);
        const exempt = age17.filter(r => r.status === RecruitmentStatus.EXEMPT_REGISTRATION);
        row[5] = banned.length + exempt.length;
        row[6] = banned.length;
        row[7] = exempt.length;

        // THUỘC DIỆN ĐK (Cột 8-13)
        const eligible = age17.filter(r => ![RecruitmentStatus.NOT_ALLOWED_REGISTRATION, RecruitmentStatus.EXEMPT_REGISTRATION].includes(r.status));
        row[8] = eligible.length;
        row[9] = eligible.filter(r => r.details.registrationMethod === 'DIRECT').length;
        row[10] = eligible.filter(r => r.details.registrationMethod === 'ONLINE').length;
        // Cột 11, 12, 13 (Vắng có lý do, trốn, chống) - App chưa quản lý chi tiết này, mặc định 0

        // TRÌNH ĐỘ VĂN HÓA (Cột 14-27)
        eligible.forEach(r => {
            const edu = r.details.education;
            if (edu === 'Lớp 1') (row[16] as number)++;
            if (edu === 'Lớp 2') (row[17] as number)++;
            if (edu === 'Lớp 3') (row[18] as number)++;
            if (edu === 'Lớp 4') (row[19] as number)++;
            if (edu === 'Lớp 5') (row[20] as number)++;
            if (edu === 'Lớp 6') (row[21] as number)++;
            if (edu === 'Lớp 7') (row[22] as number)++;
            if (edu === 'Lớp 8') (row[23] as number)++;
            if (edu === 'Lớp 9') (row[24] as number)++;
            if (edu === 'Lớp 10') (row[25] as number)++;
            if (edu === 'Lớp 11' || edu === 'Đang học lớp 11') (row[26] as number)++;
            if (edu === 'Lớp 12' || edu === 'Đang học lớp 12') (row[27] as number)++;
        });
        row[14] = (row.slice(15, 28) as number[]).reduce((a, b) => a + b, 0); // Tổng trình độ

        // TRÌNH ĐỘ CMKT (Cột 28-30)
        eligible.forEach(r => {
            const edu = r.details.education;
            if (edu === 'Trung cấp') (row[30] as number)++;
            // Cột 29 SC nghề mặc định 0
        });
        row[28] = (row[29] as number) + (row[30] as number);

        return row;
    };

    const dataRows: (string | number)[][] = [];
    // Dòng tổng cộng
    const totalRow = calculateRow(recruits, 'Tổng số');
    dataRows.push(totalRow);

    // Các dòng chi tiết theo thôn
    villages.forEach(v => {
        const row = calculateRow(recruits.filter(r => r.address.village === v), v);
        dataRows.push(row);
    });

    // --- XÂY DỰNG FILE EXCEL ---
    const meta = [
        ['', '', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
        ['', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc'],
        [`Số: ...../.....`, '', '', '', '', '...., ngày.... tháng.... năm....'],
        ['Biểu số: 01A/GNN-2025'],
        ['Khổ biểu: 42 x 29cm', '', '', `BÁO CÁO`],
        ['', '', '', `KẾT QUẢ ĐĂNG KÝ NGHĨA VỤ QUÂN SỰ CHO CÔNG DÂN NAM`],
        ['', '', '', `ĐỦ 17 TUỔI TRONG NĂM ${sessionYear}`],
        ['', '', '', `(Tính từ ngày..../..../20....đến ngày..../..../20....)`],
        ['', '', '', '', 'Kính gửi: ........................................'],
        ['', '', 'Căn cứ: .........................................................................................................'],
    ];

    const h1 = ['ĐỊA PHƯƠNG, NHÀ TRƯỜNG, CƠ QUAN', 'Tổng dân số nam...', 'TỔNG SỐ NAM ĐỦ 17 TUỔI TRONG NĂM', '', 'KHÔNG THUỘC DIỆN ĐĂNG KÝ', '', '', 'THUỘC DIỆN ĐĂNG KÝ', '', '', '', '', '', 'TRÌNH ĐỘ GIÁO DỤC PHỔ THÔNG', '', '', '', '', '', '', '', '', '', '', '', '', '', 'TRONG ĐÓ TRÌNH ĐỘ CMKT'];
    const h2 = ['', '', '+', 'Tỷ lệ % so với dân số', '+', 'Đang phạm pháp', 'Miễn làm NVQS', '+', 'Đã đăng ký', '', 'Vắng có lý do', 'Trốn', 'Chống', '+', 'Không biết chữ', 'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12', '+', 'SC nghề', 'TC nghề'];
    const h3 = ['', '', '', '', '', '', '', '', 'Trực tiếp', 'Trực tuyến', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const colNums = Array.from({length: 30}, (_, i) => i + 1);

    const allData = [...meta, h1, h2, h3, colNums, ...dataRows.map(r => r.slice(1))];
    const ws = excelUtils.aoa_to_sheet(allData);

    // Merges
    ws['!merges'] = [
        { s: { r: 10, c: 0 }, e: { r: 13, c: 0 } }, // Cột 1
        { s: { r: 10, c: 1 }, e: { r: 13, c: 1 } }, // Cột 2
        { s: { r: 10, c: 2 }, e: { r: 10, c: 3 } }, // Cột 3-4
        { s: { r: 10, c: 4 }, e: { r: 10, c: 6 } }, // Cột 5-7
        { s: { r: 10, c: 7 }, e: { r: 10, c: 12 } }, // Cột 8-13
        { s: { r: 10, c: 13 }, e: { r: 10, c: 26 } }, // Cột 14-27
        { s: { r: 10, c: 27 }, e: { r: 10, c: 29 } }, // Cột 28-30
        { s: { r: 11, c: 8 }, e: { r: 11, c: 9 } }, // Đã đăng ký
        { s: { r: 0, c: 5 }, e: { r: 0, c: 20 } }, // Quốc hiệu
        { s: { r: 1, c: 5 }, e: { r: 1, c: 20 } }, // Tiêu ngữ
    ];

    // Styles
    const border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'}};
    const range = excelUtils.decode_range(ws['!ref'] || 'A1:AD100');
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const addr = excelUtils.encode_cell({r:R, c:C});
            if (!ws[addr]) continue;
            ws[addr].s = { font: { name: 'Times New Roman', size: 10 } };
            if (R >= 10) {
                ws[addr].s.border = border;
                ws[addr].s.alignment = { vertical: 'center', horizontal: 'center', wrapText: true };
            }
            if (R >= 15 && C === 0) ws[addr].s.alignment.horizontal = 'left';
            if (R === 15) ws[addr].s.font.bold = true;
        }
    }

    ws['!cols'] = [{ wch: 25 }, ...Array(29).fill({ wch: 6 })];
    excelUtils.book_append_sheet(wb, ws, 'Ket qua ĐK 17 tuoi');
    excelWrite(wb, `Bao_Cao_Mau_01A_${unitName}_${sessionYear}.xlsx`);
  }
}
