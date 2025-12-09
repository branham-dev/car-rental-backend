import type { Context } from "hono";
import * as PaymentService from "@/transactions/payment.service.js"
import { generateResponse } from "@/utilities/functions.js";


export const initiatePayment = async (c: Context) => {
  console.log("Initiated payment in controller")
  try {
    const bookingId = c.req.param("id");
    // console.log("Controller:", bookingId);
    const paymentResponse = await PaymentService.initiatePayment(bookingId);
    return c.json(generateResponse(true, "Payment initialized", paymentResponse), 200);

  } catch (error: any) {
    console.error(error);
    return c.json(generateResponse(false, error.message || "Internal server error", null), 500);
  }
}


export const verifyWebhook = async (c: Context) => {
  console.log("On verify webhook");
  try {
    const rawBody = await c.req.raw.text();
    const signature = c.req.header("x-paystack-signature");
    const response = await PaymentService.verifyWebhook(rawBody, signature);

    return c.json(generateResponse(true, "Webhook verified", { success: true, areYouSure: "Yes" }), 200);
    
  } catch (error) {
    console.log("In controller webhook", error);
    return c.json(generateResponse(false, "Webhook landed in catch", { success: false, areYouSure: "No" }), 400);
  }
}