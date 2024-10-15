import { DASHBOARD_ROUTE, SESSION_COOKIE_NAME } from '$lib/constants';
import { database } from '$lib/database/database.server';
import { usersTable, staffsTable } from '$lib/database/schema';
import type { AlertMessageType } from '$lib/types';
import { UserLoginZodSchema } from '$validations/UserLoginZodSchema';
import { redirect } from '@sveltejs/kit';
import { sql, eq, or } from 'drizzle-orm';
import { message, setError, superValidate } from 'sveltekit-superforms/server';
import type { Actions } from './$types';
export const actions = {
	default: async ({ request, cookies }) => {
		const userLoginFormData = await superValidate<
			typeof UserLoginZodSchema,
			AlertMessageType
		>(request, UserLoginZodSchema);

		if (!userLoginFormData.valid) {
			return {
				form: userLoginFormData,
				message: {
					alertType: 'error',
					alertText: 'มีปัญหากับการส่งข้อมูลของคุณ',
				}
			};
		}

		// Query both PASSENGERS and STAFFS tables
		const [user] = await database
			.select({
				id: usersTable.passenger_id,
				firstname: usersTable.firstname,
				password: usersTable.password,
				type: sql`'passenger'`.as('type'),
				role: sql`'user'`.as('role'),
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
						role: staffsTable.role,
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

		// Check if the user exists and the password matches
		if (!user || user.password !== userLoginFormData.data.password) {
			return {
				form: userLoginFormData,
				message: {
					alertType: 'error',
					alertText: 'ไม่พบข้อมูลผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',
				}
			};
		}

		// Create session cookie with role and type
		cookies.set(
			SESSION_COOKIE_NAME,
			JSON.stringify({ id: user.id, type: user.type, role: user.role }),
			{
				path: '/',
				httpOnly: true,
				maxAge: 60 * 60 * 24, // 1-day expiration
			}
		);

		return {
			form: userLoginFormData,
			message: {
				alertType: 'success',
				alertText: 'เข้าสู่ระบบสำเร็จ!',
			}
		};
	}
};
