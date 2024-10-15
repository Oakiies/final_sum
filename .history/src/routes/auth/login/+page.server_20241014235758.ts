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
				type: sql`'passenger'`.as('type'),
				role: sql`'user'`.as('role') // กำหนด role เป็น 'user' สำหรับผู้โดยสาร
			})
			.from(usersTable)
			.where(eq(usersTable.email, userLoginFormData.data.email))
			.union(
				database
					.select({
						id: staffsTable.staff_id,
						password: staffsTable.password,
						type: sql`'staff'`.as('type'),
						role: staffsTable.role // ดึง role จากพนักงาน
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

		if (!user) {
			return setError(userLoginFormData, 'email', 'ไม่พบ Email หรือ Username');
		}

		if (user.password !== userLoginFormData.data.password) {
			return setError(userLoginFormData, 'password', 'รหัสผ่านไม่ถูกต้อง');
		}

		// สร้าง session cookie พร้อมกำหนด role และ type
		cookies.set(
			SESSION_COOKIE_NAME,
			JSON.stringify({ id: user.id, type: user.type, role: user.role }), // บันทึก role ลงใน cookie
			{
				path: '/', // ใช้ได้ทั่วทั้งแอป
				httpOnly: true,
				maxAge: 60 * 60 * 24 // อายุ 1 วัน
			}
		);

		throw redirect(307, DASHBOARD_ROUTE);
	}
};
