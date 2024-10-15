import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { route } from '$lib/ROUTES';
import { getUserName } from '$lib/database/databaseUtils.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url }) => {
  // ดึง session จาก cookies
  const sessionCookie = cookies.get(SESSION_COOKIE_NAME);
  console.log("yes", sessionCookie)
  let userSession;

  try {
    userSession = sessionCookie ? JSON.parse(sessionCookie) : null;
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    throw redirect(303, route('/auth/login'));
  }

  // ตรวจสอบว่ามี session หรือไม่
  if (!userSession) {
    throw redirect(303, route('/auth/login'));
  }

  // ตรวจสอบว่าผู้ใช้เป็น staff หรือไม่
  if (userSession.type !== 'staff') {
    throw redirect(303, '/'); // หรือเปลี่ยนเป็นเส้นทางอื่นถ้าไม่ใช่ staff
  }

  // ตรวจสอบ role ของพนักงานและทำการ redirect
  if (userSession.role === 'check') {
    throw redirect(303, '/staff/check');
  }

  if (userSession.role === 'manage') {
    throw redirect(303, '/staff/manage');
  }

  // ดึงชื่อผู้ใช้จากฐานข้อมูล
  const loggedOnUserName = await getUserName(userSession.id);
  console.log("yes", sessionCookie)

  return {
    loggedOnUserName
  };
};
