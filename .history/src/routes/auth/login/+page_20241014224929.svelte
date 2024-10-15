<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms/client';

	import { UserLoginZodSchema } from '$validations/UserLoginZodSchema';
	import InputField from '$components/form/InputField.svelte';
	import SubmitButton from '$components/form/SubmitButton.svelte';

	import type { PageData } from './$types';

	export let data: PageData;

	const { enhance, form, errors, message } = superForm(data.userLoginFormData, {
		resetForm: true,
		taintedMessage: null,
		validators: UserLoginZodSchema,

		onUpdated: () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'error') {
				toast.error(alertText);
			}
		}
	});
</script>
export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const userLoginFormData = await superValidate<typeof UserLoginZodSchema, AlertMessageType>(
			request,
			UserLoginZodSchema
		);

		if (userLoginFormData.valid === false) {
			return message(userLoginFormData, {
				alertType: 'error',
				alertText: 'มีปัญหากับการส่งข้อมูลของคุณ'
			});
		}

		// ตรวจสอบจากทั้ง PASSENGERS และ STAFFS
		const [user] = await database
			.select({
				id: usersTable.passenger_id,
				password: usersTable.password,
				type: sql`'passenger'`.as('type')  // ใช้ sql สำหรับการแปลงประเภท
			})
			.from(usersTable)
			.where(eq(usersTable.email, userLoginFormData.data.email))
			.union(
				database
					.select({
						id: staffsTable.staff_id,
						password: staffsTable.password,
						type: sql`'staff'`.as('type')  // ใช้ sql สำหรับ staff
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

		if (user === undefined) {
			return setError(userLoginFormData, 'email', 'ไม่พบ Email หรือ Username');
		}

		if (user.password !== userLoginFormData.data.password) {
			return setError(userLoginFormData, 'password', 'รหัสผ่านไม่ถูกต้อง');
		}

		// สร้าง session cookie พร้อมกำหนด role
		cookies.set(SESSION_COOKIE_NAME, JSON.stringify({ id: user.id, type: user.type }), {
			path: '/',
			httpOnly: true,
			maxAge: 60 * 60 * 24 // 1 วัน
		});

		throw redirect(307, DASHBOARD_ROUTE);
	}
};
