import { DASHBOARD_ROUTE, SESSION_COOKIE_NAME } from '$lib/constants';
import { database } from '$lib/database/database.server';
import { usersTable, staffsTable } from '$lib/database/schema';
import { UserLoginZodSchema } from '$validations/UserLoginZodSchema';
import { redirect, fail } from '@sveltejs/kit';
import { sql, eq, or } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms/server';
import type { Actions } from './$types';
export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const userLoginFormData = await superValidate(request, UserLoginZodSchema);

		if (!userLoginFormData.valid) {
			return fail(400, {
				alertType: 'error',
				alertText: 'มีปัญหากับการส่งข้อมูลของคุณ',
				formData: userLoginFormData.data
			});
		}

		// Query both passengers and staff
		const [user] = await database
			.select({
				id: usersTable.passenger_id,
				firstname: usersTable.firstname,
				password: usersTable.password,
				type: sql`'passenger'`.as('type'),
				role: sql`'user'`.as('role')
			})
			.from(usersTable)
			.where(eq(usersTable.email, userLoginFormData.data.email))
			.union(
				database
					.select({
						id: staffsTable.staff_id,
						firstname: staffsTable.firstname,
						password: staffsTable.password,
						type: sql`'staff'`.as('type'),
						role: staffsTable.role
					})
					.from(staffsTable)
					.where(
						or(
							eq(staffsTable.staff_username, userLoginFormData.data.email),
							eq(staffsTable.phonenumber, userLoginFormData.data.email)
						)
					)
			)
			.all();

		// If user not found or password is incorrect, return an error
		if (!user || user.password !== userLoginFormData.data.password) {
			return fail(400, {
				alertType: 'error',
				alertText: 'ไม่พบข้อมูลผู้ใช้งานดังกล่าวหรือรหัสผ่านไม่ถูกต้อง',
				formData: userLoginFormData.data
			});
		}

		// Set session cookie
		cookies.set(
			SESSION_COOKIE_NAME,
			JSON.stringify({ id: user.id, type: user.type, role: user.role }),
			{
				path: '/',
				httpOnly: true,
				maxAge: 60 * 60 * 24 // 1 day
			}
		);

		// Redirect based on user type and role
		if (user.type === 'staff') {
			switch (user.role) {
				case 'manage':
					throw redirect(307, '/staff/manage');
				case 'check':
					throw redirect(307, '/staff/check');
				case 'sales':
					throw redirect(307, '/staff/search');
				default:
					throw redirect(307, '/');
			}
		}
		throw redirect(307, '/');
	}
};
