import { getConnectionPool } from "@/database/dbconfig.js";
import { camelCaseKey } from "@/utilities/functions.js";

export type Booking = {
  bookingId?: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  bookingStatus?: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  paymentStatus?: "Pending" | "Paid";
  paymentAmount?: number;
  createdAt?: string;
  updatedAt?: string;
};

// List bookings, optionally filter by user, vehicle, status
export const listBookings = async ({ userId, vehicleId, status, offset = 0, limit = 20 }: { userId?: string; vehicleId?: string; status?: string; offset?: number; limit?: number }) => {
  try {
    const db = getConnectionPool();
    let query = /*sql*/ `
    SELECT
    b.*,
    u.first_name,
    u.last_name,
    s.manufacturer,
    s.model,
    s.year
  FROM crs.bookings b
  LEFT JOIN crs.users u ON b.user_id = u.user_id
  LEFT JOIN crs.vehicles v ON b.vehicle_id = v.vehicle_id
  LEFT JOIN crs.vehicle_specifications s ON v.spec_id = s.spec_id
  WHERE 1=1
`;
    const request = db.request();

    if (userId) {
      query += " AND b.user_id = @userId";
      request.input("userId", userId);
    }
    if (vehicleId) {
      query += " AND b.vehicle_id = @vehicleId";
      request.input("vehicleId", vehicleId);
    }
    if (status) {
      query += " AND b.booking_status = @status";
      request.input("status", status);
    }

    query += " ORDER BY b.created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";
    request.input("offset", offset).input("limit", limit);

    const res = await request.query(query);
    return res.recordset;
  } catch (error) {
    throw error;
  }
};

// Find a single booking by ID
export const findBooking = async (bookingId: string) => {
  try {
    const db = getConnectionPool();
    const query = /*sql*/ `
    SELECT booking_status, payment_status
    FROM crs.bookings
    WHERE booking_id = @bookingId
  `;
    const rawData = await db.request().input("bookingId", bookingId).query(query);
    const response = camelCaseKey(rawData.recordset[0]);
    return response;
  } catch (error) {
    console.log(error);
  }
};

// Insert a new booking
export const createBooking = async (booking: Booking) => {
  const db = getConnectionPool();
  const query = /*sql*/ `
    INSERT INTO crs.bookings
      (user_id, vehicle_id, start_date, end_date, booking_status, payment_status, payment_amount)
    OUTPUT INSERTED.*
    VALUES (@userId, @vehicleId, @startDate, @endDate, @bookingStatus, @paymentStatus, @paymentAmount)
  `;
  const res = await db.request()
    .input("userId", booking.userId)
    .input("vehicleId", booking.vehicleId)
    .input("startDate", booking.startDate)
    .input("endDate", booking.endDate)
    .input("bookingStatus", booking.bookingStatus ?? "Pending")
    .input("paymentStatus", booking.paymentStatus ?? "Pending")
    .input("paymentAmount", booking.paymentAmount ?? 0)
    .query(query);

  return res.recordset[0];
};

// Update an existing booking
export const updateBooking = async (bookingId: string) => {
  const db = getConnectionPool();
  const keys = Object.keys(payload);
  if (keys.length === 0) return 0;

  const setClauses: string[] = [];
  const request = db.request().input("bookingId", bookingId);

  keys.forEach((k, idx) => {
    const dbCol = k.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
    const param = `p${idx}`;
    setClauses.push(`${dbCol} = @${param}`);
    request.input(param, (payload as any)[k]);
  });

  const setSql = setClauses.join(", ");
  const query = /*sql*/ `
    UPDATE crs.bookings
    SET ${setSql}, updated_at = GETDATE()
    WHERE booking_id = @bookingId
  `;

  const res = await request.query(query);
  return res.rowsAffected[0];
};

type StatusUpdate = {
  id: string;
  payload: string;
}

export const approveBooking = async (id: string, payload: string) => {
  try {
    const database = getConnectionPool();
    const query = /*sql*/ `
      UPDATE crs.bookings
      SET booking_status = @payload
      OUTPUT inserted.*
      WHERE booking_id = @id
    `
    const rawData = await database.request().input("id", id).input("payload", payload).query(query);
    // const response = camelCaseKey(rawData.recordset[0]);
    console.log(rawData.rowsAffected);
  } catch (error) {
    console.log(error)
  }
}



// Check if a vehicle is available between two dates
// export const checkAvailability = async (vehicleId: string, startDate: string, endDate: string) => {
//   const db = getConnectionPool();
//   const query = /*sql*/ `
//     SELECT 1 FROM crs.bookings
//     WHERE vehicle_id = @vehicleId
//       AND booking_status NOT IN ('Cancelled','Completed')
//       AND (start_date <= @endDate AND end_date >= @startDate)
//   `;
//   const res = await db.request()
//     .input("vehicleId", vehicleId)
//     .input("startDate", startDate)
//     .input("endDate", endDate)
//     .query(query);

//   return res.recordset.length === 0;
// };

export const checkAvailability = async (
  vehicleId: string,
  startDate: string,
  endDate: string,
  currentBookingId?: string // optional, only used for updates
) => {
  const db = getConnectionPool();
  let query = /*sql*/ `
    SELECT 1 FROM crs.bookings
    WHERE vehicle_id = @vehicleId
      AND booking_status NOT IN ('Cancelled','Completed')
      AND (start_date <= @endDate AND end_date >= @startDate)
  `;

  const request = db.request()
    .input("vehicleId", vehicleId)
    .input("startDate", startDate)
    .input("endDate", endDate);

  // Exclude the current booking if provided
  if (currentBookingId) {
    query += " AND booking_id != @currentBookingId";
    request.input("currentBookingId", currentBookingId);
  }

  const res = await request.query(query);
  return res.recordset.length === 0;
};

