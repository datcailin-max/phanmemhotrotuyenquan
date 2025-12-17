
import { Recruit, RecruitmentStatus, User } from './types';

// Helper để loại bỏ dấu tiếng Việt (dùng cho tạo username/search)
export const removeVietnameseTones = (str: string) => {
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
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}

// --- DỮ LIỆU THÔ ---
// ... (Keep existing RAW_COMMUNE_DATA content - shortened for brevity in response but full content is assumed present)
const RAW_COMMUNE_DATA: Record<string, string[]> = {
    // ... (All existing provinces - assuming existing full data here)
          "Tuyên Quang": [
        "Phường An Tường", "Phường Bình Thuận", "Phường Hà Giang 1", "Phường Hà Giang 2", "Phường Minh Xuân", "Phường Mỹ Lâm", "Phường Nông Tiến",
        "Xã Bạch Đích", "Xã Bạch Ngọc", "Xã Bạch Xa", "Xã Bản Máy", "Xã Bắc Mê", "Xã Bắc Quang", "Xã Bằng Hành", "Xã Bằng Lang", "Xã Bình An",
        "Xã Bình Ca", "Xã Bình Xa", "Xã Cán Tỷ", "Xã Cao Bồ", "Xã Chiêm Hóa", "Xã Côn Lôn", "Xã Du Già", "Xã Đồng Tâm", "Xã Đông Thọ", "Xã Đồng Văn",
        "Xã Đồng Yên", "Xã Đường Hồng", "Xã Đường Thượng", "Xã Giáp Trung", "Xã Hàm Yên", "Xã Hòa An", "Xã Hoàng Su Phì", "Xã Hồ Thầu", "Xã Hồng Sơn",
        "Xã Hồng Thái", "Xã Hùng An", "Xã Hùng Đức", "Xã Hùng Lợi", "Xã Khâu Vai", "Xã Khuôn Lùng", "Xã Kiên Đài", "Xã Kiến Thiết", "Xã Kim Bình",
        "Xã Lao Chải", "Xã Lâm Bình", "Xã Liên Hiệp", "Xã Linh Hồ", "Xã Lũng Cú", "Xã Lũng Phìn", "Xã Lùng Tám", "Xã Lực Hành", "Xã Mậu Duệ",
        "Xã Mèo Vạc", "Xã Minh Ngọc", "Xã Minh Quang", "Xã Minh Sơn", "Xã Minh Tân", "Xã Minh Thanh", "Xã Nà Hang", "Xã Nấm Dẩn", "Xã Nậm Dịch",
        "Xã Nghĩa Thuận", "Xã Ngọc Đường", "Xã Ngọc Long", "Xã Nhữ Khê", "Xã Niêm Sơn", "Xã Pà Vầy Sủ", "Xã Phố Bảng", "Xã Phú Linh", "Xã Phú Lương",
        "Xã Phù Lưu", "Xã Pờ Ly Ngài", "Xã Quản Bạ", "Xã Quang Bình", "Xã Quảng Nguyên", "Xã Sà Phìn", "Xã Sơn Dương", "Xã Sơn Thủy", "Xã Sơn Vĩ",
        "Xã Sủng Máng", "Xã Tát Ngà", "Xã Tân An", "Xã Tân Long", "Xã Tân Mỹ", "Xã Tân Quang", "Xã Tân Thanh", "Xã Tân Tiến", "Xã Tân Trào",
        "Xã Tân Trịnh", "Xã Thái Bình", "Xã Thái Hòa", "Xã Thái Sơn", "Xã Thàng Tín", "Xã Thắng Mố", "Xã Thanh Thủy", "Xã Thông Nguyên", "Xã Thuận Hòa",
        "Xã Thượng Lâm", "Xã Thượng Nông", "Xã Thượng Sơn", "Xã Tiên Nguyên", "Xã Tiên Yên", "Xã Tri Phú", "Xã Trung Hà", "Xã Trung Sơn", "Xã Trung Thịnh",
        "Xã Trường Sinh", "Xã Tùng Bá", "Xã Tùng Vài", "Xã Vị Xuyên", "Xã Việt Lâm", "Xã Vĩnh Tuy", "Xã Xín Mần", "Xã Xuân Giang", "Xã Xuân Vân",
        "Xã Yên Cường", "Xã Yên Hoa", "Xã Yên Lập", "Xã Yên Minh", "Xã Yên Nguyên", "Xã Yên Phú", "Xã Yên Sơn", "Xã Yên Thành"
    ],
    "Cao Bằng": [
        "Phường Nùng Trí Cao", "Phường Tân Giang", "Phường Thục Phán",
        "Xã Bạch Đằng", "Xã Bảo Lạc", "Xã Bảo Lâm", "Xã Bế Văn Đàn", "Xã Ca Thành", "Xã Canh Tân", "Xã Cần Yên", "Xã Cô Ba", "Xã Cốc Pàng", "Xã Đàm Thủy",
        "Xã Đình Phong", "Xã Đoài Dương", "Xã Độc Lập", "Xã Đông Khê", "Xã Đức Long", "Xã Hạ Lang", "Xã Hà Quảng", "Xã Hạnh Phúc", "Xã Hòa An", "Xã Huy Giáp",
        "Xã Hưng Đạo", "Xã Khánh Xuân", "Xã Kim Đồng", "Xã Lý Bôn", "Xã Lý Quốc", "Xã Lũng Nặm", "Xã Minh Khai", "Xã Minh Tâm", "Xã Nam Quang", "Xã Nam Tuấn",
        "Xã Nguyễn Huệ", "Xã Nguyên Bình", "Xã Ngọc Hồi", "Xã Phan Thanh", "Xã Phục Hòa", "Xã Quang Hán", "Xã Quang Long", "Xã Quang Trung", "Xã Quảng Lâm",
        "Xã Quảng Uyên", "Xã Sơn Lộ", "Xã Tam Kim", "Xã Thạch An", "Xã Thành Công", "Xã Thanh Long", "Xã Thông Nông", "Xã Tổng Cọt", "Xã Trà Lĩnh",
        "Xã Trùng Khánh", "Xã Trường Hà", "Xã Vinh Quý", "Xã Yên Thổ"
    ],
    "Lai Châu": [
        "Xã Mường Kim", "Xã Khoen On", "Xã Than Uyên", "Xã Mường Than", "Xã Pắc Ta", "Xã Nậm Sỏ", "Xã Tân Uyên", "Xã Mường Khoa", "Xã Bản Bo", "Xã Bình Lư",
        "Xã Tả Lèng", "Xã Khun Há", "Xã Sin Suối Hồ", "Xã Phong Thổ", "Xã Dào San", "Xã Sì Lở Lầu", "Xã Khổng Lào", "Xã Tủa Sín Chải", "Xã Sìn Hồ",
        "Xã Hồng Thu", "Xã Nậm Tăm", "Xã Pu Sam Cáp", "Xã Nậm Cuổi", "Xã Nậm Mạ", "Xã Lê Lợi", "Xã Nậm Hàng", "Xã Mường Mô", "Xã Hua Bum", "Xã Pa Tần",
        "Xã Bum Nưa", "Xã Bum Tở", "Xã Mường Tè", "Xã Thu Lũm", "Xã Pa Ủ", "Phường Tân Phong", "Phường Đoàn Kết", "Xã Mù Cả", "Xã Tà Tổng"
    ],
    "Lào Cai": [
        "Phường Cam Đường", "Phường Lào Cai", "Phường Sa Pa", "Phường Nghĩa Lộ", "Phường Trung Tâm", "Phường Cầu Thia", "Phường Văn Phú", "Phường Yên Bái",
        "Phường Nam Cường", "Phường Âu Lâu",
        "Xã Mường Bo", "Xã Bản Hồ", "Xã Tả Van", "Xã Tả Phìn", "Xã Nậm Xé", "Xã Ngũ Chỉ Sơn", "Xã Chế Tạo", "Xã Lao Chải", "Xã Y Tý", "Xã Cốc San", "Xã Hợp Thành",
        "Xã Mường Hum", "Xã Dền Sáng", "Xã A Mú Sung", "Xã Trịnh Tường", "Xã Bản Xèo", "Xã Bát Xát", "Xã Nậm Chạc", "Xã Phong Hải", "Xã Xuân Quang", "Xã Bảo Thắng",
        "Xã Tằng Loỏng", "Xã Gia Phú", "Xã Sơn Hải", "Xã Võ Lao", "Xã Khánh Yên", "Xã Văn Bàn", "Xã Dương Quỳ", "Xã Chiềng Ken", "Xã Minh Lương", "Xã Nậm Chày",
        "Xã Bảo Hà", "Xã Cát Thịnh", "Xã Bảo Yên", "Xã Nghĩa Đô", "Xã Thượng Hà", "Xã Xuân Hòa", "Xã Phúc Khánh", "Xã Cốc Lầu", "Xã Bảo Nhai", "Xã Bản Liền",
        "Xã Bắc Hà", "Xã Tả Củ Tỷ", "Xã Lùng Phình", "Xã Pha Long", "Xã Mường Khương", "Xã Bản Lầu", "Xã Cao Sơn", "Xã Si Ma Cai", "Xã Sín Chéng", "Xã Khao Mang",
        "Xã Mù Cang Chải", "Xã Púng Luông", "Xã Tú Lệ", "Xã Trạm Tấu", "Xã Hạnh Phúc", "Xã Phình Hồ", "Xã Liên Sơn", "Xã Gia Hội", "Xã Sơn Lương", "Xã Văn Chấn",
        "Xã Thượng Bằng La", "Xã Chấn Thịnh", "Xã Nghĩa Tâm", "Xã Phong Dụ Hạ", "Xã Châu Quế", "Xã Lâm Giang", "Xã Đông Cuông", "Xã Tân Hợp", "Xã Mậu A", "Xã Xuân Ái",
        "Xã Mỏ Vàng", "Xã Lâm Thượng", "Xã Lục Yên", "Xã Tân Lĩnh", "Xã Khánh Hòa", "Xã Phúc Lợi", "Xã Mường Lai", "Xã Cảm Nhân", "Xã Yên Thành", "Xã Thác Bà",
        "Xã Yên Bình", "Xã Bảo Ái", "Xã Trấn Yên", "Xã Hưng Khánh", "Xã Lương Thịnh", "Xã Việt Hồng", "Xã Quy Mông", "Xã Phong Dụ Thượng"
    ],
    "Thái Nguyên": [
        "Phường Phan Đình Phùng", "Phường Linh Sơn", "Phường Tích Lương", "Phường Gia Sàng", "Phường Quyết Thắng", "Phường Quan Triều", "Phường Sông Công",
        "Phường Bá Xuyên", "Phường Bách Quang", "Phường Phổ Yên", "Phường Vạn Xuân", "Phường Trung Thành", "Phường Phúc Thuận", "Phường Đức Xuân", "Phường Bắc Kạn",
        "Xã Tân Cương", "Xã Đại Phúc", "Xã Thành Công", "Xã Định Hóa", "Xã Bình Yên", "Xã Trung Hội", "Xã Phượng Tiến", "Xã Phú Đình", "Xã Bình Thành", "Xã Kim Phượng",
        "Xã Lam Vỹ", "Xã Võ Nhai", "Xã Dân Tiến", "Xã Nghinh Tường", "Xã Thần Sa", "Xã La Hiên", "Xã Tràng Xá", "Xã Phú Lương", "Xã Vô Tranh", "Xã Yên Trạch",
        "Xã Hợp Thành", "Xã Đồng Hỷ", "Xã Quang Sơn", "Xã Trại Cau", "Xã Nam Hòa", "Xã Văn Hán", "Xã Văn Lăng", "Xã Đại Từ", "Xã Đức Lương", "Xã Phú Thịnh", "Xã La Bằng",
        "Xã Phú Lạc", "Xã An Khánh", "Xã Quân Chu", "Xã Vạn Phú", "Xã Phú Xuyên", "Xã Phú Bình", "Xã Tân Thành", "Xã Điềm Thụy", "Xã Kha Sơn", "Xã Tân Khánh",
        "Xã Bằng Thành", "Xã Nghiên Loan", "Xã Cao Minh", "Xã Ba Bể", "Xã Chợ Rã", "Xã Phúc Lộc", "Xã Thượng Minh", "Xã Đồng Phúc", "Xã Bằng Vân", "Xã Ngân Sơn",
        "Xã Nà Phặc", "Xã Hiệp Lực", "Xã Nam Cường", "Xã Quảng Bạch", "Xã Yên Thịnh", "Xã Chợ Đồn", "Xã Yên Phong", "Xã Nghĩa Tá", "Xã Phủ Thông", "Xã Cẩm Giàng",
        "Xã Vĩnh Thông", "Xã Bạch Thông", "Xã Phong Quang", "Xã Văn Lang", "Xã Cường Lợi", "Xã Na Rì", "Xã Trần Phú", "Xã Côn Minh", "Xã Xuân Dương", "Xã Tân Kỳ",
        "Xã Thanh Mai", "Xã Thanh Thịnh", "Xã Chợ Mới", "Xã Yên Bình", "Xã Sảng Mộc", "Xã Thượng Quan"
    ],
    "Điện Biên": [
        "Phường Mường Lay", "Phường Điện Biên Phủ", "Phường Mường Thanh",
        "Xã Mường Nhé", "Xã Sín Thầu", "Xã Mường Toong", "Xã Nậm Kè", "Xã Quảng Lâm", "Xã Nà Hỳ", "Xã Mường Chà", "Xã Nà Bủng", "Xã Chà Tở", "Xã Si Pa Phìn",
        "Xã Na Sang", "Xã Mường Tùng", "Xã Pa Ham", "Xã Nậm Nèn", "Xã Mường Pồn", "Xã Tủa Chùa", "Xã Sín Chải", "Xã Sính Phình", "Xã Tủa Thàng", "Xã Sáng Nhè",
        "Xã Tuần Giáo", "Xã Quài Tở", "Xã Mường Mùn", "Xã Pú Nhung", "Xã Chiềng Sinh", "Xã Mường Ảng", "Xã Nà Tấu", "Xã Búng Lao", "Xã Mường Lạn", "Xã Mường Phăng",
        "Xã Thanh Nưa", "Xã Thanh An", "Xã Thanh Yên", "Xã Sam Mứn", "Xã Núa Ngam", "Xã Mường Nhà", "Xã Na Son", "Xã Xa Dung", "Xã Pu Nhi", "Xã Mường Luân",
        "Xã Tìa Dình", "Xã Phình Giàng"
    ],
    "Lạng Sơn": [
        "Phường Tam Thanh", "Phường Lương Văn Tri", "Phường Kỳ Lừa", "Phường Đông Kinh",
        "Xã Thất Khê", "Xã Đoàn Kết", "Xã Tân Tiến", "Xã Tràng Định", "Xã Quốc Khánh", "Xã Kháng Chiến", "Xã Quốc Việt", "Xã Bình Gia", "Xã Tân Văn",
        "Xã Hồng Phong", "Xã Hoa Thám", "Xã Quý Hòa", "Xã Thiện Hòa", "Xã Thiện Thuật", "Xã Thiện Long", "Xã Bắc Sơn", "Xã Hưng Vũ", "Xã Vũ Lăng", "Xã Nhất Hòa",
        "Xã Vũ Lễ", "Xã Tân Tri", "Xã Văn Quan", "Xã Điềm He", "Xã Tri Lễ", "Xã Yên Phúc", "Xã Tân Đoàn", "Xã Khánh Khê", "Xã Na Sầm", "Xã Hoàng Văn Thụ",
        "Xã Thụy Hùng", "Xã Văn Lãng", "Xã Hội Hoan", "Xã Lộc Bình", "Xã Mẫu Sơn", "Xã Na Dương", "Xã Lợi Bác", "Xã Thống Nhất", "Xã Xuân Dương", "Xã Khuất Xá",
        "Xã Đình Lập", "Xã Thái Bình", "Xã Châu Sơn", "Xã Kiên Mộc", "Xã Hữu Lũng", "Xã Tuấn Sơn", "Xã Tân Thành", "Xã Vân Nham", "Xã Thiện Tân", "Xã Yên Bình",
        "Xã Hữu Liên", "Xã Cai Kinh", "Xã Chi Lăng", "Xã Quan Sơn", "Xã Chiến Thắng", "Xã Nhân Lý", "Xã Bằng Mạc", "Xã Vạn Linh", "Xã Đồng Đăng", "Xã Cao Lộc",
        "Xã Công Sơn", "Xã Ba Sơn"
    ],
    "Sơn La": [
        "Phường Tô Hiệu", "Phường Chiềng An", "Phường Chiềng Cơi", "Phường Chiềng Sinh", "Phường Mộc Châu", "Phường Mộc Sơn", "Phường Vân Sơn", "Phường Thảo Nguyên",
        "Xã Đoàn Kết", "Xã Lóng Sập", "Xã Chiềng Sơn", "Xã Vân Hồ", "Xã Song Khủa", "Xã Tô Múa", "Xã Xuân Nha", "Xã Quỳnh Nhai", "Xã Mường Chiên", "Xã Mường Giôn",
        "Xã Mường Sại", "Xã Thuận Châu", "Xã Chiềng La", "Xã Nậm Lầu", "Xã Muổi Nọi", "Xã Mường Khiêng", "Xã Co Mạ", "Xã Bình Thuận", "Xã Mường É", "Xã Long Hẹ",
        "Xã Mường La", "Xã Chiềng Lao", "Xã Mường Bú", "Xã Chiềng Hoa", "Xã Bắc Yên", "Xã Tà Xùa", "Xã Tạ Khoa", "Xã Xím Vàng", "Xã Pắc Ngà", "Xã Chiềng Sại",
        "Xã Phù Yên", "Xã Gia Phù", "Xã Tường Hạ", "Xã Mường Cơi", "Xã Mường Bang", "Xã Tân Phong", "Xã Kim Bon", "Xã Yên Châu", "Xã Chiềng Hặc", "Xã Lóng Phiêng",
        "Xã Yên Sơn", "Xã Chiềng Mai", "Xã Mai Sơn", "Xã Phiêng Pằn", "Xã Chiềng Mung", "Xã Phiêng Cằm", "Xã Mường Chanh", "Xã Tà Hộc", "Xã Chiềng Sung", "Xã Bó Sinh",
        "Xã Chiềng Khương", "Xã Mường Hung", "Xã Chiềng Khoong", "Xã Mường Lầm", "Xã Nậm Ty", "Xã Sông Mã", "Xã Huổi Một", "Xã Chiềng Sơ", "Xã Sốp Cộp",
        "Xã Púng Bánh", "Xã Mường Lạn", "Xã Phiêng Khoài", "Xã Suối Tọ", "Xã Ngọc Chiến", "Xã Tân Yên", "Xã Mường Bám", "Xã Mường Lèo"
    ],
    "Phú Thọ": [
        "Phường Âu Cơ", "Phường Hòa Bình", "Phường Hòa Xuân", "Phường Kỳ Sơn", "Phường Nông Trang", "Phường Phúc Yên", "Phường Phong Châu", "Phường Phú Thọ",
        "Phường Tân Hòa", "Phường Thanh Miếu", "Phường Thịnh Minh", "Phường Thống Nhất", "Phường Vân Phú", "Phường Vĩnh Phúc", "Phường Vĩnh Yên",
        "Xã An Bình", "Xã An Nghĩa", "Xã An Sơn", "Xã Bao La", "Xã Bản Nguyên", "Xã Bằng Luân", "Xã Bình Phú", "Xã Bình Xuyên", "Xã Bình Tuyền", "Xã Cao Dương",
        "Xã Cao Phong", "Xã Chân Mộng", "Xã Chí Đám", "Xã Chí Tiên", "Xã Cự Đồng", "Xã Đại Đồng", "Xã Đại Đình", "Xã Đào Xá", "Xã Đan Thượng", "Xã Đạo Trù",
        "Xã Dân Chủ", "Xã Dũng Tiến", "Xã Đoan Hùng", "Xã Đồng Lương", "Xã Đông Thành", "Xã Đức Nhàn", "Xã Hạ Hòa", "Xã Hải Lựu", "Xã Hiền Quan", "Xã Hiền Lương",
        "Xã Hội Thịnh", "Xã Hoàng An", "Xã Hoàng Cương", "Xã Hợp Chân", "Xã Hợp Kim", "Xã Hợp Lý", "Xã Hợp Nhất", "Xã Hương Cần", "Xã Hùng Việt", "Xã Kim Bôi",
        "Xã Lai Đồng", "Xã Lạc Lương", "Xã Lạc Sơn", "Xã Lạc Thủy", "Xã Liên Hòa", "Xã Liên Minh", "Xã Liên Sơn", "Xã Liên Châu", "Xã Long Cốc", "Xã Lương Sơn",
        "Xã Lâm Thao", "Xã Lập Thạch", "Xã Mai Châu", "Xã Mai Hạ", "Xã Minh Đài", "Xã Minh Hòa", "Xã Mường Bi", "Xã Mường Động", "Xã Mường Hoa", "Xã Mường Thàng",
        "Xã Nật Sơn", "Xã Ngọc Sơn", "Xã Nguyệt Đức", "Xã Nhân Nghĩa", "Xã Phú Khê", "Xã Phú Mỹ", "Xã Phù Ninh", "Xã Phùng Nguyên", "Xã Quảng Yên", "Xã Quyết Thắng",
        "Xã Quy Đức", "Xã Sơn Đông", "Xã Sơn Lương", "Xã Sông Lô", "Xã Tam Dương", "Xã Tam Dương Bắc", "Xã Tam Hồng", "Xã Tam Nông", "Xã Tam Sơn", "Xã Tân Lạc",
        "Xã Tân Sơn", "Xã Tân Pheo", "Xã Thanh Ba", "Xã Thanh Sơn", "Xã Thanh Thủy", "Xã Thọ Văn", "Xã Thổ Tang", "Xã Thượng Long", "Xã Thượng Cốc", "Xã Tiên Lữ",
        "Xã Tiên Lương", "Xã Tiền Phong", "Xã Toàn Thắng", "Xã Trạm Thản", "Xã Tu Vũ", "Xã Văn Lang", "Xã Văn Miếu", "Xã Vạn Xuân", "Xã Vĩnh An", "Xã Vĩnh Chân",
        "Xã Vĩnh Phú", "Xã Vĩnh Thành", "Xã Vĩnh Tường", "Xã Vĩnh Hưng", "Xã Võ Miếu", "Xã Xuân Đài", "Xã Xuân Lãng", "Xã Xuân Lũng", "Xã Yên Kỳ", "Xã Yên Lãng",
        "Xã Yên Lạc", "Xã Yên Phú", "Xã Yên Sơn", "Xã Yên Thủy", "Xã Yên Trị", "Xã Tề Lỗ", "Xã Khả Cửu", "Xã Thái Hòa", "Xã Thanh Thủy", "Xã Đào Xá", "Xã Tam Đảo",
        "Xã Vĩnh Lại", "Xã Vĩnh Thịnh", "Xã Hạ Lộc", "Xã Hùng Lô", "Xã Minh Quang", "Xã Phú Hộ", "Xã Thạch Khoán", "Xã Vĩnh Đồng", "Xã Vũ Di", "Xã Hương Nộn",
        "Xã Đồng Lạc"
    ],
    "Bắc Ninh": [
        "Phường Kinh Bắc", "Phường Võ Cường", "Phường Vũ Ninh", "Phường Hạp Lĩnh", "Phường Nam Sơn", "Phường Từ Sơn", "Phường Tam Sơn", "Phường Đồng Nguyên",
        "Phường Phù Khê", "Phường Thuận Thành", "Phường Mão Điền", "Phường Trạm Lộ", "Phường Trí Quả", "Phường Song Liễu", "Phường Ninh Xá", "Phường Quế Võ",
        "Phường Phương Liễu", "Phường Nhân Hòa", "Phường Đào Viên", "Phường Bồng Lai", "Phường Chũ", "Phường Phượng Sơn", "Phường Tự Lạn", "Phường Việt Yên",
        "Phường Nếnh", "Phường Vân Hà", "Phường Bắc Giang", "Phường Đa Mai", "Phường Tiền Phong", "Phường Tân An", "Phường Yên Dũng", "Phường Tân Tiến",
        "Phường Cảnh Thụy",
        "Xã Chi Lăng", "Xã Phù Lãng", "Xã Yên Phong", "Xã Văn Môn", "Xã Tam Giang", "Xã Yên Trung", "Xã Tam Đa", "Xã Tiên Du", "Xã Liên Bão", "Xã Tân Chi",
        "Xã Đại Đồng", "Xã Phật Tích", "Xã Gia Bình", "Xã Nhân Thắng", "Xã Đại Lai", "Xã Cao Đức", "Xã Đông Cứu", "Xã Lương Tài", "Xã Lâm Thao", "Xã Trung Chính",
        "Xã Trung Kênh", "Xã Đại Sơn", "Xã Sơn Động", "Xã Tây Yên Tử", "Xã Dương Hưu", "Xã Yên Định", "Xã An Lạc", "Xã Vân Sơn", "Xã Tuấn Đạo", "Xã Biển Động",
        "Xã Lục Ngạn", "Xã Đèo Gia", "Xã Sơn Hải", "Xã Tân Sơn", "Xã Biên Sơn", "Xã Sa Lý", "Xã Nam Dương", "Xã Kiên Lao", "Xã Lục Sơn", "Xã Trường Sơn",
        "Xã Cẩm Lý", "Xã Đông Phú", "Xã Nghĩa Phương", "Xã Lục Nam", "Xã Bắc Lũng", "Xã Bảo Đài", "Xã Lạng Giang", "Xã Mỹ Thái", "Xã Kép", "Xã Tân Dĩnh",
        "Xã Tiên Lục", "Xã Yên Thế", "Xã Bố Hạ", "Xã Đồng Kỳ", "Xã Xuân Lương", "Xã Tam Tiến", "Xã Tân Yên", "Xã Ngọc Thiện", "Xã Nhã Nam", "Xã Phúc Hoà",
        "Xã Quang Trung", "Xã Hợp Thịnh", "Xã Hiệp Hòa", "Xã Hoàng Vân", "Xã Xuân Cẩm", "Xã Đồng Việt"
    ],
    "Quảng Ninh": [
        "Phường An Sinh", "Phường Bãi Cháy", "Phường Bình Khê", "Phường Cao Xanh", "Phường Cẩm Phả", "Phường Cửa Ông", "Phường Đông Du", "Phường Đông Mai",
        "Phường Đông Triều", "Phường Hà An", "Phường Hà Lầm", "Phường Hà Tu", "Phường Hạ Long", "Phường Hiệp Hòa", "Phường Hoành Bồ", "Phường Hồng Gai",
        "Phường Hoàng Quế", "Phường Liên Hòa", "Phường Mạo Khê", "Phường Móng Cái 1", "Phường Móng Cái 2", "Phường Móng Cái 3", "Phường Mông Dương",
        "Phường Phong Cốc", "Phường Quang Hanh", "Phường Quảng Yên", "Phường Tuần Châu", "Phường Uông Bí", "Phường Vàng Danh", "Phường Việt Hưng", "Phường Yên Tử",
        "Xã Bình Liêu", "Xã Ba Chẽ", "Xã Đầm Hà", "Xã Điền Xá", "Xã Đông Ngũ", "Xã Đường Hoa", "Xã Hải Hòa", "Xã Hải Lạng", "Xã Hải Sơn", "Xã Hải Ninh",
        "Xã Hoành Mô", "Xã Kỳ Thượng", "Xã Lục Hồn", "Xã Lương Minh", "Xã Quảng Hà", "Xã Quảng Đức", "Xã Quảng La", "Xã Quảng Tân", "Xã Thống Nhất",
        "Xã Tiên Yên", "Xã Vĩnh Thực", "Xã Cái Chiên", "Đặc khu Vân Đồn", "Đặc khu Cô Tô"
    ],
    "Thành phố Hà Nội": [
        "Phường Ba Đình", "Phường Bạch Mai", "Phường Bồ Đề", "Phường Cầu Giấy", "Phường Chương Mỹ", "Phường Cửa Nam", "Phường Dương Nội", "Phường Đại Mỗ",
        "Phường Định Công", "Phường Đống Đa", "Phường Đông Ngạc", "Phường Giảng Võ", "Phường Hà Đông", "Phường Hai Bà Trưng", "Phường Hoàn Kiếm",
        "Phường Hoàng Liệt", "Phường Hoàng Mai", "Phường Hồng Hà", "Phường Khương Đình", "Phường Kiến Hưng", "Phường Kim Liên", "Phường Láng",
        "Phường Lĩnh Nam", "Phường Long Biên", "Phường Nghĩa Đô", "Phường Ngọc Hà", "Phường Ô Chợ Dừa", "Phường Phúc Diễn", "Phường Phúc Lương",
        "Phường Phúc Thượng", "Phường Phúc Lợi", "Phường Phương Liệt", "Phường Phúc Sơn", "Phường Phúc Thịnh", "Phường Phúc Thọ", "Phường Phúc Minh",
        "Phường Sơn Tây", "Phường Tây Hồ", "Phường Tây Mỗ", "Phường Tây Tựu", "Phường Thanh Liệt", "Phường Thanh Xuân", "Phường Thượng Cát", "Phường Tùng Thiện",
        "Phường Từ Liêm", "Phường Tương Mai", "Phường Văn Miếu - Quốc Tử Giám", "Phường Việt Hưng", "Phường Vĩnh Hưng", "Phường Vĩnh Tuy", "Phường Xuân Đỉnh",
        "Xã An Khánh", "Xã Ba Vì", "Xã Bát Tràng", "Xã Bất Bạt", "Xã Bình Minh", "Xã Chuyên Mỹ", "Xã Chương Dương", "Xã Cổ Đô", "Xã Dân Hòa", "Xã Dương Hòa",
        "Xã Đa Phúc", "Xã Đại Thanh", "Xã Đại Xuyên", "Xã Đan Phượng", "Xã Đoài Phương", "Xã Đông Anh", "Xã Gia Lâm", "Xã Hạ Bằng", "Xã Hát Môn", "Xã Hòa Lạc",
        "Xã Hòa Phú", "Xã Hòa Xá", "Xã Hoài Đức", "Xã Hồng Sơn", "Xã Hồng Vân", "Xã Hưng Đạo", "Xã Hương Sơn", "Xã Kiều Phú", "Xã Kim Anh", "Xã Liên Minh",
        "Xã Mê Linh", "Xã Minh Châu", "Xã Mỹ Đức", "Xã Nam Phù", "Xã Ngọc Hồi", "Xã Nội Bài", "Xã Ô Diên", "Xã Phú Cát", "Xã Phù Đổng", "Xã Phú Nghĩa",
        "Xã Phú Xuyên", "Xã Phúc Lộc", "Xã Phúc Sơn", "Xã Phúc Thịnh", "Xã Phúc Thọ", "Xã Phượng Dực", "Xã Quảng Bị", "Xã Quang Minh", "Xã Quảng Oai",
        "Xã Quốc Oai", "Xã Sóc Sơn", "Xã Sơn Đồng", "Xã Suối Hai", "Xã Tam Hưng", "Xã Tây Phương", "Xã Thạch Thất", "Xã Thanh Oai", "Xã Thanh Trì",
        "Xã Thiên Lộc", "Xã Thuận An", "Xã Thư Lâm", "Xã Thượng Phúc", "Xã Thường Tín", "Xã Tiến Thắng", "Xã Trần Phú", "Xã Trung Giã", "Xã Ứng Hòa",
        "Xã Ứng Thiên", "Xã Vân Đình", "Xã Vật Lại", "Xã Vĩnh Thanh", "Xã Xuân Mai", "Xã Yên Bài", "Xã Yên Lãng", "Xã Yên Xuân"
    ],
    "Thành phố Hải Phòng": [
        "Đặc khu Cát Hải", "Đặc khu Bạch Long Vĩ",
        "Phường Hồng Bàng", "Phường Hồng An", "Phường Lê Chân", "Phường An Biên", "Phường Ngô Quyền", "Phường Gia Viên", "Phường Hải An", "Phường Đông Hải",
        "Phường Nam Đồ Sơn", "Phường Đồ Sơn", "Phường Hưng Đạo", "Phường Dương Kinh", "Phường Kiến An", "Phường Phù Liễn", "Phường An Dương", "Phường An Hải",
        "Phường An Phong", "Phường Thủy Nguyên", "Phường Thiên Hương", "Phường Hòa Bình", "Phường Nam Triệu", "Phường Bạch Đằng", "Phường Lưu Kiếm",
        "Phường Lê Ích Mộc", "Phường Việt Khê", "Phường Hải Dương", "Phường Lê Thanh Nghị", "Phường Việt Hòa", "Phường Thành Đông", "Phường Nam Đồng",
        "Phường Tân Hưng", "Phường Thạch Khôi", "Phường Tứ Minh", "Phường Ái Quốc", "Phường Chu Văn An", "Phường Chí Linh", "Phường Trần Hưng Đạo",
        "Phường Nguyễn Trãi", "Phường Trần Nhân Tông", "Phường Lê Đại Hành", "Phường Kinh Môn", "Phường Nguyễn Đại Năng", "Phường Trần Liễu",
        "Phường Bắc An Phụ", "Phường Phạm Sư Mạnh",
        "Xã Kiến Thụy", "Xã Kiến Minh", "Xã Kiến Hải", "Xã Kiến Hưng", "Xã Nghi Dương", "Xã Quyết Thắng", "Xã Tiên Lãng", "Xã Tân Minh", "Xã Tiên Minh",
        "Xã Chấn Hưng", "Xã Hùng Thắng", "Xã Vĩnh Bảo", "Xã Nguyễn Bỉnh Khiêm", "Xã Vĩnh Am", "Xã Vĩnh Hải", "Xã Vĩnh Hòa", "Xã Vĩnh Thịnh", "Xã Vĩnh Thuận",
        "Xã An Hưng", "Xã An Khánh", "Xã An Quang", "Xã An Trường", "Xã An Lão", "Xã Nam An Phụ", "Xã Nam Sách", "Xã Thái Tân", "Xã Hợp Tiến", "Xã Trần Phú",
        "Xã An Phú", "Xã Thanh Hà", "Xã Hà Tây", "Xã Hà Bắc", "Xã Hà Nam", "Xã Hà Đông", "Xã Mao Điền", "Xã Cẩm Giàng", "Xã Cẩm Giang", "Xã Tuệ Tĩnh",
        "Xã Kẻ Sặt", "Xã Bình Giang", "Xã Đường An", "Xã Thượng Hồng", "Xã Gia Lộc", "Xã Yết Kiêu", "Xã Gia Phúc", "Xã Trường Tân", "Xã Tứ Kỳ", "Xã Tân Kỳ",
        "Xã Đại Sơn", "Xã Chí Minh", "Xã Lạc Phượng", "Xã Nguyên Giáp", "Xã Ninh Giang", "Xã Vĩnh Lại", "Xã Khúc Thừa Dụ", "Xã Tân An", "Xã Hồng Châu",
        "Xã Thanh Miện", "Xã Bắc Thanh Miện", "Xã Hải Hưng", "Xã Nguyễn Lương Bằng", "Xã Nam Thanh Miện", "Xã Phú Thái", "Xã Lai Khê", "Xã An Thành",
        "Xã Kim Thành", "Xã Ninh Giang"
    ],
    "Hưng Yên": [
        "Phường Phố Hiến", "Phường Sơn Nam", "Phường Hồng Châu", "Phường Mỹ Hào", "Phường Đường Hào", "Phường Thượng Hồng", "Phường Thái Bình",
        "Phường Trần Lãm", "Phường Trần Hưng Đạo", "Phường Trà Lý", "Phường Vũ Phúc",
        "Xã Tân Hưng", "Xã Hoàng Hoa Thám", "Xã Tiên Lữ", "Xã Tiên Hoa", "Xã Quang Hưng", "Xã Đoàn Đào", "Xã Tiên Tiến", "Xã Tống Trân", "Xã Lương Bằng",
        "Xã Nghĩa Dân", "Xã Hiệp Cường", "Xã Đức Hợp", "Xã Ân Thi", "Xã Xuân Trúc", "Xã Phạm Ngũ Lão", "Xã Nguyễn Trãi", "Xã Hồng Quang", "Xã Khoái Châu",
        "Xã Triệu Việt Vương", "Xã Việt Tiến", "Xã Chí Minh", "Xã Châu Ninh", "Xã Yên Mỹ", "Xã Việt Yên", "Xã Hoàn Long", "Xã Nguyễn Văn Linh", "Xã Như Quỳnh",
        "Xã Lạc Đạo", "Xã Đại Đồng", "Xã Nghĩa Trụ", "Xã Phụng Công", "Xã Văn Giang", "Xã Mễ Sở", "Xã Thái Thụy", "Xã Đông Thụy Anh", "Xã Bắc Thụy Anh",
        "Xã Thụy Anh", "Xã Nam Thụy Anh", "Xã Bắc Thái Ninh", "Xã Thái Ninh", "Xã Đông Thái Ninh", "Xã Nam Thái Ninh", "Xã Tây Thái Ninh", "Xã Tây Thụy Anh",
        "Xã Tiền Hải", "Xã Tây Tiền Hải", "Xã Ái Quốc", "Xã Đồng Châu", "Xã Đông Tiền Hải", "Xã Nam Cường", "Xã Hưng Phú", "Xã Nam Tiền Hải", "Xã Đông Hưng",
        "Xã Bắc Tiên Hưng", "Xã Đông Tiên Hưng", "Xã Nam Đông Hưng", "Xã Bắc Đông Quan", "Xã Bắc Đông Hưng", "Xã Đông Quan", "Xã Nam Tiên Hưng", "Xã Tiên Hưng",
        "Xã Quỳnh Phụ", "Xã Minh Thọ", "Xã Nguyễn Du", "Xã Quỳnh An", "Xã Ngọc Lâm", "Xã Đồng Bằng", "Xã A Sào", "Xã Phụ Dực", "Xã Tân Tiến", "Xã Hưng Hà",
        "Xã Tiên La", "Xã Lê Quý Đôn", "Xã Hồng Minh", "Xã Thần Khê", "Xã Diên Hà", "Xã Ngự Thiên", "Xã Long Hưng", "Xã Kiến Xương", "Xã Lê Lợi", "Xã Quang Lịch",
        "Xã Vũ Quý", "Xã Bình Thanh", "Xã Bình Định", "Xã Hồng Vũ", "Xã Bình Nguyên", "Xã Trà Giang", "Xã Vũ Thư", "Xã Thư Trì", "Xã Tân Thuận", "Xã Thư Vũ",
        "Xã Vũ Tiên", "Xã Vạn Xuân"
    ],
    "Ninh Bình": [
        "Phường Tây Hoa Lư", "Phường Hoa Lư", "Phường Nam Hoa Lư", "Phường Đông Hoa Lư", "Phường Tam Điệp", "Phường Yên Sơn", "Phường Trung Sơn",
        "Phường Yên Thắng", "Phường Phủ Lý", "Phường Hà Nam", "Phường Phù Vân", "Phường Châu Sơn", "Phường Liêm Tuyền", "Phường Nam Định", "Phường Thiên Trường",
        "Phường Đông A", "Phường Vị Khê", "Phường Thành Nam", "Phường Trường Thi", "Phường Hồng Quang", "Phường Mỹ Lộc", "Phường Duy Tiên", "Phường Duy Tân",
        "Phường Đồng Văn", "Phường Duy Hà", "Phường Tiên Sơn", "Phường Lê Hồ", "Phường Nguyễn Úy", "Phường Lý Thường Kiệt", "Phường Kim Thanh", "Phường Tam Chúc",
        "Phường Kim Bảng",
        "Xã Bình Lục", "Xã Bình Mỹ", "Xã Bình An", "Xã Bình Giang", "Xã Bình Sơn", "Xã Liêm Hà", "Xã Tân Thanh", "Xã Thanh Bình", "Xã Thanh Lâm", "Xã Thanh Liêm",
        "Xã Lý Nhân", "Xã Nam Xang", "Xã Bắc Lý", "Xã Vĩnh Trụ", "Xã Trần Thương", "Xã Nhân Hà", "Xã Nam Lý", "Xã Nam Trực", "Xã Nam Minh", "Xã Nam Đồng",
        "Xã Nam Ninh", "Xã Nam Hồng", "Xã Minh Tân", "Xã Hiển Khánh", "Xã Vụ Bản", "Xã Liên Minh", "Xã Ý Yên", "Xã Yên Đồng", "Xã Yên Cường", "Xã Vạn Thắng",
        "Xã Vũ Dương", "Xã Tân Minh", "Xã Phong Doanh", "Xã Cổ Lễ", "Xã Ninh Giang", "Xã Cát Thành", "Xã Trực Ninh", "Xã Quang Hưng", "Xã Minh Thái",
        "Xã Ninh Cường", "Xã Xuân Trường", "Xã Xuân Hưng", "Xã Xuân Giang", "Xã Xuân Hồng", "Xã Hải Hậu", "Xã Hải Anh", "Xã Hải Tiến", "Xã Hải Hưng",
        "Xã Hải An", "Xã Hải Quang", "Xã Hải Xuân", "Xã Hải Thịnh", "Xã Giao Minh", "Xã Giao Hòa", "Xã Giao Thủy", "Xã Giao Phúc", "Xã Giao Hưng",
        "Xã Giao Bình", "Xã Giao Ninh", "Xã Đồng Thịnh", "Xã Nghĩa Hưng", "Xã Nghĩa Sơn", "Xã Hồng Phong", "Xã Quỹ Nhất", "Xã Nghĩa Lâm", "Xã Rạng Đông",
        "Xã Gia Viễn", "Xã Đại Hoàng", "Xã Gia Hưng", "Xã Gia Phong", "Xã Gia Vân", "Xã Gia Trấn", "Xã Nho Quan", "Xã Gia Lâm", "Xã Gia Tường", "Xã Phú Sơn",
        "Xã Cúc Phương", "Xã Phú Long", "Xã Thanh Sơn", "Xã Quỳnh Lưu", "Xã Yên Khánh", "Xã Khánh Nhạc", "Xã Khánh Thiện", "Xã Khánh Hội", "Xã Khánh Trung",
        "Xã Yên Mô", "Xã Yên Từ", "Xã Yên Mạc", "Xã Đồng Thái", "Xã Chất Bình", "Xã Kim Sơn", "Xã Quang Thiện", "Xã Phát Diệm", "Xã Lai Thành", "Xã Định Hóa",
        "Xã Bình Minh", "Xã Kim Đông"
    ],
    "Thanh Hóa": [
        "Phường Hạc Thành", "Phường Quảng Phú", "Phường Đông Quang", "Phường Đông Sơn", "Phường Đông Tiến", "Phường Hàm Rồng", "Phường Nguyệt Viên",
        "Phường Sầm Sơn", "Phường Nam Sầm Sơn", "Phường Bỉm Sơn", "Phường Quang Trung", "Phường Ngọc Sơn", "Phường Tân Dân", "Phường Hải Lĩnh", "Phường Tĩnh Gia",
        "Phường Đào Duy Từ", "Phường Hải Bình", "Phường Trúc Lâm", "Phường Nghi Sơn",
        "Xã Các Sơn", "Xã Trường Lâm", "Xã Hà Trung", "Xã Tống Sơn", "Xã Hà Long", "Xã Hoạt Giang", "Xã Lĩnh Toại", "Xã Triệu Lộc", "Xã Đông Thành",
        "Xã Hậu Lộc", "Xã Hoa Lộc", "Xã Vạn Lộc", "Xã Nga Sơn", "Xã Nga Thắng", "Xã Hồ Vương", "Xã Tân Tiến", "Xã Nga An", "Xã Ba Đình", "Xã Hoằng Hóa",
        "Xã Hoằng Tiến", "Xã Hoằng Thanh", "Xã Hoằng Lộc", "Xã Hoằng Châu", "Xã Hoằng Sơn", "Xã Hoằng Phú", "Xã Hoằng Giang", "Xã Lưu Vệ", "Xã Quảng Yên",
        "Xã Quảng Ngọc", "Xã Quảng Ninh", "Xã Quảng Bình", "Xã Tiên Trang", "Xã Quảng Chính", "Xã Nông Cống", "Xã Thắng Lợi", "Xã Trung Chính", "Xã Trường Văn",
        "Xã Thăng Bình", "Xã Tượng Lĩnh", "Xã Công Chính", "Xã Thiệu Hóa", "Xã Thiệu Quang", "Xã Thiệu Tiến", "Xã Thiệu Toán", "Xã Thiệu Trung", "Xã Yên Định",
        "Xã Yên Trường", "Xã Yên Phú", "Xã Quý Lộc", "Xã Yên Ninh", "Xã Định Tân", "Xã Định Hòa", "Xã Thọ Xuân", "Xã Thọ Long", "Xã Xuân Hòa", "Xã Sao Vàng",
        "Xã Lam Sơn", "Xã Thọ Lập", "Xã Xuân Tín", "Xã Xuân Lập", "Xã Vĩnh Lộc", "Xã Tây Đô", "Xã Biện Thượng", "Xã Triệu Sơn", "Xã Thọ Bình", "Xã Thọ Ngọc",
        "Xã Thọ Phú", "Xã Hợp Tiến", "Xã An Nông", "Xã Tân Ninh", "Xã Đồng Tiến", "Xã Hồi Xuân", "Xã Nam Xuân", "Xã Thiên Phủ", "Xã Hiền Kiệt", "Xã Phú Lệ",
        "Xã Trung Thành", "Xã Tam Lư", "Xã Quan Sơn", "Xã Trung Hạ", "Xã Linh Sơn", "Xã Đồng Lương", "Xã Văn Phú", "Xã Giao An", "Xã Bá Thước", "Xã Thiết Ống",
        "Xã Văn Nho", "Xã Điền Quang", "Xã Điền Lư", "Xã Quý Lương", "Xã Cổ Lũng", "Xã Pù Luông", "Xã Ngọc Lặc", "Xã Thạch Lập", "Xã Ngọc Liên", "Xã Minh Sơn",
        "Xã Nguyệt Ấn", "Xã Kiên Thọ", "Xã Cẩm Thạch", "Xã Cẩm Thủy", "Xã Cẩm Tú", "Xã Cẩm Vân", "Xã Cẩm Tân", "Xã Kim Tân", "Xã Vân Du", "Xã Ngọc Trạo",
        "Xã Thạch Bình", "Xã Thành Vinh", "Xã Thạch Quảng", "Xã Như Xuân", "Xã Thượng Ninh", "Xã Xuân Bình", "Xã Hóa Quỳ", "Xã Thanh Phong", "Xã Thanh Quân",
        "Xã Xuân Du", "Xã Mậu Lâm", "Xã Như Thanh", "Xã Yên Thọ", "Xã Thanh Kỳ", "Xã Thường Xuân", "Xã Luận Thành", "Xã Tân Thành", "Xã Thắng Lộc",
        "Xã Xuân Chinh", "Xã Mường Lát", "Xã Phú Xuân", "Xã Mường Chanh", "Xã Quang Chiểu", "Xã Tam Chung", "Xã Pù Nhi", "Xã Nhi Sơn", "Xã Mường Lý",
        "Xã Trung Lý", "Xã Trung Sơn", "Xã Na Mèo", "Xã Sơn Thủy", "Xã Sơn Điện", "Xã Mường Mìn", "Xã Tam Thanh", "Xã Yên Khương", "Xã Yên Thắng",
        "Xã Xuân Thái", "Xã Bát Mọt", "Xã Yên Nhân", "Xã Lương Sơn", "Xã Vạn Xuân"
    ],
    "Nghệ An": [
        "Phường Hoàng Mai", "Phường Tân Mai", "Phường Quỳnh Mai", "Phường Thái Hòa", "Phường Tây Hiếu", "Phường Trường Vinh", "Phường Thành Vinh",
        "Phường Vinh Hưng", "Phường Vinh Phú", "Phường Vinh Lộc", "Phường Cửa Lò",
        "Xã Anh Sơn", "Xã Yên Xuân", "Xã Nhân Hòa", "Xã Anh Sơn Đông", "Xã Vĩnh Tường", "Xã Thành Bình Thọ", "Xã Con Cuông", "Xã Môn Sơn", "Xã Mậu Thạch",
        "Xã Cam Phục", "Xã Châu Khê", "Xã Bình Chuẩn", "Xã Diễn Châu", "Xã Đức Châu", "Xã Quảng Châu", "Xã Hải Châu", "Xã Tân Châu", "Xã An Châu", "Xã Minh Châu",
        "Xã Hùng Châu", "Xã Đô Lương", "Xã Bạch Ngọc", "Xã Văn Hiến", "Xã Bạch Hà", "Xã Thuần Trung", "Xã Lương Sơn", "Xã Hưng Nguyên", "Xã Yên Trung",
        "Xã Hưng Nguyên Nam", "Xã Lam Thành", "Xã Chiêu Lưu", "Xã Hữu Kiệm", "Xã Mường Típ", "Xã Mường Xén", "Xã Na Loi", "Xã Na Ngoi", "Xã Nậm Cắn",
        "Xã Kim Liên", "Xã Vạn An", "Xã Nam Đàn", "Xã Đại Huệ", "Xã Thiên Nhẫn", "Xã Nghĩa Đàn", "Xã Nghĩa Thọ", "Xã Nghĩa Lâm", "Xã Nghĩa Mai", "Xã Nghĩa Hưng",
        "Xã Nghĩa Khánh", "Xã Nghĩa Lộc", "Xã Nghi Lộc", "Xã Phúc Lộc", "Xã Đông Lộc", "Xã Trung Lộc", "Xã Thần Lĩnh", "Xã Hải Lộc", "Xã Văn Kiều", "Xã Mường Quàng",
        "Xã Quế Phong", "Xã Thông Thụ", "Xã Tiền Phong", "Xã Tri Lễ", "Xã Quỳ Châu", "Xã Châu Tiến", "Xã Hùng Chân", "Xã Quỳ Hợp", "Xã Tam Hợp", "Xã Châu Lộc",
        "Xã Châu Hồng", "Xã Mường Ham", "Xã Mường Chọng", "Xã Minh Hợp", "Xã Quỳnh Lưu", "Xã Quỳnh Văn", "Xã Quỳnh Anh", "Xã Quỳnh Tam", "Xã Quỳnh Phú",
        "Xã Quỳnh Sơn", "Xã Quỳnh Thắng", "Xã Tân Kỳ", "Xã Tân Phú", "Xã Tân An", "Xã Nghĩa Đồng", "Xã Giai Xuân", "Xã Nghĩa Hành", "Xã Tiên Đồng", "Xã Đông Hiếu",
        "Xã Bích Hào", "Xã Cát Ngạn", "Xã Tam Đồng", "Xã Hạnh Lâm", "Xã Hoa Quân", "Xã Kim Bảng", "Xã Sơn Lâm", "Xã Tam Đồng", "Xã Xuân Lâm", "Xã Nga My",
        "Xã Nhôn Mai", "Xã Tam Quang", "Xã Tam Thái", "Xã Tương Dương", "Xã Yên Hòa", "Xã Yên Na", "Xã Yên Thành", "Xã Quan Thành", "Xã Hợp Minh", "Xã Vân Tụ",
        "Xã Vân Du", "Xã Quang Đồng", "Xã Giai Lạc", "Xã Bình Minh", "Xã Đông Thành", "Xã Keng Đu", "Xã Mỹ Lý", "Xã Bắc Lý", "Xã Huồi Tụ", "Xã Mường Lống",
        "Xã Bình Chuẩn", "Xã Hữu Khuông", "Xã Lượng Minh", "Xã Châu Bình"
    ],
    "Hà Tĩnh": [
        "Phường Thành Sen", "Phường Trần Phú", "Phường Hà Huy Tập", "Phường Vũng Áng", "Phường Sông Trí", "Phường Hoành Sơn", "Phường Hải Ninh",
        "Phường Bắc Hồng Lĩnh", "Phường Nam Hồng Lĩnh",
        "Xã Thạch Hà", "Xã Toàn Lưu", "Xã Việt Xuyên", "Xã Đông Kinh", "Xã Thạch Xuân", "Xã Lộc Hà", "Xã Hồng Lộc", "Xã Mai Phụ", "Xã Can Lộc",
        "Xã Tùng Lộc", "Xã Gia Hanh", "Xã Trường Lưu", "Xã Xuân Lộc", "Xã Đồng Lộc", "Xã Tiên Điền", "Xã Nghi Xuân", "Xã Cổ Đạm", "Xã Đan Hải", "Xã Đức Thọ",
        "Xã Đức Đồng", "Xã Đức Quang", "Xã Đức Thịnh", "Xã Đức Minh", "Xã Hương Sơn", "Xã Sơn Tây", "Xã Tứ Mỹ", "Xã Sơn Giang", "Xã Sơn Tiến", "Xã Sơn Hồng",
        "Xã Kim Hoa", "Xã Vũ Quang", "Xã Mai Hoa", "Xã Thượng Đức", "Xã Hương Khê", "Xã Hương Phố", "Xã Hương Đô", "Xã Hà Linh", "Xã Hương Bình", "Xã Phúc Trạch",
        "Xã Hương Xuân", "Xã Thiên Cầm", "Xã Thạch Lạc", "Xã Đồng Tiến", "Xã Thạch Khê", "Xã Thạch Lộc", "Xã Yên Hòa", "Xã Cẩm Dương", "Xã Kỳ Xuân", "Xã Kỳ Anh",
        "Xã Kỳ Hoa", "Xã Kỳ Văn", "Xã Kỳ Khang", "Xã Kỳ Lạc", "Xã Kỳ Thượng", "Xã Hương Long", "Xã Sơn Kim 1", "Xã Sơn Kim 2"
    ],
    "Quảng Trị": [
        "Phường Đồng Hới", "Phường Đồng Thuận", "Phường Đồng Sơn", "Phường Ba Đồn", "Phường Bắc Gianh", "Phường Đông Hà", "Phường Nam Đông Hà", "Phường Quảng Trị",
        "Xã Nam Gianh", "Xã Nam Ba Đồn", "Xã Dân Hóa", "Xã Kim Điền", "Xã Kim Phú", "Xã Minh Hóa", "Xã Tuyên Lâm", "Xã Tuyên Sơn", "Xã Đồng Lê", "Xã Tuyên Phú",
        "Xã Tuyên Bình", "Xã Tuyên Hóa", "Xã Tân Gianh", "Xã Trung Thuần", "Xã Quảng Trạch", "Xã Hòa Trạch", "Xã Phú Trạch", "Xã Thượng Trạch", "Xã Phong Nha",
        "Xã Bắc Trạch", "Xã Đông Trạch", "Xã Hoàn Lão", "Xã Bố Trạch", "Xã Nam Trạch", "Xã Quảng Ninh", "Xã Ninh Châu", "Xã Trường Ninh", "Xã Trường Sơn",
        "Xã Lệ Thủy", "Xã Cam Hồng", "Xã Sen Ngư", "Xã Tân Mỹ", "Xã Trường Phú", "Xã Lệ Ninh", "Xã Kim Ngân", "Xã Vĩnh Linh", "Xã Cửa Tùng", "Xã Vĩnh Hoàng",
        "Xã Vĩnh Thủy", "Xã Bến Quan", "Xã Cồn Tiên", "Xã Cửa Việt", "Xã Gio Linh", "Xã Bến Hải", "Xã Cam Lộ", "Xã Hiếu Giang", "Xã La Lay", "Xã Tà Rụt",
        "Xã Đakrông", "Xã Ba Lòng", "Xã Hướng Hiệp", "Xã Hướng Lập", "Xã Hướng Phùng", "Xã Khe Sanh", "Xã Tân Lập", "Xã Lao Bảo", "Xã Lìa", "Xã A Dơi",
        "Xã Triệu Phong", "Xã Ái Tử", "Xã Triệu Bình", "Xã Triệu Cơ", "Xã Nam Cửa Việt", "Xã Diên Sanh", "Xã Mỹ Thủy", "Xã Hải Lăng", "Xã Nam Hải Lăng",
        "Xã Vĩnh Định", "Xã Tân Thành", "Đặc khu Cồn Cỏ"
    ],
    "Thành phố Huế": [
        "Phường Phong Điền", "Phường Phong Thái", "Phường Phong Dinh", "Phường Phong Phú", "Phường Phong Quảng", "Phường Hương Trà", "Phường Kim Trà",
        "Phường Kim Long", "Phường Hương An", "Phường Phú Xuân", "Phường Thuận An", "Phường Hóa Châu", "Phường Mỹ Thượng", "Phường Vỹ Dạ", "Phường Thuận Hóa",
        "Phường An Cựu", "Phường Thủy Xuân", "Phường Thanh Thủy", "Phường Hương Thủy", "Phường Phú Bài", "Phường Dương Nỗ",
        "Xã Đan Điền", "Xã Quảng Điền", "Xã Bình Điền", "Xã Phú Vinh", "Xã Phú Hồ", "Xã Phú Vang", "Xã Vinh Lộc", "Xã Hưng Lộc", "Xã Lộc An", "Xã Phú Lộc",
        "Xã Chân Mây - Lăng Cô", "Xã Long Quảng", "Xã Nam Đông", "Xã Khe Tre", "Xã A Lưới 1", "Xã A Lưới 2", "Xã A Lưới 3", "Xã A Lưới 4", "Xã A Lưới 5"
    ],
    "Thành phố Đà Nẵng": [
        "Phường Hải Châu", "Phường Hòa Cường", "Phường Thanh Khê", "Phường An Khê", "Phường An Hải", "Phường Sơn Trà", "Phường Ngũ Hành Sơn",
        "Phường Hòa Khánh", "Phường Hải Vân", "Phường Liên Chiểu", "Phường Cẩm Lệ", "Phường Hòa Xuân", "Phường Tam Kỳ", "Phường Quảng Phú", "Phường Hương Trà",
        "Phường Bàn Thạch", "Phường Điện Bàn", "Phường Điện Bàn Đông", "Phường An Thắng", "Phường Điện Bàn Bắc", "Phường Hội An", "Phường Hội An Đông",
        "Phường Hội An Tây",
        "Xã Hòa Vang", "Xã Hòa Tiến", "Xã Bà Nà", "Xã Núi Thành", "Xã Tam Mỹ", "Xã Tam Anh", "Xã Đức Phú", "Xã Tam Xuân", "Xã Tây Hồ", "Xã Chiên Đàn",
        "Xã Phú Ninh", "Xã Lãnh Ngọc", "Xã Tiên Phước", "Xã Thạnh Bình", "Xã Sơn Cẩm Hà", "Xã Trà Liên", "Xã Trà Giáp", "Xã Trà Tân", "Xã Trà Đốc", "Xã Trà My",
        "Xã Nam Trà My", "Xã Trà Tập", "Xã Trà Vân", "Xã Trà Linh", "Xã Trà Leng", "Xã Thăng Bình", "Xã Thăng An", "Xã Thăng Trường", "Xã Thăng Điền",
        "Xã Thăng Phú", "Xã Đồng Dương", "Xã Quế Sơn Trung", "Xã Quế Sơn", "Xã Xuân Phú", "Xã Nông Sơn", "Xã Quế Phước", "Xã Duy Nghĩa", "Xã Nam Phước",
        "Xã Duy Xuyên", "Xã Thu Bồn", "Xã Điện Bàn Tây", "Xã Gò Nổi", "Xã Đại Lộc", "Xã Hà Nha", "Xã Thượng Đức", "Xã Vu Gia", "Xã Phú Thuận", "Xã Thạnh Mỹ",
        "Xã Bến Giằng", "Xã Nam Giang", "Xã Đắc Pring", "Xã La Dêê", "Xã La Êê", "Xã Sông Vàng", "Xã Sông Kôn", "Xã Đông Giang", "Xã Bến Hiên", "Xã Avương",
        "Xã Tây Giang", "Xã Hùng Sơn", "Xã Hiệp Đức", "Xã Việt An", "Xã Phước Trà", "Xã Khâm Đức", "Xã Phước Năng", "Xã Phước Chánh", "Xã Phước Thành",
        "Xã Phước Hiệp", "Đặc khu Hoàng Sa", "Xã Tam Hải", "Xã Tân Hiệp"
    ],
    "Quảng Ngãi": [
        "Phường Trương Quang Trọng", "Phường Cẩm Thành", "Phường Nghĩa Lộ", "Phường Trà Câu", "Phường Đức Phổ", "Phường Sa Huỳnh", "Phường Kon Tum",
        "Phường Đăk Cấm", "Phường Đăk Bla",
        "Xã Tịnh Khê", "Xã An Phú", "Xã Nguyễn Nghiêm", "Xã Khánh Cường", "Xã Bình Minh", "Xã Bình Chương", "Xã Bình Sơn", "Xã Vạn Tường", "Xã Đông Sơn",
        "Xã Trường Giang", "Xã Ba Gia", "Xã Sơn Tịnh", "Xã Thọ Phong", "Xã Tư Nghĩa", "Xã Vệ Giang", "Xã Nghĩa Giang", "Xã Trà Giang", "Xã Nghĩa Hành",
        "Xã Đình Cương", "Xã Thiện Tín", "Xã Phước Giang", "Xã Long Phụng", "Xã Mỏ Cày", "Xã Mộ Đức", "Xã Lân Phong", "Xã Trà Bồng", "Xã Đông Trà Bồng",
        "Xã Tây Trà", "Xã Thanh Bồng", "Xã Cà Đam", "Xã Tây Trà Bồng", "Xã Sơn Hạ", "Xã Sơn Linh", "Xã Sơn Hà", "Xã Sơn Thủy", "Xã Sơn Kỳ", "Xã Sơn Tây",
        "Xã Sơn Tây Thượng", "Xã Sơn Tây Hạ", "Xã Minh Long", "Xã Sơn Mai", "Xã Ba Vì", "Xã Ba Tô", "Xã Ba Dinh", "Xã Ba Tơ", "Xã Ba Vinh", "Xã Ba Động",
        "Xã Đặng Thùy Trâm", "Xã Ngọk Bay", "Xã Ia Chim", "Xã Đăk Rơ Wa", "Xã Đăk Pxi", "Xã Đăk Mar", "Xã Đăk Ui", "Xã Ngọk Réo", "Xã Đăk Hà", "Xã Ngọk Tụ",
        "Xã Đăk Tô", "Xã Kon Đào", "Xã Đăk Sao", "Xã Đăk Tờ Kan", "Xã Tu Mơ Rông", "Xã Măng Ri", "Xã Bờ Y", "Xã Sa Loong", "Xã Dục Nông", "Xã Xốp",
        "Xã Ngọc Linh", "Xã Đăk Plô", "Xã Đăk Pék", "Xã Đăk Môn", "Xã Sa Thầy", "Xã Sa Bình", "Xã Ya Ly", "Xã Ia Tơi", "Xã Đăk Kôi", "Xã Kon Braih",
        "Xã Đăk Rve", "Xã Măng Đen", "Xã Măng Bút", "Xã Kon Plông", "Xã Đăk Long", "Xã Ba Xa", "Xã Rờ Kơi", "Xã Mô Rai", "Xã Ia Đal", "Đặc khu Lý Sơn"
    ],
    "Gia Lai": [
        "Phường Quy Nhơn", "Phường Quy Nhơn Đông", "Phường Quy Nhơn Tây", "Phường Quy Nhơn Nam", "Phường Quy Nhơn Bắc", "Phường Bình Định", "Phường An Nhơn",
        "Phường An Nhơn Đông", "Phường An Nhơn Nam", "Phường An Nhơn Bắc", "Phường Bồng Sơn", "Phường Hoài Nhơn", "Phường Tam Quan", "Phường Hoài Nhơn Đông",
        "Phường Hoài Nhơn Tây", "Phường Hoài Nhơn Nam", "Phường Hoài Nhơn Bắc", "Phường Pleiku", "Phường Hội Phú", "Phường Thống Nhất", "Phường Diên Hồng",
        "Phường An Phú", "Phường An Khê", "Phường An Bình", "Phường Ayun Pa",
        "Xã An Nhơn Tây", "Xã Phù Cát", "Xã Xuân An", "Xã Ngô Mây", "Xã Cát Tiến", "Xã Đề Gi", "Xã Hòa Hội", "Xã Hội Sơn", "Xã Phù Mỹ", "Xã An Lương",
        "Xã Bình Dương", "Xã Phù Mỹ Đông", "Xã Phù Mỹ Tây", "Xã Phù Mỹ Nam", "Xã Phù Mỹ Bắc", "Xã Tuy Phước", "Xã Tuy Phước Đông", "Xã Tuy Phước Tây",
        "Xã Tuy Phước Bắc", "Xã Tây Sơn", "Xã Bình Khê", "Xã Bình Phú", "Xã Bình Hiệp", "Xã Bình An", "Xã Hoài Ân", "Xã Ân Tường", "Xã Kim Sơn", "Xã Vạn Đức",
        "Xã Ân Hảo", "Xã Vân Canh", "Xã Canh Vinh", "Xã Canh Liên", "Xã Vĩnh Thạnh", "Xã Vĩnh Thịnh", "Xã Vĩnh Quang", "Xã Vĩnh Sơn", "Xã An Hòa", "Xã An Lão",
        "Xã An Vinh", "Xã An Toàn", "Xã Biển Hồ", "Xã Gào", "Xã Ia Ly", "Xã Chư Păh", "Xã Ia Khươl", "Xã Ia Phí", "Xã Chư Prông", "Xã Bàu Cạn", "Xã Ia Boòng",
        "Xã Ia Lâu", "Xã Ia Pia", "Xã Ia Tôr", "Xã Chư Sê", "Xã Bờ Ngoong", "Xã Ia Ko", "Xã Al Bá", "Xã Chư Pưh", "Xã Ia Le", "Xã Ia Hrú", "Xã Cửu An",
        "Xã Đak Pơ", "Xã Ya Hội", "Xã Kbang", "Xã Kông Bơ La", "Xã Tơ Tung", "Xã Sơn Lang", "Xã Đak Rong", "Xã Kông Chro", "Xã Ya Ma", "Xã Chư Krey", "Xã SRó",
        "Xã Đăk Song", "Xã Chơ Long", "Xã Ia Rbol", "Xã Ia Sao", "Xã Phú Thiện", "Xã Chư A Thai", "Xã Ia Hiao", "Xã Pờ Tó", "Xã Ia Pa", "Xã Ia Tul", "Xã Phú Túc",
        "Xã Ia Dreh", "Xã Ia Rsai", "Xã Uar", "Xã Đak Đoa", "Xã Kon Gang", "Xã Ia Băng", "Xã KDang", "Xã Đak Sơmei", "Xã Mang Yang", "Xã Lơ Pang", "Xã Kon Chiêng",
        "Xã Hra", "Xã Ayun", "Xã Ia Grai", "Xã Ia Krái", "Xã Ia Hrung", "Xã Đức Cơ", "Xã Ia Dơk", "Xã Ia Krêl", "Xã Nhơn Châu", "Xã Ia Púch", "Xã Ia Mơ",
        "Xã Ia Pnôn", "Xã Ia Nan", "Xã Ia Dom", "Xã Ia Chia", "Xã Ia O", "Xã Krong"
    ],
    "Đắk Lắk": [
        "Phường Buôn Ma Thuột", "Phường Tân An", "Phường Tân Lập", "Phường Thành Nhất", "Phường Ea Kao", "Phường Buôn Hồ", "Phường Cư Bao", "Phường Phú Yên",
        "Phường Tuy Hòa", "Phường Bình Kiến", "Phường Xuân Đài", "Phường Sông Cầu", "Phường Đông Hòa", "Phường Hòa Hiệp",
        "Xã Hòa Phú", "Xã Ea Drông", "Xã Ea Súp", "Xã Ea Rốk", "Xã Ea Bung", "Xã Ea Wer", "Xã Ea Nuôl", "Xã Ea Kiết", "Xã Ea M’Droh", "Xã Quảng Phú",
        "Xã Cuôr Đăng", "Xã Cư M’gar", "Xã Ea Tul", "Xã Pơng Drang", "Xã Krông Búk", "Xã Cư Pơng", "Xã Ea Khăl", "Xã Ea Drăng", "Xã Ea Wy", "Xã Ea Hiao",
        "Xã Krông Năng", "Xã Dliê Ya", "Xã Tam Giang", "Xã Phú Xuân", "Xã Krông Pắc", "Xã Ea Knuếc", "Xã Tân Tiến", "Xã Ea Phê", "Xã Ea Kly", "Xã Ea Kar",
        "Xã Ea Ô", "Xã Ea Knốp", "Xã Cư Yang", "Xã Ea Păl", "Xã M’Drắk", "Xã Ea Riêng", "Xã Cư M’ta", "Xã Krông Á", "Xã Cư Prao", "Xã Hòa Sơn", "Xã Dang Kang",
        "Xã Krông Bông", "Xã Yang Mao", "Xã Cư Pui", "Xã Liên Sơn Lắk", "Xã Đắk Liêng", "Xã Nam Ka", "Xã Đắk Phơi", "Xã Ea Ning", "Xã Dray Bhăng", "Xã Ea Ktur",
        "Xã Krông Ana", "Xã Dur Kmăl", "Xã Ea Na", "Xã Xuân Thọ", "Xã Xuân Cảnh", "Xã Xuân Lộc", "Xã Hòa Xuân", "Xã Tuy An Bắc", "Xã Tuy An Đông", "Xã Ô Loan",
        "Xã Tuy An Nam", "Xã Tuy An Tây", "Xã Phú Hòa 1", "Xã Phú Hòa 2", "Xã Tây Hòa", "Xã Hòa Thịnh", "Xã Hòa Mỹ", "Xã Sơn Thành", "Xã Sơn Hòa", "Xã Vân Hòa",
        "Xã Tây Sơn", "Xã Suối Trai", "Xã Ea Ly", "Xã Ea Bá", "Xã Đức Bình", "Xã Sông Hinh", "Xã Xuân Lãnh", "Xã Phú Mỡ", "Xã Xuân Phước", "Xã Đồng Xuân",
        "Xã Buôn Đôn", "Xã Ea H’Leo", "Xã Ea Trang", "Xã Ia Lốp", "Xã Ia Rvê", "Xã Krông Nô", "Xã Vụ Bổn"
    ],
    "Khánh Hoà": [
        "Phường Nha Trang", "Phường Bắc Nha Trang", "Phường Tây Nha Trang", "Phường Nam Nha Trang", "Phường Bắc Cam Ranh", "Phường Cam Ranh",
        "Phường Cam Linh", "Phường Ba Ngòi", "Phường Ninh Hòa", "Phường Đông Ninh Hòa", "Phường Hòa Thắng", "Phường Phan Rang", "Phường Đông Hải",
        "Phường Ninh Chử", "Phường Bảo An", "Phường Đô Vinh",
        "Xã Nam Cam Ranh", "Xã Bắc Ninh Hòa", "Xã Tân Định", "Xã Nam Ninh Hòa", "Xã Tây Ninh Hòa", "Xã Hòa Trí", "Xã Đại Lãnh", "Xã Tu Bông",
        "Xã Vạn Thắng", "Xã Vạn Ninh", "Xã Vạn Hưng", "Xã Diên Khánh", "Xã Diên Lạc", "Xã Diên Điền", "Xã Diên Lâm", "Xã Diên Thọ", "Xã Suối Hiệp",
        "Xã Cam Lâm", "Xã Suối Dầu", "Xã Cam Hiệp", "Xã Cam An", "Xã Bắc Khánh Vĩnh", "Xã Trung Khánh Vĩnh", "Xã Tây Khánh Vĩnh", "Xã Nam Khánh Vĩnh",
        "Xã Khánh Vĩnh", "Xã Khánh Sơn", "Xã Tây Khánh Sơn", "Xã Đông Khánh Sơn", "Xã Ninh Phước", "Xã Phước Hữu", "Xã Phước Hậu", "Xã Thuận Nam",
        "Xã Cà Ná", "Xã Phước Hà", "Xã Phước Dinh", "Xã Ninh Hải", "Xã Xuân Hải", "Xã Vĩnh Hải", "Xã Thuận Bắc", "Xã Công Hải", "Xã Ninh Sơn",
        "Xã Lâm Sơn", "Xã Anh Dũng", "Xã Mỹ Sơn", "Xã Bác Ái Đông", "Xã Bác Ái", "Xã Bác Ái Tây", "Đặc khu Trường Sa"
    ],
    "Lâm Đồng": [
        "Phường Xuân Hương - Đà Lạt", "Phường Cam Ly - Đà Lạt", "Phường Lâm Viên - Đà Lạt", "Phường Xuân Trường - Đà Lạt", "Phường Lang Biang - Đà Lạt",
        "Phường 1 - Bảo Lộc", "Phường 2 - Bảo Lộc", "Phường 3 - Bảo Lộc", "Phường B’Lao", "Phường Hàm Thắng", "Phường Bình Thuận", "Phường Mũi Né",
        "Phường Phú Thủy", "Phường Phan Thiết", "Phường Tiến Thành", "Phường La Gi", "Phường Phước Hội", "Phường Bắc Gia Nghĩa", "Phường Nam Gia Nghĩa",
        "Phường Đông Gia Nghĩa",
        "Lạc Dương", "Đơn Dương", "Ka Đô", "Quảng Lập", "D’Ran", "Hiệp Thạnh", "Đức Trọng", "Tân Hội", "Tà Hine", "Tà Năng", "Đinh Văn Lâm Hà", "Phú Sơn Lâm Hà",
        "Nam Hà Lâm Hà", "Nam Ban Lâm Hà", "Tân Hà Lâm Hà", "Phúc Thọ Lâm Hà", "Đam Rông 1", "Đam Rông 2", "Đam Rông 3", "Đam Rông 4", "Di Linh", "Hòa Ninh",
        "Hòa Bắc", "Đinh Trang Thượng", "Bảo Thuận", "Sơn Điền", "Gia Hiệp", "Bảo Lâm 1", "Bảo Lâm 2", "Bảo Lâm 3", "Bảo Lâm 4", "Bảo Lâm 5", "Đạ Huoai",
        "Đạ Huoai 2", "Đạ Tẻh", "Đạ Tẻh 2", "Đạ Tẻh 3", "Cát Tiên", "Cát Tiên 2", "Cát Tiên 3", "Vĩnh Hảo", "Liên Hương", "Tuy Phong", "Phan Rí Cửa",
        "Bắc Bình", "Hồng Thái", "Hải Ninh", "Phan Sơn", "Sông Lũy", "Lương Sơn", "Hòa Thắng", "Đông Giang", "La Dạ", "Hàm Thuận Bắc", "Hàm Thuận", "Hồng Sơn",
        "Hàm Liêm", "Tuyên Quang", "Hàm Thạnh", "Hàm Kiệm", "Tân Thành", "Hàm Thuận Nam", "Tân Lập", "Tân Minh", "Hàm Tân", "Sơn Mỹ", "Tân Hải", "Nghị Đức",
        "Bắc Ruộng", "Đồng Kho", "Tánh Linh", "Suối Kiết", "Nam Thành", "Đức Linh", "Hoài Đức", "Trà Tân", "Đắk Wil", "Nam Dong", "Cư Jút", "Thuận An", "Đức Lập",
        "Đắk Mil", "Đắk Sắk", "Nam Đà", "Krông Nô", "Nâm Nung", "Quảng Phú", "Đắk Song", "Đức An", "Thuận Hạnh", "Trường Xuân", "Tà Đùng", "Quảng Khê",
        "Quảng Tân", "Tuy Đức", "Kiến Đức", "Nhân Cơ", "Quảng Tín", "Đặc khu Phú Quý", "Đạ Huoai 3", "Xã Quảng Hòa", "Xã Quảng Sơn", "Xã Quảng Trực",
        "Xã Ninh Gia"
    ],
    "Đồng Nai": [
        "Phường Biên Hòa", "Phường Trấn Biên", "Phường Trảng Dài", "Phường Tam Hiệp", "Phường Long Bình", "Phường Hố Nai", "Phường Long Hưng", "Phường Phước Tân",
        "Phường Tam Phước", "Phường Bình Lộc", "Phường Long Khánh", "Phường Bảo Vinh", "Phường Bàu Sen", "Phường Hàng Gòn", "Phường Tân Triều",
        "Xã An Phước", "Xã Bình An", "Xã Long Thành", "Xã Long Phước", "Xã Phước Thái", "Xã Đại Phước", "Xã Nhơn Trạch", "Xã Phước An", "Xã Bình Minh",
        "Xã Trảng Bom", "Xã An Viễn", "Xã Bàu Hàm", "Xã Hưng Thịnh", "Xã Dầu Giây", "Xã Gia Kiệm", "Xã Thống Nhất", "Xã Xuân Định", "Xã Xuân Phú", "Xã Xuân Hòa",
        "Xã Xuân Lộc", "Xã Xuân Thành", "Xã Xuân Bắc", "Xã Xuân Quế", "Xã Xuân Đường", "Xã Cẩm Mỹ", "Xã Sông Ray", "Xã Xuân Đông", "Xã La Ngà", "Xã Định Quán",
        "Xã Thanh Sơn", "Xã Phú Vinh", "Xã Phú Hòa", "Xã Tà Lài", "Xã Nam Cát Tiên", "Xã Tân phú", "Xã Phú Lâm", "Xã Đak Lua", "Xã Phú Lý", "Xã Trị An", "Xã Tân An",
        "Phường Bình Phước", "Phường Đồng Xoài", "Phường Minh Hưng", "Xã Nha Bích", "Phường Chơn Thành", "Xã Lộc Thành", "Xã Lộc Ninh", "Xã Lộc Hưng", "Xã Lộc Tấn",
        "Xã Lộc Thạnh", "Xã Lộc Quang", "Phường An Lộc", "Phường Bình Long", "Xã Tân Quan", "Xã Tân Hưng", "Xã Tân Khai", "Xã Minh Đức", "Xã Bù Gia Mập", "Xã Đăk Ơ",
        "Xã Phú Nghĩa", "Xã Đa Kia", "Phường Phước Bình", "Phường Phước Long", "Xã Bình Tân", "Xã Long Hà", "Xã Phú Riềng", "Xã Phú Trung", "Xã Thuận Lợi",
        "Xã Đồng Tâm", "Xã Tân Lợi", "Xã Đồng Phú", "Xã Tân Tiến", "Xã Thiện Hưng", "Xã Hưng Phước", "Xã Phước Sơn", "Xã Nghĩa Trung", "Xã Bù Đăng", "Xã Thọ Sơn",
        "Xã Đăk Nhau", "Xã Bom Bo"
    ],
    "Tây Ninh": [
        "Phường Gia Lộc", "Phường Gò Dầu", "Phường An Tịnh", "Phường Trảng Bàng", "Phường Thanh Điền", "Phường Hòa Thành", "Phường Long Hoa", "Phường Ninh Thạnh",
        "Phường Bình Minh", "Phường Tân Ninh", "Phường Khánh Hậu", "Phường Tân An", "Phường Long An", "Phường Kiến Tường",
        "Xã Bến Cầu", "Xã Long Thuận", "Xã Long Chữ", "Xã Hảo Đước", "Xã Châu Thành", "Xã Ninh Điền", "Xã Hòa Hội", "Xã Phước Vinh", "Xã Trà Vong", "Xã Thạnh Bình",
        "Xã Tân Biên", "Xã Tân Lập", "Xã Tân Hòa", "Xã Tân Thành", "Xã Tân Hội", "Xã Tân Phú", "Xã Tân Châu", "Xã Tân Đông", "Xã Dương Minh Châu", "Xã Cầu Khởi",
        "Xã Lộc Ninh", "Xã Truông Mít", "Xã Phước Thạnh", "Xã Thạnh Đức", "Xã Hưng Thuận", "Xã Phước Chỉ", "Xã Vĩnh Công", "Xã Tầm Vu", "Xã An Lục Long",
        "Xã Thuận Mỹ", "Xã Nhựt Tảo", "Xã Tân Trụ", "Xã Vàm Cỏ", "Xã Tân Tập", "Xã Phước Vĩnh Tây", "Xã Cần Giuộc", "Xã Mỹ Lộc", "Xã Phước Lý", "Xã Long Hựu",
        "Xã Cần Đước", "Xã Tân Lân", "Xã Mỹ Lệ", "Xã Rạch Kiến", "Xã Long Cang", "Xã Mỹ Yên", "Xã Bến Lức", "Xã Lương Hòa", "Xã Bình Đức", "Xã Thạnh Lợi",
        "Xã Đức Hòa", "Xã Mỹ Hạnh", "Xã Đức Lập", "Xã Hòa Khánh", "Xã Hậu Nghĩa", "Xã Hiệp Hòa", "Xã An Ninh", "Xã Đức Huệ", "Xã Đông Thành", "Xã Mỹ Quý",
        "Xã Tân Long", "Xã Mỹ Thạnh", "Xã Mỹ An", "Xã Thủ Thừa", "Xã Tân Tây", "Xã Thạnh Hóa", "Xã Thạnh Phước", "Xã Bình Thành", "Xã Tân Thạnh", "Xã Nhơn Ninh",
        "Xã Nhơn Hòa Lập", "Xã Hậu Thạnh", "Xã Mộc Hóa", "Xã Bình Hòa", "Xã Bình Hiệp", "Xã Tuyên Thạnh", "Xã Khánh Hưng", "Xã Vĩnh Hưng", "Xã Tuyên Bình",
        "Xã Vĩnh Châu", "Xã Tân Hưng", "Xã Vĩnh Thạnh", "Xã Hưng Điền"
    ],
    "Thành phố Hồ Chí Minh": [
        "Phường Sài Gòn", "Phường Tân Định", "Phường Bến Thành", "Phường Cầu Ông Lãnh", "Phường Bàn Cờ", "Phường Xuân Hòa", "Phường Nhiêu Lộc",
        "Phường Xóm Chiếu", "Phường Khánh Hội", "Phường Vĩnh Hội", "Phường Chợ Quán", "Phường An Đông", "Phường Chợ Lớn", "Phường Bình Tây", "Phường Bình Tiên",
        "Phường Bình Phú", "Phường Phú Lâm", "Phường Tân Thuận", "Phường Phú Thuận", "Phường Tân Mỹ", "Phường Tân Hưng", "Phường Chánh Hưng",
        "Phường Phú Định", "Phường Bình Đông", "Phường Diên Hồng", "Phường Vườn Lài", "Phường Hòa Hưng", "Phường Minh Phụng", "Phường Bình Thới",
        "Phường Hòa Bình", "Phường Phú Thọ", "Phường Đông Hưng Thuận", "Phường Trung Mỹ Tây", "Phường Tân Thới Hiệp", "Phường Thới An", "Phường An Phú Đông",
        "Phường An Lạc", "Phường Bình Tân", "Phường Tân Tạo", "Phường Bình Trị Đông", "Phường Bình Hưng Hòa", "Phường Gia Định", "Phường Bình Thạnh",
        "Phường Bình Lợi Trung", "Phường Thạnh Mỹ Tây", "Phường Bình Quới", "Phường Hạnh Thông", "Phường An Nhơn", "Phường Gò Vấp", "Phường An Hội Đông",
        "Phường Thông Tây Hội", "Phường An Hội Tây", "Phường Đức Nhuận", "Phường Cầu Kiệu", "Phường Phú Nhuận", "Phường Tân Sơn Hòa", "Phường Tân Sơn Nhất",
        "Phường Tân Hòa", "Phường Bảy Hiền", "Phường Tân Bình", "Phường Tân Sơn", "Phường Tây Thạnh", "Phường Tân Sơn Nhì", "Phường Phú Thọ Hòa",
        "Phường Tân Phú", "Phường Phú Thạnh", "Phường Hiệp Bình", "Phường Thủ Đức", "Phường Tam Bình", "Phường Linh Xuân", "Phường Tăng Nhơn Phú",
        "Phường Long Bình", "Phường Long Phước", "Phường Long Trường", "Phường Cát Lái", "Phường Bình Trưng", "Phường Phước Long", "Phường An Khánh",
        "Phường Đông Hòa", "Phường Dĩ An", "Phường Tân Đông Hiệp", "Phường An Phú", "Phường Bình Hòa", "Phường Lái Thiêu", "Phường Thuận An", "Phường Thuận Giao",
        "Phường Thủ Dầu Một", "Phường Phú Lợi", "Phường Chánh Hiệp", "Phường Bình Dương", "Phường Hòa Lợi", "Phường Phú An", "Phường Tây Nam",
        "Phường Long Nguyên", "Phường Bến Cát", "Phường Chánh Phú Hòa", "Phường Vĩnh Tân", "Phường Bình Cơ", "Phường Tân Uyên", "Phường Tân Hiệp",
        "Phường Tân Khánh", "Phường Vũng Tàu", "Phường Tam Thắng", "Phường Rạch Dừa", "Phường Phước Thắng", "Phường Long Hương", "Phường Bà Rịa",
        "Phường Tam Long", "Phường Tân Hải", "Phường Tân Phước", "Phường Phú Mỹ", "Phường Tân Thành", "Phường Thới Hòa",
        "Xã Vĩnh Lộc", "Xã Tân Vĩnh Lộc", "Xã Bình Lợi", "Xã Tân Nhựt", "Xã Bình Chánh", "Xã Hưng Long", "Xã Bình Hưng", "Xã Bình Khánh", "Xã An Thới Đông",
        "Xã Cần Giờ", "Xã Củ Chi", "Xã Tân An Hội", "Xã Thái Mỹ", "Xã An Nhơn Tây", "Xã Nhuận Đức", "Xã Phú Hòa Đông", "Xã Bình Mỹ", "Xã Đông Thạnh",
        "Xã Hóc Môn", "Xã Xuân Thới Sơn", "Xã Bà Điểm", "Xã Nhà Bè", "Xã Hiệp Phước", "Xã Thường Tân", "Xã Bắc Tân Uyên", "Xã Phú Giáo", "Xã Phước Hòa",
        "Xã Phước Thành", "Xã An Long", "Xã Trừ Văn Thố", "Xã Bàu Bàng", "Xã Long Hòa", "Xã Thanh An", "Xã Dầu Tiếng", "Xã Minh Thạnh", "Xã Châu Pha",
        "Xã Long Hải", "Xã Long Điền", "Xã Phước Hải", "Xã Đất Đỏ", "Xã Nghĩa Thành", "Xã Ngãi Giao", "Xã Kim Long", "Xã Châu Đức", "Xã Bình Giã",
        "Xã Xuân Sơn", "Xã Hồ Tràm", "Xã Xuyên Mộc", "Xã Hòa Hội", "Xã Bàu Lâm", "Đặc khu Côn Đảo", "Xã Bình Châu", "Xã Hòa Hiệp", "Xã Long Sơn", "Xã Thạnh An"
    ],
    "Đồng Tháp": [
        "phường Mỹ Tho", "phường Đạo Thạnh", "phường Mỹ Phong", "phường Thới Sơn", "phường Trung An", "phường Gò Công", "phường Long Thuận", "phường Bình Xuân",
        "phường Sơn Qui", "phường An Bình", "phường Hồng Ngự", "phường Thường Lạc", "phường Cao Lãnh", "phường Mỹ Ngãi", "phường Mỹ Trà", "phường Sa Đéc",
        "phường Mỹ Phước Tây", "phường Thanh Hòa", "phường Cai Lậy", "phường Nhị Quý",
        "xã Tân Hồng", "xã Tân Thành", "xã Tân Hộ Cơ", "xã An Phước", "xã Thường Phước", "xã Long Khánh", "xã Long Phú Thuận", "xã An Hòa", "xã Tam Nông",
        "xã Phú Thọ", "xã Tràm Chim", "xã Phú Cường", "xã An Long", "xã Thanh Bình", "xã Tân Thạnh", "xã Bình Thành", "xã Tân Long", "xã Tháp Mười",
        "xã Thanh Mỹ", "xã Mỹ Quí", "xã Đốc Binh Kiều", "xã Trường Xuân", "xã Phương Thịnh", "xã Phong Mỹ", "xã Ba Sao", "xã Mỹ Thọ", "xã Bình Hàng Trung",
        "xã Mỹ Hiệp", "xã Mỹ An Hưng", "xã Tân Khánh Trung", "xã Lấp Vò", "xã Lai Vung", "xã Hòa Long", "xã Phong Hòa", "xã Tân Dương", "xã Phú Hựu",
        "xã Tân Nhuận Đông", "xã Tân Phú Trung", "xã Tân Phú", "xã Thanh Hưng", "xã An Hữu", "xã Mỹ Lợi", "xã Mỹ Đức Tây", "xã Mỹ Thiện", "xã Hậu Mỹ",
        "xã Hội Cư", "xã Cái Bè", "xã Mỹ Thành", "xã Thạnh Phú", "xã Bình Phú", "xã Hiệp Đức", "xã Long Tiên", "xã Ngũ Hiệp", "xã Tân Phước 1", "xã Tân Phước 2",
        "xã Tân Phước 3", "xã Hưng Thạnh", "xã Tân Hương", "xã Châu Thành", "xã Long Hưng", "xã Long Định", "xã Bình Trưng", "xã Vĩnh Kim", "xã Kim Sơn",
        "xã Mỹ Tịnh An", "xã Lương Hòa Lạc", "xã Tân Thuận Bình", "xã Chợ Gạo", "xã An Thạnh Thủy", "xã Bình Ninh", "xã Vĩnh Bình", "xã Đồng Sơn", "xã Phú Thành",
        "xã Long Bình", "xã Vĩnh Hựu", "xã Gò Công Đông", "xã Tân Điền", "xã Tân Hòa", "xã Tân Đông", "xã Gia Thuận", "xã Tân Thới", "xã Tân Phú Đông"
    ],
    "An Giang": [
        "phường Long Xuyên", "phường Bình Đức", "phường Mỹ Thới", "phường Châu Đốc", "phường Vĩnh Tế", "phường Tân Châu", "phường Long Phú", "phường Tịnh Biên",
        "phường Thới Sơn", "phường Chi Lăng", "phường Vĩnh Thông", "phường Rạch Giá", "phường Hà Tiên", "phường Tô Châu",
        "xã An Phú", "xã Vĩnh Hậu", "xã Nhơn Hội", "xã Khánh Bình", "xã Phú Hữu", "xã Tân An", "xã Châu Phong", "xã Vĩnh Xương", "xã Phú Tân", "xã Phú An",
        "xã Bình Thạnh Đông", "xã Chợ Vàm", "xã Hòa Lạc", "xã Phú Lâm", "xã Châu Phú", "xã Mỹ Đức", "xã Vĩnh Thạnh Trung", "xã Bình Mỹ", "xã Thạnh Mỹ Tây",
        "xã An Cư", "xã Núi Cấm", "xã Ba Chúc", "xã Tri Tôn", "xã Ô Lâm", "xã Cô Tô", "xã Vĩnh Gia", "xã An Châu", "xã Bình Hòa", "xã Cần Đăng", "xã Vĩnh Hanh",
        "xã Vĩnh An", "xã Chợ Mới", "xã Cù Lao Giêng", "xã Hội An", "xã Long Điền", "xã Nhơn Mỹ", "xã Long Kiến", "xã Thoại Sơn", "xã Óc Eo", "xã Định Mỹ",
        "xã Phú Hòa", "xã Vĩnh Trạch", "xã Tây Phú", "xã Vĩnh Bình", "xã Vĩnh Thuận", "xã Vĩnh Phong", "xã Vĩnh Hòa", "xã U Minh Thượng", "xã Đông Hòa",
        "xã Tân Thạnh", "xã Đông Hưng", "xã An Minh", "xã Vân Khánh", "xã Tây Yên", "xã Đông Thái", "xã An Biên", "xã Định Hòa", "xã Gò Quao", "xã Vĩnh Hòa Hưng",
        "xã Vĩnh Tuy", "xã Giồng Riềng", "xã Thạnh Hưng", "xã Long Thạnh", "xã Hòa Hưng", "xã Ngọc Chúc", "xã Hòa Thuận", "xã Tân Hội", "xã Tân Hiệp",
        "xã Thạnh Đông", "xã Thạnh Lộc", "xã Châu Thành", "xã Bình An", "xã Hòn Đất", "xã Sơn Kiên", "xã Mỹ Thuận", "xã Hòa Điền", "xã Kiên Lương",
        "xã Giang Thành", "xã Vĩnh Điều", "đặc khu Kiên Hải", "đặc khu Phú Quốc", "đặc khu Thổ Châu", "Mỹ Hòa Hưng", "Bình Giang", "Bình Sơn", "Hòn Nghệ",
        "Sơn Hải", "Tiên Hải"
    ],
    "Vĩnh Long": [
        "Phường Thanh Đức", "Phường Long Châu", "Phường Phước Hậu", "Phường Tân Hạnh", "Phường Tân Ngãi", "Phường Bình Minh", "Phường Cái Vồn",
        "Phường Đông Thành", "Phường Trà Vinh", "Phường Long Đức", "Phường Nguyệt Hóa", "Phường Hòa Thuận", "Phường Duyên Hải", "Phường Trường Long Hòa",
        "Phường An Hội", "Phường Phú Khương", "Phường Bến Tre", "Phường Sơn Đông", "Phường Phú Tân",
        "Xã Cái Nhum", "Xã Tân Long Hội", "Xã Nhơn Phú", "Xã Bình Phước", "Xã An Bình", "Xã Long Hồ", "Xã Phú Quới", "Xã Quới Thiện", "Xã Trung Thành",
        "Xã Trung Ngãi", "Xã Quới An", "Xã Trung Hiệp", "Xã Hiếu Phụng", "Xã Hiếu Thành", "Xã Lục Sĩ Thành", "Xã Trà Ôn", "Xã Trà Côn", "Xã Vĩnh Xuân",
        "Xã Hòa Bình", "Xã Hòa Hiệp", "Xã Tam Bình", "Xã Ngãi Tứ", "Xã Song Phú", "Xã Cái Ngang", "Xã Tân Quới", "Xã Tân Lược", "Xã Mỹ Thuận", "Xã Long Hữu",
        "Xã Càng Long", "Xã An Trường", "Xã Tân An", "Xã Nhị Long", "Xã Bình Phú", "Xã Châu Thành", "Xã Song Lộc", "Xã Hưng Mỹ", "Xã Cầu Kè", "Xã Phong Thạnh",
        "Xã An Phú Tân", "Xã Tam Ngãi", "Xã Tiểu Cần", "Xã Tân Hòa", "Xã Hùng Hòa", "Xã Tập Ngãi", "Xã Cầu Ngang", "Xã Mỹ Long", "Xã Vinh Kim", "Xã Nhị Trường",
        "Xã Hiệp Mỹ", "Xã Trà Cú", "Xã Đại An", "Xã Lưu Nghiệp Anh", "Xã Hàm Giang", "Xã Long Hiệp", "Xã Tập Sơn", "Xã Long Thành", "Xã Đôn Châu", "Xã Ngũ Lạc",
        "Xã Phú Túc", "Xã Giao Long", "Xã Tiên Thủy", "Xã Tân Phú", "Xã Phú Phụng", "Xã Chợ Lách", "Xã Vĩnh Thành", "Xã Hưng Khánh Trung", "Xã Phước Mỹ Trung",
        "Xã Tân Thành Bình", "Xã Nhuận Phú Tân", "Xã Đồng Khởi", "Xã Mỏ Cày", "Xã Thành Thới", "Xã An Định", "Xã Hương Mỹ", "Xã Đại Điền", "Xã Quới Điền",
        "Xã Thạnh Phú", "Xã An Qui", "Xã Thạnh Hải", "Xã Thạnh Phong", "Xã Tân Thủy", "Xã Bảo Thạnh", "Xã Ba Tri", "Xã Tân Xuân", "Xã Mỹ Chánh Hòa",
        "Xã An Ngãi Trung", "xã An Hiệp", "Xã Hưng Nhượng", "Xã Giồng Trôm", "Xã Tân Hào", "Xã Phước Long", "Xã Lương Phú", "Xã Châu Hoà", "Xã Lương Hoà",
        "Xã Thới Thuận", "Xã Thạnh Phước", "Xã Bình Đại", "Xã Thạnh Trị", "Xã Lộc Thuận", "Xã Châu Hưng", "Xã Phú Thuận", "Xã Long Hòa (huyện Châu Thành)",
        "Đông Hải", "Long Vĩnh", "Hòa Minh"
    ],
    "Thành phố Cần Thơ": [
        "Phường Ninh Kiều", "Phường Cái Khế", "Phường Tân An", "Phường An Bình", "Phường Thới An Đông", "Phường Bình Thủy", "Phường Long Tuyền",
        "Phường Cái Răng", "Phường Hưng Phú", "Phường Ô Môn", "Phường Phước Thới", "Phường Thới Long", "Phường Trung Nhứt", "Phường Thuận Hưng",
        "Phường Thốt Nốt", "Phường Vị Thanh", "Phường Vị Tân", "Phường Long Bình", "Phường Long Mỹ", "Phường Long Phú 1", "Phường Đại Thành",
        "Phường Ngã Bảy", "Phường Phú Lợi", "Phường Sóc Trăng", "Phường Mỹ Xuyên", "Phường Vĩnh Phước", "Phường Vĩnh Châu", "Phường Khánh Hòa",
        "Phường Ngã Năm", "Phường Mỹ Quới", "Phường Tân Lộc",
        "Xã Phong Điền", "Xã Nhơn Ái", "Xã Thới Lai", "Xã Đông Thuận", "Xã Trường Xuân", "Xã Trường Thành", "Xã Cờ Đỏ", "Xã Đông Hiệp", "Xã Trung Hưng",
        "Xã Vĩnh Thạnh", "Xã Vĩnh Trinh", "Xã Thạnh An", "Xã Thạnh Quới", "Xã Hỏa Lựu", "Xã Vị Thủy", "Xã Vĩnh Thuận Đông", "Xã Vị Thanh 1", "Xã Vĩnh Tường",
        "Xã Vĩnh Viễn", "Xã Xà Phiên", "Xã Lương Tâm", "Xã Thạnh Xuân", "Xã Tân Hòa", "Xã Trường Long Tây", "Xã Châu Thành", "Xã Đông Phước", "Xã Phú Hữu",
        "Xã Tân Bình", "Xã Hòa An", "Xã Phương Bình", "Xã Tân Phước Hưng", "Xã Hiệp Hưng", "Xã Phụng Hiệp", "Xã Thạnh Hòa", "Xã Hòa Tú", "Xã Gia Hòa",
        "Xã Nhu Gia", "Xã Ngọc Tố", "Xã Trường Khánh", "Xã Đại Ngãi", "Xã Tân Thạnh", "Xã Long Phú", "Xã Nhơn Mỹ", "Xã An Lạc Thôn", "Xã Kế Sách",
        "Xã Thới An Hội", "Xã Đại Hải", "Xã Phú Tâm", "Xã An Ninh", "Xã Thuận Hòa", "Xã Hồ Đắc Kiện", "Xã Mỹ Tú", "Xã Long Hưng", "Xã Mỹ Hương",
        "Xã Tân Long", "Xã Phú Lộc", "Xã Vĩnh Lợi", "Xã Lâm Tân", "Xã Thạnh Thới An", "Xã Tài Văn", "Xã Liêu Tú", "Xã Lịch Hội Thượng", "Xã Trần Đề",
        "Xã An Thạnh", "Xã Cù Lao Dung", "Xã Trường Long", "Xã Thạnh Phú", "Xã Thới Hưng", "Xã Phong Nẫm", "Xã Mỹ Phước", "Xã Lai Hòa", "Xã Vĩnh Hải"
    ],
    "Cà Mau": [
        "phường Bạc Liêu", "phường Vĩnh Trạch", "phường Hiệp Thành", "phường Giá Rai", "phường Láng Tròn", "phường An Xuyên", "phường Lý Văn Lâm",
        "phường Tân Thành", "phường Hoà Thành",
        "xã Tân Thuận", "xã Tân Tiến", "xã Tạ An Khương", "xã Trần Phán", "xã Thanh Tùng", "xã Đầm Dơi", "xã Quách Phẩm", "xã U Minh",
        "xã Nguyễn Phích", "xã Khánh Lâm", "xã Khánh An", "xã Phan Ngọc Hiển", "xã Đất Mũi", "xã Tân Ân", "xã Khánh Bình", "xã Đá Bạc",
        "xã Khánh Hưng", "xã Sông Đốc", "xã Trần Văn Thời", "xã Thới Bình", "xã Trí Phải", "xã Tân Lộc", "xã Biển Bạch", "xã Đất Mới",
        "xã Năm Căn", "xã Tam Giang", "xã Cái Đôi Vàm", "xã Nguyễn Việt Khái", "xã Phú Tân", "xã Phú Mỹ", "xã Lương Thế Trân", "xã Tân Hưng",
        "xã Hưng Mỹ", "xã Cái Nước", "xã Phong Thạnh", "xã Hồng Dân", "xã Vĩnh Lộc", "xã Ninh Thạnh Lợi", "xã Ninh Quới", "xã Gành Hào",
        "xã Định Thành", "xã An Trạch", "xã Long Điền", "xã Đông Hải", "xã Hoà Bình", "xã Vĩnh Mỹ", "xã Vĩnh Hậu", "xã Phước Long",
        "xã Vĩnh Phước", "xã Phong Hiệp", "xã Vĩnh Thanh", "xã Vĩnh Lợi", "xã Hưng Hội", "xã Châu Thới", "xã Hồ Thị Kỷ"
    ]
};

// ... (Rest of LOCATION_DATA setup)
export const LOCATION_DATA: Record<string, Record<string, string[]>> = {};
// @ts-ignore
if (typeof RAW_COMMUNE_DATA !== 'undefined') {
    Object.keys(RAW_COMMUNE_DATA).forEach(province => {
        LOCATION_DATA[province] = {};
        RAW_COMMUNE_DATA[province].forEach(commune => {
            LOCATION_DATA[province][commune] = []; 
        });
    });
}

export const PROVINCES_VN = Object.keys(LOCATION_DATA);

// Helper to extract list for filters
export const GET_ALL_COMMUNES = () => {
    const communes: string[] = [];
    Object.values(LOCATION_DATA).forEach(communeList => {
        Object.keys(communeList).forEach(communeName => communes.push(communeName));
    });
    return communes;
};

export const EDUCATIONS = [
    "Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5", "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", 
    "Lớp 10", "Lớp 11", "Đang học lớp 11", "Lớp 12", "Đang học lớp 12",
    "Trung cấp", "Cao đẳng", "Đang học CĐ", "Đại học", "Đang học ĐH", "Trên ĐH"
];

export const LOW_EDUCATION_GRADES = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5", "Lớp 6"];

export const ETHNICITIES = [
    "Kinh", "Tày", "Thái", "Mường", "Khmer", "Hoa", "Nùng", "H'Mông", "Dao", "Gia Rai", 
    "Ê Đê", "Ba Na", "Xơ Đăng", "Sán Chay", "Cơ Ho", "Chăm", "Sán Dìu", "Hrê", "Ra Glai", 
    "Mnông", "Thổ", "Stiêng", "Khơ Mú", "Bru - Vân Kiều", "Cơ Tu", "Giáy", "Tà Ôi", "Mạ", 
    "Giẻ-Triêng", "Co", "Chơ Ro", "Xinh Mun", "Hà Nhì", "Chu Ru", "Lào", "Kháng", "La Chí", 
    "Phù Lá", "La Hủ", "La Ha", "Pà Thẻn", "Chứt", "Lự", "Lô Lô", "Mảng", "Cờ Lao", "Bố Y", 
    "Cống", "Ngái", "Si La", "Pu Péo", "Brâu", "Rơ Mâm", "O Đu"
];

export const RELIGIONS = [
    "Không", "Phật giáo", "Công giáo", "Tin lành", "Cao Đài", "Phật giáo Hòa Hảo", "Hồi giáo", 
    "Bà La Môn", "Tứ Ân Hiếu Nghĩa", "Bửu Sơn Kỳ Hương", "Minh Sư Đạo", "Minh Lý Đạo"
];

export const MARITAL_STATUSES = ["Độc thân", "Đã kết hôn", "Ly hôn"];
export const FAMILY_JOBS = ["Làm nông", "Công nhân", "CNVC/Viên chức", "Buôn bán/Kinh doanh", "Tự do", "Hưu trí", "Đã mất", "Khác"];

// 8 Lý do Tạm hoãn theo quy định mới
export const LEGAL_DEFERMENT_REASONS = [
    "1. Chưa đủ sức khỏe phục vụ tại ngũ theo kết luận của Hội đồng khám sức khỏe",
    "2. Là lao động duy nhất phải trực tiếp nuôi dưỡng thân nhân không còn khả năng lao động hoặc chưa đến tuổi lao động; trong gia đình bị thiệt hại nặng về người và tài sản do tai nạn, thiên tai, dịch bệnh nguy hiểm gây ra được Ủy ban nhân dân cấp xã xác nhận",
    "3. Một con của bệnh binh, người nhiễm chất độc da cam suy giảm khả năng lao động từ 61% đến 80%",
    "4. Có anh, chị hoặc em ruột là hạ sĩ quan, binh sĩ đang phục vụ tại ngũ; hạ sĩ quan, chiến sĩ thực hiện nghĩa vụ tham gia Công an nhân dân",
    "5. Người thuộc diện di dân, giãn dân trong 03 năm đầu đến các xã đặc biệt khó khăn theo dự án phát triển kinh tế - xã hội của Nhà nước do Ủy ban nhân dân cấp tỉnh trở lên quyết định",
    "6. Cán bộ, công chức, viên chức, thanh niên xung phong được điều động đến công tác, làm việc ở vùng có điều kiện kinh tế - xã hội đặc biệt khó khăn theo quy định của pháp luật",
    "7. Đang học tại cơ sở giáo dục phổ thông; đang được đào tạo trình độ đại học hệ chính quy thuộc cơ sở giáo dục đại học, trình độ cao đẳng hệ chính quy thuộc cơ sở giáo dục nghề nghiệp trong thời gian một khóa đào tạo của một trình độ đào tạo",
    "8. Đang là dân quân thường trực (theo Điều 49 Luật DQTV 2019)"
];

// Danh sách các lý do được coi là "Chính sách" (2,3,4,5,6)
export const POLICY_DEFERMENT_REASONS = [
    LEGAL_DEFERMENT_REASONS[1],
    LEGAL_DEFERMENT_REASONS[2],
    LEGAL_DEFERMENT_REASONS[3],
    LEGAL_DEFERMENT_REASONS[4],
    LEGAL_DEFERMENT_REASONS[5]
];

export const LEGAL_EXEMPTION_REASONS = [
    "Con của liệt sĩ, con của thương binh hạng một",
    "Một anh hoặc một em trai của liệt sĩ",
    "Một con của thương binh hạng hai; một con của bệnh binh suy giảm khả năng lao động từ 81% trở lên; một con của người nhiễm chất độc da cam suy giảm khả năng lao động từ 81 % trở lên",
    "Người làm công tác cơ yếu không phải là quân nhân, Công an nhân dân",
    "Cán bộ, công chức, viên chức, thanh niên xung phong được điều động đến công tác, làm việc ở vùng có điều kiện kinh tế - xã hội đặc biệt khó khăn theo quy định của pháp luật từ 24 tháng trở lên"
];

// Mới: Danh sách lý do Không được đăng ký NVQS
export const NOT_ALLOWED_REGISTRATION_REASONS = [
    "Đang bị truy cứu trách nhiệm hình sự",
    "Đang chấp hành hình phạt tù",
    "Đang bị áp dụng biện pháp cải tạo không giam giữ, quản chế",
    "Đã chấp hành xong hình phạt tù nhưng chưa được xóa án tích",
    "Đang bị áp dụng biện pháp giáo dục tại xã, phường, thị trấn",
    "Được đưa vào trường giáo dưỡng, cơ sở giáo dục bắt buộc, cơ sở cai nghiện bắt buộc",
    "Bị tước quyền phục vụ trong lực lượng vũ trang nhân dân"
];

// Mới: Danh sách lý do Miễn đăng ký NVQS
export const EXEMPT_REGISTRATION_REASONS = [
    "Tâm thần",
    "Động kinh",
    "Bệnh Parkinson",
    "Mù một mắt",
    "Điếc",
    "Di chứng do lao xương khớp",
    "Di chứng do phong",
    "Các bệnh lý ác tính (U ác, bệnh máu ác tính)",
    "Người nhiễm HIV",
    "Người khuyết tật mức độ đặc biệt nặng và nặng"
];

export const INITIAL_RECRUITS: any[] = [];

export const MOCK_USERS: User[] = [
    {
        username: 'ADMIN',
        fullName: 'Ban CHQS Huyện (Admin)',
        password: '1',
        role: 'ADMIN',
        unit: { province: '', commune: '' },
        isApproved: true
    },
    {
        username: 'THUNGHIEM',
        fullName: 'Ban CHQS Phường Thử Nghiệm',
        password: '1235',
        role: 'EDITOR',
        personalName: 'Tài khoản dùng thử',
        position: 'Cán bộ',
        phoneNumber: '0000000000',
        unit: { province: 'Tỉnh THUNGHIEM', commune: 'Phường THUNGHIEM' }, // Updated for Test Account
        isApproved: true
    }
];
