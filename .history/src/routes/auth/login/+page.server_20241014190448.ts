import { DASHBOARD_ROUTE, SESSION_COOKIE_NAME } from '$lib/constants';
import { database } from '$lib/database/database.server';
import { usersTable } from '$lib/database/schema';
import type { AlertMessageType } from '$lib/types';
import { UserLoginZodSchema } from '$validations/UserLoginZodSchema';
import { redirect } from '@sveltejs/kit';
import { eq, or } from 'drizzle-orm';
import { message, setError, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const session = cookies.get(SESSION_COOKIE_NAME);

	if (session) {
		throw redirect(307, DASHBOARD_ROUTE);
	}

	return {
		userLoginFormData: await superValidate(UserLoginZodSchema)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const userLoginFormData = await superValidate<typeof UserLoginZodSchema, AlertMessageType>(
			request,
			UserLoginZodSchema
		);

		if (userLoginFormData.valid === false) {
			return message(userLoginFormData, {
				alertType: 'error',
				alertText: 'There was a problem with your submission.'
			});
		}

		// ค้นหาผู้ใช้จาก email หรือ username
		const [user] = await database
			.select({
				passenger_id: usersTable.passenger_id,
				password: usersTable.password
			})
			.from(usersTable)
			.where(
				or(
					eq(usersTable.email, userLoginFormData.data.email),
					eq(usersTable.username, userLoginFormData.data.email) // รองรับ username
				)
			);

		if (user === undefined) {
			return setError(userLoginFormData, 'email', 'Email หรือ Username ไม่ถูกต้อง');
		}

		if (user.password !== userLoginFormData.data.password) {
			return setError(userLoginFormData, 'password', 'รหัสผ่านไม่ถูกต้อง');
		}

		// สร้าง session cookie
		cookies.set(SESSION_COOKIE_NAME, user.passenger_id, {
			path: '/'
		});

		throw redirect(307, DASHBOARD_ROUTE);
	}
};
