import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get(SESSION_COOKIE_NAME);
  let userSession;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toLocaleString('sv-SE', { timeZone: 'UTC' });

  console.log(fiveMinutesAgo);
  console.log('Raw Session Cookie:', sessionCookie);

  try {
    userSession = sessionCookie ? JSON.parse(sessionCookie) : null;
    console.log('Parsed User Session:', userSession);
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

    // Allow 'manage' role to access specific pages without redirection
    if (
      role === 'manage' &&
      ['/staff/manage', '/staff/addstations', '/staff/addtrips'].includes(event.url.pathname)
    ) {
      return await resolve(event); // Grant access to these paths for 'manage' role
    }

    // Redirect other roles if trying to access non-authorized pages
    if (role === 'manage' && event.url.pathname !== '/staff/manage') {
      throw redirect(303, '/staff/manage');
    }

    if (role === 'sales' && event.url.pathname !== '/staff/sales') {
      throw redirect(303, '/staff/search');
    }

    if (role === 'check' && !event.url.pathname.startsWith('/staff/check')) {
      throw redirect(303, '/staff/check');
    }
  }

  event.locals.session = userSession;

  return await resolve(event);
};
