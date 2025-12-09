import initializeConnection, { getConnectionPool } from "@/database/dbconfig.js"

type PendingPayment = {
  bookingId: string;
  amount: number;
  reference: string;
}


export const fetchBooking = async (bookingId: string) => {
  try {
    const database = getConnectionPool()
    const query = /*sql*/ `
      SELECT b.booking_id,
       u.email AS customer_email,
             b.payment_amount AS total_price,
             b.booking_status AS status
      FROM crs.bookings b
      JOIN crs.users u ON b.user_id = u.user_id
      WHERE b.booking_id = @bookingId
    `
    const result = await database.request().input("bookingId", bookingId).query(query);
    console.log(result)
    return result.recordset[0];
  } catch (error) {
    console.log(error)
  }
}

export const markConfirmedBooking = async (reference: string) => {
  try {
    const database = getConnectionPool();
    const query = /*sql*/ `
      UPDATE crs.bookings
      SET booking_status = 'Confirmed'
      WHERE booking_id = (
        SELECT booking_id FROM crs.payments WHERE transaction_id = @reference
      )
    `
    const result = database.request().input("reference", reference).query(query);
    console.log(result);

  } catch (error) {
    console.log(error)
  }
}

export const createPendingPayment = async ({ bookingId, amount, reference }: PendingPayment) => {
  console.log("Initiated payment in Model")
  try {
    const database = getConnectionPool();
    const query = /*sql*/ `
      INSERT INTO crs.payments (booking_id, amount, payment_status, transaction_id)
      VALUES (@bookingId, @amount, 'Pending', @reference)
    `
    const result = await database
      .request()
      .input("bookingId", bookingId)
      .input("amount", amount)
      .input("reference", reference)
      .query(query);

    console.log("createPendingPayment-Model:", result);

  } catch (error) {
    console.log(error);
  }
}

export const markSuccessfulPayment = async (reference: string, method: string) => {
  try {
    const database = getConnectionPool();
    const query = /*sql*/ `
      UPDATE crs.payments
        SET payment_status = 'Success',
        payment_method = @method
        updated_at = GETDATE()
      WHERE transaction_id = @reference
    `
    const result = await database
      .request()
      .input("reference", reference)
      .input("method", method)
      .query(query);

    console.log(result)
  } catch (error) {
    console.log(error)
  }
}

