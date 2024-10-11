import { redirect } from 'sveltekit-flash-message/server';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { getUserName } from '$lib/database/databaseUtils.server';
import { route } from '$lib/ROUTES';

export const load = async ({ cookies }) => {
	const userId = cookies.get(SESSION_COOKIE_NAME);
    //ข้อความเเจ้บงเตือนเวลากดเข้าหน้าที่ต้องล็อคอินก่อน
	if (!userId) {
		// ถ้าไม่ได้ล็อกอิน ให้พาไปที่หน้าล็อกอิน
		throw redirect(
			route('/auth/login'),
			{
				type: 'error',
				message: 'กรุณาเข้าสู่ระบบเพื่อดูหน้านี้'
			},
			cookies
		);
	}
	// ถ้าได้ล็อกอินแล้ว ก็สามารถดึงข้อมูลผู้ใช้ได้
	return {
		loggedOnUserName: await getUserName(userId)
	};
};
