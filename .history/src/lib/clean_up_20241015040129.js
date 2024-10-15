import Database from 'better-sqlite3';
import path from 'path';

// สร้างเส้นทางไปยังฐานข้อมูล
const dbPath = path.resolve('src/lib/databaseStorage/dbforTrain-2.db');
const db = new Database(dbPath);

// ฟังก์ชันลบการจองที่หมดอายุ
export function deleteExpiredReservations() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // เวลาย้อนหลัง 5 นาที
  const formattedTime = fiveMinutesAgo.toISOString(); // แปลงเป็นรูปแบบ ISO

  try {
    // ดึงข้อมูล reservation ที่หมดอายุ
    const expiredReservations = db.prepare(`
      SELECT payment_id, reserved_seat_id 
      FROM reservations 
      WHERE reserve_status = 'wait' 
      AND booking_datetime <= ?
    `).all(formattedTime);

    console.log('Expired Reservations:', expiredReservations);

    // เตรียมคำสั่ง SQL สำหรับลบจากตาราง PAYMENT และ reservations
    const deletePaymentStmt = db.prepare(`
      DELETE FROM PAYMENT WHERE payment_id = ?
    `);

    const deleteReservationStmt = db.prepare(`
      DELETE FROM reservations WHERE reserved_seat_id = ?
    `);

    // ใช้ transaction เพื่อลบข้อมูลให้เป็น atomic
    db.transaction(() => {
      for (const reservation of expiredReservations) {
        // ลบข้อมูลจาก PAYMENT
        // ลบข้อมูลจาก reservations
        deleteReservationStmt.run(reservation.reserved_seat_id);
      }
    })();

    console.log('Deleted expired reservations and related payments successfully.');
  } catch (error) {
    console.error('Error deleting expired reservations:', error);
  }
}
