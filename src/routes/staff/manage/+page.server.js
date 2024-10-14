import Database from 'better-sqlite3';
import path from 'path';

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

  updateStation: async ({ request }) => {
    const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
    const db = new Database(dbPath);
    const formData = await request.formData();
    const stationId = formData.get('station_id');
    const name = formData.get('station_name');
    const time = formData.get('time_use');
    const status = formData.get('station_status');

    try {
      db.prepare(`
        UPDATE STATIONS
        SET station_id = ?,
            station_name = ?,
            time_use = ?,
            station_status = ?
      `).run(stationId, name, time, status);

      return { success: true };
    } catch (error) {
      console.error('Error updating trip:', error);
      return { error: 'Unable to update trip' };
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
  },

  deleteStation: async ({ request }) => {
    const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
    const db = new Database(dbPath);
    const formData = await request.formData();
    const stationId = formData.get('stationId');

    try {
      db.prepare(`DELETE FROM STATIONS WHERE station_id = ?`).run(stationId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting station:', error);
      return { error: 'Unable to delete station' };
    } finally {
      db.close();
    }
  },
  
  addTrip: async ({ request }) => {
    const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
    const db = new Database(dbPath);
    const formData = await request.formData();
    const tripId = formData.get('tripId');
    const start = formData.get('start');
    const end = formData.get('end');
    const fromDatetime = formData.get('fromDatetime');
    const arrivalTime = formData.get('arrivalTime');
    const classType = formData.get('class');
    const seats = formData.get('seats');
    const staff_id = formData.get('staff_id');

    try {
      db.prepare(`
        INSERT INTO TRIPS (trip_id, start_station_id, end_station_id, from_datetime)
        VALUES (?, 
        (SELECT station_id FROM STATIONS WHERE station_name = ?), 
        (SELECT station_id FROM STATIONS WHERE station_name = ?), 
        ?)
      `).run(tripId, start, end, fromDatetime);

      return { success: true };
    } catch (error) {
      console.error('Error adding new trip:', error);
      return { error: 'Unable to add new trip' };
    } finally {
      db.close();
    }
  },
};
