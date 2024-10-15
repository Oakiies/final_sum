import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get(SESSION_COOKIE_NAME);
  let userSession;

  console.log("Raw Session Cookie:", sessionCookie);

  try {
    userSession = sessionCookie ? JSON.parse(sessionCookie) : null;
    console.log("Parsed User Session:", userSession);
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

    const role = userSession?.role;

    // หาก role เป็น 'manage' พาไป /staff/manage
    if (role === 'manage' && event.url.pathname !== '/staff/manage') {
      throw redirect(303, '/staff/manage');
    }

    // หาก role เป็น 'check' พาไป /staff/check
    if (role === 'check' && event.url.pathname !== '/staff/check') {
      throw redirect(303, '/staff/check');
    }
  }

  event.locals.session = userSession;

  return await resolve(event);
};
