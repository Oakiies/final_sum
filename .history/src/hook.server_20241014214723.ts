import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // ดึง session จาก cookies
  const sessionCookie = event.cookies.get(SESSION_COOKIE_NAME);
  let userSession;

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

    // ถ้า role เป็น 'check', พาไปที่ /check
    if (userSession.role === 'check') {
      throw redirect(303, '/check');
    }
  }

  // อนุญาตให้เข้าถึงหน้าปกติ
  return await resolve(event);
};
