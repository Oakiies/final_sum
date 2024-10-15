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
  try {
    const sessionCookie = cookies.get(SESSION_COOKIE_NAME);
    let userSession;

    console.log('Raw Session Cookie:', sessionCookie); // Debugging

    // Parse session cookie safely
    try {
      userSession = sessionCookie ? JSON.parse(sessionCookie) : null;
    } catch (error) {
      console.error('Failed to parse session cookie:', error);
      userSession = null;
    }

    // Check if user is logged in, if not redirect to login
    if (!userSession || !userSession.id) {
      locals.session = locals.session || {};
      locals.session.redirectTo = `/reservation${url.search}`; // Save intended page
      throw redirect(302, route('/auth/login'));
    }

    const userId = userSession.id;
    let tripData = locals.session?.trip || Object.fromEntries(url.searchParams);

    // Redirect to search page if no trip data is available
    if (!tripData || Object.keys(tripData).length === 0) {
      throw redirect(302, '/search');
    }

    // Fetch user information
    const { query: userQuery, params: userParams } = get_personinfo(userId);
    const userInfo = db.prepare(userQuery).get(...userParams);

    if (!userInfo) {
      console.error('User not found for ID:', userId);
    }

    // Count available seats
    const { query: seatQuery, params: seatParams } = count_seat(tripData.tripId);
    const availableSeats = db.prepare(seatQuery).all(...seatParams);

    // Get fare information
    const { query: fareQuery, params: fareParams } = getFareInfo(tripData.tripId);
    const fareInfo = db.prepare(fareQuery).all(...fareParams);

    // Combine seat and fare data
    const seatInfo = availableSeats.map(seat => {
      const fare = fareInfo.find(f => f.seat_type === seat.seat_type);
      return { ...seat, farePerSeat: fare ? fare.fare_per_seat : 0 };
    });

    console.log('User Info:', userInfo);
    console.log('Trip Data:', tripData);
    console.log('Seat Info:', seatInfo);

    return {
      loggedOnUserName: await getUserName(userId),
      tripData,
      userInfo: userInfo || {},
      availableSeats: seatInfo,
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง',
    };
  } finally {
    db.close(); // Ensure the database is properly closed
  }
};
