import Database from 'better-sqlite3';
import path from 'path';
import { get_personinfo, count_seat, getFareInfo } from '$lib/utils_reserve.js';

export const actions = {
  updateTrip: async ({ request }) => {
    const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
    const db = new Database(dbPath);
    const formData = await request.formData();
    const tripId = formData.get('tripId');
    const start = formData.get('start');
    const end = formData.get('end');
    const fromDatetime = formData.get('fromDatetime');
    const staff = formData.get('staff');

    try {
      db.prepare(`
        UPDATE TRIPS
        SET start_station_id = (SELECT station_id FROM STATIONS WHERE station_name = ?),
            end_station_id = (SELECT station_id FROM STATIONS WHERE station_name = ?),
            from_datetime = ?,
            staff_id = ?
        WHERE trip_id = ?
      `).run(start, end, fromDatetime, staff, tripId);

      return { success: true };
    } catch (error) {
      console.error('Error updating trip:', error);
      return { error: 'Unable to update trip' };
    } finally {
      db.close();
    }
  },

  countAvailableSeats: async ({ request }) => {
    const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
    const db = new Database(dbPath);
    const formData = await request.formData();
    const tripId = formData.get('tripId');

    try {
      // Get the SQL query and parameters from count_seat function
      const { query, params } = count_seat(tripId);

      console.log(`Executing Query: ${query} with Params: ${params}`);

      // Execute the query
      const result = db.prepare(query).all(...params);

      console.log('Available Seats:', result);

      return { success: true, availableSeats: result };
    } catch (error) {
      console.error('Error counting available seats:', error);
      return { error: 'Unable to count available seats' };
    } finally {
      db.close();
    }
  },

  deleteTrip: async ({ request }) => {
    const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
    const db = new Database(dbPath);
    const formData = await request.formData();
    const tripId = formData.get('tripId');

    try {
      db.prepare(`DELETE FROM TRIPS WHERE trip_id = ?`).run(tripId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting trip:', error);
      return { error: 'Unable to delete trip' };
    } finally {
      db.close();
    }
  }
};
