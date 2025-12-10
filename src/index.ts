import { serve } from '@hono/node-server'
import initializeConnection from '@/database/dbconfig.js';
import { Hono, type Context } from 'hono'
import authRoute from '@/authentication/auth.route.js'
import userRoute from '@/user/user.route.js'
import { cors } from 'hono/cors'
import { AppError } from './utilities/App.Error.js'
import { generateResponse } from './utilities/functions.js'
import specRoute from './specifications/spec.route.js'
import vehicleRoute from './vehicles/vehicle.route.js'
import bookingRoute from './bookings/booking.route.js'
import { serveStatic } from '@hono/node-server/serve-static'
import path from 'path'
import fs from 'fs';
import transactionRoute from './transactions/payment.route.js'
import dotenv from "dotenv";

dotenv.config();




const PORT = process.env.SOCKET ? parseInt(process.env.SOCKET) : 3000;

const app = new Hono()

app.use("*", cors({
  origin: "http://localhost:5173",
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

const uploadsDir = path.resolve('./uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.get('/uploads/*', serveStatic({
  root: uploadsDir,
  rewriteRequestPath: (path) => path.replace(/^\/uploads/, '') // remove /uploads
}));


app.get('/', (c: Context) => {
  return c.text('Hello Hono!')
})



app.onError((error, c) => {
  console.log(error);
  if (error instanceof AppError) {
    return c.json(generateResponse(false, error.message, null, error.code,), 401)
  }
  return c.json(generateResponse(false, "An error occurred", null), 500)
})

app.route('/auth', authRoute);
app.route('/api', userRoute);
app.route('/api', specRoute);
app.route('/api', vehicleRoute);
app.route('/api', bookingRoute);
app.route('/api', transactionRoute);


app.notFound((c: Context) => {
  return c.json({ success: false, message: "Route not found", path: c.req.path }, 404);
});


initializeConnection().then(() => {
  serve({
    fetch: app.fetch,
    port: PORT,
  }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })
}).catch((error) => {
  console.error(`Failed to initialize database connection`, error);
})