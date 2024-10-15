// src/hooks.server.js
import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/constants';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const session = event.cookies.get(SESSION_COOKIE_NAME);
  
  if (event.url.pathname.startsWith('/staff')) {
    if (!session) {
      throw redirect(303, '/login');
    }
    
    const sessionData = JSON.parse(session);
    if (sessionData.type !== 'staff') {
      throw redirect(303, '/'); // หรือหน้าที่เหมาะสม
    }
    
    if (sessionData.role === 'check') {
      throw redirect(303, '/check');
    }
  }

  return resolve(event);
}
