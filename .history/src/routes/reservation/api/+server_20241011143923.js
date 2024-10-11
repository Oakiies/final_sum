// src/routes/reservation/api/+server.js
import { json } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
const db = new Database(dbPath);

export async function POST({ request }) {
    const bookingData = await request.json();
    
    try {
        // Start a transaction
        db.prepare('BEGIN').run();

        // Verify that the trip exists
        const tripExists = db.prepare('SELECT 1 FROM TRIPS WHERE trip_id = ?').get(bookingData.tripId);
        if (!tripExists) {
            throw new Error('ไม่พบข้อมูลทริปที่ระบุ');
        }

        // Verify that the user exists
        const userExists = db.prepare('SELECT 1 FROM PASSENGERS WHERE passenger_id = ?').get(bookingData.userId);
        if (!userExists) {
            throw new Error('ไม่พบข้อมูลผู้โดยสาร');
        }

        // Verify that the stations exist
        const fromStationExists = db.prepare('SELECT 1 FROM STATIONS WHERE station_id = ?').get(bookingData.fromStationId);
        const toStationExists = db.prepare('SELECT 1 FROM STATIONS WHERE station_id = ?').get(bookingData.toStationId);
        if (!fromStationExists || !toStationExists) {
            throw new Error('ไม่พบข้อมูลสถานีต้นทางหรือปลายทาง');
        }

        // Get the next payment_id
        const lastPaymentIdRow = db.prepare('SELECT MAX(payment_id) as last_id FROM PAYMENT').get();
        const nextPaymentId = (lastPaymentIdRow.last_id || 10000) + 1;

        // Select available seats
        const availableSeatsQuery = db.prepare(`
            SELECT seat_id
            FROM SEAT JOIN TRAINS USING (train_id)
            WHERE seat_id NOT IN (SELECT reserved_seat_id FROM RESERVATIONS)
            AND trip_id = ?
            AND seat_type = ?
            ORDER BY seat_id ASC
            LIMIT ?
        `);

        const availableSeats = availableSeatsQuery.all(
            bookingData.tripId,
            bookingData.seatType,
            bookingData.quantity
        );

        if (availableSeats.length < bookingData.quantity) {
            throw new Error('ไม่มีที่นั่งว่างเพียงพอ');
        }

        // Insert reservations
        const insertReservation = db.prepare(`
            INSERT INTO RESERVATIONS (
                reserved_seat_id, passenger_id, reserve_trip_id,
                from_station_id, to_station_id, booking_datetime,
                reserve_status, payment_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const seat of availableSeats) {
            insertReservation.run(
                seat.seat_id,
                bookingData.userId,
                bookingData.tripId,
                bookingData.fromStationId,
                bookingData.toStationId,
                new Date().toISOString(),
                'wait',
                nextPaymentId
            );
        }

        // Insert payment record
        const insertPayment = db.prepare(`
            INSERT INTO PAYMENT (payment_id, amount, payment_datetime, payment_method)
            VALUES (?, ?, NULL, NULL)
        `);
        insertPayment.run(nextPaymentId, bookingData.totalPrice);

        // Commit the transaction
        db.prepare('COMMIT').run();

        return json({ success: true, message: 'การจองเสร็จสมบูรณ์', paymentId: nextPaymentId });
    } catch (error) {
        // Rollback the transaction in case of error
        db.prepare('ROLLBACK').run();
        console.error('เกิดข้อผิดพลาดในการสร้างการจอง:', error);
        return json({ success: false, message: error.message }, { status: 500 });
    }
}