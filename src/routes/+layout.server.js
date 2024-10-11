import { loadFlash } from 'sveltekit-flash-message/server';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { createBaseMetaTags } from '$lib/utils/metaTags';
import Database from 'better-sqlite3';
import path from 'path';

export const load = loadFlash(async ({ url, cookies }) => {
  const baseMetaTags = createBaseMetaTags(url);

  // ดึง session จาก cookies (ซึ่งควรเก็บ passenger_id ไว้)
  const session = cookies.get(SESSION_COOKIE_NAME);

  const passenger_id = session; 

  const dbPath = path.resolve('/Users/oakky/Documents/star_rail/list/src/dbforTrain.db');
  let result;
  let show_trip;

  try {
    const db = new Database(dbPath);
    result = db
      .prepare(`
        SELECT
          r.reserved_seat_id, reserve_status, r.trip_id, r.passenger_id, r.booking_datetime,
          r.from_station_id, r.to_station_id, r.payment_id,
          s.seat_id, s.seat_type,
          st.price,
          sta_from.station_name AS from_station_name,
          sta_to.station_name AS to_station_name,
          t.from_datetime, t.route
        FROM RESERVATIONS r
        JOIN TRIPS t ON r.trip_id = t.trip_id
        JOIN STATIONS sta_from ON sta_from.station_id = r.from_station_id
        JOIN STATIONS sta_to ON sta_to.station_id = r.to_station_id
        JOIN SEAT s ON s.seat_id = r.reserved_seat_id
        JOIN SEAT_TYPE st ON s.seat_type = st.seat_type
        WHERE r.passenger_id = ?
      `)
      .all(passenger_id);
	
    db.close(); // ปิดการเชื่อมต่อฐานข้อมูล
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }

  return {
    session,  // ส่งข้อมูล session กลับไปเพื่อใช้งานในส่วนอื่น
    baseMetaTags: Object.freeze(baseMetaTags),
    reservations: result // ส่งข้อมูลการจองที่ดึงมา
  };
});
