import { Hono } from "hono";
import * as PaymentController from "@/transactions/payment.controller.js";



const transactionRoute = new Hono();

transactionRoute.post("transaction/initiate/:id", PaymentController.initiatePayment);
transactionRoute.post("/transaction/webhook", PaymentController.verifyWebhook);

export default transactionRoute;