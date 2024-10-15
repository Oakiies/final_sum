import { z } from 'zod';

export const UserLoginZodSchema = z.object({
	identifier: z
    .string()
    .min(1, 'กรุณากรอกอีเมลหรือชื่อผู้ใช้')
    .max(100, 'ข้อมูลเกินขนาดที่กำหนด'),	password: z.string().min(2).max(100)
});
