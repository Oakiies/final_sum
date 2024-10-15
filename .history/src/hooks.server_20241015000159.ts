import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // ดึง session จาก cookies
  const sessionCookie = event.cookies.get(SESSION_COOKIE_NAME);
  let userSession;

  console.log("Raw Session Cookie:", sessionCookie); // Debug cookie ดิบ

  try {
    userSession = sessionCookie ? JSON.parse(sessionCookie) : null;
    console.log("Parsed User Session:", userSession); // Debug session ที่แปลงแล้ว
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    userSession = null;
  }

  if (event.url.pathname.startsWith('/staff')) {
    if (!userSession) {
      throw redirect(303, '/auth/login');
    }

    if (userSession.type !== 'staff') {
      throw redirect(303, '/');
    }

    // ตรวจสอบว่า role มีค่าหรือไม่ ก่อนเข้าถึง
    const role = userSession?.role;

    if (role === 'manage' && event.url.pathname !== '/staff/manage') {
      throw redirect(303, '/staff/manage');
    }

    if (role === 'check' && event.url.pathname !== '/staff/check') {
      throw redirect(303, '/staff/check');
    }
  }

  event.locals.session = userSession;

  // อนุญาตให้เข้าถึงหน้าอื่นตามปกติ
  return await resolve(event);
};
