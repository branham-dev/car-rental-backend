import { serve } from '@hono/node-server'
import { error } from 'console'
import initializeConnection from 'database/dbconfig.js'
import { Hono, type Context } from 'hono'
import authRoute from '@/authentication/auth.route.js'





const app = new Hono()

app.get('/', (c: Context) => {
  return c.text('Hello Hono!')
})

app.notFound((c: Context) => {
  return c.json({ success: false, message: "Route not found", path: c.req.path }, 404);
});

app.route('/auth', authRoute)


initializeConnection().then(() => {
  serve({
    fetch: app.fetch,
    port: 3100
  }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })
}).catch((error) => {
  console.error(`Failed to initialize database connection`, error);
})



