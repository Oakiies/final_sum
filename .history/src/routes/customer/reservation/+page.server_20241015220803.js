export const load = async ({ cookies, locals, url }) => {
  try {
    const sessionCookie = cookies.get(SESSION_COOKIE_NAME);
    let userSession;

    console.log('Raw Session Cookie:', sessionCookie); // Debug: ตรวจสอบค่า cookie

    // แปลง cookie เป็น Object
    try {
      userSession = sessionCookie ? JSON.parse(sessionCookie) : null;
    } catch (error) {
      console.error('Failed to parse session cookie:', error);
      userSession = null;
    }

    // ตรวจสอบว่ามี session และมี id ใน session หรือไม่
    if (!userSession || !userSession.id) {
      locals.session = locals.session || {};
      locals.session.redirectTo = '/reservation' + url.search;
      throw redirect(302, route('/auth/login')); // Redirect ไปหน้า login
    }

    const userId = userSession.id; // ดึง id จาก session

    let tripData;
    if (locals.session && locals.session.trip) {
      tripData = locals.session.trip;
    } else {
      tripData = Object.fromEntries(url.searchParams);
    }

    if (!tripData || Object.keys(tripData).length === 0) {
      throw redirect(302, '/login'); // หากไม่มี trip data ให้ redirect ไปหน้า /search
    }

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const { query: userQuery, params: userParams } = get_personinfo(userId);
    const userStmt = db.prepare(userQuery);
    const userInfo = userStmt.get(...userParams);

    // นับจำนวนที่นั่งว่าง
    const { query: seatQuery, params: seatParams } = count_seat(tripData.tripId);
    const seatStmt = db.prepare(seatQuery);
    const availableSeats = seatStmt.all(...seatParams);

    // ดึงข้อมูลค่าโดยสาร
    const { query: fareQuery, params: fareParams } = getFareInfo(tripData.tripId);
    const fareStmt = db.prepare(fareQuery);
    const fareInfo = fareStmt.all(...fareParams);

    // รวมข้อมูลที่นั่งว่างและค่าโดยสาร
    const seatInfo = availableSeats.map(seat => {
      const fare = fareInfo.find(f => f.seat_type === seat.seat_type);
      return {
        ...seat,
        farePerSeat: fare ? fare.fare_per_seat : 0
      };
    });

    console.log('User Info:', userInfo);
    console.log('Trip Data:', tripData);
    console.log('Seat Info:', seatInfo);

    if (!userInfo) {
      console.error('ไม่พบข้อมูลผู้ใช้สำหรับ ID:', userId);
    }

    return {
      loggedOnUserName: await getUserName(userId),
      tripData: tripData,
      userInfo: userInfo || {},
      availableSeats: seatInfo
    };

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
    return {
      error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง'
    };
  }
};
