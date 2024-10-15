export function deleteExpiredReservations() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // เวลาย้อนหลัง 5 นาที
    const formattedTime = fiveMinutesAgo.toISOString(); // แปลงเป็นรูปแบบ ISO
  
    console.log('Current Time:', now.toISOString());
    console.log('5 Minutes Ago (for comparison):', formattedTime);
  
    try {
      // Query ดึงข้อมูล reservation ที่หมดอายุ
      console.log('Executing Query: Fetch expired reservations...');
      const expiredReservations = db.prepare(`
        SELECT payment_id, reserved_seat_id, booking_datetime
        FROM reservations 
        WHERE reserve_status = 'wait' 
        AND booking_datetime <= ?
      `).all(formattedTime);
  
      console.log('Expired Reservations Fetched:', expiredReservations);
  
      if (expiredReservations.length === 0) {
        console.log('ไม่มีการจองที่หมดอายุในขณะนี้');
        return; // ไม่มีข้อมูลให้ลบ
      }
  
      // เตรียม SQL สำหรับลบข้อมูลจาก PAYMENT และ reservations
      const deletePaymentStmt = db.prepare(`
        DELETE FROM PAYMENT WHERE payment_id = ?
      `);
      const deleteReservationStmt = db.prepare(`
        DELETE FROM reservations WHERE reserved_seat_id = ?
      `);
  
      console.log('Executing Deletion Process with Transaction...');
  
      // ใช้ transaction เพื่อให้การลบเป็น atomic
      db.transaction(() => {
        for (const reservation of expiredReservations) {
          console.log(`ลบการจอง: Reserved Seat ID: ${reservation.reserved_seat_id}`);
          console.log(`Payment ID ที่จะถูกลบ: ${reservation.payment_id}`);
          console.log(`เวลาจอง: ${reservation.booking_datetime}`);
  
          // ลบข้อมูลจาก reservations ก่อน
          deleteReservationStmt.run(reservation.reserved_seat_id);
          // ลบข้อมูลจาก PAYMENT
          deletePaymentStmt.run(reservation.payment_id);
        }
      })();
  
      console.log('ลบข้อมูลการจองที่หมดอายุและการชำระเงินเรียบร้อยแล้ว');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบการจองที่หมดอายุ:', error);
    }
  }
  