
export const removeVietnameseTones = (str: string) => {
    if (!str) return '';
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}

export const cleanCommuneForUsername = (commune: string): string => {
    if (!commune) return '';
    let clean = commune.trim();
    
    // 1. Loại bỏ các tiền tố hành chính tiếng Việt: Xã, Phường, Thị trấn, TT., TT, Đặc khu
    clean = clean.replace(/^(xã|phường|thị\s*trấn|tt\.|tt|đặc\s*khu)\s+/i, '');
    clean = clean.replace(/^(xa|phuong|thi\s*tran|tt\.|tt|dac\s*khu)\s+/i, '');
    
    // 2. Bỏ dấu tiếng Việt và loại bỏ khoảng trắng / ký tự không phải chữ số
    let code = removeVietnameseTones(clean).toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // 3. Loại bỏ tiền tố XA, PHUONG, THITRAN, DACKHU nếu chuỗi gốc không có dấu (ví dụ: XALOCNINH -> LOCNINH)
    if (code.startsWith('XA') && code.length > 2) {
        code = code.substring(2);
    } else if (code.startsWith('PHUONG') && code.length > 6) {
        code = code.substring(6);
    } else if (code.startsWith('THITRAN') && code.length > 7) {
        code = code.substring(7);
    } else if (code.startsWith('DACKHU') && code.length > 6) {
        code = code.substring(6);
    }
    
    return code;
};

export const generateUnitUsername = (province: string, commune: string, type: '1' | '2' | 'PROVINCE') => {
    const pCode = removeVietnameseTones(province).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (type === 'PROVINCE') {
        return `TINH_${pCode}`;
    }
    const cCode = cleanCommuneForUsername(commune);
    return `${pCode}_${cCode}_${type}`;
}
