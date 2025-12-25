
export const LEGAL_DEFERMENT_REASONS = [
    "1. Chưa đủ sức khỏe phục vụ tại ngũ theo kết luận của Hội đồng khám sức khỏe",
    "2. Là lao động duy nhất phải trực tiếp nuôi dưỡng thân nhân không còn khả năng lao động hoặc chưa đến tuổi lao động; trong gia đình bị thiệt hại nặng về người và tài sản do tai nạn, thiên tai, dịch bệnh nguy hiểm gây ra được Ủy ban nhân dân cấp xã xác nhận",
    "3. Một con của bệnh binh, người nhiễm chất độc da cam suy giảm khả năng lao động từ 61% đến 80%",
    "4. Có anh, chị hoặc em ruột là hạ sĩ quan, binh sĩ đang phục vụ tại ngũ; hạ sĩ quan, chiến sĩ thực hiện nghĩa vụ tham gia Công an nhân dân",
    "5. Người thuộc diện di dân, giãn dân trong 03 năm đầu đến các xã đặc biệt khó khăn theo dự án phát triển kinh tế - xã hội của Nhà nước do Ủy ban nhân dân cấp tỉnh trở lên quyết định",
    "6. Cán bộ, công chức, viên chức, thanh niên xung phong được điều động đến công tác, làm việc ở vùng có điều kiện kinh tế - xã hội đặc biệt khó khăn theo quy định của pháp luật",
    "7. Đang học tại cơ sở giáo dục phổ thông; đang được đào tạo trình độ đại học hệ chính quy thuộc cơ sở giáo dục đại học, trình độ cao đẳng hệ chính quy thuộc cơ sở giáo dục nghề nghiệp trong thời gian một khóa đào tạo của một trình độ đào tạo",
    "8. Đang là DQTT theo điều 49 luật DQTV năm 2019",
    "9. Trình độ học vấn thấp (dưới lớp 8)"
];

export const LEGAL_EXEMPTION_REASONS = [
    "1. Con của liệt sĩ, con của thương binh hạng một",
    "2. Một anh hoặc một em trai của liệt sĩ",
    "3. Một con của thương binh hạng hai; một con của bệnh binh suy giảm khả năng lao động từ 81% trở lên; một con của người nhiễm chất độc da cam suy giảm khả năng lao động từ 81 % trở lên",
    "4. Người làm công tác cơ yếu không phải là quân nhân, Công an nhân dân",
    "5. Cán bộ, công chức, viên chức, thanh niên xung phong được điều động đến công tác, làm việc ở vùng có điều kiện kinh tế - xã hội đặc biệt khó khăn theo quy định của pháp luật từ 24 tháng trở lên"
];

export const NOT_ALLOWED_REGISTRATION_REASONS = [
    "Đang bị truy cứu trách nhiệm hình sự; đang chấp hành hình phạt tù, cải tạo không giam giữ, quản chế hoặc đã chấp hành xong hình phạt tù nhưng chưa được xóa án tích;",
    "Đang bị áp dụng biện pháp giáo dục tại xã, phường, thị trấn (sau đây gọi chung là cấp xã) hoặc đưa vào trường giáo dưỡng, cơ sở giáo dục bắt buộc, cơ sở cai nghiện bắt buộc;",
    "Bị tước quyền phục vụ trong lực lượng vũ trang nhân dân."
];

export const EXEMPT_REGISTRATION_REASONS = [
    "Người khuyết tật;",
    "Người mắc bệnh hiểm nghèo;",
    "Bệnh tâm thần;",
    "Bệnh mãn tính theo quy định của pháp luật."
];

// LÝ DO CHI TIẾT CHO DANH SÁCH 5 (KTC, CGNN)
export const TT50_REASONS = [
  // 1-13 -> KHÔNG TUYỂN CHỌN (5.1)
  "1. Theo Khoản 1, Điều 5: Đang bị khởi tố, điều tra, truy tố, xét xử theo quy định của Bộ luật Tố tụng hình sự; phạm tội xâm phạm an ninh quốc gia; bị tòa án tuyên phạt từ cải tạo không giam giữ trở lên về tội danh khác nhưng chưa được xóa án tích.",
  "2. Theo Khoản 2, Điều 5: Bị tước quyền phục vụ trong LLVT nhân dân.",
  "3. Theo Khoản 3, Điều 5: Đang bị áp dụng biện pháp giáo dục tại xã, phường, đặc khu hoặc đưa vào trường giáo dưỡng, cơ sở giáo dục bắt buộc, cơ sở cai nghiện bắt buộc.",
  "4. Theo Khoảng 4, Điều 5: Tổ chức hoặc tham gia các đảng phái, tổ chức chính trị phản động, các hội nhóm hoạt động trái pháp luật, chủ mưu, cầm đầu hoặc tham gia tích cực các cuộc mít tinh biểu tình trái pháp luật, gây rối ANCT, TTATXH.",
  "5. Theo Khoảng 5, Điều 5: Lợi dụng tự do dân chủ, nhân quyền, vấn đề sắc tộc, dân tộc, tôn giáo, tín ngưỡng để hoạt động gây nguy hại đến an ninh chính trị, TTATXH.",
  "6. Theo Khoảng 6, Điều 5: Quan hệ với tổ chức, cá nhân nước ngoài trái với quy định của Nhà nước; xuất cảnh trái phép; trong thời gian sinh sống ở nước ngoài có vi phạm pháp luật sở tại.",
  "7. Theo Khoảng 7, Điều 5: Sử dụng trái phép chất ma túy.",
  "8. Theo Khoảng 8, Điều 5: Hành nghê mê tín, dị đoan.",
  "9. Theo Khoảng 9, Điều 5: Trên cơ thể có hình xăm, chữ xăm có nội dung chống đối chế độ, chia rẽ dân tộc, mang tính kinh dị, kỳ quái, kích động tình dục, bạo lực. Hình xăm, chữ xăm gây phản cảm ở những vị trí lộ diện như: mặt, đầu, cổ; từ ½ cánh tay trên trở xuống, từ 1/3 dưới đùi trở xuống. Hình xăm, chữ xăm chiếm diện tích từ ½ lưng, ngực, bụng trở lên.",
  "10. Theo Khoảng 10, Điều 5: Có hành vi lưu manh, côn đồ, lừa đảo, dâm ô, trộm cắp, tham gia các tệ nạn xã hội, gây rối trật tự công cộng chưa đến mức truy cứu trách nhiệm hình sự, đã được giáo dục, xử lý hành chính nhưng vẫn tái phạm.",
  "11. Theo Khoảng 11, Điều 5: Khai sai sự thật, che giấu lý lịch để được tuyển chọn vào phục vụ trong quân đội.",
  "12. Theo Khoảng 12.a, Điều 5: Có cha đẻ, mẹ đẻ, người trực tiếp nuôi dưỡng bản thân, vợ hoặc chồng, con đẻ, con nuôi theo quy định của pháp luật đã hoặc đang có hoạt động chống Đảng Cộng Sản Việt Nam, Nhà nước CHXHCN Việt Nam.",
  "13. Theo Khoảng 12.b, Điều 5: Có cha đẻ, mẹ đẻ, người trực tiiếp nuôi dưỡng bản thân, vợ hoặc chồng, con đẻ, con nuôi theo quy định của pháp luật đang bị khởi tố, điều tra, truy tố, xét xử và thi hành án về các tội xâm phạm an ninh quốc gia.",
  // 14-17 -> CHƯA GỌI NHẬP NGŨ (5.2)
  "14. Theo Khoảng 1, Điều 6: Lý lịch chưa rõ ràng, trừ trường hợp có yếu tố không xác định được do là con ngoài giá thú.",
  "15. Theo Khoảng 2, Điều 6: Quan hệ xã hội phức tạp nhưng chưa được xác minh, kết luận của cấp có thẩm quyền.",
  "16. Theo Khoảng 3, Điều 6: Đã có quyết dịnh của cấp có thẩm quyền hoặc đang làm thủ tục xin xuất cảnh đoàn tụ với gia định, định cư ở nước ngoài.",
  "17. Theo Khoảng 4, Điều 6: Có thông tin, tài liệu phản ánh về vấn đề phức tạp trong thời gian ở nước ngoài nhưng chưa xác minh, kết luận rõ ràng."
];
