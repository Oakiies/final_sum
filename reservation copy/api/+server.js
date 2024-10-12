import { json } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
const db = new Database(dbPath);

export const POST = async ({ request }) => {
    const formData = await request.json();
    const { userId, tripId, seatType, quantity, totalPrice, fromStationId, toStationId } = formData;

    try {
        // Start a transaction
        db.prepare('BEGIN').run();

        // Insert into SEAT table
        const seatInsert = db.prepare(`
            INSERT INTO SEAT (seat_id, coach_id, train_id, seat_type)
            VALUES (?, ?, ?, ?)
        `);

        // Insert into PAYMENT table
        const paymentInsert = db.prepare(`
            INSERT INTO PAYMENT (payment_id, amount, payment_datetime, payment_method)
            VALUES (?, ?, ?, ?)
        `);

        // Insert into RESERVATIONS table
        const reservationInsert = db.prepare(`
            INSERT INTO RESERVATIONS (
                reserved_seat_id, passenger_id, reserve_trip_id,
                from_station_id, to_station_id, booking_datetime,
                reserve_status, payment_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Use specific values as provided in the example
        const seatId = 'S094';
        const paymentId = 10096;
        const bookingDatetime = '2024-07-19 17:45:00';

        // Execute the inserts
        seatInsert.run(seatId, 'C001', 'T001', 'seat1_1upBed');
        paymentInsert.run(paymentId, totalPrice, null, null);
        reservationInsert.run(
            'S094', // Note: This is different from seatId used in SEAT table
            userId,
            'tp_ne_001',
            'st_ne_06',
            'st_ne_01',
            bookingDatetime,
            'wait', // Changed from 'wait' to 'ready' as per your example
            10096 // ห้ามซ้ำ
        );

        // Commit the transaction
        db.prepare('COMMIT').run();

        return json({ success: true, paymentId: paymentId });
    } catch (error) {
        // Rollback the transaction in case of error
        db.prepare('ROLLBACK').run();
        console.error('Error adding new reservation:', error);
        return json({ error: 'Unable to add new reservation', details: error.message }, { status: 500 });
    } finally {
        db.close();
    }
};