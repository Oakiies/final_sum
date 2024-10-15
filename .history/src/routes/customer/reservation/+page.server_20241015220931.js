export const load = async ({ cookies, locals, url }) => {
  const sessionCookie = cookies.get(SESSION_COOKIE_NAME);

  // แปลง cookie เป็น Object (ถ้าแปลงไม่สำเร็จให้คืนค่า null)
  const userSession = sessionCookie ? JSON.parse(sessionCookie) : null;

  console.log('Raw Session Cookie:', sessionCookie); // Debug

  // ตรวจสอบว่ามี session และมี id ใน session หรือไม่
  if (!userSession || !userSession.id) {
    locals.session = locals.session || {};
    locals.session.redirectTo = '/reservation' + url.search;
    throw redirect(302, route('/auth/login'));
  }

  const userId = userSession.id; // ดึง id จาก session

  // รับ trip data จาก session หรือ query params
  const tripData = locals.session?.trip || Object.fromEntries(url.searchParams);

  // ถ้าไม่มี trip data ให้ redirect ไปหน้า /search
  if (!tripData || Object.keys(tripData).length === 0) {
    throw redirect(302, '/search');
  }

  // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
  const { query: userQuery, params: userParams } = get_personinfo(userId);
  const userStmt = db.prepare(userQuery);
  const userInfo = userStmt.get(...userParams) || {};

  // นับจำนวนที่นั่งว่าง
  const { query: seatQuery, params: seatParams } = count_seat(tripData.tripId);
  const seatStmt = db.prepare(seatQuery);
  const availableSeats = seatStmt.all(...seatParams) || [];

  // ดึงข้อมูลค่าโดยสาร
  const { query: fareQuery, params: fareParams } = getFareInfo(tripData.tripId);
  const fareStmt = db.prepare(fareQuery);
  const fareInfo = fareStmt.all(...fareParams) || [];

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

  return {
    loggedOnUserName: await getUserName(userId),
    tripData: tripData,
    userInfo: userInfo,
    availableSeats: seatInfo
  };
};
