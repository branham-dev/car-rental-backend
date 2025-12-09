import * as PaymentModel from "@/transactions/payment.model.js";
import { AppError } from "@/utilities/App.Error.js";
import dotenv from 'dotenv';
import crypto from "crypto";
dotenv.config()

const PAYMENT_KEY: string | undefined = process.env.PAY_STACK_KEY;

if (PAYMENT_KEY === undefined) {
  throw new AppError("Payment key not configured", 500, "NO_PAYMENT_KEY", true);
}



export const initiatePayment = async (bookingId: string) => {
  console.log("Initiated payment in Service")
  try {
    console.log("Service:", bookingId)
    const booking = await PaymentModel.fetchBooking(bookingId);

    if (!booking) throw new AppError("Booking not found", 404, "NO_BOOKING_IN_DB", false);
    if (booking.status === "Paid") throw new AppError("Booking already paid", 409, "ALREADY_PAID", false);

    const amount = Number(booking.total_price);
    const paystackAmount = amount * 100;

    const reference = `BOOKING_${bookingId}_${Date.now()}`;

    const response = await PaymentModel.createPendingPayment({ bookingId, amount, reference });

    const paymentResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYMENT_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: booking.customer_email,
        amount: paystackAmount,
        reference,
      })
    })

    const data = await paymentResponse.json();
    if (!data.status) throw new AppError(data.message, 409, "PAYSTACK_PAYMENT_FAIL", true);

    return {
      authUrl: data.data.authorization_url,
      reference,
      amount,
    };
  } catch (error) {
    console.log(error);
  }
}

export const verifyWebhook = async (rawBody: string, signature?: string) => {
  try {
    // 1. Check signature
    const hash = crypto
      .createHmac("sha512", PAYMENT_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) throw new AppError("Invalid Paystack signature", 500, "INVALID_PAYMENT_SIGNATURE", true);

    const event = JSON.parse(rawBody);

    if (event.event !== "charge.success") return;

    const tx = event.data;

    const reference = tx.reference;
    const method = tx.channel;

    const paymentResponse = await PaymentModel.markSuccessfulPayment(reference, method);

    const bookingResponse = await PaymentModel.markConfirmedBooking(reference);

  } catch (error) {
    console.log(error);
  }
}


