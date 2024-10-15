// src/routes/your_route/+page.js
import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { getUserName } from '$lib/database/databaseUtils.server';
import { route } from '$lib/ROUTES';
import { get_personinfo, count_seat, getFareInfo } from '$lib/utils_reserve.js';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
const db = new Database(dbPath);

export const load = async ({ cookies, locals, url }) => {
  const sessionCookie = cookies.get(SESSION_COOKIE_NAME);
  
  console.log('Raw Session Cookie:', sessionCookie); // Debug

  // แปลง cookie เป็น Object
  const userSession = sessionCookie ? parseJSON(sessionCookie) : null;

  // ตรวจสอบการล็อกอิน
  if (!userSession || !userSession.id) {
    locals.session = locals.session || {};
    locals.session.redirectTo = '/reservation' + url.search;
    throw redirect(302, route('/auth/login'));
  }

  const userId = userSession.id; // ดึง passenger_id จาก session

  // รับค่าจาก url.searchParams
  const fromStationName = url.searchParams.get('from_station_name') || '';
  const toStationName = url.searchParams.get('to_station_name') || '';
  const routeParam = url.searchParams.get('route') || '';
  const old_seat_id = url.searchParams.get('old_seat_id') || '';

  console.log("ยังมี", old_seat_id); // Debug ข้อมูลจาก searchParams

  const tripData = locals.session?.trip || Object.fromEntries(url.searchParams);

  if (!tripData || Object.keys(tripData).length === 0) {
    throw redirect(302, '/search'); // หากไม่มี trip data ให้ redirect ไป /search
  }

  // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
  const { query: userQuery, params: userParams } = get_personinfo(userId);
  const userInfo = db.prepare(userQuery).get(...userParams) || {};

  // นับจำนวนที่นั่งว่าง
  const { query: seatQuery, params: seatParams } = count_seat(tripData.tripId);
  const availableSeats = db.prepare(seatQuery).all(...seatParams) || [];

  // ดึงข้อมูลค่าโดยสาร
  const { query: fareQuery, params: fareParams } = getFareInfo(tripData.tripId);
  const fareInfo = db.prepare(fareQuery).all(...fareParams) || [];

  // รวมข้อมูลที่นั่งว่างและค่าโดยสาร
  const seatInfo = availableSeats.map(seat => {
    const fare = fareInfo.find(f => f.seat_type === seat.seat_type);
    return {
      ...seat,
      farePerSeat: fare ? fare.fare_per_seat : 0
    };
  });

  console.log("User Info:", userInfo);
  console.log("Trip Data:", tripData);
  console.log("Seat Info:", seatInfo);

  if (Object.keys(userInfo).length === 0) {
    console.error('ไม่พบข้อมูลผู้ใช้สำหรับ ID:', userId);
  }

  return {
    loggedOnUserName: await getUserName(userId),
    tripData: {
      ...tripData,
      fromStationName,
      toStationName,
      routeParam,
      old_seat_id
    },
    userInfo: userInfo,
    availableSeats: seatInfo
  };
};

// ฟังก์ชันสำหรับแปลง JSON และจัดการข้อผิดพลาด
function parseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}
