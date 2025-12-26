
import XLSX from 'xlsx-js-style';
import { Recruit, RecruitmentStatus } from '../../types';
import { LEGAL_DEFERMENT_REASONS, LEGAL_EXEMPTION_REASONS } from '../../constants';

export class StatisticalReport06Export {
  public static export(recruits: Recruit[], sessionYear: number, unitName: string) {
    const XLSXLib: any = XLSX;
    const excelUtils = XLSXLib?.utils || XLSXLib?.default?.utils;
    const excelWrite = XLSXLib?.writeFile || XLSXLib?.default?.writeFile;

    if (!excelUtils || !excelWrite) return;

    const wb = excelUtils.book_new();

    // --- LOGIC TỔNG HỢP DỮ LIỆU ---
    const getAge = (r: Recruit) => sessionYear - parseInt(r.dob.split('-')[0] || '0');
    
    // Hàm đếm hồ sơ theo mảng điều kiện
    const countData = (list: Recruit[], filterFn: (r: Recruit) => boolean) => {
        const filtered = list.filter(filterFn);
        const row: (string | number)[] = Array(38).fill(0); // 1-37 (index 0 bỏ qua)

        if (filtered.length === 0) return row;

        // Cột 2: Tổng dân số nam (Trong ngữ cảnh app là tổng số người trong danh sách đó)
        row[2] = filtered.length;
        
        // Lọc những người từ 18-27 cho các cột thống kê chi tiết
        const age1827 = filtered.filter(r => {
            const age = getAge(r);
            return age >= 18 && age <= 27;
        });

        // Cột 3: Số người từ 18-27
        row[3] = age1827.length;
        // Cột 4: % (Tính toán sau khi có dòng Tổng cộng) - Ở đây tạm để 0
        
        // Cột 6-15: Tuổi đời (18 -> 27)
        age1827.forEach(r => {
            const age = getAge(r);
            if (age >= 18 && age <= 27) {
                const colIdx = age - 18 + 6;
                (row[colIdx] as number)++;
            }
        });

        // Cột 17: Không biết chữ (App chưa quản lý diện này, mặc định 0)
        
        // Cột 19-23: Tiểu học (Lớp 1-5)
        age1827.forEach(r => {
            const edu = r.details.education;
            if (edu === 'Lớp 1') (row[19] as number)++;
            if (edu === 'Lớp 2') (row[20] as number)++;
            if (edu === 'Lớp 3') (row[21] as number)++;
            if (edu === 'Lớp 4') (row[22] as number)++;
            if (edu === 'Lớp 5') (row[23] as number)++;
            
            if (edu === 'Lớp 6') (row[25] as number)++;
            if (edu === 'Lớp 7') (row[26] as number)++;
            if (edu === 'Lớp 8') (row[27] as number)++;
            if (edu === 'Lớp 9') (row[28] as number)++;
            
            if (edu === 'Lớp 10') (row[30] as number)++;
            if (edu === 'Lớp 11' || edu === 'Đang học lớp 11') (row[31] as number)++;
            if (edu === 'Lớp 12' || edu === 'Đang học lớp 12') (row[32] as number)++;
            
            const cmkt = ["Trung cấp", "Cao đẳng", "Đang học CĐ", "Đại học", "Đang học ĐH", "Trên ĐH"];
            if (cmkt.includes(edu)) (row[33] as number)++;
        });

        // Cột 34: Nông thôn (Mặc định tính là nông thôn cho cấp xã)
        row[34] = age1827.length;

        // Tính các cột gộp (+)
        row[5] = (row.slice(6, 16) as number[]).reduce((a, b) => a + b, 0); // Tổng tuổi
        row[16] = (row[17] as number) + (row[18] as number); // + Trình độ
        row[18] = (row.slice(19, 24) as number[]).reduce((a, b) => a + b, 0); // + Tiểu học
        row[24] = (row.slice(25, 29) as number[]).reduce((a, b) => a + b, 0); // + THCS
        row[29] = (row.slice(30, 33) as number[]).reduce((a, b) => a + b, 0); // + THPT

        return row;
    };

    // Chuẩn bị dữ liệu cho từng dòng
    const rows: (string | number)[][] = [];
    
    // 1. Dòng TỔNG CỘNG
    const totalRow = countData(recruits, () => true);
    totalRow[1] = "TỔNG CỘNG";
    rows.push(totalRow);

    // 2. Dòng I. Tổng miễn, hoãn
    const exemptDeferred = recruits.filter(r => r.status === RecruitmentStatus.EXEMPTED || r.status === RecruitmentStatus.DEFERRED);
    const rowI = countData(exemptDeferred, () => true);
    rowI[1] = "I. Tổng miễn, hoãn gọi nhập ngũ";
    rows.push(rowI);

    // 3. Dòng 1. Miễn (Khoản 2 Điều 41)
    const rowExempt = countData(recruits, r => r.status === RecruitmentStatus.EXEMPTED);
    rowExempt[1] = "1. Miễn gọi nhập ngũ (khoản 2 Điều 41 Luật NVQS)";
    rows.push(rowExempt);

    // Các khoản miễn chi tiết
    LEGAL_EXEMPTION_REASONS.forEach((reason, i) => {
        const row = countData(recruits, r => r.status === RecruitmentStatus.EXEMPTED && r.defermentReason === reason);
        row[1] = "- " + reason.split(':')[0] || reason;
        rows.push(row);
    });

    // 4. Dòng 2. Tạm hoãn (Khoản 1 Điều 41)
    const rowDeferred = countData(recruits, r => r.status === RecruitmentStatus.DEFERRED);
    rowDeferred[1] = "2- Tạm hoãn gọi nhập ngũ (khoản 1 Điều 41 Luật NVQS)";
    rows.push(rowDeferred);

    // Các khoản hoãn chi tiết
    LEGAL_DEFERMENT_REASONS.forEach((reason, i) => {
        const row = countData(recruits, r => r.status === RecruitmentStatus.DEFERRED && r.defermentReason === reason);
        row[1] = "- " + reason.split(':')[0] || reason;
        rows.push(row);
    });

    // 5. Dòng II. Trong diện gọi nhập ngũ
    const inArea = recruits.filter(r => 
        ![RecruitmentStatus.EXEMPTED, RecruitmentStatus.DEFERRED, RecruitmentStatus.NOT_ALLOWED_REGISTRATION, RecruitmentStatus.EXEMPT_REGISTRATION, RecruitmentStatus.DELETED].includes(r.status)
    );
    const rowII = countData(inArea, () => true);
    rowII[1] = "II. Trong diện gọi nhập ngũ";
    rows.push(rowII);

    // --- XÂY DỰNG FILE EXCEL ---
    const meta = [
        ['', '', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
        ['', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc'],
        [`Số: ...../.....`, '', '', '', '', '...., ngày.... tháng.... năm....'],
        ['Biểu số: 06/GNN-2025'],
        ['Khổ biểu: 42x 29,7cm', '', '', `BÁO CÁO SỐ LƯỢNG CÔNG DÂN NAM`],
        ['', '', '', `TRONG ĐỘ TUỔI GỌI NHẬP NGŨ NĂM ${sessionYear}`],
        ['', '', '', `(Tính từ ngày..../..../.... đến ngày..../..../....)`],
        ['', '', '', '', 'Kính gửi: ........................................'],
        ['', '', 'Căn cứ: .........................................................................................................'],
    ];

    const header1 = [
        'PHÂN TÍCH', 'TỔNG DÂN SỐ NAM....', 'SỐ NGƯỜI Từ 18-27', '', 'TUỔI ĐỜI', '', '', '', '', '', '', '', '', '', '', 'TRÌNH ĐỘ GIÁO DỤC PHỔ THÔNG + TRÌNH ĐỘ CMKT', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ĐỊA BÀN'
    ];
    const header2 = [
        '', '', 'Tổng số', '% so với dân số', '+', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '+', 'Không biết chữ', '+', 'TIỂU HỌC', '', '', '', '', '+', 'TRUNG HỌC CS', '', '', '', '+', 'THPT', '', '', 'Đại học, C.đẳng, T.cấp', 'Nông thôn', 'Thành thị', 'Cơ quan, cơ sở NN', 'Các trường'
    ];
    const header3 = [
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', '', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', '', 'Lớp 10', 'Lớp 11', 'Lớp 12', '', '', '', '', ''
    ];
    const colNums = Array.from({length: 37}, (_, i) => i + 1);

    const allData = [...meta, header1, header2, header3, colNums, ...rows];
    const ws = excelUtils.aoa_to_sheet(allData);

    // Merges
    ws['!merges'] = [
        { s: { r: 9, c: 0 }, e: { r: 12, c: 0 } }, // Phân tích
        { s: { r: 9, c: 1 }, e: { r: 12, c: 1 } }, // Tổng dân số
        { s: { r: 9, c: 2 }, e: { r: 9, c: 3 } }, // Số người 18-27
        { s: { r: 10, c: 2 }, e: { r: 12, c: 2 } }, // Tổng số
        { s: { r: 10, c: 3 }, e: { r: 12, c: 3 } }, // %
        { s: { r: 9, c: 4 }, e: { r: 9, c: 14 } }, // Tuổi đời
        { s: { r: 9, c: 15 }, e: { r: 9, c: 32 } }, // Trình độ
        { s: { r: 9, c: 33 }, e: { r: 9, c: 36 } }, // Địa bàn
        { s: { r: 0, c: 5 }, e: { r: 0, c: 30 } }, // Quốc hiệu
        { s: { r: 1, c: 5 }, e: { r: 1, c: 30 } }, // Tiêu ngữ
    ];

    // Styles
    const border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'}};
    const range = excelUtils.decode_range(ws['!ref'] || 'A1:AK100');
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const addr = excelUtils.encode_cell({r:R, c:C});
            if (!ws[addr]) continue;
            ws[addr].s = { font: { name: 'Times New Roman', size: 10 } };
            if (R >= 9) {
                ws[addr].s.border = border;
                ws[addr].s.alignment = { vertical: 'center', horizontal: 'center', wrapText: true };
            }
            if (R >= 14 && C === 0) ws[addr].s.alignment.horizontal = 'left';
            if (R === 14 || R === 15 || R === 31) ws[addr].s.font.bold = true;
        }
    }

    ws['!cols'] = [{ wch: 40 }, ...Array(36).fill({ wch: 6 })];

    excelUtils.book_append_sheet(wb, ws, 'Bao Cao Mau 06');
    excelWrite(wb, `Bao_Cao_Mau_06_${unitName}_${sessionYear}.xlsx`);
  }
}
