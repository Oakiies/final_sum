import Database from 'better-sqlite3';
import path from 'path';
// สร้างเส้นทางไปยังฐานข้อมูล
const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
const db = new Database(dbPath);
export function deleteExpiredReservations() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const formattedTime = fiveMinutesAgo.toISOString();
    console.log("bef", fiveMinutesAgo, "present", formattedTime);
  
    try {
      // Fetch expired reservations
      const expiredReservations = db.prepare(`
        SELECT payment_id, reserved_seat_id
        FROM RESERVATIONS
        WHERE reserve_status = 'wait'
        AND booking_datetime <= ?
      `).all(formattedTime);
  
      console.log('Expired Reservations:', expiredReservations);
  
      // Prepare statements
      const deleteReservationStmt = db.prepare(`
        DELETE FROM RESERVATIONS WHERE reserved_seat_id = ?
      `);
      const deletePaymentStmt = db.prepare(`
        DELETE FROM PAYMENT WHERE payment_id = ?
      `);
  
      // Delete reservations first
      db.transaction(() => {
        for (const reservation of expiredReservations) {
          deleteReservationStmt.run(reservation.reserved_seat_id);
        }
      })();
  
      // Then delete payments
      db.transaction(() => {
        for (const reservation of expiredReservations) {
          deletePaymentStmt.run(reservation.payment_id);
        }
      })();
  
      console.log('Deleted expired reservations and related payments successfully.');
    } catch (error) {
      console.error('Error deleting expired reservations:', error);
    }
  }