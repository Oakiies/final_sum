import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // ดึง session จาก cookies
  const sessionCookie = event.cookies.get(SESSION_COOKIE_NAME);
  let userSession;
  console.log("yessss"userSession.role)
  try {
    userSession = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    userSession = null;
  }

  // ตรวจสอบการเข้าถึง /staff
  if (event.url.pathname.startsWith('/staff')) {
    if (!userSession) {
      throw redirect(303, '/auth/login');
    }

    // ตรวจสอบว่าผู้ใช้เป็น staff
    if (userSession.type !== 'staff') {
      throw redirect(303, '/'); // หรือหน้าที่เหมาะสมสำหรับผู้ใช้ที่ไม่ใช่ staff
    }

    // ถ้า role เป็น 'check', พาไปที่ /check
    if (userSession.role === 'check') {
      throw redirect(303, '/check');
    }
    if (userSession.role === 'manage') {
      throw redirect(303, '/manage');
    }
  }

  // เพิ่ม session ใน event.locals เพื่อให้ใช้งานได้ในส่วนอื่นของแอพ
  event.locals.session = userSession;

  // อนุญาตให้เข้าถึงหน้าปกติ
  return await resolve(event);
};