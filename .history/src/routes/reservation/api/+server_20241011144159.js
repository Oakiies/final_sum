// src/routes/reservation/api/+server.js
import { json } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
const db = new Database(dbPath);

addTrip: async ({ request }) => {
    const dbPath = path.resolve('src/database/dbforTrain.db');
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