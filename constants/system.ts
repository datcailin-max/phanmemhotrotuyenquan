
import { User } from '../types';

export const INITIAL_RECRUITS: any[] = [];

export const DEFAULT_CATALOG = [
  { id: 'CAT_1', name: '1. Danh sách tuổi 17', sources: ['FIRST_TIME_REG'], only17: true },
  { id: 'CAT_2', name: '2. Danh sách công dân không được ĐK NVQS', sources: ['NOT_ALLOWED_REG'] },
  { id: 'CAT_3', name: '3. Danh sách công dân được miễn ĐK NVQS', sources: ['EXEMPT_REG'] },
  { id: 'CAT_4', name: '4. Danh sách công dân sẵn sàng nhập ngũ', sources: ['ALL'] },
  { id: 'CAT_5', name: '5. Danh sách công dân không tuyển chọn', sources: ['KTC_SUB1'] },
  { id: 'CAT_6', name: '6. Danh sách công dân chưa gọi nhập ngũ', sources: ['KTC_SUB2'] },
  { id: 'CAT_7', name: '7. Danh sách công dân tạm hoãn học văn', sources: ['DEFERRED_EDUCATION'] },
  { id: 'CAT_8', name: '8. Danh sách công dân tạm hoãn sức khỏe', sources: ['DEFERRED_HEALTH'] },
  { id: 'CAT_9', name: '9. Danh sách công dân tạm hoãn chính sách', sources: ['DEFERRED_POLICY'] },
  { id: 'CAT_10', name: '10. Danh sách công dân tạm hoãn DQTT', sources: ['DEFERRED_DQTT'] },
  { id: 'CAT_11', name: '11. Danh sách công dân được miễn gọi NVQS', sources: ['EXEMPTED_LIST'] },
  { id: 'CAT_12', name: '12. Danh sách công dân không đạt sơ tuyển', sources: ['PRE_CHECK_FAIL'] },
  { id: 'CAT_13', name: '13. Danh sách công dân đạt sơ tuyển', sources: ['PRE_CHECK_PASS'] },
  { id: 'CAT_14', name: '14. Danh sách công dân không đạt khám tuyển', sources: ['MED_EXAM_FAIL'] },
  { id: 'CAT_15', name: '15. Danh sách công dân đạt khám tuyển', sources: ['MED_EXAM_PASS'] },
  { id: 'CAT_16', name: '16. Danh sách chốt chính thức', sources: ['FINAL_OFFICIAL'] },
  { id: 'CAT_17', name: '17. Danh sách chốt dự bị', sources: ['FINAL_RESERVE'] },
  { id: 'CAT_18', name: '18. Danh sách gọi công dân nhập ngũ', sources: ['ENLISTED'] },
  { id: 'CAT_19', name: '19. Danh sách công dân đưa ra khỏi nguồn (Chung)', sources: ['REMOVED'] },
  { id: 'CAT_19_1', name: '19.1. Danh sách công dân đang học tại các trường trong quân đội', sources: ['REMOVED_MILITARY_SCHOOL'] },
  { id: 'CAT_19_2', name: '19.2. Danh sách công dân chuyển khẩu', sources: ['REMOVED_TRANSFERRED'] },
  { id: 'CAT_19_3', name: '19.3. Danh sách công dân đưa ra khỏi nguồn lý do khác', sources: ['REMOVED_OTHER'] },
  { id: 'CAT_20', name: '20. Danh sách nguồn còn lại trong năm', sources: ['REMAINING'] },
  { id: 'CAT_21', name: '21. Danh sách nguồn của năm sau', sources: ['NEXT_YEAR_SOURCE'] },
];

export const MOCK_USERS: User[] = [
    {
        username: 'ADMIN',
        fullName: 'Đại úy Thới Hạ Sang',
        personalName: 'Tác giả & Quản trị hệ thống',
        password: '1',
        role: 'ADMIN',
        unit: { province: '', commune: '' },
        isApproved: true,
        isLocked: false
    }
];
