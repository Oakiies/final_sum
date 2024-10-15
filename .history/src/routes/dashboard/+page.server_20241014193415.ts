import type { Actions, PageServerLoad } from './$types';
import { redirect } from 'sveltekit-flash-message/server';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { getUserName } from '$lib/database/databaseUtils.server';
import { route } from '$lib/ROUTES';

export const load = (async ({ cookies }) => {
	// อ่าน session จาก cookie และแปลง JSON เป็น object
	const sessionCookie = cookies.get(SESSION_COOKIE_NAME);
	let userSession;

	try {
		userSession = sessionCookie ? JSON.parse(sessionCookie) : null;
	} catch (error) {
		console.error('Failed to parse session cookie:', error);
		throw redirect(
			route('/auth/login'),
			{
				type: 'error',
				message: 'Invalid session. Please login again.'
			},
			cookies
		);
	}

	if (!userSession || !userSession.id) {
		throw redirect(
			route('/auth/login'),
			{
				type: 'error',
				message: 'You must be logged in to view the dashboard.'
			},
			cookies
		);
	}

	const loggedOnUserName = await getUserName(userSession.id);

	return {
		loggedOnUserName
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete(SESSION_COOKIE_NAME, {
			path: route('/')
		});

		throw redirect(303, route('/auth/login'));
	}
};
