import * as BookingModel from "./booking.model.js";
import * as VehicleModel from "@/vehicles/vehicle.model.js";
import * as UserModel from "@/user/user.model.js";
import { AppError } from "@/utilities/App.Error.js";
import { camelCaseKey, camelCaseKeys } from "@/utilities/functions.js";

type BookingPayload = {
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  bookingStatus?: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  paymentStatus?: "Pending" | "Paid";
  paymentAmount?: number
};

export const getBookings = async (userId?: string, filters?: { status?: string; vehicleId?: string }) => {
  try {
    const rawData = await BookingModel.listBookings({ userId, ...filters });

    if (!rawData) throw new AppError("No bookings")

    const bookings = camelCaseKeys(rawData)

    return bookings;
  } catch (error) {

  }
}

// Calculate total payment
const calculatePayment = (rentalRate: number, startDate: string, endDate: string) => {
  const days = Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return rentalRate * days;
};

export const createBooking = async (payload: BookingPayload, userAuthId: string) => {
  try {

    const user = await UserModel.findUser(userAuthId);
    if (!user) throw new AppError("User not found", 404);


    const vehicle = await VehicleModel.findVehicle(payload.vehicleId);
    if (!vehicle) throw new AppError("Vehicle not found", 404);


    const available = await BookingModel.checkAvailability(payload.vehicleId, payload.startDate, payload.endDate);
    if (!available) throw new AppError("Vehicle not available for these dates", 400);


    const paymentAmount = calculatePayment(vehicle.rental_rate, payload.startDate, payload.endDate);


    const booking = await BookingModel.createBooking({
      ...payload,
      paymentAmount,
      bookingStatus: payload.bookingStatus ?? "Pending",
      paymentStatus: payload.paymentStatus ?? "Pending"
    });

    return camelCaseKeys(booking);
  } catch (error) {
    console.log(error);
  }

}

type UpdateBody = {
  id: string;
  message: string;
  confirm: boolean
}

enum StateUpdate {
  Approve = "Approved",
  Reject = "Rejected",
}

enum BookingState {
  Pending = "Pending",
}

export const updateBooking = async (data: UpdateBody) => {
  try {
    const { id, message, confirm } = data;

    if (!id || !message || !confirm) {
      throw new AppError("Invalid data", 400, "INVALID", false);
    }
    const bookingId = id;

    const response = await BookingModel.findBooking(bookingId);

    if (!response) {
      throw new AppError("Booking does not exist", 404, "NO_RECORD", false);
    }

    console.log(response)

    if (response.bookingStatus === BookingState.Pending) {
      const response = await BookingModel.approveBooking(id, StateUpdate.Approve);
      return response;
    } else {
      throw new AppError("This status is not in pending state", 400, "NOT_PENDING", false);
    }


  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const cancelBooking = async (bookingId: string) => {
  // return BookingService.updateBooking(bookingId, { bookingStatus: "Cancelled" });
}

