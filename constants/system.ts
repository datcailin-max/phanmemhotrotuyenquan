
import { User } from '../types';

export const INITIAL_RECRUITS: any[] = [];

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
