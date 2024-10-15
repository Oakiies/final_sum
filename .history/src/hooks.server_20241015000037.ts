import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // ดึง session จาก cookies
  const sessionCookie = event.cookies.get(SESSION_COOKIE_NAME);
  let userSession;
  console.log("yeahhh", sessionCookie)
  console.log("yeahhh", sessionCookie.role)

  try {
    userSession = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    userSession = null;
  }

  // ตรวจสอบการเข้าถึง /staff
  if (event.url.pathname.startsWith('/staff')) {
    if (!userSession) {
      // ถ้าไม่มี session ให้ redirect ไปยัง /auth/login
      throw redirect(303, '/auth/login');
    }

    if (userSession.type !== 'staff') {
      // ถ้าไม่ใช่ staff ให้ redirect ไปหน้าแรก
      throw redirect(303, '/');
    }

    // ถ้า role เป็น 'manage' ให้ redirect ไปยัง /staff/manage
    if (userSession.role === 'manage' && event.url.pathname !== '/staff/manage') {
      throw redirect(303, '/staff/manage');
    }

    // ถ้า role เป็น 'check' ให้ redirect ไปยัง /staff/check
    if (userSession.role === 'check' && event.url.pathname !== '/staff/check') {
      throw redirect(303, '/staff/check');
    }
  }

  // เพิ่ม session ใน event.locals เพื่อให้ใช้ในส่วนอื่นของแอพ
  event.locals.session = userSession;

  // อนุญาตให้เข้าถึงหน้าอื่นตามปกติ
  return await resolve(event);
};
