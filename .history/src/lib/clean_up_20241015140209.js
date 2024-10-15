import Database from 'better-sqlite3';
import path from 'path';

// สร้างเส้นทางไปยังฐานข้อมูล
const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
const db = new Database(dbPath);

// ฟังก์ชันลบการจองที่หมดอายุ
export function deleteExpiredReservations() {
  // เปิดใช้งาน Foreign Keys
  db.exec('PRAGMA foreign_keys = ON;'); 

  // เวลาปัจจุบัน
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // 5 นาทีที่แล้ว

  // แปลงเวลาเป็นรูปแบบ 'YYYY-MM-DD HH:MM:SS'
  const formattedNow = now.toISOString().replace('T', ' ').slice(0, 19);
  const formattedFiveMinutesAgo = fiveMinutesAgo.toISOString().replace('T', ' ').slice(0, 19);

  // Log เวลาทั้งสองออกมา
  console.log('Current Time:', formattedNow);
  console.log('Time 5 Minutes Ago:', formattedFiveMinutesAgo);

  try {
    // ดึงการจองที่หมดอายุ
    const expiredReservations = db.prepare(`
      SELECT payment_id, reserved_seat_id 
      FROM reservations 
      WHERE reserve_status = 'wait' 
      AND booking_datetime <= ?
    `).all(formattedFiveMinutesAgo);

    console.log('Expired Reservations:', expiredReservations);

    // เตรียมคำสั่ง SQL สำหรับลบ
    const deletePaymentStmt = db.prepare(`
      DELETE FROM PAYMENT WHERE payment_id = ?
    `);

    const deleteReservationStmt = db.prepare(`
      DELETE FROM reservations WHERE reserved_seat_id = ?
    `);

    // ใช้ transaction เพื่อให้การลบปลอดภัย
    db.transaction(() => {
      for (const reservation of expiredReservations) {
        deletePaymentStmt.run(reservation.payment_id); // ลบจาก PAYMENT
        deleteReservationStmt.run(reservation.reserved_seat_id); // ลบจาก RESERVATIONS
      }
    })();

    console.log('Deleted expired reservations and related payments successfully.');
  } catch (error) {
    console.error('Error deleting expired reservations:', error);
  }
}
